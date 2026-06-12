/**
 * @file Service multiempresa do BK-MF0-03.
 */

import { httpError } from "../../lib/httpErrors.js";

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

    await prisma.session.update({
        where: { id: sessionId },
        data: { activeCompanyId: companyId },
    });

    return publicCompanyMembership(membership);
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
