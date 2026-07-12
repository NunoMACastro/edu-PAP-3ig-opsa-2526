/**
 * @file Service de lançamentos manuais da MF2.
 */

import { randomUUID } from "node:crypto";
import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";
import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";
import { recordRetainedAuditLog } from "../audit/auditLogService.js";
import { assertRetainedRecordDeletionAllowed } from "../compliance/retentionPolicy.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";
import { prepareJournalAttachment } from "./journalAttachmentStorage.js";

const MANUAL_SOURCE = "MANUAL";
const SAFT_TRANSACTION_TYPES = new Set(["N", "R", "A", "J"]);
const PUBLIC_ATTACHMENT_SELECT = {
    id: true,
    fileName: true,
    mimeType: true,
    sizeBytes: true,
    sha256: true,
    status: true,
    createdAt: true,
};

function serializePublicAttachment(attachment) {
    return Object.fromEntries(
        Object.keys(PUBLIC_ATTACHMENT_SELECT).map((key) => [key, attachment[key]]),
    );
}

async function cleanupPreparedAttachmentObjects(objectStorage, attachment) {
    const keys = [...new Set([attachment.quarantineKey, attachment.storageKey])];
    const results = await Promise.allSettled(keys.map(async (key) => {
        await objectStorage.deleteObject(key);
        if (await objectStorage.objectExists(key)) {
            throw new Error("O objeto do anexo permaneceu no storage após cleanup.");
        }
    }));
    const failures = results
        .filter(({ status }) => status === "rejected")
        .map(({ reason }) => reason);
    if (failures.length > 0) {
        throw new AggregateError(
            failures,
            "Não foi possível confirmar o cleanup dos objetos do anexo.",
        );
    }
}

/**
 * Lista lançamentos manuais da empresa ativa com metadata legível e paginação.
 *
 * `POSTED` é um estado derivado: `JournalEntry` só existe depois de o lançamento
 * equilibrado ser confirmado; o schema não mantém rascunhos nesta tabela.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{cursor?: unknown, limit?: unknown}} page - Paginação pedida.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de referências de lançamentos.
 */
export async function listManualJournals(prisma, companyId, page = {}) {
    const limit = parsePageLimit(page.limit);
    const cursor = decodePageCursor(page.cursor, "date");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "entryDate",
        direction: "desc",
    });
    const baseWhere = { companyId, source: MANUAL_SOURCE };
    const entries = await prisma.journalEntry.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        select: {
            id: true,
            entryDate: true,
            description: true,
            saftTransactionType: true,
            createdAt: true,
            _count: { select: { lines: true, attachments: true } },
        },
        orderBy: [{ entryDate: "desc" }, { id: "desc" }],
        take: limit + 1,
    });
    return buildCursorPage(entries, {
        limit,
        sortField: "entryDate",
        sortType: "date",
        serialize: (entry) => ({
            id: entry.id,
            entryDate: entry.entryDate,
            description: entry.description,
            saftTransactionType: entry.saftTransactionType,
            status: "POSTED",
            reference: `${entry.entryDate.toISOString().slice(0, 10)} — ${entry.description}`,
            lineCount: entry._count.lines,
            attachmentCount: entry._count.attachments,
            createdAt: entry.createdAt,
        }),
    });
}

/**
 * Valida lançamento manual equilibrado.
 *
 * @param {unknown} input - Payload JSON.
 * @returns {object} Lançamento normalizado.
 */
export function parseManualJournal(input) {
    const entryDate = parseStrictDateOnly(input?.entryDate, {
        code: "INVALID_ENTRY_DATE",
        field: "Data do lançamento",
    });
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

    if (parsed.length < 2 || debit !== credit) {
        throw httpError(400, "JOURNAL_NOT_BALANCED", "O lançamento tem de estar equilibrado");
    }
    let saftTransactionType;
    if (Object.hasOwn(input ?? {}, "saftTransactionType")) {
        if (input.saftTransactionType === null || input.saftTransactionType === "") {
            saftTransactionType = null;
        } else {
            saftTransactionType = String(input.saftTransactionType).trim().toUpperCase();
            if (!SAFT_TRANSACTION_TYPES.has(saftTransactionType)) {
                throw httpError(
                    400,
                    "INVALID_SAFT_TRANSACTION_TYPE",
                    "saftTransactionType deve ser N, R, A ou J",
                );
            }
        }
    }

    return { entryDate, description, lines: parsed, saftTransactionType };
}

/**
 * Exige uma justificação curta para substituir linhas contabilísticas.
 *
 * @param {unknown} value - Motivo recebido no body.
 * @returns {string} Motivo normalizado.
 */
function parseRevisionReason(value) {
    const reason = String(value ?? "").trim();
    if (reason.length < 5 || reason.length > 500) {
        throw httpError(
            400,
            "JOURNAL_REVISION_REASON_REQUIRED",
            "Indica um motivo entre 5 e 500 caracteres para alterar o lançamento.",
        );
    }
    return reason;
}

/**
 * Reduz um lançamento ao snapshot contabilístico necessário para histórico.
 *
 * @param {object} entry - Lançamento atual ou dados normalizados futuros.
 * @returns {object} Snapshot JSON sem metadata técnica ou anexos.
 */
function journalSnapshot(entry) {
    return {
        entryDate:
            entry.entryDate instanceof Date
                ? entry.entryDate.toISOString().slice(0, 10)
                : String(entry.entryDate),
        description: entry.description,
        saftTransactionType: entry.saftTransactionType ?? null,
        lines: entry.lines.map((line) => ({
            accountId: line.accountId,
            debitCents: line.debitCents,
            creditCents: line.creditCents,
            memo: line.memo ?? null,
        })),
    };
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
    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "fiscal", companyId);
        const fiscalPeriod = await assertOpenFiscalPeriod(tx, {
            companyId,
            documentDate: journal.entryDate,
        });
        await assertAccountsBelongToCompany(tx, companyId, journal.lines);
        const entry = await tx.journalEntry.create({
            data: {
                companyId,
                source: MANUAL_SOURCE,
                sourceId: randomUUID(),
                entryDate: journal.entryDate,
                description: journal.description,
                saftTransactionType: journal.saftTransactionType ?? null,
                createdById: userId,
                lines: { create: journal.lines },
            },
            include: {
                lines: { include: { account: true } },
                attachments: { select: PUBLIC_ATTACHMENT_SELECT },
            },
        });
        await recordRetainedAuditLog(tx, {
            companyId,
            userId,
            action: "MANUAL_JOURNAL_CREATED",
            entity: "JournalEntry",
            entityId: entry.id,
            periodEndAt: fiscalPeriod.endDate,
            retentionReason: "MANUAL_JOURNAL_CREATE_AUDIT_RETAINED",
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
        include: {
            lines: { include: { account: true } },
            attachments: { select: PUBLIC_ATTACHMENT_SELECT },
        },
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
    const reason = parseRevisionReason(input?.reason);
    return prisma.$transaction(async (tx) => {
        await acquireTransactionLock(tx, "fiscal", companyId);
        const current = await getManualJournal(tx, companyId, id);
        await assertRetainedRecordDeletionAllowed(tx, {
            companyId,
            entity: "JournalEntry",
            entityId: id,
        });
        await assertOpenFiscalPeriod(tx, { companyId, documentDate: current.entryDate });
        const targetFiscalPeriod = await assertOpenFiscalPeriod(tx, {
            companyId,
            documentDate: journal.entryDate,
        });
        await assertAccountsBelongToCompany(tx, companyId, journal.lines);
        const revisedJournal = {
            ...journal,
            saftTransactionType: journal.saftTransactionType === undefined
                ? current.saftTransactionType
                : journal.saftTransactionType,
        };
        const revisionNumber =
            (await tx.journalEntryRevision.count({ where: { journalEntryId: id } })) + 1;
        const revision = await tx.journalEntryRevision.create({
            data: {
                companyId,
                journalEntryId: id,
                revisionNumber,
                snapshotBefore: journalSnapshot(current),
                snapshotAfter: journalSnapshot(revisedJournal),
                reason,
                changedById: userId,
            },
        });
        await tx.journalEntryLine.deleteMany({ where: { journalEntryId: id } });
        const entry = await tx.journalEntry.update({
            where: { id },
            data: {
                entryDate: journal.entryDate,
                description: journal.description,
                ...(journal.saftTransactionType !== undefined
                    ? { saftTransactionType: journal.saftTransactionType }
                    : {}),
                lines: { create: journal.lines },
            },
            include: {
                lines: { include: { account: true } },
                attachments: { select: PUBLIC_ATTACHMENT_SELECT },
            },
        });
        await recordRetainedAuditLog(tx, {
            companyId,
            userId,
            action: "MANUAL_JOURNAL_UPDATED",
            entity: "JournalEntry",
            entityId: entry.id,
            periodEndAt: targetFiscalPeriod.endDate,
            retentionReason: "MANUAL_JOURNAL_REVISION_AUDIT_RETAINED",
            details: {
                revisionId: revision.id,
                revisionNumber,
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
 * @param {object} objectStorage - Adapter S3/local já configurado.
 * @param {object} file - Descriptor produzido pelo parser multipart.
 * @returns {Promise<object>} Anexo criado.
 */
export async function addManualJournalAttachment(
    prisma,
    objectStorage,
    companyId,
    userId,
    id,
    file,
) {
    if (
        !objectStorage ||
        typeof objectStorage.putFile !== "function" ||
        typeof objectStorage.copyObject !== "function" ||
        typeof objectStorage.headObject !== "function" ||
        typeof objectStorage.deleteObject !== "function" ||
        typeof objectStorage.objectExists !== "function"
    ) {
        throw new TypeError("Object storage com promoção e verificação é obrigatório.");
    }
    await getManualJournal(prisma, companyId, id);
    const attachment = prepareJournalAttachment(file);
    const existing = await prisma.journalAttachment.findFirst({
        where: {
            companyId,
            journalEntryId: id,
            idempotencyKey: attachment.sha256,
            status: "ACTIVE",
        },
    });
    if (existing) return serializePublicAttachment(existing);

    try {
        await objectStorage.putFile({
            key: attachment.quarantineKey,
            filePath: attachment.tempPath,
            contentType: attachment.mimeType,
            metadata: { sha256: attachment.sha256, status: "quarantine" },
        });
        await objectStorage.copyObject(
            attachment.quarantineKey,
            attachment.storageKey,
        );
        const promoted = await objectStorage.headObject(attachment.storageKey);
        if (
            promoted?.contentLength !== attachment.sizeBytes ||
            promoted?.contentType !== attachment.mimeType ||
            promoted?.metadata?.sha256 !== attachment.sha256
        ) {
            throw httpError(
                503,
                "ATTACHMENT_STORAGE_PROMOTION_UNCONFIRMED",
                "O storage não confirmou a integridade do anexo promovido.",
            );
        }
        await objectStorage.deleteObject(attachment.quarantineKey);

        const created = await prisma.$transaction(async (tx) => {
            await acquireTransactionLock(tx, "fiscal", companyId);
            const journal = await getManualJournal(tx, companyId, id);
            await assertRetainedRecordDeletionAllowed(tx, {
                companyId,
                entity: "JournalEntry",
                entityId: id,
            });
            const fiscalPeriod = await assertOpenFiscalPeriod(tx, {
                companyId,
                documentDate: journal.entryDate,
            });
            const created = await tx.journalAttachment.create({
                data: {
                    companyId,
                    journalEntryId: id,
                    uploadedById: userId,
                    fileName: attachment.fileName,
                    mimeType: attachment.mimeType,
                    sizeBytes: attachment.sizeBytes,
                    storageKey: attachment.storageKey,
                    sha256: attachment.sha256,
                    provider: objectStorage.provider,
                    status: "ACTIVE",
                    storageMetadata: { quarantined: true, promoted: true },
                    idempotencyKey: attachment.sha256,
                },
            });
            await recordRetainedAuditLog(tx, {
                companyId,
                userId,
                action: "MANUAL_JOURNAL_ATTACHMENT_ADDED",
                entity: "JournalEntry",
                entityId: id,
                periodEndAt: fiscalPeriod.endDate,
                retentionReason: "MANUAL_JOURNAL_ATTACHMENT_AUDIT_RETAINED",
                details: {
                    attachmentId: created.id,
                    mimeType: created.mimeType,
                    sizeBytes: created.sizeBytes,
                    sha256: created.sha256,
                },
            });
            return created;
        });
        return serializePublicAttachment(created);
    } catch (error) {
        try {
            await cleanupPreparedAttachmentObjects(objectStorage, attachment);
        } catch (cleanupError) {
            throw new AggregateError(
                [error, cleanupError],
                "A persistência do anexo falhou e o cleanup também falhou.",
                { cause: error },
            );
        }
        if (error?.code === "P2002") {
            const winner = await prisma.journalAttachment.findFirst({
                where: {
                    companyId,
                    journalEntryId: id,
                    idempotencyKey: attachment.sha256,
                    status: "ACTIVE",
                },
            });
            if (winner) return serializePublicAttachment(winner);
        }
        throw error;
    }
}

/**
 * Resolve metadata autorizada e o stream privado de um anexo.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {object} objectStorage - Adapter S3/local.
 * @param {{ companyId: string, journalEntryId: string, attachmentId: string }} input - Ownership server-side.
 * @returns {Promise<{ attachment: object, object: object }>} Metadata e stream.
 */
export async function getManualJournalAttachmentDownload(
    prisma,
    objectStorage,
    input,
) {
    if (!input?.companyId || !input?.journalEntryId || !input?.attachmentId) {
        throw httpError(
            400,
            "JOURNAL_ATTACHMENT_CONTEXT_REQUIRED",
            "Empresa, lançamento e anexo são obrigatórios.",
        );
    }
    const attachment = await prisma.journalAttachment.findFirst({
        where: {
            id: input.attachmentId,
            journalEntryId: input.journalEntryId,
            companyId: input.companyId,
            status: "ACTIVE",
        },
    });
    if (!attachment) {
        throw httpError(404, "JOURNAL_ATTACHMENT_NOT_FOUND", "Anexo não encontrado.");
    }
    let object;
    try {
        object = await objectStorage.getObject(attachment.storageKey);
    } catch {
        throw httpError(
            503,
            "JOURNAL_ATTACHMENT_UNAVAILABLE",
            "O anexo não está disponível no storage privado.",
        );
    }
    if (
        object?.contentLength !== attachment.sizeBytes ||
        object?.contentType !== attachment.mimeType ||
        object?.metadata?.sha256 !== attachment.sha256 ||
        !object?.body ||
        typeof object.body.pipe !== "function"
    ) {
        object?.body?.destroy?.();
        throw httpError(
            409,
            "JOURNAL_ATTACHMENT_INTEGRITY_FAILED",
            "O objeto do anexo não corresponde à metadata contabilística.",
        );
    }
    return { attachment, object };
}
