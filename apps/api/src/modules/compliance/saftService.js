/**
 * @file Orquestração fail-closed de exportações SAF-T PT integrais.
 *
 * Este módulo nunca gera XML simplificado. O artefacto é sempre produzido pelo
 * gerador interno e só é persistido READY quando um validador externo atesta a
 * estrutura SAF-T 1.04_01 com um processador XSD 1.1, a reconciliação e a
 * revisão externa aprovada.
 */

import { createHash, randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { recordRetainedAuditLog } from "../audit/auditLogService.js";
import { upsertRetentionHold } from "./retentionPolicy.js";
import { httpError } from "../../lib/httpErrors.js";
import { recordIntegrationLog } from "../integrations/integrationLogService.js";
import {
    assertSaftReadiness,
    assertSaftSourceReadiness,
} from "./saftComplianceChecklist.js";
import {
    SAFT_ENCODING,
    SAFT_NAMESPACE,
    SAFT_VERSION,
    assertOfficialSaftSchema,
    assertSaftExportEnabled,
    sha256Bytes,
} from "./saftSchemaContract.js";
import { generateInternalSaft } from "./saftGenerator.js";

const CONTENT_TYPE = "application/xml";
const READY_STATUS = "READY";
const VALID_STATUS = "VALID";
const APPROVED_STATUS = "APPROVED";
const XSD_PROCESSOR_VERSION = "1.1";

/**
 * Formata uma data persistida como dia civil ISO.
 *
 * @param {Date | string} value - Data Prisma ou ISO.
 * @returns {string} Dia no formato YYYY-MM-DD.
 */
function dateOnly(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw httpError(500, "INVALID_SAFT_STATE", "Data SAF-T persistida inválida.");
    }
    return date.toISOString().slice(0, 10);
}

/**
 * Converte uma data opcional num timestamp público estável.
 *
 * @param {Date | string | null | undefined} value - Data persistida.
 * @returns {string | null} Timestamp ISO ou null.
 */
function optionalIso(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Limita um valor interno a um segmento seguro de object storage.
 *
 * @param {unknown} value - Identificador interno.
 * @returns {string} Segmento sem separadores ou traversal.
 */
function safeStorageSegment(value) {
    const safe = String(value ?? "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
    if (!safe) {
        throw httpError(500, "INVALID_SAFT_STATE", "Identificador SAF-T interno inválido.");
    }
    return safe;
}

/**
 * Confirma que o contexto autenticado necessário foi resolvido pelo backend.
 *
 * @param {object} input - Contexto interno da operação.
 * @returns {void}
 */
function assertInternalContext(input) {
    if (!input?.companyId || !input?.userId) {
        throw httpError(
            400,
            "SAFT_CONTEXT_REQUIRED",
            "Empresa ativa e utilizador autenticado são obrigatórios.",
        );
    }
}

/**
 * Impede consultas sem ownership explícito. O Prisma ignora propriedades
 * `undefined`; validar antes da query evita que uma chamada interna omita por
 * acidente o filtro de empresa.
 *
 * @param {object} input - Empresa ativa e identificador do run.
 * @returns {void}
 */
function assertOwnedRunContext(input) {
    const companyId = typeof input?.companyId === "string"
        ? input.companyId.trim()
        : "";
    const exportId = typeof input?.exportId === "string"
        ? input.exportId.trim()
        : "";
    if (!companyId || !exportId) {
        throw httpError(
            400,
            "SAFT_CONTEXT_REQUIRED",
            "Empresa ativa e exportação SAF-T são obrigatórias.",
        );
    }
}

/**
 * Carrega um período pertencente à empresa ativa e exige fecho contabilístico.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, fiscalPeriodId: string }} input - Ownership backend.
 * @returns {Promise<object>} Período fiscal fechado.
 */
async function loadClosedFiscalPeriod(prisma, input) {
    const period = await prisma.fiscalPeriod.findFirst({
        where: { id: input.fiscalPeriodId, companyId: input.companyId },
    });
    if (!period) {
        throw httpError(404, "FISCAL_PERIOD_NOT_FOUND", "Período fiscal não encontrado.");
    }
    if (period.status !== "CLOSED" || !period.closedAt) {
        throw httpError(
            409,
            "SAFT_FISCAL_PERIOD_NOT_CLOSED",
            "A exportação SAF-T exige um período fiscal fechado.",
        );
    }
    return period;
}

/**
 * Recolhe o snapshot integral necessário ao gerador interno. Todas as queries
 * são company-scoped e ordenadas para manter a reconciliação determinística.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, period: object }} input - Empresa e período fechado.
 * @returns {Promise<object>} Perfil e fontes mínimas company-scoped.
 */
async function loadReadinessSources(prisma, { companyId, period }) {
    const endExclusive = new Date(period.endDate);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    const range = { gte: period.startDate, lt: endExclusive };
    const [
        profile,
        saleDocuments,
        purchaseDocuments,
        allJournalEntries,
        accounts,
        customers,
        suppliers,
        items,
        vatRates,
    ] =
        await Promise.all([
            prisma.companyProfile.findUnique({ where: { companyId } }),
            prisma.saleDocument.findMany({
                where: {
                    companyId,
                    issuedAt: range,
                    status: { in: ["ISSUED", "SETTLED"] },
                },
                include: {
                    customer: true,
                    lines: { include: { item: true, vatRate: true } },
                },
                orderBy: [{ issuedAt: "asc" }, { id: "asc" }],
            }),
            prisma.purchaseDocument.findMany({
                where: {
                    companyId,
                    issuedAt: range,
                    status: { in: ["POSTED", "PAID"] },
                },
                include: {
                    supplier: true,
                    lines: { include: { item: true, vatRate: true } },
                },
                orderBy: [{ issuedAt: "asc" }, { id: "asc" }],
            }),
            prisma.journalEntry.findMany({
                where: { companyId, entryDate: { lt: endExclusive } },
                include: { lines: { include: { account: true } } },
                orderBy: [{ entryDate: "asc" }, { id: "asc" }],
            }),
            prisma.account.findMany({
                where: { companyId },
                orderBy: [{ code: "asc" }, { id: "asc" }],
            }),
            prisma.customer.findMany({
                where: { companyId },
                orderBy: [{ name: "asc" }, { id: "asc" }],
            }),
            prisma.supplier.findMany({
                where: { companyId },
                orderBy: [{ name: "asc" }, { id: "asc" }],
            }),
            prisma.item.findMany({
                where: { companyId },
                orderBy: [{ sku: "asc" }, { id: "asc" }],
            }),
            prisma.vatRate.findMany({
                where: { companyId },
                orderBy: [{ code: "asc" }, { id: "asc" }],
            }),
        ]);
    const periodStart = period.startDate.getTime();
    const journalEntries = [];
    const openingJournalEntries = [];
    for (const entry of allJournalEntries) {
        const target = new Date(entry.entryDate).getTime() < periodStart
            ? openingJournalEntries
            : journalEntries;
        target.push(entry);
    }
    return {
        profile,
        saleDocuments,
        purchaseDocuments,
        openingJournalEntries,
        journalEntries,
        accounts,
        customers,
        suppliers,
        items,
        vatRates,
    };
}

/**
 * Exige um adapter explícito de validação externa. O método legado
 * `generateAndValidate` é aceite apenas como boundary de validação: recebe os
 * bytes internos e nunca pode substituí-los.
 *
 * @param {unknown} pipeline - Adapter operacional injetado.
 * @returns {{ validate?: Function, generateAndValidate?: Function }} Pipeline validado.
 */
function requireExternalPipeline(pipeline) {
    if (
        !pipeline ||
        (typeof pipeline.validate !== "function" &&
            typeof pipeline.generateAndValidate !== "function")
    ) {
        throw httpError(
            503,
            "SAFT_EXTERNAL_VALIDATION_REQUIRED",
            "A exportação SAF-T exige validação externa da estrutura 1.04_01 por um processador XSD 1.1.",
        );
    }
    return pipeline;
}

/**
 * Valida a atestação devolvida pelo pipeline e rejeita substituição dos bytes.
 *
 * @param {Buffer} internalArtifact - Único artefacto gerado internamente.
 * @param {unknown} result - Resultado do validador externo.
 * @param {{ sha256: string }} schemaIdentity - Fingerprint oficial aprovado.
 * @param {string} reconciliationSha256 - Hash da reconciliação interna.
 * @returns {{ artifact: Buffer, sha256: string, validation: object }} Artefacto atestado.
 */
function assertExternallyValidatedArtifact(
    internalArtifact,
    result,
    schemaIdentity,
    reconciliationSha256,
) {
    const artifact = internalArtifact;
    const validation = result?.validation;
    if (result?.artifact != null) {
        if (!Buffer.isBuffer(result.artifact) || !result.artifact.equals(internalArtifact)) {
            throw httpError(
                502,
                "SAFT_EXTERNAL_ARTIFACT_REPLACEMENT",
                "O validador externo tentou substituir o artefacto gerado internamente.",
            );
        }
    }
    if (artifact.includes(Buffer.from("1.04_01-MVP", "ascii"))) {
        throw httpError(
            502,
            "SAFT_LEGACY_ARTIFACT_REJECTED",
            "O pipeline devolveu o artefacto SAF-T MVP obsoleto.",
        );
    }
    const artifactHeader = artifact.subarray(0, 4096).toString("latin1");
    if (
        !/^<\?xml\s+version=["']1\.0["'][^?]*encoding=["']Windows-1252["'][^?]*\?>/i.test(
            artifactHeader,
        ) ||
        !/<AuditFile\b/i.test(artifactHeader) ||
        !artifactHeader.includes(SAFT_NAMESPACE)
    ) {
        throw httpError(
            502,
            "SAFT_ARTIFACT_CONTRACT_MISMATCH",
            "O artefacto não declara o encoding e namespace SAF-T aprovados.",
        );
    }
    if (
        validation?.xsdStatus !== VALID_STATUS ||
        validation?.schemaVersion !== SAFT_VERSION ||
        validation?.xsdProcessorVersion !== XSD_PROCESSOR_VERSION ||
        validation?.totalsStatus !== VALID_STATUS ||
        validation?.externalReviewStatus !== APPROVED_STATUS ||
        validation?.sourceReconciliationSha256 !== reconciliationSha256
    ) {
        throw httpError(
            502,
            "SAFT_EXTERNAL_VALIDATION_FAILED",
            "O artefacto não passou todas as validações SAF-T obrigatórias.",
        );
    }
    const validatorName = String(validation.validatorName ?? "").trim();
    const reportId = String(validation.reportId ?? "").trim();
    const reconciliationReportSha256 = String(
        validation.reconciliationReportSha256 ?? "",
    ).trim();
    const validatedAt = new Date(validation.validatedAt);
    if (
        !validatorName ||
        validatorName.length > 120 ||
        !reportId ||
        reportId.length > 160 ||
        !/^[a-f0-9]{64}$/.test(reconciliationReportSha256) ||
        Number.isNaN(validatedAt.getTime())
    ) {
        throw httpError(
            502,
            "SAFT_EXTERNAL_ATTESTATION_INVALID",
            "A atestação externa SAF-T é inválida.",
        );
    }
    const artifactSha256 = sha256Bytes(artifact);
    if (
        validation.artifactSha256 !== artifactSha256 ||
        validation.schemaSha256 !== schemaIdentity.sha256
    ) {
        throw httpError(
            502,
            "SAFT_EXTERNAL_ATTESTATION_MISMATCH",
            "A atestação externa não corresponde ao artefacto ou XSD aprovado.",
        );
    }
    return {
        artifact,
        sha256: artifactSha256,
        validation: {
            xsdStatus: VALID_STATUS,
            schemaVersion: SAFT_VERSION,
            xsdProcessorVersion: XSD_PROCESSOR_VERSION,
            totalsStatus: VALID_STATUS,
            externalReviewStatus: APPROVED_STATUS,
            validatorName,
            validatedAt: validatedAt.toISOString(),
            reportId,
            reconciliationReportSha256,
            sourceReconciliationSha256: reconciliationSha256,
        },
    };
}

/**
 * Confirma se uma execução tem todos os estados exigidos para download.
 *
 * @param {object} run - SaftExportRun persistido.
 * @returns {boolean} True apenas para artefacto íntegro e validado.
 */
function isDownloadReady(run) {
    return (
        run?.status === READY_STATUS &&
        run?.xsdStatus === VALID_STATUS &&
        run?.totalsStatus === VALID_STATUS &&
        run?.externalReviewStatus === APPROVED_STATUS &&
        typeof run?.storageKey === "string" &&
        Boolean(run.storageKey) &&
        typeof run?.sha256 === "string" &&
        /^[a-f0-9]{64}$/.test(run.sha256) &&
        Number.isInteger(run?.sizeBytes) &&
        run.sizeBytes > 0 &&
        Boolean(run?.completedAt)
    );
}

/**
 * Constrói o payload público sem revelar storage key, empresa ou detalhes internos.
 *
 * @param {object} run - SaftExportRun persistido.
 * @returns {object} Metadata segura para POST/GET.
 */
function serializeSaftRun(run) {
    return {
        id: run.id,
        type: run.type,
        fiscalPeriodId: run.fiscalPeriodId,
        status: run.status,
        createdAt: optionalIso(run.exportedAt),
        fileName: run.fileName ?? null,
        sha256: run.sha256 ?? null,
        sizeBytes: run.sizeBytes ?? null,
        validation: {
            xsdStatus: run.xsdStatus,
            totalsStatus: run.totalsStatus,
            externalReviewStatus: run.externalReviewStatus,
        },
        completedAt: optionalIso(run.completedAt),
        downloadAvailable: isDownloadReady(run),
    };
}

/**
 * Materializa e verifica os bytes descarregados antes de os expor ao cliente.
 * A metadata S3 é apenas uma precondição; a prova de integridade é o SHA-256
 * recalculado sobre o conteúdo real, com limite rígido igual ao tamanho
 * persistido no run para impedir respostas excessivas do provider.
 *
 * @param {object} object - Resposta do adapter de object storage.
 * @param {{ sha256: string, sizeBytes: number }} run - Metadata validada do run.
 * @returns {Promise<object>} Objeto com um novo stream dos bytes verificados.
 */
async function verifyDownloadedArtifact(object, run) {
    const chunks = [];
    const hash = createHash("sha256");
    let sizeBytes = 0;
    try {
        for await (const chunk of object.body) {
            const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            sizeBytes += bytes.length;
            if (sizeBytes > run.sizeBytes) {
                object.body.destroy?.();
                throw httpError(
                    409,
                    "SAFT_ARTIFACT_INTEGRITY_FAILED",
                    "O artefacto SAF-T excede o tamanho validado.",
                );
            }
            hash.update(bytes);
            chunks.push(bytes);
        }
    } catch (error) {
        object.body.destroy?.();
        if (error?.code === "SAFT_ARTIFACT_INTEGRITY_FAILED") throw error;
        throw httpError(
            503,
            "SAFT_ARTIFACT_UNAVAILABLE",
            "O artefacto SAF-T não pôde ser lido integralmente do storage privado.",
        );
    }

    if (sizeBytes !== run.sizeBytes || hash.digest("hex") !== run.sha256) {
        throw httpError(
            409,
            "SAFT_ARTIFACT_INTEGRITY_FAILED",
            "Os bytes do artefacto SAF-T não correspondem à validação persistida.",
        );
    }

    const artifact = Buffer.concat(chunks, sizeBytes);
    return {
        ...object,
        body: Readable.from([artifact]),
        contentLength: sizeBytes,
    };
}

/**
 * Cria uma exportação integral apenas depois de validação oficial e externa.
 *
 * Sem pipeline externo, XSD oficial ou qualquer precondição, a função falha antes
 * de escrever em object storage ou criar SaftExportRun.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {object} objectStorage - Adapter privado S3/local.
 * @param {{ companyId: string, userId: string, type: "FULL", fiscalPeriodId: string, featureFlag: unknown }} input - Contexto e pedido normalizado.
 * @param {{ externalPipeline?: object, loadOfficialSchema?: Function, verifySchema?: Function, now?: Date | string }} [dependencies] - Integrações explícitas.
 * @returns {Promise<object>} Metadata pública do run READY.
 */
export async function createSaftExport(
    prisma,
    objectStorage,
    input,
    dependencies = {},
) {
    assertSaftExportEnabled(input?.featureFlag);
    assertInternalContext(input);
    if (input.type !== "FULL" || !input.fiscalPeriodId) {
        throw httpError(400, "INVALID_SAFT_REQUEST", "Pedido SAF-T inválido.");
    }
    if (
        !objectStorage ||
        typeof objectStorage.putBuffer !== "function" ||
        typeof objectStorage.deleteObject !== "function" ||
        typeof prisma?.$transaction !== "function"
    ) {
        throw new TypeError("Prisma transacional e object storage são obrigatórios.");
    }

    const externalPipeline = requireExternalPipeline(dependencies.externalPipeline);
    if (typeof dependencies.loadOfficialSchema !== "function") {
        throw httpError(503, "SAFT_XSD_REQUIRED", "XSD oficial SAF-T indisponível.");
    }
    const xsdBuffer = await dependencies.loadOfficialSchema();
    const verifySchema = dependencies.verifySchema ?? assertOfficialSaftSchema;
    const schemaIdentity = await verifySchema(xsdBuffer);
    const period = await loadClosedFiscalPeriod(prisma, input);
    const sources = await loadReadinessSources(prisma, {
        companyId: input.companyId,
        period,
    });
    const counts = {
        saleDocuments: sources.saleDocuments.length,
        purchaseDocuments: sources.purchaseDocuments.length,
        journalEntries: sources.journalEntries.length,
    };
    const readiness = assertSaftReadiness({
        profile: sources.profile,
        period: {
            fromDate: period.startDate,
            toDate: period.endDate,
            fiscalYear: period.fiscalYear,
        },
        counts,
    });
    const sourceReadiness = assertSaftSourceReadiness(sources);
    const generated = generateInternalSaft({
        sources,
        fiscalPeriod: {
            id: period.id,
            fiscalYear: period.fiscalYear,
            startDate: period.startDate,
            endDate: period.endDate,
        },
        createdAt: dependencies.now ?? new Date(),
    });
    const validatorInput = {
        fiscalPeriod: {
            id: period.id,
            fiscalYear: period.fiscalYear,
            startDate: period.startDate,
            endDate: period.endDate,
        },
        readiness: { ...readiness, sources: sourceReadiness },
        // O adapter recebe cópias defensivas; não pode mutar o artefacto nem a
        // reconciliação que serão guardados depois da atestação.
        artifact: Buffer.from(generated.artifact),
        artifactSha256: generated.artifactSha256,
        reconciliation: structuredClone(generated.reconciliation),
        reconciliationSha256: generated.reconciliationSha256,
        officialXsd: Buffer.from(xsdBuffer),
        schema: structuredClone(schemaIdentity),
    };
    const pipelineResult = typeof externalPipeline.validate === "function"
        ? await externalPipeline.validate(validatorInput)
        : await externalPipeline.generateAndValidate(validatorInput);
    const validated = assertExternallyValidatedArtifact(
        generated.artifact,
        pipelineResult,
        schemaIdentity,
        generated.reconciliationSha256,
    );

    const runId = randomUUID();
    const safeNif = safeStorageSegment(sources.profile.nif);
    const fileName = `saft-${safeNif}-${dateOnly(period.startDate)}-${dateOnly(period.endDate)}.xml`;
    const storageKey = `private/saft/${safeStorageSegment(input.companyId)}/${runId}.xml`;
    const stored = await objectStorage.putBuffer({
        key: storageKey,
        buffer: validated.artifact,
        contentType: CONTENT_TYPE,
        metadata: {
            sha256: validated.sha256,
            "schema-sha256": schemaIdentity.sha256,
            "saft-version": SAFT_VERSION,
            "reconciliation-sha256": generated.reconciliationSha256,
            "xsd-status": VALID_STATUS,
            "totals-status": VALID_STATUS,
            "external-review-status": APPROVED_STATUS,
        },
    });
    if (stored?.key !== storageKey || stored?.sizeBytes !== validated.artifact.length) {
        await objectStorage.deleteObject(storageKey).catch(() => undefined);
        throw httpError(
            503,
            "SAFT_STORAGE_WRITE_UNCONFIRMED",
            "O object storage não confirmou o artefacto SAF-T.",
        );
    }

    const completedAt = new Date();
    let run;
    try {
        run = await prisma.$transaction(async (tx) => {
            const created = await tx.saftExportRun.create({
                data: {
                    id: runId,
                    companyId: input.companyId,
                    fromDate: period.startDate,
                    toDate: period.endDate,
                    fileName,
                    saleDocumentCount: counts.saleDocuments,
                    purchaseDocumentCount: counts.purchaseDocuments,
                    journalEntryCount: counts.journalEntries,
                    exportedById: input.userId,
                    type: "FULL",
                    fiscalPeriodId: period.id,
                    storageKey,
                    sha256: validated.sha256,
                    sizeBytes: validated.artifact.length,
                    status: READY_STATUS,
                    xsdStatus: VALID_STATUS,
                    totalsStatus: VALID_STATUS,
                    externalReviewStatus: APPROVED_STATUS,
                    validationDetails: {
                        schema: {
                            sha256: schemaIdentity.sha256,
                            version: schemaIdentity.version ?? SAFT_VERSION,
                            namespace: schemaIdentity.namespace ?? SAFT_NAMESPACE,
                            encoding: SAFT_ENCODING,
                        },
                        validator: validated.validation,
                        reconciliation: {
                            sha256: generated.reconciliationSha256,
                            ...generated.reconciliation,
                        },
                        readiness: {
                            checkedAt: readiness.checkedAt,
                            totalRows: readiness.totalRows,
                            ...sourceReadiness,
                        },
                    },
                    completedAt,
                },
            });
            await upsertRetentionHold(tx, {
                companyId: input.companyId,
                entity: "SaftExportRun",
                entityId: created.id,
                periodEndAt: period.endDate,
                reason: "SAFT_EXPORT_VALIDATED",
            });
            await recordRetainedAuditLog(tx, {
                companyId: input.companyId,
                userId: input.userId,
                action: "SAFT_EXPORT_VALIDATED",
                entity: "SaftExportRun",
                entityId: created.id,
                periodEndAt: period.endDate,
                retentionReason: "SAFT_EXPORT_AUDIT_RETAINED",
                details: {
                    fiscalPeriodId: period.id,
                    type: "FULL",
                    status: READY_STATUS,
                    xsdStatus: VALID_STATUS,
                    totalsStatus: VALID_STATUS,
                    externalReviewStatus: APPROVED_STATUS,
                },
            });
            await recordIntegrationLog(tx, {
                companyId: input.companyId,
                userId: input.userId,
                integrationType: "SAFT",
                operation: "EXPORT",
                status: READY_STATUS,
                sourceId: created.id,
                fileName,
                totalRows: readiness.totalRows,
                successRows: readiness.totalRows,
                errorRows: 0,
                message: "Artefacto SAF-T validado externamente e guardado em storage privado.",
            });
            return created;
        });
    } catch (error) {
        await objectStorage.deleteObject(storageKey).catch(() => undefined);
        throw error;
    }

    return serializeSaftRun(run);
}

/**
 * Obtém metadata de uma exportação sem atravessar a empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, exportId: string, featureFlag: unknown }} input - Ownership backend.
 * @returns {Promise<object>} Metadata pública.
 */
export async function getSaftExportMetadata(prisma, input) {
    assertSaftExportEnabled(input?.featureFlag);
    assertOwnedRunContext(input);
    const run = await prisma.saftExportRun.findFirst({
        where: { id: input.exportId, companyId: input.companyId },
    });
    if (!run) {
        throw httpError(404, "SAFT_EXPORT_NOT_FOUND", "Exportação SAF-T não encontrada.");
    }
    return serializeSaftRun(run);
}

/**
 * Resolve um stream privado apenas para um artefacto READY e integralmente validado.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {object} objectStorage - Adapter privado.
 * @param {{ companyId: string, exportId: string, featureFlag: unknown }} input - Ownership backend.
 * @returns {Promise<{ export: object, object: object }>} Metadata e stream validados.
 */
export async function getSaftExportDownload(prisma, objectStorage, input) {
    assertSaftExportEnabled(input?.featureFlag);
    assertOwnedRunContext(input);
    const run = await prisma.saftExportRun.findFirst({
        where: { id: input.exportId, companyId: input.companyId },
    });
    if (!run) {
        throw httpError(404, "SAFT_EXPORT_NOT_FOUND", "Exportação SAF-T não encontrada.");
    }
    if (!isDownloadReady(run)) {
        throw httpError(
            409,
            "SAFT_EXPORT_NOT_READY",
            "A exportação SAF-T ainda não tem validação suficiente para download.",
        );
    }
    if (!objectStorage || typeof objectStorage.getObject !== "function") {
        throw new TypeError("Object storage é obrigatório.");
    }

    let object;
    try {
        object = await objectStorage.getObject(run.storageKey);
    } catch {
        throw httpError(
            503,
            "SAFT_ARTIFACT_UNAVAILABLE",
            "O artefacto SAF-T validado não está disponível no storage privado.",
        );
    }
    const integrityMatches =
        object?.contentLength === run.sizeBytes &&
        object?.contentType === CONTENT_TYPE &&
        object?.metadata?.sha256 === run.sha256 &&
        object?.body &&
        typeof object.body.pipe === "function";
    if (!integrityMatches) {
        object?.body?.destroy?.();
        throw httpError(
            409,
            "SAFT_ARTIFACT_INTEGRITY_FAILED",
            "O artefacto SAF-T não corresponde à metadata validada.",
        );
    }
    const verifiedObject = await verifyDownloadedArtifact(object, run);
    return { export: serializeSaftRun(run), object: verifiedObject };
}
