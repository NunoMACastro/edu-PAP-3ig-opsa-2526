/**
 * @file Service de armazéns e localizações.
 */

import { httpError } from "../../lib/httpErrors.js";
import { recordAuditLog } from "../audit/auditLogService.js";

/**
 * Converte o target variável do Prisma num texto comparável sem depender da
 * versão do driver PostgreSQL.
 *
 * @param {unknown} error - Erro devolvido pelo Prisma.
 * @returns {string | null} Target normalizado, vazio quando ausente, ou `null`
 * quando não é um conflito P2002.
 */
function getUniqueTarget(error) {
    if (
        !error ||
        typeof error !== "object" ||
        !("code" in error) ||
        error.code !== "P2002"
    ) {
        return null;
    }
    const target = error.meta?.target;
    return (Array.isArray(target) ? target.join(" ") : String(target ?? ""))
        .toLowerCase();
}

/**
 * Mapeia uma colisão concorrente de armazém para um conflito HTTP estável.
 *
 * @param {unknown} error - Erro Prisma capturado.
 * @returns {import("../../lib/httpErrors.js").HttpError | null} Conflito mapeado.
 */
function mapWarehouseUniqueError(error) {
    const target = getUniqueTarget(error);
    if (target === null) return null;
    if (target.includes("name")) {
        return httpError(
            409,
            "WAREHOUSE_NAME_EXISTS",
            "Nome de armazém já existe",
        );
    }
    if (target.includes("code")) {
        return httpError(
            409,
            "WAREHOUSE_CODE_EXISTS",
            "Código de armazém já existe",
        );
    }
    return httpError(
        409,
        "WAREHOUSE_CONFLICT",
        "Já existe um armazém com estes dados",
    );
}

/**
 * Mapeia uma colisão concorrente de localização para um conflito HTTP estável.
 *
 * @param {unknown} error - Erro Prisma capturado.
 * @returns {import("../../lib/httpErrors.js").HttpError | null} Conflito mapeado.
 */
function mapLocationUniqueError(error) {
    const target = getUniqueTarget(error);
    if (target === null) return null;
    if (target.includes("name")) {
        return httpError(
            409,
            "WAREHOUSE_LOCATION_NAME_EXISTS",
            "Nome de localização já existe neste armazém",
        );
    }
    if (target.includes("code")) {
        return httpError(
            409,
            "LOCATION_CODE_EXISTS",
            "Código de localização já existe neste armazém",
        );
    }
    return httpError(
        409,
        "WAREHOUSE_LOCATION_CONFLICT",
        "Já existe uma localização com estes dados",
    );
}

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
 * Cria um armazém depois de validar unicidade de código e nome.
 * A verificação protege a empresa contra duplicados logísticos difíceis de reconciliar.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{ code: string, name: string }} input - Dados validados.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<object>} Armazém criado.
 */
export async function createWarehouse(prisma, companyId, input, userId) {
    const existingCode = await prisma.warehouse.findUnique({
        where: { companyId_code: { companyId, code: input.code } },
    });
    if (existingCode) {
        throw httpError(
            409,
            "WAREHOUSE_CODE_EXISTS",
            "Código de armazém já existe",
        );
    }

    const existingName = await prisma.warehouse.findFirst({
        where: { companyId, name: input.name },
    });
    if (existingName) {
        throw httpError(
            409,
            "WAREHOUSE_NAME_EXISTS",
            "Nome de armazém já existe",
        );
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const warehouse = await tx.warehouse.create({
                data: { companyId, ...input },
            });
            await recordAuditLog(tx, {
                companyId,
                userId,
                action: "WAREHOUSE_CREATED",
                entity: "Warehouse",
                entityId: warehouse.id,
                details: { changedFields: Object.keys(input).sort() },
            });
            return serializeWarehouse(warehouse);
        });
    } catch (error) {
        const conflict = mapWarehouseUniqueError(error);
        if (conflict) throw conflict;
        throw error;
    }
}

/**
 * Cria localização dentro de um armazém da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} warehouseId - Armazém alvo.
 * @param {{ code: string, name: string }} input - Dados validados.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<object>} Localização criada.
 */
export async function createWarehouseLocation(
    prisma,
    companyId,
    warehouseId,
    input,
    userId,
) {
    try {
        return await prisma.$transaction(async (tx) => {
            const warehouse = await tx.warehouse.findFirst({
                where: { id: warehouseId, companyId },
            });
            if (!warehouse) {
                throw httpError(
                    404,
                    "WAREHOUSE_NOT_FOUND",
                    "Armazém não encontrado",
                );
            }

            const existingCode = await tx.warehouseLocation.findUnique({
                where: { warehouseId_code: { warehouseId, code: input.code } },
            });
            if (existingCode) {
                throw httpError(
                    409,
                    "LOCATION_CODE_EXISTS",
                    "Código de localização já existe neste armazém",
                );
            }

            const existingName = await tx.warehouseLocation.findFirst({
                where: { warehouseId, name: input.name },
            });
            if (existingName) {
                throw httpError(
                    409,
                    "WAREHOUSE_LOCATION_NAME_EXISTS",
                    "Nome de localização já existe neste armazém",
                );
            }

            const location = await tx.warehouseLocation.create({
                data: { warehouseId, ...input },
            });
            await recordAuditLog(tx, {
                companyId,
                userId,
                action: "WAREHOUSE_LOCATION_CREATED",
                entity: "WarehouseLocation",
                entityId: location.id,
                details: { changedFields: Object.keys(input).sort() },
            });
            return serializeLocation(location);
        });
    } catch (error) {
        const conflict = mapLocationUniqueError(error);
        if (conflict) throw conflict;
        throw error;
    }
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
