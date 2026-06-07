import { apiClient, JsonBody } from "./apiClient";

export const salesApi = {
  listDocuments: () => apiClient.sales.listDocuments(),
  createDocument: (body: JsonBody) => apiClient.sales.createDocument(body),
  submitDocument: (id: string) => apiClient.sales.submitDocument(id),
  approveDocument: (id: string) => apiClient.sales.approveDocument(id),
  rejectDocument: (id: string, body: JsonBody) =>
    apiClient.sales.rejectDocument(id, body),
  issueDocument: (id: string) => apiClient.sales.issueDocument(id),
};
