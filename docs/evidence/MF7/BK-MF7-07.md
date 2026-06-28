# Evidence BK-MF7-07 - SAF-T readiness

## Identificação

- BK: `BK-MF7-07`
- RNF: `RNF24`
- Data: `2026-06-26`
- Autor da execução: `Andre`

## Contratos confirmados

- `RF36`: exportação SAF-T PT de faturação e contabilidade.
- `RF48`: logs de integração para SAF-T.
- `RNF24`: geração SAF-T conforme especificações legais PT.

## Comandos executados

```bash
cd apps/api
node --check src/modules/compliance/saftComplianceChecklist.js
node --check src/modules/compliance/saftService.js
node --check src/modules/compliance/saftRoutes.js
node --check tests/contracts/mf7-saft-contracts.test.js
npm run test:mf7:saft
```

## Resultado positivo

- `assertSaftReadiness` aceita perfil fiscal completo, período válido e contagens com movimentos.
- `buildSaftExport` chama readiness antes de criar `SaftExportRun`.
- `recordIntegrationLog` continua ligado ao sucesso da exportação.

## Negativos executados

- Período invertido: `INVALID_SAFT_RANGE`.
- Perfil sem NIF: `COMPANY_PROFILE_INCOMPLETE`.
- Período sem documentos nem lançamentos: `EMPTY_SAFT_PERIOD`.

## Segurança e multiempresa

- O endpoint mantém `requireAuth`.
- O endpoint mantém `requireCompanyContext`.
- O endpoint mantém `requirePermission(Permission.COMPLIANCE_READ)`.
- O endpoint mantém roles `ADMIN`, `CONTABILISTA` e `AUDITOR`.
- A empresa ativa vem de `req.companyId`, preenchido pelo backend.

## Handoff

- Próximo BK: `BK-MF7-08`.
- Entrega: módulo de compliance com readiness SAF-T isolada, testada e rastreável.