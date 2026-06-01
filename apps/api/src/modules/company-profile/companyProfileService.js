/**
 * @file Service do perfil da empresa do BK-MF0-06.
 */

import { httpError } from "../../lib/httpErrors.js";

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
    return prisma.companyProfile.upsert({
        where: { companyId },
        create: { companyId, ...input },
        update: input,
    });
}
