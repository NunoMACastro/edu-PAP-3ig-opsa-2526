/**
 * @file Controller de artigos e serviços.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { validateItemPayload } from "./itemValidators.js";
import {
    createItem,
    deactivateItem,
    listItems,
    updateItem,
} from "./itemService.js";

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
 * Constrói handlers de itens.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {{ list: Function, create: Function, update: Function, remove: Function }} Handlers.
 */
export function buildItemController({ prisma }) {
    return {
        /**
         * Lista artigos e serviços ativos da empresa atual.
         * A resposta alimenta formulários comerciais e movimentos sem expor itens desativados.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async list(req, res) {
            try {
                return res
                    .status(200)
                    .json({ items: await listItems(prisma, req.companyId) });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Cria um artigo ou serviço depois de validar o payload.
         * O controller delega no service a persistência e a proteção por empresa.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async create(req, res) {
            try {
                const input = validateItemPayload(req.body);
                const item = await createItem(prisma, req.companyId, input);
                return res.status(201).json({ item });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Atualiza um artigo ou serviço existente da empresa ativa.
         * A validação mantém preços, tipo e campos fiscais dentro do contrato esperado.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async update(req, res) {
            try {
                const input = validateItemPayload(req.body);
                const item = await updateItem(
                    prisma,
                    req.companyId,
                    req.params.id,
                    input,
                );
                return res.status(200).json({ item });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Desativa um artigo ou serviço sem remover documentos antigos.
         * Esta operação preserva histórico e impede novas utilizações por listagens ativas.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response | void>} Resposta HTTP.
         */
        async remove(req, res) {
            try {
                await deactivateItem(prisma, req.companyId, req.params.id);
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
