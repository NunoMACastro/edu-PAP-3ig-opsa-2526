# Evidence MF8 / BK-MF8-12

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-12`
- Tema: preferencias de alertas por tipo
- RF/RNF: `RNF33`
- Data de revalidacao: `2026-07-09`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Modelo: `AlertPreference` em `real_dev/api/prisma/schema.prisma`
- Migration: `real_dev/api/prisma/migrations/20260706120000_mf8_alert_preferences/migration.sql`
- Service: `real_dev/api/src/modules/notifications/alertPreferenceService.js`
- Router: `real_dev/api/src/modules/notifications/notificationRoutes.js`
- Contrato: `real_dev/api/tests/contracts/mf8-alert-preferences.contract.test.js`

## Contrato observado

- As preferencias sao isoladas por empresa ativa, utilizador e tipo.
- A API devolve defaults e sobrepoe preferencias persistidas.
- O body configuravel aceita `enabled`; `companyId` nao decide ownership.
- O tipo `security` nao pode ser desativado.
- As rotas de preferencias usam os guards comuns do modulo de notificacoes.

## Comandos executados

| Comando | Resultado observado |
| --- | --- |
| `node --test real_dev/api/tests/contracts/mf8-alert-preferences.contract.test.js` | `PASS`; 4 testes, 4 pass, 0 fail, 0 skipped. |

## Negativos cobertos

- `enabled` nao booleano.
- Tipo vazio ou desconhecido.
- Tentativa de desativar alertas `security`.
- `companyId` forjado no body.
- Pedido sem contexto autenticado de empresa/utilizador.

## Limites

- Nao foi executado smoke HTTP autenticado com persistencia real.
- O BK prova o contrato backend; nao prova uma UI de gestao de preferencias.
- A preferencia `ai` controla rececao de alertas e nao autoriza execucao de acoes.

## Decisao

`PASS_CONTRATO`; os quatro casos dedicados passaram.
