/**
 * @file Contrato DOM do Dashboard para ações IA condicionadas pelo tipo documental.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Permission } from "../auth/permissions";
import { DashboardPage } from "../pages/DashboardPage";

let allowedPermissions = new Set<string>();

vi.mock("../auth/AuthProvider", () => ({
  useAuth: () => ({
    hasPermission: (permission: string) => allowedPermissions.has(permission),
  }),
}));

vi.mock("../ai/AiPageContext", () => ({
  useAiTransactionContext: () => ({
    setTransaction: vi.fn(),
    clearTransaction: vi.fn(),
  }),
}));

vi.mock("../dashboard/DashboardContext", () => ({
  useDashboard: () => ({
    loading: false,
    error: null,
    refresh: vi.fn(),
    summary: {
      company: { id: "company-1", name: "Empresa PAP" },
      asOf: "2026-07-14",
      activeFiscalPeriod: { id: "period-1", name: "2026" },
      sales: { submitted: 0, approved: 0 },
      purchases: { approved: 0, draft: 0 },
      receivables: { overdueCents: 0, overdueCount: 0 },
      stockAlerts: { total: 0, lowStock: 0 },
      notifications: { unread: 0 },
      recentTransactions: [
        {
          documentType: "SALE",
          documentId: "sale-1",
          number: "FT 2026/1",
          counterpartyName: "Cliente PAP",
          issuedAt: "2026-07-14",
          totalCents: 12300,
          status: "ISSUED",
          postedAt: null,
          journalEntryId: null,
          stockMovementCount: 0,
          productLineCount: 1,
        },
        {
          documentType: "PURCHASE",
          documentId: "purchase-1",
          number: "FC 2026/1",
          counterpartyName: "Fornecedor PAP",
          issuedAt: "2026-07-13",
          totalCents: 6150,
          status: "APPROVED",
          postedAt: null,
          journalEntryId: null,
          stockMovementCount: 0,
          productLineCount: 1,
        },
      ],
    },
  }),
}));

afterEach(() => {
  allowedPermissions = new Set();
});

describe("Dashboard com operações recentes", () => {
  it("só mostra análise IA quando também existe leitura do tipo documental", () => {
    allowedPermissions = new Set([Permission.AI_CHAT_USE, Permission.SALES_READ]);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Analisar com IA" })).toBeInTheDocument();
    expect(screen.getByText("FT 2026/1").closest("article"))
      .toHaveTextContent("Analisar com IA");
    expect(screen.getByText("FC 2026/1").closest("article"))
      .not.toHaveTextContent("Analisar com IA");
    expect(document.querySelector(".dashboardRecentGrid")).toBeInTheDocument();
  });
});
