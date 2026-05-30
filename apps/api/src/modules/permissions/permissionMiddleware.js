import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { hasPermission } from "./permissions.js";

export function requireRole(...allowedRoles) {
    return function roleMiddleware(req, res, next) {
        try {
            if (!req.user)
                throw httpError(401, "SESSION_REQUIRED", "Sessao obrigatoria");
            if (!allowedRoles.includes(req.role)) {
                throw httpError(
                    403,
                    "ROLE_FORBIDDEN",
                    "Papel sem acesso a esta operacao",
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

export function requirePermission(permission) {
    return function permissionMiddleware(req, res, next) {
        try {
            if (!req.user)
                throw httpError(401, "SESSION_REQUIRED", "Sessao obrigatoria");
            if (!req.role || !hasPermission(req.role, permission)) {
                throw httpError(
                    403,
                    "PERMISSION_FORBIDDEN",
                    "Permissao insuficiente",
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