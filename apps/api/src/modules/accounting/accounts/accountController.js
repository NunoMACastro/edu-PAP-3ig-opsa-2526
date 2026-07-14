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
    updateAccountSaftMetadata,
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
 * @returns {{ list: Function, create: Function, importRows: Function, updateSaftMetadata: Function }} Handlers.
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
                const result = await listAccounts(prisma, req.companyId, {
                    cursor: req.query.cursor,
                    limit: req.query.limit,
                });
                return res.status(200).json(result);
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
                    {
                        companyId: req.companyId,
                        userId: req.user.id,
                        input,
                    },
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
                    {
                        companyId: req.companyId,
                        userId: req.user.id,
                        rows,
                    },
                );
                return res.status(201).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Atualiza apenas a classificação SAF-T da conta.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async updateSaftMetadata(req, res) {
            try {
                const account = await updateAccountSaftMetadata(prisma, {
                    companyId: req.companyId,
                    userId: req.user.id,
                    accountId: req.params.id,
                    input: req.body,
                });
                return res.status(200).json({ account });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
