import { httpError } from "../../../lib/httpErrors.js";

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

export async function listAccounts(prisma, companyId) {
    const accounts = await prisma.account.findMany({
        where: { companyId },
        orderBy: { code: "asc" },
    });

    return accounts.map(serialize);
}

export async function createAccount(prisma, companyId, input) {
    const existing = await prisma.account.findUnique({
        where: { companyId_code: { companyId, code: input.code } },
    });

    if (existing) {
        throw httpError(
            409,
            "ACCOUNT_CODE_EXISTS",
            "Ja existe uma conta com este codigo nesta empresa",
        );
    }

    const account = await prisma.account.create({
        data: { companyId, ...input },
    });

    return serialize(account);
}

export async function importAccountsFromRows(prisma, companyId, rows) {
    const seen = new Set();
    for (const row of rows) {
        if (seen.has(row.code)) {
            throw httpError(
                409,
                "DUPLICATED_IMPORT_CODE",
                `Codigo duplicado no ficheiro: ${row.code}`,
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
            `Codigo ja existente: ${existing[0].code}`,
        );
    }

    await prisma.account.createMany({
        data: rows.map((row) => ({ companyId, ...row })),
    });

    return { imported: rows.length };
}