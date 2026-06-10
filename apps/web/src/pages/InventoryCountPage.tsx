// apps/web/src/pages/InventoryCountPage.tsx
import { FormEvent, useState } from "react";
import {
  createInventoryCount,
  postInventoryCount,
  saveInventoryCountLines,
} from "../lib/inventoryCountsApi";
import type { InventoryCountLineInput } from "../lib/inventoryCountsApi";

const emptyLine: InventoryCountLineInput = { itemId: "", countedQuantity: 0, unitCostCents: null };

export function InventoryCountPage() {
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [countId, setCountId] = useState<string | null>(null);
  const [lines, setLines] = useState<InventoryCountLineInput[]>([{ ...emptyLine }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createInventoryCount({ warehouseId, reason });
      setCountId(result.count.id);
      setMessage("Contagem criada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a contagem.");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveLines() {
    if (!countId) return;
    setLoading(true);
    setError(null);

    try {
      await saveInventoryCountLines(countId, lines);
      setMessage("Linhas guardadas.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível guardar linhas.");
    } finally {
      setLoading(false);
    }
  }

  async function onPost() {
    if (!countId) return;
    setLoading(true);
    setError(null);

    try {
      await postInventoryCount(countId);
      setMessage("Contagem publicada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível publicar a contagem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Contagem física</h1>

      <form onSubmit={onCreate}>
        <label>
          Armazém
          <input value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} />
        </label>
        <label>
          Motivo
          <input value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
        <button type="submit" disabled={loading}>Criar contagem</button>
      </form>

      {countId ? <p>Contagem: {countId}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {message ? <p>{message}</p> : null}

      <table>
        <thead>
          <tr>
            <th>Artigo</th>
            <th>Quantidade contada</th>
            <th>Custo unitário</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={index}>
              <td>
                <input
                  value={line.itemId}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, itemId: event.target.value } : item
                      )
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={line.countedQuantity}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, countedQuantity: Number(event.target.value) } : item
                      )
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={line.unitCostCents ?? ""}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              unitCostCents:
                                event.target.value === "" ? null : Number(event.target.value),
                            }
                          : item
                      )
                    )
                  }
                  placeholder="Cêntimos"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" onClick={() => setLines((current) => [...current, { ...emptyLine }])}>
        Adicionar linha
      </button>
      <button type="button" disabled={!countId || loading} onClick={onSaveLines}>
        Guardar linhas
      </button>
      <button type="button" disabled={!countId || loading} onClick={onPost}>
        Publicar ajustes
      </button>
    </section>
  );
}