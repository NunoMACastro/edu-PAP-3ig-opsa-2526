// apps/api/src/modules/compliance/saftComplianceChecklist.js
/**
 * @file Checklist de readiness SAF-T executada antes da geração do ficheiro.
 */

import { httpError } from "../../lib/httpErrors.js";

const REQUIRED_PROFILE_FIELDS = [
    ["legalName", "nome legal"],
    ["nif", "NIF"],
    ["addressLine1", "morada"],
    ["postalCode", "código postal"],
    ["city", "cidade"],
    ["currency", "moeda"],
];

/**
 * Garante que o valor recebido é uma data válida.
 *
 * @param {unknown} value - Valor que deve ser uma instância de Date.
 * @param {string} fieldName - Nome público usado na mensagem de erro.
 * @returns {Date} Data validada.
 */
function assertValidDate(value, fieldName) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw httpError(400, "INVALID_SAFT_RANGE", `${fieldName} deve ser uma data válida`);
    }

    return value;
}

/**
 * Normaliza uma contagem interna do exportador SAF-T.
 *
 * @param {unknown} value - Contagem calculada pelo service.
 * @param {string} fieldName - Nome técnico da contagem.
 * @returns {number} Inteiro seguro para somar.
 */
function assertNonNegativeInteger(value, fieldName) {
    if (!Number.isInteger(value) || value < 0) {
        throw httpError(500, "INVALID_SAFT_COUNTER", `Contagem SAF-T inválida em ${fieldName}`);
    }

    return value;
}

/**
 * Soma as linhas que vão alimentar o ficheiro SAF-T.
 *
 * @param {{ saleDocuments: number, purchaseDocuments: number, journalEntries: number }} counts - Contagens do service.
 * @returns {number} Total de linhas de negócio disponíveis para exportação.
 */
export function countSaftRows(counts) {
    const saleDocuments = assertNonNegativeInteger(counts?.saleDocuments, "saleDocuments");
    const purchaseDocuments = assertNonNegativeInteger(counts?.purchaseDocuments, "purchaseDocuments");
    const journalEntries = assertNonNegativeInteger(counts?.journalEntries, "journalEntries");

    return saleDocuments + purchaseDocuments + journalEntries;
}

/**
 * Valida o período pedido para a exportação SAF-T.
 *
 * @param {{ fromDate: Date, toDate: Date }} period - Intervalo já convertido pelo validator.
 * @returns {{ fromDate: Date, toDate: Date }} Período validado.
 */
export function assertSaftPeriod(period) {
    const fromDate = assertValidDate(period?.fromDate, "from");
    const toDate = assertValidDate(period?.toDate, "to");

    if (toDate < fromDate) {
        throw httpError(400, "INVALID_SAFT_RANGE", "Intervalo SAF-T inválido");
    }

    return { fromDate, toDate };
}

/**
 * Valida os campos fiscais mínimos do perfil da empresa ativa.
 *
 * @param {Record<string, unknown> | null} profile - Perfil fiscal carregado da base de dados.
 * @returns {Record<string, unknown>} Perfil validado.
 */
export function assertSaftProfile(profile) {
    const currentProfile = profile ?? {};

    for (const [field, label] of REQUIRED_PROFILE_FIELDS) {
        const value = String(currentProfile[field] ?? "").trim();
        if (!value) {
            throw httpError(422, "COMPANY_PROFILE_INCOMPLETE", `Perfil fiscal incompleto: falta ${label}`);
        }
    }

    return currentProfile;
}

/**
 * Impede gerar SAF-T sem qualquer documento ou lançamento no período.
 *
 * @param {{ saleDocuments: number, purchaseDocuments: number, journalEntries: number }} counts - Contagens do service.
 * @returns {number} Total validado.
 */
export function assertSaftHasRows(counts) {
    const totalRows = countSaftRows(counts);

    if (totalRows === 0) {
        throw httpError(
            422,
            "EMPTY_SAFT_PERIOD",
            "O intervalo SAF-T não tem documentos nem lançamentos para exportar",
        );
    }

    return totalRows;
}

/**
 * Executa a checklist completa antes de gerar o ficheiro SAF-T.
 *
 * @param {{ profile: Record<string, unknown> | null, period: { fromDate: Date, toDate: Date }, counts: { saleDocuments: number, purchaseDocuments: number, journalEntries: number } }} input - Dados preparados pelo service.
 * @returns {{ ready: true, checkedAt: string, totalRows: number, period: { fromDate: Date, toDate: Date } }} Resultado da readiness check.
 */
export function assertSaftReadiness(input) {
    const period = assertSaftPeriod(input?.period);
    assertSaftProfile(input?.profile);
    const totalRows = assertSaftHasRows(input?.counts);

    // A checklist protege contra exportações obviamente inválidas antes de criar SaftExportRun.
    return {
        ready: true,
        checkedAt: new Date().toISOString(),
        totalRows,
        period,
    };
}