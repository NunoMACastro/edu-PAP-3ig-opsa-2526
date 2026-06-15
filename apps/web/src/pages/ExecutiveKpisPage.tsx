// apps/web/src/pages/ExecutiveKpisPage.tsx
import { FormEvent, useState } from "react";
import { fetchExecutiveKpis, type ExecutiveKpis } from "../lib/kpiApi";

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
 * Página de KPIs executivos.
 *
 * Mostra indicadores e fontes sem executar qualquer decisão automática. PMR/PMP usam texto "Sem dados"
 * quando o backend devolve `null`.
 *
 * @returns {JSX.Element} Interface de KPIs.
 */
export function ExecutiveKpisPage() {
    const [result, setResult] = useState<ExecutiveKpis | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // A UI pede o período; permissões e empresa são sempre decididas no backend.
            setResult(await fetchExecutiveKpis(String(form.get("from")), String(form.get("to"))));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>KPIs executivos</h1>
            <form onSubmit={handleSubmit}><input name="from" type="date" required /><input name="to" type="date" required /><button disabled={loading}>{loading ? "A calcular..." : "Calcular KPIs"}</button></form>
            {error && <p role="alert">{error}</p>}
            {result && <section><p>Receita: {euros(result.revenueCents)}</p><p>Custos: {euros(result.costCents)}</p><p>EBITDA MVP: {euros(result.ebitdaCents)}</p><p>PMR: {result.pmrDays ?? "Sem dados"} dias</p><p>PMP: {result.pmpDays ?? "Sem dados"} dias</p><p>Fontes: {result.sources.join(", ")}</p></section>}
        </main>
    );
}