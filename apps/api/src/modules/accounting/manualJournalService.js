/**
 * @file Service de lançamentos manuais da MF2.
 */

import { randomUUID } from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";
import {
    parseJournalAttachment,
    removeJournalAttachmentFile,
    storeJournalAttachmentFile,
} from "./journalAttachmentStorage.js";

const MANUAL_SOURCE = "MANUAL";

/**
 * Valida lançamento manual equilibrado.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {object} Lançamento normalizado.
 */
export function parseManualJournal(input) {
    const entryDate = new Date(String(input?.entryDate ?? ""));
    const description = String(input?.description ?? "").trim() || "Lançamento manual";
    const lines = Array.isArray(input?.lines) ? input.lines : [];
    const parsed = lines.map((line) => {
        const accountId = String(line?.accountId ?? "").trim();
        const debitCents = Number(line?.debitCents ?? 0);
        const creditCents = Number(line?.creditCents ?? 0);
        const memo = String(line?.memo ?? "").trim() || null;

        if (!accountId) {
            throw httpError(400, "ACCOUNT_REQUIRED", "Todas as linhas precisam de conta SNC");
        }
        if (!Number.isInteger(debitCents) || !Number.isInteger(creditCents) || debitCents < 0 || creditCents < 0) {
            throw httpError(400, "INVALID_JOURNAL_LINE_AMOUNT", "Os valores da linha têm de ser cêntimos positivos");
        }
        if ((debitCents === 0 && creditCents === 0) || (debitCents > 0 && creditCents > 0)) {
            throw httpError(400, "INVALID_JOURNAL_LINE_SIDE", "Cada linha tem débito ou crédito, não ambos");
        }
        return { accountId, debitCents, creditCents, memo };
    });
    const debit = parsed.reduce((sum, line) => sum + line.debitCents, 0);
    const credit = parsed.reduce((sum, line) => sum + line.creditCents, 0);

    if (Number.isNaN(entryDate.getTime())) {
        throw httpError(400, "INVALID_ENTRY_DATE", "Data do lançamento inválida");
    }
    if (parsed.length < 2 || debit !== credit) {
        throw httpError(400, "JOURNAL_NOT_BALANCED", "O lançamento tem de estar equilibrado");
    }

    return { entryDate, description, lines: parsed };
}

/**
 * Garante que todas as contas usadas num lançamento pertencem à empresa ativa antes de gravar movimentos.
 *
 * @param tx - Transação Prisma usada pela operação.
 * @param companyId - Identificador da empresa ativa.
 * @param lines - Linhas de negócio a validar ou agregar.
 * @returns Promise resolvida quando todas as contas pertencem à empresa.
 */
async function assertAccountsBelongToCompany(tx, companyId, lines) {
    const accountIds = [...new Set(lines.map((line) => line.accountId))];
    const accounts = await tx.account.findMany({
        where: { id: { in: accountIds }, companyId, isActive: true },
    });
    if (accounts.length !== accountIds.length) {
        throw httpError(400, "ACCOUNT_NOT_FOUND", "Conta SNC inválida para esta empresa");
    }
}

/**
 * Cria um lançamento manual equilibrado dentro da empresa ativa.
 * A função valida período fiscal, contas usadas e anexo antes de gravar movimentos.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {unknown} input - Payload JSON.
 * @returns {Promise<object>} Lançamento criado.
 */
export async function createManualJournal(prisma, companyId, userId, input) {
    const journal = parseManualJournal(input);
    await assertOpenFiscalPeriod(prisma, {
        companyId,
        documentDate: journal.entryDate,
    });

    return prisma.$transaction(async (tx) => {
        await assertAccountsBelongToCompany(tx, companyId, journal.lines);
        const entry = await tx.journalEntry.create({
            data: {
                companyId,
                source: MANUAL_SOURCE,
                sourceId: randomUUID(),
                entryDate: journal.entryDate,
                description: journal.description,
                createdById: userId,
                lines: { create: journal.lines },
            },
            include: { lines: { include: { account: true } }, attachments: true },
        });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "MANUAL_JOURNAL_CREATED",
                entity: "JournalEntry",
                entityId: entry.id,
            },
        });
        return entry;
    });
}

/**
 * Consulta lançamento manual da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} id - Lançamento.
 * @returns {Promise<object>} Lançamento.
 */
export async function getManualJournal(prisma, companyId, id) {
    const entry = await prisma.journalEntry.findFirst({
        where: { id, companyId, source: MANUAL_SOURCE },
        include: { lines: { include: { account: true } }, attachments: true },
    });
    if (!entry) {
        throw httpError(404, "MANUAL_JOURNAL_NOT_FOUND", "Lançamento manual não encontrado");
    }
    return entry;
}

/**
 * Edita lançamento manual e substitui linhas.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Lançamento.
 * @param {unknown} input - Payload JSON.
 * @returns {Promise<object>} Lançamento atualizado.
 */
export async function updateManualJournal(prisma, companyId, userId, id, input) {
    const journal = parseManualJournal(input);
    const current = await getManualJournal(prisma, companyId, id);
    await assertOpenFiscalPeriod(prisma, { companyId, documentDate: current.entryDate });
    await assertOpenFiscalPeriod(prisma, { companyId, documentDate: journal.entryDate });

    return prisma.$transaction(async (tx) => {
        await assertAccountsBelongToCompany(tx, companyId, journal.lines);
        await tx.journalEntryLine.deleteMany({ where: { journalEntryId: id } });
        const entry = await tx.journalEntry.update({
            where: { id },
            data: {
                entryDate: journal.entryDate,
                description: journal.description,
                lines: { create: journal.lines },
            },
            include: { lines: { include: { account: true } }, attachments: true },
        });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "MANUAL_JOURNAL_UPDATED",
                entity: "JournalEntry",
                entityId: entry.id,
            },
        });
        return entry;
    });
}

/**
 * Regista anexo privado em lançamento manual.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Lançamento.
 * @param {unknown} input - Payload JSON.
 * @param {{ storageRoot?: string }} options - Opções internas/testes.
 * @returns {Promise<object>} Anexo criado.
 */
export async function addManualJournalAttachment(
    prisma,
    companyId,
    userId,
    id,
    input,
    options = {},
) {
    await getManualJournal(prisma, companyId, id);
    const { fileBuffer, ...attachment } = parseJournalAttachment(input);
    await storeJournalAttachmentFile(
        attachment.storageKey,
        fileBuffer,
        options.storageRoot,
    );

    try {
        return await prisma.$transaction(async (tx) => {
            const created = await tx.journalAttachment.create({
                data: {
                    companyId,
                    journalEntryId: id,
                    uploadedById: userId,
                    ...attachment,
                },
            });
            await tx.auditLog.create({
                data: {
                    companyId,
                    userId,
                    action: "MANUAL_JOURNAL_ATTACHMENT_ADDED",
                    entity: "JournalEntry",
                    entityId: id,
                    details: { attachmentId: created.id, fileName: created.fileName },
                },
            });
            return created;
        });
    } catch (error) {
        await removeJournalAttachmentFile(
            attachment.storageKey,
            options.storageRoot,
        );
        throw error;
    }
}
