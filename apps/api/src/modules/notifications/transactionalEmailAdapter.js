/**
 * @file Adapter comum para email transaccional da MF7.
 */

export const TransactionalEmailReason = Object.freeze({
    PASSWORD_RESET: "PASSWORD_RESET",
    COMPANY_INVITATION: "COMPANY_INVITATION",
    SMART_ALERT: "SMART_ALERT",
    PAYMENT_REMINDER: "PAYMENT_REMINDER",
});

const allowedReasons = new Set(Object.values(TransactionalEmailReason));
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEADER_CONTROL_PATTERN = /[\u0000-\u001f\u007f]/;

/**
 * Devolve apenas o domínio para evidence técnica sem expor o endereço completo.
 *
 * @param {string} email - Endereço de destino.
 * @returns {string | null} Domínio do destinatário ou null.
 */
export function getEmailDomain(email) {
    const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!EMAIL_PATTERN.test(normalized) || normalized.length > 254) return null;
    return normalized.split("@").at(-1);
}

/**
 * Valida a mensagem antes de ela sair do domínio OPSA.
 *
 * @param {{ to: string, reason: string, subject: string, text: string }} message - Mensagem transaccional.
 * @returns {{ to: string, reason: string, subject: string, text: string }} Mensagem validada.
 * @throws {Error} Quando destinatário, motivo, assunto ou texto não cumprem o contrato.
 */
export function validateTransactionalEmailMessage(message) {
    if (!message || typeof message !== "object") {
        throw new Error("Email transaccional inválido");
    }

    const to = typeof message.to === "string" ? message.to.trim().toLowerCase() : "";
    if (!getEmailDomain(to) || HEADER_CONTROL_PATTERN.test(to)) {
        throw new Error("Destinatário de email inválido");
    }

    if (!allowedReasons.has(message.reason)) {
        throw new Error("Motivo de email fora do contrato OPSA");
    }

    const subject = typeof message.subject === "string" ? message.subject.trim() : "";
    if (
        subject.length < 6 ||
        subject.length > 200 ||
        HEADER_CONTROL_PATTERN.test(subject)
    ) {
        throw new Error("Assunto de email insuficiente");
    }

    const text = typeof message.text === "string" ? message.text.trim() : "";
    if (
        text.length < 12 ||
        text.length > 10_000 ||
        /[\u0000\u000b\u000c\u007f]/.test(text)
    ) {
        throw new Error("Texto de email insuficiente");
    }

    return {
        to,
        reason: message.reason,
        subject,
        text,
    };
}

/**
 * Cria adapter para um provider real, sem fallback que finja enfileiramento.
 *
 * @param {{ provider?: { send(message: object): Promise<object> }, logger?: Pick<Console, "info"> }} options - Dependências externas.
 * @returns {{ sendTransactionalEmail(message: object): Promise<object> }} Adapter transaccional.
 */
export function buildTransactionalEmailAdapter({ provider, logger = console } = {}) {
    return {
        /**
         * Envia ou enfileira uma mensagem transaccional validada.
         *
         * @param {object} message - Mensagem transaccional bruta.
         * @returns {Promise<{ status: string, reason: string, providerResult?: object }>} Resultado seguro do envio.
         */
        async sendTransactionalEmail(message) {
            const safeMessage = validateTransactionalEmailMessage(message);
            if (!provider?.send) {
                throw new Error("Provider SMTP obrigatório para email transaccional.");
            }
            const result = await provider.send(safeMessage);
            logger.info({
                event: "transactional_email_sent",
                reason: safeMessage.reason,
                emailDomain: getEmailDomain(safeMessage.to),
            });
            return {
                status: "SENT",
                reason: safeMessage.reason,
                providerResult: result,
            };
        },
    };
}
