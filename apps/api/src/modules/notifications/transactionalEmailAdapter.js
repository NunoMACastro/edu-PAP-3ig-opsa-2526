/**
 * @file Adapter comum para email transaccional da MF7.
 */

export const TransactionalEmailReason = Object.freeze({
    PASSWORD_RESET: "PASSWORD_RESET",
    SMART_ALERT: "SMART_ALERT",
    PAYMENT_REMINDER: "PAYMENT_REMINDER",
});

const allowedReasons = new Set(Object.values(TransactionalEmailReason));

/**
 * Devolve apenas o domínio para evidence técnica sem expor o endereço completo.
 *
 * @param {string} email - Endereço de destino.
 * @returns {string | null} Domínio do destinatário ou null.
 */
export function getEmailDomain(email) {
    if (typeof email !== "string" || !email.includes("@")) return null;
    return email.split("@").at(-1).toLowerCase();
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

    if (!getEmailDomain(message.to)) {
        throw new Error("Destinatário de email inválido");
    }

    if (!allowedReasons.has(message.reason)) {
        throw new Error("Motivo de email fora do contrato OPSA");
    }

    if (typeof message.subject !== "string" || message.subject.trim().length < 6) {
        throw new Error("Assunto de email insuficiente");
    }

    if (typeof message.text !== "string" || message.text.trim().length < 12) {
        throw new Error("Texto de email insuficiente");
    }

    return {
        to: message.to.trim().toLowerCase(),
        reason: message.reason,
        subject: message.subject.trim(),
        text: message.text.trim(),
    };
}

/**
 * Cria adapter para provider real ou fila técnica segura.
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

            if (provider?.send) {
                // O provider recebe a mensagem completa; logs internos continuam mínimos.
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
            }

            // Sem provider configurado, a evidence guarda só metadados não sensíveis.
            logger.info({
                event: "transactional_email_queued",
                reason: safeMessage.reason,
                emailDomain: getEmailDomain(safeMessage.to),
            });

            return { status: "QUEUED_FOR_PROVIDER", reason: safeMessage.reason };
        },
    };
}
