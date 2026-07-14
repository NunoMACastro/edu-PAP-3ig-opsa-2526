/**
 * @file Contrato DOM do read model legível de auditoria.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getAuditLogs } = vi.hoisted(() => ({ getAuditLogs: vi.fn() }));

vi.mock("../lib/mf4Api", async (importOriginal) => {
  const original = await importOriginal<typeof import("../lib/mf4Api")>();
  return { ...original, getAuditLogs };
});

import { AuditLogsPage } from "../pages/mf4Pages";

afterEach(() => vi.clearAllMocks());

describe("AuditLogsPage", () => {
  it("mostra ator, referência e labels PT-PT sem expor IDs nem JSON cru", async () => {
    const user = userEvent.setup();
    const documentId = "2b4abddd-7f79-4ad8-baa6-17f43ad94061";
    getAuditLogs.mockResolvedValue({
      items: [{
        id: "audit-1",
        action: "PURCHASE_DOCUMENT_POSTED",
        entity: "PurchaseDocument",
        entityId: documentId,
        details: { purchaseDocumentId: documentId, source: "posting" },
        createdAt: "2026-07-14T10:30:00.000Z",
        actor: { id: "user-1", name: "Ana Silva", email: "ana@example.test" },
        reference: { type: "PURCHASE", id: documentId, label: "FC 2026/8" },
      }],
      pageInfo: { nextCursor: null, hasNextPage: false },
    });

    render(<AuditLogsPage />);

    expect(await screen.findByRole("heading", { name: "Contabilizou o documento de compra" }))
      .toBeInTheDocument();
    expect(screen.getByText("Ana Silva · ana@example.test")).toBeInTheDocument();
    expect(screen.getByText("FC 2026/8")).toBeInTheDocument();
    expect(screen.getByText("Documento de compra")).toBeInTheDocument();
    expect(screen.queryByText(documentId)).not.toBeInTheDocument();

    await user.click(screen.getByText("Ver detalhes mínimos"));
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("posting")).toBeInTheDocument();
    expect(screen.queryByText(/\{/)).not.toBeInTheDocument();
  });
});
