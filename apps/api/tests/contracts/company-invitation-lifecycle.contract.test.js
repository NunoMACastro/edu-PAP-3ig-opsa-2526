/**
 * @file Contrato HTTP e de outbox do ciclo autenticado de convites.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { buildCompanyUserRoutes } from "../../src/modules/company-users/companyUserRoutes.js";
import { buildInvitationEmailAdapter } from "../../src/modules/company-users/invitationEmailAdapter.js";

/**
 * Obtém a rota Express pelo método e path declarados.
 *
 * @param {import("express").Router} router - Router em inspeção.
 * @param {string} method - Método HTTP.
 * @param {string} path - Path relativo.
 * @returns {object | undefined} Definição Express encontrada.
 */
function findRoute(router, method, path) {
    return router.stack
        .map((layer) => layer.route)
        .find((route) => route?.path === path && route.methods[method]);
}

test("listagem, reenvio e revogação exigem auth, company context e users.manage", () => {
    const router = buildCompanyUserRoutes({
        prisma: {},
        appBaseUrl: "https://opsa.example.test",
        emailOutbox: { enqueue: async () => ({}) },
    });
    const contracts = [
        ["get", "/invitations", "listInvitations"],
        ["post", "/invitations/:id/resend", "resendInvitation"],
        ["post", "/invitations/:id/revoke", "revokeInvitation"],
    ];

    for (const [method, path, controllerName] of contracts) {
        const route = findRoute(router, method, path);
        assert.ok(route, `${method.toUpperCase()} ${path} deve existir`);
        assert.deepEqual(
            route.stack.map((layer) => layer.handle.name),
            [
                "authMiddleware",
                "companyContextMiddleware",
                "permissionMiddleware",
                controllerName,
            ],
        );
    }
});

test("cada envio usa dedupeKey própria sem incluir o token", async () => {
    const queued = [];
    const adapter = buildInvitationEmailAdapter({
        appBaseUrl: "https://opsa.example.test/",
        emailOutbox: {
            enqueue: async (_tx, message, options) => {
                queued.push({ message, options });
                return { id: `outbox-${queued.length}` };
            },
        },
    });

    for (const suffix of ["first", "resend"]) {
        await adapter.enqueueInvitation({}, {
            invitationId: "invitation-1",
            deliveryId: `delivery-${suffix}`,
            email: "invitee@example.test",
            companyName: "Empresa Segura",
            token: `token-${suffix}`,
        });
    }

    assert.equal(queued.length, 2);
    assert.notEqual(queued[0].options.dedupeKey, queued[1].options.dedupeKey);
    assert.equal(
        queued[0].options.dedupeKey,
        "company-invitation:invitation-1:delivery-first",
    );
    assert.equal(JSON.stringify(queued[0].options).includes("token-first"), false);
    assert.match(queued[1].message.text, /#token=token-resend/);
});
