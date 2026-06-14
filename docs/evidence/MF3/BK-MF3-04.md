Passo 1
* BK: BK-MF3-04
* Macrofase: MF3
* Requisito funcional: RF34
* Dependência: BK-MF3-02, BK-MF1-02, BK-MF1-03, BK-MF1-07, BK-MF1-08
* Sprint: S07-S08
* Próximo BK: BK-MF3-05
* Endpoint previsto: GET /api/treasury/forecast

Passo 2
Ficheiros alterados:
- apps/api/prisma/schema.prisma

Modelo criado:
- CashflowForecastRun

Regras preparadas:
- guarda companyId, fromDate, toDate e generatedById;
- guarda openingBalanceCents;
- guarda expectedInCents;
- guarda expectedOutCents;
- guarda closingBalanceCents;
- guarda generatedAt;
- serve como evidence histórica da previsão;
- não altera documentos, recebimentos, pagamentos ou contabilidade.

Comandos executados:
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

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 3.69s

Passo 3