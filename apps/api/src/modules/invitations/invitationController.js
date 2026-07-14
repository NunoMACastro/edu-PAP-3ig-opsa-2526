/**
 * @file Controller HTTP de preview e aceitação de convites.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { acceptInvitation, previewInvitation } from "./invitationService.js";
import { validateInvitationTokenPayload } from "./invitationValidators.js";

function sendError(res, error) {
    const normalized = toHttpError(error);
    return res.status(normalized.status).json({
        error: normalized.code,
        message: normalized.message,
    });
}

/**
 * Constrói handlers com o cliente Prisma injetado.
 *
 * @param {{ prisma: object }} deps - Dependências.
 * @returns {{ preview: Function, accept: Function }} Handlers Express.
 */
export function buildInvitationController({ prisma }) {
    return {
        async preview(req, res) {
            try {
                const input = validateInvitationTokenPayload(req.body);
                return res.status(200).json({ invitation: await previewInvitation(prisma, input) });
            } catch (error) {
                return sendError(res, error);
            }
        },
        async accept(req, res) {
            try {
                const input = validateInvitationTokenPayload(req.body);
                const context = await acceptInvitation(prisma, {
                    ...input,
                    userId: req.user.id,
                    userEmail: req.user.email,
                    sessionId: req.session.id,
                });
                return res.status(200).json({ context });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
