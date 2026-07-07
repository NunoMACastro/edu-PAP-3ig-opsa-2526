/**
 * @file Mensagens de erro MF5 em portugues claro para a UI OPSA.
 */

import { ApiError } from "./apiClient";
import type { FieldValidationError } from "./mf5FormValidators";
import { formatMf5FormErrors } from "./mf5FormValidators";

export type UiErrorSource = "api" | "validation" | "runtime";

export interface UiErrorMessage {
  title: string;
  detail: string;
  help: string;
  code?: string;
  status?: number;
  source: UiErrorSource;
}

const HELP_BY_CODE: Record<string, string> = {
  API_ERROR: "Tenta novamente. Se o problema continuar, guarda a evidence e envia a equipa tecnica.",
  CONFLICT: "Atualiza os dados e confirma se outro utilizador alterou o mesmo registo.",
  FORBIDDEN: "Confirma se tens permissao para executar esta acao na empresa ativa.",
  INVALID_DATE: "Confirma se a data esta no formato AAAA-MM-DD e se existe no calendario.",
  INVALID_IBAN: "Confirma se o IBAN comeca por PT50 e se foi copiado sem espacos indevidos.",
  INVALID_NIF: "Confirma se o NIF tem 9 algarismos e pertence a entidade correta.",
  INVALID_SNC_ACCOUNT: "Confirma se a conta SNC tem apenas algarismos e corresponde ao plano de contas usado.",
  INVALID_VAT: "Confirma se a taxa de IVA selecionada e valida para este formulario.",
  NOT_FOUND: "Atualiza a lista e confirma se o registo ainda existe no contexto atual.",
  UNAUTHORIZED: "Inicia sessao novamente e repete a acao.",
  VALIDATION_ERROR: "Reve os campos do formulario antes de voltar a submeter.",
};

const HELP_BY_STATUS: Record<number, string> = {
  400: HELP_BY_CODE.VALIDATION_ERROR,
  401: HELP_BY_CODE.UNAUTHORIZED,
  403: HELP_BY_CODE.FORBIDDEN,
  404: HELP_BY_CODE.NOT_FOUND,
  409: HELP_BY_CODE.CONFLICT,
};

/**
 * Garante que um valor capturado em catch e tratado como erro seguro.
 *
 * @param error - Valor capturado durante uma operacao da UI.
 * @returns Erro nativo ou erro da API.
 */
function normalizeCaughtError(error: unknown): Error | ApiError {
  if (error instanceof ApiError || error instanceof Error) {
    return error;
  }

  // Valores nao-Error podem surgir de bibliotecas ou codigo legado; ficam com mensagem controlada.
  return new Error("Erro inesperado na interface.");
}

/**
 * Infere orientacao para mensagens locais criadas pelo BK-MF5-05.
 *
 * @param detail - Mensagem agregada de validacao local.
 * @returns Proxima acao adequada ao campo provavel.
 */
function inferHelpFromValidationDetail(detail: string) {
  const normalized = detail.toLowerCase();

  if (normalized.includes("nif")) {
    return HELP_BY_CODE.INVALID_NIF;
  }

  if (normalized.includes("iban")) {
    return HELP_BY_CODE.INVALID_IBAN;
  }

  if (normalized.includes("data")) {
    return HELP_BY_CODE.INVALID_DATE;
  }

  if (normalized.includes("iva")) {
    return HELP_BY_CODE.INVALID_VAT;
  }

  if (normalized.includes("snc") || normalized.includes("conta")) {
    return HELP_BY_CODE.INVALID_SNC_ACCOUNT;
  }

  return HELP_BY_CODE.VALIDATION_ERROR;
}

/**
 * Reconhece mensagens locais de validacao que ainda chegam como Error generico.
 *
 * @param detail - Mensagem de erro nativa ou local.
 * @returns Verdadeiro quando a mensagem parece validacao do formulario.
 */
function looksLikeValidationDetail(detail: string) {
  const normalized = detail.toLowerCase();
  return [
    "obrigatorio",
    "obrigatoria",
    "obrigatório",
    "obrigatória",
    "deve",
    "invalido",
    "inválido",
    "nif",
    "iban",
    "data",
    "iva",
    "snc",
    "conta",
  ].some((token) => normalized.includes(token));
}

/**
 * Escolhe ajuda para erros API preservando status e code.
 *
 * @param error - Erro vindo do cliente HTTP.
 * @returns Texto de ajuda associado ao codigo/status.
 */
function helpForApiError(error: ApiError) {
  return HELP_BY_CODE[error.code] ?? HELP_BY_STATUS[error.status] ?? HELP_BY_CODE.API_ERROR;
}

/**
 * Formata uma mensagem estruturada para componentes que ainda recebem texto simples.
 *
 * @param message - Mensagem estruturada de UI.
 * @returns Texto curto com causa e proxima acao.
 */
function formatUiMessage(message: UiErrorMessage) {
  const technicalContext = [message.status ? `HTTP ${message.status}` : null, message.code]
    .filter(Boolean)
    .join(" ");
  const prefix = technicalContext ? `${message.title} (${technicalContext})` : message.title;

  // O detalhe vem antes da ajuda para o utilizador saber o que falhou antes de tentar corrigir.
  return `${prefix}: ${message.detail} Proxima acao: ${message.help}`;
}

/**
 * Converte erros de validacao local do BK-MF5-05 para mensagem clara de UI.
 *
 * @param errors - Erros devolvidos pelos validadores MF5.
 * @returns Mensagem com detalhe e proxima acao.
 */
export function toUiValidationError(errors: FieldValidationError[]): UiErrorMessage {
  const detail = formatMf5FormErrors(errors);

  return {
    title: "Validacao do formulario",
    detail,
    help: inferHelpFromValidationDetail(detail),
    code: "VALIDATION_ERROR",
    source: "validation",
  };
}

/**
 * Converte erros tecnicos em mensagens uteis para o utilizador.
 *
 * @param error - Erro capturado durante uma chamada de API ou execucao local.
 * @returns Mensagem estruturada para apresentacao na UI.
 */
export function toUiErrorMessage(error: unknown): UiErrorMessage {
  const normalized = normalizeCaughtError(error);

  if (normalized instanceof ApiError) {
    return {
      title: "Erro da API",
      detail: normalized.message,
      help: helpForApiError(normalized),
      code: normalized.code,
      status: normalized.status,
      source: "api",
    };
  }

  if (looksLikeValidationDetail(normalized.message)) {
    return {
      title: "Validacao do formulario",
      detail: normalized.message,
      help: inferHelpFromValidationDetail(normalized.message),
      code: "VALIDATION_ERROR",
      source: "validation",
    };
  }

  return {
    title: "Erro inesperado",
    detail: normalized.message,
    help: "Recarrega a pagina e confirma se os dados continuam validos antes de repetir a acao.",
    source: "runtime",
  };
}

/**
 * Formata erros locais vindos dos validadores MF5.
 *
 * @param errors - Erros devolvidos por validateMf5Form ou validateMf5FormData.
 * @returns Texto pronto a apresentar no feedback do formulario.
 */
export function formatMf5ValidationUiError(errors: FieldValidationError[]) {
  return formatUiMessage(toUiValidationError(errors));
}

/**
 * Formata erros da API ou erros inesperados para componentes que recebem texto.
 *
 * @param error - Erro capturado pela UI.
 * @returns Texto pronto a apresentar no feedback do ecra.
 */
export function formatUiError(error: unknown) {
  const normalized = normalizeCaughtError(error);
  if (normalized.message.includes("Proxima acao:")) {
    return normalized.message;
  }

  return formatUiMessage(toUiErrorMessage(normalized));
}
