// apps/web/src/pages/SalePostingsPage.tsx
import { FormEvent, useState } from "react";
import { postSaleDocument } from "../lib/accountingApi";

export function SalePostingsPage() {
    const [saleDocumentId, setSaleDocumentId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        if (!saleDocumentId.trim()) {
            setError("Indica o documento de venda a contabilizar.");
            return;
        }
        setLoading(true);
        try {
            await postSaleDocument(saleDocumentId.trim());
            setSuccess("Lançamento contabilístico da venda criado com sucesso.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível contabilizar a venda.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Contabilizar venda</h1>
            <form onSubmit={handleSubmit} aria-label="Contabilizar venda">
                <input value={saleDocumentId} onChange={(event) => setSaleDocumentId(event.target.value)} placeholder="ID do documento de venda" />
                <button type="submit" disabled={loading}>{loading ? "A contabilizar..." : "Criar lançamento"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </main>
    );
}