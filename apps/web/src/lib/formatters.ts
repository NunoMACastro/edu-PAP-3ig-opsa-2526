/**
 * @file Formatadores PT-PT para valores financeiros e operacionais apresentados no frontend.
 */

export const PORTUGAL_LOCALE = "pt-PT";
export const DEFAULT_CURRENCY = "EUR";

const DATE_KEY_PATTERN = /(^date$|date$|At$|_at$|-at$|^from$|From$|_from$|-from$|^to$|To$|_to$|-to$)/;
const MONEY_CENTS_KEY_PATTERN =
  /(cents|amountcents|totalcents|balancecents|pricecents|costcents)$/i;
const BASIS_POINTS_KEY_PATTERN = /(bps|basispoints|ratebps|vatratebps)$/i;
const EURO_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  style: "currency",
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
};
const DECIMAL_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
};
const INTEGER_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  maximumFractionDigits: 0,
  useGrouping: false,
};

/**
 * Aplica agrupamento europeu com espaco apenas a parte inteira devolvida pelo Intl.
 *
 * @param integerPart - Parte inteira ja separada por `formatToParts`.
 * @returns Parte inteira com grupos de tres algarismos.
 */
function groupPortugueseThousands(integerPart: string): string {
  return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Mantem decimal, moeda e sinais vindos do Intl, substituindo apenas a parte inteira.
 *
 * @param formatter - Formatador Intl configurado para `pt-PT`.
 * @param value - Numero ja validado.
 * @returns Texto com separador de milhar europeu tambem para valores de quatro digitos.
 */
function formatWithGroupedInteger(
  formatter: Intl.NumberFormat,
  value: number,
): string {
  return formatter
    .formatToParts(value)
    .map((part) =>
      part.type === "integer" ? groupPortugueseThousands(part.value) : part.value,
    )
    .join("");
}

/**
 * Garante que o valor recebido e um numero finito antes de o apresentar.
 *
 * @param value - Valor candidato a numero.
 * @param label - Nome usado na mensagem de erro.
 * @returns Numero validado.
 * @throws Error quando o valor nao e numerico ou e infinito.
 */
function assertFiniteNumber(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} deve ser um numero finito.`);
  }

  return value;
}

/**
 * Garante que um valor monetario em centimos e inteiro.
 *
 * @param cents - Valor monetario tecnico guardado em centimos.
 * @returns Centimos validados.
 * @throws Error quando os centimos nao sao inteiros.
 */
function assertIntegerCents(cents: number): number {
  assertFiniteNumber(cents, "O valor em centimos");
  if (!Number.isInteger(cents)) {
    throw new Error("O valor em centimos deve ser um inteiro.");
  }

  return cents;
}

/**
 * Converte uma data ISO curta ou uma data ISO com hora numa data UTC estavel.
 *
 * @param value - Data recebida da API.
 * @returns Data pronta para formatacao em PT-PT.
 * @throws Error quando a data nao existe ou nao esta em formato ISO.
 */
function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value.trim());
  if (!match) {
    throw new Error("A data deve estar em formato ISO, por exemplo 2026-12-31.");
  }

  const [, year, month, day] = match;
  const isoDate = `${year}-${month}-${day}`;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  // Esta comparacao impede que o JavaScript transforme 2026-02-31 noutra data valida.
  if (date.toISOString().slice(0, 10) !== isoDate) {
    throw new Error("A data indicada nao existe no calendario.");
  }

  return date;
}

/**
 * Formata centimos como euros para apresentacao no frontend.
 *
 * @param cents - Valor monetario guardado em centimos.
 * @returns Valor em EUR no formato portugues.
 */
export function formatEuroFromCents(cents: number): string {
  const validCents = assertIntegerCents(cents);

  // A API continua a transportar inteiros; a conversao decimal existe so na apresentacao.
  return formatWithGroupedInteger(
    new Intl.NumberFormat(PORTUGAL_LOCALE, EURO_FORMAT_OPTIONS),
    validCents / 100,
  );
}

/**
 * Formata um numero decimal com separador portugues.
 *
 * @param value - Numero decimal a apresentar.
 * @param fractionDigits - Numero de casas decimais.
 * @returns Numero formatado em PT-PT.
 */
export function formatDecimalPt(value: number, fractionDigits = 2): string {
  const validValue = assertFiniteNumber(value, "O numero");

  return formatWithGroupedInteger(
    new Intl.NumberFormat(PORTUGAL_LOCALE, {
      ...DECIMAL_FORMAT_OPTIONS,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }),
    validValue,
  );
}

/**
 * Formata um inteiro com separadores de milhar em PT-PT.
 *
 * @param value - Numero inteiro a apresentar.
 * @returns Inteiro formatado em PT-PT.
 * @throws Error quando o valor nao e inteiro.
 */
export function formatIntegerPt(value: number): string {
  const validValue = assertFiniteNumber(value, "O inteiro");
  if (!Number.isInteger(validValue)) {
    throw new Error("O valor deve ser um inteiro.");
  }

  return formatWithGroupedInteger(
    new Intl.NumberFormat(PORTUGAL_LOCALE, INTEGER_FORMAT_OPTIONS),
    validValue,
  );
}

/**
 * Formata basis points como percentagem para leitura humana.
 *
 * @param basisPoints - Percentagem tecnica, por exemplo 2300 para 23,00 %.
 * @returns Percentagem formatada em PT-PT.
 */
export function formatPercentFromBasisPoints(basisPoints: number): string {
  const validBasisPoints = assertFiniteNumber(
    basisPoints,
    "A percentagem tecnica",
  );

  return `${formatDecimalPt(validBasisPoints / 100, 2)} %`;
}

/**
 * Formata data ISO para leitura em Portugal.
 *
 * @param isoDate - Data ISO recebida da API.
 * @returns Data curta em portugues de Portugal.
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
 * Formata um valor de tabela usando o nome da coluna como pista semantica.
 *
 * @param columnName - Nome da coluna ou campo vindo da API.
 * @param value - Valor recebido da API.
 * @returns Texto pronto a apresentar ao utilizador.
 */
export function formatDisplayValue(columnName: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "sim" : "nao";

  const normalizedColumn = columnName.toLowerCase();
  const trimmedColumn = columnName.trim();

  if (typeof value === "number" && MONEY_CENTS_KEY_PATTERN.test(normalizedColumn)) {
    return formatEuroFromCents(value);
  }

  if (typeof value === "number" && BASIS_POINTS_KEY_PATTERN.test(normalizedColumn)) {
    return formatPercentFromBasisPoints(value);
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? formatIntegerPt(value) : formatDecimalPt(value);
  }

  if (typeof value === "string" && DATE_KEY_PATTERN.test(trimmedColumn)) {
    return formatPortugueseDate(value);
  }

  // Objetos continuam visiveis para debugging funcional, mas nao escondem valores financeiros.
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
