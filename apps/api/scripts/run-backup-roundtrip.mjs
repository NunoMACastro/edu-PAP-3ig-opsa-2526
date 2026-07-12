/**
 * @file Gate único que cria, descarrega e restaura um bundle completo de teste.
 */

import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import {
    combineOperationAndCleanupError,
    removeLocalPathsAndConfirmAbsent,
} from "../src/modules/storage/backupBundle.js";
import { runDailyBackup } from "./run-daily-backup.mjs";
import { verifyBackupRestore } from "./verify-backup-restore.mjs";

/**
 * Executa o backup e o restauro no mesmo ambiente académico controlado.
 *
 * @returns {Promise<object>} Evidência agregada sem credenciais.
 */
export async function runBackupRoundtrip() {
    const backupDir = await mkdtemp(path.join(tmpdir(), "opsa-backup-roundtrip-"));
    let operationError;
    try {
        const backup = await runDailyBackup({ backupDir });
        const restored = await verifyBackupRestore({
            bundle: backup,
        });
        return {
            backup: {
                objectCount: backup.objectCount,
                objectBytes: backup.objectBytes,
                databaseBytes: backup.sizeBytes,
                retentionDays: backup.retentionDays,
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
