/**
 * @file Testes unitários do parser central de datas civis.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    parseOptionalStrictDateOnly,
    parseStrictDateOnly,
} from "../../src/lib/strictDate.js";

test("datas civis válidas preservam exatamente o dia indicado", () => {
    assert.equal(parseStrictDateOnly("2024-02-29").toISOString(), "2024-02-29T00:00:00.000Z");
    assert.equal(parseStrictDateOnly("2026-12-31").toISOString(), "2026-12-31T00:00:00.000Z");
});

test("datas impossíveis que JavaScript normalizaria são rejeitadas", () => {
    for (const value of ["2026-02-29", "2026-02-30", "2026-04-31", "2026-13-01"]) {
        assert.throws(
            () => parseStrictDateOnly(value),
            (error) => error?.status === 400 && error?.code === "INVALID_DATE",
        );
    }
});

test("formato estrito e datas opcionais mantêm contrato explícito", () => {
    for (const value of ["09-07-2026", "2026-7-09", "2026-07-09T00:00:00Z", "", null]) {
        assert.throws(() => parseStrictDateOnly(value));
    }
    assert.equal(parseOptionalStrictDateOnly(""), null);
    assert.equal(parseOptionalStrictDateOnly(undefined), null);
});
