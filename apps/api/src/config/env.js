/**
 * @file Configuracao de ambiente da API OPSA.
 *
 * Este modulo centraliza nomes de variaveis e validacoes sem expor valores
 * sensiveis. A aplicacao continua a ler segredos do ambiente, nunca do codigo.
 */

import { parseAiChatEncryptionKey } from "../modules/ai/aiChatCrypto.js";

const DEFAULT_PORT = 3000;
const DEFAULT_APP_BASE_URL = "http://localhost:5173";
const DEFAULT_REDIS_URL = "redis://127.0.0.1:6379";
const DEFAULT_REDIS_KEY_PREFIX = "opsa:development";
const DEFAULT_RATE_LIMIT_HMAC_KEY = "development-only-rate-limit-key-32-bytes";
const DEFAULT_SMTP_HOST = "127.0.0.1";
const DEFAULT_SMTP_PORT = 1025;
const DEFAULT_SMTP_FROM = "OPSA <no-reply@opsa.local>";

/**
 * Le uma variavel com fallback explicito.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente fonte.
 * @param {string} key - Nome da variavel.
 * @param {string | undefined} fallback - Valor por omissao.
 * @returns {string | undefined} Valor normalizado.
 */
function readEnv(env, key, fallback = undefined) {
    const value = env[key];
    if (typeof value !== "string" || value.trim() === "") {
        return fallback;
    }
    return value.trim();
}

/**
 * Converte porta de texto para inteiro seguro.
 *
 * @param {string | undefined} value - Valor recebido por ambiente.
 * @returns {number} Porta normalizada.
 */
function parsePort(value) {
    const parsed = Number.parseInt(value ?? String(DEFAULT_PORT), 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error("PORT deve estar entre 1 e 65535.");
    }
    return parsed;
}

/**
 * Converte um inteiro de configuração dentro de limites seguros.
 *
 * @param {string | undefined} value - Valor textual.
 * @param {{ name: string, fallback: number, min: number, max: number }} options - Contrato numérico.
 * @returns {number} Inteiro validado.
 */
function parseBoundedInteger(value, options) {
    const parsed = Number.parseInt(value ?? String(options.fallback), 10);
    if (!Number.isInteger(parsed) || parsed < options.min || parsed > options.max) {
        throw new Error(`${options.name} deve estar entre ${options.min} e ${options.max}.`);
    }
    return parsed;
}

/**
 * Lê booleanos de ambiente sem aceitar valores ambíguos.
 *
 * @param {string | undefined} value - Valor recebido.
 * @param {boolean} fallback - Valor por omissão.
 * @returns {boolean} Booleano validado.
 */
function parseBoolean(value, fallback = false) {
    if (value === undefined) return fallback;
    if (value === "true") return true;
    if (value === "false") return false;
    throw new Error("Variável booleana deve ser true ou false.");
}

/**
 * Carrega configuracao operacional da API.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente fonte.
 * @returns {{ nodeEnv: string, isProduction: boolean, port: number, appBaseUrl: string, databaseUrlConfigured: boolean }} Configuracao publica segura.
 */
export function loadApiEnv(env = process.env) {
    const nodeEnv = readEnv(env, "NODE_ENV", "development");
    const isProduction = nodeEnv === "production";
    const appBaseUrl = readEnv(env, "APP_BASE_URL", DEFAULT_APP_BASE_URL);
    const databaseUrl = readEnv(env, "DATABASE_URL");
    const redisUrl = readEnv(env, "REDIS_URL", DEFAULT_REDIS_URL);
    const redisKeyPrefix = readEnv(env, "REDIS_KEY_PREFIX", DEFAULT_REDIS_KEY_PREFIX);
    const rateLimitHmacKey = readEnv(
        env,
        "RATE_LIMIT_HMAC_KEY",
        DEFAULT_RATE_LIMIT_HMAC_KEY,
    );
    const emailOutboxEncryptionKey = readEnv(env, "EMAIL_OUTBOX_ENCRYPTION_KEY");
    const smtpHost = readEnv(env, "SMTP_HOST", DEFAULT_SMTP_HOST);
    const smtpFrom = readEnv(env, "EMAIL_FROM", DEFAULT_SMTP_FROM);
    const smtpUser = readEnv(env, "SMTP_USER");
    const smtpPassword = readEnv(env, "SMTP_PASSWORD");
    const smtpSecure = parseBoolean(readEnv(env, "SMTP_SECURE"), false);
    const smtpRequireTls = parseBoolean(readEnv(env, "SMTP_REQUIRE_TLS"), false);
    const aiProviderMode = readEnv(env, "AI_PROVIDER_MODE", "disabled");
    const aiChatEnabledRaw = readEnv(env, "AI_CHAT_ENABLED", isProduction ? undefined : "false");
    const aiChatEnabled = parseBoolean(aiChatEnabledRaw, false);
    const openAiApiKey = readEnv(env, "OPENAI_API_KEY");
    const openAiModel = readEnv(env, "OPENAI_MODEL");
    const aiChatEncryptionKey = readEnv(env, "AI_CHAT_ENCRYPTION_KEY");

    if (!["disabled", "openai"].includes(aiProviderMode)) {
        throw new Error("AI_PROVIDER_MODE deve ser disabled ou openai.");
    }
    if (aiProviderMode === "openai" && !aiChatEnabled) {
        throw new Error("AI_PROVIDER_MODE=openai exige AI_CHAT_ENABLED=true.");
    }
    if (aiProviderMode === "openai" && !openAiApiKey) {
        throw new Error("OPENAI_API_KEY é obrigatória quando AI_PROVIDER_MODE=openai.");
    }
    if (aiProviderMode === "openai" && !openAiModel) {
        throw new Error("OPENAI_MODEL é obrigatória quando AI_PROVIDER_MODE=openai.");
    }
    if (aiChatEnabled && !aiChatEncryptionKey) {
        throw new Error("AI_CHAT_ENCRYPTION_KEY é obrigatória quando o chat está ativo.");
    }
    if (aiChatEnabled) parseAiChatEncryptionKey(aiChatEncryptionKey);
    if (
        aiChatEncryptionKey &&
        emailOutboxEncryptionKey &&
        aiChatEncryptionKey === emailOutboxEncryptionKey
    ) {
        throw new Error("AI_CHAT_ENCRYPTION_KEY não pode reutilizar a chave da outbox de email.");
    }

    if (!appBaseUrl) {
        throw new Error("APP_BASE_URL e obrigatorio.");
    }
    const appUrl = new URL(appBaseUrl);
    if (isProduction && appUrl.protocol !== "https:") {
        throw new Error("APP_BASE_URL deve usar HTTPS em producao.");
    }
    if (isProduction && !databaseUrl) {
        throw new Error("DATABASE_URL e obrigatorio em producao.");
    }
    if (isProduction && !readEnv(env, "REDIS_URL")) {
        throw new Error("REDIS_URL e obrigatorio em producao.");
    }
    if (
        isProduction &&
        (!readEnv(env, "REDIS_KEY_PREFIX") || !readEnv(env, "RATE_LIMIT_HMAC_KEY"))
    ) {
        throw new Error(
            "REDIS_KEY_PREFIX e RATE_LIMIT_HMAC_KEY sao obrigatorios em producao.",
        );
    }
    if (isProduction && !emailOutboxEncryptionKey) {
        throw new Error("EMAIL_OUTBOX_ENCRYPTION_KEY e obrigatoria em producao.");
    }
    if (isProduction && aiChatEnabledRaw === undefined) {
        throw new Error("AI_CHAT_ENABLED é obrigatória em produção.");
    }
    if (isProduction && (!readEnv(env, "SMTP_HOST") || !readEnv(env, "EMAIL_FROM"))) {
        throw new Error("SMTP_HOST e EMAIL_FROM sao obrigatorios em producao.");
    }
    const redisProtocol = new URL(redisUrl).protocol;
    if (redisProtocol !== "redis:" && redisProtocol !== "rediss:") {
        throw new Error("REDIS_URL deve usar redis:// ou rediss://.");
    }
    if (Boolean(smtpUser) !== Boolean(smtpPassword)) {
        throw new Error("SMTP_USER e SMTP_PASSWORD devem ser configurados em conjunto.");
    }
    if (isProduction && !smtpSecure && !smtpRequireTls) {
        throw new Error("SMTP deve exigir TLS em producao.");
    }

    return {
        nodeEnv,
        isProduction,
        port: parsePort(readEnv(env, "PORT")),
        appBaseUrl,
        databaseUrlConfigured: Boolean(databaseUrl),
        trustProxyHops: parseBoundedInteger(readEnv(env, "TRUST_PROXY_HOPS"), {
            name: "TRUST_PROXY_HOPS",
            fallback: 0,
            min: 0,
            max: 10,
        }),
        redisUrl,
        redisKeyPrefix,
        rateLimitHmacKey,
        emailOutboxEncryptionKey,
        notificationWorker: {
            intervalMs: parseBoundedInteger(
                readEnv(env, "NOTIFICATION_WORKER_INTERVAL_MS"),
                {
                    name: "NOTIFICATION_WORKER_INTERVAL_MS",
                    fallback: 300_000,
                    min: 60_000,
                    max: 86_400_000,
                },
            ),
        },
        ai: {
            chatEnabled: aiChatEnabled,
            failClosedRateLimits: isProduction,
            providerMode: aiProviderMode,
            openAiApiKey,
            model: openAiModel || null,
            timeoutMs: parseBoundedInteger(readEnv(env, "OPENAI_TIMEOUT_MS"), {
                name: "OPENAI_TIMEOUT_MS", fallback: 20_000, min: 1_000, max: 120_000,
            }),
            maxOutputTokens: parseBoundedInteger(readEnv(env, "OPENAI_MAX_OUTPUT_TOKENS"), {
                name: "OPENAI_MAX_OUTPUT_TOKENS", fallback: 800, min: 100, max: 4_000,
            }),
            userDailyTurnLimit: parseBoundedInteger(readEnv(env, "AI_USER_DAILY_TURN_LIMIT"), {
                name: "AI_USER_DAILY_TURN_LIMIT", fallback: 50, min: 1, max: 500,
            }),
            companyDailyTurnLimit: parseBoundedInteger(readEnv(env, "AI_COMPANY_DAILY_TURN_LIMIT"), {
                name: "AI_COMPANY_DAILY_TURN_LIMIT", fallback: 500, min: 1, max: 5_000,
            }),
            retentionDays: parseBoundedInteger(readEnv(env, "AI_CHAT_RETENTION_DAYS"), {
                name: "AI_CHAT_RETENTION_DAYS", fallback: 90, min: 1, max: 90,
            }),
            workerIntervalMs: parseBoundedInteger(readEnv(env, "AI_WORKER_INTERVAL_MS"), {
                name: "AI_WORKER_INTERVAL_MS", fallback: 3_600_000, min: 60_000, max: 86_400_000,
            }),
            workerPollIntervalMs: parseBoundedInteger(readEnv(env, "AI_WORKER_POLL_INTERVAL_MS"), {
                name: "AI_WORKER_POLL_INTERVAL_MS", fallback: 5_000, min: 1_000, max: 60_000,
            }),
            workerLeaseMs: parseBoundedInteger(readEnv(env, "AI_WORKER_LEASE_MS"), {
                name: "AI_WORKER_LEASE_MS", fallback: 300_000, min: 30_000, max: 1_800_000,
            }),
            workerMaxAttempts: parseBoundedInteger(readEnv(env, "AI_WORKER_MAX_ATTEMPTS"), {
                name: "AI_WORKER_MAX_ATTEMPTS", fallback: 3, min: 1, max: 10,
            }),
            workerBatchSize: parseBoundedInteger(readEnv(env, "AI_WORKER_BATCH_SIZE"), {
                name: "AI_WORKER_BATCH_SIZE", fallback: 10, min: 1, max: 100,
            }),
            chatEncryptionKey: aiChatEncryptionKey,
            safetyHmacKey: readEnv(env, "AI_SAFETY_HMAC_KEY", rateLimitHmacKey),
            maxActiveSessionsPerUser: 20,
            maxMessagesPerSession: 200,
            messageRateLimit: 5,
            sessionCreateHourlyLimit: 10,
            analysisUserRateLimit: 2,
            analysisCompanyRateLimit: 5,
        },
        smtp: {
            host: smtpHost,
            port: parseBoundedInteger(readEnv(env, "SMTP_PORT"), {
                name: "SMTP_PORT",
                fallback: DEFAULT_SMTP_PORT,
                min: 1,
                max: 65535,
            }),
            secure: smtpSecure,
            requireTls: smtpRequireTls,
            user: smtpUser,
            password: smtpPassword,
            from: smtpFrom,
        },
    };
}
