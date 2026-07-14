/**
 * @file Persistência transacional e cifrada de email a enviar.
 */

import { validateTransactionalEmailMessage } from "./transactionalEmailAdapter.js";
import {
    encryptEmailOutboxPayload,
    parseEmailOutboxEncryptionKey,
} from "./emailOutboxCrypto.js";

/**
 * Cria um adapter que enfileira email dentro da transação de negócio chamadora.
 *
 * @param {{ encryptionKey: string | Buffer }} options - Chave AES-256-GCM.
 * @returns {{ enqueue(tx: import("@prisma/client").PrismaClient, message: object, options: { dedupeKey: string }): Promise<object> }} Adapter.
 */
export function createEmailOutbox({ encryptionKey }) {
    const validatedKey = parseEmailOutboxEncryptionKey(encryptionKey);
    return {
        async enqueue(tx, message, { dedupeKey }) {
            const safeMessage = validateTransactionalEmailMessage(message);
            if (typeof dedupeKey !== "string" || dedupeKey.trim() === "") {
                throw new TypeError("dedupeKey é obrigatória para EmailOutbox.");
            }

            return tx.emailOutbox.upsert({
                where: { dedupeKey: dedupeKey.trim() },
                update: {},
                create: {
                    type: safeMessage.reason,
                    dedupeKey: dedupeKey.trim(),
                    encryptedPayload: encryptEmailOutboxPayload(
                        safeMessage,
                        validatedKey,
                    ),
                },
            });
        },
    };
}
