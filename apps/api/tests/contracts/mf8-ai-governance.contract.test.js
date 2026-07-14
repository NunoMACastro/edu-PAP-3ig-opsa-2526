/**
 * @file Testes de contrato BK-MF8-11 para governanca da IA.
 *
 * Esta suite transforma RNF32 em prova repetivel: sugestoes de IA podem
 * recomendar revisao humana, mas nao podem executar operacoes financeiras.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
    assertAiRecommendationOnly,
    BLOCKED_AI_ACTION_TYPES,
} from "../../src/modules/ai/aiGovernancePolicy.js";
import { generateAiSuggestions } from "../../src/modules/ai/aiService.js";

const COMPANY_ID = "company-mf8-11";
const USER_ID = "user-mf8-11";

/**
 * Cria um matcher para erros HTTP de dominio.
 *
 * @param {string} code - Codigo funcional esperado.
 * @returns {(error: Error & { code?: string }) => boolean} Predicado para asserts.
 */
function hasDomainCode(code) {
    /**
     * Confirma que o erro lançado expõe o código de domínio esperado.
     *
     * @param {Error & { code?: string }} error - Erro capturado pelo assert.
     * @returns {boolean} Verdadeiro quando o assert interno passa.
     */
    return function assertDomainCode(error) {
        assert.equal(error.code, code);
        return true;
    };
}

/**
 * Cria um Prisma minimo para sugestoes de IA sem abrir ligacao a DB real.
 *
 * @param {object[]} insights - Insights abertos a transformar em sugestoes.
 * @returns {{persisted: object[], prisma: object}} Double Prisma focado no contrato RNF32.
 */
function createPrismaForSuggestions(insights) {
    const persisted = [];
    const prisma = {
        aiInsight: {
            async findMany(query) {
                assert.deepEqual(query, {
                    where: { companyId: COMPANY_ID, status: "OPEN" },
                    orderBy: { generatedAt: "desc" },
                });
                return insights;
            },
        },
        aiActionSuggestion: {
            async upsert({ where, create }) {
                assert.equal(where.companyId_insightId_actionType.companyId, COMPANY_ID);
                assert.equal(create.companyId, COMPANY_ID);
                assert.equal(create.createdById, USER_ID);
                assert.equal("execute" in create, false);
                assert.equal("journalEntryId" in create, false);
                assert.equal("paymentId" in create, false);

                persisted.push({ id: `suggestion-${persisted.length + 1}`, ...create });
                return persisted.at(-1);
            },
        },
        auditLog: {
            async create({ data }) {
                return { id: "audit-mf8-11", ...data };
            },
        },
    };
    prisma.$transaction = async (callback) => callback(prisma);
    return {
        persisted,
        prisma,
    };
}

test("BK-MF8-11 permite action types de recomendacao humana", () => {
    assert.equal(
        assertAiRecommendationOnly({ actionType: " review-cashflow " }),
        "REVIEW_CASHFLOW",
    );
    assert.equal(
        assertAiRecommendationOnly({ actionType: "NEGOTIATE_CUSTOMER" }),
        "NEGOTIATE_CUSTOMER",
    );
});

test("BK-MF8-11 bloqueia acoes financeiras e contabilisticas automaticas", () => {
    for (const actionType of BLOCKED_AI_ACTION_TYPES) {
        assert.throws(
            () => assertAiRecommendationOnly({ actionType }),
            hasDomainCode("AI_AUTOMATED_FINANCIAL_ACTION_BLOCKED"),
        );
    }
});

test("BK-MF8-11 rejeita sugestoes ambiguas sem actionType explicito", () => {
    assert.throws(
        () => assertAiRecommendationOnly({}),
        hasDomainCode("AI_SUGGESTION_ACTION_REQUIRED"),
    );
    assert.throws(
        () => assertAiRecommendationOnly({ actionType: "   " }),
        hasDomainCode("AI_SUGGESTION_ACTION_REQUIRED"),
    );
});

test("BK-MF8-11 aplica a politica antes de persistir sugestoes", async () => {
    const source = await readFile(
        new URL("../../src/modules/ai/aiService.js", import.meta.url),
        "utf8",
    );
    const policyCallIndex = source.indexOf("assertAiRecommendationOnly({");
    const upsertIndex = source.indexOf("tx.aiActionSuggestion.upsert");

    assert.notEqual(policyCallIndex, -1);
    assert.notEqual(upsertIndex, -1);
    assert.equal(policyCallIndex < upsertIndex, true);
});

test("BK-MF8-11 persiste apenas sugestoes abertas para revisao humana", async () => {
    const { persisted, prisma } = createPrismaForSuggestions([
        {
            id: "insight-low-margin",
            type: "LOW_MARGIN",
            suggestedAction: "Rever artigos com margem reduzida",
            explanation: "A regra compara margem operacional MVP com receita do relatorio MF3.",
            sourceType: "OperationalReportRun",
            sourceId: "report-mf3-low-margin",
            sourceLabel: "Relatorio operacional MF3",
        },
        {
            id: "insight-cashflow",
            type: "CASH_CONVERSION_RISK",
            suggestedAction: "Rever tesouraria antes de assumir nova despesa",
            explanation: "A regra compara PMR e PMP para apoiar decisao humana.",
            sourceType: "ExecutiveKpiRun",
            sourceId: "kpi-mf3-cashflow",
            sourceLabel: "KPIs executivos MF3",
        },
    ]);

    const suggestions = await generateAiSuggestions(prisma, {
        companyId: COMPANY_ID,
        userId: USER_ID,
    });

    assert.equal(suggestions.length, 2);
    assert.deepEqual(
        persisted.map((suggestion) => suggestion.actionType),
        ["REVIEW_PRICING", "REVIEW_CASHFLOW"],
    );
    assert.equal(
        persisted.every((suggestion) => suggestion.status === "OPEN"),
        true,
    );
});
