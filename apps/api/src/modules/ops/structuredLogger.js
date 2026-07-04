// apps/api/src/modules/ops/structuredLogger.js

const ALLOWED_LEVELS = new Set(["info", "warn", "error", "audit"]);
const BLOCKED_CONTEXT_KEYS = new Set([
    "apikey",
    "authorization",
    "cookie",
    "documentlines",
    "headers",
    "iban",
    "nif",
    "password",
    "rawpayload",
    "secret",
    "token",
]);

/**
 * @typedef {string | number | boolean | null} SafeLogValue
 */

/**
 * @typedef {Record<string, SafeLogValue>} SafeLogContext
 */

/**
 * Cria um evento de log seguro para a API OPSA.
 *
 * @param {{ level: string, event: string, module: string, requirement: string, context?: SafeLogContext }} input - Dados mínimos do evento.
 * @returns {{ timestamp: string, level: string, event: string, module: string, requirement: string, context: SafeLogContext }} Evento normalizado.
 * @throws {Error} Quando o nível, os campos obrigatórios ou o contexto não cumprem a política de logs seguros.
 */
export function createStructuredLogEvent(input) {
    if (!input || typeof input !== "object") {
        throw new Error("Evento de log inválido.");
    }

    const { level, event, module, requirement, context = {} } = input;

    if (!ALLOWED_LEVELS.has(level)) {
        throw new Error("Nível de log inválido.");
    }
    if (
        typeof event !== "string" ||
        typeof module !== "string" ||
        typeof requirement !== "string" ||
        !event.trim() ||
        !module.trim() ||
        !requirement.trim()
    ) {
        throw new Error("Evento, módulo e requisito são obrigatórios.");
    }
    if (typeof context !== "object" || context === null || Array.isArray(context)) {
        throw new Error("Contexto de log inválido.");
    }

    const safeContext = {};
    for (const [key, value] of Object.entries(context)) {
        const normalizedKey = key.toLowerCase();

        // A lista é comparada em minúsculas para bloquear variações como apiKey ou rawPayload.
        if (BLOCKED_CONTEXT_KEYS.has(normalizedKey)) {
            throw new Error(`Campo proibido em contexto de log: ${key}`);
        }
        if (
            value !== null &&
            typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
        ) {
            throw new Error(`Valor inválido em contexto de log: ${key}`);
        }

        // O logger guarda apenas metadados simples; objetos completos escondem payloads sensíveis.
        safeContext[key] = value;
    }

    return {
        timestamp: new Date().toISOString(),
        level,
        event: event.trim(),
        module: module.trim(),
        requirement: requirement.trim(),
        context: safeContext,
    };
}

/**
 * Escreve o evento na consola usando o método certo para o nível.
 *
 * @param {ReturnType<typeof createStructuredLogEvent>} event - Evento já validado.
 * @returns {void}
 */
export function writeStructuredLog(event) {
    // A consola recebe JSON para manter o output pesquisável em dev, CI e defesa.
    const serialized = JSON.stringify(event);
    if (event.level === "error") console.error(serialized);
    else if (event.level === "warn") console.warn(serialized);
    else console.info(serialized);
}