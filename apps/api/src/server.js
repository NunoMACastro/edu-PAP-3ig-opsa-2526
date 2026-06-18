/**
 * @file Ponto de entrada Express para a API OPSA MF0.
 * 
 * O servidor monta apenas routers de domínio. A regra de negócio fica nos
 * services e as validações ficam nos validators, conforme a separação indicada
 * nos guias BK da MF0.
 */

import express from "express";
import { PrismaClient } from "@prisma/client";
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
import { buildSaftRoutes } from "./modules/compliance/saftRoutes.js";
import { buildOperationalReportRoutes } from "./modules/reports/operationalReportRoutes.js";
import { buildExecutiveKpiRoutes } from "./modules/reports/executiveKpiRoutes.js";
import { buildAiInsightRoutes } from "./modules/ai/aiInsightRoutes.js";
import { buildSmartAlertRoutes } from "./modules/ai/smartAlertRoutes.js";
import { buildAiSuggestionRoutes } from "./modules/ai/aiSuggestionRoutes.js";

app.use("/api/ai", buildAiSuggestionRoutes({ prisma }));
app.use("/api/ai", buildSmartAlertRoutes({ prisma }));
// apps/api/src/server.js
import { buildAiQuestionRoutes } from "./modules/ai/aiQuestionRoutes.js";

app.use("/api/ai", buildAiQuestionRoutes({ prisma }));

// apps/api/src/server.js
import { buildReminderRoutes } from "./modules/reminders/reminderRoutes.js";

app.use("/api/reminders", buildReminderRoutes({ prisma }));

const prisma = new PrismaClient();
const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const isProduction = process.env.NODE_ENV === "production";
const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:5173";

app.use(express.json());

app.use("/api/auth", buildAuthRoutes({ prisma, isProduction, appBaseUrl }));
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
app.use("/api/ai", buildAiInsightRoutes({ prisma }));

/**
 * Arranca o servidor HTTP.
 *
 * @returns {import("node:http").Server} Instância HTTP devolvida pelo Express.
 */
function startServer() {
    return app.listen(port, () => {
        console.info({
            event: "api_started",
            port,
            environment: process.env.NODE_ENV ?? "development",
        });
    });
}

startServer();

export { app, prisma };

