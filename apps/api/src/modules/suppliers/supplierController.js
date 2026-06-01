/**
 * @file Controller de fornecedores.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { validateSupplierPayload } from "./supplierValidators.js";
import {
    createSupplier,
    deactivateSupplier,
    listSuppliers,
    updateSupplier,
} from "./supplierService.js";

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
 * Constrói handlers de fornecedores.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {{ list: Function, create: Function, update: Function, remove: Function }} Handlers.
 */
export function buildSupplierController({ prisma }) {
    return {
        /**
         * Lista fornecedores ativos.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async list(req, res) {
            try {
                return res.status(200).json({
                    suppliers: await listSuppliers(prisma, req.companyId),
                });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Cria fornecedor.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async create(req, res) {
            try {
                const input = validateSupplierPayload(req.body);
                const supplier = await createSupplier(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ supplier });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Atualiza fornecedor.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async update(req, res) {
            try {
                const input = validateSupplierPayload(req.body);
                const supplier = await updateSupplier(
                    prisma,
                    req.companyId,
                    req.params.id,
                    input,
                );
                return res.status(200).json({ supplier });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Desativa fornecedor.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response | void>} Resposta HTTP.
         */
        async remove(req, res) {
            try {
                await deactivateSupplier(prisma, req.companyId, req.params.id);
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
