import { apiClient } from "./apiClient";

export type PurchaseDocumentKind =
  | "SUPPLIER_INVOICE"
  | "SUPPLIER_CREDIT_NOTE";

export type PurchaseDocumentInput = {
  kind: PurchaseDocumentKind;
  supplierId: string;
  supplierNumber: string;
  issuedAt: string;
  dueDate?: string;
  lines: Array<{
    itemId: string;
    vatRateId: string;
    description: string;
    quantity: number;
    unitCostCents: number;
  }>;
};

export type PurchaseDocumentRow = {
  id: string;
  supplierNumber: string;
  kind: PurchaseDocumentKind;
  status: string;
  totalCents: number;
};

type PurchaseDocumentResponse = {
  data: PurchaseDocumentRow;
};

type PurchaseDocumentsResponse = {
  data: PurchaseDocumentRow[];
};

export async function createPurchaseDocument(
  input: PurchaseDocumentInput,
): Promise<PurchaseDocumentRow> {
  const response = await apiClient.purchaseDocuments.create(input) as PurchaseDocumentResponse;
  return response.data;
}

export async function fetchPurchaseDocuments(): Promise<PurchaseDocumentRow[]> {
  const response = await apiClient.purchaseDocuments.list() as PurchaseDocumentsResponse;
  return response.data;
}