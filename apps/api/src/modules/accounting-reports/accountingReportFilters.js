// apps/api/src/modules/accounting-reports/accountingReportFilters.js
import { httpError } from "../../lib/httpErrors.js";

export function parseDateRange(query) {
  const from = new Date(String(query.from ?? ""));
  const to = new Date(String(query.to ?? ""));
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    throw httpError(400, "INVALID_DATE_RANGE", "Intervalo de datas inválido.");
  }
  return { from, to };
}