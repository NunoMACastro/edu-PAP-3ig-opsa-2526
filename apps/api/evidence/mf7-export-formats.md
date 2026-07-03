# Evidence MF7 - Exportacoes CSV/XLSX/PDF

## Contrato

- Data de execucao: `2026-06-30`
- BK: `BK-MF7-05`
- Requisito: `RNF22`
- Fluxos cobertos: balancete e razao em `csv`, `xlsx` e `pdf`
- Implementation root: `real_dev/api`

## Entrega

- `GET /api/accounting/reports/trial-balance/export?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|xlsx|pdf`
- `GET /api/accounting/reports/ledger/export?accountId=ID&from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|xlsx|pdf`
- Endpoints legados preservados:
  - `GET /api/accounting/reports/trial-balance.xlsx`
  - `GET /api/accounting/reports/ledger.pdf`

## Seguranca e dominio

- Dados continuam a vir de `buildTrialBalance` e `buildLedger`.
- Empresa ativa continua a vir de `req.companyId`.
- Permissao final continua a ser `Permission.ACCOUNTING_READ`.
- CSV/XLSX neutralizam celulas iniciadas por `=`, `+`, `-` ou `@`.
- O frontend apenas constroi URLs de download; nao decide empresa, role ou permissao.

## Comandos executados

```bash
npm --prefix real_dev/api run syntax:check
npm --prefix real_dev/api run test:mf7:exports
npm --prefix real_dev/api run test:contracts
npm --prefix real_dev/web run test:mf7
git diff --check
```

## Resultado observado

- `test:mf7:exports`: `PASS`, 4 testes, 0 falhas.
- `test:contracts`: `PASS`, 45 testes, 0 falhas.
- `test:mf7` web: `PASS`, inclui browser compatibility, typecheck e build.
- `git diff --check`: `PASS`.
