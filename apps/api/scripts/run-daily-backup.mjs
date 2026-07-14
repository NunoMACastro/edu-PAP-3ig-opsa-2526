/**
 * @file Cria um backup PostgreSQL com manifesto verificavel para BK-MF7-01.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { chmod, mkdir, stat, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import {
    combineOperationAndCleanupError,
    createObjectBackupManifest,
    deleteStorageObjectsAndConfirmAbsent,
    removeLocalPathsAndConfirmAbsent,
} from "../src/modules/storage/backupBundle.js";
import {
    createBackupObjectStorage,
    createObjectStorage,
} from "../src/modules/storage/objectStorage.js";
import {
    assertPostgresToolsAvailable,
    createPostgresCommandRunner,
    postgresCliConnection,
} from "./postgres-cli.mjs";

const DEFAULT_BACKUP_DIR = "./private-storage/backups";
const DEFAULT_BACKUP_PREFIX = "backups";
const RESERVED_OPERATIONAL_PREFIXES = new Set([
    "exports",
    "health",
    "imports",
    "private",
    "quarantine",
    "restore-verification",
]);

/**
 * Resolve o modo sem permitir fallback remoto implícito.
 *
 * @param {string[]} args - Argumentos CLI.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente.
 * @returns {"local" | "remote"} Modo explícito ou default académico local.
 */
export function resolveBackupMode(args = [], env = process.env) {
    const hasLocal = args.includes("--local");
    const hasRemote = args.includes("--remote");
    if (hasLocal && hasRemote) {
        throw new Error("Escolhe apenas um modo de backup: --local ou --remote.");
    }
    const mode = hasRemote
        ? "remote"
        : hasLocal
          ? "local"
          : String(env.OPSA_BACKUP_MODE ?? "local").trim().toLowerCase();
    if (!new Set(["local", "remote"]).has(mode)) {
        throw new Error("OPSA_BACKUP_MODE deve ser local ou remote.");
    }
    return mode;
}

/**
 * Valida o prefixo exclusivamente reservado ao bundle de backup.
 *
 * @param {unknown} value - Prefixo recebido por configuração.
 * @returns {string} Prefixo normalizado e seguro.
 */
export function validateBackupPrefix(value) {
    const prefix = String(value ?? "").trim();
    const parts = prefix.split("/");
    if (
        !prefix ||
        prefix.length > 128 ||
        prefix.includes("\\") ||
        prefix.startsWith("/") ||
        prefix.endsWith("/") ||
        /[\u0000-\u001f\u007f]/.test(prefix) ||
        parts.some((part) => !part || part === "." || part === "..") ||
        RESERVED_OPERATIONAL_PREFIXES.has(parts[0])
    ) {
        throw new Error("BACKUP_S3_PREFIX é inválido ou sobrepõe um prefixo operacional.");
    }
    return prefix;
}

/**
 * Impede que origem e destino sejam o mesmo bucket ou diretórios locais
 * coincidentes/encaixados. Um bundle nunca pode incluir-se a si próprio.
 *
 * @param {object} sourceStorage - Storage operacional.
 * @param {object} backupStorage - Storage dedicado de backup.
 * @returns {void}
 */
function assertStorageIsolation(sourceStorage, backupStorage) {
    if (sourceStorage === backupStorage) {
        throw new Error("Storage operacional e storage de backup têm de ser distintos.");
    }
    if (
        sourceStorage?.bucket &&
        backupStorage?.bucket &&
        sourceStorage.bucket === backupStorage.bucket
    ) {
        throw new Error("O bucket de backup tem de ser distinto do bucket operacional.");
    }
    if (sourceStorage?.root && backupStorage?.root) {
        const overlaps = (parent, child) => {
            const childRelative = relative(parent, child);
            return (
                childRelative === "" ||
                (!isAbsolute(childRelative) &&
                    childRelative !== ".." &&
                    !childRelative.startsWith(`..${sep}`))
            );
        };
        if (
            overlaps(sourceStorage.root, backupStorage.root) ||
            overlaps(backupStorage.root, sourceStorage.root)
        ) {
            throw new Error(
                "As raízes locais operacional e de backup não podem sobrepor-se.",
            );
        }
    }
    if (
        backupStorage?.provider === "S3" &&
        !String(backupStorage.serverSideEncryption ?? "").trim()
    ) {
        throw new Error("O storage remoto de backup tem de exigir encriptação S3.");
    }
}

/**
 * Calcula o hash SHA-256 de um ficheiro sem o carregar todo para memoria.
 *
 * @param {string} filePath - Caminho do ficheiro de backup.
 * @returns {Promise<string>} Hash hexadecimal do ficheiro.
 */
async function sha256(filePath) {
    const hash = createHash("sha256");

    for await (const chunk of createReadStream(filePath)) {
        hash.update(chunk);
    }

    return hash.digest("hex");
}

/**
 * Confirma que uma ferramenta PostgreSQL terminou com sucesso.
 *
 * @param {ReturnType<typeof spawnSync>} result - Resultado devolvido pelo Node.
 * @param {string} commandName - Nome do comando executado.
 * @returns {void}
 * @throws {Error} Quando a ferramenta nao existe ou termina com erro.
 */
function assertCommandSucceeded(result, commandName) {
    if (result.error) {
        throw new Error(
            `${commandName} nao arrancou. Confirma se a ferramenta PostgreSQL esta instalada.`,
        );
    }

    if (result.status !== 0) {
        throw new Error(
            `${commandName} terminou com erro. Confirma DATABASE_URL, permissoes e ligacao a base de dados.`,
        );
    }
}

/**
 * Cria um dump PostgreSQL custom sem colocar a password ou a URL no argv.
 *
 * @param {object} input - Origem, destino e executor.
 * @param {string} input.databaseUrl - Ligação recebida por ambiente.
 * @param {string} input.backupPath - Destino privado do dump.
 * @param {typeof spawnSync} input.runCommand - Executor PostgreSQL.
 * @param {boolean} [input.preflight] - Se deve validar o executável nesta chamada.
 * @returns {{ databaseName: string }} Identificação pública da origem.
 */
function createPostgresDump({ databaseUrl, backupPath, runCommand, preflight = true }) {
    const connection = postgresCliConnection(databaseUrl);
    if (preflight) assertPostgresToolsAvailable(["pg_dump"], runCommand);
    const result = runCommand(
        "pg_dump",
        [
            "--format=custom",
            "--no-owner",
            "--no-privileges",
            "--file",
            backupPath,
            ...connection.args,
        ],
        {
            encoding: "utf8",
            stdio: "pipe",
            env: connection.env,
        },
    );
    assertCommandSucceeded(result, "pg_dump");
    return { databaseName: connection.databaseName };
}

/**
 * Cria o artefacto principal da demo num diretório privado e previsível.
 * O dump, manifesto e checksum persistem após sucesso para permitirem a prova
 * manual de restore; em falha, qualquer artefacto parcial é removido.
 *
 * @param {object} options - Configuração local e dependências de teste.
 * @returns {Promise<object>} Manifesto público seguro com caminhos locais.
 */
async function runLocalBackup({
    env = process.env,
    backupDir = env.OPSA_BACKUP_DIR ?? DEFAULT_BACKUP_DIR,
    databaseUrl = env.DATABASE_URL,
    now = new Date(),
    runCommand = spawnSync,
} = {}) {
    if (!databaseUrl) {
        throw new Error("DATABASE_URL em falta para executar backup");
    }

    const postgresRunner = createPostgresCommandRunner({
        env,
        runCommand,
        backupMode: "local",
    });
    const connection = postgresCliConnection(databaseUrl);
    assertPostgresToolsAvailable(["pg_dump"], postgresRunner);
    await mkdir(backupDir, { recursive: true, mode: 0o700 });
    await chmod(backupDir, 0o700);

    const stamp = now.toISOString().replaceAll(":", "-");
    const backupPath = join(backupDir, `opsa-${stamp}.dump`);
    const manifestPath = `${backupPath}.json`;
    const manifestChecksumPath = `${manifestPath}.sha256`;
    let operationError;
    try {
        createPostgresDump({
            databaseUrl,
            backupPath,
            runCommand: postgresRunner,
            preflight: false,
        });
        const backupInfo = await stat(backupPath);
        if (backupInfo.size === 0) {
            throw new Error("Backup falhou: ficheiro gerado sem conteudo");
        }
        await chmod(backupPath, 0o600);
        const databaseSha256 = await sha256(backupPath);
        const manifest = {
            version: 1,
            mode: "local",
            file: basename(backupPath),
            sizeBytes: backupInfo.size,
            createdAt: now.toISOString(),
            engine: "postgresql-pg_dump-custom",
            sha256: databaseSha256,
            database: connection.databaseName,
            restoreVerificationRequired: true,
        };
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2), {
            mode: 0o600,
            flag: "wx",
        });
        await chmod(manifestPath, 0o600);
        const manifestSha256 = await sha256(manifestPath);
        await writeFile(manifestChecksumPath, `${manifestSha256}\n`, {
            mode: 0o600,
            flag: "wx",
        });
        await chmod(manifestChecksumPath, 0o600);
        return {
            ...manifest,
            backupPath,
            manifestPath,
            manifestChecksumPath,
            manifestSha256,
        };
    } catch (error) {
        operationError = error;
        throw error;
    } finally {
        if (operationError) {
            try {
                await removeLocalPathsAndConfirmAbsent(
                    [backupPath, manifestPath, manifestChecksumPath],
                    "O cleanup do backup local parcial não pôde ser confirmado.",
                );
            } catch (cleanupError) {
                throw combineOperationAndCleanupError(
                    operationError,
                    cleanupError,
                    "O backup local falhou e persistem artefactos parciais.",
                );
            }
        }
    }
}

/**
 * Aplica retenção apenas depois de um bundle novo estar totalmente persistido.
 *
 * @param {{ backupStorage: object, retentionDays: number, now: Date, backupRootPrefix: string, protectedPrefix: string }} input - Política e bundle que nunca pode ser removido.
 * @returns {Promise<number>} Número de objetos antigos removidos.
 */
export async function pruneExpiredBackupObjects({
    backupStorage,
    retentionDays,
    now,
    backupRootPrefix,
    protectedPrefix,
}) {
    if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) {
        throw new Error("BACKUP_RETENTION_DAYS deve estar entre 1 e 3650.");
    }
    const cutoff = now.getTime() - retentionDays * 24 * 60 * 60 * 1000;
    const objects = await backupStorage.listObjects(backupRootPrefix);
    const bundles = new Map();
    for (const object of objects) {
        const rootPrefix = `${backupRootPrefix}/`;
        if (!object?.key?.startsWith(rootPrefix)) continue;
        const bundleSegment = object.key.slice(rootPrefix.length).split("/")[0];
        if (!bundleSegment) continue;
        const bundlePrefix = `${backupRootPrefix}/${bundleSegment}`;
        if (bundlePrefix === protectedPrefix) continue;
        const entries = bundles.get(bundlePrefix) ?? [];
        entries.push(object);
        bundles.set(bundlePrefix, entries);
    }

    let prunedObjects = 0;
    for (const [bundlePrefix, entries] of [...bundles.entries()].sort(([left], [right]) =>
        left.localeCompare(right))) {
        const expired = entries.every(
            ({ lastModified }) =>
                lastModified instanceof Date && lastModified.getTime() < cutoff,
        );
        if (!expired) continue;

        // O manifesto é o inventário recuperável do bundle e só desaparece
        // depois de todos os objetos de dados terem ausência confirmada.
        const manifestKey = `${bundlePrefix}/manifest.json`;
        const dataKeys = entries
            .map(({ key }) => key)
            .filter((key) => key !== manifestKey);
        const manifestKeys = entries.some(({ key }) => key === manifestKey)
            ? [manifestKey]
            : [];
        await deleteStorageObjectsAndConfirmAbsent(
            backupStorage,
            dataKeys,
            "A retenção não confirmou a remoção dos dados de um bundle antigo.",
        );
        await deleteStorageObjectsAndConfirmAbsent(
            backupStorage,
            manifestKeys,
            "A retenção não confirmou a remoção do manifesto antigo.",
        );
        prunedObjects += entries.length;
    }
    return prunedObjects;
}

/**
 * Executa pg_dump em formato custom e grava um manifesto seguro.
 *
 * @param {object} options - Configuracao opcional para execucao local ou testes.
 * @param {string} [options.backupDir] - Pasta onde o dump e o manifesto sao gravados.
 * @param {string} [options.databaseUrl] - URL PostgreSQL lido do ambiente.
 * @param {Date} [options.now] - Data usada para gerar o nome do ficheiro.
 * @param {object} [options.sourceStorage] - Storage primário injetável para testes.
 * @param {object} [options.backupStorage] - Storage dedicado injetável para testes.
 * @param {number} [options.retentionDays] - Retenção explícita.
 * @param {string} [options.backupPrefix] - Prefixo dedicado do bundle.
 * @param {typeof spawnSync} [options.runCommand] - Executor injetável para testes sem PostgreSQL.
 * @returns {Promise<object>} Manifesto do backup criado.
 * @throws {Error} Quando falta configuracao, pg_dump falha ou o ficheiro fica vazio.
 */
async function runRemoteBackup({
    env = process.env,
    backupDir = env.OPSA_BACKUP_DIR ?? DEFAULT_BACKUP_DIR,
    databaseUrl = env.DATABASE_URL,
    now = new Date(),
    sourceStorage: sourceStorageOption,
    backupStorage: backupStorageOption,
    retentionDays = Number.parseInt(env.BACKUP_RETENTION_DAYS ?? "", 10),
    backupPrefix = env.BACKUP_S3_PREFIX ?? DEFAULT_BACKUP_PREFIX,
    runCommand = spawnSync,
} = {}) {
    if (!databaseUrl) {
        throw new Error("DATABASE_URL em falta para executar backup");
    }
    if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) {
        throw new Error("BACKUP_RETENTION_DAYS deve estar entre 1 e 3650.");
    }
    const postgresRunner = createPostgresCommandRunner({
        env,
        runCommand,
        backupMode: "remote",
    });
    postgresCliConnection(databaseUrl);
    assertPostgresToolsAvailable(["pg_dump"], postgresRunner);
    const sourceStorage = sourceStorageOption ?? createObjectStorage(env);
    const backupStorage =
        backupStorageOption ?? createBackupObjectStorage(env);
    const normalizedBackupPrefix = validateBackupPrefix(backupPrefix);
    assertStorageIsolation(sourceStorage, backupStorage);

    await mkdir(backupDir, { recursive: true, mode: 0o700 });
    await chmod(backupDir, 0o700);

    await Promise.all([sourceStorage.checkHealth(), backupStorage.checkHealth()]);

    const stamp = now.toISOString().replaceAll(":", "-");
    const backupPath = join(backupDir, `opsa-${stamp}.dump`);
    const manifestPath = `${backupPath}.json`;
    const bundlePrefix = `${normalizedBackupPrefix}/${stamp}`;
    const uploadedKeys = [];
    let operationError;
    try {
        const connection = createPostgresDump({
            databaseUrl,
            backupPath,
            runCommand: postgresRunner,
            preflight: false,
        });

        const backupInfo = await stat(backupPath);
        if (backupInfo.size === 0) {
            throw new Error("Backup falhou: ficheiro gerado sem conteudo");
        }
        await chmod(backupPath, 0o600);

        const databaseSha256 = await sha256(backupPath);
        let persistedBundle;
        try {
            const objects = await createObjectBackupManifest({
                sourceStorage,
                backupStorage,
                bundlePrefix,
                temporaryRoot: backupDir,
            });
            uploadedKeys.push(...objects.map(({ backupKey }) => backupKey));
            const databaseBackupKey = `${bundlePrefix}/database.dump`;
            uploadedKeys.push(databaseBackupKey);
            await backupStorage.putFile({
                key: databaseBackupKey,
                filePath: backupPath,
                contentType: "application/octet-stream",
                metadata: {
                    sha256: databaseSha256,
                    engine: "postgresql-pg-dump-custom",
                },
            });

            const manifest = {
                version: 1,
                mode: "remote",
                file: basename(backupPath),
                sizeBytes: backupInfo.size,
                createdAt: now.toISOString(),
                engine: "postgresql-pg_dump-custom",
                sha256: databaseSha256,
                database: connection.databaseName,
                databaseBackupKey,
                bundlePrefix,
                includes: ["postgresql", "s3-objects"],
                objects,
                objectCount: objects.length,
                objectBytes: objects.reduce(
                    (total, object) => total + object.sizeBytes,
                    0,
                ),
                encryption:
                    backupStorage.provider === "S3"
                        ? "S3_SERVER_SIDE"
                        : "INJECTED_TEST_ADAPTER",
                retentionDays,
                restoreVerificationRequired: true,
            };

            // O manifesto nunca inclui DATABASE_URL, caminhos absolutos nem conteúdo financeiro.
            await writeFile(manifestPath, JSON.stringify(manifest, null, 2), {
                mode: 0o600,
            });
            await chmod(manifestPath, 0o600);
            const manifestSha256 = await sha256(manifestPath);
            const manifestBackupKey = `${bundlePrefix}/manifest.json`;
            uploadedKeys.push(manifestBackupKey);
            await backupStorage.putFile({
                key: manifestBackupKey,
                filePath: manifestPath,
                contentType: "application/json",
                metadata: { sha256: manifestSha256 },
            });

            persistedBundle = {
                ...manifest,
                manifestBackupKey,
                manifestSha256,
            };
        } catch (error) {
            try {
                await deleteStorageObjectsAndConfirmAbsent(
                    backupStorage,
                    uploadedKeys,
                    "Backup falhou e o cleanup remoto não pôde ser confirmado.",
                );
            } catch (cleanupError) {
                throw combineOperationAndCleanupError(
                    error,
                    cleanupError,
                    "Backup falhou e o cleanup remoto não pôde ser confirmado.",
                );
            }
            throw error;
        }
        // A retenção é deliberadamente posterior ao commit lógico do bundle.
        // Se falhar, a execução sinaliza o problema mas nunca apaga o backup novo.
        const prunedObjects = await pruneExpiredBackupObjects({
            backupStorage,
            retentionDays,
            now,
            backupRootPrefix: normalizedBackupPrefix,
            protectedPrefix: bundlePrefix,
        });
        return { ...persistedBundle, prunedObjects };
    } catch (error) {
        operationError = error;
        throw error;
    } finally {
        // O dump e o manifesto são plaintext transitório: nunca sobrevivem à
        // execução, mesmo quando pg_dump ou um upload falham.
        try {
            await removeLocalPathsAndConfirmAbsent(
                [backupPath, manifestPath],
                "O cleanup do dump/manifesto plaintext não pôde ser confirmado.",
            );
        } catch (cleanupError) {
            throw combineOperationAndCleanupError(
                operationError,
                cleanupError,
                "O backup falhou e persistem dados plaintext locais.",
            );
        }
    }
}

/**
 * Executa o contrato de backup selecionado. Local é o default da PAP; remoto
 * só é ativado explicitamente e nunca faz fallback para local.
 *
 * @param {object} options - Opções comuns e específicas do modo.
 * @param {"local" | "remote"} [options.mode] - Modo pretendido.
 * @returns {Promise<object>} Evidência segura do backup criado.
 */
export async function runDailyBackup(options = {}) {
    const mode = options.mode ?? resolveBackupMode([], options.env ?? process.env);
    if (mode === "local") return runLocalBackup(options);
    if (mode === "remote") return runRemoteBackup(options);
    throw new Error("Modo de backup inválido: usa local ou remote.");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    loadLocalEnvFile();

    runDailyBackup({ mode: resolveBackupMode(process.argv.slice(2), process.env) })
        .then((manifest) => console.log(JSON.stringify(manifest, null, 2)))
        .catch((error) => {
            console.error(error.message);
            process.exitCode = 1;
        });
}
