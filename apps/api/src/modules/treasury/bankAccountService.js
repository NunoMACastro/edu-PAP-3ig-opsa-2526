/**
 * @file Service de contas bancárias/caixa da MF3.
 */

import { httpError } from "../../lib/httpErrors.js";
import { validateTreasuryAccountPayload } from "./bankAccountValidators.js";

/**
 * Converte contas de tesouraria para o shape público devolvido pela API.
 *
 * @param account - Conta ou registo contabilístico a normalizar.
 * @returns Conta de tesouraria no formato público da API.
 */
function serializeAccount(account) {
    return {
        id: account.id,
        type: account.type,
        name: account.name,
        iban: account.iban,
        currency: account.currency,
        initialBalanceCents: account.initialBalanceCents,
        currentBalanceCents: account.currentBalanceCents,
        isActive: account.isActive,
        latestSnapshot: account.snapshots?.[0] ?? null,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
    };
}

/**
 * Lista contas de tesouraria ativas da empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Contas de tesouraria.
 */
export async function listTreasuryAccounts(prisma, companyId) {
    const accounts = await prisma.treasuryAccount.findMany({
        where: { companyId, isActive: true },
        include: {
            snapshots: { orderBy: { snapshotAt: "desc" }, take: 1 },
        },
        orderBy: [{ type: "asc" }, { name: "asc" }],
    });
    return accounts.map(serializeAccount);
}

/**
 * Cria conta bancária/caixa e primeiro snapshot na mesma transação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, input: unknown }} context - Contexto.
 * @returns {Promise<object>} Conta criada.
 */
export async function createTreasuryAccount(prisma, context) {
    const data = validateTreasuryAccountPayload(context.input);

    try {
        return await prisma.$transaction(async (tx) => {
            const account = await tx.treasuryAccount.create({
                data: {
                    companyId: context.companyId,
                    type: data.type,
                    name: data.name,
                    iban: data.iban,
                    currency: data.currency,
                    initialBalanceCents: data.initialBalanceCents,
                    currentBalanceCents: data.initialBalanceCents,
                    createdById: context.userId,
                },
            });
            const snapshot = await tx.treasuryBalanceSnapshot.create({
                data: {
                    companyId: context.companyId,
                    treasuryAccountId: account.id,
                    balanceCents: data.initialBalanceCents,
                    source: "INITIAL_BALANCE",
                },
            });
            await tx.auditLog.create({
                data: {
                    companyId: context.companyId,
                    userId: context.userId,
                    action: "TREASURY_ACCOUNT_CREATED",
                    entity: "TreasuryAccount",
                    entityId: account.id,
                    details: {
                        type: data.type,
                        hasIban: Boolean(data.iban),
                        initialBalanceCents: data.initialBalanceCents,
                    },
                },
            });
            return serializeAccount({ ...account, snapshots: [snapshot] });
        });
    } catch (error) {
        if (error.code === "P2002") {
            throw httpError(
                409,
                "TREASURY_ACCOUNT_EXISTS",
                "Já existe uma conta de tesouraria com estes dados nesta empresa",
            );
        }
        throw error;
    }
}
