// apps/web/src/pages/OperationalReportsPage.tsx
import { FormEvent, useState } from "react";
import { fetchOperationalReport, type OperationalReport } from "../lib/reportApi";

/**
 * Formata cêntimos em EUR para apresentacao.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor legível.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Página de relatórios operacionais.
 *
 * Gere datas, loading, erro, resultado e estado vazio. A página apresenta um indicador de margem MVP,
 * sem o transformar em demonstracao financeira oficial.
 *
 * @returns {JSX.Element} Interface de reporting operacional.
 */
export function OperationalReportsPage() {
    const [result, setResult] = useState<OperationalReport | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // A UI recolhe período; roles e empresa são validados pela route.
            setResult(await fetchOperationalReport(String(form.get("from")), String(form.get("to"))));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Relatórios operacionais</h1>
            <form onSubmit={handleSubmit}><input name="from" type="date" required /><input name="to" type="date" required /><button disabled={loading}>{loading ? "A carregar..." : "Consultar"}</button></form>
            {error && <p role="alert">{error}</p>}
            {result && <section><p>Vendas: {euros(result.totals.salesCents)}</p><p>Compras: {euros(result.totals.purchasesCents)}</p><p>Margem: {euros(result.totals.marginCents)}</p><p>Stock: {result.totals.stockUnits} unidades</p></section>}
            {result && result.sales.length === 0 && result.purchases.length === 0 && <p>Sem vendas ou compras no período.</p>}
        </main>
    );
}