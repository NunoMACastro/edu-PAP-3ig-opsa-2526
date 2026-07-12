/**
 * @file Auditoria global e minimizada para autenticação e sessões.
 *
 * Os eventos desta área podem acontecer antes de existir uma empresa ativa.
 * Por isso, ficam separados do AuditLog multiempresa e nunca guardam email,
 * endereço IP, cookies ou tokens em claro.
 */

import crypto from "node:crypto";

/**
 * Produz um identificador estável não reversível para correlação operacional.
 *
 * @param {unknown} value - Email, IP ou outro identificador sensível.
 * @returns {string | null} SHA-256 hexadecimal ou null.
 */
export function hashSecurityAuditValue(value) {
    if (typeof value !== "string" || value.trim() === "") return null;
    return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Persiste um evento de segurança sem dados pessoais em claro.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente ou transação Prisma.
 * @param {{ actorUserId?: string | null, event: string, outcome: string, ipHash?: string | null, subjectHash?: string | null, details?: Record<string, string | number | boolean | null> }} input - Evento minimizado.
 * @returns {Promise<object>} Evento persistido.
 */
export function recordSecurityAudit(prisma, input) {
    return prisma.securityAuditEvent.create({
        data: {
            actorUserId: input.actorUserId ?? null,
            event: input.event,
            outcome: input.outcome,
            ipHash: input.ipHash ?? null,
            subjectHash: input.subjectHash ?? null,
            details: input.details ?? undefined,
        },
    });
}
