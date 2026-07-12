/**
 * @file Testes das normalizações de formulários e envelopes paginados MF1.
 */

import { describe, expect, it } from "vitest";
import { pickArray, toNonNegativeInteger } from "./mf1FormUtils";

describe("mf1FormUtils", () => {
  it("aceita uma taxa de IVA de zero basis points", () => {
    expect(toNonNegativeInteger("0", "Taxa")).toBe(0);
  });

  it("rejeita taxas negativas ou decimais", () => {
    expect(() => toNonNegativeInteger("-1", "Taxa")).toThrow();
    expect(() => toNonNegativeInteger("12.5", "Taxa")).toThrow();
  });

  it("prefere o envelope canónico items sem quebrar respostas antigas", () => {
    expect(pickArray({ items: [{ id: "new" }], customers: [{ id: "old" }] }, "customers"))
      .toEqual([{ id: "new" }]);
    expect(pickArray({ customers: [{ id: "old" }] }, "customers"))
      .toEqual([{ id: "old" }]);
  });
});
