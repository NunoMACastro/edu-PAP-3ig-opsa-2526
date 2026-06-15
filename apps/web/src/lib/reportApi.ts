// apps/web/src/lib/reportApi.ts
import { apiClient } from "./apiClient";

/**
 * Relatório operacional usado por gestores e operacionais.
 */
export type OperationalReport = {
    runId: string;
    totals: { salesCents: number; purchasesCents: number; marginCents: number; stockUnits: number };
    sales: Array<{ id: string; number: string; totalCents: number }>;
    purchases: Array<{ id: string; number: string; totalCents: number }>;
    stock: Array<{ itemId: string; sku: string; name: string; quantity: number }>;
    sources: string[];
};

/**
 * Consulta relatório operacional no backend.
 *
 * @param {string} from Data inicial `YYYY-MM-DD`.
 * @param {string} to Data final `YYYY-MM-DD`.
 * @returns {Promise<OperationalReport>} Relatório tipado com fontes.
 */
export async function fetchOperationalReport(from: string, to: string): Promise<OperationalReport> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<OperationalReport>(`/api/reports/operational?${params.toString()}`);
}