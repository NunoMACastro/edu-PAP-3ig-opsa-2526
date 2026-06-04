// apps/web/src/pages/SaleDocumentsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createSaleDocument, fetchSaleDocuments, issueSaleDocument, type SaleDocumentInput } from "../lib/salesApi";

type SaleDocumentRow = { id: string; number: string | null; kind: string; status: string; totalCents: number };

const emptyForm: SaleDocumentInput = {
    kind: "INVOICE",
    customerId: "",
    issuedAt: new Date().toISOString().slice(0, 10),
    lines: [{ itemId: "", vatRateId: "", description: "", quantity: 1, unitPriceCents: 0 }],
};

export function SaleDocumentsPage() {
    const [documents, setDocuments] = useState<SaleDocumentRow[]>([]);
    const [form, setForm] = useState<SaleDocumentInput>(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function loadDocuments() {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchSaleDocuments() as { data: SaleDocumentRow[] };
            setDocuments(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar documentos de venda.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { void loadDocuments(); }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        const line = form.lines[0];
        if (!form.customerId || !line.itemId || !line.vatRateId || line.quantity <= 0 || line.unitPriceCents <= 0) {
            setError("Preenche cliente, artigo, IVA, quantidade e preço antes de guardar.");
            return;
        }
        setSaving(true);
        try {
            await createSaleDocument(form);
            setForm(emptyForm);
            setSuccess("Documento de venda criado em rascunho.");
            await loadDocuments();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível criar o documento.");
        } finally {
            setSaving(false);
        }
    }

    async function handleIssue(id: string) {
        setError(null);
        setSuccess(null);
        try {
            await issueSaleDocument(id);
            setSuccess("Documento emitido com numeração definitiva.");
            await loadDocuments();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível emitir o documento.");
        }
    }

    return (
        <main>
            <h1>Documentos de venda</h1>
            <form onSubmit={handleSubmit} aria-label="Criar documento de venda">
                <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as SaleDocumentInput["kind"] })}>
                    <option value="INVOICE">Fatura</option>
                    <option value="INVOICE_RECEIPT">Fatura-recibo</option>
                    <option value="CREDIT_NOTE">Nota de crédito</option>
                </select>
                <input value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} placeholder="ID do cliente" />
                <input type="date" value={form.issuedAt} onChange={(event) => setForm({ ...form, issuedAt: event.target.value })} />
                <input value={form.lines[0].itemId} onChange={(event) => setForm({ ...form, lines: [{ ...form.lines[0], itemId: event.target.value }] })} placeholder="ID do artigo" />
                <input value={form.lines[0].vatRateId} onChange={(event) => setForm({ ...form, lines: [{ ...form.lines[0], vatRateId: event.target.value }] })} placeholder="ID da taxa IVA" />
                <input type="number" value={form.lines[0].unitPriceCents} onChange={(event) => setForm({ ...form, lines: [{ ...form.lines[0], unitPriceCents: Number(event.target.value) }] })} />
                <button type="submit" disabled={saving}>{saving ? "A guardar..." : "Guardar rascunho"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
            {loading ? <p>A carregar documentos...</p> : documents.length === 0 ? <p>Ainda não existem documentos.</p> : (
                <ul>{documents.map((document) => <li key={document.id}>{document.number ?? "Rascunho"} - {document.status} - {document.totalCents / 100} EUR <button type="button" onClick={() => void handleIssue(document.id)}>Emitir</button></li>)}</ul>
            )}
        </main>
    );
}