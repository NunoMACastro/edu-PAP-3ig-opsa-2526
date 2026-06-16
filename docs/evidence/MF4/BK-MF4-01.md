Passo 1
* BK: BK-MF4-01
* Macrofase: MF4
* Requisito funcional: RF39 que depende de RF37 e os insights usam apenas dados já existentes
* Dependência: BK-MF3-07 - CANONICO
* Sprint: S07-S08
* Próximo BK: BK-MF4-02
* Endpoint previsto: GET /api/ai/insights?from=YYYY-MM-DD&to=YYYY-MM-DD

Passo 2
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀