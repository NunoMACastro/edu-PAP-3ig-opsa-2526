/**
 * @file Validadores de formulário MF5 para bloquear formatos inválidos antes da submissão.
 */

export interface FieldValidationError {
  field: string;
  message: string;
}

export type PrimitiveValidationValue = string | number | boolean;

export interface Mf5FieldValidationTarget {
  name: string;
  validationName?: string;
  required?: boolean;
}

const NIF_FIELDS = new Set(["nif", "customernif", "suppliernif"]);
const IBAN_FIELDS = new Set(["iban", "bankiban"]);
const DATE_FIELDS = new Set([
  "asofdate",
  "countedat",
  "duedate",
  "dueat",
  "enddate",
  "entrydate",
  "from",
  "fromdate",
  "issuedat",
  "paidat",
  "receivedat",
  "startdate",
  "to",
  "todate",
]);
const VAT_ID_FIELDS = new Set(["vatrateid"]);
const VAT_BPS_FIELDS = new Set(["ratebps", "vatratebps"]);
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
 * Calcula o checksum oficial de NIF português usado também no backend.
 *
 * @param nif - NIF com 9 algarismos.
 * @returns Verdadeiro quando o dígito de controlo é válido.
 */
function hasValidNifChecksum(nif: string) {
  const digits = nif.split("").map(Number);
  const checkDigit = digits[8];
  const sum = digits
    .slice(0, 8)
    .reduce((total, digit, index) => total + digit * (9 - index), 0);
  const remainder = sum % 11;
  const expected = remainder < 2 ? 0 : 11 - remainder;

  return checkDigit === expected;
}

/**
 * Normaliza um alvo de validação declarado por string ou objeto.
 *
 * @param target - Campo a validar.
 * @returns Alvo normalizado com nome real e alias opcional.
 */
function normalizeTarget(target: string | Mf5FieldValidationTarget) {
  return typeof target === "string" ? { name: target } : target;
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
 * Valida NIF português por formato e checksum.
 *
 * @param value - Texto introduzido pelo utilizador.
 * @param field - Campo real validado.
 * @returns Erro de validação ou null.
 */
export function validateNif(
  value: PrimitiveValidationValue,
  field = "nif",
): FieldValidationError | null {
  const normalized = asText(value);
  if (!/^\d{9}$/.test(normalized)) {
    return { field, message: "O NIF deve ter 9 algarismos." };
  }

  if (!hasValidNifChecksum(normalized)) {
    return { field, message: "O NIF indicado não passou a validação de controlo." };
  }

  return null;
}

/**
 * Valida IBAN português com prefixo, tamanho e resto ISO 7064 mod 97.
 *
 * @param value - Texto introduzido pelo utilizador.
 * @param field - Campo real validado.
 * @returns Erro de validação ou null.
 */
export function validatePortugueseIban(
  value: PrimitiveValidationValue,
  field = "iban",
): FieldValidationError | null {
  const normalized = asText(value).replace(/\s+/g, "").toUpperCase();
  if (!/^PT50\d{21}$/.test(normalized)) {
    return {
      field,
      message: "O IBAN português deve começar por PT50 e ter 25 caracteres.",
    };
  }

  const rearranged = `${normalized.slice(4)}${normalized.slice(0, 4)}`;
  let remainder = 0;

  for (const character of rearranged) {
    // As letras do IBAN são convertidas para números antes do cálculo incremental do resto.
    const digits = /[A-Z]/.test(character)
      ? String(character.charCodeAt(0) - 55)
      : character;
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  if (remainder !== 1) {
    return { field, message: "O IBAN indicado não passou a validação de controlo." };
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
export function validateIsoDate(
  field: string,
  value: PrimitiveValidationValue,
): FieldValidationError | null {
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
 * @param field - Campo real validado.
 * @returns Erro de validação ou null.
 */
export function validateVatBps(
  value: PrimitiveValidationValue,
  field = "vatRateBps",
): FieldValidationError | null {
  const parsed = Number(asText(value));
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10000) {
    return {
      field,
      message: "A taxa de IVA técnica deve ser um inteiro entre 0 e 10000.",
    };
  }

  return null;
}

/**
 * Valida uma percentagem de IVA apresentada ao utilizador.
 *
 * @param value - Percentagem escrita pelo utilizador.
 * @param field - Campo real validado.
 * @returns Erro de validação ou null.
 */
export function validateVatPercent(
  value: PrimitiveValidationValue,
  field = "vatRatePercent",
): FieldValidationError | null {
  const parsed = Number(asText(value));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return { field, message: "A taxa de IVA deve estar entre 0 e 100." };
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
export function validateKnownId(
  field: string,
  value: PrimitiveValidationValue,
): FieldValidationError | null {
  if (!asText(value)) {
    return { field, message: "Seleciona uma opção válida antes de submeter." };
  }

  return null;
}

/**
 * Valida código de conta SNC usado no MVP.
 *
 * @param value - Código introduzido.
 * @param field - Campo real validado.
 * @returns Erro de validação ou null.
 */
export function validateSncAccount(
  value: PrimitiveValidationValue,
  field = "accountCode",
): FieldValidationError | null {
  const normalized = asText(value);
  if (!/^\d{1,8}$/.test(normalized)) {
    return { field, message: "A conta SNC deve ter entre 1 e 8 algarismos." };
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
 * @param field - Nome real do campo no formulário.
 * @param value - Valor primitivo do campo.
 * @param options - Alias semântico e obrigatoriedade local.
 * @returns Lista de erros encontrados.
 */
export function validateMf5Field(
  field: string,
  value: PrimitiveValidationValue,
  options: { validationName?: string; required?: boolean } = {},
) {
  const normalizedText = asText(value);
  if (!normalizedText) {
    return options.required
      ? [{ field, message: "Preenche o campo obrigatório antes de submeter." }]
      : [];
  }

  const normalizedField = (options.validationName ?? field).toLowerCase();
  const errors: FieldValidationError[] = [];

  pushError(errors, NIF_FIELDS.has(normalizedField) ? validateNif(value, field) : null);
  pushError(
    errors,
    IBAN_FIELDS.has(normalizedField) ? validatePortugueseIban(value, field) : null,
  );
  pushError(errors, DATE_FIELDS.has(normalizedField) ? validateIsoDate(field, value) : null);
  pushError(errors, VAT_ID_FIELDS.has(normalizedField) ? validateKnownId(field, value) : null);
  pushError(errors, VAT_BPS_FIELDS.has(normalizedField) ? validateVatBps(value, field) : null);
  pushError(
    errors,
    VAT_PERCENT_FIELDS.has(normalizedField) ? validateVatPercent(value, field) : null,
  );
  pushError(
    errors,
    SNC_FIELDS.has(normalizedField) ? validateSncAccount(value, field) : null,
  );

  return errors;
}

/**
 * Executa validadores antes de submeter o formulário.
 *
 * @param values - Valores normalizados pelo formulário.
 * @param targets - Campos e aliases semânticos a validar; por omissão usa os nomes de `values`.
 * @returns Lista de erros encontrados.
 */
export function validateMf5Form(
  values: Record<string, PrimitiveValidationValue>,
  targets?: Array<string | Mf5FieldValidationTarget>,
) {
  const validationTargets = targets ?? Object.keys(values);

  return validationTargets.flatMap((rawTarget) => {
    const target = normalizeTarget(rawTarget);
    const value = values[target.name];
    if (value === undefined) {
      return target.required
        ? [{ field: target.name, message: "Preenche o campo obrigatório antes de submeter." }]
        : [];
    }

    return validateMf5Field(target.name, value, {
      validationName: target.validationName,
      required: target.required,
    });
  });
}

/**
 * Valida campos selecionados diretamente a partir de FormData.
 *
 * @param form - FormData criado no submit.
 * @param fieldNames - Campos que o formulário deve validar localmente.
 * @returns Lista de erros encontrados.
 */
export function validateMf5FormData(
  form: FormData,
  fieldNames: Array<string | Mf5FieldValidationTarget>,
) {
  const values: Record<string, PrimitiveValidationValue> = {};
  const targets = fieldNames.map(normalizeTarget);

  for (const target of targets) {
    const value = form.get(target.name);
    if (typeof value === "string") {
      values[target.name] = value;
    }
  }

  return validateMf5Form(values, targets);
}

/**
 * Lança erro se valores já normalizados tiverem campos críticos inválidos.
 *
 * @param values - Valores primitivos recolhidos do formulário.
 * @param targets - Campos cobertos pelo RNF05.
 */
export function assertMf5FormValues(
  values: Record<string, unknown>,
  targets?: Array<string | Mf5FieldValidationTarget>,
) {
  const errors = validateMf5Form(toPrimitiveValidationValues(values), targets);
  if (errors.length > 0) {
    throw new Error(formatMf5FormErrors(errors));
  }
}

/**
 * Lança erro se os campos selecionados do FormData tiverem formatos inválidos.
 *
 * @param form - Dados submetidos pelo utilizador.
 * @param fieldNames - Campos cobertos pelo RNF05.
 */
export function assertMf5FormData(
  form: FormData,
  fieldNames: Array<string | Mf5FieldValidationTarget>,
) {
  const errors = validateMf5FormData(form, fieldNames);
  if (errors.length > 0) {
    throw new Error(formatMf5FormErrors(errors));
  }
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
