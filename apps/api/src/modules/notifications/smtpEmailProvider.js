/**
 * @file Provider SMTP real para mensagens retiradas da EmailOutbox.
 */

import nodemailer from "nodemailer";

/**
 * Constrói provider SMTP sem fallback mock.
 *
 * @param {{ host: string, port: number, secure: boolean, requireTls: boolean, user?: string, password?: string, from: string }} config - Configuração SMTP validada.
 * @returns {{ send(message: object): Promise<object>, verify(): Promise<boolean>, close(): void }} Provider.
 */
export function buildSmtpEmailProvider(config) {
    const transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        requireTLS: config.requireTls,
        auth: config.user
            ? { user: config.user, pass: config.password }
            : undefined,
    });

    return {
        mode: "smtp",
        verify: () => transport.verify(),
        close: () => transport.close(),
        send: (message) =>
            transport.sendMail({
                from: config.from,
                to: message.to,
                subject: message.subject,
                text: message.text,
            }),
    };
}

/**
 * Constrói o provider de demonstração sem transport, sockets ou retenção do
 * destinatário/conteúdo. O resultado permite ao worker persistir um estado
 * semanticamente distinto de entrega externa.
 *
 * @returns {{ mode: "simulated", send(message: object): Promise<{status: "SIMULATED"}>, verify(): Promise<boolean>, close(): void }} Provider local.
 */
export function buildSimulatedEmailProvider() {
    return {
        mode: "simulated",
        async verify() {
            return true;
        },
        close() {},
        async send() {
            return { status: "SIMULATED" };
        },
    };
}

/**
 * Seleciona o provider no composition root do worker.
 *
 * @param {{ providers: { email: "simulated" | "smtp" }, smtp: object, isProduction: boolean }} apiEnv - Configuração central validada.
 * @returns {ReturnType<typeof buildSmtpEmailProvider> | ReturnType<typeof buildSimulatedEmailProvider>} Provider selecionado.
 */
export function createEmailProvider(apiEnv) {
    const mode = apiEnv?.providers?.email;
    if (mode === "simulated") {
        if (apiEnv.isProduction) {
            throw new Error("Email simulated não é permitido em produção.");
        }
        return buildSimulatedEmailProvider();
    }
    if (mode === "smtp") return buildSmtpEmailProvider(apiEnv.smtp);
    throw new Error("EMAIL_PROVIDER deve ser simulated ou smtp.");
}
