# Evidence BK-MF2-07

## Identificacao

- BK: `BK-MF2-07`
- RF: `RF29`
- Sprint: `S05-S06`
- Dependencias: `BK-MF2-06`
- Proximo BK: `BK-MF2-08`
- Objetivo: balancete e razao exportavel.

## Implementacao observada

- Service de reporting em `real_dev/api/src/modules/accounting-reports/accountingReportService.js`.
- Rotas de reporting em `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js`.
- `GESTOR` tem leitura contabilistica para reporting, sem ganhar escrita contabilistica.

## Evidencia automatizada

```bash
npm run test:unit
npm run test:contracts
```

- Unit: `BK-MF2-07: balancete agrega linhas contabilísticas por empresa e período` passou.
- Unit: `BK-MF2-07: filtros rejeitam período invertido` passou.
- Contract: `BK-MF2-07/BK-MF2-08: gestor pode consultar reporting financeiro` passou.

## Negativos cobertos

- Periodo invertido nos filtros e rejeitado.
- `GESTOR` pode ler reporting financeiro, mas continua sem `ACCOUNTING_WRITE`.

## Limites conhecidos

- A integracao persistida PostgreSQL ficou pendente porque `TEST_DATABASE_URL` nao esta definida neste ambiente.
