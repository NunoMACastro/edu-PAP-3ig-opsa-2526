> [!WARNING]
> `SNAPSHOT_HISTORICO_SUPERSEDED` — estado `SUPERSEDED` em 2026-07-10.
>
> Este relatório preserva um snapshot histórico e não representa o estado corrente.
> Fonte atual: [relatório canónico](../auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md).
> Não reutilizar contagens, comandos, paths ou decisões deste corpo como evidence atual.

# AUDITORIA-HIDRATACAO-MF5

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF5`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- `area`: `planificacao/guias-bk`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-06-20`

## Execucao atual - auditoria completa MF5

### Escopo desta execucao

- Projeto: `OPSA`
- MF processada: `MF5`
- BKs alvo: `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-05`, `BK-MF5-06`, `BK-MF5-07`
- Modo: `auditar_apenas`
- Implementation root consultado: `real_dev`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- Findings selecionados: nenhum filtro explicito; auditoria direta do estado atual de todos os BKs da MF5.
- Severidades consideradas: `P0`, `P1`, `P2`, `P3`
- Incluir P3: sim.
- Output: `relatorio_e_resumo`
- Strict scope: ativo.
- BKs editados nesta execucao: nenhum.
- Codigo de implementacao editado: nenhum.
- Relatorio editado nesta execucao: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
- Commits: nao executados, conforme `PERMITIR_COMMITS=nao`.
- Nota de worktree: antes desta execucao ja existiam alteracoes locais no relatorio, em `BK-MF5-06` e em `BK-MF5-07`; foram preservadas.
- Nota de revalidacao desta execucao: em `2026-06-20`, a leitura estrutural dos 7 BKs, a pesquisa de termos proibidos, `git diff --check` e `bash scripts/validate-planificacao.sh` foram novamente executados; os resultados mantem a classificacao e os bloqueios registados abaixo.

### Documentos e fontes consultadas

- Prompt anexada desta execucao.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF5/`.
- Todos os BKs em `docs/planificacao/guias-bk/MF0/`, `MF1/`, `MF2/`, `MF3/` e `MF4/`, por leitura estrutural dirigida para comparar sequencia, densidade pedagogica, passos, negativos, evidence e handoff.
- `docs/planificacao/guias-bk/MF4/BK-MF4-10-registar-logs-de-integracao-uploads-saf-t-reconciliacoes.md`, como BK anterior direto da macro anterior.
- `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md`, como BK seguinte direto.
- Relatorios `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF0.md` a `AUDITORIA-HIDRATACAO-MF5.md`.
- `real_dev/api/package.json`
- `real_dev/api/prisma/schema.prisma`
- Inventario de `real_dev/api/src`, `real_dev/api/tests` e `real_dev/api/scripts`.
- `real_dev/web/package.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/pages/mf1Pages.tsx`
- `real_dev/web/src/pages/mf2Pages.tsx`
- `real_dev/web/src/pages/mf3Pages.tsx`
- `real_dev/web/src/pages/mf4Pages.tsx`
- Inventario de `real_dev/web/src` e `real_dev/web/scripts`.

### Resumo executivo

A MF5 foi auditada integralmente em modo `auditar_apenas`. No estado atual dos ficheiros, os 7 BKs oficiais da MF5 ficam classificados como `OK`: todos seguem a estrutura tutorial completa exigida pela prompt atual, todos incluem `#### Objetivo` ate `#### Changelog`, todos tem passos tecnicos com pontos 1 a 7, todos ligam o requisito RNF ao fluxo OPSA e todos preservam a fronteira de seguranca em que o frontend melhora UX, mas o backend continua a decidir autenticacao, autorizacao, empresa ativa, ownership, validacao final, auditoria e persistencia.

Nao houve edicao de BKs nem de codigo real. O risco principal nao esta no texto atual dos guias, mas na distancia entre guias prescritivos e implementacao: `real_dev/web` ainda nao contem os artefactos MF5 prescritos (`opsaUi.tsx`, `useActionFeedback.ts`, `mf5FormValidators.ts`, `mf5ErrorMessages.ts`, `mf5PerformanceBudget.ts` e smokes `test:mf5:*`). Isto fica registado como `BLOQUEADO_POR_SCOPE`, porque esta execucao e documental/auditoria e nao implementa `real_dev`.

| Escopo auditado | OK | PARCIAL | CRITICO | DRIFT/OUT_OF_SCOPE |
| --- | ---: | ---: | ---: | ---: |
| BKs MF5 | 7 | 0 | 0 | 0 |
| Coerencia MF4 -> MF5 | 1 | 0 | 0 | 0 |
| Coerencia MF5 -> MF6 | 0 | 0 | 0 | 1 |
| Coerencia guias MF5 -> `real_dev` atual | 0 | 0 | 0 | 1 |

### Inventario dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Sprint | Passos | Negativos | Blocos de codigo | Estado |
| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| `BK-MF5-01` | `RNF01` | `P0` | `Oleksii` | `Sofia` | `S09-S10` | 8 | 8 | 16 | `OK` |
| `BK-MF5-02` | `RNF02` | `P0` | `Andre` | `Oleksii` | `S09-S10` | 8 | 8 | 5 | `OK` |
| `BK-MF5-03` | `RNF03` | `P0` | `Pedro` | `Andre` | `S09-S10` | 8 | 8 | 7 | `OK` |
| `BK-MF5-04` | `RNF04` | `P1` | `Pedro` | `Andre` | `S09-S10` | 6 | 6 | 12 | `OK` |
| `BK-MF5-05` | `RNF05` | `P0` | `Oleksii` | `Pedro` | `S09-S10` | 8 | 8 | 9 | `OK` |
| `BK-MF5-06` | `RNF06` | `P0` | `Andre` | `Oleksii` | `S09-S10` | 8 | 8 | 13 | `OK` |
| `BK-MF5-07` | `RNF07` | `P0` | `Oleksii` | `Pedro` | `S09-S10` | 8 | 8 | 12 | `OK` |

### Classificacao dos BKs

| BK | Estado antes desta execucao | Estado depois desta execucao | Evidencia objetiva |
| --- | --- | --- | --- |
| `BK-MF5-01` | `OK` | `OK` | Estrutura completa; 8 passos; 8 cenarios negativos; cria `opsaUi.tsx`; integra `PageFrame`, `StatusMessage`, `ActionToolbar` e `ModuleBadge`; valida typecheck, scripts MF1-MF3, pesquisa de `PageFrame` local e smoke MF4 manual. |
| `BK-MF5-02` | `OK` | `OK` | Estrutura completa; 8 passos; 8 cenarios negativos; cria tabela/cartoes responsivos; valida desktop, tablet e mobile; preserva a mesma fonte de dados entre tabela e cartoes. |
| `BK-MF5-03` | `OK` | `OK` | Estrutura completa; 8 passos; 8 cenarios negativos; cria `useActionFeedback`; cobre guardar, validar, atualizar, pesquisar e importar; cria `test:mf5:feedback`. |
| `BK-MF5-04` | `OK` | `OK` | Estrutura completa; `P1` com 6 passos e 6 cenarios negativos, acima do minimo canonico; cobre contraste, headings, foco, `aria-live`, teclado e `test:mf5:a11y`. |
| `BK-MF5-05` | `OK` | `OK` | Estrutura completa; 8 passos; 8 cenarios negativos; valida NIF, IBAN, datas ISO, IVA, contas SNC; preserva validacao backend como autoridade final; cria `test:mf5:forms`. |
| `BK-MF5-06` | `OK` | `OK` | Estrutura completa; 8 passos; 8 cenarios negativos; cria tradutor de erros; reutiliza `formatMf5FormErrors`; preserva `status`, `code` e `message`; cria `test:mf5:errors`. |
| `BK-MF5-07` | `OK` | `OK` | Estrutura completa; 8 passos; 8 cenarios negativos; mede listagens e dashboards; separa aviso de performance de erro real; cria `test:mf5:performance`; prepara `BK-MF6-01`. |

### Findings desta auditoria

#### MF5-AUD-20260620-COMPLETE-F01

- BK/RF/RNF afetado: `BK-MF5-01..BK-MF5-07` / `RNF01..RNF07`
- Severidade: `P1`
- Estado: `JA_CORRIGIDO`
- Tipo: completude pedagogica e estrutural da MF.
- Evidencia objetiva: `docs/planificacao/README.md` define `P0 >= 8 passos e >=3 negativos`, `P1/P2 >= 6 passos e >=2/1 negativos`; a leitura estrutural devolveu `8/8` em todos os `P0` e `6/6` em `BK-MF5-04` (`P1`).
- Ficheiros/linhas: `docs/planificacao/README.md:23`; cabecalhos e secoes dos BKs em `docs/planificacao/guias-bk/MF5/*.md`.
- Expected: cada BK deve ter estrutura tutorial completa, passos suficientes, cenarios negativos e evidence/handoff.
- Observed: todos os BKs cumprem a estrutura `#### Objetivo` ate `#### Changelog`; todos os passos contem os pontos 1 a 7.
- Impacto pedagogico: os alunos conseguem seguir a MF5 sem depender de pseudo-codigo ou decisoes abertas.
- Correcao recomendada: nenhuma nesta execucao; preservar a estrutura atual.

#### MF5-AUD-20260620-COMPLETE-F02

- BK/RF/RNF afetado: sequencia `BK-MF5-01 -> BK-MF5-07`
- Severidade: `P1`
- Estado: `JA_CORRIGIDO`
- Tipo: coerencia entre BKs e contratos consumidos/entregues.
- Evidencia objetiva: `MF-VIEWS.md` lista a sequencia oficial `BK-MF5-01..BK-MF5-07`; os handoffs dos BKs consomem os contratos anteriores (`opsaUi`, `StatusMessage`, `useActionFeedback`, validadores MF5, mensagens claras e medicao de performance).
- Ficheiros/linhas: `docs/planificacao/backlogs/MF-VIEWS.md:158-175`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:71-77`; `docs/planificacao/backlogs/BACKLOG-MVP.md:203-209`.
- Expected: a MF deve funcionar como sequencia cumulativa, sem duplicar componentes, hooks, validators ou scripts.
- Observed: a sequencia esta coerente: `BK-MF5-01` cria UI transversal, `BK-MF5-02` adapta listagens, `BK-MF5-03` adiciona feedback, `BK-MF5-04` endurece acessibilidade, `BK-MF5-05` valida formularios, `BK-MF5-06` normaliza erros e `BK-MF5-07` mede performance.
- Impacto tecnico: reduz risco de imports partidos ou duas solucoes para a mesma responsabilidade.
- Correcao recomendada: nenhuma nesta execucao.

#### MF5-AUD-20260620-COMPLETE-F03

- BK/RF/RNF afetado: guias MF5 vs `real_dev/web`
- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- Tipo: guia prescritivo vs implementacao real atual.
- Evidencia objetiva: `real_dev/web/package.json` contem apenas `test:mf1`, `test:mf2`, `test:mf3` e `typecheck`; pesquisa em `real_dev/web/src` e `real_dev/web/scripts` nao encontrou os artefactos MF5 prescritos pelos guias (`opsaUi.tsx`, `useActionFeedback.ts`, `mf5FormValidators.ts`, `mf5ErrorMessages.ts`, `mf5PerformanceBudget.ts`, `check-mf5-*.mjs`, `test:mf5:*`).
- Expected: depois de uma execucao de implementacao MF5, `real_dev/web` deve conter os artefactos prescritos pelos BKs.
- Observed: os contratos existem nos guias, mas ainda nao estao aplicados no codigo real desta checkout.
- Impacto pedagogico: baixo para auditoria documental; medio para uma futura execucao de implementacao, porque os comandos MF5 ainda nao podem ser executados em `real_dev/web`.
- Impacto tecnico: a app real ainda nao esta no estado final descrito pela MF5.
- Causa provavel: MF5 foi hidratada/corrigida como guia antes de ser implementada em `real_dev`.
- Correcao recomendada: abrir execucao propria em modo implementacao/correcao para aplicar `BK-MF5-01` a `BK-MF5-07` no `real_dev/web`.

#### MF5-AUD-20260620-COMPLETE-F04

- BK/RF/RNF afetado: documentacao de stack vs prompt ativa.
- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- Tipo: drift documental de caminhos.
- Evidencia objetiva: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` ainda lista `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` e `apps/web/src/lib/apiClient.ts` como estrutura indicativa; a prompt ativa desta execucao define `IMPLEMENTATION_ROOT=real_dev`, e os BKs MF5 atuais usam `real_dev/web`.
- Ficheiros/linhas: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md:23-29`.
- Expected: o relatorio deve explicitar a tensao quando contrato antigo e prompt ativa usam raizes diferentes.
- Observed: os BKs MF5 estao alinhados com a prompt atual, mas o contrato de stack global ainda preserva caminhos `apps/`.
- Impacto: baixo nesta auditoria; medio para futuras correcoes, porque pode reintroduzir caminhos antigos.
- Correcao recomendada: numa execucao propria, decidir se o contrato de stack deve reconhecer `real_dev` como raiz ativa e `apps/` como referencia historica/indicativa.

#### MF5-AUD-20260620-COMPLETE-F05

- BK/RF/RNF afetado: `BK-MF5-07 -> BK-MF6-01` / `RNF07`, `RNF08`
- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- Tipo: coerencia com MF seguinte.
- Evidencia objetiva: `BK-MF5-07` entrega handoff para `BK-MF6-01`, mas `BK-MF6-01` ainda esta no formato pedagogico-operacional antigo, sem `#### Objetivo`, `#### Tutorial tecnico linear`, passos `### Passo` e estrutura nova completa.
- Ficheiro/linha: `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md:21-87`.
- Expected: a MF seguinte deve conseguir consumir a ideia de medicao sem reescrever a base de performance.
- Observed: o handoff do BK alvo esta pronto, mas o BK seguinte ainda precisa de hidratacao propria para consumir esse contrato.
- Impacto: risco de quebra futura na transicao MF5 -> MF6, fora do alvo estrito desta prompt.
- Correcao recomendada: auditar/hidratar `BK-MF6-01` em execucao propria.

#### MF5-AUD-20260620-COMPLETE-F06

- BK/RF/RNF afetado: todos os BKs MF5.
- Severidade: `P2`
- Estado: `NAO_REPRODUZIDO`
- Tipo: pesquisa estatica obrigatoria de linguagem interna e padroes de risco nos BKs alvo.
- Evidencia objetiva: o comando de pesquisa textual nos BKs MF5 saiu com codigo `1`, sem ocorrencias para termos internos, pseudo-codigo, `payload: unknown`, `as any`, storage de tokens, `companyId`, claims indevidos de RAG/OCR/SAF-T completo ou dominio de outras PAPs.
- Expected: BKs dos alunos nao devem conter linguagem interna, pseudo-codigo, snippets soltos, claims indevidos ou padroes inseguros.
- Observed: nao foram encontrados matches nos BKs MF5.
- Impacto: sem acao necessaria.
- Correcao recomendada: manter a pesquisa como gate em futuras alteracoes.

### Decisoes tecnicas e de dominio confirmadas

- `CANONICO`: `RNF01..RNF07` definem a MF5 como camada transversal de usabilidade, acessibilidade, validacao, mensagens claras e performance.
- `CANONICO`: `BK-MF5-01..BK-MF5-07` sao os 7 BKs oficiais da MF5.
- `CANONICO`: `BK-MF5-04` e `P1`; os restantes BKs MF5 sao `P0`.
- `CANONICO`: `P0` exige pelo menos 8 passos e 3 negativos; `P1` exige pelo menos 6 passos e 2 negativos.
- `CANONICO`: `MF-VIEWS.md` exige smoke, negativos, evidence e handoff por BK.
- `CANONICO`: a stack documentada e React, Vite, TypeScript, Node.js, Express, ES Modules, Prisma e cookies HttpOnly.
- `DERIVADO`: por serem RNFs de UI/UX/performance, os BKs MF5 podem viver sobretudo em `real_dev/web`, sem criar novos modelos Prisma, controllers ou endpoints backend.
- `DERIVADO`: `opsaUi.tsx` deve ser a base visual comum; `useActionFeedback` deve ser a base de ciclo de acao; `mf5FormValidators.ts` deve ser a base de validacao local; `mf5ErrorMessages.ts` deve ser a base de mensagens claras; `mf5PerformanceBudget.ts` deve ser a base de medicao de 2 segundos.
- `DERIVADO`: validacao frontend melhora UX, mas nao substitui validacao backend, autenticacao, autorizacao, empresa ativa, ownership, auditoria, periodo fiscal ou persistencia.

### Mapa de integracao da MF

| BK | Ficheiros/exports previstos | Consome | Entrega para |
| --- | --- | --- | --- |
| `BK-MF5-01` | `real_dev/web/src/ui/opsaUi.tsx`; `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge`; edicoes em `App.tsx`, paginas MF1-MF4 e `styles.css` | `apiClient`, paginas MF1-MF4 existentes, cookies HttpOnly | `BK-MF5-02`, `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-06` |
| `BK-MF5-02` | `ResponsiveDataTable`, estilos `.responsiveTable` e `.mobileList` | `opsaUi.tsx`, `DataTable`, `ResourcePanel` | `BK-MF5-03`, `BK-MF5-07` |
| `BK-MF5-03` | `real_dev/web/src/ui/useActionFeedback.ts`; `FeedbackPhase`, `ActionFeedbackState`, `useActionFeedback`; `test:mf5:feedback` | `StatusMessage`, `apiClient`, paginas de importacao MF3/MF4 | `BK-MF5-04`, `BK-MF5-05`, `BK-MF5-06` |
| `BK-MF5-04` | endurecimento de `PageFrame` e `StatusMessage`; CSS de foco, contraste e legibilidade; `test:mf5:a11y` | `opsaUi.tsx`, `useActionFeedback`, paginas MF1-MF4 | `BK-MF5-05`, `BK-MF5-06`, `BK-MF5-07` |
| `BK-MF5-05` | `real_dev/web/src/lib/mf5FormValidators.ts`; validadores NIF/IBAN/data/IVA/SNC; `test:mf5:forms` | `useActionFeedback`, `StatusMessage`, validators backend como referencia | `BK-MF5-06` |
| `BK-MF5-06` | `real_dev/web/src/lib/mf5ErrorMessages.ts`; `toUiErrorMessage`, `formatUiError`, `formatMf5ValidationUiError`; `test:mf5:errors` | `formatMf5FormErrors`, `ApiError`, paginas MF1-MF4 | `BK-MF5-07` |
| `BK-MF5-07` | `real_dev/web/src/lib/mf5PerformanceBudget.ts`; `MF5_PERFORMANCE_BUDGET_MS`, `measureListingLoad`, `measureDashboardLoad`, `formatPerformanceWarning`; `test:mf5:performance` | `formatUiError`, listagens `ResourcePanel`, dashboards MF3 | `BK-MF6-01` |

Confirmacao de integracao:

- Nao foram encontrados dois endpoints para a mesma acao, porque os BKs MF5 nao criam endpoints backend.
- Nao foram encontrados dois modelos/schemas para a mesma entidade, porque os BKs MF5 nao criam persistencia nova.
- Nomes de conceitos estao consistentes: UI transversal, feedback, acessibilidade, validacao local, mensagens claras e performance.
- O frontend continua a chamar endpoints existentes atraves do cliente API.
- O backend continua fonte de autenticacao, autorizacao, empresa ativa, ownership, validacao final e auditoria.
- Risco restante: `real_dev/web` ainda nao implementa os artefactos prescritos.

### Coerencia MF anterior -> MF alvo -> MF seguinte

- `MF4 -> MF5`: coerente no plano documental. `BK-MF4-10` entrega logs de integracao e reforca que UI deve comunicar estados sem guardar ficheiros completos, headers, cookies, tokens ou credenciais; MF5 melhora interface, validacao, mensagens e performance sem alterar regras financeiras/fiscais.
- `BK-MF5-01 -> BK-MF5-07`: coerente. A MF5 avanca de base visual comum para responsividade, feedback, acessibilidade, validacao, mensagens e performance mensuravel.
- `MF5 -> MF6`: parcialmente coerente. `BK-MF5-07` prepara medicao de performance, mas `BK-MF6-01` ainda esta no formato antigo e precisa de hidratacao para consumir esse contrato.
- `Guias MF5 -> real_dev`: parcial por implementacao pendente; ver `MF5-AUD-20260620-COMPLETE-F03`.

### Validacao executada nesta fase

| Comando/check | Resultado |
| --- | --- |
| Inventario de ficheiros `docs/planificacao/guias-bk/MF5/*.md` | `OK`; 7 BKs oficiais encontrados |
| Leitura estrutural Node dos BKs MF5 | `OK`; todos os BKs tem secoes obrigatorias, passos completos e estados finais classificaveis |
| Pesquisa de termos internos e riscos em `docs/planificacao/guias-bk/MF5/*.md` | `OK`; sem matches |
| Consulta de `real_dev/web/package.json` | `DRIFT/OUT_OF_SCOPE`; sem scripts `test:mf5:*` no codigo real atual |
| Pesquisa de artefactos MF5 em `real_dev/web` | `DRIFT/OUT_OF_SCOPE`; artefactos prescritos ainda ausentes |
| `git diff --check` | `OK`; sem erros |
| `bash scripts/validate-planificacao.sh` | `OK tecnico`; comando saiu com codigo `0`, `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` |
| Advisory residual do validador | `DRIFT/OUT_OF_SCOPE`; `advisory_pass=false` por `outdated_docs` e regras legadas de `guides_quality`, incluindo advisories em MF5 que nao refletem a estrutura tutorial nova exigida pela prompt atual |

### Bloqueios e TODOs restantes

- `TODO (BLOCKER)`: nenhum foi inserido em BKs, porque o modo e `auditar_apenas` e os guias atuais estao `OK`.
- `BLOQUEADO_POR_SCOPE`: implementar os artefactos MF5 em `real_dev/web` fica fora desta execucao.
- `BLOQUEADO_POR_SCOPE`: atualizar `CONTRATO-STACK-IMPLEMENTACAO.md` para refletir `real_dev` como raiz ativa fica fora desta execucao.
- `BLOQUEADO_POR_SCOPE`: hidratar `BK-MF6-01` fica fora do alvo `MF5`, mas deve ser feito antes de usar MF6 como guia final.

### Resumo final para entrega

- MF processada: `MF5`
- Numero de BKs analisados: `7`
- Contagem OK/PARCIAL/CRITICO antes: `OK=7`, `PARCIAL=0`, `CRITICO=0`
- Contagem OK/PARCIAL/CRITICO depois: `OK=7`, `PARCIAL=0`, `CRITICO=0`
- BKs editados: nenhum
- Principais lacunas corrigidas: nenhuma nesta execucao; modo `auditar_apenas`
- Decisoes tecnicas confirmadas: UI transversal, tabela/cartoes responsivos, `useActionFeedback`, acessibilidade de `PageFrame`/`StatusMessage`, validadores MF5, tradutor de erros e medidor de performance
- Decisoes de dominio confirmadas: MF5 melhora experiencia e validacao no browser, mas nao decide regras financeiras/fiscais, empresa ativa, permissoes, ownership, auditoria ou persistencia
- Decisoes marcadas como `DERIVADO`: artefactos MF5 frontend sem novos endpoints/modelos; constantes e smokes MF5 como evidence textual; medicao frontend de RNF07
- Drift documental encontrado: contrato de stack ainda lista `apps/*` enquanto prompt/BKs atuais usam `real_dev/*`
- Riscos restantes: implementacao MF5 pendente em `real_dev/web`; `BK-MF6-01` ainda em formato antigo; possiveis advisories legados do validador global
- Coerencia MF anterior -> MF alvo -> MF seguinte: coerente de `MF4` para `MF5`; parcial de `MF5` para `MF6` por hidratacao futura de `BK-MF6-01`
- Verificacoes textuais executadas: inventario, leitura estrutural, pesquisa de termos proibidos/riscos, consulta de stack e artefactos em `real_dev`
- Resultado de `git diff --check`: `OK`
- Resultado de `bash scripts/validate-planificacao.sh`: `OK tecnico`, `overall_pass=true`, `advisory_pass=false` por advisories legados/outdated docs
- Bloqueios ou TODOs restantes: implementacao `real_dev`, alinhamento global de caminhos e hidratacao de `BK-MF6-01`

## Execucao anterior registada - auditoria apenas BK-MF5-07

### Escopo desta execucao

- Projeto: `OPSA`
- MF processada: `MF5`
- BK alvo: `BK-MF5-07`
- Modo: `auditar_apenas`
- Implementation root consultado: `real_dev`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- Findings selecionados: nenhum filtro explicito; reauditoria direta do estado atual do BK alvo.
- Severidades consideradas: `P0`, `P1`, `P2`, `P3`
- Incluir P3: sim.
- Output: `relatorio_e_resumo`
- Strict scope: ativo.
- BKs editados nesta execucao: nenhum.
- Relatorios editados nesta execucao: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
- Codigo de implementacao editado: nenhum.
- `apps/`, `mockup/`, `legacy/`, RF/RNF, matriz, backlog, sprints, BKs e restantes documentos canonicos editados: nenhum.
- Commits: nao executados, conforme `PERMITIR_COMMITS=nao`.
- Nota de worktree: antes desta execucao ja existiam alteracoes locais no proprio relatorio, em `BK-MF5-06` e em `BK-MF5-07`; foram preservadas. Esta execucao so acrescenta esta reauditoria ao relatorio.

### Documentos e fontes consultadas

- Prompt anexada desta execucao.
- Relatorio existente `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF5/`, com foco em `BK-MF5-06` e `BK-MF5-07`.
- Leitura estrutural dirigida de BKs MF0-MF4 para comparar densidade pedagogica, passos, validacao, evidence e handoff.
- `docs/planificacao/guias-bk/MF4/BK-MF4-10-registar-logs-de-integracao-uploads-saf-t-reconciliacoes.md`.
- `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md`.
- `real_dev/api/package.json`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/web/package.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/pages/mf3Pages.tsx`
- Inventario de `real_dev/api/src`, `real_dev/api/tests`, `real_dev/web/src` e `real_dev/web/scripts` para confirmar stack real e artefactos MF5/performance existentes.

### Resumo executivo

O `BK-MF5-07` foi reauditorado em modo `auditar_apenas`. No estado atual do ficheiro, o guia fica classificado como `OK`: preserva os metadados canonicos de `RNF07`, tem 8 passos, 8 cenarios negativos, 12 blocos de codigo, cobre listagens genericas em `ResourcePanel`, cobre dashboards dedicados em `OperationalReportsPage` e `ExecutiveKpisPage`, separa aviso de performance de erro real de API e prepara o handoff para `BK-MF6-01`.

Nao foram editados BKs nem codigo real nesta execucao. A diferenca principal face a auditorias anteriores e que as lacunas documentais antes registadas para `BK-MF5-07` aparecem resolvidas no conteudo atual do guia. Persistem dois riscos fora de scope: a implementacao real em `real_dev/web` ainda nao contem os artefactos MF5 prescritos pelo guia, e o contrato de stack documental ainda conserva caminhos `apps/` como referencia indicativa enquanto a prompt ativa usa `real_dev`.

| Escopo auditado | OK | PARCIAL | CRITICO | DRIFT/OUT_OF_SCOPE |
| --- | ---: | ---: | ---: | ---: |
| `BK-MF5-07` | 1 | 0 | 0 | 0 |
| Coerencia guia -> `real_dev` atual | 0 | 0 | 0 | 1 |
| Coerencia `BK-MF5-07` -> `BK-MF6-01` | 0 | 0 | 0 | 1 |

### Inventario do BK alvo

| Campo | Valor |
| --- | --- |
| BK | `BK-MF5-07` |
| Titulo | Dashboard e listagens devem carregar em <= 2 segundos |
| RF/RNF | `RNF07` |
| Prioridade | `P0` |
| Owner | `Oleksii` |
| Apoio | `Pedro` |
| Sprint | `S09-S10` |
| Dependencias canonicas | `-` |
| Dependencias tecnicas derivadas no guia | `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-06` |
| BK anterior na MF | `BK-MF5-06` |
| BK seguinte | `BK-MF6-01` |
| Tipo de entrega | Frontend transversal / performance observavel de dashboards e listagens |
| Entidades Prisma | Nao aplicavel; o BK nao cria persistencia nem muda regras backend |
| Endpoints novos | Nenhum |
| DTOs/validators backend novos | Nenhum |
| Utilitarios prescritos | `mf5PerformanceBudget.ts`, `MF5_PERFORMANCE_BUDGET_MS`, `measureUiLoad`, `measureListingLoad`, `measureDashboardLoad`, `formatPerformanceWarning` |
| Scripts prescritos | `real_dev/web/scripts/check-mf5-performance.mjs`, `test:mf5:performance` |
| Estado documental atual | `OK` |

### Classificacao do BK alvo

| BK | Estado antes desta execucao | Estado depois desta execucao | Evidencia |
| --- | --- | --- | --- |
| `BK-MF5-07` | `OK` | `OK` | Modo `auditar_apenas`; o guia atual tem 8 passos, 8 cenarios negativos, 12 blocos de codigo, cobertura de listagens e dashboards, validacao final e handoff para `BK-MF6-01`. |

### Findings desta auditoria

#### MF5-AUD-20260620-BK07-AUD01

- BK/RF/RNF afetado: `BK-MF5-07` / `RNF07`
- Severidade: `P1`
- Estado: `JA_CORRIGIDO`
- Tipo: estrutura pedagogica / contrato P0.
- Evidencia objetiva: `rg -c "^### Passo "` no BK alvo devolveu `8`; pesquisa textual por `7. Cenário negativo/erro esperado.` devolveu `8`; `docs/planificacao/README.md` define `P0 >= 8 passos e >=3 negativos`.
- Expected: um BK `P0` deve ter pelo menos 8 passos tecnicos, validacoes por passo, negativos e evidence suficiente para aluno do 12.o ano.
- Observed: o guia atual cumpre o minimo estrutural e inclui passos dedicados a inventario, medidor, listagens, dashboards, smoke textual, `package.json`, browser e handoff.
- Impacto pedagogico: o aluno recebe um roteiro autonomo, sem ter de adivinhar etapas de validacao.
- Causa provavel do finding anterior: guia antigo estava abaixo do contrato P0.
- Correcao recomendada: nenhuma nesta execucao; manter a estrutura atual.

#### MF5-AUD-20260620-BK07-AUD02

- BK/RF/RNF afetado: `BK-MF5-07` / `RNF07`
- Severidade: `P1`
- Estado: `JA_CORRIGIDO`
- Tipo: cobertura de requisito.
- Evidencia objetiva: `docs/RNF.md` define `RNF07` como performance de dashboard e listagens; o guia atual identifica `ResourcePanel`, `OperationalReportsPage` e `ExecutiveKpisPage`; `real_dev/web/src/App.tsx` confirma `ResourcePanel`; `real_dev/web/src/pages/mf3Pages.tsx` confirma `OperationalReportsPage` e `ExecutiveKpisPage`.
- Expected: o guia deve cobrir listagens genericas e dashboards dedicados, com ficheiros, funcoes e validacao observavel.
- Observed: o passo 3 cobre `measureListingLoad` em `ResourcePanel`; o passo 4 cobre `measureDashboardLoad` em `mf3Pages.tsx`.
- Impacto tecnico: reduz o risco de cumprir so listagens e deixar dashboards fora de `RNF07`.
- Correcao recomendada: nenhuma nesta execucao; manter cobertura dupla de listagens e dashboards.

#### MF5-AUD-20260620-BK07-AUD03

- BK/RF/RNF afetado: `BK-MF5-07`, `BK-MF5-06` / `RNF06`, `RNF07`
- Severidade: `P2`
- Estado: `JA_CORRIGIDO`
- Tipo: coerencia BK anterior -> BK alvo.
- Evidencia objetiva: o guia atual declara que erros reais continuam no contrato do `BK-MF5-06`; os passos 3 e 4 separam `performanceWarning` de `error` e mantem `formatError(caught)` para falhas de API.
- Expected: lentidao com dados validos deve ser aviso nao bloqueante; erro de API, timeout ou falha devem continuar a usar mensagens claras.
- Observed: o guia separa os estados e explica que performance lenta nao deve substituir erro real.
- Impacto pedagogico: o aluno compreende a diferenca entre lentidao, falha e dado valido.
- Correcao recomendada: nenhuma nesta execucao; preservar esta fronteira entre `RNF06` e `RNF07`.

#### MF5-AUD-20260620-BK07-AUD04

- BK/RF/RNF afetado: `BK-MF5-07` / `RNF07`
- Severidade: `P2`
- Estado: `JA_CORRIGIDO`
- Tipo: validacao final e evidence.
- Evidencia objetiva: o guia atual define `test:mf5:performance`, expected result `MF5 performance budget contract OK`, cenario lento de `2100 ms`, validacao manual em browser para listagens/dashboards e comandos finais de `typecheck`/smokes.
- Expected: a evidence deve incluir comandos e comportamento observavel para o limite de 2 segundos.
- Observed: o guia inclui smoke textual e validacao manual com carregamento ate/acima de 2000 ms.
- Impacto tecnico: o aluno consegue distinguir contrato textual de experiencia real em browser.
- Correcao recomendada: nenhuma nesta execucao; quando o BK for implementado em `real_dev`, executar os comandos prescritos.

#### MF5-AUD-20260620-BK07-AUD05

- BK/RF/RNF afetado: coerencia `BK-MF5-01..BK-MF5-07` vs `real_dev/web`
- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- Tipo: guia prescritivo vs implementacao real atual.
- Evidencia objetiva: `real_dev/web/package.json` tem `typecheck`, `test:mf1`, `test:mf2` e `test:mf3`, mas nao tem `test:mf5:performance`; a pesquisa em `real_dev/web/src` e `real_dev/web/scripts` nao encontrou ficheiros MF5/performance.
- Expected: depois de uma execucao de implementacao MF5, `real_dev/web` deve conter os artefactos prescritos pelos BKs.
- Observed: os contratos existem no guia, mas ainda nao estao aplicados no codigo real desta checkout.
- Impacto pedagogico: baixo para auditoria documental; medio para futura execucao real por alunos/agentes.
- Impacto tecnico: nao e possivel executar `npm run test:mf5:performance` no `real_dev/web` atual.
- Correcao recomendada: abrir execucao propria em modo implementacao/correcao para `real_dev`; nao corrigir neste modo `auditar_apenas`.

#### MF5-AUD-20260620-BK07-AUD06

- BK/RF/RNF afetado: documentacao de stack vs prompt ativa.
- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- Tipo: drift documental de caminhos.
- Evidencia objetiva: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` lista `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` e `apps/web/src/lib/apiClient.ts` como estrutura indicativa; a prompt desta execucao define `IMPLEMENTATION_ROOT=real_dev` e o BK alvo usa `real_dev/web`.
- Expected: o relatorio deve explicitar a tensao quando contrato antigo e prompt ativa usam raizes diferentes.
- Observed: o BK alvo esta alinhado com a prompt atual, mas o contrato de stack ainda preserva caminhos `apps/`.
- Impacto: baixo neste BK; medio para futuras correcoes que podem reintroduzir caminhos antigos.
- Correcao recomendada: decidir em execucao propria se `CONTRATO-STACK-IMPLEMENTACAO.md` deve reconhecer `real_dev` como raiz ativa e `apps/` como referencia historica/indicativa.

#### MF5-AUD-20260620-BK07-AUD07

- BK/RF/RNF afetado: `BK-MF5-07` -> `BK-MF6-01` / `RNF07`, `RNF08`
- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- Tipo: coerencia com MF seguinte.
- Evidencia objetiva: `BK-MF5-07` entrega handoff claro para `BK-MF6-01`, mas `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md` ainda esta no formato pedagogico-operacional antigo, sem as secoes `#### Objetivo`, `#### Tutorial tecnico linear` e passos `### Passo`.
- Expected: a MF seguinte deve conseguir consumir a ideia de medicao sem reescrever a base de performance.
- Observed: o handoff do BK alvo esta pronto, mas o BK seguinte ainda precisa de hidratacao propria para consumir esse contrato.
- Impacto: risco de quebra futura na transicao MF5 -> MF6, fora do alvo estrito desta prompt.
- Correcao recomendada: auditar/hidratar `BK-MF6-01` em execucao propria.

### Decisoes tecnicas e de dominio confirmadas

- `CANONICO`: `RNF07` exige que dashboard e listagens carreguem em `<= 2 segundos`.
- `CANONICO`: `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md` e `MF-VIEWS.md` confirmam `BK-MF5-07` em `MF5`, sprint `S09-S10`, owner `Oleksii`, apoio `Pedro`, prioridade `P0`, requisito `RNF07` e handoff para `BK-MF6-01`.
- `CANONICO`: `P0` exige pelo menos 8 passos e 3 cenarios negativos.
- `CANONICO`: performance de UI nao substitui autenticacao, autorizacao, empresa ativa, ownership, validacao backend ou auditoria.
- `DERIVADO`: como `RNF07` e transversal de UX/performance, a solucao pode viver no frontend sem criar endpoints, modelos Prisma, migrations, services ou controllers.
- `DERIVADO`: `MF5_PERFORMANCE_BUDGET_MS=2000` e a fonte unica do limite no frontend.
- `DERIVADO`: `measureListingLoad` cobre listagens genericas e `measureDashboardLoad` cobre dashboards dedicados.
- `DERIVADO`: `formatPerformanceWarning` deve gerar aviso nao bloqueante; erros reais continuam a passar pelo padrao do `BK-MF5-06`.
- `DERIVADO`: `test:mf5:performance` e evidence textual minima, mas nao substitui validacao manual em browser.

### Mapa de integracao da MF

| Item | Resultado |
| --- | --- |
| Ficheiros criados nesta execucao | Nenhum |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md` |
| BKs editados nesta execucao | Nenhum |
| Ficheiros previstos pelo BK alvo | `real_dev/web/src/lib/mf5PerformanceBudget.ts`, `real_dev/web/src/App.tsx`, `real_dev/web/src/pages/mf3Pages.tsx`, `real_dev/web/scripts/check-mf5-performance.mjs`, `real_dev/web/package.json` |
| Exports produzidos pelo BK alvo | `MF5_PERFORMANCE_BUDGET_MS`, `MF5_LISTING_BUDGET_MS`, `MF5_DASHBOARD_BUDGET_MS`, `PerformanceSurface`, `PerformanceSample`, `measureUiLoad`, `measureListingLoad`, `measureDashboardLoad`, `formatPerformanceWarning` |
| Imports consumidos de BKs anteriores | `formatError`/`formatUiError` do `BK-MF5-06`; feedback/loading de `BK-MF5-03`; legibilidade/acessibilidade de `BK-MF5-04` |
| Endpoints criados | Nenhum |
| DTOs/validators criados | Nenhum |
| Schemas/modelos criados | Nenhum |
| Services criados | Nenhum |
| Componentes/paginas frontend criados | Nenhum nesta execucao; guia prescreve edicoes em `ResourcePanel`, `OperationalReportsPage` e `ExecutiveKpisPage` |
| Providers de IA criados ou usados | Nenhum |
| Regras de seguranca/autorizacao aplicadas | Backend continua fonte de autenticacao, autorizacao, empresa ativa, ownership, validacao final e auditoria |
| Testes criados | Nenhum nesta execucao; guia prescreve `check-mf5-performance.mjs` e `test:mf5:performance` |
| BKs seguintes dependentes | `BK-MF6-01`, por reutilizar a ideia de performance mensuravel com orçamento proprio de 1 segundo |

### Coerencia MF anterior -> MF alvo -> MF seguinte

- `MF4 -> MF5`: coerente no plano documental. `MF4` entrega IA assistiva, auditoria, notificacoes, tarefas e logs; `MF5` melhora experiencia transversal sem alterar regras contabilisticas/fiscais.
- `BK-MF5-06 -> BK-MF5-07`: coerente no guia atual. `BK-MF5-07` preserva erros claros e separa lentidao de falha.
- `BK-MF5-07 -> BK-MF6-01`: o handoff do BK alvo esta coerente, mas o BK seguinte ainda esta no formato antigo e precisa de hidratacao propria.
- `MF5 -> MF6`: coerente como intencao documental, com risco residual fora de scope por `BK-MF6-01` ainda nao consumir o contrato de performance de forma tutorial.
- Coerencia com `real_dev`: parcial por implementacao pendente; ver `MF5-AUD-20260620-BK07-AUD05`.

### Validacao executada

| Comando/check | Resultado |
| --- | --- |
| Contagem de passos do BK alvo | `OK`; `rg -c "^### Passo "` devolveu `8` |
| Contagem de cenarios negativos do BK alvo | `OK`; pesquisa textual por `7. Cenário negativo/erro esperado.` devolveu `8` |
| Contagem de blocos de codigo do BK alvo | `OK`; `rg -c '^```'` devolveu `24` fences, equivalente a `12` blocos |
| Verificacao de comentarios em blocos de codigo | `OK`; blocos TS/TSX/JS com 20+ linhas incluem comentarios/JSDoc; blocos JSON/Bash sao comandos/configuracao e nao aceitam comentarios JSON validos |
| Pesquisa de termos internos e riscos no BK alvo | `OK`; comando saiu com codigo `1` por ausencia de matches |
| Consulta de `real_dev/web/src/lib/apiClient.ts` | `OK`; confirma `credentials: "include"` |
| Consulta de `real_dev/web/src/App.tsx` | `OK`; confirma `ResourcePanel` e rotas para `OperationalReportsPage`/`ExecutiveKpisPage` |
| Consulta de `real_dev/web/src/pages/mf3Pages.tsx` | `OK`; confirma `OperationalReportsPage` e `ExecutiveKpisPage` |
| Consulta de `real_dev/web/package.json` | `DRIFT/OUT_OF_SCOPE`; scripts `test:mf5:*` ausentes |
| Pesquisa de artefactos MF5/performance em `real_dev/web` | `DRIFT/OUT_OF_SCOPE`; ficheiros prescritos pela MF5 ainda ausentes |
| Pesquisa de termos internos e riscos em `docs/planificacao/guias-bk/MF5/*.md` | `OK`; comando saiu com codigo `1` por ausencia de matches |
| `git diff --check` | `OK`; sem erros |
| `bash scripts/validate-planificacao.sh` | `OK tecnico`; `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `overall_pass=true`; `advisory_pass=false` por `outdated_docs` e checks legados de `guides_quality`, incluindo advisories para `BK-MF5-07` |

### Bloqueios e TODOs restantes

- `TODO (BLOCKER)`: nenhum foi inserido no BK alvo nesta execucao.
- `BLOQUEADO_POR_SCOPE`: implementacao dos artefactos MF5 em `real_dev/web` fica fora deste modo `auditar_apenas`.
- `BLOQUEADO_POR_SCOPE`: alinhamento global `apps/` vs `real_dev` em `CONTRATO-STACK-IMPLEMENTACAO.md` fica fora do BK alvo.
- `BLOQUEADO_POR_SCOPE`: hidratacao de `BK-MF6-01` fica fora do alvo `BK-MF5-07`, mas deve ser tratada antes de usar a MF6 como guia final.

### Resumo final para entrega

- MF processada: `MF5`
- BKs analisados: `1` (`BK-MF5-07`)
- Contagem antes desta execucao: `OK=1`, `PARCIAL=0`, `CRITICO=0`
- Contagem depois desta execucao: `OK=1`, `PARCIAL=0`, `CRITICO=0`
- BKs editados: nenhum
- Principais lacunas corrigidas: nenhuma nesta execucao; modo `auditar_apenas`; lacunas documentais anteriores ja se encontram resolvidas no estado atual do guia
- Decisoes tecnicas confirmadas: medidor frontend, aviso nao bloqueante, smoke textual, separacao entre erro real e lentidao, cobertura de listagens e dashboards
- Decisoes de dominio confirmadas: performance de UI mede e comunica, mas nao decide permissoes, empresa ativa, ownership, persistencia, regras financeiras/fiscais ou auditoria
- Decisoes marcadas como `DERIVADO`: utilitario `mf5PerformanceBudget.ts`, orçamento `2000 ms`, `measureListingLoad`, `measureDashboardLoad`, `formatPerformanceWarning`, `test:mf5:performance`
- Drift documental encontrado: `CONTRATO-STACK-IMPLEMENTACAO.md` ainda usa `apps/` como referencia indicativa, enquanto a prompt ativa e o BK usam `real_dev`
- Riscos restantes: implementacao real da MF5 continua pendente em `real_dev`; `BK-MF6-01` ainda esta no formato antigo; validadores legados podem continuar a emitir advisories
- Coerencia MF anterior -> MF alvo -> MF seguinte: coerente documentalmente dentro de MF5; parcial face a `real_dev` e ao BK seguinte por trabalho fora de scope
- Verificacoes textuais executadas: contagens estruturais, auditoria de blocos de codigo, pesquisa de termos proibidos no BK alvo, consulta de `real_dev/web`, inventario de artefactos MF5
- Resultado de `git diff --check`: `OK`
- Resultado de `bash scripts/validate-planificacao.sh`: `OK tecnico`, `overall_pass=true`, `advisory_pass=false`
- Bloqueios/TODOs restantes: implementacao `real_dev`, alinhamento global de caminhos e hidratacao futura de `BK-MF6-01` ficam fora do modo atual

## Execucao anterior registada - correcao apenas BK-MF5-07

### Escopo desta execucao

- Projeto: `OPSA`
- MF processada: `MF5`
- BK alvo: `BK-MF5-07`
- Modo: `corrigir_apenas`
- Implementation root consultado: `real_dev`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- Findings selecionados: nenhum filtro explicito; foram tratados os findings `PARCIAL` do relatorio existente para `BK-MF5-07`.
- Severidades consideradas: `P0`, `P1`, `P2`, `P3`
- Incluir P3: sim, sem aumentar scope.
- Output: `relatorio_e_resumo`
- Strict scope: ativo.
- BKs editados nesta execucao: `docs/planificacao/guias-bk/MF5/BK-MF5-07-dashboard-e-listagens-devem-carregar-em-2-segundos.md`.
- Relatorios editados nesta execucao: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
- Codigo de implementacao editado: nenhum.
- `apps/`, `mockup/`, RF/RNF, matriz, backlog, sprints e restantes documentos canonicos editados: nenhum.
- Commits: nao executados, conforme `PERMITIR_COMMITS=nao`.
- Nota de worktree: antes desta execucao ja existiam alteracoes locais no relatorio e em `BK-MF5-06`; foram preservadas. Esta execucao so alterou o relatorio e `BK-MF5-07`.

### Documentos e fontes consultadas

- Prompt anexada desta execucao.
- Relatorio existente `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
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
- BKs `MF5`, com foco em `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-05`, `BK-MF5-06` e `BK-MF5-07`.
- `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md`.
- `real_dev/web/package.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/pages/mf3Pages.tsx`

### Resumo executivo

O `BK-MF5-07` foi corrigido em modo `corrigir_apenas` com base no relatorio anterior. O estado documental passou de `PARCIAL` para `OK`: o guia foi expandido para 8 passos, 8 cenarios negativos e 12 blocos de codigo, cobre listagens genericas em `ResourcePanel`, cobre dashboards dedicados em `OperationalReportsPage` e `ExecutiveKpisPage`, preserva o contrato de mensagens claras do `BK-MF5-06` e detalha validacao/evidence para `test:mf5:performance`, browser e cenario de 2100 ms.

Nao houve alteracoes em `real_dev`. Os findings `AUD05` e `AUD06` continuam `BLOQUEADO_POR_SCOPE`, porque dizem respeito a implementacao real pendente e alinhamento documental global `apps/` vs `real_dev`, ambos fora do alvo desta prompt.

| Escopo corrigido | OK | PARCIAL | CRITICO | DRIFT/OUT_OF_SCOPE |
| --- | ---: | ---: | ---: | ---: |
| `BK-MF5-07` | 1 | 0 | 0 | 0 |
| Coerencia guia -> `real_dev` atual | 0 | 0 | 0 | 1 |

### Inventario do BK alvo apos correcao

| Campo | Valor |
| --- | --- |
| BK | `BK-MF5-07` |
| Titulo | Dashboard e listagens devem carregar em <= 2 segundos |
| RF/RNF | `RNF07` |
| Prioridade | `P0` |
| Owner | `Oleksii` |
| Apoio | `Pedro` |
| Sprint | `S09-S10` |
| Dependencias canonicas | `-` |
| Dependencias tecnicas derivadas no guia | `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-06` |
| BK anterior na MF | `BK-MF5-06` |
| BK seguinte | `BK-MF6-01` |
| Tipo de entrega | Frontend transversal / performance observavel de dashboards e listagens |
| Entidades Prisma | Nao aplicavel; o BK nao cria persistencia nem muda regras backend |
| Endpoints novos | Nenhum |
| DTOs/validators backend novos | Nenhum |
| Utilitarios prescritos | `mf5PerformanceBudget.ts`, `MF5_PERFORMANCE_BUDGET_MS`, `measureListingLoad`, `measureDashboardLoad`, `formatPerformanceWarning` |
| Scripts prescritos | `real_dev/web/scripts/check-mf5-performance.mjs`, `test:mf5:performance` |
| Estado documental apos correcao | `OK` |

### Classificacao do BK alvo

| BK | Estado antes desta execucao | Estado depois desta execucao | Evidencia |
| --- | --- | --- | --- |
| `BK-MF5-07` | `PARCIAL` | `OK` | Guia com 8 passos, 8 cenarios negativos, 12 blocos de codigo, cobertura de listagens e dashboards, validacao final e handoff para `BK-MF6-01`. |

### Findings desta correcao

#### MF5-AUD-20260620-BK07-AUD01

- BK/RF/RNF afetado: `BK-MF5-07` / `RNF07`
- Severidade: `P1`
- Estado anterior: `PARCIAL`
- Estado apos correcao: `CORRIGIDO`
- Tipo: estrutura pedagogica / contrato P0.
- Evidencia objetiva: `rg -c "^### Passo "` no BK alvo devolveu `8`; pesquisa textual por `7. Cenário negativo/erro esperado.` devolveu `8`; `BACKLOG-MVP.md` define `P0` com minimo `8` passos e `3` cenarios negativos.
- Correcao aplicada: o guia passou de 4 para 8 passos, com ficheiros envolvidos, instrucoes, codigo ou justificacao sem codigo, explicacao, validacao e cenario negativo por passo.
- Resultado: o aluno recebe roteiro autonomo para inventario, medidor, listagens, dashboards, smoke, package, validacao manual e handoff.

#### MF5-AUD-20260620-BK07-AUD02

- BK/RF/RNF afetado: `BK-MF5-07` / `RNF07`
- Severidade: `P1`
- Estado anterior: `PARCIAL`
- Estado apos correcao: `CORRIGIDO`
- Tipo: cobertura incompleta de requisito.
- Evidencia objetiva: o guia corrigido identifica `ResourcePanel`, `OperationalReportsPage` e `ExecutiveKpisPage` como superficies minimas de `RNF07`; o passo 3 cobre `measureListingLoad` e o passo 4 cobre `measureDashboardLoad`.
- Correcao aplicada: foram acrescentadas instrucoes concretas para `real_dev/web/src/App.tsx` e `real_dev/web/src/pages/mf3Pages.tsx`, distinguindo listagens genericas e dashboards dedicados.
- Resultado: `RNF07` deixa de depender apenas de `ResourcePanel` e passa a cobrir dashboards MF3.

#### MF5-AUD-20260620-BK07-AUD03

- BK/RF/RNF afetado: `BK-MF5-07`, `BK-MF5-06` / `RNF06`, `RNF07`
- Severidade: `P2`
- Estado anterior: `PARCIAL`
- Estado apos correcao: `CORRIGIDO`
- Tipo: coerencia BK anterior -> BK alvo.
- Evidencia objetiva: o guia corrigido declara que erros reais continuam no contrato `RNF06`; os passos 3 e 4 mantem `formatError(caught)` para erros de API e separam `performanceWarning` de `error`.
- Correcao aplicada: a performance lenta passou a ser aviso nao bloqueante; erro de API, timeout ou falha continuam a usar o padrao de mensagens claras entregue pelo `BK-MF5-06`.
- Resultado: a sequencia `BK-MF5-06 -> BK-MF5-07` fica coerente no plano documental.

#### MF5-AUD-20260620-BK07-AUD04

- BK/RF/RNF afetado: `BK-MF5-07` / `RNF07`
- Severidade: `P2`
- Estado anterior: `PARCIAL`
- Estado apos correcao: `CORRIGIDO`
- Tipo: validacao final e evidence insuficientes.
- Evidencia objetiva: o guia corrigido define `test:mf5:performance`, expected result `MF5 performance budget contract OK`, cenario lento de `2100 ms`, validacao manual em browser para listagens/dashboards e comandos finais.
- Correcao aplicada: foram acrescentados passos para smoke textual, registo no `package.json`, validacao manual e validacao final com expected results.
- Resultado: o aluno passa a ter evidence textual e observavel para defender `RNF07`.

#### MF5-AUD-20260620-BK07-AUD05

- BK/RF/RNF afetado: coerencia `BK-MF5-01..BK-MF5-07` vs `real_dev/web`
- Severidade: `P3`
- Estado anterior: `BLOQUEADO_POR_SCOPE`
- Estado apos correcao: `BLOQUEADO_POR_SCOPE`
- Tipo: guia prescritivo vs implementacao real atual.
- Evidencia objetiva: esta execucao nao editou `real_dev`; `real_dev/web/package.json` continua a nao ser a fonte de validacao de `test:mf5:performance` porque o modo era correcao documental de guia.
- Resultado: o guia ficou pronto para implementacao futura, mas a implementacao real continua fora de scope.

#### MF5-AUD-20260620-BK07-AUD06

- BK/RF/RNF afetado: documentacao de stack vs prompt ativa.
- Severidade: `P3`
- Estado anterior: `BLOQUEADO_POR_SCOPE`
- Estado apos correcao: `BLOQUEADO_POR_SCOPE`
- Tipo: drift documental de caminhos.
- Evidencia objetiva: a prompt ativa define `IMPLEMENTATION_ROOT=real_dev`; o BK corrigido usa `real_dev/web`. O alinhamento global de `CONTRATO-STACK-IMPLEMENTACAO.md` nao foi feito por estar fora do BK alvo.
- Resultado: drift continua registado sem alterar documentos canonicos fora de scope.

### Decisoes tecnicas e de dominio confirmadas

- `CANONICO`: `RNF07` exige que dashboard e listagens carreguem em `<= 2 segundos`.
- `CANONICO`: `BK-MF5-07` e `P0` e deve ter pelo menos 8 passos e 3 cenarios negativos.
- `CANONICO`: `BK-MF5-07` fecha `MF5` e prepara `BK-MF6-01`.
- `DERIVADO`: `MF5_PERFORMANCE_BUDGET_MS=2000` e a fonte unica do limite no frontend.
- `DERIVADO`: `measureListingLoad` cobre listagens genericas e `measureDashboardLoad` cobre dashboards dedicados.
- `DERIVADO`: `formatPerformanceWarning` deve gerar aviso nao bloqueante; erros reais continuam a passar pelo padrao do `BK-MF5-06`.
- `DERIVADO`: `test:mf5:performance` e evidence textual minima, mas nao substitui validacao manual em browser.

### Mapa de integracao da MF

| Item | Resultado |
| --- | --- |
| Ficheiros criados nesta execucao | Nenhum |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/MF5/BK-MF5-07-dashboard-e-listagens-devem-carregar-em-2-segundos.md`; `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md` |
| BKs editados nesta execucao | `BK-MF5-07` |
| Ficheiros previstos pelo BK alvo | `real_dev/web/src/lib/mf5PerformanceBudget.ts`, `real_dev/web/src/App.tsx`, `real_dev/web/src/pages/mf3Pages.tsx`, `real_dev/web/scripts/check-mf5-performance.mjs`, `real_dev/web/package.json` |
| Exports produzidos pelo BK alvo | `MF5_PERFORMANCE_BUDGET_MS`, `MF5_LISTING_BUDGET_MS`, `MF5_DASHBOARD_BUDGET_MS`, `PerformanceSurface`, `PerformanceSample`, `measureUiLoad`, `measureListingLoad`, `measureDashboardLoad`, `formatPerformanceWarning` |
| Imports consumidos de BKs anteriores | `formatError`/`formatUiError` do `BK-MF5-06`; feedback/loading de `BK-MF5-03`; legibilidade/acessibilidade de `BK-MF5-04` |
| Endpoints criados | Nenhum |
| DTOs/validators criados | Nenhum |
| Schemas/modelos criados | Nenhum |
| Services criados | Nenhum |
| Componentes/paginas frontend criados | Nenhum nesta execucao; guia prescreve edicoes em `ResourcePanel`, `OperationalReportsPage` e `ExecutiveKpisPage` |
| Providers de IA criados ou usados | Nenhum |
| Regras de seguranca/autorizacao aplicadas | Backend continua fonte de autenticacao, autorizacao, empresa ativa, ownership, validacao final e auditoria |
| Testes criados | Nenhum nesta execucao; guia prescreve `check-mf5-performance.mjs` e `test:mf5:performance` |
| BKs seguintes dependentes | `BK-MF6-01`, por reutilizar a ideia de performance mensuravel com orçamento proprio de 1 segundo |

### Coerencia MF anterior -> MF alvo -> MF seguinte

- `MF4 -> MF5`: coerente no plano documental. MF4 entrega IA assistiva, auditoria, notificacoes, tarefas e logs; MF5 melhora experiencia transversal sem alterar regras contabilisticas/fiscais.
- `BK-MF5-06 -> BK-MF5-07`: coerente apos correcao. O BK alvo preserva erros claros e separa lentidao de falha.
- `BK-MF5-07 -> BK-MF6-01`: coerente apos correcao. O handoff indica que MF6 deve reutilizar a ideia de medicao, mas com orçamento proprio de 1 segundo para insercao.
- Coerencia com `real_dev`: parcial por implementacao pendente; continua fora deste modo documental.

### Validacao executada

| Comando/check | Resultado |
| --- | --- |
| Contagem de passos do BK alvo | `OK`; `rg -c "^### Passo "` devolveu `8` |
| Contagem de cenarios negativos do BK alvo | `OK`; pesquisa textual por `7. Cenário negativo/erro esperado.` devolveu `8` |
| Contagem de blocos de codigo do BK alvo | `OK`; `rg -c '^```'` devolveu `24` fences, equivalente a `12` blocos |
| Pesquisa de termos internos e riscos no BK alvo | `OK`; comando saiu com codigo `1` por ausencia de matches |
| Pesquisa de termos internos e riscos em `docs/planificacao/guias-bk/MF5/*.md` | `OK`; comando saiu com codigo `1` por ausencia de matches |
| `git diff --check` | `OK`; sem erros |
| `bash scripts/validate-planificacao.sh` | `OK tecnico`; `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `overall_pass=true`; `advisory_pass=false` por `outdated_docs` e checks legados de `guides_quality`, incluindo falso positivo residual para `BK-MF5-07` |

### Bloqueios e TODOs restantes

- `TODO (BLOCKER)`: nenhum foi inserido no BK alvo.
- `BLOQUEADO_POR_SCOPE`: implementacao dos artefactos MF5 em `real_dev/web` fica fora deste modo `corrigir_apenas`.
- `BLOQUEADO_POR_SCOPE`: alinhamento global `apps/` vs `real_dev` em `CONTRATO-STACK-IMPLEMENTACAO.md` fica fora do BK alvo.
- Advisory residual: o validador legado continua a reportar `missing_handoff_proximo_bk_line`, `missing_pedagogic_or_operational_blocks`, `missing_or_placeholder_snippet` e `P0_minimos(step=56,neg=0)` para `BK-MF5-07`, apesar da leitura manual confirmar `#### Handoff`, codigo real prescritivo, 8 passos e 8 cenarios negativos.

### Resumo final para entrega

- MF processada: `MF5`
- BKs analisados: `1` (`BK-MF5-07`)
- Contagem antes desta execucao: `OK=0`, `PARCIAL=1`, `CRITICO=0`
- Contagem depois desta execucao: `OK=1`, `PARCIAL=0`, `CRITICO=0`
- BKs editados: `BK-MF5-07`
- Principais lacunas corrigidas: estrutura P0, cobertura de dashboards, handoff com `BK-MF5-06`, validacao/evidence de performance
- Decisoes tecnicas confirmadas: medidor frontend, aviso nao bloqueante, smoke textual e separacao entre erro real e lentidao
- Decisoes de dominio confirmadas: performance de UI nao decide permissoes, empresa ativa, ownership, regras financeiras/fiscais ou auditoria
- Decisoes marcadas como `DERIVADO`: utilitario `mf5PerformanceBudget.ts`, orçamento `2000 ms`, `measureListingLoad`, `measureDashboardLoad`, `formatPerformanceWarning`, `test:mf5:performance`
- Drift documental encontrado: `CONTRATO-STACK-IMPLEMENTACAO.md` ainda usa `apps/` como referencia indicativa, enquanto a prompt ativa e o BK usam `real_dev`
- Riscos restantes: implementacao real da MF5 continua pendente em `real_dev`; validador legado continua a emitir advisories falsos positivos
- Coerencia MF anterior -> MF alvo -> MF seguinte: coerente documentalmente; parcial face a `real_dev` por implementacao pendente
- Verificacoes textuais executadas: contagens estruturais, pesquisa de termos proibidos, `git diff --check`, `validate-planificacao.sh`
- Resultado de `git diff --check`: `OK`
- Resultado de `bash scripts/validate-planificacao.sh`: `OK tecnico`, `overall_pass=true`, `advisory_pass=false`
- Bloqueios/TODOs restantes: implementacao `real_dev` e alinhamento global de caminhos ficam fora de scope

## Execucao anterior registada - auditoria apenas BK-MF5-07

### Escopo desta execucao

- Projeto: `OPSA`
- MF processada: `MF5`
- BK alvo: `BK-MF5-07`
- Modo: `auditar_apenas`
- Implementation root consultado: `real_dev`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- Findings selecionados: nenhum filtro explicito; auditoria direta do BK alvo.
- Severidades consideradas: `P0`, `P1`, `P2`, `P3`
- Incluir P3: sim.
- Output: `relatorio_e_resumo`
- Strict scope: ativo.
- BKs editados nesta execucao: nenhum.
- Relatorios editados nesta execucao: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
- Codigo de implementacao editado: nenhum.
- `apps/`, `mockup/`, RF/RNF, matriz, backlog, sprints, BKs e restantes documentos canonicos editados: nenhum.
- Commits: nao executados, conforme `PERMITIR_COMMITS=nao`.
- Nota de worktree: antes desta auditoria ja existiam alteracoes locais no proprio relatorio e em `BK-MF5-06`; foram preservadas.

### Documentos e fontes consultadas

- Prompt anexada desta execucao.
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
- Todos os BKs de `docs/planificacao/guias-bk/MF5/`, com foco em `BK-MF5-06` e `BK-MF5-07`.
- `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md`.
- Leitura estrutural dirigida de BKs MF0-MF4 para comparar estrutura, densidade pedagogica, passos, validacao, evidence e handoff.
- `real_dev/web/package.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/pages/mf3Pages.tsx`
- Inventario de ficheiros `real_dev/web/src` e `real_dev/web/scripts` para artefactos MF5/performance.

### Resumo executivo

O `BK-MF5-07` foi auditado em modo `auditar_apenas`. O guia fica classificado como `PARCIAL`: tem a estrutura editorial principal, define um utilitario `measureListingLoad`, indica alteracao em `ResourcePanel.load` e propoe o smoke `test:mf5:performance`, mas ainda nao cumpre o contrato P0 de pelo menos 8 passos e nao cobre claramente o requisito completo `RNF07`, que fala de dashboard e listagens.

Nao foram editados BKs nesta execucao. O guia atual tem 4 passos, 4 cenarios negativos e 3 blocos de codigo. Para ficar `OK`, precisa de aprofundar o roteiro tecnico, cobrir dashboards especificos como relatorios operacionais e KPIs executivos, preservar explicitamente o handoff de mensagens claras do `BK-MF5-06`, e detalhar validacao final com expected results reais.

| Escopo auditado | OK | PARCIAL | CRITICO | DRIFT/OUT_OF_SCOPE |
| --- | ---: | ---: | ---: | ---: |
| `BK-MF5-07` | 0 | 1 | 0 | 0 |
| Coerencia guia -> `real_dev` atual | 0 | 0 | 0 | 1 |

### Inventario do BK alvo

| Campo | Valor |
| --- | --- |
| BK | `BK-MF5-07` |
| Titulo | Dashboard e listagens devem carregar em <= 2 segundos |
| RF/RNF | `RNF07` |
| Prioridade | `P0` |
| Owner | `Oleksii` |
| Apoio | `Pedro` |
| Sprint | `S09-S10` |
| Dependencias canonicas | `-` |
| Dependencias tecnicas derivadas no guia | `BK-MF5-06`, por `formatUiError`/mensagens claras em loading, erro, timeout e lista vazia |
| BK anterior na MF | `BK-MF5-06` |
| BK seguinte | `BK-MF6-01` |
| Tipo de entrega | Frontend transversal / performance observavel de dashboards e listagens |
| Entidades Prisma | Nao aplicavel; o BK nao cria persistencia nem muda regras de backend |
| Endpoints novos | Nenhum |
| DTOs/validators backend novos | Nenhum |
| Utilitarios prescritos | `mf5PerformanceBudget.ts`, `MF5_LISTING_BUDGET_MS`, `measureListingLoad` |
| Scripts prescritos | `real_dev/web/scripts/check-mf5-performance.mjs`, `test:mf5:performance` |
| Estado documental atual | `PARCIAL` |

### Classificacao do BK alvo

| BK | Estado antes desta execucao | Estado depois desta execucao | Evidencia |
| --- | --- | --- | --- |
| `BK-MF5-07` | `PARCIAL` | `PARCIAL` | Modo `auditar_apenas`; o guia tem 4 passos, 4 negativos e 3 blocos de codigo, abaixo do minimo P0 de 8 passos, e cobre sobretudo `ResourcePanel`/listagens. |

### Findings desta auditoria

#### MF5-AUD-20260620-BK07-AUD01

- BK/RF/RNF afetado: `BK-MF5-07` / `RNF07`
- Severidade: `P1`
- Estado: `PARCIAL`
- Tipo: estrutura pedagogica / contrato P0.
- Evidencia objetiva: `rg -c "^### Passo "` no BK alvo devolveu `4`; `BACKLOG-MVP.md` define `P0` com minimo `8` passos e `3` cenarios negativos.
- Expected: um BK `P0` deve ter pelo menos 8 passos tecnicos, com roteiro autonomo, validacoes por passo, negativos e evidence suficiente para aluno do 12.o ano.
- Observed: o guia tem apenas 4 passos e concentra a implementacao em medidor, `ResourcePanel` e smoke textual.
- Impacto pedagogico: o aluno fica com caminho inicial, mas nao tem roteiro completo para medir, simular, validar, recolher evidence e preparar handoff sem adivinhar tarefas.
- Impacto tecnico: aumenta o risco de implementacao parcial do RNF07 sem coverage suficiente.
- Causa provavel: guia ainda esta no formato resumido anterior a hidratacao completa da MF5.
- Correcao recomendada: expandir o BK para 8 passos, separando inventario de ecras, medidor, integracao em listagens, integracao em dashboards, mensagens de estado, smoke textual, validacao manual com rede lenta e handoff para `BK-MF6-01`.

#### MF5-AUD-20260620-BK07-AUD02

- BK/RF/RNF afetado: `BK-MF5-07` / `RNF07`
- Severidade: `P1`
- Estado: `PARCIAL`
- Tipo: cobertura incompleta de requisito.
- Evidencia objetiva: `docs/RNF.md` define `RNF07` como "Dashboard e listagens devem carregar em <= 2 segundos"; o BK alvo declara dashboard e listagens no scope, mas o tutorial so altera `ResourcePanel.load`. Em `real_dev/web/src/App.tsx`, `OperationalReportsPage` e `ExecutiveKpisPage` existem como paginas dedicadas, fora de `ResourcePanel`.
- Expected: o guia deve dizer concretamente como medir listagens e dashboards, incluindo ecras dedicados de relatorios/KPIs quando esses representam dashboards no OPSA.
- Observed: a frase "dashboards especificos podem reutilizar a mesma funcao" deixa a decisao aberta e nao indica ficheiros, funcoes, estados ou validacao para `OperationalReportsPage`/`ExecutiveKpisPage`.
- Impacto pedagogico: o aluno pode cumprir listagens e deixar dashboards sem medicao, apesar de `RNF07` exigir ambos.
- Impacto tecnico: o smoke atual so verifica `App.tsx` e `mf5PerformanceBudget.ts`, nao prova cobertura dos dashboards dedicados.
- Causa provavel: generalizacao excessiva de `ResourcePanel` como ponto comum.
- Correcao recomendada: acrescentar passos concretos para medir `real_dev/web/src/pages/mf3Pages.tsx`, pelo menos nos fluxos `OperationalReportsPage` e `ExecutiveKpisPage`, ou justificar documentalmente que estes nao contam como dashboard neste BK.

#### MF5-AUD-20260620-BK07-AUD03

- BK/RF/RNF afetado: `BK-MF5-07`, `BK-MF5-06` / `RNF06`, `RNF07`
- Severidade: `P2`
- Estado: `PARCIAL`
- Tipo: coerencia BK anterior -> BK alvo.
- Evidencia objetiva: o handoff de `BK-MF5-06` manda manter `formatUiError` para erros de carregamento e performance; no BK alvo, o passo 3 usa `setError(`${measured.sample.label} demorou ...`)` diretamente e nao explica como reaproveitar `formatUiError`, estados de timeout, lista vazia ou erro claro.
- Expected: `BK-MF5-07` deve preservar o contrato RNF06 para erros de carregamento/performance, evitando mensagens inconsistentes com a MF5 anterior.
- Observed: o guia cria uma mensagem direta de performance e mantem `formatError(caught)` no catch, mas nao integra o novo aviso no padrao de erro claro entregue pelo BK anterior.
- Impacto pedagogico: o aluno nao percebe a relacao entre performance lenta, erro recuperavel, aviso nao bloqueante e mensagem clara em PT-PT.
- Impacto tecnico: risco de regressao UX entre `BK-MF5-06` e `BK-MF5-07`.
- Causa provavel: o guia foi escrito antes da correcao recente de `BK-MF5-06`.
- Correcao recomendada: explicitar consumo de `formatUiError`/padrao RNF06, distinguir aviso de performance de erro de API e adicionar cenarios de timeout, lista vazia e rede lenta com mensagem clara.

#### MF5-AUD-20260620-BK07-AUD04

- BK/RF/RNF afetado: `BK-MF5-07` / `RNF07`
- Severidade: `P2`
- Estado: `PARCIAL`
- Tipo: validacao final e evidence insuficientes.
- Evidencia objetiva: a validacao final manda executar `typecheck`, smokes MF1/MF2/MF3 e "o smoke MF5 indicado", mas nao lista comandos completos nem expected results especificos para `test:mf5:performance`, teste de atraso `2100 ms`, rede lenta, dashboards, listagens ou recolha de tempo antes/depois.
- Expected: o BK deve indicar comandos e resultados esperados mensuraveis, incluindo smoke textual, typecheck, cenarios positivos/negativos e evidence observavel para 2 segundos.
- Observed: o guia aponta validacoes genericas e deixa a recolha de evidence de performance subespecificada.
- Impacto pedagogico: o aluno pode fechar o BK com output textual sem provar comportamento real em browser/listagens/dashboards.
- Impacto tecnico: risco de `RNF07` ser tratado como check textual em vez de performance observavel.
- Causa provavel: validacao herdada de template resumido.
- Correcao recomendada: detalhar comandos `cd real_dev/web`, `npm run typecheck`, `npm run test:mf1`, `npm run test:mf2`, `npm run test:mf3`, `npm run test:mf5:errors`, `npm run test:mf5:performance`, mais evidence manual com throttling/rede lenta e expected results.

#### MF5-AUD-20260620-BK07-AUD05

- BK/RF/RNF afetado: coerencia `BK-MF5-01..BK-MF5-07` vs `real_dev/web`
- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- Tipo: guia prescritivo vs implementacao real atual.
- Evidencia objetiva: `real_dev/web/package.json` tem `typecheck`, `test:mf1`, `test:mf2` e `test:mf3`, mas nao tem `test:mf5:performance`; nao existem ficheiros `real_dev/web/src/lib/mf5PerformanceBudget.ts` nem `real_dev/web/scripts/check-mf5-performance.mjs`.
- Expected: depois de uma implementacao MF5, `real_dev/web` deve conter os artefactos prescritos pelos BKs.
- Observed: os contratos existem no guia, mas ainda nao estao aplicados no codigo real desta checkout.
- Impacto pedagogico: baixo para auditoria documental; medio para futura execucao real por alunos/agentes.
- Impacto tecnico: nao e possivel executar `npm run test:mf5:performance` no `real_dev/web` atual.
- Correcao recomendada: abrir execucao propria em modo implementacao/correcao para `real_dev`, nao neste modo `auditar_apenas`.

#### MF5-AUD-20260620-BK07-AUD06

- BK/RF/RNF afetado: documentacao de stack vs prompt ativa.
- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- Tipo: drift documental de caminhos.
- Evidencia objetiva: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` continua a listar `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` e `apps/web/src/lib/apiClient.ts` como estrutura indicativa; a prompt desta execucao define `IMPLEMENTATION_ROOT=real_dev` e o BK alvo usa `real_dev/web`.
- Expected: o relatorio deve explicitar a tensao quando contrato antigo e prompt ativa usam raizes diferentes.
- Observed: o BK alvo esta alinhado com a prompt atual, mas o contrato de stack ainda preserva caminhos `apps/`.
- Impacto: baixo neste BK; medio para futuras correcoes que podem reintroduzir caminhos antigos.
- Correcao recomendada: decidir em execucao propria se `CONTRATO-STACK-IMPLEMENTACAO.md` deve reconhecer `real_dev` como raiz ativa e `apps/` como referencia/legado.

### Decisoes tecnicas e de dominio confirmadas

- `CANONICO`: `RNF07` exige que dashboard e listagens carreguem em `<= 2 segundos`.
- `CANONICO`: `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md` e `MF-VIEWS.md` confirmam `BK-MF5-07` em `MF5`, sprint `S09-S10`, owner `Oleksii`, apoio `Pedro`, prioridade `P0`, requisito `RNF07` e handoff para `BK-MF6-01`.
- `CANONICO`: `P0` exige pelo menos 8 passos e 3 cenarios negativos.
- `CANONICO`: performance de UI nao substitui autenticacao, autorizacao, empresa ativa, ownership, validacao backend ou auditoria.
- `DERIVADO`: como `RNF07` e transversal de UX/performance, a solucao pode viver no frontend sem criar endpoints, modelos Prisma, migrations, services ou controllers.
- `DERIVADO`: `measureListingLoad` e `MF5_LISTING_BUDGET_MS=2000` sao uma abordagem minima aceitavel para medir chamadas assíncronas, desde que o guia cubra dashboards e listagens.
- `DERIVADO`: `BK-MF5-07` deve consumir o padrao de mensagens claras de `BK-MF5-06` para erros, timeout e avisos de carregamento lento.

### Mapa de integracao da MF

| Item | Resultado |
| --- | --- |
| Ficheiros criados nesta execucao | Nenhum |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md` |
| BKs editados nesta execucao | Nenhum |
| Ficheiros previstos pelo BK alvo | `real_dev/web/src/lib/mf5PerformanceBudget.ts`, `real_dev/web/src/App.tsx`, `real_dev/web/src/pages/mf3Pages.tsx`, `real_dev/web/scripts/check-mf5-performance.mjs`, `real_dev/web/package.json` |
| Exports previstos pelo BK alvo | `MF5_LISTING_BUDGET_MS`, `PerformanceSample`, `measureListingLoad` |
| Imports consumidos de BKs anteriores | `formatUiError`/padrao RNF06 de `BK-MF5-06` deve ser consumido no desenho final |
| Endpoints criados | Nenhum |
| DTOs/validators backend criados | Nenhum |
| Schemas/modelos criados | Nenhum |
| Services criados | Nenhum |
| Componentes/paginas frontend criados | Nenhum nesta execucao |
| Providers de IA criados ou usados | Nenhum |
| Regras de seguranca/autorizacao | Backend continua fonte de autenticacao, autorizacao, empresa ativa, ownership, validacao final e auditoria |
| Testes/checks esperados pelo BK | `typecheck`, `test:mf1`, `test:mf2`, `test:mf3`, `test:mf5:errors`, `test:mf5:performance`, cenarios manuais de rede lenta e dashboard/listagens |
| BKs seguintes dependentes | `BK-MF6-01`, por continuar performance mensuravel em insercao de documentos |

### Coerencia MF anterior -> MF alvo -> MF seguinte

- `MF4 -> MF5`: coerente ao nivel documental. `MF4` entrega IA assistiva, auditoria, notificacoes, tarefas e logs; `MF5` melhora experiencia, validacao, mensagens e performance sem alterar regras contabilisticas/fiscais.
- `BK-MF5-06 -> BK-MF5-07`: parcialmente coerente. O BK alvo deveria reutilizar o padrao `formatUiError`/mensagens claras para timeout, lista vazia, erro de API e carregamento lento; hoje so o menciona de forma indireta.
- `BK-MF5-07 -> BK-MF6-01`: coerente no plano documental, mas incompleto. `BK-MF6-01` herda a ideia de performance mensuravel, mas o guia atual ainda nao fecha evidence robusta para `RNF07`.
- `MF5 -> MF6`: coerente no plano documental, desde que futuras implementacoes mantenham seguranca, cookies, autorizacao e contexto multiempresa no backend.
- Coerencia com `real_dev`: parcial por implementacao pendente; ver `MF5-AUD-20260620-BK07-AUD05`.

### Validacao executada

| Comando/check | Resultado |
| --- | --- |
| Contagem de passos do BK alvo | `PARCIAL`; `rg -c "^### Passo "` devolveu `4`, abaixo do minimo `P0=8` |
| Contagem de cenarios negativos do BK alvo | `OK`; pesquisa textual pelas linhas `7. Cenario negativo/erro esperado.` / `7. Cenário negativo/erro esperado.` devolveu `4`, acima do minimo `P0=3` |
| Contagem de blocos de codigo do BK alvo | `OK`; `rg -c '^```'` devolveu `6` fences, equivalente a `3` blocos |
| Pesquisa de termos internos e riscos no BK alvo | `OK`; comando saiu com codigo `1` por ausencia de matches |
| Consulta de `real_dev/web/src/lib/apiClient.ts` | `OK`; confirma `ApiError` com `status`, `code`, `message` e `credentials: "include"` |
| Consulta de `real_dev/web/src/App.tsx` | `OK/PARCIAL`; confirma `ResourcePanel.load`, mas dashboards dedicados usam paginas fora desse ponto comum |
| Consulta de `real_dev/web/package.json` | `DRIFT/OUT_OF_SCOPE`; scripts `test:mf5:*` ausentes |
| Pesquisa de artefactos MF5/performance em `real_dev/web` | `DRIFT/OUT_OF_SCOPE`; ficheiros prescritos pela MF5 ainda ausentes |
| `git diff --check` | `OK`; sem erros |
| `bash scripts/validate-planificacao.sh` | `OK tecnico`; `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `overall_pass=true`; `advisory_pass=false` por `outdated_docs` e checks legados de `guides_quality`, incluindo `BK-MF5-07` |

### Bloqueios e TODOs restantes

- `TODO (BLOCKER)`: nenhum foi inserido no BK alvo nesta execucao.
- `BLOQUEADO_POR_SCOPE`: implementacao dos artefactos MF5 em `real_dev/web` fica fora deste modo `auditar_apenas`.
- `BLOQUEADO_POR_SCOPE`: alinhamento global `apps/` vs `real_dev` em `CONTRATO-STACK-IMPLEMENTACAO.md` fica fora do BK alvo.
- `PARCIAL`: o guia `BK-MF5-07` precisa de correcao/hidratacao em execucao propria para poder ficar `OK`.

### Resumo final para entrega

- MF processada: `MF5`
- BKs analisados: `1` (`BK-MF5-07`)
- Contagem antes desta execucao: `OK=0`, `PARCIAL=1`, `CRITICO=0`
- Contagem depois desta execucao: `OK=0`, `PARCIAL=1`, `CRITICO=0`
- BKs editados: nenhum
- Principais lacunas corrigidas: nenhuma nesta execucao; modo `auditar_apenas`
- Decisoes tecnicas confirmadas: `ResourcePanel.load` existe como ponto comum para listagens; dashboards dedicados existem fora de `ResourcePanel`; `measureListingLoad` e smoke textual sao abordagem derivada, mas ainda incompleta
- Decisoes de dominio confirmadas: performance de UI mede e comunica, mas nao decide permissoes, empresa ativa, ownership, persistencia, regras financeiras/fiscais ou auditoria
- Decisoes marcadas como `DERIVADO`: utilitario frontend `mf5PerformanceBudget.ts`, orçamento `2000 ms`, script `test:mf5:performance`, consumo do padrao `formatUiError` do BK anterior
- Drift documental encontrado: `CONTRATO-STACK-IMPLEMENTACAO.md` ainda usa `apps/` como referencia indicativa, enquanto a prompt ativa e o BK usam `real_dev`
- Riscos restantes: BK com 4 passos abaixo do minimo P0; dashboards nao cobertos concretamente; validacao/evidence de performance ainda generica; `real_dev/web` sem artefactos MF5
- Coerencia MF anterior -> MF alvo -> MF seguinte: parcial; o handoff de `BK-MF5-06` precisa de ser refletido no `BK-MF5-07` e a transicao para `BK-MF6-01` precisa de evidence mais robusta
- Verificacoes textuais executadas: contagens estruturais, pesquisa de termos proibidos, consulta de `real_dev/web`, inventario de artefactos MF5
- Resultado de `git diff --check`: `OK`
- Resultado de `bash scripts/validate-planificacao.sh`: `OK tecnico`, `overall_pass=true`, `advisory_pass=false`
- Bloqueios/TODOs restantes: implementacao `real_dev`, alinhamento global de caminhos e hidratacao/correcao do `BK-MF5-07` ficam fora do modo atual

## Execucao anterior registada - auditoria apenas BK-MF5-06

### Escopo desta execucao

- Projeto: `OPSA`
- MF processada: `MF5`
- BK alvo: `BK-MF5-06`
- Modo: `auditar_apenas`
- Implementation root consultado: `real_dev`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- Findings selecionados: nenhum filtro explicito; auditoria direta do BK alvo.
- Severidades consideradas: `P0`, `P1`, `P2`, `P3`
- Incluir P3: sim.
- Output: `relatorio_e_resumo`
- Strict scope: ativo.
- BKs editados nesta execucao: nenhum.
- Relatorios editados nesta execucao: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
- Codigo de implementacao editado: nenhum.
- `apps/`, `mockup/`, RF/RNF, matriz, backlog, sprints, BKs e restantes documentos canonicos editados: nenhum.
- Commits: nao executados, conforme `PERMITIR_COMMITS=nao`.
- Nota de worktree: antes desta auditoria ja existiam alteracoes locais no proprio relatorio e em `BK-MF5-06`; foram preservadas e auditadas como estado atual do ficheiro.

### Documentos e fontes consultadas

- Prompt anexada desta execucao.
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
- Todos os BKs de `docs/planificacao/guias-bk/MF5/`, com foco em `BK-MF5-05`, `BK-MF5-06` e `BK-MF5-07`.
- Leitura dirigida de BKs MF0-MF4 para comparar estrutura, densidade pedagogica, passos, validacao, evidence e handoff.
- `real_dev/web/package.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/pages/mf1Pages.tsx`
- `real_dev/web/src/pages/mf2Pages.tsx`
- `real_dev/web/src/pages/mf3Pages.tsx`
- `real_dev/web/src/pages/mf4Pages.tsx`

### Resumo executivo

O `BK-MF5-06` foi auditado em modo `auditar_apenas`. No estado atual do ficheiro, o guia esta `OK`: segue a estrutura obrigatoria, tem 8 passos tecnicos, 8 cenarios negativos, 13 blocos de codigo, reutiliza `formatMf5FormErrors` do `BK-MF5-05`, normaliza `ApiError` com `formatUiError` e prepara o `BK-MF5-07` sem mover seguranca, empresa ativa, ownership, persistencia ou auditoria para o frontend.

Nao foram editados BKs nesta execucao. As lacunas de guia que aparecem na secao anterior do relatorio estao resolvidas no conteudo atual auditado. O risco residual principal e de implementacao: `real_dev/web` ainda nao contem os artefactos MF5 prescritos pelos guias, incluindo `mf5ErrorMessages.ts`, `mf5FormValidators.ts`, `opsaUi.tsx`, `useActionFeedback.ts` e `test:mf5:errors`. Essa correcao fica fora de scope porque o modo atual e documental/auditoria apenas.

| Escopo auditado | OK | PARCIAL | CRITICO | DRIFT/OUT_OF_SCOPE |
| --- | ---: | ---: | ---: | ---: |
| `BK-MF5-06` | 1 | 0 | 0 | 0 |
| Coerencia guia -> `real_dev` atual | 0 | 0 | 0 | 1 |

### Inventario do BK alvo

| Campo | Valor |
| --- | --- |
| BK | `BK-MF5-06` |
| Titulo | As mensagens de erro devem ser claras e indicar como resolver o problema |
| RF/RNF | `RNF06` |
| Prioridade | `P0` |
| Owner | `Andre` |
| Apoio | `Oleksii` |
| Sprint | `S09-S10` |
| Dependencias canonicas | `-` |
| Dependencias tecnicas derivadas no guia | `BK-MF5-03` por `useActionFeedback`; `BK-MF5-04` por `StatusMessage`; `BK-MF5-05` por `formatMf5FormErrors` |
| BK anterior na MF | `BK-MF5-05` |
| BK seguinte | `BK-MF5-07` |
| Tipo de entrega | Frontend transversal / normalizacao de mensagens de erro |
| Entidades Prisma | Nao aplicavel; o BK nao cria persistencia nem muda regras de backend |
| Endpoints novos | Nenhum |
| DTOs/validators backend novos | Nenhum |
| Utilitarios prescritos | `mf5ErrorMessages.ts`, `toUiErrorMessage`, `formatUiError`, `toUiValidationError`, `formatMf5ValidationUiError` |
| Scripts prescritos | `real_dev/web/scripts/check-mf5-error-messages.mjs`, `test:mf5:errors` |
| Estado documental atual | `OK` |

### Classificacao do BK alvo

| BK | Estado antes desta execucao | Estado depois desta execucao | Evidencia |
| --- | --- | --- | --- |
| `BK-MF5-06` | `OK` | `OK` | O modo foi `auditar_apenas`; o BK atual tem todas as secoes obrigatorias, 8 passos, 8 negativos e 13 blocos de codigo. |

### Findings desta auditoria

#### MF5-AUD-20260620-BK06-AUD01

- BK/RF/RNF afetado: `BK-MF5-06` / `RNF06`
- Severidade: `P2`
- Estado: `JA_CORRIGIDO`
- Tipo: estrutura pedagogica / guia autonomo.
- Evidencia objetiva: `rg -c "^### Passo "` devolveu `8`; `rg -c "^7\\. Cenario negativo/erro esperado\\."` com acentuacao real devolveu `8`; `rg -c '^```'` devolveu `26` fences, equivalentes a `13` blocos de codigo.
- Expected: BK `P0` deve ter roteiro autonomo, estrutura obrigatoria, passos com objetivo, ficheiros, instrucoes, codigo ou justificacao, explicacao, validacao e cenario negativo.
- Observed: o guia atual cumpre a estrutura e inclui `Criterios de aceite`, `Validacao final`, `Evidence`, `Handoff` e `Changelog`.
- Impacto: sem lacuna estrutural ativa.
- Correcao recomendada: preservar a estrutura atual.

#### MF5-AUD-20260620-BK06-AUD02

- BK/RF/RNF afetado: `BK-MF5-06` / `RNF06`
- Severidade: `P1`
- Estado: `JA_CORRIGIDO`
- Tipo: contrato tecnico de mensagens de erro.
- Evidencia objetiva: o passo 3 cria `const error = new Error(formatUiError(caught));` antes de chamar `action.fail(error, "Nao foi possivel guardar os dados.")`; a pesquisa por `caught instanceof Error ? caught`, `formatPageError`, `toPageFeedbackError`, `payload: unknown`, `as any`, `localStorage`, `sessionStorage`, `pseudo-codigo`, `snippet solto`, `implementar depois` e `quando aplicavel` no BK alvo nao devolveu matches.
- Expected: erros da API e erros locais devem passar por formatacao RNF06 antes de chegarem ao feedback visual, mantendo `status`, `code`, `message` e proxima acao.
- Observed: o guia prescreve `formatUiError` para erros API/runtime e `formatMf5ValidationUiError` para erros locais vindos de `BK-MF5-05`.
- Impacto: o aluno recebe contrato completo sem adivinhar helper, endpoint ou validacao backend.
- Correcao recomendada: nenhuma no BK; implementar no `real_dev` em execucao propria.

#### MF5-AUD-20260620-BK06-AUD03

- BK/RF/RNF afetado: `BK-MF5-06`, `BK-MF5-05`, `BK-MF5-07` / `RNF05`, `RNF06`, `RNF07`
- Severidade: `P2`
- Estado: `JA_CORRIGIDO`
- Tipo: coerencia BK anterior -> BK alvo -> BK seguinte.
- Evidencia objetiva: o guia declara consumo de `formatMf5FormErrors` do `BK-MF5-05`, cria `formatMf5ValidationUiError`, e no handoff diz que o `BK-MF5-07` deve reutilizar `formatUiError` para erros de carregamento/performance.
- Expected: o BK deve consumir validacao local da fase anterior e preparar performance/estado de erro do BK seguinte.
- Observed: o handoff esta explicito e a solucao nao duplica validação de dominio nem transfere autoridade para o frontend.
- Impacto: coerencia documental da MF preservada.
- Correcao recomendada: nenhuma no BK.

#### MF5-AUD-20260620-BK06-AUD04

- BK/RF/RNF afetado: coerencia `BK-MF5-01..BK-MF5-06` vs `real_dev/web`
- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- Tipo: guia prescritivo vs implementacao real atual.
- Evidencia objetiva: `real_dev/web/package.json` tem `typecheck`, `test:mf1`, `test:mf2` e `test:mf3`, mas nao tem `test:mf5:errors`; `real_dev/web/src/App.tsx` e paginas `mf1Pages.tsx` a `mf4Pages.tsx` ainda importam/usam `ApiError` com formatacao tecnica; nao existem `real_dev/web/src/lib/mf5ErrorMessages.ts`, `real_dev/web/src/lib/mf5FormValidators.ts`, `real_dev/web/src/ui/opsaUi.tsx`, `real_dev/web/src/ui/useActionFeedback.ts` nem `real_dev/web/scripts/check-mf5-error-messages.mjs`.
- Expected: depois de uma implementacao MF5, `real_dev/web` deve conter os artefactos prescritos pelos BKs.
- Observed: os contratos existem no guia, mas ainda nao estao aplicados no codigo real desta checkout.
- Impacto pedagogico: baixo para auditoria documental; medio para futura execucao real por alunos/agentes.
- Impacto tecnico: nao e possivel executar `npm run test:mf5:errors` no `real_dev/web` atual.
- Correcao recomendada: abrir execucao propria em modo implementacao/correcao para `real_dev`, nao neste modo `auditar_apenas`.

#### MF5-AUD-20260620-BK06-AUD05

- BK/RF/RNF afetado: documentacao de stack vs prompt ativa.
- Severidade: `P3`
- Estado: `BLOQUEADO_POR_SCOPE`
- Tipo: drift documental de caminhos.
- Evidencia objetiva: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` continua a listar `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` e `apps/web/src/lib/apiClient.ts` como estrutura indicativa; a prompt desta execucao define `IMPLEMENTATION_ROOT=real_dev` e o BK alvo usa `real_dev/web`.
- Expected: o relatorio deve explicitar a tensao quando contrato antigo e prompt ativa usam raizes diferentes.
- Observed: o BK alvo esta alinhado com a prompt atual, mas o contrato de stack ainda preserva caminhos `apps/`.
- Impacto: baixo neste BK; medio para futuras correcoes que podem reintroduzir caminhos antigos.
- Correcao recomendada: decidir em execucao propria se `CONTRATO-STACK-IMPLEMENTACAO.md` deve reconhecer `real_dev` como raiz ativa e `apps/` como referencia/legado.

#### MF5-AUD-20260620-BK06-AUD06

- BK/RF/RNF afetado: `BK-MF5-06` / validador legado `guides_quality`.
- Severidade: `P3`
- Estado: `FINDING_DESCARTADO`
- Tipo: falso positivo de ferramenta.
- Evidencia objetiva: `bash scripts/validate-planificacao.sh` devolveu `overall_pass=true`, mas `advisory_pass=false`; para `BK-MF5-06`, o advisory legado reportou `missing_handoff_proximo_bk_line`, `missing_pedagogic_or_operational_blocks`, `missing_or_placeholder_snippet` e `P0_minimos(step=56,neg=0)`. A leitura manual confirma `#### Handoff`, blocos de codigo reais, 8 passos e 8 cenarios negativos.
- Expected: advisory nao deve bloquear a auditoria quando a estrutura nova do BK cumpre a prompt e o `overall_pass` e verdadeiro.
- Observed: o validador legado nao reconhece a estrutura atual dos passos/cenarios negativos.
- Impacto: risco operacional de ruido em futuras validacoes.
- Correcao recomendada: atualizar o validador em tarefa separada, ou continuar a tratar estes avisos como advisory quando houver evidencia manual contraria.

### Decisoes tecnicas e de dominio confirmadas

- `CANONICO`: `RNF06` exige mensagens de erro claras e com indicacao de como resolver o problema.
- `CANONICO`: `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md` e `MF-VIEWS.md` confirmam `BK-MF5-06` em `MF5`, sprint `S09-S10`, owner `Andre`, apoio `Oleksii`, prioridade `P0`, requisito `RNF06` e handoff para `BK-MF5-07`.
- `CANONICO`: validacao frontend e mensagens de UI nao substituem validacao backend, contexto multiempresa, permissoes, ownership, periodos fiscais ou auditoria.
- `DERIVADO`: como `RNF06` e transversal de UX, a solucao pode viver no frontend sem criar endpoints, modelos Prisma, migrations, services ou controllers.
- `DERIVADO`: `BK-MF5-06` consome `formatMf5FormErrors` de `BK-MF5-05`, `StatusMessage` de `BK-MF5-04` e `useActionFeedback` de `BK-MF5-03`, ainda que a dependencia canonica esteja `-`.
- `DERIVADO`: `test:mf5:errors` e `check-mf5-error-messages.mjs` sao evidence textual minima para `RNF06`.

### Mapa de integracao da MF

| Item | Resultado |
| --- | --- |
| Ficheiros criados nesta execucao | Nenhum |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md` |
| BKs editados nesta execucao | Nenhum |
| Ficheiros previstos pelo BK alvo | `real_dev/web/src/lib/mf5ErrorMessages.ts`, `real_dev/web/src/App.tsx`, `real_dev/web/src/pages/mf1Pages.tsx`, `real_dev/web/src/pages/mf2Pages.tsx`, `real_dev/web/src/pages/mf3Pages.tsx`, `real_dev/web/src/pages/mf4Pages.tsx`, `real_dev/web/scripts/check-mf5-error-messages.mjs`, `real_dev/web/package.json` |
| Exports previstos pelo BK alvo | `UiErrorSource`, `UiErrorMessage`, `toUiValidationError`, `toUiErrorMessage`, `formatMf5ValidationUiError`, `formatUiError` |
| Imports consumidos de BKs anteriores | `formatMf5FormErrors` de `BK-MF5-05`; `StatusMessage`/`useActionFeedback` de BKs MF5 anteriores |
| Endpoints criados | Nenhum |
| DTOs/validators backend criados | Nenhum |
| Schemas/modelos criados | Nenhum |
| Services criados | Nenhum |
| Componentes/paginas frontend criados | Nenhum nesta execucao |
| Providers de IA criados ou usados | Nenhum |
| Regras de seguranca/autorizacao | Backend continua fonte de autenticacao, autorizacao, empresa ativa, ownership, validacao final e auditoria |
| Testes/checks esperados pelo BK | `typecheck`, `test:mf1`, `test:mf2`, `test:mf3`, `test:mf5:forms`, `test:mf5:errors`, cenarios manuais positivos/negativos |
| BKs seguintes dependentes | `BK-MF5-07`, por mensagens de erro claras em estados de performance, timeout, loading e falha de listagens |

### Coerencia MF anterior -> MF alvo -> MF seguinte

- `MF4 -> MF5`: coerente ao nivel documental. `MF4` entrega IA assistiva, auditoria, notificacoes, tarefas e logs; `MF5` melhora experiencia e fluxos transversais sem alterar regras contabilisticas/fiscais.
- `BK-MF5-05 -> BK-MF5-06`: coerente. `BK-MF5-06` reutiliza `formatMf5FormErrors` e acrescenta orientacao RNF06.
- `BK-MF5-06 -> BK-MF5-07`: coerente. O handoff indica que `formatUiError` deve continuar a ser usado em estados de carregamento lento, timeout, lista vazia ou erro.
- `MF5 -> MF6`: coerente no plano documental, desde que futuras implementacoes mantenham seguranca, cookies, autorizacao e contexto multiempresa no backend.
- Coerencia com `real_dev`: parcial por implementacao pendente; ver `MF5-AUD-20260620-BK06-AUD04`.

### Validacao executada

| Comando/check | Resultado |
| --- | --- |
| Contagem de passos do BK alvo | `OK`; `rg -c "^### Passo "` devolveu `8` |
| Contagem de cenarios negativos do BK alvo | `OK`; `rg -c "^7\\. Cenario negativo/erro esperado\\."` com acentuacao real devolveu `8` |
| Contagem de blocos de codigo do BK alvo | `OK`; `rg -c '^```'` devolveu `26` fences, equivalente a `13` blocos |
| Pesquisa de termos internos e riscos em `docs/planificacao/guias-bk/MF5/*.md` | `OK`; comando saiu com codigo `1` por ausencia de matches |
| Pesquisa de padroes antigos no BK alvo | `OK`; comando saiu com codigo `1` por ausencia de matches |
| Consulta de `real_dev/web/src/lib/apiClient.ts` | `OK`; confirma `ApiError` com `status`, `code`, `message` e `credentials: "include"` |
| Consulta de `real_dev/web/package.json` | `DRIFT/OUT_OF_SCOPE`; scripts `test:mf5:*` ausentes |
| Pesquisa de artefactos MF5 em `real_dev/web` | `DRIFT/OUT_OF_SCOPE`; ficheiros prescritos pela MF5 ainda ausentes |
| `git diff --check` | `OK`; sem erros |
| `bash scripts/validate-planificacao.sh` | `OK tecnico`; `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `overall_pass=true`; `advisory_pass=false` por `outdated_docs` e checks legados de `guides_quality` |

### Bloqueios e TODOs restantes

- `TODO (BLOCKER)`: nenhum foi inserido no BK alvo nesta execucao.
- `BLOQUEADO_POR_SCOPE`: implementacao dos artefactos MF5 em `real_dev/web` fica fora deste modo `auditar_apenas`.
- `BLOQUEADO_POR_SCOPE`: alinhamento global `apps/` vs `real_dev` em `CONTRATO-STACK-IMPLEMENTACAO.md` fica fora do BK alvo.
- `FINDING_DESCARTADO`: avisos legados de `guides_quality` para `BK-MF5-06`, porque a leitura manual e as contagens textuais confirmam a estrutura exigida pela prompt atual.

### Resumo final para entrega

- MF processada: `MF5`
- BKs analisados: `1` (`BK-MF5-06`)
- Contagem antes desta execucao: `OK=1`, `PARCIAL=0`, `CRITICO=0`
- Contagem depois desta execucao: `OK=1`, `PARCIAL=0`, `CRITICO=0`
- BKs editados: nenhum
- Principais lacunas corrigidas: nenhuma nesta execucao; modo `auditar_apenas`
- Decisoes tecnicas confirmadas: `ApiError` deve passar por `formatUiError`; validacao local do `BK-MF5-05` deve passar por `formatMf5ValidationUiError`; `test:mf5:errors` e o smoke textual sao evidence esperada
- Decisoes de dominio confirmadas: frontend melhora mensagens, mas nao decide permissoes, empresa ativa, ownership, persistencia, regras financeiras/fiscais ou auditoria
- Decisoes marcadas como `DERIVADO`: localizacao dos utilitarios em `real_dev/web/src/lib`, dependencia tecnica de BKs MF5 anteriores e smoke `test:mf5:errors`
- Drift documental encontrado: `CONTRATO-STACK-IMPLEMENTACAO.md` ainda usa `apps/` como referencia indicativa, enquanto a prompt ativa e o BK usam `real_dev`
- Riscos restantes: `real_dev/web` ainda nao implementa os contratos MF5 prescritos; validador legado ainda produz advisory falso-positivo
- Coerencia MF anterior -> MF alvo -> MF seguinte: coerente documentalmente; parcial face a `real_dev` por implementacao pendente
- Verificacoes textuais executadas: contagens estruturais, pesquisa de termos proibidos, pesquisa de padroes antigos, consulta de `real_dev/web`
- Resultado de `git diff --check`: `OK`
- Resultado de `bash scripts/validate-planificacao.sh`: `OK tecnico`, `overall_pass=true`, `advisory_pass=false`
- Bloqueios/TODOs restantes: implementacao `real_dev` e alinhamento global de caminhos ficam fora de scope

## Execucao anterior registada - BK-MF5-06

### Escopo desta execucao

- Projeto: `OPSA`
- MF processada: `MF5`
- BK alvo: `BK-MF5-06`
- Modo: `corrigir_apenas`
- Implementation root consultado: `real_dev`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- Findings selecionados: findings `PARCIAL` confirmados no relatorio existente para `BK-MF5-06` (`F01`, `F02`).
- Severidades consideradas: `P0`, `P1`, `P2`, `P3`
- Incluir P3: sim.
- Output: `relatorio_e_resumo`
- Strict scope: ativo.
- BKs editados nesta execucao: `docs/planificacao/guias-bk/MF5/BK-MF5-06-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md`.
- Relatorios editados nesta execucao: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
- Codigo de implementacao editado: nenhum.
- `apps/`, `mockup/`, RF/RNF, matriz, backlog, sprints, BKs e restantes documentos canonicos editados: nenhum.
- Commits: nao executados, conforme `PERMITIR_COMMITS=nao`.

### Documentos e fontes consultadas

- Prompt anexada desta execucao.
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
- Todos os BKs de `docs/planificacao/guias-bk/MF5/`, com foco em `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-05`, `BK-MF5-06` e `BK-MF5-07`.
- Leitura estrutural dirigida dos BKs de `MF0`, `MF1`, `MF2`, `MF3` e `MF4` para comparar densidade, passos, blocos de codigo, negativos e handoff.
- Relatorios `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF0.md` a `AUDITORIA-HIDRATACAO-MF5.md`, quando existentes no repositorio.
- `real_dev/web/package.json`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/mf1Pages.tsx`
- `real_dev/web/src/pages/mf2Pages.tsx`
- `real_dev/web/src/pages/mf3Pages.tsx`
- `real_dev/web/src/pages/mf4Pages.tsx`

### Resumo executivo

O `BK-MF5-06` foi corrigido em modo `corrigir_apenas`, usando o relatorio existente como fonte de findings. O guia passou de `PARCIAL` para `OK`: mantem a estrutura obrigatoria, 8 passos, 8 cenarios negativos, integracao com `formatMf5FormErrors` e smoke `test:mf5:errors`, e agora fecha as duas lacunas que impediam a implementacao autonoma.

Primeiro, no passo 3, o `catch` de `handleSubmit` passou a embrulhar sempre `formatUiError(caught)` num novo `Error`, incluindo quando o erro original e `ApiError`. Isto preserva o contrato de `action.fail(error: Error)` e evita que mensagens tecnicas ignorem a orientacao de `RNF06`. Segundo, no passo 5, o exemplo generico foi substituido por instrucoes e blocos concretos para `mf1Pages.tsx`, `mf2Pages.tsx`, `mf3Pages.tsx` e `mf4Pages.tsx`.

Nao foram feitas alteracoes em `real_dev`, `apps/`, `mockup`, RF/RNF, matriz, backlog, sprints ou documentos canonicos fora do relatorio permitido. A implementacao real de MF5 em `real_dev` continua fora desta execucao e permanece registada como risco/bloqueio de escopo.

| Escopo auditado | OK | PARCIAL | CRITICO | DRIFT/OUT_OF_SCOPE |
| --- | ---: | ---: | ---: | ---: |
| `BK-MF5-06` | 1 | 0 | 0 | 0 |
| Coerencia guia -> `real_dev` atual | 0 | 0 | 0 | 1 |

### Inventario do BK alvo

| Campo | Valor |
| --- | --- |
| BK | `BK-MF5-06` |
| Titulo | As mensagens de erro devem ser claras e indicar como resolver o problema |
| RF/RNF | `RNF06` |
| Prioridade | `P0` |
| Owner | `Andre` |
| Apoio | `Oleksii` |
| Sprint | `S09-S10` |
| Dependencias canonicas | `-` |
| Dependencias tecnicas derivadas no guia | `BK-MF5-03`, por `useActionFeedback`; `BK-MF5-04`, por `StatusMessage`; `BK-MF5-05`, por `formatMf5FormErrors` |
| BK anterior na MF | `BK-MF5-05` |
| BK seguinte | `BK-MF5-07` |
| Tipo de entrega | Frontend transversal / normalizacao de mensagens de erro |
| Entidades Prisma | Nao aplicavel para o BK; backend continua autoridade final |
| Endpoints novos | Nenhum |
| DTOs/validators backend novos | Nenhum |
| Utilitarios previstos | `mf5ErrorMessages.ts`, `toUiErrorMessage`, `formatUiError`, `toUiValidationError`, `formatMf5ValidationUiError` |
| Scripts previstos | `real_dev/web/scripts/check-mf5-error-messages.mjs`, `test:mf5:errors` |
| Estado documental apos correcao | `OK` |

### Criterios aplicados

- `OK`: o guia permite implementacao autonoma, segura e testavel por alunos, com estrutura completa, codigo integrado, validacao e handoff.
- `PARCIAL`: o guia tem boa orientacao, mas deixa decisoes, imports, ficheiros, passos, validacoes ou explicacoes essenciais por fechar.
- `CRITICO`: a lacuna impede implementacao autonoma ou cria risco relevante de seguranca, integridade, dominio, fiscalidade, contabilistica ou execucao da app.
- `DRIFT/OUT_OF_SCOPE`: incoerencia observada fora do BK alvo ou entre guia prescritivo e implementacao real atual, sem permissao de correcao nesta execucao.

### Classificacao do BK alvo

| BK | Estado antes desta execucao | Estado apos esta execucao | Evidencia |
| --- | --- | --- | --- |
| `BK-MF5-06` | `PARCIAL` | `OK` | Guia tem estrutura completa, 8 passos, 8 negativos e 13 blocos de codigo; o `catch` do `handleSubmit` formata tambem `ApiError` com `formatUiError` e o passo 5 tem substituicoes concretas para paginas MF1-MF4. |

### Findings

#### MF5-AUD-20260620-BK06-F01

- BK/RF/RNF afetado: `BK-MF5-06` / `RNF06`
- Severidade: `P1`
- Estado nesta execucao: `CORRIGIDO`
- Tipo: contrato tecnico / mensagens de erro API
- Evidencia objetiva apos correcao: no passo 3 de `BK-MF5-06`, o `catch` usa `const error = new Error(formatUiError(caught));` seguido de `action.fail(error, "Não foi possível guardar os dados.")`; a pesquisa por `caught instanceof Error ? caught` no BK alvo nao devolve matches.
- Expected: erros da API tambem devem passar por `formatUiError(caught)` antes de chegar ao feedback visual, para preservar causa, codigo, status e proxima acao de `RNF06`.
- Observed apos correcao: qualquer erro capturado, incluindo `ApiError`, passa por `formatUiError(caught)` antes de chegar ao feedback visual.
- Impacto pedagogico apos correcao: o aluno pode copiar o bloco sem perder a orientacao de `RNF06`.
- Impacto tecnico apos correcao: `FORBIDDEN`, `VALIDATION_ERROR` ou `NOT_FOUND` mantem a ajuda mapeada em `HELP_BY_CODE`.
- Impacto de seguranca/dominio apos correcao: reduzido; erros de permissao podem explicar permissao/empresa ativa, mantendo o backend como autoridade final.
- Causa provavel: tentativa de preservar o contrato `action.fail(error: Error)` sem embrulhar tambem erros que ja sao `Error`.
- Correcao aplicada: o `catch` foi substituido por `const error = new Error(formatUiError(caught)); action.fail(error, "Não foi possível guardar os dados.");`.

#### MF5-AUD-20260620-BK06-F02

- BK/RF/RNF afetado: `BK-MF5-06` / `RNF06`
- Severidade: `P1`
- Estado nesta execucao: `CORRIGIDO`
- Tipo: codigo incompleto / paginas dedicadas
- Evidencia objetiva apos correcao: no passo 5, o guia inclui blocos concretos para `mf1Pages.tsx`, `mf2Pages.tsx`, `mf3Pages.tsx` e `mf4Pages.tsx`; cada bloco mostra imports ajustados e uma funcao local `formatError(error: unknown): string` que devolve `formatUiError(error)`.
- Expected: para quatro ficheiros editados, o BK deve indicar localizacao exata e codigo completo ou funcoes completas a substituir em cada ficheiro, sem snippets soltos nem exemplos genericos.
- Observed apos correcao: o aluno recebe localizacao exata e substituicao por ficheiro, sem helper generico nem exemplo solto.
- Impacto pedagogico apos correcao: o guia deixa de exigir adivinhacao nas paginas dedicadas.
- Impacto tecnico apos correcao: a cobertura transversal de `RNF06` fica especificada para as quatro paginas MF1-MF4.
- Causa provavel: tentativa de evitar repeticao entre ficheiros, mas o contrato da prompt exige completude executavel.
- Correcao aplicada: o bloco generico foi substituido por instrucoes e codigo por ficheiro.

#### MF5-AUD-20260620-BK06-F03

- BK/RF/RNF afetado: `BK-MF5-06` / `RNF06`
- Severidade: `P2`
- Estado nesta execucao: `JA_CORRIGIDO`
- Tipo: estrutura pedagogica / densidade P0
- Evidencia objetiva: `rg -c "^### Passo "` devolveu `8`; `rg -c "^7\\. Cenário negativo/erro esperado\\."` devolveu `8`; `rg -c "^```"` devolveu `26` fences, equivalentes a `13` blocos de codigo; nenhuma seccao obrigatoria do template ficou em falta.
- Expected: BK `P0` deve ter roteiro autonomo, estrutura obrigatoria, negativos e evidence.
- Observed: o guia ja cumpre a densidade estrutural minima e inclui `Critérios de aceite`, `Validação final`, `Evidence`, `Handoff` e `Changelog`.
- Impacto: sem lacuna estrutural ativa; a classificacao global passa a `OK` depois de corrigidos os findings F01 e F02.
- Causa provavel: correcao documental anterior ja expandiu o guia.
- Correcao recomendada: manter a estrutura atual quando se corrigirem os pontos tecnicos.

#### MF5-AUD-20260620-BK06-F04

- BK/RF/RNF afetado: `BK-MF5-06`, `BK-MF5-03`, `BK-MF5-04` / `RNF03`, `RNF04`, `RNF06`
- Severidade: `P2`
- Estado nesta execucao: `JA_CORRIGIDO`
- Tipo: integracao entre BKs
- Evidencia objetiva: o guia importa `FieldValidationError` e `formatMf5FormErrors` de `./mf5FormValidators`; cria `toUiValidationError`; cria `formatMf5ValidationUiError`; e no passo 3 chama `new Error(formatMf5ValidationUiError(validationErrors))`.
- Expected: `BK-MF5-06` deve consumir as mensagens de validacao local entregues pelo `BK-MF5-05`.
- Observed: o fluxo local de validacao consome `formatMf5FormErrors` e acrescenta orientacao de `RNF06`.
- Impacto: handoff `BK-MF5-05 -> BK-MF5-06` esta bem encaminhado para validacao local.
- Causa provavel: correcao documental anterior integrou o handoff.
- Correcao recomendada: preservar esta integracao quando for corrigido o `catch` de erros API.

#### MF5-AUD-20260620-BK06-F05

- BK/RF/RNF afetado: coerencia `BK-MF5-01..BK-MF5-06` vs `real_dev/web`
- Severidade: `P3`
- Estado nesta execucao: `BLOQUEADO_POR_SCOPE`
- Tipo: guia prescritivo vs implementacao real atual
- Evidencia objetiva: `real_dev/web/src/App.tsx` ainda tem `formatError` tecnico com `${error.code}: ${error.message}`; `real_dev/web/package.json` nao expoe scripts `test:mf5:*`; nao existem `real_dev/web/src/ui/opsaUi.tsx`, `real_dev/web/src/ui/useActionFeedback.ts`, `real_dev/web/src/lib/mf5FormValidators.ts` nem `real_dev/web/src/lib/mf5ErrorMessages.ts`.
- Expected: depois de implementar a sequencia MF5, `real_dev/web` deve conter os contratos transversais prescritos pelos BKs.
- Observed: os contratos existem nos guias, mas ainda nao estao aplicados no codigo real desta checkout.
- Impacto pedagogico: baixo para auditoria documental, medio para execucao real futura.
- Impacto tecnico: nao e possivel executar `npm run test:mf5:errors` porque o comando nem sequer esta definido.
- Causa provavel: MF5 esta a ser auditada/hidratada antes da implementacao real completa.
- Correcao recomendada: tratar numa execucao propria de implementacao/correcao em `real_dev`.

#### MF5-AUD-20260620-BK06-F06

- BK/RF/RNF afetado: documentacao de stack vs prompt ativa
- Severidade: `P3`
- Estado nesta execucao: `BLOQUEADO_POR_SCOPE`
- Tipo: drift documental de caminhos
- Evidencia objetiva: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` ainda descreve `apps/api` e `apps/web` como estrutura indicativa, enquanto a prompt ativa define `IMPLEMENTATION_ROOT=real_dev` e o BK alvo usa `real_dev/web`.
- Expected: a auditoria deve explicitar a tensao quando documento canonico antigo e prompt ativa usam raizes diferentes.
- Observed: o BK alvo esta alinhado com a prompt desta execucao; o contrato de stack continua a preservar a decisao antiga de `apps/`.
- Impacto: baixo no BK alvo, mas cria risco de reintroduzir caminhos `apps/` em futuras correcoes.
- Causa provavel: evolucao do fluxo de trabalho para `real_dev` sem atualizacao global do contrato de stack.
- Correcao recomendada: numa execucao propria de manutencao documental, decidir se `CONTRATO-STACK-IMPLEMENTACAO.md` deve reconhecer `real_dev` como raiz ativa e `apps/` como referencia/legado.

### Decisoes tecnicas e de dominio confirmadas

- `CANONICO`: `RNF06` exige mensagens de erro claras e com indicacao de resolucao.
- `CANONICO`: `BK-MF5-06` pertence a `MF5`, tem prioridade `P0`, owner `Andre`, apoio `Oleksii`, sprint `S09-S10`, esforco `M`, `core_or_reforco=Reforco`, requisito `RNF06` e `proximo_bk=BK-MF5-07`.
- `CANONICO`: `BACKLOG-MVP.md` e `MATRIZ-CANONICA-BK.md` confirmam a sequencia `BK-MF5-05 -> BK-MF5-06 -> BK-MF5-07`.
- `CANONICO`: validacao frontend e mensagens de UI nao substituem validacao backend, contexto multiempresa, permissoes, ownership, periodos fiscais ou auditoria.
- `DERIVADO`: como `RNF06` e transversal de UX, a solucao pode viver em `real_dev/web` sem criar endpoints, modelos Prisma ou services backend novos.
- `DERIVADO`: o BK consome `formatMf5FormErrors` de `BK-MF5-05`, `StatusMessage` de `BK-MF5-04` e `useActionFeedback` de `BK-MF5-03`, ainda que as dependencias canonicas estejam como `-`.
- `DERIVADO`: mensagens de erro devem preservar causa tecnica controlada (`status`, `code`, `message`) e acrescentar proxima acao em PT-PT.
- `DERIVADO`: `test:mf5:errors` e `check-mf5-error-messages.mjs` sao a evidence textual minima para `RNF06`.

### Mapa de integracao da MF

| Item | Resultado |
| --- | --- |
| Ficheiros criados nesta execucao | Nenhum |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`; `docs/planificacao/guias-bk/MF5/BK-MF5-06-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md` |
| BKs editados nesta execucao | `BK-MF5-06` |
| Ficheiros previstos pelo BK alvo | `real_dev/web/src/lib/mf5ErrorMessages.ts`, `real_dev/web/src/App.tsx`, paginas MF1-MF4, smoke MF5 e `package.json` |
| Exports previstos pelo BK alvo | `UiErrorSource`, `UiErrorMessage`, `toUiValidationError`, `toUiErrorMessage`, `formatMf5ValidationUiError`, `formatUiError` |
| Imports consumidos de BKs anteriores | `formatMf5FormErrors` de `BK-MF5-05`; `StatusMessage`/`useActionFeedback` de BKs MF5 anteriores |
| Endpoints criados | Nenhum |
| DTOs/validators backend criados | Nenhum |
| Schemas/modelos criados | Nenhum |
| Services criados | Nenhum |
| Componentes/paginas frontend criados | Nenhum nesta execucao; o BK prescreve integracao em `OperationForm`, `ResourcePanel` e paginas dedicadas |
| Providers de IA criados ou usados | Nenhum |
| Regras de seguranca/autorizacao | Backend continua fonte de autenticacao, autorizacao, empresa ativa, ownership, validacao final e auditoria |
| Testes/checks esperados | `typecheck`, `test:mf5:forms`, `test:mf5:errors`, cenarios manuais positivos/negativos e regressao de paginas dedicadas |
| BKs seguintes dependentes | `BK-MF5-07`, por mensagens de erro que devem preservar performance e nao esconder falhas de carregamento |

### Coerencia MF anterior -> MF alvo -> MF seguinte

- `MF4 -> MF5`: coerente ao nivel documental. `MF4` entrega IA, auditoria, lembretes, tarefas e logs; `MF5` melhora experiencia e validacao de interface sem alterar contratos contabilisticos.
- `BK-MF5-05 -> BK-MF5-06`: coerente. O guia consome `formatMf5FormErrors` e formata erros API com `formatUiError` antes de os entregar ao feedback visual.
- `BK-MF5-06 -> BK-MF5-07`: coerente ao nivel documental. O guia prescreve `formatUiError`, `test:mf5:errors` e cobertura concreta das paginas dedicadas, que podem ser reutilizados nos estados de performance do BK seguinte.
- `MF5 -> MF6`: coerente no plano documental, desde que a futura correcao mantenha RNF06 como camada de UX e nao mova autorizacao/seguranca para o frontend.
- Coerencia com `real_dev`: parcial por implementacao pendente; ver finding `MF5-AUD-20260620-BK06-F05`.

### Validacao executada

| Comando/check | Resultado |
| --- | --- |
| Contagem de passos do BK alvo | `OK`; `rg -c "^### Passo "` devolveu `8` |
| Contagem de cenarios negativos do BK alvo | `OK`; `rg -c "^7\\. Cenário negativo/erro esperado\\."` devolveu `8` |
| Contagem de blocos de codigo do BK alvo | `OK`; `rg -c '^```'` devolveu `26` fences, equivalente a `13` blocos |
| Leitura dirigida do BK alvo | `OK`; inclui smoke proprio, integracao com `formatMf5FormErrors`, `catch` que formata tambem `ApiError` com `formatUiError` e passo 5 com codigo por ficheiro para MF1-MF4 |
| Consulta de `real_dev/web/src/lib/apiClient.ts` | `OK`; confirma `ApiError` com `status`, `code`, `message` e `credentials: "include"` |
| Consulta de `real_dev/web/src/App.tsx` | `DRIFT`; `formatError` ainda devolve `${error.code}: ${error.message}` e nao existe `formatUiError` |
| Consulta de `real_dev/web/package.json` | `DRIFT`; scripts MF5 ausentes, incluindo `test:mf5:errors` |
| Pesquisa de artefactos MF5 em `real_dev/web` | `DRIFT`; nao encontrados `opsaUi.tsx`, `useActionFeedback.ts`, `mf5FormValidators.ts`, `mf5ErrorMessages.ts` nem `test:mf5:*` |
| Pesquisa de termos internos e riscos em `docs/planificacao/guias-bk/MF5/*.md` | `OK`; comando saiu com codigo `1` por ausencia de matches |
| Pesquisa de padroes antigos no BK alvo | `OK`; comando saiu com codigo `1` por ausencia de `caught instanceof Error ? caught`, `formatPageError`, `toPageFeedbackError` e exemplo generico |
| `git diff --check` | `OK`; sem erros |
| `bash scripts/validate-planificacao.sh` | `OK tecnico`; `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `overall_pass=true`; `advisory_pass=false` por `outdated_docs` e checks legados de `guides_quality` |
| Advisory residual do BK alvo no validador legado | `BK-MF5-06`: `missing_handoff_proximo_bk_line`, `missing_pedagogic_or_operational_blocks`, `missing_or_placeholder_snippet`, `P0_minimos(step=56,neg=0)`; a contagem do validador legado nao reconhece a estrutura nova dos passos, mas o `overall_pass=true` confirma que e advisory |

### Bloqueios e TODOs restantes

- `TODO (BLOCKER)`: nenhum foi inserido no BK alvo.
- `CORRIGIDO`: o `catch` do passo 3 formata tambem `ApiError` com `formatUiError`.
- `CORRIGIDO`: o passo 5 tem codigo completo/substituicoes exatas para `mf1Pages.tsx`, `mf2Pages.tsx`, `mf3Pages.tsx` e `mf4Pages.tsx`.
- `BLOQUEADO_POR_SCOPE`: implementar os artefactos em `real_dev` fica fora desta execucao e deve ser tratado num modo de implementacao.
- `BLOQUEADO_POR_SCOPE`: alinhar a documentacao global de stack `apps/` vs `real_dev` fica fora do BK alvo.

### Resumo final para entrega

- MF processada: `MF5`
- BKs analisados: `1` (`BK-MF5-06`)
- Contagem antes desta execucao: `OK=0`, `PARCIAL=1`, `CRITICO=0`
- Contagem depois desta execucao: `OK=1`, `PARCIAL=0`, `CRITICO=0`
- BKs editados: `BK-MF5-06`
- Principais lacunas corrigidas nesta execucao: `ApiError` bruto no passo 3; exemplo generico do passo 5 substituido por codigo por ficheiro para MF1-MF4
- Decisoes tecnicas confirmadas: `ApiError` preserva `status`, `code`, `message`; frontend usa cookies com `credentials: "include"`; RNF06 pode ser resolvido no frontend sem novos endpoints
- Decisoes de dominio confirmadas: mensagens de erro sao camada de UX; backend mantem autoridade final em empresa ativa, permissoes, ownership, auditoria e persistencia
- Decisoes marcadas como `DERIVADO`: dependencia tecnica em `formatMf5FormErrors`, `StatusMessage` e `useActionFeedback`; smoke proprio `test:mf5:errors`; cobertura das paginas dedicadas MF1-MF4
- Drift documental encontrado: `CONTRATO-STACK-IMPLEMENTACAO.md` ainda fala em `apps/` enquanto prompt/BK atual usam `real_dev`; implementacao real ainda nao contem contratos MF5 prescritos
- Riscos restantes: implementacao MF5 pendente em `real_dev`; `CONTRATO-STACK-IMPLEMENTACAO.md` ainda usa caminhos `apps/`; validadores globais antigos continuam a emitir advisories de `guides_quality`
- Coerencia MF anterior -> MF alvo -> MF seguinte: coerente ao nivel documental; o handoff com `BK-MF5-05` existe e o `BK-MF5-07` recebe contratos claros de mensagens de erro
- Verificacoes textuais executadas: contagem de passos, negativos e blocos de codigo; pesquisa de termos proibidos; leitura dirigida do BK alvo; consulta de `apiClient.ts`, `App.tsx`, `package.json` e pesquisa de artefactos MF5 em `real_dev`
- Resultado de `git diff --check`: `OK`
- Resultado de `bash scripts/validate-planificacao.sh`: `overall_pass=true`; `advisory_pass=false` por `outdated_docs` e checks legados de `guides_quality`, incluindo advisories para `BK-MF5-06`
- Bloqueios ou TODOs restantes: `BLOQUEADO_POR_SCOPE` para implementacao MF5 em `real_dev` e alinhamento documental global de caminhos

## Execucao anterior preservada - BK-MF5-05

> Esta seccao preserva o conteudo ja existente no relatorio antes desta auditoria ao `BK-MF5-06`.

### Escopo desta execucao anterior

- Projeto: `OPSA`
- MF processada: `MF5`
- BK alvo: `BK-MF5-05`
- Modo: `auditar_apenas`
- Implementation root consultado: `real_dev`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- Findings selecionados: nenhum filtro explicito; reauditoria do BK alvo.
- Severidades consideradas: `P0`, `P1`, `P2`, `P3`
- Incluir P3: sim.
- Output: `relatorio_e_resumo`
- Strict scope: ativo.
- BKs editados nesta execucao: nenhum.
- Relatorios editados nesta execucao: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
- Codigo de implementacao editado: nenhum.
- `apps/`, `mockup/`, RF/RNF, matriz, backlog, sprints, BKs e restantes documentos canonicos editados: nenhum.
- Commits: nao executados, conforme `PERMITIR_COMMITS=nao`.

### Documentos e fontes consultadas

- Prompt anexada desta execucao.
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
- Todos os BKs de `docs/planificacao/guias-bk/MF5/`, com foco em `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-05` e `BK-MF5-06`.
- Consulta estrutural aos BKs de `MF0`, `MF1`, `MF2`, `MF3` e `MF4` para comparar padrao de passos, handoff e densidade pedagogica.
- `real_dev/web/package.json`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/mf1Pages.tsx`
- `real_dev/web/src/pages/mf2Pages.tsx`
- `real_dev/web/src/pages/mf3Pages.tsx`
- `real_dev/web/src/pages/mf4Pages.tsx`
- `real_dev/api/src/modules/*/*Validators.js`, por pesquisa estatica direcionada.
- `real_dev/api/prisma/schema.prisma`, apenas para confirmar entidades e campos ja existentes.

### Resumo executivo

O `BK-MF5-05` foi reauditado em modo `auditar_apenas` e, no estado atual do ficheiro, esta `OK` como guia documental para alunos. Nao foram necessarias alteracoes ao BK: a versao atual tem 8 passos, 8 cenarios negativos, 9 blocos de codigo, validadores frontend completos, datas ISO com roundtrip, separacao entre `vatRateId`, `vatRateBps` e `vatRatePercent`, integracao compativel com `action.fail(error: Error, fallback?)` e smoke proprio `test:mf5:forms`.

A execucao anterior registada neste relatorio era de correcao. Esta execucao substitui o escopo operacional por auditoria apenas e confirma que os findings documentais principais ja se encontram resolvidos no BK atual. O risco que permanece e de implementacao: `real_dev/web` ainda nao contem os artefactos prescritos pela MF5 (`src/ui/opsaUi.tsx`, `src/ui/useActionFeedback.ts`, `src/lib/mf5FormValidators.ts`, `scripts/check-mf5-form-validation.mjs` e scripts `test:mf5:*`). Como o modo atual nao permite implementacao nem correcao de BKs, esse ponto fica registado como `BLOQUEADO_POR_SCOPE`.

| Escopo auditado | OK | PARCIAL | CRITICO | DRIFT/OUT_OF_SCOPE |
| --- | ---: | ---: | ---: | ---: |
| `BK-MF5-05` | 1 | 0 | 0 | 0 |
| Coerencia guia -> `real_dev` atual | 0 | 0 | 0 | 1 |

### Inventario do BK alvo

| Campo | Valor |
| --- | --- |
| BK | `BK-MF5-05` |
| Titulo | Os formularios devem validar erros antes de submissao (NIF, IBAN, datas, IVA, contas SNC) |
| RF/RNF | `RNF05` |
| Prioridade | `P0` |
| Owner | `Oleksii` |
| Apoio | `Pedro` |
| Sprint | `S09-S10` |
| Dependencias canonicas | `-` |
| Dependencias tecnicas derivadas no guia | `BK-MF5-03` por `useActionFeedback`; `BK-MF5-04` por feedback acessivel |
| BK anterior na MF | `BK-MF5-04` |
| BK seguinte | `BK-MF5-06` |
| Tipo de entrega | Frontend transversal / validacao previa de formularios |
| Entidades Prisma | Nao aplicavel para o BK; consulta estrutural confirma campos relacionados em modelos anteriores |
| Endpoints novos | Nenhum |
| DTOs/validators backend novos | Nenhum; backend existente continua autoridade final |
| Utilitarios previstos | `mf5FormValidators.ts`, `validateMf5Form`, `validateMf5FormData`, `formatMf5FormErrors` |
| Scripts previstos | `real_dev/web/scripts/check-mf5-form-validation.mjs`, `test:mf5:forms` |
| Estado documental nesta auditoria | `OK` |

### Criterios aplicados

- `OK`: o guia permite implementacao autonoma, segura e testavel por alunos, com estrutura completa, codigo integrado, validacao e handoff.
- `PARCIAL`: o guia tem boa orientacao, mas deixa decisoes, imports, ficheiros, passos, validacoes ou explicacoes essenciais por fechar.
- `CRITICO`: a lacuna impede implementacao autonoma ou cria risco relevante de seguranca, integridade, dominio, fiscalidade, contabilistica ou execucao da app.
- `DRIFT/OUT_OF_SCOPE`: incoerencia observada fora do BK alvo ou entre guia prescritivo e implementacao real atual, sem permissao de correcao nesta execucao.

### Classificacao do BK alvo

| BK | Estado antes desta execucao | Estado apos esta execucao | Evidencia |
| --- | --- | --- | --- |
| `BK-MF5-05` | `OK` | `OK` | Guia tem 8 passos, 8 negativos, validadores completos, roundtrip ISO, separacao correta de IVA, contrato `Error` no feedback, smoke `test:mf5:forms`, criterios de aceite, validacao final, evidence, handoff e changelog. |

### Findings

### MF5-AUD-20260620-BK05-F01

- BK/RF/RNF afetado: `BK-MF5-05` / `RNF05`
- Severidade: `P1`
- Estado nesta auditoria: `JA_CORRIGIDO`
- Tipo: qualidade pedagogica / contrato P0
- Evidencia objetiva: o BK atual tem `8` passos (`Passo 1` a `Passo 8`) e `8` cenarios negativos.
- Expected: BK `P0` deve ter roteiro autonomo, passos suficientes e negativos suficientes.
- Observed: o guia cumpre o minimo e inclui inventario, fronteira backend/frontend, validadores, integracao generica, integracao dedicada, smoke e evidence.
- Impacto: sem acao nesta execucao.
- Causa provavel historica: lacuna resolvida por correcao documental anterior.
- Correcao recomendada: nenhuma no modo atual.

### MF5-AUD-20260620-BK05-F02

- BK/RF/RNF afetado: `BK-MF5-05`, `BK-MF5-03` / `RNF03`, `RNF05`
- Severidade: `P1`
- Estado nesta auditoria: `JA_CORRIGIDO`
- Tipo: integracao entre BKs / executabilidade TypeScript
- Evidencia objetiva: o guia usa `action.fail(new Error(formatMf5FormErrors(validationErrors)))`.
- Expected: o BK deve respeitar o contrato derivado de `BK-MF5-03`, onde o feedback recebe `Error`.
- Observed: o codigo documentado respeita esse contrato.
- Impacto: sem acao nesta execucao.
- Causa provavel historica: desalinhamento resolvido por correcao documental anterior.
- Correcao recomendada: manter o contrato e nao regressar a texto solto em `action.fail`.

### MF5-AUD-20260620-BK05-F03

- BK/RF/RNF afetado: `BK-MF5-05` / `RNF05`
- Severidade: `P1`
- Estado nesta auditoria: `JA_CORRIGIDO`
- Tipo: validacao de datas
- Evidencia objetiva: `validateIsoDate` usa regex `YYYY-MM-DD`, `Date.UTC` e compara `toISOString().slice(0, 10)` com o valor original.
- Expected: datas impossiveis, como `2026-02-30`, devem falhar antes da submissao.
- Observed: o guia ensina roundtrip ISO e evita normalizacao silenciosa do JavaScript.
- Impacto: sem acao nesta execucao.
- Causa provavel historica: validacao demasiado permissiva resolvida por correcao documental anterior.
- Correcao recomendada: manter a regra de roundtrip ISO.

### MF5-AUD-20260620-BK05-F04

- BK/RF/RNF afetado: `BK-MF5-05` / `RNF05`
- Severidade: `P1`
- Estado nesta auditoria: `JA_CORRIGIDO`
- Tipo: mapeamento de campos / dominio IVA
- Evidencia objetiva: o guia distingue `vatRateId`, `vatRateBps` e `vatRatePercent`, com validadores separados.
- Expected: identificador de taxa, basis points e percentagem visual nao podem ser tratados como o mesmo campo.
- Observed: `validateKnownId`, `validateVatBps` e `validateVatPercent` aparecem como contratos separados.
- Impacto: sem acao nesta execucao.
- Causa provavel historica: risco de validacao por substring resolvido por correcao documental anterior.
- Correcao recomendada: manter listas explicitas de campos e evitar heuristicas por nome parcial.

### MF5-AUD-20260620-BK05-F05

- BK/RF/RNF afetado: `BK-MF5-05` / `RNF05`
- Severidade: `P2`
- Estado nesta auditoria: `JA_CORRIGIDO`
- Tipo: validacao automatizada / evidence
- Evidencia objetiva: o guia cria `real_dev/web/scripts/check-mf5-form-validation.mjs` e adiciona `"test:mf5:forms": "node scripts/check-mf5-form-validation.mjs"`.
- Expected: `RNF05` deve ter comando de evidence claro.
- Observed: o BK inclui smoke textual proprio e output esperado `MF5 form validation smoke OK`.
- Impacto: sem acao nesta execucao.
- Causa provavel historica: ausencia de smoke proprio resolvida por correcao documental anterior.
- Correcao recomendada: implementar o script quando a equipa entrar em modo de implementacao.

### MF5-AUD-20260620-BK05-F06

- BK/RF/RNF afetado: coerencia `BK-MF5-01..BK-MF5-05` vs `real_dev/web`
- Severidade: `P3`
- Estado nesta auditoria: `BLOQUEADO_POR_SCOPE`
- Tipo: guia prescritivo vs implementacao real atual
- Evidencia objetiva: pesquisa em `real_dev/web` mostra funcoes locais `PageFrame` em `mf1Pages.tsx`, `mf2Pages.tsx`, `mf3Pages.tsx` e `mf4Pages.tsx`; nao foram encontrados `src/ui/opsaUi.tsx`, `src/ui/useActionFeedback.ts`, `src/lib/mf5FormValidators.ts`, `scripts/check-mf5-form-validation.mjs` nem `test:mf5:forms` em `real_dev/web/package.json`.
- Expected: depois de implementar a sequencia MF5, `real_dev/web` deve conter os contratos transversais prescritos pelos BKs.
- Observed: os contratos existem no guia, mas ainda nao estao aplicados no codigo real desta checkout.
- Impacto pedagogico: baixo para o guia, porque o BK e prescritivo; medio para a execucao real, porque a equipa ainda nao consegue validar `npm run test:mf5:forms`.
- Impacto tecnico: a app real nao esta no estado final descrito pela MF5.
- Causa provavel: MF5 foi hidratada/corrigida como guia antes de ser implementada em `real_dev`.
- Correcao recomendada: executar um modo de implementacao/correcao em `real_dev` para aplicar `BK-MF5-01` a `BK-MF5-05` por ordem.

### MF5-AUD-20260620-BK05-F07

- BK/RF/RNF afetado: documentacao de stack vs prompt ativa
- Severidade: `P3`
- Estado nesta auditoria: `BLOQUEADO_POR_SCOPE`
- Tipo: drift documental de caminhos
- Evidencia objetiva: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` ainda descreve `apps/api` e `apps/web` como estrutura indicativa enquanto a prompt ativa desta execucao define `IMPLEMENTATION_ROOT=real_dev` e o BK alvo usa `real_dev/web`.
- Expected: os relatórios devem explicitar a tensao quando documento canonico antigo e prompt ativa usam raizes diferentes.
- Observed: o BK alvo esta alinhado com a prompt desta execucao; o contrato de stack continua a preservar a decisao antiga de `apps/`.
- Impacto: baixo no BK alvo, mas cria risco de reintroduzir caminhos `apps/` em futuras correcoes.
- Causa provavel: evolucao do fluxo de trabalho para `real_dev` sem atualizacao global do contrato de stack.
- Correcao recomendada: numa execucao propria de manutencao documental, decidir se `CONTRATO-STACK-IMPLEMENTACAO.md` deve reconhecer `real_dev` como raiz ativa e `apps/` como referencia/legado.

### Decisoes tecnicas e de dominio confirmadas

- `CANONICO`: `RNF05` exige que formularios validem erros antes de submissao, incluindo NIF, IBAN, datas, IVA e contas SNC.
- `CANONICO`: `BK-MF5-05` pertence a `MF5`, tem prioridade `P0`, owner `Oleksii`, apoio `Pedro`, sprint `S09-S10`, esforco `M`, `core_or_reforco=Reforco`, requisito `RNF05` e `proximo_bk=BK-MF5-06`.
- `CANONICO`: `BACKLOG-MVP.md` e `MATRIZ-CANONICA-BK.md` confirmam a sequencia `BK-MF5-04 -> BK-MF5-05 -> BK-MF5-06`.
- `CANONICO`: validacao frontend nao substitui validacao backend, contexto multiempresa, permissoes, ownership, periodos fiscais ou auditoria.
- `DERIVADO`: como `RNF05` e transversal de UX, a solucao pode viver em `real_dev/web` sem criar endpoints, modelos Prisma ou services backend novos.
- `DERIVADO`: `BK-MF5-05` deve consumir `useActionFeedback` dos BKs MF5 anteriores com tipos coerentes.
- `DERIVADO`: validadores frontend devem ser por contrato explicito de campo, nao por substring generica.

### Mapa de integracao da MF

| Item | Resultado |
| --- | --- |
| Ficheiros criados nesta execucao | Nenhum |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`; `docs/planificacao/guias-bk/MF5/BK-MF5-06-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md` |
| BKs editados nesta execucao | `BK-MF5-06` |
| Ficheiros previstos pelo BK alvo | `real_dev/web/src/lib/mf5FormValidators.ts`, `real_dev/web/src/App.tsx`, paginas MF1-MF4, smoke MF5 e `package.json` |
| Exports produzidos pelo BK alvo | `FieldValidationError`, `PrimitiveValidationValue`, `validateNif`, `validatePortugueseIban`, `validateIsoDate`, `validateVatBps`, `validateVatPercent`, `validateKnownId`, `validateSncAccount`, `toPrimitiveValidationValues`, `validateMf5Field`, `validateMf5Form`, `validateMf5FormData`, `formatMf5FormErrors` |
| Imports consumidos de BKs anteriores | `useActionFeedback` de `BK-MF5-03`; `StatusMessage`/padroes acessiveis de `BK-MF5-04` via sequencia MF5 |
| Endpoints criados | Nenhum |
| DTOs/validators backend criados | Nenhum |
| Schemas/modelos criados | Nenhum |
| Services criados | Nenhum |
| Componentes/paginas frontend criados | Nenhum nesta execucao; o BK prescreve integracao em `OperationForm` e paginas MF1-MF4 |
| Providers de IA criados ou usados | Nenhum |
| Regras de seguranca/autorizacao | Backend continua fonte de autenticacao, autorizacao, empresa ativa, ownership, validacao final e auditoria |
| Testes/checks previstos pelo BK | `typecheck`, `test:mf5:forms` e cenarios manuais positivos/negativos |
| BKs seguintes dependentes | `BK-MF5-06`, por mensagens de erro claras; `BK-MF5-07`, por evitar validacoes locais caras ou falsas |

### Coerencia MF anterior -> MF alvo -> MF seguinte

- `MF4 -> MF5`: coerente ao nivel documental. `MF4` entrega IA, auditoria, lembretes, tarefas e logs; `MF5` melhora experiencia e validacao de interface sem alterar contratos contabilisticos.
- `BK-MF5-04 -> BK-MF5-05`: coerente no guia. O BK alvo consome feedback imediato e mensagens acessiveis sem redefinir o BK anterior.
- `BK-MF5-05 -> BK-MF5-06`: coerente no guia. O BK alvo centraliza `formatMf5FormErrors`, que pode ser refinado no BK seguinte.
- `MF5 -> MF6`: coerente no plano documental. A validacao local fica barata e explicita, sem invadir performance/seguranca de MF6.
- Coerencia com `real_dev`: parcial por implementacao pendente; ver finding `MF5-AUD-20260620-BK05-F06`.

### Validacao executada

| Comando/check | Resultado |
| --- | --- |
| Leitura estrutural Node do BK alvo | `OK`; `steps=8`, `negatives=8`, `codeBlocks=9`, `hasStrictDate=true`, `hasActionError=true`, `hasVatBps=true`, `hasKnownId=true`, `hasSmoke=true`, `hasChangelog=true` |
| Pesquisa de termos internos e riscos em `docs/planificacao/guias-bk/MF5/*.md` | `OK`; sem matches para os padroes proibidos da prompt |
| Pesquisa de artefactos MF5 em `real_dev/web` | `DRIFT`; encontrados `PageFrame` locais, nao encontrados `opsaUi.tsx`, `useActionFeedback.ts`, `mf5FormValidators.ts` nem `test:mf5:forms` |
| `git diff --check` | `OK`; sem erros |
| `bash scripts/validate-planificacao.sh` | `OK tecnico`; `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `overall_pass=true`; `advisory_pass=false` por `outdated_docs` e checks legados de `guides_quality` |
| Advisory residual do BK alvo no validador legado | `BK-MF5-05`: `missing_pedagogic_or_operational_blocks` e `missing_or_placeholder_snippet`; nao foi corrigido porque o guia atual segue a estrutura nova da prompt e o modo e `auditar_apenas` |

### Bloqueios e TODOs restantes

- `TODO (BLOCKER)`: nenhum no guia BK alvo.
- `BLOQUEADO_POR_SCOPE`: implementar os artefactos em `real_dev` fica fora desta execucao e deve ser tratado num modo de implementacao.
- `BLOQUEADO_POR_SCOPE`: alinhar a documentacao global de stack `apps/` vs `real_dev` fica fora do BK alvo.

### Resumo final para entrega

- MF processada: `MF5`
- BKs analisados: `1` (`BK-MF5-05`)
- Contagem antes desta execucao: `OK=1`, `PARCIAL=0`, `CRITICO=0`
- Contagem depois desta execucao: `OK=1`, `PARCIAL=0`, `CRITICO=0`
- BKs editados: nenhum
- Principais lacunas corrigidas nesta execucao: nenhuma; auditoria confirmou que lacunas historicas ja estavam resolvidas no BK atual
- Decisoes tecnicas confirmadas: validadores frontend explicitos, roundtrip ISO, IVA separado por contrato, `Error` no feedback, smoke `test:mf5:forms`
- Decisoes de dominio confirmadas: validacao frontend e ajuda de UX; backend mantem autoridade final em empresa ativa, permissoes, ownership, auditoria e persistencia
- Decisoes marcadas como `DERIVADO`: solucao frontend sem novos endpoints/modelos; consumo de contratos MF5 anteriores; validacao por campo explicito
- Drift documental encontrado: `CONTRATO-STACK-IMPLEMENTACAO.md` ainda fala em `apps/` enquanto prompt/BK atual usam `real_dev`; implementacao real ainda nao contem contratos MF5 prescritos
- Riscos restantes: implementacao MF5 pendente em `real_dev`; validadores globais antigos continuam a emitir advisories historicos, incluindo `BK-MF5-05`
- Coerencia MF anterior -> MF alvo -> MF seguinte: coerente no plano documental, parcial contra `real_dev` por implementacao pendente
- Verificacoes textuais executadas: leitura estrutural Node, pesquisa de termos proibidos, pesquisa de artefactos MF5 em `real_dev`
- Resultado de `git diff --check`: `OK`
- Resultado de `bash scripts/validate-planificacao.sh`: `overall_pass=true`; `advisory_pass=false` por divida/validador legado fora do scope
- Bloqueios ou TODOs restantes: `BLOQUEADO_POR_SCOPE` para implementacao MF5 e alinhamento documental global de caminhos
