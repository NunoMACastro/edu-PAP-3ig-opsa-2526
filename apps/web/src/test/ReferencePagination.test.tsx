/**
 * @file Prova DOM de que referências MF1 posteriores ao primeiro bloco são utilizáveis.
 */

import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../lib/apiClient";
import { salesApi } from "../lib/salesApi";
import { vatRateApi } from "../lib/vatRateApi";
import { SaleDocumentsPage } from "../pages/mf1Pages";

vi.mock("../auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("../auth/AuthProvider", () => ({
  useAuth: () => ({ hasPermission: () => true }),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("referências paginadas MF1", () => {
  it("torna selecionáveis clientes e artigos posteriores ao registo 100", async () => {
    const user = userEvent.setup();
    vi.spyOn(salesApi, "listDocuments").mockResolvedValue({
      items: [],
      pageInfo: { nextCursor: null, hasNextPage: false },
    });
    vi.spyOn(vatRateApi, "list").mockResolvedValue({
      vatRates: [{ id: "vat-1", description: "Normal" }],
    });
    const customers = vi.spyOn(apiClient.customers, "list")
      .mockImplementation(async (_search, pagination = {}) =>
        pagination.cursor
          ? {
              items: [{ id: "customer-101", name: "Cliente 101" }],
              pageInfo: { nextCursor: null, hasNextPage: false },
            }
          : {
              items: Array.from({ length: 100 }, (_, index) => ({
                id: `customer-${index + 1}`,
                name: `Cliente ${index + 1}`,
              })),
              pageInfo: { nextCursor: "customers-page-2", hasNextPage: true },
            });
    const items = vi.spyOn(apiClient.items, "list")
      .mockImplementation(async (pagination = {}) =>
        pagination.cursor
          ? {
              items: [{ id: "item-101", name: "Artigo 101", sku: "SKU-101" }],
              pageInfo: { nextCursor: null, hasNextPage: false },
            }
          : {
              items: Array.from({ length: 100 }, (_, index) => ({
                id: `item-${index + 1}`,
                name: `Artigo ${index + 1}`,
                sku: `SKU-${index + 1}`,
              })),
              pageInfo: { nextCursor: "items-page-2", hasNextPage: true },
            });
    vi.spyOn(apiClient.warehouses, "list").mockResolvedValue({
      warehouses: [{ id: "warehouse-1", code: "ARM", name: "Armazém principal" }],
    });

    render(<SaleDocumentsPage />);
    await user.click(await screen.findByRole("button", { name: "Nova venda" }));

    expect(await screen.findByRole("option", { name: "Cliente 101" }))
      .toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "SKU-101 — Artigo 101" }))
      .toBeInTheDocument();
    expect(customers).toHaveBeenNthCalledWith(1, undefined, { limit: 100 });
    expect(customers).toHaveBeenNthCalledWith(
      2,
      undefined,
      { cursor: "customers-page-2", limit: 100 },
    );
    expect(items).toHaveBeenNthCalledWith(1, { limit: 100 });
    expect(items).toHaveBeenNthCalledWith(
      2,
      { cursor: "items-page-2", limit: 100 },
    );
  });
});
