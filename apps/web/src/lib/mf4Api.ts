import { client } from "./client";

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

/** Resposta da API de alertas */
export interface SmartAlertsResponse {
    alerts: SmartAlert[];
}

/** Consulta alertas inteligentes da empresa ativa */
export function getSmartAlerts() {
    return client.request<SmartAlertsResponse>(
        "GET",
        "/ai/alerts"
    );
}