/**
 * @file Controller de períodos fiscais.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { validateFiscalPeriodPayload } from "./fiscalPeriodValidators.js";
import {
    closeFiscalPeriod,
    createFiscalPeriod,
    listFiscalPeriods,
} from "./fiscalPeriodService.js";

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
 * Constrói handlers de períodos fiscais.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {{ list: Function, create: Function, close: Function }} Handlers.
 */
export function buildFiscalPeriodController({ prisma }) {
    return {
        /**
         * Lista períodos fiscais da empresa ativa.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async list(req, res) {
            try {
                const periods = await listFiscalPeriods(prisma, req.companyId);
                return res.status(200).json({ periods });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Cria período fiscal aberto.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async create(req, res) {
            try {
                const input = validateFiscalPeriodPayload(req.body);
                const period = await createFiscalPeriod(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ period });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Fecha período fiscal existente.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async close(req, res) {
            try {
                const period = await closeFiscalPeriod(prisma, {
                    companyId: req.companyId,
                    periodId: req.params.id,
                    actorUserId: req.user.id,
                });
                return res.status(200).json({ period });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
