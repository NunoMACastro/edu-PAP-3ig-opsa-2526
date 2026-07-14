/**
 * @file Cliente de API específico para aprovação de compras no frontend OPSA.
 */

import { apiClient } from "./apiClient";

export const purchaseApprovalApi = {
  /**
   * Aprova um documento de compra submetido.
   *
   * @param id - Identificador do registo alvo.
   * @returns Resposta da API com o documento de compra aprovado.
   */
  approveDocument: (id: string) => apiClient.purchases.approveDocument(id),
  /**
   * Rejeita um documento de compra com motivo auditável.
   *
   * @param id - Identificador do registo alvo.
   * @param reason - Motivo funcional associado à operação.
   * @returns Resposta da API com o documento de compra rejeitado.
   */
  rejectDocument: (id: string, reason: string) =>
    apiClient.purchases.rejectDocument(id, { reason }),
  /**
   * Obtém o histórico de decisões de aprovação de um documento.
   *
   * @param id - Identificador do registo alvo.
   * @returns Histórico de aprovação devolvido pela API.
   */
  approvalHistory: (id: string) => apiClient.purchases.approvalHistory(id),
  /**
   * Consulta o estado de contabilização de um documento de compra.
   *
   * @param id - Identificador do registo alvo.
   * @returns Estado de contabilização devolvido pela API.
   */
  postState: (id: string) => apiClient.purchases.postState(id),
};
