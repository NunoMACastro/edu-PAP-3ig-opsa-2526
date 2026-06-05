import { apiClient } from "./apiClient";

export type SalesOpenItem = {
  id: string;
  number: string | null;
  customerName: string;
  openAmountCents: number;
  daysOverdue: number;
  bucket: string;
};

type SalesOpenItemsResponse = {
  data: SalesOpenItem[];
};

export async function fetchSalesOpenItems(
  asOfDate: string,
): Promise<SalesOpenItem[]> {
  const response = await apiClient.salesOpenItems.list(asOfDate) as SalesOpenItemsResponse;
  return response.data;
}