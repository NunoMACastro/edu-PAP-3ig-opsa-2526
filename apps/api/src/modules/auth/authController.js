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

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildAuthController({ prisma, isProduction }) {
    return {
        async register(req, res) {
            try {
                const input = validateRegisterPayload(req.body);
                const result = await registerUser(prisma, input);
                setSessionCookie(res, result.sessionId, isProduction);
                return res
                    .status(201)
                    .json({ user: result.user, expiresAt: result.expiresAt });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async login(req, res) {
            try {
                const input = validateLoginPayload(req.body);
                const result = await loginUser(prisma, input);
                setSessionCookie(res, result.sessionId, isProduction);
                return res
                    .status(200)
                    .json({ user: result.user, expiresAt: result.expiresAt });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async me(req, res) {
            try {
                const sessionId = readSessionCookie(req);
                const result = await resolveSession(prisma, sessionId);
                return res.status(200).json({ user: result.user });
            } catch (error) {
                return sendError(res, error);
            }
        },

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