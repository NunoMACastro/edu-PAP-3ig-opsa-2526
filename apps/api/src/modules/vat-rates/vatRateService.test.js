import test from "node:test";
import assert from "node:assert/strict";
import { validateVatRateInput } from "./vatRateService.js";

test("rejeita taxa isenta sem motivo", () => {
    assert.throws(
        () => validateVatRateInput({ code: "ISE", description: "Isento", rateBps: 0, type: "EXEMPT" }),
        (error) => error.status === 400 && error.code === "MISSING_EXEMPTION_REASON",
    );
});

test("rejeita ativação quando isActive não é booleano", async () => {
    const calls = [];
    const prisma = {
        vatRate: {
            findFirst: async () => ({ id: "vat-1", companyId: "company-1" }),
            update: async (query) => {
                calls.push(query);
                return query.data;
            },
        },
    };

    const { setVatRateActive } = await import("./vatRateService.js");

    await assert.rejects(
        () => setVatRateActive(prisma, "company-1", "vat-1", "false"),
        (error) => error.status === 400 && error.code === "INVALID_ACTIVE_FLAG",
    );
    assert.equal(calls.length, 0);
});