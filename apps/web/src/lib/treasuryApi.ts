// apps/web/src/lib/treasuryApi.ts
import { apiClient } from "./apiClient";

/**
 * Payload enviado pelo formulario de contas de tesouraria.
 */
export type TreasuryAccountPayload = {
    name: string;
    type: "BANK" | "CASH";
    iban?: string;
    currency: string;
    initialBalanceCents: number;
};

/**
 * Conta devolvida pela API, incluindo o snapshot mais recente para mostrar saldo.
 */
export type TreasuryAccount = TreasuryAccountPayload & {
    id: string;
    isActive: boolean;
    snapshots: Array<{ balanceCents: number; capturedAt: string }>;
};

/**
 * Lista contas de tesouraria usando o cliente HTTP comum da MF1.
 *
 * @returns {Promise<TreasuryAccount[]>} Contas ativas da empresa atual.
 */
export function listTreasuryAccounts() {
    return apiClient.get<TreasuryAccount[]>("/api/treasury/accounts");
}

/**
 * Cria uma conta bancária ou caixa.
 *
 * @param {TreasuryAccountPayload} payload Dados validados no backend.
 * @returns {Promise<TreasuryAccount>} Conta criada.
 */
export function createTreasuryAccount(payload: TreasuryAccountPayload) {
    return apiClient.post<TreasuryAccount>("/api/treasury/accounts", payload);
}