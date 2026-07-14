/**
 * @file Validadores do perfil da empresa do BK-MF0-06.
 */

import { httpError } from "../../lib/httpErrors.js";
import { isValidPortugueseNif } from "./nifValidator.js";

const SAFT_TAX_ACCOUNTING_BASES = new Set([
    "C",
    "E",
    "F",
    "I",
    "P",
    "R",
    "S",
    "T",
]);
const SAFT_TAXONOMY_REFERENCES = new Set(["S", "M", "N", "O"]);

/**
 * Valida uma string obrigatória e devolve o valor sem espaços laterais.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} field - Nome do campo para mensagem de erro.
 * @returns {string} String normalizada.
 */
function requiredString(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw httpError(400, "INVALID_FIELD", `${field} é obrigatório`);
    }
    return value.trim();
}

/**
 * Normaliza uma string opcional.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {string | null} String normalizada ou `null`.
 */
function optionalString(value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string") {
        throw httpError(400, "INVALID_FIELD", "Campo inválido");
    }
    return value.trim();
}

/**
 * Valida texto SAF-T opcional sem preencher valores fiscais por omissão.
 * `undefined` significa preservar o valor atual; `null` permite removê-lo.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} field - Nome público do campo.
 * @param {number} maxLength - Limite definido pelo contrato do campo.
 * @returns {string | null} Valor normalizado.
 */
function optionalSaftString(value, field, maxLength) {
    if (value === null || value === "") return null;
    if (
        typeof value !== "string" ||
        value.trim().length === 0 ||
        value.trim().length > maxLength ||
        /[\u0000-\u001f\u007f]/.test(value)
    ) {
        throw httpError(400, "INVALID_SAFT_PROFILE_FIELD", `${field} é inválido`);
    }
    return value.trim();
}

/**
 * Valida um indicador fiscal opcional sem assumir zero por omissão.
 *
 * @param {unknown} value - 0, 1 ou null explícito.
 * @param {string} field - Nome público do campo.
 * @returns {number | null} Indicador pronto a persistir.
 */
function optionalSaftIndicator(value, field) {
    if (value === null || value === "") return null;
    if (value !== 0 && value !== 1) {
        throw httpError(400, "INVALID_SAFT_PROFILE_FIELD", `${field} deve ser 0 ou 1`);
    }
    return value;
}

/**
 * Acrescenta apenas campos SAF-T explicitamente enviados, evitando apagar
 * configuração fiscal existente quando clientes antigos fazem PUT.
 *
 * @param {Record<string, unknown>} body - Payload recebido.
 * @param {Record<string, unknown>} result - Payload normalizado a completar.
 * @returns {void}
 */
function appendSaftProfileFields(body, result) {
    if (Object.hasOwn(body, "commercialRegistrationNumber")) {
        result.commercialRegistrationNumber = optionalSaftString(
            body.commercialRegistrationNumber,
            "commercialRegistrationNumber",
            50,
        );
    }
    if (Object.hasOwn(body, "saftTaxAccountingBasis")) {
        if (body.saftTaxAccountingBasis === null || body.saftTaxAccountingBasis === "") {
            result.saftTaxAccountingBasis = null;
        } else {
            const basis = String(body.saftTaxAccountingBasis).trim().toUpperCase();
            if (!SAFT_TAX_ACCOUNTING_BASES.has(basis)) {
                throw httpError(
                    400,
                    "INVALID_SAFT_TAX_ACCOUNTING_BASIS",
                    "saftTaxAccountingBasis não usa um código SAF-T suportado",
                );
            }
            result.saftTaxAccountingBasis = basis;
        }
    }
    if (Object.hasOwn(body, "saftTaxEntity")) {
        result.saftTaxEntity = optionalSaftString(
            body.saftTaxEntity,
            "saftTaxEntity",
            20,
        );
    }
    if (Object.hasOwn(body, "saftTaxonomyReference")) {
        if (body.saftTaxonomyReference === null || body.saftTaxonomyReference === "") {
            result.saftTaxonomyReference = null;
        } else {
            const reference = String(body.saftTaxonomyReference).trim().toUpperCase();
            if (!SAFT_TAXONOMY_REFERENCES.has(reference)) {
                throw httpError(
                    400,
                    "INVALID_SAFT_TAXONOMY_REFERENCE",
                    "saftTaxonomyReference deve ser S, M, N ou O",
                );
            }
            result.saftTaxonomyReference = reference;
        }
    }
    for (const field of [
        "saftSelfBillingIndicator",
        "saftCashVatSchemeIndicator",
        "saftThirdPartiesBillingIndicator",
    ]) {
        if (Object.hasOwn(body, field)) {
            result[field] = optionalSaftIndicator(body[field], field);
        }
    }
    if (Object.hasOwn(body, "softwareCertificateNumber")) {
        if (body.softwareCertificateNumber === null || body.softwareCertificateNumber === "") {
            result.softwareCertificateNumber = null;
        } else if (
            !Number.isInteger(body.softwareCertificateNumber) ||
            body.softwareCertificateNumber < 0 ||
            body.softwareCertificateNumber > 2_147_483_647
        ) {
            throw httpError(
                400,
                "INVALID_SOFTWARE_CERTIFICATE_NUMBER",
                "softwareCertificateNumber deve ser um inteiro não negativo",
            );
        } else {
            result.softwareCertificateNumber = body.softwareCertificateNumber;
        }
    }
    for (const [field, maxLength] of [
        ["productCompanyTaxId", 20],
        ["productId", 255],
        ["productVersion", 30],
    ]) {
        if (Object.hasOwn(body, field)) {
            result[field] = optionalSaftString(body[field], field, maxLength);
        }
    }
}

/**
 * Valida a data fiscal base em mês/dia.
 *
 * @param {unknown} month - Mês fiscal.
 * @param {unknown} day - Dia fiscal.
 * @returns {{ month: number, day: number }} Data fiscal validada.
 */
function validateFiscalDate(month, day) {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw httpError(400, "INVALID_FISCAL_PERIOD", "Mês fiscal inválido");
    }
    if (!Number.isInteger(day) || day < 1) {
        throw httpError(400, "INVALID_FISCAL_PERIOD", "Dia fiscal inválido");
    }
    const date = new Date(Date.UTC(2025, month - 1, day));
    if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        throw httpError(400, "INVALID_FISCAL_PERIOD", "Dia fiscal inválido");
    }
    return { month, day };
}

/**
 * Valida payload completo de perfil da empresa.
 *
 * @param {unknown} body - Corpo JSON do pedido.
 * @returns {object} Payload normalizado para persistência.
 */
export function validateCompanyProfilePayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const nif = requiredString(body.nif, "nif");
    if (!isValidPortugueseNif(nif)) {
        throw httpError(400, "INVALID_NIF", "NIF português inválido");
    }

    if (body.currency !== undefined && body.currency !== "EUR") {
        throw httpError(
            400,
            "INVALID_CURRENCY",
            "A moeda base documentada para o MVP e EUR",
        );
    }

    const fiscalDate = validateFiscalDate(
        body.fiscalYearStartMonth,
        body.fiscalYearStartDay,
    );

    const result = {
        legalName: requiredString(body.legalName, "legalName"),
        nif,
        addressLine1: requiredString(body.addressLine1, "addressLine1"),
        addressLine2: optionalString(body.addressLine2),
        postalCode: requiredString(body.postalCode, "postalCode"),
        city: requiredString(body.city, "city"),
        country: body.country ? requiredString(body.country, "country") : "PT",
        currency: "EUR",
        logoUrl: optionalString(body.logoUrl),
        fiscalYearStartMonth: fiscalDate.month,
        fiscalYearStartDay: fiscalDate.day,
    };
    appendSaftProfileFields(body, result);
    return result;
}
