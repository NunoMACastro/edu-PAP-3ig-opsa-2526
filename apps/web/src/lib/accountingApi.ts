import { apiClient } from "./apiClient";

export const accountingApi = {
  postSaleDocument: (saleDocumentId: string) =>
    apiClient.accounting.postSaleDocument(saleDocumentId),
  postPurchaseDocument: (purchaseDocumentId: string) =>
    apiClient.accounting.postPurchaseDocument(purchaseDocumentId),
};
