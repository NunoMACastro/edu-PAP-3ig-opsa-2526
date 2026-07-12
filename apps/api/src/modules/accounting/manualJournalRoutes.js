/**
 * @file Rotas de lançamentos manuais da MF2.
 */

import { Router } from "express";
import { pipeline } from "node:stream/promises";
import { httpError, toHttpError } from "../../lib/httpErrors.js";
import {
    cleanupMultipartUpload,
    combineMultipartOperationAndCleanupError,
    parseSingleFileMultipart,
} from "../../lib/multipartUpload.js";
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
    getManualJournalAttachmentDownload,
    getManualJournal,
    listManualJournals,
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
 * @param {{ prisma: import("@prisma/client").PrismaClient, objectStorage: object }} deps - Dependências backend usadas para montar guards e services contabilísticos.
 * @returns {import("express").Router} Router Express configurado para lançamentos manuais e anexos privados.
 */
export function buildManualJournalRoutes({
    prisma,
    objectStorage,
    multipartParser = parseSingleFileMultipart,
    attachmentCreator = addManualJournalAttachment,
}) {
    if (!objectStorage) throw new TypeError("Object storage obrigatório.");
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

    router.get("/", readGuards, async (req, res) => {
        try {
            const page = await listManualJournals(prisma, req.companyId, req.query);
            return res.status(200).json({
                items: page.items,
                pageInfo: page.pageInfo,
                // Alias transitório para o consumidor MF2 anterior ao envelope comum.
                journalEntries: page.items,
            });
        } catch (error) {
            return sendError(res, error);
        }
    });

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
        let upload;
        let attachment;
        let failure;
        try {
            if (!req.is("multipart/form-data")) {
                throw httpError(
                    415,
                    "MULTIPART_REQUIRED",
                    "O anexo exige multipart/form-data.",
                );
            }
            upload = await multipartParser(req, { allowedFields: [] });
            attachment = await attachmentCreator(
                prisma,
                objectStorage,
                req.companyId,
                req.user.id,
                req.params.id,
                upload.file,
            );
        } catch (error) {
            failure = error;
        } finally {
            try {
                await cleanupMultipartUpload(upload);
            } catch (cleanupError) {
                failure = combineMultipartOperationAndCleanupError(
                    failure,
                    cleanupError,
                    "O anexo falhou e o cleanup da quarentena também falhou.",
                );
            }
        }
        if (failure) return sendError(res, failure);
        return res.status(201).json({ attachment });
    });

    router.get(
        "/:journalId/attachments/:attachmentId/download",
        readGuards,
        async (req, res) => {
            try {
                const result = await getManualJournalAttachmentDownload(
                    prisma,
                    objectStorage,
                    {
                        companyId: req.companyId,
                        journalEntryId: req.params.journalId,
                        attachmentId: req.params.attachmentId,
                    },
                );
                const safeName = String(result.attachment.fileName ?? "attachment")
                    .replace(/[\r\n"\\/]/g, "_")
                    .slice(0, 180);
                res.status(200);
                res.set("Content-Type", result.attachment.mimeType);
                res.set(
                    "Content-Disposition",
                    `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
                );
                res.set("X-Content-Type-Options", "nosniff");
                res.set("Cache-Control", "no-store");
                if (result.object.contentLength != null) {
                    res.set("Content-Length", String(result.object.contentLength));
                }
                await pipeline(result.object.body, res);
                return res;
            } catch (error) {
                if (res.headersSent) {
                    res.destroy(error);
                    return res;
                }
                return sendError(res, error);
            }
        }
    );

    return router;
}
