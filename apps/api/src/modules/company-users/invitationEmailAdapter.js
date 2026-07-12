/**
 * @file Adapter de EmailOutbox para convites de empresa.
 */

import { TransactionalEmailReason } from "../notifications/transactionalEmailAdapter.js";

/**
 * Constrói um adapter que persiste o convite cifrado na transação de negócio.
 *
 * @param {{ appBaseUrl: string, emailOutbox: { enqueue: Function } }} options - Dependências do adapter.
 * @returns {{ enqueueInvitation(tx: object, payload: object): Promise<object> }} Adapter.
 */
export function buildInvitationEmailAdapter({ appBaseUrl, emailOutbox }) {
    return {
        /**
         * Enfileira o convite sem expor o token em logs ou colunas em claro.
         *
         * @param {object} tx - Transação Prisma.
         * @param {{ invitationId: string, deliveryId: string, email: string, companyName: string, token: string }} payload - Convite.
         * @returns {Promise<object>} Registo de outbox.
         */
        enqueueInvitation(
            tx,
            { invitationId, deliveryId, email, companyName, token },
        ) {
            if (!emailOutbox?.enqueue) {
                throw new Error("EmailOutbox não configurada para convites.");
            }
            if (typeof deliveryId !== "string" || deliveryId.trim() === "") {
                throw new TypeError("deliveryId é obrigatório para enviar convites.");
            }
            const baseUrl = String(appBaseUrl || "").replace(/\/$/, "");
            const invitationUrl = `${baseUrl}/aceitar-convite#token=${encodeURIComponent(token)}`;
            return emailOutbox.enqueue(
                tx,
                {
                    to: email,
                    reason: TransactionalEmailReason.COMPANY_INVITATION,
                    subject: `Convite para ${companyName} no OPSA`,
                    text: [
                        `Foste convidado para colaborar em ${companyName}.`,
                        `Abre esta ligação pessoal: ${invitationUrl}`,
                        "A ligação expira em sete dias e não deve ser partilhada.",
                    ].join("\n"),
                },
                {
                    dedupeKey: `company-invitation:${invitationId}:${deliveryId.trim()}`,
                },
            );
        },
    };
}
