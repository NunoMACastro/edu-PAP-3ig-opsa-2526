/**
 * @file Teste DOM do editor auditável de lançamentos manuais.
 */

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient, ApiError } from "../lib/apiClient";
import { ManualJournalPage } from "../pages/mf2Pages";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ManualJournalPage", () => {
  it("acrescenta a segunda página de lançamentos às opções existentes", async () => {
    const accounts = vi.spyOn(apiClient.accounting, "listAccounts")
      .mockImplementation(async (pagination = {}) =>
        pagination.cursor
          ? {
              items: [{ id: "account-101", code: "99", name: "Conta 101" }],
              pageInfo: { nextCursor: null, hasNextPage: false },
            }
          : {
              items: Array.from({ length: 100 }, (_, index) => ({
                id: `account-${index + 1}`,
                code: String(index + 1),
                name: `Conta ${index + 1}`,
              })),
              pageInfo: { nextCursor: "cursor-account-100", hasNextPage: true },
            });
    const list = vi.spyOn(apiClient.manualJournals, "list")
      .mockImplementation(async (pagination = {}) =>
        pagination.cursor
          ? {
              items: [{ id: "journal-2", reference: "Segundo lançamento" }],
              pageInfo: { nextCursor: null, hasNextPage: false },
            }
          : {
              items: [{ id: "journal-1", reference: "Primeiro lançamento" }],
              pageInfo: { nextCursor: "cursor-journal-1", hasNextPage: true },
            });

    render(<ManualJournalPage />);

    expect(await screen.findByRole("option", { name: "Primeiro lançamento" }))
      .toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Carregar mais" }));
    expect(await screen.findByRole("option", { name: "Segundo lançamento" }))
      .toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Primeiro lançamento" }))
      .toBeInTheDocument();
    expect((await screen.findAllByRole("option", { name: "Conta 101" })).length)
      .toBeGreaterThan(0);
    expect(list).toHaveBeenNthCalledWith(1, { limit: 50 });
    expect(list).toHaveBeenNthCalledWith(2, {
      cursor: "cursor-journal-1",
      limit: 50,
    });
    expect(accounts).toHaveBeenNthCalledWith(1, { limit: 100 });
    expect(accounts).toHaveBeenNthCalledWith(2, {
      cursor: "cursor-account-100",
      limit: 100,
    });
  });

  it("envia o motivo de revisão e preserva o formulário quando a API rejeita", async () => {
    vi.spyOn(apiClient.accounting, "listAccounts").mockResolvedValue({
      items: [
        { id: "account-debit", code: "11", name: "Caixa" },
        { id: "account-credit", code: "71", name: "Vendas" },
      ],
      pageInfo: { nextCursor: null, hasNextPage: false },
    });
    vi.spyOn(apiClient.manualJournals, "list").mockResolvedValue({
      items: [
        {
          id: "journal-1",
          reference: "2026-07-10 — Lançamento original",
        },
      ],
      pageInfo: { nextCursor: null, hasNextPage: false },
    });
    const get = vi.spyOn(apiClient.manualJournals, "get").mockResolvedValue({
      journalEntry: {
        id: "journal-1",
        entryDate: "2026-07-10",
        description: "Lançamento original",
        lines: [
          { accountId: "account-debit", debitCents: 1000, creditCents: 0 },
          { accountId: "account-credit", debitCents: 0, creditCents: 1000 },
        ],
        attachments: [],
      },
    });
    const update = vi
      .spyOn(apiClient.manualJournals, "update")
      .mockRejectedValue(
        new ApiError(400, "JOURNAL_REVISION_REASON_REQUIRED", "Motivo inválido"),
      );
    render(<ManualJournalPage />);

    const lookupForm = screen.getByRole("heading", { name: "Consultar lançamento" })
      .closest("form");
    if (!lookupForm) throw new Error("Formulário de consulta não encontrado");
    fireEvent.change(await within(lookupForm).findByLabelText("Lançamento manual"), {
      target: { value: "journal-1" },
    });
    fireEvent.click(within(lookupForm).getByRole("button", { name: "Consultar" }));
    await waitFor(() => expect(get).toHaveBeenCalledWith("journal-1"));

    const form = screen.getByRole("heading", { name: "Editar lançamento" })
      .closest("form");
    if (!form) throw new Error("Formulário de edição não encontrado");
    const editor = within(form);

    fireEvent.change(editor.getByLabelText("Descricao"), {
      target: { value: "Reclassificação contabilística" },
    });
    fireEvent.change(editor.getByLabelText("Motivo da revisão"), {
      target: { value: "Correção da conta SNC" },
    });
    fireEvent.click(editor.getByRole("button", { name: "Atualizar" }));

    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    expect(update).toHaveBeenCalledWith(
      "journal-1",
      expect.objectContaining({ reason: "Correção da conta SNC" }),
    );
    expect(editor.getByLabelText("Motivo da revisão"))
      .toHaveValue("Correção da conta SNC");
    expect(await screen.findByRole("alert")).toHaveTextContent("Motivo inválido");
  });
});
