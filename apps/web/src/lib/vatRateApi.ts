/**
 * @file Cliente de API específico para taxas de IVA no frontend OPSA.
 */

import { apiClient, JsonBody } from "./apiClient";

export const vatRateApi = {
  /**
   * Lista taxas de IVA configuradas para a empresa ativa.
   *
   * @returns Resposta da API com a lista de taxas de IVA.
   */
  list: () => apiClient.vatRates.list(),
  /**
   * Cria uma nova taxa de IVA.
   *
   * @param body - Corpo JSON enviado para a API.
   * @returns Promise resolvida depois de criar o registo pedido pelo formulário.
   */
  create: (body: JsonBody) => apiClient.vatRates.create(body),
  /**
   * Ativa ou desativa uma taxa de IVA existente.
   *
   * @param id - Identificador do registo alvo.
   * @param body - Corpo JSON enviado para a API.
   * @returns Resposta da API com o estado atualizado da taxa de IVA.
   */
  setActive: (id: string, body: JsonBody) => apiClient.vatRates.setActive(id, body),
};
