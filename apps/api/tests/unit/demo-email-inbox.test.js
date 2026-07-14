/**
 * @file Provas de segurança e retenção da inbox de email da demo local.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { buildDemoEmailInboxRoutes } from "../../src/modules/demo-email-inbox/demoEmailInboxRoutes.js";
import {
    DEMO_EMAIL_PREVIEW_RETENTION_MS,
    listDemoEmailPreviews,
} from "../../src/modules/demo-email-inbox/demoEmailInboxService.js";
import { encryptEmailOutboxPayload } from "../../src/modules/notifications/emailOutboxCrypto.js";

const ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
const NOW = new Date("2026-07-13T12:00:00.000Z");

function createPreviewPrisma() {
    const calls = { cleanup: null, list: null };
    const encryptedPayload = encryptEmailOutboxPayload(
        {
            to: "aluna@example.test",
            reason: "PASSWORD_RESET",
            subject: "Recuperação de acesso OPSA",
            text: [
                "Usa esta ligação para recuperar o acesso:",
                "http://localhost:5173/recuperar-password#token=secret-demo-token",
            ].join("\n"),
        },
        ENCRYPTION_KEY,
    );
    const prisma = {
        emailOutbox: {
            async updateMany(query) {
                calls.cleanup = query;
                return { count: 1 };
            },
            async findMany(query) {
                calls.list = query;
                return [{
                    type: "PASSWORD_RESET",
                    encryptedPayload,
                    createdAt: new Date("2026-07-13T11:55:00.000Z"),
                }];
            },
        },
    };
    return { prisma, calls };
}

test("inbox demo limpa expirados e devolve apenas metadados mínimos", async () => {
    const { prisma, calls } = createPreviewPrisma();
    const messages = await listDemoEmailPreviews(prisma, {
        encryptionKey: ENCRYPTION_KEY,
        now: NOW,
    });

    assert.deepEqual(calls.cleanup.where.type.in, [
        "COMPANY_INVITATION",
        "PASSWORD_RESET",
    ]);
    assert.equal(
        calls.cleanup.where.updatedAt.lte.getTime(),
        NOW.getTime() - DEMO_EMAIL_PREVIEW_RETENTION_MS,
    );
    assert.deepEqual(calls.cleanup.data, { encryptedPayload: null });
    assert.equal(calls.list.where.status, "SIMULATED");
    assert.deepEqual(messages, [{
        recipient: "aluna@example.test",
        subject: "Recuperação de acesso OPSA",
        type: "PASSWORD_RESET",
        actionUrl: "http://localhost:5173/recuperar-password#token=secret-demo-token",
        createdAt: "2026-07-13T11:55:00.000Z",
    }]);
    assert.equal(Object.hasOwn(messages[0], "text"), false);
    assert.equal(Object.hasOwn(messages[0], "encryptedPayload"), false);
});

test("unlock usa rate limit, no-store e comparação de código sem expor payload", async () => {
    const { prisma } = createPreviewPrisma();
    const consumed = [];
    const router = buildDemoEmailInboxRoutes({
        prisma,
        rateLimiter: {
            async consume(...args) {
                consumed.push(args);
            },
        },
        accessKey: "opsa-demo-2026",
        encryptionKey: ENCRYPTION_KEY,
    });
    const handler = router.stack.find(
        (layer) => layer.route?.path === "/email-inbox/unlock",
    ).route.stack.at(-1).handle;

    for (const [accessKey, expectedStatus] of [
        ["código-incorreto", 403],
        ["opsa-demo-2026", 200],
    ]) {
        let status;
        let body;
        const headers = {};
        await handler(
            { ip: "127.0.0.1", body: { accessKey } },
            {
                set(name, value) {
                    headers[name] = value;
                    return this;
                },
                status(value) {
                    status = value;
                    return this;
                },
                json(value) {
                    body = value;
                    return this;
                },
            },
        );
        assert.equal(status, expectedStatus);
        assert.equal(headers["Cache-Control"], "no-store");
        if (expectedStatus === 200) {
            assert.equal(body.messages.length, 1);
            assert.deepEqual(Object.keys(body.messages[0]).sort(), [
                "actionUrl",
                "createdAt",
                "recipient",
                "subject",
                "type",
            ]);
        } else {
            assert.deepEqual(body, {
                error: "DEMO_EMAIL_INBOX_ACCESS_DENIED",
                message: "Código de acesso inválido",
            });
        }
    }

    assert.equal(consumed.length, 2);
    assert.equal(consumed[0][0], "demo-email-inbox-ip");
    assert.equal(consumed[0][1], "127.0.0.1");
    assert.deepEqual(consumed[0][2], { limit: 5, windowMs: 900_000 });
});
