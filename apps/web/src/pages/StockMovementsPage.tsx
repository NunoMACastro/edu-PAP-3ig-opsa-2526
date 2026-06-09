// apps/web/src/pages/StockMovementsPage.tsx
import { FormEvent, useState } from "react";
import { createStockMovement, StockMovementType } from "../lib/stockMovementsApi";

function movementNeedsUnitCost(type: StockMovementType) {
  return type === "ENTRY" || type === "RETURN";
}

export function StockMovementsPage() {
  const [type, setType] = useState<StockMovementType>("ENTRY");
  const [itemId, setItemId] = useState("");
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCostCents, setUnitCostCents] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await createStockMovement({
        type,
        itemId,
        quantity,
        reason,
        fromWarehouseId: fromWarehouseId || undefined,
        toWarehouseId: toWarehouseId || undefined,
        unitCostCents: movementNeedsUnitCost(type) ? unitCostCents : undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar movimento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Movimentos de stock</h1>
      <form onSubmit={onSubmit}>
        <select value={type} onChange={(event) => setType(event.target.value as StockMovementType)}>
          <option value="ENTRY">Entrada</option>
          <option value="EXIT">Saída</option>
          <option value="TRANSFER">Transferência</option>
          <option value="RETURN">Devolução</option>
        </select>
        <input value={itemId} onChange={(event) => setItemId(event.target.value)} placeholder="Artigo" />
        <input value={fromWarehouseId} onChange={(event) => setFromWarehouseId(event.target.value)} placeholder="Armazém de origem" />
        <input value={toWarehouseId} onChange={(event) => setToWarehouseId(event.target.value)} placeholder="Armazém de destino" />
        <input type="number" min="0.001" step="0.001" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
        {movementNeedsUnitCost(type) ? (
          <input
            type="number"
            min="1"
            step="1"
            value={unitCostCents}
            onChange={(event) => setUnitCostCents(Number(event.target.value))}
            placeholder="Custo unitário em cêntimos"
          />
        ) : null}
        <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo" />
        <button type="submit" disabled={loading}>{loading ? "A guardar..." : "Criar"}</button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
      {success ? <p>Movimento criado.</p> : null}
    </section>
  );
}