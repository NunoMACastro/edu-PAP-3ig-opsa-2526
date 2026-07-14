/**
 * @file Regressões DOM de paginação nas páginas operacionais MF1.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { salesOpenItemsApi } from "../lib/salesOpenItemsApi";
import { SalesOpenItemsPage } from "../pages/mf1Pages";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("paginação operacional MF1", () => {
  it("mantém a data aplicada e permite avançar numa página intermédia vazia", async () => {
    const list = vi.spyOn(salesOpenItemsApi, "list")
      .mockImplementation(async (_asOfDate, pagination = {}) =>
        pagination.cursor
          ? {
              items: [{ id: "sale-open-1", number: "FT 2026/101" }],
              pageInfo: { nextCursor: null, hasNextPage: false },
            }
          : {
              items: [],
              pageInfo: { nextCursor: "open-items-page-2", hasNextPage: true },
            });

    render(<SalesOpenItemsPage />);

    await waitFor(() => expect(list).toHaveBeenCalledOnce());
    const appliedDate = list.mock.calls[0][0];
    fireEvent.change(screen.getByLabelText("Data de referência"), {
      target: { value: "2026-12-31" },
    });
    fireEvent.click(await screen.findByRole("button", { name: "Carregar mais" }));

    expect(await screen.findByText("FT 2026/101")).toBeInTheDocument();
    expect(list).toHaveBeenNthCalledWith(2, appliedDate, {
      cursor: "open-items-page-2",
      limit: 50,
    });
    expect(screen.queryByRole("button", { name: "Carregar mais" }))
      .not.toBeInTheDocument();
  });
});
