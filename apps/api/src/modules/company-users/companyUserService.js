/**
 * @file Service de gestão de utilizadores por empresa do BK-MF0-04.
 */

import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { recordSensitiveAudit } from "../audit/auditLogService.js";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Gera token bruto para convite.
 *
 * @returns {string} Token secreto em hexadecimal.
 */
function createToken() {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Gera hash SHA-256 para guardar token de convite.
 *
 * @param {string} token - Token bruto.
 * @returns {string} Hash do token.
 */
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Impede remover ou alterar o último ADMIN ativo.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, targetUserId: string }} input - Empresa e utilizador alvo.
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {Promise<void>}
 */
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
            "Não é possível remover ou alterar o último ADMIN ativo",
        );
    }
}

/**
 * Lista utilizadores da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<Array<{ userId: string, email: string, name: string | null, role: string }>>} Membros ativos.
 */
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

/**
 * Cria convite para adicionar utilizador a uma empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ sendInvitation(payload: { email: string, companyName: string, token: string }): Promise<void> }} emailAdapter - Adapter de email.
 * @param {{ companyId: string, actorUserId: string, email: string, role: string, now?: Date }} input - Dados do convite.
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {Promise<{ id: string, email: string, role: string, status: string, expiresAt: Date }>} Convite público.
 */
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
                "Utilizador já pertence à empresa",
            );
        }
    }

    const company = await prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company) {
        throw httpError(404, "COMPANY_NOT_FOUND", "Empresa não encontrada");
    }

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

/**
 * Atualiza a role de um membro da empresa e audita a alteração sensível.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, actorUserId: string, targetUserId: string, role: string }} input - Dados da alteração.
 * @returns {Promise<{ userId: string, role: string }>} Role atualizada.
 */
export async function updateCompanyUserRole(
    prisma,
    { companyId, actorUserId, targetUserId, role },
) {
    return prisma.$transaction(async (tx) => {
        await assertNotLastAdmin(tx, { companyId, targetUserId });

        const updated = await tx.companyMembership.updateMany({
            where: { companyId, userId: targetUserId, isActive: true },
            data: { role },
        });

        if (updated.count === 0) {
            throw httpError(
                404,
                "USER_NOT_IN_COMPANY",
                "Utilizador não pertence à empresa",
            );
        }

        // A auditoria usa a mesma transação para não ficar sucesso sem alteração real.
        await recordSensitiveAudit(tx, {
            companyId,
            userId: actorUserId,
            action: "permissions.update",
            entity: "CompanyMembership",
            entityId: targetUserId,
            details: { result: "success", newRole: role },
        });

        return { userId: targetUserId, role };
    });
}

/**
 * Remove acesso de um utilizador à empresa sem apagar a conta global.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, targetUserId: string, actorUserId: string }} input - Dados de remoção.
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {Promise<void>}
 */
export async function removeCompanyUser(
    prisma,
    { companyId, targetUserId, actorUserId },
) {
    if (targetUserId === actorUserId) {
        throw httpError(
            409,
            "CANNOT_REMOVE_SELF",
            "Não pode remover a sua própria membership",
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
            "Utilizador não pertence à empresa",
        );
    }
}
