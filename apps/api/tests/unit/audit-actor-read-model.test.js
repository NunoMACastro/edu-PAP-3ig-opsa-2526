/**
 * @file Contratos do ator e das referências legíveis na auditoria consultável.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { listAuditLogs } from "../../src/modules/audit/auditLogService.js";

const saleId = "11111111-1111-4111-8111-111111111111";
const purchaseId = "22222222-2222-4222-8222-222222222222";
const journalId = "33333333-3333-4333-8333-333333333333";

test("inclui ator e resolve documentos/journals em batch company-scoped", async () => {
    const calls = [];
    const createdAt = new Date("2026-07-14T12:00:00.000Z");
    const prisma = {
        auditLog: {
            findMany: async (query) => {
                calls.push(["audit", query]);
                return [
                    {
                        id: "log-sale",
                        userId: "user-1",
                        action: "SALE_DOCUMENT_POSTED",
                        entity: "JournalEntry",
                        entityId: journalId,
                        details: { saleDocumentId: saleId, token: "não expor" },
                        createdAt,
                        user: { id: "user-1", name: "Aluno PAP", email: "aluno@opsa.demo" },
                    },
                    {
                        id: "log-purchase",
                        userId: "user-2",
                        action: "PURCHASE_DOCUMENT_CREATED",
                        entity: "PurchaseDocument",
                        entityId: purchaseId,
                        details: null,
                        createdAt: new Date("2026-07-14T11:00:00.000Z"),
                        user: { id: "user-2", name: null, email: "professor@opsa.demo" },
                    },
                ];
            },
        },
        saleDocument: {
            findMany: async (query) => {
                calls.push(["sales", query]);
                return [{ id: saleId, number: "FT 2026/7" }];
            },
        },
        purchaseDocument: {
            findMany: async (query) => {
                calls.push(["purchases", query]);
                return [{ id: purchaseId, supplierNumber: "FC PAP/7" }];
            },
        },
        journalEntry: {
            findMany: async (query) => {
                calls.push(["journals", query]);
                return [{ id: journalId, description: "Venda FT 2026/7" }];
            },
        },
    };

    const page = await listAuditLogs(prisma, { companyId: "company-1", limit: 10 });

    assert.deepEqual(page.items[0].actor, {
        id: "user-1",
        name: "Aluno PAP",
        email: "aluno@opsa.demo",
    });
    assert.deepEqual(page.items[0].reference, {
        type: "SALE",
        id: saleId,
        label: "FT 2026/7",
    });
    assert.equal(page.items[0].details.token, "[redigido]");
    assert.equal(page.items[1].reference.label, "FC PAP/7");
    for (const [kind, query] of calls.filter(([kind]) => kind !== "audit")) {
        assert.equal(query.where.companyId, "company-1", `${kind} deve usar companyId`);
    }
    assert.deepEqual(calls[0][1].select.user.select, { id: true, name: true, email: true });
});

test("não resolve referência de outra empresa nem expõe detalhes como label", async () => {
    const prisma = {
        auditLog: {
            findMany: async () => [{
                id: "log-cross-company",
                userId: "user-1",
                action: "SALE_DOCUMENT_CREATED",
                entity: "SaleDocument",
                entityId: saleId,
                details: { password: "segredo" },
                createdAt: new Date("2026-07-14T12:00:00.000Z"),
                user: { id: "user-1", name: "Aluno", email: "aluno@opsa.demo" },
            }],
        },
        saleDocument: { findMany: async ({ where }) => {
            assert.equal(where.companyId, "company-1");
            return [];
        } },
    };

    const page = await listAuditLogs(prisma, { companyId: "company-1" });
    assert.deepEqual(page.items[0].reference, {
        type: "OTHER",
        id: saleId,
        label: "Documento de venda",
    });
    assert.equal(page.items[0].details.password, "[redigido]");
});
