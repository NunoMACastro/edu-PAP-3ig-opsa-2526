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

Passo 3
Ficheiros criados:
- apps/api/src/modules/tax/vatMapFilters.js

Regras implementadas:
- from é obrigatório;
- to é obrigatório;
- from tem de ser uma data válida;
- to tem de ser uma data válida;
- from não pode ser posterior a to;
- intervalo máximo permitido é 366 dias;
- validator devolve apenas fromDate e toDate;
- companyId não vem da query nem do frontend.

Smoke previsto/validado:
- from=2026-01-01&to=2026-01-31 devolve fromDate e toDate válidos.

Negativos previstos/validados:
- from em falta devolve 400 INVALID_DATE_RANGE;
- to em falta devolve 400 INVALID_DATE_RANGE;
- from=abc devolve 400 INVALID_DATE_RANGE;
- to=abc devolve 400 INVALID_DATE_RANGE;
- from=2026-02-01&to=2026-01-01 devolve 400 INVALID_DATE_RANGE;
- intervalo superior a 366 dias devolve 400 INVALID_DATE_RANGE.

Validação executada:

✓ from=2026-01-01&to=2026-01-31 devolve período válido.

✓ from=abc devolve 400 INVALID_DATE_RANGE.

✓ from=2026-02-01&to=2026-01-01 devolve 400 INVALID_DATE_RANGE. 

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node apps/api/tests/temp-vat-test.js
{
  fromDate: 2026-01-01T00:00:00.000Z,
  toDate: 2026-01-31T00:00:00.000Z
}

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node apps/api/tests/temp-vat-test.js
HttpError: from deve ser uma data válida{
  status: 400,
  code: 'INVALID_DATE_RANGE',
  details: undefined
}

Passo 3
Ficheiros criados:
- apps/api/src/modules/tax/vatMapService.js

Regras implementadas:
- service buildVatMap calcula mapa de IVA por empresa ativa;
- JournalEntry com source=SALE é usado como fonte de IVA liquidado;
- JournalEntry com source=PURCHASE é usado como fonte de IVA dedutível;
- apenas documentos contabilizados entram no mapa;
- sourceId dos lançamentos é usado para encontrar linhas operacionais;
- SaleDocumentLine fornece vatRate.code, vatRate.rateBps e vatCents;
- PurchaseDocumentLine fornece vatRate.code, vatRate.rateBps e vatCents;
- IVA é agregado por código e taxa;
- totais são calculados em cêntimos;
- VatMapRun é criado para persistir a execução;
- companyId vem do contexto autenticado, não do frontend.

Smoke previsto/validado:
- venda contabilizada com IVA de 2300 cêntimos entra como IVA liquidado;
- compra contabilizada com IVA de 1000 cêntimos entra como IVA dedutível;
- saldo calculado é 1300 cêntimos;
- rows devolvem vatCode, vatRateBps, liquidatedVatCents, deductibleVatCents e balanceCents;
- resultado devolve runId, período, totals, rows e sources.

Negativos previstos/validados:
- sem empresa ativa devolve 401 COMPANY_CONTEXT_REQUIRED;
- documentos sem JournalEntry não entram no mapa;
- documentos de outra empresa não entram no mapa;
- período sem documentos devolve totais a zero e rows vazias.

Validação manual do service:
- venda com IVA liquidado de 2300 cêntimos;
- compra com IVA dedutível de 1000 cêntimos;
- saldo calculado: 1300 cêntimos;
- resultado esperado confirmado: 13 EUR a entregar.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node apps/api/tests/temp-vat-map-service-test.js
{
  "runId": "run-1",
  "from": "2026-01-01",
  "to": "2026-01-31",
  "totals": {
    "liquidatedVatCents": 2300,
    "deductibleVatCents": 1000,
    "vatBalanceCents": 1300
  },
  "rows": [
    {
      "vatCode": "IVA23",
      "vatRateBps": 2300,
      "liquidatedVatCents": 2300,
      "deductibleVatCents": 1000,
      "balanceCents": 1300
    }
  ],
  "sources": [
    "JournalEntry",
    "SaleDocumentLine",
    "PurchaseDocumentLine"
  ]
}
Teste passou: saldo IVA = 13 EUR