import { Router } from "express";
import * as warehouseController from "./controller.js";

const router = Router();

/**
 * Listar todos os armazéns
 * GET /api/warehouses
 */
router.get(
  "/warehouses",
  warehouseController.list
);

/**
 * Criar um novo armazém
 * POST /api/warehouses
 */
router.post(
  "/warehouses",
  warehouseController.create
);

/**
 * Criar localização num armazém
 * POST /api/warehouses/:id/locations
 */
router.post(
  "/warehouses/:id/locations",
  warehouseController.createLocation
);

export default router;