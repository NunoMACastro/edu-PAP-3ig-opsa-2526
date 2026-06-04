import { apiClient } from "./apiClient";

export type SaleDocumentKind = "INVOICE" | "INVOICE_RECEIPT" | "CREDIT_NOTE";

export type SaleDocumentInput = {
  kind: SaleDocumentKind;
  customerId: string;
  issuedAt: string;
  dueDate?: string;
  lines: Array<{
    itemId: string;
    vatRateId: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
  }>;
};

export type SaleDocumentRow = {
  id: string;
  number: string | null;
  kind: SaleDocumentKind;
  status: string;
  totalCents: number;
};

type SaleDocumentResponse = {
  data: SaleDocumentRow;
};

type SaleDocumentsResponse = {
  data: SaleDocumentRow[];
};

export async function createSaleDocument(
  input: SaleDocumentInput,
): Promise<SaleDocumentRow> {
  const response = await apiClient.salesDocuments.create(input) as SaleDocumentResponse;
  return response.data;
}

export async function fetchSaleDocuments(): Promise<SaleDocumentRow[]> {
  const response = await apiClient.salesDocuments.list() as SaleDocumentsResponse;
  return response.data;
}

export async function issueSaleDocument(id: string): Promise<SaleDocumentRow> {
  const response = await apiClient.salesDocuments.issue(id) as SaleDocumentResponse;
  return response.data;
}