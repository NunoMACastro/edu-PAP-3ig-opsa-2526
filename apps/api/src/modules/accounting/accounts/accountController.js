/**
 * @file Controller do plano de contas.
 */

import { toHttpError } from "../../../lib/httpErrors.js";
import {
    validateAccountPayload,
    validateImportPayload,
} from "./accountValidators.js";
import {
    createAccount,
    importAccountsFromRows,
    listAccounts,
} from "./accountService.js";

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
 * Constrói handlers de contas.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {{ list: Function, create: Function, importRows: Function }} Handlers.
 */
export function buildAccountController({ prisma }) {
    return {
        /**
         * Lista contas da empresa ativa.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async list(req, res) {
            try {
                const accounts = await listAccounts(prisma, req.companyId);
                return res.status(200).json({ accounts });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Cria uma conta SNC manual para a empresa ativa.
         * O controller valida o código e a natureza da conta antes de delegar a criação.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async create(req, res) {
            try {
                const input = validateAccountPayload(req.body);
                const account = await createAccount(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ account });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Importa linhas de contas já normalizadas.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async importRows(req, res) {
            try {
                const rows = validateImportPayload(req.body);
                const result = await importAccountsFromRows(
                    prisma,
                    req.companyId,
                    rows,
                );
                return res.status(201).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
