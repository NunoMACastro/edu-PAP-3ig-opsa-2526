// apps/web/src/pages/VatRatesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createVatRate, fetchVatRates, setVatRateActive, type VatRate } from "../lib/vatRateApi";

const emptyForm = { code: "", description: "", rateBps: 2300, type: "NORMAL", exemptionReason: "" };

export function VatRatesPage() {
    const [rates, setRates] = useState<VatRate[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function loadRates() {
        setLoading(true);
        setError(null);
        try {
            setRates(await fetchVatRates());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar as taxas de IVA.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { void loadRates(); }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        if (!form.code.trim() || !form.description.trim()) {
            setError("Preenche o código e a descrição da taxa de IVA.");
            return;
        }
        if (form.type === "EXEMPT" && !form.exemptionReason.trim()) {
            setError("Uma taxa isenta precisa de motivo de isenção.");
            return;
        }

        setSaving(true);
        try {
            await createVatRate({ ...form, code: form.code.trim(), description: form.description.trim() });
            setForm(emptyForm);
            setSuccess("Taxa de IVA criada com sucesso.");
            await loadRates();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível criar a taxa de IVA.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSetActive(rate: VatRate) {
        setUpdatingId(rate.id);
        setError(null);
        setSuccess(null);
        try {
            await setVatRateActive(rate.id, !rate.isActive);
            setSuccess(rate.isActive ? "Taxa de IVA desativada." : "Taxa de IVA ativada.");
            await loadRates();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível alterar o estado da taxa de IVA.");
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <main>
            <h1>Tabelas de IVA</h1>
            <form onSubmit={handleSubmit} aria-label="Criar taxa de IVA">
                <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="Código" />
                <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Descrição" />
                <input type="number" value={form.rateBps} onChange={(event) => setForm({ ...form, rateBps: Number(event.target.value) })} />
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                    <option value="NORMAL">Normal</option>
                    <option value="INTERMEDIATE">Intermedia</option>
                    <option value="REDUCED">Reduzida</option>
                    <option value="EXEMPT">Isenta</option>
                    <option value="OTHER">Outra</option>
                </select>
                <input value={form.exemptionReason} onChange={(event) => setForm({ ...form, exemptionReason: event.target.value })} placeholder="Motivo de isenção" />
                <button type="submit" disabled={saving}>{saving ? "A guardar..." : "Guardar taxa"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
            {loading ? <p>A carregar taxas...</p> : rates.length === 0 ? <p>Ainda não existem taxas de IVA.</p> : (
                <ul>
                    {rates.map((rate) => (
                        <li key={rate.id}>
                            {rate.code} - {rate.description} ({rate.rateBps / 100}%) - {rate.isActive ? "Ativa" : "Inativa"}
                            <button type="button" disabled={updatingId === rate.id} onClick={() => void handleSetActive(rate)}>
                                {rate.isActive ? "Desativar" : "Ativar"}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}