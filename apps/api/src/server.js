import express from "express";
import { PrismaClient } from "@prisma/client";
import { buildAuthRoutes } from "./modules/auth/authRoutes.js";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
    return res.status(200).json({ status: "ok" });
});

app.use(
    "/api/auth",
    buildAuthRoutes({
        prisma,
        isProduction: process.env.NODE_ENV === "production",
    }),
);

app.listen(PORT, () => {
    console.log(`API a correr em http://localhost:${PORT}`);
});