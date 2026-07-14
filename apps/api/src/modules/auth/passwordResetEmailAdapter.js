/**
 * @file Adapter de email para recuperação de password.
 */

import {
    TransactionalEmailReason,
    buildTransactionalEmailAdapter,
} from "../notifications/transactionalEmailAdapter.js";

/**
 * Constrói a URL privada enviada apenas ao destinatário.
 *
 * @param {{ appBaseUrl: string, token: string }} input - Base pública e segredo temporário.
 * @returns {string} URL de recuperação.
 */
function buildPasswordResetUrl({ appBaseUrl, token }) {
    const baseUrl = String(appBaseUrl || "").replace(/\/$/, "");
    const encodedToken = encodeURIComponent(token);
    return `${baseUrl}/recuperar-password#token=${encodedToken}`;
}

/**
 * Cria adapter de email para recuperação de password.
 *
 * @param {{ appBaseUrl: string, provider?: { send(message: object): Promise<object> }, logger?: Console }} options - Configuração backend do adapter.
 * @returns {{ sendPasswordReset(payload: { email: string, token: string }): Promise<object> }} Adapter assíncrono.
 */
export function buildPasswordResetEmailAdapter({
    appBaseUrl,
    emailOutbox,
    provider,
    logger = console,
}) {
    const transactionalEmailAdapter = buildTransactionalEmailAdapter({
        provider,
        logger,
    });

    return {
        /**
         * Coloca o reset cifrado na outbox dentro da transação do token.
         *
         * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma.
         * @param {{ email: string, token: string, tokenHash: string }} payload - Destino e token temporário.
         * @returns {Promise<object>} Linha de outbox persistida.
         */
        enqueuePasswordReset(tx, { email, token, tokenHash }) {
            if (!emailOutbox?.enqueue) {
                throw new Error("EmailOutbox não configurada para recuperação de password.");
            }
            const resetUrl = buildPasswordResetUrl({ appBaseUrl, token });
            return emailOutbox.enqueue(
                tx,
                {
                    to: email,
                    reason: TransactionalEmailReason.PASSWORD_RESET,
                    subject: "Recuperação de acesso OPSA",
                    text: [
                        "Recebemos um pedido para recuperar o acesso ao OPSA.",
                        "Usa esta ligação para definir uma nova password:",
                        resetUrl,
                        "Se não pediste esta recuperação, ignora esta mensagem.",
                    ].join("\n"),
                },
                { dedupeKey: `password-reset:${tokenHash}` },
            );
        },

        /**
         * Envia pedido de recuperação mantendo o segredo fora dos logs.
         *
         * @param {{ email: string, token: string }} payload - Destino e token bruto.
         * @returns {Promise<object>} Resultado do adapter transaccional.
         */
        async sendPasswordReset({ email, token }) {
            if (!provider?.send) {
                throw new Error("Provider SMTP obrigatório para envio direto.");
            }
            const resetUrl = buildPasswordResetUrl({ appBaseUrl, token });

            // A URL fica apenas no corpo enviado ao destinatário; não entra nos logs.
            return transactionalEmailAdapter.sendTransactionalEmail({
                to: email,
                reason: TransactionalEmailReason.PASSWORD_RESET,
                subject: "Recuperação de acesso OPSA",
                text: [
                    "Recebemos um pedido para recuperar o acesso ao OPSA.",
                    "Usa esta ligação para definir uma nova password:",
                    resetUrl,
                    "Se não pediste esta recuperação, ignora esta mensagem.",
                ].join("\n"),
            });
        },
    };
}
