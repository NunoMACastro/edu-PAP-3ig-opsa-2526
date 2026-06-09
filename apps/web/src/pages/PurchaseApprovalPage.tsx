import { FormEvent, useEffect, useState } from "react";
import {
  approvePurchaseDocument,
  fetchPurchaseApprovalHistory,
  markPurchaseDocumentPosted,
  rejectPurchaseDocument,
} from "../lib/purchaseApprovalApi";
import type { PurchaseApprovalHistoryItem } from "../lib/purchaseApprovalApi";

export function PurchaseApprovalPage() {
  const [purchaseDocumentId, setPurchaseDocumentId] = useState("");
  const [items, setItems] = useState<PurchaseApprovalHistoryItem[]>([]);
  const [reason, setReason] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | "post" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadHistory(id = purchaseDocumentId.trim()) {
    if (!id) {
      setItems([]);
      return;
    }

    setLoadingHistory(true);
    setError(null);

    try {
      const result = await fetchPurchaseApprovalHistory(id);
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o histórico.");
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, [purchaseDocumentId]);

  function handleApproveSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runAction("approve");
  }

  async function runAction(action: "approve" | "reject" | "post") {
    const id = purchaseDocumentId.trim();

    setError(null);
    setSuccess(null);

    if (!id) {
      setError("Indica o documento de compra.");
      return;
    }

    if (action === "reject" && reason.trim().length < 8) {
      setError("Indica uma justificação de reprovação com pelo menos 8 caracteres.");
      return;
    }

    setLoadingAction(action);
    try {
      if (action === "approve") {
        await approvePurchaseDocument(id, { reason });
        setSuccess("Compra aprovada com histórico registado.");
      }

      if (action === "reject") {
        await rejectPurchaseDocument(id, { reason });
        setSuccess("Compra reprovada com justificação registada.");
      }

      if (action === "post") {
        await markPurchaseDocumentPosted(id);
        setSuccess("Compra lançada com diário contabilístico.");
      }

      if (action !== "post") setReason("");
      await loadHistory(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar a compra.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <main>
      <h1>Aprovação de compras</h1>

      <form onSubmit={handleApproveSubmit}>
        <label>
          Documento de compra
          <input
            value={purchaseDocumentId}
            onChange={(event) => setPurchaseDocumentId(event.target.value)}
            placeholder="ID do documento de compra"
          />
        </label>
        <label>
          Justificação
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>

        <button type="submit" disabled={loadingAction !== null}>
          Aprovar
        </button>
        <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("reject")}>
          Reprovar
        </button>
        <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("post")}>
          Marcar como lançada
        </button>
      </form>

      {error ? <p role="alert">{error}</p> : null}
      {success ? <p role="status">{success}</p> : null}
      {loadingAction ? <p>A processar...</p> : null}
      {loadingHistory ? <p>A carregar histórico...</p> : null}

      {!loadingHistory && items.length === 0 ? <p>Ainda não existem decisões.</p> : null}
      {!loadingHistory && items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.action}</strong> - {item.reason} - {item.decidedBy.email}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}