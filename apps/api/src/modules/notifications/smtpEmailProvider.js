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
