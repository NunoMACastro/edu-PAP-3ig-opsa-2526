# Evidence MF7 - Readiness SAF-T

## Contrato

- Data de execucao: `2026-06-30`
- BK: `BK-MF7-07`
- Requisito: `RNF24`
- Base funcional: `RF36` e `RF48`
- Fluxo coberto: `GET /api/compliance/saft?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Implementation root: `real_dev/api`

## Entrega

- Checklist `assertSaftReadiness` antes da geracao do XML, `SaftExportRun` e `IntegrationLog`.
- Bloqueio de periodo invertido com `INVALID_SAFT_RANGE`.
- Bloqueio de perfil fiscal incompleto com `COMPANY_PROFILE_INCOMPLETE`.
- Bloqueio de periodo sem documentos nem lancamentos com `EMPTY_SAFT_PERIOD`.
- Resultado positivo inclui `readiness.checkedAt` e `readiness.totalRows`.

## Seguranca e dominio

- Empresa ativa continua a vir de `req.companyId`, resolvido no backend.
- O cliente envia apenas intervalo `from`/`to`; nao decide `companyId`, role ou permissao.
- A rota continua protegida por sessao, empresa ativa, `Permission.COMPLIANCE_READ` e role `ADMIN`/`CONTABILISTA`/`AUDITOR`.
- `IntegrationLog` guarda contagens e nome do ficheiro; nao guarda XML completo, headers, cookies, tokens ou credenciais.
- A entrega continua a ser SAF-T MVP rastreavel; nao substitui validacao legal oficial externa.

## Comandos executados

```bash
npm --prefix real_dev/api run syntax:check
npm --prefix real_dev/api run test:mf7:saft
npm --prefix real_dev/api run test:mf7
npm --prefix real_dev/api run test:contracts
git diff --check
```

## Resultado observado

- `syntax:check`: `PASS`.
- `test:mf7:saft`: `PASS`, 5 testes, 0 falhas.
- `test:mf7`: `PASS`, inclui retencao, email, exportacoes, importacoes, readiness SAF-T e gate de modularidade backend.
- `test:contracts`: `PASS`, 50 testes, 0 falhas.
- `test:unit`: `PASS`, 74 testes, 0 falhas.
- `prisma:validate`: `FAIL_AMBIENTE` sem `DATABASE_URL`; `PASS` com `DATABASE_URL` dummy.
- `test:integration`: `PASS_COM_SKIP_EXPLICITO`, 2 testes saltados por `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- `git diff --check`: `PASS`.
