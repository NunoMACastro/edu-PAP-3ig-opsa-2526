// apps/web/src/pages/AiInsightExplanationPage.tsx
import { FormEvent, useState } from "react";
import { InsightExplanation, getInsightExplanation } from "../lib/mf4Api";

/** Mostra explicação e fonte de um insight RF43. */
export function AiInsightExplanationPage() {
  const [explanation, setExplanation] = useState<InsightExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = String(new FormData(event.currentTarget).get("id") ?? "");
    try {
      // A página apenas pede o detalhe; validação de ownership e permissões fica no backend.
      const result = await getInsightExplanation(id);
      setExplanation(result.explanation);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  return (
    <section className="panel">
      <h2>Explicação do insight</h2>
      <form onSubmit={submit}>
        <input name="id" required />
        <button>Consultar</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {explanation ? (
        <article>
          <h3>{explanation.title}</h3>
          <p>{explanation.summary}</p>
          <p>{explanation.explanation}</p>
          <p>{explanation.guardrail}</p>
          <small>{explanation.source.type}: {explanation.source.label}</small>
        </article>
      ) : null}
    </section>
  );
}