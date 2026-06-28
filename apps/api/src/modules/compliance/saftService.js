// apps/api/src/modules/compliance/saftService.js
/**
 * @file Gerador SAF-T (PT) MVP com readiness check de MF7.
 */

import { recordIntegrationLog } from "../integrations/integrationLogService.js";
import { assertSaftReadiness } from "./saftComplianceChecklist.js";

/**
 * Escapa caracteres especiais para impedir XML inválido no ficheiro SAF-T gerado.
 *
 * @param {unknown} value - Valor a normalizar ou formatar.
 * @returns {string} Texto escapado para ser usado em XML.
 */
function escapeXml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

/**
 * Converte datas para o formato ISO curto exigido nos elementos SAF-T.
 *
 * @param {Date} value - Data a normalizar.
 * @returns {string} Data no formato ISO curto.
 */
function dateOnly(value) {
    return value.toISOString().slice(0, 10);
}

/**
 * Gera o bloco XML de documentos comerciais do SAF-T a partir das vendas e compras.
 *
 * @param {object[]} saleDocuments - Documentos de venda a exportar.
 * @param {object[]} purchaseDocuments - Documentos de compra a exportar.
 * @returns {string} Bloco XML de documentos comerciais do SAF-T.
 */
function sourceDocumentsXml(saleDocuments, purchaseDocuments) {
    const salesXml = saleDocuments
        .map(
            (document) => `
      <Invoice>
        <InvoiceNo>${escapeXml(document.number ?? document.id)}</InvoiceNo>
        <InvoiceDate>${dateOnly(document.issuedAt)}</InvoiceDate>
        <CustomerID>${escapeXml(document.customerId)}</CustomerID>
        <DocumentStatus>${escapeXml(document.status)}</DocumentStatus>
        <GrossTotal>${(document.totalCents / 100).toFixed(2)}</GrossTotal>
      </Invoice>`,
        )
        .join("");

    const purchasesXml = purchaseDocuments
        .map(
            (document) => `
      <PurchaseDocument>
        <DocumentNo>${escapeXml(document.supplierNumber)}</DocumentNo>
        <DocumentDate>${dateOnly(document.issuedAt)}</DocumentDate>
        <SupplierID>${escapeXml(document.supplierId)}</SupplierID>
        <DocumentStatus>${escapeXml(document.status)}</DocumentStatus>
        <GrossTotal>${(document.totalCents / 100).toFixed(2)}</GrossTotal>
      </PurchaseDocument>`,
        )
        .join("");

    return `${salesXml}${purchasesXml}`;
}

/**
 * Gera o bloco XML de movimentos contabilísticos do SAF-T a partir dos lançamentos.
 *
 * @param {object[]} journalEntries - Lançamentos contabilísticos a exportar.
 * @returns {string} Bloco XML com lançamentos contabilísticos SAF-T.
 */
function generalLedgerXml(journalEntries) {
    return journalEntries
        .map(
            (entry) => `
      <Journal>
        <JournalID>${escapeXml(entry.id)}</JournalID>
        <Description>${escapeXml(entry.description)}</Description>
        <TransactionDate>${dateOnly(entry.entryDate)}</TransactionDate>
        <Source>${escapeXml(entry.source)}</Source>
      </Journal>`,
        )
        .join("");
}

/**
 * Constrói o input de readiness a partir dos dados já lidos pelo service.
 *
 * @param {{ input: { fromDate: Date, toDate: Date }, profile: object | null, saleDocuments: object[], purchaseDocuments: object[], journalEntries: object[] }} params - Dados internos do exportador.
 * @returns {{ profile: object | null, period: { fromDate: Date, toDate: Date }, counts: { saleDocuments: number, purchaseDocuments: number, journalEntries: number } }} Input para a checklist.
 */
function buildSaftReadinessInput({ input, profile, saleDocuments, purchaseDocuments, journalEntries }) {
    return {
        profile,
        period: {
            fromDate: input.fromDate,
            toDate: input.toDate,
        },
        counts: {
            saleDocuments: saleDocuments.length,
            purchaseDocuments: purchaseDocuments.length,
            journalEntries: journalEntries.length,
        },
    };
}

/**
 * Gera XML SAF-T MVP rastreável e regista a execução.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto autenticado.
 * @returns {Promise<object>} Exportação SAF-T MVP.
 */
export async function buildSaftExport(prisma, input) {
    const [profile, saleDocuments, purchaseDocuments, journalEntries] =
        await Promise.all([
            prisma.companyProfile.findUnique({ where: { companyId: input.companyId } }),
            prisma.saleDocument.findMany({
                where: {
                    companyId: input.companyId,
                    issuedAt: { gte: input.fromDate, lte: input.toDate },
                },
                orderBy: { issuedAt: "asc" },
            }),
            prisma.purchaseDocument.findMany({
                where: {
                    companyId: input.companyId,
                    issuedAt: { gte: input.fromDate, lte: input.toDate },
                },
                orderBy: { issuedAt: "asc" },
            }),
            prisma.journalEntry.findMany({
                where: {
                    companyId: input.companyId,
                    entryDate: { gte: input.fromDate, lte: input.toDate },
                },
                orderBy: { entryDate: "asc" },
            }),
        ]);

    const readiness = assertSaftReadiness(
        buildSaftReadinessInput({
            input,
            profile,
            saleDocuments,
            purchaseDocuments,
            journalEntries,
        }),
    );

    // Só depois da readiness check criamos nomes, XML, run e log de sucesso.
    const fileName = `saft-${profile.nif}-${dateOnly(input.fromDate)}-${dateOnly(input.toDate)}.xml`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile>
  <Header>
    <AuditFileVersion>1.04_01-MVP</AuditFileVersion>
    <CompanyID>${escapeXml(profile.nif)}</CompanyID>
    <TaxRegistrationNumber>${escapeXml(profile.nif)}</TaxRegistrationNumber>
    <CompanyName>${escapeXml(profile.legalName)}</CompanyName>
    <FiscalYear>${input.fromDate.getUTCFullYear()}</FiscalYear>
    <StartDate>${dateOnly(input.fromDate)}</StartDate>
    <EndDate>${dateOnly(input.toDate)}</EndDate>
    <CurrencyCode>${escapeXml(profile.currency)}</CurrencyCode>
  </Header>
  <GeneralLedgerEntries>${generalLedgerXml(journalEntries)}
  </GeneralLedgerEntries>
  <SourceDocuments>${sourceDocumentsXml(saleDocuments, purchaseDocuments)}
  </SourceDocuments>
</AuditFile>`;

    const run = await prisma.saftExportRun.create({
        data: {
            companyId: input.companyId,
            fromDate: input.fromDate,
            toDate: input.toDate,
            fileName,
            saleDocumentCount: saleDocuments.length,
            purchaseDocumentCount: purchaseDocuments.length,
            journalEntryCount: journalEntries.length,
            exportedById: input.userId,
        },
    });

    await recordIntegrationLog(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        integrationType: "SAFT",
        operation: "EXPORT",
        status: "EXPORTED",
        sourceId: run.id,
        fileName,
        totalRows: readiness.totalRows,
        successRows: readiness.totalRows,
        errorRows: 0,
        message: "Exportação SAF-T MVP registada sem guardar XML no log.",
    });

    return {
        runId: run.id,
        fileName,
        xml,
        counts: {
            saleDocuments: saleDocuments.length,
            purchaseDocuments: purchaseDocuments.length,
            journalEntries: journalEntries.length,
        },
        readiness: {
            checkedAt: readiness.checkedAt,
            totalRows: readiness.totalRows,
        },
        note: "SAF-T MVP rastreável; não substitui validação legal oficial.",
    };
}