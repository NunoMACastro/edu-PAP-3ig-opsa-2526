/**
 * @file Controller de empresas e contexto ativo.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { validateSwitchCompanyPayload } from "./companyValidators.js";
import {
    getCompanyContext,
    listUserCompanies,
    switchActiveCompany,
} from "./companyService.js";

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
 * Constrói handlers HTTP para contexto multiempresa.
 * Os handlers listam empresas, trocam a empresa ativa e devolvem o contexto atual da sessão.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {{ list: Function, switchCompany: Function, context: Function }} Handlers.
 */
export function buildCompanyController({ prisma }) {
    return {
        /**
         * Lista empresas acessíveis ao utilizador autenticado.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async list(req, res) {
            try {
                const companies = await listUserCompanies(prisma, req.user.id);
                return res.status(200).json({ companies });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Troca a empresa ativa da sessão atual.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async switchCompany(req, res) {
            try {
                const input = validateSwitchCompanyPayload(req.body);
                const context = await switchActiveCompany(prisma, {
                    sessionId: req.session.id,
                    userId: req.user.id,
                    companyId: input.companyId,
                });
                return res.status(200).json({ context });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Devolve a empresa ativa atual.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async context(req, res) {
            try {
                const context = await getCompanyContext(prisma, {
                    userId: req.user.id,
                    companyId: req.session.activeCompanyId,
                });
                return res.status(200).json({ context });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
