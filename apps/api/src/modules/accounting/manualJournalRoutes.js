/**
 * @file Rotas de lançamentos manuais da MF2.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    addManualJournalAttachment,
    createManualJournal,
    getManualJournal,
    updateManualJournal,
} from "./manualJournalService.js";
import {
    measureDocumentInsert,
    toDocumentInsertLog,
} from "../performance/documentPerformance.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param res - Resposta Express usada para enviar o erro ao cliente.
 * @param error - Erro capturado durante a operação.
 * @returns Resposta HTTP de erro enviada no formato JSON contratado.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/**
 * Monta as rotas Express de lançamentos manuais, incluindo anexos privados.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Router Express configurado para lançamentos manuais.
 */
export function buildManualJournalRoutes({ prisma }) {
    const router = Router();
    const readGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_READ),
    ];
    const writeGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.ACCOUNTING_WRITE),
    ];

    /**
     * Cria um lançamento manual e mede a duração preservando validações contabilísticas.
     *
     * @param {import("express").Request} req - Pedido autenticado com empresa ativa, utilizador e payload do lançamento.
     * @param {import("express").Response} res - Resposta HTTP que mantém o contrato `{ journalEntry }` e acrescenta cabeçalhos de performance.
     * @returns {Promise<import("express").Response>} Resposta `201` ou erro normalizado sem expor dados contabilísticos sensíveis.
     */
    router.post("/", writeGuards, async (req, res) => {
        try {
            const { result: journalEntry, metric } = await measureDocumentInsert(
                "accounting.manualJournal.create",
                async () =>
                    // O lançamento manual continua a validar contas SNC, equilíbrio e período fiscal no backend.
                    createManualJournal(prisma, req.companyId, req.user.id, req.body),
            );

            console.info(toDocumentInsertLog(metric));
            // A métrica mede a criação, mas não substitui a auditoria contabilística do service.
            res.set("X-OPSA-Duration-Ms", String(metric.durationMs));
            res.set("X-OPSA-Within-Budget", String(metric.withinBudget));

            return res.status(201).json({ journalEntry });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/:id", readGuards, async (req, res) => {
        try {
            const journalEntry = await getManualJournal(
                prisma,
                req.companyId,
                req.params.id,
            );
            return res.status(200).json({ journalEntry });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id", writeGuards, async (req, res) => {
        try {
            const journalEntry = await updateManualJournal(
                prisma,
                req.companyId,
                req.user.id,
                req.params.id,
                req.body,
            );
            return res.status(200).json({ journalEntry });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/:id/attachments", writeGuards, async (req, res) => {
        try {
            const attachment = await addManualJournalAttachment(
                prisma,
                req.companyId,
                req.user.id,
                req.params.id,
                req.body,
            );
            return res.status(201).json({ attachment });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
