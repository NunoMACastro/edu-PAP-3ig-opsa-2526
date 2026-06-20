/**
 * @file Controller de clientes.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { validateCustomerPayload } from "./customerValidators.js";
import {
    createCustomer,
    deactivateCustomer,
    listCustomers,
    searchCustomers,
    updateCustomer,
} from "./customerService.js";

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
 * Normaliza query string opcional de pesquisa.
 *
 * @param {unknown} value - Valor de `req.query.search`.
 * @returns {string | undefined} Pesquisa normalizada.
 */
function normalizeSearch(value) {
    if (typeof value !== "string") return undefined;
    const search = value.trim();
    return search.length > 0 ? search : undefined;
}

/**
 * Constrói handlers de clientes.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @param props - Propriedades recebidas pelo componente React.
 * @returns {{ list: Function, create: Function, update: Function, remove: Function }} Handlers.
 */
export function buildCustomerController({ prisma }) {
    return {
        /**
         * Lista clientes ativos.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async list(req, res) {
            try {
                const search = normalizeSearch(req.query.search);
                return res.status(200).json({
                    customers: await (search
                        ? searchCustomers(prisma, req.companyId, search)
                        : listCustomers(prisma, req.companyId)),
                });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Cria cliente.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async create(req, res) {
            try {
                const input = validateCustomerPayload(req.body);
                const customer = await createCustomer(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ customer });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Atualiza cliente.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async update(req, res) {
            try {
                const input = validateCustomerPayload(req.body);
                const customer = await updateCustomer(
                    prisma,
                    req.companyId,
                    req.params.id,
                    input,
                );
                return res.status(200).json({ customer });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Desativa cliente.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response | void>} Resposta HTTP.
         */
        async remove(req, res) {
            try {
                await deactivateCustomer(prisma, req.companyId, req.params.id);
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
