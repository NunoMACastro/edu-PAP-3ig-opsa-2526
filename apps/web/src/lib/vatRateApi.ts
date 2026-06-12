import { apiClient, JsonBody } from "./apiClient";

export const vatRateApi = {
  list: () => apiClient.vatRates.list(),
  create: (body: JsonBody) => apiClient.vatRates.create(body),
  setActive: (id: string, body: JsonBody) => apiClient.vatRates.setActive(id, body),
};
