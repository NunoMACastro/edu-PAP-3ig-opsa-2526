<<<<<<< HEAD
# Evidence - BK-MF8-12

## Contexto

- Macro-fase: MF8
- BK: BK-MF8-12
- Requisito: RNF33 - Alertas configuráveis (ativar/desativar tipos)
- Owner: Andre
- Apoio: Oleksii

## Ficheiros alterados

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/notifications/alertPreferenceService.js`
- `apps/api/src/modules/notifications/notificationRoutes.js`
- `apps/api/tests/contracts/mf8-alert-preferences.contract.test.js`

## Comandos executados

| Comando | Resultado observado | Data |
| --- | --- | --- |
| `cd apps/api && npm run prisma:validate` | Preencher com o resultado real. | Preencher |
| `cd apps/api && npm run syntax:check` | Preencher com o resultado real. | Preencher |
| `cd apps/api && node --test tests/contracts/mf8-alert-preferences.contract.test.js` | Preencher com o resultado real. | Preencher |
| `cd apps/api && npm run test:contracts` | Preencher com o resultado real. | Preencher |

## Prova funcional

- `GET /api/notifications/preferences` devolve todos os tipos suportados.
- `PATCH /api/notifications/preferences/:type` persiste a preferência do utilizador autenticado na empresa ativa.
- O tipo `security` não pode ser desativado.
- O body não aceita `companyId` para decidir contexto de empresa.

## Negativos

- Body com `enabled` não booleano devolve erro controlado.
- Tentativa de desativar `security` devolve erro controlado.
- Pedido sem sessão ou sem empresa ativa é bloqueado pelos guards existentes.
=======
# Evidence MF8 / BK-MF8-12

- Projeto: OPSA
- BK: BK-MF8-12
- Tema: alertas configuraveis por tipo
- RF/RNF: RNF33
- Data: 2026-07-06
- Responsavel: Andre
- Apoio: Oleksii
- Implementation root validado: real_dev

## Artefactos verificados

- Modelo Prisma: `real_dev/api/prisma/schema.prisma`
- Migration: `real_dev/api/prisma/migrations/20260706120000_mf8_alert_preferences/migration.sql`
- Service principal: `real_dev/api/src/modules/notifications/alertPreferenceService.js`
- Router principal: `real_dev/api/src/modules/notifications/notificationRoutes.js`
- Teste de contrato: `real_dev/api/tests/contracts/mf8-alert-preferences.contract.test.js`
- Relatorio de implementacao: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- Relatorio de auditoria: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

## Matriz de prova

| RNF | Prova automatica | Criterio de sucesso | Resultado observado |
| --- | --- | --- | --- |
| RNF33 | `AlertPreference` persiste `companyId`, `userId`, `type` e `enabled`. | Existe uma preferencia por empresa ativa, utilizador autenticado e tipo de alerta. | PASS; schema tem `@@unique([companyId, userId, type])` e relacoes com `Company`/`User`. |
| RNF33 | `ALERT_TYPE_DEFINITIONS` centraliza `stock`, `deadline`, `cashflow`, `ai` e `security`. | A API lista tipos suportados com defaults efetivos. | PASS; teste dedicado valida a ordem e uma preferencia guardada para `ai`. |
| RNF33 | `parseAlertPreferenceBody()` aceita apenas `{ enabled: boolean }`. | O frontend nao decide ownership nem envia empresa final. | PASS; teste injeta `companyId` forjado no body e confirma que nao chega ao `upsert`. |
| RNF33 | `setAlertPreference()` usa `companyId_userId_type` vindo do contexto autenticado. | A escrita fica isolada por empresa ativa e utilizador. | PASS; teste confirma `where.companyId_userId_type` com ids do contexto. |
| RNF33 | `assertCanPersistPreference()` bloqueia `security` com `enabled=false`. | Alertas de seguranca/integridade permanecem obrigatorios. | PASS; teste dedicado recebe `ALERT_TYPE_MANDATORY`. |
| MF4/MF8 | `buildNotificationRoutes()` expoe `GET /preferences` e `PATCH /preferences/:type` com guards comuns. | As rotas entram no modulo real de notificacoes e preservam auth, empresa ativa e permissao. | PASS; teste confirma as rotas e a auditoria confirmou `requireAuth`, `requireCompanyContext` e `Permission.NOTIFICATIONS_READ`. |

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run syntax:check` | PASS; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | PASS; schema Prisma valido. |
| `node --test tests/contracts/mf8-alert-preferences.contract.test.js` em `real_dev/api` | PASS; 4 testes, 4 pass. |
| `npm --prefix real_dev/api run test:contracts` | PASS; 113 testes, 113 pass. |
| `npm --prefix real_dev/api run test:unit` | PASS; 79 testes, 79 pass. |
| Pesquisa estatica de risco no escopo BK12 | PASS; sem ocorrencias de marcadores de implementacao pendente, storage sensivel, execucao dinamica, segredos, casts inseguros, payloads sem validacao ou ownership vindo do pedido HTTP. |
| Pesquisa de drift de dominio no escopo BK12 | PASS; sem referencias a dominios externos. |
| `bash scripts/validate-planificacao.sh` | PASS_COM_RESSALVAS; `overall_pass=true`, `advisory_pass=false` por advisories documentais legados fora do scope BK12. |
| `test -f docs/evidence/MF8/BK-MF8-12.md` | PASS; ficheiro de evidence dedicado existe. |
| `git diff --check` | PASS; sem whitespace errors em ficheiros rastreados. |

## Negativos validados

- Body com `enabled` nao booleano falha com `ALERT_PREFERENCE_ENABLED_REQUIRED`.
- Tipo vazio ou desconhecido falha com `ALERT_TYPE_REQUIRED`/`ALERT_TYPE_INVALID`.
- Tentativa de desligar `security` falha com `ALERT_TYPE_MANDATORY`.
- Body com `companyId` forjado nao altera ownership; o service usa `companyId` vindo dos guards.
- Pedido sem empresa ativa ou utilizador autenticado falha com `ALERT_PREFERENCE_CONTEXT_REQUIRED`.
- As rotas ficam atras de `requireAuth`, `requireCompanyContext` e `requirePermission(Permission.NOTIFICATIONS_READ)`.

## Limites confirmados

- A evidence corrige apenas o finding documental `P3-BK-MF8-12-EVIDENCE-001`.
- Nao houve alteracao de codigo nesta correcao; o contrato runtime ja estava implementado em `real_dev`.
- Nao foi criada UI frontend, porque o guia coloca a gestao visual de preferencias em scope-out.
- O motor que gera notificacoes existentes nao foi alterado; o BK entrega o contrato persistente de preferencias.
- A categoria `ai` continua apenas preferencia de rececao de alertas e nao executa acoes financeiras ou contabilisticas.
- Smoke HTTP autenticado com servidor real e base de dados persistente real nao foram executados; a prova ficou em schema, service, router e testes automatizados.
- Os advisories pedagogicos antigos do validador de planificacao permanecem fora desta correcao; o validador manteve `overall_pass=true`.

## Handoff para BK-MF8-13

- Contrato entregue: `AlertPreference` por empresa ativa, utilizador autenticado e tipo.
- Endpoints reutilizaveis: `GET /api/notifications/preferences` e `PATCH /api/notifications/preferences/:type`.
- Categoria reutilizavel: `ai` aparece como preferencia de notificacao, sem enfraquecer a fronteira RNF32 de IA recomendatoria.
- Teste repetivel: `node --test tests/contracts/mf8-alert-preferences.contract.test.js` em `real_dev/api`.

## Decisao

`BK-MF8-12` fica com evidence dedicada criada e o finding `P3-BK-MF8-12-EVIDENCE-001` corrigido. A implementacao real continua validada como backend-only, multiempresa, protegida por permissoes e sem ownership vindo do frontend.
>>>>>>> 81619f4 (Update: Mid)
