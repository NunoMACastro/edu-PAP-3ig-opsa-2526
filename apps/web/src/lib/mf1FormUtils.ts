/**
 * @file Utilitários partilhados para normalizar respostas e validar formulários dos ecrãs MF1.
 */

export type ApiObject = Record<string, unknown>;

/**
 * Converte um valor desconhecido num objeto indexável, devolvendo objeto vazio quando o formato não é seguro.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Objeto indexável seguro, ou objeto vazio quando o valor não é compatível.
 */
export function asObject(value: unknown): ApiObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiObject)
    : {};
}

/**
 * Extrai um array de uma resposta JSON e normaliza cada entrada para objeto.
 *
 * @param response - Resposta JSON recebida da API.
 * @param key - Chave a extrair da resposta JSON.
 * @returns Lista de objetos extraída da resposta JSON.
 */
export function pickArray(response: unknown, key: string): ApiObject[] {
  const value = asObject(response)[key];
  return Array.isArray(value) ? value.map(asObject) : [];
}

/**
 * Converte valores heterogéneos da API numa representação textual estável para tabelas.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Representação textual estável do valor recebido.
 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "sim" : "nao";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Converte texto de formulário num inteiro positivo obrigatório.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param label - Nome amigável usado em mensagens de erro ou UI.
 * @returns Inteiro positivo validado.
 */
export function toPositiveInteger(value: FormDataEntryValue | null, label: string) {
  const parsed = Number(String(value ?? "").trim());
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} deve ser um numero inteiro positivo`);
  }
  return parsed;
}

/**
 * Normaliza texto obrigatório e lança erro claro quando o campo está vazio.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param label - Nome amigável usado em mensagens de erro ou UI.
 * @returns Texto obrigatório validado.
 */
export function requiredText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error(`${label} e obrigatorio`);
  }
  return text;
}

/**
 * Normaliza texto opcional, devolvendo undefined para campos vazios.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Texto normalizado, ou undefined quando o campo está vazio.
 */
export function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || undefined;
}
