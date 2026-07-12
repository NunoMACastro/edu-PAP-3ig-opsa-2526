/**
 * @file Verifica se um backup PostgreSQL pode ser lido por pg_restore.
 */

import { spawnSync } from "node:child_process";
import { chmod, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import {
    combineOperationAndCleanupError,
    copyStorageObjectWithHash,
    removeLocalPathsAndConfirmAbsent,
    verifyObjectBackupRestore,
} from "../src/modules/storage/backupBundle.js";
import {
    LocalObjectStorage,
    createBackupObjectStorage,
} from "../src/modules/storage/objectStorage.js";
import {
    assertDisposableRestoreDatabase,
    postgresCliConnection,
} from "./postgres-cli.mjs";

/**
 * Resolve o descritor autenticado do manifesto remoto. O restauro nunca parte
 * de um dump plaintext deixado no filesystem depois do backup.
 *
 * @param {string[]} args - Argumentos recebidos pela linha de comandos.
 * @param {NodeJS.ProcessEnv} env - Variaveis de ambiente disponiveis.
 * @param {{ manifestBackupKey?: string, manifestSha256?: string } | undefined} bundle - Resultado in-memory de runDailyBackup.
 * @returns {{ manifestBackupKey: string, manifestSha256: string }} Descritor remoto validado.
 * @throws {Error} Quando a chave ou o hash não foram indicados.
 */
export function resolveRemoteBackupBundle(
    args = process.argv.slice(2),
    env = process.env,
    bundle,
) {
    const keyFlagIndex = args.indexOf("--manifest-key");
    const hashFlagIndex = args.indexOf("--manifest-sha256");
    const manifestBackupKey = String(
        bundle?.manifestBackupKey ??
            (keyFlagIndex >= 0 ? args[keyFlagIndex + 1] : env.OPSA_BACKUP_MANIFEST_KEY) ??
            "",
    ).trim();
    const manifestSha256 = String(
        bundle?.manifestSha256 ??
            (hashFlagIndex >= 0
                ? args[hashFlagIndex + 1]
                : env.OPSA_BACKUP_MANIFEST_SHA256) ??
            "",
    ).trim().toLowerCase();
    if (
        !manifestBackupKey ||
        manifestBackupKey.startsWith("/") ||
        manifestBackupKey.includes("\\") ||
        manifestBackupKey.split("/").some((part) => !part || part === "." || part === "..") ||
        !manifestBackupKey.endsWith("/manifest.json")
    ) {
        throw new Error(
            "Indica uma chave remota segura com --manifest-key ou OPSA_BACKUP_MANIFEST_KEY.",
        );
    }
    if (!/^[a-f0-9]{64}$/.test(manifestSha256)) {
        throw new Error(
            "Indica o SHA-256 do manifesto com --manifest-sha256 ou OPSA_BACKUP_MANIFEST_SHA256.",
        );
    }
    return { manifestBackupKey, manifestSha256 };
}

/**
 * Lê e valida a forma mínima de um manifesto de bundle.
 *
 * @param {string} manifestPath - Caminho privado.
 * @returns {Promise<object>} Manifesto validado.
 */
async function readBackupManifest(manifestPath) {
    let manifest;
    try {
        manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch {
        throw new Error("Manifesto de backup ausente ou inválido");
    }
    if (
        !manifest?.bundlePrefix ||
        !manifest?.databaseBackupKey ||
        !/^[a-f0-9]{64}$/.test(manifest?.sha256 ?? "") ||
        typeof manifest?.file !== "string" ||
        !/^opsa-[A-Za-z0-9_.-]+\.dump$/.test(manifest.file) ||
        !Number.isSafeInteger(manifest?.sizeBytes) ||
        manifest.sizeBytes < 1 ||
        !Array.isArray(manifest?.objects)
    ) {
        throw new Error("Manifesto de backup incompleto");
    }
    return manifest;
}

/**
 * Restaura efetivamente o dump numa base descartável e confirma migrations legíveis.
 *
 * @param {string} backupPath - Dump custom produzido por `pg_dump`.
 * @param {string} restoreDatabaseUrl - Ligação exclusiva à base descartável.
 * @param {string | undefined} sourceDatabaseUrl - Ligação de origem, usada apenas para bloquear igualdade acidental.
 * @returns {{ databaseName: string, migrationCount: number }} Prova mínima do restauro real.
 */
function restoreIntoDisposableDatabase(
    backupPath,
    restoreDatabaseUrl,
    sourceDatabaseUrl,
) {
    const restoreConnection = postgresCliConnection(restoreDatabaseUrl);
    assertDisposableRestoreDatabase(restoreConnection.databaseName);

    if (sourceDatabaseUrl) {
        const sourceConnection = postgresCliConnection(sourceDatabaseUrl);
        if (
            sourceConnection.host === restoreConnection.host &&
            sourceConnection.databaseName === restoreConnection.databaseName
        ) {
            throw new Error("RESTORE_DATABASE_URL não pode apontar para a base de origem");
        }
    }

    const restore = spawnSync(
        "pg_restore",
        [
            "--clean",
            "--if-exists",
            "--no-owner",
            "--no-privileges",
            "--exit-on-error",
            ...restoreConnection.args,
            backupPath,
        ],
        { encoding: "utf8", stdio: "pipe", env: restoreConnection.env },
    );
    if (restore.error) {
        throw new Error("pg_restore não arrancou. Instala as ferramentas PostgreSQL.");
    }
    if (restore.status !== 0) {
        throw new Error("O restauro real terminou com erro na base descartável");
    }

    const smoke = spawnSync(
        "psql",
        [
            ...restoreConnection.args,
            "--tuples-only",
            "--no-align",
            "--command",
            'SELECT COUNT(*) FROM "_prisma_migrations";',
        ],
        { encoding: "utf8", stdio: "pipe", env: restoreConnection.env },
    );
    if (smoke.error || smoke.status !== 0) {
        throw new Error("Restauro criado, mas o smoke PostgreSQL não confirmou migrations");
    }

    const migrationCount = Number(smoke.stdout.trim());
    if (!Number.isInteger(migrationCount) || migrationCount < 1) {
        throw new Error("Restauro sem histórico de migrations reconhecível");
    }

    return { databaseName: restoreConnection.databaseName, migrationCount };
}

/**
 * Obtém apenas contagens agregadas de entidades críticas, sem exfiltrar dados.
 *
 * @param {ReturnType<typeof postgresCliConnection>} connection - Ligação segura.
 * @returns {Record<string, number>} Contagens por entidade.
 */
function runPsqlQuery(connection, sql, failureMessage) {
    const result = spawnSync(
        "psql",
        [
            ...connection.args,
            "--tuples-only",
            "--no-align",
            "--command",
            sql,
        ],
        { encoding: "utf8", stdio: "pipe", env: connection.env },
    );
    if (result.error || result.status !== 0) {
        throw new Error(failureMessage);
    }
    return result.stdout.trim();
}

/**
 * Lista todas as tabelas aplicacionais presentes no schema público.
 *
 * @param {ReturnType<typeof postgresCliConnection>} connection - Ligação segura.
 * @returns {string[]} Tabelas ordenadas.
 */
function readApplicationTableNames(connection) {
    const output = runPsqlQuery(
        connection,
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;",
        "Não foi possível inventariar as tabelas do restauro.",
    );
    const names = output.split("\n").map((name) => name.trim()).filter(Boolean);
    if (names.length === 0 || names.some((name) => /[\u0000-\u001f\u007f]/.test(name))) {
        throw new Error("Inventário de tabelas vazio ou inválido.");
    }
    return names;
}

/**
 * Obtém contagens de todas as tabelas indicadas sem ler colunas de negócio.
 * Identificadores e literais são citados defensivamente apesar de provirem do
 * catálogo PostgreSQL.
 *
 * @param {ReturnType<typeof postgresCliConnection>} connection - Ligação segura.
 * @param {string[]} tableNames - Inventário canónico.
 * @returns {Record<string, string>} Contagens por tabela como inteiros decimais.
 */
function readApplicationEntityCounts(connection, tableNames) {
    const quoteIdentifier = (value) => `"${value.replaceAll('"', '""')}"`;
    const quoteLiteral = (value) => `'${value.replaceAll("'", "''")}'`;
    const unions = tableNames.map(
        (tableName) =>
            `SELECT ${quoteLiteral(tableName)} AS "entity", COUNT(*)::text AS "rowCount" FROM ${quoteIdentifier(tableName)}`,
    );
    const sql = `SELECT COALESCE(json_object_agg("entity", "rowCount" ORDER BY "entity"), '{}'::json)::text FROM (${unions.join(" UNION ALL ")}) AS counts;`;
    const output = runPsqlQuery(
        connection,
        sql,
        "Não foi possível comparar todas as entidades do restauro.",
    );
    try {
        const counts = JSON.parse(output);
        if (
            !counts ||
            typeof counts !== "object" ||
            Array.isArray(counts) ||
            tableNames.some((tableName) => !/^\d+$/.test(counts[tableName] ?? ""))
        ) {
            throw new Error("invalid counts");
        }
        return counts;
    } catch {
        throw new Error("Contagens integrais do restauro não são JSON válido.");
    }
}

/**
 * Confirma igualdade exata das contagens na origem e no restauro descartável.
 *
 * @param {string} sourceDatabaseUrl - Base que originou o backup.
 * @param {string} restoreDatabaseUrl - Base descartável restaurada.
 * @returns {string[]} Tabelas comparadas.
 */
function compareAllEntityCounts(sourceDatabaseUrl, restoreDatabaseUrl) {
    if (!sourceDatabaseUrl) {
        throw new Error("DATABASE_URL é obrigatória para comparar o restauro");
    }
    const sourceConnection = postgresCliConnection(sourceDatabaseUrl);
    const restoreConnection = postgresCliConnection(restoreDatabaseUrl);
    const sourceTables = readApplicationTableNames(sourceConnection);
    const restoredTables = readApplicationTableNames(restoreConnection);
    if (JSON.stringify(sourceTables) !== JSON.stringify(restoredTables)) {
        throw new Error("O inventário de tabelas do restauro diverge da origem.");
    }
    const source = readApplicationEntityCounts(sourceConnection, sourceTables);
    const restored = readApplicationEntityCounts(restoreConnection, sourceTables);
    if (sourceTables.some((tableName) => source[tableName] !== restored[tableName])) {
        throw new Error("As contagens integrais do restauro divergem da origem.");
    }
    return sourceTables;
}

/**
 * Verifica um backup ja criado e devolve evidence segura.
 *
 * @param {object} options - Configuracao opcional para execucao local ou teste.
 * @param {string[]} [options.args] - Argumentos da linha de comandos.
 * @param {NodeJS.ProcessEnv} [options.env] - Variaveis de ambiente.
 * @param {object} [options.backupStorage] - Storage de backup injetável.
 * @param {{ manifestBackupKey: string, manifestSha256: string }} [options.bundle] - Descritor autenticado devolvido pelo backup.
 * @returns {Promise<object>} Evidence de leitura do backup.
 * @throws {Error} Quando falta ficheiro, o ficheiro esta vazio ou pg_restore falha.
 */
export async function verifyBackupRestore({
    args = process.argv.slice(2),
    env = process.env,
    backupStorage: backupStorageOption,
    bundle,
} = {}) {
    const remoteBundle = resolveRemoteBackupBundle(args, env, bundle);
    if (!env.RESTORE_DATABASE_URL) {
        throw new Error(
            "RESTORE_DATABASE_URL em falta: listar o catálogo não prova restauro",
        );
    }
    const backupStorage =
        backupStorageOption ?? createBackupObjectStorage(env);
    await backupStorage.checkHealth();
    const temporaryDirectory = await mkdtemp(
        join(tmpdir(), "opsa-restore-verification-"),
    );
    const localRestoreStorage = new LocalObjectStorage(temporaryDirectory);
    let operationError;
    try {
        await chmod(temporaryDirectory, 0o700);
        const manifestCopy = await copyStorageObjectWithHash({
            sourceStorage: backupStorage,
            destinationStorage: localRestoreStorage,
            sourceKey: remoteBundle.manifestBackupKey,
            destinationKey: "remote-manifest.json",
            expectedSha256: remoteBundle.manifestSha256,
            temporaryRoot: temporaryDirectory,
        });
        const remoteManifest = await readBackupManifest(
            localRestoreStorage.resolve(manifestCopy.backupKey).filePath,
        );
        if (
            remoteBundle.manifestBackupKey !== `${remoteManifest.bundlePrefix}/manifest.json` ||
            remoteManifest.databaseBackupKey !== `${remoteManifest.bundlePrefix}/database.dump`
        ) {
            throw new Error("O manifesto remoto referencia um bundle incoerente.");
        }
        const databaseCopy = await copyStorageObjectWithHash({
            sourceStorage: backupStorage,
            destinationStorage: localRestoreStorage,
            sourceKey: remoteManifest.databaseBackupKey,
            destinationKey: "database.dump",
            expectedSha256: remoteManifest.sha256,
            temporaryRoot: temporaryDirectory,
        });
        const remoteDumpPath = localRestoreStorage.resolve(
            databaseCopy.backupKey,
        ).filePath;
        const restored = restoreIntoDisposableDatabase(
            remoteDumpPath,
            env.RESTORE_DATABASE_URL,
            env.DATABASE_URL,
        );
        const comparedEntities = compareAllEntityCounts(
            env.DATABASE_URL,
            env.RESTORE_DATABASE_URL,
        );
        const objectRestore = await verifyObjectBackupRestore({
            backupStorage,
            objects: remoteManifest.objects,
            temporaryRoot: temporaryDirectory,
        });

        // A evidence usa apenas basename e contagens, nunca dados ou credenciais.
        return {
            file: remoteManifest.file,
            sizeBytes: remoteManifest.sizeBytes,
            checkedAt: new Date().toISOString(),
            restorable: true,
            restoredDatabase: restored.databaseName,
            migrationCount: restored.migrationCount,
            comparedEntities,
            restoredObjects: objectRestore.objectCount,
            restoredObjectBytes: objectRestore.totalBytes,
            check: "manifesto remoto autenticado + download S3 + SHA-256 + pg_restore real + todas as tabelas + objetos",
        };
    } catch (error) {
        operationError = error;
        throw error;
    } finally {
        try {
            await removeLocalPathsAndConfirmAbsent(
                [temporaryDirectory],
                "O cleanup do restauro local não pôde ser confirmado.",
            );
        } catch (cleanupError) {
            throw combineOperationAndCleanupError(
                operationError,
                cleanupError,
                "O restauro falhou e persistem dados locais temporários.",
            );
        }
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    loadLocalEnvFile();
    verifyBackupRestore()
        .then((result) => console.log(JSON.stringify(result, null, 2)))
        .catch((error) => {
            console.error(error.message);
            process.exitCode = 1;
        });
}
