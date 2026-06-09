// apps/web/src/pages/FifoCostPage.tsx
import { FormEvent, useState } from "react";
import { previewFifoCost, type FifoPreviewLine } from "../lib/fifoCostApi";

export function FifoCostPage() {
  const [itemId, setItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<FifoPreviewLine[]>([]);
  const [totalCostCents, setTotalCostCents] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await previewFifoCost({ itemId, warehouseId, quantity });
      setItems(result.items);
      setTotalCostCents(result.totalCostCents);
    } catch (err) {
      setItems([]);
      setTotalCostCents(0);
      setError(err instanceof Error ? err.message : "Não foi possível calcular FIFO.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Custo FIFO</h1>
      <form onSubmit={onSubmit}>
        <input value={itemId} onChange={(event) => setItemId(event.target.value)} placeholder="Artigo" />
        <input value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} placeholder="Armazém" />
        <input type="number" min="0.001" step="0.001" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
        <button type="submit" disabled={loading}>{loading ? "A calcular..." : "Calcular"}</button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
      {!error && items.length === 0 ? <p>Sem camadas FIFO para mostrar.</p> : null}
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.layerId}>{item.quantity} unidades a {item.unitCostCents / 100} EUR</li>
          ))}
        </ul>
      ) : null}
      {items.length > 0 ? <p>Total: {totalCostCents / 100} EUR</p> : null}
    </section>
  );
}