import express from "express";
import { PrismaClient } from "@prisma/client";
import { buildAuthRoutes } from "./modules/auth/authRoutes.js";
import { buildPermissionsRoutes } from "./modules/permissions/permissionsRoutes.js";
import { buildCompanyRoutes } from "./modules/companies/companyRoutes.js";
import { buildCompanyUserRoutes } from "./modules/company-users/companyUserRoutes.js";
import { buildAccountRoutes } from "./modules/accounting/accounts/accountRoutes.js";
import { buildCompanyProfileRoutes } from "./modules/company-profile/companyProfileRoutes.js";
import { buildCustomerRoutes } from "./modules/customers/customerRoutes.js";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
    return res.status(200).json({ status: "ok" });
});

app.use(
    "/api/company",
    buildCompanyUserRoutes({
        prisma,
        appBaseUrl: process.env.APP_BASE_URL,
    }),
);

app.use(
    "/api/auth",
    buildAuthRoutes({
        prisma,
        isProduction: process.env.NODE_ENV === "production",
    }),
);

app.use("/api/permissions", buildPermissionsRoutes({ prisma }));
app.use("/api", buildCompanyRoutes({ prisma }));
app.use("/api/accounting/accounts", buildAccountRoutes({ prisma }));
app.use("/api/company/profile", buildCompanyProfileRoutes({ prisma }));
app.use("/api/customers", buildCustomerRoutes({ prisma }));

app.listen(PORT, () => {
    console.log(`API a correr em http://localhost:${PORT}`);
});