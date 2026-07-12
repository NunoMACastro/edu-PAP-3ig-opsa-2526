/**
 * @file Service de importação CSV/Excel de clientes, fornecedores, artigos e extratos.
 */

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { httpError } from "../../lib/httpErrors.js";
import {
    chunkValues,
    createManyInBatches,
} from "../../lib/batchPersistence.js";
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
 * Normaliza uma linha de dados mestre antes de qualquer escrita.
 *
 * @param {string} type - Tipo canónico da importação.
 * @param row - Linha de dados a processar.
 * @returns Dados persistíveis já validados.
 */
function normalizeMasterRow(type, row) {
    if (type === "CUSTOMERS") return validateCustomerPayload(row);
    if (type === "SUPPLIERS") return validateSupplierPayload(row);
    return validateItemPayload({
        ...row,
        costCents: Number(row.costCents),
        priceCents: Number(row.priceCents),
        vatRateBps: Number(row.vatRateBps),
    });
}

/**
 * Devolve a chave natural usada pelo upsert, ou null para entidades sem NIF.
 *
 * @param {string} type - Tipo canónico.
 * @param {object} data - Linha validada.
 * @returns {string | null} Chave natural.
 */
function naturalKey(type, data) {
    if (type === "ITEMS") return data.sku;
    return data.nif || null;
}

const BULK_UPSERT_CONFIG = Object.freeze({
    CUSTOMERS: {
        table: "Customer",
        conflictKey: "nif",
        baseColumns: [
            "name",
            "nif",
            "email",
            "phone",
            "addressLine",
            "postalCode",
            "city",
        ],
        optionalColumns: ["country", "saftAccountId", "selfBillingIndicator"],
    },
    SUPPLIERS: {
        table: "Supplier",
        conflictKey: "nif",
        baseColumns: [
            "name",
            "nif",
            "email",
            "phone",
            "addressLine",
            "postalCode",
            "city",
        ],
        optionalColumns: ["country", "saftAccountId", "selfBillingIndicator"],
    },
    ITEMS: {
        table: "Item",
        conflictKey: "sku",
        baseColumns: [
            "sku",
            "name",
            "type",
            "costCents",
            "priceCents",
            "vatRateBps",
        ],
        optionalColumns: ["unitOfMeasure"],
    },
});

/**
 * Constrói um valor SQL parametrizado, acrescentando apenas o cast fixo do enum.
 *
 * @param {string} type - Tipo de importação canónico.
 * @param {string} column - Coluna hardcoded da configuração.
 * @param {unknown} value - Valor já validado.
 * @returns {import("@prisma/client").Prisma.Sql} Fragmento parametrizado.
 */
function bulkValue(type, column, value) {
    return type === "ITEMS" && column === "type"
        ? Prisma.sql`${value}::"ItemType"`
        : Prisma.sql`${value}`;
}

/**
 * Executa bulk upsert PostgreSQL em grupos com o mesmo conjunto de campos.
 *
 * Campos SAF-T omitidos não são apagados num registo existente; campos
 * explicitamente enviados como `null` entram no grupo e são limpos, mantendo
 * a semântica anterior do update Prisma. Todos os nomes SQL são constantes do
 * código e todos os valores permanecem parametrizados.
 *
 * @param {object} tx - Transação Prisma real.
 * @param {string} companyId - Empresa derivada da sessão.
 * @param {string} type - CUSTOMERS, SUPPLIERS ou ITEMS.
 * @param {object[]} values - Última versão validada de cada chave natural.
 * @returns {Promise<void>}
 */
async function bulkUpsertMasterRows(tx, companyId, type, values) {
    if (values.length === 0) return;
    if (typeof tx.$executeRaw !== "function") {
        throw new TypeError("Bulk upsert exige uma transação Prisma PostgreSQL.");
    }
    const config = BULK_UPSERT_CONFIG[type];
    if (!config) throw new TypeError("Tipo de bulk upsert inválido.");

    const groups = new Map();
    for (const value of values) {
        const presentOptional = config.optionalColumns.filter((column) =>
            Object.hasOwn(value, column),
        );
        const signature = presentOptional.join("|");
        if (!groups.has(signature)) {
            groups.set(signature, {
                columns: [...config.baseColumns, ...presentOptional],
                values: [],
            });
        }
        groups.get(signature).values.push(value);
    }

    for (const group of groups.values()) {
        const insertColumns = ["id", "companyId", ...group.columns, "updatedAt"];
        const mutableColumns = group.columns.filter(
            (column) => column !== config.conflictKey,
        );
        const columnSql = Prisma.join(
            insertColumns.map((column) => Prisma.raw(`"${column}"`)),
        );
        const updateSql = Prisma.join(
            [
                ...mutableColumns.map((column) =>
                    Prisma.raw(`"${column}" = EXCLUDED."${column}"`),
                ),
                Prisma.raw('"updatedAt" = EXCLUDED."updatedAt"'),
            ],
        );

        for (const batch of chunkValues(group.values)) {
            const now = new Date();
            const rowsSql = Prisma.join(
                batch.map((value) =>
                    Prisma.sql`(${Prisma.join([
                        Prisma.sql`${randomUUID()}`,
                        Prisma.sql`${companyId}`,
                        ...group.columns.map((column) =>
                            bulkValue(type, column, value[column]),
                        ),
                        Prisma.sql`${now}`,
                    ])})`,
                ),
            );
            await tx.$executeRaw(Prisma.sql`
                INSERT INTO ${Prisma.raw(`"${config.table}"`)} (${columnSql})
                VALUES ${rowsSql}
                ON CONFLICT ("companyId", ${Prisma.raw(`"${config.conflictKey}"`)})
                DO UPDATE SET ${updateSql}
            `);
        }
    }
}

/**
 * Persiste linhas validadas com inserts em massa e upserts limitados.
 *
 * Linhas repetidas com a mesma chave contam como aceites, tal como no fluxo
 * sequencial anterior, mas apenas a última versão é escrita (mesmo estado final).
 *
 * @param {object} tx - Transação Prisma.
 * @param {string} companyId - Empresa derivada da sessão.
 * @param {string} type - Tipo canónico.
 * @param {Array<{data: object}>} rows - Linhas previamente validadas.
 * @returns {Promise<void>} Promise resolvida após todas as escritas.
 */
async function persistMasterRows(tx, companyId, type, rows) {
    const model = type === "CUSTOMERS"
        ? tx.customer
        : type === "SUPPLIERS"
            ? tx.supplier
            : tx.item;
    const withoutNaturalKey = [];
    const keyed = new Map();

    for (const row of rows) {
        const key = naturalKey(type, row.data);
        if (key) keyed.set(key, row.data);
        else withoutNaturalKey.push({ companyId, ...row.data });
    }

    await createManyInBatches(model, withoutNaturalKey);
    await bulkUpsertMasterRows(tx, companyId, type, [...keyed.values()]);
}

/**
 * Valida todas as linhas e conserva erros associados à linha original.
 *
 * @param {string} type - Tipo canónico.
 * @param {object[]} rows - Linhas parseadas.
 * @returns {{validRows: Array<{data: object}>, errors: object[]}} Resultado da validação.
 */
function validateMasterRows(type, rows) {
    const validRows = [];
    const errors = [];
    for (const [index, row] of rows.entries()) {
        try {
            validRows.push({ data: normalizeMasterRow(type, row) });
        } catch (error) {
            errors.push(rowError(row.__rowNumber ?? index + 2, error));
        }
    }
    return { validRows, errors };
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
    await createManyInBatches(
        tx.bankStatementLine,
        deduplicated.rows.map((row) => ({
            companyId: context.companyId,
            importId: imported.id,
            treasuryAccountId: account.id,
            entryDate: row.entryDate,
            description: row.description,
            reference: row.reference,
            amountCents: row.amountCents,
            raw: row.raw,
        })),
    );
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
            const validated = validateMasterRows(importData.type, importData.rows);
            await persistMasterRows(
                tx,
                context.companyId,
                importData.type,
                validated.validRows,
            );
            acceptedRows = validated.validRows.length;
            rejectedRows = validated.errors.length;
            errors = validated.errors;
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
