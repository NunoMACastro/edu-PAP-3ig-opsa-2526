/**
 * @file Middleware de autenticação para reutilização nos BKs seguintes.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { readSessionCookie } from "./sessionCookie.js";
import { resolveSession } from "./authService.js";

/**
 * Cria middleware Express que exige sessão válida.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function requireAuth(prisma) {
    /**
     * Valida sessão e injeta `req.session` e `req.user`.
     *
     * @param {import("express").Request} req - Pedido Express.
     * @param {import("express").Response} res - Resposta Express.
     * @param {import("express").NextFunction} next - Próximo middleware.
     * @returns {Promise<void | import("express").Response>} Resposta de erro ou continuação.
     */
    return async function authMiddleware(req, res, next) {
        try {
            const sessionId = readSessionCookie(req);
            const context = await resolveSession(prisma, sessionId);

            // Estes campos são reutilizados por permissões e multiempresa.
            req.session = context.session;
            req.user = context.user;
            return next();
        } catch (error) {
            const httpError = toHttpError(error);
            return res
                .status(httpError.status)
                .json({ error: httpError.code, message: httpError.message });
        }
    };
}
