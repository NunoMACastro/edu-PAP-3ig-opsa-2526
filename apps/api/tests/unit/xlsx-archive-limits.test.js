/**
 * @file Testes do central directory guard para XLSX.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { inspectXlsxArchive } from "../../src/lib/xlsxArchiveLimits.js";

/**
 * Constrói um central directory mínimo suficiente para testar o guard.
 *
 * @param {Array<{ name: string, compressed: number, uncompressed: number }>} entries - Entradas simuladas.
 * @returns {Buffer} ZIP estrutural mínimo.
 */
function centralDirectory(entries) {
    const centralEntries = entries.map((entry) => {
        const name = Buffer.from(entry.name, "utf8");
        const header = Buffer.alloc(46);
        header.writeUInt32LE(0x02014b50, 0);
        header.writeUInt32LE(entry.compressed, 20);
        header.writeUInt32LE(entry.uncompressed, 24);
        header.writeUInt16LE(name.length, 28);
        return Buffer.concat([header, name]);
    });
    const central = Buffer.concat(centralEntries);
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(entries.length, 8);
    eocd.writeUInt16LE(entries.length, 10);
    eocd.writeUInt32LE(central.length, 12);
    eocd.writeUInt32LE(0, 16);
    return Buffer.concat([central, eocd]);
}

const requiredEntries = [
    { name: "[Content_Types].xml", compressed: 50, uncompressed: 100 },
    { name: "xl/workbook.xml", compressed: 100, uncompressed: 300 },
];

test("aceita XLSX dentro dos orçamentos comprimido e descomprimido", () => {
    const result = inspectXlsxArchive(centralDirectory(requiredEntries));
    assert.equal(result.entries, 2);
    assert.equal(result.uncompressedBytes, 400);
    assert.equal(result.compressionRatio, 400 / 150);
});

test("rejeita zip bomb pelo tamanho descomprimido e pelo rácio", () => {
    const archive = centralDirectory([
        requiredEntries[0],
        { name: "xl/workbook.xml", compressed: 1, uncompressed: 10_000 },
    ]);
    assert.throws(
        () => inspectXlsxArchive(archive, { maxUncompressedBytes: 1000 }),
        { code: "XLSX_ARCHIVE_LIMIT_EXCEEDED" },
    );
    assert.throws(
        () => inspectXlsxArchive(archive, { maxCompressionRatio: 10 }),
        { code: "XLSX_ARCHIVE_LIMIT_EXCEEDED" },
    );
});

test("rejeita path traversal e ZIP sem estrutura XLSX", () => {
    assert.throws(
        () =>
            inspectXlsxArchive(
                centralDirectory([
                    requiredEntries[0],
                    { name: "../xl/workbook.xml", compressed: 10, uncompressed: 10 },
                ]),
            ),
        { code: "XLSX_ARCHIVE_LIMIT_EXCEEDED" },
    );
    assert.throws(
        () =>
            inspectXlsxArchive(
                centralDirectory([
                    { name: "file.txt", compressed: 10, uncompressed: 10 },
                ]),
            ),
        { code: "XLSX_ARCHIVE_LIMIT_EXCEEDED" },
    );
});
