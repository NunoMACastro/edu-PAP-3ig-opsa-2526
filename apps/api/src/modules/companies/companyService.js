import { httpError } from "../../lib/httpErrors.js";

function publicCompanyMembership(membership) {
    return {
        companyId: membership.company.id,
        companyName: membership.company.name,
        nif: membership.company.nif,
        role: membership.role,
    };
}

export async function listUserCompanies(prisma, userId) {
    const memberships = await prisma.companyMembership.findMany({
        where: { userId, isActive: true },
        include: { company: true },
        orderBy: { createdAt: "asc" },
    });

    return memberships.map(publicCompanyMembership);
}

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

export async function getCompanyContext(prisma, { userId, companyId }) {
    if (!companyId) {
        throw httpError(
            403,
            "COMPANY_CONTEXT_REQUIRED",
            "Empresa ativa obrigatoria",
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