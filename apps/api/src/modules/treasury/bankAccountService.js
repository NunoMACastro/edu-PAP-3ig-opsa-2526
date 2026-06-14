// apps/api/src/modules/treasury/bankAccountService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Lista contas de tesouraria ativas da empresa atual.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string }} input Contexto multiempresa vindo da sessão.
 * @returns {Promise<Array<object>>} Contas ativas com o snapshot mais recente.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando não há empresa ativa.
 */
export async function listTreasuryAccounts(prisma, { companyId }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    return prisma.treasuryAccount.findMany({
        where: { companyId, isActive: true },
        orderBy: { name: "asc" },
        include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
    });
}

/**
 * Cria uma conta de tesouraria e o primeiro snapshot de saldo na mesma transação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, payload: { name: string, type: "BANK" | "CASH", iban: string | null, currency: string, initialBalanceCents: number } }} input Contexto seguro e payload validado.
 * @returns {Promise<object | null>} Conta criada com snapshot mais recente.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa ou 409 quando o nome já existe na empresa.
 */
export async function createTreasuryAccount(prisma, { companyId, userId, payload }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const existing = await prisma.treasuryAccount.findUnique({
        where: { companyId_name: { companyId, name: payload.name } },
    });
    if (existing) throw httpError(409, "TREASURY_ACCOUNT_EXISTS", "Já existe uma conta com este nome");

    return prisma.$transaction(async (tx) => {
        // Conta e snapshot ficam na mesma transação para não existir conta sem saldo inicial.
        const account = await tx.treasuryAccount.create({
            data: {
                companyId,
                name: payload.name,
                type: payload.type,
                iban: payload.iban,
                currency: payload.currency,
                createdById: userId,
            },
        });

        await tx.treasuryBalanceSnapshot.create({
            data: {
                companyId,
                treasuryAccountId: account.id,
                balanceCents: payload.initialBalanceCents,
                capturedById: userId,
            },
        });

        return tx.treasuryAccount.findUnique({
            where: { id: account.id },
            include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
        });
    });
}