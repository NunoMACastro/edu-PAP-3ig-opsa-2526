// real_dev/web/src/lib/mf4Api.ts
import { createApiClient } from "./apiClient";

const client = createApiClient();

export interface AiInsight {
  id: string;
  type: string;
  severity: string;
  title: string;
  summary: string;
  explanation: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  suggestedAction: string | null;
  status: string;
}

/** Consulta insights automáticos da empresa ativa. */
export function getAiInsights(from: string, to: string) {
  // A query string leva apenas filtros de período.
  // A empresa ativa continua protegida no cookie de sessão e no backend.
  const query = "?from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to);
  return client.request<{ insights: AiInsight[] }>("GET", "/ai/insights" + query);
}
export interface AiActionSuggestion {
  id: string;
  insightId: string;
  actionType: string;
  title: string;
  rationale: string;
  sourceLabel: string;
  status: string;
}

/** Consulta sugestões de ação geradas a partir dos insights abertos. */
export function getAiSuggestions() {
  // O endpoint não recebe filtros por empresa. O backend usa a empresa ativa
  // guardada na sessão para escolher os insights e sugestões corretos.
  return client.request<{ suggestions: AiActionSuggestion[] }>("GET", "/ai/suggestions");
}