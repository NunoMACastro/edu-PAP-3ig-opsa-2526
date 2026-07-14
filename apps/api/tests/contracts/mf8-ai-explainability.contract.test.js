/**
 * @file Testes de contrato BK-MF8-10 para explicabilidade dos insights.
 *
 * Esta suite transforma RNF31 em prova repetivel: cada insight publico deve
 * ter explicacao concreta, origem rastreavel e endpoint protegido no dominio
 * de IA. A IA continua recomendatoria e nao executa alteracoes contabilisticas.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { buildAiRoutes } from "../../src/modules/ai/aiRoutes.js";
import {
    assertExplainableInsight,
    explainAiInsight,
} from "../../src/modules/ai/aiService.js";

const COMPANY_ID = "company-mf8-10";
const INSIGHT_ID = "insight-mf8-10";

const validInsight = Object.freeze({
    id: INSIGHT_ID,
    title: "Margem operacional baixa",
    explanation: "A regra compara margem operacional MVP com receita do relatorio MF3 da empresa ativa.",
    sourceType: "OperationalReportRun",
    sourceId: "report-mf3-1",
    sourceLabel: "Relatorio operacional MF3",
});

/**
 * Confirma se o router expoe uma rota esperada.
 *
 * @param router - Router Express a inspecionar.
 * @param {string} method - Metodo HTTP esperado.
 * @param {string} path - Caminho interno esperado.
 * @returns {boolean} Verdadeiro quando a rota existe.
 */
function hasRoute(router, method, path) {
    return router.stack.some((layer) => {
        return layer.route?.path === path && layer.route.methods[method] === true;
    });
}

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
 * Cria um Prisma minimo para explicar um insight sem abrir ligacao a DB real.
 *
 * @param {object | null} insight - Insight devolvido pela query.
 * @returns {{aiInsight: {findFirst: Function}}} Double Prisma focado no contrato RNF31.
 */
function createPrismaWithInsight(insight) {
    return {
        aiInsight: {
            async findFirst(query) {
                assert.deepEqual(query, {
                    where: { id: INSIGHT_ID, companyId: COMPANY_ID },
                });

                return insight;
            },
        },
    };
}

test("BK-MF8-10 aceita insight com explicacao e fonte rastreavel", () => {
    assert.doesNotThrow(() => assertExplainableInsight(validInsight));
});

test("BK-MF8-10 bloqueia insights sem explicabilidade minima", () => {
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, explanation: "" }),
        hasDomainCode("AI_INSIGHT_NOT_EXPLAINABLE"),
    );
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, explanation: "Curta." }),
        hasDomainCode("AI_INSIGHT_EXPLANATION_TOO_SHORT"),
    );
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, sourceId: "" }),
        hasDomainCode("AI_INSIGHT_NOT_EXPLAINABLE"),
    );
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, sourceLabel: "" }),
        hasDomainCode("AI_INSIGHT_NOT_EXPLAINABLE"),
    );
});

test("BK-MF8-10 expoe a rota canonica de explicacao do insight", () => {
    const router = buildAiRoutes({ prisma: {} });

    assert.equal(hasRoute(router, "get", "/insights/:id/explanation"), true);
});

test("BK-MF8-10 devolve explicacao com fonte e guardrail recomendatorio", async () => {
    const explanation = await explainAiInsight(
        createPrismaWithInsight(validInsight),
        { companyId: COMPANY_ID, insightId: INSIGHT_ID },
    );

    assert.equal(explanation.id, INSIGHT_ID);
    assert.equal(explanation.title, validInsight.title);
    assert.equal(explanation.explanation, validInsight.explanation);
    assert.deepEqual(explanation.source, {
        type: validInsight.sourceType,
        id: validInsight.sourceId,
        label: validInsight.sourceLabel,
    });
    assert.match(explanation.guardrail, /nao executa alteracoes automaticamente/);
});

test("BK-MF8-10 protege empresa ativa e dados persistidos incompletos", async () => {
    await assert.rejects(
        () => explainAiInsight(
            createPrismaWithInsight(null),
            { companyId: COMPANY_ID, insightId: INSIGHT_ID },
        ),
        hasDomainCode("AI_INSIGHT_NOT_FOUND"),
    );

    await assert.rejects(
        () => explainAiInsight(
            createPrismaWithInsight({ ...validInsight, sourceType: "" }),
            { companyId: COMPANY_ID, insightId: INSIGHT_ID },
        ),
        hasDomainCode("AI_INSIGHT_NOT_EXPLAINABLE"),
    );
});
