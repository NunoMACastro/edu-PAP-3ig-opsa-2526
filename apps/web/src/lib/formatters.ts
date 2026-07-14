/**
 * @file Formatadores PT-PT para valores financeiros e operacionais apresentados no frontend.
 */

export const PORTUGAL_LOCALE = "pt-PT";
export const DEFAULT_CURRENCY = "EUR";

const DATE_KEY_PATTERN = /(^date$|date$|At$|_at$|-at$|^from$|From$|_from$|-from$|^to$|To$|_to$|-to$)/;
const DATE_TIME_KEY_PATTERN = /(createdAt|updatedAt|importedAt|completedAt|readAt|expiresAt)$/i;
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

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Submetida",
  APPROVED: "Aprovada",
  ISSUED: "Emitida",
  SETTLED: "Liquidada",
  REJECTED: "Rejeitada",
  POSTED: "Contabilizada",
  PAID: "Paga",
  OPEN: "Aberto",
  CLOSED: "Fechado",
  QUEUED: "Em fila",
  RUNNING: "Em análise",
  COMPLETED: "Concluída",
  FAILED: "Falhou",
  ACKNOWLEDGED: "Reconhecido",
  RESOLVED: "Resolvido",
  DISMISSED: "Ignorado",
  INFO: "Informação",
  WARNING: "Aviso",
  CRITICAL: "Crítico",
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Elevado",
  SUFFICIENT: "Amostra suficiente",
  LIMITED: "Amostra limitada",
  INSUFFICIENT_DATA: "Dados insuficientes",
  NO_OUTFLOW: "Sem saídas observadas",
  PARTIAL: "Parcial",
  LEGACY: "Dados anteriores",
};

const AUDIT_ACTION_LABELS: Record<string, string> = {
  SALE_DOCUMENT_CREATED: "Criou o documento de venda",
  SALE_DOCUMENT_SUBMITTED: "Submeteu o documento de venda",
  SALE_DOCUMENT_APPROVED: "Aprovou o documento de venda",
  SALE_DOCUMENT_REJECTED: "Rejeitou o documento de venda",
  SALE_DOCUMENT_POSTED: "Contabilizou o documento de venda",
  PURCHASE_DOCUMENT_CREATED: "Criou o documento de compra",
  PURCHASE_DOCUMENT_APPROVED: "Aprovou o documento de compra",
  PURCHASE_DOCUMENT_REJECTED: "Rejeitou o documento de compra",
  PURCHASE_DOCUMENT_POSTED: "Contabilizou o documento de compra",
  STOCK_MOVEMENT_CREATED: "Registou um movimento de stock",
  "document.issue": "Emitiu o documento de venda",
  COMPANY_BOOTSTRAPPED: "Criou e preparou a empresa",
  COMPANY_CONTEXT_SWITCHED: "Mudou a empresa ativa",
  CUSTOMER_CREATED: "Criou um cliente",
  SUPPLIER_CREATED: "Criou um fornecedor",
  ITEM_CREATED: "Criou um artigo ou serviço",
  WAREHOUSE_CREATED: "Criou um armazém",
  AI_TRANSACTION_ANALYSIS_CONSULTED: "Consultou a análise IA da operação",
  AI_ANALYSIS_RUN_CREATED: "Iniciou uma análise de dados",
  AI_RECORD_STATUS_UPDATED: "Atualizou o estado de um resultado IA",
  RECEIPT_REGISTERED: "Registou um recebimento",
  PAYMENT_REGISTERED: "Registou um pagamento",
};

const ENTITY_LABELS: Record<string, string> = {
  SaleDocument: "Documento de venda",
  PurchaseDocument: "Documento de compra",
  JournalEntry: "Lançamento contabilístico",
  StockMovement: "Movimento de stock",
  Company: "Empresa",
  CompanyMembership: "Contexto de empresa",
  Customer: "Cliente",
  Supplier: "Fornecedor",
  Item: "Artigo ou serviço",
  Warehouse: "Armazém",
  AiAnalysisRun: "Análise de dados",
  SmartAlert: "Alerta inteligente",
  AiTransactionAnalysis: "Análise IA de operação",
};

function humanizeTechnicalValue(value: string): string {
  const normalized = value.replace(/[._-]+/g, " ").trim().toLocaleLowerCase(PORTUGAL_LOCALE);
  return normalized ? normalized.charAt(0).toLocaleUpperCase(PORTUGAL_LOCALE) + normalized.slice(1) : "-";
}

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
 * Formata um timestamp ISO preservando hora e minutos no fuso local do browser.
 *
 * @param isoDateTime - Timestamp ISO recebido da API.
 * @returns Data e hora em português de Portugal.
 */
export function formatPortugueseDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    throw new Error("A data e hora indicadas são inválidas.");
  }
  return new Intl.DateTimeFormat(PORTUGAL_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Formata um enum de estado sem deixar inglês técnico como texto principal. */
export function formatStatusLabel(value: string | null | undefined): string {
  if (!value) return "Sem estado";
  return STATUS_LABELS[value] ?? humanizeTechnicalValue(value);
}

/** Traduz o tipo funcional de documento usado nos read models. */
export function formatDocumentTypeLabel(value: string): string {
  return ({
    SALE: "Venda",
    PURCHASE: "Compra",
    INVOICE: "Fatura",
    INVOICE_RECEIPT: "Fatura-recibo",
    CREDIT_NOTE: "Nota de crédito",
    SUPPLIER_INVOICE: "Fatura de fornecedor",
    SUPPLIER_CREDIT_NOTE: "Nota de crédito de fornecedor",
  } as Record<string, string>)[value] ?? humanizeTechnicalValue(value);
}

/** Traduz uma ação persistida de auditoria para uma frase curta. */
export function formatAuditActionLabel(value: string): string {
  return AUDIT_ACTION_LABELS[value] ?? humanizeTechnicalValue(value);
}

/** Traduz o tipo de entidade auditada sem expor nomes de modelos como conteúdo principal. */
export function formatEntityLabel(value: string): string {
  return ENTITY_LABELS[value] ?? humanizeTechnicalValue(value);
}

/** Apresenta quantidades decimais da API com até três casas e separador PT-PT. */
export function formatQuantity(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return "-";
  return formatWithGroupedInteger(
    new Intl.NumberFormat(PORTUGAL_LOCALE, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
      useGrouping: false,
    }),
    parsed,
  );
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
  if (typeof value === "boolean") return value ? "Sim" : "Não";

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

  if (typeof value === "string" && DATE_TIME_KEY_PATTERN.test(trimmedColumn)) {
    return formatPortugueseDateTime(value);
  }

  if (typeof value === "string" && DATE_KEY_PATTERN.test(trimmedColumn)) {
    return formatPortugueseDate(value);
  }

  // Objetos são apresentados por componentes estruturados para não despejar JSON técnico.
  if (typeof value === "object") {
    return "Detalhes disponíveis";
  }

  return String(value);
}
