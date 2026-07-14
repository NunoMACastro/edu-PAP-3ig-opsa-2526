/**
 * @file Cliente de API específico para documentos de venda no frontend OPSA.
 */

import { apiClient, JsonBody, type CursorPagination } from "./apiClient";

export const salesApi = {
  /**
   * Lista documentos de venda da empresa ativa.
   *
   * @returns Resposta da API com a lista de documentos de venda.
   */
  listDocuments: (pagination: CursorPagination = {}) =>
    apiClient.sales.listDocuments(pagination),
  /**
   * Cria um documento de venda em rascunho.
   *
   * @param body - Corpo JSON enviado para a API.
   * @returns Resposta da API com o documento de venda criado.
   */
  createDocument: (body: JsonBody) => apiClient.sales.createDocument(body),
  /**
   * Submete um documento de venda para aprovação.
   *
   * @param id - Identificador do registo alvo.
   * @returns Resposta da API com o documento submetido.
   */
  submitDocument: (id: string) => apiClient.sales.submitDocument(id),
  /**
   * Aprova um documento de venda submetido.
   *
   * @param id - Identificador do registo alvo.
   * @returns Resposta da API com o documento aprovado.
   */
  approveDocument: (id: string) => apiClient.sales.approveDocument(id),
  /**
   * Rejeita um documento de venda com motivo auditável.
   *
   * @param id - Identificador do registo alvo.
   * @param body - Corpo JSON enviado para a API.
   * @returns Resposta da API com o documento rejeitado.
   */
  rejectDocument: (id: string, body: JsonBody) =>
    apiClient.sales.rejectDocument(id, body),
  /**
   * Emite o documento de venda aprovado e atribui numeração final.
   *
   * @param id - Identificador do registo alvo.
   * @returns Resposta da API com o documento emitido.
   */
  issueDocument: (id: string) => apiClient.sales.issueDocument(id),
};
