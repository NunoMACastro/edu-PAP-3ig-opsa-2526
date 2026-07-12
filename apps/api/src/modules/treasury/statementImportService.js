/**
 * @file Service de importação de extratos e sugestões de reconciliação.
 */

import { randomUUID } from "node:crypto";
import {
    createManyInBatches,
    mapInBatches,
} from "../../lib/batchPersistence.js";
import { httpError } from "../../lib/httpErrors.js";
import { uploadExtension } from "../../lib/uploadPolicy.js";
import { recordIntegrationLog } from "../integrations/integrationLogService.js";
import { parseImportFileRows } from "../imports/importFileParser.js";
import {
    RECONCILIATION_BUDGET_MS,
    RECONCILIATION_MAX_CANDIDATES,
    limitReconciliationCandidates,
    measureReconciliation,
} from "./reconciliationPerformance.js";
import { validateStatementImportPayload } from "./statementImportValidators.js";

const DEFAULT_IMPORT_PAGE_SIZE = 50;
const MAX_IMPORT_PAGE_SIZE = 100;

/**
 * Converte o buffer multipart no contrato interno do parser de domínio.
 * O service exige sempre bytes reais; jobs e testes não têm um atalho JSON
 * que possa divergir da validação aplicada pela rota HTTP.
 *
 * @param {unknown} input - Payload interno ou descriptor binário multipart.
 * @returns {Promise<unknown>} Payload pronto para o validator de domínio.
 */
async function prepareStatementImportInput(input) {
    if (!input || typeof input !== "object" || !Buffer.isBuffer(input.fileBuffer)) {
        throw httpError(
            400,
            "STATEMENT_FILE_REQUIRED",
            "Ficheiro multipart de extrato obrigatório.",
        );
    }

    const extension = uploadExtension(input.fileName);
    if (extension === ".xlsx") {
        const parsed = await parseImportFileRows({
            fileName: input.fileName,
            fileBuffer: input.fileBuffer,
            xlsxTimeoutMs: input.xlsxTimeoutMs,
        });
        return { ...input, format: parsed.sourceFormat, rows: parsed.rows };
    }
    if (extension !== ".csv" && extension !== ".ofx") {
        throw httpError(
            400,
            "INVALID_STATEMENT_FORMAT",
            "Formato de extrato inválido.",
        );
    }

    let content;
    try {
        if (extension === ".csv") {
            content = new TextDecoder("utf-8", { fatal: true }).decode(
                input.fileBuffer,
            );
        } else {
            const header = input.fileBuffer.subarray(0, 1024).toString("latin1");
            const declaresUtf8 =
                /\bENCODING\s*:\s*UTF-?8\b/i.test(header) ||
                /\bencoding\s*=\s*["']UTF-?8["']/i.test(header);
            content = new TextDecoder(
                declaresUtf8 ? "utf-8" : "windows-1252",
                { fatal: true },
            ).decode(input.fileBuffer);
        }
    } catch {
        throw httpError(
            400,
            "INVALID_STATEMENT_ENCODING",
            extension === ".csv"
                ? "O CSV deve usar UTF-8 válido."
                : "O encoding declarado no OFX é inválido.",
        );
    }
    return {
        ...input,
        format: extension === ".csv" ? "CSV" : "OFX",
        content,
    };
}

/**
 * Lista importações bancárias de forma paginada para permitir recuperar o fluxo após refresh.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, cursor?: unknown, limit?: unknown }} input - Empresa e cursor opcional.
 * @returns {Promise<{items: object[], pageInfo: {nextCursor: string | null, hasNextPage: boolean}}>} Página de importações.
 */
export async function listBankStatementImports(prisma, input) {
    const requestedLimit = input.limit == null ? DEFAULT_IMPORT_PAGE_SIZE : Number(input.limit);
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > MAX_IMPORT_PAGE_SIZE) {
        throw httpError(400, "INVALID_PAGE_LIMIT", "O limite deve estar entre 1 e 100");
    }

    const cursor = String(input.cursor ?? "").trim() || null;
    if (cursor) {
        const ownedCursor = await prisma.bankStatementImport.findFirst({
            where: { id: cursor, companyId: input.companyId },
            select: { id: true },
        });
        if (!ownedCursor) {
            throw httpError(400, "INVALID_CURSOR", "Cursor de importação inválido");
        }
    }

    const rows = await prisma.bankStatementImport.findMany({
        where: { companyId: input.companyId },
        include: { treasuryAccount: true },
        orderBy: [{ importedAt: "desc" }, { id: "desc" }],
        take: requestedLimit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasNextPage = rows.length > requestedLimit;
    const items = hasNextPage ? rows.slice(0, requestedLimit) : rows;

    return {
        items,
        pageInfo: {
            nextCursor: hasNextPage ? items.at(-1)?.id ?? null : null,
            hasNextPage,
        },
    };
}

/**
 * Devolve uma importação com linhas e sugestões, sempre limitada à empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, importId: string }} input - Contexto multiempresa.
 * @returns {Promise<object>} Importação recuperável pelo frontend.
 */
export async function getBankStatementImport(prisma, input) {
    const statementImport = await prisma.bankStatementImport.findFirst({
        where: { id: input.importId, companyId: input.companyId },
        include: {
            treasuryAccount: true,
            lines: {
                include: { suggestions: true },
                orderBy: [{ entryDate: "asc" }, { id: "asc" }],
            },
        },
    });
    if (!statementImport) {
        throw httpError(404, "BANK_STATEMENT_IMPORT_NOT_FOUND", "Importação não encontrada");
    }
    return statementImport;
}

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
 * Normaliza o limite opcional de candidatos indicado pelo cliente.
 *
 * @param {string | number | null | undefined} value - Valor recebido no body.
 * @returns {number} Limite normalizado.
 */
function normalizeCandidateLimit(value) {
    if (value === undefined || value === null || value === "") {
        return RECONCILIATION_MAX_CANDIDATES;
    }

    const parsed = Number(value);
    if (
        !Number.isInteger(parsed) ||
        parsed < 1 ||
        parsed > RECONCILIATION_MAX_CANDIDATES
    ) {
        throw httpError(
            400,
            "INVALID_RECONCILIATION_LIMIT",
            "O limite deve estar entre 1 e 250",
        );
    }

    return parsed;
}

/**
 * Calcula a pontuacao de um recebimento candidato.
 *
 * @param {object} line - Linha de extrato usada como origem da sugestao.
 * @param {object} receipt - Recebimento interno candidato.
 * @returns {object} Sugestao pronta a devolver pela API.
 */
function scoreReceiptCandidate(line, receipt) {
    const referenceMatched = referenceMatches(line.reference, receipt.reference);

    return {
        targetType: "RECEIPT",
        targetId: receipt.id,
        amountCents: receipt.amountCents,
        confidenceBps: referenceMatched ? 9500 : 8000,
        reason: referenceMatched
            ? "Valor, data e referência coincidem com um recebimento."
            : "Valor e data coincidem com um recebimento dentro da tolerância.",
    };
}

/**
 * Calcula a pontuacao de um pagamento candidato.
 *
 * @param {object} line - Linha de extrato usada como origem da sugestao.
 * @param {object} payment - Pagamento interno candidato.
 * @returns {object} Sugestao pronta a devolver pela API.
 */
function scorePaymentCandidate(line, payment) {
    const referenceMatched = referenceMatches(line.reference, payment.reference);

    return {
        targetType: "PAYMENT",
        targetId: payment.id,
        amountCents: payment.amountCents,
        confidenceBps: referenceMatched ? 9500 : 8000,
        reason: referenceMatched
            ? "Valor, data e referência coincidem com um pagamento."
            : "Valor e data coincidem com um pagamento dentro da tolerância.",
    };
}

/**
 * Procura candidatos financeiros compativeis com uma linha de extrato.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, line: object, candidateLimit: number }} input - Pedido interno.
 * @returns {Promise<object[]>} Candidatos ordenaveis por score.
 */
async function findReconciliationCandidates(prisma, input) {
    const dateWindow = {
        gte: startOfTolerance(input.line.entryDate),
        lte: endOfTolerance(input.line.entryDate),
    };
    const take = input.candidateLimit + 1;

    if (input.line.amountCents > 0) {
        const receipts = await prisma.receipt.findMany({
            where: {
                companyId: input.companyId,
                amountCents: input.line.amountCents,
                receivedAt: dateWindow,
            },
            orderBy: { receivedAt: "asc" },
            take,
        });

        return receipts.map((receipt) =>
            scoreReceiptCandidate(input.line, receipt),
        );
    }

    const payments = await prisma.payment.findMany({
        where: {
            companyId: input.companyId,
            amountCents: Math.abs(input.line.amountCents),
            paidAt: dateWindow,
        },
        orderBy: { paidAt: "asc" },
        take,
    });

    return payments.map((payment) =>
        scorePaymentCandidate(input.line, payment),
    );
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
 * Sugere correspondencias para uma linha de extrato sem confirmar reconciliacao.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, input: { statementLineId?: string, candidateLimit?: string | number } }} context - Contexto autenticado.
 * @returns {Promise<{ statementLineId: string, suggestions: object[], status: string, durationMs: number, withinBudget: boolean, budgetMs: number }>} Sugestoes medidas.
 */
export async function suggestReconciliations(prisma, context) {
    const statementLineId = String(context.input?.statementLineId ?? "").trim();
    if (!statementLineId) {
        throw httpError(
            400,
            "STATEMENT_LINE_REQUIRED",
            "Indica a linha de extrato a reconciliar",
        );
    }

    const line = await prisma.bankStatementLine.findFirst({
        where: {
            id: statementLineId,
            companyId: context.companyId,
        },
    });
    if (!line) {
        throw httpError(
            404,
            "BANK_STATEMENT_LINE_NOT_FOUND",
            "Linha de extrato não encontrada",
        );
    }

    const candidateLimit = normalizeCandidateLimit(context.input?.candidateLimit);
    const candidates = await findReconciliationCandidates(prisma, {
        companyId: context.companyId,
        line,
        candidateLimit,
    });
    const { selected, partial } = limitReconciliationCandidates(
        candidates,
        candidateLimit,
    );
    const measured = await measureReconciliation(async () => {
        // A sugestao apenas ordena candidatos; confirmar continua a ser acao do utilizador.
        return selected
            .sort((left, right) => right.confidenceBps - left.confidenceBps)
            .map((candidate) => ({
                statementLineId: line.id,
                ...candidate,
            }));
    });

    return {
        statementLineId: line.id,
        suggestions: measured.result,
        status: partial ? "partial" : "complete",
        durationMs: measured.durationMs,
        withinBudget: measured.withinBudget,
        budgetMs: RECONCILIATION_BUDGET_MS,
    };
}

/**
 * Importa extrato e cria sugestões auditáveis, sem confirmar reconciliação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, input: unknown }} context - Contexto.
 * @returns {Promise<object>} Importação, linhas e sugestões.
 */
export async function importBankStatement(prisma, context) {
    const preparedInput = await prepareStatementImportInput(context.input);
    const data = validateStatementImportPayload(preparedInput);

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

        // IDs gerados pela aplicação permitem criar todas as linhas em bulk e
        // manter a relação com sugestões sem round-trip por linha.
        const importedAt = new Date();
        const lines = deduplicated.rows.map((row) => ({
            id: randomUUID(),
            companyId: context.companyId,
            importId: statementImport.id,
            treasuryAccountId: account.id,
            entryDate: row.entryDate,
            description: row.description,
            reference: row.reference,
            amountCents: row.amountCents,
            raw: row.raw,
            createdAt: importedAt,
        }));
        await createManyInBatches(tx.bankStatementLine, lines);

        // A reconciliação continua apenas sugestiva. As pesquisas são feitas em
        // blocos limitados e as sugestões resultantes são persistidas em bulk.
        const suggestionGroups = await mapInBatches(lines, async (line) => {
            const candidates = await buildSuggestions(tx, context.companyId, line);
            return candidates.map((suggestion) => ({
                id: randomUUID(),
                companyId: context.companyId,
                importId: statementImport.id,
                statementLineId: line.id,
                status: "SUGGESTED",
                createdAt: importedAt,
                ...suggestion,
            }));
        });
        const suggestions = suggestionGroups.flat();
        await createManyInBatches(tx.bankReconciliationSuggestion, suggestions);

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
