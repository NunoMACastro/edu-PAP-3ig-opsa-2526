/**
 * @file Regressões dos seletores de conta e das datas dos movimentos MF1.
 */

import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../lib/apiClient";
import { purchasesApi } from "../lib/purchasesApi";
import { salesApi } from "../lib/salesApi";
import { PaymentsPage, ReceiptsPage } from "../pages/mf1Pages";

vi.mock("../auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("../auth/AuthProvider", () => ({
  useAuth: () => ({ hasPermission: () => true }),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

const pageInfo = { nextCursor: null, hasNextPage: false };

describe("movimentos MF1 ligados à tesouraria", () => {
  it("exige uma conta e limita o recebimento à data de emissão", async () => {
    vi.spyOn(salesApi, "listDocuments").mockResolvedValue({
      items: [{
        id: "sale-1",
        number: "FT-1",
        issuedAt: "2026-07-10T00:00:00.000Z",
      }],
      pageInfo,
    });
    vi.spyOn(apiClient.treasury, "listAccounts").mockResolvedValue({
      accounts: [{
        id: "treasury-1",
        name: "Banco principal",
        currentBalanceCents: 2500,
      }],
    });

    render(<ReceiptsPage />);

    const documentSelect = await screen.findByLabelText("Documento de venda");
    fireEvent.change(documentSelect, { target: { value: "sale-1" } });

    expect(screen.getByRole("option", { name: /Banco principal/ }))
      .toBeInTheDocument();
    expect(screen.getByLabelText("Conta de tesouraria")).toBeRequired();
    expect(screen.getByLabelText("Data")).toHaveAttribute("min", "2026-07-10");
  });

  it("impede pagamentos enquanto não existirem contas ativas", async () => {
    vi.spyOn(purchasesApi, "listDocuments").mockResolvedValue({
      items: [{ id: "purchase-1", supplierNumber: "FC-1", issuedAt: "2026-07-09" }],
      pageInfo,
    });
    vi.spyOn(apiClient.treasury, "listAccounts").mockResolvedValue({ accounts: [] });

    render(<PaymentsPage />);

    expect(await screen.findByText(/Cria primeiro uma conta bancária ou de caixa/))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registar" })).toBeDisabled();
    expect(screen.getByLabelText("Conta de tesouraria")).toBeDisabled();
  });
});
