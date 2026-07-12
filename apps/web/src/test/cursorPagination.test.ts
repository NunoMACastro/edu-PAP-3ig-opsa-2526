/**
 * @file Testes do contrato defensivo de cursor pagination do frontend.
 */

import { describe, expect, it, vi } from "vitest";
import {
  collectCursorPages,
  cursorPaginationQuery,
  normalizeCursorPage,
} from "../lib/cursorPagination";

describe("cursor pagination", () => {
  it("serializa cursor opaco e limite válido", () => {
    expect(cursorPaginationQuery({ cursor: "next/+ cursor", limit: 50 }))
      .toBe("?cursor=next%2F%2B+cursor&limit=50");
  });

  it("rejeita limites fora do contrato 1..100", () => {
    expect(() => cursorPaginationQuery({ limit: 0 })).toThrow(/entre 1 e 100/);
    expect(() => cursorPaginationQuery({ limit: 101 })).toThrow(/entre 1 e 100/);
  });

  it("normaliza envelope e rejeita página seguinte sem cursor", () => {
    expect(normalizeCursorPage(
      {
        items: [{ id: "first" }],
        pageInfo: { nextCursor: null, hasNextPage: false },
      },
      "rows",
      (value) => value as { id: string },
    )).toEqual({
      items: [{ id: "first" }],
      pageInfo: { nextCursor: null, hasNextPage: false },
    });
    expect(() => normalizeCursorPage(
      { items: [], pageInfo: { nextCursor: null, hasNextPage: true } },
      "rows",
      (value) => value,
    )).toThrow(/paginação incompleta/);
  });

  it("percorre mais de 100 referências e rejeita cursores repetidos", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: index + 1 }));
    const loadPage = vi.fn(async (pagination: { cursor?: string; limit?: number }) =>
      pagination.cursor
        ? {
            items: [{ id: 101 }],
            pageInfo: { nextCursor: null, hasNextPage: false },
          }
        : {
            items: firstPage,
            pageInfo: { nextCursor: "page-2", hasNextPage: true },
          });

    const items = await collectCursorPages(loadPage);

    expect(items).toHaveLength(101);
    expect(items.at(-1)).toEqual({ id: 101 });
    expect(loadPage).toHaveBeenNthCalledWith(1, { limit: 100 });
    expect(loadPage).toHaveBeenNthCalledWith(2, { cursor: "page-2", limit: 100 });

    await expect(collectCursorPages(async () => ({
      items: [],
      pageInfo: { nextCursor: "same-cursor", hasNextPage: true },
    }), { maxPages: 2 })).rejects.toThrow(/ausente ou repetido/);
  });
});
