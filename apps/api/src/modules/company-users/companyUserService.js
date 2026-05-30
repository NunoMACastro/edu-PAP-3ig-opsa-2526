import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function createToken() {
    return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

async function assertNotLastAdmin(prisma, { companyId, targetUserId }) {
    const activeAdmins = await prisma.companyMembership.count({
        where: { companyId, role: "ADMIN", isActive: true },
    });
    const target = await prisma.companyMembership.findFirst({
        where: { companyId, userId: targetUserId, isActive: true },
    });

    if (target?.role === "ADMIN" && activeAdmins <= 1) {
        throw httpError(
            409,
            "LAST_ADMIN",
            "Nao e possivel remover ou alterar o ultimo ADMIN ativo",
        );
    }
}

export async function listCompanyUsers(prisma, companyId) {
    const memberships = await prisma.companyMembership.findMany({
        where: { companyId, isActive: true },
        include: { user: true },
        orderBy: { createdAt: "asc" },
    });

    return memberships.map((membership) => ({
        userId: membership.userId,
        email: membership.user.email,
        name: membership.user.name,
        role: membership.role,
    }));
}

export async function inviteUser(
    prisma,
    emailAdapter,
    { companyId, actorUserId, email, role, now = new Date() },
) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        const existingMembership = await prisma.companyMembership.findFirst({
            where: { companyId, userId: existingUser.id, isActive: true },
        });
        if (existingMembership) {
            throw httpError(
                409,
                "USER_ALREADY_IN_COMPANY",
                "Utilizador ja pertence a empresa",
            );
        }
    }

    const company = await prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company)
        throw httpError(404, "COMPANY_NOT_FOUND", "Empresa nao encontrada");

    const token = createToken();
    const invitation = await prisma.companyInvitation.create({
        data: {
            companyId,
            email,
            role,
            tokenHash: hashToken(token),
            createdBy: actorUserId,
            expiresAt: new Date(now.getTime() + INVITATION_TTL_MS),
        },
    });

    await emailAdapter.sendInvitation({
        email,
        companyName: company.name,
        token,
    });

    return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
    };
}

export async function updateCompanyUserRole(
    prisma,
    { companyId, targetUserId, role },
) {
    await assertNotLastAdmin(prisma, { companyId, targetUserId });

    const updated = await prisma.companyMembership.updateMany({
        where: { companyId, userId: targetUserId, isActive: true },
        data: { role },
    });

    if (updated.count === 0) {
        throw httpError(
            404,
            "USER_NOT_IN_COMPANY",
            "Utilizador nao pertence a empresa",
        );
    }

    return { userId: targetUserId, role };
}

export async function removeCompanyUser(
    prisma,
    { companyId, targetUserId, actorUserId },
) {
    if (targetUserId === actorUserId) {
        throw httpError(
            409,
            "CANNOT_REMOVE_SELF",
            "Nao pode remover a sua propria membership",
        );
    }

    await assertNotLastAdmin(prisma, { companyId, targetUserId });

    const removed = await prisma.companyMembership.updateMany({
        where: { companyId, userId: targetUserId, isActive: true },
        data: { isActive: false },
    });

    if (removed.count === 0) {
        throw httpError(
            404,
            "USER_NOT_IN_COMPANY",
            "Utilizador nao pertence a empresa",
        );
    }
}