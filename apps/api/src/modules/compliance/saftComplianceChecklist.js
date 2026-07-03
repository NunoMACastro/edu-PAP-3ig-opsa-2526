/**
 * @file Checklist de readiness SAF-T executada antes da geracao do ficheiro.
 *
 * A checklist reforca o exportador MVP sem prometer certificacao fiscal:
 * valida periodo, perfil fiscal minimo e existencia de base documental.
 */

import { httpError } from "../../lib/httpErrors.js";

const REQUIRED_PROFILE_FIELDS = [
    ["legalName", "nome legal"],
    ["nif", "NIF"],
    ["addressLine1", "morada"],
    ["postalCode", "codigo postal"],
    ["city", "cidade"],
    ["currency", "moeda"],
];

/**
 * Garante que o valor recebido e uma data valida.
 *
 * @param {unknown} value - Valor que deve ser uma instancia de Date.
 * @param {string} fieldName - Nome publico usado na mensagem de erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando a data e invalida.
 */
function assertValidDate(value, fieldName) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw httpError(400, "INVALID_SAFT_RANGE", `${fieldName} deve ser uma data valida`);
    }

    return value;
}

/**
 * Normaliza uma contagem interna do exportador SAF-T.
 *
 * @param {unknown} value - Contagem calculada pelo service.
 * @param {string} fieldName - Nome tecnico da contagem.
 * @returns {number} Inteiro seguro para somar.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando a contagem e invalida.
 */
function assertNonNegativeInteger(value, fieldName) {
    if (!Number.isInteger(value) || value < 0) {
        throw httpError(500, "INVALID_SAFT_COUNTER", `Contagem SAF-T invalida em ${fieldName}`);
    }

    return value;
}

/**
 * Soma as linhas que vao alimentar o ficheiro SAF-T.
 *
 * @param {{ saleDocuments: number, purchaseDocuments: number, journalEntries: number }} counts - Contagens do service.
 * @returns {number} Total de linhas de negocio disponiveis para exportacao.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando alguma contagem e invalida.
 */
export function countSaftRows(counts) {
    const saleDocuments = assertNonNegativeInteger(counts?.saleDocuments, "saleDocuments");
    const purchaseDocuments = assertNonNegativeInteger(
        counts?.purchaseDocuments,
        "purchaseDocuments",
    );
    const journalEntries = assertNonNegativeInteger(counts?.journalEntries, "journalEntries");

    return saleDocuments + purchaseDocuments + journalEntries;
}

/**
 * Valida o periodo pedido para a exportacao SAF-T.
 *
 * @param {{ fromDate: Date, toDate: Date }} period - Intervalo ja convertido pelo validator.
 * @returns {{ fromDate: Date, toDate: Date }} Periodo validado.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o periodo e invalido.
 */
export function assertSaftPeriod(period) {
    const fromDate = assertValidDate(period?.fromDate, "from");
    const toDate = assertValidDate(period?.toDate, "to");

    if (toDate < fromDate) {
        throw httpError(400, "INVALID_SAFT_RANGE", "Intervalo SAF-T invalido");
    }

    return { fromDate, toDate };
}

/**
 * Valida os campos fiscais minimos do perfil da empresa ativa.
 *
 * @param {Record<string, unknown> | null | undefined} profile - Perfil fiscal carregado da base de dados.
 * @returns {Record<string, unknown>} Perfil validado.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o perfil fiscal esta incompleto.
 */
export function assertSaftProfile(profile) {
    const currentProfile = profile ?? {};

    for (const [field, label] of REQUIRED_PROFILE_FIELDS) {
        const value = String(currentProfile[field] ?? "").trim();
        if (!value) {
            throw httpError(
                422,
                "COMPANY_PROFILE_INCOMPLETE",
                `Perfil fiscal incompleto: falta ${label}`,
            );
        }
    }

    return currentProfile;
}

/**
 * Impede gerar SAF-T sem qualquer documento ou lancamento no periodo.
 *
 * @param {{ saleDocuments: number, purchaseDocuments: number, journalEntries: number }} counts - Contagens do service.
 * @returns {number} Total validado.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o periodo nao tem linhas exportaveis.
 */
export function assertSaftHasRows(counts) {
    const totalRows = countSaftRows(counts);

    if (totalRows === 0) {
        throw httpError(
            422,
            "EMPTY_SAFT_PERIOD",
            "O intervalo SAF-T nao tem documentos nem lancamentos para exportar",
        );
    }

    return totalRows;
}

/**
 * Executa a checklist completa antes de gerar o ficheiro SAF-T.
 *
 * @param {{ profile: Record<string, unknown> | null | undefined, period: { fromDate: Date, toDate: Date }, counts: { saleDocuments: number, purchaseDocuments: number, journalEntries: number } }} input - Dados preparados pelo service.
 * @returns {{ ready: true, checkedAt: string, totalRows: number, period: { fromDate: Date, toDate: Date } }} Resultado da readiness check.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando a exportacao nao tem condicoes minimas.
 */
export function assertSaftReadiness(input) {
    const period = assertSaftPeriod(input?.period);
    assertSaftProfile(input?.profile);
    const totalRows = assertSaftHasRows(input?.counts);

    // A checklist protege contra exportacoes obviamente invalidas antes de criar SaftExportRun.
    return {
        ready: true,
        checkedAt: new Date().toISOString(),
        totalRows,
        period,
    };
}
