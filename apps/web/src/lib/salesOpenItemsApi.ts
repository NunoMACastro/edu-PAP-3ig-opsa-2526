/**
 * @file Cliente de API específico para títulos de venda em aberto no frontend OPSA.
 */

import { apiClient } from "./apiClient";

export const salesOpenItemsApi = {
  /**
   * Lista títulos em aberto numa data de referência opcional.
   *
   * @param asOfDate - Data de referência opcional para a consulta.
   * @returns Resposta da API com os títulos em aberto.
   */
  list: (asOfDate?: string) => apiClient.sales.listOpenItems(asOfDate),
};
