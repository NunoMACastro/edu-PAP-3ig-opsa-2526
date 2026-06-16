/**
 * @file Gerador SAF-T (PT) MVP da MF3.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Escapa caracteres especiais para impedir XML inválido no ficheiro SAF-T gerado.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Texto escapado para ser usado em XML.
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
 * @param value - Valor a normalizar ou formatar.
 * @returns Data no formato ISO curto.
 */
function dateOnly(value) {
    return value.toISOString().slice(0, 10);
}

/**
 * Valida os dados mínimos do perfil da empresa necessários para gerar o cabeçalho SAF-T.
 *
 * @param profile - Perfil da empresa usado no cabeçalho SAF-T.
 * @returns Perfil validado para geração do SAF-T.
 */
function assertProfile(profile) {
    if (
        !profile?.legalName ||
        !profile?.nif ||
        !profile?.addressLine1 ||
        !profile?.postalCode ||
        !profile?.city
    ) {
        throw httpError(
            422,
            "COMPANY_PROFILE_INCOMPLETE",
            "Perfil fiscal da empresa incompleto para exportação SAF-T",
        );
    }
}

/**
 * Gera o bloco XML de documentos comerciais do SAF-T a partir das vendas emitidas.
 *
 * @param saleDocuments - Documentos de venda a exportar.
 * @param purchaseDocuments - Documentos de compra a exportar.
 * @returns Bloco XML de documentos comerciais do SAF-T.
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
 * @param journalEntries - Lançamentos contabilísticos a exportar.
 * @returns Bloco XML com lançamentos contabilísticos SAF-T.
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
 * Gera XML SAF-T MVP rastreável e regista a execução.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto.
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

    assertProfile(profile);
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

    return {
        runId: run.id,
        fileName,
        xml,
        counts: {
            saleDocuments: saleDocuments.length,
            purchaseDocuments: purchaseDocuments.length,
            journalEntries: journalEntries.length,
        },
        note: "SAF-T MVP rastreável; não substitui validação legal completa da especificação oficial.",
    };
}
