/**
 * @file Service de recuperação de password do BK-MF0-05.
 */

import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { hashPassword } from "./password.js";

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
 * @param {{ sendPasswordReset(payload: { email: string, token: string }): Promise<void> }} emailAdapter - Adapter de email.
 * @param {{ email: string, now?: Date }} input - Email normalizado e data opcional.
 * @returns {Promise<{ ok: true }>} Resposta genérica anti-enumeration.
 */
export async function requestPasswordReset(
    prisma,
    emailAdapter,
    { email, now = new Date() },
) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Resposta genérica: não revelar se o email existe ou está ativo.
    if (!user || !user.isActive) return GENERIC_RESPONSE;

    const token = createToken();
    await prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(token),
            expiresAt: new Date(now.getTime() + RESET_TTL_MS),
        },
    });

    await emailAdapter.sendPasswordReset({ email: user.email, token });
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
    { token, password, now = new Date() },
) {
    const tokenHash = hashToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
        throw httpError(
            400,
            "INVALID_RESET_TOKEN",
            "Token inválido ou expirado",
        );
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        }),
        prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { usedAt: now },
        }),
        prisma.session.updateMany({
            where: { userId: resetToken.userId, revokedAt: null },
            data: { revokedAt: now },
        }),
    ]);

    return GENERIC_RESPONSE;
}
