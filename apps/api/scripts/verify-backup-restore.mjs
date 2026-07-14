/**
 * @file Verifica integridade e restaura backups OPSA apenas em bases descartáveis.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { chmod, lstat, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
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
    assertPostgresToolsAvailable,
    createPostgresCommandRunner,
    postgresCliConnection,
} from "./postgres-cli.mjs";
import { resolveBackupMode } from "./run-daily-backup.mjs";

/**
 * Calcula SHA-256 por streaming.
 *
 * @param {string} filePath - Ficheiro local privado.
 * @returns {Promise<string>} Hash hexadecimal.
 */
async function sha256(filePath) {
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(filePath)) hash.update(chunk);
    return hash.digest("hex");
}

/**
 * Obtém o valor imediatamente posterior a uma flag.
 *
 * @param {string[]} args - Argumentos CLI.
 * @param {string} flag - Flag pesquisada.
 * @returns {string | undefined} Valor, quando presente.
 */
function flagValue(args, flag) {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
}

/**
 * Resolve o manifesto local. `--file` e OPSA_BACKUP_FILE continuam suportados
 * como aliases compatíveis e derivam o manifesto `<dump>.json`.
 *
 * @param {string[]} args - Argumentos CLI.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente.
 * @param {object | undefined} bundle - Resultado in-memory do backup.
 * @returns {{ manifestPath: string, manifestSha256?: string }} Descritor local.
 */
export function resolveLocalBackupBundle(args = [], env = process.env, bundle) {
    const dumpPath = String(
        flagValue(args, "--file") ?? env.OPSA_BACKUP_FILE ?? "",
    ).trim();
    const manifestPath = String(
        bundle?.manifestPath ??
            flagValue(args, "--manifest") ??
            env.OPSA_BACKUP_MANIFEST ??
            (dumpPath ? `${dumpPath}.json` : ""),
    ).trim();
    const manifestSha256 = String(
        bundle?.manifestSha256 ??
            flagValue(args, "--manifest-sha256") ??
            env.OPSA_BACKUP_MANIFEST_SHA256 ??
            "",
    ).trim().toLowerCase();
    if (!manifestPath) {
        throw new Error(
            "Indica o backup local com --manifest <ficheiro>, --file <dump> ou OPSA_BACKUP_MANIFEST.",
        );
    }
    if (manifestSha256 && !/^[a-f0-9]{64}$/.test(manifestSha256)) {
        throw new Error("O SHA-256 explícito do manifesto local é inválido.");
    }
    return { manifestPath: resolve(manifestPath), manifestSha256: manifestSha256 || undefined };
}

/**
 * Resolve o descritor autenticado do manifesto remoto.
 *
 * @param {string[]} args - Argumentos CLI.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente.
 * @param {object | undefined} bundle - Resultado in-memory do backup remoto.
 * @returns {{ manifestBackupKey: string, manifestSha256: string }} Descritor remoto.
 */
export function resolveRemoteBackupBundle(args = [], env = process.env, bundle) {
    const manifestBackupKey = String(
        bundle?.manifestBackupKey ??
            flagValue(args, "--manifest-key") ??
            env.OPSA_BACKUP_MANIFEST_KEY ??
            "",
    ).trim();
    const manifestSha256 = String(
        bundle?.manifestSha256 ??
            flagValue(args, "--manifest-sha256") ??
            env.OPSA_BACKUP_MANIFEST_SHA256 ??
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
 * Lê e valida o contrato base do manifesto depois de o hash ser confirmado.
 *
 * @param {string} manifestPath - Caminho privado.
 * @param {"local" | "remote"} expectedMode - Contrato esperado.
 * @returns {Promise<object>} Manifesto validado.
 */
async function readBackupManifest(manifestPath, expectedMode) {
    let manifest;
    try {
        manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch {
        throw new Error("Manifesto de backup ausente ou inválido");
    }
    const effectiveVersion =
        manifest?.version ?? (expectedMode === "remote" ? 1 : undefined);
    const effectiveMode =
        manifest?.mode ??
        (expectedMode === "remote" && manifest?.bundlePrefix ? "remote" : undefined);
    if (
        effectiveVersion !== 1 ||
        effectiveMode !== expectedMode ||
        !/^[a-f0-9]{64}$/.test(manifest?.sha256 ?? "") ||
        typeof manifest?.file !== "string" ||
        !/^opsa-[A-Za-z0-9_.-]+\.dump$/.test(manifest.file) ||
        !Number.isSafeInteger(manifest?.sizeBytes) ||
        manifest.sizeBytes < 1 ||
        manifest?.engine !== "postgresql-pg_dump-custom"
    ) {
        throw new Error("Manifesto de backup incompleto");
    }
    if (
        expectedMode === "remote" &&
        (!manifest.bundlePrefix ||
            !manifest.databaseBackupKey ||
            !Array.isArray(manifest.objects))
    ) {
        throw new Error("Manifesto remoto de backup incompleto");
    }
    return { ...manifest, version: effectiveVersion, mode: effectiveMode };
}

/**
 * Rejeita symlinks e exige um ficheiro regular para evitar trocas de alvo.
 *
 * @param {string} filePath - Caminho a validar.
 * @param {string} label - Nome público do artefacto.
 * @returns {Promise<import("node:fs").Stats>} Metadados do ficheiro.
 */
async function assertPrivateRegularFile(filePath, label) {
    let info;
    try {
        info = await lstat(filePath);
    } catch {
        throw new Error(`${label} não encontrado.`);
    }
    if (info.isSymbolicLink() || !info.isFile()) {
        throw new Error(`${label} tem de ser um ficheiro regular, não um symlink.`);
    }
    return info;
}

/**
 * Valida previamente o destino e bloqueia igualdade com a origem.
 *
 * @param {string} restoreDatabaseUrl - Base descartável.
 * @param {string | undefined} sourceDatabaseUrl - Base de origem.
 * @returns {{ args: string[], env: NodeJS.ProcessEnv, databaseName: string, host: string }} Ligação validada.
 */
function validateRestoreTarget(restoreDatabaseUrl, sourceDatabaseUrl) {
    if (!restoreDatabaseUrl) {
        throw new Error("RESTORE_DATABASE_URL em falta: o catálogo não prova restauro");
    }
    const restoreConnection = postgresCliConnection(restoreDatabaseUrl);
    assertDisposableRestoreDatabase(restoreConnection.databaseName);
    if (sourceDatabaseUrl) {
        const sourceConnection = postgresCliConnection(sourceDatabaseUrl);
        if (sourceConnection.databaseName === restoreConnection.databaseName) {
            throw new Error("RESTORE_DATABASE_URL não pode apontar para a base de origem");
        }
    }
    return restoreConnection;
}

/**
 * Restaura o dump e confirma migrations legíveis.
 *
 * @param {string} backupPath - Dump custom produzido por pg_dump.
 * @param {string} restoreDatabaseUrl - Ligação descartável validada.
 * @param {string | undefined} sourceDatabaseUrl - Origem, usada no bloqueio de igualdade.
 * @param {typeof spawnSync} runCommand - Executor real ou double unitário explícito.
 * @returns {{ databaseName: string, migrationCount: number }} Prova mínima.
 */
function restoreIntoDisposableDatabase(
    backupPath,
    restoreDatabaseUrl,
    sourceDatabaseUrl,
    runCommand,
) {
    const restoreConnection = validateRestoreTarget(restoreDatabaseUrl, sourceDatabaseUrl);
    const restore = runCommand(
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
    if (restore.error || restore.status !== 0) {
        throw new Error("O restauro real terminou com erro na base descartável");
    }
    const smoke = runCommand(
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
 * Executa uma query agregada sem incluir a URL no argv.
 *
 * @param {ReturnType<typeof postgresCliConnection>} connection - Ligação segura.
 * @param {string} sql - Query técnica sem dados de negócio.
 * @param {string} failureMessage - Mensagem pública.
 * @param {typeof spawnSync} runCommand - Executor.
 * @returns {string} stdout normalizado.
 */
function runPsqlQuery(connection, sql, failureMessage, runCommand) {
    const result = runCommand(
        "psql",
        [...connection.args, "--tuples-only", "--no-align", "--command", sql],
        { encoding: "utf8", stdio: "pipe", env: connection.env },
    );
    if (result.error || result.status !== 0) throw new Error(failureMessage);
    return result.stdout.trim();
}

/**
 * Lista tabelas aplicacionais do schema público.
 *
 * @param {ReturnType<typeof postgresCliConnection>} connection - Ligação segura.
 * @param {typeof spawnSync} runCommand - Executor.
 * @returns {string[]} Tabelas ordenadas.
 */
function readApplicationTableNames(connection, runCommand) {
    const output = runPsqlQuery(
        connection,
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;",
        "Não foi possível inventariar as tabelas do restauro.",
        runCommand,
    );
    const names = output.split("\n").map((name) => name.trim()).filter(Boolean);
    if (names.length === 0 || names.some((name) => /[\u0000-\u001f\u007f]/.test(name))) {
        throw new Error("Inventário de tabelas vazio ou inválido.");
    }
    return names;
}

/**
 * Obtém contagens integrais por tabela sem ler colunas de negócio.
 *
 * @param {ReturnType<typeof postgresCliConnection>} connection - Ligação segura.
 * @param {string[]} tableNames - Inventário canónico.
 * @param {typeof spawnSync} runCommand - Executor.
 * @returns {Record<string, string>} Contagens decimais.
 */
function readApplicationEntityCounts(connection, tableNames, runCommand) {
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
        runCommand,
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
 * Confirma igualdade exata das tabelas e respetivas contagens.
 *
 * @param {string} sourceDatabaseUrl - Base de origem.
 * @param {string} restoreDatabaseUrl - Base descartável.
 * @param {typeof spawnSync} runCommand - Executor.
 * @returns {string[]} Tabelas comparadas.
 */
function compareAllEntityCounts(sourceDatabaseUrl, restoreDatabaseUrl, runCommand) {
    if (!sourceDatabaseUrl) {
        throw new Error("DATABASE_URL é obrigatória para comparar o restauro");
    }
    const sourceConnection = postgresCliConnection(sourceDatabaseUrl);
    const restoreConnection = postgresCliConnection(restoreDatabaseUrl);
    const sourceTables = readApplicationTableNames(sourceConnection, runCommand);
    const restoredTables = readApplicationTableNames(restoreConnection, runCommand);
    if (JSON.stringify(sourceTables) !== JSON.stringify(restoredTables)) {
        throw new Error("O inventário de tabelas do restauro diverge da origem.");
    }
    const source = readApplicationEntityCounts(sourceConnection, sourceTables, runCommand);
    const restored = readApplicationEntityCounts(restoreConnection, sourceTables, runCommand);
    if (sourceTables.some((tableName) => source[tableName] !== restored[tableName])) {
        throw new Error("As contagens integrais do restauro divergem da origem.");
    }
    return sourceTables;
}

/**
 * Verifica e restaura um backup local persistente.
 *
 * @param {object} options - Descritor, ambiente e executor.
 * @returns {Promise<object>} Evidência segura do restore.
 */
async function verifyLocalBackup({ args, env, bundle, runCommand }) {
    const descriptor = resolveLocalBackupBundle(args, env, bundle);
    await assertPrivateRegularFile(descriptor.manifestPath, "Manifesto local");
    const checksumPath = `${descriptor.manifestPath}.sha256`;
    let expectedManifestSha256 = descriptor.manifestSha256;
    if (!expectedManifestSha256) {
        await assertPrivateRegularFile(checksumPath, "Checksum do manifesto local");
        expectedManifestSha256 = (await readFile(checksumPath, "utf8")).trim().toLowerCase();
        if (!/^[a-f0-9]{64}$/.test(expectedManifestSha256)) {
            throw new Error("Checksum do manifesto local inválido.");
        }
    }
    if ((await sha256(descriptor.manifestPath)) !== expectedManifestSha256) {
        throw new Error("Hash do manifesto local divergente.");
    }
    const manifest = await readBackupManifest(descriptor.manifestPath, "local");
    const backupPath = join(dirname(descriptor.manifestPath), manifest.file);
    const backupInfo = await assertPrivateRegularFile(backupPath, "Dump local");
    if (backupInfo.size !== manifest.sizeBytes) {
        throw new Error("Dump local truncado: tamanho diverge do manifesto.");
    }
    if ((await sha256(backupPath)) !== manifest.sha256) {
        throw new Error("Hash do dump local divergente.");
    }
    validateRestoreTarget(env.RESTORE_DATABASE_URL, env.DATABASE_URL);
    assertPostgresToolsAvailable(["pg_restore", "psql"], runCommand);
    const restored = restoreIntoDisposableDatabase(
        backupPath,
        env.RESTORE_DATABASE_URL,
        env.DATABASE_URL,
        runCommand,
    );
    const comparedEntities = compareAllEntityCounts(
        env.DATABASE_URL,
        env.RESTORE_DATABASE_URL,
        runCommand,
    );
    return {
        mode: "local",
        file: basename(backupPath),
        manifest: basename(descriptor.manifestPath),
        sizeBytes: manifest.sizeBytes,
        checkedAt: new Date().toISOString(),
        restorable: true,
        restoredDatabase: restored.databaseName,
        migrationCount: restored.migrationCount,
        comparedEntities,
        check: "manifesto + SHA-256 + pg_restore real + migrations + todas as tabelas",
    };
}

/**
 * Verifica o bundle remoto production-like sem fallback local.
 *
 * @param {object} options - Descritor, storage, ambiente e executor.
 * @returns {Promise<object>} Evidência segura do restore remoto.
 */
async function verifyRemoteBackup({ args, env, bundle, backupStorageOption, runCommand }) {
    const remoteBundle = resolveRemoteBackupBundle(args, env, bundle);
    validateRestoreTarget(env.RESTORE_DATABASE_URL, env.DATABASE_URL);
    assertPostgresToolsAvailable(["pg_restore", "psql"], runCommand);
    const backupStorage = backupStorageOption ?? createBackupObjectStorage(env);
    await backupStorage.checkHealth();
    const temporaryDirectory = await mkdtemp(join(tmpdir(), "opsa-restore-verification-"));
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
            "remote",
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
        const remoteDumpPath = localRestoreStorage.resolve(databaseCopy.backupKey).filePath;
        const restored = restoreIntoDisposableDatabase(
            remoteDumpPath,
            env.RESTORE_DATABASE_URL,
            env.DATABASE_URL,
            runCommand,
        );
        const comparedEntities = compareAllEntityCounts(
            env.DATABASE_URL,
            env.RESTORE_DATABASE_URL,
            runCommand,
        );
        const objectRestore = await verifyObjectBackupRestore({
            backupStorage,
            objects: remoteManifest.objects,
            temporaryRoot: temporaryDirectory,
        });
        return {
            mode: "remote",
            file: remoteManifest.file,
            sizeBytes: remoteManifest.sizeBytes,
            checkedAt: new Date().toISOString(),
            restorable: true,
            restoredDatabase: restored.databaseName,
            migrationCount: restored.migrationCount,
            comparedEntities,
            restoredObjects: objectRestore.objectCount,
            restoredObjectBytes: objectRestore.totalBytes,
            check: "manifesto remoto autenticado + SHA-256 + pg_restore real + tabelas + objetos",
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

/**
 * Verifica um backup local por omissão ou remoto apenas quando explicitado.
 *
 * @param {object} options - Configuração injetável para CLI e testes.
 * @returns {Promise<object>} Evidência segura de restore real.
 */
export async function verifyBackupRestore({
    args = process.argv.slice(2),
    env = process.env,
    mode = resolveBackupMode(args, env),
    backupStorage: backupStorageOption,
    bundle,
    runCommand = spawnSync,
} = {}) {
    const postgresRunner = createPostgresCommandRunner({
        env,
        runCommand,
        backupMode: mode,
    });
    if (mode === "local") {
        return verifyLocalBackup({
            args,
            env,
            bundle,
            runCommand: postgresRunner,
        });
    }
    if (mode === "remote") {
        return verifyRemoteBackup({
            args,
            env,
            bundle,
            backupStorageOption,
            runCommand: postgresRunner,
        });
    }
    throw new Error("Modo de verificação inválido: usa local ou remote.");
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
