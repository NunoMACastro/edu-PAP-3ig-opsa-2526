/**
 * @file Provas fail-closed do gate do relatório de defeitos MF8.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { assertDefectReportGateCanPass } from "../../scripts/check-mf8-defect-report.mjs";

test("o gate rejeita um relatório validado que continua bloqueado pelo ambiente", () => {
    assert.throws(
        () => assertDefectReportGateCanPass({ decision: "BLOQUEADO_AMBIENTE" }),
        /MF8_DEFECT_REPORT_BLOCKED/u
    );
});

test("o gate aceita uma correção revalidada", () => {
    assert.doesNotThrow(() =>
        assertDefectReportGateCanPass({ decision: "CORRIGIDO_REVALIDADO" })
    );
});

test("o gate aceita uma execução comprovadamente sem correção necessária", () => {
    assert.doesNotThrow(() =>
        assertDefectReportGateCanPass({ decision: "SEM_CORRECAO_NECESSARIA" })
    );
});
