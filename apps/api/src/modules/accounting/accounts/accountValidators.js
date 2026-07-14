/**
 * @file Validadores do plano de contas SNC do BK-MF0-07.
 */

import { httpError } from "../../../lib/httpErrors.js";

const ACCOUNT_CODE_PATTERN = /^\d{1,8}$/;
const SAFT_GROUPING_CATEGORIES = new Set(["GR", "GA", "GM", "AR", "AA", "AM"]);
const SAFT_FIRST_DEGREE_CATEGORIES = new Set(["GR", "AR"]);

/**
 * Valida código SNC numérico simples.
 *
 * @param {unknown} code - Código recebido.
 * @returns {string} Código normalizado.
 */
function validateCode(code) {
    if (typeof code !== "string" || !ACCOUNT_CODE_PATTERN.test(code.trim())) {
        throw httpError(
            400,
            "INVALID_ACCOUNT_CODE",
            "Código SNC deve ser numérico e ter entre 1 e 8 dígitos",
        );
    }
    return code.trim();
}

/**
 * Valida nome da conta.
 *
 * @param {unknown} name - Nome recebido.
 * @returns {string} Nome normalizado.
 */
function validateName(name) {
    if (typeof name !== "string" || name.trim().length < 3) {
        throw httpError(
            400,
            "INVALID_ACCOUNT_NAME",
            "Nome da conta deve ter pelo menos 3 caracteres",
        );
    }
    return name.trim();
}

/**
 * Deriva nível contabilístico a partir do comprimento do código.
 *
 * @param {string} code - Código SNC validado.
 * @returns {number} Nível derivado.
 */
function accountLevelFromCode(code) {
    return code.length;
}

/**
 * Valida metadata de hierarquia/taxonomia exigida pela tabela de contas SAF-T.
 * A categoria fiscal nunca é deduzida automaticamente do código SNC.
 *
 * @param {unknown} body - Metadata SAF-T e parentCode conhecido da conta.
 * @returns {{ saftGroupingCategory: string, saftGroupingCode: string | null, saftTaxonomyCode: number | null }} Metadata normalizada.
 */
export function validateAccountSaftMetadata(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_SAFT_ACCOUNT_METADATA", "Metadata SAF-T inválida");
    }
    const saftGroupingCategory = typeof body.saftGroupingCategory === "string"
        ? body.saftGroupingCategory.trim().toUpperCase()
        : "";
    if (!SAFT_GROUPING_CATEGORIES.has(saftGroupingCategory)) {
        throw httpError(
            400,
            "INVALID_SAFT_GROUPING_CATEGORY",
            "Categoria SAF-T da conta inválida",
        );
    }

    const saftGroupingCode = body.saftGroupingCode == null || body.saftGroupingCode === ""
        ? null
        : validateCode(body.saftGroupingCode);
    const parentCode = body.parentCode == null || body.parentCode === ""
        ? null
        : validateCode(body.parentCode);
    const firstDegree = SAFT_FIRST_DEGREE_CATEGORIES.has(saftGroupingCategory);
    if (firstDegree && saftGroupingCode !== null) {
        throw httpError(
            400,
            "INVALID_SAFT_GROUPING_CODE",
            "Contas de primeiro grau não têm GroupingCode",
        );
    }
    if (!firstDegree && !saftGroupingCode) {
        throw httpError(
            400,
            "MISSING_SAFT_GROUPING_CODE",
            "GroupingCode é obrigatório para esta categoria",
        );
    }
    if (parentCode && saftGroupingCode !== parentCode) {
        throw httpError(
            400,
            "SAFT_GROUPING_PARENT_MISMATCH",
            "GroupingCode deve corresponder ao parentCode da conta",
        );
    }
    if (firstDegree && parentCode) {
        throw httpError(
            400,
            "SAFT_FIRST_DEGREE_PARENT_INVALID",
            "Uma conta de primeiro grau não pode ter parentCode",
        );
    }

    let saftTaxonomyCode = null;
    if (
        body.saftTaxonomyCode !== null &&
        body.saftTaxonomyCode !== undefined &&
        body.saftTaxonomyCode !== ""
    ) {
        if (
            !Number.isInteger(body.saftTaxonomyCode) ||
            body.saftTaxonomyCode < 1 ||
            body.saftTaxonomyCode > 2_147_483_647
        ) {
            throw httpError(
                400,
                "INVALID_SAFT_TAXONOMY_CODE",
                "TaxonomyCode deve ser um inteiro positivo",
            );
        }
        saftTaxonomyCode = body.saftTaxonomyCode;
    }
    if (saftGroupingCategory === "GM" && saftTaxonomyCode === null) {
        throw httpError(
            400,
            "MISSING_SAFT_TAXONOMY_CODE",
            "TaxonomyCode é obrigatório para contas GM",
        );
    }

    return { saftGroupingCategory, saftGroupingCode, saftTaxonomyCode };
}

/**
 * Valida uma conta manual ou uma linha de importação.
 *
 * @param {unknown} body - Payload de conta.
 * @returns {{ code: string, name: string, parentCode: string | null, level: number, isActive: boolean }} Conta normalizada.
 */
export function validateAccountPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const code = validateCode(body.code);
    const parentCode = body.parentCode ? validateCode(body.parentCode) : null;

    const result = {
        code,
        name: validateName(body.name),
        parentCode,
        level: accountLevelFromCode(code),
        isActive: body.isActive !== false,
    };
    const hasSaftMetadata = [
        "saftGroupingCategory",
        "saftGroupingCode",
        "saftTaxonomyCode",
    ].some((field) => Object.hasOwn(body, field));
    Object.assign(
        result,
        hasSaftMetadata
            ? validateAccountSaftMetadata({ ...body, parentCode })
            : {
                saftGroupingCategory: null,
                saftGroupingCode: null,
                saftTaxonomyCode: null,
            },
    );
    if (result.saftGroupingCode === code) {
        throw httpError(
            400,
            "SAFT_GROUPING_SELF_REFERENCE",
            "GroupingCode não pode referenciar a própria conta",
        );
    }
    return result;
}

/**
 * Valida payload de importação com linhas já normalizadas.
 *
 * @param {unknown} body - Payload da importação.
 * @returns {Array<ReturnType<typeof validateAccountPayload>>} Linhas validadas.
 */
export function validateImportPayload(body) {
    if (!body || typeof body !== "object" || !Array.isArray(body.rows)) {
        throw httpError(
            400,
            "INVALID_IMPORT",
            "Importação deve receber rows normalizadas",
        );
    }

    if (body.rows.length === 0) {
        throw httpError(
            400,
            "INVALID_IMPORT",
            "Importação deve conter pelo menos uma linha",
        );
    }

    return body.rows.map(validateAccountPayload);
}
