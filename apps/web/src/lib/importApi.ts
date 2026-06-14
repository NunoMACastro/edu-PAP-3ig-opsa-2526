// apps/web/src/lib/importApi.ts
import { apiClient } from "./apiClient";

/**
 * Tipos de importação aceites pela API.
 */
export type BusinessImportType = "CUSTOMERS" | "SUPPLIERS" | "ITEMS" | "STATEMENTS";

/**
 * Envia CSV operacional para importação backend.
 *
 * @param {BusinessImportType} type Tipo de entidade a importar.
 * @param {string} fileName Nome do ficheiro original.
 * @param {string} content Conteúdo CSV textual.
 * @returns {Promise<{ id: string, acceptedRows: number, rejectedRows: number }>} Resumo da importação.
 */
export async function importBusinessData(type: BusinessImportType, fileName: string, content: string) {
    return apiClient.post<{ id: string; acceptedRows: number; rejectedRows: number }>("/api/imports/business-data", { type, fileName, content });
}