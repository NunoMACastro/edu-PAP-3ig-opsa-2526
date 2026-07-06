// apps/web/src/lib/formatters.ts

export const PORTUGAL_LOCALE = "pt-PT";
export const DEFAULT_CURRENCY = "EUR";

const DATE_KEY_PATTERN = /(date|at|from|to)$/i;
const MONEY_CENTS_KEY_PATTERN = /(cents|amountcents|totalcents|balancecents|pricecents|costcents)$/i;
const BASIS_POINTS_KEY_PATTERN = /(bps|basispoints|ratebps|vatratebps)$/i;

/**
 * Garante que o valor recebido é um número finito antes de o apresentar.
 *
 * @param value - Valor candidato a número.
 * @param label - Nome usado na mensagem de erro.
 * @returns Número validado.
 * @throws Error quando o valor não é numérico ou é infinito.
 */
function assertFiniteNumber(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} deve ser um número finito.`);
  }

  return value;
}

/**
 * Garante que um valor monetário em cêntimos é inteiro.
 *
 * @param cents - Valor monetário técnico guardado em cêntimos.
 * @returns Cêntimos validados.
 * @throws Error quando os cêntimos não são inteiros.
 */
function assertIntegerCents(cents: number): number {
  assertFiniteNumber(cents, "O valor em cêntimos");
  if (!Number.isInteger(cents)) {
    throw new Error("O valor em cêntimos deve ser um inteiro.");
  }

  return cents;
}

/**
 * Converte uma data ISO curta ou uma data ISO com hora numa data UTC estável.
 *
 * @param value - Data recebida da API.
 * @returns Data pronta para formatação em PT-PT.
 * @throws Error quando a data não existe ou não está em formato ISO.
 */
function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value.trim());
  if (!match) {
    throw new Error("A data deve estar em formato ISO, por exemplo 2026-12-31.");
  }

  const [, year, month, day] = match;
  const isoDate = `${year}-${month}-${day}`;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  // Esta comparação impede que o JavaScript transforme 2026-02-31 em outra data válida.
  if (date.toISOString().slice(0, 10) !== isoDate) {
    throw new Error("A data indicada não existe no calendário.");
  }

  return date;
}

/**
 * Formata cêntimos como euros para apresentação no frontend.
 *
 * @param cents - Valor monetário guardado em cêntimos.
 * @returns Valor em EUR no formato português.
 */
export function formatEuroFromCents(cents: number): string {
  const validCents = assertIntegerCents(cents);

  // A API continua a transportar inteiros; a conversão decimal existe só na apresentação.
  return new Intl.NumberFormat(PORTUGAL_LOCALE, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(validCents / 100);
}

/**
 * Formata um número decimal com separador português.
 *
 * @param value - Número decimal a apresentar.
 * @param fractionDigits - Número de casas decimais.
 * @returns Número formatado em PT-PT.
 */
export function formatDecimalPt(value: number, fractionDigits = 2): string {
  const validValue = assertFiniteNumber(value, "O número");

  return new Intl.NumberFormat(PORTUGAL_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(validValue);
}

/**
 * Formata um inteiro com separadores de milhar em PT-PT.
 *
 * @param value - Número inteiro a apresentar.
 * @returns Inteiro formatado em PT-PT.
 * @throws Error quando o valor não é inteiro.
 */
export function formatIntegerPt(value: number): string {
  const validValue = assertFiniteNumber(value, "O inteiro");
  if (!Number.isInteger(validValue)) {
    throw new Error("O valor deve ser um inteiro.");
  }

  return new Intl.NumberFormat(PORTUGAL_LOCALE, {
    maximumFractionDigits: 0,
  }).format(validValue);
}

/**
 * Formata basis points como percentagem para leitura humana.
 *
 * @param basisPoints - Percentagem técnica, por exemplo 2300 para 23,00 %.
 * @returns Percentagem formatada em PT-PT.
 */
export function formatPercentFromBasisPoints(basisPoints: number): string {
  const validBasisPoints = assertFiniteNumber(basisPoints, "A percentagem técnica");

  return `${formatDecimalPt(validBasisPoints / 100, 2)} %`;
}

/**
 * Formata data ISO para leitura em Portugal.
 *
 * @param isoDate - Data ISO recebida da API.
 * @returns Data curta em português de Portugal.
 */
export function formatPortugueseDate(isoDate: string): string {
  const date = parseIsoDate(isoDate);

  return new Intl.DateTimeFormat(PORTUGAL_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Formata um valor de tabela usando o nome da coluna como pista semântica.
 *
 * @param columnName - Nome da coluna ou campo vindo da API.
 * @param value - Valor recebido da API.
 * @returns Texto pronto a apresentar ao utilizador.
 */
export function formatDisplayValue(columnName: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "sim" : "não";

  const normalizedColumn = columnName.toLowerCase();

  if (typeof value === "number" && MONEY_CENTS_KEY_PATTERN.test(normalizedColumn)) {
    return formatEuroFromCents(value);
  }

  if (typeof value === "number" && BASIS_POINTS_KEY_PATTERN.test(normalizedColumn)) {
    return formatPercentFromBasisPoints(value);
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? formatIntegerPt(value) : formatDecimalPt(value);
  }

  if (typeof value === "string" && DATE_KEY_PATTERN.test(normalizedColumn)) {
    return formatPortugueseDate(value);
  }

  // Objetos continuam visíveis para debugging funcional, mas não devem esconder valores financeiros.
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}