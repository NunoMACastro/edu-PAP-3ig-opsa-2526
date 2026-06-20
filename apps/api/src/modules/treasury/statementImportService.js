/**
 * @file Service de importação de extratos e sugestões de reconciliação.
 */

import { httpError } from "../../lib/httpErrors.js";
import { recordIntegrationLog } from "../integrations/integrationLogService.js";
import { validateStatementImportPayload } from "./statementImportValidators.js";

/**
 * Calcula o limite inferior da janela de tolerância usada nas sugestões de reconciliação.
 *
 * @param date - Data usada no cálculo.
 * @returns Data inicial da janela de tolerância.
 */
function startOfTolerance(date) {
    return new Date(date.getTime() - 5 * 86_400_000);
}

/**
 * Calcula o limite superior da janela de tolerância usada nas sugestões de reconciliação.
 *
 * @param date - Data usada no cálculo.
 * @returns Data final da janela de tolerância.
 */
function endOfTolerance(date) {
    return new Date(date.getTime() + 5 * 86_400_000);
}

/**
 * Compara referências externas de forma case-insensitive para reforçar a confiança da sugestão.
 *
 * @param reference - Referência externa a comparar.
 * @param candidateReference - Referência candidata a comparar.
 * @returns Booleano que indica se as referências são equivalentes.
 */
function referenceMatches(reference, candidateReference) {
    if (!reference || !candidateReference) return false;
    return String(reference).trim().toUpperCase() ===
        String(candidateReference).trim().toUpperCase();
}

/**
 * Cria uma chave estável para detetar linhas de extrato duplicadas no mesmo ficheiro.
 *
 * @param row - Linha de dados a processar.
 * @returns Chave estável usada para detetar duplicados.
 */
function statementLineKey(row) {
    return [
        row.entryDate.toISOString(),
        row.amountCents,
        row.description.trim().toUpperCase(),
    ].join("|");
}

/**
 * Determina se a importação ficou completa ou parcial conforme as linhas rejeitadas.
 *
 * @param rejectedLines - Número de linhas rejeitadas na importação.
 * @returns Estado final da importação de extrato.
 */
function statementImportStatus(rejectedLines) {
    return rejectedLines > 0 ? "PARTIAL" : "IMPORTED";
}

/**
 * Remove linhas duplicadas antes de gravar para preservar o contrato de integridade.
 *
 * A base de dados também tem uma constraint composta; esta validação no service
 * permite devolver um resumo parcial em vez de abortar a importação inteira.
 *
 * @param {Array<{ lineNumber?: number, entryDate: Date, amountCents: number, description: string }>} rows - Linhas normalizadas.
 * @returns {{ rows: object[], duplicateErrors: object[] }} Linhas únicas e erros de duplicado.
 */
export function deduplicateStatementRows(rows) {
    const seen = new Set();
    const uniqueRows = [];
    const duplicateErrors = [];

    for (const row of rows) {
        const key = statementLineKey(row);
        if (seen.has(key)) {
            duplicateErrors.push({
                line: row.lineNumber ?? null,
                code: "DUPLICATE_STATEMENT_LINE",
                message: "Linha duplicada no extrato",
            });
            continue;
        }
        seen.add(key);
        uniqueRows.push(row);
    }

    return { rows: uniqueRows, duplicateErrors };
}

/**
 * Procura recebimentos ou pagamentos compatíveis com uma linha bancária para propor reconciliação sem a confirmar automaticamente.
 *
 * @param tx - Transação Prisma usada para consultar dados consistentes.
 * @param companyId - Identificador da empresa ativa.
 * @param line - Linha de extrato bancário a reconciliar por sugestão.
 * @returns Lista de sugestões de reconciliação para a linha bancária.
 */
async function buildSuggestions(tx, companyId, line) {
    const amount = Math.abs(line.amountCents);
    const dateRange = {
        gte: startOfTolerance(line.entryDate),
        lte: endOfTolerance(line.entryDate),
    };

    if (line.amountCents > 0) {
        const receipts = await tx.receipt.findMany({
            where: { companyId, amountCents: amount, receivedAt: dateRange },
            take: 5,
        });
        return receipts.map((receipt) => ({
            targetType: "RECEIPT",
            targetId: receipt.id,
            amountCents: amount,
            confidenceBps: referenceMatches(line.reference, receipt.reference) ? 9500 : 8000,
            reason: "Valor igual e data de recebimento dentro de tolerância de 5 dias",
        }));
    }

    const payments = await tx.payment.findMany({
        where: { companyId, amountCents: amount, paidAt: dateRange },
        take: 5,
    });
    return payments.map((payment) => ({
        targetType: "PAYMENT",
        targetId: payment.id,
        amountCents: amount,
        confidenceBps: referenceMatches(line.reference, payment.reference) ? 9500 : 8000,
        reason: "Valor igual e data de pagamento dentro de tolerância de 5 dias",
    }));
}

/**
 * Importa extrato e cria sugestões auditáveis, sem confirmar reconciliação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, input: unknown }} context - Contexto.
 * @returns {Promise<object>} Importação, linhas e sugestões.
 */
export async function importBankStatement(prisma, context) {
    const data = validateStatementImportPayload(context.input);

    return prisma.$transaction(async (tx) => {
        const account = await tx.treasuryAccount.findFirst({
            where: {
                id: data.treasuryAccountId,
                companyId: context.companyId,
                isActive: true,
            },
        });
        if (!account) {
            throw httpError(
                404,
                "TREASURY_ACCOUNT_NOT_FOUND",
                "Conta de tesouraria não encontrada",
            );
        }

        const deduplicated = deduplicateStatementRows(data.rows);
        const importErrors = [...data.errors, ...deduplicated.duplicateErrors];
        const statementImport = await tx.bankStatementImport.create({
            data: {
                companyId: context.companyId,
                treasuryAccountId: account.id,
                format: data.format,
                fileName: data.fileName,
                status: statementImportStatus(importErrors.length),
                totalLines: data.totalLines,
                acceptedLines: deduplicated.rows.length,
                rejectedLines: importErrors.length,
                errors: importErrors,
                importedById: context.userId,
            },
        });

        const lines = [];
        const suggestions = [];
        for (const row of deduplicated.rows) {
            const line = await tx.bankStatementLine.create({
                data: {
                    companyId: context.companyId,
                    importId: statementImport.id,
                    treasuryAccountId: account.id,
                    entryDate: row.entryDate,
                    description: row.description,
                    reference: row.reference,
                    amountCents: row.amountCents,
                    raw: row.raw,
                },
            });
            lines.push(line);

            // A reconciliação da MF3 é apenas sugestão; não atualiza recebimentos ou pagamentos.
            for (const suggestion of await buildSuggestions(tx, context.companyId, line)) {
                suggestions.push(
                    await tx.bankReconciliationSuggestion.create({
                        data: {
                            companyId: context.companyId,
                            importId: statementImport.id,
                            statementLineId: line.id,
                            status: "SUGGESTED",
                            ...suggestion,
                        },
                    }),
                );
            }
        }

        await tx.auditLog.create({
            data: {
                companyId: context.companyId,
                userId: context.userId,
                action: "BANK_STATEMENT_IMPORTED",
                entity: "BankStatementImport",
                entityId: statementImport.id,
                details: {
                    treasuryAccountId: account.id,
                    acceptedLines: lines.length,
                    rejectedLines: importErrors.length,
                    suggestions: suggestions.length,
                },
            },
        });
        await recordIntegrationLog(tx, {
            companyId: context.companyId,
            userId: context.userId,
            integrationType: "BANK_STATEMENT",
            operation: "IMPORT",
            status: statementImport.status,
            sourceId: statementImport.id,
            fileName: statementImport.fileName,
            totalRows: statementImport.totalLines,
            successRows: statementImport.acceptedLines,
            errorRows: statementImport.rejectedLines,
            message: "Importacao de extrato bancario concluida com sugestoes sem confirmacao automatica.",
        });

        return { import: statementImport, lines, suggestions };
    });
}
