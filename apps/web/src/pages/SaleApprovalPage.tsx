// apps/web/src/pages/SaleApprovalPage.tsx
import { FormEvent, useState } from "react";
import { approveSaleDocument, rejectSaleDocument, submitSaleDocument } from "../lib/saleApprovalApi";

export function SaleApprovalPage() {
    const [saleDocumentId, setSaleDocumentId] = useState("");
    const [reason, setReason] = useState("");
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function runAction(action: "submit" | "approve" | "reject") {
        setError(null);
        setSuccess(null);
        if (!saleDocumentId.trim()) {
            setError("Indica o documento de venda.");
            return;
        }
        if (action === "reject" && !reason.trim()) {
            setError("Indica o motivo da rejeição.");
            return;
        }
        setLoadingAction(action);
        try {
            if (action === "submit") await submitSaleDocument(saleDocumentId.trim());
            if (action === "approve") await approveSaleDocument(saleDocumentId.trim());
            if (action === "reject") await rejectSaleDocument(saleDocumentId.trim(), reason.trim());
            setSuccess("Estado do documento atualizado com sucesso.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível atualizar o documento.");
        } finally {
            setLoadingAction(null);
        }
    }

    function handleReject(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void runAction("reject");
    }

    return (
        <main>
            <h1>Aprovação de vendas</h1>
            <input value={saleDocumentId} onChange={(event) => setSaleDocumentId(event.target.value)} placeholder="ID do documento de venda" />
            <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("submit")}>Submeter</button>
            <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("approve")}>Aprovar</button>
            <form onSubmit={handleReject} aria-label="Rejeitar documento de venda">
                <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo de rejeição" />
                <button type="submit" disabled={loadingAction !== null}>Rejeitar</button>
            </form>
            {loadingAction && <p>A processar...</p>}
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </main>
    );
}