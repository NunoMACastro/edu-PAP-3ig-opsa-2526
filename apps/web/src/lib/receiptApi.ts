/**
 * @file Cliente de API específico para recebimentos de vendas no frontend OPSA.
 */

import { apiClient, type ReceiptInput } from "./apiClient";

export const receiptApi = {
  /**
   * Regista um recebimento parcial ou total associado a um documento de venda.
   *
   * @param saleDocumentId - Identificador do documento de venda alvo.
   * @param body - Corpo JSON enviado para a API.
   * @returns Resposta da API com o recebimento registado.
   */
  register: (saleDocumentId: string, body: ReceiptInput) =>
    apiClient.sales.registerReceipt(saleDocumentId, body),
};
