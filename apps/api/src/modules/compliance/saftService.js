/**
 * @file Orquestração fail-closed de exportações SAF-T PT integrais.
 *
 * O artefacto é sempre produzido pelo mesmo gerador interno. Em modo externo,
 * só fica READY depois da atestação XSD/reconciliação/revisão já existente. Em
 * modo académico, fica explicitamente marcado como não certificado e nunca é
 * confundido com uma exportação legalmente validada.
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
const ACADEMIC_MODE = "ACADEMIC";
const EXTERNAL_MODE = "EXTERNAL";
const NOT_VALIDATED_STATUS = "NOT_VALIDATED";
const NOT_REVIEWED_STATUS = "NOT_REVIEWED";

/**
 * Normaliza o modo sem permitir que a demonstração académica seja usada em
 * produção. O modo externo mantém-se como default compatível.
 *
 * @param {unknown} value - Valor de `SAFT_VALIDATION_MODE`.
 * @param {boolean} [isProduction=false] - Indica runtime de produção.
 * @returns {"ACADEMIC" | "EXTERNAL"} Modo validado.
 */
export function normalizeSaftValidationMode(value, isProduction = false) {
    const normalized = String(value ?? "external").trim().toUpperCase();
    if (![ACADEMIC_MODE, EXTERNAL_MODE].includes(normalized)) {
        throw httpError(
            503,
            "SAFT_VALIDATION_MODE_INVALID",
            "SAFT_VALIDATION_MODE deve ser academic ou external.",
        );
    }
    if (isProduction && normalized === ACADEMIC_MODE) {
        throw httpError(
            503,
            "SAFT_ACADEMIC_MODE_FORBIDDEN",
            "A exportação SAF-T académica não está disponível em produção.",
        );
    }
    return normalized;
}

/**
 * Identifica o modo persistido sem promover runs antigos incompletos.
 * Runs anteriores com todos os estados externos válidos continuam compatíveis.
 *
 * @param {object} run - SaftExportRun persistido.
 * @returns {"ACADEMIC" | "EXTERNAL" | null} Modo reconhecido.
 */
function persistedValidationMode(run) {
    const explicit = String(run?.validationDetails?.validationMode ?? "")
        .trim()
        .toUpperCase();
    if ([ACADEMIC_MODE, EXTERNAL_MODE].includes(explicit)) return explicit;
    if (
        run?.xsdStatus === VALID_STATUS &&
        run?.totalsStatus === VALID_STATUS &&
        run?.externalReviewStatus === APPROVED_STATUS
    ) {
        return EXTERNAL_MODE;
    }
    return null;
}

/**
 * Acrescenta uma advertência XML visível sem alterar o conteúdo fiscal gerado.
 * Comentários são válidos em XML e o hash final é recalculado sobre estes bytes.
 *
 * @param {Buffer} artifact - XML Windows-1252 produzido internamente.
 * @returns {Buffer} Cópia marcada como demonstração não certificada.
 */
function markAcademicArtifact(artifact) {
    const declarationEnd = artifact.indexOf(Buffer.from("?>", "ascii"));
    if (declarationEnd < 0) {
        throw httpError(
            500,
            "SAFT_ARTIFACT_CONTRACT_MISMATCH",
            "O artefacto SAF-T não contém declaração XML válida.",
        );
    }
    const marker = Buffer.from(
        "\n<!-- DEMONSTRACAO ACADEMICA - NAO CERTIFICADO -->",
        "latin1",
    );
    return Buffer.concat([
        artifact.subarray(0, declarationEnd + 2),
        marker,
        artifact.subarray(declarationEnd + 2),
    ]);
}

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
 * @param {"ACADEMIC" | "EXTERNAL"} activeMode - Modo atualmente autorizado.
 * @returns {boolean} True apenas para artefacto íntegro e compatível com o runtime.
 */
function isDownloadReady(run, activeMode = EXTERNAL_MODE) {
    const persistedMode = persistedValidationMode(run);
    const commonReady =
        run?.status === READY_STATUS &&
        run?.totalsStatus === VALID_STATUS &&
        typeof run?.storageKey === "string" &&
        Boolean(run.storageKey) &&
        typeof run?.sha256 === "string" &&
        /^[a-f0-9]{64}$/.test(run.sha256) &&
        Number.isInteger(run?.sizeBytes) &&
        run.sizeBytes > 0 &&
        Boolean(run?.completedAt);
    if (!commonReady || persistedMode !== activeMode) return false;
    if (persistedMode === ACADEMIC_MODE) {
        return (
            run?.xsdStatus === NOT_VALIDATED_STATUS &&
            run?.externalReviewStatus === NOT_REVIEWED_STATUS &&
            run?.validationDetails?.certified === false
        );
    }
    return (
        run?.xsdStatus === VALID_STATUS &&
        run?.externalReviewStatus === APPROVED_STATUS
    );
}

/**
 * Constrói o payload público sem revelar storage key, empresa ou detalhes internos.
 *
 * @param {object} run - SaftExportRun persistido.
 * @param {"ACADEMIC" | "EXTERNAL"} [activeMode="EXTERNAL"] - Modo autorizado.
 * @returns {object} Metadata segura para POST/GET.
 */
function serializeSaftRun(run, activeMode = EXTERNAL_MODE) {
    const validationMode = persistedValidationMode(run);
    const certified =
        validationMode === EXTERNAL_MODE &&
        run?.xsdStatus === VALID_STATUS &&
        run?.externalReviewStatus === APPROVED_STATUS;
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
        validationMode,
        certified,
        completedAt: optionalIso(run.completedAt),
        downloadAvailable: isDownloadReady(run, activeMode),
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
 * Cria uma exportação integral externa ou uma demonstração académica marcada.
 *
 * No modo externo, a ausência de pipeline/XSD continua a falhar antes de
 * escrever em object storage ou criar SaftExportRun.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {object} objectStorage - Adapter privado S3/local.
 * @param {{ companyId: string, userId: string, type: "FULL", fiscalPeriodId: string, featureFlag: unknown, validationMode?: unknown, isProduction?: boolean }} input - Contexto e pedido normalizado.
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

    const validationMode = normalizeSaftValidationMode(
        input.validationMode,
        input.isProduction === true,
    );
    let externalPipeline = null;
    let xsdBuffer = null;
    let schemaIdentity = null;
    if (validationMode === EXTERNAL_MODE) {
        externalPipeline = requireExternalPipeline(dependencies.externalPipeline);
        if (typeof dependencies.loadOfficialSchema !== "function") {
            throw httpError(503, "SAFT_XSD_REQUIRED", "XSD oficial SAF-T indisponível.");
        }
        xsdBuffer = await dependencies.loadOfficialSchema();
        const verifySchema = dependencies.verifySchema ?? assertOfficialSaftSchema;
        schemaIdentity = await verifySchema(xsdBuffer);
    }
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
    let validated;
    if (validationMode === EXTERNAL_MODE) {
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
        validated = assertExternallyValidatedArtifact(
            generated.artifact,
            pipelineResult,
            schemaIdentity,
            generated.reconciliationSha256,
        );
    } else {
        const artifact = markAcademicArtifact(generated.artifact);
        validated = {
            artifact,
            sha256: sha256Bytes(artifact),
            validation: {
                xsdStatus: NOT_VALIDATED_STATUS,
                totalsStatus: VALID_STATUS,
                externalReviewStatus: NOT_REVIEWED_STATUS,
                validationMode: ACADEMIC_MODE,
                certified: false,
            },
        };
    }

    const runId = randomUUID();
    const safeNif = safeStorageSegment(sources.profile.nif);
    const fileName = validationMode === ACADEMIC_MODE
        ? `saft-DEMO-NAO-CERTIFICADO-${safeNif}-${dateOnly(period.startDate)}-${dateOnly(period.endDate)}.xml`
        : `saft-${safeNif}-${dateOnly(period.startDate)}-${dateOnly(period.endDate)}.xml`;
    const storageKey = `private/saft/${safeStorageSegment(input.companyId)}/${runId}.xml`;
    const stored = await objectStorage.putBuffer({
        key: storageKey,
        buffer: validated.artifact,
        contentType: CONTENT_TYPE,
        metadata: {
            sha256: validated.sha256,
            ...(schemaIdentity?.sha256
                ? { "schema-sha256": schemaIdentity.sha256 }
                : {}),
            "saft-version": SAFT_VERSION,
            "reconciliation-sha256": generated.reconciliationSha256,
            "validation-mode": validationMode,
            "certified": validationMode === EXTERNAL_MODE ? "true" : "false",
            "xsd-status": validated.validation.xsdStatus,
            "totals-status": VALID_STATUS,
            "external-review-status": validated.validation.externalReviewStatus,
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
                    xsdStatus: validated.validation.xsdStatus,
                    totalsStatus: VALID_STATUS,
                    externalReviewStatus: validated.validation.externalReviewStatus,
                    validationDetails: {
                        validationMode,
                        certified: validationMode === EXTERNAL_MODE,
                        schema: {
                            ...(schemaIdentity?.sha256
                                ? { sha256: schemaIdentity.sha256 }
                                : {}),
                            version: schemaIdentity?.version ?? SAFT_VERSION,
                            namespace: schemaIdentity?.namespace ?? SAFT_NAMESPACE,
                            encoding: SAFT_ENCODING,
                        },
                        validator: validationMode === EXTERNAL_MODE
                            ? validated.validation
                            : null,
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
                reason: validationMode === EXTERNAL_MODE
                    ? "SAFT_EXPORT_VALIDATED"
                    : "SAFT_ACADEMIC_EXPORT_GENERATED",
            });
            await recordRetainedAuditLog(tx, {
                companyId: input.companyId,
                userId: input.userId,
                action: validationMode === EXTERNAL_MODE
                    ? "SAFT_EXPORT_VALIDATED"
                    : "SAFT_ACADEMIC_EXPORT_GENERATED",
                entity: "SaftExportRun",
                entityId: created.id,
                periodEndAt: period.endDate,
                retentionReason: "SAFT_EXPORT_AUDIT_RETAINED",
                details: {
                    fiscalPeriodId: period.id,
                    type: "FULL",
                    status: READY_STATUS,
                    validationMode,
                    certified: validationMode === EXTERNAL_MODE,
                    xsdStatus: validated.validation.xsdStatus,
                    totalsStatus: VALID_STATUS,
                    externalReviewStatus: validated.validation.externalReviewStatus,
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
                message: validationMode === EXTERNAL_MODE
                    ? "Artefacto SAF-T validado externamente e guardado em storage privado."
                    : "XML SAF-T académico não certificado guardado em storage privado.",
            });
            return created;
        });
    } catch (error) {
        await objectStorage.deleteObject(storageKey).catch(() => undefined);
        throw error;
    }

    return serializeSaftRun(run, validationMode);
}

/**
 * Obtém metadata de uma exportação sem atravessar a empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, exportId: string, featureFlag: unknown, validationMode?: unknown, isProduction?: boolean }} input - Ownership backend.
 * @returns {Promise<object>} Metadata pública.
 */
export async function getSaftExportMetadata(prisma, input) {
    assertSaftExportEnabled(input?.featureFlag);
    const validationMode = normalizeSaftValidationMode(
        input?.validationMode,
        input?.isProduction === true,
    );
    assertOwnedRunContext(input);
    const run = await prisma.saftExportRun.findFirst({
        where: { id: input.exportId, companyId: input.companyId },
    });
    if (!run) {
        throw httpError(404, "SAFT_EXPORT_NOT_FOUND", "Exportação SAF-T não encontrada.");
    }
    return serializeSaftRun(run, validationMode);
}

/**
 * Resolve um stream privado apenas para um artefacto READY e integralmente validado.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {object} objectStorage - Adapter privado.
 * @param {{ companyId: string, exportId: string, featureFlag: unknown, validationMode?: unknown, isProduction?: boolean }} input - Ownership backend.
 * @returns {Promise<{ export: object, object: object }>} Metadata e stream validados.
 */
export async function getSaftExportDownload(prisma, objectStorage, input) {
    assertSaftExportEnabled(input?.featureFlag);
    const validationMode = normalizeSaftValidationMode(
        input?.validationMode,
        input?.isProduction === true,
    );
    assertOwnedRunContext(input);
    const run = await prisma.saftExportRun.findFirst({
        where: { id: input.exportId, companyId: input.companyId },
    });
    if (!run) {
        throw httpError(404, "SAFT_EXPORT_NOT_FOUND", "Exportação SAF-T não encontrada.");
    }
    if (!isDownloadReady(run, validationMode)) {
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
    return { export: serializeSaftRun(run, validationMode), object: verifiedObject };
}
