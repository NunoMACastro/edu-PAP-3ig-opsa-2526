/**
 * @file Rotas de importações de dados da MF3.
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
import { importBusinessData } from "./businessImportService.js";

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
 * Constrói o router de importações comerciais em lote.
 * Protege a criação de dados importados com autenticação, empresa ativa e permissão de escrita.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, multipartParser?: typeof parseSingleFileMultipart, businessImporter?: typeof importBusinessData }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildBusinessImportRoutes({
    prisma,
    multipartParser = parseSingleFileMultipart,
    businessImporter = importBusinessData,
}) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.IMPORTS_WRITE),
    ];

    router.post("/business-data", guards, async (req, res) => {
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
                allowedFields: ["type", "treasuryAccountId"],
            });
            validateUploadedFile(upload.file, "businessImport");
            const file = upload.file;
            const fields = upload.fields;
            fileBuffer = await readFile(file.tempPath);

            // A quarentena deixa de ser necessária assim que o buffer limitado
            // foi materializado; removê-la antes da transação evita resíduos.
            await cleanupMultipartUpload(upload);
            upload = null;

            result = await businessImporter(prisma, {
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
                    "A importação falhou e o cleanup da quarentena também falhou.",
                );
            }
        }
        if (failure) return sendError(res, failure);
        return res.status(201).json(result);
    });

    return router;
}
