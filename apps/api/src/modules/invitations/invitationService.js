/**
 * @file Preview e aceitação transacional de convites de empresa.
 */

import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { recordAuditLog } from "../audit/auditLogService.js";

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function maskEmail(email) {
    const [local, domain] = email.split("@");
    return `${local.slice(0, 1)}***@${domain}`;
}

function assertUsableInvitation(invitation, now) {
    if (!invitation || invitation.status !== "PENDING") {
        throw httpError(404, "INVITATION_NOT_FOUND", "Convite não encontrado");
    }
    if (invitation.expiresAt <= now) {
        throw httpError(410, "INVITATION_EXPIRED", "Convite expirado");
    }
}

/**
 * Devolve contexto mínimo antes de autenticar, sem expor o endereço completo.
 *
 * @param {object} prisma - Cliente Prisma.
 * @param {{ token: string, now?: Date }} input - Token e relógio de referência.
 * @returns {Promise<object>} Preview seguro.
 */
export async function previewInvitation(prisma, { token, now = new Date() }) {
    const invitation = await prisma.companyInvitation.findUnique({
        where: { tokenHash: hashToken(token) },
        include: { company: true },
    });
    assertUsableInvitation(invitation, now);
    return {
        companyName: invitation.company.name,
        role: invitation.role,
        emailMasked: maskEmail(invitation.email),
        expiresAt: invitation.expiresAt,
    };
}

/**
 * Reclama um convite uma única vez e ativa membership e empresa da sessão.
 *
 * @param {object} prisma - Cliente Prisma.
 * @param {{ token: string, userId: string, userEmail: string, sessionId: string, now?: Date }} input - Identidade autenticada.
 * @returns {Promise<object>} Novo contexto de empresa.
 */
export async function acceptInvitation(
    prisma,
    { token, userId, userEmail, sessionId, now = new Date() },
) {
    const tokenHash = hashToken(token);
    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "company-invitation-token", tokenHash);
        const invitation = await tx.companyInvitation.findUnique({
            where: { tokenHash },
            include: { company: true },
        });
        assertUsableInvitation(invitation, now);
        if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw httpError(
                403,
                "INVITATION_EMAIL_MISMATCH",
                "O convite pertence a outro endereço de email",
            );
        }
        const claimed = await tx.companyInvitation.updateMany({
            where: {
                id: invitation.id,
                status: "PENDING",
                tokenHash,
                acceptedById: null,
                expiresAt: { gt: now },
            },
            data: { status: "ACCEPTED", acceptedById: userId, acceptedAt: now },
        });
        if (claimed.count !== 1) {
            throw httpError(409, "INVITATION_ALREADY_USED", "Convite já utilizado");
        }
        const membership = await tx.companyMembership.upsert({
            where: { userId_companyId: { userId, companyId: invitation.companyId } },
            create: { userId, companyId: invitation.companyId, role: invitation.role },
            update: { role: invitation.role, isActive: true },
        });
        const session = await tx.session.updateMany({
            where: { id: sessionId, userId, revokedAt: null },
            data: { activeCompanyId: invitation.companyId },
        });
        if (session.count !== 1) {
            throw httpError(401, "INVALID_SESSION", "Sessão inválida ou expirada");
        }
        await recordAuditLog(tx, {
            companyId: invitation.companyId,
            userId,
            action: "company.invitation.accept",
            entity: "CompanyInvitation",
            entityId: invitation.id,
            details: { role: membership.role },
        });
        return {
            companyId: invitation.companyId,
            companyName: invitation.company.name,
            role: membership.role,
        };
    });
}
