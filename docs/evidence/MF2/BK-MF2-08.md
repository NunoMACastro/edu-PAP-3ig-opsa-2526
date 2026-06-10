# BK-MF2-08

## Requisito validado
RF30 - Demonstração de Resultados e Balanço

---

## Endpoints implementados

- GET /api/accounting/statements/income-statement
- GET /api/accounting/statements/balance-sheet

---

## Ficheiros envolvidos

### Criados
- apps/api/src/modules/financial-statements/financialStatementService.js
- apps/api/src/modules/financial-statements/financialStatementRoutes.js

### Reutilizados
- apps/api/src/modules/accounting-reports/accountingReportFilters.js (parseDateRange)
- apps/api/src/modules/accounting-reports/accountingReportService.js (buildTrialBalance)

---

## Comandos executados

```bash
cd apps/api
npm test -- financialStatement