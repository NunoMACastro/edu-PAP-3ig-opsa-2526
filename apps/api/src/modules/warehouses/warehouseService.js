/**
 * @file Service de armazéns e localizações.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Serializa armazém para resposta pública.
 *
 * @param {object} warehouse - Armazém Prisma.
 * @returns {object} Armazém público.
 */
function serializeWarehouse(warehouse) {
    return {
        id: warehouse.id,
        code: warehouse.code,
        name: warehouse.name,
        isActive: warehouse.isActive,
    };
}

/**
 * Serializa localização para resposta pública.
 *
 * @param {object} location - Localização Prisma.
 * @returns {object} Localização pública.
 */
function serializeLocation(location) {
    return {
        id: location.id,
        code: location.code,
        name: location.name,
        isActive: location.isActive,
    };
}

/**
 * Lista armazéns ativos da empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Armazéns ativos.
 */
export async function listWarehouses(prisma, companyId) {
    const warehouses = await prisma.warehouse.findMany({
        where: { companyId, isActive: true },
        orderBy: { code: "asc" },
    });
    return warehouses.map(serializeWarehouse);
}

/**
 * Cria armazém.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{ code: string, name: string }} input - Dados validados.
 * @returns {Promise<object>} Armazém criado.
 */
export async function createWarehouse(prisma, companyId, input) {
    const existing = await prisma.warehouse.findUnique({
        where: { companyId_code: { companyId, code: input.code } },
    });
    if (existing) {
        throw httpError(
            409,
            "WAREHOUSE_CODE_EXISTS",
            "Código de armazém já existe",
        );
    }

    const warehouse = await prisma.warehouse.create({
        data: { companyId, ...input },
    });
    return serializeWarehouse(warehouse);
}

/**
 * Cria localização dentro de um armazém da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} warehouseId - Armazém alvo.
 * @param {{ code: string, name: string }} input - Dados validados.
 * @returns {Promise<object>} Localização criada.
 */
export async function createWarehouseLocation(
    prisma,
    companyId,
    warehouseId,
    input,
) {
    const warehouse = await prisma.warehouse.findFirst({
        where: { id: warehouseId, companyId },
    });
    if (!warehouse) {
        throw httpError(404, "WAREHOUSE_NOT_FOUND", "Armazém não encontrado");
    }

    const existing = await prisma.warehouseLocation.findUnique({
        where: { warehouseId_code: { warehouseId, code: input.code } },
    });
    if (existing) {
        throw httpError(
            409,
            "LOCATION_CODE_EXISTS",
            "Código de localização já existe neste armazém",
        );
    }

    const location = await prisma.warehouseLocation.create({
        data: { warehouseId, ...input },
    });

    return serializeLocation(location);
}

/**
 * Lista localizações ativas de um armazém da empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} warehouseId - Armazém alvo.
 * @returns {Promise<object[]>} Localizações ativas.
 */
export async function listWarehouseLocations(prisma, companyId, warehouseId) {
    const warehouse = await prisma.warehouse.findFirst({
        where: { id: warehouseId, companyId },
    });
    if (!warehouse) {
        throw httpError(404, "WAREHOUSE_NOT_FOUND", "Armazém não encontrado");
    }

    const locations = await prisma.warehouseLocation.findMany({
        where: { warehouseId, isActive: true },
        orderBy: { code: "asc" },
    });

    return locations.map(serializeLocation);
}
