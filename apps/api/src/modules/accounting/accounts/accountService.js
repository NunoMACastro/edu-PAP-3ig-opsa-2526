/**
 * @file Service do plano de contas SNC.
 */

import { httpError } from "../../../lib/httpErrors.js";
import { validateAccountSaftMetadata } from "./accountValidators.js";
import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../../lib/cursorPagination.js";

/**
 * Serializa conta para resposta pública.
 *
 * @param {object} account - Conta Prisma.
 * @returns {object} Conta pública.
 */
function serialize(account) {
    return {
        id: account.id,
        code: account.code,
        name: account.name,
        parentCode: account.parentCode,
        level: account.level,
        isActive: account.isActive,
        saftGroupingCategory: account.saftGroupingCategory ?? null,
        saftGroupingCode: account.saftGroupingCode ?? null,
        saftTaxonomyCode: account.saftTaxonomyCode ?? null,
    };
}

/**
 * Confirma que o GroupingCode aponta para uma conta da mesma empresa.
 *
 * @param {object} tx - Cliente/transação Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string | null | undefined} groupingCode - Conta agregadora indicada.
 * @returns {Promise<void>}
 */
async function assertGroupingAccountExists(tx, companyId, groupingCode) {
    if (!groupingCode) return;
    const groupingAccount = await tx.account.findUnique({
        where: { companyId_code: { companyId, code: groupingCode } },
        select: { id: true },
    });
    if (!groupingAccount) {
        throw httpError(
            400,
            "SAFT_GROUPING_ACCOUNT_NOT_FOUND",
            "GroupingCode não corresponde a uma conta da empresa",
        );
    }
}

/**
 * Lista contas da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{ cursor?: string, limit?: string | number }} [page] - Paginação pedida.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de contas.
 */
export async function listAccounts(prisma, companyId, page = {}) {
    const limit = parsePageLimit(page.limit);
    const cursor = decodePageCursor(page.cursor, "string");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "code",
        direction: "asc",
    });
    const baseWhere = { companyId };
    const accounts = await prisma.account.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        orderBy: [{ code: "asc" }, { id: "asc" }],
        take: limit + 1,
    });

    return buildCursorPage(accounts, {
        limit,
        sortField: "code",
        sortType: "string",
        serialize,
    });
}

/**
 * Cria uma conta no plano da empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, input: object }} context - Contexto autenticado e conta validada.
 * @returns {Promise<object>} Conta criada.
 */
export async function createAccount(prisma, context) {
    try {
        return await prisma.$transaction(async (tx) => {
            const existing = await tx.account.findUnique({
                where: {
                    companyId_code: {
                        companyId: context.companyId,
                        code: context.input.code,
                    },
                },
            });
            if (existing) {
                throw httpError(
                    409,
                    "ACCOUNT_CODE_EXISTS",
                    "Já existe uma conta com este código nesta empresa",
                );
            }

            await assertGroupingAccountExists(
                tx,
                context.companyId,
                context.input.saftGroupingCode,
            );

            const account = await tx.account.create({
                data: { companyId: context.companyId, ...context.input },
            });
            await tx.auditLog.create({
                data: {
                    companyId: context.companyId,
                    userId: context.userId,
                    action: "ACCOUNT_CREATED",
                    entity: "Account",
                    entityId: account.id,
                    details: { changedFields: Object.keys(context.input).sort() },
                },
            });
            return serialize(account);
        });
    } catch (error) {
        if (error?.code === "P2002") {
            throw httpError(
                409,
                "ACCOUNT_CODE_EXISTS",
                "Já existe uma conta com este código nesta empresa",
            );
        }
        throw error;
    }
}

/**
 * Importa várias contas já normalizadas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, rows: object[] }} context - Contexto autenticado e linhas validadas.
 * @returns {Promise<{ imported: number }>} Total importado.
 */
export async function importAccountsFromRows(prisma, context) {
    const seen = new Set();
    for (const row of context.rows) {
        if (seen.has(row.code)) {
            throw httpError(
                409,
                "DUPLICATED_IMPORT_CODE",
                `Código duplicado no ficheiro: ${row.code}`,
            );
        }
        seen.add(row.code);
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const existing = await tx.account.findMany({
                where: {
                    companyId: context.companyId,
                    code: { in: context.rows.map((row) => row.code) },
                },
                select: { code: true },
            });
            if (existing.length > 0) {
                throw httpError(
                    409,
                    "ACCOUNT_CODE_EXISTS",
                    `Código já existente: ${existing[0].code}`,
                );
            }

            const importedCodes = new Set(context.rows.map((row) => row.code));
            const externalGroupingCodes = [...new Set(
                context.rows
                    .map((row) => row.saftGroupingCode)
                    .filter((code) => code && !importedCodes.has(code)),
            )];
            if (externalGroupingCodes.length > 0) {
                const groupingAccounts = await tx.account.findMany({
                    where: {
                        companyId: context.companyId,
                        code: { in: externalGroupingCodes },
                    },
                    select: { code: true },
                });
                if (groupingAccounts.length !== externalGroupingCodes.length) {
                    throw httpError(
                        400,
                        "SAFT_GROUPING_ACCOUNT_NOT_FOUND",
                        "Uma conta importada referencia um GroupingCode inexistente",
                    );
                }
            }

            await tx.account.createMany({
                data: context.rows.map((row) => ({
                    companyId: context.companyId,
                    ...row,
                })),
            });
            await tx.auditLog.create({
                data: {
                    companyId: context.companyId,
                    userId: context.userId,
                    action: "ACCOUNTS_IMPORTED",
                    entity: "Account",
                    entityId: context.companyId,
                    details: { imported: context.rows.length },
                },
            });
            return { imported: context.rows.length };
        });
    } catch (error) {
        if (error?.code === "P2002") {
            throw httpError(
                409,
                "ACCOUNT_CODE_EXISTS",
                "Um dos códigos importados já existe nesta empresa",
            );
        }
        throw error;
    }
}

/**
 * Atualiza apenas a classificação SAF-T de uma conta, com ownership e
 * auditoria na mesma transação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, accountId: string, input: unknown }} context - Contexto autenticado.
 * @returns {Promise<object>} Conta pública atualizada.
 */
export async function updateAccountSaftMetadata(prisma, context) {
    return prisma.$transaction(async (tx) => {
        const account = await tx.account.findFirst({
            where: { id: context.accountId, companyId: context.companyId },
        });
        if (!account) {
            throw httpError(404, "ACCOUNT_NOT_FOUND", "Conta não encontrada");
        }
        const data = validateAccountSaftMetadata({
            ...(context.input && typeof context.input === "object"
                ? context.input
                : {}),
            parentCode: account.parentCode,
        });
        if (data.saftGroupingCode === account.code) {
            throw httpError(
                400,
                "SAFT_GROUPING_SELF_REFERENCE",
                "GroupingCode não pode referenciar a própria conta",
            );
        }
        await assertGroupingAccountExists(
            tx,
            context.companyId,
            data.saftGroupingCode,
        );
        const updated = await tx.account.update({
            where: { id: account.id },
            data,
        });
        await tx.auditLog.create({
            data: {
                companyId: context.companyId,
                userId: context.userId,
                action: "ACCOUNT_SAFT_METADATA_UPDATED",
                entity: "Account",
                entityId: account.id,
                details: { changedFields: Object.keys(data).sort() },
            },
        });
        return serialize(updated);
    });
}
