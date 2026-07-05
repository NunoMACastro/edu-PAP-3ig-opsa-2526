// apps/api/tests/contracts/mf8-alert-preferences.contract.test.js
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildNotificationRoutes } from "../../src/modules/notifications/notificationRoutes.js";
import {
    listAlertPreferences,
    parseAlertPreferenceBody,
    setAlertPreference,
} from "../../src/modules/notifications/alertPreferenceService.js";

/**
 * Cria um mock mínimo do Prisma para testar o contrato do BK.
 *
 * @param {{ storedPreferences?: Array<object> }} options - Preferências já existentes.
 * @returns {object} Mock com os métodos usados pelo service.
 */
function createPreferencePrismaMock({ storedPreferences = [] } = {}) {
    return {
        alertPreference: {
            findMany: async () => storedPreferences,
            upsert: async ({ create, update }) => ({
                id: "pref-1",
                ...create,
                ...update,
                updatedAt: new Date("2026-07-02T10:00:00.000Z"),
            }),
        },
    };
}

/**
 * Verifica se uma route existe no router Express.
 *
 * @param {import("express").Router} router - Router montado pelo módulo.
 * @param {string} method - Método HTTP esperado.
 * @param {string} path - Caminho esperado.
 * @returns {boolean} `true` quando o router expõe a route.
 */
function routeExists(router, method, path) {
    return router.stack.some(
        (layer) =>
            layer.route?.path === path &&
            Boolean(layer.route.methods?.[method.toLowerCase()]),
    );
}

describe("MF8 alert preferences contract", () => {
    it("lista defaults e preferências guardadas para o utilizador da empresa ativa", async () => {
        const prisma = createPreferencePrismaMock({
            storedPreferences: [
                {
                    type: "ai",
                    enabled: false,
                    updatedAt: new Date("2026-07-02T09:00:00.000Z"),
                },
            ],
        });

        const preferences = await listAlertPreferences(prisma, {
            companyId: "company-1",
            userId: "user-1",
        });

        // A API devolve todos os tipos conhecidos, mesmo quando a maioria vem de defaults.
        assert.equal(preferences.some((preference) => preference.type === "stock"), true);
        assert.deepEqual(
            preferences.find((preference) => preference.type === "ai"),
            {
                type: "ai",
                label: "Sugestões assistidas",
                enabled: false,
                defaultEnabled: true,
                canDisable: true,
                source: "stored",
                updatedAt: "2026-07-02T09:00:00.000Z",
            },
        );
    });

    it("guarda preferências configuráveis por empresa, utilizador e tipo", async () => {
        const prisma = createPreferencePrismaMock();

        const preference = await setAlertPreference(prisma, {
            companyId: "company-1",
            userId: "user-1",
            type: "stock",
            enabled: false,
        });

        assert.equal(preference.type, "stock");
        assert.equal(preference.enabled, false);
        assert.equal(preference.source, "stored");
    });

    it("rejeita bodies inválidos e desativação de alertas obrigatórios", async () => {
        const prisma = createPreferencePrismaMock();

        // O body inválido falha antes da persistência, protegendo o contrato público.
        assert.throws(
            () => parseAlertPreferenceBody({ enabled: "false" }),
            /enabled deve ser booleano/,
        );

        // Alertas obrigatórios continuam ativos mesmo que um cliente tente silenciá-los.
        await assert.rejects(
            () =>
                setAlertPreference(prisma, {
                    companyId: "company-1",
                    userId: "user-1",
                    type: "security",
                    enabled: false,
                }),
            /não pode ser desativado/,
        );
    });

    it("expõe as routes protegidas de preferências no router de notificações", () => {
        const prisma = createPreferencePrismaMock();
        const router = buildNotificationRoutes({ prisma });

        assert.equal(routeExists(router, "GET", "/preferences"), true);
        assert.equal(routeExists(router, "PATCH", "/preferences/:type"), true);
    });
});