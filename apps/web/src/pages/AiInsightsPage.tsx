// real_dev/web/src/pages/AiInsightsPage.tsx
import { FormEvent, useState } from "react";
import { AiInsight, getAiInsights } from "../lib/mf4Api";

/** Página de consulta de insights automáticos RF39. */
export function AiInsightsPage() {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const from = String(form.get("from") ?? "");
      const to = String(form.get("to") ?? "");
      // A UI não calcula insights: pede ao backend para aplicar as regras
      // com autenticação, permissões e dados reais da empresa ativa.
      const result = await getAiInsights(from, to);
      setInsights(result.insights);
    } catch (caught) {
      // A mensagem vem do ApiError criado no apiClient, por isso fica alinhada
      // com os erros controlados do backend.
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h2>Insights automáticos</h2>
      <form onSubmit={submit}>
        <input name="from" type="date" required />
        <input name="to" type="date" required />
        <button disabled={busy}>{busy ? "A gerar..." : "Gerar"}</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {insights.length === 0 ? <p>Sem insights para o período.</p> : null}
      <ul>
        {insights.map((insight) => (
          <li key={insight.id}>
            <strong>{insight.title}</strong>
            <p>{insight.summary}</p>
            <small>{insight.sourceType}: {insight.sourceLabel}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}