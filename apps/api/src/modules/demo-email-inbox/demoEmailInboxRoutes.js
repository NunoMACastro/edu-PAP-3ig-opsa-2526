/**
 * @file Endpoint público, limitado e exclusivo da inbox de demonstração local.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { listDemoEmailPreviews } from "./demoEmailInboxService.js";

const UNLOCK_RATE_LIMIT = Object.freeze({ limit: 5, windowMs: 15 * 60 * 1000 });

/**
 * Compara códigos sem revelar diferenças de tamanho ou prefixo por timing.
 *
 * @param {unknown} received - Valor recebido do browser.
 * @param {string} expected - Chave configurada no processo.
 * @returns {boolean} Verdadeiro apenas para correspondência exata.
 */
function matchesAccessKey(received, expected) {
    const receivedDigest = createHash("sha256")
        .update(typeof received === "string" ? received : "", "utf8")
        .digest();
    const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
    return timingSafeEqual(receivedDigest, expectedDigest);
}

/**
 * Constrói o endpoint apenas depois de a composição confirmar o perfil demo.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient, rateLimiter: object, accessKey: string, encryptionKey: string | Buffer }} deps - Dependências validadas.
 * @returns {Router} Router da inbox local.
 */
export function buildDemoEmailInboxRoutes({
    prisma,
    rateLimiter,
    accessKey,
    encryptionKey,
}) {
    if (!prisma || !rateLimiter?.consume || !accessKey || !encryptionKey) {
        throw new TypeError("Configuração da inbox de demonstração incompleta.");
    }
    const router = Router();

    router.post("/email-inbox/unlock", async (req, res) => {
        res.set("Cache-Control", "no-store");
        try {
            await rateLimiter.consume(
                "demo-email-inbox-ip",
                req.ip,
                UNLOCK_RATE_LIMIT,
            );
            if (!matchesAccessKey(req.body?.accessKey, accessKey)) {
                throw httpError(
                    403,
                    "DEMO_EMAIL_INBOX_ACCESS_DENIED",
                    "Código de acesso inválido",
                );
            }
            const messages = await listDemoEmailPreviews(prisma, {
                encryptionKey,
            });
            return res.status(200).json({ messages });
        } catch (error) {
            const response = toHttpError(error);
            return res.status(response.status).json({
                error: response.code,
                message: response.message,
            });
        }
    });

    return router;
}
