// apps/web/src/pages/PurchasePostingsPage.tsx
import { FormEvent, useState } from "react";
import { postPurchaseDocument } from "../lib/accountingApi";

export function PurchasePostingsPage() {
    const [purchaseDocumentId, setPurchaseDocumentId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        if (!purchaseDocumentId.trim()) {
            setError("Indica o documento de compra a contabilizar.");
            return;
        }
        setLoading(true);
        try {
            await postPurchaseDocument(purchaseDocumentId.trim());
            setSuccess("Lançamento contabilístico da compra criado com sucesso.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível contabilizar a compra.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Contabilizar compra</h1>
            <form onSubmit={handleSubmit} aria-label="Contabilizar compra">
                <input value={purchaseDocumentId} onChange={(event) => setPurchaseDocumentId(event.target.value)} placeholder="ID do documento de compra" />
                <button type="submit" disabled={loading}>{loading ? "A contabilizar..." : "Criar lançamento"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </main>
    );
}