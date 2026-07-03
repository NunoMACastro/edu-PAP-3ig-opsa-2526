/**
 * @file Testes contratuais da readiness SAF-T MF7.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assertSaftReadiness } from "../../src/modules/compliance/saftComplianceChecklist.js";

const SERVICE_FILE = new URL("../../src/modules/compliance/saftService.js", import.meta.url);

/**
 * Cria um perfil fiscal completo para o caso positivo.
 *
 * @param {Record<string, unknown>} overrides - Campos a substituir no perfil.
 * @returns {Record<string, unknown>} Perfil fiscal de teste.
 */
function completeProfile(overrides = {}) {
    return {
        legalName: "OPSA Demo, Lda.",
        nif: "509999999",
        addressLine1: "Rua da Escola, 1",
        postalCode: "1000-001",
        city: "Lisboa",
        currency: "EUR",
        ...overrides,
    };
}

/**
 * Cria input de readiness com valores validos por defeito.
 *
 * @param {Record<string, unknown>} overrides - Campos de topo a substituir.
 * @returns {{ profile: Record<string, unknown> | null, period: { fromDate: Date, toDate: Date }, counts: { saleDocuments: number, purchaseDocuments: number, journalEntries: number } }} Input de readiness.
 */
function readinessInput(overrides = {}) {
    return {
        profile: completeProfile(),
        period: {
            fromDate: new Date("2026-01-01T00:00:00.000Z"),
            toDate: new Date("2026-01-31T23:59:59.999Z"),
        },
        counts: {
            saleDocuments: 1,
            purchaseDocuments: 0,
            journalEntries: 2,
        },
        ...overrides,
    };
}

/**
 * Confirma que uma funcao lanca um erro de dominio esperado.
 *
 * @param {() => void} action - Operacao que deve falhar.
 * @param {string} code - Codigo de erro esperado.
 * @returns {void}
 */
function assertDomainError(action, code) {
    assert.throws(action, (error) => error?.code === code);
}

test("aceita readiness SAF-T com perfil, periodo e movimentos", () => {
    const readiness = assertSaftReadiness(readinessInput());

    assert.equal(readiness.ready, true);
    assert.equal(readiness.totalRows, 3);
    assert.match(readiness.checkedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("rejeita periodo SAF-T invertido", () => {
    assertDomainError(
        () =>
            assertSaftReadiness(
                readinessInput({
                    period: {
                        fromDate: new Date("2026-02-01T00:00:00.000Z"),
                        toDate: new Date("2026-01-01T00:00:00.000Z"),
                    },
                }),
            ),
        "INVALID_SAFT_RANGE",
    );
});

test("rejeita perfil fiscal sem NIF", () => {
    assertDomainError(
        () =>
            assertSaftReadiness(
                readinessInput({
                    profile: completeProfile({ nif: "" }),
                }),
            ),
        "COMPANY_PROFILE_INCOMPLETE",
    );
});

test("rejeita periodo sem documentos nem lancamentos", () => {
    assertDomainError(
        () =>
            assertSaftReadiness(
                readinessInput({
                    counts: {
                        saleDocuments: 0,
                        purchaseDocuments: 0,
                        journalEntries: 0,
                    },
                }),
            ),
        "EMPTY_SAFT_PERIOD",
    );
});

test("service SAF-T chama readiness, cria run e regista log de integracao", () => {
    const source = readFileSync(SERVICE_FILE, "utf8");

    // Esta leitura estatica protege a ligacao entre o contrato MF7 e o fluxo real do service.
    assert.match(source, /assertSaftReadiness/);
    assert.match(source, /saftExportRun\.create/);
    assert.match(source, /recordIntegrationLog/);
});
