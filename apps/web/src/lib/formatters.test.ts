/**
 * @file Contratos de apresentação PT-PT usados na demonstração PAP.
 */

import { describe, expect, it } from "vitest";
import {
  formatAuditActionLabel,
  formatDocumentTypeLabel,
  formatEntityLabel,
  formatQuantity,
  formatStatusLabel,
} from "./formatters";

describe("formatadores funcionais PAP", () => {
  it("traduz estados, documentos, ações e entidades conhecidos", () => {
    expect(formatStatusLabel("POSTED")).toBe("Contabilizada");
    expect(formatDocumentTypeLabel("PURCHASE")).toBe("Compra");
    expect(formatAuditActionLabel("PURCHASE_DOCUMENT_POSTED"))
      .toBe("Contabilizou o documento de compra");
    expect(formatEntityLabel("JournalEntry")).toBe("Lançamento contabilístico");
  });

  it("usa fallback legível e nunca devolve NaN para quantidades", () => {
    expect(formatStatusLabel("NEW_CUSTOM_STATE")).toBe("New custom state");
    expect(formatQuantity("18.250")).toBe("18,25");
    expect(formatQuantity("valor-inválido")).toBe("-");
  });
});
