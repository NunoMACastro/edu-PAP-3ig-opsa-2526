import { toHttpError } from "../../lib/httpErrors.js";
import {
    validateInvitationPayload,
    validateRolePayload,
} from "./companyUserValidators.js";
import {
    inviteUser,
    listCompanyUsers,
    removeCompanyUser,
    updateCompanyUserRole,
} from "./companyUserService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildCompanyUserController({ prisma, emailAdapter }) {
    return {
        async list(req, res) {
            try {
                const users = await listCompanyUsers(prisma, req.companyId);
                return res.status(200).json({ users });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async invite(req, res) {
            try {
                const input = validateInvitationPayload(req.body);
                const invitation = await inviteUser(prisma, emailAdapter, {
                    companyId: req.companyId,
                    actorUserId: req.user.id,
                    ...input,
                });
                return res.status(201).json({ invitation });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async updateRole(req, res) {
            try {
                const input = validateRolePayload(req.body);
                const result = await updateCompanyUserRole(prisma, {
                    companyId: req.companyId,
                    targetUserId: req.params.id,
                    role: input.role,
                });
                return res.status(200).json({ user: result });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async remove(req, res) {
            try {
                await removeCompanyUser(prisma, {
                    companyId: req.companyId,
                    targetUserId: req.params.id,
                    actorUserId: req.user.id,
                });
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}