/**
 * @file Guards de autorização para roles e permissões.
 */

import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { hasPermission } from "./permissions.js";

/**
 * Exige que a role ativa esteja na lista permitida.
 *
 * @param {...string} allowedRoles - Roles canónicas autorizadas.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function requireRole(...allowedRoles) {
    /**
     * Bloqueia utilizadores sem role ativa adequada.
     *
     * @param {import("express").Request} req - Pedido Express.
     * @param {import("express").Response} res - Resposta Express.
     * @param {import("express").NextFunction} next - Próximo middleware.
     * @returns {void | import("express").Response} Resultado do middleware.
     */
    return function roleMiddleware(req, res, next) {
        try {
            if (!req.user) {
                throw httpError(401, "SESSION_REQUIRED", "Sessão obrigatória");
            }
            if (!allowedRoles.includes(req.role)) {
                throw httpError(
                    403,
                    "ROLE_FORBIDDEN",
                    "Papel sem acesso a esta operação",
                );
            }

            return next();
        } catch (error) {
            const httpErrorResponse = toHttpError(error);
            return res.status(httpErrorResponse.status).json({
                error: httpErrorResponse.code,
                message: httpErrorResponse.message,
            });
        }
    };
}

/**
 * Exige que a role ativa tenha a permissão indicada.
 *
 * @param {string} permission - Permissão funcional necessária.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function requirePermission(permission) {
    /**
     * Bloqueia pedidos sem permissão suficiente.
     *
     * @param {import("express").Request} req - Pedido Express.
     * @param {import("express").Response} res - Resposta Express.
     * @param {import("express").NextFunction} next - Próximo middleware.
     * @returns {void | import("express").Response} Resultado do middleware.
     */
    return function permissionMiddleware(req, res, next) {
        try {
            if (!req.user) {
                throw httpError(401, "SESSION_REQUIRED", "Sessão obrigatória");
            }
            if (!req.role || !hasPermission(req.role, permission)) {
                throw httpError(
                    403,
                    "PERMISSION_FORBIDDEN",
                    "Permissão insuficiente",
                );
            }

            return next();
        } catch (error) {
            const httpErrorResponse = toHttpError(error);
            return res.status(httpErrorResponse.status).json({
                error: httpErrorResponse.code,
                message: httpErrorResponse.message,
            });
        }
    };
}
