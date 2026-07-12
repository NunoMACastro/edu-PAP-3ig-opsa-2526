/**
 * @file Testes de limites, MIME, assinatura e nomes aleatórios dos uploads.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    MAX_UPLOAD_BYTES,
    createRandomStorageKey,
    safeUploadBaseName,
    validateUploadedFile,
} from "../../src/lib/uploadPolicy.js";

test("PDF com exatamente 10 MiB é aceite e 10 MiB + 1 é rejeitado", () => {
    const base = {
        fileName: "fatura.pdf",
        mimeType: "application/pdf",
        head: Buffer.from("%PDF-1.7"),
    };
    assert.equal(
        validateUploadedFile(
            { ...base, sizeBytes: MAX_UPLOAD_BYTES },
            "attachment",
        ).sizeBytes,
        MAX_UPLOAD_BYTES,
    );
    assert.throws(
        () =>
            validateUploadedFile(
                { ...base, sizeBytes: MAX_UPLOAD_BYTES + 1 },
                "attachment",
            ),
        { code: "UPLOAD_TOO_LARGE" },
    );
});

test("extensão, MIME e assinatura têm de concordar", () => {
    assert.throws(
        () =>
            validateUploadedFile(
                {
                    fileName: "imagem.pdf",
                    mimeType: "application/pdf",
                    sizeBytes: 8,
                    head: Buffer.from("not-pdf"),
                },
                "attachment",
            ),
        { code: "UPLOAD_SIGNATURE_MISMATCH" },
    );
    assert.throws(
        () =>
            validateUploadedFile(
                {
                    fileName: "folha.xlsx",
                    mimeType: "text/csv",
                    sizeBytes: 4,
                    head: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
                },
                "businessImport",
            ),
        { code: "UPLOAD_MIME_MISMATCH" },
    );
});

test("storage key é aleatória e não reutiliza o nome original", () => {
    const first = createRandomStorageKey("private/manual-journals", ".pdf");
    const second = createRandomStorageKey("private/manual-journals", ".pdf");
    assert.match(first, /^private\/manual-journals\/[0-9a-f-]+\.pdf$/);
    assert.notEqual(first, second);
    assert.equal(first.includes("fatura"), false);
});

test("nome de upload remove caminhos POSIX e Windows", () => {
    assert.equal(safeUploadBaseName("../../private/report.pdf"), "report.pdf");
    assert.equal(
        safeUploadBaseName("C:\\fakepath\\comprovativo.pdf"),
        "comprovativo.pdf",
    );
    assert.equal(safeUploadBaseName("pasta\\nome\r\n.pdf"), "nome__.pdf");
});
