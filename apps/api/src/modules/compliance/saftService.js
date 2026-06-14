// apps/api/src/modules/compliance/saftService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Escapa texto antes de o colocar em XML.
 *
 * @param {unknown} value Valor vindo da base de dados.
 * @returns {string} Texto seguro para XML.
 */
function xml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/**
 * Bloqueia exportação quando faltam dados fiscais mínimos da empresa.
 *
 * @param {{ profile?: { nif?: string | null, legalName?: string | null, currency?: string | null } | null } | null} company Empresa com perfil fiscal.
 * @returns {void}
 * @throws {import("../../lib/httpErrors.js").HttpError} 422 quando NIF, nome legal ou moeda faltam.
 */
function assertCompanyProfile(company) {
    if (!company?.profile?.nif || !company?.profile?.legalName || !company?.profile?.currency) {
        throw httpError(422, "COMPANY_PROFILE_INCOMPLETE", "Dados fiscais da empresa incompletos");
    }
}

/**
 * Gera XML SAF-T MVP para a empresa ativa e regista a exportação.
 *
 * Este service não submete ficheiros a Autoridade Tributária e não declara conformidade legal completa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e período.
 * @returns {Promise<{ fileName: string, xml: string, counts: Record<string, number> }>} XML e contagens para evidence.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa ou 422 com perfil fiscal incompleto.
 */
export async function buildSaftXml(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const [company, customers, suppliers, sales, purchases, entries] = await Promise.all([
        prisma.company.findUnique({ where: { id: companyId }, include: { profile: true } }),
        prisma.customer.findMany({ where: { companyId } }),
        prisma.supplier.findMany({ where: { companyId } }),
        prisma.saleDocument.findMany({ where: { companyId, status: { in: ["ISSUED", "SETTLED"] }, issuedAt: { gte: fromDate, lte: toDate } } }),
        prisma.purchaseDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate } } }),
        prisma.journalEntry.findMany({ where: { companyId, entryDate: { gte: fromDate, lte: toDate } } }),
    ]);

    assertCompanyProfile(company);
    const profile = company.profile;

    // Cada valor de base de dados passa por xml() para evitar XML malformado por caracteres especiais.
    const body = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<AuditFile>`,
        `<Header><CompanyName>${xml(profile.legalName)}</CompanyName><TaxRegistrationNumber>${xml(profile.nif)}</TaxRegistrationNumber><CurrencyCode>${xml(profile.currency)}</CurrencyCode></Header>`,
        `<MasterFiles>`,
        ...customers.map((item) => `<Customer><CustomerID>${xml(item.id)}</CustomerID><CompanyName>${xml(item.name)}</CompanyName><TaxRegistrationNumber>${xml(item.nif)}</TaxRegistrationNumber></Customer>`),
        ...suppliers.map((item) => `<Supplier><SupplierID>${xml(item.id)}</SupplierID><CompanyName>${xml(item.name)}</CompanyName><TaxRegistrationNumber>${xml(item.nif)}</TaxRegistrationNumber></Supplier>`),
        `</MasterFiles>`,
        `<SourceDocuments>`,
        ...sales.map((doc) => `<SalesInvoice><InvoiceNo>${xml(doc.number)}</InvoiceNo><InvoiceDate>${doc.issuedAt.toISOString().slice(0, 10)}</InvoiceDate></SalesInvoice>`),
        ...purchases.map((doc) => `<PurchaseInvoice><InvoiceNo>${xml(doc.supplierNumber)}</InvoiceNo><InvoiceDate>${doc.issuedAt.toISOString().slice(0, 10)}</InvoiceDate></PurchaseInvoice>`),
        `</SourceDocuments>`,
        `<GeneralLedgerEntries>${entries.map((entry) => `<Journal><JournalID>${xml(entry.id)}</JournalID></Journal>`).join("")}</GeneralLedgerEntries>`,
        `</AuditFile>`,
    ].join("");

    const fileName = `saft-${companyId}-${fromDate.toISOString().slice(0, 10)}-${toDate.toISOString().slice(0, 10)}.xml`;
    // O run é o log de integração que prova quem exportou, quando e para que período.
    await prisma.saftExportRun.create({ data: { companyId, fromDate, toDate, fileName, status: "GENERATED", exportedById: userId } });
    return { fileName, xml: body, counts: { customers: customers.length, suppliers: suppliers.length, sales: sales.length, purchases: purchases.length, entries: entries.length } };
}