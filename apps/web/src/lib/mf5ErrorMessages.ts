/**
 * @file Mensagens de erro MF5 em português claro para a UI OPSA.
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
  API_ERROR: "Tenta novamente. Se o problema continuar, guarda a evidence e envia à equipa técnica.",
  CONFLICT: "Atualiza os dados e confirma se outro utilizador alterou o mesmo registo.",
  FORBIDDEN: "Confirma se tens permissão para executar esta ação na empresa ativa.",
  INVALID_DATE: "Confirma se a data está no formato AAAA-MM-DD e se existe no calendário.",
  INVALID_IBAN: "Confirma se o IBAN começa por PT50 e se foi copiado sem espaços indevidos.",
  INVALID_NIF: "Confirma se o NIF tem 9 algarismos e pertence à entidade correta.",
  INVALID_SNC_ACCOUNT: "Confirma se a conta SNC tem apenas algarismos e corresponde ao plano de contas usado.",
  INVALID_VAT: "Confirma se a taxa de IVA selecionada é válida para este formulário.",
  NOT_FOUND: "Atualiza a lista e confirma se o registo ainda existe no contexto atual.",
  UNAUTHORIZED: "Inicia sessão novamente e repete a ação.",
  VALIDATION_ERROR: "Revê os campos do formulário antes de voltar a submeter.",
};

/**
 * Garante que um valor capturado em catch é tratado como erro seguro.
 *
 * @param error - Valor capturado durante uma operação da UI.
 * @returns Erro nativo ou erro da API.
 */
function normalizeCaughtError(error: unknown): Error | ApiError {
  if (error instanceof ApiError || error instanceof Error) {
    return error;
  }

  return new Error("Erro inesperado na interface.");
}

/**
 * Infere orientação para mensagens locais criadas pelo BK-MF5-05.
 *
 * @param detail - Mensagem agregada de validação local.
 * @returns Próxima ação adequada ao campo provável.
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
 * Formata uma mensagem estruturada para componentes que ainda recebem texto simples.
 *
 * @param message - Mensagem estruturada de UI.
 * @returns Texto curto com causa e próxima ação.
 */
function formatUiMessage(message: UiErrorMessage) {
  const technicalContext = [message.status ? `HTTP ${message.status}` : null, message.code]
    .filter(Boolean)
    .join(" ");
  const prefix = technicalContext ? `${message.title} (${technicalContext})` : message.title;

  return `${prefix}: ${message.detail} ${message.help}`;
}

/**
 * Converte erros de validação local do BK-MF5-05 para mensagem clara de UI.
 *
 * @param errors - Erros devolvidos pelos validadores MF5.
 * @returns Mensagem com detalhe e próxima ação.
 */
export function toUiValidationError(errors: FieldValidationError[]): UiErrorMessage {
  const detail = formatMf5FormErrors(errors);

  return {
    title: "Validação do formulário",
    detail,
    help: inferHelpFromValidationDetail(detail),
    code: "VALIDATION_ERROR",
    source: "validation",
  };
}

/**
 * Converte erros técnicos em mensagens úteis para o utilizador.
 *
 * @param error - Erro capturado durante uma chamada de API ou execução local.
 * @returns Mensagem estruturada para apresentação na UI.
 */
export function toUiErrorMessage(error: unknown): UiErrorMessage {
  const normalized = normalizeCaughtError(error);

  if (normalized instanceof ApiError) {
    return {
      title: "Erro da API",
      detail: normalized.message,
      help: HELP_BY_CODE[normalized.code] ?? HELP_BY_CODE.API_ERROR,
      code: normalized.code,
      status: normalized.status,
      source: "api",
    };
  }

  return {
    title: "Erro inesperado",
    detail: normalized.message,
    help: "Recarrega a página e confirma se os dados continuam válidos antes de repetir a ação.",
    source: "runtime",
  };
}

/**
 * Formata erros locais vindos dos validadores MF5.
 *
 * @param errors - Erros devolvidos por validateMf5Form ou validateMf5FormData.
 * @returns Texto pronto a apresentar no feedback do formulário.
 */
export function formatMf5ValidationUiError(errors: FieldValidationError[]) {
  return formatUiMessage(toUiValidationError(errors));
}

/**
 * Formata erros da API ou erros inesperados para componentes que recebem texto.
 *
 * @param error - Erro capturado pela UI.
 * @returns Texto pronto a apresentar no feedback do ecrã.
 */
export function formatUiError(error: unknown) {
  return formatUiMessage(toUiErrorMessage(error));
}
