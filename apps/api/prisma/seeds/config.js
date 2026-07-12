/**
 * @file Configuracao deterministica e segura da infraestrutura de seed OPSA.
 */

import { createHash } from "node:crypto";
import { validateNewPasswordPolicy } from "../../src/modules/auth/passwordPolicy.js";

export const DEMO_NAMESPACE = "opsa-demo-v2";
export const LOAD_NAMESPACE = "opsa-load-v2";
export const DEFAULT_RANDOM_SEED = "opsa-demo-v2";
export const DEFAULT_DEMO_PASSWORD = "OpsaDemo2026!";
export const DEMO_TIME_ZONE = "Europe/Lisbon";

export const DEMO_USERS = Object.freeze([
    { email: "admin@opsa.demo", name: "Admin OPSA Demo", role: "ADMIN" },
    { email: "gestor@opsa.demo", name: "Gestor OPSA Demo", role: "GESTOR" },
    { email: "contabilista@opsa.demo", name: "Contabilista OPSA Demo", role: "CONTABILISTA" },
    { email: "operacional@opsa.demo", name: "Operacional OPSA Demo", role: "OPERACIONAL" },
    { email: "auditor@opsa.demo", name: "Auditor OPSA Demo", role: "AUDITOR" },
]);

const LOAD_SCALES = Object.freeze({
    light: Object.freeze({ customers: 120, suppliers: 60, items: 250, sales: 500, purchases: 300, movements: 2_000, logs: 1_000 }),
    medium: Object.freeze({ customers: 1_000, suppliers: 300, items: 2_000, sales: 5_000, purchases: 3_000, movements: 20_000, logs: 5_000 }),
    high: Object.freeze({ customers: 10_000, suppliers: 2_000, items: 20_000, sales: 50_000, purchases: 30_000, movements: 200_000, logs: 50_000 }),
});

/**
 * Devolve a data civil corrente na timezone da demonstracao.
 *
 * @param {Date} now - Instante de referencia.
 * @returns {string} Data YYYY-MM-DD em Lisboa.
 */
export function currentLisbonDate(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: DEMO_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);
    const values = Object.fromEntries(
        parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
    );
    return `${values.year}-${values.month}-${values.day}`;
}

/**
 * Valida uma data civil ISO sem aceitar normalizacao permissiva do Date.
 *
 * @param {unknown} value - Valor configurado.
 * @returns {string} Data ISO curta validada.
 */
export function parseAnchorDate(value) {
    const normalized = String(value ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        throw new Error("OPSA_DEMO_ANCHOR_DATE deve usar o formato YYYY-MM-DD.");
    }
    const [year, month, day] = normalized.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new Error("OPSA_DEMO_ANCHOR_DATE contem uma data inexistente.");
    }
    return normalized;
}

/**
 * Converte uma data civil em Date UTC previsivel.
 *
 * @param {string} isoDate - Data YYYY-MM-DD.
 * @returns {Date} Meia-noite UTC.
 */
export function utcDate(isoDate) {
    return new Date(`${parseAnchorDate(isoDate)}T00:00:00.000Z`);
}

/**
 * Desloca uma data civil sem depender da timezone do processo.
 *
 * @param {string} isoDate - Data base.
 * @param {number} days - Dias inteiros a deslocar.
 * @returns {string} Data ISO curta resultante.
 */
export function addDays(isoDate, days) {
    const date = utcDate(isoDate);
    date.setUTCDate(date.getUTCDate() + Number(days));
    return date.toISOString().slice(0, 10);
}

/**
 * Desloca meses preservando um dia civil valido.
 *
 * @param {string} isoDate - Data base.
 * @param {number} months - Meses inteiros a deslocar.
 * @returns {string} Data ISO curta resultante.
 */
export function addMonths(isoDate, months) {
    const [year, month, day] = parseAnchorDate(isoDate).split("-").map(Number);
    const first = new Date(Date.UTC(year, month - 1 + Number(months), 1));
    const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    first.setUTCDate(Math.min(day, lastDay));
    return first.toISOString().slice(0, 10);
}

/**
 * Cria um PRNG Mulberry32 a partir de qualquer seed textual.
 *
 * @param {string} seed - Seed textual.
 * @returns {() => number} Gerador no intervalo [0, 1).
 */
export function createDeterministicRandom(seed) {
    const digest = createHash("sha256").update(String(seed)).digest();
    let state = digest.readUInt32LE(0);
    return () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let value = Math.imul(state ^ (state >>> 15), 1 | state);
        value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
        return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
    };
}

/**
 * Seleciona deterministicamente um elemento.
 *
 * @template T
 * @param {() => number} random - PRNG.
 * @param {T[]} values - Valores elegiveis.
 * @returns {T} Elemento selecionado.
 */
export function pick(random, values) {
    return values[Math.floor(random() * values.length)];
}

/**
 * Calcula totais inteiros em cêntimos sem introduzir ponto flutuante monetário.
 *
 * @param {number} quantity - Quantidade inteira positiva.
 * @param {number} unitCents - Preço/custo unitário em cêntimos.
 * @param {number} rateBps - Taxa em basis points (2300 = 23%).
 * @returns {{ subtotalCents: number, vatCents: number, totalCents: number }} Totais da linha.
 */
export function calculateDocumentTotals(quantity, unitCents, rateBps = 2300) {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("quantity deve ser um inteiro positivo.");
    if (!Number.isInteger(unitCents) || unitCents < 0) throw new Error("unitCents deve ser um inteiro nao negativo.");
    if (!Number.isInteger(rateBps) || rateBps < 0) throw new Error("rateBps deve ser um inteiro nao negativo.");
    const subtotalCents = quantity * unitCents;
    const vatCents = Math.round((subtotalCents * rateBps) / 10_000);
    return { subtotalCents, vatCents, totalCents: subtotalCents + vatCents };
}

/**
 * Deriva um UUID v5-like estável sem depender de estado global ou de I/O.
 *
 * @param {string} namespace - Namespace lógico da chave.
 * @param {string} naturalKey - Chave natural dentro do namespace.
 * @returns {string} UUID determinístico.
 */
export function deterministicUuid(namespace, naturalKey) {
    const bytes = createHash("sha256")
        .update(`${String(namespace)}:${String(naturalKey)}`)
        .digest()
        .subarray(0, 16);
    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.toString("hex");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Constroi a configuracao comum a todos os perfis.
 *
 * @param {NodeJS.ProcessEnv} env - Ambiente do processo.
 * @param {Date} now - Instante de referencia.
 * @returns {object} Configuracao imutavel.
 */
export function buildSeedConfig(env = process.env, now = new Date()) {
    if (!env.DATABASE_URL) throw new Error("DATABASE_URL e obrigatorio para executar a seed.");
    if (env.NODE_ENV === "production") {
        throw new Error("A infraestrutura de seed OPSA esta bloqueada incondicionalmente em producao.");
    }
    const anchorDate = parseAnchorDate(env.OPSA_DEMO_ANCHOR_DATE ?? currentLisbonDate(now));
    const password = validateNewPasswordPolicy(env.OPSA_DEMO_PASSWORD ?? DEFAULT_DEMO_PASSWORD);
    const randomSeed = String(env.OPSA_DEMO_RANDOM_SEED ?? DEFAULT_RANDOM_SEED).trim();
    if (!randomSeed) throw new Error("OPSA_DEMO_RANDOM_SEED nao pode ser vazio.");
    const loadScale = String(env.OPSA_LOAD_SCALE ?? "medium").trim().toLowerCase();
    if (!LOAD_SCALES[loadScale]) {
        throw new Error("OPSA_LOAD_SCALE deve ser light, medium ou high.");
    }
    return Object.freeze({
        anchorDate,
        password,
        randomSeed,
        loadScale,
        loadCounts: LOAD_SCALES[loadScale],
    });
}

/**
 * Calcula um checksum estavel de um objeto serializavel.
 *
 * @param {unknown} value - Valor a resumir.
 * @returns {string} SHA-256 hexadecimal.
 */
export function stableChecksum(value) {
    return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
