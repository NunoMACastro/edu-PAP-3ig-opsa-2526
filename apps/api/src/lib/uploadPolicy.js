/**
 * @file Políticas route-scoped para uploads privados do OPSA.
 *
 * A validação cruza tamanho real, extensão, MIME declarado e assinatura dos
 * primeiros bytes. O nome original nunca é reutilizado como storage key.
 */

import { randomUUID } from "node:crypto";
import path from "node:path";
import { httpError } from "./httpErrors.js";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Remove diretórios POSIX/Windows controlados pelo cliente antes de persistir
 * ou apresentar o nome original.
 *
 * @param {unknown} fileName - Nome multipart potencialmente completo.
 * @returns {string} Apenas o último segmento, limitado a 180 caracteres.
 */
export function safeUploadBaseName(fileName) {
    const segments = String(fileName ?? "")
        .trim()
        .replaceAll("\\", "/")
        .split("/")
        .filter(Boolean);
    return (segments.at(-1) ?? "upload.bin")
        .replace(/[\r\n]/g, "_")
        .slice(0, 180);
}

const POLICIES = Object.freeze({
    attachment: Object.freeze({
        ".pdf": Object.freeze({
            mimeTypes: new Set(["application/pdf"]),
            signature: (head) => head.subarray(0, 5).equals(Buffer.from("%PDF-")),
        }),
        ".png": Object.freeze({
            mimeTypes: new Set(["image/png"]),
            signature: (head) =>
                head
                    .subarray(0, 8)
                    .equals(
                        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
                    ),
        }),
        ".jpg": Object.freeze({
            mimeTypes: new Set(["image/jpeg"]),
            signature: (head) =>
                head.length >= 3 &&
                head[0] === 0xff &&
                head[1] === 0xd8 &&
                head[2] === 0xff,
        }),
        ".jpeg": Object.freeze({
            mimeTypes: new Set(["image/jpeg"]),
            signature: (head) =>
                head.length >= 3 &&
                head[0] === 0xff &&
                head[1] === 0xd8 &&
                head[2] === 0xff,
        }),
    }),
    businessImport: Object.freeze({
        ".csv": Object.freeze({
            mimeTypes: new Set(["text/csv", "text/plain", "application/vnd.ms-excel"]),
            signature: (head) => !head.includes(0x00),
        }),
        ".xlsx": Object.freeze({
            mimeTypes: new Set([
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/octet-stream",
            ]),
            signature: (head) =>
                head.length >= 4 &&
                head[0] === 0x50 &&
                head[1] === 0x4b &&
                head[2] === 0x03 &&
                head[3] === 0x04,
        }),
    }),
    statementImport: Object.freeze({
        ".csv": Object.freeze({
            mimeTypes: new Set(["text/csv", "text/plain", "application/vnd.ms-excel"]),
            signature: (head) => !head.includes(0x00),
        }),
        ".ofx": Object.freeze({
            mimeTypes: new Set([
                "application/x-ofx",
                "application/vnd.intu.qfx",
                "text/plain",
                "application/octet-stream",
            ]),
            signature: (head) => /(?:OFXHEADER|<OFX>)/i.test(head.toString("latin1")),
        }),
        ".xlsx": Object.freeze({
            mimeTypes: new Set([
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/octet-stream",
            ]),
            signature: (head) =>
                head.length >= 4 &&
                head[0] === 0x50 &&
                head[1] === 0x4b &&
                head[2] === 0x03 &&
                head[3] === 0x04,
        }),
    }),
});

/**
 * Devolve a extensão normalizada sem confiar em diretórios fornecidos pelo cliente.
 *
 * @param {unknown} fileName - Nome original multipart.
 * @returns {string} Extensão minúscula.
 */
export function uploadExtension(fileName) {
    const baseName = path.basename(safeUploadBaseName(fileName));
    return path.extname(baseName).toLowerCase();
}

/**
 * Valida o descriptor produzido pelo parser multipart.
 *
 * @param {{ fileName: string, mimeType: string, sizeBytes: number, head: Buffer }} file - Metadados e prefixo real.
 * @param {"attachment" | "businessImport" | "statementImport"} policyName - Política route-scoped.
 * @returns {{ extension: string, mimeType: string, sizeBytes: number }} Metadados aprovados.
 */
export function validateUploadedFile(file, policyName) {
    const policy = POLICIES[policyName];
    if (!policy) throw new TypeError(`Política de upload desconhecida: ${policyName}`);
    if (!Number.isInteger(file?.sizeBytes) || file.sizeBytes < 1) {
        throw httpError(400, "EMPTY_UPLOAD", "O ficheiro está vazio.");
    }
    if (file.sizeBytes > MAX_UPLOAD_BYTES) {
        throw httpError(
            413,
            "UPLOAD_TOO_LARGE",
            `O ficheiro não pode exceder ${MAX_UPLOAD_BYTES} bytes.`,
        );
    }

    const extension = uploadExtension(file.fileName);
    const extensionPolicy = policy[extension];
    if (!extensionPolicy) {
        throw httpError(415, "UPLOAD_EXTENSION_NOT_ALLOWED", "Extensão não permitida.");
    }
    const mimeType = String(file.mimeType ?? "").toLowerCase();
    if (!extensionPolicy.mimeTypes.has(mimeType)) {
        throw httpError(
            415,
            "UPLOAD_MIME_MISMATCH",
            "O MIME type não corresponde à extensão permitida.",
        );
    }
    if (!Buffer.isBuffer(file.head) || !extensionPolicy.signature(file.head)) {
        throw httpError(
            415,
            "UPLOAD_SIGNATURE_MISMATCH",
            "A assinatura do ficheiro não corresponde ao formato declarado.",
        );
    }

    return { extension, mimeType, sizeBytes: file.sizeBytes };
}

/**
 * Cria uma chave sem nomes controlados pelo utilizador.
 *
 * @param {string} prefix - Prefixo privado previamente escolhido pelo backend.
 * @param {string} extension - Extensão já validada pela política.
 * @returns {string} Storage key aleatória.
 */
export function createRandomStorageKey(prefix, extension) {
    const normalizedPrefix = String(prefix ?? "")
        .split("/")
        .filter((part) => /^[a-zA-Z0-9_-]+$/.test(part))
        .join("/");
    if (!normalizedPrefix || !/^\.[a-z0-9]+$/.test(extension)) {
        throw new TypeError("Prefixo ou extensão de storage inválidos.");
    }
    return `${normalizedPrefix}/${randomUUID()}${extension}`;
}
