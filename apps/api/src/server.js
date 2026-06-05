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
<<<<<<< HEAD
import { buildPurchaseDocumentRoutes } from "./modules/purchases/purchaseDocumentRoutes.js";
import { buildSalePostingRoutes } from "./modules/accounting/salePostingRoutes.js";
import { buildSaleApprovalRoutes } from "./modules/sales-approval/saleApprovalRoutes.js";
=======
import { buildSaleDocumentRoutes } from "./modules/sales/saleDocumentRoutes.js";
>>>>>>> 548e745 (update sales)

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
<<<<<<< HEAD
app.use("/api/purchases/documents", buildPurchaseDocumentRoutes({ prisma }));
app.use("/api/accounting/sale-postings", buildSalePostingRoutes({ prisma }));
app.use("/api/sales/documents", buildSaleApprovalRoutes({ prisma }));
=======
app.use("/api/sales/documents", buildSaleDocumentRoutes({ prisma }));
>>>>>>> 548e745 (update sales)

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
