import { apiClient, JsonBody } from "./apiClient";

export const purchasesApi = {
  listDocuments: () => apiClient.purchases.listDocuments(),
  createDocument: (body: JsonBody) => apiClient.purchases.createDocument(body),
};
