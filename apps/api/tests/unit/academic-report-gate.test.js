/**
 * @file Fail-closed tests for the canonical academic-report release gate.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    assertCanonicalReportReady,
    parseCanonicalFindings,
} from "../../scripts/academic-report-gate.mjs";

const functionalIds = [
    "OPSA-E2E-P0-001",
    ...Array.from(
        { length: 17 },
        (_, index) => `OPSA-E2E-P1-${String(index + 1).padStart(3, "0")}`,
    ),
    ...Array.from(
        { length: 17 },
        (_, index) => `OPSA-E2E-P2-${String(index + 1).padStart(3, "0")}`,
    ),
    ...Array.from(
        { length: 2 },
        (_, index) => `OPSA-E2E-P3-${String(index + 1).padStart(3, "0")}`,
    ),
];

/**
 * Builds the minimal canonical table used by the parser.
 *
 * @param {Record<string, string>} [stateOverrides] - State overrides by finding ID.
 * @param {{ omit?: string, duplicate?: string, riskState?: string }} [options] - Structural mutations.
 * @returns {string} Markdown report fixture.
 */
function buildReport(stateOverrides = {}, options = {}) {
    const rows = functionalIds
        .filter((id) => id !== options.omit)
        .map((id) => {
            const severity = id.match(/-P([0-3])-/u)?.[0].slice(1, -1);
            const state = stateOverrides[id] ?? "FECHADO";
            return `| \`${id}\` | ${severity} | teste | 0 | - | ${state} | quality |`;
        });
    if (options.duplicate) {
        const severity = options.duplicate.match(/-P([0-3])-/u)?.[0].slice(1, -1);
        rows.push(
            `| \`${options.duplicate}\` | ${severity} | duplicado | 0 | - | FECHADO | quality |`,
        );
    }
    rows.push(
        `| \`OPSA-E2E-RISK-001\` | Aceite | risco | transversal | decisao | ${options.riskState ?? "RISCO_ACEITE"} | utilizador |`,
    );
    return [
        "# Report",
        "",
        "| ID | Severidade | Resumo | Fase | Dependencias | Estado | Owner |",
        "| --- | --- | --- | --- | --- | --- | --- |",
        ...rows,
        "",
    ].join("\n");
}

test("gate aceita apenas findings funcionais FECHADO e o risco canónico aceite", () => {
    assert.deepEqual(assertCanonicalReportReady(buildReport()), {
        functionalCount: 37,
        acceptedRiskCount: 1,
    });
});

test("gate bloqueia estados IMPLEMENTADO, BLOQUEADO_AMBIENTE e EM_CORRECAO", () => {
    const report = buildReport({
        "OPSA-E2E-P0-001": "IMPLEMENTADO",
        "OPSA-E2E-P1-003": "EM_CORRECAO",
        "OPSA-E2E-P1-015": "BLOQUEADO_AMBIENTE",
        "OPSA-E2E-P2-014": "BLOQUEADO_AMBIENTE",
        "OPSA-E2E-P3-001": "PRONTO_REAUDITORIA",
    });
    assert.throws(
        () => assertCanonicalReportReady(report),
        /P0-001=IMPLEMENTADO.*P1-003=EM_CORRECAO.*P1-015=BLOQUEADO_AMBIENTE.*P2-014=BLOQUEADO_AMBIENTE.*P3-001=PRONTO_REAUDITORIA/u,
    );
});

test("gate nunca aceita RISCO_ACEITE num finding funcional", () => {
    assert.throws(
        () => assertCanonicalReportReady(
            buildReport({ "OPSA-E2E-P1-004": "RISCO_ACEITE" }),
        ),
        /RISCO_ACEITE não é permitido em OPSA-E2E-P1-004/u,
    );
});

test("parser falha quando o inventário obrigatório está incompleto", () => {
    assert.throws(
        () => parseCanonicalFindings(buildReport({}, { omit: "OPSA-E2E-P1-009" })),
        /findings obrigatórios ausentes: OPSA-E2E-P1-009/u,
    );
});

test("parser falha perante finding duplicado", () => {
    assert.throws(
        () => parseCanonicalFindings(
            buildReport({}, { duplicate: "OPSA-E2E-P1-002" }),
        ),
        /finding duplicado OPSA-E2E-P1-002/u,
    );
});

test("gate rejeita drift no estado do risco aceite", () => {
    assert.throws(
        () => assertCanonicalReportReady(buildReport({}, { riskState: "FECHADO" })),
        /apenas OPSA-E2E-RISK-001 pode permanecer RISCO_ACEITE/u,
    );
});
