/**
 * @file Rotas de lançamentos manuais da MF2.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import {
    measureDocumentInsertion,
    setDocumentPerformanceHeaders,
} from "../performance/documentPerformance.js";
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
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências backend usadas para montar guards e services contabilísticos.
 * @returns {import("express").Router} Router Express configurado para lançamentos manuais e anexos privados.
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

    router.post("/", writeGuards, async (req, res) => {
        try {
            const measured = await measureDocumentInsertion(() =>
                createManualJournal(
                    prisma,
                    req.companyId,
                    req.user.id,
                    req.body,
                ),
            );
            setDocumentPerformanceHeaders(res, measured);
            return res.status(201).json({ journalEntry: measured.result });
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
