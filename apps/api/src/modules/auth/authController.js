/**
 * @file Controller HTTP de autenticação.
 *
 * O controller é fino: valida request, chama service e escreve cookie/resposta.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import {
    validateLoginPayload,
    validateRegisterPayload,
} from "./authValidators.js";
import {
    loginUser,
    logoutUser,
    registerUser,
    resolveSession,
} from "./authService.js";
import {
    clearSessionCookie,
    readSessionCookie,
    setSessionCookie,
} from "./sessionCookie.js";
import { assertAuthRateLimit } from "./authRateLimit.js";
import { getPermissionsForRole } from "../permissions/permissions.js";

/**
 * Obtém contexto opcional de empresa ativa para `GET /auth/me`.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ userId: string, activeCompanyId: string | null }} session - Sessão segura.
 * @returns {Promise<{ companyId: string, companyName: string, role: string, permissions: string[] } | null>} Contexto ativo ou `null`.
 */
async function getOptionalCompanyContext(prisma, session) {
    if (!session.activeCompanyId) return null;

    const membership = await prisma.companyMembership.findFirst({
        where: {
            userId: session.userId,
            companyId: session.activeCompanyId,
            isActive: true,
        },
        include: { company: true },
    });

    if (!membership) return null;

    return {
        companyId: membership.companyId,
        companyName: membership.company.name,
        role: membership.role,
        permissions: getPermissionsForRole(membership.role),
    };
}

/**
 * Envia uma resposta de erro JSON no formato canónico da API.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta JSON enviada.
 */
function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

/**
 * Constrói handlers de autenticação com dependências injetadas.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, isProduction: boolean }} deps - Dependências do controller.
 * @returns {{ register: Function, login: Function, me: Function, logout: Function }} Handlers Express.
 */
export function buildAuthController({ prisma, isProduction }) {
    return {
        /**
         * Regista utilizador e cria cookie HttpOnly.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async register(req, res) {
            try {
                const input = validateRegisterPayload(req.body);
                assertAuthRateLimit(`register:${req.ip}`, { isProduction });
                const result = await registerUser(prisma, input);
                setSessionCookie(res, result.sessionId, isProduction);
                return res
                    .status(201)
                    .json({ user: result.user, expiresAt: result.expiresAt });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Autentica utilizador e cria cookie HttpOnly.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async login(req, res) {
            try {
                const input = validateLoginPayload(req.body);
                assertAuthRateLimit(`login:${req.ip}:${input.email}`, {
                    isProduction,
                });
                const result = await loginUser(prisma, input);
                setSessionCookie(res, result.sessionId, isProduction);
                return res
                    .status(200)
                    .json({ user: result.user, expiresAt: result.expiresAt });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Devolve o utilizador autenticado da sessão atual.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async me(req, res) {
            try {
                const sessionId = readSessionCookie(req);
                const result = await resolveSession(prisma, sessionId);
                const context = await getOptionalCompanyContext(
                    prisma,
                    result.session,
                );

                return res.status(200).json({
                    user: result.user,
                    activeCompanyId: context?.companyId ?? null,
                    role: context?.role ?? null,
                    permissions: context?.permissions ?? [],
                    company: context
                        ? {
                              id: context.companyId,
                              name: context.companyName,
                          }
                        : null,
                });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Revoga a sessão atual e limpa o cookie.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response | void>} Resposta HTTP.
         */
        async logout(req, res) {
            try {
                const sessionId = readSessionCookie(req);
                await logoutUser(prisma, sessionId);
                clearSessionCookie(res, isProduction);
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
