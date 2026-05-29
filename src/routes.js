import express from "express";
import {
  listWarehouses,
  addWarehouse,
  addLocation,
} from "./controller.js";

const router = express.Router();

router.get("/warehouses", listWarehouses);
router.post("/warehouses", addWarehouse);
router.post("/warehouses/:id/locations", addLocation);

export default router;