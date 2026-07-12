/**
 * @file Service de tabelas de IVA da MF1.
 */

import { httpError } from "../../lib/httpErrors.js";

const vatTypes = new Set(["NORMAL", "INTERMEDIATE", "REDUCED", "EXEMPT", "OTHER"]);

/**
 * Normaliza texto de payload para validação.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {string} Texto sem espaços laterais.
 */
function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Valida a região fiscal SAF-T sem assumir Portugal por omissão.
 *
 * @param {unknown} value - Código ISO ou região portuguesa.
 * @param {{ nullable?: boolean }} options - Política para remoção explícita.
 * @returns {string | null} Código normalizado.
 */
function validateTaxCountryRegion(value, { nullable = false } = {}) {
    if (nullable && (value === null || value === "")) return null;
    const region = normalizeText(value).toUpperCase();
    if (!/^[A-Z]{2}(?:-(?:AC|MA))?$/.test(region)) {
        throw httpError(
            400,
            "INVALID_TAX_COUNTRY_REGION",
            "taxCountryRegion deve usar ISO alpha-2, PT-AC ou PT-MA",
        );
    }
    return region;
}

/**
 * Valida payload de taxa de IVA.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {{ code: string, description: string, type: string, exemptionReason: string | null, exemptionCode: string | null, rateBps: number, taxCountryRegion?: string | null }} Dados normalizados.
 */
export function validateVatRateInput(input) {
    if (!input || typeof input !== "object") {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const code = normalizeText(input.code).toUpperCase();
    const description = normalizeText(input.description);
    const type = normalizeText(input.type).toUpperCase();
    const exemptionReason = normalizeText(input.exemptionReason) || null;
    const exemptionCode = normalizeText(input.exemptionCode).toUpperCase() || null;
    const rateBps = Number(input.rateBps);

    if (!code || code.length > 20) {
        throw httpError(400, "INVALID_CODE", "Código de IVA inválido");
    }
    if (!description || description.length > 120) {
        throw httpError(400, "INVALID_DESCRIPTION", "Descrição de IVA inválida");
    }
    if (!vatTypes.has(type)) {
        throw httpError(400, "INVALID_TYPE", "Tipo de IVA inválido");
    }
    if (!Number.isInteger(rateBps) || rateBps < 0 || rateBps > 10000) {
        throw httpError(400, "INVALID_RATE", "Taxa de IVA inválida");
    }
    if (type === "EXEMPT" && !exemptionReason) {
        throw httpError(
            400,
            "MISSING_EXEMPTION_REASON",
            "Motivo de isenção obrigatório",
        );
    }
    if (exemptionReason && exemptionReason.length > 60) {
        throw httpError(
            400,
            "INVALID_EXEMPTION_REASON",
            "Motivo de isenção demasiado longo",
        );
    }
    if (type === "EXEMPT" && !/^M\d{2}$/.test(exemptionCode ?? "")) {
        throw httpError(
            400,
            "MISSING_EXEMPTION_CODE",
            "Código legal de isenção no formato Mnn obrigatório",
        );
    }
    if (type !== "EXEMPT" && (exemptionReason || exemptionCode)) {
        throw httpError(
            400,
            "UNEXPECTED_EXEMPTION_DATA",
            "Motivo e código de isenção só se aplicam a taxas EXEMPT",
        );
    }

    const result = { code, description, type, exemptionReason, exemptionCode, rateBps };
    if (Object.hasOwn(input, "taxCountryRegion")) {
        result.taxCountryRegion = validateTaxCountryRegion(input.taxCountryRegion, {
            nullable: true,
        });
    }
    return result;
}

/**
 * Valida metadata SAF-T explícita de uma taxa existente.
 *
 * @param {unknown} input - Motivo e código fornecidos explicitamente.
 * @returns {{ exemptionReason?: string, exemptionCode?: string, taxCountryRegion?: string | null }} Dados normalizados.
 */
function validateVatSaftMetadata(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }
    const result = {};
    const hasExemptionReason = Object.hasOwn(input, "exemptionReason");
    const hasExemptionCode = Object.hasOwn(input, "exemptionCode");
    if (hasExemptionReason !== hasExemptionCode) {
        throw httpError(
            400,
            "INCOMPLETE_EXEMPTION_METADATA",
            "exemptionReason e exemptionCode devem ser enviados em conjunto",
        );
    }
    if (hasExemptionReason) {
        const exemptionReason = normalizeText(input.exemptionReason);
        const exemptionCode = normalizeText(input.exemptionCode).toUpperCase();
        if (!exemptionReason || exemptionReason.length > 60) {
            throw httpError(400, "MISSING_EXEMPTION_REASON", "Motivo de isenção obrigatório");
        }
        if (!/^M\d{2}$/.test(exemptionCode)) {
            throw httpError(
                400,
                "MISSING_EXEMPTION_CODE",
                "Código legal de isenção no formato Mnn obrigatório",
            );
        }
        result.exemptionReason = exemptionReason;
        result.exemptionCode = exemptionCode;
    }
    if (Object.hasOwn(input, "taxCountryRegion")) {
        result.taxCountryRegion = validateTaxCountryRegion(input.taxCountryRegion, {
            nullable: true,
        });
    }
    if (Object.keys(result).length === 0) {
        throw httpError(400, "EMPTY_SAFT_METADATA", "Indica metadata SAF-T a atualizar");
    }
    return result;
}

/**
 * Lista taxas de IVA da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Taxas de IVA.
 */
export async function listVatRates(prisma, companyId) {
    return prisma.vatRate.findMany({
        where: { companyId },
        orderBy: [{ isActive: "desc" }, { code: "asc" }],
    });
}

/**
 * Cria taxa de IVA por empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, input: unknown }} context - Contexto autenticado e payload.
 * @returns {Promise<object>} Taxa criada.
 */
export async function createVatRate(prisma, context) {
    const data = validateVatRateInput(context.input);
    try {
        return await prisma.$transaction(async (tx) => {
            const vatRate = await tx.vatRate.create({
                data: { ...data, companyId: context.companyId },
            });
            await tx.auditLog.create({
                data: {
                    companyId: context.companyId,
                    userId: context.userId,
                    action: "VAT_RATE_CREATED",
                    entity: "VatRate",
                    entityId: vatRate.id,
                    details: { changedFields: Object.keys(data).sort() },
                },
            });
            return vatRate;
        });
    } catch (error) {
        if (error.code === "P2002") {
            throw httpError(
                409,
                "VAT_RATE_EXISTS",
                "Código de IVA já existe nesta empresa",
            );
        }
        throw error;
    }
}

/**
 * Ativa ou desativa uma taxa de IVA dentro da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, id: string, isActive: unknown }} context - Contexto e estado pretendido.
 * @returns {Promise<object>} Taxa atualizada.
 */
export async function setVatRateActive(prisma, context) {
    if (typeof context.isActive !== "boolean") {
        throw httpError(
            400,
            "INVALID_ACTIVE_FLAG",
            "isActive deve ser booleano",
        );
    }

    return prisma.$transaction(async (tx) => {
        const updated = await tx.vatRate.updateMany({
            where: { id: context.id, companyId: context.companyId },
            data: { isActive: context.isActive },
        });
        if (updated.count !== 1) {
            throw httpError(404, "VAT_RATE_NOT_FOUND", "Taxa de IVA não encontrada");
        }
        const vatRate = await tx.vatRate.findFirst({
            where: { id: context.id, companyId: context.companyId },
        });
        await tx.auditLog.create({
            data: {
                companyId: context.companyId,
                userId: context.userId,
                action: context.isActive ? "VAT_RATE_ACTIVATED" : "VAT_RATE_DEACTIVATED",
                entity: "VatRate",
                entityId: context.id,
                details: { changedFields: ["isActive"] },
            },
        });
        return vatRate;
    });
}

/**
 * Atualiza região fiscal e, quando aplicável, isenção SAF-T company-scoped.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, id: string, input: unknown }} context - Contexto autenticado.
 * @returns {Promise<object>} Taxa atualizada.
 */
export async function updateVatRateSaftMetadata(prisma, context) {
    const data = validateVatSaftMetadata(context.input);
    return prisma.$transaction(async (tx) => {
        const vatRate = await tx.vatRate.findFirst({
            where: { id: context.id, companyId: context.companyId },
        });
        if (!vatRate) {
            throw httpError(404, "VAT_RATE_NOT_FOUND", "Taxa de IVA não encontrada");
        }
        const changesExemption =
            Object.hasOwn(data, "exemptionReason") || Object.hasOwn(data, "exemptionCode");
        if (changesExemption && (vatRate.type !== "EXEMPT" || vatRate.rateBps !== 0)) {
            throw httpError(
                409,
                "VAT_RATE_NOT_EXEMPT",
                "A classificação de isenção só pode ser aplicada a IVA EXEMPT a 0%",
            );
        }
        const updated = await tx.vatRate.update({
            where: { id: vatRate.id },
            data,
        });
        await tx.auditLog.create({
            data: {
                companyId: context.companyId,
                userId: context.userId,
                action: "VAT_RATE_SAFT_METADATA_UPDATED",
                entity: "VatRate",
                entityId: vatRate.id,
                details: { changedFields: Object.keys(data).sort() },
            },
        });
        return updated;
    });
}
