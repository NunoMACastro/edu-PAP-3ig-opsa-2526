/**
 * @file Testes de contrato BK-MF8-12 para preferências de alertas.
 *
 * Esta suite transforma RNF33 em prova repetível: tipos configuráveis podem
 * ser ativados/desativados por empresa ativa e utilizador, mas `security` fica
 * sempre obrigatório.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { buildNotificationRoutes } from "../../src/modules/notifications/notificationRoutes.js";
import {
    listAlertPreferences,
    parseAlertPreferenceBody,
    setAlertPreference,
} from "../../src/modules/notifications/alertPreferenceService.js";

const COMPANY_ID = "company-mf8-12";
const USER_ID = "user-mf8-12";

/**
 * Cria um double Prisma mínimo para o contrato de preferências.
 *
 * @param {{ storedPreferences?: Array<object> }} options - Preferências já guardadas.
 * @returns {{ calls: object, prisma: object }} Double Prisma e chamadas capturadas.
 */
function createPreferencePrismaDouble({ storedPreferences = [] } = {}) {
    const calls = {
        findMany: [],
        upsert: [],
    };

    return {
        calls,
        prisma: {
            alertPreference: {
                async findMany(args) {
                    calls.findMany.push(args);
                    return storedPreferences;
                },
                async upsert(args) {
                    calls.upsert.push(args);
                    return {
                        id: "pref-mf8-12",
                        ...args.create,
                        ...args.update,
                        updatedAt: new Date("2026-07-06T12:00:00.000Z"),
                    };
                },
            },
        },
    };
}

/**
 * Confirma se o router expõe uma rota esperada.
 *
 * @param {import("express").Router} router - Router Express montado.
 * @param {string} method - Método HTTP esperado.
 * @param {string} path - Caminho esperado.
 * @returns {boolean} `true` quando a rota existe.
 */
function hasRoute(router, method, path) {
    return router.stack.some(
        (layer) =>
            layer.route?.path === path &&
            Boolean(layer.route.methods?.[method.toLowerCase()]),
    );
}

/**
 * Cria um matcher para erros HTTP de domínio.
 *
 * @param {string} code - Código funcional esperado.
 * @returns {(error: Error & { code?: string }) => boolean} Predicado para asserts.
 */
function hasDomainCode(code) {
    /**
     * Confirma que o erro lançado expõe o código de domínio esperado.
     *
     * @param {Error & { code?: string }} error - Erro capturado pelo assert.
     * @returns {boolean} Verdadeiro quando o assert interno passa.
     */
    return function assertDomainCode(error) {
        assert.equal(error.code, code);
        return true;
    };
}

test("BK-MF8-12 lista defaults e preferências guardadas da empresa ativa", async () => {
    const { calls, prisma } = createPreferencePrismaDouble({
        storedPreferences: [
            {
                type: "ai",
                enabled: false,
                updatedAt: new Date("2026-07-06T11:00:00.000Z"),
            },
        ],
    });

    const preferences = await listAlertPreferences(prisma, {
        companyId: COMPANY_ID,
        userId: USER_ID,
    });

    assert.deepEqual(calls.findMany[0], {
        where: { companyId: COMPANY_ID, userId: USER_ID },
    });
    assert.deepEqual(
        preferences.map((preference) => preference.type),
        ["stock", "deadline", "cashflow", "ai", "security"],
    );
    assert.deepEqual(
        preferences.find((preference) => preference.type === "ai"),
        {
            type: "ai",
            label: "Sugestões assistidas",
            enabled: false,
            defaultEnabled: true,
            canDisable: true,
            source: "stored",
            updatedAt: "2026-07-06T11:00:00.000Z",
        },
    );
});

test("BK-MF8-12 grava preferência configurável sem aceitar companyId no body", async () => {
    const { calls, prisma } = createPreferencePrismaDouble();

    const body = parseAlertPreferenceBody({
        enabled: false,
        companyId: "company-forjada",
    });
    const preference = await setAlertPreference(prisma, {
        companyId: COMPANY_ID,
        userId: USER_ID,
        type: "stock",
        enabled: body.enabled,
    });

    assert.equal(preference.type, "stock");
    assert.equal(preference.enabled, false);
    assert.equal(preference.source, "stored");
    assert.deepEqual(calls.upsert[0].where, {
        companyId_userId_type: {
            companyId: COMPANY_ID,
            userId: USER_ID,
            type: "stock",
        },
    });
    assert.equal("company-forjada" in calls.upsert[0].create, false);
});

test("BK-MF8-12 rejeita body inválido, tipo inválido e security desligado", async () => {
    const { prisma } = createPreferencePrismaDouble();

    assert.throws(
        () => parseAlertPreferenceBody({ enabled: "false" }),
        hasDomainCode("ALERT_PREFERENCE_ENABLED_REQUIRED"),
    );

    await assert.rejects(
        () =>
            setAlertPreference(prisma, {
                companyId: COMPANY_ID,
                userId: USER_ID,
                type: "unknown",
                enabled: true,
            }),
        hasDomainCode("ALERT_TYPE_INVALID"),
    );

    await assert.rejects(
        () =>
            setAlertPreference(prisma, {
                companyId: COMPANY_ID,
                userId: USER_ID,
                type: "security",
                enabled: false,
            }),
        hasDomainCode("ALERT_TYPE_MANDATORY"),
    );
});

test("BK-MF8-12 expõe rotas protegidas de preferências no router de notificações", () => {
    const { prisma } = createPreferencePrismaDouble();
    const router = buildNotificationRoutes({ prisma });

    assert.equal(hasRoute(router, "get", "/preferences"), true);
    assert.equal(hasRoute(router, "patch", "/preferences/:type"), true);
    assert.equal(hasRoute(router, "patch", "/:id/read"), true);
});
