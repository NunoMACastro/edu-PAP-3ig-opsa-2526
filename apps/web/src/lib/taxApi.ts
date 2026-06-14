// apps/web/src/lib/taxApi.ts
import { apiClient } from "./apiClient";

/**
 * Linha agregada do mapa de IVA por código/taxa.
 */
export type VatMapRow = {
    vatCode: string;
    vatRateBps: number;
    liquidatedVatCents: number;
    deductibleVatCents: number;
    balanceCents: number;
};

/**
 * Resultado completo devolvido por `GET /api/tax/vat-maps`.
 */
export type VatMapResult = {
    runId: string;
    from: string;
    to: string;
    totals: {
        liquidatedVatCents: number;
        deductibleVatCents: number;
        vatBalanceCents: number;
    };
    rows: VatMapRow[];
    sources: string[];
};

/**
 * Chama o endpoint real do mapa de IVA usando o cliente comum da MF1.
 *
 * @param {string} from Data inicial no formato ISO `YYYY-MM-DD`.
 * @param {string} to Data final no formato ISO `YYYY-MM-DD`.
 * @returns {Promise<VatMapResult>} Resultado tipado do mapa.
 * @throws {Error} Quando o backend devolve erro HTTP.
 */
export async function fetchVatMap(from: string, to: string): Promise<VatMapResult> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<VatMapResult>(`/api/tax/vat-maps?${params.toString()}`);
}