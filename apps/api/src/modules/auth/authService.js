import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { hashPassword, verifyPassword } from "./password.js";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function createSessionId() {
    return crypto.randomBytes(32).toString("hex");
}

function publicUser(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
    };
}

async function createSession(prisma, userId, now) {
    return prisma.session.create({
        data: {
            id: createSessionId(),
            userId,
            expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
        },
    });
}

export async function registerUser(prisma, input, now = new Date()) {
    const existing = await prisma.user.findUnique({
        where: { email: input.email },
    });
    if (existing) {
        throw httpError(
            409,
            "EMAIL_ALREADY_EXISTS",
            "Ja existe um utilizador com este email",
        );
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
        data: {
            email: input.email,
            name: input.name,
            passwordHash,
        },
    });

    const session = await createSession(prisma, user.id, now);
    return {
        user: publicUser(user),
        sessionId: session.id,
        expiresAt: session.expiresAt,
    };
}

export async function loginUser(prisma, input, now = new Date()) {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (!user || !user.isActive) {
        throw httpError(401, "INVALID_CREDENTIALS", "Credenciais invalidas");
    }

    const passwordMatches = await verifyPassword(
        input.password,
        user.passwordHash,
    );
    if (!passwordMatches) {
        throw httpError(401, "INVALID_CREDENTIALS", "Credenciais invalidas");
    }

    const session = await createSession(prisma, user.id, now);
    return {
        user: publicUser(user),
        sessionId: session.id,
        expiresAt: session.expiresAt,
    };
}

export async function resolveSession(prisma, sessionId, now = new Date()) {
    if (!sessionId) {
        throw httpError(401, "SESSION_REQUIRED", "Sessao obrigatoria");
    }

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
    });

    if (
        !session ||
        session.revokedAt ||
        session.expiresAt <= now ||
        !session.user.isActive
    ) {
        throw httpError(401, "INVALID_SESSION", "Sessao invalida ou expirada");
    }

    return { session, user: publicUser(session.user) };
}

export async function logoutUser(prisma, sessionId, now = new Date()) {
    if (!sessionId) return;

    await prisma.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: now },
    });
}