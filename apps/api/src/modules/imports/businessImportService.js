/**
 * @file Service de importação CSV/Excel de clientes, fornecedores, artigos e extratos.
 */

import { httpError } from "../../lib/httpErrors.js";
import { validateCustomerPayload } from "../customers/customerValidators.js";
import { recordIntegrationLog } from "../integrations/integrationLogService.js";
import { validateItemPayload } from "../items/itemValidators.js";
import { validateSupplierPayload } from "../suppliers/supplierValidators.js";
import { deduplicateStatementRows } from "../treasury/statementImportService.js";
import { validateStatementImportPayload } from "../treasury/statementImportValidators.js";
import { validateBusinessImportPayload } from "./businessImportValidators.js";
import { parseImportFileRows } from "./importFileParser.js";

/**
 * Cria um erro de importação associado à linha original do ficheiro.
 *
 * @param rowNumber - Número original da linha no ficheiro importado.
 * @param error - Erro capturado durante a operação.
 * @returns Erro de importação associado a uma linha.
 */
function rowError(rowNumber, error) {
    return {
        rowNumber,
        code: error.code ?? "IMPORT_ROW_ERROR",
        message: error.message ?? "Linha rejeitada",
    };
}

/**
 * Cria ou atualiza um cliente durante importações CSV, preservando a empresa ativa.
 *
 * @param tx - Transação Prisma usada pela operação.
 * @param companyId - Identificador da empresa ativa.
 * @param row - Linha de dados a processar.
 * @returns Cliente criado ou atualizado pela importação.
 */
async function upsertCustomer(tx, companyId, row) {
    const data = validateCustomerPayload(row);
    if (!data.nif) {
        return tx.customer.create({ data: { companyId, ...data } });
    }
    return tx.customer.upsert({
        where: { companyId_nif: { companyId, nif: data.nif } },
        create: { companyId, ...data },
        update: data,
    });
}

/**
 * Cria ou atualiza um fornecedor durante importações CSV, preservando a empresa ativa.
 *
 * @param tx - Transação Prisma usada pela operação.
 * @param companyId - Identificador da empresa ativa.
 * @param row - Linha de dados a processar.
 * @returns Fornecedor criado ou atualizado pela importação.
 */
async function upsertSupplier(tx, companyId, row) {
    const data = validateSupplierPayload(row);
    if (!data.nif) {
        return tx.supplier.create({ data: { companyId, ...data } });
    }
    return tx.supplier.upsert({
        where: { companyId_nif: { companyId, nif: data.nif } },
        create: { companyId, ...data },
        update: data,
    });
}

/**
 * Cria ou atualiza um artigo durante importações CSV, preservando a empresa ativa.
 *
 * @param tx - Transação Prisma usada pela operação.
 * @param companyId - Identificador da empresa ativa.
 * @param row - Linha de dados a processar.
 * @returns Artigo criado ou atualizado pela importação.
 */
async function upsertItem(tx, companyId, row) {
    const data = validateItemPayload({
        ...row,
        costCents: Number(row.costCents),
        priceCents: Number(row.priceCents),
        vatRateBps: Number(row.vatRateBps),
    });
    return tx.item.upsert({
        where: { companyId_sku: { companyId, sku: data.sku } },
        create: { companyId, ...data },
        update: data,
    });
}

/**
 * Encaminha linhas de extrato importadas para o serviço de importação bancária MF3.
 *
 * @param tx - Transação Prisma usada pela operação.
 * @param context - Contexto operacional necessário para a validação.
 * @param data - Dados normalizados usados pela operação.
 * @returns Resultado da importação de linhas de extrato.
 */
async function importStatementRows(tx, context, data) {
    const statement = validateStatementImportPayload({
        treasuryAccountId: data.treasuryAccountId,
        format: data.sourceFormat,
        fileName: data.fileName,
        rows: data.rows,
    });
    const account = await tx.treasuryAccount.findFirst({
        where: { id: data.treasuryAccountId, companyId: context.companyId, isActive: true },
    });
    if (!account) {
        throw httpError(404, "TREASURY_ACCOUNT_NOT_FOUND", "Conta de tesouraria não encontrada");
    }
    const deduplicated = deduplicateStatementRows(statement.rows);
    const importErrors = [...statement.errors, ...deduplicated.duplicateErrors];
    const imported = await tx.bankStatementImport.create({
            data: {
                companyId: context.companyId,
                treasuryAccountId: account.id,
                format: statement.format,
                fileName: data.fileName,
                status: importErrors.length > 0 ? "PARTIAL" : "IMPORTED",
            totalLines: statement.totalLines,
            acceptedLines: deduplicated.rows.length,
            rejectedLines: importErrors.length,
            errors: importErrors,
            importedById: context.userId,
        },
    });
    for (const row of deduplicated.rows) {
        await tx.bankStatementLine.create({
            data: {
                companyId: context.companyId,
                importId: imported.id,
                treasuryAccountId: account.id,
                entryDate: row.entryDate,
                description: row.description,
                reference: row.reference,
                amountCents: row.amountCents,
                raw: row.raw,
            },
        });
    }
    return {
        acceptedRows: deduplicated.rows.length,
        rejectedRows: importErrors.length,
        errors: importErrors,
    };
}

/**
 * Importa dados sensíveis CSV/Excel com validação por linha e resumo persistido.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, input: unknown }} context - Contexto.
 * @returns {Promise<object>} Resumo da importação.
 */
export async function importBusinessData(prisma, context) {
    const data = validateBusinessImportPayload(context.input);
    const parsedFile = await parseImportFileRows(data);
    const importData = { ...data, ...parsedFile };

    return prisma.$transaction(async (tx) => {
        let acceptedRows = 0;
        let rejectedRows = 0;
        let errors = [];

        if (importData.type === "STATEMENTS") {
            const result = await importStatementRows(tx, context, importData);
            acceptedRows = result.acceptedRows;
            rejectedRows = result.rejectedRows;
            errors = result.errors;
        } else {
            for (const [index, row] of importData.rows.entries()) {
                try {
                    if (importData.type === "CUSTOMERS") {
                        await upsertCustomer(tx, context.companyId, row);
                    } else if (importData.type === "SUPPLIERS") {
                        await upsertSupplier(tx, context.companyId, row);
                    } else {
                        await upsertItem(tx, context.companyId, row);
                    }
                    acceptedRows += 1;
                } catch (error) {
                    rejectedRows += 1;
                    errors.push(rowError(row.__rowNumber ?? index + 2, error));
                }
            }
        }

        const run = await tx.businessImportRun.create({
            data: {
                companyId: context.companyId,
                type: importData.type,
                fileName: importData.fileName,
                totalRows: acceptedRows + rejectedRows,
                acceptedRows,
                rejectedRows,
                errors,
                importedById: context.userId,
            },
        });
        await tx.auditLog.create({
            data: {
                companyId: context.companyId,
                userId: context.userId,
                action: "BUSINESS_DATA_IMPORTED",
                entity: "BusinessImportRun",
                entityId: run.id,
                details: {
                    type: importData.type,
                    sourceFormat: importData.sourceFormat,
                    acceptedRows,
                    rejectedRows,
                },
            },
        });
        await recordIntegrationLog(tx, {
            companyId: context.companyId,
            userId: context.userId,
            integrationType: importData.type,
            operation: "IMPORT",
            status: rejectedRows > 0 ? "PARTIAL" : "IMPORTED",
            sourceId: run.id,
            fileName: run.fileName,
            totalRows: run.totalRows,
            successRows: acceptedRows,
            errorRows: rejectedRows,
            message: `Importacao ${importData.sourceFormat} de dados de negocio concluida com validacao por linha.`,
        });

        return {
            run,
            sourceFormat: importData.sourceFormat,
            acceptedRows,
            rejectedRows,
            errors,
        };
    });
}
