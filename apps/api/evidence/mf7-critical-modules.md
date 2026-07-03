# Evidence BK-MF7-10 - Testes automatizados para modulos criticos

## Fonte

- RNF27: testes automatizados para modulos criticos.
- Guia: `docs/planificacao/guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md`.
- Implementacao real: `real_dev/api`.

## Proof

- Comando: `node --check real_dev/api/tests/contracts/mf7-critical-modules.test.js`
- Resultado: `PASS`, sem erros de sintaxe.
- Comando: `npm --prefix real_dev/api run test:mf7:critical-modules`
- Resultado: `PASS`, 3 testes passaram.
- Comando: `npm --prefix real_dev/api run test:contracts`
- Resultado: `PASS`, 53 testes passaram.
- Comando: `npm --prefix real_dev/api run test:mf7`
- Resultado: `PASS`, agregador MF7 inclui retencao, email, exportacoes, importacoes, SAF-T, modularidade backend e modulos criticos.

## Negativos

- Comando: `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=faturacao:assertOpenFiscalPeriod npm --prefix real_dev/api run test:mf7:critical-modules`
- Resultado esperado: `FAIL`; mensagem indica que `faturacao` perdeu `assertOpenFiscalPeriod`.
- Comando: `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=balancetes:buildTrialBalance npm --prefix real_dev/api run test:mf7:critical-modules`
- Resultado esperado: `FAIL`; mensagem indica que `balancetes` perdeu `buildTrialBalance`.
- Comando: `OPSA_MF7_CRITICAL_SIMULATE_MISSING_MARKER=reconciliacao:recordIntegrationLog npm --prefix real_dev/api run test:mf7:critical-modules`
- Resultado esperado: `FAIL`; mensagem indica que `reconciliacao` perdeu `recordIntegrationLog`.

## Multiempresa

- A suite exige `companyId` nos services criticos como contexto backend.
- A suite rejeita `req.body.companyId` e `req.query.companyId` nos services criticos.
- O frontend continua fora da decisao de ownership, empresa ativa, role e permissao final.

## Handoff

- `BK-MF8-01` recebe baseline automatizada para logs estruturados sobre services criticos testaveis.
- Esta suite e gate de contrato; nao substitui cenarios funcionais completos com base de dados real.
