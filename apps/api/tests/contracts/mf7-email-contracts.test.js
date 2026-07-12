/**
 * @file Testes de contrato MF7 para email transaccional.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPasswordResetEmailAdapter } from "../../src/modules/auth/passwordResetEmailAdapter.js";
import {
    TransactionalEmailReason,
    buildTransactionalEmailAdapter,
} from "../../src/modules/notifications/transactionalEmailAdapter.js";
import { sendNotificationEmails } from "../../src/modules/notifications/notificationService.js";

/**
 * Cria logger capturável para confirmar que os logs ficam sem dados sensíveis.
 *
 * @returns {{ entries: object[], logger: { info(entry: object): void } }} Logger em memória.
 */
function captureLogger() {
    const entries = [];
    return {
        entries,
        logger: {
            info(entry) {
                entries.push(entry);
            },
        },
    };
}

describe("MF7 email transaccional", () => {
    it("envia por provider real sem expor endereço completo nos logs", async () => {
        const { entries, logger } = captureLogger();
        const adapter = buildTransactionalEmailAdapter({
            logger,
            provider: { send: async () => ({ id: "smtp-message-1" }) },
        });

        const result = await adapter.sendTransactionalEmail({
            to: "sofia@example.com",
            reason: TransactionalEmailReason.SMART_ALERT,
            subject: "Alerta OPSA",
            text: "Existe um alerta operacional pendente.",
        });

        assert.equal(result.status, "SENT");
        assert.equal(entries[0].emailDomain, "example.com");
        assert.equal(JSON.stringify(entries).includes("sofia@example.com"), false);
    });

    it("rejeita motivo fora do contrato", async () => {
        const adapter = buildTransactionalEmailAdapter();

        await assert.rejects(
            () =>
                adapter.sendTransactionalEmail({
                    to: "sofia@example.com",
                    reason: "MARKETING",
                    subject: "Campanha",
                    text: "Mensagem fora do contrato RNF21.",
                }),
            /Motivo de email fora do contrato OPSA/,
        );
    });

    it("rejeita injeção CRLF em destinatário e assunto", async () => {
        const adapter = buildTransactionalEmailAdapter({
            provider: { send: async () => ({ accepted: true }) },
        });
        await assert.rejects(
            () =>
                adapter.sendTransactionalEmail({
                    to: "user@example.com\r\nBcc: attacker@example.com",
                    reason: TransactionalEmailReason.SMART_ALERT,
                    subject: "Alerta legítimo",
                    text: "Existe um alerta que requer revisão.",
                }),
            /Destinatário/,
        );
        await assert.rejects(
            () =>
                adapter.sendTransactionalEmail({
                    to: "user@example.com",
                    reason: TransactionalEmailReason.SMART_ALERT,
                    subject: "Alerta\r\nBcc: attacker@example.com",
                    text: "Existe um alerta que requer revisão.",
                }),
            /Assunto/,
        );
    });

    it("rejeita destinatário inválido antes de chamar provider", async () => {
        let providerWasCalled = false;
        const adapter = buildTransactionalEmailAdapter({
            provider: {
                async send() {
                    providerWasCalled = true;
                    return { id: "provider-message-1" };
                },
            },
        });

        await assert.rejects(
            () =>
                adapter.sendTransactionalEmail({
                    to: "sem-arroba",
                    reason: TransactionalEmailReason.PAYMENT_REMINDER,
                    subject: "Lembrete OPSA",
                    text: "Existe um lembrete operacional pendente.",
                }),
            /Destinatário de email inválido/,
        );

        assert.equal(providerWasCalled, false);
    });

    it("mantém sendPasswordReset e não escreve segredo nos logs", async () => {
        const { entries, logger } = captureLogger();
        const adapter = buildPasswordResetEmailAdapter({
            appBaseUrl: "https://opsa.example.test",
            logger,
            provider: { send: async () => ({ id: "smtp-message-1" }) },
        });

        await adapter.sendPasswordReset({
            email: "pedro@example.com",
            token: "segredo-temporario-de-teste",
        });

        const serializedLogs = JSON.stringify(entries);
        assert.equal(serializedLogs.includes("pedro@example.com"), false);
        assert.equal(serializedLogs.includes("segredo-temporario-de-teste"), false);
        assert.equal(serializedLogs.includes("recuperar-password"), false);
    });

    it("envia alertas e lembretes usando o adapter comum", async () => {
        const sentMessages = [];
        const emailAdapter = {
            /**
             * Simula o envio transacional e guarda a mensagem para verificar o contrato.
             * O adapter fake permite validar tipos de email sem chamar provider externo.
             *
             * @param {object} message - Mensagem transacional preparada pelo service.
             * @returns {Promise<{ status: string, reason: string }>} Resultado de envio simulado.
             */
            async sendTransactionalEmail(message) {
                sentMessages.push(message);
                return { status: "SENT", reason: message.reason };
            },
        };

        const results = await sendNotificationEmails(emailAdapter, [
            {
                recipientEmail: "sofia@example.com",
                type: "SMART_ALERT",
                title: "Alerta de margem",
                message: "Existe uma margem operacional abaixo do esperado.",
            },
            {
                recipientEmail: "pedro@example.com",
                type: "REMINDER",
                title: "Lembrete de pagamento",
                message: "Existe um prazo financeiro por validar.",
            },
        ]);

        assert.deepEqual(
            results.map((result) => result.reason),
            [
                TransactionalEmailReason.SMART_ALERT,
                TransactionalEmailReason.PAYMENT_REMINDER,
            ],
        );
        assert.equal(sentMessages.length, 2);
    });
});
