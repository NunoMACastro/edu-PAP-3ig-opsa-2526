/**
 * @file Testes de contrato para módulos críticos cobertos por RNF27.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const criticalContracts = [
    {
        domain: "faturação",
        file: "src/modules/sales/saleDocumentService.js",
        requiredMarkers: [
            "createSaleDocument",
            "issueSaleDocument",
            "assertOpenFiscalPeriod",
            "totalCents",
            "vatCents",
            "auditLog.create",
            "companyId",
        ],
        forbiddenMarkers: ["totalGrossCents"],
    },
    {
        domain: "IVA",
        file: "src/modules/tax/vatMapService.js",
        requiredMarkers: [
            "buildVatMap",
            "fromDate",
            "toDate",
            "liquidatedVatCents",
            "deductibleVatCents",
            "vatBalanceCents",
            "companyId",
        ],
        forbiddenMarkers: [],
    },
    {
        domain: "balancetes",
        file: "src/modules/accounting-reports/accountingReportService.js",
        requiredMarkers: [
            "buildTrialBalance",
            "buildLedger",
            "journalEntry",
            "debitCents",
            "creditCents",
            "balanceCents",
            "companyId",
        ],
        forbiddenMarkers: ["trialBalance"],
    },
    {
        domain: "reconciliação",
        file: "src/modules/treasury/statementImportService.js",
        requiredMarkers: [
            "importBankStatement",
            "deduplicateStatementRows",
            "buildSuggestions",
            "bankReconciliationSuggestion",
            "recordIntegrationLog",
            "companyId",
        ],
        forbiddenMarkers: [],
    },
];

/**
 * Lê um ficheiro da API a partir da pasta de testes de contrato.
 *
 * @param {string} file - Caminho relativo dentro de `apps/api`.
 * @returns {string} Conteúdo textual do ficheiro.
 */
function readApiFile(file) {
    return readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
}

/**
 * Confirma que todos os marcadores esperados continuam presentes.
 *
 * @param {{ domain: string, file: string, requiredMarkers: string[] }} contract - Contrato crítico.
 * @param {string} content - Conteúdo do ficheiro analisado.
 * @returns {void}
 */
function assertRequiredMarkers(contract, content) {
    for (const marker of contract.requiredMarkers) {
        assert.ok(
            content.includes(marker),
            `${contract.domain}: ${contract.file} deve manter o marcador crítico ${marker}`,
        );
    }
}

/**
 * Confirma que marcadores errados não voltam a entrar no contrato.
 *
 * @param {{ domain: string, file: string, forbiddenMarkers: string[] }} contract - Contrato crítico.
 * @param {string} content - Conteúdo do ficheiro analisado.
 * @returns {void}
 */
function assertForbiddenMarkers(contract, content) {
    for (const marker of contract.forbiddenMarkers) {
        assert.equal(
            content.includes(marker),
            false,
            `${contract.domain}: ${contract.file} não deve usar marcador obsoleto ${marker}`,
        );
    }
}

test("RNF27 mantém contratos críticos de faturação, IVA, balancetes e reconciliação", () => {
    for (const contract of criticalContracts) {
        const content = readApiFile(contract.file);

        // Cada domínio precisa de pelo menos um export para ser testável por outras suites.
        assert.ok(
            content.includes("export"),
            `${contract.domain}: ${contract.file} deve expor funções testáveis`,
        );
        assertRequiredMarkers(contract, content);
    }
});

test("RNF27 mantém contexto multiempresa nos módulos críticos", () => {
    for (const contract of criticalContracts) {
        const content = readApiFile(contract.file);

        // O companyId tem de aparecer nos services para impedir leituras entre empresas.
        assert.ok(
            content.includes("companyId"),
            `${contract.domain}: ${contract.file} deve filtrar por empresa ativa no backend`,
        );
        assert.equal(
            content.includes("req.body.companyId") || content.includes("req.query.companyId"),
            false,
            `${contract.domain}: ${contract.file} não deve aceitar empresa ativa vinda do pedido HTTP`,
        );
    }
});

test("RNF27 rejeita marcadores obsoletos que não existem nos services reais", () => {
    for (const contract of criticalContracts) {
        const content = readApiFile(contract.file);

        // Este negativo impede regressões para nomes conceptuais que não pertencem à app.
        assertForbiddenMarkers(contract, content);
    }
});