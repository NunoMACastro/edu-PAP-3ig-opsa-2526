// apps/api/src/modules/treasury/statementImportService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Verifica se duas datas estao dentro da tolerância de reconciliação do MVP.
 *
 * @param {Date} a Data da linha bancária.
 * @param {Date} b Data do recebimento ou pagamento.
 * @returns {boolean} True quando a diferença e até três dias.
 */
function withinThreeDays(a, b) {
    return Math.abs(a.getTime() - b.getTime()) <= 3 * 86400000;
}

/**
 * Procura recebimentos e pagamentos candidatos para uma linha de extrato.
 *
 * Valores positivos procuram `Receipt`; valores negativos procuram `Payment`. A função devolve apenas
 * sugestões, não altera documentos nem marca movimentos como reconciliados.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx Transação Prisma.
 * @param {string} companyId Empresa ativa.
 * @param {{ bookedAt: Date, amountCents: number }} row Linha normalizada do extrato.
 * @returns {Promise<Array<{ targetType: "RECEIPT" | "PAYMENT", targetId: string, confidence: number, reason: string }>>} Sugestões candidatas.
 */
async function findMatches(tx, companyId, row) {
    const [receipts, payments] = await Promise.all([
        tx.receipt.findMany({ where: { companyId, amountCents: Math.abs(row.amountCents) }, select: { id: true, receivedAt: true } }),
        tx.payment.findMany({ where: { companyId, amountCents: Math.abs(row.amountCents) }, select: { id: true, paidAt: true } }),
    ]);

    return [
        ...receipts.filter((item) => row.amountCents > 0 && withinThreeDays(row.bookedAt, item.receivedAt)).map((item) => ({ targetType: "RECEIPT", targetId: item.id, confidence: 90, reason: "Valor igual e data próxima de recebimento" })),
        ...payments.filter((item) => row.amountCents < 0 && withinThreeDays(row.bookedAt, item.paidAt)).map((item) => ({ targetType: "PAYMENT", targetId: item.id, confidence: 90, reason: "Valor igual e data próxima de pagamento" })),
    ];
}

/**
 * Importa um extrato bancário textual e cria sugestões de reconciliação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, payload: { treasuryAccountId: string, fileName: string, format: "CSV" | "OFX", rows: Array<{ bookedAt: Date, description: string, reference: string | null, amountCents: number }> } }} input Contexto seguro e payload validado.
 * @returns {Promise<object>} Importação criada com linhas e sugestões.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa ou 404 quando a conta não pertence a empresa.
 */
export async function importBankStatement(prisma, { companyId, userId, payload }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const account = await prisma.treasuryAccount.findFirst({ where: { id: payload.treasuryAccountId, companyId, isActive: true } });
    if (!account) throw httpError(404, "TREASURY_ACCOUNT_NOT_FOUND", "Conta de tesouraria não encontrada");

    return prisma.$transaction(async (tx) => {
        // A importação funciona como log de integração: quem importou, quando, formato e contagem.
        const statementImport = await tx.bankStatementImport.create({
            data: {
                companyId,
                treasuryAccountId: account.id,
                fileName: payload.fileName,
                format: payload.format,
                status: "IMPORTED",
                totalLines: payload.rows.length,
                validLines: payload.rows.length,
                errorLines: 0,
                importedById: userId,
            },
        });

        const createdLines = [];
        for (const row of payload.rows) {
            const line = await tx.bankStatementLine.create({ data: { ...row, companyId, importId: statementImport.id } });
            const matches = await findMatches(tx, companyId, row);
            for (const match of matches) {
                // A sugestão fica persistida como SUGGESTED; nenhum pagamento/recebimento é confirmado aqui.
                await tx.bankReconciliationSuggestion.create({ data: { ...match, companyId, statementLineId: line.id } });
            }
            createdLines.push({ ...line, suggestions: matches });
        }

        return { ...statementImport, lines: createdLines };
    });
}