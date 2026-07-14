/**
 * @file Testes de contrato BK-MF8-13 para qualidade das fontes de IA.
 *
 * Esta suite transforma RNF34 em prova repetivel: sugestoes de IA so podem ser
 * expostas quando usam dados reais, rastreaveis e filtrados pela empresa ativa.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { assertAiSourceQuality } from "../../src/modules/ai/aiSourceGuardrails.js";
import { generateAiSuggestions } from "../../src/modules/ai/aiService.js";

const COMPANY_ID = "company-mf8-13";
const USER_ID = "user-mf8-13";

const validSuggestionSource = Object.freeze({
    companyId: COMPANY_ID,
    sourceType: "OperationalReportRun",
    sourceId: "report-mf3-1",
    sourceLabel: "Relatorio operacional MF3",
    explanation: "A regra compara margem operacional com receita do relatorio financeiro da empresa ativa.",
    actionType: "REVIEW_CASHFLOW",
});

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
 * @returns {{persisted: object[], prisma: object}} Double Prisma focado no contrato RNF34.
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
            async upsert({ create }) {
                persisted.push({ id: `suggestion-${persisted.length + 1}`, ...create });
                return persisted.at(-1);
            },
        },
        auditLog: {
            async create({ data }) {
                return { id: "audit-mf8-13", ...data };
            },
        },
    };
    prisma.$transaction = async (callback) => callback(prisma);
    return {
        persisted,
        prisma,
    };
}

test("BK-MF8-13 aceita sugestao baseada em fonte real da empresa ativa", () => {
    const quality = assertAiSourceQuality(validSuggestionSource);

    assert.equal(quality.confidence, "medium");
    assert.deepEqual(quality.source, {
        type: "OperationalReportRun",
        id: "report-mf3-1",
        label: "Relatorio operacional MF3",
    });
    assert.match(quality.limitation, /familia de dados/);
});

test("AI_METRIC_V2 só é confiável com evidência estruturada completa", () => {
    const v2 = { ...validSuggestionSource, sourceType: "AI_METRIC_V2", sourceId: "LOW_MARGIN:fingerprint", evidence: { metrics: { operatingMarginBps: 900 }, formula: "classes SNC seis e sete agregadas no PostgreSQL" } };
    assert.equal(assertAiSourceQuality(v2).confidence, "high");
    assert.throws(() => assertAiSourceQuality({ ...v2, evidence: null }), hasDomainCode("AI_SOURCE_EVIDENCE_REQUIRED"));
});

test("BK-MF8-13 bloqueia sugestao sem fonte rastreavel", () => {
    // Sem identificador de fonte, a defesa nao consegue provar de onde veio a recomendacao.
    assert.throws(
        () => assertAiSourceQuality({ ...validSuggestionSource, sourceId: "" }),
        hasDomainCode("AI_SOURCE_TRACE_REQUIRED"),
    );
});

test("BK-MF8-13 bloqueia sugestao sem empresa ativa", () => {
    // A empresa ativa deve vir dos guards do backend para impedir mistura de dados entre empresas.
    assert.throws(
        () => assertAiSourceQuality({ ...validSuggestionSource, companyId: "" }),
        hasDomainCode("AI_SOURCE_COMPANY_REQUIRED"),
    );
});

test("BK-MF8-13 bloqueia sugestao com explicacao fraca", () => {
    // Uma explicacao curta pode esconder enviesamento ou falta de dados reais.
    assert.throws(
        () => assertAiSourceQuality({ ...validSuggestionSource, explanation: "Margem baixa." }),
        hasDomainCode("AI_SOURCE_EXPLANATION_TOO_SHORT"),
    );
});

test("BK-MF8-13 aplica qualidade da fonte antes de persistir sugestoes", async () => {
    const { persisted, prisma } = createPrismaForSuggestions([
        {
            id: "insight-without-source",
            type: "LOW_MARGIN",
            suggestedAction: "Rever artigos com margem reduzida",
            explanation: validSuggestionSource.explanation,
            sourceType: "OperationalReportRun",
            sourceId: "",
            sourceLabel: "Relatorio operacional MF3",
        },
    ]);

    await assert.rejects(
        () => generateAiSuggestions(prisma, { companyId: COMPANY_ID, userId: USER_ID }),
        hasDomainCode("AI_SOURCE_TRACE_REQUIRED"),
    );
    assert.equal(persisted.length, 0);
});
