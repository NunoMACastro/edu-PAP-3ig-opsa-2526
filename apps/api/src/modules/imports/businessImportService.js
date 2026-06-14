// apps/api/src/modules/imports/businessImportService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte valor textual em euros para cêntimos.
 *
 * @param {unknown} value Valor como `10.50` ou `10,50`.
 * @returns {number} Valor em cêntimos.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o valor não é numérico.
 */
function eurosToCents(value) {
    const amount = Number(String(value).replace(",", "."));
    if (!Number.isFinite(amount)) throw httpError(400, "INVALID_IMPORT_AMOUNT", "Valor inválido na importação");
    return Math.round(amount * 100);
}

/**
 * Valida campo monetario que já chega em cêntimos.
 *
 * @param {unknown} value Valor vindo da linha CSV.
 * @param {string} fieldName Campo para mensagem de erro.
 * @param {{ allowZero?: boolean }} options Permite ou bloqueia zero.
 * @returns {number} Cêntimos validados.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando não é inteiro válido.
 */
function integerCents(value, fieldName, { allowZero = true } = {}) {
    const cents = Number(value);
    if (!Number.isInteger(cents) || cents < 0 || (!allowZero && cents === 0)) {
        throw httpError(400, "INVALID_IMPORT_AMOUNT", `${fieldName} deve estar em cêntimos`);
    }
    return cents;
}

/**
 * Valida taxa de IVA em basis points.
 *
 * @param {unknown} value Valor CSV.
 * @returns {number} Taxa entre 0 e 10000.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando fora do intervalo.
 */
function vatRateBps(value) {
    const bps = Number(value);
    if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
        throw httpError(400, "INVALID_IMPORT_VAT", "vatRateBps deve estar entre 0 e 10000");
    }
    return bps;
}

/**
 * Faz upsert de uma linha válida de dados mestre.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx Transação Prisma.
 * @param {string} companyId Empresa ativa.
 * @param {"CUSTOMERS" | "SUPPLIERS" | "ITEMS"} type Tipo de importação.
 * @param {Record<string, string>} row Linha CSV validada.
 * @returns {Promise<object>} Registo criado ou atualizado.
 */
async function upsertRow(tx, companyId, type, row) {
    if (type === "CUSTOMERS") return tx.customer.upsert({ where: { companyId_nif: { companyId, nif: row.nif } }, update: { name: row.name }, create: { companyId, name: row.name, nif: row.nif } });
    if (type === "SUPPLIERS") return tx.supplier.upsert({ where: { companyId_nif: { companyId, nif: row.nif } }, update: { name: row.name }, create: { companyId, name: row.name, nif: row.nif } });
    if (type === "ITEMS") {
        const itemData = {
            name: row.name,
            costCents: integerCents(row.costCents, "costCents"),
            priceCents: integerCents(row.priceCents, "priceCents", { allowZero: false }),
            vatRateBps: vatRateBps(row.vatRateBps),
            type: "PRODUCT",
        };
        return tx.item.upsert({
            where: { companyId_sku: { companyId, sku: row.sku } },
            update: itemData,
            create: { companyId, sku: row.sku, ...itemData },
        });
    }
    throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importação inválido");
}

/**
 * Importa linhas de extrato reaproveitando os modelos do BK-MF3-03.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx Transação Prisma.
 * @param {string} companyId Empresa ativa.
 * @param {string} userId Utilizador autenticado.
 * @param {string} fileName Nome do ficheiro importado.
 * @param {Array<{ row: Record<string, string> }>} parsedRows Linhas válidas de extrato.
 * @returns {Promise<void>}
 * @throws {import("../../lib/httpErrors.js").HttpError} 404 quando uma conta não pertence a empresa.
 */
async function importStatementRows(tx, companyId, userId, fileName, parsedRows) {
    if (parsedRows.length === 0) return;

    const accountIds = [...new Set(parsedRows.map((item) => item.row.treasuryAccountId))];
    const accounts = await tx.treasuryAccount.findMany({
        where: { companyId, isActive: true, id: { in: accountIds } },
        select: { id: true },
    });
    const allowedAccountIds = new Set(accounts.map((account) => account.id));
    const missingAccountId = accountIds.find((id) => !allowedAccountIds.has(id));
    if (missingAccountId) {
        throw httpError(404, "TREASURY_ACCOUNT_NOT_FOUND", "Conta de tesouraria não encontrada nesta empresa");
    }

    for (const accountId of accountIds) {
        const rowsForAccount = parsedRows.filter((item) => item.row.treasuryAccountId === accountId);
        // Cada conta gera um BankStatementImport próprio para manter o log de integração por conta.
        const statementImport = await tx.bankStatementImport.create({
            data: {
                companyId,
                treasuryAccountId: accountId,
                fileName,
                format: "CSV",
                status: "IMPORTED",
                totalLines: rowsForAccount.length,
                validLines: rowsForAccount.length,
                errorLines: 0,
                importedById: userId,
            },
        });

        await tx.bankStatementLine.createMany({
            data: rowsForAccount.map((item) => ({
                companyId,
                importId: statementImport.id,
                bookedAt: new Date(item.row.bookedAt),
                description: item.row.description,
                reference: item.row.reference || null,
                amountCents: eurosToCents(item.row.amount),
            })),
            skipDuplicates: true,
        });
    }
}

/**
 * Importa dados operacionais por empresa e regista resumo da execução.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, payload: { type: "CUSTOMERS" | "SUPPLIERS" | "ITEMS" | "STATEMENTS", fileName: string, rows: Array<{ lineNumber: number, row: Record<string, string>, errors: string[] }> } }} input Contexto seguro e payload validado.
 * @returns {Promise<object>} `BusinessImportRun` com totais e erros.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa.
 */
export async function importBusinessData(prisma, { companyId, userId, payload }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const validRows = payload.rows.filter((item) => item.errors.length === 0);
    const rejectedRows = payload.rows.filter((item) => item.errors.length > 0);

    return prisma.$transaction(async (tx) => {
        if (payload.type === "STATEMENTS") {
            await importStatementRows(tx, companyId, userId, payload.fileName, validRows);
        } else {
            for (const parsedRow of validRows) {
                // O upsert é sempre filtrado por companyId para impedir mistura entre empresas.
                await upsertRow(tx, companyId, payload.type, parsedRow.row);
            }
        }

        return tx.businessImportRun.create({
            data: {
                companyId,
                type: payload.type,
                fileName: payload.fileName,
                totalRows: payload.rows.length,
                acceptedRows: validRows.length,
                rejectedRows: rejectedRows.length,
                errors: rejectedRows.length > 0 ? { rows: rejectedRows } : undefined,
                importedById: userId,
            },
        });
    });
}