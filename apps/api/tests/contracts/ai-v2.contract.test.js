/**
 * @file Contratos estruturais da reestruturação integral da IA OPSA.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("schema e migrations persistem chat cifrado, consentimento, settings, usage e leases", async () => {
    const [schema, migration, hardening] = await Promise.all([
        read("../../prisma/schema.prisma"),
        read("../../prisma/migrations/20260711120000_ai_restructure/migration.sql"),
        read("../../prisma/migrations/20260712210000_ai_hardening/migration.sql"),
    ]);
    for (const model of ["CompanyAiSettings", "AiUserConsent", "AiChatSession", "AiChatMessage", "AiUsageEvent", "AiRuleSetting", "AiAnalysisRun", "AiDeletionAudit"]) {
        assert.match(schema, new RegExp(`model ${model}\\b`));
        assert.match(migration, new RegExp(`CREATE TABLE "${model}"`));
    }
    assert.match(schema, /payloadEncrypted\s+String\s+@db\.Text/);
    assert.match(schema, /expiresAt\s+DateTime/);
    for (const field of ["attempts", "nextAttemptAt", "leaseExpiresAt", "lastHeartbeatAt", "scheduleBucket"]) {
        assert.match(schema, new RegExp(`${field}\\s+`));
        assert.match(hardening, new RegExp(field));
    }
});

test("router expõe APIs canónicas, SSE e adapter depreciado", async () => {
    const routes = await read("../../src/modules/ai/aiRoutes.js");
    for (const fragment of [
        '"/analysis-runs"', '"/insights"', '"/suggestions"', '"/alerts"',
        '"/settings"', '"/capabilities"', '"/consent"', '"/chat/sessions"',
        '"/chat/sessions/:id/messages"', '"/chat/messages/:id/feedback"', '"/questions"',
    ]) assert.match(routes, new RegExp(fragment.replace(/[/:]/g, "\\$&")));
    for (const event of ["message.started", "message.completed", "message.failed", "message.cancelled"]) assert.match(routes, new RegExp(event.replace(".", "\\.")));
    assert.doesNotMatch(routes, /message\.delta/);
    assert.match(routes, /signal:\s*abortController\.signal/);
    assert.match(routes, /Deprecation/);
    assert.match(routes, /Sunset/);
});

test("provider usa Responses qualitativa sem tools, histórico ou estado remoto", async () => {
    const provider = await read("../../src/modules/ai/aiChatProvider.js");
    assert.match(provider, /responses\.create/);
    assert.match(provider, /store:\s*false/);
    assert.match(provider, /safety_identifier/);
    assert.match(provider, /canonical/);
    assert.doesNotMatch(provider, /conversations\.create|previous_response_id\s*:|executeTool|function_call|tools\s*:/);
});

test("configuração mantém OpenAI desligada e exige modelo apenas no modo openai", async () => {
    const [envSource, example] = await Promise.all([
        read("../../src/config/env.js"),
        read("../../.env.example"),
    ]);
    assert.match(envSource, /AI_PROVIDER_MODE", "disabled"/);
    assert.match(envSource, /OPENAI_MODEL é obrigatória quando AI_PROVIDER_MODE=openai/);
    assert.doesNotMatch(envSource, /gpt-5\.6-luna/);
    assert.match(example, /AI_PROVIDER_MODE=disabled/);
    assert.match(example, /AI_CHAT_ENABLED=/);
    assert.match(example, /OPENAI_MODEL=\s*$/m);
    assert.match(example, /AI_CHAT_ENCRYPTION_KEY=/);
});
