/**
 * @file Baseline legada MF4 mantida apenas para compatibilidade pedagógica.
 *
 * Estes services usam regras transparentes sobre dados OPSA. O objetivo e
 * Nenhuma rota, seed ou worker runtime importa este módulo; a pipeline canónica
 * é `aiAnalysisService.js`. Estes helpers preservam testes históricos sem criar
 * novas escritas em `AiQuestionRun` na aplicação. O objetivo original era
 * apoiar decisao com explicacao e origem, preservando o principio: a IA nao
 * aprova, nao contabiliza, nao altera precos e nao repoe stock automaticamente.
 */

import { httpError } from "../../lib/httpErrors.js";
import { recordAuditLog } from "../audit/auditLogService.js";
import { listStockAlerts } from "../inventory/stockAlertService.js";
import { assertAiRecommendationOnly } from "./aiGovernancePolicy.js";
import { assertAiSourceQuality } from "./aiSourceGuardrails.js";
import { assertExplainableInsight } from "./aiExplainability.js";
export { assertExplainableInsight } from "./aiExplainability.js";

/**
 * Cria percentagem em pontos base protegida contra divisao por zero.
 *
 * @param {number} numerator - Numerador em centimos ou unidades.
 * @param {number} denominator - Denominador em centimos ou unidades.
 * @returns {number | null} Percentagem em pontos base, ou null sem base.
 */
function bps(numerator, denominator) {
    if (!denominator) return null;
    return Math.round((numerator / denominator) * 10_000);
}

/**
 * Converte cêntimos em texto EUR simples para mensagens explicáveis.
 *
 * @param {number} cents - Valor monetário em cêntimos.
 * @returns {string} Valor formatado para leitura humana.
 */
function eur(cents) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Formata quantidades sem acrescentar casas decimais artificiais.
 *
 * @param {number} value - Quantidade calculada.
 * @returns {string} Quantidade pronta para mensagens.
 */
function quantityText(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/**
 * Cria um identificador estavel para alertas calculados pela MF2.
 *
 * @param {{ item: { id: string }, warehouse: { id: string }, type: string }} alert - Alerta de stock.
 * @returns {string} Identificador explicito da fonte.
 */
function stockAlertSourceId(alert) {
    return `${alert.item.id}:${alert.warehouse.id}:${alert.type}`;
}

/**
 * Converte alertas reais de stock em candidatos de insight MF4.
 *
 * @param {string} companyId - Empresa ativa.
 * @param {object} alert - Alerta calculado pela MF2.
 * @returns {object | null} Candidato de insight, ou null quando fora do escopo MF4.
 */
function stockAlertToInsight(companyId, alert) {
    const sourceId = stockAlertSourceId(alert);
    const itemLabel = alert.item.sku ?? alert.item.name ?? alert.item.id;
    const warehouseLabel = alert.warehouse.name ?? alert.warehouse.id;
    const quantity = quantityText(alert.quantity);
    const threshold = quantityText(alert.threshold);

    if (alert.type === "LOW_STOCK") {
        return {
            companyId,
            type: "LOW_STOCK_RISK",
            severity: alert.quantity <= 0 ? "CRITICAL" : "WARNING",
            title: "Risco de rutura de stock",
            summary: `${itemLabel} tem ${quantity} unidade(s) em ${warehouseLabel}, abaixo do minimo ${threshold}.`,
            explanation: "A regra reutiliza alertas MF2 e compara StockBalance.quantity com StockAlertSetting.minQuantity. A IA apenas sinaliza o risco; nao cria movimentos, compras ou reposicoes.",
            sourceType: "StockAlertSetting",
            sourceId,
            sourceLabel: "Alertas de stock MF2",
            suggestedAction: "Validar necessidade de reposicao ou transferencia antes de executar qualquer movimento.",
        };
    }

    if (alert.type === "STOPPED_ITEM") {
        const valueCents = Math.round(alert.quantity * (alert.item.costCents ?? 0));
        return {
            companyId,
            type: "STOPPED_ITEM",
            severity: valueCents > 100_000 ? "WARNING" : "INFO",
            title: "Artigo sem movimento recente",
            summary: `${itemLabel} tem ${quantity} unidade(s) em ${warehouseLabel} sem movimento nos ultimos ${threshold} dias.`,
            explanation: "A regra reutiliza alertas MF2 e verifica o ultimo StockMovement face a StockAlertSetting.stoppedAfterDays. A recomendacao e analitica e nao altera stock.",
            sourceType: "StockAlertSetting",
            sourceId,
            sourceLabel: "Alertas de stock MF2",
            suggestedAction: "Analisar rotacao do artigo e decidir promocao, transferencia ou compra mais cautelosa.",
        };
    }

    if (alert.type === "HIGH_STOCK") {
        return {
            companyId,
            type: "STOCK_EXCESS_RISK",
            severity: "INFO",
            title: "Stock acima do maximo definido",
            summary: `${itemLabel} tem ${quantity} unidade(s) em ${warehouseLabel}, acima do maximo ${threshold}.`,
            explanation: "A regra reutiliza alertas MF2 e compara StockBalance.quantity com StockAlertSetting.maxQuantity. A IA sinaliza potencial excesso sem executar movimentos.",
            sourceType: "StockAlertSetting",
            sourceId,
            sourceLabel: "Alertas de stock MF2",
            suggestedAction: "Rever procura prevista e compras planeadas antes de reforcar stock.",
        };
    }

    return null;
}

/**
 * Converte alertas reais de stock em smart alerts MF4.
 *
 * @param {string} companyId - Empresa ativa.
 * @param {object} alert - Alerta calculado pela MF2.
 * @returns {object | null} Candidato de smart alert.
 */
function stockAlertToSmartAlert(companyId, alert) {
    const sourceId = stockAlertSourceId(alert);
    const itemLabel = alert.item.sku ?? alert.item.name ?? alert.item.id;
    const warehouseLabel = alert.warehouse.name ?? alert.warehouse.id;
    const quantity = quantityText(alert.quantity);
    const threshold = quantityText(alert.threshold);

    if (alert.type === "LOW_STOCK") {
        return {
            companyId,
            type: "STOCK_RUPTURE_RISK",
            severity: alert.quantity <= 0 ? "CRITICAL" : "WARNING",
            title: "Risco de rutura",
            message: `${itemLabel} em ${warehouseLabel}: ${quantity} unidade(s), abaixo do minimo ${threshold}.`,
            sourceType: "StockAlertSetting",
            sourceId,
            sourceLabel: "Alertas de stock MF2",
        };
    }

    if (alert.type === "STOPPED_ITEM") {
        return {
            companyId,
            type: "STOPPED_ITEM_DEVIATION",
            severity: "INFO",
            title: "Artigo parado",
            message: `${itemLabel} em ${warehouseLabel}: ${quantity} unidade(s) sem movimento nos ultimos ${threshold} dias.`,
            sourceType: "StockAlertSetting",
            sourceId,
            sourceLabel: "Alertas de stock MF2",
        };
    }

    if (alert.type === "HIGH_STOCK") {
        return {
            companyId,
            type: "STOCK_EXCESS_DEVIATION",
            severity: "INFO",
            title: "Stock acima do maximo",
            message: `${itemLabel} em ${warehouseLabel}: ${quantity} unidade(s), acima do maximo ${threshold}.`,
            sourceType: "StockAlertSetting",
            sourceId,
            sourceLabel: "Alertas de stock MF2",
        };
    }

    return null;
}

/**
 * Escolhe o tipo de sugestao sem executar a acao automaticamente.
 *
 * @param {{ type: string }} insight - Insight persistido.
 * @returns {string} Tipo de acao sugerida.
 */
function suggestionActionType(insight) {
    if (
        insight.type === "STOCK_VALUE_LOCKED" ||
        insight.type === "LOW_STOCK_RISK" ||
        insight.type === "STOPPED_ITEM" ||
        insight.type === "STOCK_EXCESS_RISK"
    ) {
        return "REVIEW_STOCK";
    }
    if (insight.type === "CUSTOMER_COLLECTION_RISK") return "NEGOTIATE_CUSTOMER";
    if (insight.type === "LOW_MARGIN") return "REVIEW_PRICING";
    return "REVIEW_CASHFLOW";
}

/**
 * Cria uma chave de upsert coerente com a unique constraint do Prisma.
 *
 * @param {object} insight - Insight ou alerta com campos de fonte.
 * @returns {object} Chave composta Prisma.
 */
function sourceKey(insight) {
    return {
        companyId_type_sourceType_sourceId: {
            companyId: insight.companyId,
            type: insight.type,
            sourceType: insight.sourceType,
            sourceId: insight.sourceId,
        },
    };
}

/**
 * Gera insights candidatos a partir de relatórios, clientes e stock.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto autenticado.
 * @returns {Promise<object[]>} Lista de candidatos explicáveis.
 */
async function buildInsightCandidates(prisma, input) {
    const [report, kpis, openSales, stockAlerts] = await Promise.all([
        prisma.operationalReportRun.findFirst({
            where: {
                companyId: input.companyId,
                fromDate: { gte: input.fromDate },
                toDate: { lte: input.toDate },
            },
            orderBy: { generatedAt: "desc" },
        }),
        prisma.executiveKpiRun.findFirst({
            where: {
                companyId: input.companyId,
                fromDate: { gte: input.fromDate },
                toDate: { lte: input.toDate },
            },
            orderBy: { generatedAt: "desc" },
        }),
        prisma.saleDocument.findMany({
            where: {
                companyId: input.companyId,
                kind: { not: "CREDIT_NOTE" },
                status: { in: ["ISSUED", "SETTLED"] },
            },
            orderBy: { issuedAt: "asc" },
        }),
        listStockAlerts(prisma, input.companyId),
    ]);

    const candidates = [];
    if (report) {
        const marginBps = bps(report.marginCents, report.revenueCents);
        if (report.revenueCents > 0 && marginBps !== null && marginBps < 2000) {
            candidates.push({
                companyId: input.companyId,
                type: "LOW_MARGIN",
                severity: marginBps < 0 ? "CRITICAL" : "WARNING",
                title: "Margem operacional baixa",
                summary: `Margem de ${eur(report.marginCents)} sobre vendas de ${eur(report.revenueCents)}.`,
                explanation: "A regra compara margem operacional MVP com receita do relatório MF3. Margem inferior a 20% exige análise antes de alterar preços.",
                sourceType: "OperationalReportRun",
                sourceId: report.id,
                sourceLabel: "Relatório operacional MF3",
                suggestedAction: "Rever artigos com margem reduzida e validar custos antes de decidir alterações.",
            });
        }
    }

    if (kpis && kpis.pmpDays !== null && kpis.pmrDays !== null && kpis.pmpDays < kpis.pmrDays) {
        candidates.push({
            companyId: input.companyId,
            type: "CASH_CONVERSION_RISK",
            severity: "WARNING",
            title: "PMR superior ao PMP",
            summary: `PMR ${kpis.pmrDays.toFixed(1)} dias e PMP ${kpis.pmpDays.toFixed(1)} dias.`,
            explanation: "Receber mais tarde do que pagar pode pressionar tesouraria. A fonte e o KPI executivo MF3.",
            sourceType: "ExecutiveKpiRun",
            sourceId: kpis.id,
            sourceLabel: "KPIs executivos MF3",
            suggestedAction: "Negociar prazos de recebimento/pagamento antes de assumir nova despesa.",
        });
    }

    const overdueOpenSales = openSales.filter((document) => {
        const dueDate = document.dueDate ?? document.issuedAt;
        return document.totalCents > document.amountPaidCents && dueDate < input.toDate;
    });
    if (overdueOpenSales.length > 0) {
        const totalOpenCents = overdueOpenSales.reduce(
            (sum, document) => sum + document.totalCents - document.amountPaidCents,
            0,
        );
        candidates.push({
            companyId: input.companyId,
            type: "CUSTOMER_COLLECTION_RISK",
            severity: totalOpenCents > 50_000 ? "CRITICAL" : "WARNING",
            title: "Clientes com saldos vencidos",
            summary: `${overdueOpenSales.length} documento(s) com ${eur(totalOpenCents)} por receber.`,
            explanation: "A regra usa documentos de venda emitidos/liquidados com valor em aberto e data de vencimento anterior ao fim do período.",
            sourceType: "SaleDocument",
            sourceId: overdueOpenSales[0].id,
            sourceLabel: "Documentos de venda em aberto",
            suggestedAction: "Contactar clientes prioritários e confirmar plano de recebimento.",
        });
    }

    for (const alert of stockAlerts) {
        const stockCandidate = stockAlertToInsight(input.companyId, alert);
        if (stockCandidate) candidates.push(stockCandidate);
    }

    return candidates;
}

/**
 * Gera e persiste insights idempotentes por fonte.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto autenticado.
 * @returns {Promise<object[]>} Insights persistidos.
 */
export async function generateAiInsights(prisma, input) {
    const candidates = await buildInsightCandidates(prisma, input);
    // Guardrails executam antes da transacao para que input invalido nunca
    // inicie writes. A transacao seguinte torna o lote e a auditoria indivisiveis.
    for (const candidate of candidates) assertExplainableInsight(candidate);

    return prisma.$transaction(async (tx) => {
        const insights = [];
        for (const candidate of candidates) {
            insights.push(
                await tx.aiInsight.upsert({
                    where: sourceKey(candidate),
                    update: {
                        severity: candidate.severity,
                        title: candidate.title,
                        summary: candidate.summary,
                        explanation: candidate.explanation,
                        sourceLabel: candidate.sourceLabel,
                        suggestedAction: candidate.suggestedAction,
                        status: "OPEN",
                        generatedById: input.userId,
                    },
                    create: {
                        ...candidate,
                        status: "OPEN",
                        generatedById: input.userId,
                    },
                }),
            );
        }
        await recordAuditLog(tx, {
            companyId: input.companyId,
            userId: input.userId,
            action: "AI_INSIGHTS_GENERATED",
            entity: "AiInsightBatch",
            entityId: input.companyId,
            details: { generatedCount: insights.length },
        });
        return insights.sort((left, right) =>
            left.severity.localeCompare(right.severity),
        );
    });
}

/**
 * Devolve uma explicacao segura de um insight da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, insightId: string }} input - Contexto e identificador.
 * @returns {Promise<object>} Explicacao e fontes.
 */
export async function explainAiInsight(prisma, input) {
    const insight = await prisma.aiInsight.findFirst({
        where: { id: input.insightId, companyId: input.companyId },
    });
    if (!insight) {
        throw httpError(404, "AI_INSIGHT_NOT_FOUND", "Insight nao encontrado");
    }

    // A resposta publica so e devolvida se o registo continuar auditavel e ligado a fonte real.
    assertExplainableInsight(insight);

    return {
        id: insight.id,
        title: insight.title,
        explanation: insight.explanation,
        source: {
            type: insight.sourceType,
            id: insight.sourceId,
            label: insight.sourceLabel,
        },
        guardrail: "A IA explica e recomenda; nao executa alteracoes automaticamente.",
    };
}

/**
 * Cria sugestoes de acao a partir de insights persistidos e fontes validadas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string }} input - Contexto autenticado.
 * @returns {Promise<object[]>} Sugestoes abertas com metadados de qualidade da fonte.
 */
export async function generateAiSuggestions(prisma, input) {
    const insights = await prisma.aiInsight.findMany({
        where: { companyId: input.companyId, status: "OPEN" },
        orderBy: { generatedAt: "desc" },
    });
    const preparedSuggestions = [];
    for (const insight of insights) {
        // RNF32 falha antes do upsert: a IA pode sugerir revisao, mas nao executar financas.
        const actionType = assertAiRecommendationOnly({
            actionType: suggestionActionType(insight),
        });

        // RNF34 falha antes da persistencia: a sugestao precisa de fonte real da empresa ativa.
        const sourceQuality = assertAiSourceQuality({
            companyId: input.companyId,
            sourceType: insight.sourceType,
            sourceId: insight.sourceId,
            sourceLabel: insight.sourceLabel,
            explanation: insight.explanation,
            actionType,
        });

        preparedSuggestions.push({
            insight,
            actionType,
            sourceQuality,
        });
    }

    return prisma.$transaction(async (tx) => {
        const suggestions = [];
        for (const prepared of preparedSuggestions) {
            const { insight, actionType, sourceQuality } = prepared;
            const suggestion = await tx.aiActionSuggestion.upsert({
                where: {
                    companyId_insightId_actionType: {
                        companyId: input.companyId,
                        insightId: insight.id,
                        actionType,
                    },
                },
                update: {
                    title:
                        insight.suggestedAction ??
                        "Rever indicador antes de agir",
                    rationale: insight.explanation,
                    sourceLabel: insight.sourceLabel,
                    status: "OPEN",
                    createdById: input.userId,
                },
                create: {
                    companyId: input.companyId,
                    insightId: insight.id,
                    actionType,
                    title:
                        insight.suggestedAction ??
                        "Rever indicador antes de agir",
                    rationale: insight.explanation,
                    sourceLabel: insight.sourceLabel,
                    status: "OPEN",
                    createdById: input.userId,
                },
            });
            suggestions.push({
                ...suggestion,
                sourceQuality,
                guardrail:
                    "A IA recomenda com fonte rastreavel; a decisao continua humana.",
            });
        }
        await recordAuditLog(tx, {
            companyId: input.companyId,
            userId: input.userId,
            action: "AI_SUGGESTIONS_GENERATED",
            entity: "AiActionSuggestionBatch",
            entityId: input.companyId,
            details: { generatedCount: suggestions.length },
        });
        return suggestions;
    });
}

/**
 * Bloqueia novas escritas no modelo legado de perguntas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, body: unknown }} input - Pedido autenticado.
 * @returns {Promise<object>} Resposta persistida e explicavel.
 */
export async function answerAiQuestion() {
    throw httpError(410, "AI_QUESTION_RUN_LEGACY_READ_ONLY", "Use o adapter de chat v2; AiQuestionRun deixou de aceitar novas escritas.");
}

/**
 * Gera alertas inteligentes de tesouraria e ruturas sem alterar saldos.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto autenticado.
 * @returns {Promise<object[]>} Alertas persistidos.
 */
export async function generateSmartAlerts(prisma, input) {
    const [forecast, stockAlerts] = await Promise.all([
        prisma.cashflowForecastRun.findFirst({
            where: {
                companyId: input.companyId,
                fromDate: { gte: input.fromDate },
                toDate: { lte: input.toDate },
            },
            orderBy: { generatedAt: "desc" },
        }),
        listStockAlerts(prisma, input.companyId),
    ]);

    const candidates = [];
    if (forecast && forecast.closingBalanceCents < 0) {
        candidates.push({
            companyId: input.companyId,
            type: "NEGATIVE_CASHFLOW",
            severity: "CRITICAL",
            title: "Previsao de tesouraria negativa",
            message: `Saldo previsto de ${eur(forecast.closingBalanceCents)} no fim do periodo.`,
            sourceType: "CashflowForecastRun",
            sourceId: forecast.id,
            sourceLabel: "Previsao de tesouraria MF3",
        });
    }

    for (const alert of stockAlerts) {
        const stockCandidate = stockAlertToSmartAlert(input.companyId, alert);
        if (stockCandidate) candidates.push(stockCandidate);
    }

    return prisma.$transaction(async (tx) => {
        const alerts = [];
        for (const candidate of candidates) {
            alerts.push(
                await tx.smartAlert.upsert({
                    where: sourceKey(candidate),
                    update: {
                        severity: candidate.severity,
                        title: candidate.title,
                        message: candidate.message,
                        sourceLabel: candidate.sourceLabel,
                        status: "OPEN",
                        generatedById: input.userId,
                    },
                    create: {
                        ...candidate,
                        status: "OPEN",
                        generatedById: input.userId,
                    },
                }),
            );
        }
        await recordAuditLog(tx, {
            companyId: input.companyId,
            userId: input.userId,
            action: "AI_ALERTS_GENERATED",
            entity: "SmartAlertBatch",
            entityId: input.companyId,
            details: { generatedCount: alerts.length },
        });
        return alerts;
    });
}
