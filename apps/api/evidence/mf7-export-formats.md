# Evidence MF7 - exportações CSV, Excel e PDF

## Contexto

- Data: 2026-06-26
- BK: BK-MF7-05
- Requisito: RNF22
- Origem da empresa: sessão autenticada resolvida no backend

## Comandos executados

```bash
cd apps/api
node --check src/modules/exports/exportFormatService.js
node --check src/modules/accounting-reports/accountingReportRoutes.js
npm run test:mf7:exports
```

## Smoke manual autenticado

```bash
curl -i --cookie apps/api/evidence/sessao-local.txt "http://localhost:3000/api/accounting/reports/trial-balance/export?from=2026-01-01&to=2026-12-31&format=csv"
curl -i --cookie apps/api/evidence/sessao-local.txt "http://localhost:3000/api/accounting/reports/trial-balance/export?from=2026-01-01&to=2026-12-31&format=xlsx"
curl -i --cookie apps/api/evidence/sessao-local.txt "http://localhost:3000/api/accounting/reports/ledger/export?accountId=ACC-001&from=2026-01-01&to=2026-12-31&format=pdf"
curl -i --cookie apps/api/evidence/sessao-local.txt "http://localhost:3000/api/accounting/reports/trial-balance/export?format=html"
```

## Resultado esperado

| Verificação | Resultado |
| --- | --- |
| CSV devolve `Content-Type: text/csv; charset=utf-8` | PASS |
| XLSX devolve content type de Excel | PASS |
| PDF devolve `Content-Type: application/pdf` | PASS |
| Ficheiros válidos usam `Content-Disposition: attachment` | PASS |
| `format=html` devolve HTTP 400 e `INVALID_EXPORT_FORMAT` | PASS |
| Nenhum pedido aceita empresa vinda do browser | PASS |