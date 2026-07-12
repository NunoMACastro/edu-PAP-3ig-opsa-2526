/**
 * @file Rotas privadas do contrato assíncrono de exportação SAF-T.
 */

import { readFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Router } from "express";
import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    createSaftExport,
    getSaftExportDownload,
    getSaftExportMetadata,
} from "./saftService.js";
import {
    validateSaftExportId,
    validateSaftExportRequest,
} from "./saftValidators.js";

/**
 * Envia erros HTTP sem revelar stack, caminhos de XSD ou chaves de storage.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta segura.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({
        error: response.code,
        message: response.message,
    });
}

/**
 * Carrega o XSD configurado sem devolver o caminho ou erro do filesystem.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente runtime.
 * @returns {Promise<Buffer>} Bytes do XSD oficial.
 */
export async function loadConfiguredOfficialSchema(env = process.env) {
    const schemaPath = String(env.SAFT_XSD_PATH ?? "").trim();
    if (!schemaPath) {
        throw httpError(503, "SAFT_XSD_REQUIRED", "XSD oficial SAF-T indisponível.");
    }
    try {
        return await readFile(schemaPath);
    } catch {
        throw httpError(503, "SAFT_XSD_REQUIRED", "XSD oficial SAF-T indisponível.");
    }
}

/**
 * Sanitiza o nome usado em Content-Disposition.
 *
 * @param {unknown} value - Nome persistido.
 * @returns {string} Nome sem CRLF, separadores ou aspas.
 */
function safeDownloadName(value) {
    const safe = String(value ?? "saft.xml")
        .replace(/[\r\n"\\/]/g, "_")
        .slice(0, 180);
    return safe || "saft.xml";
}

/**
 * Constrói as rotas SAF-T company-scoped.
 *
 * `externalPipeline` é deliberadamente opcional na composição: quando não está
 * configurado, o POST falha fechado com 503 e nunca recorre ao gerador MVP.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, objectStorage: object, externalPipeline?: object, env?: NodeJS.ProcessEnv | Record<string, string | undefined>, loadOfficialSchema?: Function, verifySchema?: Function }} deps - Dependências runtime/teste.
 * @returns {import("express").Router} Router Express.
 */
export function buildSaftRoutes({
    prisma,
    objectStorage,
    externalPipeline = null,
    env = process.env,
    loadOfficialSchema = null,
    verifySchema = undefined,
}) {
    if (!prisma || !objectStorage) {
        throw new TypeError("Prisma e object storage são obrigatórios para SAF-T.");
    }
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.COMPLIANCE_READ),
    ];
    const serviceDependencies = {
        externalPipeline,
        loadOfficialSchema:
            loadOfficialSchema ?? (() => loadConfiguredOfficialSchema(env)),
        verifySchema,
    };

    router.post("/saft/exports", guards, async (req, res) => {
        try {
            const request = validateSaftExportRequest(req.body);
            const exportRun = await createSaftExport(
                prisma,
                objectStorage,
                {
                    companyId: req.companyId,
                    userId: req.user.id,
                    featureFlag: env.SAFT_EXPORT_ENABLED,
                    ...request,
                },
                serviceDependencies,
            );
            return res.status(202).json({ export: exportRun });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/saft/exports/:exportId", guards, async (req, res) => {
        try {
            const exportRun = await getSaftExportMetadata(prisma, {
                companyId: req.companyId,
                exportId: validateSaftExportId(req.params.exportId),
                featureFlag: env.SAFT_EXPORT_ENABLED,
            });
            return res.status(200).json({ export: exportRun });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get(
        "/saft/exports/:exportId/download",
        guards,
        async (req, res) => {
            try {
                const result = await getSaftExportDownload(
                    prisma,
                    objectStorage,
                    {
                        companyId: req.companyId,
                        exportId: validateSaftExportId(req.params.exportId),
                        featureFlag: env.SAFT_EXPORT_ENABLED,
                    },
                );
                const fileName = safeDownloadName(result.export.fileName);
                res.status(200);
                res.set("Content-Type", "application/xml; charset=windows-1252");
                res.set(
                    "Content-Disposition",
                    `attachment; filename="saft.xml"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
                );
                res.set("X-Content-Type-Options", "nosniff");
                res.set("Cache-Control", "private, no-store");
                res.set("Content-Length", String(result.object.contentLength));
                await pipeline(result.object.body, res);
                return res;
            } catch (error) {
                if (res.headersSent) {
                    res.destroy(error);
                    return res;
                }
                return sendError(res, error);
            }
        },
    );

    return router;
}
