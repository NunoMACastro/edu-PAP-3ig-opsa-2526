// apps/web/src/pages/PurchaseDocumentsPage.tsx
import { FormEvent, useState } from "react";
import { createPurchaseDocument, type PurchaseDocumentInput } from "../lib/purchasesApi";

const emptyForm: PurchaseDocumentInput = {
    kind: "SUPPLIER_INVOICE",
    supplierId: "",
    supplierNumber: "",
    issuedAt: new Date().toISOString().slice(0, 10),
    lines: [{ itemId: "", vatRateId: "", description: "", quantity: 1, unitCostCents: 0 }],
};

export function PurchaseDocumentsPage() {
    const [form, setForm] = useState<PurchaseDocumentInput>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        const line = form.lines[0];
        if (!form.supplierId || !form.supplierNumber || !line.itemId || !line.vatRateId || line.quantity <= 0 || line.unitCostCents <= 0) {
            setError("Preenche fornecedor, número, artigo, IVA, quantidade e custo.");
            return;
        }
        setSaving(true);
        try {
            await createPurchaseDocument(form);
            setForm(emptyForm);
            setSuccess("Documento de compra registado com sucesso.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível registar a compra.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main>
            <h1>Compras</h1>
            <form onSubmit={handleSubmit} aria-label="Registar documento de compra">
                <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as PurchaseDocumentInput["kind"] })}>
                    <option value="SUPPLIER_INVOICE">Fatura de fornecedor</option>
                    <option value="SUPPLIER_CREDIT_NOTE">Nota de crédito</option>
                </select>
                <input value={form.supplierId} onChange={(event) => setForm({ ...form, supplierId: event.target.value })} placeholder="ID do fornecedor" />
                <input value={form.supplierNumber} onChange={(event) => setForm({ ...form, supplierNumber: event.target.value })} placeholder="Número do fornecedor" />
                <input type="date" value={form.issuedAt} onChange={(event) => setForm({ ...form, issuedAt: event.target.value })} />
                <input value={form.lines[0].itemId} onChange={(event) => setForm({ ...form, lines: [{ ...form.lines[0], itemId: event.target.value }] })} placeholder="ID do artigo" />
                <input value={form.lines[0].vatRateId} onChange={(event) => setForm({ ...form, lines: [{ ...form.lines[0], vatRateId: event.target.value }] })} placeholder="ID da taxa IVA" />
                <input type="number" value={form.lines[0].unitCostCents} onChange={(event) => setForm({ ...form, lines: [{ ...form.lines[0], unitCostCents: Number(event.target.value) }] })} />
                <button type="submit" disabled={saving}>{saving ? "A guardar..." : "Registar compra"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </main>
    );
}