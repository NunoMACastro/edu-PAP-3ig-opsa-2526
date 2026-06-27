/**
 * @file Cliente de API específico para pagamentos de compras no frontend OPSA.
 */

import { apiClient, JsonBody } from "./apiClient";

export const paymentApi = {
  /**
   * Regista um pagamento parcial ou total associado a um documento de compra.
   *
   * @param purchaseDocumentId - Identificador do documento de compra alvo.
   * @param body - Corpo JSON enviado para a API.
   * @returns Resposta da API com o pagamento registado.
   */
  register: (purchaseDocumentId: string, body: JsonBody) =>
    apiClient.purchases.registerPayment(purchaseDocumentId, body),
};
