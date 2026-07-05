// apps/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertAiSourceQuality } from "../../src/modules/ai/aiSourceGuardrails.js";

const validSuggestionSource = {
    companyId: "company-1",
    sourceType: "OperationalReportRun",
    sourceId: "report-1",
    sourceLabel: "Relatório operacional MF3",
    explanation: "A regra compara margem operacional com receita do relatório financeiro da empresa ativa.",
    actionType: "REVIEW_CASHFLOW",
};

test("RNF34 aceita sugestão baseada em fonte real da empresa ativa", () => {
    const quality = assertAiSourceQuality(validSuggestionSource);

    assert.equal(quality.confidence, "medium");
    assert.equal(quality.source.type, "OperationalReportRun");
    assert.match(quality.limitation, /família de dados/);
});

test("RNF34 bloqueia sugestão sem fonte rastreável", () => {
    // Sem identificador de fonte, a defesa não consegue provar de onde veio a recomendação.
    assert.throws(
        () => assertAiSourceQuality({ ...validSuggestionSource, sourceId: "" }),
        /fonte real rastreável/,
    );
});

test("RNF34 bloqueia sugestão sem empresa ativa", () => {
    // A empresa ativa deve vir dos guards do backend para impedir mistura de dados entre empresas.
    assert.throws(
        () => assertAiSourceQuality({ ...validSuggestionSource, companyId: "" }),
        /empresa ativa/,
    );
});

test("RNF34 bloqueia sugestão com explicação fraca", () => {
    // Uma explicação curta pode esconder enviesamento ou falta de dados reais.
    assert.throws(
        () => assertAiSourceQuality({ ...validSuggestionSource, explanation: "Margem baixa." }),
        /demasiado curta/,
    );
});