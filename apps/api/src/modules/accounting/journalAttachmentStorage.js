/**
 * @file Preparação segura de anexos multipart para object storage privado.
 */

import {
    createRandomStorageKey,
    safeUploadBaseName,
    validateUploadedFile,
} from "../../lib/uploadPolicy.js";

/**
 * Valida descriptor multipart e cria chaves aleatórias de quarentena/final.
 *
 * @param {{ fileName: string, mimeType: string, sizeBytes: number, sha256: string, head: Buffer, tempPath: string }} file - Ficheiro recebido pelo parser streaming.
 * @returns {object} Metadados e chaves aprovadas.
 */
export function prepareJournalAttachment(file) {
    const approved = validateUploadedFile(file, "attachment");
    if (!/^[0-9a-f]{64}$/.test(file.sha256 ?? "")) {
        throw new TypeError("SHA-256 do upload inválido.");
    }
    return {
        fileName: safeUploadBaseName(file.fileName),
        mimeType: approved.mimeType,
        sizeBytes: approved.sizeBytes,
        sha256: file.sha256,
        tempPath: file.tempPath,
        quarantineKey: createRandomStorageKey(
            "quarantine/manual-journals",
            approved.extension,
        ),
        storageKey: createRandomStorageKey(
            "private/manual-journals",
            approved.extension,
        ),
    };
}
