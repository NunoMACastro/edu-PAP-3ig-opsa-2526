/**
 * @file Service do perfil da empresa do BK-MF0-06.
 */

import { httpError } from "../../lib/httpErrors.js";
import { recordAuditLog } from "../audit/auditLogService.js";

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
 * @param {string} userId - Utilizador autenticado responsável pela alteração.
 * @param {object} input - Dados validados do perfil.
 * @returns {Promise<object>} Perfil persistido.
 */
export async function upsertCompanyProfile(prisma, companyId, userId, input) {
    if (typeof userId !== "string" || userId.trim() === "") {
        throw httpError(
            403,
            "AUTHENTICATED_USER_REQUIRED",
            "É necessário um utilizador autenticado para alterar o perfil.",
        );
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const existing = await tx.companyProfile.findUnique({
                where: { companyId },
                select: { id: true },
            });
            const profile = await tx.companyProfile.upsert({
                where: { companyId },
                create: { companyId, ...input },
                update: input,
            });

            // CompanyProfile é a fonte fiscal canónica, mas Company.nif ainda é
            // usado no contexto/listagens. As duas projeções mudam atomicamente.
            await tx.company.update({
                where: { id: companyId },
                data: { nif: profile.nif },
            });

            await recordAuditLog(tx, {
                companyId,
                userId,
                action: existing
                    ? "company.profile.update"
                    : "company.profile.create",
                entity: "CompanyProfile",
                entityId: profile.id,
                details: {
                    changedFields: Object.keys(input).sort(),
                },
            });

            return profile;
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
