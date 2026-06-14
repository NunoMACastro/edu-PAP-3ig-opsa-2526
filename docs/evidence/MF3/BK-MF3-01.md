Passo 1
* BK: BK-MF3-01
* Macrofase: MF3
* Requisito funcional: RF31
* Dependência: BK-MF1-01, BK-MF1-02, BK-MF1-04, BK-MF1-07, BK-MF1-09
* Sprint: S07-S08
* Próximo BK: BK-MF3-02
* Endpoint previsto: GET /api/tax/vat-maps

Passo 2
Ficheiros alterados:
- apps/api/prisma/schema.prisma

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate

> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 2.32s