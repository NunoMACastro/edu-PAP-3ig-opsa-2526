### Passo 1

* BK: BK-MF1-09
* Macrofase: MF1
* Requisito funcional: RF21
* Dependência: BK-MF0-03, BK-MF0-08, BK-MF1-04, BK-MF1-07
* Sprint: S03-S04
* Próximo BK: BK-MF1-10
* Endpoint previsto: /api/accounting/purchase-postings/:purchaseDocumentId

### Passo 2
Foi necessário garantir que os modelos provenientes das outras BK (`PurchaseDocument`, `PurchaseDocumentLine`, `JournalEntry` e `JournalEntryLine`) estavam presentes na branch, porque o ainda não tinha BK03, BK05-06, BK08 feitos. Se tirar eles da prisma, o código passa.
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

### Passo 3