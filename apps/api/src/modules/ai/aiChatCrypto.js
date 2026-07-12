/**
 * @file Envelope AES-256-GCM exclusivo do histórico de chat OPSA.
 */

import crypto from "node:crypto";

const IV_BYTES = 12;

export function parseAiChatEncryptionKey(value) {
    if (Buffer.isBuffer(value) && value.length === 32) return Buffer.from(value);
    if (typeof value !== "string" || !value.trim()) {
        throw new Error("AI_CHAT_ENCRYPTION_KEY é obrigatória para persistir chat.");
    }
    const normalized = value.trim();
    const key = /^[a-f0-9]{64}$/i.test(normalized)
        ? Buffer.from(normalized, "hex")
        : Buffer.from(normalized, "base64");
    if (key.length !== 32) throw new Error("AI_CHAT_ENCRYPTION_KEY deve representar 32 bytes.");
    return key;
}

export function encryptAiChatPayload(payload, encryptionKey) {
    const key = parseAiChatEncryptionKey(encryptionKey);
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
    return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptAiChatPayload(envelope, encryptionKey) {
    const [version, iv, tag, encrypted] = String(envelope).split(".");
    if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("Envelope de chat inválido.");
    const decipher = crypto.createDecipheriv("aes-256-gcm", parseAiChatEncryptionKey(encryptionKey), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    const clear = Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]);
    return JSON.parse(clear.toString("utf8"));
}

export function hashDeletedSessionId(sessionId, encryptionKey) {
    return crypto.createHmac("sha256", parseAiChatEncryptionKey(encryptionKey)).update(sessionId).digest("hex");
}

export function createSafetyIdentifier(userId, hmacKey) {
    return crypto.createHmac("sha256", String(hmacKey)).update(String(userId)).digest("hex");
}
