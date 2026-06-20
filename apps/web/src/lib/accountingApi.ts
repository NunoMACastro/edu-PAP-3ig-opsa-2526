/**
 * @file Cliente de API específico para lançamentos contabilísticos no frontend OPSA.
 */

import { apiClient } from "./apiClient";

export const accountingApi = {
  /**
   * Gera o lançamento contabilístico de um documento de venda já elegível.
   *
   * @param saleDocumentId - Identificador do documento de venda alvo.
   * @returns Resposta da API com o lançamento contabilístico de venda gerado.
   */
  postSaleDocument: (saleDocumentId: string) =>
    apiClient.accounting.postSaleDocument(saleDocumentId),
  /**
   * Gera o lançamento contabilístico de um documento de compra já aprovado.
   *
   * @param purchaseDocumentId - Identificador do documento de compra alvo.
   * @returns Resposta da API com o lançamento contabilístico de compra gerado.
   */
  postPurchaseDocument: (purchaseDocumentId: string) =>
    apiClient.accounting.postPurchaseDocument(purchaseDocumentId),
};
