import * as warehouseService from "./services.js";

/**
 * Listar todos os armazéns
 */
export async function list(req, res) {
  try {
    const warehouses = await warehouseService.findAll(
      req.user.companyId
    );

    return res.status(200).json(warehouses);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

/**
 * Criar novo armazém
 */
export async function create(req, res) {
  try {
    const warehouse = await warehouseService.create(
      req.body,
      req.user.companyId
    );

    return res.status(201).json(warehouse);

  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
}

/**
 * Criar localização num armazém
 */
export async function createLocation(req, res) {
  try {
    const location =
      await warehouseService.createLocation(
        req.params.id,
        req.body
      );

    return res.status(201).json(location);

  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
}