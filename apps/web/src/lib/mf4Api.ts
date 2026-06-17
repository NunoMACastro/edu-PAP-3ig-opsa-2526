export interface SmartAlert {
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    sourceType: string;
    sourceId: string;
    status: string;
}

export interface SmartAlertsResponse {
    alerts: SmartAlert[];
}

/**
 * Cliente HTTP simples baseado em fetch.
 * (Substitui o "client" inexistente no teu projeto)
 */
async function request<T>(
    method: string,
    url: string,
    body?: unknown
): Promise<T> {
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro na API");
    }

    return res.json();
}

/** Consulta alertas inteligentes da empresa ativa */
export function getSmartAlerts() {
    return request<SmartAlertsResponse>("GET", "/ai/alerts");
}

// função a adicionar em apps/web/src/lib/mf4Api.ts
export interface InsightExplanation {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  source: AiSourceReference;
  suggestedAction: string | null;
  guardrail: string;
}

/** Consulta explicação e fonte de um insight. */
export function getInsightExplanation(id: string) {
  // O id entra no caminho da URL, por isso é codificado para evitar caracteres
  // problemáticos e manter o pedido HTTP previsível.
  return client.request<{ explanation: InsightExplanation }>(
    "GET",
    "/ai/insights/" + encodeURIComponent(id) + "/explanation",
  );
}