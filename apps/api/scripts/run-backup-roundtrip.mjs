/**
 * @file Gate único que cria, descarrega e restaura um bundle completo de teste.
 */

import { spawnSync } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import {
    combineOperationAndCleanupError,
    removeLocalPathsAndConfirmAbsent,
} from "../src/modules/storage/backupBundle.js";
import { resolveBackupMode, runDailyBackup } from "./run-daily-backup.mjs";
import { verifyBackupRestore } from "./verify-backup-restore.mjs";

/**
 * Executa o backup e o restauro no mesmo ambiente académico controlado.
 *
 * @param {object} options - Seleção explícita do contrato a demonstrar.
 * @param {"local" | "remote"} [options.mode] - Local por omissão.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [options.env] - Ambiente injetável.
 * @param {typeof spawnSync} [options.runCommand] - Executor nativo ou Docker.
 * @returns {Promise<object>} Evidência agregada sem credenciais.
 */
export async function runBackupRoundtrip({
    env = process.env,
    mode = resolveBackupMode(process.argv.slice(2), env),
    runCommand = spawnSync,
} = {}) {
    const backupDir = await mkdtemp(path.join(tmpdir(), "opsa-backup-roundtrip-"));
    let operationError;
    try {
        const backup = await runDailyBackup({
            backupDir,
            mode,
            env,
            runCommand,
        });
        const restored = await verifyBackupRestore({
            mode,
            bundle: backup,
            env,
            runCommand,
        });
        return {
            mode,
            backup: {
                databaseBytes: backup.sizeBytes,
                ...(mode === "remote"
                    ? {
                          objectCount: backup.objectCount,
                          objectBytes: backup.objectBytes,
                          retentionDays: backup.retentionDays,
                      }
                    : { manifest: path.basename(backup.manifestPath) }),
            },
            restored,
        };
    } catch (error) {
        operationError = error;
        throw error;
    } finally {
        try {
            await removeLocalPathsAndConfirmAbsent(
                [backupDir],
                "O cleanup do roundtrip de backup não pôde ser confirmado.",
            );
        } catch (cleanupError) {
            throw combineOperationAndCleanupError(
                operationError,
                cleanupError,
                "O roundtrip falhou e persistem dados locais temporários.",
            );
        }
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    loadLocalEnvFile();
    runBackupRoundtrip()
        .then((result) => console.log(JSON.stringify(result, null, 2)))
        .catch((error) => {
            console.error(error.message);
            process.exitCode = 1;
        });
}
