/**
 * @file Service de alertas de stock da MF2.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida configuração de alerta por artigo/armazém.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {object} Configuração normalizada.
 */
export function parseStockAlertSetting(input) {
    const itemId = String(input?.itemId ?? "").trim();
    const warehouseId = String(input?.warehouseId ?? "").trim();
    const minQuantity = input?.minQuantity == null || input.minQuantity === "" ? null : Number(input.minQuantity);
    const maxQuantity = input?.maxQuantity == null || input.maxQuantity === "" ? null : Number(input.maxQuantity);
    const stoppedAfterDays =
        input?.stoppedAfterDays == null || input.stoppedAfterDays === ""
            ? 90
            : Number(input.stoppedAfterDays);

    if (!itemId) throw httpError(400, "ITEM_REQUIRED", "Indica o artigo");
    if (!warehouseId) throw httpError(400, "WAREHOUSE_REQUIRED", "Indica o armazém");
    if (minQuantity !== null && (!Number.isFinite(minQuantity) || minQuantity < 0)) {
        throw httpError(400, "INVALID_MIN_QUANTITY", "O mínimo não pode ser negativo");
    }
    if (maxQuantity !== null && (!Number.isFinite(maxQuantity) || maxQuantity < 0)) {
        throw httpError(400, "INVALID_MAX_QUANTITY", "O máximo não pode ser negativo");
    }
    if (minQuantity !== null && maxQuantity !== null && minQuantity > maxQuantity) {
        throw httpError(400, "MIN_GREATER_THAN_MAX", "O mínimo não pode ser maior do que o máximo");
    }
    if (!Number.isInteger(stoppedAfterDays) || stoppedAfterDays < 1) {
        throw httpError(400, "INVALID_STOPPED_DAYS", "Os dias sem movimento têm de ser positivos");
    }
    return { itemId, warehouseId, minQuantity, maxQuantity, stoppedAfterDays };
}

/**
 * Guarda configuração de alertas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, input: unknown }} context - Contexto.
 * @returns {Promise<object>} Configuração persistida.
 */
export async function saveStockAlertSetting(prisma, context) {
    const data = parseStockAlertSetting(context.input);
    return prisma.$transaction(async (tx) => {
        const [item, warehouse] = await Promise.all([
            tx.item.findFirst({
                where: {
                    id: data.itemId,
                    companyId: context.companyId,
                    isActive: true,
                },
            }),
            tx.warehouse.findFirst({
                where: {
                    id: data.warehouseId,
                    companyId: context.companyId,
                    isActive: true,
                },
            }),
        ]);
        if (!item) {
            throw httpError(404, "ITEM_NOT_FOUND", "Artigo não encontrado");
        }
        if (!warehouse) {
            throw httpError(404, "WAREHOUSE_NOT_FOUND", "Armazém não encontrado");
        }

        const setting = await tx.stockAlertSetting.upsert({
            where: {
                companyId_itemId_warehouseId: {
                    companyId: context.companyId,
                    itemId: data.itemId,
                    warehouseId: data.warehouseId,
                },
            },
            create: { companyId: context.companyId, ...data },
            update: {
                minQuantity: data.minQuantity,
                maxQuantity: data.maxQuantity,
                stoppedAfterDays: data.stoppedAfterDays,
            },
            include: { item: true, warehouse: true },
        });

        await tx.auditLog.create({
            data: {
                companyId: context.companyId,
                userId: context.userId,
                action: "STOCK_ALERT_SETTING_SAVED",
                entity: "StockAlertSetting",
                entityId: setting.id,
                details: {
                    itemId: data.itemId,
                    warehouseId: data.warehouseId,
                    changedFields: [
                        "minQuantity",
                        "maxQuantity",
                        "stoppedAfterDays",
                    ],
                },
            },
        });
        return setting;
    });
}

/**
 * Calcula alertas de stock explicáveis a partir das configurações ativas.
 * Cada alerta inclui a razão operacional para apoiar decisão humana no frontend.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Alertas atuais.
 */
export async function listStockAlerts(prisma, companyId) {
    const settings = await prisma.stockAlertSetting.findMany({
        where: { companyId },
        include: { item: true, warehouse: true },
        orderBy: [{ warehouseId: "asc" }, { itemId: "asc" }],
    });
    const alerts = [];

    for (const setting of settings) {
        const balance = await prisma.stockBalance.findUnique({
            where: {
                companyId_itemId_warehouseId: {
                    companyId,
                    itemId: setting.itemId,
                    warehouseId: setting.warehouseId,
                },
            },
        });
        const quantity = balance ? Number(balance.quantity) : 0;
        const min = setting.minQuantity == null ? null : Number(setting.minQuantity);
        const max = setting.maxQuantity == null ? null : Number(setting.maxQuantity);
        const lastMovement = await prisma.stockMovement.findFirst({
            where: {
                companyId,
                itemId: setting.itemId,
                OR: [
                    { fromWarehouseId: setting.warehouseId },
                    { toWarehouseId: setting.warehouseId },
                ],
            },
            orderBy: { createdAt: "desc" },
        });

        if (min !== null && quantity < min) {
            alerts.push({
                type: "LOW_STOCK",
                item: setting.item,
                warehouse: setting.warehouse,
                quantity,
                threshold: min,
                source: "StockBalance.quantity < StockAlertSetting.minQuantity",
            });
        }
        if (max !== null && quantity > max) {
            alerts.push({
                type: "HIGH_STOCK",
                item: setting.item,
                warehouse: setting.warehouse,
                quantity,
                threshold: max,
                source: "StockBalance.quantity > StockAlertSetting.maxQuantity",
            });
        }

        const stoppedAfterDays = setting.stoppedAfterDays ?? 90;
        const cutoff = new Date(Date.now() - stoppedAfterDays * 24 * 60 * 60 * 1000);
        if (quantity > 0 && (!lastMovement || lastMovement.createdAt < cutoff)) {
            alerts.push({
                type: "STOPPED_ITEM",
                item: setting.item,
                warehouse: setting.warehouse,
                quantity,
                threshold: stoppedAfterDays,
                lastMovementAt: lastMovement?.createdAt ?? null,
                source: "StockMovement.createdAt older than StockAlertSetting.stoppedAfterDays",
            });
        }
    }

    return alerts;
}
