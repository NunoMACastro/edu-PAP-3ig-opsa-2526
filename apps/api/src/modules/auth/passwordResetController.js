/**
 * @file Controller HTTP para recuperação de password.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { AUTH_RATE_LIMIT_POLICIES } from "./redisRateLimit.js";
import {
    validateForgotPasswordPayload,
    validateResetPasswordPayload,
} from "./passwordResetValidators.js";
import { requestPasswordReset, resetPassword } from "./passwordResetService.js";
import { hashSecurityAuditValue } from "../audit/securityAuditService.js";

/**
 * Envia uma resposta de erro JSON no formato canónico.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta JSON.
 */
function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

/**
 * Constrói handlers de recuperação de password.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, emailAdapter: object, rateLimiter: object }} deps - Dependências backend do controller.
 * @returns {{ forgot: Function, reset: Function }} Handlers Express.
 */
export function buildPasswordResetController({
    prisma,
    emailAdapter,
    rateLimiter,
}) {
    return {
        /**
         * Pede recuperação de password com resposta anti-enumeration.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async forgot(req, res) {
            try {
                const input = validateForgotPasswordPayload(req.body);
                await rateLimiter.consume(
                    "password-forgot-ip",
                    req.ip,
                    AUTH_RATE_LIMIT_POLICIES.PASSWORD_FORGOT_IP,
                );
                await rateLimiter.consume(
                    "password-forgot-account",
                    input.email,
                    AUTH_RATE_LIMIT_POLICIES.PASSWORD_FORGOT_ACCOUNT,
                );
                const result = await requestPasswordReset(
                    prisma,
                    emailAdapter,
                    {
                        ...input,
                        auditContext: {
                            ipHash: hashSecurityAuditValue(req.ip),
                            subjectHash: hashSecurityAuditValue(input.email),
                        },
                    },
                );
                return res.status(200).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Define nova password a partir de token válido.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async reset(req, res) {
            try {
                const input = validateResetPasswordPayload(req.body);
                await rateLimiter.consume(
                    "password-reset-ip",
                    req.ip,
                    AUTH_RATE_LIMIT_POLICIES.PASSWORD_RESET_IP,
                );
                const result = await resetPassword(prisma, {
                    ...input,
                    auditContext: { ipHash: hashSecurityAuditValue(req.ip) },
                });
                return res.status(200).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
