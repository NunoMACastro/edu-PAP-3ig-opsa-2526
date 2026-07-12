/**
 * @file Controller de fornecedores.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { validateSupplierPayload } from "./supplierValidators.js";
import {
    createSupplier,
    deactivateSupplier,
    listSuppliers,
    searchSuppliers,
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
 * Constrói handlers de fornecedores.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {{ list: Function, create: Function, update: Function, remove: Function }} Handlers.
 */
export function buildSupplierController({ prisma }) {
    return {
        /**
         * Lista fornecedores ativos da empresa atual.
         * Quando existe pesquisa, o controller escolhe o service próprio para filtrar resultados.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async list(req, res) {
            try {
                const search = normalizeSearch(req.query.search);
                const page = {
                    cursor: req.query.cursor,
                    limit: req.query.limit,
                };
                const result = search
                    ? await searchSuppliers(prisma, req.companyId, search, page)
                    : await listSuppliers(prisma, req.companyId, page);
                return res.status(200).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Cria um fornecedor depois de validar dados fiscais e comerciais.
         * O payload externo é normalizado antes de chegar à camada de persistência.
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
                    req.user.id,
                );
                return res.status(201).json({ supplier });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Atualiza um fornecedor pertencente à empresa ativa.
         * A operação reutiliza a validação de criação para manter o mesmo contrato de dados.
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
                    req.user.id,
                );
                return res.status(200).json({ supplier });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Desativa um fornecedor sem apagar histórico de compras.
         * O service confirma a pertença à empresa antes de aplicar a alteração.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response | void>} Resposta HTTP.
         */
        async remove(req, res) {
            try {
                await deactivateSupplier(
                    prisma,
                    req.companyId,
                    req.params.id,
                    req.user.id,
                );
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
