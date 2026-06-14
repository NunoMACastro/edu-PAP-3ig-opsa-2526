// apps/web/src/pages/CashflowForecastPage.tsx
import { FormEvent, useState } from "react";
import { fetchCashflowForecast, type CashflowForecast } from "../lib/forecastApi";

/**
 * Formata cêntimos em euros para apresentacao.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor legível.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Página de previsão de tesouraria.
 *
 * Controla formulario de datas, loading, erro, resultado e estado vazio. A página mostra análise;
 * nenhuma ação automática e executada sobre documentos.
 *
 * @returns {JSX.Element} Interface do forecast.
 */
export function CashflowForecastPage() {
    const [result, setResult] = useState<CashflowForecast | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // O endpoint valida o horizonte; a UI apenas recolhe datas.
            setResult(await fetchCashflowForecast(String(form.get("from")), String(form.get("to"))));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Previsão de tesouraria</h1>
            <form onSubmit={handleSubmit}>
                <input name="from" type="date" required />
                <input name="to" type="date" required />
                <button disabled={loading}>{loading ? "A calcular..." : "Gerar previsão"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {result && <section><p>Saldo inicial: {euros(result.openingBalanceCents)}</p><p>Entradas: {euros(result.expectedInCents)}</p><p>Saídas: {euros(result.expectedOutCents)}</p><p>Saldo previsto: {euros(result.closingBalanceCents)}</p></section>}
            {result && result.rows.length === 0 && <p>Sem entradas ou saídas previstas no período.</p>}
        </main>
    );
}