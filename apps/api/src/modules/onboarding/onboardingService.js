/**
 * @file Criação atómica da primeira empresa do utilizador.
 */

import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { recordAuditLog } from "../audit/auditLogService.js";

/**
 * Cria empresa, perfil, membership ADMIN e contexto da sessão numa transação.
 *
 * @param {object} prisma - Cliente Prisma.
 * @param {{ userId: string, sessionId: string, name: string, profile: object }} input - Dados validados e identidade autenticada.
 * @returns {Promise<object>} Contexto inicial.
 */
export async function createInitialCompany(prisma, input) {
    try {
        return await prisma.$transaction(async (tx) => {
            await acquireTransactionLock(tx, "user-onboarding", input.userId);
            const memberships = await tx.companyMembership.count({
                where: { userId: input.userId, isActive: true },
            });
            if (memberships !== 0) {
                throw httpError(
                    409,
                    "ONBOARDING_ALREADY_COMPLETED",
                    "O utilizador já pertence a uma empresa",
                );
            }
            const company = await tx.company.create({
                data: { name: input.name, nif: input.profile.nif },
            });
            const profile = await tx.companyProfile.create({
                data: { companyId: company.id, ...input.profile },
            });
            await tx.companyMembership.create({
                data: { companyId: company.id, userId: input.userId, role: "ADMIN" },
            });
            const session = await tx.session.updateMany({
                where: { id: input.sessionId, userId: input.userId, revokedAt: null },
                data: { activeCompanyId: company.id },
            });
            if (session.count !== 1) {
                throw httpError(401, "INVALID_SESSION", "Sessão inválida ou expirada");
            }
            await recordAuditLog(tx, {
                companyId: company.id,
                userId: input.userId,
                action: "company.onboarding.create",
                entity: "Company",
                entityId: company.id,
                details: { profileId: profile.id, initialRole: "ADMIN" },
            });
            return {
                company: { id: company.id, name: company.name, nif: company.nif },
                profile,
                context: { companyId: company.id, role: "ADMIN" },
            };
        });
    } catch (error) {
        if (error?.code === "P2002") {
            throw httpError(409, "NIF_ALREADY_EXISTS", "Já existe uma empresa com este NIF");
        }
        throw error;
    }
}
