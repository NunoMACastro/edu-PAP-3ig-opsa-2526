/**
 * @file Teste HTTP real do parser multipart streaming.
 */

import assert from "node:assert/strict";
import { access, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { PassThrough } from "node:stream";
import test from "node:test";
import express from "express";
import request from "supertest";
import {
    cleanupMultipartUpload,
    combineMultipartOperationAndCleanupError,
    parseSingleFileMultipart,
    rethrowMultipartFailureAfterCleanup,
} from "../../src/lib/multipartUpload.js";

function createUploadApp(maxBytes) {
    const app = express();
    app.post("/upload", async (req, res) => {
        try {
            const upload = await parseSingleFileMultipart(req, {
                maxBytes,
                allowedFields: ["type"],
            });
            const tempPath = upload.file.tempPath;
            await access(tempPath);
            await upload.cleanup();
            let removed = false;
            try {
                await access(tempPath);
            } catch {
                removed = true;
            }
            return res.status(200).json({
                fields: upload.fields,
                sizeBytes: upload.file.sizeBytes,
                sha256: upload.file.sha256,
                removed,
            });
        } catch (error) {
            return res
                .status(error.status ?? error.statusCode ?? 500)
                .json({ error: error.code });
        }
    });
    return app;
}

test("multipart escreve stream, calcula hash e limpa quarentena", async () => {
    const response = await request(createUploadApp(16))
        .post("/upload")
        .field("type", "CUSTOMERS")
        .attach("file", Buffer.from("12345678"), {
            filename: "dados.csv",
            contentType: "text/csv",
        });
    assert.equal(response.status, 200);
    assert.equal(response.body.fields.type, "CUSTOMERS");
    assert.equal(response.body.sizeBytes, 8);
    assert.match(response.body.sha256, /^[0-9a-f]{64}$/);
    assert.equal(response.body.removed, true);
});

test("multipart rejeita o byte acima do limite", async () => {
    const response = await request(createUploadApp(8))
        .post("/upload")
        .attach("file", Buffer.from("123456789"), {
            filename: "dados.csv",
            contentType: "text/csv",
        });
    assert.equal(response.status, 413);
    assert.equal(response.body.error, "UPLOAD_TOO_LARGE");
});

test("multipart rejeita campos não declarados", async () => {
    const response = await request(createUploadApp(16))
        .post("/upload")
        .field("companyId", "forged")
        .attach("file", Buffer.from("1234"), "dados.csv");
    assert.equal(response.status, 400);
    assert.equal(response.body.error, "UNEXPECTED_MULTIPART_FIELD");
});

test("multipart limpa a quarentena quando o request é abortado", async () => {
    const quarantineDirs = async () => new Set(
        (await readdir(tmpdir())).filter((entry) => entry.startsWith("opsa-upload-")),
    );
    const before = await quarantineDirs();
    const req = new PassThrough();
    const boundary = "opsa-abort-boundary";
    req.headers = {
        "content-type": `multipart/form-data; boundary=${boundary}`,
    };
    const parsing = parseSingleFileMultipart(req, { allowedFields: [] });
    req.write(
        `--${boundary}\r\n` +
            'Content-Disposition: form-data; name="file"; filename="dados.csv"\r\n' +
            "Content-Type: text/csv\r\n\r\n" +
            "conteudo-parcial",
    );
    for (let attempt = 0; attempt < 20 && req.listenerCount("aborted") === 0; attempt += 1) {
        await new Promise((resolve) => setImmediate(resolve));
    }
    req.emit("aborted");

    await assert.rejects(parsing, {
        code: "MULTIPART_UPLOAD_ABORTED",
        status: 400,
    });
    const after = await quarantineDirs();
    const leaked = [...after].filter((entry) => !before.has(entry));
    assert.deepEqual(leaked, []);
});

test("cleanup multipart confirma ausência e mantém ambas as falhas", async () => {
    const quarantinePath = await mkdtemp(`${tmpdir()}/opsa-upload-cleanup-test-`);
    const tempPath = `${quarantinePath}/upload.csv`;
    await writeFile(tempPath, "test");
    const cleanupError = new Error("cleanup failed");
    try {
        let failure;
        try {
            await cleanupMultipartUpload({
                quarantinePath,
                file: { tempPath },
                cleanup: async () => {
                    throw cleanupError;
                },
            });
        } catch (error) {
            failure = error;
        }
        assert.ok(failure instanceof AggregateError);
        assert.equal(failure.errors[0], cleanupError);
        assert.match(failure.errors[1].message, /permaneceu em disco/);

        const operationError = new Error("operation failed");
        const combined = combineMultipartOperationAndCleanupError(
            operationError,
            failure,
            "operation and cleanup failed",
        );
        assert.ok(combined instanceof AggregateError);
        assert.equal(combined.cause, operationError);
        assert.deepEqual(combined.errors, [operationError, failure]);
    } finally {
        await rm(quarantinePath, { recursive: true, force: true });
    }
});

test("falha do parser preserva erro original e erro de cleanup", async () => {
    const operationError = new Error("parser failed");
    const cleanupError = new Error("cleanup failed");
    let failure;

    try {
        await rethrowMultipartFailureAfterCleanup(operationError, async () => {
            throw cleanupError;
        });
    } catch (error) {
        failure = error;
    }

    assert.ok(failure instanceof AggregateError);
    assert.equal(failure.cause, operationError);
    assert.deepEqual(failure.errors, [operationError, cleanupError]);
});
