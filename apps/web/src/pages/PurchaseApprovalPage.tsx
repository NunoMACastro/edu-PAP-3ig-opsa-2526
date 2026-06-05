// apps/web/src/pages/PurchaseApprovalPage.tsx
import { useState } from "react";
import { approvePurchaseDocument, markPurchaseDocumentPosted } from "../lib/purchaseApprovalApi";

export function PurchaseApprovalPage() {
    const [purchaseDocumentId, setPurchaseDocumentId] = useState("");
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function runAction(action: "approve" | "post") {
        setError(null);
        setSuccess(null);
        if (!purchaseDocumentId.trim()) {
            setError("Indica o documento de compra.");
            return;
        }
        setLoadingAction(action);
        try {
            if (action === "approve") await approvePurchaseDocument(purchaseDocumentId.trim());
            if (action === "post") await markPurchaseDocumentPosted(purchaseDocumentId.trim());
            setSuccess(action === "approve" ? "Compra aprovada com sucesso." : "Compra lançada com diário contabilístico.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível atualizar a compra.");
        } finally {
            setLoadingAction(null);
        }
    }

    return (
        <main>
            <h1>Aprovação de compras</h1>
            <input value={purchaseDocumentId} onChange={(event) => setPurchaseDocumentId(event.target.value)} placeholder="ID do documento de compra" />
            <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("approve")}>Aprovar</button>
            <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("post")}>Marcar como lançada</button>
            {loadingAction && <p>A processar...</p>}
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </main>
    );
}