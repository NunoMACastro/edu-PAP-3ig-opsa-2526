import { apiClient } from "./apiClient";

export const salesOpenItemsApi = {
  list: (asOfDate?: string) => apiClient.sales.listOpenItems(asOfDate),
};
