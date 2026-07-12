/**
 * @file Limites defensivos do contentor ZIP usado por ficheiros XLSX.
 *
 * A inspeção lê apenas o central directory antes de o ExcelJS descomprimir o
 * workbook, bloqueando ZIP64, path traversal, rácios de compressão abusivos e
 * arquivos cujo tamanho descomprimido exceda o orçamento académico.
 */

import { httpError } from "./httpErrors.js";
import { MAX_UPLOAD_BYTES } from "./uploadPolicy.js";

export const MAX_XLSX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024;
export const MAX_XLSX_ZIP_ENTRIES = 2000;
export const MAX_XLSX_COMPRESSION_RATIO = 100;

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_ENTRY_SIGNATURE = 0x02014b50;
const MAX_EOCD_SEARCH = 65_557;

/**
 * Cria um erro uniforme para arquivos Excel estruturalmente inseguros.
 *
 * @param {string} message - Motivo seguro para o cliente.
 * @returns {Error} Erro HTTP 413.
 */
function archiveError(message) {
    return httpError(413, "XLSX_ARCHIVE_LIMIT_EXCEEDED", message);
}

/**
 * Procura o End of Central Directory a partir do final do ficheiro.
 *
 * @param {Buffer} buffer - Conteúdo XLSX comprimido.
 * @returns {number} Offset da estrutura EOCD.
 */
function findEocdOffset(buffer) {
    const start = Math.max(0, buffer.length - MAX_EOCD_SEARCH);
    for (let offset = buffer.length - 22; offset >= start; offset -= 1) {
        if (buffer.readUInt32LE(offset) === EOCD_SIGNATURE) return offset;
    }
    throw archiveError("O ficheiro XLSX não contém um diretório ZIP válido.");
}

/**
 * Impede nomes absolutos ou com `..` no contentor.
 *
 * @param {string} name - Nome de uma entrada ZIP.
 * @returns {void}
 */
function assertSafeEntryName(name) {
    const normalized = name.replaceAll("\\", "/");
    if (
        normalized.startsWith("/") ||
        /^[a-zA-Z]:\//.test(normalized) ||
        normalized.split("/").includes("..")
    ) {
        throw archiveError("O XLSX contém um caminho interno inseguro.");
    }
}

/**
 * Inspeciona limites comprimidos/descomprimidos sem extrair o workbook.
 *
 * @param {Buffer} buffer - Conteúdo XLSX recebido via multipart.
 * @param {{ maxCompressedBytes?: number, maxUncompressedBytes?: number, maxEntries?: number, maxCompressionRatio?: number }} [options] - Overrides para testes.
 * @returns {{ compressedBytes: number, uncompressedBytes: number, entries: number, compressionRatio: number }} Estatísticas aprovadas.
 */
export function inspectXlsxArchive(buffer, options = {}) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 22) {
        throw archiveError("O ficheiro XLSX está vazio ou truncado.");
    }
    const maxCompressedBytes = options.maxCompressedBytes ?? MAX_UPLOAD_BYTES;
    const maxUncompressedBytes =
        options.maxUncompressedBytes ?? MAX_XLSX_UNCOMPRESSED_BYTES;
    const maxEntries = options.maxEntries ?? MAX_XLSX_ZIP_ENTRIES;
    const maxCompressionRatio =
        options.maxCompressionRatio ?? MAX_XLSX_COMPRESSION_RATIO;
    if (buffer.length > maxCompressedBytes) {
        throw archiveError("O tamanho comprimido do XLSX excede o limite.");
    }

    const eocdOffset = findEocdOffset(buffer);
    const diskNumber = buffer.readUInt16LE(eocdOffset + 4);
    const centralDisk = buffer.readUInt16LE(eocdOffset + 6);
    const entries = buffer.readUInt16LE(eocdOffset + 10);
    const centralSize = buffer.readUInt32LE(eocdOffset + 12);
    const centralOffset = buffer.readUInt32LE(eocdOffset + 16);
    if (
        diskNumber !== 0 ||
        centralDisk !== 0 ||
        entries === 0xffff ||
        centralSize === 0xffffffff ||
        centralOffset === 0xffffffff
    ) {
        throw archiveError("ZIP64 ou arquivos multi-volume não são permitidos.");
    }
    if (entries < 1 || entries > maxEntries) {
        throw archiveError("O XLSX excede o número permitido de entradas ZIP.");
    }
    if (centralOffset + centralSize > eocdOffset) {
        throw archiveError("O diretório ZIP do XLSX está truncado.");
    }

    let offset = centralOffset;
    let compressedBytes = 0;
    let uncompressedBytes = 0;
    const names = new Set();
    for (let index = 0; index < entries; index += 1) {
        if (
            offset + 46 > eocdOffset ||
            buffer.readUInt32LE(offset) !== CENTRAL_ENTRY_SIGNATURE
        ) {
            throw archiveError("Entrada inválida no diretório ZIP do XLSX.");
        }
        const compressedSize = buffer.readUInt32LE(offset + 20);
        const uncompressedSize = buffer.readUInt32LE(offset + 24);
        const nameLength = buffer.readUInt16LE(offset + 28);
        const extraLength = buffer.readUInt16LE(offset + 30);
        const commentLength = buffer.readUInt16LE(offset + 32);
        if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff) {
            throw archiveError("Entradas ZIP64 não são permitidas no XLSX.");
        }
        const entryEnd = offset + 46 + nameLength + extraLength + commentLength;
        if (entryEnd > eocdOffset) {
            throw archiveError("Nome ou metadados ZIP truncados no XLSX.");
        }
        const name = buffer
            .subarray(offset + 46, offset + 46 + nameLength)
            .toString("utf8");
        assertSafeEntryName(name);
        names.add(name);
        compressedBytes += compressedSize;
        uncompressedBytes += uncompressedSize;
        if (uncompressedBytes > maxUncompressedBytes) {
            throw archiveError("O tamanho descomprimido do XLSX excede o limite.");
        }
        offset = entryEnd;
    }
    if (!names.has("[Content_Types].xml") || !names.has("xl/workbook.xml")) {
        throw archiveError("O ZIP não contém a estrutura mínima de um XLSX.");
    }

    const compressionRatio =
        compressedBytes === 0
            ? uncompressedBytes === 0
                ? 1
                : Number.POSITIVE_INFINITY
            : uncompressedBytes / compressedBytes;
    if (compressionRatio > maxCompressionRatio) {
        throw archiveError("O rácio de compressão do XLSX excede o limite.");
    }

    return {
        compressedBytes: buffer.length,
        uncompressedBytes,
        entries,
        compressionRatio,
    };
}
