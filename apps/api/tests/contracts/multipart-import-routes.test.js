/**
 * @file Contratos HTTP multipart dos imports comerciais e bancários.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { access } from "node:fs/promises";
import test from "node:test";
import express from "express";
import request from "supertest";
import { parseSingleFileMultipart } from "../../src/lib/multipartUpload.js";
import { buildBusinessImportRoutes } from "../../src/modules/imports/businessImportRoutes.js";
import { buildStatementRoutes } from "../../src/modules/treasury/statementRoutes.js";

function buildAuthenticatedPrisma() {
    const user = {
        id: "user-1",
        email: "user@example.test",
        name: "Utilizador",
        isActive: true,
    };
    return {
        session: {
            findUnique: async () => ({
                id: "session-1",
                userId: user.id,
                activeCompanyId: "company-1",
                expiresAt: new Date("2099-01-01T00:00:00.000Z"),
                revokedAt: null,
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
                user,
            }),
        },
        companyMembership: {
            findFirst: async () => ({
                companyId: "company-1",
                role: "CONTABILISTA",
                company: {
                    id: "company-1",
                    name: "Empresa",
                    nif: "509442013",
                },
            }),
        },
    };
}

function trackRealMultipartParser(state) {
    return async (req, options) => {
        state.options = options;
        const upload = await parseSingleFileMultipart(req, options);
        state.tempPath = upload.file.tempPath;
        return {
            ...upload,
            async cleanup() {
                state.cleanupCalls += 1;
                await upload.cleanup();
            },
        };
    };
}

function buildApp(path, router) {
    const app = express();
    app.use(express.json());
    app.use(path, router);
    return app;
}

function postHandler(router, path) {
    const layer = router.stack.find(
        (candidate) => candidate.route?.path === path && candidate.route.methods.post,
    );
    assert.ok(layer, `POST ${path} em falta`);
    return layer.route.stack.at(-1).handle;
}

async function executePostHandler(handler) {
    const response = {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
    await handler({
        is: () => true,
        companyId: "company-1",
        user: { id: "user-1" },
    }, response);
    return response;
}

test("POST /api/imports/business-data usa Buffer e limpa antes do service", async () => {
    const state = { cleanupCalls: 0, buffer: null };
    const prisma = buildAuthenticatedPrisma();
    const router = buildBusinessImportRoutes({
        prisma,
        multipartParser: trackRealMultipartParser(state),
        async businessImporter(_prisma, context) {
            assert.equal(state.cleanupCalls, 1);
            await assert.rejects(access(state.tempPath), { code: "ENOENT" });
            assert.equal(Buffer.isBuffer(context.input.fileBuffer), true);
            assert.equal(typeof context.input.fileBuffer, "object");
            assert.equal("contentBase64" in context.input, false);
            assert.equal(context.input.type, "CUSTOMERS");
            assert.equal(context.input.fileName, "clientes.csv");
            assert.equal(context.companyId, "company-1");
            state.buffer = context.input.fileBuffer;
            return { acceptedRows: 1, rejectedRows: 0 };
        },
    });

    const response = await request(buildApp("/api/imports", router))
        .post("/api/imports/business-data")
        .set("Cookie", "sid=session-1")
        .field("type", "CUSTOMERS")
        .attach("file", Buffer.from("name;nif\nCliente;509442013"), {
            filename: "clientes.csv",
            contentType: "text/csv",
        });

    assert.equal(response.status, 201);
    assert.deepEqual(state.options.allowedFields, ["type", "treasuryAccountId"]);
    assert.equal(state.buffer.every((byte) => byte === 0), true);
});

test("POST /api/treasury/statements/import usa policy bancária e Buffer", async () => {
    const state = { cleanupCalls: 0, buffer: null };
    const prisma = buildAuthenticatedPrisma();
    const router = buildStatementRoutes({
        prisma,
        multipartParser: trackRealMultipartParser(state),
        async statementImporter(_prisma, context) {
            assert.equal(state.cleanupCalls, 1);
            await assert.rejects(access(state.tempPath), { code: "ENOENT" });
            assert.equal(Buffer.isBuffer(context.input.fileBuffer), true);
            assert.equal("content" in context.input, false);
            assert.equal("format" in context.input, false);
            assert.equal(context.input.treasuryAccountId, "treasury-1");
            assert.equal(context.input.fileName, "extrato.csv");
            state.buffer = context.input.fileBuffer;
            return { import: { id: "statement-import-1" }, lines: [] };
        },
    });

    const response = await request(buildApp("/api/treasury", router))
        .post("/api/treasury/statements/import")
        .set("Cookie", "sid=session-1")
        .field("treasuryAccountId", "treasury-1")
        .attach(
            "file",
            Buffer.from(
                "data;descricao;referencia;valor\n2026-07-01;Venda;V1;10,50",
            ),
            { filename: "extrato.csv", contentType: "text/csv" },
        );

    assert.equal(response.status, 201);
    assert.deepEqual(state.options.allowedFields, ["treasuryAccountId"]);
    assert.equal(state.buffer.every((byte) => byte === 0), true);
});

test("os dois endpoints rejeitam JSON antes do parser e do service", async () => {
    let parserCalls = 0;
    let importerCalls = 0;
    const multipartParser = async () => {
        parserCalls += 1;
        throw new Error("não deve executar");
    };
    const importer = async () => {
        importerCalls += 1;
    };
    const prisma = buildAuthenticatedPrisma();
    const app = express();
    app.use(express.json());
    app.use(
        "/api/imports",
        buildBusinessImportRoutes({
            prisma,
            multipartParser,
            businessImporter: importer,
        }),
    );
    app.use(
        "/api/treasury",
        buildStatementRoutes({
            prisma,
            multipartParser,
            statementImporter: importer,
        }),
    );

    for (const path of [
        "/api/imports/business-data",
        "/api/treasury/statements/import",
    ]) {
        const response = await request(app)
            .post(path)
            .set("Cookie", "sid=session-1")
            .send({ fileBuffer: "ZmFrZS1iYXNlNjQ=" });
        assert.equal(response.status, 415);
        assert.equal(response.body.error, "MULTIPART_REQUIRED");
    }
    assert.equal(parserCalls, 0);
    assert.equal(importerCalls, 0);
});

test("campos de ownership e extensões fora da policy são bloqueados", async () => {
    let importerCalls = 0;
    const prisma = buildAuthenticatedPrisma();
    const businessApp = buildApp(
        "/api/imports",
        buildBusinessImportRoutes({
            prisma,
            businessImporter: async () => {
                importerCalls += 1;
            },
        }),
    );
    const forged = await request(businessApp)
        .post("/api/imports/business-data")
        .set("Cookie", "sid=session-1")
        .field("type", "CUSTOMERS")
        .field("companyId", "company-forged")
        .attach("file", Buffer.from("name;nif\nCliente;509442013"), {
            filename: "clientes.csv",
            contentType: "text/csv",
        });
    assert.equal(forged.status, 400);
    assert.equal(forged.body.error, "UNEXPECTED_MULTIPART_FIELD");

    const statementApp = buildApp(
        "/api/treasury",
        buildStatementRoutes({
            prisma,
            statementImporter: async () => {
                importerCalls += 1;
            },
        }),
    );
    const extension = await request(statementApp)
        .post("/api/treasury/statements/import")
        .set("Cookie", "sid=session-1")
        .field("treasuryAccountId", "treasury-1")
        .attach("file", Buffer.from("conteudo"), {
            filename: "extrato.txt",
            contentType: "text/plain",
        });
    assert.equal(extension.status, 415);
    assert.equal(extension.body.error, "UPLOAD_EXTENSION_NOT_ALLOWED");
    assert.equal(importerCalls, 0);
});

test("imports agregam erro de validação e erro de cleanup", async () => {
    let cleanupCalls = 0;
    const multipartParser = async () => {
        const quarantinePath = `/tmp/opsa-import-route-${randomUUID()}`;
        return {
            fields: {},
            quarantinePath,
            file: {
                tempPath: `${quarantinePath}/invalid.txt`,
                fileName: "invalid.txt",
                mimeType: "text/plain",
                sizeBytes: 4,
                sha256: "a".repeat(64),
                head: Buffer.from("test"),
            },
            cleanup: async () => {
                cleanupCalls += 1;
                throw new Error("cleanup failed");
            },
        };
    };
    const business = postHandler(buildBusinessImportRoutes({
        prisma: {},
        multipartParser,
        businessImporter: async () => {
            throw new Error("must not run");
        },
    }), "/business-data");
    const statement = postHandler(buildStatementRoutes({
        prisma: {},
        multipartParser,
        statementImporter: async () => {
            throw new Error("must not run");
        },
    }), "/statements/import");

    for (const handler of [business, statement]) {
        const response = await executePostHandler(handler);
        assert.equal(response.statusCode, 500);
        assert.equal(response.body.error, "INTERNAL_ERROR");
    }
    assert.equal(cleanupCalls, 2);
});
