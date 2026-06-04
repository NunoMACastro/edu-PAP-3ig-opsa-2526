### Passo 1

* BK: BK-MF1-07
* Macrofase: MF1
* Requisito funcional: RF19
* Dependência: BK-MF0-03, BK-MF0-08, BK-MF0-10, BK-MF0-11, BK-MF1-01
* Sprint: S03-S04
* Próximo BK: BK-MF1-08
* Endpoint previsto: /api/purchases/documents

### Passo 2
Como aida não tinha BK03-BK06 feitos tive que apagar 
"saleDocumentLines SaleDocumentLine[]" do VatRate
"saleDocumentLines SaleDocumentLine[]" do Item

e do Company
"numberSequences   NumberSequence[]
saleDocuments     SaleDocument[]
receipts          Receipt[]
journalEntries    JournalEntry[]
auditLogs         AuditLog[]"
do schema.prisma e depois os comandos funcionaram.
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate
> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 643ms

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate                                 
   
> @opsa/api@1.0.0 prisma:validate   
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

Depopis de testar eu voltei tudo pasa schema.prisma para não criar conflitos.

### Passo 3