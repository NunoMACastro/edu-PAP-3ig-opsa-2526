import { toHttpError } from "../../lib/httpErrors.js";
import { readSessionCookie } from "./sessionCookie.js";
import { resolveSession } from "./authService.js";

export function requireAuth(prisma) {
    return async function authMiddleware(req, res, next) {
        try {
            const sessionId = readSessionCookie(req);
            const context = await resolveSession(prisma, sessionId);

            // Estes campos sao reutilizados pelos BKs de permissoes e multiempresa.
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