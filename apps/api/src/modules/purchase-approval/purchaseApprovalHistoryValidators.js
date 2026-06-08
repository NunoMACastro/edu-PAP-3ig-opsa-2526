// apps/api/src/modules/purchase-approval/purchaseApprovalHistoryValidators.js
import { httpError } from "../../lib/httpErrors.js";

export function parseApprovalReason(input) {
  const reason = String(input?.reason ?? "").trim();

  return reason || "Aprovação registada sem observações adicionais.";
}

export function parseRejectionReason(input) {
  const reason = String(input?.reason ?? "").trim();

  if (reason.length < 8) {
    throw httpError(
      400,
      "PURCHASE_REJECTION_REASON_REQUIRED",
      "Indica uma justificação de reprovação."
    );
  }

  return reason;
}