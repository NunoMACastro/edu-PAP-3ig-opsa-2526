/**
 * @file Verificador read-only dos datasets demo e load da OPSA.
 */

import { access } from "node:fs/promises";
import { createClient } from "redis";
import { buildSmtpEmailProvider } from "../../src/modules/notifications/smtpEmailProvider.js";
import { DEMO_NAMESPACE, LOAD_NAMESPACE, stableChecksum, utcDate } from "./config.js";

const COMPANY_MODELS = Object.freeze([
    "companySubscription", "companyMembership", "companyInvitation", "companyProfile",
    "account", "fiscalPeriod", "customer", "supplier", "item", "vatRate",
    "numberSequence", "saleDocument", "receipt", "journalEntry", "journalEntryRevision",
    "purchaseDocument", "payment", "auditLog", "retentionHold", "warehouse",
    "purchaseApprovalHistory", "stockBalance", "stockMovement", "stockCostLayer",
    "stockCostConsumption", "inventoryCount", "stockAlertSetting", "journalAttachment",
    "vatMapRun", "treasuryAccount", "treasuryBalanceSnapshot", "bankStatementImport",
    "bankStatementLine", "bankReconciliationSuggestion", "cashflowForecastRun",
    "businessImportRun", "saftExportRun", "operationalReportRun", "executiveKpiRun",
    "aiInsight", "aiActionSuggestion", "aiQuestionRun", "companyAiSettings",
    "aiUserConsent", "aiChatSession", "aiUsageEvent", "aiRuleSetting",
    "aiAnalysisRun", "aiDeletionAudit", "smartAlert", "reminder", "operationalTask",
    "inAppNotification", "alertPreference", "integrationLog",
]);

function assertion(condition, code, message, details = undefined) {
    if (!condition) {
        const error = new Error(message);
        error.code = code;
        error.details = details;
        throw error;
    }
}

async function findNamespaceCompanies(prisma, namespace) {
    const markers = await prisma.integrationLog.findMany({
        where: { integrationType: "SEED_NAMESPACE", sourceId: namespace },
        include: { company: true },
        orderBy: { createdAt: "asc" },
    });
    assertion(markers.length > 0, "SEED_NAMESPACE_MISSING", `Nao existe dataset ${namespace}.`);
    assertion(
        markers.every((marker) => marker.status === "IMPORTED"),
        "SEED_NAMESPACE_INCOMPLETE",
        `O dataset ${namespace} contem marcadores incompletos.`,
    );
    return markers;
}

async function verifyJournals(prisma, companyId) {
    const journals = await prisma.journalEntry.findMany({
        where: { companyId },
        include: { lines: true },
    });
    for (const journal of journals) {
        const debit = journal.lines.reduce((sum, line) => sum + line.debitCents, 0);
        const credit = journal.lines.reduce((sum, line) => sum + line.creditCents, 0);
        assertion(debit === credit, "UNBALANCED_JOURNAL", "Lancamento contabilistico desequilibrado.", {
            journalEntryId: journal.id,
            debit,
            credit,
        });
    }
    return journals.length;
}

async function verifyDocumentInvariants(prisma, companyId) {
    const [sales, purchases] = await Promise.all([
        prisma.saleDocument.findMany({
            where: { companyId },
            include: { receipts: true, lines: { include: { item: true } } },
        }),
        prisma.purchaseDocument.findMany({
            where: { companyId },
            include: { payments: true, lines: { include: { item: true } } },
        }),
    ]);
    for (const sale of sales) {
        assertion(
            sale.status !== "DRAFT" || sale.number === null,
            "DRAFT_SALE_HAS_NUMBER",
            "Uma venda DRAFT nao pode ter numero definitivo.",
            { saleDocumentId: sale.id },
        );
        const paid = sale.receipts.reduce((sum, receipt) => sum + receipt.amountCents, 0);
        assertion(paid <= sale.totalCents, "SALE_OVERPAID", "Recebimentos excedem a venda.", { saleDocumentId: sale.id });
        assertion(sale.amountPaidCents <= sale.totalCents, "SALE_BALANCE_INVALID", "Saldo pago da venda e invalido.");
        if (sale.kind !== "INVOICE_RECEIPT") {
            assertion(paid === sale.amountPaidCents, "SALE_RECEIPT_BALANCE_MISMATCH", "Saldo pago da venda nao corresponde aos recebimentos.");
        }
        assertion(
            !sale.lines.some((line) => line.item.type === "PRODUCT") || Boolean(sale.warehouseId),
            "SALE_PRODUCT_WAREHOUSE_MISSING",
            "Uma venda com produtos não identifica o armazém da demonstração.",
            { saleDocumentId: sale.id },
        );
    }
    for (const purchase of purchases) {
        const paid = purchase.payments.reduce((sum, payment) => sum + payment.amountCents, 0);
        assertion(paid <= purchase.totalCents, "PURCHASE_OVERPAID", "Pagamentos excedem a compra.", { purchaseDocumentId: purchase.id });
        assertion(purchase.amountPaidCents <= purchase.totalCents, "PURCHASE_BALANCE_INVALID", "Saldo pago da compra e invalido.");
        assertion(paid === purchase.amountPaidCents, "PURCHASE_PAYMENT_BALANCE_MISMATCH", "Saldo pago da compra nao corresponde aos pagamentos.");
        assertion(
            !purchase.lines.some((line) => line.item.type === "PRODUCT") ||
                Boolean(purchase.warehouseId),
            "PURCHASE_PRODUCT_WAREHOUSE_MISSING",
            "Uma compra com produtos não identifica o armazém da demonstração.",
            { purchaseDocumentId: purchase.id },
        );
    }
    return { sales: sales.length, purchases: purchases.length };
}

async function verifyStockBalances(prisma, companyId) {
    const [movements, balances, layers] = await Promise.all([
        prisma.stockMovement.findMany({ where: { companyId } }),
        prisma.stockBalance.findMany({ where: { companyId } }),
        prisma.stockCostLayer.findMany({ where: { companyId } }),
    ]);
    const expected = new Map();
    const add = (itemId, warehouseId, quantity) => {
        const key = `${itemId}:${warehouseId}`;
        expected.set(key, (expected.get(key) ?? 0) + Number(quantity));
    };
    for (const movement of movements) {
        if (movement.type === "ENTRY" || movement.type === "RETURN") {
            add(movement.itemId, movement.toWarehouseId, movement.quantity);
        } else if (movement.type === "EXIT") {
            add(movement.itemId, movement.fromWarehouseId, -Number(movement.quantity));
        } else if (movement.type === "TRANSFER") {
            add(movement.itemId, movement.fromWarehouseId, -Number(movement.quantity));
            add(movement.itemId, movement.toWarehouseId, movement.quantity);
        } else if (movement.quantity > 0) {
            add(movement.itemId, movement.toWarehouseId, movement.quantity);
        } else {
            add(movement.itemId, movement.fromWarehouseId, movement.quantity);
        }
    }
    for (const balance of balances) {
        const key = `${balance.itemId}:${balance.warehouseId}`;
        assertion(
            Math.abs(Number(balance.quantity) - (expected.get(key) ?? 0)) < 0.0001,
            "STOCK_BALANCE_MISMATCH",
            "StockBalance nao corresponde aos movimentos persistidos.",
            { key, stored: Number(balance.quantity), expected: expected.get(key) ?? 0 },
        );
        expected.delete(key);
    }
    assertion(
        [...expected.values()].every((quantity) => Math.abs(quantity) < 0.0001),
        "STOCK_BALANCE_MISSING",
        "Existem movimentos sem StockBalance correspondente.",
    );
    const fifoRemaining = new Map();
    for (const layer of layers) {
        const quantity = Number(layer.quantity);
        const remaining = Number(layer.remainingQuantity);
        assertion(
            remaining >= 0 && remaining <= quantity,
            "FIFO_LAYER_INVALID",
            "Camada FIFO possui quantidade remanescente invalida.",
            { layerId: layer.id, quantity, remaining },
        );
        const key = `${layer.itemId}:${layer.warehouseId}`;
        fifoRemaining.set(key, (fifoRemaining.get(key) ?? 0) + remaining);
    }
    for (const balance of balances) {
        const key = `${balance.itemId}:${balance.warehouseId}`;
        assertion(
            Math.abs(Number(balance.quantity) - (fifoRemaining.get(key) ?? 0)) < 0.0001,
            "FIFO_BALANCE_MISMATCH",
            "StockBalance nao corresponde as camadas FIFO remanescentes.",
            { key, balance: Number(balance.quantity), fifo: fifoRemaining.get(key) ?? 0 },
        );
        fifoRemaining.delete(key);
    }
    assertion(
        [...fifoRemaining.values()].every((quantity) => Math.abs(quantity) < 0.0001),
        "FIFO_BALANCE_MISSING",
        "Existem camadas FIFO sem StockBalance correspondente.",
    );
    return { movements: movements.length, balances: balances.length, layers: layers.length };
}

async function verifyFiscalAndAi(prisma, companyId) {
    const [closedPeriods, openPeriods, insights, profile] = await Promise.all([
        prisma.fiscalPeriod.count({ where: { companyId, status: "CLOSED" } }),
        prisma.fiscalPeriod.count({ where: { companyId, status: "OPEN" } }),
        prisma.aiInsight.findMany({ where: { companyId } }),
        prisma.companyProfile.findUnique({ where: { companyId } }),
    ]);
    assertion(openPeriods > 0, "OPEN_FISCAL_PERIOD_MISSING", "Nao existe periodo fiscal aberto.");
    assertion(
        ["C", "I"].includes(profile?.saftTaxAccountingBasis),
        "SAFT_ACCOUNTING_BASIS_UNSUPPORTED",
        "O perfil demo não usa uma base contabilística suportada pelo gerador SAF-T.",
    );
    for (const insight of insights) {
        assertion(
            Boolean(insight.explanation?.trim() && insight.sourceType?.trim() && insight.sourceId?.trim() && insight.sourceLabel?.trim()),
            "AI_EXPLAINABILITY_MISSING",
            "Insight sem explicacao ou fonte rastreavel.",
            { insightId: insight.id },
        );
    }
    return { closedPeriods, openPeriods, explainedInsights: insights.length };
}

async function verifyAttachment(prisma, companyId, objectStorage) {
    const attachment = await prisma.journalAttachment.findFirst({
        where: { companyId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
    });
    assertion(attachment, "ATTACHMENT_MISSING", "O perfil demo nao tem anexo contabilistico real.");
    assertion(Boolean(attachment.sha256), "ATTACHMENT_HASH_MISSING", "O anexo demo nao tem SHA-256.");
    const head = await objectStorage.headObject(attachment.storageKey);
    assertion(head?.contentLength === attachment.sizeBytes, "ATTACHMENT_SIZE_MISMATCH", "Tamanho do objeto e metadata diferem.");
    assertion(head?.contentType === attachment.mimeType, "ATTACHMENT_MIME_MISMATCH", "MIME do objeto e metadata diferem.");
    assertion(head?.metadata?.sha256 === attachment.sha256, "ATTACHMENT_HASH_MISMATCH", "Hash do objeto e metadata diferem.");
    return attachment.id;
}

async function modelCoverage(prisma, companyIds, userIds) {
    const coverage = {
        User: await prisma.user.count({ where: { id: { in: userIds } } }),
        Session: await prisma.session.count({ where: { userId: { in: userIds } } }),
        PasswordResetToken: await prisma.passwordResetToken.count({ where: { userId: { in: userIds } } }),
        Company: companyIds.length,
        EmailOutbox: await prisma.emailOutbox.count({ where: { dedupeKey: { startsWith: "demo:" } } }),
        SecurityAuditEvent: await prisma.securityAuditEvent.count({ where: { actorUserId: { in: userIds } } }),
        WarehouseLocation: await prisma.warehouseLocation.count({ where: { warehouse: { companyId: { in: companyIds } } } }),
        SaleDocumentLine: await prisma.saleDocumentLine.count({ where: { saleDocument: { companyId: { in: companyIds } } } }),
        JournalEntryLine: await prisma.journalEntryLine.count({ where: { journalEntry: { companyId: { in: companyIds } } } }),
        PurchaseDocumentLine: await prisma.purchaseDocumentLine.count({ where: { purchaseDocument: { companyId: { in: companyIds } } } }),
        InventoryCountLine: await prisma.inventoryCountLine.count({ where: { inventoryCount: { companyId: { in: companyIds } } } }),
        AiChatMessage: await prisma.aiChatMessage.count({
            where: { session: { companyId: { in: companyIds } } },
        }),
    };
    for (const delegateName of COMPANY_MODELS) {
        const modelName = delegateName[0].toUpperCase() + delegateName.slice(1);
        coverage[modelName] = await prisma[delegateName].count({ where: { companyId: { in: companyIds } } });
    }
    return coverage;
}

async function probeRedis() {
    if (!process.env.REDIS_URL) return "SKIPPED_EXTERNAL_PREREQUISITE";
    const client = createClient({
        url: process.env.REDIS_URL,
        socket: { connectTimeout: 3_000, reconnectStrategy: false },
    });
    client.on("error", () => undefined);
    try {
        await client.connect();
        await client.ping();
        return "PASS";
    } catch {
        return "FAIL_EXTERNAL_PREREQUISITE";
    } finally {
        if (client.isOpen) client.destroy();
    }
}

async function probeSmtp() {
    if (!process.env.SMTP_HOST) return "SKIPPED_EXTERNAL_PREREQUISITE";
    const provider = buildSmtpEmailProvider({
        host: process.env.SMTP_HOST,
        port: Number.parseInt(process.env.SMTP_PORT ?? "1025", 10),
        secure: process.env.SMTP_SECURE === "true",
        requireTls: process.env.SMTP_REQUIRE_TLS === "true",
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.EMAIL_FROM ?? "OPSA <no-reply@opsa.local>",
    });
    try {
        const timeout = new Promise((_, reject) => {
            const timer = setTimeout(() => reject(new Error("SMTP probe timeout")), 3_000);
            timer.unref?.();
        });
        await Promise.race([provider.verify(), timeout]);
        return "PASS";
    } catch {
        return "FAIL_EXTERNAL_PREREQUISITE";
    } finally {
        provider.close();
    }
}

async function externalGates(prisma, companyId) {
    let saft = "SKIPPED_EXTERNAL_PREREQUISITE";
    const saftRuns = await prisma.saftExportRun.count({ where: { companyId } });
    if (saftRuns > 0) saft = "PASS";
    else if (process.env.SAFT_EXPORT_ENABLED === "true" && process.env.SAFT_XSD_PATH) {
        try {
            await access(process.env.SAFT_XSD_PATH);
            saft = "SKIPPED_EXTERNAL_PREREQUISITE";
        } catch {
            saft = "SKIPPED_EXTERNAL_PREREQUISITE";
        }
    }
    const [smtp, redis] = await Promise.all([probeSmtp(), probeRedis()]);
    return {
        objectStorage: "PASS",
        saft,
        smtp,
        redis,
    };
}

/**
 * Audita sem writes o perfil indicado.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ namespace: string, config: object, objectStorage?: object }} input - Contexto da verificacao.
 * @returns {Promise<object>} Relatorio read-only.
 */
export async function verifySeedProfile(prisma, input) {
    assertion([DEMO_NAMESPACE, LOAD_NAMESPACE].includes(input.namespace), "INVALID_NAMESPACE", "Namespace de verificacao invalido.");
    const markers = await findNamespaceCompanies(prisma, input.namespace);
    const companyIds = markers.map((marker) => marker.companyId);
    const memberships = await prisma.companyMembership.findMany({
        where: { companyId: { in: companyIds } },
        select: { userId: true },
    });
    const userIds = [...new Set(memberships.map((membership) => membership.userId))];
    const main = markers.find((marker) => marker.company.nif === "510100001") ?? markers[0];
    const documents = await verifyDocumentInvariants(prisma, main.companyId);
    const journals = await verifyJournals(prisma, main.companyId);
    const stock = await verifyStockBalances(prisma, main.companyId);
    const fiscalAndAi = await verifyFiscalAndAi(prisma, main.companyId);
    const coverage = await modelCoverage(prisma, companyIds, userIds);
    const currentFrom = utcDate(`${input.config.anchorDate.slice(0, 7)}-01`);
    const currentTo = utcDate(input.config.anchorDate);
    const currentReports = await Promise.all([
        prisma.vatMapRun.count({ where: { companyId: main.companyId, fromDate: currentFrom, toDate: currentTo } }),
        prisma.cashflowForecastRun.count({ where: { companyId: main.companyId, fromDate: currentFrom, toDate: currentTo } }),
        prisma.operationalReportRun.count({ where: { companyId: main.companyId, fromDate: currentFrom, toDate: currentTo } }),
        prisma.executiveKpiRun.count({ where: { companyId: main.companyId, fromDate: currentFrom, toDate: currentTo } }),
    ]);
    assertion(currentReports.every((count) => count > 0), "CURRENT_REPORTS_MISSING", "Faltam runs analiticos para o intervalo predefinido atual.");

    let attachmentId = null;
    if (input.namespace === DEMO_NAMESPACE) {
        assertion(fiscalAndAi.closedPeriods > 0, "CLOSED_FISCAL_PERIOD_MISSING", "O perfil demo nao tem periodo fiscal fechado.");
        assertion(coverage.Customer > 50, "PAGINATION_CUSTOMERS_MISSING", "O perfil demo nao exercita paginacao de clientes.");
        assertion(coverage.Item > 50, "PAGINATION_ITEMS_MISSING", "O perfil demo nao exercita paginacao de artigos.");
        assertion(coverage.AiInsight > 0 && coverage.SmartAlert > 0, "AI_DATA_MISSING", "Faltam insights ou alertas IA.");
        assertion(
            coverage.BankReconciliationSuggestion > 0,
            "RECONCILIATION_DATA_MISSING",
            "O perfil demo não contém uma sugestão de reconciliação demonstrável.",
        );
        attachmentId = await verifyAttachment(prisma, main.companyId, input.objectStorage);
    }
    const gates = await externalGates(prisma, main.companyId);
    const summary = {
        namespace: input.namespace,
        anchorDate: input.config.anchorDate,
        companyIds,
        documents,
        journals,
        stock,
        fiscalAndAi,
        attachmentId,
        coverage,
        gates,
    };
    return { ...summary, checksum: stableChecksum(summary) };
}
