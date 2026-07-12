/**
 * @file Testes unitários do contrato comum de cursor pagination.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    encodePageCursor,
    parsePageLimit,
} from "../../src/lib/cursorPagination.js";

test("pagination usa 50 por defeito e rejeita limites acima de 100", () => {
    assert.equal(parsePageLimit(undefined), 50);
    assert.equal(parsePageLimit("100"), 100);
    assert.throws(() => parsePageLimit("101"), { code: "INVALID_PAGE_LIMIT" });
    assert.throws(() => parsePageLimit("1.5"), { code: "INVALID_PAGE_LIMIT" });
});

test("cursor de data é opaco, reversível e rejeita adulteração", () => {
    const cursor = encodePageCursor({
        id: "entry-50",
        sortValue: new Date("2026-07-09T12:00:00.000Z"),
        sortType: "date",
    });
    assert.equal(cursor.includes("entry-50"), false);
    assert.deepEqual(decodePageCursor(cursor, "date"), {
        id: "entry-50",
        sortValue: new Date("2026-07-09T12:00:00.000Z"),
    });
    assert.throws(() => decodePageCursor(`${cursor}!`, "date"), {
        code: "INVALID_PAGE_CURSOR",
    });
});

test("keyset descendente usa data e id como desempate estável", () => {
    const sortValue = new Date("2026-07-09T12:00:00.000Z");
    assert.deepEqual(
        buildKeysetCondition(
            { id: "entry-50", sortValue },
            { sortField: "createdAt", direction: "desc" },
        ),
        {
            OR: [
                { createdAt: { lt: sortValue } },
                { createdAt: sortValue, id: { lt: "entry-50" } },
            ],
        },
    );
});

test("envelope expõe apenas limit items e cursor quando existe próxima página", () => {
    const records = Array.from({ length: 3 }, (_, index) => ({
        id: `item-${index + 1}`,
        code: `00${index + 1}`,
        internal: true,
    }));
    const page = buildCursorPage(records, {
        limit: 2,
        sortField: "code",
        sortType: "string",
        serialize: ({ id, code }) => ({ id, code }),
    });

    assert.deepEqual(page.items, [
        { id: "item-1", code: "001" },
        { id: "item-2", code: "002" },
    ]);
    assert.equal(page.pageInfo.hasNextPage, true);
    assert.deepEqual(decodePageCursor(page.pageInfo.nextCursor, "string"), {
        id: "item-2",
        sortValue: "002",
    });
});
