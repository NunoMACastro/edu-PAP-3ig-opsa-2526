/**
 * @file Smoke unitario do BK-MF6-10.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { recordSensitiveAudit } from "../src/modules/audit/auditLogService.js";

const created = [];
const prisma = {
    auditLog: {
        /**
         * Simula `prisma.auditLog.create` e guarda o payload para inspeção do smoke.
         * O double evita dependência de base de dados e mantém o teste determinístico.
         *
         * @param {{ data: object }} input - Payload recebido pela camada Prisma.
         * @returns {Promise<object>} Registo de auditoria simulado.
         */
        create: async ({ data }) => {
            created.push(data);
            return { id: "audit-1", ...data };
        },
    },
};

const log = await recordSensitiveAudit(prisma, {
    companyId: "company-1",
    userId: "user-1",
    action: "document.issue",
    entity: "SaleDocument",
    entityId: "sale-1",
    details: { result: "success", totalCents: 1000 },
});

assert.equal(log.action, "document.issue");
assert.equal(created[0].details.totalCents, 1000);

assert.throws(
    () =>
        recordSensitiveAudit(prisma, {
            companyId: "company-1",
            userId: "user-1",
            action: "undocumented.action",
            entity: "X",
            entityId: "x-1",
        }),
    /Acao sensivel nao declarada/,
);

assert.throws(
    () =>
        recordSensitiveAudit(prisma, {
            companyId: "company-1",
            userId: "user-1",
            action: "document.issue",
            entity: "SaleDocument",
            entityId: "sale-1",
            details: { token: "nao-pode" },
        }),
    /Detalhe sensivel proibido/,
);

assert.throws(
    () =>
        recordSensitiveAudit(prisma, {
            companyId: "company-1",
            userId: "user-1",
            action: "document.issue",
            entity: "SaleDocument",
            entityId: "sale-1",
            details: { rawPayload: { lines: [] } },
        }),
    /Detalhe sensivel proibido/,
);

const auditService = readFileSync(
    new URL("../src/modules/audit/auditLogService.js", import.meta.url),
    "utf8",
);
const companyUserService = readFileSync(
    new URL("../src/modules/company-users/companyUserService.js", import.meta.url),
    "utf8",
);
const fiscalPeriodService = readFileSync(
    new URL(
        "../src/modules/fiscal-periods/fiscalPeriodService.js",
        import.meta.url,
    ),
    "utf8",
);
const saleDocumentService = readFileSync(
    new URL("../src/modules/sales/saleDocumentService.js", import.meta.url),
    "utf8",
);

for (const action of [
    "permissions.update",
    "fiscalPeriod.close",
    "document.issue",
]) {
    assert.match(auditService, new RegExp(`"${action}"`));
}

for (const [name, source, action, helper] of [
    ["company-users", companyUserService, "permissions.update", /recordSensitiveAudit/],
    [
        "fiscal-periods",
        fiscalPeriodService,
        "fiscalPeriod.close",
        /recordRetainedSensitiveAudit/,
    ],
    ["sales", saleDocumentService, "document.issue", /recordRetainedSensitiveAudit/],
]) {
    assert.match(source, helper, `${name} sem helper sensivel`);
    assert.match(source, new RegExp(`action: "${action}"`), `${name} sem ${action}`);
}

console.info("MF6 sensitive audit gate contract OK");
