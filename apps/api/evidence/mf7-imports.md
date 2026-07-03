# Evidence MF7 - Importacoes CSV/Excel com validacao e logs

## Contrato

- Data de execucao: `2026-06-30`
- BK: `BK-MF7-06`
- Requisito: `RNF23`
- Fluxo coberto: `POST /api/imports/business-data`
- Implementation root: `real_dev/api`

## Entrega

- Parser comum para `.csv` e `.xlsx` em `src/modules/imports/importFileParser.js`.
- Limite operacional de `5000` linhas por ficheiro.
- Importacoes de clientes, fornecedores, artigos e extratos continuam a usar validators de dominio.
- `BankStatementFormat` passa a suportar `XLSX`.
- `BusinessImportRun`, `AuditLog` e `IntegrationLog` registam contagens sem guardar conteudo bruto do ficheiro.

## Seguranca e dominio

- Empresa ativa continua a vir de `context.companyId`, derivado da sessao.
- `companyId` enviado no body nao e usado para ownership.
- A rota continua protegida por sessao, empresa ativa, `Permission.IMPORTS_WRITE` e role `ADMIN`/`CONTABILISTA`.
- Logs de integracao guardam nome curto, contagens e estado; nao guardam ficheiro completo, headers, cookies, tokens ou credenciais.

## Comandos executados

```bash
npm --prefix real_dev/api run syntax:check
npm --prefix real_dev/api run test:mf7:imports
npm --prefix real_dev/api run test:contracts
DATABASE_URL='postgresql://opsa:opsa@localhost:5432/opsa' npm --prefix real_dev/api run prisma:validate
git diff --check
```

## Resultado observado

- `test:mf7:imports`: `PASS`, 6 testes, 0 falhas.
- `test:contracts`: `PASS`, 45 testes, 0 falhas.
- `prisma:validate`: `PASS` com `DATABASE_URL` dummy para validar schema sem tocar na BD.
- `git diff --check`: `PASS`.
