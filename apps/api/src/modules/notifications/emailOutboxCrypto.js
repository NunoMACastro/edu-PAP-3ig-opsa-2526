/**
 * @file Cifra autenticada dos payloads temporários da EmailOutbox.
 */

import crypto from "node:crypto";

const IV_BYTES = 12;

/**
 * Lê uma chave AES-256 em Base64 ou hexadecimal.
 *
 * @param {string | Buffer} value - Chave configurada.
 * @returns {Buffer} Chave com 32 bytes.
 */
export function parseEmailOutboxEncryptionKey(value) {
    if (Buffer.isBuffer(value) && value.length === 32) return Buffer.from(value);
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error("EMAIL_OUTBOX_ENCRYPTION_KEY é obrigatória.");
    }

    const normalized = value.trim();
    const key = /^[a-f0-9]{64}$/i.test(normalized)
        ? Buffer.from(normalized, "hex")
        : Buffer.from(normalized, "base64");

    if (key.length !== 32) {
        throw new Error("EMAIL_OUTBOX_ENCRYPTION_KEY deve representar exatamente 32 bytes.");
    }
    return key;
}

/**
 * Cifra um objeto JSON com AES-256-GCM.
 *
 * @param {object} payload - Mensagem transacional completa.
 * @param {string | Buffer} encryptionKey - Chave configurada.
 * @returns {string} Envelope Base64 versionado.
 */
export function encryptEmailOutboxPayload(payload, encryptionKey) {
    const key = parseEmailOutboxEncryptionKey(encryptionKey);
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([
        cipher.update(JSON.stringify(payload), "utf8"),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return ["v1", iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

/**
 * Decifra e autentica um envelope da EmailOutbox.
 *
 * @param {string} envelope - Envelope criado por encryptEmailOutboxPayload.
 * @param {string | Buffer} encryptionKey - Chave configurada.
 * @returns {object} Mensagem original.
 */
export function decryptEmailOutboxPayload(envelope, encryptionKey) {
    const [version, encodedIv, encodedTag, encodedCiphertext] = String(envelope).split(".");
    if (version !== "v1" || !encodedIv || !encodedTag || !encodedCiphertext) {
        throw new Error("Envelope cifrado de email inválido.");
    }

    const key = parseEmailOutboxEncryptionKey(encryptionKey);
    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        key,
        Buffer.from(encodedIv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(encodedCiphertext, "base64url")),
        decipher.final(),
    ]);
    return JSON.parse(plaintext.toString("utf8"));
}
