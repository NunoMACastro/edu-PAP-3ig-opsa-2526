/**
 * @file Rotas públicas e distintas de liveness/readiness da API OPSA.
 */

import { Router } from "express";
import { buildLiveness, checkReadiness } from "./healthService.js";

/**
 * Monta `/live`, `/ready` e o alias `/` de readiness.
 *
 * @param {{ version: string, prisma: object, redisClient: object, redisKeyPrefix: string, objectStorage: object }} deps - Dependências críticas injetadas.
 * @returns {Router} Router Express.
 */
export function buildHealthRoutes(deps) {
    const router = Router();
    if (
        !deps?.version ||
        !deps.prisma ||
        !deps.redisClient ||
        !deps.redisKeyPrefix ||
        !deps.objectStorage
    ) {
        throw new TypeError("Dependências de health-check incompletas.");
    }

    router.get("/live", (_req, res) =>
        res.status(200).json(buildLiveness({ version: deps.version })),
    );

    const readiness = async (_req, res) => {
        const result = await checkReadiness(deps);
        return res.status(result.httpStatus).json(result.payload);
    };
    router.get("/ready", readiness);
    router.get("/", readiness);
    return router;
}
