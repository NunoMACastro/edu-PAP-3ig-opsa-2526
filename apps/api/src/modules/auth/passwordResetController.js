import { toHttpError } from "../../lib/httpErrors.js";
import { assertPasswordResetRateLimit } from "./passwordResetRateLimit.js";
import {
    validateForgotPasswordPayload,
    validateResetPasswordPayload,
} from "./passwordResetValidators.js";
import { requestPasswordReset, resetPassword } from "./passwordResetService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildPasswordResetController({ prisma, emailAdapter }) {
    return {
        async forgot(req, res) {
            try {
                const input = validateForgotPasswordPayload(req.body);
                assertPasswordResetRateLimit(`${req.ip}:${input.email}`);
                const result = await requestPasswordReset(
                    prisma,
                    emailAdapter,
                    input,
                );
                return res.status(200).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },

        async reset(req, res) {
            try {
                const input = validateResetPasswordPayload(req.body);
                const result = await resetPassword(prisma, input);
                return res.status(200).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}