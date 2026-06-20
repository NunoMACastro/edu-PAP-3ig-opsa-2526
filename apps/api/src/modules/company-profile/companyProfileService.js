/**
 * @file Service do perfil da empresa do BK-MF0-06.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Verifica se um erro Prisma P2002 aponta para o campo indicado.
 *
 * @param {unknown} error - Erro capturado.
 * @param {string} field - Campo esperado no target Prisma.
 * @returns {boolean} `true` quando é conflito de unicidade nesse campo.
 */
function isUniqueFieldError(error, field) {
    return (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes(field)
    );
}

/**
 * Obtém o perfil da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object>} Perfil encontrado.
 */
export async function getCompanyProfile(prisma, companyId) {
    const profile = await prisma.companyProfile.findUnique({
        where: { companyId },
    });
    if (!profile) {
        throw httpError(
            404,
            "COMPANY_PROFILE_NOT_FOUND",
            "Perfil da empresa não encontrado",
        );
    }
    return profile;
}

/**
 * Cria ou atualiza o perfil da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object} input - Dados validados do perfil.
 * @returns {Promise<object>} Perfil persistido.
 */
export async function upsertCompanyProfile(prisma, companyId, input) {
    try {
        return await prisma.companyProfile.upsert({
            where: { companyId },
            create: { companyId, ...input },
            update: input,
        });
    } catch (error) {
        if (isUniqueFieldError(error, "nif")) {
            throw httpError(
                409,
                "NIF_ALREADY_EXISTS",
                "Já existe uma empresa com este NIF",
            );
        }
        throw error;
    }
}
