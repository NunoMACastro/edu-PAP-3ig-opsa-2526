import { test } from "node:test";
import assert from "node:assert/strict";
import { assertAiRecommendationOnly } from "../../src/modules/ai/aiGovernancePolicy.js";

test("RNF32 permite recomendações que não executam operações financeiras", () => {
    // Este positivo prova que uma recomendação de revisão continua permitida quando não executa finanças.
    assert.doesNotThrow(() => assertAiRecommendationOnly({ actionType: "REVIEW_CASHFLOW" }));
});

test("RNF32 bloqueia ações automáticas da IA", () => {
    const blockedActionTypes = [
        "APPROVE_DOCUMENT",
        "POST_JOURNAL_ENTRY",
        "CHANGE_ACCOUNTING_DATA",
        "EXECUTE_PAYMENT",
    ];

    // Cada ação proibida representa uma fronteira que a IA não pode atravessar sem decisão humana.
    for (const actionType of blockedActionTypes) {
        assert.throws(
            () => assertAiRecommendationOnly({ actionType }),
            /A IA não pode executar ações financeiras ou contabilísticas\./,
        );
    }
});

test("RNF32 rejeita sugestão sem tipo de ação explícito", () => {
    assert.throws(
        () => assertAiRecommendationOnly({}),
        /A sugestão da IA precisa de indicar uma ação de recomendação\./,
    );
});