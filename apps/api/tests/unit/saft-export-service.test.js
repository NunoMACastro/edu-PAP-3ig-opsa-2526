/**
 * @file Provas unitárias do boundary fail-closed das exportações SAF-T.
 *
 * Estes testes não substituem validação da estrutura oficial 1.04_01 com um
 * processador XSD 1.1 nem revisão contabilística externa. Confirmam apenas que
 * a API recusa atalhos e aplica ownership.
 */

import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";
import {
    createSaftExport,
    getSaftExportDownload,
    getSaftExportMetadata,
    normalizeSaftValidationMode,
} from "../../src/modules/compliance/saftService.js";
import {
    SAFT_NAMESPACE,
    SAFT_VERSION,
    sha256Bytes,
} from "../../src/modules/compliance/saftSchemaContract.js";
import {
    SAFT_TEST_PERIOD,
    buildSaftSources,
} from "../helpers/saftTestFixture.js";

const SCHEMA_SHA256 = "a".repeat(64);
const RECONCILIATION_SHA256 = "b".repeat(64);

function validArtifact() {
    return Buffer.from(
        `<?xml version="1.0" encoding="Windows-1252"?><AuditFile xmlns="${SAFT_NAMESPACE}"></AuditFile>`,
        "latin1",
    );
}

function validAttestation(artifact, sourceReconciliationSha256, overrides = {}) {
    return {
        xsdStatus: "VALID",
        schemaVersion: SAFT_VERSION,
        xsdProcessorVersion: "1.1",
        totalsStatus: "VALID",
        externalReviewStatus: "APPROVED",
        validatorName: "Validador externo de teste",
        validatedAt: "2026-07-09T12:00:00.000Z",
        reportId: "external-report-1",
        reconciliationReportSha256: RECONCILIATION_SHA256,
        sourceReconciliationSha256,
        artifactSha256: sha256Bytes(artifact),
        schemaSha256: SCHEMA_SHA256,
        ...overrides,
    };
}

function buildCreationFixture() {
    const period = SAFT_TEST_PERIOD;
    const sources = buildSaftSources();
    const createdRuns = [];
    const integrationLogs = [];
    const retentionHolds = [];
    const auditLogs = [];
    const tx = {
        saftExportRun: {
            create: async ({ data }) => {
                const run = {
                    ...data,
                    exportedAt: new Date("2027-01-03T00:00:00.000Z"),
                };
                createdRuns.push(run);
                return run;
            },
        },
        integrationLog: {
            create: async ({ data }) => {
                integrationLogs.push(data);
                return { id: "integration-1", ...data };
            },
        },
        retentionHold: {
            upsert: async ({ create }) => {
                retentionHolds.push(create);
                return { id: `hold-${retentionHolds.length}`, ...create };
            },
        },
        auditLog: {
            create: async ({ data }) => {
                const log = { id: "audit-saft-1", ...data };
                auditLogs.push(log);
                return log;
            },
        },
    };
    const prisma = {
        fiscalPeriod: {
            findFirst: async ({ where }) => {
                assert.deepEqual(where, { id: "period-1", companyId: "company-1" });
                return period;
            },
        },
        companyProfile: {
            findUnique: async ({ where }) => {
                assert.deepEqual(where, { companyId: "company-1" });
                return sources.profile;
            },
        },
        saleDocument: { findMany: async () => sources.saleDocuments },
        purchaseDocument: { findMany: async () => sources.purchaseDocuments },
        journalEntry: { findMany: async () => sources.journalEntries },
        account: { findMany: async () => sources.accounts },
        customer: { findMany: async () => sources.customers },
        supplier: { findMany: async () => sources.suppliers },
        item: { findMany: async () => sources.items },
        vatRate: { findMany: async () => sources.vatRates },
        $transaction: async (callback) => callback(tx),
    };
    return { prisma, createdRuns, integrationLogs, retentionHolds, auditLogs };
}

function creationInput(featureFlag = true, validationMode = "external") {
    return {
        companyId: "company-1",
        userId: "user-1",
        type: "FULL",
        fiscalPeriodId: "period-1",
        featureFlag,
        validationMode,
    };
}

test("SAF-T falha antes de I/O quando a feature flag está desligada", async () => {
    let transactionCalls = 0;
    await assert.rejects(
        () =>
            createSaftExport(
                { $transaction: async () => { transactionCalls += 1; } },
                {},
                creationInput(false),
            ),
        { code: "SAFT_EXPORT_DISABLED", status: 503 },
    );
    assert.equal(transactionCalls, 0);
});

test("SAF-T exige pipeline externo mesmo com a flag ligada", async () => {
    const { prisma } = buildCreationFixture();
    await assert.rejects(
        () =>
            createSaftExport(prisma, {
                putBuffer: async () => assert.fail("storage não deve ser usado"),
                deleteObject: async () => undefined,
            }, creationInput(true)),
        { code: "SAFT_EXTERNAL_VALIDATION_REQUIRED", status: 503 },
    );
});

test("modo académico é explícito e proibido em produção", () => {
    assert.equal(normalizeSaftValidationMode("academic", false), "ACADEMIC");
    assert.equal(normalizeSaftValidationMode(undefined, false), "EXTERNAL");
    assert.throws(
        () => normalizeSaftValidationMode("academic", true),
        { code: "SAFT_ACADEMIC_MODE_FORBIDDEN", status: 503 },
    );
    assert.throws(
        () => normalizeSaftValidationMode("inventado", false),
        { code: "SAFT_VALIDATION_MODE_INVALID", status: 503 },
    );
});

test("SAF-T académico gera XML marcado sem fingir XSD ou revisão externa", async () => {
    const { prisma, createdRuns, auditLogs, integrationLogs } = buildCreationFixture();
    let stored;
    const result = await createSaftExport(
        prisma,
        {
            putBuffer: async (input) => {
                stored = input;
                return { key: input.key, sizeBytes: input.buffer.length };
            },
            deleteObject: async () => undefined,
        },
        creationInput(true, "academic"),
        { now: new Date("2027-01-03T12:00:00.000Z") },
    );

    assert.equal(result.status, "READY");
    assert.equal(result.validationMode, "ACADEMIC");
    assert.equal(result.certified, false);
    assert.equal(result.downloadAvailable, true);
    assert.match(result.fileName, /DEMO-NAO-CERTIFICADO/);
    assert.match(stored.buffer.toString("latin1"), /DEMONSTRACAO ACADEMICA - NAO CERTIFICADO/);
    assert.equal(stored.metadata["validation-mode"], "ACADEMIC");
    assert.equal(stored.metadata.certified, "false");
    assert.equal("schema-sha256" in stored.metadata, false);
    assert.equal(createdRuns[0].xsdStatus, "NOT_VALIDATED");
    assert.equal(createdRuns[0].totalsStatus, "VALID");
    assert.equal(createdRuns[0].externalReviewStatus, "NOT_REVIEWED");
    assert.equal(createdRuns[0].validationDetails.certified, false);
    assert.equal(createdRuns[0].validationDetails.validator, null);
    assert.equal(auditLogs[0].action, "SAFT_ACADEMIC_EXPORT_GENERATED");
    assert.match(integrationLogs[0].message, /não certificado/);
});

test("SAF-T só persiste READY com XSD, reconciliação, auditoria e retenção atestados", async () => {
    const {
        prisma,
        createdRuns,
        integrationLogs,
        retentionHolds,
        auditLogs,
    } = buildCreationFixture();
    let stored;
    let validatorInput;
    const objectStorage = {
        putBuffer: async (input) => {
            stored = input;
            return { key: input.key, sizeBytes: input.buffer.length };
        },
        deleteObject: async () => undefined,
    };

    const result = await createSaftExport(
        prisma,
        objectStorage,
        creationInput(true),
        {
            loadOfficialSchema: async () => Buffer.from("official-xsd-test-double"),
            verifySchema: async () => ({
                sha256: SCHEMA_SHA256,
                version: "1.04_01",
                namespace: SAFT_NAMESPACE,
            }),
            externalPipeline: {
                validate: async (input) => {
                    validatorInput = input;
                    return {
                        validation: validAttestation(
                            input.artifact,
                            input.reconciliationSha256,
                        ),
                    };
                },
            },
            now: new Date("2027-01-03T12:00:00.000Z"),
        },
    );

    assert.equal(result.status, "READY");
    assert.equal(result.downloadAvailable, true);
    assert.equal("storageKey" in result, false);
    assert.equal(createdRuns.length, 1);
    assert.equal(createdRuns[0].companyId, "company-1");
    assert.equal(createdRuns[0].fiscalPeriodId, "period-1");
    assert.equal(createdRuns[0].validationDetails.validator.reportId, "external-report-1");
    assert.equal(createdRuns[0].validationDetails.validator.schemaVersion, SAFT_VERSION);
    assert.equal(createdRuns[0].validationDetails.validator.xsdProcessorVersion, "1.1");
    assert.equal(
        createdRuns[0].validationDetails.validator.reconciliationReportSha256,
        RECONCILIATION_SHA256,
    );
    assert.equal(integrationLogs.length, 1);
    assert.deepEqual(
        retentionHolds.map((hold) => hold.entity),
        ["SaftExportRun", "AuditLog"],
    );
    assert.equal(auditLogs[0].action, "SAFT_EXPORT_VALIDATED");
    assert.equal(stored.buffer.equals(validatorInput.artifact), true);
    assert.notEqual(stored.buffer, validatorInput.artifact);
    assert.equal("prisma" in validatorInput, false);
    assert.equal("sourceSnapshot" in validatorInput, false);
    assert.equal("companyId" in validatorInput, false);
    assert.equal(stored.metadata.sha256, sha256Bytes(validatorInput.artifact));
    assert.equal(stored.metadata["schema-sha256"], SCHEMA_SHA256);
    assert.equal(
        stored.metadata["reconciliation-sha256"],
        validatorInput.reconciliationSha256,
    );
    assert.equal(validatorInput.reconciliation.generalLedger.totalDebitCents, 2460);
    assert.equal(validatorInput.reconciliation.purchases.totalGrossCents, 1230);
    assert.equal(
        createdRuns[0].validationDetails.reconciliation.sha256,
        validatorInput.reconciliationSha256,
    );
});

test("SAF-T rejeita atestação sem prova de reconciliação", async () => {
    const { prisma, createdRuns } = buildCreationFixture();
    let storageCalls = 0;
    await assert.rejects(
        () =>
            createSaftExport(
                prisma,
                {
                    putBuffer: async () => { storageCalls += 1; },
                    deleteObject: async () => undefined,
                },
                creationInput(true),
                {
                    loadOfficialSchema: async () => Buffer.from("xsd"),
                    verifySchema: async () => ({
                        sha256: SCHEMA_SHA256,
                        version: "1.04_01",
                        namespace: SAFT_NAMESPACE,
                    }),
                    externalPipeline: {
                        validate: async (validatorInput) => ({
                            validation: validAttestation(
                                validatorInput.artifact,
                                validatorInput.reconciliationSha256,
                                { reconciliationReportSha256: null },
                            ),
                        }),
                    },
                    now: new Date("2027-01-03T12:00:00.000Z"),
                },
            ),
        { code: "SAFT_EXTERNAL_ATTESTATION_INVALID", status: 502 },
    );
    assert.equal(storageCalls, 0);
    assert.equal(createdRuns.length, 0);
});

test("SAF-T rejeita qualquer artefacto diferente devolvido pelo adapter externo legado", async () => {
    const { prisma, createdRuns } = buildCreationFixture();
    let storageCalls = 0;
    await assert.rejects(
        () => createSaftExport(
            prisma,
            {
                putBuffer: async () => { storageCalls += 1; },
                deleteObject: async () => undefined,
            },
            creationInput(true),
            {
                loadOfficialSchema: async () => Buffer.from("xsd"),
                verifySchema: async () => ({
                    sha256: SCHEMA_SHA256,
                    version: "1.04_01",
                    namespace: SAFT_NAMESPACE,
                }),
                externalPipeline: {
                    generateAndValidate: async (validatorInput) => ({
                        artifact: Buffer.from("artefacto externo proibido"),
                        validation: validAttestation(
                            validatorInput.artifact,
                            validatorInput.reconciliationSha256,
                        ),
                    }),
                },
                now: new Date("2027-01-03T12:00:00.000Z"),
            },
        ),
        { code: "SAFT_EXTERNAL_ARTIFACT_REPLACEMENT", status: 502 },
    );
    assert.equal(storageCalls, 0);
    assert.equal(createdRuns.length, 0);
});

test("SAF-T isola o artefacto interno de mutações feitas pelo validador", async () => {
    const { prisma } = buildCreationFixture();
    let storageCalls = 0;
    await assert.rejects(
        () => createSaftExport(
            prisma,
            {
                putBuffer: async () => { storageCalls += 1; },
                deleteObject: async () => undefined,
            },
            creationInput(true),
            {
                loadOfficialSchema: async () => Buffer.from("xsd"),
                verifySchema: async () => ({
                    sha256: SCHEMA_SHA256,
                    version: "1.04_01",
                    namespace: SAFT_NAMESPACE,
                }),
                externalPipeline: {
                    validate: async (validatorInput) => {
                        validatorInput.artifact[0] = 0;
                        return {
                            validation: validAttestation(
                                validatorInput.artifact,
                                validatorInput.reconciliationSha256,
                            ),
                        };
                    },
                },
                now: new Date("2027-01-03T12:00:00.000Z"),
            },
        ),
        { code: "SAFT_EXTERNAL_ATTESTATION_MISMATCH", status: 502 },
    );
    assert.equal(storageCalls, 0);
});

test("SAF-T exige atestação explícita da estrutura oficial 1.04_01", async () => {
    const { prisma } = buildCreationFixture();
    await assert.rejects(
        () => createSaftExport(
            prisma,
            {
                putBuffer: async () => assert.fail("storage não deve ser usado"),
                deleteObject: async () => undefined,
            },
            creationInput(true),
            {
                loadOfficialSchema: async () => Buffer.from("xsd"),
                verifySchema: async () => ({
                    sha256: SCHEMA_SHA256,
                    version: "1.04_01",
                    namespace: SAFT_NAMESPACE,
                }),
                externalPipeline: {
                    validate: async (validatorInput) => ({
                        validation: validAttestation(
                            validatorInput.artifact,
                            validatorInput.reconciliationSha256,
                            { schemaVersion: "1.03_01" },
                        ),
                    }),
                },
                now: new Date("2027-01-03T12:00:00.000Z"),
            },
        ),
        { code: "SAFT_EXTERNAL_VALIDATION_FAILED", status: 502 },
    );
});

test("SAF-T rejeita processador XSD 1.0 mesmo para a estrutura oficial 1.04_01", async () => {
    const { prisma } = buildCreationFixture();
    await assert.rejects(
        () => createSaftExport(
            prisma,
            {
                putBuffer: async () => assert.fail("storage não deve ser usado"),
                deleteObject: async () => undefined,
            },
            creationInput(true),
            {
                loadOfficialSchema: async () => Buffer.from("xsd"),
                verifySchema: async () => ({
                    sha256: SCHEMA_SHA256,
                    version: SAFT_VERSION,
                    namespace: SAFT_NAMESPACE,
                }),
                externalPipeline: {
                    validate: async (validatorInput) => ({
                        validation: validAttestation(
                            validatorInput.artifact,
                            validatorInput.reconciliationSha256,
                            { xsdProcessorVersion: "1.0" },
                        ),
                    }),
                },
                now: new Date("2027-01-03T12:00:00.000Z"),
            },
        ),
        { code: "SAFT_EXTERNAL_VALIDATION_FAILED", status: 502 },
    );
});

test("metadata SAF-T filtra sempre por id e empresa", async () => {
    let observedWhere;
    const prisma = {
        saftExportRun: {
            findFirst: async ({ where }) => {
                observedWhere = where;
                return null;
            },
        },
    };
    await assert.rejects(
        () =>
            getSaftExportMetadata(prisma, {
                companyId: "company-1",
                exportId: "export-company-2",
                featureFlag: true,
            }),
        { code: "SAFT_EXPORT_NOT_FOUND", status: 404 },
    );
    assert.deepEqual(observedWhere, {
        id: "export-company-2",
        companyId: "company-1",
    });
});

test("metadata SAF-T recusa contexto sem empresa antes da query", async () => {
    let queryCalls = 0;
    await assert.rejects(
        () =>
            getSaftExportMetadata(
                {
                    saftExportRun: {
                        findFirst: async () => { queryCalls += 1; },
                    },
                },
                { exportId: "export-1", featureFlag: true },
            ),
        { code: "SAFT_CONTEXT_REQUIRED", status: 400 },
    );
    assert.equal(queryCalls, 0);
});

test("download SAF-T nunca consulta storage para um run não READY", async () => {
    let storageCalls = 0;
    const prisma = {
        saftExportRun: {
            findFirst: async ({ where }) => ({
                id: where.id,
                companyId: where.companyId,
                type: "FULL",
                fiscalPeriodId: "period-1",
                status: "PENDING",
                exportedAt: new Date("2026-07-09T00:00:00.000Z"),
                xsdStatus: "PENDING",
                totalsStatus: "PENDING",
                externalReviewStatus: "PENDING",
            }),
        },
    };
    await assert.rejects(
        () =>
            getSaftExportDownload(
                prisma,
                { getObject: async () => { storageCalls += 1; } },
                {
                    companyId: "company-1",
                    exportId: "export-1",
                    featureFlag: true,
                },
            ),
        { code: "SAFT_EXPORT_NOT_READY", status: 409 },
    );
    assert.equal(storageCalls, 0);
});

test("download READY exige metadata de integridade igual ao run", async () => {
    const artifact = validArtifact();
    const run = {
        id: "export-1",
        companyId: "company-1",
        type: "FULL",
        fiscalPeriodId: "period-1",
        status: "READY",
        exportedAt: new Date("2026-07-09T00:00:00.000Z"),
        fileName: "saft.xml",
        storageKey: "private/saft/company-1/export-1.xml",
        sha256: sha256Bytes(artifact),
        sizeBytes: artifact.length,
        xsdStatus: "VALID",
        totalsStatus: "VALID",
        externalReviewStatus: "APPROVED",
        completedAt: new Date("2026-07-09T00:01:00.000Z"),
    };
    const body = Readable.from([artifact]);
    const result = await getSaftExportDownload(
        { saftExportRun: { findFirst: async () => run } },
        {
            getObject: async (key) => ({
                body,
                contentLength: artifact.length,
                contentType: "application/xml",
                metadata: { sha256: run.sha256 },
                key,
            }),
        },
        {
            companyId: "company-1",
            exportId: "export-1",
            featureFlag: true,
        },
    );
    assert.equal(result.export.downloadAvailable, true);
    assert.equal("storageKey" in result.export, false);
    const downloaded = [];
    for await (const chunk of result.object.body) downloaded.push(chunk);
    assert.equal(Buffer.concat(downloaded).equals(artifact), true);
});

test("download académico só fica disponível enquanto o runtime continua académico", async () => {
    const artifact = Buffer.from(
        '<?xml version="1.0" encoding="Windows-1252"?>\n<!-- DEMONSTRACAO ACADEMICA - NAO CERTIFICADO --><AuditFile/>',
        "latin1",
    );
    const run = {
        id: "academic-export-1",
        companyId: "company-1",
        type: "FULL",
        fiscalPeriodId: "period-1",
        status: "READY",
        exportedAt: new Date("2026-07-09T00:00:00.000Z"),
        fileName: "saft-DEMO-NAO-CERTIFICADO.xml",
        storageKey: "private/saft/company-1/academic-export-1.xml",
        sha256: sha256Bytes(artifact),
        sizeBytes: artifact.length,
        xsdStatus: "NOT_VALIDATED",
        totalsStatus: "VALID",
        externalReviewStatus: "NOT_REVIEWED",
        validationDetails: { validationMode: "ACADEMIC", certified: false },
        completedAt: new Date("2026-07-09T00:01:00.000Z"),
    };
    const prisma = { saftExportRun: { findFirst: async () => run } };
    const storage = {
        getObject: async () => ({
            body: Readable.from([artifact]),
            contentLength: artifact.length,
            contentType: "application/xml",
            metadata: { sha256: run.sha256 },
        }),
    };

    const academic = await getSaftExportDownload(prisma, storage, {
        companyId: "company-1",
        exportId: run.id,
        featureFlag: true,
        validationMode: "academic",
    });
    assert.equal(academic.export.downloadAvailable, true);
    assert.equal(academic.export.certified, false);

    await assert.rejects(
        () => getSaftExportDownload(prisma, storage, {
            companyId: "company-1",
            exportId: run.id,
            featureFlag: true,
            validationMode: "external",
        }),
        { code: "SAFT_EXPORT_NOT_READY", status: 409 },
    );
});

test("download READY recalcula SHA-256 dos bytes e rejeita conteúdo adulterado", async () => {
    const artifact = validArtifact();
    const adulterated = Buffer.from(artifact);
    adulterated[adulterated.length - 2] ^= 1;
    const run = {
        id: "export-1",
        companyId: "company-1",
        type: "FULL",
        fiscalPeriodId: "period-1",
        status: "READY",
        exportedAt: new Date("2026-07-09T00:00:00.000Z"),
        fileName: "saft.xml",
        storageKey: "private/saft/company-1/export-1.xml",
        sha256: sha256Bytes(artifact),
        sizeBytes: artifact.length,
        xsdStatus: "VALID",
        totalsStatus: "VALID",
        externalReviewStatus: "APPROVED",
        completedAt: new Date("2026-07-09T00:01:00.000Z"),
    };
    await assert.rejects(
        () => getSaftExportDownload(
            { saftExportRun: { findFirst: async () => run } },
            {
                getObject: async () => ({
                    body: Readable.from([adulterated]),
                    contentLength: artifact.length,
                    contentType: "application/xml",
                    metadata: { sha256: run.sha256 },
                }),
            },
            {
                companyId: "company-1",
                exportId: "export-1",
                featureFlag: true,
            },
        ),
        { code: "SAFT_ARTIFACT_INTEGRITY_FAILED", status: 409 },
    );
});
