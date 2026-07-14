/**
 * @file Regras de autenticação do BK-MF0-01.
 *
 * O service não sabe nada de Express: recebe Prisma, dados validados e devolve
 * objetos seguros. Isto permite testar o domínio sem depender de HTTP.
 */

import crypto from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { recordSecurityAudit } from "../audit/securityAuditService.js";
import { hashPassword, verifyPassword } from "./password.js";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
// Hash bcrypt público e sem valor funcional: equaliza o custo para contas ausentes.
const DUMMY_PASSWORD_HASH =
    "$2b$12$FdSZxCvl5ocrno2o3ssxd.j4v6eStFa7Xk1iD6sRbIPmSnsag3EmO";

/**
 * Gera um identificador de sessão opaco e imprevisível.
 *
 * @returns {string} Identificador hexadecimal com entropia suficiente para sessão.
 */
function createSessionId() {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Remove campos sensíveis do modelo `User`.
 *
 * @param {{ id: string, email: string, name: string | null, isActive: boolean }} user - Utilizador Prisma.
 * @returns {{ id: string, email: string, name: string | null, isActive: boolean }} Utilizador seguro para resposta JSON.
 */
function publicUser(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
    };
}

/**
 * Remove relações e campos que não devem circular fora do service.
 *
 * @param {{ id: string, userId: string, activeCompanyId: string | null, expiresAt: Date, revokedAt: Date | null, createdAt: Date }} session - Sessão Prisma.
 * @returns {{ id: string, userId: string, activeCompanyId: string | null, expiresAt: Date, revokedAt: Date | null, createdAt: Date }} Sessão segura.
 */
function publicSession(session) {
    return {
        id: session.id,
        userId: session.userId,
        activeCompanyId: session.activeCompanyId,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt,
        createdAt: session.createdAt,
    };
}

/**
 * Cria uma sessão server-side para o utilizador autenticado.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} userId - Identificador do utilizador.
 * @param {Date} now - Data atual injetável para testes.
 * @returns {Promise<{ id: string, expiresAt: Date }>} Sessão persistida.
 */
async function createSession(prisma, userId, now) {
    return prisma.session.create({
        data: {
            id: createSessionId(),
            userId,
            expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
        },
    });
}

/**
 * Regista um novo utilizador e cria sessão inicial.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ email: string, password: string, name: string | null }} input - Dados validados.
 * @param {Date} [now] - Data atual injetável para testes.
 * @param now - Data de referência usada nos cálculos temporais.
 * @returns {Promise<{ user: ReturnType<typeof publicUser>, sessionId: string, expiresAt: Date }>} Resultado seguro.
 */
export async function registerUser(
    prisma,
    input,
    now = new Date(),
    auditContext = {},
) {
    const existing = await prisma.user.findUnique({
        where: { email: input.email },
    });
    if (existing) {
        throw httpError(
            409,
            "EMAIL_ALREADY_EXISTS",
            "Já existe um utilizador com este email",
        );
    }

    const passwordHash = await hashPassword(input.password);
    try {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: input.email,
                    name: input.name,
                    passwordHash,
                },
            });
            const session = await createSession(tx, user.id, now);
            await recordSecurityAudit(tx, {
                actorUserId: user.id,
                event: "auth.register",
                outcome: "SUCCESS",
                ipHash: auditContext.ipHash,
                subjectHash: auditContext.subjectHash,
            });
            return {
                user: publicUser(user),
                sessionId: session.id,
                expiresAt: session.expiresAt,
            };
        });
    } catch (error) {
        if (error?.code === "P2002") {
            throw httpError(
                409,
                "EMAIL_ALREADY_EXISTS",
                "Já existe um utilizador com este email",
            );
        }
        throw error;
    }
}

/**
 * Autentica um utilizador existente e cria nova sessão.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ email: string, password: string }} input - Credenciais validadas.
 * @param {Date} [now] - Data atual injetável para testes.
 * @param now - Data de referência usada nos cálculos temporais.
 * @returns {Promise<{ user: ReturnType<typeof publicUser>, sessionId: string, expiresAt: Date }>} Resultado seguro.
 */
export async function loginUser(
    prisma,
    input,
    now = new Date(),
    auditContext = {},
) {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });

    const passwordMatches = await verifyPassword(
        input.password,
        user?.isActive ? user.passwordHash : DUMMY_PASSWORD_HASH,
    );
    if (!user?.isActive || !passwordMatches) {
        await recordSecurityAudit(prisma, {
            actorUserId: user?.id,
            event: "auth.login",
            outcome: "DENIED",
            ipHash: auditContext.ipHash,
            subjectHash: auditContext.subjectHash,
        });
        throw httpError(401, "INVALID_CREDENTIALS", "Credenciais inválidas");
    }

    return prisma.$transaction(async (tx) => {
        const session = await createSession(tx, user.id, now);
        await recordSecurityAudit(tx, {
            actorUserId: user.id,
            event: "auth.login",
            outcome: "SUCCESS",
            ipHash: auditContext.ipHash,
            subjectHash: auditContext.subjectHash,
        });
        return {
            user: publicUser(user),
            sessionId: session.id,
            expiresAt: session.expiresAt,
        };
    });
}

/**
 * Resolve e valida uma sessão a partir do identificador do cookie.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string | null} sessionId - Valor do cookie `sid`.
 * @param {Date} [now] - Data atual injetável para testes.
 * @param now - Data de referência usada nos cálculos temporais.
 * @returns {Promise<{ session: object, user: ReturnType<typeof publicUser> }>} Sessão e utilizador seguros.
 */
export async function resolveSession(prisma, sessionId, now = new Date()) {
    if (!sessionId) {
        throw httpError(401, "SESSION_REQUIRED", "Sessão obrigatória");
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
        throw httpError(401, "INVALID_SESSION", "Sessão inválida ou expirada");
    }

    return { session: publicSession(session), user: publicUser(session.user) };
}

/**
 * Revoga a sessão atual.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string | null} sessionId - Valor do cookie `sid`.
 * @param {Date} [now] - Data de revogação.
 * @param now - Data de referência usada nos cálculos temporais.
 * @returns {Promise<void>}
 */
export async function logoutUser(
    prisma,
    sessionId,
    now = new Date(),
    auditContext = {},
) {
    if (!sessionId) return;

    await prisma.$transaction(async (tx) => {
        const session = await tx.session.findUnique({
            where: { id: sessionId },
            select: { userId: true },
        });
        const revoked = await tx.session.updateMany({
            where: { id: sessionId, revokedAt: null },
            data: { revokedAt: now },
        });
        if (session && revoked.count === 1) {
            await recordSecurityAudit(tx, {
                actorUserId: session.userId,
                event: "auth.logout",
                outcome: "SUCCESS",
                ipHash: auditContext.ipHash,
            });
        }
    });
}
