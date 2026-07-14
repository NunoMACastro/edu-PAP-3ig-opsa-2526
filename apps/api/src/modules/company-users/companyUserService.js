/**
 * @file Service de gestão de utilizadores por empresa do BK-MF0-04.
 */

import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import {
    recordAuditLog,
    recordSensitiveAudit,
} from "../audit/auditLogService.js";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Aplica a hierarquia RF02/RF04 sem confiar apenas na permissão ampla users.manage.
 *
 * Um GESTOR pode administrar roles não administrativas, mas nunca criar uma
 * role ADMIN nem alterar/remover um membro ou convite ADMIN.
 *
 * @param {{ actorRole: string, targetRole?: string | null, requestedRole?: string | null }} input - Roles envolvidas na operação.
 * @returns {void}
 */
function assertRoleManagementAuthority({
    actorRole,
    targetRole = null,
    requestedRole = null,
}) {
    if (actorRole === "ADMIN") return;
    if (actorRole !== "GESTOR") {
        throw httpError(
            403,
            "PERMISSION_FORBIDDEN",
            "A role atual não pode gerir utilizadores",
        );
    }

    if (targetRole === "ADMIN") {
        throw httpError(
            403,
            "ADMIN_MEMBER_REQUIRES_ADMIN",
            "Apenas um ADMIN pode gerir membros ou convites ADMIN",
        );
    }
    if (requestedRole === "ADMIN") {
        throw httpError(
            403,
            "ADMIN_ROLE_REQUIRES_ADMIN",
            "Apenas um ADMIN pode atribuir a role ADMIN",
        );
    }
}

/**
 * Confirma que a role recebida do contexto HTTP ainda corresponde à membership.
 *
 * A verificação ocorre depois do lock de domínio para impedir que uma role
 * stale ou forjada seja usada numa operação privilegiada.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
 * @param {{ companyId: string, actorUserId: string, actorRole: string }} input - Ator autenticado.
 * @returns {Promise<string>} Role atual confirmada.
 */
async function confirmActorRole(tx, { companyId, actorUserId, actorRole }) {
    const actor = await tx.companyMembership.findFirst({
        where: { companyId, userId: actorUserId, isActive: true },
        select: { role: true },
    });
    if (!actor || actor.role !== actorRole) {
        throw httpError(
            403,
            "PERMISSION_FORBIDDEN",
            "A role atual não pode gerir utilizadores",
        );
    }
    return actor.role;
}

/**
 * Reduz um convite aos campos autorizados para a API de gestão.
 *
 * O hash do token e o identificador interno do autor nunca saem do service.
 *
 * @param {object} invitation - Registo Prisma completo ou parcial.
 * @returns {{ id: string, email: string, role: string, status: string, expiresAt: Date, acceptedAt: Date | null, revokedAt: Date | null, createdAt: Date, updatedAt: Date }} Convite público.
 */
function serializeInvitation(invitation) {
    return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        acceptedAt: invitation.acceptedAt ?? null,
        revokedAt: invitation.revokedAt ?? null,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
    };
}

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
 * @returns {Promise<void>}
 */
async function assertNotLastAdmin(prisma, { companyId, targetUserId, targetRole }) {
    if (targetRole !== "ADMIN") return;
    const activeAdmins = await prisma.companyMembership.count({
        where: { companyId, role: "ADMIN", isActive: true },
    });

    if (activeAdmins <= 1) {
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
 * Lista convites exclusivamente da empresa ativa, sem hashes ou tokens.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa derivada da sessão.
 * @returns {Promise<object[]>} Convites públicos, do mais recente para o mais antigo.
 */
export async function listCompanyInvitations(prisma, companyId) {
    const invitations = await prisma.companyInvitation.findMany({
        where: { companyId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 100,
    });
    return invitations.map(serializeInvitation);
}

/**
 * Cria convite para adicionar utilizador a uma empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ enqueueInvitation(tx: object, payload: object): Promise<object> }} emailAdapter - Adapter de outbox cifrada.
 * @param {{ companyId: string, actorUserId: string, actorRole: string, email: string, role: string, now?: Date }} input - Dados do convite.
 * @returns {Promise<object>} Convite público sem token ou hash.
 */
export async function inviteUser(
    prisma,
    emailAdapter,
    { companyId, actorUserId, actorRole, email, role, now = new Date() },
) {
    const token = createToken();
    const deliveryId = crypto.randomUUID();
    const invitation = await prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "company-invitation", companyId, email);
        const confirmedActorRole = await confirmActorRole(tx, {
            companyId,
            actorUserId,
            actorRole,
        });
        assertRoleManagementAuthority({
            actorRole: confirmedActorRole,
            requestedRole: role,
        });
        const existingUser = await tx.user.findUnique({ where: { email } });
        if (existingUser) {
            const membership = await tx.companyMembership.findFirst({
                where: { companyId, userId: existingUser.id, isActive: true },
            });
            if (membership) {
                throw httpError(
                    409,
                    "USER_ALREADY_IN_COMPANY",
                    "Utilizador já pertence à empresa",
                );
            }
        }
        const pending = await tx.companyInvitation.findFirst({
            where: { companyId, email, status: "PENDING" },
        });
        if (pending) {
            if (pending.expiresAt > now) {
                throw httpError(
                    409,
                    "INVITATION_ALREADY_PENDING",
                    "Já existe um convite pendente para este email",
                );
            }
            const expired = await tx.companyInvitation.updateMany({
                where: {
                    id: pending.id,
                    companyId,
                    status: "PENDING",
                    expiresAt: { lte: now },
                },
                data: { status: "EXPIRED" },
            });
            if (expired.count !== 1) {
                throw httpError(
                    409,
                    "STALE_STATE",
                    "O convite pendente foi alterado por outra operação",
                );
            }
        }
        const company = await tx.company.findUnique({ where: { id: companyId } });
        if (!company) {
            throw httpError(404, "COMPANY_NOT_FOUND", "Empresa não encontrada");
        }
        const created = await tx.companyInvitation.create({
            data: {
                companyId,
                email,
                role,
                tokenHash: hashToken(token),
                createdBy: actorUserId,
                expiresAt: new Date(now.getTime() + INVITATION_TTL_MS),
            },
        });
        await emailAdapter.enqueueInvitation(tx, {
            invitationId: created.id,
            deliveryId,
            email,
            companyName: company.name,
            token,
        });
        await recordAuditLog(tx, {
            companyId,
            userId: actorUserId,
            action: "company.invitation.create",
            entity: "CompanyInvitation",
            entityId: created.id,
            details: { role },
        });
        return created;
    });

    return serializeInvitation(invitation);
}

/**
 * Roda o token de um convite pendente, renova a validade e enfileira novo email.
 *
 * O claim inclui empresa, estado e hash anterior. Assim, aceitação, revogação
 * ou outro reenvio concorrente não pode confirmar um token já substituído.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ enqueueInvitation(tx: object, payload: object): Promise<object> }} emailAdapter - Adapter transacional de EmailOutbox.
 * @param {{ companyId: string, actorUserId: string, actorRole: string, invitationId: string, now?: Date }} input - Contexto autenticado.
 * @returns {Promise<object>} Convite público com nova expiração.
 */
export async function resendCompanyInvitation(
    prisma,
    emailAdapter,
    { companyId, actorUserId, actorRole, invitationId, now = new Date() },
) {
    const token = createToken();
    const tokenHash = hashToken(token);
    const deliveryId = crypto.randomUUID();
    const expiresAt = new Date(now.getTime() + INVITATION_TTL_MS);

    const invitation = await prisma.$transaction(async (tx) => {
        await acquireTransactionLock(
            tx,
            "company-invitation-id",
            companyId,
            invitationId,
        );
        const current = await tx.companyInvitation.findFirst({
            where: { id: invitationId, companyId },
            include: { company: { select: { name: true } } },
        });
        if (!current) {
            throw httpError(404, "INVITATION_NOT_FOUND", "Convite não encontrado");
        }
        const confirmedActorRole = await confirmActorRole(tx, {
            companyId,
            actorUserId,
            actorRole,
        });
        assertRoleManagementAuthority({
            actorRole: confirmedActorRole,
            targetRole: current.role,
        });
        if (current.status !== "PENDING") {
            throw httpError(
                409,
                "INVITATION_NOT_PENDING",
                "Apenas convites pendentes podem ser reenviados",
            );
        }

        const claimed = await tx.companyInvitation.updateMany({
            where: {
                id: invitationId,
                companyId,
                status: "PENDING",
                tokenHash: current.tokenHash,
            },
            data: {
                tokenHash,
                expiresAt,
                revokedAt: null,
            },
        });
        if (claimed.count !== 1) {
            throw httpError(
                409,
                "STALE_STATE",
                "O convite foi alterado por outra operação",
            );
        }

        await emailAdapter.enqueueInvitation(tx, {
            invitationId,
            deliveryId,
            email: current.email,
            companyName: current.company.name,
            token,
        });
        await recordAuditLog(tx, {
            companyId,
            userId: actorUserId,
            action: "company.invitation.resend",
            entity: "CompanyInvitation",
            entityId: invitationId,
            details: {
                role: current.role,
                previousExpiresAt: current.expiresAt.toISOString(),
                expiresAt: expiresAt.toISOString(),
            },
        });

        return tx.companyInvitation.findFirst({
            where: { id: invitationId, companyId },
        });
    });

    return serializeInvitation(invitation);
}

/**
 * Revoga um convite pendente e invalida imediatamente o token anterior.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, actorUserId: string, actorRole: string, invitationId: string, now?: Date }} input - Contexto autenticado.
 * @returns {Promise<object>} Convite público revogado.
 */
export async function revokeCompanyInvitation(
    prisma,
    { companyId, actorUserId, actorRole, invitationId, now = new Date() },
) {
    const invalidatedTokenHash = hashToken(createToken());
    const invitation = await prisma.$transaction(async (tx) => {
        await acquireTransactionLock(
            tx,
            "company-invitation-id",
            companyId,
            invitationId,
        );
        const current = await tx.companyInvitation.findFirst({
            where: { id: invitationId, companyId },
        });
        if (!current) {
            throw httpError(404, "INVITATION_NOT_FOUND", "Convite não encontrado");
        }
        const confirmedActorRole = await confirmActorRole(tx, {
            companyId,
            actorUserId,
            actorRole,
        });
        assertRoleManagementAuthority({
            actorRole: confirmedActorRole,
            targetRole: current.role,
        });
        if (current.status !== "PENDING") {
            throw httpError(
                409,
                "INVITATION_NOT_PENDING",
                "Apenas convites pendentes podem ser revogados",
            );
        }

        const claimed = await tx.companyInvitation.updateMany({
            where: {
                id: invitationId,
                companyId,
                status: "PENDING",
                tokenHash: current.tokenHash,
            },
            data: {
                status: "REVOKED",
                revokedAt: now,
                tokenHash: invalidatedTokenHash,
            },
        });
        if (claimed.count !== 1) {
            throw httpError(
                409,
                "STALE_STATE",
                "O convite foi alterado por outra operação",
            );
        }

        await recordAuditLog(tx, {
            companyId,
            userId: actorUserId,
            action: "company.invitation.revoke",
            entity: "CompanyInvitation",
            entityId: invitationId,
            details: { role: current.role, result: "revoked" },
        });
        return tx.companyInvitation.findFirst({
            where: { id: invitationId, companyId },
        });
    });

    return serializeInvitation(invitation);
}

/**
 * Atualiza a role de um membro da empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, actorUserId: string, actorRole: string, targetUserId: string, role: string }} input - Dados da alteração.
 * @returns {Promise<{ userId: string, role: string }>} Role atualizada.
 */
export async function updateCompanyUserRole(
    prisma,
    { companyId, actorUserId, actorRole, targetUserId, role },
) {
    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "company-admins", companyId);
        if (targetUserId === actorUserId) {
            throw httpError(
                409,
                "CANNOT_CHANGE_SELF_ROLE",
                "Não pode alterar a sua própria role",
            );
        }
        const confirmedActorRole = await confirmActorRole(tx, {
            companyId,
            actorUserId,
            actorRole,
        });
        const target = await tx.companyMembership.findFirst({
            where: { companyId, userId: targetUserId, isActive: true },
        });
        if (!target) {
            throw httpError(
                404,
                "USER_NOT_IN_COMPANY",
                "Utilizador não pertence à empresa",
            );
        }
        assertRoleManagementAuthority({
            actorRole: confirmedActorRole,
            targetRole: target.role,
            requestedRole: role,
        });
        if (role !== "ADMIN") {
            await assertNotLastAdmin(tx, {
                companyId,
                targetUserId,
                targetRole: target.role,
            });
        }

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

        // Alterar roles muda permissões efetivas; audita na mesma transação.
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
 * @param {{ companyId: string, targetUserId: string, actorUserId: string, actorRole: string }} input - Dados de remoção.
 * @returns {Promise<void>}
 */
export async function removeCompanyUser(
    prisma,
    { companyId, targetUserId, actorUserId, actorRole },
) {
    if (targetUserId === actorUserId) {
        throw httpError(
            409,
            "CANNOT_REMOVE_SELF",
            "Não pode remover a sua própria membership",
        );
    }

    await prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "company-admins", companyId);
        const confirmedActorRole = await confirmActorRole(tx, {
            companyId,
            actorUserId,
            actorRole,
        });
        const target = await tx.companyMembership.findFirst({
            where: { companyId, userId: targetUserId, isActive: true },
        });
        if (!target) {
            throw httpError(
                404,
                "USER_NOT_IN_COMPANY",
                "Utilizador não pertence à empresa",
            );
        }
        assertRoleManagementAuthority({
            actorRole: confirmedActorRole,
            targetRole: target.role,
        });
        await assertNotLastAdmin(tx, {
            companyId,
            targetUserId,
            targetRole: target.role,
        });
        const removed = await tx.companyMembership.updateMany({
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
        await recordSensitiveAudit(tx, {
            companyId,
            userId: actorUserId,
            action: "permissions.update",
            entity: "CompanyMembership",
            entityId: targetUserId,
            details: { result: "success", removed: true },
        });
    });
}
