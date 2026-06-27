/**
 * @file Testes unitarios dos contratos transversais MF6.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    measureDocumentInsertion,
    setDocumentPerformanceHeaders,
} from "../../src/modules/performance/documentPerformance.js";
import {
    limitReconciliationCandidates,
    measureReconciliation,
} from "../../src/modules/treasury/reconciliationPerformance.js";
import { suggestReconciliations } from "../../src/modules/treasury/statementImportService.js";
import {
    assertEnoughFifoStock,
    measureFifoCost,
} from "../../src/modules/inventory/fifoPerformance.js";
import { buildSessionCookieOptions } from "../../src/modules/auth/sessionCookie.js";
import {
    BCRYPT_ROUNDS,
    hashPassword,
    verifyPassword,
} from "../../src/modules/auth/password.js";
import {
    applyStrictTransportSecurity,
    enforceHttps,
} from "../../src/modules/security/transportSecurity.js";
import {
    escapeHtml,
    requireTrustedOrigin,
} from "../../src/modules/security/requestHardening.js";
import { loadApiEnv } from "../../src/config/env.js";
import { recordSensitiveAudit } from "../../src/modules/audit/auditLogService.js";

/**
 * Cria resposta Express minima para testar middlewares sem servidor.
 *
 * @returns {object} Resposta fake.
 */
function createResponse() {
    return {
        statusCode: null,
        payload: null,
        headers: {},
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.payload = payload;
            return this;
        },
        set(key, value) {
            this.headers[key] = value;
            return this;
        },
    };
}

test("BK-MF6-01: medicao de documento preserva resultado e escreve headers", async () => {
    const measured = await measureDocumentInsertion(async () => ({ id: "doc-1" }));
    const res = createResponse();

    setDocumentPerformanceHeaders(res, measured);

    assert.deepEqual(measured.result, { id: "doc-1" });
    assert.equal(res.headers["X-OPSA-Document-Budget-Ms"], "1000");
    assert.equal(
        ["true", "false"].includes(res.headers["X-OPSA-Document-Within-Budget"]),
        true,
    );
});

test("BK-MF6-03: reconciliação limita candidatos e nunca confirma movimentos", async () => {
    const candidates = Array.from({ length: 251 }, (_value, index) => ({
        id: `candidate-${index}`,
    }));
    const limited = limitReconciliationCandidates(candidates);
    assert.equal(limited.selected.length, 250);
    assert.equal(limited.partial, true);

    const prisma = {
        bankStatementLine: {
            findFirst: async ({ where }) => {
                assert.deepEqual(where, {
                    id: "line-1",
                    companyId: "company-1",
                });
                return {
                    id: "line-1",
                    companyId: "company-1",
                    entryDate: new Date("2026-06-01T00:00:00.000Z"),
                    amountCents: 1000,
                    reference: "FT-1",
                };
            },
        },
        receipt: {
            findMany: async ({ take }) => {
                assert.equal(take, 2);
                return [
                    {
                        id: "receipt-1",
                        amountCents: 1000,
                        receivedAt: new Date("2026-06-01T00:00:00.000Z"),
                        reference: "FT-1",
                    },
                    {
                        id: "receipt-2",
                        amountCents: 1000,
                        receivedAt: new Date("2026-06-02T00:00:00.000Z"),
                        reference: "FT-2",
                    },
                ];
            },
        },
    };

    const result = await suggestReconciliations(prisma, {
        companyId: "company-1",
        input: { statementLineId: "line-1", candidateLimit: 1 },
    });

    assert.equal(result.status, "partial");
    assert.equal(result.suggestions.length, 1);
    assert.equal(result.suggestions[0].targetType, "RECEIPT");
    assert.equal("confirmedAt" in result.suggestions[0], false);
});

test("BK-MF6-04: FIFO falha cedo sem stock e mede cálculo válido", async () => {
    assert.throws(() => assertEnoughFifoStock(5, 4), {
        code: "INSUFFICIENT_FIFO_LAYERS",
    });

    const measured = await measureFifoCost(async () => ({
        totalCostCents: 750,
        consumptions: [],
    }));

    assert.equal(measured.result.totalCostCents, 750);
    assert.equal(measured.budgetMs, 1000);
});

test("BK-MF6-05/BK-MF6-08: transporte seguro e origem confiável bloqueiam produção insegura", () => {
    const insecure = createResponse();
    let nextCalls = 0;

    enforceHttps({ isProduction: true })(
        { secure: false, headers: { "x-forwarded-proto": "http" } },
        insecure,
        () => {
            nextCalls += 1;
        },
    );
    assert.equal(insecure.statusCode, 403);
    assert.equal(insecure.payload.error, "HTTPS_REQUIRED");

    const hsts = createResponse();
    applyStrictTransportSecurity({ isProduction: true })({}, hsts, () => {
        nextCalls += 1;
    });
    assert.match(hsts.headers["Strict-Transport-Security"], /includeSubDomains/);

    const origin = createResponse();
    requireTrustedOrigin({
        appBaseUrl: "https://opsa.example.test",
        isProduction: true,
    })(
        { method: "POST", headers: { origin: "https://evil.example.test" } },
        origin,
        () => {
            nextCalls += 1;
        },
    );
    assert.equal(origin.statusCode, 403);
    assert.equal(escapeHtml("<script>"), "&lt;script&gt;");
});

test("BK-MF6-06/BK-MF6-07/BK-MF6-09: bcrypt, cookies e ambiente seguem contrato", async () => {
    assert.equal(BCRYPT_ROUNDS >= 12, true);
    const hash = await hashPassword("Password-Forte-123!");
    assert.equal(await verifyPassword("Password-Forte-123!", hash), true);
    assert.equal(hash.includes("Password-Forte-123!"), false);

    assert.equal(buildSessionCookieOptions(true).httpOnly, true);
    assert.equal(buildSessionCookieOptions(true).secure, true);
    assert.equal(buildSessionCookieOptions(true).sameSite, "lax");

    assert.throws(
        () =>
            loadApiEnv({
                NODE_ENV: "production",
                APP_BASE_URL: "http://opsa.example.test",
                DATABASE_URL: "postgresql://x:y@localhost:5432/opsa",
            }),
        /HTTPS/,
    );
});

test("BK-MF6-10: auditoria sensível exige ação declarada e detalhes mínimos", async () => {
    const prisma = {
        auditLog: {
            create: async ({ data }) => ({ id: "audit-1", ...data }),
        },
    };

    const log = await recordSensitiveAudit(prisma, {
        companyId: "company-1",
        userId: "user-1",
        action: "document.issue",
        entity: "SaleDocument",
        entityId: "sale-1",
        details: { result: "success" },
    });

    assert.equal(log.action, "document.issue");
    assert.throws(
        () =>
            recordSensitiveAudit(prisma, {
                companyId: "company-1",
                userId: "user-1",
                action: "document.issue",
                entity: "SaleDocument",
                entityId: "sale-1",
                details: { token: "secret" },
            }),
        /Detalhe sensivel proibido/,
    );
});
