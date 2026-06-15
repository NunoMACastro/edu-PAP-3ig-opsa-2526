// apps/web/src/lib/complianceApi.ts
import { apiClient } from "./apiClient";

/**
 * Resultado da exportação SAF-T MVP.
 */
export type SaftExportResult = { fileName: string; xml: string; counts: Record<string, number> };

/**
 * Consulta a API de exportação SAF-T.
 *
 * @param {string} from Data inicial `YYYY-MM-DD`.
 * @param {string} to Data final `YYYY-MM-DD`.
 * @returns {Promise<SaftExportResult>} XML, nome de ficheiro e contagens.
 */
export async function fetchSaftExport(from: string, to: string): Promise<SaftExportResult> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<SaftExportResult>(`/api/compliance/saft?${params.toString()}`);
}