/**
 * @file Validadores de formulário MF5 para bloquear formatos inválidos antes da submissão.
 */

export interface FieldValidationError {
  field: string;
  message: string;
}

export type PrimitiveValidationValue = string | number | boolean;

const NIF_FIELDS = new Set(["nif", "customernif", "suppliernif"]);
const IBAN_FIELDS = new Set(["iban", "bankiban"]);
const DATE_FIELDS = new Set(["issuedat", "duedate", "entrydate", "receivedat", "paidat", "fromdate", "todate"]);
const VAT_ID_FIELDS = new Set(["vatrateid"]);
const VAT_BPS_FIELDS = new Set(["vatratebps"]);
const VAT_PERCENT_FIELDS = new Set(["vatratepercent"]);
const SNC_FIELDS = new Set(["accountcode", "sncaccountcode"]);

/**
 * Converte valores primitivos para texto aparado.
 *
 * @param value - Valor recebido do formulário.
 * @returns Texto seguro para validação de formato.
 */
function asText(value: PrimitiveValidationValue) {
  return String(value).trim();
}

/**
 * Acrescenta um erro à lista apenas quando o validador encontrou uma falha.
 *
 * @param errors - Lista acumulada de erros.
 * @param error - Resultado de um validador individual.
 */
function pushError(errors: FieldValidationError[], error: FieldValidationError | null) {
  if (error) {
    errors.push(error);
  }
}

/**
 * Valida NIF português por formato simples usado no MVP OPSA.
 *
 * @param value - Texto introduzido pelo utilizador.
 * @returns Erro de validação ou null.
 */
export function validateNif(value: PrimitiveValidationValue): FieldValidationError | null {
  const normalized = asText(value);
  if (!/^\d{9}$/.test(normalized)) {
    return { field: "nif", message: "O NIF deve ter 9 algarismos." };
  }

  return null;
}

/**
 * Valida IBAN português com prefixo, tamanho e resto ISO 7064 mod 97.
 *
 * @param value - Texto introduzido pelo utilizador.
 * @returns Erro de validação ou null.
 */
export function validatePortugueseIban(value: PrimitiveValidationValue): FieldValidationError | null {
  const normalized = asText(value).replace(/\s+/g, "").toUpperCase();
  if (!/^PT50\d{21}$/.test(normalized)) {
    return { field: "iban", message: "O IBAN português deve começar por PT50 e ter 25 caracteres." };
  }

  const rearranged = `${normalized.slice(4)}${normalized.slice(0, 4)}`;
  let remainder = 0;

  for (const character of rearranged) {
    // As letras do IBAN são convertidas para números antes do cálculo incremental do resto.
    const digits = /[A-Z]/.test(character) ? String(character.charCodeAt(0) - 55) : character;
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  if (remainder !== 1) {
    return { field: "iban", message: "O IBAN indicado não passou a validação de controlo." };
  }

  return null;
}

/**
 * Valida datas ISO sem permitir normalização silenciosa do JavaScript.
 *
 * @param field - Nome do campo validado.
 * @param value - Valor do input.
 * @returns Erro de validação ou null.
 */
export function validateIsoDate(field: string, value: PrimitiveValidationValue): FieldValidationError | null {
  const normalized = asText(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) {
    return { field, message: "A data deve estar no formato AAAA-MM-DD." };
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.toISOString().slice(0, 10) !== normalized) {
    return { field, message: "A data indicada não existe." };
  }

  return null;
}

/**
 * Valida uma taxa de IVA guardada em basis points.
 *
 * @param value - Valor técnico, por exemplo 2300 para 23,00%.
 * @returns Erro de validação ou null.
 */
export function validateVatBps(value: PrimitiveValidationValue): FieldValidationError | null {
  const parsed = Number(asText(value));
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10000) {
    return { field: "vatRateBps", message: "A taxa de IVA técnica deve ser um inteiro entre 0 e 10000." };
  }

  return null;
}

/**
 * Valida uma percentagem de IVA apresentada ao utilizador.
 *
 * @param value - Percentagem escrita pelo utilizador.
 * @returns Erro de validação ou null.
 */
export function validateVatPercent(value: PrimitiveValidationValue): FieldValidationError | null {
  const parsed = Number(asText(value));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return { field: "vatRatePercent", message: "A taxa de IVA deve estar entre 0 e 100." };
  }

  return null;
}

/**
 * Valida presença de identificador selecionado numa lista controlada.
 *
 * @param field - Campo de identificador validado.
 * @param value - Valor selecionado no formulário.
 * @returns Erro de validação ou null.
 */
export function validateKnownId(field: string, value: PrimitiveValidationValue): FieldValidationError | null {
  if (!asText(value)) {
    return { field, message: "Seleciona uma opção válida antes de submeter." };
  }

  return null;
}

/**
 * Valida código de conta SNC usado no MVP.
 *
 * @param value - Código introduzido.
 * @returns Erro de validação ou null.
 */
export function validateSncAccount(value: PrimitiveValidationValue): FieldValidationError | null {
  const normalized = asText(value);
  if (!/^\d{2,8}$/.test(normalized)) {
    return { field: "accountCode", message: "A conta SNC deve ter entre 2 e 8 algarismos." };
  }

  return null;
}

/**
 * Mantém apenas valores primitivos que podem ser validados por formato no frontend.
 *
 * @param values - Valores recolhidos pelo formulário.
 * @returns Valores seguros para validação textual.
 */
export function toPrimitiveValidationValues(values: Record<string, unknown>) {
  const safeValues: Record<string, PrimitiveValidationValue> = {};

  for (const [field, value] of Object.entries(values)) {
    // Objetos e listas continuam a ser responsabilidade da validação backend.
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safeValues[field] = value;
    }
  }

  return safeValues;
}

/**
 * Valida um único campo de formulário por contrato explícito de nome.
 *
 * @param field - Nome do campo.
 * @param value - Valor primitivo do campo.
 * @returns Lista de erros encontrados.
 */
export function validateMf5Field(field: string, value: PrimitiveValidationValue) {
  const normalizedField = field.toLowerCase();
  const errors: FieldValidationError[] = [];

  pushError(errors, NIF_FIELDS.has(normalizedField) ? validateNif(value) : null);
  pushError(errors, IBAN_FIELDS.has(normalizedField) ? validatePortugueseIban(value) : null);
  pushError(errors, DATE_FIELDS.has(normalizedField) ? validateIsoDate(field, value) : null);
  pushError(errors, VAT_ID_FIELDS.has(normalizedField) ? validateKnownId(field, value) : null);
  pushError(errors, VAT_BPS_FIELDS.has(normalizedField) ? validateVatBps(value) : null);
  pushError(errors, VAT_PERCENT_FIELDS.has(normalizedField) ? validateVatPercent(value) : null);
  pushError(errors, SNC_FIELDS.has(normalizedField) ? validateSncAccount(value) : null);

  return errors;
}

/**
 * Executa validadores antes de submeter o formulário.
 *
 * @param values - Valores normalizados pelo formulário.
 * @returns Lista de erros encontrados.
 */
export function validateMf5Form(values: Record<string, PrimitiveValidationValue>) {
  return Object.entries(values).flatMap(([field, value]) => validateMf5Field(field, value));
}

/**
 * Valida campos selecionados diretamente a partir de FormData.
 *
 * @param form - FormData criado no submit.
 * @param fieldNames - Campos que o formulário deve validar localmente.
 * @returns Lista de erros encontrados.
 */
export function validateMf5FormData(form: FormData, fieldNames: string[]) {
  const values: Record<string, PrimitiveValidationValue> = {};

  for (const fieldName of fieldNames) {
    const value = form.get(fieldName);
    if (typeof value === "string") {
      values[fieldName] = value;
    }
  }

  return validateMf5Form(values);
}

/**
 * Formata erros de validação para o contrato de feedback imediato.
 *
 * @param errors - Lista de erros devolvida pelos validadores.
 * @returns Mensagem agregada para mostrar no formulário.
 */
export function formatMf5FormErrors(errors: FieldValidationError[]) {
  return errors.map((error) => error.message).join(" ");
}