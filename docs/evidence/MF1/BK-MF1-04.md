### Passo 1

* BK: BK-MF1-04
* Macrofase: MF1
* Requisito funcional: RF16
* Dependência: BK-MF0-03, BK-MF0-08, BK-MF1-02
* Próximo BK: BK-MF1-05
* Endpoint previsto: /api/accounting/sale-postings/:saleDocumentId

### Passo 2
Foi necessário garantir que os modelos provenientes do BK-MF1-02 (`SaleDocument`, `SaleDocumentLine`, `NumberSequence` e `AuditLog`) estavam presentes na branch, porque o BK-MF1-04 depende diretamente de documentos de venda emitidos. A relação `Receipt` foi mantida fora do schema enquanto o BK-MF1-03 ainda não estiver integrado.
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
