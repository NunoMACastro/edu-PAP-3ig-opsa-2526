/**
 * @file Controller de utilizadores da empresa.
 */

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

/**
 * Envia erro JSON seguro.
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
 * Constrói handlers de gestão de membros da empresa.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, emailAdapter: object }} deps - Dependências.
 * @returns {{ list: Function, invite: Function, updateRole: Function, remove: Function }} Handlers.
 */
export function buildCompanyUserController({ prisma, emailAdapter }) {
    return {
        /**
         * Lista membros da empresa ativa.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async list(req, res) {
            try {
                const users = await listCompanyUsers(prisma, req.companyId);
                return res.status(200).json({ users });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Cria convite para novo membro.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
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

        /**
         * Atualiza role de um membro da empresa.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async updateRole(req, res) {
            try {
                const input = validateRolePayload(req.body);
                const result = await updateCompanyUserRole(prisma, {
                    companyId: req.companyId,
                    actorUserId: req.user.id,
                    targetUserId: req.params.id,
                    role: input.role,
                });
                return res.status(200).json({ user: result });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Remove membership ativa de um utilizador.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response | void>} Resposta HTTP.
         */
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
