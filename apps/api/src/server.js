/**
 * @file Composição Express e arranque explícito da API OPSA.
 *
 * Importar este módulo nunca abre sockets nem cria ligações externas. O processo
 * executável chama `startServer`; testes podem usar `createApp` com doubles.
 */

import { pathToFileURL } from "node:url";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { loadApiEnv } from "./config/env.js";
import { loadLocalEnvFile } from "./config/envFile.js";
import { buildAuthRoutes } from "./modules/auth/authRoutes.js";
import { createRedisRateLimiter } from "./modules/auth/redisRateLimit.js";
import { buildPermissionsRoutes } from "./modules/permissions/permissionsRoutes.js";
import { buildCompanyRoutes } from "./modules/companies/companyRoutes.js";
import { buildCompanyUserRoutes } from "./modules/company-users/companyUserRoutes.js";
import { buildCompanyProfileRoutes } from "./modules/company-profile/companyProfileRoutes.js";
import { buildInvitationRoutes } from "./modules/invitations/invitationRoutes.js";
import { buildOnboardingRoutes } from "./modules/onboarding/onboardingRoutes.js";
import { buildAccountRoutes } from "./modules/accounting/accounts/accountRoutes.js";
import { buildFiscalPeriodRoutes } from "./modules/fiscal-periods/fiscalPeriodRoutes.js";
import { buildCustomerRoutes } from "./modules/customers/customerRoutes.js";
import { buildSupplierRoutes } from "./modules/suppliers/supplierRoutes.js";
import { buildItemRoutes } from "./modules/items/itemRoutes.js";
import { buildWarehouseRoutes } from "./modules/warehouses/warehouseRoutes.js";
import { buildVatRateRoutes } from "./modules/vat-rates/vatRateRoutes.js";
import { buildSaleDocumentRoutes } from "./modules/sales/saleDocumentRoutes.js";
import { buildReceiptRoutes } from "./modules/receipts/receiptRoutes.js";
import { buildSalePostingRoutes } from "./modules/accounting/salePostingRoutes.js";
import { buildSalesOpenItemsRoutes } from "./modules/open-items/salesOpenItemsRoutes.js";
import { buildSaleApprovalRoutes } from "./modules/sales-approval/saleApprovalRoutes.js";
import { buildPurchaseDocumentRoutes } from "./modules/purchases/purchaseDocumentRoutes.js";
import { buildPaymentRoutes } from "./modules/payments/paymentRoutes.js";
import { buildPurchasePostingRoutes } from "./modules/accounting/purchasePostingRoutes.js";
import { buildPurchaseApprovalRoutes } from "./modules/purchase-approval/purchaseApprovalRoutes.js";
import { buildStockMovementRoutes } from "./modules/inventory/stockMovementRoutes.js";
import { buildFifoCostRoutes } from "./modules/inventory/fifoCostRoutes.js";
import { buildInventoryCountRoutes } from "./modules/inventory/inventoryCountRoutes.js";
import { buildStockAlertRoutes } from "./modules/inventory/stockAlertRoutes.js";
import { buildManualJournalRoutes } from "./modules/accounting/manualJournalRoutes.js";
import { buildAccountingReportRoutes } from "./modules/accounting-reports/accountingReportRoutes.js";
import { buildFinancialStatementRoutes } from "./modules/financial-statements/financialStatementRoutes.js";
import { buildVatMapRoutes } from "./modules/tax/vatMapRoutes.js";
import { buildTreasuryAccountRoutes } from "./modules/treasury/bankAccountRoutes.js";
import { buildStatementRoutes } from "./modules/treasury/statementRoutes.js";
import { buildCashflowForecastRoutes } from "./modules/treasury/cashflowForecastRoutes.js";
import { buildBusinessImportRoutes } from "./modules/imports/businessImportRoutes.js";
import { buildAiRoutes } from "./modules/ai/aiRoutes.js";
import { buildReminderRoutes } from "./modules/reminders/reminderRoutes.js";
import { buildOperationalTaskRoutes } from "./modules/tasks/taskRoutes.js";
import { buildNotificationRoutes } from "./modules/notifications/notificationRoutes.js";
import { createEmailOutbox } from "./runtimeDependencies.js";
import { buildAuditLogRoutes } from "./modules/audit/auditLogRoutes.js";
import { buildIntegrationLogRoutes } from "./modules/integrations/integrationLogRoutes.js";
import { buildSaftRoutes } from "./modules/compliance/saftRoutes.js";
import { buildOperationalReportRoutes } from "./modules/reports/operationalReportRoutes.js";
import { buildExecutiveKpiRoutes } from "./modules/reports/executiveKpiRoutes.js";
import { buildHealthRoutes } from "./modules/ops/healthRoutes.js";
import {
    createRequestObservability,
    logUnhandledRequestError,
} from "./modules/ops/requestObservability.js";
import { createObjectStorage } from "./modules/storage/objectStorage.js";
import { buildSubscriptionRoutes } from "./modules/subscriptions/subscriptionRoutes.js";
import { buildDashboardRoutes } from "./modules/dashboard/dashboardRoutes.js";
import {
    applyStrictTransportSecurity,
    enforceHttps,
} from "./modules/security/transportSecurity.js";
import { requireTrustedOrigin } from "./modules/security/requestHardening.js";
import {
    createStructuredLogEvent,
    writeStructuredLog,
} from "./modules/ops/structuredLogger.js";

const API_VERSION = "1.0.0";

/**
 * Compõe a aplicação HTTP sem efeitos laterais de infraestrutura.
 *
 * @param {{ prisma: object, apiEnv: object, rateLimiter: object, emailOutbox: object, redisClient: object, objectStorage: object, saftExternalPipeline?: { validate?: Function, generateAndValidate?: Function } | null }} deps - Dependências já configuradas.
 * @returns {import("express").Express} Aplicação Express.
 */
export function createApp({
    prisma,
    apiEnv,
    rateLimiter,
    emailOutbox,
    redisClient,
    objectStorage,
    saftExternalPipeline = null,
}) {
    if (!prisma || !rateLimiter || !emailOutbox || !redisClient || !objectStorage) {
        throw new TypeError(
            "Prisma, Redis, object storage, rate limiter e EmailOutbox são obrigatórios.",
        );
    }
    const app = express();
    const { isProduction, appBaseUrl } = apiEnv;
    app.set(
        "trust proxy",
        apiEnv.trustProxyHops === 0 ? false : apiEnv.trustProxyHops,
    );
    app.use(createRequestObservability());
    app.use(enforceHttps({ isProduction }));
    app.use(applyStrictTransportSecurity({ isProduction }));
    app.use(express.json({ limit: "1mb" }));
    app.use(requireTrustedOrigin({ appBaseUrl, isProduction }));

    app.use(
        "/api/health",
        buildHealthRoutes({
            version: API_VERSION,
            prisma,
            redisClient,
            redisKeyPrefix: apiEnv.redisKeyPrefix,
            objectStorage,
            aiConfig: apiEnv.ai,
        }),
    );
    app.use("/api/auth", buildAuthRoutes({
        prisma,
        isProduction,
        appBaseUrl,
        rateLimiter,
        emailOutbox,
    }));
    app.use("/api/invitations", buildInvitationRoutes({ prisma }));
    app.use("/api/onboarding", buildOnboardingRoutes({ prisma }));
    app.use("/api/permissions", buildPermissionsRoutes({ prisma }));
    app.use("/api/dashboard", buildDashboardRoutes({ prisma }));
    app.use("/api", buildCompanyRoutes({ prisma }));
    app.use(
        "/api/company",
        buildCompanyUserRoutes({ prisma, appBaseUrl, emailOutbox }),
    );
    app.use("/api/company/profile", buildCompanyProfileRoutes({ prisma }));
    app.use("/api/accounting/accounts", buildAccountRoutes({ prisma }));
    app.use("/api/fiscal-periods", buildFiscalPeriodRoutes({ prisma }));
    app.use("/api/customers", buildCustomerRoutes({ prisma }));
    app.use("/api/suppliers", buildSupplierRoutes({ prisma }));
    app.use("/api/items", buildItemRoutes({ prisma }));
    app.use("/api/warehouses", buildWarehouseRoutes({ prisma }));
    app.use("/api/vat-rates", buildVatRateRoutes({ prisma }));
    app.use("/api/sales/documents", buildSaleDocumentRoutes({ prisma }));
    app.use("/api/sales/documents", buildReceiptRoutes({ prisma }));
    app.use("/api/sales/documents", buildSaleApprovalRoutes({ prisma }));
    app.use("/api/sales/open-items", buildSalesOpenItemsRoutes({ prisma }));
    app.use("/api/accounting/sale-postings", buildSalePostingRoutes({ prisma }));
    app.use("/api/purchases/documents", buildPurchaseDocumentRoutes({ prisma }));
    app.use("/api/purchases/documents", buildPaymentRoutes({ prisma }));
    app.use("/api/purchases/documents", buildPurchaseApprovalRoutes({ prisma }));
    app.use("/api/accounting/purchase-postings", buildPurchasePostingRoutes({ prisma }));
    app.use("/api/inventory", buildStockMovementRoutes({ prisma }));
    app.use("/api/inventory", buildFifoCostRoutes({ prisma }));
    app.use("/api/inventory", buildInventoryCountRoutes({ prisma }));
    app.use("/api/inventory", buildStockAlertRoutes({ prisma }));
    app.use(
        "/api/accounting/manual-journals",
        buildManualJournalRoutes({ prisma, objectStorage }),
    );
    app.use("/api/accounting/reports", buildAccountingReportRoutes({ prisma }));
    app.use("/api/accounting/statements", buildFinancialStatementRoutes({ prisma }));
    app.use("/api/tax", buildVatMapRoutes({ prisma }));
    app.use("/api/treasury", buildTreasuryAccountRoutes({ prisma }));
    app.use("/api/treasury", buildStatementRoutes({ prisma }));
    app.use("/api/treasury", buildCashflowForecastRoutes({ prisma }));
    app.use("/api/imports", buildBusinessImportRoutes({ prisma }));
    app.use(
        "/api/compliance",
        buildSaftRoutes({
            prisma,
            objectStorage,
            externalPipeline: saftExternalPipeline,
        }),
    );
    app.use("/api/reports", buildOperationalReportRoutes({ prisma }));
    app.use("/api/reports", buildExecutiveKpiRoutes({ prisma }));
    app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma }));
    app.use("/api/ai", buildAiRoutes({ prisma, apiEnv, redisClient }));
    app.use("/api/reminders", buildReminderRoutes({ prisma }));
    app.use("/api/tasks", buildOperationalTaskRoutes({ prisma }));
    app.use(
        "/api/notifications",
        buildNotificationRoutes({ prisma, emailOutbox }),
    );
    app.use("/api/audit", buildAuditLogRoutes({ prisma }));
    app.use("/api/integrations", buildIntegrationLogRoutes({ prisma }));
    app.use((error, req, res, next) => {
        if (res.headersSent) {
            logUnhandledRequestError(error, req);
            return next(error);
        }
        res.status(500);
        logUnhandledRequestError(error, req);
        return res.json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Ocorreu um erro interno.",
            requestId: req.requestId,
        });
    });
    return app;
}

/**
 * Drena o servidor HTTP e força apenas ligações remanescentes após timeout.
 *
 * @param {import("node:http").Server} server - Servidor ativo.
 * @param {{ timeoutMs?: number }} [options] - Limite da drenagem.
 * @returns {Promise<{ forced: boolean }>} Resultado do encerramento.
 */
export async function closeHttpServer(server, options = {}) {
    if (!server?.listening) return { forced: false };
    const timeoutMs = options.timeoutMs ?? 10_000;
    return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (error, forced = false) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (error) reject(error);
            else resolve({ forced });
        };
        const timer = setTimeout(() => {
            server.closeAllConnections?.();
            finish(null, true);
        }, timeoutMs);
        timer.unref?.();
        server.close((error) => finish(error, false));
        server.closeIdleConnections?.();
    });
}

/**
 * Liga dependências operacionais e só depois abre o socket HTTP.
 *
 * @param {{ env?: NodeJS.ProcessEnv, logger?: Console, registerSignalHandlers?: boolean, shutdownTimeoutMs?: number, saftExternalPipeline?: { validate?: Function, generateAndValidate?: Function } | null }} options - Opções de processo/teste. O validador SAF-T é injetado explicitamente; sem ele o exportador permanece fail-closed.
 * @returns {Promise<object>} Recursos e função idempotente de encerramento.
 */
export async function startServer({
    env = process.env,
    logger = console,
    registerSignalHandlers = true,
    shutdownTimeoutMs = 10_000,
    saftExternalPipeline = null,
} = {}) {
    loadLocalEnvFile();
    const apiEnv = loadApiEnv(env);
    if (!apiEnv.emailOutboxEncryptionKey) {
        throw new Error("EMAIL_OUTBOX_ENCRYPTION_KEY é obrigatória.");
    }
    const prisma = new PrismaClient();
    const redisClient = createClient({ url: apiEnv.redisUrl });
    const objectStorage = createObjectStorage(env);
    redisClient.on("error", () => logger.error({ event: "redis.connection_error" }));
    let server;
    let stopped = false;
    try {
        await redisClient.connect();
        await objectStorage.checkHealth();
        const rateLimiter = createRedisRateLimiter({
            client: redisClient,
            prefix: `${apiEnv.redisKeyPrefix}:auth-rate-limit`,
            hmacKey: apiEnv.rateLimitHmacKey,
        });
        const emailOutbox = createEmailOutbox({
            encryptionKey: apiEnv.emailOutboxEncryptionKey,
        });
        const app = createApp({
            prisma,
            apiEnv,
            rateLimiter,
            emailOutbox,
            redisClient,
            objectStorage,
            saftExternalPipeline,
        });
        server = await new Promise((resolve, reject) => {
            const listener = app.listen(apiEnv.port, () => resolve(listener));
            listener.once("error", reject);
        });
        const startupEvent = createStructuredLogEvent({
            level: "info",
            event: "api.started",
            module: "server",
            requirement: "RNF28",
            context: { port: apiEnv.port, environment: apiEnv.nodeEnv },
        });
        writeStructuredLog(startupEvent);

        async function stop() {
            if (stopped) return;
            stopped = true;
            await closeHttpServer(server, { timeoutMs: shutdownTimeoutMs });
            if (redisClient.isOpen) await redisClient.quit();
            await prisma.$disconnect();
        }
        if (registerSignalHandlers) {
            for (const signal of ["SIGINT", "SIGTERM"]) {
                process.once(signal, () => {
                    void stop()
                        .then(() => process.exit(0))
                        .catch((error) => {
                            logger.error({
                                event: "api.shutdown_failed",
                                code: error?.code ?? "SHUTDOWN_FAILED",
                            });
                            process.exit(1);
                        });
                });
            }
        }
        return {
            app,
            server,
            prisma,
            redisClient,
            objectStorage,
            stop,
        };
    } catch (error) {
        if (server?.listening) {
            await closeHttpServer(server, { timeoutMs: shutdownTimeoutMs });
        }
        if (redisClient.isOpen) await redisClient.quit();
        await prisma.$disconnect();
        throw error;
    }
}

const isDirectExecution =
    process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirectExecution) {
    startServer().catch((error) => {
        console.error({ event: "api.start_failed", code: error?.code ?? "START_FAILED" });
        process.exitCode = 1;
    });
}
