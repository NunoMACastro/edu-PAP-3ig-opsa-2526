// apps/web/src/pages/VatMapPage.tsx
import { FormEvent, useState } from "react";
import { fetchVatMap, type VatMapResult } from "../lib/taxApi";

/**
 * Formata cêntimos para euros apenas para apresentacao.
 *
 * @param {number} cents Valor em cêntimos vindo da API.
 * @returns {string} Valor monetario legível.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Página React que permite gerar e consultar o mapa de IVA.
 *
 * Mantém estados de formulario, carregamento, erro, resultado e vazio. A empresa continua a vir da sessão
 * no backend, por isso a página nunca pede `companyId` ao utilizador.
 *
 * @returns {JSX.Element} Interface do mapa de IVA.
 */
export function VatMapPage() {
    const [from, setFrom] = useState("2026-01-01");
    const [to, setTo] = useState("2026-01-31");
    const [result, setResult] = useState<VatMapResult | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            // A chamada usa cookies HttpOnly via apiClient; não há tokens em localStorage.
            setResult(await fetchVatMap(from, to));
        } catch (caughtError) {
            setResult(null);
            setError(caughtError instanceof Error ? caughtError.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Mapa de IVA</h1>
            <form onSubmit={handleSubmit}>
                <label>Data inicial<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} required /></label>
                <label>Data final<input type="date" value={to} onChange={(event) => setTo(event.target.value)} required /></label>
                <button type="submit" disabled={loading}>{loading ? "A calcular..." : "Gerar mapa"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {result && result.rows.length === 0 && <p>Sem movimentos de IVA no período selecionado.</p>}
            {result && (
                <section aria-label="Resumo de IVA">
                    <p>IVA liquidado: {euros(result.totals.liquidatedVatCents)}</p>
                    <p>IVA dedutível: {euros(result.totals.deductibleVatCents)}</p>
                    <p>Saldo de IVA: {euros(result.totals.vatBalanceCents)}</p>
                    <table>
                        <thead><tr><th>Código</th><th>Taxa</th><th>Liquidado</th><th>Dedutível</th><th>Saldo</th></tr></thead>
                        <tbody>
                            {result.rows.map((row) => (
                                <tr key={`${row.vatCode}-${row.vatRateBps}`}>
                                    <td>{row.vatCode}</td>
                                    <td>{row.vatRateBps / 100}%</td>
                                    <td>{euros(row.liquidatedVatCents)}</td>
                                    <td>{euros(row.deductibleVatCents)}</td>
                                    <td>{euros(row.balanceCents)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}
        </main>
    );
}