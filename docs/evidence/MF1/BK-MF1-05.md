### Passo 1

* BK: BK-MF1-05
* Macrofase: MF1
* Requisito funcional: RF17
* Dependência: BK-MF0-03, BK-MF1-02, BK-MF1-03
* Próximo BK: BK-MF1-06
* Endpoint previsto: /api/sales/open-items

### Passo 2
Foi necessário adaptar o schema ao estado real da branch. O BK-MF1-05 reutiliza `SaleDocument` para consultar títulos em aberto, mas `Receipt` e `NumberSequence` não são necessários para esta consulta quando os respetivos BKs ainda não estão presentes na branch. Foi mantido o contrato funcional através de `amountPaidCents`.

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

### Passso 3