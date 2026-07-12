/**
 * @file Helpers de datas de negócio baseados no calendário local do browser.
 */

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Converte uma data para o formato de `<input type="date">` sem passar por UTC.
 *
 * @param date - Instante cuja data civil local deve ser usada.
 * @returns Data local no formato `YYYY-MM-DD`.
 */
export function toLocalDateInputValue(date = new Date()) {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

/**
 * Obtém o primeiro dia do mês civil local.
 *
 * @param date - Instante que identifica o mês local.
 * @returns Primeiro dia do mês no formato `YYYY-MM-DD`.
 */
export function firstLocalDayOfMonth(date = new Date()) {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-01`;
}

