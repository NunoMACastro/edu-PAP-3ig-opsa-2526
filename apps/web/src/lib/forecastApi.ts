// apps/web/src/lib/forecastApi.ts
import { apiClient } from "./apiClient";

/**
 * Resultado da previsão de tesouraria devolvido pela API.
 */
export type CashflowForecast = {
    runId: string;
    from: string;
    to: string;
    openingBalanceCents: number;
    expectedInCents: number;
    expectedOutCents: number;
    closingBalanceCents: number;
    rows: Array<{ date: string; expectedInCents: number; expectedOutCents: number; projectedBalanceCents: number; sources: string[] }>;
};

/**
 * Consulta a previsão de tesouraria no período indicado.
 *
 * @param {string} from Data inicial `YYYY-MM-DD`.
 * @param {string} to Data final `YYYY-MM-DD`.
 * @returns {Promise<CashflowForecast>} Forecast tipado.
 */
export async function fetchCashflowForecast(from: string, to: string): Promise<CashflowForecast> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<CashflowForecast>(`/api/treasury/forecast?${params.toString()}`);
}