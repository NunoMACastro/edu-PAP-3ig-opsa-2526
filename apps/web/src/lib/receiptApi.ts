import { apiClient, JsonBody } from "./apiClient";

export const receiptApi = {
  register: (saleDocumentId: string, body: JsonBody) =>
    apiClient.sales.registerReceipt(saleDocumentId, body),
};
