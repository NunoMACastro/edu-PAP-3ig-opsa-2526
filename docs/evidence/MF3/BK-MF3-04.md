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
Ficheiros criados:
- apps/api/src/modules/treasury/cashflowForecastFilters.js
Temporario
edu-PAP-3ig-opsa-2526/node test-forecast-filter.js

Regras implementadas:
- from é obrigatório e deve ser data válida;
- to é obrigatório e deve ser data válida;
- from não pode ser posterior a to;
- horizonte máximo permitido é 180 dias;
- intervalo superior a 180 dias devolve FORECAST_RANGE_TOO_LONG;
- validator devolve fromDate e toDate já normalizados;
- companyId não vem da query.

Smoke validado:
- intervalo de 180 dias é aceite.

Negativo validado:
- intervalo de 181 dias devolve 400 FORECAST_RANGE_TOO_LONG.

Comandos executados:
- node test-forecast-filter.js
- npm --prefix apps/api run syntax:check

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-forecast-filter.js
Teste 180 dias passou: {
  fromDate: 2026-01-01T00:00:00.000Z,
  toDate: 2026-06-29T00:00:00.000Z
}
{
  status: 400,
  code: 'FORECAST_RANGE_TOO_LONG',
  message: 'A previsão não deve exceder 180 dias'
}
Teste 181 dias passou: intervalo superior a 180 dias bloqueado.

Passo 4
Ficheiros criados:
- apps/api/src/modules/treasury/cashflowForecastService.js
Temporario
edu-PAP-3ig-opsa-2526/node test-forecast-service.js

Regras implementadas:
- calcula saldo inicial com o snapshot mais recente de cada conta;
- agrega entradas previstas por SaleDocument;
- agrega saídas previstas por PurchaseDocument;
- usa totalCents - amountPaidCents;
- ignora documentos sem valor em aberto;
- agrega linhas por dia;
- calcula saldo projetado diário;
- grava execução em CashflowForecastRun;
- não altera documentos, recebimentos, pagamentos ou contabilidade;
- todas as queries usam companyId.

Smoke validado:
- snapshots de 900 EUR e 1000 EUR usam 1000 EUR como abertura;
- venda em aberto de 300 EUR entra como expectedInCents;
- compra em aberto de 200 EUR entra como expectedOutCents;
- saldo final previsto fica 1100 EUR.

Negativo validado:
- sem empresa ativa devolve 401 COMPANY_CONTEXT_REQUIRED.

Comandos executados:
- node test-forecast-service.js

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-forecast-service.js
{
  "runId": "run-1",
  "from": "2026-01-01",
  "to": "2026-01-31",
  "openingBalanceCents": 100000,
  "expectedInCents": 30000,
  "expectedOutCents": 20000,
  "closingBalanceCents": 110000,
  "rows": [
    {
      "date": "2026-01-10",
      "expectedInCents": 30000,
      "expectedOutCents": 0,
      "sources": [
        "SaleDocument:sale-1"
      ],
      "projectedBalanceCents": 130000
    },
    {
      "date": "2026-01-11",
      "expectedInCents": 0,
      "expectedOutCents": 20000,
      "sources": [
        "PurchaseDocument:purchase-1"
      ],
      "projectedBalanceCents": 110000
    }
  ]
}
Teste positivo passou: saldo final previsto = 1100 EUR.
{
  status: 401,
  code: 'COMPANY_CONTEXT_REQUIRED',
  message: 'Empresa ativa obrigatória'
}
Teste negativo passou: sem empresa ativa devolve 401.

Passo 5