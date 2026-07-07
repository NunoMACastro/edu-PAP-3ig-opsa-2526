/**
 * @file Testes de contrato para modulos criticos cobertos por RNF27.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const criticalContracts = [
    {
        domain: "faturacao",
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
        domain: "iva",
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
        domain: "reconciliacao",
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
 * @param {string} file - Caminho relativo dentro de `real_dev/api`.
 * @returns {string} Conteudo textual do ficheiro.
 */
function readApiFile(file) {
    return readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
}

/**
 * Remove marcadores pedidos por ambiente para validar negativos sem editar services reais.
 *
 * @param {{ domain: string }} contract - Contrato critico em validacao.
 * @param {string} content - Conteudo original do service.
 * @returns {string} Conteudo final para o teste.
 */
function applyNegativeSimulation(contract, content) {
    const simulation = process.env.OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER;
    if (!simulation) return content;

    const [domain, marker] = simulation.split(":");
    if (domain !== contract.domain || !marker) return content;

    return content.split(marker).join("");
}

/**
 * Confirma que todos os marcadores esperados continuam presentes.
 *
 * @param {{ domain: string, file: string, requiredMarkers: string[] }} contract - Contrato critico.
 * @param {string} content - Conteudo do ficheiro analisado.
 * @returns {void}
 */
function assertRequiredMarkers(contract, content) {
    for (const marker of contract.requiredMarkers) {
        assert.ok(
            content.includes(marker),
            `${contract.domain}: ${contract.file} deve manter o marcador critico ${marker}`,
        );
    }
}

/**
 * Confirma que marcadores obsoletos nao entram novamente no contrato.
 *
 * @param {{ domain: string, file: string, forbiddenMarkers: string[] }} contract - Contrato critico.
 * @param {string} content - Conteudo do ficheiro analisado.
 * @returns {void}
 */
function assertForbiddenMarkers(contract, content) {
    for (const marker of contract.forbiddenMarkers) {
        assert.equal(
            content.includes(marker),
            false,
            `${contract.domain}: ${contract.file} nao deve usar marcador obsoleto ${marker}`,
        );
    }
}

/**
 * Carrega o conteudo de um contrato critico, aplicando simulacao negativa opcional.
 *
 * @param {{ domain: string, file: string }} contract - Contrato critico.
 * @returns {string} Conteudo pronto a validar.
 */
function readContractSource(contract) {
    return applyNegativeSimulation(contract, readApiFile(contract.file));
}

test("RNF27 mantém contratos críticos de faturação, IVA, balancetes e reconciliação", () => {
    for (const contract of criticalContracts) {
        const content = readContractSource(contract);

        // Cada dominio precisa de pelo menos uma exportacao para ser testavel por outras suites.
        assert.ok(
            content.includes("export"),
            `${contract.domain}: ${contract.file} deve expor funcoes testaveis`,
        );
        assertRequiredMarkers(contract, content);
    }
});

test("RNF27 mantém contexto multiempresa nos módulos críticos", () => {
    for (const contract of criticalContracts) {
        const content = readContractSource(contract);

        // O companyId nos services representa contexto backend; nunca ownership escolhido pelo frontend.
        assert.ok(
            content.includes("companyId"),
            `${contract.domain}: ${contract.file} deve filtrar por empresa ativa no backend`,
        );
        assert.equal(
            content.includes("req.body.companyId") || content.includes("req.query.companyId"),
            false,
            `${contract.domain}: ${contract.file} nao deve aceitar empresa ativa vinda do pedido HTTP`,
        );
    }
});

test("RNF27 rejeita marcadores obsoletos que não existem nos services reais", () => {
    for (const contract of criticalContracts) {
        const content = readContractSource(contract);

        // Este negativo impede regressao para nomes conceptuais que nao pertencem ao codigo atual.
        assertForbiddenMarkers(contract, content);
    }
});
