/**
 * @file Controller do onboarding inicial.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { createInitialCompany } from "./onboardingService.js";
import { validateOnboardingPayload } from "./onboardingValidators.js";

/**
 * Constrói o handler com dependências injetadas.
 *
 * @param {{ prisma: object }} deps - Dependências.
 * @returns {{ createCompany: Function }} Handler Express.
 */
export function buildOnboardingController({ prisma }) {
    return {
        async createCompany(req, res) {
            try {
                const input = validateOnboardingPayload(req.body);
                const result = await createInitialCompany(prisma, {
                    ...input,
                    userId: req.user.id,
                    sessionId: req.session.id,
                });
                return res.status(201).json(result);
            } catch (error) {
                const normalized = toHttpError(error);
                return res.status(normalized.status).json({
                    error: normalized.code,
                    message: normalized.message,
                });
            }
        },
    };
}
