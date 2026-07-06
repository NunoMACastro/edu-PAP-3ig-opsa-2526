// apps/web/scripts/check-mf8-formatters.mjs

import { readFileSync } from "node:fs";

const formatterSource = readFileSync("src/lib/formatters.ts", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

function normalizeSpaces(value) {
  return String(value).replace(/\s|\u00a0|\u202f/g, " ");
}

function assertContains(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`${label}: falta ${expected}`);
  }
}

function assertMatches(source, pattern, label) {
  if (!pattern.test(source)) {
    throw new Error(`${label}: padrão não encontrado`);
  }
}

function assertNativeIntlBehavior() {
  const euro = normalizeSpaces(
    new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(1234.56),
  );

  // O gate valida o comportamento do runtime para apanhar ambientes sem locale PT-PT.
  if (!euro.includes("1") || !euro.includes("234,56") || !euro.includes("€")) {
    throw new Error(`Formato EUR inesperado: ${euro}`);
  }

  const date = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, 11, 31)));

  if (date !== "31/12/2026") {
    throw new Error(`Formato de data inesperado: ${date}`);
  }
}

assertContains(formatterSource, 'PORTUGAL_LOCALE = "pt-PT"', "Locale PT-PT");
assertContains(formatterSource, 'DEFAULT_CURRENCY = "EUR"', "Moeda EUR");
assertContains(formatterSource, "formatEuroFromCents", "Export de euros");
assertContains(formatterSource, "formatPortugueseDate", "Export de datas");
assertContains(formatterSource, "formatDisplayValue", "Export de tabela");
assertContains(formatterSource, "Number.isInteger", "Validação de cêntimos");
assertContains(formatterSource, "A data indicada não existe no calendário.", "Negativo de data");
assertMatches(formatterSource, /formatDisplayValue\(columnName: string, value: unknown\)/, "Contrato de tabela");

if (packageJson.scripts?.["test:mf8:formatters"] !== "node scripts/check-mf8-formatters.mjs") {
  throw new Error("package.json deve expor test:mf8:formatters.");
}

assertNativeIntlBehavior();

console.log("BK-MF8-15 formatters: OK");