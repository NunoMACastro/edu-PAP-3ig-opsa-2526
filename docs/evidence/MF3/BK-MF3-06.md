Passo 1
* BK: BK-MF3-06
* Macrofase: MF3
* Requisito funcional: RF36
* Dependência: BK-MF0-06, BK-MF0-09, BK-MF0-10, BK-MF1-02, BK-MF1-04, BK-MF1-07, BK-MF1-09, BK-MF2-06
* Sprint: S07-S08
* Próximo BK: BK-MF3-07
* Endpoint previsto: GET /api/compliance/saft

Passo 2
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate

> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 3.96s

Passo 3