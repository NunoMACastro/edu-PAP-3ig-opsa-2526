# AUDITORIA-HIDRATACAO-MF4

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF4`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF4.md`
- `area`: `planificacao/guias-bk`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-06-16`

## Escopo

- MF processada: `MF4`
- Modo desta execucao: `auditar_apenas`
- BK abrangidos: `BK-MF4-01` a `BK-MF4-10`
- Escrita executada nesta execucao: apenas este relatorio
- BKs editados nesta execucao: nenhum
- Commits: nao executados
- Raiz tecnica consultada: `real_dev/api`, `real_dev/web`, `real_dev/api/prisma/schema.prisma`
- Profundidade de coerencia: MF anterior (`MF3`) -> MF alvo (`MF4`) -> MF seguinte (`MF5`)
- MFs implementadas detetadas para coerencia tecnica: `MF0`, `MF1`, `MF2`, `MF3` e `MF4`; `MF5` foi consultada apenas como vizinha documental porque os seus guias ainda usam o modelo antigo.
- Nota de worktree: os BKs MF4 ja estavam modificados no inicio desta execucao; a auditoria abaixo reflete a fotografia atual desses ficheiros sem os alterar.

## Fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- Todos os BKs em `docs/planificacao/guias-bk/MF4/`
- Relatorios `AUDITORIA-HIDRATACAO-MF0.md`, `AUDITORIA-HIDRATACAO-MF1.md`, `AUDITORIA-HIDRATACAO-MF2.md`, `AUDITORIA-HIDRATACAO-MF3.md` e a versao anterior deste relatorio MF4
- Implementacao real: `real_dev/api/src/server.js`, `real_dev/api/src/modules`, `real_dev/api/src/modules/companies/companyContext.js`, `real_dev/api/src/modules/permissions`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/web/src/lib/apiClient.ts`

## Resultado executivo

A auditoria atual confirmou que os 10 BKs da MF4 cumprem a estrutura nova exigida pela prompt ativa e estao implementaveis como guias pedagogicos autocontidos. Nao foram encontrados findings abertos `P0`, `P1`, `P2` ou `P3` que justifiquem editar BKs neste modo.

A coerencia com a MF5 ficou validada apenas ao nivel de handoff canonico. Os sete BKs MF5 ainda estao no formato antigo `Bloco pedagogico`/`Bloco operacional`, sem tutorial tecnico linear, pelo que a auditoria nao consegue provar a continuidade pedagogica MF4 -> MF5 alem da existencia de `BK-MF5-01` como proximo BK canonico de `BK-MF4-10`.

Contagem desta execucao:

| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da auditoria atual | 10 | 0 | 0 |
| Depois da auditoria atual | 10 | 0 | 0 |

Leitura principal: os problemas registados em auditoria anterior sobre ownership de notificacoes, atribuicao de tarefas, montagem de routers, idempotencia de IA, frontend tipado, validacao de datas/status e relacoes Prisma ja nao se reproduzem na fotografia atual dos BKs MF4.

## Inventario MF4

| BK | RF | Prioridade | Dependencias canonicas | Estado atual | Evidencia principal |
| --- | --- | --- | --- | --- | --- |
| BK-MF4-01 | RF39 | P0 | BK-MF3-07 | OK | 8 passos, `AiInsight`, `@@unique`, `upsert`, guardas e `mf4Api.ts` inicial tipado. |
| BK-MF4-02 | RF40 | P1 | BK-MF4-01 | OK | 6 passos, sugestoes ligadas a insights, `upsert`, router e cliente cumulativo. |
| BK-MF4-03 | RF41 | P1 | BK-MF3-07 | OK | 6 passos, perguntas de leitura, bloqueio de mutacoes e resposta com fontes. |
| BK-MF4-04 | RF42 | P1 | BK-MF3-04, BK-MF2-05 | OK | 6 passos, alertas de cashflow/stock, `@@unique`, `upsert` e guardrails. |
| BK-MF4-05 | RF43 | P0 | BK-MF4-01 | OK | 8 passos, explicacao/fonte por insight e negativos de ownership. |
| BK-MF4-06 | RF44 | P1 | - | OK | 6 passos, lembretes com `GET`/`POST`/`PATCH`, datas e status validados. |
| BK-MF4-07 | RF45 | P1 | - | OK | 6 passos, tarefas com `assignedTo`, membership ativa e validacao multiempresa. |
| BK-MF4-08 | RF46 | P1 | BK-MF4-06, BK-MF4-04 | OK | 6 passos, notificacoes por utilizador, sincronizacao e PATCH filtrado por ownership. |
| BK-MF4-09 | RF47 | P0 | - | OK | 8 passos, `AuditLog`, consulta restrita e padrao `recordAuditLog`. |
| BK-MF4-10 | RF48 | P0 | - | OK | 8 passos, `IntegrationLog`, sanitizacao e consulta restrita. |

## Decisoes confirmadas

- `CANONICO`: RF39-RF43 cobrem IA assistiva, sugestoes, perguntas, alertas e explicacoes.
- `CANONICO`: RF44-RF46 cobrem lembretes, tarefas e notificacoes.
- `CANONICO`: RF47/RNF17 exigem auditoria em operacoes sensiveis.
- `CANONICO`: RF48 exige logs de integracao para uploads, SAF-T e reconciliacoes.
- `CANONICO`: RNF31 exige explicacao e origem dos dados nos insights.
- `CANONICO`: RNF32 exige que IA nao altere dados contabilisticos; apenas analise e recomende.
- `CANONICO`: `real_dev/web/src/lib/apiClient.ts` usa `credentials: "include"` para cookies HttpOnly.
- `CANONICO`: `requireCompanyContext` injeta `req.companyId` a partir da sessao/contexto autenticado.
- `DERIVADO`: uso de modulos `ai`, `reminders`, `tasks`, `notifications`, `audit` e `integrations` em `real_dev/api/src/modules`.
- `DERIVADO`: uso de regras deterministicas MVP para IA, sem provider externo, RAG, OCR ou embeddings.

## Findings

### MF4-AUD-001

- BK/RF/RNF afetado: `BK-MF4-08`, `RF46`, gates multiempresa.
- Severidade: `P0`
- Evidencia objetiva atual: `BK-MF4-08` filtra o PATCH por `id`, `companyId` e `userId` antes de atualizar a notificacao.
- Expected: marcar como lida apenas notificacao da empresa ativa e do utilizador autenticado.
- Observed: comportamento esperado presente no guia atual.
- Impacto: risco anterior de ownership removido.
- Causa provavel original: PATCH inicial por `id` global.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `JA_CORRIGIDO`

### MF4-AUD-002

- BK/RF/RNF afetado: `BK-MF4-07`, `RF45`, seguranca/autorizacao.
- Severidade: `P0`
- Evidencia objetiva atual: `BK-MF4-07` inclui relacao `assignedTo`, `CompanyMembership`, `isActive: true` e erro `TASK_ASSIGNEE_NOT_IN_COMPANY`.
- Expected: `assignedToId` pertence a um utilizador com membership ativa na mesma empresa.
- Observed: comportamento esperado presente no guia atual.
- Impacto: risco anterior de atribuicao a utilizadores externos removido.
- Causa provavel original: service inicial sem validacao de membership.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `JA_CORRIGIDO`

### MF4-AUD-003

- BK/RF/RNF afetado: BKs MF4 que criam routers.
- Severidade: `P0`
- Evidencia objetiva atual: a pesquisa encontrou `app.use(...)` para `/api/ai`, `/api/reminders`, `/api/tasks`, `/api/notifications`, `/api/audit` e `/api/integrations`.
- Expected: cada router criado no guia fica montado no `server.js`.
- Observed: montagem explicita presente nos BKs atuais.
- Impacto: endpoints deixam de ficar inacessiveis por instrucao incompleta.
- Causa provavel original: rotas criadas sem patch cumulativo do servidor.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `JA_CORRIGIDO`

### MF4-AUD-004

- BK/RF/RNF afetado: `BK-MF4-01`, `BK-MF4-02`, `BK-MF4-04`; `RF39`, `RF40`, `RF42`.
- Severidade: `P1`
- Evidencia objetiva atual: os modelos de insights, sugestoes, alertas e notificacoes usam `@@unique(...)` e os services usam `upsert`.
- Expected: leituras/materializacoes repetidas nao devem duplicar registos.
- Observed: idempotencia documentada no guia atual.
- Impacto: evidence fica estavel e a app evita duplicados.
- Causa provavel original: materializacao sem chave unica.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `JA_CORRIGIDO`

### MF4-AUD-005

- BK/RF/RNF afetado: BKs MF4 com frontend em `real_dev/web/src/lib/mf4Api.ts`.
- Severidade: `P1`
- Evidencia objetiva atual: apenas `BK-MF4-01` cria `createApiClient`; BKs seguintes acrescentam tipos/funcoes ao cliente cumulativo.
- Expected: `mf4Api.ts` tem um unico import/cliente e exports adicionados sem redeclaracao.
- Observed: comportamento esperado presente no guia atual.
- Impacto: reduz risco de erro TypeScript por duplicacao.
- Causa provavel original: BKs escritos como unidades isoladas.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `JA_CORRIGIDO`

### MF4-AUD-006

- BK/RF/RNF afetado: `BK-MF4-06`, `BK-MF4-07`, `RF44`, `RF45`.
- Severidade: `P1`
- Evidencia objetiva atual: `BK-MF4-06` inclui criar/listar/atualizar lembretes; `BK-MF4-07` inclui criar/listar/atualizar tarefas e atribuir responsavel.
- Expected: frontend e API cobrem o fluxo funcional principal, nao apenas listagem.
- Observed: comportamento esperado presente no guia atual.
- Impacto: os alunos conseguem implementar o fluxo central dos requisitos.
- Causa provavel original: UI inicial reduzida a smoke tecnico.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `JA_CORRIGIDO`

### MF4-AUD-007

- BK/RF/RNF afetado: `BK-MF4-06`, `BK-MF4-07`, `RF44`, `RF45`, `RNF05`, `RNF06`.
- Severidade: `P2`
- Evidencia objetiva atual: os validators parseiam datas com validacao de `Number.isNaN(date.getTime())` e limitam status a listas fechadas.
- Expected: datas invalidas devolvem `400`; status pertence a enum/lista permitida.
- Observed: comportamento esperado presente no guia atual.
- Impacto: reduz inconsistencias e erros tardios no Prisma/UI.
- Causa provavel original: validacao minima de payload.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `JA_CORRIGIDO`

### MF4-AUD-008

- BK/RF/RNF afetado: BKs MF4 com frontend.
- Severidade: `P2`
- Evidencia objetiva atual: a pesquisa nao encontrou `payload: unknown`, `unknown[]`, `useState<unknown>` ou `JSON.stringify(...)` nos BKs MF4.
- Expected: DTOs/responses concretos e renderizacao dos campos relevantes.
- Observed: comportamento esperado presente no guia atual.
- Impacto: contrato backend/frontend fica legivel e prepara MF5.
- Causa provavel original: foco anterior em JSON bruto para smoke.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `JA_CORRIGIDO`

### MF4-AUD-009

- BK/RF/RNF afetado: BKs MF4 com novos modelos Prisma.
- Severidade: `P2`
- Evidencia objetiva atual: os BKs mostram modelos Prisma, relacoes inversas quando necessarias, indices e constraints relevantes.
- Expected: alteracoes completas de Prisma sem obrigar o aluno a adivinhar nomes de relacoes.
- Observed: comportamento esperado presente no guia atual.
- Impacto: reduz risco de `prisma validate` falhar por relacoes incompletas.
- Causa provavel original: parte do contrato Prisma estava em texto livre.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `JA_CORRIGIDO`

### MF4-AUD-010

- BK/RF/RNF afetado: todos os BKs MF4.
- Severidade: `P3`
- Evidencia objetiva atual: os passos atuais usam blocos de codigo formatados, JSDoc e explicacao apos os blocos principais.
- Expected: codigo legivel, com quebras de linha e comentarios didaticos nos pontos relevantes.
- Observed: comportamento esperado presente no guia atual.
- Impacto: melhora valor pedagogico e reduz erros de copia.
- Causa provavel original: compressao manual de snippets.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `JA_CORRIGIDO`

### MF4-AUD-011

- BK/RF/RNF afetado: `BK-MF4-01`, qualidade IA.
- Severidade: `P3`
- Evidencia objetiva atual: a pesquisa textual encontrou `RAG` e `OCR` numa frase de scope-out: a IA deste BK e deterministica e nao promete essas capacidades.
- Expected: os BKs nao devem prometer RAG, OCR, embeddings ou integracoes externas sem contrato.
- Observed: a ocorrencia e uma negacao explicita, nao uma promessa de funcionalidade.
- Impacto: sem risco tecnico; manter a nota ajuda a evitar scope creep de IA.
- Causa provavel: falso positivo da pesquisa estatica obrigatoria.
- Correcao recomendada: nenhuma nesta execucao.
- Estado: `NAO_APLICAVEL`

### MF4-AUD-012

- BK/RF/RNF afetado: `BK-MF5-01`, `RNF01`, coerencia MF4 -> MF5.
- Severidade: `P3`
- Evidencia objetiva atual: leitura de `docs/planificacao/guias-bk/MF5/BK-MF5-01-interface-intuitiva-clara-e-consistente-entre-modulos-vendas-compras-inventario-contabilidade.md` confirma que o guia ainda usa `## Bloco pedagogico`, `## Bloco operacional` e `## Snippet tecnico aplicavel`, sem `#### Tutorial tecnico linear` nem passos `### Passo N - ...`.
- Expected: a MF seguinte deveria conseguir consumir os DTOs, estados e paginas entregues pela MF4 com a mesma estrutura pedagogica nova.
- Observed: o handoff canonico existe (`BK-MF4-10` -> `BK-MF5-01`), mas a continuidade detalhada fica limitada porque `MF5` esta fora do alvo e ainda nao foi hidratada.
- Impacto: risco baixo para a classificacao dos BKs MF4; risco real para a proxima execucao de hidratacao/validacao da MF5.
- Causa provavel: MF5 ainda nao passou pelo mesmo processo de hidratacao/correcao aplicado a MF3/MF4.
- Correcao recomendada: executar uma auditoria/hidratacao propria de `MF5`, preservando o handoff de `BK-MF4-10`.
- Estado: `BLOQUEADO_POR_SCOPE`

## Mapa de integracao da MF

| BK | Backend/API | Prisma/validacao | Frontend | Seguranca e handoff |
| --- | --- | --- | --- | --- |
| BK-MF4-01 | `buildAiInsightRoutes` em `/api/ai/insights` | `AiInsight` com `@@unique([companyId, type, sourceType, sourceId])` e `upsert` | cria `mf4Api.ts` com `AiInsight` e `getAiInsights` | usa `requireAuth`, `requireCompanyContext`, `REPORTS_READ` e roles de gestao/contabilidade |
| BK-MF4-02 | `buildAiSuggestionRoutes` em `/api/ai/suggestions` | `AiActionSuggestion` ligado a `AiInsight`, `@@unique([companyId, insightId, actionType])` | acrescenta `AiActionSuggestion` e `getAiSuggestions` | recomenda acoes, mas nao executa precos, compras ou stock |
| BK-MF4-03 | `buildAiQuestionRoutes` em `/api/ai/questions` | `AiQuestionRun` com fontes `Json` e relacoes inversas | acrescenta `AiQuestionAnswer`, fontes e formulario tipado | bloqueia perguntas mutaveis e responde apenas com dados/fonte |
| BK-MF4-04 | `buildSmartAlertRoutes` em `/api/ai/alerts` | `SmartAlert` com chave unica por origem e `upsert` | acrescenta `SmartAlert` e lista de alertas | materializa sinais sem alterar tesouraria, stock ou contabilidade |
| BK-MF4-05 | extensao de `buildAiInsightRoutes` com `/insights/:id/explanation` | reutiliza `AiInsight` filtrado por `companyId` | acrescenta `InsightExplanation` | reforca explicabilidade, fonte e guardrail de IA assistiva |
| BK-MF4-06 | `buildReminderRoutes` em `/api/reminders` | `Reminder`, tipos fechados, data validada e status fechado | acrescenta criar/listar/atualizar lembretes | body nao escolhe empresa; contexto vem de sessao |
| BK-MF4-07 | `buildOperationalTaskRoutes` em `/api/tasks` | `OperationalTask`, `assignedTo` real e validacao de `CompanyMembership.isActive` | acrescenta criar/listar/atualizar tarefas | impede atribuicao a utilizadores fora da empresa ativa |
| BK-MF4-08 | `buildNotificationRoutes` em `/api/notifications` | `InAppNotification` unica por origem/utilizador | acrescenta listar/sincronizar/marcar lida | PATCH valida `id`, `companyId` e `userId` antes de atualizar |
| BK-MF4-09 | `buildAuditLogRoutes` em `/api/audit/logs` | reutiliza `AuditLog` existente com detalhes minimos | acrescenta `AuditLogItem` | consulta restrita a `ADMIN`/`AUDITOR`; nao expoe payloads completos |
| BK-MF4-10 | `buildIntegrationLogRoutes` em `/api/integrations/logs` | `IntegrationLog` com contagens e mensagem sanitizada | acrescenta `IntegrationLogItem` | consulta restrita a `ADMIN`; nao guarda ficheiros, credenciais ou CSV completo |

## Drift documental

- `DRIFT-STACK-001`: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` ainda referencia `apps/api`, `apps/web` e `apps/api/prisma/schema.prisma`, enquanto a implementacao validada desta auditoria usa `real_dev/api`, `real_dev/web` e `real_dev/api/prisma/schema.prisma`.
- `DRIFT-GUIAS-001`: `docs/planificacao/guias-bk/README.md` e `_TEMPLATE-BK.md` ainda exigem `Bloco pedagogico`, `Bloco operacional` e `Snippet tecnico aplicavel`; a prompt ativa exige a estrutura nova `#### Objetivo` ate `#### Changelog`.
- `DRIFT-VALIDATOR-001`: `scripts/validate-planificacao.sh` ainda emite avisos/advisories herdados do modelo antigo de guias, apesar de validar cobertura e consistencia canonica.
- `DRIFT-MF5-001`: os guias `docs/planificacao/guias-bk/MF5/*.md` continuam no modelo antigo. Esta execucao registou o drift apenas para coerencia vizinha, sem editar MF5 por `STRICT_SCOPE=true`.

## Coerencia MF anterior -> MF4 -> MF seguinte

- MF3 entrega bases reais para MF4: `OperationalReportRun`, `ExecutiveKpiRun`, `CashflowForecastRun`, `BusinessImportRun`, `SaftExportRun`, `BankStatementImport`, `StockBalance` e `StockAlertSetting` existem no schema real.
- MF4 consome corretamente os dominios de relatorios, stock, tesouraria, importacoes, SAF-T e auditoria como fontes para IA, alertas, notificacoes e logs.
- MF4 preserva o contrato de seguranca de MF0/MF1/MF2/MF3: autenticacao por cookie, `credentials: "include"`, empresa ativa no backend, roles/permissoes no backend e filtro por `companyId`.
- MF5 depende de interfaces e estados observaveis. A MF4 entrega DTOs frontend concretos para insights, sugestoes, perguntas, alertas, explicacoes, lembretes, tarefas, notificacoes, auditoria e logs de integracao.
- A MF5 ainda nao permite validar continuidade tecnica detalhada, porque os seus BKs nao estao hidratados na estrutura nova; esta limitacao fica bloqueada por scope e nao altera a classificacao dos BKs MF4.

## Verificacoes executadas

- Inventario estrutural MF4 por script local: todos os BKs tem as secoes obrigatorias da prompt nova, ordem correta e numero minimo de passos por prioridade.
- Verificacao de passos: todos os passos dos 10 BKs contem os pontos `1` a `7`.
- Alinhamento documental por script local: headers MF4 estao alinhados com `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- Pesquisa estatica de risco nos BKs MF4: o comando amplo da prompt foi executado e devolveu ocorrencias esperadas de `companyId` em modelos, filtros e contexto autenticado, ocorrencias negativas de `password`/`token`/`cookies` em passos de seguranca, e a ocorrencia `RAG`/`OCR` classificada em `MF4-AUD-011`; nao foram encontrados `body.companyId`, `query.companyId`, `payload: unknown`, `as any`, `localStorage`, `sessionStorage`, `deleteMany({})`, `delete({})`, `updateMany({})` ou `useState<unknown>`.
- Pesquisa de coerencia vizinha: `MF5` tem 7 BKs em formato antigo e 0 passos `### Passo N - ...`, pelo que o handoff MF4 -> MF5 fica documentado como limitacao por scope.
- Pesquisa estatica de montagem: encontrados `app.use(...)` para todos os routers MF4 aplicaveis.
- `git diff --check`: executado com exit code `0`, sem erros de whitespace.
- Verificacao adicional do relatorio untracked: `git diff --no-index --check /dev/null docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF4.md` nao devolveu erros de whitespace; exit code `1` e esperado nesta forma porque ha diferenca entre `/dev/null` e o ficheiro existente.
- `bash scripts/validate-planificacao.sh`: executado com exit code `0`; resultado `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`.
- Advisory issues do validador: documentos de planificacao antigos em `outdated_docs` e checks herdados do modelo antigo (`missing_pedagogic_or_operational_blocks`, `missing_or_placeholder_snippet`, contagem de negativos). Estes advisories sao coerentes com `DRIFT-GUIAS-001`/`DRIFT-VALIDATOR-001` e nao invalidam a cobertura/canonicalidade da MF4.

## Riscos restantes

- Os BKs MF4 estao documentados como guias executaveis, mas a implementacao real `real_dev` ainda nao contem os modulos MF4. Isto e esperado nesta auditoria documental e deve ser resolvido quando os alunos implementarem a MF4.
- O relatorio foi atualizado num worktree com alteracoes pre-existentes em MF3/MF4; esta execucao nao tentou normalizar ou reverter essas alteracoes.
- O validador/documentos globais ainda precisam de alinhamento com a estrutura nova dos BKs para deixar de depender do modelo antigo `Bloco pedagogico`/`Bloco operacional`.
- A MF5 vizinha ainda precisa de auditoria/hidratacao propria antes de se poder afirmar continuidade pedagogica e tecnica completa depois de `BK-MF4-10`.

## Resumo final

- MF processada: `MF4`.
- BKs analisados: `10`.
- Contagem OK/PARCIAL/CRITICO antes: `10/0/0`.
- Contagem OK/PARCIAL/CRITICO depois: `10/0/0`.
- BKs editados: nenhum.
- Principais lacunas corrigidas nesta execucao: nenhuma, porque `MODO=auditar_apenas`; findings anteriores foram revalidados como `JA_CORRIGIDO` ou `NAO_APLICAVEL`.
- Decisoes tecnicas confirmadas: `real_dev/api` + `real_dev/web`, Express modular, Prisma, cookies HttpOnly com `credentials: "include"`, `requireCompanyContext`, `requirePermission`/`requireRole`, `upsert` e constraints unicas para materializacoes idempotentes.
- Decisoes de dominio confirmadas: IA assistiva com fonte/explicacao; IA nao altera contabilidade, stock, precos ou documentos; lembretes/tarefas/notificacoes respeitam contexto autenticado; auditoria e logs de integracao minimizam dados sensiveis.
- Decisoes marcadas como `DERIVADO`: modulos `ai`, `reminders`, `tasks`, `notifications`, `audit` e `integrations`; regras deterministicas MVP para IA sem provider externo, RAG, OCR ou embeddings.
- Drift documental encontrado: `DRIFT-STACK-001`, `DRIFT-GUIAS-001`, `DRIFT-VALIDATOR-001` e `DRIFT-MF5-001`.
- Riscos restantes: implementacao real MF4 ainda nao existe em `real_dev`; MF5 ainda usa guias antigos; worktree tinha alteracoes pre-existentes.
- Coerencia MF anterior -> MF alvo -> MF seguinte: `MF3 -> MF4` preservada; `MF4 -> MF5` preservada no handoff canonico, limitada na validacao detalhada por `DRIFT-MF5-001`.
- Verificacoes textuais executadas: pesquisa estatica obrigatoria `rg`, inventario estrutural por script local, alinhamento documental por script local, pesquisa de montagem de routers, `git diff --check`, verificacao extra do relatorio untracked com `git diff --no-index --check` e `bash scripts/validate-planificacao.sh`.
- Resultado de `git diff --check`: exit code `0`, sem erros.
- Resultado de `bash scripts/validate-planificacao.sh`: exit code `0`, `overall_pass=true`; `advisory_pass=false` por avisos herdados/documentos antigos.
- Bloqueios ou TODOs restantes: `MF4-AUD-012` bloqueado por scope; restantes riscos fora da edicao MF4.

## Changelog

- `2026-06-16`: reauditoria em modo `auditar_apenas`; BKs MF4 nao foram editados; findings anteriores confirmados como `JA_CORRIGIDO`; falso positivo textual `RAG`/`OCR` classificado como `NAO_APLICAVEL`; limitacao MF4 -> MF5 registada como `MF4-AUD-012`/`DRIFT-MF5-001`.
