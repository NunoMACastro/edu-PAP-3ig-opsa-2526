/**
 * @file Service do plano de contas SNC.
 */

import { httpError } from "../../../lib/httpErrors.js";

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
    };
}

/**
 * Lista contas da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Contas ordenadas por código.
 */
export async function listAccounts(prisma, companyId) {
    const accounts = await prisma.account.findMany({
        where: { companyId },
        orderBy: { code: "asc" },
    });

    return accounts.map(serialize);
}

/**
 * Cria uma conta no plano da empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object} input - Conta validada.
 * @returns {Promise<object>} Conta criada.
 */
export async function createAccount(prisma, companyId, input) {
    const existing = await prisma.account.findUnique({
        where: { companyId_code: { companyId, code: input.code } },
    });

    if (existing) {
        throw httpError(
            409,
            "ACCOUNT_CODE_EXISTS",
            "Já existe uma conta com este código nesta empresa",
        );
    }

    const account = await prisma.account.create({
        data: { companyId, ...input },
    });

    return serialize(account);
}

/**
 * Importa várias contas já normalizadas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object[]} rows - Linhas de conta validadas.
 * @returns {Promise<{ imported: number }>} Total importado.
 */
export async function importAccountsFromRows(prisma, companyId, rows) {
    const seen = new Set();
    for (const row of rows) {
        if (seen.has(row.code)) {
            throw httpError(
                409,
                "DUPLICATED_IMPORT_CODE",
                `Código duplicado no ficheiro: ${row.code}`,
            );
        }
        seen.add(row.code);
    }

    const existing = await prisma.account.findMany({
        where: { companyId, code: { in: rows.map((row) => row.code) } },
        select: { code: true },
    });

    if (existing.length > 0) {
        throw httpError(
            409,
            "ACCOUNT_CODE_EXISTS",
            `Código já existente: ${existing[0].code}`,
        );
    }

    await prisma.account.createMany({
        data: rows.map((row) => ({ companyId, ...row })),
    });

    return { imported: rows.length };
}
