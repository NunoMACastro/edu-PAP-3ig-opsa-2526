# Correcao da auditoria de implementacao real_dev - MF5

## Metadados

- Projeto: OPSA
- Modo executado: `corrigir_auditoria`
- MF alvo: `MF5`
- BK corrigido: `BK-MF5-03`
- Relatorio fonte: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md`
- Implementation root: `real_dev`
- Data da correcao: 2026-06-22
- Resultado geral: `CORRIGIDO`
- Permissoes respeitadas: alteracoes de codigo apenas dentro de `real_dev`, sem alteracoes a BKs/docs canonicos e sem commits.

## Resumo executivo

Foram corrigidos os dois findings confirmados da auditoria de `BK-MF5-03` / `RNF03-MF5`.

O problema raiz era a existencia de acoes assincronas dedicadas em `mf3Pages.tsx` e `mf4Pages.tsx` ainda dependentes de estado local `busy/error` ou sem feedback visivel completo. A correcao migrou esses fluxos para `useActionFeedback` e `StatusMessage`, garantindo mensagens de execucao, sucesso e erro.

O smoke `test:mf5:feedback` tambem foi reforcado para deixar de validar apenas a existencia geral do hook. Agora falha se `mf3Pages.tsx` ou `mf4Pages.tsx` voltarem a usar `function Feedback`, `setBusy(...)` ou `setError(...)` nos fluxos cobertos por `RNF03`, e tambem confirma mensagens de sucesso para as acoes dedicadas corrigidas.

## Findings corrigidos

| Finding | Severidade | Estado final | Evidencia |
| --- | --- | --- | --- |
| `MF5-IMP-AUD-BK03-F01` | P1 | `CORRIGIDO` | `DateRangeForm`, tesouraria MF3, insights/alertas, sugestoes e perguntas MF4 usam `useActionFeedback` com sucesso/erro visivel. |
| `MF5-IMP-AUD-BK03-F02` | P2 | `CORRIGIDO` | `check-mf5-feedback.mjs` passou a validar cobertura negativa e mensagens de sucesso dos fluxos dedicados. |

## Rastreabilidade BK/RNF

| Contrato | Ficheiros corrigidos | Estado |
| --- | --- | --- |
| `BK-MF5-03` | `real_dev/web/src/pages/mf3Pages.tsx`, `real_dev/web/src/pages/mf4Pages.tsx`, `real_dev/web/scripts/check-mf5-feedback.mjs` | `CORRIGIDO` |
| `RNF03-MF5` | Feedback imediato em guardar/validar/atualizar/pesquisar/importar nos fluxos auditados | `CORRIGIDO` |
| Autenticacao por cookie | `real_dev/web/src/lib/apiClient.ts` revisto indiretamente; sem alteracao e continua com `credentials: "include"` | OK |
| Backend/API | Sem alteracoes; o BK e frontend/UI e preserva autorizacao, empresa ativa e validacao final no backend | OK |

## Alteracoes realizadas

### `real_dev/web/src/pages/mf3Pages.tsx`

- Removido o componente local `Feedback` e os estados locais `busy/error/message` das acoes auditadas.
- `DateRangeForm` passou a usar `useActionFeedback`.
- `TreasuryAccountsPage.load()` e `TreasuryAccountsPage.submit()` passaram a usar `action.run(...)`.
- Foram adicionadas mensagens explicitas de execucao, sucesso e erro para mapa de IVA, previsao de tesouraria, SAF-T, relatorios operacionais, KPIs e tesouraria.

### `real_dev/web/src/pages/mf4Pages.tsx`

- Removido o componente local `Feedback` e os estados locais `busy/error` das acoes auditadas.
- `DateRangeForm` passou a usar `useActionFeedback`.
- `AiInsightsPage` passou a dar feedback ao gerar insights e ao carregar explicacoes.
- `AiSuggestionsPage`, `AiQuestionsPage` e `SmartAlertsPage` passaram a confirmar sucesso e erro atraves do contrato comum.
- As paginas MF4 que ja usavam `useActionFeedback` mantiveram o padrao existente.

### `real_dev/web/scripts/check-mf5-feedback.mjs`

- Adicionado `assertNoContract(...)` para bloquear regresso a `function Feedback`, `setBusy(...)` e `setError(...)` nos ficheiros alvo.
- Adicionados checks para mensagens de sucesso em tesouraria, insights, explicacoes, sugestoes, perguntas e alertas.

## Coerencia MF anterior -> alvo -> seguinte

### MF4 -> MF5

Estado: OK.

A correcao nao altera endpoints, services, DTOs, modelos, permissoes, IA ou regras de dominio da MF4. Apenas torna visivel o ciclo de operacoes assincronas ja existentes no frontend.

### BK-MF5-02 -> BK-MF5-03 -> BK-MF5-04

Estado: OK.

`BK-MF5-03` preserva a camada responsiva de `BK-MF5-02` e entrega mensagens centralizadas atraves de `StatusMessage`, preparando `BK-MF5-04` para reforco de semantica, contraste, foco e legibilidade.

### MF5 -> MF6

Estado: OK.

A correcao fica limitada a UX/frontend e nao antecipa regras de performance, seguranca TLS, sessoes, fiscalidade ou hardening que pertencam a MF6.

## Validacoes executadas

| Comando | Resultado | Observacoes |
| --- | --- | --- |
| `npm --prefix real_dev/web run typecheck` | PASS | TypeScript sem erros. |
| `npm --prefix real_dev/web run test:mf1` | PASS | Smoke frontend MF1 OK. |
| `npm --prefix real_dev/web run test:mf2` | PASS | Smoke frontend MF2 OK. |
| `npm --prefix real_dev/web run test:mf3` | PASS | Smoke frontend MF3 OK. |
| `npm --prefix real_dev/web run test:mf5:feedback` | PASS | Smoke RNF03 reforcado passou. |
| `npm --prefix real_dev/web run test:mf5:responsive` | PASS | Regressao de `BK-MF5-02` preservada. |
| `npm --prefix real_dev/web run build` | PASS | Build Vite concluida. |
| Pesquisa estatica de riscos nos ficheiros alterados | PASS | Sem ocorrencias acionaveis de segredos, storage sensivel, `as any`, `payload: unknown`, `eval`, `new Function` ou placeholders. |
| Pesquisa de drift externo nos ficheiros alterados e guia alvo | PASS | Sem referencias indevidas a outros dominios/projetos. |
| `git check-ignore -v real_dev/...` | PASS | Confirmado que os ficheiros de codigo corrigidos continuam dentro de `real_dev/` ignorado. |
| `git diff --check` | PASS | Sem whitespace errors nos diffs tracked. |

## Validacoes nao executadas

- Testes backend/API: nao executados porque a correcao nao tocou backend, Prisma, controllers, services, DTOs ou rotas.
- `npm --prefix real_dev/api run test:integration`: nao executado porque a correcao e frontend/UI e a suite persistente depende de ambiente de base de dados.
- E2E autenticado com backend real: nao executado porque nao foi necessario arrancar backend/browser para confirmar a causa raiz corrigida por smoke textual e build.

## Ficheiros alterados

- `real_dev/web/src/pages/mf3Pages.tsx`
- `real_dev/web/src/pages/mf4Pages.tsx`
- `real_dev/web/scripts/check-mf5-feedback.mjs`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md`

Nao foram alterados BKs, RF/RNF, matriz canonica, backlog, contrato de campos, sprints, `apps/`, `mockup/` ou `legacy/`.

## Estado final

- `BK-MF5-03`: `CORRIGIDO`
- Findings `P0`: 0
- Findings `P1`: 1 corrigido
- Findings `P2`: 1 corrigido
- Findings `P3`: 0
- Resultado global: `CORRIGIDO`
- Blockers: nenhum
- TODOs: executar E2E autenticado com backend real quando houver ambiente local completo, apenas como evidencia complementar visual/runtime.
