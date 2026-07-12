/**
 * @file Prova HTTP persistida do fluxo crítico de autenticação da Fase 1.
 *
 * Este teste usa PostgreSQL, Redis e SMTP sandbox reais. A ausência de qualquer
 * dependência falha explicitamente: não existe skip nem fallback local. Todos
 * os dados têm um prefixo aleatório e são removidos no fim do cenário.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import crypto, { randomUUID } from "node:crypto";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { createClient } from "redis";
import request from "supertest";

import { loadApiEnv } from "../../src/config/env.js";
import { createEmailOutbox } from "../../src/runtimeDependencies.js";
import { createApp } from "../../src/server.js";
import { createRedisRateLimiter } from "../../src/modules/auth/redisRateLimit.js";
import { decryptEmailOutboxPayload } from "../../src/modules/notifications/emailOutboxCrypto.js";
import { createEmailOutboxWorker } from "../../src/modules/notifications/emailOutboxWorker.js";
import { buildSmtpEmailProvider } from "../../src/modules/notifications/smtpEmailProvider.js";

const apiRoot = fileURLToPath(new URL("../..", import.meta.url));
const REQUIRED_ENVIRONMENT = Object.freeze([
    "TEST_DATABASE_URL",
    "REDIS_URL",
    "REDIS_KEY_PREFIX",
    "RATE_LIMIT_HMAC_KEY",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "EMAIL_FROM",
    "EMAIL_OUTBOX_ENCRYPTION_KEY",
    "APP_BASE_URL",
]);

/**
 * Exige todas as dependências remotas do gate sem revelar os respetivos valores.
 *
 * @param {NodeJS.ProcessEnv} env - Ambiente do processo de teste.
 * @returns {Record<string, string>} Valores presentes, indexados pelo nome.
 */
function requireIntegrationEnvironment(env) {
    const missing = REQUIRED_ENVIRONMENT.filter(
        (name) => typeof env[name] !== "string" || env[name].trim() === "",
    );
    if (missing.length > 0) {
        throw new Error(
            `Gate HTTP persistido requer variáveis de teste: ${missing.join(", ")}.`,
        );
    }
    if (env.SMTP_SECURE !== "true" && env.SMTP_SECURE !== "false") {
        throw new Error("SMTP_SECURE deve ser explicitamente true ou false no gate.");
    }
    return Object.fromEntries(
        REQUIRED_ENVIRONMENT.map((name) => [name, env[name].trim()]),
    );
}

/**
 * Impede que migrations ou cleanup sejam executados numa base sem marca de teste.
 *
 * @param {string} testDatabaseUrl - URL dedicada recebida no ambiente.
 * @param {string | undefined} applicationDatabaseUrl - URL normal da aplicação.
 * @returns {void}
 */
function assertSafeTestDatabaseUrl(testDatabaseUrl, applicationDatabaseUrl) {
    let parsed;
    try {
        parsed = new URL(testDatabaseUrl);
    } catch {
        throw new Error("TEST_DATABASE_URL não é uma URL PostgreSQL válida.");
    }
    if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
        throw new Error("TEST_DATABASE_URL deve usar PostgreSQL.");
    }
    if (isLoopbackHost(parsed.hostname)) {
        throw new Error("TEST_DATABASE_URL deve apontar para PostgreSQL remoto dedicado.");
    }
    const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    if (!/(^|[_-])(test|audit|ci)([_-]|$)/i.test(databaseName)) {
        throw new Error(
            "TEST_DATABASE_URL deve identificar uma base efémera com test, audit ou ci no nome.",
        );
    }
    if (applicationDatabaseUrl) {
        let applicationUrl;
        try {
            applicationUrl = new URL(applicationDatabaseUrl);
        } catch {
            throw new Error("DATABASE_URL configurada não é válida.");
        }
        const targetIdentity = (url) =>
            `${url.hostname}:${url.port || "5432"}${url.pathname}` +
            `?schema=${url.searchParams.get("schema") || "public"}`;
        if (targetIdentity(applicationUrl) === targetIdentity(parsed)) {
            throw new Error("TEST_DATABASE_URL não pode coincidir com DATABASE_URL.");
        }
    }
}

/**
 * Reconhece endereços de loopback sem depender de resolução DNS.
 *
 * @param {string} host - Hostname já separado da porta.
 * @returns {boolean} `true` para nomes e endereços de loopback óbvios.
 */
function isLoopbackHost(host) {
    const normalized = host.trim().toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
    return (
        normalized === "localhost" ||
        normalized === "::1" ||
        normalized === "0.0.0.0" ||
        normalized.startsWith("127.")
    );
}

/**
 * Exige Redis remoto e um protocolo suportado pelo cliente oficial.
 *
 * @param {string} redisUrl - URL Redis dedicada ao teste.
 * @returns {void}
 */
function assertRemoteRedisUrl(redisUrl) {
    let parsed;
    try {
        parsed = new URL(redisUrl);
    } catch {
        throw new Error("REDIS_URL não é uma URL Redis válida.");
    }
    if (parsed.protocol !== "redis:" && parsed.protocol !== "rediss:") {
        throw new Error("REDIS_URL deve usar redis:// ou rediss://.");
    }
    if (isLoopbackHost(parsed.hostname)) {
        throw new Error("REDIS_URL deve apontar para Redis remoto dedicado.");
    }
}

/**
 * Exige SMTP remoto para reduzir o risco de uma falsa prova contra um mock local.
 * O operador continua responsável por fornecer uma conta sandbox dedicada.
 *
 * @param {string} host - Host SMTP configurado.
 * @returns {void}
 */
function assertRemoteSmtpHost(host) {
    if (isLoopbackHost(host)) {
        throw new Error("SMTP_HOST deve apontar para o sandbox remoto dedicado.");
    }
}

/**
 * Aplica migrations sem deixar stdout/stderr revelar configuração externa.
 *
 * @param {string} databaseUrl - Base efémera validada.
 * @returns {void}
 */
function runMigrations(databaseUrl) {
    try {
        execFileSync("npx", ["prisma", "migrate", "deploy"], {
            cwd: apiRoot,
            env: { ...process.env, DATABASE_URL: databaseUrl },
            stdio: "pipe",
        });
    } catch {
        throw new Error("Falhou a aplicação de migrations na base de teste dedicada.");
    }
}

/**
 * Gera um NIF português válido e específico do cenário.
 *
 * @param {string} scenarioId - Identificador hexadecimal aleatório.
 * @returns {string} NIF com checksum válido.
 */
function buildScenarioNif(scenarioId) {
    const digits = `5${[...scenarioId.slice(0, 7)]
        .map((character) => Number.parseInt(character, 16) % 10)
        .join("")}`;
    const sum = [...digits].reduce(
        (total, digit, index) => total + Number(digit) * (9 - index),
        0,
    );
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? 0 : 11 - remainder;
    return `${digits}${checkDigit}`;
}

/**
 * Extrai um token do fragmento de uma URL presente no corpo cifrado do email.
 * A função nunca inclui o corpo ou o token nas mensagens de erro.
 *
 * @param {object} payload - Payload autenticado proveniente da outbox.
 * @param {string} expectedPath - Path que identifica o tipo de ligação.
 * @returns {string} Token mantido apenas em memória.
 */
function extractFragmentToken(payload, expectedPath) {
    if (typeof payload?.text !== "string") {
        throw new Error("Email transacional sem corpo textual válido.");
    }
    const urls = payload.text.match(/https?:\/\/[^\s]+/g) ?? [];
    for (const candidate of urls) {
        let parsed;
        try {
            parsed = new URL(candidate);
        } catch {
            continue;
        }
        if (parsed.pathname !== expectedPath) continue;
        const token = new URLSearchParams(parsed.hash.slice(1)).get("token");
        if (typeof token === "string" && token.length >= 32) return token;
    }
    throw new Error("Email transacional sem fragment token válido.");
}

/**
 * Confirma que o token em memória corresponde ao hash persistido sem o imprimir.
 *
 * @param {string} token - Token bruto temporário.
 * @param {string} expectedHash - Hash SHA-256 persistido.
 * @returns {void}
 */
function assertTokenMatchesHash(token, expectedHash) {
    const actual = crypto.createHash("sha256").update(token).digest();
    const expected = Buffer.from(String(expectedHash), "hex");
    assert.ok(
        expected.length === actual.length && crypto.timingSafeEqual(actual, expected),
        "O token desencriptado não corresponde ao hash persistido.",
    );
}

/**
 * Confirma estado HTTP sem anexar request/response, emails ou tokens ao erro.
 *
 * @param {import("supertest").Response} response - Resposta recebida.
 * @param {number} expectedStatus - Código esperado.
 * @param {string} operation - Nome não sensível do passo.
 * @returns {void}
 */
function assertHttpStatus(response, expectedStatus, operation) {
    assert.ok(
        response.status === expectedStatus,
        `${operation} devolveu um estado HTTP inesperado.`,
    );
}

/**
 * Remove todas as chaves Redis criadas sob o prefixo aleatório do cenário.
 *
 * @param {import("redis").RedisClientType | null} client - Cliente ligado.
 * @param {string} prefix - Prefixo exclusivo do teste.
 * @returns {Promise<void>}
 */
async function cleanupRedis(client, prefix) {
    if (!client?.isOpen) return;
    const keys = [];
    for await (const keyOrKeys of client.scanIterator({
        MATCH: `${prefix}:*`,
        COUNT: 100,
    })) {
        keys.push(...(Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]));
    }
    for (const key of keys) await client.del(key);
}

/**
 * Descobre e remove apenas os registos identificáveis pelo prefixo do cenário.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente da base de teste.
 * @param {{ emails: string[], companyName: string, nif: string }} scenario - Marcadores únicos.
 * @returns {Promise<void>}
 */
async function cleanupPersistedScenario(prisma, scenario) {
    const users = await prisma.user.findMany({
        where: { email: { in: scenario.emails } },
        select: { id: true },
    });
    const userIds = users.map(({ id }) => id);
    const companies = await prisma.company.findMany({
        where: { OR: [{ name: scenario.companyName }, { nif: scenario.nif }] },
        select: { id: true },
    });
    const companyIds = companies.map(({ id }) => id);
    const invitations = await prisma.companyInvitation.findMany({
        where: {
            OR: [
                { companyId: { in: companyIds } },
                { email: { in: scenario.emails } },
            ],
        },
        select: { id: true },
    });
    const resetTokens = userIds.length
        ? await prisma.passwordResetToken.findMany({
              where: { userId: { in: userIds } },
              select: { tokenHash: true },
          })
        : [];
    const outboxSelectors = [
        ...invitations.map(({ id }) => ({
            dedupeKey: { startsWith: `company-invitation:${id}:` },
        })),
        ...resetTokens.map(({ tokenHash }) => ({
            dedupeKey: `password-reset:${tokenHash}`,
        })),
    ];

    if (outboxSelectors.length) {
        await prisma.emailOutbox.deleteMany({ where: { OR: outboxSelectors } });
    }
    if (companyIds.length) {
        await prisma.auditLog.deleteMany({ where: { companyId: { in: companyIds } } });
        await prisma.companyInvitation.deleteMany({
            where: { companyId: { in: companyIds } },
        });
        await prisma.companyMembership.deleteMany({
            where: { companyId: { in: companyIds } },
        });
        await prisma.companyProfile.deleteMany({
            where: { companyId: { in: companyIds } },
        });
        await prisma.company.deleteMany({ where: { id: { in: companyIds } } });
    }
    if (userIds.length) {
        await prisma.securityAuditEvent.deleteMany({
            where: { actorUserId: { in: userIds } },
        });
        await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.passwordResetToken.deleteMany({
            where: { userId: { in: userIds } },
        });
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
}

test(
    "HTTP persistido: registo, onboarding, convite SMTP, aceitação e reset revogam sessões",
    { timeout: 120_000 },
    async () => {
        const configured = requireIntegrationEnvironment(process.env);
        assertSafeTestDatabaseUrl(
            configured.TEST_DATABASE_URL,
            process.env.DATABASE_URL,
        );
        assertRemoteRedisUrl(configured.REDIS_URL);
        assertRemoteSmtpHost(configured.SMTP_HOST);

        const previousDatabaseUrl = process.env.DATABASE_URL;
        process.env.DATABASE_URL = configured.TEST_DATABASE_URL;

        const scenarioId = randomUUID().replaceAll("-", "").slice(0, 12);
        const scenario = {
            emails: [
                `opsa-e2e-a-${scenarioId}@example.test`,
                `opsa-e2e-b-${scenarioId}@example.test`,
            ],
            companyName: `OPSA E2E ${scenarioId}`,
            nif: buildScenarioNif(scenarioId),
        };
        const redisPrefix = `${configured.REDIS_KEY_PREFIX}:auth-http-e2e:${scenarioId}`;
        const firstPassword = `Fase1-A-${scenarioId}!`;
        const secondPassword = `Fase1-B-${scenarioId}!`;
        const replacementPassword = `Fase1-C-${scenarioId}!`;

        let prisma = null;
        let redisClient = null;
        let primaryError = null;
        try {
            runMigrations(configured.TEST_DATABASE_URL);
            const { PrismaClient } = await import("@prisma/client");
            prisma = new PrismaClient();
            try {
                await prisma.$connect();
            } catch {
                throw new Error("Não foi possível ligar à base PostgreSQL de teste.");
            }

            redisClient = createClient({ url: configured.REDIS_URL });
            redisClient.on("error", () => {});
            try {
                await redisClient.connect();
            } catch {
                throw new Error("Não foi possível ligar ao Redis de teste.");
            }

            const pendingOutbox = await prisma.emailOutbox.count({
                where: { status: { in: ["PENDING", "PROCESSING"] } },
            });
            assert.ok(
                pendingOutbox === 0,
                "A base efémera contém mensagens pendentes de outro cenário.",
            );

            const apiEnv = loadApiEnv({
                ...process.env,
                NODE_ENV: "test",
                DATABASE_URL: configured.TEST_DATABASE_URL,
            });
            const emailOutbox = createEmailOutbox({
                encryptionKey: configured.EMAIL_OUTBOX_ENCRYPTION_KEY,
            });
            const rateLimiter = createRedisRateLimiter({
                client: redisClient,
                hmacKey: configured.RATE_LIMIT_HMAC_KEY,
                prefix: redisPrefix,
            });
            const smtpProvider = buildSmtpEmailProvider(apiEnv.smtp);
            try {
                await smtpProvider.verify();
            } catch {
                throw new Error("O sandbox SMTP não aceitou a ligação autenticada.");
            }
            const emailWorker = createEmailOutboxWorker({
                prisma,
                provider: smtpProvider,
                encryptionKey: configured.EMAIL_OUTBOX_ENCRYPTION_KEY,
                logger: { info() {}, warn() {} },
            });
            const app = createApp({
                prisma,
                apiEnv,
                rateLimiter,
                emailOutbox,
                redisClient,
                objectStorage: {
                    checkHealth: async () => ({ ok: true }),
                },
            });

            const actorA = request.agent(app);
            const registerA = await actorA.post("/api/auth/register").send({
                email: scenario.emails[0],
                password: firstPassword,
                name: "Ator A",
            });
            assertHttpStatus(registerA, 201, "Registo do utilizador A");

            const onboarding = await actorA.post("/api/onboarding/company").send({
                name: scenario.companyName,
                profile: {
                    legalName: scenario.companyName,
                    nif: scenario.nif,
                    addressLine1: "Rua de Teste 1",
                    postalCode: "1000-001",
                    city: "Lisboa",
                    country: "PT",
                    currency: "EUR",
                    fiscalYearStartMonth: 1,
                    fiscalYearStartDay: 1,
                },
            });
            assertHttpStatus(onboarding, 201, "Onboarding transacional");
            const companyId = onboarding.body?.company?.id;
            assert.ok(typeof companyId === "string", "Onboarding sem empresa persistida.");

            const persistedOnboarding = await prisma.company.findUnique({
                where: { id: companyId },
                include: {
                    profile: true,
                    memberships: true,
                    auditLogs: {
                        where: { action: "company.onboarding.create" },
                    },
                },
            });
            assert.ok(
                persistedOnboarding?.profile &&
                    persistedOnboarding.memberships.length === 1 &&
                    persistedOnboarding.memberships[0].role === "ADMIN" &&
                    persistedOnboarding.auditLogs.length === 1,
                "Onboarding não persistiu empresa, perfil, ADMIN e auditoria atomicamente.",
            );

            const invite = await actorA.post("/api/company/invitations").send({
                email: scenario.emails[1],
                role: "CONTABILISTA",
            });
            assertHttpStatus(invite, 201, "Criação do convite");
            const invitationId = invite.body?.invitation?.id;
            assert.ok(typeof invitationId === "string", "Convite sem identificador.");

            const invitationOutbox = await prisma.emailOutbox.findFirst({
                where: {
                    type: "COMPANY_INVITATION",
                    dedupeKey: {
                        startsWith: `company-invitation:${invitationId}:`,
                    },
                },
            });
            assert.ok(
                typeof invitationOutbox?.encryptedPayload === "string",
                "Convite não foi persistido cifrado na outbox.",
            );
            const encryptedInvitationEnvelope = invitationOutbox.encryptedPayload;
            assert.ok(await emailWorker.runOnce(), "Worker não reclamou o convite.");
            const sentInvitation = await prisma.emailOutbox.findUnique({
                where: { id: invitationOutbox.id },
            });
            assert.ok(
                sentInvitation?.status === "SENT" &&
                    sentInvitation.sentAt instanceof Date &&
                    sentInvitation.attempts === 1 &&
                    sentInvitation.lastError === null &&
                    sentInvitation.encryptedPayload === null,
                "Convite não foi aceite pelo SMTP ou não eliminou o payload temporário.",
            );

            const actorB = request.agent(app);
            const registerB = await actorB.post("/api/auth/register").send({
                email: scenario.emails[1],
                password: secondPassword,
                name: "Ator B",
            });
            assertHttpStatus(registerB, 201, "Registo do utilizador B");
            const userBId = registerB.body?.user?.id;
            assert.ok(typeof userBId === "string", "Registo B sem utilizador.");

            const invitationMessage = decryptEmailOutboxPayload(
                encryptedInvitationEnvelope,
                configured.EMAIL_OUTBOX_ENCRYPTION_KEY,
            );
            assert.ok(
                invitationMessage.reason === "COMPANY_INVITATION" &&
                    invitationMessage.to === scenario.emails[1],
                "Payload cifrado do convite não corresponde ao cenário.",
            );
            const invitationToken = extractFragmentToken(
                invitationMessage,
                "/aceitar-convite",
            );
            assert.ok(
                !JSON.stringify(invite.body).includes(invitationToken),
                "A resposta HTTP do convite expôs o token temporário.",
            );
            const persistedInvitation = await prisma.companyInvitation.findUnique({
                where: { id: invitationId },
                select: { tokenHash: true },
            });
            assert.ok(persistedInvitation, "Convite não persistido.");
            assertTokenMatchesHash(invitationToken, persistedInvitation.tokenHash);

            const preview = await request(app)
                .post("/api/invitations/preview")
                .send({ token: invitationToken });
            assertHttpStatus(preview, 200, "Preview do convite");
            assert.ok(
                preview.body?.invitation?.role === "CONTABILISTA" &&
                    typeof preview.body?.invitation?.emailMasked === "string" &&
                    preview.body.invitation.emailMasked !== scenario.emails[1],
                "Preview do convite sem contexto seguro.",
            );

            const accept = await actorB
                .post("/api/invitations/accept")
                .send({ token: invitationToken });
            assertHttpStatus(accept, 200, "Aceitação do convite");
            assert.ok(
                accept.body?.context?.companyId === companyId &&
                    accept.body?.context?.role === "CONTABILISTA",
                "Aceitação não ativou a membership esperada.",
            );

            const switchCompany = await actorB
                .post("/api/session/company")
                .send({ companyId });
            assertHttpStatus(switchCompany, 200, "Troca explícita de empresa");
            const companyContext = await actorB.get("/api/session/context");
            assertHttpStatus(companyContext, 200, "Leitura do contexto ativo");
            assert.ok(
                companyContext.body?.context?.companyId === companyId,
                "A empresa ativa não foi persistida na sessão.",
            );

            const secondActorB = request.agent(app);
            const secondLogin = await secondActorB.post("/api/auth/login").send({
                email: scenario.emails[1],
                password: secondPassword,
            });
            assertHttpStatus(secondLogin, 200, "Segunda sessão do utilizador B");
            const previousSessions = await prisma.session.findMany({
                where: { userId: userBId, revokedAt: null },
                select: { id: true },
            });
            assert.ok(
                previousSessions.length >= 2,
                "O cenário não criou duas sessões anteriores ao reset.",
            );

            const forgot = await actorB.post("/api/auth/password/forgot").send({
                email: scenario.emails[1],
            });
            assertHttpStatus(forgot, 200, "Pedido de recuperação");
            const resetRecord = await prisma.passwordResetToken.findFirst({
                where: { userId: userBId, usedAt: null },
                orderBy: { createdAt: "desc" },
            });
            assert.ok(resetRecord, "Pedido de recuperação sem token persistido.");
            const resetOutbox = await prisma.emailOutbox.findUnique({
                where: { dedupeKey: `password-reset:${resetRecord.tokenHash}` },
            });
            assert.ok(
                typeof resetOutbox?.encryptedPayload === "string",
                "Recuperação não foi persistida cifrada na outbox.",
            );
            const encryptedResetEnvelope = resetOutbox.encryptedPayload;
            assert.ok(await emailWorker.runOnce(), "Worker não reclamou a recuperação.");
            const sentReset = await prisma.emailOutbox.findUnique({
                where: { id: resetOutbox.id },
            });
            assert.ok(
                sentReset?.status === "SENT" &&
                    sentReset.sentAt instanceof Date &&
                    sentReset.attempts === 1 &&
                    sentReset.lastError === null &&
                    sentReset.encryptedPayload === null,
                "Recuperação não foi aceite pelo SMTP ou não eliminou o payload temporário.",
            );

            const resetMessage = decryptEmailOutboxPayload(
                encryptedResetEnvelope,
                configured.EMAIL_OUTBOX_ENCRYPTION_KEY,
            );
            assert.ok(
                resetMessage.reason === "PASSWORD_RESET" &&
                    resetMessage.to === scenario.emails[1],
                "Payload cifrado da recuperação não corresponde ao cenário.",
            );
            const resetToken = extractFragmentToken(
                resetMessage,
                "/recuperar-password",
            );
            assert.ok(
                !JSON.stringify(forgot.body).includes(resetToken),
                "A resposta HTTP de recuperação expôs o token temporário.",
            );
            assertTokenMatchesHash(resetToken, resetRecord.tokenHash);

            const reset = await actorB.post("/api/auth/password/reset").send({
                token: resetToken,
                password: replacementPassword,
            });
            assertHttpStatus(reset, 200, "Reposição da password");

            const revokedByCookie = await actorB.get("/api/auth/me");
            const secondRevokedByCookie = await secondActorB.get("/api/auth/me");
            assertHttpStatus(revokedByCookie, 401, "Revogação da primeira sessão");
            assertHttpStatus(secondRevokedByCookie, 401, "Revogação da segunda sessão");
            const revokedSessions = await prisma.session.count({
                where: {
                    id: { in: previousSessions.map(({ id }) => id) },
                    revokedAt: { not: null },
                },
            });
            assert.ok(
                revokedSessions === previousSessions.length,
                "Nem todas as sessões anteriores foram revogadas.",
            );

            const oldPasswordLogin = await request(app).post("/api/auth/login").send({
                email: scenario.emails[1],
                password: secondPassword,
            });
            assertHttpStatus(oldPasswordLogin, 401, "Invalidação da password anterior");
            const freshActorB = request.agent(app);
            const freshLogin = await freshActorB.post("/api/auth/login").send({
                email: scenario.emails[1],
                password: replacementPassword,
            });
            assertHttpStatus(freshLogin, 200, "Login com a nova password");
            const freshSession = await freshActorB.get("/api/auth/me");
            assertHttpStatus(freshSession, 200, "Nova sessão após recuperação");
            const actorAStillActive = await actorA.get("/api/auth/me");
            assertHttpStatus(actorAStillActive, 200, "Isolamento das sessões do utilizador A");
        } catch (error) {
            primaryError = error;
            throw error;
        } finally {
            let cleanupFailed = false;
            if (prisma) {
                try {
                    await cleanupPersistedScenario(prisma, scenario);
                } catch {
                    cleanupFailed = true;
                }
            }
            try {
                await cleanupRedis(redisClient, redisPrefix);
            } catch {
                cleanupFailed = true;
            }
            const closeResults = await Promise.allSettled([
                redisClient?.isOpen ? redisClient.quit() : Promise.resolve(),
                prisma ? prisma.$disconnect() : Promise.resolve(),
            ]);
            if (closeResults.some((result) => result.status === "rejected")) {
                cleanupFailed = true;
            }
            if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
            else process.env.DATABASE_URL = previousDatabaseUrl;
            if (cleanupFailed && !primaryError) {
                throw new Error("Falhou o cleanup isolado do cenário HTTP persistido.");
            }
        }
    },
);
