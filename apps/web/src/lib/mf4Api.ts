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