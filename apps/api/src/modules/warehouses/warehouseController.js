/**
 * @file Controller de armazéns e localizações.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import {
    validateWarehouseLocationPayload,
    validateWarehousePayload,
} from "./warehouseValidators.js";
import {
    createWarehouse,
    createWarehouseLocation,
    listWarehouseLocations,
    listWarehouses,
} from "./warehouseService.js";

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
 * Constrói handlers de armazéns.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {{ list: Function, create: Function, listLocations: Function, createLocation: Function }} Handlers.
 */
export function buildWarehouseController({ prisma }) {
    return {
        /**
         * Lista armazéns ativos da empresa atual.
         * A resposta é usada por inventário, movimentos e formulários logísticos.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async list(req, res) {
            try {
                return res.status(200).json({
                    warehouses: await listWarehouses(prisma, req.companyId),
                });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Cria um armazém depois de validar código e nome.
         * O controller mantém a validação de entrada separada da regra de persistência.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async create(req, res) {
            try {
                const input = validateWarehousePayload(req.body);
                const warehouse = await createWarehouse(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ warehouse });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Lista localizações de um armazém.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async listLocations(req, res) {
            try {
                const locations = await listWarehouseLocations(
                    prisma,
                    req.companyId,
                    req.params.id,
                );
                return res.status(200).json({ locations });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Cria localização dentro de um armazém.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async createLocation(req, res) {
            try {
                const input = validateWarehouseLocationPayload(req.body);
                const location = await createWarehouseLocation(
                    prisma,
                    req.companyId,
                    req.params.id,
                    input,
                );
                return res.status(201).json({ location });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
