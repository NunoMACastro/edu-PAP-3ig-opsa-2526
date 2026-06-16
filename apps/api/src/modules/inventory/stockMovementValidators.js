/**
 * @file Validadores de movimentos de stock da MF2.
 */

import { httpError } from "../../lib/httpErrors.js";

const stockMovementTypes = new Set([
    "ENTRY",
    "EXIT",
    "TRANSFER",
    "RETURN",
    "ADJUSTMENT",
]);

/**
 * Converte valor decimal simples para número finito.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} code - Código de erro.
 * @param {string} message - Mensagem de erro.
 * @returns {number} Número validado.
 */
function parseDecimal(value, code, message) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        throw httpError(400, code, message);
    }
    return parsed;
}

/**
 * Valida payload de movimento de stock.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {object} Movimento normalizado.
 */
export function parseStockMovement(input) {
    if (!input || typeof input !== "object") {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const type = String(input.type ?? "").toUpperCase();
    const itemId = String(input.itemId ?? "").trim();
    const fromWarehouseId = String(input.fromWarehouseId ?? "").trim() || null;
    const toWarehouseId = String(input.toWarehouseId ?? "").trim() || null;
    const reason = String(input.reason ?? "").trim();
    const sourceType = String(input.sourceType ?? "").trim() || null;
    const sourceId = String(input.sourceId ?? "").trim() || null;
    const quantity = parseDecimal(
        input.quantity,
        "INVALID_QUANTITY",
        "Quantidade inválida",
    );
    const unitCostCents =
        input.unitCostCents == null || input.unitCostCents === ""
            ? null
            : Number(input.unitCostCents);

    if (!stockMovementTypes.has(type)) {
        throw httpError(400, "INVALID_STOCK_MOVEMENT_TYPE", "Tipo de movimento inválido");
    }
    if (!itemId) {
        throw httpError(400, "ITEM_REQUIRED", "Indica o artigo");
    }
    if (quantity === 0) {
        throw httpError(400, "INVALID_QUANTITY", "Quantidade não pode ser zero");
    }
    if (!reason) {
        throw httpError(400, "REASON_REQUIRED", "Indica o motivo do movimento");
    }
    if (unitCostCents !== null && (!Number.isInteger(unitCostCents) || unitCostCents <= 0)) {
        throw httpError(400, "INVALID_UNIT_COST", "O custo unitário tem de ser positivo");
    }

    if (type !== "ADJUSTMENT" && quantity <= 0) {
        throw httpError(400, "INVALID_QUANTITY", "Quantidade tem de ser positiva");
    }
    if (type === "ENTRY" || type === "RETURN") {
        if (!toWarehouseId || fromWarehouseId) {
            throw httpError(400, "INVALID_WAREHOUSE_FLOW", "Entrada/devolução exige apenas armazém destino");
        }
        if (unitCostCents === null) {
            throw httpError(400, "UNIT_COST_REQUIRED", "Custo unitário obrigatório para entradas");
        }
    }
    if (type === "EXIT") {
        if (!fromWarehouseId || toWarehouseId) {
            throw httpError(400, "INVALID_WAREHOUSE_FLOW", "Saída exige apenas armazém origem");
        }
    }
    if (type === "TRANSFER") {
        if (!fromWarehouseId || !toWarehouseId || fromWarehouseId === toWarehouseId) {
            throw httpError(400, "INVALID_TRANSFER", "Transferência exige armazéns origem e destino diferentes");
        }
    }
    if (type === "ADJUSTMENT") {
        if (quantity > 0) {
            if (!toWarehouseId || fromWarehouseId) {
                throw httpError(400, "INVALID_ADJUSTMENT", "Ajuste positivo exige apenas destino");
            }
            if (unitCostCents === null) {
                throw httpError(400, "UNIT_COST_REQUIRED", "Ajuste positivo exige custo unitário");
            }
        } else if (!fromWarehouseId || toWarehouseId) {
            throw httpError(400, "INVALID_ADJUSTMENT", "Ajuste negativo exige apenas origem");
        }
    }

    return {
        type,
        itemId,
        quantity,
        unitCostCents,
        fromWarehouseId,
        toWarehouseId,
        reason,
        sourceType,
        sourceId,
    };
}
