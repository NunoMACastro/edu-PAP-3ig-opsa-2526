/**
 * @file Checklist de readiness SAF-T executada antes da geracao do ficheiro.
 *
 * A checklist protege o gerador interno sem prometer certificação fiscal:
 * valida período, perfil fiscal explícito e existência de base documental.
 */

import { httpError } from "../../lib/httpErrors.js";

const REQUIRED_PROFILE_FIELDS = [
    ["legalName", "nome legal"],
    ["nif", "NIF"],
    ["addressLine1", "morada"],
    ["postalCode", "codigo postal"],
    ["city", "cidade"],
    ["currency", "moeda"],
    ["commercialRegistrationNumber", "número de registo comercial"],
    ["productCompanyTaxId", "NIF do produtor de software"],
    ["productId", "identificação do produto"],
    ["productVersion", "versão do produto"],
    ["saftTaxEntity", "entidade fiscal"],
    ["saftTaxonomyReference", "referência de taxonomia"],
];

const ACCOUNTING_EXPORT_BASES = new Set(["C", "I"]);
const GROUPING_CATEGORIES = new Set(["GR", "GA", "GM", "AR", "AA", "AM"]);
const FIRST_DEGREE_CATEGORIES = new Set(["GR", "AR"]);
const TAXONOMY_REFERENCES = new Set(["S", "M", "N", "O"]);

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
 * @param {{ fromDate: Date, toDate: Date, fiscalYear: number }} period - Intervalo e exercício explícito persistido.
 * @returns {{ fromDate: Date, toDate: Date, fiscalYear: number }} Periodo validado.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o periodo e invalido.
 */
export function assertSaftPeriod(period) {
    const fromDate = assertValidDate(period?.fromDate, "from");
    const toDate = assertValidDate(period?.toDate, "to");

    if (toDate < fromDate) {
        throw httpError(400, "INVALID_SAFT_RANGE", "Intervalo SAF-T invalido");
    }

    if (
        !Number.isInteger(period?.fiscalYear) ||
        period.fiscalYear < 1900 ||
        period.fiscalYear > 9999
    ) {
        throw httpError(
            422,
            "SAFT_FISCAL_YEAR_REQUIRED",
            "O período não tem um exercício fiscal explícito válido",
        );
    }

    return { fromDate, toDate, fiscalYear: period.fiscalYear };
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

    if (!ACCOUNTING_EXPORT_BASES.has(String(currentProfile.saftTaxAccountingBasis ?? ""))) {
        throw httpError(
            422,
            "COMPANY_PROFILE_INCOMPLETE",
            "Perfil fiscal incompleto: TaxAccountingBasis deve ser C ou I para exportação contabilística integral",
        );
    }
    if (
        !Number.isInteger(currentProfile.softwareCertificateNumber) ||
        currentProfile.softwareCertificateNumber < 0
    ) {
        throw httpError(
            422,
            "COMPANY_PROFILE_INCOMPLETE",
            "Perfil fiscal incompleto: falta o número de certificado do software",
        );
    }
    if (!TAXONOMY_REFERENCES.has(String(currentProfile.saftTaxonomyReference ?? ""))) {
        throw httpError(
            422,
            "COMPANY_PROFILE_INCOMPLETE",
            "Perfil fiscal incompleto: referência de taxonomia inválida",
        );
    }
    if (!/^[^/]+\/[^/]+$/.test(String(currentProfile.productId ?? ""))) {
        throw httpError(
            422,
            "COMPANY_PROFILE_INCOMPLETE",
            "Perfil fiscal incompleto: ProductID não segue produtor/produto",
        );
    }
    for (const field of [
        "saftSelfBillingIndicator",
        "saftCashVatSchemeIndicator",
        "saftThirdPartiesBillingIndicator",
    ]) {
        if (currentProfile[field] !== 0 && currentProfile[field] !== 1) {
            throw httpError(
                422,
                "COMPANY_PROFILE_INCOMPLETE",
                `Perfil fiscal incompleto: ${field} deve estar explicitamente configurado`,
            );
        }
    }

    return currentProfile;
}

/**
 * Exige rastreabilidade fiscal nos documentos definitivos entregues ao pipeline.
 *
 * @param {object[]} saleDocuments - Vendas emitidas/regularizadas do período.
 * @returns {void}
 */
function assertSaleFiscalTrace(saleDocuments) {
    for (const document of saleDocuments) {
        for (const [field, maxLength] of [
            ["number", 60],
            ["atcud", 70],
            ["saftHash", 172],
            ["saftHashControl", 40],
        ]) {
            const value = String(document?.[field] ?? "").trim();
            if (!value || value.length > maxLength) {
                throw httpError(
                    422,
                    "SAFT_FISCAL_TRACE_INCOMPLETE",
                    `Documento de venda sem ${field} fiscal válido`,
                );
            }
        }
    }
}

/**
 * Confirma código e fundamento de todas as linhas explicitamente isentas.
 *
 * @param {object[][]} lineGroups - Grupos de linhas de venda/compra.
 * @returns {void}
 */
function assertExemptVatMetadata(lineGroups) {
    for (const line of lineGroups.flat()) {
        if (line?.vatRate?.type !== "EXEMPT") continue;
        const reason = String(line.vatRate.exemptionReason ?? "").trim();
        const code = String(line.vatRate.exemptionCode ?? "").trim().toUpperCase();
        if (!reason || reason.length > 60 || !/^M\d{2}$/.test(code)) {
            throw httpError(
                422,
                "SAFT_VAT_EXEMPTION_INCOMPLETE",
                "Uma linha isenta não tem motivo e código legal SAF-T válidos",
            );
        }
    }
}

/**
 * Valida a hierarquia e taxonomia do plano de contas sem as inferir.
 *
 * @param {object[]} accounts - Plano de contas da empresa ativa.
 * @returns {void}
 */
function assertAccountClassifications(accounts) {
    const accountCodes = new Set(accounts.map((account) => account.code));
    for (const account of accounts) {
        const category = String(account.saftGroupingCategory ?? "").trim();
        const groupingCode = String(account.saftGroupingCode ?? "").trim();
        if (!GROUPING_CATEGORIES.has(category)) {
            throw httpError(
                422,
                "SAFT_ACCOUNT_CLASSIFICATION_INCOMPLETE",
                "O plano de contas contém uma conta sem GroupingCategory válida",
            );
        }
        const firstDegree = FIRST_DEGREE_CATEGORIES.has(category);
        if (
            (firstDegree && groupingCode) ||
            (!firstDegree && (
                !groupingCode ||
                groupingCode === account.code ||
                !accountCodes.has(groupingCode)
            ))
        ) {
            throw httpError(
                422,
                "SAFT_ACCOUNT_HIERARCHY_INCOMPLETE",
                "O plano de contas contém uma hierarquia SAF-T inválida",
            );
        }
        if (
            category === "GM" &&
            (!Number.isInteger(account.saftTaxonomyCode) || account.saftTaxonomyCode < 1)
        ) {
            throw httpError(
                422,
                "SAFT_ACCOUNT_TAXONOMY_INCOMPLETE",
                "Uma conta GM não tem TaxonomyCode válido",
            );
        }
    }
}

/**
 * Executa o preflight dos dados fiscais que o XSD, a reconciliação e o
 * pipeline externo não podem inventar.
 *
 * @param {{ saleDocuments: object[], purchaseDocuments: object[], accounts: object[] }} sources - Snapshot company-scoped.
 * @returns {{ fiscalTraceDocuments: number, classifiedAccounts: number }} Resumo sem dados fiscais sensíveis.
 */
export function assertSaftSourceReadiness(sources) {
    const saleDocuments = Array.isArray(sources?.saleDocuments)
        ? sources.saleDocuments
        : [];
    const purchaseDocuments = Array.isArray(sources?.purchaseDocuments)
        ? sources.purchaseDocuments
        : [];
    const accounts = Array.isArray(sources?.accounts) ? sources.accounts : [];
    if (accounts.length === 0) {
        throw httpError(
            422,
            "SAFT_ACCOUNT_CLASSIFICATION_INCOMPLETE",
            "O plano de contas SAF-T está vazio",
        );
    }
    assertSaleFiscalTrace(saleDocuments);
    assertExemptVatMetadata([
        ...saleDocuments.map((document) => document.lines ?? []),
        ...purchaseDocuments.map((document) => document.lines ?? []),
    ]);
    assertAccountClassifications(accounts);
    return {
        fiscalTraceDocuments: saleDocuments.length,
        classifiedAccounts: accounts.length,
    };
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
 * @param {{ profile: Record<string, unknown> | null | undefined, period: { fromDate: Date, toDate: Date, fiscalYear: number }, counts: { saleDocuments: number, purchaseDocuments: number, journalEntries: number } }} input - Dados preparados pelo service.
 * @returns {{ ready: true, checkedAt: string, totalRows: number, period: { fromDate: Date, toDate: Date, fiscalYear: number } }} Resultado da readiness check.
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
