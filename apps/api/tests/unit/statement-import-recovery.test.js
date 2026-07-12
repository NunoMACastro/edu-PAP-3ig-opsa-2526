/**
 * @file Testes da recuperação paginada de importações bancárias.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    getBankStatementImport,
    listBankStatementImports,
} from "../../src/modules/treasury/statementImportService.js";

test("lista de importações devolve envelope e cursor apenas dentro da empresa", async () => {
    let observedQuery;
    const rows = Array.from({ length: 3 }, (_, index) => ({
        id: `import-${index + 1}`,
        companyId: "company-1",
    }));
    const prisma = {
        bankStatementImport: {
            findMany: async (query) => {
                observedQuery = query;
                return rows;
            },
        },
    };

    const result = await listBankStatementImports(prisma, {
        companyId: "company-1",
        limit: 2,
    });

    assert.equal(observedQuery.where.companyId, "company-1");
    assert.equal(observedQuery.take, 3);
    assert.equal(result.items.length, 2);
    assert.deepEqual(result.pageInfo, {
        nextCursor: "import-2",
        hasNextPage: true,
    });
});

test("detalhe de importação nunca atravessa o contexto multiempresa", async () => {
    let where;
    const prisma = {
        bankStatementImport: {
            findFirst: async (query) => {
                where = query.where;
                return null;
            },
        },
    };

    await assert.rejects(
        () => getBankStatementImport(prisma, {
            companyId: "company-1",
            importId: "import-company-2",
        }),
        { code: "BANK_STATEMENT_IMPORT_NOT_FOUND", status: 404 },
    );
    assert.deepEqual(where, {
        id: "import-company-2",
        companyId: "company-1",
    });
});
