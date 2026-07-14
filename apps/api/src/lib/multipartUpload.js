/**
 * @file Parser multipart streaming, route-scoped e com quarentena temporária.
 *
 * Apenas um ficheiro é aceite por pedido. Os bytes são escritos num diretório
 * temporário `0700`, o ficheiro fica `0600`, o SHA-256 é calculado durante o
 * stream e o caller recebe uma função de cleanup idempotente.
 */

import { createHash, randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { lstat, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import Busboy from "busboy";
import { httpError } from "./httpErrors.js";
import { MAX_UPLOAD_BYTES } from "./uploadPolicy.js";

const MAX_FIELD_BYTES = 10_000;
const MAX_FIELDS = 20;
const HEAD_BYTES = 512;

/**
 * Mantém acessíveis a falha funcional e a falha de cleanup quando coexistem.
 *
 * @param {unknown} operationError - Erro principal, quando existente.
 * @param {unknown} cleanupError - Erro ao remover/confirmar a quarentena.
 * @param {string} message - Mensagem agregada sem paths ou payloads.
 * @returns {unknown} Erro de cleanup ou AggregateError com ambas as causas.
 */
export function combineMultipartOperationAndCleanupError(
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
 * Executa cleanup após falha do parser sem substituir a causa original.
 *
 * @param {unknown} operationError - Erro que interrompeu o parsing.
 * @param {() => Promise<void>} cleanup - Cleanup da quarentena criada.
 * @returns {Promise<never>}
 */
export async function rethrowMultipartFailureAfterCleanup(operationError, cleanup) {
    try {
        await cleanup();
    } catch (cleanupError) {
        throw combineMultipartOperationAndCleanupError(
            operationError,
            cleanupError,
            "O upload falhou e o cleanup da quarentena também falhou.",
        );
    }
    throw operationError;
}

/**
 * Confirma que um path temporário deixou de existir.
 *
 * @param {string} entry - Diretório privado de quarentena.
 * @returns {Promise<void>}
 */
async function assertLocalPathAbsent(entry) {
    try {
        await lstat(entry);
    } catch (error) {
        if (error?.code === "ENOENT") return;
        throw new Error("Não foi possível confirmar o cleanup da quarentena.", {
            cause: error,
        });
    }
    throw new Error("A quarentena permaneceu em disco após o cleanup.");
}

/**
 * Executa o cleanup devolvido pelo parser e confirma a pós-condição no disco.
 *
 * @param {{ cleanup: () => Promise<void>, quarantinePath?: string, file?: {tempPath?: string} } | null | undefined} upload - Upload parseado.
 * @returns {Promise<void>}
 */
export async function cleanupMultipartUpload(upload) {
    if (!upload) return;
    const quarantinePath = upload.quarantinePath ?? path.dirname(upload.file?.tempPath ?? "");
    if (!quarantinePath || quarantinePath === ".") {
        throw new TypeError("Upload sem path de quarentena verificável.");
    }
    let cleanupError;
    try {
        await upload.cleanup();
    } catch (error) {
        cleanupError = error;
    }
    try {
        await assertLocalPathAbsent(quarantinePath);
    } catch (confirmationError) {
        throw combineMultipartOperationAndCleanupError(
            cleanupError,
            confirmationError,
            "O cleanup e a confirmação da quarentena falharam.",
        );
    }
    if (cleanupError) throw cleanupError;
}

/**
 * Converte erros internos do parser num erro HTTP seguro.
 *
 * @param {unknown} error - Erro capturado.
 * @returns {Error} Erro HTTP preservado ou normalizado.
 */
function safeMultipartError(error) {
    if (error?.status || error?.statusCode) return error;
    return httpError(400, "INVALID_MULTIPART_UPLOAD", "Upload multipart inválido.");
}

/**
 * Parseia um único ficheiro sem o materializar em memória.
 *
 * @param {import("express").Request} req - Pedido Express ainda não consumido.
 * @param {{ fileField?: string, allowedFields?: string[], maxBytes?: number }} [options] - Contrato específico da rota.
 * @returns {Promise<{ fields: Record<string, string>, file: { fieldName: string, fileName: string, mimeType: string, sizeBytes: number, sha256: string, head: Buffer, tempPath: string }, quarantinePath: string, cleanup: () => Promise<void> }>} Upload em quarentena.
 */
export async function parseSingleFileMultipart(req, options = {}) {
    const fileField = options.fileField ?? "file";
    const allowedFields = new Set(options.allowedFields ?? []);
    const maxBytes = options.maxBytes ?? MAX_UPLOAD_BYTES;
    if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_UPLOAD_BYTES) {
        throw new TypeError("Limite multipart inválido.");
    }

    const quarantineDir = await mkdtemp(path.join(tmpdir(), "opsa-upload-"));
    let cleaned = false;
    const cleanup = async () => {
        if (cleaned) return;
        let removalError;
        try {
            await rm(quarantineDir, { recursive: true, force: true });
        } catch (error) {
            removalError = error;
        }
        try {
            await assertLocalPathAbsent(quarantineDir);
        } catch (confirmationError) {
            throw combineMultipartOperationAndCleanupError(
                removalError,
                confirmationError,
                "Não foi possível remover e confirmar a quarentena.",
            );
        }
        if (removalError) throw removalError;
        cleaned = true;
    };

    try {
        return await new Promise((resolve, reject) => {
            let parser;
            try {
                parser = Busboy({
                    headers: req.headers,
                    limits: {
                        files: 1,
                        fields: MAX_FIELDS,
                        parts: MAX_FIELDS + 1,
                        fileSize: maxBytes,
                        fieldSize: MAX_FIELD_BYTES,
                    },
                });
            } catch (error) {
                reject(safeMultipartError(error));
                return;
            }

            const fields = {};
            let filePromise = null;
            let failure = null;
            let fileSeen = false;
            let requestTerminated = false;
            const terminateRequest = (error) => {
                if (requestTerminated) return;
                requestTerminated = true;
                failure ??= error;
                req.unpipe(parser);
                parser.destroy(failure);
            };
            const onRequestAborted = () => terminateRequest(
                httpError(400, "MULTIPART_UPLOAD_ABORTED", "Upload multipart interrompido."),
            );
            const onRequestError = () => terminateRequest(
                httpError(400, "INVALID_MULTIPART_UPLOAD", "Upload multipart inválido."),
            );
            req.once("aborted", onRequestAborted);
            req.once("error", onRequestError);
            const detachRequestListeners = () => {
                req.off("aborted", onRequestAborted);
                req.off("error", onRequestError);
            };
            parser.on("field", (name, value, info) => {
                if (info.valueTruncated) {
                    failure ??= httpError(
                        413,
                        "MULTIPART_FIELD_TOO_LARGE",
                        "Campo multipart demasiado grande.",
                    );
                    return;
                }
                if (!allowedFields.has(name)) {
                    failure ??= httpError(
                        400,
                        "UNEXPECTED_MULTIPART_FIELD",
                        "O upload contém um campo inesperado.",
                    );
                    return;
                }
                fields[name] = value;
            });
            parser.on("file", (fieldName, stream, info) => {
                if (fieldName !== fileField || fileSeen) {
                    failure ??= httpError(
                        400,
                        "UNEXPECTED_MULTIPART_FILE",
                        "O pedido deve conter exatamente um ficheiro no campo esperado.",
                    );
                    stream.resume();
                    return;
                }
                fileSeen = true;
                const tempPath = path.join(quarantineDir, randomUUID());
                const hash = createHash("sha256");
                const headChunks = [];
                let headLength = 0;
                let sizeBytes = 0;
                let truncated = false;
                stream.on("limit", () => {
                    truncated = true;
                });
                stream.on("data", (chunk) => {
                    sizeBytes += chunk.length;
                    hash.update(chunk);
                    if (headLength < HEAD_BYTES) {
                        const slice = chunk.subarray(0, HEAD_BYTES - headLength);
                        headChunks.push(slice);
                        headLength += slice.length;
                    }
                });
                filePromise = pipeline(
                    stream,
                    createWriteStream(tempPath, { flags: "wx", mode: 0o600 }),
                ).then(() => {
                    if (truncated || stream.truncated) {
                        throw httpError(
                            413,
                            "UPLOAD_TOO_LARGE",
                            `O ficheiro não pode exceder ${maxBytes} bytes.`,
                        );
                    }
                    return {
                        fieldName,
                        fileName: path.basename(info.filename || "upload.bin"),
                        mimeType: info.mimeType,
                        sizeBytes,
                        sha256: hash.digest("hex"),
                        head: Buffer.concat(headChunks),
                        tempPath,
                    };
                });
            });
            for (const event of ["filesLimit", "fieldsLimit", "partsLimit"]) {
                parser.on(event, () => {
                    failure ??= httpError(
                        413,
                        "MULTIPART_LIMIT_EXCEEDED",
                        "O pedido multipart excede os limites permitidos.",
                    );
                });
            }
            parser.once("error", (error) => {
                failure ??= safeMultipartError(error);
            });
            parser.once("close", async () => {
                detachRequestListeners();
                try {
                    const file = filePromise ? await filePromise : null;
                    if (failure) throw failure;
                    if (!file) {
                        throw httpError(
                            400,
                            "UPLOAD_FILE_REQUIRED",
                            "É obrigatório enviar um ficheiro.",
                        );
                    }
                    resolve({ fields, file, quarantinePath: quarantineDir, cleanup });
                } catch (error) {
                    reject(safeMultipartError(error));
                }
            });
            req.pipe(parser);
        });
    } catch (error) {
        return rethrowMultipartFailureAfterCleanup(error, cleanup);
    }
}
