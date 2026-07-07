/**
 * Gate MF8 para validar formatadores PT-PT de datas, moedas e separadores.
 */

import { readFileSync } from "node:fs";

const formatterSource = readFileSync("src/lib/formatters.ts", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

/**
 * Normaliza espaços Unicode para comparar saídas Intl entre runtimes.
 *
 * @param {unknown} value - Valor a normalizar.
 * @returns {string} Texto com espaços normalizados.
 */
function normalizeSpaces(value) {
  return String(value).replace(/[\s\u00a0\u202f]/g, " ");
}

/**
 * Garante que um marcador existe no ficheiro fonte.
 *
 * @param {string} source - Conteúdo a verificar.
 * @param {string} expected - Marcador obrigatório.
 * @param {string} label - Descrição do contrato.
 * @returns {void}
 */
function assertContains(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`${label}: falta ${expected}`);
  }
}

/**
 * Garante que um padrão existe no ficheiro fonte.
 *
 * @param {string} source - Conteúdo a verificar.
 * @param {RegExp} pattern - Padrão obrigatório.
 * @param {string} label - Descrição do contrato.
 * @returns {void}
 */
function assertMatches(source, pattern, label) {
  if (!pattern.test(source)) {
    throw new Error(`${label}: padrão não encontrado`);
  }
}

/**
 * Valida comportamento real do runtime para os formatos exigidos pelo RNF36.
 *
 * @returns {void}
 */
function assertNativeIntlBehavior() {
  const euro = normalizeSpaces(
    new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: "always",
    }).format(1234.56),
  );

  if (euro !== "1 234,56 €") {
    throw new Error(`Formato EUR inesperado: ${euro}`);
  }

  const decimal = normalizeSpaces(
    new Intl.NumberFormat("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: "always",
    }).format(1234.56),
  );

  if (decimal !== "1 234,56") {
    throw new Error(`Formato decimal inesperado: ${decimal}`);
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
assertContains(formatterSource, "formatDecimalPt", "Export de decimais");
assertContains(formatterSource, "formatIntegerPt", "Export de inteiros");
assertContains(formatterSource, "formatPercentFromBasisPoints", "Export de percentagens");
assertContains(formatterSource, "formatPortugueseDate", "Export de datas");
assertContains(formatterSource, "formatDisplayValue", "Export de tabela");
assertContains(formatterSource, "groupPortugueseThousands", "Separador de milhar");
assertContains(formatterSource, "formatToParts", "Agrupamento por partes Intl");
assertContains(formatterSource, "Number.isInteger", "Validação de cêntimos");
assertContains(formatterSource, "A data indicada nao existe no calendario.", "Negativo de data");
assertMatches(
  formatterSource,
  /formatDisplayValue\(columnName: string, value: unknown\)/,
  "Contrato de tabela",
);

if (packageJson.scripts?.["test:mf8:formatters"] !== "node scripts/check-mf8-formatters.mjs") {
  throw new Error("package.json deve expor test:mf8:formatters.");
}

assertNativeIntlBehavior();

console.log("BK-MF8-15 formatters: OK");
