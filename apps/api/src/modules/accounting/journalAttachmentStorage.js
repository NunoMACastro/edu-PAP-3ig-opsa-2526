/**
 * @file Validação e armazenamento privado de anexos de lançamentos manuais.
 */

import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { httpError } from "../../lib/httpErrors.js";

const maxAttachmentSizeBytes = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
    "application/pdf",
    "image/png",
    "image/jpeg",
]);

/**
 * Sanitiza o nome original do ficheiro para o tornar seguro dentro da storage key.
 *
 * @param fileName - Nome original do ficheiro.
 * @returns Nome de ficheiro sanitizado.
 */
function safeFileName(fileName) {
    const baseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    return baseName || "anexo";
}

/**
 * Normaliza e valida conteúdo Base64 antes de criar o Buffer do anexo.
 *
 * @param input - Dados de entrada recebidos para validação ou normalização.
 * @returns Buffer com o conteúdo Base64 validado.
 */
function decodeBase64Content(input) {
    const rawContent = String(input?.contentBase64 ?? "").trim();
    const content = rawContent.startsWith("data:")
        ? rawContent.slice(rawContent.indexOf(",") + 1)
        : rawContent;
    const normalized = content.replace(/\s/g, "");

    if (!normalized) {
        throw httpError(400, "FILE_CONTENT_REQUIRED", "Conteúdo do anexo obrigatório");
    }
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized) || normalized.length % 4 === 1) {
        throw httpError(400, "INVALID_FILE_CONTENT", "Conteúdo do anexo inválido");
    }

    const fileBuffer = Buffer.from(normalized, "base64");
    if (fileBuffer.length === 0) {
        throw httpError(400, "FILE_CONTENT_REQUIRED", "Conteúdo do anexo obrigatório");
    }
    return fileBuffer;
}

/**
 * Verifica a assinatura binária mínima de um ficheiro PDF.
 *
 * @param fileBuffer - Conteúdo binário do ficheiro.
 * @returns Booleano que indica se o ficheiro aparenta ser PDF.
 */
function hasPdfSignature(fileBuffer) {
    return fileBuffer.subarray(0, 5).equals(Buffer.from("%PDF-"));
}

/**
 * Verifica a assinatura binária completa de um ficheiro PNG.
 *
 * @param fileBuffer - Conteúdo binário do ficheiro.
 * @returns Booleano que indica se o ficheiro aparenta ser PNG.
 */
function hasPngSignature(fileBuffer) {
    return fileBuffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
}

/**
 * Verifica a assinatura binária mínima de um ficheiro JPEG.
 *
 * @param fileBuffer - Conteúdo binário do ficheiro.
 * @returns Booleano que indica se o ficheiro aparenta ser JPEG.
 */
function hasJpegSignature(fileBuffer) {
    return (
        fileBuffer.length >= 3 &&
        fileBuffer[0] === 0xff &&
        fileBuffer[1] === 0xd8 &&
        fileBuffer[2] === 0xff
    );
}

/**
 * Compara MIME type declarado com assinatura binária para rejeitar uploads mascarados.
 *
 * @param mimeType - Tipo MIME declarado pelo cliente.
 * @param fileBuffer - Conteúdo binário do ficheiro.
 * @returns Não devolve valor; lança erro se a assinatura não corresponder ao MIME type.
 */
function validateAttachmentSignature(mimeType, fileBuffer) {
    const isValid =
        (mimeType === "application/pdf" && hasPdfSignature(fileBuffer)) ||
        (mimeType === "image/png" && hasPngSignature(fileBuffer)) ||
        (mimeType === "image/jpeg" && hasJpegSignature(fileBuffer));

    if (!isValid) {
        throw httpError(
            400,
            "INVALID_FILE_SIGNATURE",
            "O conteúdo do anexo não corresponde ao tipo declarado",
        );
    }
}

/**
 * Resolve uma storage key dentro da raiz privada e bloqueia tentativas de path traversal.
 *
 * @param storageRoot - Raiz privada onde os anexos são guardados.
 * @param storageKey - Chave privada do ficheiro no armazenamento.
 * @returns Caminho absoluto validado dentro da raiz privada.
 */
function resolveStoragePath(storageRoot, storageKey) {
    const root = path.resolve(storageRoot);
    const absolutePath = path.resolve(root, ...storageKey.split("/"));

    if (!absolutePath.startsWith(`${root}${path.sep}`)) {
        throw httpError(400, "INVALID_STORAGE_KEY", "Chave de armazenamento inválida");
    }
    return absolutePath;
}

/**
 * Valida ficheiro de anexo e gera storage key privada.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {{ fileName: string, mimeType: string, sizeBytes: number, storageKey: string, fileBuffer: Buffer }} Anexo normalizado.
 */
export function parseJournalAttachment(input) {
    const fileName = String(input?.fileName ?? "").trim();
    const mimeType = String(input?.mimeType ?? "").trim();
    const declaredSizeBytes =
        input?.sizeBytes == null || input.sizeBytes === ""
            ? null
            : Number(input.sizeBytes);

    if (!fileName) {
        throw httpError(400, "FILE_NAME_REQUIRED", "Nome do ficheiro obrigatório");
    }
    if (!allowedMimeTypes.has(mimeType)) {
        throw httpError(400, "INVALID_MIME_TYPE", "Apenas PDF, PNG ou JPEG são permitidos");
    }
    const fileBuffer = decodeBase64Content(input);
    if (fileBuffer.length > maxAttachmentSizeBytes) {
        throw httpError(400, "INVALID_FILE_SIZE", "Tamanho de anexo inválido");
    }
    validateAttachmentSignature(mimeType, fileBuffer);
    if (
        declaredSizeBytes !== null &&
        (!Number.isInteger(declaredSizeBytes) ||
            declaredSizeBytes <= 0 ||
            declaredSizeBytes !== fileBuffer.length)
    ) {
        throw httpError(400, "INVALID_FILE_SIZE", "Tamanho de anexo inválido");
    }

    const storageKey = `private/manual-journals/${randomUUID()}-${safeFileName(fileName)}`;

    return {
        fileName,
        mimeType,
        sizeBytes: fileBuffer.length,
        storageKey,
        fileBuffer,
    };
}

/**
 * Guarda bytes do anexo fora de pastas públicas.
 *
 * @param {string} storageKey - Chave privada persistida no modelo.
 * @param {Buffer} fileBuffer - Conteúdo validado.
 * @param {string} storageRoot - Raiz privada de armazenamento.
 * @returns {Promise<string>} Caminho absoluto escrito.
 */
export async function storeJournalAttachmentFile(
    storageKey,
    fileBuffer,
    storageRoot = process.env.OPSA_PRIVATE_STORAGE_ROOT ?? path.resolve("private-storage"),
) {
    const absolutePath = resolveStoragePath(storageRoot, storageKey);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, fileBuffer, { flag: "wx" });
    return absolutePath;
}

/**
 * Remove ficheiro privado quando a persistência dos metadados falha.
 *
 * @param {string} storageKey - Chave privada persistida no modelo.
 * @param {string} storageRoot - Raiz privada de armazenamento.
 * @returns {Promise<void>}
 */
export async function removeJournalAttachmentFile(
    storageKey,
    storageRoot = process.env.OPSA_PRIVATE_STORAGE_ROOT ?? path.resolve("private-storage"),
) {
    const absolutePath = resolveStoragePath(storageRoot, storageKey);
    await rm(absolutePath, { force: true });
}
