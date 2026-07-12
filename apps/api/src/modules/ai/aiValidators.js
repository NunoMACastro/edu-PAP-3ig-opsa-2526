/**
 * @file Validadores da IA assistiva MF4.
 *
 * A IA da OPSA nesta macrofase e deterministica: valida entradas, le dados
 * internos e devolve fonte/explicacao. Nao chama provider externo nem executa
 * acoes operacionais.
 */

import { httpError } from "../../lib/httpErrors.js";

const MAX_RANGE_DAYS = 366;
const READ_ONLY_INTENTS = new Set([
    "cashflow",
    "clientes",
    "stock",
    "margem",
    "kpis",
]);
const MUTATION_WORDS = [
    "aprova",
    "aprovar",
    "apaga",
    "apagar",
    "altera",
    "alterar",
    "cria",
    "criar",
    "emite",
    "emitir",
    "executa",
    "executar",
    "lanca",
    "lança",
    "paga",
    "pagar",
];

/**
 * Normaliza datas ISO curtas recebidas por query string.
 *
 * @param {unknown} value - Valor recebido no pedido HTTP.
 * @param {string} field - Nome do campo usado na mensagem de erro.
 * @throws {Error} Quando a data e invalida ou esta vazia.
 * @returns {Date} Data validada em UTC.
 */
function parseIsoDate(value, field) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw httpError(400, "INVALID_DATE", `${field} deve estar no formato YYYY-MM-DD`);
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw httpError(400, "INVALID_DATE", `${field} deve ser uma data valida`);
    }
    return date;
}

/**
 * Calcula dias inclusivos para alinhar validacao com os relatórios MF3.
 *
 * @param {Date} fromDate - Data inicial.
 * @param {Date} toDate - Data final.
 * @returns {number} Numero inclusivo de dias.
 */
function inclusiveDays(fromDate, toDate) {
    return Math.floor((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1;
}

/**
 * Valida um intervalo de consulta usado por insights e alertas.
 *
 * @param {Record<string, unknown>} query - Query string Express.
 * @throws {Error} Quando o intervalo e invalido ou demasiado longo.
 * @returns {{ fromDate: Date, toDate: Date }} Datas normalizadas.
 */
export function validateInsightRange(query) {
    const fromDate = parseIsoDate(query.from, "from");
    const toDate = parseIsoDate(query.to, "to");
    if (fromDate > toDate) {
        throw httpError(400, "INVALID_DATE_RANGE", "A data inicial nao pode ser posterior a data final");
    }
    if (inclusiveDays(fromDate, toDate) > MAX_RANGE_DAYS) {
        throw httpError(400, "INVALID_DATE_RANGE", "O periodo da analise nao pode exceder 366 dias");
    }
    return { fromDate, toDate };
}

/**
 * Classifica uma pergunta em linguagem natural num conjunto fechado de intencoes de leitura.
 *
 * @param {unknown} body - Corpo recebido no endpoint de perguntas.
 * @throws {Error} Quando a pergunta esta vazia, tenta mutacao ou foge ao contrato.
 * @returns {{ question: string, intent: string }} Pergunta normalizada e intencao.
 */
export function validateQuestionPayload(body) {
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    if (question.length < 8 || question.length > 300) {
        throw httpError(400, "INVALID_QUESTION", "A pergunta deve ter entre 8 e 300 caracteres");
    }

    const normalized = question.toLowerCase();
    if (MUTATION_WORDS.some((word) => normalized.includes(word))) {
        throw httpError(
            400,
            "AI_READ_ONLY",
            "A IA da OPSA so responde a perguntas de leitura e nao executa acoes",
        );
    }

    const intent =
        normalized.includes("tesour") || normalized.includes("cash")
            ? "cashflow"
            : normalized.includes("cliente")
              ? "clientes"
              : normalized.includes("stock") || normalized.includes("artigo")
                ? "stock"
                : normalized.includes("margem")
                  ? "margem"
                  : normalized.includes("kpi") || normalized.includes("ebitda")
                    ? "kpis"
                    : null;

    if (!intent || !READ_ONLY_INTENTS.has(intent)) {
        throw httpError(
            400,
            "UNSUPPORTED_AI_INTENT",
            "Pergunta fora do escopo de leitura da MF4",
        );
    }

    return { question, intent };
}
