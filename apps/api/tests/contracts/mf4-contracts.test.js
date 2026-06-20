/**
 * @file Testes de contrato MF4 para permissões, routers e migration.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildAiRoutes } from "../../src/modules/ai/aiRoutes.js";
import { buildAuditLogRoutes } from "../../src/modules/audit/auditLogRoutes.js";
import { buildIntegrationLogRoutes } from "../../src/modules/integrations/integrationLogRoutes.js";
import { buildNotificationRoutes } from "../../src/modules/notifications/notificationRoutes.js";
import { hasPermission, Permission } from "../../src/modules/permissions/permissions.js";
import { buildReminderRoutes } from "../../src/modules/reminders/reminderRoutes.js";
import { buildOperationalTaskRoutes } from "../../src/modules/tasks/taskRoutes.js";

/**
 * Confirma se o router expõe uma rota esperada.
 *
 * @param router - Router Express a inspecionar.
 * @param method - Metodo HTTP esperado.
 * @param path - Caminho esperado.
 * @returns Booleano com existencia da rota.
 */
function hasRoute(router, method, path) {
    return router.stack.some(
        (layer) => layer.route?.path === path && layer.route.methods[method],
    );
}

test("MF4: permissões backend cobrem IA, tarefas, notificações, auditoria e integrações", () => {
    assert.equal(hasPermission("GESTOR", Permission.AI_READ), true);
    assert.equal(hasPermission("CONTABILISTA", Permission.AI_READ), true);
    assert.equal(hasPermission("OPERACIONAL", Permission.AI_READ), false);
    assert.equal(hasPermission("OPERACIONAL", Permission.TASKS_WRITE), true);
    assert.equal(hasPermission("AUDITOR", Permission.AUDIT_READ), true);
    assert.equal(hasPermission("GESTOR", Permission.AUDIT_READ), false);
    assert.equal(hasPermission("ADMIN", Permission.INTEGRATIONS_READ), true);
});

test("MF4: routers principais expõem endpoints canónicos", () => {
    const deps = { prisma: {} };

    assert.equal(hasRoute(buildAiRoutes(deps), "get", "/insights"), true);
    assert.equal(hasRoute(buildAiRoutes(deps), "get", "/insights/:id/explanation"), true);
    assert.equal(hasRoute(buildAiRoutes(deps), "get", "/suggestions"), true);
    assert.equal(hasRoute(buildAiRoutes(deps), "post", "/questions"), true);
    assert.equal(hasRoute(buildAiRoutes(deps), "get", "/alerts"), true);
    assert.equal(hasRoute(buildReminderRoutes(deps), "get", "/"), true);
    assert.equal(hasRoute(buildReminderRoutes(deps), "post", "/"), true);
    assert.equal(hasRoute(buildReminderRoutes(deps), "patch", "/:id"), true);
    assert.equal(hasRoute(buildOperationalTaskRoutes(deps), "get", "/"), true);
    assert.equal(hasRoute(buildOperationalTaskRoutes(deps), "post", "/"), true);
    assert.equal(hasRoute(buildOperationalTaskRoutes(deps), "patch", "/:id/status"), true);
    assert.equal(hasRoute(buildNotificationRoutes(deps), "get", "/"), true);
    assert.equal(hasRoute(buildNotificationRoutes(deps), "post", "/sync"), true);
    assert.equal(hasRoute(buildNotificationRoutes(deps), "patch", "/:id/read"), true);
    assert.equal(hasRoute(buildAuditLogRoutes(deps), "get", "/logs"), true);
    assert.equal(hasRoute(buildIntegrationLogRoutes(deps), "get", "/logs"), true);
});

test("P0-MF4-MIG-01: migration MF4 cria tabelas persistentes da macrofase", () => {
    const migration = readFileSync(
        new URL("../../prisma/migrations/20260618120000_mf4_schema/migration.sql", import.meta.url),
        "utf8",
    );

    assert.match(migration, /CREATE TABLE "AiInsight"/);
    assert.match(migration, /CREATE TABLE "AiActionSuggestion"/);
    assert.match(migration, /CREATE TABLE "AiQuestionRun"/);
    assert.match(migration, /CREATE TABLE "SmartAlert"/);
    assert.match(migration, /CREATE TABLE "Reminder"/);
    assert.match(migration, /CREATE TABLE "OperationalTask"/);
    assert.match(migration, /CREATE TABLE "InAppNotification"/);
    assert.match(migration, /CREATE TABLE "IntegrationLog"/);
    assert.match(migration, /CREATE UNIQUE INDEX "InAppNotification_companyId_userId_sourceType_sourceId_key"/);
});
