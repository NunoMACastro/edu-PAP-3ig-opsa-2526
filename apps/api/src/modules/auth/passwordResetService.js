/**
 * @file Service de recuperação de password do BK-MF0-05.
 */

import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { hashPassword } from "./password.js";
import { recordSecurityAudit } from "../audit/securityAuditService.js";

const RESET_TTL_MS = 30 * 60 * 1000;
const GENERIC_RESPONSE = { ok: true };

/**
 * Gera token bruto para link de recuperação.
 *
 * @returns {string} Token secreto em hexadecimal.
 */
function createToken() {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Gera hash SHA-256 do token para persistência segura.
 *
 * @param {string} token - Token bruto enviado por email.
 * @returns {string} Hash do token.
 */
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Cria token de recuperação sem revelar se o email existe.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ enqueuePasswordReset(tx: object, payload: object): Promise<object> }} emailAdapter - Adapter de outbox cifrada.
 * @param {{ email: string, now?: Date }} input - Email normalizado e data opcional.
 * @returns {Promise<{ ok: true }>} Resposta genérica anti-enumeration.
 */
export async function requestPasswordReset(
    prisma,
    emailAdapter,
    { email, now = new Date(), auditContext = {} },
) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Resposta genérica: não revelar se o email existe ou está ativo.
    if (!user || !user.isActive) {
        await recordSecurityAudit(prisma, {
            event: "auth.password_reset.request",
            outcome: "IGNORED",
            ipHash: auditContext.ipHash,
            subjectHash: auditContext.subjectHash,
        });
        return GENERIC_RESPONSE;
    }

    const token = createToken();
    const tokenHash = hashToken(token);
    await prisma.$transaction(async (tx) => {
        await tx.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(now.getTime() + RESET_TTL_MS),
            },
        });
        await emailAdapter.enqueuePasswordReset(tx, {
            email: user.email,
            token,
            tokenHash,
        });
        await recordSecurityAudit(tx, {
            actorUserId: user.id,
            event: "auth.password_reset.request",
            outcome: "QUEUED",
            ipHash: auditContext.ipHash,
            subjectHash: auditContext.subjectHash,
        });
    });
    return GENERIC_RESPONSE;
}

/**
 * Valida token de recuperação, altera password e revoga sessões antigas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ token: string, password: string, now?: Date }} input - Token e nova password.
 * @returns {Promise<{ ok: true }>} Resposta genérica de sucesso.
 */
export async function resetPassword(
    prisma,
    { token, password, now = new Date(), auditContext = {} },
) {
    const tokenHash = hashToken(token);
    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
        let resetToken = await tx.passwordResetToken.findUnique({
            where: { tokenHash },
        });
        if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
            throw httpError(
                400,
                "INVALID_RESET_TOKEN",
                "Token inválido ou expirado",
            );
        }

        await acquireTransactionLock(tx, "password-reset", resetToken.userId);

        // Outro token do mesmo utilizador pode ter sido consumido enquanto este
        // pedido esperava pelo lock. A releitura impede reutilizações cruzadas.
        resetToken = await tx.passwordResetToken.findUnique({
            where: { tokenHash },
        });
        if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
            throw httpError(
                400,
                "INVALID_RESET_TOKEN",
                "Token inválido ou expirado",
            );
        }

        const invalidated = await tx.passwordResetToken.updateMany({
            where: {
                userId: resetToken.userId,
                usedAt: null,
                expiresAt: { gt: now },
            },
            data: { usedAt: now },
        });
        if (invalidated.count < 1) {
            throw httpError(
                400,
                "INVALID_RESET_TOKEN",
                "Token inválido ou expirado",
            );
        }

        await tx.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        });
        await tx.session.updateMany({
            where: { userId: resetToken.userId, revokedAt: null },
            data: { revokedAt: now },
        });
        await recordSecurityAudit(tx, {
            actorUserId: resetToken.userId,
            event: "auth.password_reset.complete",
            outcome: "SUCCESS",
            ipHash: auditContext.ipHash,
        });
    });

    return GENERIC_RESPONSE;
}
