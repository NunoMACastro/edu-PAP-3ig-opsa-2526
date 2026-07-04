/**
 * @file Ponto de entrada Express para a API OPSA MF0.
 * 
 * O servidor monta apenas routers de domínio. A regra de negócio fica nos
 * services e as validações ficam nos validators, conforme a separação indicada
 * nos guias BK da MF0.
 */

import express from "express";
import { PrismaClient } from "@prisma/client";
import { loadApiEnv } from "./config/env.js";
import { loadLocalEnvFile } from "./config/envFile.js";
import { buildAuthRoutes } from "./modules/auth/authRoutes.js";
import { buildPermissionsRoutes } from "./modules/permissions/permissionsRoutes.js";
import { buildCompanyRoutes } from "./modules/companies/companyRoutes.js";
import { buildCompanyUserRoutes } from "./modules/company-users/companyUserRoutes.js";
import { buildCompanyProfileRoutes } from "./modules/company-profile/companyProfileRoutes.js";
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
import { buildAuditLogRoutes } from "./modules/audit/auditLogRoutes.js";
import { buildIntegrationLogRoutes } from "./modules/integrations/integrationLogRoutes.js";
import { buildSaftRoutes } from "./modules/compliance/saftRoutes.js";
import { buildOperationalReportRoutes } from "./modules/reports/operationalReportRoutes.js";
import { buildExecutiveKpiRoutes } from "./modules/reports/executiveKpiRoutes.js";
import {
    applyStrictTransportSecurity,
    enforceHttps,
} from "./modules/security/transportSecurity.js";
import { requireTrustedOrigin } from "./modules/security/requestHardening.js";
import {
    createStructuredLogEvent,
    writeStructuredLog,
} from "./modules/ops/structuredLogger.js";
import { buildHealthRoutes } from "./modules/ops/healthRoutes.js";
import { buildSubscriptionRoutes } from "./modules/subscriptions/subscriptionRoutes.js";

loadLocalEnvFile();

const prisma = new PrismaClient();
const app = express();
const apiEnv = loadApiEnv();
const { port, isProduction, appBaseUrl } = apiEnv;
const API_VERSION = "1.0.0";

app.set("trust proxy", 1);
app.use(enforceHttps({ isProduction }));
app.use(applyStrictTransportSecurity({ isProduction }));
app.use(express.json());
app.use(requireTrustedOrigin({ appBaseUrl, isProduction }));

app.use("/api/auth", buildAuthRoutes({ prisma, isProduction, appBaseUrl }));
app.use("/api/subscriptions", buildSubscriptionRoutes({ prisma }));
app.use("/api/permissions", buildPermissionsRoutes({ prisma }));
app.use("/api", buildCompanyRoutes({ prisma }));
app.use(
    "/api/company",
    buildCompanyUserRoutes({
        prisma,
        appBaseUrl,
    }),
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
app.use(
    "/api/accounting/purchase-postings",
    buildPurchasePostingRoutes({ prisma }),
);
app.use("/api/inventory", buildStockMovementRoutes({ prisma }));
app.use("/api/inventory", buildFifoCostRoutes({ prisma }));
app.use("/api/inventory", buildInventoryCountRoutes({ prisma }));
app.use("/api/inventory", buildStockAlertRoutes({ prisma }));
app.use("/api/accounting/manual-journals", buildManualJournalRoutes({ prisma }));
app.use("/api/accounting/reports", buildAccountingReportRoutes({ prisma }));
app.use("/api/accounting/statements", buildFinancialStatementRoutes({ prisma }));
app.use("/api/tax", buildVatMapRoutes({ prisma }));
app.use("/api/treasury", buildTreasuryAccountRoutes({ prisma }));
app.use("/api/treasury", buildStatementRoutes({ prisma }));
app.use("/api/treasury", buildCashflowForecastRoutes({ prisma }));
app.use("/api/imports", buildBusinessImportRoutes({ prisma }));
app.use("/api/compliance", buildSaftRoutes({ prisma }));
app.use("/api/reports", buildOperationalReportRoutes({ prisma }));
app.use("/api/reports", buildExecutiveKpiRoutes({ prisma }));
app.use("/api/ai", buildAiRoutes({ prisma }));
app.use("/api/reminders", buildReminderRoutes({ prisma }));
app.use("/api/tasks", buildOperationalTaskRoutes({ prisma }));
app.use("/api/notifications", buildNotificationRoutes({ prisma }));
app.use("/api/audit", buildAuditLogRoutes({ prisma }));
app.use("/api/integrations", buildIntegrationLogRoutes({ prisma }));
app.set("trust proxy", 1);
app.use(enforceHttps({ isProduction }));
app.use(applyStrictTransportSecurity({ isProduction }));
app.use(express.json());
app.use(requireTrustedOrigin({ appBaseUrl, isProduction }));

// O health-check é público, mas só expõe metadados operacionais controlados.
app.use(
    "/api/health",
    buildHealthRoutes({
        version: API_VERSION,
        environment: apiEnv.nodeEnv,
    }),
);

/**
 * Arranca o servidor HTTP.
 *
 * @returns {import("node:http").Server} Instância HTTP devolvida pelo Express.
 */
function startServer() {
    return app.listen(port, () => {
        // O evento de arranque usa apenas metadados operacionais seguros.
        const startupEvent = createStructuredLogEvent({
            level: "info",
            event: "api.started",
            module: "server",
            requirement: "RNF28",
            context: {
                port,
                environment: apiEnv.nodeEnv,
            },
        });

        // O writer central evita regressar a console.info solto e aplica sempre a mesma política.
        writeStructuredLog(startupEvent);
    });
}

startServer();

export { app, prisma };
