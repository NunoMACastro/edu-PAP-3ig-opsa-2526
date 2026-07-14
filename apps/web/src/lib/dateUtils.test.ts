/**
 * @file Testes das datas civis locais usadas nos formulários de negócio.
 */

import { describe, expect, it } from "vitest";
import { firstLocalDayOfMonth, toLocalDateInputValue } from "./dateUtils";

describe("dateUtils", () => {
  it("não converte a data civil local através de UTC", () => {
    const localDate = new Date(2026, 6, 9, 0, 30);

    expect(toLocalDateInputValue(localDate)).toBe("2026-07-09");
    expect(firstLocalDayOfMonth(localDate)).toBe("2026-07-01");
  });
});
