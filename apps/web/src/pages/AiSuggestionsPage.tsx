import { useState } from "react";
import { AiActionSuggestion, getAiSuggestions } from "../lib/mf4Api";

/** Página MF4 para Sugestões de ação. */
export function AiSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<AiActionSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const result = await getAiSuggestions();
      // Guardamos apenas o array tipado que a página vai renderizar.
      // Não há JSON bruto porque cada campo tem significado pedagógico.
      setSuggestions(result.suggestions);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  return (
    <section className="panel">
      <h2>Sugestões de ação</h2>
      <button type="button" onClick={load}>Consultar</button>
      {error ? <p className="error">{error}</p> : null}
      {suggestions.length === 0 ? <p>Sem sugestões abertas.</p> : null}
      <ul>
        {suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <strong>{suggestion.title}</strong>
            <p>{suggestion.rationale}</p>
            <small>{suggestion.actionType} · {suggestion.sourceLabel}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}