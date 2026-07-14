/**
 * @file Análise determinística e read-only de uma venda ou compra concreta.
 *
 * O motor usa apenas dados da empresa ativa, distingue projeções pré-posting de
 * saldos já movimentados e devolve factos reproduzíveis. O score representa
 * pontos de regras OPSA, nunca uma probabilidade de perda ou incumprimento.
 */

import { httpError } from "../../lib/httpErrors.js";
import { recordAuditLog } from "../audit/auditLogService.js";
import { assertAiRecommendationOnly } from "./aiGovernancePolicy.js";

const DAY_MS = 86_400_000;
const HISTORY_DAYS = 90;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const TRANSACTION_RISK_MODEL_VERSION = "OPSA-TX-RISK-1.0";
export const TRANSACTION_ANALYSIS_GUARDRAIL = "Recomendação informativa; nenhuma ação foi executada automaticamente.";

const DOCUMENT_CONFIG = Object.freeze({
    SALE: Object.freeze({
        model: "saleDocument",
        relation: "customer",
        relationId: "customerId",
        numberField: "number",
        journalSource: "SALE",
        movementSource: "SALE_DOCUMENT_LINE",
        activeStatuses: ["ISSUED", "SETTLED"],
        creditKind: "CREDIT_NOTE",
        notFoundCode: "SALE_DOCUMENT_NOT_FOUND",
        notFoundMessage: "Documento de venda não encontrado",
    }),
    PURCHASE: Object.freeze({
        model: "purchaseDocument",
        relation: "supplier",
        relationId: "supplierId",
        numberField: "supplierNumber",
        journalSource: "PURCHASE",
        movementSource: "PURCHASE_DOCUMENT_LINE",
        activeStatuses: ["APPROVED", "POSTED", "PAID"],
        creditKind: "SUPPLIER_CREDIT_NOTE",
        notFoundCode: "PURCHASE_DOCUMENT_NOT_FOUND",
        notFoundMessage: "Documento de compra não encontrado",
    }),
});

const FACTOR_PRIORITY = Object.freeze({
    WORKFLOW_REJECTED: 0,
    DATA_INTEGRITY_RISK: 1,
    INSUFFICIENT_STOCK: 2,
    LOW_STOCK_AFTER_SALE: 3,
    LOW_OR_NEGATIVE_MARGIN: 4,
    CUSTOMER_OVERDUE_RECEIVABLES: 5,
    CUSTOMER_CONCENTRATION: 6,
    LONG_PAYMENT_TERM: 7,
    OVERSTOCK_RISK: 8,
    SLOW_MOVING_ITEM: 9,
    PURCHASE_COST_INCREASE: 10,
    SUPPLIER_PAYABLE_PRESSURE: 11,
    NEGATIVE_CASHFLOW_PRESSURE: 12,
    SUPPLIER_CONCENTRATION: 13,
    INSUFFICIENT_HISTORY: 99,
});

function roundQuantity(value) {
    return Number(Number(value ?? 0).toFixed(3));
}

function quantityText(value) {
    return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 3 }).format(Number(value));
}

function euroText(cents) {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Number(cents) / 100);
}

function percentText(bps) {
    return new Intl.NumberFormat("pt-PT", { style: "percent", maximumFractionDigits: 1 }).format(Number(bps) / 10_000);
}

function daysBetween(from, to) {
    if (!from || !to) return null;
    return Math.max(0, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS));
}

function riskBand(score) {
    if (score >= 75) return { riskLevel: "CRITICAL", recommendation: "DO_NOT_PROCEED_WITHOUT_REVIEW" };
    if (score >= 50) return { riskLevel: "HIGH", recommendation: "REVIEW_BEFORE_PROCEEDING" };
    if (score >= 25) return { riskLevel: "MEDIUM", recommendation: "PROCEED_WITH_CAUTION" };
    return { riskLevel: "LOW", recommendation: "PROCEED" };
}

function severityRank(severity) {
    return { INFO: 1, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[severity] ?? 0;
}

/**
 * Valida o body público sem confiar em factos, score ou empresa enviados pelo browser.
 *
 * @param {unknown} body - Corpo JSON recebido na rota.
 * @returns {{ documentType: "SALE" | "PURCHASE", documentId: string }} Referência mínima validada.
 */
export function parseTransactionAnalysisInput(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_AI_TRANSACTION_INPUT", "O pedido de análise deve ser um objeto JSON");
    }
    const unexpected = Object.keys(body).filter((key) => !["documentType", "documentId"].includes(key));
    if (unexpected.length > 0) {
        throw httpError(400, "INVALID_AI_TRANSACTION_INPUT", "A análise aceita apenas documentType e documentId", { unexpected });
    }
    const documentType = String(body.documentType ?? "").trim().toUpperCase();
    if (!DOCUMENT_CONFIG[documentType]) {
        throw httpError(400, "INVALID_AI_DOCUMENT_TYPE", "documentType deve ser SALE ou PURCHASE");
    }
    const documentId = String(body.documentId ?? "").trim();
    if (!UUID_PATTERN.test(documentId)) {
        throw httpError(400, "INVALID_AI_DOCUMENT_ID", "documentId deve ser um UUID válido");
    }
    return { documentType, documentId };
}

function groupProductLines(lines) {
    const groups = new Map();
    for (const line of lines.filter((entry) => entry.item?.type === "PRODUCT")) {
        const current = groups.get(line.itemId) ?? { item: line.item, quantity: 0, lines: [] };
        current.quantity = roundQuantity(current.quantity + Number(line.quantity));
        current.lines.push(line);
        groups.set(line.itemId, current);
    }
    return [...groups.values()];
}

function expectedStockEffect(documentType, document) {
    const credit = document.kind === DOCUMENT_CONFIG[documentType].creditKind;
    if (documentType === "SALE") return credit ? { type: "RETURN", deltaSign: 1, warehouseField: "toWarehouseId" } : { type: "EXIT", deltaSign: -1, warehouseField: "fromWarehouseId" };
    return credit ? { type: "EXIT", deltaSign: -1, warehouseField: "fromWarehouseId" } : { type: "ENTRY", deltaSign: 1, warehouseField: "toWarehouseId" };
}

function movementMatchesLine(movement, line, expected, warehouseId) {
    return movement.sourceId === line.id
        && movement.type === expected.type
        && movement[expected.warehouseField] === warehouseId
        && roundQuantity(movement.quantity) === roundQuantity(line.quantity);
}

function estimateFifoCost(layers, itemId, quantity) {
    let remaining = Number(quantity);
    let totalCostCents = 0;
    for (const layer of layers.filter((entry) => entry.itemId === itemId)) {
        if (remaining <= 0) break;
        const taken = Math.min(remaining, Number(layer.remainingQuantity));
        totalCostCents += Math.round(taken * layer.unitCostCents);
        remaining = roundQuantity(remaining - taken);
    }
    return remaining === 0 ? totalCostCents : null;
}

function outflowQuantity(movement, warehouseId) {
    if (movement.fromWarehouseId !== warehouseId) return 0;
    if (["EXIT", "TRANSFER"].includes(movement.type)) return Math.abs(Number(movement.quantity));
    if (movement.type === "ADJUSTMENT" && Number(movement.quantity) < 0) return Math.abs(Number(movement.quantity));
    return 0;
}

function coverageForItem(movements, itemId, warehouseId, now) {
    const relevant = movements.filter((entry) => entry.itemId === itemId && outflowQuantity(entry, warehouseId) > 0);
    if (relevant.length === 0) return { averageDailyOutflow: null, daysOfCover: null, observedDays: 0, outflowCount: 0, quality: "INSUFFICIENT_DATA" };
    const oldest = relevant.reduce((value, entry) => Math.min(value, new Date(entry.createdAt).getTime()), now.getTime());
    const observedDays = Math.max(1, Math.ceil((now.getTime() - oldest) / DAY_MS) + 1);
    const totalOutflow = relevant.reduce((sum, entry) => sum + outflowQuantity(entry, warehouseId), 0);
    return {
        averageDailyOutflow: totalOutflow / observedDays,
        daysOfCover: null,
        observedDays,
        outflowCount: relevant.length,
        quality: observedDays >= 14 && relevant.length >= 2 ? "SUFFICIENT" : "LIMITED",
    };
}

function addFactor(factors, candidate) {
    const current = factors.get(candidate.code);
    if (!current || candidate.points > current.points || severityRank(candidate.severity) > severityRank(current.severity)) {
        factors.set(candidate.code, candidate);
    }
}

function addFact(facts, metric, value, formattedValue, unit, sourceRef) {
    facts.push({ metric, value, formattedValue, unit, sourceRef });
}

function buildFutureActions(factors) {
    const codes = new Set(factors.map((factor) => factor.code));
    const actions = [];
    if (codes.has("WORKFLOW_REJECTED")) {
        assertAiRecommendationOnly({ actionType: "REVIEW_CASHFLOW" });
        actions.push("Manter o documento parado e submetê-lo a uma nova decisão autorizada de workflow.");
    }
    if (["DATA_INTEGRITY_RISK", "INSUFFICIENT_HISTORY"].some((code) => codes.has(code))) {
        assertAiRecommendationOnly({ actionType: "REVIEW_CASHFLOW" });
        actions.push("Confirmar os dados e o estado do documento antes de tomar uma decisão.");
    }
    if (["INSUFFICIENT_STOCK", "LOW_STOCK_AFTER_SALE", "OVERSTOCK_RISK", "SLOW_MOVING_ITEM"].some((code) => codes.has(code))) {
        assertAiRecommendationOnly({ actionType: "REVIEW_STOCK" });
        actions.push("Rever stock, rotação e necessidades reais no armazém indicado.");
    }
    if (["LOW_OR_NEGATIVE_MARGIN", "PURCHASE_COST_INCREASE"].some((code) => codes.has(code))) {
        assertAiRecommendationOnly({ actionType: "REVIEW_PRICING" });
        actions.push("Rever custos e preços com os responsáveis antes de prosseguir.");
    }
    if (["CUSTOMER_OVERDUE_RECEIVABLES", "CUSTOMER_CONCENTRATION", "LONG_PAYMENT_TERM"].some((code) => codes.has(code))) {
        assertAiRecommendationOnly({ actionType: "NEGOTIATE_CUSTOMER" });
        actions.push("Validar condições comerciais e recebimentos com revisão humana.");
    }
    if (["SUPPLIER_PAYABLE_PRESSURE", "NEGATIVE_CASHFLOW_PRESSURE", "SUPPLIER_CONCENTRATION"].some((code) => codes.has(code))) {
        assertAiRecommendationOnly({ actionType: "REVIEW_CASHFLOW" });
        actions.push("Rever vencimentos e liquidez disponível antes de assumir o compromisso.");
    }
    return actions.length ? [...new Set(actions)] : ["Confirmar os factos apresentados e manter a decisão sob responsabilidade humana."];
}

async function loadTransactionData(prisma, input, config, now) {
    const include = {
        [config.relation]: { select: { id: true, name: true } },
        warehouse: { select: { id: true, code: true, name: true } },
        lines: { include: { item: true, vatRate: true } },
    };
    const document = await prisma[config.model].findFirst({
        where: { id: input.documentId, companyId: input.companyId },
        include,
    });
    if (!document) throw httpError(404, config.notFoundCode, config.notFoundMessage);

    const productLines = document.lines.filter((line) => line.item?.type === "PRODUCT");
    const itemIds = [...new Set(productLines.map((line) => line.itemId))];
    const lineIds = productLines.map((line) => line.id);
    const historyFrom = new Date(now.getTime() - (HISTORY_DAYS - 1) * DAY_MS);
    const recentWhere = {
        companyId: input.companyId,
        status: { in: config.activeStatuses },
        kind: { not: config.creditKind },
        issuedAt: { gte: historyFrom, lte: now },
    };
    const counterpartyWhere = {
        companyId: input.companyId,
        [config.relationId]: document[config.relationId],
        status: { in: config.activeStatuses },
        kind: { not: config.creditKind },
    };
    const empty = Promise.resolve([]);
    const [journal, movements, balances, layers, settings, recentMovements, recentDocuments, counterpartyDocuments, treasuryAccounts] = await Promise.all([
        prisma.journalEntry.findFirst({ where: { companyId: input.companyId, source: config.journalSource, sourceId: document.id }, select: { id: true, createdAt: true } }),
        lineIds.length ? prisma.stockMovement.findMany({ where: { companyId: input.companyId, sourceType: config.movementSource, sourceId: { in: lineIds } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }) : empty,
        itemIds.length && document.warehouseId ? prisma.stockBalance.findMany({ where: { companyId: input.companyId, warehouseId: document.warehouseId, itemId: { in: itemIds } } }) : empty,
        input.documentType === "SALE" && itemIds.length && document.warehouseId ? prisma.stockCostLayer.findMany({ where: { companyId: input.companyId, warehouseId: document.warehouseId, itemId: { in: itemIds }, remainingQuantity: { gt: 0 } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }) : empty,
        itemIds.length && document.warehouseId ? prisma.stockAlertSetting.findMany({ where: { companyId: input.companyId, warehouseId: document.warehouseId, itemId: { in: itemIds } } }) : empty,
        itemIds.length && document.warehouseId ? prisma.stockMovement.findMany({ where: { companyId: input.companyId, itemId: { in: itemIds }, createdAt: { gte: historyFrom, lte: now }, OR: [{ fromWarehouseId: document.warehouseId }, { toWarehouseId: document.warehouseId }] }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }) : empty,
        prisma[config.model].findMany({ where: recentWhere, include: input.documentType === "PURCHASE" ? { lines: true } : undefined }),
        prisma[config.model].findMany({ where: counterpartyWhere }),
        input.documentType === "PURCHASE" ? prisma.treasuryAccount.findMany({ where: { companyId: input.companyId, isActive: true }, select: { currentBalanceCents: true } }) : empty,
    ]);
    return { document, productLines, journal, movements, balances, layers, settings, recentMovements, recentDocuments, counterpartyDocuments, treasuryAccounts, historyFrom };
}

function assessPosting(input, data, config) {
    const expected = expectedStockEffect(input.documentType, data.document);
    const posted = Boolean(data.document.postedAt || data.journal);
    const byLine = new Map(data.productLines.map((line) => [line.id, data.movements.filter((movement) => movement.sourceId === line.id)]));
    const exactLines = data.productLines.filter((line) => {
        const lineMovements = byLine.get(line.id) ?? [];
        return lineMovements.length === 1 && movementMatchesLine(lineMovements[0], line, expected, data.document.warehouseId);
    });
    const reasons = [];
    if (data.productLines.length > 0 && !data.document.warehouseId) reasons.push("Documento de produto sem armazém associado.");
    if (data.document.postedAt && !data.journal) reasons.push("O documento indica posting, mas o JournalEntry não foi encontrado.");
    if (!posted && data.movements.length > 0) reasons.push("Existem movimentos automáticos sem posting contabilístico confirmado.");
    if (posted && data.productLines.length > 0 && exactLines.length !== data.productLines.length) reasons.push("O posting não tem exatamente um movimento coerente por linha de produto.");
    if (data.movements.length !== exactLines.length) reasons.push("Foram encontrados movimentos automáticos duplicados ou incompatíveis.");
    return {
        posted,
        postingSource: data.document.postedAt ? "DOCUMENT_POSTED_AT" : data.journal ? "JOURNAL_ENTRY_FALLBACK" : "NONE",
        stockApplied: posted && data.productLines.length > 0 && exactLines.length === data.productLines.length && reasons.length === 0,
        movementCount: data.movements.length,
        expected,
        integrityReasons: [...new Set(reasons)],
    };
}

function assessStock(input, data, posting, factors, facts, limitations) {
    const balances = new Map(data.balances.map((entry) => [entry.itemId, Number(entry.quantity)]));
    const settings = new Map(data.settings.map((entry) => [entry.itemId, entry]));
    const stock = [];
    for (const group of groupProductLines(data.document.lines)) {
        const current = roundQuantity(balances.get(group.item.id) ?? 0);
        const projected = posting.integrityReasons.length > 0 || !data.document.warehouseId
            ? null
            : posting.stockApplied ? current : roundQuantity(current + posting.expected.deltaSign * group.quantity);
        const coverage = coverageForItem(data.recentMovements, group.item.id, data.document.warehouseId, input.now);
        coverage.daysOfCover = coverage.averageDailyOutflow && projected !== null
            ? Math.max(0, projected / coverage.averageDailyOutflow)
            : null;
        const setting = settings.get(group.item.id);
        const minimum = setting?.minQuantity == null ? null : Number(setting.minQuantity);
        const maximum = setting?.maxQuantity == null ? null : Number(setting.maxQuantity);
        const sourceRef = `stock:${group.item.id}:${data.document.warehouseId ?? "missing"}`;
        addFact(facts, `stock.${group.item.sku}.current`, current.toFixed(3), `${quantityText(current)} unidades`, "quantity", sourceRef);
        addFact(facts, `stock.${group.item.sku}.projected`, projected === null ? null : projected.toFixed(3), projected === null ? "Indisponível" : `${quantityText(projected)} unidades`, "quantity", sourceRef);
        if (coverage.daysOfCover !== null) addFact(facts, `stock.${group.item.sku}.daysOfCover`, Number(coverage.daysOfCover.toFixed(1)), `${quantityText(coverage.daysOfCover)} dias`, "days", sourceRef);

        if (projected !== null && projected < 0) addFactor(factors, { code: "INSUFFICIENT_STOCK", label: "Stock insuficiente", severity: "CRITICAL", points: 55, value: projected.toFixed(3), explanation: `${group.item.sku} ficaria com saldo negativo após a operação.`, sourceRef });
        if (input.documentType === "SALE" && projected !== null && projected >= 0 && ((minimum !== null && projected < minimum) || (coverage.daysOfCover !== null && coverage.daysOfCover < 14))) {
            addFactor(factors, { code: "LOW_STOCK_AFTER_SALE", label: "Stock projetado baixo", severity: "HIGH", points: 30, value: projected.toFixed(3), explanation: `${group.item.sku} fica abaixo do mínimo configurado ou de catorze dias de cobertura.`, sourceRef });
        }
        if (input.documentType === "PURCHASE" && projected !== null && ((maximum !== null && projected > maximum) || (coverage.daysOfCover !== null && coverage.daysOfCover > 180))) {
            addFactor(factors, { code: "OVERSTOCK_RISK", label: "Risco de excesso de stock", severity: "HIGH", points: 25, value: projected.toFixed(3), explanation: `${group.item.sku} ultrapassa o máximo configurado ou cento e oitenta dias de cobertura.`, sourceRef });
        }
        if (input.documentType === "PURCHASE" && coverage.outflowCount === 0 && current > 0) {
            addFactor(factors, { code: "SLOW_MOVING_ITEM", label: "Artigo com rotação insuficiente", severity: "MEDIUM", points: 15, value: current.toFixed(3), explanation: `${group.item.sku} não tem saídas observadas na janela analisada.`, sourceRef });
        }
        if (coverage.quality !== "SUFFICIENT") limitations.push(`Histórico de saídas limitado para ${group.item.sku}; a cobertura deve ser interpretada com prudência.`);
        stock.push({ itemId: group.item.id, sku: group.item.sku, name: group.item.name, quantity: group.quantity.toFixed(3), current: current.toFixed(3), projected: projected === null ? null : projected.toFixed(3), averageDailyOutflow: coverage.averageDailyOutflow === null ? null : coverage.averageDailyOutflow.toFixed(3), daysOfCover: coverage.daysOfCover === null ? null : Number(coverage.daysOfCover.toFixed(1)), historyQuality: coverage.quality });
    }
    return stock;
}

function assessSale(data, posting, factors, facts, limitations) {
    let costCents = 0;
    let completeCost = true;
    for (const line of data.document.lines) {
        if (line.item?.type === "SERVICE") {
            if (line.item.costCents > 0) costCents += line.item.costCents * Number(line.quantity);
            else { completeCost = false; limitations.push(`O serviço ${line.item.sku} não tem custo conhecido; a margem total não foi estimada.`); }
            continue;
        }
        const lineMovements = data.movements.filter((movement) => movement.sourceId === line.id);
        const postedCost = posting.stockApplied && lineMovements.length === 1 ? lineMovements[0].totalCostCents : null;
        const estimated = postedCost ?? estimateFifoCost(data.layers, line.itemId, Number(line.quantity));
        if (estimated !== null) costCents += estimated;
        else if (Number.isInteger(line.item.costCents)) { costCents += line.item.costCents * Number(line.quantity); limitations.push(`O custo de ${line.item.sku} usa o custo conhecido do artigo porque o FIFO disponível não cobre a quantidade.`); }
        else completeCost = false;
    }
    const marginCents = completeCost ? data.document.subtotalCents - costCents : null;
    const marginBps = marginCents !== null && data.document.subtotalCents > 0 ? Math.round(marginCents / data.document.subtotalCents * 10_000) : null;
    if (marginCents !== null) addFact(facts, "estimatedGrossMarginCents", marginCents, euroText(marginCents), "EUR", `document:${data.document.id}`);
    if (marginBps !== null) addFact(facts, "estimatedGrossMarginBps", marginBps, percentText(marginBps), "percent", `document:${data.document.id}`);
    if (marginBps !== null && marginBps < 1_000) addFactor(factors, { code: "LOW_OR_NEGATIVE_MARGIN", label: "Margem estimada baixa", severity: marginBps < 0 ? "CRITICAL" : "HIGH", points: marginBps < 0 ? 40 : 25, value: String(marginBps), explanation: `A margem bruta estimada é ${percentText(marginBps)} sobre o subtotal sem IVA.`, sourceRef: `document:${data.document.id}` });

    const open = data.counterpartyDocuments.reduce((sum, document) => sum + Math.max(0, document.totalCents - document.amountPaidCents), 0);
    const overdue = data.counterpartyDocuments.reduce((sum, document) => {
        const due = document.dueDate ?? document.issuedAt;
        return due < data.now && document.id !== data.document.id ? sum + Math.max(0, document.totalCents - document.amountPaidCents) : sum;
    }, 0);
    addFact(facts, "customerOpenReceivablesCents", open, euroText(open), "EUR", `customer-history:${data.document.customerId}`);
    addFact(facts, "customerOverdueReceivablesCents", overdue, euroText(overdue), "EUR", `customer-history:${data.document.customerId}`);
    if (overdue > 0) addFactor(factors, { code: "CUSTOMER_OVERDUE_RECEIVABLES", label: "Recebíveis vencidos do cliente", severity: overdue >= data.document.totalCents ? "HIGH" : "MEDIUM", points: overdue >= data.document.totalCents ? 30 : 20, value: String(overdue), explanation: `Existem ${euroText(overdue)} vencidos por receber deste cliente.`, sourceRef: `customer-history:${data.document.customerId}` });

    const totalRecent = data.recentDocuments.reduce((sum, document) => sum + document.totalCents, 0);
    const customerRecent = data.recentDocuments.filter((document) => document.customerId === data.document.customerId).reduce((sum, document) => sum + document.totalCents, 0);
    const concentrationBps = totalRecent ? Math.round(customerRecent / totalRecent * 10_000) : null;
    if (concentrationBps !== null) addFact(facts, "customerConcentrationBps", concentrationBps, percentText(concentrationBps), "percent", "sales-history:90-days");
    if (concentrationBps !== null && concentrationBps > 5_000) addFactor(factors, { code: "CUSTOMER_CONCENTRATION", label: "Concentração no cliente", severity: "MEDIUM", points: 20, value: String(concentrationBps), explanation: `O cliente representa ${percentText(concentrationBps)} das vendas observadas na janela.`, sourceRef: "sales-history:90-days" });
    const paymentTerm = daysBetween(data.document.issuedAt, data.document.dueDate);
    if (paymentTerm !== null) addFact(facts, "paymentTermDays", paymentTerm, `${paymentTerm} dias`, "days", `document:${data.document.id}`);
    if (paymentTerm !== null && paymentTerm > 60) addFactor(factors, { code: "LONG_PAYMENT_TERM", label: "Prazo de pagamento longo", severity: "MEDIUM", points: 15, value: String(paymentTerm), explanation: `O prazo de pagamento é de ${paymentTerm} dias.`, sourceRef: `document:${data.document.id}` });
    if (data.recentDocuments.length < 3) limitations.push("Existem menos de três vendas na janela de noventa dias; a concentração histórica é limitada.");
    return { estimatedCostCents: completeCost ? costCents : null, estimatedGrossMarginCents: marginCents, estimatedGrossMarginBps: marginBps, openReceivablesCents: open, overdueReceivablesCents: overdue, customerConcentrationBps: concentrationBps, paymentTermDays: paymentTerm };
}

function assessPurchase(data, factors, facts, limitations) {
    const open = data.counterpartyDocuments.reduce((sum, document) => sum + Math.max(0, document.totalCents - document.amountPaidCents), 0);
    const cash = data.treasuryAccounts.reduce((sum, account) => sum + account.currentBalanceCents, 0);
    const cashAfter = cash - Math.max(0, data.document.totalCents - data.document.amountPaidCents);
    addFact(facts, "supplierOpenPayablesCents", open, euroText(open), "EUR", `supplier-history:${data.document.supplierId}`);
    addFact(facts, "cashAfterPurchaseCents", cashAfter, euroText(cashAfter), "EUR", "treasury-current-balance");
    if (open > cash && open > 0) addFactor(factors, { code: "SUPPLIER_PAYABLE_PRESSURE", label: "Pressão de pagamentos ao fornecedor", severity: "HIGH", points: 25, value: String(open), explanation: `Os pagamentos em aberto ao fornecedor ultrapassam a tesouraria registada.`, sourceRef: `supplier-history:${data.document.supplierId}` });
    if (cashAfter < 0) addFactor(factors, { code: "NEGATIVE_CASHFLOW_PRESSURE", label: "Pressão de tesouraria", severity: "CRITICAL", points: 35, value: String(cashAfter), explanation: "O valor em aberto da compra é superior ao saldo atual das contas de tesouraria.", sourceRef: "treasury-current-balance" });

    const totalRecent = data.recentDocuments.reduce((sum, document) => sum + document.totalCents, 0);
    const supplierRecent = data.recentDocuments.filter((document) => document.supplierId === data.document.supplierId).reduce((sum, document) => sum + document.totalCents, 0);
    const concentrationBps = totalRecent ? Math.round(supplierRecent / totalRecent * 10_000) : null;
    if (concentrationBps !== null) addFact(facts, "supplierConcentrationBps", concentrationBps, percentText(concentrationBps), "percent", "purchase-history:90-days");
    if (concentrationBps !== null && concentrationBps > 5_000) addFactor(factors, { code: "SUPPLIER_CONCENTRATION", label: "Concentração no fornecedor", severity: "MEDIUM", points: 15, value: String(concentrationBps), explanation: `O fornecedor representa ${percentText(concentrationBps)} das compras observadas.`, sourceRef: "purchase-history:90-days" });

    for (const line of data.document.lines.filter((entry) => entry.item?.type === "PRODUCT")) {
        const history = data.recentDocuments
            .filter((document) => document.id !== data.document.id)
            .flatMap((document) => document.lines ?? [])
            .filter((entry) => entry.itemId === line.itemId && entry.quantity > 0);
        const units = history.reduce((sum, entry) => sum + Number(entry.quantity), 0);
        const average = units ? Math.round(history.reduce((sum, entry) => sum + entry.unitCostCents * Number(entry.quantity), 0) / units) : null;
        if (average !== null) {
            const increaseBps = average ? Math.round((line.unitCostCents - average) / average * 10_000) : null;
            addFact(facts, `purchaseCost.${line.item.sku}.changeBps`, increaseBps, increaseBps === null ? "Indisponível" : percentText(increaseBps), "percent", `purchase-history:${line.itemId}`);
            if (increaseBps !== null && increaseBps > 2_000) addFactor(factors, { code: "PURCHASE_COST_INCREASE", label: "Aumento do custo de compra", severity: "HIGH", points: 20, value: String(increaseBps), explanation: `${line.item.sku} custa ${percentText(increaseBps)} mais do que a média recente.`, sourceRef: `purchase-history:${line.itemId}` });
        } else limitations.push(`Sem histórico de custo suficiente para ${line.item.sku}.`);
    }
    if (data.recentDocuments.length < 3) limitations.push("Existem menos de três compras na janela de noventa dias; a concentração histórica é limitada.");
    return { openPayablesCents: open, currentTreasuryCents: cash, cashAfterPurchaseCents: cashAfter, supplierConcentrationBps: concentrationBps };
}

/**
 * Analisa uma transação concreta sem escrever em documentos, stock ou contabilidade.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma read-only para o domínio.
 * @param {{ companyId: string, documentType: "SALE" | "PURCHASE", documentId: string, now?: Date }} input - Contexto autenticado.
 * @returns {Promise<object>} Objeto estável de análise e explicabilidade.
 */
export async function analyzeTransaction(prisma, input) {
    const config = DOCUMENT_CONFIG[input.documentType];
    if (!input.companyId || !config || !UUID_PATTERN.test(String(input.documentId ?? ""))) {
        throw httpError(400, "INVALID_AI_TRANSACTION_INPUT", "Referência de transação inválida");
    }
    const now = input.now ?? new Date();
    const data = await loadTransactionData(prisma, input, config, now);
    data.now = now;
    const posting = assessPosting(input, data, config);
    const factors = new Map();
    const facts = [];
    const limitations = [];
    addFact(facts, "subtotalCents", data.document.subtotalCents, euroText(data.document.subtotalCents), "EUR", `document:${data.document.id}`);
    addFact(facts, "vatCents", data.document.vatCents, euroText(data.document.vatCents), "EUR", `document:${data.document.id}`);
    addFact(facts, "totalCents", data.document.totalCents, euroText(data.document.totalCents), "EUR", `document:${data.document.id}`);
    if (data.document.status === "REJECTED") {
        addFactor(factors, {
            code: "WORKFLOW_REJECTED",
            label: "Documento rejeitado no workflow",
            severity: "CRITICAL",
            points: 75,
            value: data.document.status,
            explanation: "O documento foi rejeitado e não deve prosseguir sem uma nova decisão autorizada de workflow.",
            sourceRef: `document:${data.document.id}`,
        });
    }
    for (const reason of posting.integrityReasons) addFactor(factors, { code: "DATA_INTEGRITY_RISK", label: "Inconsistência entre documento, contabilidade e stock", severity: "CRITICAL", points: 80, value: reason, explanation: reason, sourceRef: `document:${data.document.id}` });
    if (posting.postingSource === "JOURNAL_ENTRY_FALLBACK") limitations.push("Posting histórico confirmado pelo JournalEntry porque o documento não tem postedAt.");

    const stock = assessStock({ ...input, now }, data, posting, factors, facts, limitations);
    const metrics = input.documentType === "SALE"
        ? assessSale(data, posting, factors, facts, limitations)
        : assessPurchase(data, factors, facts, limitations);
    if (data.recentDocuments.length < 3 || stock.some((entry) => entry.historyQuality !== "SUFFICIENT")) {
        addFactor(factors, { code: "INSUFFICIENT_HISTORY", label: "Histórico limitado", severity: "INFO", points: 0, value: `${data.recentDocuments.length}`, explanation: "A janela disponível limita conclusões sobre padrões e tendências.", sourceRef: `history:${data.historyFrom.toISOString()}:${now.toISOString()}` });
    }
    const orderedFactors = [...factors.values()].sort((left, right) => (FACTOR_PRIORITY[left.code] ?? 50) - (FACTOR_PRIORITY[right.code] ?? 50));
    const calculatedScore = Math.min(100, orderedFactors.reduce((sum, factor) => sum + factor.points, 0));
    const inconclusive = posting.integrityReasons.length > 0;
    const score = inconclusive ? null : calculatedScore;
    const band = inconclusive
        ? { riskLevel: "CRITICAL", recommendation: "REVIEW_BEFORE_PROCEEDING" }
        : riskBand(calculatedScore);
    const number = data.document[config.numberField] || `Rascunho ${data.document.id.slice(0, 8)}`;
    const dataQuality = inconclusive
        ? "INCONSISTENT"
        : orderedFactors.some((factor) => factor.code === "INSUFFICIENT_HISTORY") || limitations.length > 0
            ? "PARTIAL"
            : "COMPLETE";
    const summary = posting.integrityReasons.length
        ? `${number}: foram detetadas inconsistências; é necessária revisão humana antes de concluir.`
        : `${number}: risco ${band.riskLevel.toLowerCase()} segundo regras determinísticas ${TRANSACTION_RISK_MODEL_VERSION}.`;
    const sources = [
        { type: `${input.documentType}_DOCUMENT`, id: data.document.id, label: number },
        ...(data.document.warehouse ? [{ type: "WAREHOUSE", id: data.document.warehouse.id, label: data.document.warehouse.name }] : []),
        ...(posting.movementCount ? [{ type: "STOCK_MOVEMENT", id: `${config.movementSource}:${data.document.id}`, label: `${posting.movementCount} movimento(s) automático(s)` }] : []),
        ...(data.journal ? [{ type: "JOURNAL_ENTRY", id: data.journal.id, label: `Lançamento ${config.journalSource}` }] : []),
    ];
    return {
        analysis: {
            modelVersion: TRANSACTION_RISK_MODEL_VERSION,
            scoreMeaning: "Soma de pontos de regras explicáveis; não é probabilidade de perda ou incumprimento.",
            scoreQuality: inconclusive ? "INCONCLUSIVE" : dataQuality,
            dataQuality,
            document: { id: data.document.id, number, type: input.documentType, status: data.document.status, posted: posting.posted, postedAt: data.document.postedAt ?? null, totalCents: data.document.totalCents, warehouseId: data.document.warehouseId ?? null },
            recommendation: band.recommendation,
            riskLevel: band.riskLevel,
            score,
            summary,
            riskFactors: orderedFactors.map(({ points, ...factor }) => factor),
            futureActions: buildFutureActions(orderedFactors),
            facts,
            stock,
            metrics,
            posting: { source: posting.postingSource, stockApplied: posting.stockApplied, movementCount: posting.movementCount },
            sources,
            limitations: [...new Set(limitations)],
            guardrail: TRANSACTION_ANALYSIS_GUARDRAIL,
        },
    };
}

/**
 * Regista apenas metadados mínimos da consulta, sem copiar factos ou payloads.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, analysis: object }} input - Resultado já autorizado.
 * @returns {Promise<object>} AuditLog criado.
 */
export async function auditTransactionAnalysis(prisma, input) {
    const analysis = input.analysis;
    return recordAuditLog(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        action: "AI_TRANSACTION_ANALYSIS_CONSULTED",
        entity: analysis.document.type === "SALE" ? "SaleDocument" : "PurchaseDocument",
        entityId: analysis.document.id,
        details: { modelVersion: analysis.modelVersion, riskLevel: analysis.riskLevel, recommendation: analysis.recommendation, dataQuality: analysis.dataQuality },
    });
}
