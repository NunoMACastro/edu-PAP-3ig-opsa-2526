import { apiClient } from "./apiClient";

export type SaleApprovalDocument = {
  id: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ISSUED" | "SETTLED";
  submittedAt: string | null;
  submittedById: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  rejectedAt: string | null;
  rejectedById: string | null;
  rejectionReason: string | null;
};

type SaleApprovalResponse = {
  data: SaleApprovalDocument;
};

export async function submitSaleDocument(
  id: string,
): Promise<SaleApprovalDocument> {
  const response = await apiClient.saleApproval.submit(id) as SaleApprovalResponse;
  return response.data;
}

export async function approveSaleDocument(
  id: string,
): Promise<SaleApprovalDocument> {
  const response = await apiClient.saleApproval.approve(id) as SaleApprovalResponse;
  return response.data;
}

export async function rejectSaleDocument(
  id: string,
  reason: string,
): Promise<SaleApprovalDocument> {
  const response = await apiClient.saleApproval.reject(id, { reason }) as SaleApprovalResponse;
  return response.data;
}