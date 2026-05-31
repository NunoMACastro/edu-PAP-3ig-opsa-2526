import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { hashPassword } from "./password.js";

const RESET_TTL_MS = 30 * 60 * 1000;
const GENERIC_RESPONSE = { ok: true };

function createToken() {
    return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(
    prisma,
    emailAdapter,
    { email, now = new Date() },
) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Resposta generica: nao revelar se o email existe.
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
            "Token invalido ou expirado",
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