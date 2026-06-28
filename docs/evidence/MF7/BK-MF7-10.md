## Comandos para os passos 1-2

- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path "docs/RNF.md","docs/planificacao/backlogs/*" -Pattern "RNF27","BK-MF7-10","Testes automatizados"

docs\RNF.md:84:| RNF27 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Qualidade | Should |
docs\planificacao\backlogs\ANEXO-BK-SPRINT-OWNER.md:91:| BK-MF7-10 | MF7 | S11-S12 | Oleksii | Andre | P1 | Core | RNF27 | - | docs/planificacao/guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos
-criticos-faturacao-iva-balancetes-reconciliacao.md |
docs\planificacao\backlogs\ANEXO-RNF-PARA-BKS.md:43:| RNF27 | 1 | BK-MF7-10 |
docs\planificacao\backlogs\BACKLOG-MVP.md:121:| BK-MF7-09 | MF7 | Frontend modular com componentes reutilizáveis. | Andre | Sofia | P0 | TODO | M | - | RNF26 | Fase 3 | BK-MF7-10 | [guia](../guias-bk/M
F7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md) |
docs\planificacao\backlogs\BACKLOG-MVP.md:122:| BK-MF7-10 | MF7 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Oleksii | Andre | P1 | TODO | S | - | RNF27 |
 Fase 3 | BK-MF8-01 | [guia](../guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md) |
docs\planificacao\backlogs\BACKLOG-MVP.md:236:| BK-MF7-09 | Frontend modular com componentes reutilizáveis. | Andre | Sofia | P0 | TODO | M | - | RNF26 | BK-MF7-10 |
docs\planificacao\backlogs\BACKLOG-MVP.md:237:| BK-MF7-10 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Oleksii | Andre | P1 | TODO | S | - | RNF27 | BK-MF
8-01 |
a-balancetes-reconciliacao.md | Core |
docs\planificacao\backlogs\MATRIZ-CANONICA-BK.md:96:| BK-MF7-09 | MF7 | Frontend modular com componentes reutilizáveis. | Andre | Sofia | P0 | TODO | M | - | RNF26 | Fase 3 | BK-MF7-10 |
docs\planificacao\backlogs\MATRIZ-CANONICA-BK.md:97:| BK-MF7-10 | MF7 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Oleksii | Andre | P1 | TODO | S | - | R
NF27 | Fase 3 | BK-MF8-01 |
docs\planificacao\backlogs\MF-VIEWS.md:211:BK-MF7-01, BK-MF7-02, BK-MF7-03, BK-MF7-04, BK-MF7-05, BK-MF7-06, BK-MF7-07, BK-MF7-08, BK-MF7-09, BK-MF7-10
docs\planificacao\backlogs\MF-VIEWS.md:223:- [BK-MF7-10 - Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação).](../guias-bk/MF7/BK-MF7-10-testes-automatizados-para-mo
dulos-criticos-faturacao-iva-balancetes-reconciliacao.md)


- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path "docs/planificacao/guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md" -Pattern "BK-MF7-10"

docs\planificacao\guias-bk\MF7\BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md:18:- `proximo_bk`: `BK-MF7-10`
docs\planificacao\guias-bk\MF7\BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md:32:Este BK prepara `BK-MF7-10` e mantém continuidade com `BK-MF6-10`, que tornou a auditoria obrigatória em op
erações sensíveis.
docs\planificacao\guias-bk\MF7\BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md:88:- Handoff para o próximo BK: `BK-MF7-10`.
o-iva-balancetes-reconciliacao.md`
docs\planificacao\guias-bk\MF7\BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md:116:Confirma que `RNF26` pede frontend modular e que este BK fica entre o backend modular (`BK-MF7-08`) e os t
estes automatizados (`BK-MF7-10`). Depois escreve uma checklist técnica com estes contratos mínimos:
docs\planificacao\guias-bk\MF7\BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md:488:- BK-MF7-10 pode reutilizar este gate como pré-condição dos testes automatizados.
docs\planificacao\guias-bk\MF7\BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md:528:- Proximo BK recomendado: `BK-MF7-10`
docs\planificacao\guias-bk\MF7\BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md:529:- Este BK entrega a `BK-MF7-10` um contrato validado: fica criado um gate de modularidade frontend para re
utilizar UI, clientes API e páginas por domínio.


- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path "apps/api/src/modules/sales/saleDocumentService.js" -Pattern "createSaleDocument","issueSaleDocument","totalCents","vatCents","auditLog.create","companyId"

apps\api\src\modules\sales\saleDocumentService.js:66: * @param {string} companyId - Empresa ativa.
apps\api\src\modules\sales\saleDocumentService.js:71:async function nextSaleNumber(tx, companyId, kind, issuedAt) {
apps\api\src\modules\sales\saleDocumentService.js:76:        where: { companyId_scope_year: { companyId, scope, year } },
apps\api\src\modules\sales\saleDocumentService.js:77:        create: { companyId, scope, year, prefix, nextValue: 2 },
apps\api\src\modules\sales\saleDocumentService.js:89: * @param {string} companyId - Empresa ativa.
apps\api\src\modules\sales\saleDocumentService.js:92:export async function listSaleDocuments(prisma, companyId) {
apps\api\src\modules\sales\saleDocumentService.js:94:        where: { companyId },
apps\api\src\modules\sales\saleDocumentService.js:104: * @param {string} companyId - Empresa ativa.
apps\api\src\modules\sales\saleDocumentService.js:109:export async function createSaleDocument(prisma, companyId, userId, input) {
apps\api\src\modules\sales\saleDocumentService.js:129:    await assertOpenFiscalPeriod(prisma, { companyId, documentDate: issuedAt });
apps\api\src\modules\sales\saleDocumentService.js:133:            where: { id: input.customerId, companyId, isActive: true },
apps\api\src\modules\sales\saleDocumentService.js:142:            where: { id: { in: itemIds }, companyId, isActive: true },
apps\api\src\modules\sales\saleDocumentService.js:145:            where: { id: { in: vatRateIds }, companyId, isActive: true },
apps\api\src\modules\sales\saleDocumentService.js:168:            const subtotalCents = line.quantity * line.unitPriceCents;
apps\api\src\modules\sales\saleDocumentService.js:169:            const vatCents = Math.round((subtotalCents * vatRate.rateBps) / 10000);
apps\api\src\modules\sales\saleDocumentService.js:173:                subtotalCents,
apps\api\src\modules\sales\saleDocumentService.js:174:                vatCents,
apps\api\src\modules\sales\saleDocumentService.js:175:                totalCents: subtotalCents + vatCents,
apps\api\src\modules\sales\saleDocumentService.js:178:        const subtotalCents = computedLines.reduce(
apps\api\src\modules\sales\saleDocumentService.js:179:            (sum, line) => sum + line.subtotalCents,
apps\api\src\modules\sales\saleDocumentService.js:182:        const vatCents = computedLines.reduce(
apps\api\src\modules\sales\saleDocumentService.js:183:            (sum, line) => sum + line.vatCents,
apps\api\src\modules\sales\saleDocumentService.js:186:        const totalCents = subtotalCents + vatCents;
apps\api\src\modules\sales\saleDocumentService.js:190:                companyId,
apps\api\src\modules\sales\saleDocumentService.js:197:                subtotalCents,
apps\api\src\modules\sales\saleDocumentService.js:198:                vatCents,
apps\api\src\modules\sales\saleDocumentService.js:199:                totalCents,
apps\api\src\modules\sales\saleDocumentService.js:207:        await tx.auditLog.create({
apps\api\src\modules\sales\saleDocumentService.js:209:                companyId,
apps\api\src\modules\sales\saleDocumentService.js:214:                details: { kind, customerId: customer.id, totalCents },
apps\api\src\modules\sales\saleDocumentService.js:226: * @param {string} companyId - Empresa ativa.
apps\api\src\modules\sales\saleDocumentService.js:231:export async function issueSaleDocument(prisma, companyId, userId, id) {
apps\api\src\modules\sales\saleDocumentService.js:234:            where: { id, companyId },
apps\api\src\modules\sales\saleDocumentService.js:270:                companyId,
apps\api\src\modules\sales\saleDocumentService.js:277:                    ? document.totalCents
apps\api\src\modules\sales\saleDocumentService.js:293:            companyId,
apps\api\src\modules\sales\saleDocumentService.js:304:            companyId,
apps\api\src\modules\sales\saleDocumentService.js:313:                totalCents: issued.totalCents,
apps\api\src\modules\sales\saleDocumentService.js:326: * @param {{ companyId: string, userId: string, saleDocumentId: string }} input - Contexto da remoção.
apps\api\src\modules\sales\saleDocumentService.js:336:            companyId: input.companyId,


- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path "apps/api/src/modules/tax/vatMapService.js" -Pattern "buildVatMap","fromDate","toDate","liquidatedVatCents","deductibleVatCents","vatBalanceCents","companyId"

apps\api\src\modules\tax\vatMapService.js:17:            liquidatedVatCents: 0,
apps\api\src\modules\tax\vatMapService.js:18:            deductibleVatCents: 0,
apps\api\src\modules\tax\vatMapService.js:44:            bucket.liquidatedVatCents += sign * line.vatCents;
apps\api\src\modules\tax\vatMapService.js:46:            bucket.deductibleVatCents += sign * line.vatCents;
apps\api\src\modules\tax\vatMapService.js:59: * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto validado.
apps\api\src\modules\tax\vatMapService.js:62:export async function buildVatMap(prisma, input) {
apps\api\src\modules\tax\vatMapService.js:65:            companyId: input.companyId,
apps\api\src\modules\tax\vatMapService.js:67:            entryDate: { gte: input.fromDate, lte: input.toDate },
apps\api\src\modules\tax\vatMapService.js:81:            where: { id: { in: saleIds }, companyId: input.companyId },
apps\api\src\modules\tax\vatMapService.js:85:            where: { id: { in: purchaseIds }, companyId: input.companyId },
apps\api\src\modules\tax\vatMapService.js:101:            vatBalanceCents: row.liquidatedVatCents - row.deductibleVatCents,
apps\api\src\modules\tax\vatMapService.js:107:    const liquidatedVatCents = rows.reduce(
apps\api\src\modules\tax\vatMapService.js:108:        (sum, row) => sum + row.liquidatedVatCents,
apps\api\src\modules\tax\vatMapService.js:111:    const deductibleVatCents = rows.reduce(
apps\api\src\modules\tax\vatMapService.js:112:        (sum, row) => sum + row.deductibleVatCents,
apps\api\src\modules\tax\vatMapService.js:115:    const vatBalanceCents = liquidatedVatCents - deductibleVatCents;
apps\api\src\modules\tax\vatMapService.js:119:            companyId: input.companyId,
apps\api\src\modules\tax\vatMapService.js:120:            fromDate: input.fromDate,
apps\api\src\modules\tax\vatMapService.js:121:            toDate: input.toDate,
apps\api\src\modules\tax\vatMapService.js:123:            deductibleVatCents,
apps\api\src\modules\tax\vatMapService.js:124:            vatBalanceCents,
apps\api\src\modules\tax\vatMapService.js:131:        fromDate: input.fromDate,
apps\api\src\modules\tax\vatMapService.js:132:        toDate: input.toDate,
apps\api\src\modules\tax\vatMapService.js:133:        liquidatedVatCents,
apps\api\src\modules\tax\vatMapService.js:134:        deductibleVatCents,
apps\api\src\modules\tax\vatMapService.js:135:        vatBalanceCents,


- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path "apps/api/src/modules/accounting-reports/accountingReportService.js" -Pattern "buildTrialBalance","buildLedger","journalEntry","debitCents","creditCents","balanceCents","companyId"

apps\api\src\modules\accounting-reports\accountingReportService.js:11: * @param {{ companyId: string, from: Date, to: Date }} input - Filtros.
apps\api\src\modules\accounting-reports\accountingReportService.js:14:export async function buildTrialBalance(prisma, input) {
apps\api\src\modules\accounting-reports\accountingReportService.js:16:        where: { companyId: input.companyId, isActive: true },
apps\api\src\modules\accounting-reports\accountingReportService.js:19:    const lines = await prisma.journalEntryLine.findMany({
apps\api\src\modules\accounting-reports\accountingReportService.js:21:            journalEntry: {
apps\api\src\modules\accounting-reports\accountingReportService.js:22:                companyId: input.companyId,
apps\api\src\modules\accounting-reports\accountingReportService.js:35:                debitCents: 0,
apps\api\src\modules\accounting-reports\accountingReportService.js:36:                creditCents: 0,
apps\api\src\modules\accounting-reports\accountingReportService.js:37:                balanceCents: 0,
apps\api\src\modules\accounting-reports\accountingReportService.js:45:        row.debitCents += line.debitCents;
apps\api\src\modules\accounting-reports\accountingReportService.js:46:        row.creditCents += line.creditCents;
apps\api\src\modules\accounting-reports\accountingReportService.js:47:        row.balanceCents = row.debitCents - row.creditCents;
apps\api\src\modules\accounting-reports\accountingReportService.js:56:            debitCents: rows.reduce((sum, row) => sum + row.debitCents, 0),
apps\api\src\modules\accounting-reports\accountingReportService.js:57:            creditCents: rows.reduce((sum, row) => sum + row.creditCents, 0),
apps\api\src\modules\accounting-reports\accountingReportService.js:58:            balanceCents: rows.reduce((sum, row) => sum + row.balanceCents, 0),
apps\api\src\modules\accounting-reports\accountingReportService.js:60:        source: "JournalEntryLine grouped by Account",
apps\api\src\modules\accounting-reports\accountingReportService.js:68: * @param {{ companyId: string, accountId: string, from: Date, to: Date }} input - Filtros.
apps\api\src\modules\accounting-reports\accountingReportService.js:71:export async function buildLedger(prisma, input) {
apps\api\src\modules\accounting-reports\accountingReportService.js:73:        where: { id: input.accountId, companyId: input.companyId, isActive: true },
apps\api\src\modules\accounting-reports\accountingReportService.js:79:    const lines = await prisma.journalEntryLine.findMany({
apps\api\src\modules\accounting-reports\accountingReportService.js:82:            journalEntry: {
apps\api\src\modules\accounting-reports\accountingReportService.js:83:                companyId: input.companyId,
apps\api\src\modules\accounting-reports\accountingReportService.js:87:        include: { journalEntry: true },
apps\api\src\modules\accounting-reports\accountingReportService.js:88:        orderBy: { journalEntry: { entryDate: "asc" } },
apps\api\src\modules\accounting-reports\accountingReportService.js:90:    let runningBalanceCents = 0;
apps\api\src\modules\accounting-reports\accountingReportService.js:92:        runningBalanceCents += line.debitCents - line.creditCents;
apps\api\src\modules\accounting-reports\accountingReportService.js:94:            journalEntryId: line.journalEntryId,
apps\api\src\modules\accounting-reports\accountingReportService.js:95:            entryDate: line.journalEntry.entryDate,
apps\api\src\modules\accounting-reports\accountingReportService.js:96:            description: line.journalEntry.description,
apps\api\src\modules\accounting-reports\accountingReportService.js:97:            source: line.journalEntry.source,
apps\api\src\modules\accounting-reports\accountingReportService.js:98:            sourceId: line.journalEntry.sourceId,
apps\api\src\modules\accounting-reports\accountingReportService.js:100:            creditCents: line.creditCents,
apps\api\src\modules\accounting-reports\accountingReportService.js:101:            balanceCents: runningBalanceCents,
apps\api\src\modules\accounting-reports\accountingReportService.js:112:            debitCents: rows.reduce((sum, row) => sum + row.debitCents, 0),
apps\api\src\modules\accounting-reports\accountingReportService.js:113:            creditCents: rows.reduce((sum, row) => sum + row.creditCents, 0),
apps\api\src\modules\accounting-reports\accountingReportService.js:114:            balanceCents: runningBalanceCents,
apps\api\src\modules\accounting-reports\accountingReportService.js:116:        source: "JournalEntryLine filtered by Account",


- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path "apps/api/src/modules/treasury/statementImportService.js" -Pattern "importBankStatement","deduplicateStatementRows","buildSuggestions","bankReconciliationSuggestion","recordIntegrationLog","companyId"

apps\api\src\modules\treasury\statementImportService.js:6:import { recordIntegrationLog } from "../integrations/integrationLogService.js";
apps\api\src\modules\treasury\statementImportService.js:121: * @param {{ companyId: string, line: object, candidateLimit: number }} input - Pedido interno.
apps\api\src\modules\treasury\statementImportService.js:134:                companyId: input.companyId,
apps\api\src\modules\treasury\statementImportService.js:149:            companyId: input.companyId,
apps\api\src\modules\treasury\statementImportService.js:195:export function deduplicateStatementRows(rows) {
apps\api\src\modules\treasury\statementImportService.js:221: * @param companyId - Identificador da empresa ativa.
apps\api\src\modules\treasury\statementImportService.js:225:async function buildSuggestions(tx, companyId, line) {
apps\api\src\modules\treasury\statementImportService.js:234:            where: { companyId, amountCents: amount, receivedAt: dateRange },
apps\api\src\modules\treasury\statementImportService.js:247:        where: { companyId, amountCents: amount, paidAt: dateRange },
apps\api\src\modules\treasury\statementImportService.js:263: * @param {{ companyId: string, input: { statementLineId?: string, candidateLimit?: string | number } }} context - Contexto autenticado.
apps\api\src\modules\treasury\statementImportService.js:279:            companyId: context.companyId,
apps\api\src\modules\treasury\statementImportService.js:292:        companyId: context.companyId,
apps\api\src\modules\treasury\statementImportService.js:324: * @param {{ companyId: string, userId: string, input: unknown }} context - Contexto.
apps\api\src\modules\treasury\statementImportService.js:327:export async function importBankStatement(prisma, context) {
apps\api\src\modules\treasury\statementImportService.js:334:                companyId: context.companyId,
apps\api\src\modules\treasury\statementImportService.js:346:        const deduplicated = deduplicateStatementRows(data.rows);
apps\api\src\modules\treasury\statementImportService.js:350:                companyId: context.companyId,
apps\api\src\modules\treasury\statementImportService.js:368:                    companyId: context.companyId,
apps\api\src\modules\treasury\statementImportService.js:381:            for (const suggestion of await buildSuggestions(tx, context.companyId, line)) {
apps\api\src\modules\treasury\statementImportService.js:383:                    await tx.bankReconciliationSuggestion.create({
apps\api\src\modules\treasury\statementImportService.js:385:                            companyId: context.companyId,
apps\api\src\modules\treasury\statementImportService.js:398:                companyId: context.companyId,
apps\api\src\modules\treasury\statementImportService.js:411:        await recordIntegrationLog(tx, {
apps\api\src\modules\treasury\statementImportService.js:412:            companyId: context.companyId,

