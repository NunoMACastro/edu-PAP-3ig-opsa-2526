/**
 * @file Logger operacional estruturado para RNF28.
 *
 * Este modulo cria eventos previsiveis para a consola da API sem misturar
 * observabilidade operacional com AuditLog persistente ou logs de integracao.
 */

const ALLOWED_LEVELS = new Set(["info", "warn", "error", "audit"]);
const BLOCKED_CONTEXT_KEYS = new Set([
    "accesstoken",
    "apikey",
    "airesponse",
    "authorization",
    "cookie",
    "cookies",
    "documentlines",
    "email",
    "financialdata",
    "financialpayload",
    "headers",
    "iban",
    "idtoken",
    "nif",
    "password",
    "passwordhash",
    "privatekey",
    "prompt",
    "rawpayload",
    "refreshtoken",
    "response",
    "secret",
    "stack",
    "stacktrace",
    "token",
]);
const BLOCKED_CONTEXT_KEY_SUFFIXES = Object.freeze([
    "authorization",
    "cookie",
    "credential",
    "email",
    "emailaddress",
    "iban",
    "nif",
    "password",
    "privatekey",
    "prompt",
    "rawpayload",
    "secret",
    "stack",
    "token",
]);

/**
 * @typedef {string | number | boolean | null} SafeLogValue
 */

/**
 * @typedef {Record<string, SafeLogValue>} SafeLogContext
 */

/**
 * Normaliza uma chave para comparar variantes como `apiKey`, `api_key` e `api-key`.
 *
 * @param {string} key - Chave recebida no contexto do log.
 * @returns {string} Chave normalizada para a politica de seguranca.
 */
function normalizeContextKey(key) {
    return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Confirma que uma chave de contexto pode ser escrita no log operacional.
 *
 * @param {string} key - Chave original recebida.
 * @returns {void}
 * @throws {Error} Quando a chave pode expor segredo, identificador sensivel ou payload bruto.
 */
function assertSafeContextKey(key) {
    const normalizedKey = normalizeContextKey(key);

    // Comparar a chave normalizada evita que variações de escrita contornem a denylist.
    if (
        BLOCKED_CONTEXT_KEYS.has(normalizedKey) ||
        BLOCKED_CONTEXT_KEY_SUFFIXES.some((suffix) =>
            normalizedKey.endsWith(suffix),
        )
    ) {
        throw new Error(`Campo proibido em contexto de log: ${key}`);
    }
}

/**
 * Cria um evento de log seguro para a API OPSA.
 *
 * @param {{ level: string, event: string, module: string, requirement: string, context?: SafeLogContext }} input - Dados minimos do evento.
 * @returns {{ timestamp: string, level: string, event: string, module: string, requirement: string, context: SafeLogContext }} Evento normalizado.
 * @throws {Error} Quando nivel, campos obrigatorios ou contexto violam RNF28.
 */
export function createStructuredLogEvent(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new Error("Evento de log invalido.");
    }

    const { level, event, module, requirement, context = {} } = input;

    if (!ALLOWED_LEVELS.has(level)) {
        throw new Error("Nivel de log invalido.");
    }
    if (
        typeof event !== "string" ||
        typeof module !== "string" ||
        typeof requirement !== "string" ||
        !event.trim() ||
        !module.trim() ||
        !requirement.trim()
    ) {
        throw new Error("Evento, modulo e requisito sao obrigatorios.");
    }
    if (typeof context !== "object" || context === null || Array.isArray(context)) {
        throw new Error("Contexto de log invalido.");
    }

    const safeContext = {};
    for (const [key, value] of Object.entries(context)) {
        assertSafeContextKey(key);

        if (
            value !== null &&
            typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
        ) {
            throw new Error(`Valor invalido em contexto de log: ${key}`);
        }

        // O contexto fica limitado a metadados simples para nao esconder payloads financeiros.
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
 * Escreve um evento validado na consola usando o metodo apropriado para o nivel.
 *
 * @param {ReturnType<typeof createStructuredLogEvent>} event - Evento ja criado por `createStructuredLogEvent`.
 * @returns {void}
 */
export function writeStructuredLog(event) {
    const serialized = JSON.stringify(event);

    if (event.level === "error") {
        console.error(serialized);
        return;
    }
    if (event.level === "warn") {
        console.warn(serialized);
        return;
    }

    // `audit` fica pesquisavel em stdout sem ser tratado como erro tecnico da API.
    console.info(serialized);
}
