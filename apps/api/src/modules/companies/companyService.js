/**
 * @file Service multiempresa do BK-MF0-03.
 */

import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { bootstrapCompany } from "./companyBootstrapService.js";

/**
 * Cria uma empresa adicional para o ator autenticado sem alterar memberships
 * anteriores e ativa-a apenas no fim do bootstrap.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {object} input - Payload validado e identidade da sessão.
 * @returns {Promise<object>} Empresa e resumo do bootstrap.
 */
export function createAdditionalCompany(prisma, input) {
    return bootstrapCompany(prisma, { ...input, kind: "ADDITIONAL" });
}

/**
 * Serializa uma membership para o contrato público do contexto de empresa.
 *
 * @param {{ company: { id: string, name: string, nif: string | null }, role: string }} membership - Membership Prisma com empresa incluída.
 * @returns {{ companyId: string, companyName: string, nif: string | null, role: string }} Contexto público.
 */
function publicCompanyMembership(membership) {
    return {
        companyId: membership.company.id,
        companyName: membership.company.name,
        nif: membership.company.nif,
        role: membership.role,
    };
}

/**
 * Lista empresas onde o utilizador tem membership ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} userId - Utilizador autenticado.
 * @returns {Promise<Array<ReturnType<typeof publicCompanyMembership>>>} Empresas acessíveis.
 */
export async function listUserCompanies(prisma, userId) {
    const memberships = await prisma.companyMembership.findMany({
        where: { userId, isActive: true },
        include: { company: true },
        orderBy: { createdAt: "asc" },
    });

    return memberships.map(publicCompanyMembership);
}

/**
 * Define a empresa ativa na sessão atual.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ sessionId: string, userId: string, companyId: string }} input - Dados de sessão e empresa.
 * @returns {Promise<ReturnType<typeof publicCompanyMembership>>} Contexto ativo.
 */
export async function switchActiveCompany(
    prisma,
    { sessionId, userId, companyId },
) {
    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "company-admins", companyId);
        const membership = await tx.companyMembership.findFirst({
            where: { userId, companyId, isActive: true },
            include: { company: true },
        });
        if (!membership) {
            throw httpError(
                403,
                "COMPANY_FORBIDDEN",
                "Utilizador sem acesso a esta empresa",
            );
        }

        const updated = await tx.session.updateMany({
            where: { id: sessionId, userId, revokedAt: null },
            data: { activeCompanyId: companyId },
        });
        if (updated.count !== 1) {
            throw httpError(401, "INVALID_SESSION", "Sessão inválida ou expirada");
        }
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "COMPANY_CONTEXT_SWITCHED",
                entity: "CompanyMembership",
                entityId: membership.id,
                details: { changedFields: ["activeCompanyId"] },
            },
        });

        return publicCompanyMembership(membership);
    });
}

/**
 * Resolve o contexto de empresa ativa da sessão.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ userId: string, companyId: string | null | undefined }} input - Utilizador e empresa ativa.
 * @returns {Promise<ReturnType<typeof publicCompanyMembership>>} Contexto validado.
 */
export async function getCompanyContext(prisma, { userId, companyId }) {
    if (!companyId) {
        throw httpError(
            403,
            "COMPANY_CONTEXT_REQUIRED",
            "Empresa ativa obrigatória",
        );
    }

    const membership = await prisma.companyMembership.findFirst({
        where: { userId, companyId, isActive: true },
        include: { company: true },
    });

    if (!membership) {
        throw httpError(
            403,
            "COMPANY_FORBIDDEN",
            "Utilizador sem acesso a esta empresa",
        );
    }

    return publicCompanyMembership(membership);
}
