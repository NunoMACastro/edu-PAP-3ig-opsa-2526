// apps/web/src/lib/kpiApi.ts
import { apiClient } from "./apiClient";

/**
 * KPIs executivos devolvidos pela API.
 */
export type ExecutiveKpis = {
    runId: string;
    revenueCents: number;
    costCents: number;
    ebitdaCents: number;
    pmrDays: number | null;
    pmpDays: number | null;
    sources: string[];
};

/**
 * Consulta KPIs executivos no backend.
 *
 * @param {string} from Data inicial `YYYY-MM-DD`.
 * @param {string} to Data final `YYYY-MM-DD`.
 * @returns {Promise<ExecutiveKpis>} Indicadores com fontes.
 */
export async function fetchExecutiveKpis(from: string, to: string): Promise<ExecutiveKpis> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<ExecutiveKpis>(`/api/reports/executive-kpis?${params.toString()}`);
}