// apps/web/src/lib/statementApi.ts
import { apiClient } from "./apiClient";

/**
 * Payload enviado para importar um extrato textual.
 */
export type StatementImportPayload = {
    treasuryAccountId: string;
    fileName: string;
    format: "CSV" | "OFX";
    content: string;
};

/**
 * Resultado resumido da importação, incluindo sugestões criadas.
 */
export type StatementImportResult = {
    id: string;
    totalLines: number;
    lines: Array<{
        id: string;
        amountCents: number;
        suggestions: Array<{ targetType: string; targetId: string; confidence: number; reason: string }>;
    }>;
};

/**
 * Envia um extrato textual para o backend.
 *
 * @param {StatementImportPayload} payload Conta, nome, formato e conteúdo textual.
 * @returns {Promise<StatementImportResult>} Importação criada com linhas e sugestões.
 * @throws {Error} Quando a API rejeita formato, conta ou sessão.
 */
export async function importStatement(payload: StatementImportPayload): Promise<StatementImportResult> {
    return apiClient.post<StatementImportResult>("/api/treasury/statements/import", payload);
}