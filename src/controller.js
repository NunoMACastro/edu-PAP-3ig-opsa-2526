import {
  getWarehouses,
  createWarehouse,
  createLocation,
} from "./services.js";

import {
  validateWarehouse,
  validateLocation,
} from "./validators.js";

// GET
export async function listWarehouses(req, res) {
  const data = await getWarehouses();
  res.json(data);
}

// POST warehouse
export async function addWarehouse(req, res) {
  try {
    validateWarehouse(req.body);

    const result = await createWarehouse(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// POST location
export async function addLocation(req, res) {
  try {
    validateLocation(req.body);

    const result = await createLocation(
      req.params.id,
      req.body
    );

    res.status(201).json(result);
  } catch (err) {
    const map = {
      WAREHOUSE_NOT_FOUND: 404,
      LOCATION_ALREADY_EXISTS: 409,
    };

    res.status(map[err.message] || 400).json({
      error: err.message,
    });
  }
}