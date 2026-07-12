/**
 * @file Cópia e verificação streaming dos objetos que integram um backup OPSA.
 *
 * Os objetos são materializados apenas em ficheiros temporários privados para
 * permitir calcular SHA-256 antes do upload. Isto evita confiar em ETags S3,
 * que não representam necessariamente o hash do conteúdo.
 */

import { createHash, randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { chmod, lstat, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

/**
 * Remove chaves temporárias e falha de forma explícita quando a remoção não
 * pôde ser confirmada. A mensagem não inclui nomes de objetos nem detalhes do
 * provider.
 *
 * @param {object} storage - Adapter de destino.
 * @param {string[]} keys - Chaves únicas a remover.
 * @param {string} failureMessage - Mensagem pública segura.
 * @returns {Promise<void>}
 */
export async function deleteStorageObjectsAndConfirmAbsent(
    storage,
    keys,
    failureMessage,
) {
    const uniqueKeys = [...new Set(keys)];
    if (uniqueKeys.length === 0) return;
    if (
        typeof storage?.deleteObject !== "function" ||
        typeof storage?.objectExists !== "function"
    ) {
        throw new TypeError("Adapter de storage sem pós-condição de cleanup.");
    }
    const cleanup = await Promise.allSettled(
        uniqueKeys.map(async (key) => {
            await storage.deleteObject(key);
            if (await storage.objectExists(key)) {
                throw new Error("O objeto permaneceu no storage após DELETE.");
            }
        }),
    );
    const failures = cleanup
        .filter(({ status }) => status === "rejected")
        .map(({ reason }) => reason);
    if (failures.length > 0) {
        throw new AggregateError(failures, failureMessage);
    }
}

/**
 * Remove ficheiros/diretórios privados e confirma a ausência com `lstat`.
 * Executa uma única remoção e uma única verificação por caminho, sem retries.
 *
 * @param {string[]} paths - Caminhos internos a remover.
 * @param {string} failureMessage - Mensagem segura para o chamador.
 * @returns {Promise<void>}
 */
export async function removeLocalPathsAndConfirmAbsent(paths, failureMessage) {
    const uniquePaths = [...new Set(paths)];
    const removals = await Promise.allSettled(
        uniquePaths.map((entry) => rm(entry, { recursive: true, force: true })),
    );
    const checks = await Promise.allSettled(
        uniquePaths.map(async (entry) => {
            try {
                await lstat(entry);
            } catch (error) {
                if (error?.code === "ENOENT") return;
                throw new Error("Não foi possível confirmar a ausência local.", {
                    cause: error,
                });
            }
            throw new Error("Persistem dados locais depois do cleanup.");
        }),
    );
    const failures = [];
    for (const [index, check] of checks.entries()) {
        if (check.status === "rejected") {
            if (removals[index]?.status === "rejected") {
                failures.push(removals[index].reason);
            }
            failures.push(check.reason);
        }
    }
    if (failures.length > 0) {
        throw new AggregateError(failures, failureMessage);
    }
}

/**
 * Mantém acessíveis o erro operacional e o erro de cleanup quando ambos ocorrem.
 *
 * @param {unknown} operationError - Falha original, quando existente.
 * @param {unknown} cleanupError - Falha da pós-condição de cleanup.
 * @param {string} message - Mensagem agregada segura.
 * @returns {unknown} Erro de cleanup ou AggregateError com ambas as causas.
 */
export function combineOperationAndCleanupError(
    operationError,
    cleanupError,
    message,
) {
    if (!operationError) return cleanupError;
    return new AggregateError([operationError, cleanupError], message, {
        cause: operationError,
    });
}

/**
 * Copia um objeto através de disco temporário, calcula o hash real e valida o
 * tamanho antes de o promover para o storage de destino.
 *
 * @param {{ sourceStorage: object, destinationStorage: object, sourceKey: string, destinationKey: string, expectedSha256?: string, temporaryRoot?: string }} input - Origem, destino e constraints.
 * @returns {Promise<{ sourceKey: string, backupKey: string, sizeBytes: number, sha256: string, contentType: string | null }>} Descriptor verificável.
 */
export async function copyStorageObjectWithHash({
    sourceStorage,
    destinationStorage,
    sourceKey,
    destinationKey,
    expectedSha256,
    temporaryRoot = tmpdir(),
}) {
    const temporaryDirectory = await mkdtemp(
        path.join(temporaryRoot, "opsa-object-copy-"),
    );
    const temporaryFile = path.join(temporaryDirectory, randomUUID());
    let operationError;
    try {
        await chmod(temporaryDirectory, 0o700);
        const source = await sourceStorage.getObject(sourceKey);
        const hash = createHash("sha256");
        const hashingStream = new Transform({
            transform(chunk, _encoding, callback) {
                hash.update(chunk);
                callback(null, chunk);
            },
        });
        await pipeline(
            source.body,
            hashingStream,
            createWriteStream(temporaryFile, { mode: 0o600 }),
        );
        const info = await stat(temporaryFile);
        if (
            Number.isSafeInteger(source.contentLength) &&
            source.contentLength !== info.size
        ) {
            throw new Error(`Objeto ${sourceKey} foi descarregado de forma incompleta.`);
        }
        const sha256 = hash.digest("hex");
        if (expectedSha256 && sha256 !== expectedSha256) {
            throw new Error(`Hash inválido no objeto ${sourceKey}.`);
        }
        await destinationStorage.putFile({
            key: destinationKey,
            filePath: temporaryFile,
            contentType: source.contentType ?? "application/octet-stream",
            metadata: { sha256, sourceKey },
        });
        return {
            sourceKey,
            backupKey: destinationKey,
            sizeBytes: info.size,
            sha256,
            contentType: source.contentType ?? null,
        };
    } catch (error) {
        operationError = error;
        throw error;
    } finally {
        try {
            await removeLocalPathsAndConfirmAbsent(
                [temporaryDirectory],
                "O cleanup do ficheiro temporário não pôde ser confirmado.",
            );
        } catch (cleanupError) {
            throw combineOperationAndCleanupError(
                operationError,
                cleanupError,
                "A cópia falhou e o cleanup temporário também falhou.",
            );
        }
    }
}

/**
 * Copia todos os objetos persistentes para o bundle de backup.
 *
 * @param {{ sourceStorage: object, backupStorage: object, bundlePrefix: string, temporaryRoot?: string }} input - Storages e prefixo isolado.
 * @returns {Promise<Array<object>>} Manifesto ordenado de objetos.
 */
export async function createObjectBackupManifest({
    sourceStorage,
    backupStorage,
    bundlePrefix,
    temporaryRoot,
}) {
    const sourceObjects = (await sourceStorage.listObjects()).filter(
        ({ key }) => key && !key.startsWith("quarantine/"),
    );
    const copiedKeys = [];
    const manifest = [];
    try {
        for (const object of sourceObjects.sort((a, b) => a.key.localeCompare(b.key))) {
            const backupKey = `${bundlePrefix}/objects/${object.key}`;
            // Registar antes do PUT cobre falhas ambíguas depois de o provider
            // ter aceite os bytes, mas antes de responder ao cliente.
            copiedKeys.push(backupKey);
            const descriptor = await copyStorageObjectWithHash({
                sourceStorage,
                destinationStorage: backupStorage,
                sourceKey: object.key,
                destinationKey: backupKey,
                temporaryRoot,
            });
            manifest.push(descriptor);
        }
        return manifest;
    } catch (error) {
        try {
            await deleteStorageObjectsAndConfirmAbsent(
                backupStorage,
                copiedKeys,
                "O cleanup do bundle de backup não pôde ser confirmado.",
            );
        } catch (cleanupError) {
            throw combineOperationAndCleanupError(
                error,
                cleanupError,
                "A cópia do bundle falhou e o cleanup também falhou.",
            );
        }
        throw error;
    }
}

/**
 * Restaura os objetos do bundle num prefixo descartável e volta a descarregá-los
 * para provar integridade ponta a ponta. Os objetos de prova são sempre limpos.
 *
 * @param {{ backupStorage: object, restoreStorage?: object, objects: Array<object>, restorePrefix?: string, temporaryRoot?: string }} input - Bundle e destino descartável.
 * @returns {Promise<{ objectCount: number, totalBytes: number, restorePrefix: string }>} Evidência sem segredos.
 */
export async function verifyObjectBackupRestore({
    backupStorage,
    restoreStorage = backupStorage,
    objects,
    restorePrefix = `restore-verification/${randomUUID()}`,
    temporaryRoot,
}) {
    if (!Array.isArray(objects)) {
        throw new Error("Manifesto de objetos inválido.");
    }
    const restoredKeys = [];
    let totalBytes = 0;
    let operationError;
    try {
        for (const object of objects) {
            if (
                !object?.sourceKey ||
                !object?.backupKey ||
                !/^[a-f0-9]{64}$/.test(object?.sha256 ?? "")
            ) {
                throw new Error("Entrada inválida no manifesto de objetos.");
            }
            const restoredKey = `${restorePrefix}/${object.sourceKey}`;
            restoredKeys.push(restoredKey);
            await copyStorageObjectWithHash({
                sourceStorage: backupStorage,
                destinationStorage: restoreStorage,
                sourceKey: object.backupKey,
                destinationKey: restoredKey,
                expectedSha256: object.sha256,
                temporaryRoot,
            });
            const verificationKey = `${restorePrefix}/verification/${randomUUID()}`;
            restoredKeys.push(verificationKey);
            const verified = await copyStorageObjectWithHash({
                sourceStorage: restoreStorage,
                destinationStorage: restoreStorage,
                sourceKey: restoredKey,
                destinationKey: verificationKey,
                expectedSha256: object.sha256,
                temporaryRoot,
            });
            totalBytes += verified.sizeBytes;
        }
        return { objectCount: objects.length, totalBytes, restorePrefix };
    } catch (error) {
        operationError = error;
        throw error;
    } finally {
        try {
            await deleteStorageObjectsAndConfirmAbsent(
                restoreStorage,
                restoredKeys,
                "O cleanup da verificação de restauro não pôde ser confirmado.",
            );
        } catch (cleanupError) {
            throw combineOperationAndCleanupError(
                operationError,
                cleanupError,
                "O restauro de objetos falhou e o cleanup também falhou.",
            );
        }
    }
}
