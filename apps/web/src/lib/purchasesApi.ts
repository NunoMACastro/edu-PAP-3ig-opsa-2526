/**
 * @file Cliente de API específico para documentos de compra no frontend OPSA.
 */

import { apiClient, JsonBody } from "./apiClient";

export const purchasesApi = {
  /**
   * Lista documentos de compra da empresa ativa.
   *
   * @returns Resposta da API com a lista de documentos de compra.
   */
  listDocuments: () => apiClient.purchases.listDocuments(),
  /**
   * Cria um documento de compra em rascunho.
   *
   * @param body - Corpo JSON enviado para a API.
   * @returns Resposta da API com o documento de compra criado.
   */
  createDocument: (body: JsonBody) => apiClient.purchases.createDocument(body),
};
