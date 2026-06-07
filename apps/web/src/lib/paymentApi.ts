import { apiClient, JsonBody } from "./apiClient";

export const paymentApi = {
  register: (purchaseDocumentId: string, body: JsonBody) =>
    apiClient.purchases.registerPayment(purchaseDocumentId, body),
};
