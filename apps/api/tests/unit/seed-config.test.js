/**
 * @file Testes unitários da configuração determinística dos perfis de seed.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    addDays,
    addMonths,
    buildSeedConfig,
    calculateDocumentTotals,
    currentLisbonDate,
    createDeterministicRandom,
    deterministicUuid,
    parseAnchorDate,
    stableChecksum,
} from "../../prisma/seeds/config.js";

const DATABASE_URL = "postgresql://seed:seed@localhost:5432/opsa_seed_test";

test("parseAnchorDate aceita datas reais e rejeita normalização silenciosa", () => {
    assert.equal(parseAnchorDate("2026-07-10"), "2026-07-10");
    assert.throws(() => parseAnchorDate("2026-02-30"), /data inexistente/);
    assert.throws(() => parseAnchorDate("10-07-2026"), /YYYY-MM-DD/);
});

test("operações de calendário preservam datas civis previsíveis", () => {
    assert.equal(addDays("2026-02-28", 1), "2026-03-01");
    assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
    assert.equal(addMonths("2024-01-31", 1), "2024-02-29");
});

test("data atual usa explicitamente a timezone de Lisboa", () => {
    assert.equal(
        currentLisbonDate(new Date("2026-07-10T23:30:00.000Z")),
        "2026-07-11",
    );
});

test("PRNG e checksum são determinísticos", () => {
    const first = createDeterministicRandom("opsa-demo-v2");
    const second = createDeterministicRandom("opsa-demo-v2");
    assert.deepEqual(
        Array.from({ length: 10 }, () => first()),
        Array.from({ length: 10 }, () => second()),
    );
    assert.equal(stableChecksum({ a: 1, b: 2 }), stableChecksum({ a: 1, b: 2 }));
});

test("totais monetários usam cêntimos e IVA em basis points", () => {
    assert.deepEqual(calculateDocumentTotals(3, 1_025, 2300), {
        subtotalCents: 3_075,
        vatCents: 707,
        totalCents: 3_782,
    });
    assert.throws(() => calculateDocumentTotals(0, 100), /quantity/);
});

test("chaves UUID são estáveis, distintas e sintaticamente válidas", () => {
    const first = deterministicUuid("opsa-load-v2", "sale:1");
    assert.equal(first, deterministicUuid("opsa-load-v2", "sale:1"));
    assert.notEqual(first, deterministicUuid("opsa-load-v2", "sale:2"));
    assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("buildSeedConfig aplica defaults e escala medium", () => {
    const config = buildSeedConfig({
        DATABASE_URL,
        NODE_ENV: "test",
        OPSA_DEMO_ANCHOR_DATE: "2026-07-10",
    });
    assert.equal(config.anchorDate, "2026-07-10");
    assert.equal(config.loadScale, "medium");
    assert.equal(config.loadCounts.customers, 1_000);
    assert.equal(config.loadCounts.movements, 20_000);
});

test("seed é sempre bloqueada em produção", () => {
    assert.throws(
        () => buildSeedConfig({
            DATABASE_URL,
            NODE_ENV: "production",
            OPSA_ALLOW_PRODUCTION_SEED: "true",
        }),
        /bloqueada incondicionalmente em producao/,
    );
});
