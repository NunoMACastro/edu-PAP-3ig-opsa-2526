// apps/api/tests/contracts/mf8-ai-explainability.contract.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAiRoutes } from "../../src/modules/ai/aiRoutes.js";
import {
    assertExplainableInsight,
} from "../../src/modules/ai/aiService.js";

function hasRoute(router, method, path) {
    return router.stack.some(
        (layer) => layer.route?.path === path && layer.route.methods[method],
    );
}

const validInsight = {
    title: "Risco de margem",
    explanation: "A regra compara margem operacional com receita do relatório financeiro da empresa ativa.",
    sourceType: "OperationalReportRun",
    sourceId: "run-1",
    sourceLabel: "Relatório operacional",
};

test("RNF31 aceita insight com explicação e origem rastreável", () => {
    assert.doesNotThrow(() => assertExplainableInsight(validInsight));
});

test("RNF31 bloqueia explicabilidade incompleta", () => {
    // Estes negativos protegem a defesa: um insight sem fonte ou explicação concreta não é auditável.
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, explanation: "" }),
        /explanation/,
    );
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, explanation: "Curta." }),
        /demasiado curta/,
    );
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, sourceId: "" }),
        /sourceId/,
    );
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, sourceLabel: "" }),
        /sourceLabel/,
    );
});

test("RNF31 expõe a rota canónica de explicação de insight", () => {
    const router = buildAiRoutes({ prisma: {} });

    // A rota interna fica sem /api/ai porque o server.js é quem monta esse prefixo público.
    assert.equal(hasRoute(router, "get", "/insights/:id/explanation"), true);
});