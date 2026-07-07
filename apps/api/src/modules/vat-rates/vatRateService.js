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
 * Valida payload de taxa de IVA.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {{ code: string, description: string, type: string, exemptionReason: string | null, rateBps: number }} Dados normalizados.
 */
export function validateVatRateInput(input) {
    if (!input || typeof input !== "object") {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const code = normalizeText(input.code).toUpperCase();
    const description = normalizeText(input.description);
    const type = normalizeText(input.type).toUpperCase();
    const exemptionReason = normalizeText(input.exemptionReason) || null;
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

    return { code, description, type, exemptionReason, rateBps };
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
 * @param {string} companyId - Empresa ativa.
 * @param {unknown} input - Payload JSON.
 * @returns {Promise<object>} Taxa criada.
 */
export async function createVatRate(prisma, companyId, input) {
    const data = validateVatRateInput(input);
    try {
        return await prisma.vatRate.create({ data: { ...data, companyId } });
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
 * @param {string} companyId - Empresa ativa.
 * @param {string} id - Taxa alvo.
 * @param {unknown} isActive - Estado pretendido.
 * @returns {Promise<object>} Taxa atualizada.
 */
export async function setVatRateActive(prisma, companyId, id, isActive) {
    if (typeof isActive !== "boolean") {
        throw httpError(
            400,
            "INVALID_ACTIVE_FLAG",
            "isActive deve ser booleano",
        );
    }

    const found = await prisma.vatRate.findFirst({ where: { id, companyId } });
    if (!found) {
        throw httpError(404, "VAT_RATE_NOT_FOUND", "Taxa de IVA não encontrada");
    }

    return prisma.vatRate.update({ where: { id }, data: { isActive } });
}
