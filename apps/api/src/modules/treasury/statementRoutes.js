/**
 * @file Rotas de importação de extratos bancários da MF3.
 */

import { Router } from "express";
import { readFile } from "node:fs/promises";
import { httpError, toHttpError } from "../../lib/httpErrors.js";
import {
    cleanupMultipartUpload,
    combineMultipartOperationAndCleanupError,
    parseSingleFileMultipart,
} from "../../lib/multipartUpload.js";
import { validateUploadedFile } from "../../lib/uploadPolicy.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    getBankStatementImport,
    importBankStatement,
    listBankStatementImports,
    suggestReconciliations,
} from "./statementImportService.js";

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
        .json({ error: response.code, message: response.message, details: response.details });
}

/**
 * Constrói o router de importação de extratos bancários.
 * Protege o envio de extratos e delega validação e reconciliação no service.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, multipartParser?: typeof parseSingleFileMultipart, statementImporter?: typeof importBankStatement }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildStatementRoutes({
    prisma,
    multipartParser = parseSingleFileMultipart,
    statementImporter = importBankStatement,
}) {
    const router = Router();
    const readGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.TREASURY_READ),
    ];
    const writeGuards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.TREASURY_WRITE),
    ];

    router.get("/statement-imports", readGuards, async (req, res) => {
        try {
            const result = await listBankStatementImports(prisma, {
                companyId: req.companyId,
                cursor: req.query.cursor,
                limit: req.query.limit,
            });
            return res.status(200).json(result);
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/statement-imports/:id", readGuards, async (req, res) => {
        try {
            const statementImport = await getBankStatementImport(prisma, {
                companyId: req.companyId,
                importId: req.params.id,
            });
            return res.status(200).json({ statementImport });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/statements/import", writeGuards, async (req, res) => {
        let upload;
        let fileBuffer;
        let result;
        let failure;
        try {
            if (!req.is("multipart/form-data")) {
                throw httpError(
                    415,
                    "MULTIPART_REQUIRED",
                    "A importação exige multipart/form-data.",
                );
            }
            upload = await multipartParser(req, {
                allowedFields: ["treasuryAccountId"],
            });
            validateUploadedFile(upload.file, "statementImport");
            const file = upload.file;
            const fields = upload.fields;
            fileBuffer = await readFile(file.tempPath);
            await cleanupMultipartUpload(upload);
            upload = null;

            result = await statementImporter(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                input: {
                    ...fields,
                    fileName: file.fileName,
                    fileBuffer,
                },
            });
        } catch (error) {
            failure = error;
        } finally {
            fileBuffer?.fill(0);
            try {
                await cleanupMultipartUpload(upload);
            } catch (cleanupError) {
                failure = combineMultipartOperationAndCleanupError(
                    failure,
                    cleanupError,
                    "A importação bancária falhou e o cleanup também falhou.",
                );
            }
        }
        if (failure) return sendError(res, failure);
        return res.status(201).json(result);
    });

    router.post("/reconciliations/suggestions", writeGuards, async (req, res) => {
        try {
            const result = await suggestReconciliations(prisma, {
                companyId: req.companyId,
                input: req.body,
            });
            res.set(
                "X-OPSA-Reconciliation-Duration-Ms",
                String(result.durationMs),
            );
            return res.status(200).json(result);
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
