# AUDITORIA-HIDRATACAO-MF6

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF6`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- `area`: `planificacao/guias-bk`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-06-23`

## Execução atual - auditoria final MF6-AUD-20260623-FINAL-A01

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs analisados: todos os 10 BKs oficiais da `MF6`
- BKs corrigidos: nenhum, conforme `MODO=auditar_apenas`
- Modo: `auditar_apenas`
- Prompt executada: `MF_ALVO=MF6`, `BK_IDS=[]`, `IMPLEMENTATION_ROOT=real_dev`, `REFERENCE_IMPLEMENTATION_BASELINE=MF0..MF_ALVO-1`, `TARGET_MF_IMPLEMENTATION_STATUS=not_assumed`, `OUTPUT_MODE=relatorio_e_resumo`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`
- Raiz canónica escrita nos BKs dos alunos: `apps/api`, `apps/web` e `apps/api/prisma/schema.prisma`
- `real_dev/`: consultado apenas como referência interna para baseline até `MF5`; não foi editado e não foi assumido como implementação canónica da `MF6`
- Código de implementação em `apps/`: não editado
- Relatório atualizado: este ficheiro
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos 10 BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta execução preservou esse estado e acrescentou apenas esta secção ao relatório.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF6/`
- Leitura dirigida de BKs anteriores relevantes: `BK-MF2-03`, `BK-MF3-03`, `BK-MF4-09` e `BK-MF5-07`
- Leitura dirigida de `MF7` como MF seguinte imediata, com foco em `BK-MF7-01`
- Relatórios de auditoria/hidratação e implementação existentes em `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-*.md`, `IMPLEMENTACAO-REAL_DEV-MF*.md` e `AUDITORIA-IMPLEMENTACAO-real_dev-MF*.md`
- Implementação de referência até `MF5` em `real_dev/api`, `real_dev/web` e `real_dev/api/prisma/schema.prisma`, apenas para confirmar módulos, nomes e contratos já existentes

### Resumo executivo

A auditoria atual confirma que os 10 BKs da `MF6` estão `OK` no estado atual do checkout. Todos usam a estrutura tutorial moderna exigida pela prompt, mantêm caminhos canónicos `apps/...`, têm passos técnicos com os pontos 1 a 7, incluem validação por passo, cenários negativos, critérios de aceite, evidence, handoff e changelog.

Não foram confirmados findings ativos dentro da `MF6`. As hipóteses históricas já registadas no relatório foram revalidadas como resolvidas: `BK-MF6-01` tem JSDoc nos handlers críticos, `BK-MF6-09` já não torna `SESSION_SIGNING_KEY` obrigatório sem consumidor e `BK-MF6-10` já normaliza chaves proibidas como `rawpayload` e `documentlines`.

Foram, no entanto, confirmados drifts documentais fora do alvo estrito: o README/template global dos BKs ainda descreve contrato editorial antigo e caminhos internos, vários BKs da `MF3` ainda expõem `real_dev/...`, e a `MF7` continua no formato antigo de blocos pedagógico/operacional/snippet. Estes drifts não bloqueiam a classificação dos BKs da `MF6`, porque os BKs alvo já convertem a raiz interna para `apps/...`, mas devem ser tratados em execuções próprias.

### Resultado antes e depois desta auditoria

| Métrica | Estado imediatamente antes da auditoria atual | Estado após auditoria atual |
| --- | ---: | ---: |
| BKs analisados | 10 | 10 |
| OK | 10 | 10 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

### Inventário dos BKs alvo

| BK | RNF/RF | Prioridade | Owner | Apoio | Estado atual | Motivo |
| --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `P0` | `Oleksii` | `Andre` | `OK` | mede inserções críticas, mantém JSDoc nos handlers, preserva `req.companyId` e evidence de performance sem expor dados financeiros |
| `BK-MF6-02` | `RNF09` | `P1` | `Sofia` | `Pedro` | `OK` | cobre 25 utilizadores simultâneos por empresa, baseline, limite de degradação, carga local e negativos |
| `BK-MF6-03` | `RNF10` | `P1` | `Oleksii` | `Pedro` | `OK` | reforça reconciliação como sugestão, limita candidatos, devolve resposta parcial honesta e mantém empresa ativa no backend |
| `BK-MF6-04` | `RNF11`, `RF25` | `P1` | `Andre` | `Oleksii` | `OK` | preserva FIFO de `MF2`, mede custo, separa cálculo consultivo de gravação e não troca FIFO por média ponderada |
| `BK-MF6-05` | `RNF12` | `P0` | `Andre` | `Oleksii` | `OK` | cobre HTTPS/TLS via middleware, proxy e smoke textual sem prometer infraestrutura externa não documentada |
| `BK-MF6-06` | `RNF13` | `P0` | `Andre` | `Pedro` | `OK` | cobre bcrypt, salt, registo, reset, login, teste unitário e ausência de exposição de password no frontend |
| `BK-MF6-07` | `RNF14` | `P0` | `Oleksii` | `Andre` | `OK` | cobre cookies HttpOnly, Secure, SameSite e cliente API com `credentials: "include"` sem tokens em storage |
| `BK-MF6-08` | `RNF15` | `P0` | `Oleksii` | `Andre` | `OK` | cobre origem, rate limit, validação antes de Prisma, anti-injection e negativos de segurança |
| `BK-MF6-09` | `RNF16` | `P0` | `Pedro` | `Andre` | `OK` | obriga apenas `DATABASE_URL`, mantém `.env.example` seguro e explica que novas chaves só entram quando houver adapter consumidor |
| `BK-MF6-10` | `RNF17`, `RF47` | `P0` | `Oleksii` | `Sofia` | `OK` | reforça auditoria sensível sobre `AuditLog`, bloqueia detalhes perigosos normalizados e integra permissões, períodos e documentos |

### Findings confirmados nesta auditoria

Não há findings ativos novos dentro da `MF6`.

### Findings históricos revalidados

#### MF6-AUD-20260623-FINAL-H01

- BK/RF/RNF afetado: `BK-MF6-01` / `RNF08`
- Severidade original: `P3`
- Estado do finding: `JA_CORRIGIDO`
- Evidência objetiva:
  - `BK-MF6-01:240` a `246` documenta com JSDoc o handler de criação de venda.
  - `BK-MF6-01:306` a `312` documenta com JSDoc o handler de criação de compra.
  - `BK-MF6-01:341` a `347` documenta com JSDoc o handler de lançamento manual.
- Expected: handlers críticos de route apresentados como código final devem ter JSDoc.
- Observed: os três handlers têm JSDoc, comentários didáticos e explicação externa.
- Impacto: a lacuna histórica de documentação formal ficou resolvida antes desta execução.

#### MF6-AUD-20260623-FINAL-H02

- BK/RF/RNF afetado: `BK-MF6-09` / `RNF16`
- Severidade original: `P2`
- Estado do finding: `JA_CORRIGIDO`
- Evidência objetiva:
  - `BK-MF6-09:154` define `requiredVariables = ["DATABASE_URL"]`.
  - `BK-MF6-09:174` a `185` devolve apenas `databaseUrl` e `appBaseUrl`.
  - `BK-MF6-09:217` a `224` mostra `.env.example` sem segredo obrigatório não consumido e explica que novas chaves só entram com adapter correspondente.
- Expected: variáveis obrigatórias devem ser consumidas pelo fluxo apresentado.
- Observed: `SESSION_SIGNING_KEY` não aparece no BK alvo e não fica como requisito obrigatório.
- Impacto: o guia evita segredo operacional sem função real.

#### MF6-AUD-20260623-FINAL-H03

- BK/RF/RNF afetado: `BK-MF6-10` / `RNF17`, `RF47`
- Severidade original: `P1`
- Estado do finding: `JA_CORRIGIDO`
- Evidência objetiva:
  - `BK-MF6-10:161` a `169` guarda `rawpayload` e `documentlines` já normalizados.
  - `BK-MF6-10:189` a `194` normaliza cada chave recebida com `key.toLowerCase()` antes de consultar `FORBIDDEN_DETAIL_KEYS`.
- Expected: chaves proibidas devem usar a mesma normalização.
- Observed: a validação bloqueia credenciais, headers e payloads completos em qualquer capitalização relevante.
- Impacto: o guia já protege logs de auditoria contra payloads completos e linhas financeiras.

### Mapa de integração da MF

| BK | Ficheiros criados/editados pelo guia | Exports/contratos produzidos | Contratos consumidos | Segurança/domínio aplicado | BK seguinte dependente |
| --- | --- | --- | --- | --- | --- |
| `BK-MF6-01` | performance de documentos e routes de vendas/compras/lançamentos | `measureDocumentInsert`, cabeçalhos `X-OPSA-Duration-Ms` e `X-OPSA-Within-Budget` | services de vendas, compras e contabilidade | empresa ativa no backend, validação de domínio, privacidade dos headers | `BK-MF6-02` |
| `BK-MF6-02` | script de carga e package API | executor local de 25 sessões e baseline | sessão, endpoints autenticados e performance MF5 | carga controlada sem alterar dados financeiros | `BK-MF6-03` |
| `BK-MF6-03` | performance de reconciliação, service, route e smoke | `suggestReconciliations`, orçamento de 3 segundos, estado `partial` | extratos, recebimentos, pagamentos e tesouraria | sugestão sem confirmação automática, empresa no backend | `BK-MF6-04` |
| `BK-MF6-04` | performance FIFO, service FIFO e smoke | `measureFifoCost`, `assertStockAvailability`, preview consultivo | FIFO de `BK-MF2-03`, movimentos de stock | FIFO correto, stock suficiente, sem média ponderada | `BK-MF6-05` |
| `BK-MF6-05` | middleware HTTPS, servidor e smoke | enforcement HTTPS/TLS em produção simulada | Express, proxy e cliente API | bloqueio de transporte inseguro sem expor dados | `BK-MF6-06` |
| `BK-MF6-06` | helper bcrypt, auth service, reset e teste | `hashPassword`, `verifyPassword` | auth MF0 e reset password | hash bcrypt, resposta anti-enumeração, sem password no frontend | `BK-MF6-07` |
| `BK-MF6-07` | cookie helper, auth controller, API client e smoke | cookies HttpOnly/Secure/SameSite e `credentials: "include"` | login/logout e contexto de sessão | sem tokens em storage, sessão server-side | `BK-MF6-08` |
| `BK-MF6-08` | hardening global, origem, rate limit e smoke | proteção de origem, validação antes de Prisma | auth, sessão, validators e Prisma | anti-injection, CSRF/origem, brute force | `BK-MF6-09` |
| `BK-MF6-09` | `env.js`, `.env.example`, scanner e server | `loadEnv`, `check-mf6-env-safety` | configuração API e frontend | segredos fora do código, falha cedo, sem variável obrigatória sem consumidor | `BK-MF6-10` |
| `BK-MF6-10` | audit service, services críticos e smoke | `recordSensitiveAudit`, `check-mf6-audit-gate` | `recordAuditLog`, `AuditLog`, permissões, períodos, documentos | auditoria sensível, minimização de detalhes, transações críticas | `BK-MF7-01` |

### Decisões técnicas confirmadas

- `CANONICO`: `RNF08` a `RNF17` pertencem à `MF6` e mapeiam para `BK-MF6-01` a `BK-MF6-10`.
- `CANONICO`: `RF47` fundamenta auditoria de quem, quando e o quê em operações sensíveis.
- `CANONICO`: `RF25` continua a fundamentar FIFO; `RNF11` reforça performance/correção sem trocar o método.
- `CANONICO`: `RF33` continua a fundamentar importação/reconciliação; `RNF10` mede sugestão em até 3 segundos sem confirmação automática.
- `DERIVADO`: orçamentos locais e smokes textuais são evidência pedagógica mínima para alunos sem prometer benchmark de produção.
- `DERIVADO`: resposta parcial em reconciliação é preferível a bloquear a API ou inventar precisão quando o lote excede o orçamento.
- `DERIVADO`: `recordSensitiveAudit` é uma camada mínima sobre `recordAuditLog`, preservando o modelo `AuditLog` de `MF4`.
- `DERIVADO`: scanners textuais de credenciais/auditoria são gates didáticos e não substituem testes runtime nem revisão de segurança real.

### Decisões de domínio confirmadas

- Reconciliação bancária sugere correspondências; não confirma pagamentos, recebimentos ou lançamentos automaticamente.
- FIFO continua a ser First In, First Out; o BK não muda para média ponderada nem escolhe camada por conveniência de margem.
- Password não é token de sessão; `BK-MF6-06` trata hash, `BK-MF6-07` trata cookie de sessão.
- Operações sensíveis exigem auditoria, mas audit logs não devem guardar payloads completos, credenciais, headers, cookies ou linhas financeiras completas.
- Empresa ativa, ownership, role e permissões finais continuam resolvidos no backend; o frontend não decide empresa nem autorização final.

### Drift documental encontrado

- `DRIFT-GLOBAL-GUIAS-README`: `docs/planificacao/guias-bk/README.md:16` a `18` ainda define contrato editorial antigo com `Bloco pedagogico`, `Bloco operacional` e snippet obrigatório. Isto conflita com a estrutura tutorial moderna usada na `MF6`, mas não bloqueia os BKs alvo porque eles seguem a prompt atual.
- `DRIFT-GLOBAL-TEMPLATE-PATHS`: `docs/planificacao/guias-bk/_TEMPLATE-BK.md:54` e `79` a `80` ainda mencionam `real_dev/...` como caminho de guia. Isto deve ser corrigido em execução própria para evitar novas fugas em BKs futuros.
- `DRIFT-MF3-PRIVATE-PATHS`: vários BKs da `MF3`, incluindo `BK-MF3-03`, ainda usam caminhos `real_dev/...` em ficheiros a criar/editar e comentários de código. A `MF6` já usa `apps/...`, por isso o drift é contextual e fora do alvo desta execução.
- `DRIFT-MF7-ESTRUTURA`: `MF7` continua em formato antigo com blocos pedagógico/operacional/snippet. O handoff `BK-MF6-10 -> BK-MF7-01` é funcionalmente coerente, mas a continuidade pedagógica da MF seguinte precisa de auditoria/hidratação própria.
- `DRIFT-VALIDADOR-LEGADO`: `bash scripts/validate-planificacao.sh` mantém `advisory_pass=false` por critérios globais/legados, apesar de `overall_pass=true`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5 -> MF6`: coerente. `BK-MF5-07` prepara a disciplina de medição e `BK-MF6-01` aplica orçamento próprio de 1 segundo a documentos críticos.
- `MF6 interna`: coerente. A sequência passa de performance/carga para reconciliação, FIFO, transporte, passwords, sessão, hardening, segredos e auditoria sem duplicar endpoints ou trocar domínios.
- `MF6 -> MF7`: parcialmente coerente. `BK-MF6-10` prepara backups, retenção e exportações com auditoria e configuração segura, mas a `MF7` ainda precisa de hidratação para ficar no mesmo padrão pedagógico.

### Verificações executadas

- Pesquisa estrutural dos 10 BKs `MF6`:
  - Resultado: todos têm as 16 secções obrigatórias de `#### Objetivo` a `#### Changelog`.
  - Resultado: todos os passos verificados têm pontos `1` a `7`.
  - Resultado: blocos de código com 8+ e 20+ linhas cumprem comentários didáticos mínimos na análise textual executada.
- Pesquisa obrigatória de padrões de risco em `docs/planificacao/guias-bk/MF6/*.md`:
  - Resultado: ocorrências contextuais, sem finding novo.
  - `companyId` aparece como contexto backend autenticado (`req.companyId`, `input.companyId`, `context.companyId`) ou como exemplo negativo ignorado pela route.
  - `password`, `token` e `secret` aparecem no BK de bcrypt e na lista de chaves proibidas de auditoria, como esperado.
  - Não foram encontrados `payload: unknown`, `as any`, `localStorage`, `sessionStorage`, operações destrutivas largas nem claims indevidos de RAG/embeddings/OCR/SAF-T completo.
- `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: passou sem output.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`.
  - Nota: `advisory_pass=false` mantém advisories globais/preexistentes sobre contrato editorial legado, guias antigos e documentos globais desatualizados. Não foram tratados nesta execução por `STRICT_SCOPE=true`.

### Riscos restantes e TODOs

- Não ficam findings ativos dentro da `MF6`.
- Risco restante principal: fontes globais (`README`/template) e `MF3` ainda podem induzir novos BKs a usar estrutura antiga ou caminhos internos se forem usados sem a prompt endurecida.
- Risco de continuidade: `MF7` deve ser auditada/hidratada em execução própria antes de ser considerada continuidade pedagógica final.
- TODO fora do alvo: corrigir template/README global para refletir `apps/...`, estrutura tutorial moderna e proibição de `real_dev/` em guias dos alunos.
- TODO fora do alvo: limpar caminhos `real_dev/...` nos BKs antigos da `MF3`.

## Execução atual - correção completa MF6-AUD-20260623-FULL-F01

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs analisados: todos os 10 BKs oficiais da `MF6`, usando a auditoria completa mais recente como fonte de verdade.
- BKs corrigidos: `BK-MF6-01`
- Modo: `corrigir_apenas`
- Prompt executada: `MF_ALVO=MF6`, `BK_IDS=[]`, `FINDING_IDS=[]`, `FIX_SEVERITIES=P0,P1,P2,P3`, `INCLUIR_P3=sim`, `OUTPUT_MODE=relatorio_e_resumo`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`
- Fonte de findings: secção `Execução anterior registada - auditoria completa MF6`
- Finding corrigido: `MF6-AUD-20260623-FULL-F01`
- Código de implementação em `apps/`: não editado
- Raiz `real_dev/`: não editada e não referenciada nos BKs dos alunos
- BKs editados: `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md`
- Relatório atualizado: este ficheiro
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos 10 BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta correção preservou esse estado e limitou a nova alteração documental ao `BK-MF6-01` e a esta secção de relatório.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
- Secção `Execução anterior registada - auditoria completa MF6` neste relatório.
- `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md`
- Leitura dirigida da evidência de linhas do finding `MF6-AUD-20260623-FULL-F01`.

### Resumo executivo

A execução em modo `corrigir_apenas` fechou o único finding ativo da auditoria completa mais recente da `MF6`.

O `BK-MF6-01` estava `PARCIAL` apenas porque três handlers inline de routes críticas estavam completos e comentados, mas não tinham JSDoc formal. Foram adicionados blocos JSDoc antes dos handlers de criação de vendas, compras e lançamentos manuais, documentando responsabilidade, `req`, `res`, retorno `201`, erro via `sendError`, contexto autenticado, contrato JSON preservado e privacidade dos cabeçalhos de performance.

Depois da correção, os 10 BKs da `MF6` ficam documentalmente `OK` no âmbito desta auditoria. Não foram alterados endpoints, services, DTOs, modelos, regras de domínio, paths canónicos ou código de implementação.

### Resultado antes e depois desta correção

| Métrica | Estado antes da correção | Estado após correção |
| --- | ---: | ---: |
| BKs analisados | 10 | 10 |
| OK | 9 | 10 |
| PARCIAL | 1 | 0 |
| CRITICO | 0 | 0 |

### Inventário corrigido

| BK | RNF | Estado anterior | Estado após correção | Motivo |
| --- | --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `PARCIAL` | `OK` | recebeu JSDoc formal nos três handlers de route que medem inserção de venda, compra e lançamento manual |

### Findings tratados nesta correção

#### MF6-AUD-20260623-FULL-F01

- BK/RF/RNF afetado: `BK-MF6-01` / `RNF08`
- Severidade: `P3`
- Estado do finding: `CORRIGIDO`
- Evidência objetiva da correção:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md:240` a `246` documenta o handler de venda antes de `router.post("/")`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md:306` a `312` documenta o handler de compra antes de `router.post("/")`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md:341` a `347` documenta o handler de lançamento manual antes de `router.post("/")`.
- Expected: código final em routes/controllers críticas deve ter JSDoc nos elementos relevantes, incluindo responsabilidade, parâmetros, retorno, erros e regras de segurança/domínio.
- Observed após correção: os três handlers críticos têm JSDoc e mantêm comentários didáticos dentro do bloco.
- Impacto pedagógico resolvido: o aluno passa a ver o contrato formal de cada handler e a ligação entre performance, empresa ativa, payload validado pelo service e privacidade dos cabeçalhos.
- Impacto técnico resolvido: o guia cumpre a regra de JSDoc sem extrair handlers, sem alterar endpoints e sem introduzir nova abstração.
- Impacto de segurança/domínio: mantido; a documentação reforça que a empresa ativa vem do backend e que dados financeiros sensíveis não são expostos.

### Mapa de integração da MF

| BK editado | Ficheiros criados | Ficheiros editados no guia | Exports produzidos | Imports consumidos | Endpoints | Segurança/domínio preservados | BK seguinte dependente |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-01` | nenhum nesta correção | `apps/api/src/modules/sales/saleDocumentRoutes.js`, `apps/api/src/modules/purchases/purchaseDocumentRoutes.js`, `apps/api/src/modules/accounting/manualJournalRoutes.js` como blocos documentados no guia | nenhum novo | `measureDocumentInsert`, `toDocumentInsertLog` | `POST` de criação de venda, compra e lançamento manual já previstos no guia | `req.companyId`, `req.user.id`, `sendError`, cabeçalhos sem dados financeiros, services reais e validações de domínio | `BK-MF6-02` |

### Decisões confirmadas

- `CANONICO`: `RNF08` exige medição objetiva da inserção de documentos em até 1 segundo.
- `CANONICO`: a sequência `BK-MF5-07 -> BK-MF6-01 -> BK-MF6-02` permanece coerente.
- `DERIVADO`: manter handlers inline com JSDoc é suficiente para corrigir o finding sem criar uma abstração nova nem alterar o contrato das routes.
- `DERIVADO`: os cabeçalhos `X-OPSA-Duration-Ms` e `X-OPSA-Within-Budget` continuam a ser evidence controlada, não canal para dados financeiros.

### Drift documental encontrado

- `DRIFT-MF7-ESTRUTURA`: mantém-se fora do scope; `MF7` ainda deve ser auditada/hidratada em execução própria antes de ser considerada continuidade pedagógica final.
- `DRIFT-VALIDADOR-LEGADO`: mantém-se fora do scope; o validador continua a emitir advisories globais sobre blocos pedagógico/operacional e snippet em BKs já migrados.
- `DRIFT-DOCS-GLOBAIS`: mantém-se fora do scope; documentos globais continuam marcados como `outdated_docs` pelo validador.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5 -> MF6`: coerente. A disciplina de performance de `BK-MF5-07` continua a preparar a medição objetiva de inserções críticas em `BK-MF6-01`.
- `MF6 interna`: coerente. `BK-MF6-01` fica documentado e pode alimentar `BK-MF6-02` sem exigir adivinhação ao aluno.
- `MF6 -> MF7`: funcionalmente coerente no plano de contratos; pedagogicamente continua dependente de auditoria própria da `MF7`.

### Verificações executadas

- Pesquisa obrigatória de padrões de risco em `docs/planificacao/guias-bk/MF6/*.md`:
  - Resultado: ocorrências contextuais de `companyId`, `password`, `token` e `secret`, sem finding novo.
  - `companyId` aparece como contexto backend autenticado ou input interno de service, não como empresa escolhida pelo frontend.
  - `password`, `token` e `secret` aparecem no BK de bcrypt e no filtro de auditoria sensível, como esperado.
- `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: passou sem output.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`.
  - Nota: `advisory_pass=false` mantém advisories globais/preexistentes e regras legadas do validador; não bloqueia o estado `overall_pass=true`.

### Riscos restantes e TODOs

- Não ficam findings ativos da `MF6` dentro do scope desta correção.
- Persistem apenas drifts fora do alvo: estrutura antiga da `MF7`, advisories legados do validador e documentos globais marcados como desatualizados.
- Não foram executados testes runtime em `apps/`, porque a prompt proíbe editar `apps/` e a correção foi documental em guia BK.

## Execução anterior registada - auditoria completa MF6

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: todos os BKs oficiais da MF6 (`BK-MF6-01` a `BK-MF6-10`)
- Modo: `auditar_apenas`
- Prompt executada: `MF_ALVO=MF6`, `BK_IDS=[]`, `OUTPUT_MODE=relatorio_e_resumo`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`
- Raiz canónica dos BKs dos alunos: `apps/api` e `apps/web`
- `real_dev/`: consultado apenas como referência interna para baseline até `MF5`; não editado e não referenciado nos BKs dos alunos
- Código de implementação em `apps/`: não editado
- BKs editados: nenhum, conforme `MODO=auditar_apenas`
- Relatório atualizado: este ficheiro
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos 10 BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta execução preservou esse estado e acrescentou apenas esta secção ao relatório.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- `docs/planificacao/backlogs/ANEXO-RNF-PARA-BKS.md`
- `docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- Inventário estrutural dos BKs de `MF0` a `MF7`, com leitura dirigida dos contratos relevantes para `BK-MF0-01`, `BK-MF2-03`, `BK-MF3-03`, `BK-MF4-09`, `BK-MF4-10`, `BK-MF5-07`, `BK-MF6-01..BK-MF6-10` e `BK-MF7-01`.
- Implementação de referência até `MF5` em `real_dev/api`, `real_dev/web` e `real_dev/api/prisma/schema.prisma`, apenas para confirmar convenções, módulos, multiempresa, sessão, auditoria e contratos já existentes.
- Relatórios existentes `AUDITORIA-HIDRATACAO-MF5.md`, `AUDITORIA-HIDRATACAO-MF6.md` e relatórios de implementação/correção `real_dev` de `MF5`.

### Resumo executivo

A auditoria completa da `MF6` confirma que a macrofase está globalmente muito próxima de pronta: os 10 BKs usam a estrutura moderna exigida, mantêm caminhos `apps/...`, não têm fuga textual de `real_dev/`, cobrem `RNF08` a `RNF17` e preservam a sequência `BK-MF5-07 -> BK-MF6-01 -> ... -> BK-MF6-10 -> BK-MF7-01`.

O estado consolidado anterior do próprio relatório indicava a `MF6` como 10/10 `OK` após as correções faseadas. Com a prompt atual, a reavaliação completa baixa apenas o `BK-MF6-01` para `PARCIAL`: três blocos de route com handlers críticos de criação de documentos têm comentários didáticos e explicação externa, mas não têm JSDoc nos handlers/integrações apresentados como código final. Como a prompt exige JSDoc nos elementos relevantes de código, controllers/routes e blocos com lógica crítica, o BK não deve ficar `OK` sem essa correção.

Os restantes nove BKs ficam `OK` na auditoria documental atual. Não foram corrigidos BKs nesta execução porque o modo é `auditar_apenas`.

### Resultado antes e depois desta auditoria

| Métrica | Estado consolidado anterior | Estado auditoria atual |
| --- | ---: | ---: |
| BKs analisados | 10 | 10 |
| OK | 10 | 9 |
| PARCIAL | 0 | 1 |
| CRITICO | 0 | 0 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado anterior | Estado atual | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `P0` | `Oleksii` | `Andre` | `OK` | `PARCIAL` | falta JSDoc nos handlers de route que medem vendas, compras e lançamentos manuais |
| `BK-MF6-02` | `RNF09` | `P1` | `Sofia` | `Pedro` | `OK` | `OK` | mantém 25 sessões, baseline, `allowedP95`, negativos e evidence de carga |
| `BK-MF6-03` | `RNF10` | `P1` | `Oleksii` | `Pedro` | `OK` | `OK` | mantém orçamento de reconciliação, service, route, contexto autenticado e smoke textual |
| `BK-MF6-04` | `RNF11` | `P1` | `Andre` | `Oleksii` | `OK` | `OK` | preserva contrato FIFO, preview sem escrita, orçamento e validação de domínio |
| `BK-MF6-05` | `RNF12` | `P0` | `Andre` | `Oleksii` | `OK` | `OK` | cobre middleware HTTPS, proxy, produção simulada e evidence de transporte |
| `BK-MF6-06` | `RNF13` | `P0` | `Andre` | `Pedro` | `OK` | `OK` | cobre bcrypt, salt, registo, reset, login, teste unitário e ausência de exposição no frontend |
| `BK-MF6-07` | `RNF14` | `P0` | `Oleksii` | `Andre` | `OK` | `OK` | cobre HttpOnly, Secure, SameSite, leitura de sessão, cliente API e negativos |
| `BK-MF6-08` | `RNF15` | `P0` | `Oleksii` | `Andre` | `OK` | `OK` | cobre hardening global, origem, rate limit, validação antes de Prisma, smoke e negativos |
| `BK-MF6-09` | `RNF16` | `P0` | `Pedro` | `Andre` | `OK` | `OK` | mantém variáveis obrigatórias fundamentadas, `.env.example`, scanner textual e sem segredo não consumido |
| `BK-MF6-10` | `RNF17`, `RF47` | `P0` | `Oleksii` | `Sofia` | `OK` | `OK` | mantém auditoria sensível, filtro de detalhes normalizado, integrações críticas e negativos |

### Findings confirmados nesta auditoria

#### MF6-AUD-20260623-FULL-F01

- BK/RF/RNF afetado: `BK-MF6-01` / `RNF08`
- Severidade: `P3`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md:234` a `258` apresenta o handler `router.post("/")` de vendas com 21 linhas não vazias, comentários didáticos e sem bloco JSDoc associado.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md:292` a `317` apresenta o handler de compras com 22 linhas não vazias, comentários didáticos e sem bloco JSDoc associado.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md:320` a `345` apresenta o handler de lançamentos manuais com 22 linhas não vazias, comentários didáticos e sem bloco JSDoc associado.
- Expected: código apresentado como solução final em routes/controllers críticas deve ter JSDoc nos elementos relevantes ou handlers nomeados documentados, explicando responsabilidade, parâmetros, retorno, erros e regras de segurança/domínio.
- Observed: os handlers estão completos e comentados, mas a documentação formal fica ausente precisamente em operações financeiras críticas medidas por `RNF08`.
- Impacto pedagógico: o aluno recebe a integração funcional, mas não aprende formalmente o contrato do handler, efeitos laterais, erros esperados e ligação entre performance, privacidade dos cabeçalhos e validação de domínio.
- Impacto técnico: baixo a médio; o código continua legível, mas falha a regra documental da prompt para código profissional/pedagógico.
- Impacto de segurança/domínio: baixo; o guia preserva `req.companyId`, `req.user.id` e services reais, mas a ausência de JSDoc reduz a explicitação do contrato de segurança.
- Causa provável: a correção anterior privilegiou fechar executabilidade e comentários didáticos, deixando os handlers inline sem documentação formal.
- Correção recomendada: adicionar JSDoc antes de cada handler ou extrair handlers nomeados, documentando responsabilidade, parâmetros `req/res`, respostas `201`, cabeçalhos `X-OPSA-Duration-Ms`/`X-OPSA-Within-Budget`, erro via `sendError`, contexto multiempresa e privacidade dos dados financeiros.

### Findings descartados ou não reproduzidos

- `BK-MF6-09`: não foi reproduzido o finding anterior sobre `SESSION_SIGNING_KEY`; a pesquisa atual não encontrou `SESSION_SIGNING_KEY` nem `sessionSigningKey` no BK alvo, e o módulo `loadEnv` mantém apenas `DATABASE_URL` como obrigatório.
- `BK-MF6-10`: não foi reproduzido o finding anterior sobre `rawPayload`/`documentLines`; o `Set` usa `rawpayload`/`documentlines`, a comparação usa `normalizedKey` e os negativos continuam explícitos.
- Fuga de `real_dev/` nos BKs da `MF6`: não reproduzida; a pesquisa dedicada não devolveu ocorrências.

### Mapa de integração da MF

| BK | Contratos principais entregues | Contratos consumidos | BK seguinte dependente |
| --- | --- | --- | --- |
| `BK-MF6-01` | medição de inserção de documentos, cabeçalhos de duração, smoke `RNF08` | services de vendas, compras, lançamentos manuais, contexto autenticado, auditoria e performance `MF5` | `BK-MF6-02` |
| `BK-MF6-02` | executor de carga com 25 sessões, baseline e limite objetivo de degradação | sessão/cookies, endpoints autenticados e budget de carregamento vindo de `MF5` | `BK-MF6-03` |
| `BK-MF6-03` | orçamento de reconciliação, sugestão com origem de dados e endpoint autenticado | extratos, recebimentos, pagamentos, tesouraria, `companyId` backend | `BK-MF6-04` |
| `BK-MF6-04` | orçamento FIFO, preview sem escrita e separação entre cálculo consultivo e gravação | `BK-MF2-03`, movimentos de stock, FIFO, armazém, item e empresa ativa | `BK-MF6-05` |
| `BK-MF6-05` | middleware HTTPS/TLS e smoke textual de transporte | servidor Express, proxy, cliente API e configuração de produção | `BK-MF6-06` |
| `BK-MF6-06` | helper bcrypt endurecido, unidade de hashing e ausência de exposição no frontend | autenticação e recuperação de password de `MF0` | `BK-MF6-07` |
| `BK-MF6-07` | cookies HttpOnly/Secure/SameSite, leitura de sessão e cliente API com `credentials: "include"` | login/logout de `MF0`, hardening de transporte e API client | `BK-MF6-08` |
| `BK-MF6-08` | proteção de origem, rate limit, validação antes de Prisma e smoke anti-injection | autenticação, sessão, validators, Prisma e frontend autenticado | `BK-MF6-09` |
| `BK-MF6-09` | `loadEnv`, `.env.example`, scanner textual e contrato de credenciais | configuração da API, servidor Express, auth, frontend config | `BK-MF6-10` |
| `BK-MF6-10` | `recordSensitiveAudit`, bloqueio de detalhes sensíveis e auditoria em operações críticas | `AuditLog` de `BK-MF4-09`, permissões, períodos fiscais, documentos e reconciliação | `BK-MF7-01` |

### Decisões confirmadas

- `CANONICO`: `RNF08` a `RNF17` pertencem à `MF6` e estão mapeados um-para-um para `BK-MF6-01` a `BK-MF6-10`.
- `CANONICO`: `RF47` fundamenta a auditoria obrigatória de quem, quando e o quê em operações sensíveis.
- `CANONICO`: `RF25` e `RF33` continuam a fundamentar os domínios de FIFO e reconciliação usados por `BK-MF6-03` e `BK-MF6-04`.
- `CANONICO`: `BK-MF5-07` prepara performance mensurável para `BK-MF6-01`, mas não define o orçamento de 1 segundo de documentos.
- `CANONICO`: `BK-MF6-10` fecha a MF6 e prepara `BK-MF7-01`.
- `DERIVADO`: orçamentos locais e smokes textuais tornam os RNF mensuráveis em ambiente de aluno sem prometer benchmark legal ou infraestrutura de produção.
- `DERIVADO`: `recordSensitiveAudit` é uma camada mínima sobre `recordAuditLog`, mantendo o modelo `AuditLog` já criado em `MF4`.

### Drift documental encontrado

- `DRIFT-MF7-ESTRUTURA`: os BKs de `MF7` ainda usam estrutura curta com `## Bloco pedagogico`, `## Bloco operacional` e `## Snippet tecnico aplicavel`, enquanto `MF6` já usa a estrutura tutorial completa. Isto não invalida os BKs da `MF6`, mas deixa risco de quebra pedagógica no handoff `BK-MF6-10 -> BK-MF7-01`.
- `DRIFT-VALIDADOR-LEGADO`: `bash scripts/validate-planificacao.sh` continua a emitir advisories globais sobre blocos pedagógico/operacional e snippet em BKs que já foram migrados para a estrutura nova. O estado final do script é `overall_pass=true`, mas `advisory_pass=false`.
- `DRIFT-DOCS-GLOBAIS`: o validador mantém documentos globais marcados como `outdated_docs`, incluindo plano total, distribuição, sprints e `MF-VIEWS`. Não foram alterados por `STRICT_SCOPE=true`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5 -> MF6`: coerente. `BK-MF5-07` entrega a ideia de performance mensurável e `BK-MF6-01` usa orçamento próprio de documentos sem herdar indevidamente o limite de dashboards/listagens.
- `MF6 interna`: coerente. A sequência progride de performance e carga para reconciliação/FIFO, transporte seguro, passwords, sessões, hardening, credenciais e auditoria.
- `MF6 -> MF7`: funcionalmente coerente no plano de contratos, porque `BK-MF6-10` entrega auditoria e configuração segura para backups/retenção/exportações. Pedagogicamente parcial fora do alvo, porque `BK-MF7-01` ainda não está hidratado no formato tutorial completo.

### Verificações executadas

- Pesquisa estrutural dos 10 BKs `MF6`:
  - Resultado: todos têm as secções obrigatórias de `#### Objetivo` a `#### Changelog`.
  - Resultado: todos têm `#### Tutorial técnico linear` e passos numerados.
  - Resultado: apenas `BK-MF6-01` apresentou blocos críticos com 20+ linhas sem JSDoc associado.
- Pesquisa obrigatória de padrões de risco em `docs/planificacao/guias-bk/MF6/*.md`:
  - Resultado: ocorrências contextuais, sem finding novo além de `MF6-AUD-20260623-FULL-F01`.
  - `companyId` aparece como contexto backend autenticado (`req.companyId`, `input.companyId`, `context.companyId`), não como empresa escolhida pelo frontend.
  - `password`, `token` e `secret` aparecem no BK de bcrypt e no conjunto de chaves proibidas de auditoria.
  - Não foram encontrados `payload: unknown`, `as any`, `localStorage`, `sessionStorage`, operações destrutivas largas nem claims indevidos de RAG/embeddings/OCR/SAF-T completo.
- `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: passou sem output.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`.
  - Nota: `advisory_pass=false` mantém advisories globais/preexistentes e regras legadas do validador; não bloqueia o estado `overall_pass=true`.
- Verificação direta deste relatório untracked:
  - `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`: sem ocorrências.
  - Pesquisa por placeholders acionáveis: sem ocorrências; as duas ocorrências de `placeholder` estão em histórico que declara ausência desse padrão nos BKs alvo.

### Riscos restantes e TODOs

- `BK-MF6-01` fica `PARCIAL` até documentar com JSDoc os handlers críticos de route identificados no finding `MF6-AUD-20260623-FULL-F01`.
- `MF7` deve ser auditada/hidratada em execução própria antes de ser usada como continuidade pedagógica final, porque ainda está em formato antigo.
- O validador global mantém advisories e documentos globais desatualizados fora do alvo estrito desta prompt.
- Não foram executados testes runtime em `apps/`, porque esta prompt é de auditoria documental BK e não de implementação/correção de código.

## Execução atual - correção dos findings reauditoria BK-MF6-09 e BK-MF6-10

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-09`, `BK-MF6-10`
- Modo: `corrigir_apenas`
- Fonte de findings: secção `Execução atual - reauditoria apenas BK-MF6-09 e BK-MF6-10`
- Findings corrigidos: `MF6-AUD-20260623-BK09-RERUN-F01`, `MF6-AUD-20260623-BK10-RERUN-F01`
- Código de implementação em `apps/`: não editado
- Raiz `real_dev/`: usada apenas como referência interna; não editada e não referenciada nos BKs dos alunos
- BKs editados: `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md`, `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`
- Relatório atualizado: este ficheiro
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta correção preservou esse estado e limitou novas alterações aos dois BKs alvo e a este relatório.

### Resumo executivo

Foram corrigidos os dois findings confirmados na reauditoria mais recente.

No `BK-MF6-09`, `SESSION_SIGNING_KEY` foi removida do contrato obrigatório porque não estava fundamentada por BK anterior nem consumida pelo fluxo apresentado. O guia mantém `DATABASE_URL` como credencial obrigatória já usada pela API, mantém `APP_BASE_URL` como configuração operacional segura e explicita que novas chaves de API só entram quando existir o adapter que as consome.

No `BK-MF6-10`, o conjunto `FORBIDDEN_DETAIL_KEYS` foi normalizado para minúsculas e `assertSafeDetails` passou a comparar contra `normalizedKey`. O smoke textual e os negativos também passaram a cobrir explicitamente `rawPayload` e `documentLines`, fechando a falha em que nomes camelCase podiam escapar.

### Resultado antes e depois desta correção

| Métrica | Estado reauditoria anterior | Estado após correção atual |
| --- | ---: | ---: |
| BKs no scope | 2 | 2 |
| OK | 0 | 2 |
| PARCIAL | 2 | 0 |
| CRITICO | 0 | 0 |

### Inventário corrigido

| BK | RNF/RF | Estado anterior | Estado após correção | Motivo |
| --- | --- | --- | --- | --- |
| `BK-MF6-09` | `RNF16` | `PARCIAL` | `OK` | removeu variável obrigatória não consumida e manteve apenas configuração fundamentada no fluxo do BK |
| `BK-MF6-10` | `RNF17`, `RF47` | `PARCIAL` | `OK` | normalizou chaves proibidas e acrescentou negativo/smoke para payloads completos em `details` |

### Findings corrigidos nesta execução

#### MF6-AUD-20260623-BK09-RERUN-F01

- BK/RF/RNF afetado: `BK-MF6-09` / `RNF16`
- Severidade: `P2`
- Estado final: `CORRIGIDO`
- Evidência objetiva:
  - `BK-MF6-09:154` define agora `requiredVariables = ["DATABASE_URL"]`.
  - `BK-MF6-09:174` documenta o retorno de `loadEnv` sem `sessionSigningKey`.
  - `BK-MF6-09:181` a `185` devolve apenas `databaseUrl` e `appBaseUrl`.
  - `BK-MF6-09:217` a `220` mostra `.env.example` sem `SESSION_SIGNING_KEY`.
  - Pesquisa dirigida para `SESSION_SIGNING_KEY|sessionSigningKey` no BK alvo não devolveu ocorrências.
- Expected: o BK deve tornar obrigatórias apenas variáveis consumidas pelo fluxo apresentado.
- Observed após correção: a variável obrigatória sem consumidor foi removida e o guia explica que novas chaves só entram quando o adapter existir.
- Validação executada: pesquisa estática dirigida, pesquisa de fuga de `real_dev`, pesquisa de termos internos proibidos nos BKs alvo, `git diff --check` e `bash scripts/validate-planificacao.sh`.

#### MF6-AUD-20260623-BK10-RERUN-F01

- BK/RF/RNF afetado: `BK-MF6-10` / `RNF17`, `RF47`
- Severidade: `P1`
- Estado final: `CORRIGIDO`
- Evidência objetiva:
  - `BK-MF6-10:161` a `169` guarda `rawpayload` e `documentlines` já normalizados em minúsculas.
  - `BK-MF6-10:189` a `194` usa `normalizedKey = key.toLowerCase()` antes da consulta ao `Set`.
  - `BK-MF6-10:599` a `603` acrescenta smoke textual para garantir que `rawpayload` e `documentlines` continuam declarados como proibidos.
  - `BK-MF6-10:647` a `659` define negativo explícito para `details: { rawPayload: {}, documentLines: [] }`.
  - `BK-MF6-10:700` acrescenta critério de aceite para bloquear `rawPayload` e `documentLines` em camelCase.
- Expected: todas as chaves proibidas devem usar a mesma normalização e os negativos devem provar payloads completos.
- Observed após correção: comparação e dados do `Set` usam a mesma normalização; o guia passa a testar os nomes que antes escapavam.
- Validação executada: pesquisa estática dirigida, pesquisa de fuga de `real_dev`, pesquisa de termos internos proibidos nos BKs alvo, `git diff --check` e `bash scripts/validate-planificacao.sh`.

### Verificações executadas

- `rg -n "SESSION_SIGNING_KEY|sessionSigningKey" BK-MF6-09`
  - Resultado: sem ocorrências.
- `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: sem ocorrências.
- Pesquisa de termos internos proibidos nos dois BKs alvo.
  - Resultado: sem ocorrências.
- Pesquisa obrigatória de padrões de risco em `docs/planificacao/guias-bk/MF6/*.md`.
  - Resultado: ocorrências contextuais. No scope atual, `password`/`token`/`secret` aparecem como chaves bloqueadas em auditoria, `companyId` aparece como contexto backend autenticado, e `rawPayload`/`documentLines` aparecem apenas no negativo e nos critérios agora corrigidos.
- `git diff --check`
  - Resultado: passou sem output.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`.
  - Nota: `advisory_pass=false` mantém avisos globais/preexistentes sobre múltiplos BKs e documentos desatualizados. Não foram tratados nesta execução por `STRICT_SCOPE=true`.

### Riscos restantes e TODOs

- Não ficam findings abertos no scope desta correção.
- O validador global mantém `advisory_pass=false` por dívida documental fora dos dois findings corrigidos.
- Não foram executados testes de runtime em `apps/`, porque esta prompt autorizava correção documental dos BKs e não alteração/execução de implementação real.

## Execução atual - reauditoria apenas BK-MF6-09 e BK-MF6-10

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-09`, `BK-MF6-10`
- Modo: `auditar_apenas`
- Prompt executada: `MF_ALVO=MF6`, `BK_IDS=[BK-MF6-09, BK-MF6-10]`, `OUTPUT_MODE=relatorio_e_resumo`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`
- Raiz canónica dos BKs dos alunos: `apps/api` e `apps/web`
- `real_dev/`: consultado apenas como referência interna para contratos já existentes até `MF5`; não editado e não referenciado nos BKs dos alunos
- Código de implementação em `apps/`: não editado
- BKs editados: nenhum, conforme `MODO=auditar_apenas`
- Relatório atualizado: este ficheiro
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos 10 BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta reauditoria preservou esse estado e acrescentou apenas esta secção ao relatório.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF6/`, com foco nos dois BKs alvo.
- BK anterior direto: `BK-MF6-08`.
- BK seguinte direto: `BK-MF7-01`.
- BKs anteriores relevantes: `BK-MF0-01`, `BK-MF0-05`, `BK-MF4-09`, `BK-MF4-10`, `BK-MF6-07`, `BK-MF6-08`.
- Implementação de referência até MF5 em `real_dev/api/src/server.js`, `real_dev/api/src/modules/auth/sessionCookie.js`, `real_dev/api/src/modules/auth/authService.js`, `real_dev/api/src/modules/audit/auditLogService.js`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/src/modules/company-users/companyUserService.js`, `real_dev/api/src/modules/company-users/companyUserController.js`, `real_dev/api/src/modules/fiscal-periods/fiscalPeriodService.js`, `real_dev/api/src/modules/sales/saleDocumentService.js` e `real_dev/api/src/modules/treasury/statementImportService.js`.
- Relatórios existentes `AUDITORIA-HIDRATACAO-MF5.md`, `AUDITORIA-HIDRATACAO-MF6.md` e relatórios de implementação MF5 como histórico de decisões.

### Resumo executivo

A reauditoria confirma que os dois BKs alvo estão muito mais fortes do que a versão antiga registada no histórico do relatório. Ambos usam caminhos `apps/...`, não contêm fuga de `real_dev/`, seguem a estrutura moderna dos BKs e preservam a ligação `BK-MF6-08 -> BK-MF6-09 -> BK-MF6-10 -> BK-MF7-01`.

Mesmo assim, no critério rigoroso da prompt atual, os dois BKs ainda não devem ficar `OK`. O `BK-MF6-09` fica `PARCIAL` porque introduz `SESSION_SIGNING_KEY` como variável obrigatória sem contrato documental anterior encontrado e sem uso no arranque apresentado. A referência real de sessão usa identificador opaco server-side e não usa assinatura de cookie, por isso a variável fica como requisito obrigatório não consumido.

O `BK-MF6-10` fica `PARCIAL` porque o helper de auditoria sensível tenta bloquear `rawPayload` e `documentLines`, mas normaliza a chave recebida com `key.toLowerCase()` enquanto o `Set` guarda esses dois nomes em camelCase. Assim, os negativos de detalhes excessivos podem escapar precisamente nos nomes que o BK declara como proibidos.

Como `MODO=auditar_apenas`, os BKs não foram corrigidos nesta execução.

### Resultado antes e depois desta reauditoria

| Métrica | Estado anterior registado após correção | Estado reauditoria atual |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 2 | 0 |
| PARCIAL | 0 | 2 |
| CRITICO | 0 | 0 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado anterior | Estado reauditoria atual | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-09` | `RNF16` | `P0` | `Pedro` | `Andre` | `OK` | `PARCIAL` | variável obrigatória `SESSION_SIGNING_KEY` não está fundamentada nem consumida no fluxo apresentado |
| `BK-MF6-10` | `RNF17` | `P0` | `Oleksii` | `Sofia` | `OK` | `PARCIAL` | filtro de detalhes sensíveis falha para chaves camelCase declaradas no próprio BK |

### Findings novos confirmados nesta reauditoria

#### MF6-AUD-20260623-BK09-RERUN-F01

- BK/RF/RNF afetado: `BK-MF6-09` / `RNF16`
- Severidade: `P2`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md:153` define `SESSION_SIGNING_KEY` em `requiredVariables`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md:173` a `184` expõe `sessionSigningKey` no retorno de `loadEnv`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md:251` a `269` integra `loadEnv` no servidor, mas usa apenas `env.appBaseUrl`.
  - `real_dev/api/src/modules/auth/sessionCookie.js` usa cookie `sid` com identificador opaco e não usa assinatura de cookie.
  - `real_dev/api/src/modules/auth/authService.js` gera sessões server-side com `crypto.randomBytes(32)` e persistência em `Session`, sem `SESSION_SIGNING_KEY`.
- Expected: o BK deve tornar obrigatórias apenas variáveis realmente consumidas pelo fluxo apresentado, ou marcar uma variável nova como `DERIVADO` e mostrar onde ela é usada.
- Observed: o guia obriga `SESSION_SIGNING_KEY`, mas o próprio passo de integração não consome essa variável e os contratos anteriores de sessão não exigem assinatura.
- Impacto pedagógico: o aluno pode acreditar que a aplicação precisa de uma chave de assinatura de sessão quando o contrato real é sessão opaca server-side.
- Impacto técnico/segurança: risco de falha de arranque por variável obrigatória não usada, ou de criação de segredo operacional sem função real.
- Causa provável: tentativa correta de ensinar segregação de segredos, mas com exemplo de segredo não ancorado no fluxo OPSA atual.
- Correção recomendada: substituir `SESSION_SIGNING_KEY` por uma variável sensível realmente usada por um adapter existente, ou mostrar a integração completa que consome essa chave; se for decisão futura, marcar como `DERIVADO` e não a tornar obrigatória neste BK.

#### MF6-AUD-20260623-BK10-RERUN-F01

- BK/RF/RNF afetado: `BK-MF6-10` / `RNF17`, `RF47`
- Severidade: `P1`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md:161` a `169` define `FORBIDDEN_DETAIL_KEYS` com `rawPayload` e `documentLines`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md:189` a `193` valida `FORBIDDEN_DETAIL_KEYS.has(key.toLowerCase())`.
  - `rawPayload`.toLowerCase() seria `rawpayload`, que não existe no `Set` atual; `documentLines`.toLowerCase() seria `documentlines`, que também não existe no `Set` atual.
  - O próprio BK declara que audit logs não devem aceitar payloads completos nem linhas de documentos em `details`.
- Expected: todas as chaves proibidas devem usar a mesma normalização, por exemplo `rawpayload` e `documentlines` no `Set`, ou comparar sem lowercasing inconsistente.
- Observed: a validação bloqueia `password`, `token`, `secret`, `authorization` e `cookie`, mas pode deixar passar `rawPayload` e `documentLines`.
- Impacto pedagógico: o aluno aprende uma proteção que parece cobrir payloads completos, mas o negativo principal pode não falhar.
- Impacto técnico/segurança: risco de logs de auditoria guardarem payloads completos ou linhas financeiras, contrariando minimização e segurança.
- Causa provável: refactor parcial para comparação case-insensitive sem normalizar os valores do `Set`.
- Correção recomendada: normalizar o `Set` para minúsculas (`rawpayload`, `documentlines`) ou criar `const normalizedKey = key.toLowerCase()` e manter todos os valores proibidos já normalizados; acrescentar um negativo explícito para `details: { rawPayload: {}, documentLines: [] }`.

### Mapa de integração da MF

#### BK-MF6-09

- Ficheiros criados pelo BK: `apps/api/src/config/env.js`, `apps/api/.env.example`, `apps/api/scripts/check-mf6-env-safety.mjs`
- Ficheiros editados pelo BK: `apps/api/src/server.js`, `apps/api/package.json`
- Ficheiros revistos pelo BK: `apps/web/.env.example`, `apps/web/src/lib/apiClient.ts`
- Exports produzidos: `loadEnv`
- Imports consumidos de BKs anteriores: arranque Express, `buildAuthRoutes`, `APP_BASE_URL` usado por autenticação/hardening
- Endpoints criados: nenhum
- DTOs/validators criados: nenhum
- Schemas/modelos criados: nenhum
- Services criados: nenhum service de domínio; cria módulo de configuração
- Componentes/páginas frontend criados: nenhum
- Regras de segurança aplicadas: credenciais fora do código, validação de variáveis obrigatórias, scanner textual de padrões de credenciais
- Testes/smokes previstos: `apps/api/scripts/check-mf6-env-safety.mjs`
- BK seguinte dependente: `BK-MF6-10`
- Risco atual: `SESSION_SIGNING_KEY` precisa de fundamentação/uso ou remoção do conjunto obrigatório.

#### BK-MF6-10

- Ficheiros criados pelo BK: `apps/api/scripts/check-mf6-audit-gate.mjs`
- Ficheiros editados pelo BK: `apps/api/src/modules/audit/auditLogService.js`, `apps/api/src/modules/company-users/companyUserService.js`, `apps/api/src/modules/company-users/companyUserController.js`, `apps/api/src/modules/fiscal-periods/fiscalPeriodService.js`, `apps/api/src/modules/sales/saleDocumentService.js`, `apps/api/package.json`
- Ficheiros revistos pelo BK: `apps/api/src/modules/treasury/statementImportService.js`, `apps/api/src/modules/integrations/integrationLogService.js`
- Exports produzidos: `recordSensitiveAudit`
- Imports consumidos de BKs anteriores: `recordAuditLog`, `AuditLog`, `assertNotLastAdmin`, `assertOpenFiscalPeriod`, `nextSaleNumber`, `httpError`
- Endpoints criados: nenhum endpoint novo; auditoria é integrada em operações existentes
- DTOs/validators criados: nenhum
- Schemas/modelos criados: nenhum schema novo; reutiliza `AuditLog`
- Services afetados: auditoria, utilizadores da empresa, períodos fiscais, documentos de venda
- Componentes/páginas frontend criados: nenhum
- Regras de segurança/autorização aplicadas: empresa ativa e ator autenticado vêm do backend; audit log não deve aceitar payloads completos nem credenciais em `details`
- Testes/smokes previstos: `apps/api/scripts/check-mf6-audit-gate.mjs`
- BK seguinte dependente: `BK-MF7-01`
- Risco atual: normalização de chaves proibidas em `assertSafeDetails` não cobre todos os nomes declarados.

### Decisões confirmadas

- `CANONICO`: `RNF16` exige credenciais apenas em variáveis de ambiente.
- `CANONICO`: `RNF17` exige auditoria obrigatória em operações sensíveis.
- `CANONICO`: `RF47` define auditoria com quem, quando e o quê.
- `CANONICO`: `BK-MF4-09` entrega `recordAuditLog` e o modelo `AuditLog`; `BK-MF6-10` deve reforçar esse contrato, não substituí-lo.
- `CANONICO`: cookies de sessão OPSA usam identificador opaco server-side criado em `BK-MF0-01` e endurecido em `BK-MF6-07`.
- `DERIVADO`: `recordSensitiveAudit` é uma camada mínima de validação por cima de `recordAuditLog`.
- `DERIVADO`: o smoke textual pode provar cobertura mínima em três services críticos sem introduzir dependências novas.

### Drift documental encontrado

- `BK-MF6-09` introduz `SESSION_SIGNING_KEY` como obrigatório sem decisão canónica encontrada e sem consumo no código apresentado.
- `BK-MF6-10` declara bloqueio de `rawPayload`/`documentLines`, mas a normalização atual não concretiza esse bloqueio.
- Não foi encontrada fuga de `real_dev/` nos BKs MF6.
- `BK-MF7-01`, como BK seguinte, continua com formato antigo e ficou fora do scope desta execução.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5` -> `MF6`: preservada no geral. A auditoria não assume a MF6 como implementada em `real_dev`, apenas usa contratos anteriores para validar nomes e modelos.
- `BK-MF6-08` -> `BK-MF6-09`: parcialmente preservada. A centralização de `APP_BASE_URL` encaixa com hardening anterior, mas `SESSION_SIGNING_KEY` ainda precisa de contrato/uso.
- `BK-MF6-09` -> `BK-MF6-10`: preservada no fluxo geral de segurança, com risco residual em variável obrigatória não consumida.
- `BK-MF6-10` -> `BK-MF7-01`: parcialmente preservada. A auditoria sensível prepara backups/retenção/exportações, mas o filtro de detalhes deve bloquear efetivamente payloads completos antes de fechar a MF6.

### Verificações executadas

- Pesquisa estática direcionada nos dois BKs alvo para `real_dev`, pseudo-código, placeholders, `as any`, `payload: unknown`, storage inseguro, `companyId`, padrões de segredo e campos de auditoria.
  - Resultado: sem fuga de `real_dev` e sem `as any`/`payload: unknown`; matches relevantes foram analisados e originaram os dois findings acima.
- Pesquisa obrigatória de fuga de caminho interno em `docs/planificacao/guias-bk/MF6/*.md`.
  - Resultado: sem ocorrências de `real_dev`, `real-dev`, `cd real_dev` ou `real_dev/`.
- Pesquisa obrigatória de padrões de risco em `docs/planificacao/guias-bk/MF6/*.md`.
  - Resultado: ocorrências contextuais. Os principais matches são `password` no BK-MF6-06, `companyId` usado como contexto backend autenticado, e `password`/`token`/`secret` no `FORBIDDEN_DETAIL_KEYS` de `BK-MF6-10`. As ocorrências que representam lacuna real estão registadas nos dois findings desta secção.
- Pesquisa em `real_dev/api/src` e BKs anteriores para `SESSION_SIGNING_KEY`, `SESSION_SECRET`, assinatura de sessão, `sessionCookie.js` e `authService.js`.
  - Resultado: não foi encontrado contrato anterior de `SESSION_SIGNING_KEY`; sessão real usa identificador opaco server-side.
- Pesquisa em Prisma/serviços para contrato `AuditLog`, `recordAuditLog`, `companyMembership`, `fiscalPeriod`, `saleDocument` e reconciliação.
  - Resultado: `AuditLog` usa `entity`, `entityId` e `details`; o contrato geral de `BK-MF6-10` está alinhado, exceto o bug de normalização em `FORBIDDEN_DETAIL_KEYS`.
- `git diff --check`
  - Resultado: passou sem output.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`.
  - Nota: `advisory_pass=false` vem de avisos globais/preexistentes em múltiplos BKs e documentos desatualizados, incluindo MF0-MF6; não foi tratado nesta execução por `STRICT_SCOPE=true`.

### Riscos restantes e TODOs

- Corrigir `BK-MF6-09` para remover, justificar ou consumir `SESSION_SIGNING_KEY`.
- Corrigir `BK-MF6-10` para normalizar as chaves proibidas e acrescentar negativo explícito para `rawPayload` e `documentLines`.
- O validador global mantém `advisory_pass=false` por dívida documental fora dos dois BKs alvo.

## Execução atual - correção apenas BK-MF6-09 e BK-MF6-10

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-09`, `BK-MF6-10`
- Modo: `corrigir_apenas`
- Fonte de findings: secção anterior deste relatório, `Execução atual - auditoria apenas BK-MF6-09 e BK-MF6-10`
- Findings corrigidos: `MF6-AUD-20260623-BK09-F01`, `MF6-AUD-20260623-BK09-F02`, `MF6-AUD-20260623-BK09-F03`, `MF6-AUD-20260623-BK10-F01`, `MF6-AUD-20260623-BK10-F02`, `MF6-AUD-20260623-BK10-F03`, `MF6-AUD-20260623-BK10-F04`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- `real_dev/`: usado apenas como referência interna para confirmar contratos de MF anteriores; não editado e não referenciado nos BKs dos alunos
- Código de implementação em `apps/`: não editado
- BKs editados: `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md`, `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`
- Relatório atualizado: este ficheiro
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos 10 BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta correção preservou esse estado e limitou a escrita aos dois BKs alvo e a este relatório.

### Resumo executivo

Foram corrigidos os dois BKs alvo classificados na reauditoria anterior como `PARCIAL` e `CRITICO`.

O `BK-MF6-09` passou a mostrar uma integração mais concreta de `loadEnv` na zona inicial de `server.js`, preservando `port`, `isProduction`, `appBaseUrl`, `PrismaClient`, `express.json()` e a montagem de autenticação. O scanner textual passou a ter comentários didáticos junto da recursão e do bloqueio de padrões de credenciais. Os resíduos de acentuação foram corrigidos.

O `BK-MF6-10` deixou de propor campos incompatíveis com Prisma (`targetType`, `targetId`, `result`, `metadata`) como dados persistidos. O guia agora reforça auditoria sensível através de `recordSensitiveAudit(prisma, input)`, reutilizando o contrato de `recordAuditLog`/`AuditLog` definido em `BK-MF4-09`: `companyId`, `userId`, `action`, `entity`, `entityId` e `details`. Também foram acrescentadas integrações completas em três fluxos críticos: alteração de permissões, fecho de período fiscal e emissão de documento de venda. O smoke textual passou a provar helper e chamadas reais nos três services, não apenas a existência da função central.

### Resultado antes e depois desta correção

| Métrica | Estado antes da correção | Estado após correção |
| --- | ---: | ---: |
| BKs no scope | 2 | 2 |
| OK | 0 | 2 |
| PARCIAL | 1 | 0 |
| CRITICO | 1 | 0 |

### Inventário corrigido

| BK | RNF | Prioridade | Estado anterior | Estado após correção | Motivo |
| --- | --- | --- | --- | --- | --- |
| `BK-MF6-09` | `RNF16` | `P0` | `PARCIAL` | `OK` | integra `loadEnv` no arranque do servidor, reforça comentários didáticos do scanner e corrige acentuação |
| `BK-MF6-10` | `RNF17` | `P0` | `CRITICO` | `OK` | alinha auditoria com `recordAuditLog`/`AuditLog`, substitui exemplos soltos por integrações completas e reforça o gate textual |

### Findings corrigidos

| Finding | Severidade | Estado final | Evidência da correção |
| --- | --- | --- | --- |
| `MF6-AUD-20260623-BK09-F01` | `P2` | `CORRIGIDO` | `BK-MF6-09` passou a mostrar a zona inicial integrada de `apps/api/src/server.js`, com `loadEnv`, `port`, `isProduction`, `appBaseUrl`, `express.json()` e montagem de auth |
| `MF6-AUD-20260623-BK09-F02` | `P3` | `CORRIGIDO` | scanner `check-mf6-env-safety.mjs` recebeu comentários didáticos junto da recursão e do bloqueio de padrões de credenciais |
| `MF6-AUD-20260623-BK09-F03` | `P3` | `CORRIGIDO` | `minimo`/`Proximo` foram corrigidos para `mínimo`/`Próximo` |
| `MF6-AUD-20260623-BK10-F01` | `P1` | `CORRIGIDO` | `recordSensitiveAudit` passou a reutilizar `recordAuditLog` e os campos reais `entity`, `entityId` e `details` |
| `MF6-AUD-20260623-BK10-F02` | `P1` | `CORRIGIDO` | passos de permissões, períodos fiscais e documentos passaram a incluir integrações completas em services reais |
| `MF6-AUD-20260623-BK10-F03` | `P2` | `CORRIGIDO` | smoke `check-mf6-audit-gate.mjs` passou a verificar chamadas em `companyUserService`, `fiscalPeriodService` e `saleDocumentService` |
| `MF6-AUD-20260623-BK10-F04` | `P3` | `CORRIGIDO` | `minimo`/`Proximo` foram corrigidos para `mínimo`/`Próximo` |

### Mapa de integração da MF

#### BK-MF6-09

- Ficheiros criados pelo BK: `apps/api/src/config/env.js`, `apps/api/.env.example`, `apps/api/scripts/check-mf6-env-safety.mjs`
- Ficheiros editados pelo BK: `apps/api/src/server.js`, `apps/api/package.json`
- Ficheiros revistos pelo BK: `apps/web/.env.example`, `apps/web/src/lib/apiClient.ts`
- Exports produzidos: `loadEnv`
- Imports consumidos de BKs anteriores: `server.js`, `buildAuthRoutes`, configuração de `APP_BASE_URL` já usada por autenticação/hardening
- Endpoints criados: nenhum
- DTOs/validators criados: nenhum
- Schemas/modelos criados: nenhum
- Services criados: nenhum service de domínio; cria módulo de configuração
- Componentes/páginas frontend criados: nenhum
- Regras de segurança aplicadas: credenciais fora do código, validação de variáveis obrigatórias, scanner textual de padrões de credenciais
- Testes/smokes previstos: `apps/api/scripts/check-mf6-env-safety.mjs`
- BK seguinte dependente: `BK-MF6-10`

#### BK-MF6-10

- Ficheiros criados pelo BK: `apps/api/scripts/check-mf6-audit-gate.mjs`
- Ficheiros editados pelo BK: `apps/api/src/modules/audit/auditLogService.js`, `apps/api/src/modules/company-users/companyUserService.js`, `apps/api/src/modules/company-users/companyUserController.js`, `apps/api/src/modules/fiscal-periods/fiscalPeriodService.js`, `apps/api/src/modules/sales/saleDocumentService.js`, `apps/api/package.json`
- Ficheiros revistos pelo BK: `apps/api/src/modules/treasury/statementImportService.js`, `apps/api/src/modules/integrations/integrationLogService.js`
- Exports produzidos: `recordSensitiveAudit`
- Imports consumidos de BKs anteriores: `recordAuditLog`, `AuditLog`, `assertNotLastAdmin`, `assertOpenFiscalPeriod`, `nextSaleNumber`, `httpError`
- Endpoints criados: nenhum endpoint novo; auditoria é integrada em operações existentes
- DTOs/validators criados: nenhum
- Schemas/modelos criados: nenhum schema novo; reutiliza `AuditLog`
- Services afetados: auditoria, utilizadores da empresa, períodos fiscais, documentos de venda
- Componentes/páginas frontend criados: nenhum
- Regras de segurança/autorização aplicadas: empresa ativa e ator autenticado vêm do backend; audit log não aceita payloads completos nem credenciais em `details`
- Testes/smokes previstos: `apps/api/scripts/check-mf6-audit-gate.mjs`
- BK seguinte dependente: `BK-MF7-01`

### Decisões confirmadas

- `CANONICO`: `RNF16` exige credenciais apenas em variáveis de ambiente.
- `CANONICO`: `RNF17` exige auditoria obrigatória em operações sensíveis.
- `CANONICO`: `RF47` define auditoria com quem, quando e o quê.
- `CANONICO`: `BK-MF4-09` já entregou `recordAuditLog` e o modelo `AuditLog`; `BK-MF6-10` deve reforçar esse contrato, não substituí-lo.
- `DERIVADO`: `recordSensitiveAudit` é uma camada mínima de validação por cima de `recordAuditLog`.
- `DERIVADO`: o smoke textual pode provar cobertura mínima em três services críticos sem introduzir dependências novas.
- `DERIVADO`: a reconciliação existente em `BK-MF6-03` é sugestão sem confirmação automática; o BK não inventa uma ação de confirmação fora do contrato atual.

### Drift documental encontrado

- O drift principal registado na reauditoria anterior fica corrigido nos BKs alvo.
- Não foi introduzida referência a `real_dev/` nos BKs dos alunos.
- `BK-MF7-01`, como BK seguinte, continua com formato antigo e ficou fora do scope desta correção.
- `docs/planificacao/guias-bk/README.md` e `_TEMPLATE-BK.md` mantêm regras/exemplos legados fora do scope desta execução.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5` -> `MF6`: preservada. A correção usa contratos já existentes e não assume implementação completa da MF6 em `real_dev`.
- `BK-MF6-08` -> `BK-MF6-09`: preservada. `APP_BASE_URL` passa a ter origem centralizada no módulo de ambiente.
- `BK-MF6-09` -> `BK-MF6-10`: preservada. Configuração segura prepara auditoria sem expor credenciais.
- `BK-MF6-10` -> `BK-MF7-01`: melhorada. A auditoria sensível fica alinhada com `AuditLog`, preparando backups/retenção/exportações com trilho rastreável, embora o formato antigo do BK seguinte continue como risco fora do scope.

### Verificações executadas

- Pesquisa pós-correção de resíduos `targetType`, `targetId`, `metadata`, `Proximo`, `minimo`, `bankReconciliation.confirm` e duplicação do bloco antigo nos dois BKs alvo.
  - Resultado: permanecem apenas `targetType`, `targetId` e `metadata:` dentro do smoke de regressão que bloqueia o contrato errado; os restantes resíduos foram removidos.
- Pesquisa obrigatória de risco em `docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: ocorrências contextuais, sem novo blocker no scope. Os principais matches são `companyId` usado como contexto backend autenticado em BKs MF6, termos de password no BK-MF6-06, e `password`/`token`/`secret` no `FORBIDDEN_DETAIL_KEYS` de `BK-MF6-10` para impedir detalhes sensíveis em audit logs.
- Pesquisa de fuga de caminho interno `real_dev`
  - Resultado: sem ocorrências em `docs/planificacao/guias-bk/MF6/*.md`.
- Pesquisa de trailing whitespace no relatório
  - Resultado: sem ocorrências nos dois BKs alvo e neste relatório.
- `git diff --check`
  - Resultado: passou sem output.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`. O `advisory_pass=false` permanece por avisos globais/preexistentes de qualidade de guias e documentos desatualizados fora do scope desta correção.

### Riscos restantes e TODOs

- `BK-MF7-01` continua fora do formato moderno dos BKs MF0-MF6; fica como handoff fora do scope.
- O validador global pode manter `advisory_pass=false` por dívida documental preexistente fora destes dois BKs.

## Execução atual - auditoria apenas BK-MF6-09 e BK-MF6-10

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-09`, `BK-MF6-10`
- Modo: `auditar_apenas`
- Relatório usado como histórico: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- `real_dev/`: consultado apenas como referência interna/baseline até `MF5`; não editado e não referenciado nos BKs dos alunos
- Código de implementação em `apps/`: não editado
- BKs editados: nenhum, conforme `MODO=auditar_apenas`
- Relatório atualizado: este ficheiro
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos 10 BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta auditoria preservou esse estado, não editou BKs, não tocou em `apps/`, `legacy/`, `real_dev/`, RF/RNF ou documentos canónicos, e acrescentou apenas esta secção de relatório.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF6/`, com foco em `BK-MF6-09` e `BK-MF6-10`.
- BK anterior direto: `BK-MF6-08`.
- BK seguinte direto: `BK-MF7-01`.
- BKs anteriores relevantes: `BK-MF0-01`, `BK-MF0-05`, `BK-MF4-09`, `BK-MF4-10`, `BK-MF6-08`.
- Implementação de referência até MF5 em `real_dev/api/src/server.js`, `real_dev/api/src/modules/auth/sessionCookie.js`, `real_dev/api/src/modules/audit/auditLogService.js`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/src/modules/companies/companyContext.js`, `real_dev/api/src/modules/auth/authMiddleware.js` e services de domínio que já escrevem `AuditLog`.
- Relatórios existentes `AUDITORIA-HIDRATACAO-MF5.md`, `AUDITORIA-HIDRATACAO-MF6.md` e relatórios de implementação MF5 quando aplicável como contexto histórico.

### Resumo executivo

A reauditoria confirma que os dois BKs alvo existem, estão canonizados como `P0`, `Reforco`, `S10-S11`, usam caminhos `apps/...`, não contêm fugas de `real_dev/` e seguem a estrutura nova de `#### Objetivo` até `#### Changelog` com oito passos.

No critério rigoroso da prompt atual, contudo, o estado anterior `OK` não se mantém. O `BK-MF6-09` fica `PARCIAL`: ensina o objetivo de `RNF16`, mas ainda contém um fragmento de integração em `server.js`, um scanner com comentário didático insuficiente para um bloco longo e resíduos de acentuação. O aluno ainda teria de inferir parte da integração real do módulo de ambiente.

O `BK-MF6-10` fica `CRITICO`: o bloco central de auditoria propõe campos e assinatura incompatíveis com o contrato já criado em `BK-MF4-09` e com o modelo Prisma real `AuditLog`. Se um aluno copiar o bloco atual, `prisma.auditLog.create` usaria campos inexistentes (`targetType`, `targetId`, `result`, `metadata`) em vez de `entity`, `entityId` e `details`. Além disso, os passos de integração em permissões, períodos fiscais, documentos e reconciliação continuam como snippets ou instruções de repetição, não como código completo integrado para um BK `P0` de auditoria obrigatória.

Como `MODO=auditar_apenas`, os BKs não foram corrigidos nesta execução.

### Resultado antes e depois desta reauditoria

| Métrica | Estado anterior registado no relatório | Estado reauditoria atual |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 2 | 0 |
| PARCIAL | 0 | 1 |
| CRITICO | 0 | 1 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado anterior | Estado reauditoria atual | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-09` | `RNF16` | `P0` | `Pedro` | `Andre` | `OK` | `PARCIAL` | cobre variáveis de ambiente, mas deixa integração de `server.js` e scanner como blocos incompletos/insuficientemente didáticos |
| `BK-MF6-10` | `RNF17` | `P0` | `Oleksii` | `Sofia` | `OK` | `CRITICO` | propõe contrato de auditoria incompatível com MF4/Prisma e integrações sensíveis em snippets |

### Findings novos confirmados nesta reauditoria

#### MF6-AUD-20260623-BK09-F01

- BK/RF/RNF afetado: `BK-MF6-09` / `RNF16`
- Severidade: `P2`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md:241` a `243` manda editar `apps/api/src/server.js` no arranque da API.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md:249` promete "Código completo, correto e integrado".
  - O bloco das linhas `251` a `256` mostra apenas `import { loadEnv } ...`, `const env = loadEnv()` e `const appBaseUrl = env.appBaseUrl`.
  - A referência interna atual usa `port`, `isProduction` e `appBaseUrl` no arranque em `real_dev/api/src/server.js:56` a `58`, e `BK-MF6-08` já mostra uma zona inicial integrada de `server.js` para hardening.
- Expected: o BK deve mostrar a zona inicial completa e integrada do servidor, preservando `port`, `isProduction`, `appBaseUrl`, imports existentes e ordem dos middlewares, ou então tratar o passo como revisão sem código.
- Observed: o guia deixa a integração como fragmento, obrigando o aluno a decidir onde colocar o import, se substitui `process.env.APP_BASE_URL`, como preservar `isProduction` e como não duplicar configuração.
- Impacto pedagógico: o aluno não consegue aplicar o passo sem adivinhar o ponto exato de integração.
- Impacto técnico/segurança: risco de `appBaseUrl` inconsistente entre hardening CSRF, auth e config, ou de import duplicado em `server.js`.
- Causa provável: o guia destacou a ideia de centralizar ambiente, mas não seguiu a regra rígida de código completo quando o ficheiro editado é transversal.
- Correção recomendada: reescrever o passo 4 com bloco integrado da zona inicial de `server.js`, alinhado com `BK-MF6-08`, ou converter para revisão sem código e indicar exatamente que linhas substituir.

#### MF6-AUD-20260623-BK09-F02

- BK/RF/RNF afetado: `BK-MF6-09` / `RNF16`
- Severidade: `P3`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md:318` a `359` define um script com mais de 20 linhas não vazias.
  - O bloco tem JSDoc de ficheiro, mas não tem comentários didáticos junto da recursão de diretórios, leitura de ficheiros ou padrões de credenciais.
  - A regra da prompt exige pelo menos dois comentários didáticos dentro de blocos com 20 ou mais linhas, especialmente em scripts/testes/validação.
- Expected: o scanner deve explicar dentro do código a intenção dos checks críticos, por exemplo por que só procura padrões públicos e por que falha cedo antes do PR.
- Observed: o bloco é funcional como sketch, mas não cumpre o contrato pedagógico rigoroso de comentários didáticos.
- Impacto pedagógico: o aluno executa o scanner sem compreender os limites e falsos positivos/negativos da abordagem textual.
- Impacto técnico/segurança: baixo a médio; o scanner é uma rede educativa, mas pode dar falsa confiança se não explicar o que cobre e o que não cobre.
- Causa provável: o bloco foi escrito como script curto de apoio, mas excede o limiar de comentário didático obrigatório.
- Correção recomendada: acrescentar comentários didáticos junto da recursão e dos padrões de credenciais, ou simplificar o bloco e mover limites para a explicação do passo.

#### MF6-AUD-20260623-BK09-F03

- BK/RF/RNF afetado: `BK-MF6-09` / `RNF16`
- Severidade: `P3`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md:439` contém `Negativos: minimo`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md:460` contém `Proximo BK recomendado`.
- Expected: texto pedagógico deve usar português de Portugal com acentuação correta: `mínimo` e `Próximo`.
- Observed: há resíduos ASCII em texto destinado aos alunos.
- Impacto pedagógico: pequeno, mas viola uma regra explícita da prompt.
- Impacto técnico/segurança: nenhum impacto técnico direto.
- Causa provável: resíduos de normalização anterior.
- Correção recomendada: substituir `minimo` por `mínimo` e `Proximo` por `Próximo`.

#### MF6-AUD-20260623-BK10-F01

- BK/RF/RNF afetado: `BK-MF6-10` / `RNF17`
- Severidade: `P1`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md:149` a `185` apresenta `recordSensitiveAudit(input)` como bloco completo de `apps/api/src/modules/audit/auditLogService.js`.
  - O bloco escreve `companyId: input.activeCompanyId`, `targetType`, `targetId`, `result` e `metadata`.
  - O contrato já criado em `BK-MF4-09` usa `recordAuditLog(prisma, input)` com `companyId`, `userId`, `action`, `entity`, `entityId` e `details`.
  - A referência interna atual confirma o mesmo contrato em `real_dev/api/src/modules/audit/auditLogService.js:37` a `50`.
  - O modelo Prisma atual confirma os campos reais em `real_dev/api/prisma/schema.prisma:610` a `625`: `companyId`, `userId`, `action`, `entity`, `entityId`, `details`, `createdAt`.
- Expected: o BK deve preservar ou estender o contrato existente de MF4, reutilizando `recordAuditLog` ou mostrando uma versão compatível com `AuditLog`.
- Observed: o guia cria uma função nova incompatível com o modelo e com os BKs anteriores.
- Impacto pedagógico: o aluno recebe um bloco que parece final, mas que não compila nem encaixa com a app existente.
- Impacto técnico/segurança: auditoria obrigatória fica bloqueada; operações sensíveis podem perder trilho se a equipa tentar trocar o helper existente por um contrato divergente.
- Causa provável: tentativa de reforçar sem revalidar o contrato de MF4 e o schema real.
- Correção recomendada: substituir `recordSensitiveAudit` por uma camada compatível com `recordAuditLog(prisma, { companyId, userId, action, entity, entityId, details })`, mantendo minimização de dados e, se necessário, uma lista derivada de ações permitidas sem alterar campos Prisma.

#### MF6-AUD-20260623-BK10-F02

- BK/RF/RNF afetado: `BK-MF6-10` / `RNF17`
- Severidade: `P1`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md:216` a `227` mostra apenas um snippet `await recordSensitiveAudit({ ... })` para permissões, sem import, função, transação, service real ou contexto de `req`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md:257` diz "Sem código neste passo. Repete o padrão do passo 3" para períodos fiscais.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md:288` diz "Sem código neste passo. Usa `recordSensitiveAudit` com alvo e metadados mínimos" para documentos e reconciliação.
  - A prompt exige código completo, localização exata e integração real quando o BK manda editar services sensíveis.
- Expected: o guia deve mostrar pelo menos uma integração completa e compilável num service real, e as restantes integrações devem ter localização e contrato claros, sem depender de "repete o padrão".
- Observed: os passos de integração continuam dependentes de inferência do aluno.
- Impacto pedagógico: o aluno não sabe onde chamar auditoria, que argumentos vêm do controller/service, se a chamada entra dentro da transação e como evitar log de sucesso quando a operação falha.
- Impacto técnico/segurança: risco de logs inconsistentes, logs fora da transação, auditoria omitida em operações críticas ou gravação de dados sensíveis.
- Causa provável: o guia transformou auditoria transversal num padrão de exemplo, não numa integração executável.
- Correção recomendada: escolher fluxos reais do baseline (`companyUserService`, `fiscalPeriodService`, emissão de venda/compra ou reconciliação) e mostrar código completo ou substituições completas compatíveis com `recordAuditLog`.

#### MF6-AUD-20260623-BK10-F03

- BK/RF/RNF afetado: `BK-MF6-10` / `RNF17`
- Severidade: `P2`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md:302` a `342` cria `check-mf6-audit-gate.mjs`.
  - O script só verifica se a lista de ações e o nome `recordSensitiveAudit` existem dentro de `auditLogService.js`.
  - O próprio scope do BK exige "Integrar em pelo menos três fluxos críticos" e "Definir negativos para operação sem auditoria", mas o smoke não procura chamadas nos services de permissões, períodos fiscais, documentos ou reconciliação.
- Expected: o smoke textual deve falhar se nenhum service sensível chamar o helper de auditoria, ou deve declarar explicitamente que é uma prova parcial.
- Observed: o script pode passar mesmo que nenhuma operação real esteja auditada.
- Impacto pedagógico: a evidence pode sobreprometer o cumprimento de `RNF17`.
- Impacto técnico/segurança: a equipa pode fechar a MF6 com helper declarado mas sem auditoria obrigatória nos fluxos críticos.
- Causa provável: o smoke valida existência de helper, não a cobertura de integração.
- Correção recomendada: reforçar o script para ler services sensíveis e procurar chamadas ao helper por fluxo, ou separar "smoke de contrato" de "smoke de cobertura".

#### MF6-AUD-20260623-BK10-F04

- BK/RF/RNF afetado: `BK-MF6-10` / `RNF17`
- Severidade: `P3`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md:422` contém `Negativos: minimo`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md:442` contém `Proximo BK recomendado`.
- Expected: texto pedagógico deve usar português de Portugal com acentuação correta: `mínimo` e `Próximo`.
- Observed: há resíduos ASCII em texto destinado aos alunos.
- Impacto pedagógico: pequeno, mas viola uma regra explícita da prompt.
- Impacto técnico/segurança: nenhum impacto técnico direto.
- Causa provável: resíduos de normalização anterior.
- Correção recomendada: substituir `minimo` por `mínimo` e `Proximo` por `Próximo`.

### Mapa de integração da MF

#### BK-MF6-09

- Ficheiros previstos pelo BK: `apps/api/src/config/env.js`, `apps/api/.env.example`, `apps/api/src/server.js`, `apps/api/scripts/check-mf6-env-safety.mjs`, `apps/api/package.json`, `apps/web/.env.example`
- Ficheiros editados nesta execução: nenhum
- Exports previstos pelo guia: `loadEnv`
- Imports consumidos de BKs anteriores: `server.js`, `APP_BASE_URL` já usado por hardening/auth, configuração de email/IA/integrações como consumidores futuros
- Endpoints criados: nenhum
- DTOs/validators criados: nenhum
- Schemas/modelos criados: nenhum
- Services criados: nenhum service de domínio; cria módulo de configuração
- Componentes/páginas frontend criados: nenhum
- Providers de IA criados ou usados: nenhum provider novo; apenas obriga credenciais por ambiente quando existirem
- Regras de segurança/autorização aplicadas: ausência de credenciais em código, falha cedo de configuração obrigatória, scanner textual
- Testes/smokes previstos: `apps/api/scripts/check-mf6-env-safety.mjs`
- BKs seguintes dependentes: `BK-MF6-10`
- Estado de integração atual: `PARCIAL`

#### BK-MF6-10

- Ficheiros previstos pelo BK: `apps/api/src/modules/audit/auditLogService.js`, services de permissões, períodos fiscais, documentos e reconciliação, `apps/api/scripts/check-mf6-audit-gate.mjs`, `apps/api/package.json`, revisão de `apps/api/src/modules/integrations/integrationLogService.js`
- Ficheiros editados nesta execução: nenhum
- Exports previstos pelo guia: `recordSensitiveAudit`
- Imports consumidos de BKs anteriores: auditoria de `BK-MF4-09`, logs de integração de `BK-MF4-10`, contexto multiempresa/autenticação de MF0, documentos e reconciliação de MFs anteriores
- Endpoints criados: nenhum endpoint novo; auditoria deve ficar integrada em operações existentes
- DTOs/validators criados: nenhum
- Schemas/modelos criados: nenhum schema novo; deve reutilizar `AuditLog`
- Services criados/afetados: helper de auditoria e services sensíveis
- Componentes/páginas frontend criados: nenhum
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: trilho auditável por empresa ativa, ator autenticado, ação, entidade, identificador e detalhes mínimos
- Testes/smokes previstos: `apps/api/scripts/check-mf6-audit-gate.mjs`, negativos de ação não declarada, sessão ausente e dados excessivos
- BKs seguintes dependentes: `BK-MF7-01`
- Estado de integração atual: `CRITICO`, porque o contrato proposto não encaixa com `AuditLog`/MF4 e a cobertura real de serviços não é comprovada

### Decisões confirmadas

- `CANONICO`: `RNF16` exige chaves de API e credenciais apenas em variáveis de ambiente.
- `CANONICO`: `RNF17` exige auditoria obrigatória em operações sensíveis.
- `CANONICO`: `RF47` define auditoria com quem, quando e o quê em operações sensíveis.
- `CANONICO`: `BK-MF6-09` e `BK-MF6-10` são `P0`, `Reforco`, `S10-S11`, na sequência `BK-MF6-09` -> `BK-MF6-10` -> `BK-MF7-01`.
- `CANONICO`: `BK-MF4-09` já define `recordAuditLog` com `companyId`, `userId`, `action`, `entity`, `entityId` e `details`.
- `DERIVADO`: módulo central `env.js` é decisão técnica mínima aceitável para cumprir `RNF16` sem introduzir cofre externo.
- `DERIVADO`: scanner textual sem novas dependências é aceitável como smoke educativo, desde que não prometa detetar todos os segredos.
- `DERIVADO`: lista fechada de ações sensíveis em MF6 é aceitável para reforçar `RNF17`, mas deve ser compatível com o schema e helper de MF4.

### Drift documental encontrado

- O histórico deste relatório marcava `BK-MF6-09` e `BK-MF6-10` como `OK` após a hidratação integral, mas a reauditoria atual confirma drift de qualidade: `BK-MF6-09` ainda tem integração incompleta e `BK-MF6-10` contradiz contratos de auditoria anteriores.
- Não foi encontrada fuga de caminhos internos `real_dev` nos dois BKs alvo.
- Não foi encontrado domínio de outra PAP nos dois BKs alvo.
- `BK-MF7-01`, como BK seguinte, continua no formato antigo com `Bloco pedagogico`, `Bloco operacional` e `Snippet tecnico aplicavel`, mas ficou fora do scope de escrita desta execução. Esse drift afeta a coerência MF6 -> MF7 apenas como risco de handoff futuro.
- O `README.md` de guias e `_TEMPLATE-BK.md` ainda têm regras legadas ou exemplos com `real_dev/`; a prompt atual sobrepõe-se para esta execução e exige caminhos `apps/...` nos BKs dos alunos. Não foram alterados por `STRICT_SCOPE=true`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5` -> `MF6`: coerência geral preservada em intenção; esta reauditoria não assume a MF6 implementada em `real_dev` e usa a referência apenas para contratos até MF5 e contratos já definidos em BKs anteriores.
- `BK-MF6-08` -> `BK-MF6-09`: coerência preservada em objetivo. Hardening usa `APP_BASE_URL`, e `BK-MF6-09` deve centralizar essa configuração, mas a integração atual em `server.js` ainda é fragmentária.
- `BK-MF6-09` -> `BK-MF6-10`: coerência parcialmente preservada. Configuração por ambiente prepara auditoria segura, mas `BK-MF6-10` precisa de corrigir o contrato de auditoria para não quebrar MF4.
- `BK-MF6-10` -> `BK-MF7-01`: coerência de handoff está em risco. MF7 depende de rastreabilidade para backups/retenção/exportações, mas `BK-MF6-10` ainda não entrega uma auditoria obrigatória executável.

### Verificações executadas

- Pesquisa canónica por `BK-MF6-09`, `BK-MF6-10`, `RNF16`, `RNF17`, `RF47`, `BK-MF4-09`, `BK-MF4-10`, `BK-MF6-08` e `BK-MF7-01` em RF/RNF, matriz, backlog, contrato de campos, MF-VIEWS, plano de sprints, guias BK e relatório histórico.
- Leitura linha a linha dos dois BKs alvo com `nl -ba`.
- Consulta de referência interna em `real_dev/api/src/server.js`, `real_dev/api/src/modules/audit/auditLogService.js`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/src/modules/companies/companyContext.js` e `real_dev/api/src/modules/auth/authMiddleware.js`.
- Pesquisa estrutural de secções e code fences nos dois BKs alvo:
  - Resultado: secções obrigatórias presentes e fences Markdown equilibradas.
- Pesquisa obrigatória de risco nos dois BKs alvo:
  - Resultado: ocorrências contextuais de `.env.example`, `process.env`, `companyId`, `console.log`, `TODO`; os problemas promovidos a findings são os blocos incompletos/incompatíveis, não as ocorrências contextuais isoladas.
- Pesquisa de fuga de caminho interno:
  - Comando: `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/BK-MF6-09-...md docs/planificacao/guias-bk/MF6/BK-MF6-10-...md`
  - Resultado: sem ocorrências.
- Pesquisa focada de acentuação:
  - Comando: `rg -n "\\b(minimo|minimos|Proximo)\\b" docs/planificacao/guias-bk/MF6/BK-MF6-09-...md docs/planificacao/guias-bk/MF6/BK-MF6-10-...md`
  - Resultado: quatro ocorrências confirmadas nos dois BKs alvo.
- `git diff --check`
  - Resultado: passou sem output.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`. O `advisory_pass=false` resulta de avisos globais/preexistentes de qualidade pedagógica e operacional em múltiplos guias, incluindo blocos didáticos, snippets considerados incompletos e linhas de handoff; não bloqueou cobertura, consistência, nomes ou ligações canónicas.

### Riscos restantes e TODOs

- `BK-MF6-09`: substituir o fragmento de `server.js` por bloco integrado ou revisão sem código.
- `BK-MF6-09`: acrescentar comentários didáticos no scanner textual e corrigir acentuação.
- `BK-MF6-10`: alinhar o helper de auditoria com `recordAuditLog`/`AuditLog` já existentes.
- `BK-MF6-10`: substituir snippets por integrações completas em pelo menos três fluxos críticos ou declarar com rigor o que fica bloqueado.
- `BK-MF6-10`: reforçar o smoke para provar chamadas reais nos services sensíveis, não apenas a existência do helper.
- `BK-MF6-10`: corrigir acentuação.
- Próxima ação recomendada: executar `MODO=corrigir_apenas` para estes findings, mantendo `BK_IDS: [BK-MF6-09, BK-MF6-10]`.

## Execução atual - correção apenas BK-MF6-07 e BK-MF6-08

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-07`, `BK-MF6-08`
- Modo: `corrigir_apenas`
- Fonte de findings: secção anterior deste relatório, `Execução anterior - reauditoria apenas BK-MF6-07 e BK-MF6-08`
- Findings corrigidos: `MF6-AUD-20260623-BK07-F01`, `MF6-AUD-20260623-BK07-F02`, `MF6-AUD-20260623-BK07-F03`, `MF6-AUD-20260623-BK08-F01`, `MF6-AUD-20260623-BK08-F02`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- `real_dev/`: usado apenas como referência interna para confirmar contratos já auditados; não editado e não referenciado nos BKs dos alunos
- Código de implementação em `apps/`: não editado
- BKs editados: `docs/planificacao/guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md`, `docs/planificacao/guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md`
- Relatório atualizado: este ficheiro
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Resumo executivo

Foram corrigidos os dois BKs alvo classificados como `CRITICO`/`PARCIAL` na reauditoria anterior, sem alterar RF/RNF, matriz, backlog, distribuição de responsabilidades, código de implementação, `real_dev/` ou outros BKs fora do scope.

O `BK-MF6-07` ficou executável como guia de sessão segura: o bloco completo de `sessionCookie.js` preserva agora o export `readSessionCookie`, mantendo o contrato criado em `BK-MF0-01`, e o passo do cliente API passou a ser uma revisão sem snippet parcial.

O `BK-MF6-08` ficou executável como guia de hardening transversal: o passo de `server.js` mostra agora a zona inicial integrada, com import de `requireTrustedOrigin`, constantes de ambiente, `express.json()` e montagem antes dos routers.

Os resíduos P3 de acentuação também foram corrigidos nos dois BKs. Após esta execução, ambos os BKs alvo ficam `OK` para o scope auditado/corrigido.

### Resultado antes e depois desta correção

| Métrica | Estado antes da correção | Estado após correção |
| --- | ---: | ---: |
| BKs no scope | 2 | 2 |
| OK | 0 | 2 |
| PARCIAL | 1 | 0 |
| CRITICO | 1 | 0 |

### Inventário corrigido

| BK | RNF | Prioridade | Estado anterior | Estado após correção | Motivo |
| --- | --- | --- | --- | --- | --- |
| `BK-MF6-07` | `RNF14` | `P0` | `CRITICO` | `OK` | preserva `readSessionCookie`, mantém contrato MF0 e remove snippet parcial do cliente API |
| `BK-MF6-08` | `RNF15` | `P0` | `PARCIAL` | `OK` | mostra integração inicial completa de `server.js` antes dos routers e corrige texto P3 |

### Findings corrigidos

#### MF6-AUD-20260623-BK07-F01

- Estado após correção: `CORRIGIDO`
- Correção aplicada: o passo 2 de `BK-MF6-07` passou a incluir `readSessionCookie(req)` no ficheiro completo de `apps/api/src/modules/auth/sessionCookie.js`.
- Evidência pós-correção: o bloco mantém `buildSessionCookieOptions`, `setSessionCookie`, `clearSessionCookie` e `readSessionCookie`, com comentário didático sobre o contrato vindo de `BK-MF0-01`.
- Impacto residual: nenhum no scope deste finding.

#### MF6-AUD-20260623-BK07-F02

- Estado após correção: `CORRIGIDO`
- Correção aplicada: o passo 4 de `BK-MF6-07` deixou de apresentar fragmento `fetch` como código completo.
- Evidência pós-correção: o passo é agora uma revisão explícita da função `request`, mandando preservar `credentials: "include"`, headers, body, resposta `204`, JSON e `ApiError`.
- Impacto residual: nenhum no scope deste finding.

#### MF6-AUD-20260623-BK07-F03

- Estado após correção: `CORRIGIDO`
- Correção aplicada: `minimo` -> `mínimo`; `Proximo` -> `Próximo`.
- Evidência pós-correção: pesquisa focada por `\b(minimo|minimos|Proximo)\b` nos dois BKs alvo não devolveu ocorrências.
- Impacto residual: nenhum.

#### MF6-AUD-20260623-BK08-F01

- Estado após correção: `CORRIGIDO`
- Correção aplicada: o passo 3 de `BK-MF6-08` passou a mostrar a zona inicial integrada de `apps/api/src/server.js`.
- Evidência pós-correção: o bloco inclui imports, `PrismaClient`, `app`, `port`, `isProduction`, `appBaseUrl`, `express.json()` e `app.use(requireTrustedOrigin({ appBaseUrl, isProduction }))` antes de qualquer router.
- Impacto residual: nenhum no scope deste finding.

#### MF6-AUD-20260623-BK08-F02

- Estado após correção: `CORRIGIDO`
- Correção aplicada: `minimo` -> `mínimo`; `Proximo` -> `Próximo`.
- Evidência pós-correção: pesquisa focada por `\b(minimo|minimos|Proximo)\b` nos dois BKs alvo não devolveu ocorrências.
- Impacto residual: nenhum.

### Mapa de integração após correção

#### BK-MF6-07

- Ficheiros previstos pelo BK: `apps/api/src/modules/auth/sessionCookie.js`, `apps/api/src/modules/auth/authController.js`, `apps/api/src/modules/auth/authMiddleware.js`, `apps/web/src/lib/apiClient.ts`, `apps/api/scripts/check-mf6-session-cookie.mjs`, `apps/api/package.json`
- Ficheiros editados nesta execução: `docs/planificacao/guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md`
- Exports preservados/afetados pelo guia: `setSessionCookie`, `clearSessionCookie`, `readSessionCookie`; `buildSessionCookieOptions` fica interno ao módulo.
- Imports consumidos de BKs anteriores: contrato de sessão criado em `BK-MF0-01`, login/logout MF0, cliente API com `credentials: "include"`.
- Regras de segurança/autorização aplicadas: cookie `HttpOnly`, `Secure` em produção, `SameSite=Lax`, `Path=/`, não guardar tokens em storage JavaScript.
- Estado de integração atual: `OK`.

#### BK-MF6-08

- Ficheiros previstos pelo BK: `apps/api/src/modules/security/requestHardening.js`, `apps/api/src/server.js`, `apps/api/src/modules/auth/authRateLimit.js`, `apps/api/scripts/check-mf6-hardening.mjs`, `apps/api/package.json`
- Ficheiros editados nesta execução: `docs/planificacao/guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md`
- Exports produzidos pelo guia: `requireTrustedOrigin`, `escapeHtml`.
- Imports consumidos de BKs anteriores: cookie seguro de `BK-MF6-07`, HTTPS de `BK-MF6-05`, bcrypt/rate limit de `BK-MF6-06`, validators financeiros anteriores.
- Regras de segurança/autorização aplicadas: origem confiável em métodos mutáveis, rate limit de autenticação, validação contra injeção, escape de HTML quando a API gerar HTML.
- Estado de integração atual: `OK`.

### Decisões mantidas

- `CANONICO`: `RNF14` exige sessões com cookies `HttpOnly`, `Secure` e `SameSite`.
- `CANONICO`: `RNF15` exige prevenção de SQL/NoSQL Injection, XSS, CSRF e brute force.
- `CANONICO`: `RF01` define registo, login e logout com cookies HttpOnly e cria o contrato de sessão inicial.
- `DERIVADO`: `Secure` condicionado por `isProduction`/`NODE_ENV=production` mantém compatibilidade com desenvolvimento local e produção HTTPS.
- `DERIVADO`: `SameSite=Lax` continua a ser baseline simples para reduzir CSRF numa app web tradicional com cookies.
- `DERIVADO`: `requireTrustedOrigin` antes dos routers é necessário porque a proteção deve aplicar-se a todos os métodos mutáveis atuais e futuros.

### Verificações executadas após correção

- Inspeção com `nl -ba` das zonas corrigidas em `BK-MF6-07` e `BK-MF6-08`: código fences fechadas, passos lineares preservados, comentários didáticos mantidos.
- Pesquisa de fences Markdown com `rg -n "^```"` nos dois BKs alvo: pares equilibrados.
- Pesquisa obrigatória de risco nos dois BKs alvo:
  - Resultado: ocorrências contextuais esperadas de `estado: TODO`, `Rate limit` e `process.env` no guia de hardening; sem `real_dev`, sem snippets parciais antigos e sem findings técnicos novos.
- Pesquisa obrigatória de risco na MF6 completa:
  - Resultado: ocorrências contextuais de `companyId` em BKs fora do alvo e `password` no BK de bcrypt; não foram promovidas a findings desta correção porque estão fora de `BK_IDS` ou são contexto esperado do requisito.
- Pesquisa de fuga de caminho interno:
  - Comando: `rg -n "real_dev|real-dev|cd real_dev|real_dev/" ...BK-MF6-07... ...BK-MF6-08...`
  - Resultado: sem ocorrências.
- Pesquisa focada de acentuação:
  - Comando: `rg -n "\b(minimo|minimos|Proximo)\b" ...BK-MF6-07... ...BK-MF6-08...`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: passou sem output.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`.
  - Nota: `advisory_pass=false` permanece por avisos de qualidade/documentação já existentes no conjunto global de guias; o validador continua a marcar a execução como `overall_pass=true`.

### Nota de worktree

Antes desta correção já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta execução preservou esse estado, não fez commits, e limitou as alterações ao relatório atual e aos dois BKs alvo.

## Execução anterior - reauditoria apenas BK-MF6-07 e BK-MF6-08

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-07`, `BK-MF6-08`
- Modo: `auditar_apenas`
- Relatório usado como histórico: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- `real_dev/`: consultado apenas como referência interna/baseline até `MF5`; não editado e não referenciado nos BKs dos alunos
- Código de implementação em `apps/`: não editado
- BKs editados: nenhum, conforme `MODO=auditar_apenas`
- Relatório atualizado: este ficheiro
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos 10 BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta reauditoria preservou esse estado, não editou BKs, não tocou em `apps/`, `legacy/`, `real_dev/`, RF/RNF ou documentos canónicos, e acrescentou apenas esta secção de relatório.

### Resumo executivo

A reauditoria confirma que os dois BKs alvo seguem a estrutura obrigatória de tutorial linear, usam caminhos canónicos `apps/...`, não contêm fugas de `real_dev/`, não inventam domínio de outra PAP e cobrem os requisitos canónicos `RNF14` e `RNF15`.

Ainda assim, o estado atual não deve ficar como `OK`. O `BK-MF6-07` fica `CRITICO` porque o passo que apresenta `apps/api/src/modules/auth/sessionCookie.js` como "ficheiro completo" remove o export `readSessionCookie`, criado em `BK-MF0-01` e consumido por `authController.js`/`authMiddleware.js`. Se um aluno substituir o ficheiro pelo bloco atual, autenticação, `/api/auth/me` e logout ficam com imports partidos.

O `BK-MF6-08` fica `PARCIAL` porque o hardening transversal está pedagogicamente bem orientado, mas a montagem em `apps/api/src/server.js` é apenas um fragmento de duas linhas, apesar da regra da prompt exigir código completo e integrado quando o guia manda editar um ficheiro crítico. O aluno ainda precisa de inferir a posição exata do import, a montagem antes dos routers, e a ligação com `appBaseUrl`/`isProduction`.

Como `MODO=auditar_apenas`, os BKs não foram corrigidos. Ficam também registados dois resíduos P3 de acentuação (`minimo` e `Proximo`) em cada BK alvo.

### Resultado antes e depois desta reauditoria

| Métrica | Estado anterior no relatório | Estado reauditoria atual |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 2 | 0 |
| PARCIAL | 0 | 1 |
| CRITICO | 0 | 1 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado anterior | Estado reauditoria atual | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-07` | `RNF14` | `P0` | `Oleksii` | `Andre` | `OK` | `CRITICO` | bloco de `sessionCookie.js` apresentado como ficheiro completo remove `readSessionCookie`, quebrando imports de autenticação |
| `BK-MF6-08` | `RNF15` | `P0` | `Oleksii` | `Andre` | `OK` | `PARCIAL` | guia cobre origem/rate limit/validação, mas a integração em `server.js` fica como fragmento incompleto |

### Findings novos confirmados nesta reauditoria

#### MF6-AUD-20260623-BK07-F01

- BK/RF/RNF afetado: `BK-MF6-07` / `RNF14`
- Severidade: `P1`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md:139` marca `apps/api/src/modules/auth/sessionCookie.js` como `EDITAR`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md:140` indica `LOCALIZAÇÃO: ficheiro completo`.
  - O bloco completo mostrado entre as linhas `148` e `196` só exporta `setSessionCookie` e `clearSessionCookie`.
  - `BK-MF0-01` cria `readSessionCookie` em `apps/api/src/modules/auth/sessionCookie.js`, linhas `325` a `333`.
  - A referência interna atual confirma o contrato: `real_dev/api/src/modules/auth/sessionCookie.js:52` exporta `readSessionCookie`, e `real_dev/api/src/modules/auth/authController.js:20`, `131` e `164` consomem esse export.
- Expected: o BK deve preservar os exports criados em MF0 ou mostrar o ficheiro completo atualizado com `buildSessionCookieOptions`, `setSessionCookie`, `clearSessionCookie` e `readSessionCookie`.
- Observed: o guia substitui o ficheiro completo sem `readSessionCookie`.
- Impacto pedagógico: o aluno recebe um bloco aparentemente final, mas quebraria a app ao copiar o ficheiro.
- Impacto técnico/segurança: autenticação, `/api/auth/me`, logout e middleware de sessão podem deixar de compilar/importar; num BK `P0` de sessão isto bloqueia o contrato de segurança.
- Causa provável: ao endurecer cookie, o guia focou escrita/limpeza e não preservou o helper de leitura já entregue em MF0.
- Correção recomendada: reescrever o bloco do passo 2 como ficheiro completo, mantendo `readSessionCookie` com JSDoc e comentário didático, ou limitar o passo a uma substituição de funções claramente localizada sem apagar exports existentes.

#### MF6-AUD-20260623-BK07-F02

- BK/RF/RNF afetado: `BK-MF6-07` / `RNF14`
- Severidade: `P2`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md:254` promete "Código completo, correto e integrado".
  - O bloco das linhas `256` a `262` mostra apenas um fragmento `fetch(url, { ...options, credentials: "include" })`, sem contexto da função `request`, tratamento de headers, body, erro ou resposta.
  - A referência interna atual mostra a função completa em `real_dev/web/src/lib/apiClient.ts:65` a `103`, com `credentials: "include"`, JSON body, status `204`, parse de JSON e `ApiError`.
- Expected: se o passo é de revisão, deve dizer `Sem código neste passo` ou mostrar a função completa/localização exata a preservar.
- Observed: o guia apresenta snippet parcial como se fosse código completo.
- Impacto pedagógico: o aluno pode introduzir só o fragmento e perder tratamento de erros/respostas do cliente API.
- Impacto técnico/segurança: risco de regressão no cliente HTTP autenticado e de falhas em chamadas com cookie.
- Causa provável: tentativa de destacar apenas a linha de `credentials` sem ajustar a regra rígida de código completo da prompt.
- Correção recomendada: substituir por revisão sem código, ou mostrar a função `request` completa do cliente API com o contrato de cookie e erro preservado.

#### MF6-AUD-20260623-BK07-F03

- BK/RF/RNF afetado: `BK-MF6-07` / `RNF14`
- Severidade: `P3`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md:422` contém `Negativos: minimo`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md:443` contém `Proximo BK recomendado`.
- Expected: texto destinado aos alunos deve usar português de Portugal com acentuação correta, por exemplo `mínimo` e `Próximo`.
- Observed: duas palavras narrativas continuam sem acento.
- Impacto pedagógico: pequeno, mas viola a regra explícita de língua da prompt.
- Impacto técnico/segurança: nenhum impacto técnico direto.
- Causa provável: resíduos ASCII de versão anterior do guia.
- Correção recomendada: substituir `minimo` por `mínimo` e `Proximo` por `Próximo`.

#### MF6-AUD-20260623-BK08-F01

- BK/RF/RNF afetado: `BK-MF6-08` / `RNF15`
- Severidade: `P2`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md:220` manda editar `apps/api/src/server.js`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md:227` promete "Código completo, correto e integrado".
  - O bloco das linhas `229` a `233` mostra apenas o import e `app.use(requireTrustedOrigin({ appBaseUrl, isProduction }))`.
  - A referência interna atual tem `isProduction` e `appBaseUrl` em `real_dev/api/src/server.js:57` e `58`, e os routers começam em `real_dev/api/src/server.js:62`; a posição antes dos routers é crítica para cumprir o próprio passo.
- Expected: o guia deve mostrar uma versão completa e integrada da zona de imports/configuração/middlewares de `server.js`, com a montagem antes dos routers e mantendo `express.json()`.
- Observed: o guia deixa a integração como fragmento, obrigando o aluno a inferir a localização e o contexto.
- Impacto pedagógico: médio; o aluno pode montar depois das rotas ou perder o contexto de variáveis, fazendo o smoke passar ou falhar sem compreender a arquitetura.
- Impacto técnico/segurança: pedidos mutáveis podem ficar sem proteção de origem se o middleware for montado tarde ou incompletamente.
- Causa provável: o guia tratou uma alteração transversal de segurança como patch curto, não como trecho integrado de servidor.
- Correção recomendada: substituir o passo 3 por bloco integrado da secção inicial de `server.js`, com import, constantes `isProduction`/`appBaseUrl`, `express.json()` e `requireTrustedOrigin` antes de qualquer router.

#### MF6-AUD-20260623-BK08-F02

- BK/RF/RNF afetado: `BK-MF6-08` / `RNF15`
- Severidade: `P3`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md:429` contém `Negativos: minimo`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md:449` contém `Proximo BK recomendado`.
- Expected: texto destinado aos alunos deve usar português de Portugal com acentuação correta, por exemplo `mínimo` e `Próximo`.
- Observed: duas palavras narrativas continuam sem acento.
- Impacto pedagógico: pequeno, mas viola a regra explícita de língua da prompt.
- Impacto técnico/segurança: nenhum impacto técnico direto.
- Causa provável: resíduos ASCII de versão anterior do guia.
- Correção recomendada: substituir `minimo` por `mínimo` e `Proximo` por `Próximo`.

### Mapa de integração da MF

#### BK-MF6-07

- Ficheiros previstos pelo BK: `apps/api/src/modules/auth/sessionCookie.js`, `apps/api/src/modules/auth/authController.js`, `apps/api/src/modules/auth/authMiddleware.js`, `apps/web/src/lib/apiClient.ts`, `apps/api/scripts/check-mf6-session-cookie.mjs`, `apps/api/package.json`
- Ficheiros editados nesta execução: nenhum
- Exports produzidos/afetados pelo BK: `setSessionCookie`, `clearSessionCookie`, `buildSessionCookieOptions`; o guia deveria preservar `readSessionCookie`
- Imports consumidos de BKs anteriores: `readSessionCookie` criado em `BK-MF0-01`, login/logout MF0, cliente API com `credentials: "include"`
- Endpoints criados: nenhum endpoint novo; reforça login, logout e `/api/auth/me`
- DTOs/validators criados: nenhum
- Schemas/modelos criados: nenhum schema novo; reutiliza sessão server-side/utilizador já existentes
- Services criados: nenhum
- Componentes/páginas frontend criados: nenhum
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: cookie `HttpOnly`, `Secure` em produção, `SameSite=Lax`, `Path=/`, não guardar tokens em storage JavaScript
- Testes criados pelo BK: `apps/api/scripts/check-mf6-session-cookie.mjs` e validações manuais de login/logout
- BKs seguintes dependentes: `BK-MF6-08`
- Estado de integração atual: `CRITICO`, porque o ficheiro completo proposto remove `readSessionCookie`

#### BK-MF6-08

- Ficheiros previstos pelo BK: `apps/api/src/modules/security/requestHardening.js`, `apps/api/src/server.js`, `apps/api/src/modules/auth/authRateLimit.js`, `apps/api/scripts/check-mf6-hardening.mjs`, `apps/api/package.json`
- Ficheiros editados nesta execução: nenhum
- Exports produzidos pelo BK: `requireTrustedOrigin`, `escapeHtml`
- Imports consumidos de BKs anteriores: cookie seguro de `BK-MF6-07`, HTTPS de `BK-MF6-05`, bcrypt/rate limit de `BK-MF6-06`, validators financeiros anteriores
- Endpoints criados: nenhum endpoint novo; aplica middleware transversal a métodos mutáveis
- DTOs/validators criados: nenhum novo; exige validação backend já existente antes de Prisma
- Schemas/modelos criados: nenhum
- Services criados: nenhum service de domínio; cria helper/middleware de segurança
- Componentes/páginas frontend criados: nenhum
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: origem confiável em métodos mutáveis, rate limit de autenticação, validação contra injeção, escape de HTML quando a API gerar HTML
- Testes criados pelo BK: `apps/api/scripts/check-mf6-hardening.mjs` e negativos de CSRF, brute force e input malicioso
- BKs seguintes dependentes: `BK-MF6-09`
- Estado de integração atual: `PARCIAL`, porque a montagem global em `server.js` ainda não é apresentada como código completo integrado

### Decisões confirmadas

- `CANONICO`: `RNF14` exige sessões com cookies `HttpOnly`, `Secure` e `SameSite`.
- `CANONICO`: `RNF15` exige prevenção de SQL/NoSQL Injection, XSS, CSRF e brute force.
- `CANONICO`: `RF01` define registo, login e logout com cookies HttpOnly e cria o contrato de sessão inicial.
- `CANONICO`: a matriz, backlog, contrato de campos e índice de guias canonizam `BK-MF6-07` e `BK-MF6-08` como `P0`, `S10-S11`, owner `Oleksii`, apoio `Andre`, dependências formais `-` e sequência `BK-MF6-07` -> `BK-MF6-08` -> `BK-MF6-09`.
- `DERIVADO`: `Secure` condicionado por `isProduction`/`NODE_ENV=production` é decisão técnica mínima coerente com desenvolvimento local e produção HTTPS.
- `DERIVADO`: `SameSite=Lax` é baseline simples para reduzir CSRF numa app web tradicional com cookies.
- `DERIVADO`: `requireTrustedOrigin` antes dos routers é necessário porque a proteção deve aplicar-se a todos os métodos mutáveis futuros.

### Drift documental encontrado

- O histórico do relatório marcava `BK-MF6-07` e `BK-MF6-08` como `OK` após a hidratação integral, mas a reauditoria atual com a prompt rígida de código completo e preservação de contratos anteriores confirma um drift de qualidade: `BK-MF6-07` quebra um export de MF0 e `BK-MF6-08` deixa uma integração crítica como fragmento.
- Não foi encontrada fuga de caminhos internos `real_dev` nos dois BKs alvo.
- Não foi encontrado domínio de outra PAP nos dois BKs alvo.
- A pesquisa obrigatória de risco na MF6 completa devolveu `companyId` em BKs fora do alvo (`BK-MF6-01`, `BK-MF6-03`, `BK-MF6-04`, `BK-MF6-10`) e `password` no BK de bcrypt (`BK-MF6-06`); não foram promovidos a findings desta execução porque estão fora de `BK_IDS` ou são contexto esperado do requisito.
- Nos dois BKs alvo, a mesma pesquisa devolveu apenas `estado: TODO` e `Rate limit`, sem novo finding técnico além dos registados acima.
- A pesquisa de acentuação encontrou `minimo` e `Proximo` nos dois BKs alvo; estes resíduos ficaram registados como P3 porque `MODO=auditar_apenas`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5` -> `MF6`: coerência preservada nos requisitos de UX/performance como baseline; a falha atual é interna à executabilidade dos BKs de segurança, não às decisões de MF5.
- `BK-MF6-06` -> `BK-MF6-07`: coerência parcialmente quebrada; bcrypt/login seguro prepara sessão, mas `BK-MF6-07` pode quebrar leitura de sessão se o aluno substituir o ficheiro completo sem `readSessionCookie`.
- `BK-MF6-07` -> `BK-MF6-08`: coerência funcional prevista, mas dependente da correção do helper de sessão antes de aplicar CSRF/XSS/hardening.
- `BK-MF6-08` -> `BK-MF6-09`: coerência preservada em intenção; hardening transversal prepara gestão de credenciais, mas a montagem em `server.js` precisa de ficar completa.
- `MF6` -> `MF7`: sem drift funcional confirmado no scope auditado, salvo risco de sessões/hardening incompletos bloquearem operações futuras protegidas.

### Verificações executadas

- Pesquisa canónica por `BK-MF6-07`, `BK-MF6-08`, `RNF14`, `RNF15`, `RF01`, cookies, `HttpOnly`, `Secure`, `SameSite`, SQL/NoSQL Injection, XSS, CSRF e brute force em RF/RNF, matriz, backlog, contrato de campos, MF-VIEWS, plano de sprints e guias BK.
- Leitura focada de `BK-MF0-01`, `BK-MF6-06`, `BK-MF6-07`, `BK-MF6-08`, `BK-MF6-09` e relatório histórico MF6 para preservar dependências e handoff.
- Consulta de referência interna em `real_dev/api/src/modules/auth/sessionCookie.js`, `real_dev/api/src/modules/auth/authController.js`, `real_dev/api/src/modules/auth/authRateLimit.js`, `real_dev/api/src/server.js` e `real_dev/web/src/lib/apiClient.ts`.
- Pesquisa obrigatória de risco nos dois BKs alvo:
  - Comando: `rg -n "apiKey|secret|token|password|\\.env|PRIVATE_KEY|companyId|localStorage|sessionStorage|mock|stub|fake|tempor|hardcoded|placeholder|pseudo-codigo|pseudo-código|snippet|helpers por criar|payload: unknown|as any|TODO|console\\.log|deleteMany\\(\\{\\}\\)|delete\\(\\{\\}\\)|updateMany\\(\\{\\}\\)|CORS|Access-Control-Allow-Origin|RAG|embeddings|OCR|SAF-T completo|integracoes bancarias reais|integrações bancárias reais|automacao contabilistica|automação contabilística|biometria|streaming|pool solidaria|turma|professor|sala|material de estudo" ...BK-MF6-07... ...BK-MF6-08...`
  - Resultado: apenas `estado: TODO` e `Rate limit`, sem novo finding técnico.
- Pesquisa obrigatória de risco na MF6 completa:
  - Comando: `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|placeholder|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|helpers por criar|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|chunking semantico|chunking semântico|RAG|embeddings|OCR|SAF-T completo|integracoes bancarias reais|integrações bancárias reais|automacao contabilistica|automação contabilística|companyId|payload: unknown|as any|localStorage|sessionStorage|deleteMany\\(\\{\\}\\)|delete\\(\\{\\}\\)|updateMany\\(\\{\\}\\)|apiKey|PRIVATE_KEY|password|secret|token|CORS|Access-Control-Allow-Origin|cosmetica|cosmética|biometria|streaming|pool solidaria|turma|professor|sala|material de estudo" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: ocorrências contextuais de `companyId` em BKs fora do alvo e `password` em `BK-MF6-06`; sem fuga técnica nova nos dois BKs alvo.
- Pesquisa de fuga de caminho interno:
  - Comando: `rg -n "real_dev|real-dev|cd real_dev|real_dev/" ...BK-MF6-07... ...BK-MF6-08...`
  - Resultado: sem ocorrências.
- Pesquisa focada de acentuação:
  - Comando: `rg -n "\\b(minimo|minimos|Proximo)\\b" ...BK-MF6-07... ...BK-MF6-08...`
  - Resultado: quatro ocorrências confirmadas nos dois BKs alvo.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`; `advisory_pass=false` por avisos heurísticos/preexistentes de qualidade documental, incluindo regras antigas como `missing_pedagogic_or_operational_blocks` e `missing_or_placeholder_snippet`.

### Riscos restantes e TODOs

- `BK-MF6-07`: corrigir bloco de `sessionCookie.js` para preservar `readSessionCookie` e manter o helper central sem quebrar MF0.
- `BK-MF6-07`: substituir o snippet de `credentials: "include"` por revisão sem código ou função completa do cliente API.
- `BK-MF6-07`: corrigir acentuação de `minimo` e `Proximo`.
- `BK-MF6-08`: substituir o snippet de montagem em `server.js` por bloco integrado completo antes dos routers.
- `BK-MF6-08`: corrigir acentuação de `minimo` e `Proximo`.
- Próxima ação recomendada: executar `MODO=corrigir_apenas` para estes findings, mantendo `BK_IDS: [BK-MF6-07, BK-MF6-08]`.

## Execução atual - correção dos findings P3 BK-MF6-05 e BK-MF6-06

### Escopo desta correção

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-05`, `BK-MF6-06`
- Modo executado: `corrigir_apenas`
- Fonte dos findings: reauditoria registada abaixo neste relatório
- Código de implementação em `apps/`: não editado
- `real_dev/`: não editado e não referenciado nos BKs dos alunos
- BKs editados: `BK-MF6-05`, `BK-MF6-06`
- Relatório atualizado: este ficheiro
- Commits: não executados

### Resumo executivo da correção

Foram corrigidos os dois resíduos linguísticos P3 identificados na reauditoria: `minimo` passou para `mínimo` e `Proximo BK recomendado` passou para `Próximo BK recomendado` nos dois BKs alvo. A correção é exclusivamente editorial/pedagógica; não altera contratos técnicos, comandos, código de implementação, endpoints, testes ou regras de segurança.

### Resultado antes e depois desta correção

| Métrica | Estado após reauditoria | Estado após correção |
| --- | ---: | ---: |
| BKs corrigidos | 0 | 2 |
| OK | 0 | 2 |
| PARCIAL | 2 | 0 |
| CRITICO | 0 | 0 |

### Findings corrigidos

#### MF6-AUD-20260623-BK05-F02

- BK/RF/RNF afetado: `BK-MF6-05` / `RNF12`
- Severidade: `P3`
- Estado do finding após correção: `CORRIGIDO`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:468` contém agora `Negativos: mínimo`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:488` contém agora `Próximo BK recomendado`.
- Impacto técnico/segurança: nenhum; o contrato HTTPS/HSTS permanece inalterado.

#### MF6-AUD-20260623-BK06-F03

- BK/RF/RNF afetado: `BK-MF6-06` / `RNF13`
- Severidade: `P3`
- Estado do finding após correção: `CORRIGIDO`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:483` contém agora `Negativos: mínimo`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:505` contém agora `Próximo BK recomendado`.
- Impacto técnico/segurança: nenhum; o contrato bcrypt/login/testes permanece inalterado.

### Validação executada

- `rg -n '\b(minimo|minimos|Proximo)\b' docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md` sem ocorrências.
- `rg -n 'real_dev|real-dev|cd real_dev|real_dev/' docs/planificacao/guias-bk/MF6/*.md` sem ocorrências.
- `rg -n '[ \t]+$' docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md` sem ocorrências.
- `git diff --check` sem erros.
- `bash scripts/validate-planificacao.sh` com `overall_pass=true`; o `advisory_pass=false` global permanece por avisos heurísticos/preexistentes fora desta correção.

## Execução atual - reauditoria apenas BK-MF6-05 e BK-MF6-06

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-05`, `BK-MF6-06`
- Modo: `auditar_apenas`
- Relatório usado como histórico: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- `real_dev/`: consultado apenas como referência interna, não editado e não referenciado nos BKs dos alunos
- Código de implementação em `apps/`: não editado
- BKs editados: nenhum, conforme `MODO=auditar_apenas`
- Relatório atualizado: este ficheiro
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos 10 BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta reauditoria preservou esse estado, não editou BKs, não tocou em `apps/`, `legacy/`, `real_dev/`, RF/RNF ou documentos canónicos, e acrescentou apenas esta secção de relatório.

### Resumo executivo

A reauditoria confirma que os três findings técnicos anteriormente corrigidos continuam fechados: o smoke de `BK-MF6-05` já cobre `trust proxy`, `enforceHttps`, `applyStrictTransportSecurity` e ordem antes das rotas; o login de `BK-MF6-06` já usa uma função completa com `httpError`; e o teste bcrypt já tem suite completa com imports e negativos.

No entanto, a prompt atual inclui uma regra rígida de língua: texto narrativo e pedagógico destinado aos alunos deve estar em português de Portugal natural com acentuação correta. Nesse gate, ainda há dois resíduos objetivos nos BKs alvo: `minimo` e `Proximo` aparecem sem acento em secções finais. Como o modo é `auditar_apenas`, os BKs não foram corrigidos nesta execução e ficam `PARCIAL` por lacuna pedagógica P3.

### Resultado antes e depois desta reauditoria

| Métrica | Estado anterior no relatório | Estado reauditoria atual |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 2 | 0 |
| PARCIAL | 0 | 2 |
| CRITICO | 0 | 0 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Estado anterior | Estado reauditoria atual | Motivo |
| --- | --- | --- | --- | --- | --- |
| `BK-MF6-05` | `RNF12` | `P0` | `OK` | `PARCIAL` | contrato técnico validado, mas há texto pedagógico sem acentuação em critérios/handoff |
| `BK-MF6-06` | `RNF13` | `P0` | `OK` | `PARCIAL` | contrato técnico validado, mas há texto pedagógico sem acentuação em critérios/handoff |

### Findings anteriores revalidados

#### MF6-AUD-20260623-BK05-F01

- BK/RF/RNF afetado: `BK-MF6-05` / `RNF12`
- Severidade original: `P2`
- Estado do finding nesta reauditoria: `JA_CORRIGIDO`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:299` a `314` define `requireMarker`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:319` a `352` valida `HTTPS_REQUIRED`, HSTS, `trust proxy`, `enforceHttps`, `applyStrictTransportSecurity` e ordem antes de `/api/auth`.
- Resultado: a hipótese anterior não se reproduz no guia atual.

#### MF6-AUD-20260623-BK06-F01

- BK/RF/RNF afetado: `BK-MF6-06` / `RNF13`
- Severidade original: `P1`
- Estado do finding nesta reauditoria: `JA_CORRIGIDO`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:249` a `285` mostra a função completa `loginUser`.
  - O bloco preserva `verifyPassword`, `httpError(401, "INVALID_CREDENTIALS", "Credenciais inválidas")`, `createSession` e `publicUser`, alinhado com `apps/api/src/modules/auth/authService.js`.
- Resultado: o fragmento de login com `throw new Error(...)` já não existe.

#### MF6-AUD-20260623-BK06-F02

- BK/RF/RNF afetado: `BK-MF6-06` / `RNF13`
- Severidade original: `P2`
- Estado do finding nesta reauditoria: `JA_CORRIGIDO`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:361` a `409` define a suite `apps/api/tests/unit/mf6-password.test.js` com imports, asserts, custo bcrypt, tentativa errada e hash inválido.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:487` a `490` inclui a suite na validação final.
- Resultado: o teste deixou de ser snippet solto e ficou executável no contrato documental.

### Findings novos confirmados nesta reauditoria

#### MF6-AUD-20260623-BK05-F02

- BK/RF/RNF afetado: `BK-MF6-05` / `RNF12`
- Severidade: `P3`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:468` contém `Negativos: minimo`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:488` contém `Proximo BK recomendado`.
- Expected: texto destinado aos alunos deve usar português de Portugal com acentuação correta, por exemplo `mínimo` e `Próximo`.
- Observed: duas palavras narrativas continuam sem acento.
- Impacto pedagógico: pequeno, mas viola a regra explícita de língua da prompt e enfraquece a consistência editorial do guia.
- Impacto técnico/segurança: nenhum impacto técnico direto; o contrato HTTPS/HSTS permanece validado.
- Causa provável: resíduos ASCII de versão anterior do guia.
- Correção recomendada: substituir `minimo` por `mínimo` e `Proximo` por `Próximo`.

#### MF6-AUD-20260623-BK06-F03

- BK/RF/RNF afetado: `BK-MF6-06` / `RNF13`
- Severidade: `P3`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:483` contém `Negativos: minimo`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:505` contém `Proximo BK recomendado`.
- Expected: texto destinado aos alunos deve usar português de Portugal com acentuação correta, por exemplo `mínimo` e `Próximo`.
- Observed: duas palavras narrativas continuam sem acento.
- Impacto pedagógico: pequeno, mas viola a regra explícita de língua da prompt e deixa o guia editorialmente incompleto.
- Impacto técnico/segurança: nenhum impacto técnico direto; o contrato bcrypt/login/testes permanece validado.
- Causa provável: resíduos ASCII de versão anterior do guia.
- Correção recomendada: substituir `minimo` por `mínimo` e `Proximo` por `Próximo`.

### Mapa de integração da MF

#### BK-MF6-05

- Ficheiros previstos pelo BK: `apps/api/src/modules/security/transportSecurity.js`, `apps/api/src/server.js`, `apps/api/scripts/check-mf6-https.mjs`, `apps/api/package.json`, revisão de `apps/web/src/lib/apiClient.ts`
- Ficheiros editados nesta execução: nenhum
- Exports produzidos pelo BK: `enforceHttps`, `applyStrictTransportSecurity`
- Imports consumidos de BKs anteriores: Express em `server.js`, cliente API e contrato de sessão já existente
- Endpoints criados: nenhum endpoint novo; todos os endpoints passam pelo middleware global
- DTOs/validators criados: nenhum
- Schemas/modelos criados: nenhum
- Services criados: nenhum
- Componentes/páginas frontend criados: nenhum
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: HTTPS obrigatório em produção, HSTS em produção, `trust proxy`, desenvolvimento local sem bloqueio
- Testes criados pelo BK: `apps/api/scripts/check-mf6-https.mjs`
- BKs seguintes dependentes: `BK-MF6-06` e `BK-MF6-07`
- Estado de integração técnica atual: `OK`
- Estado pedagógico/editorial atual: `PARCIAL`

#### BK-MF6-06

- Ficheiros previstos pelo BK: `apps/api/src/modules/auth/password.js`, `apps/api/src/modules/auth/authService.js`, `apps/api/src/modules/auth/passwordResetService.js`, `apps/api/scripts/check-mf6-bcrypt.mjs`, `apps/api/tests/unit/mf6-password.test.js`, `apps/api/package.json`
- Ficheiros editados nesta execução: nenhum
- Exports produzidos pelo BK: `BCRYPT_ROUNDS`, `hashPassword`, `verifyPassword`
- Imports consumidos de BKs anteriores: `httpError`, `createSession`, `publicUser`, autenticação MF0 e recuperação de password
- Endpoints criados: nenhum endpoint novo; reforça registo, login e reset existentes
- DTOs/validators criados: nenhum novo obrigatório; reutiliza validators de auth/reset
- Schemas/modelos criados: nenhum schema novo; reutiliza `User.passwordHash` e tokens de reset
- Services criados: nenhum service novo; endurece helper e confirma `authService`/`passwordResetService`
- Componentes/páginas frontend criados: nenhum
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: bcrypt com salt, custo mínimo, rejeição de password curta, comparação segura, ausência de persistência de credenciais no browser
- Testes criados pelo BK: `apps/api/scripts/check-mf6-bcrypt.mjs` e `apps/api/tests/unit/mf6-password.test.js`
- BKs seguintes dependentes: `BK-MF6-07`
- Estado de integração técnica atual: `OK`
- Estado pedagógico/editorial atual: `PARCIAL`

### Decisões confirmadas

- `CANONICO`: `RNF12` exige HTTPS com TLS 1.2 ou superior.
- `CANONICO`: `RNF13` exige bcrypt com salt seguro e sem texto claro.
- `CANONICO`: `RNF14` vem a seguir e depende de sessões com cookies `HttpOnly`, `Secure` e `SameSite`.
- `CANONICO`: `RF01` define registo, login e logout com cookies HttpOnly.
- `CANONICO`: `RF05` define recuperação de password via email.
- `DERIVADO`: `app.set("trust proxy", 1)` é decisão técnica mínima para Express atrás de proxy.
- `DERIVADO`: `BCRYPT_ROUNDS = 12` é baseline pedagógica documentada e testável.
- `DERIVADO`: `apps/api/tests/unit/mf6-password.test.js` é uma suite dedicada mais clara do que misturar testes bcrypt numa suite MF0.

### Drift documental encontrado

- Não foi encontrada fuga de caminhos internos `real_dev` nos BKs MF6.
- Não foi encontrado drift de domínio de outras PAPs nos dois BKs alvo.
- A pesquisa obrigatória de risco devolveu `password` em `BK-MF6-06`; é falso positivo esperado porque o BK trata precisamente de passwords/bcrypt.
- A pesquisa obrigatória de risco devolveu `companyId` em BKs MF6 fora do alvo; não foi promovido a finding nesta execução porque `BK-MF6-01`, `BK-MF6-03`, `BK-MF6-04` e `BK-MF6-10` estão fora de `BK_IDS`.
- O validador global continua com `advisory_pass=false` por avisos heurísticos/preexistentes em várias MFs/BKs. No scope atual, os únicos novos problemas confirmados nos dois BKs alvo são os resíduos linguísticos P3 acima.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5` -> `MF6`: coerência preservada; a reauditoria não assume a MF6 como implementada em `real_dev` e usa a referência apenas para contratos anteriores.
- `BK-MF6-04` -> `BK-MF6-05`: coerência preservada; FIFO/performance antecede segurança de transporte sem conflito.
- `BK-MF6-05` -> `BK-MF6-06`: coerência técnica preservada; password segura pressupõe transporte seguro e o smoke reforçado sustenta esse handoff.
- `BK-MF6-06` -> `BK-MF6-07`: coerência técnica preservada; bcrypt/login seguro prepara cookies `HttpOnly`, `Secure` e `SameSite`.
- `MF6` -> `MF7`: sem drift funcional no scope auditado.

### Verificações executadas

- Pesquisa canónica por `RNF12`, `RNF13`, `RNF14`, `RF01`, `RF05`, `BK-MF6-04`, `BK-MF6-05`, `BK-MF6-06` e `BK-MF6-07` em RF/RNF, matriz, backlog, contrato de campos, MF-VIEWS, plano de sprints e guias BK.
- Pesquisa focada de linguagem nos dois BKs alvo:
  - Comando: `rg -n "\b(minimo|minimos|Proximo)\b" ...BK-MF6-05... ...BK-MF6-06...`
  - Resultado: quatro ocorrências confirmadas nos dois BKs alvo.
- Pesquisa obrigatória de risco na MF6:
  - Resultado: ocorrências contextuais de `companyId` em BKs fora do alvo e de `password` no BK de bcrypt; sem novo problema técnico confirmado nos dois BKs alvo.
- Pesquisa de fuga de caminho interno:
  - Comando: `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false`.

### Riscos restantes e TODOs

- `BK-MF6-05`: corrigir acentuação de `minimo` e `Proximo`.
- `BK-MF6-06`: corrigir acentuação de `minimo` e `Proximo`.
- Sem bloqueios técnicos ou de segurança nos dois BKs alvo.
- Risco residual global: `advisory_pass=false` permanece fora do scope desta prompt e deve ser tratado noutra execução se o objetivo for fechar dívida documental global.

## Execução atual - correção apenas BK-MF6-05 e BK-MF6-06

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-05`, `BK-MF6-06`
- Modo: `corrigir_apenas`
- Relatório usado como ponto de partida: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Findings tratados: `MF6-AUD-20260623-BK05-F01`, `MF6-AUD-20260623-BK06-F01`, `MF6-AUD-20260623-BK06-F02`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- `real_dev/`: não editado e não referenciado nos BKs dos alunos
- Código de implementação em `apps/`: não editado, conforme contrato desta execução
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais em `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, nos 10 BKs de `MF6` e relatórios untracked em `docs/planificacao/guias-bk/`. Esta execução preservou esse estado, alterou apenas os dois BKs alvo e este relatório permitido, e não tocou em `apps/`, `legacy/`, `real_dev/`, RF/RNF ou documentos canónicos.

### Resumo executivo

Os dois BKs alvo estavam classificados como `PARCIAL` pela auditoria anterior porque os guias ainda obrigavam o aluno a inferir parte da integração técnica. A correção atual fecha essas lacunas documentais:

- `BK-MF6-05`: o smoke textual passou a validar `trust proxy`, `enforceHttps`, `applyStrictTransportSecurity` e ordem antes das rotas.
- `BK-MF6-06`: o passo de login passou a mostrar a função completa `loginUser` com `httpError`, `verifyPassword`, sessão server-side e resposta segura.
- `BK-MF6-06`: o teste unitário passou a ser uma suite completa `apps/api/tests/unit/mf6-password.test.js`, com imports, asserts, custo bcrypt e negativos.

### Resultado antes e depois desta correção

| Métrica | Antes da correção | Depois da correção |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 0 | 2 |
| PARCIAL | 2 | 0 |
| CRITICO | 0 | 0 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Estado antes | Estado depois | Motivo |
| --- | --- | --- | --- | --- | --- |
| `BK-MF6-05` | `RNF12` | `P0` | `PARCIAL` | `OK` | smoke textual passou a provar a montagem completa e a ordem do contrato HTTPS/HSTS |
| `BK-MF6-06` | `RNF13` | `P0` | `PARCIAL` | `OK` | login e teste unitário deixaram de ser fragmentos soltos e ficaram integrados com o padrão real da app |

### Findings tratados nesta correção

#### MF6-AUD-20260623-BK05-F01

- BK/RF/RNF afetado: `BK-MF6-05` / `RNF12`
- Severidade: `P2`
- Estado do finding: `CORRIGIDO`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:299` a `314` adiciona `requireMarker` com JSDoc para procurar contratos textuais obrigatórios.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:319` a `352` valida `HTTPS_REQUIRED`, `Strict-Transport-Security`, `app.set("trust proxy", 1)`, `enforceHttps`, `applyStrictTransportSecurity` e ordem antes de `/api/auth`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:357` explica que o smoke não substitui certificado real, mas impede fechar o BK sem montagem global.
- Expected após correção: se o aluno esquecer `trust proxy`, HSTS montado ou ordem antes das rotas, o smoke falha.
- Observed após correção: o guia já ensina e valida o contrato completo exigido pelo próprio BK.
- Impacto pedagógico: reduz a falsa confiança de um smoke demasiado fraco.
- Impacto técnico/segurança: reforça transporte seguro para dados financeiros, fiscais e de sessão.
- Causa raiz corrigida: smoke textual incompleto face aos critérios de aceite.
- Validação: inspeção textual do BK corrigido, pesquisa de `real_dev`, `git diff --check` e `bash scripts/validate-planificacao.sh`.

#### MF6-AUD-20260623-BK06-F01

- BK/RF/RNF afetado: `BK-MF6-06` / `RNF13`
- Severidade: `P1`
- Estado do finding: `CORRIGIDO`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:249` a `285` substitui o fragmento de login por função completa `loginUser`.
  - O bloco usa `verifyPassword`, `httpError(401, "INVALID_CREDENTIALS", "Credenciais inválidas")`, `createSession` e `publicUser`, alinhado com `apps/api/src/modules/auth/authService.js`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:287` a `289` explica por que `throw new Error(...)` não deve substituir o contrato HTTP.
- Expected após correção: o aluno vê a função completa e preserva o erro HTTP controlado.
- Observed após correção: o bloco já não é um fragmento solto e já não ensina `Error` genérico em autenticação.
- Impacto pedagógico: remove ambiguidade sobre onde e como aplicar a comparação bcrypt no login.
- Impacto técnico/segurança: preserva resposta genérica contra enumeração de contas e mantém contrato de API.
- Causa raiz corrigida: passo de revisão continha código parcial apresentado como solução.
- Validação: inspeção textual do BK corrigido e comparação com padrão existente em `apps/api/src/modules/auth/authService.js`.

#### MF6-AUD-20260623-BK06-F02

- BK/RF/RNF afetado: `BK-MF6-06` / `RNF13`
- Severidade: `P2`
- Estado do finding: `CORRIGIDO`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:91` a `98` declara `CRIAR: apps/api/tests/unit/mf6-password.test.js`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:361` a `409` define ficheiro completo, imports, teste positivo, tentativa errada, hash inválido e comando `node --test`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:487` a `490` inclui a suite na validação final.
- Expected após correção: o aluno consegue criar a suite sem adivinhar imports, ficheiro ou ponto de inserção.
- Observed após correção: o teste ficou executável no contrato documental do BK.
- Impacto pedagógico: reduz erro de colar teste incompleto numa suite errada.
- Impacto técnico/segurança: torna a evidence de bcrypt verificável por comando específico.
- Causa raiz corrigida: bloco de teste curto sem imports nem localização exata.
- Validação: inspeção textual do BK corrigido, pesquisa obrigatória de risco e `git diff --check`.

### Mapa de integração da MF

#### BK-MF6-05

- Ficheiros previstos pelo BK: `apps/api/src/modules/security/transportSecurity.js`, `apps/api/src/server.js`, `apps/api/scripts/check-mf6-https.mjs`, `apps/api/package.json`, revisão de `apps/web/src/lib/apiClient.ts`
- Ficheiros editados nesta execução: `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md`
- Exports produzidos pelo BK: `enforceHttps`, `applyStrictTransportSecurity`
- Imports consumidos de BKs anteriores: Express em `server.js`, cliente API e contrato de sessão já existente
- Endpoints criados: nenhum endpoint novo; todos os endpoints passam pelo middleware global
- DTOs/validators criados: nenhum
- Schemas/modelos criados: nenhum
- Services criados: nenhum
- Componentes/páginas frontend criados: nenhum
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: HTTPS obrigatório em produção, HSTS em produção, `trust proxy`, desenvolvimento local sem bloqueio
- Testes criados pelo BK: `apps/api/scripts/check-mf6-https.mjs`
- BKs seguintes dependentes: `BK-MF6-06` e `BK-MF6-07`
- Estado de integração atual: `OK`

#### BK-MF6-06

- Ficheiros previstos pelo BK: `apps/api/src/modules/auth/password.js`, `apps/api/src/modules/auth/authService.js`, `apps/api/src/modules/auth/passwordResetService.js`, `apps/api/scripts/check-mf6-bcrypt.mjs`, `apps/api/tests/unit/mf6-password.test.js`, `apps/api/package.json`
- Ficheiros editados nesta execução: `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md`
- Exports produzidos pelo BK: `BCRYPT_ROUNDS`, `hashPassword`, `verifyPassword`
- Imports consumidos de BKs anteriores: `httpError`, `createSession`, `publicUser`, autenticação MF0 e recuperação de password
- Endpoints criados: nenhum endpoint novo; reforça registo, login e reset existentes
- DTOs/validators criados: nenhum novo obrigatório; reutiliza validators de auth/reset
- Schemas/modelos criados: nenhum schema novo; reutiliza `User.passwordHash` e tokens de reset
- Services criados: nenhum service novo; endurece helper e confirma `authService`/`passwordResetService`
- Componentes/páginas frontend criados: nenhum
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: bcrypt com salt, custo mínimo, rejeição de password curta, comparação segura, ausência de persistência de credenciais no browser
- Testes criados pelo BK: `apps/api/scripts/check-mf6-bcrypt.mjs` e `apps/api/tests/unit/mf6-password.test.js`
- BKs seguintes dependentes: `BK-MF6-07`
- Estado de integração atual: `OK`

### Decisões confirmadas

- `CANONICO`: `RNF12` exige HTTPS com TLS 1.2 ou superior.
- `CANONICO`: `RNF13` exige bcrypt com salt seguro e sem texto claro.
- `CANONICO`: `RF01` define autenticação com sessão/cookie; `BK-MF6-06` deve preservar `httpError` e sessão server-side já existentes.
- `CANONICO`: `BK-MF6-07` vem a seguir e depende de transporte/password seguros antes de reforçar cookies.
- `DERIVADO`: `app.set("trust proxy", 1)` é a decisão mínima para Express interpretar `x-forwarded-proto` atrás de proxy.
- `DERIVADO`: `BCRYPT_ROUNDS = 12` fica documentado e testado como baseline pedagógica, mantendo a possibilidade de medição em produção.
- `DERIVADO`: criar `apps/api/tests/unit/mf6-password.test.js` é mais claro do que inserir testes de bcrypt numa suite de validators MF0.

### Drift documental encontrado

- Não foi encontrada fuga de caminhos internos `real_dev` nos BKs MF6.
- Não foi encontrado drift de domínio de outras PAPs nos dois BKs alvo.
- A pesquisa de risco devolveu `password` em `BK-MF6-06`; é falso positivo esperado porque o BK trata precisamente de passwords/bcrypt.
- A pesquisa de risco devolveu `companyId` noutros BKs MF6 fora do alvo; não foram alterados nesta execução por `STRICT_SCOPE=true`.
- O validador global mantém `advisory_pass=false` por avisos heurísticos amplos em guias de várias MFs; no scope atual, a correção fechou os três findings confirmados para `BK-MF6-05` e `BK-MF6-06`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5` -> `MF6`: coerência preservada; a correção usa apenas contratos de autenticação, API e frontend já existentes, sem assumir MF6 implementada em `real_dev`.
- `BK-MF6-05` -> `BK-MF6-06`: coerência reforçada; password segura passa a assentar num transporte HTTPS/HSTS com smoke mais completo.
- `BK-MF6-06` -> `BK-MF6-07`: coerência reforçada; bcrypt e login seguro preparam cookies `HttpOnly`, `Secure` e `SameSite`.
- `MF6` -> `MF7`: sem alteração de domínio; segurança técnica continua a preparar integrações e auditoria posteriores sem inventar requisitos.

### Verificações executadas

- Pesquisa obrigatória de risco na MF6:
  - Comando: `rg -n "...padroes de risco..." docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: ocorrências contextuais de `companyId` em BKs fora do alvo e de `password` no BK de bcrypt; sem novo problema confirmado nos dois BKs corrigidos.
- Pesquisa de fuga de caminho interno:
  - Comando: `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: sem ocorrências.
- Pesquisa de whitespace nos ficheiros editados e relatório:
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false`.
  - Nota: o advisory lista avisos globais/preexistentes, incluindo `missing_pedagogic_or_operational_blocks` e `missing_or_placeholder_snippet` em vários guias. Estes avisos não bloquearam a correção estrita dos três findings alvo.

### Riscos restantes e TODOs

- Sem TODOs bloqueantes nos dois BKs alvo após esta correção.
- Risco residual: os scripts e testes descritos nos BKs ainda são artefactos a criar pelos alunos em `apps/`; esta execução corrigiu documentação, não executou esses scripts porque `apps/` ficou fora de escrita.
- Risco residual global: `advisory_pass=false` do validador permanece fora do scope desta prompt e deve ser tratado em execução própria se for necessário fechar dívida documental de outras MFs/BKs.

## Execução atual - auditoria apenas BK-MF6-05 e BK-MF6-06

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-05`, `BK-MF6-06`
- Modo: `auditar_apenas`
- Implementation root consultado apenas como referência interna: `real_dev`
- Baseline da referência interna: `MF0..MF5`
- Estado assumido da MF alvo em implementação: `not_assumed`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Strict scope: ativo
- BKs editados: nenhum
- Código de implementação editado: nenhum
- Relatório atualizado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais nos 10 BKs MF6 e relatórios untracked em `docs/planificacao/guias-bk/`. Esta auditoria preservou esse estado, não editou BKs, não tocou em `apps/`, não tocou em `real_dev/` e só acrescentou esta secção de relatório.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF6/`, com foco em `BK-MF6-05` e `BK-MF6-06`.
- BK anterior direto: `BK-MF6-04`.
- BK seguinte direto: `BK-MF6-07`.
- BKs anteriores relevantes: `BK-MF0-01`, `BK-MF0-05`, `BK-MF5-07`.
- BKs posteriores relevantes: `BK-MF6-07`, `BK-MF6-08`, `BK-MF7-01`.
- Implementação de referência até MF5 em `real_dev/api/src/server.js`, `real_dev/api/src/modules/auth/*`, `real_dev/web/src`, `apps/api/src/server.js`, `apps/api/src/modules/auth/*` e `apps/web/src`, apenas para confirmar nomes, convenções e contratos já existentes.
- Relatórios existentes `AUDITORIA-HIDRATACAO-MF5.md` e `AUDITORIA-HIDRATACAO-MF6.md`.

### Resumo executivo

A auditoria atual confirma que os dois BKs alvo já respeitam a existência canónica, a sequência MF6, a estrutura principal `#### Objetivo` até `#### Changelog`, os caminhos `apps/...`, o mínimo de 8 passos para BKs `P0`, cenários negativos e handoff para o BK seguinte.

Ainda assim, no critério rigoroso desta prompt, os dois guias não devem ficar como `OK`: ambos mantêm lacunas de executabilidade documental que obrigam o aluno a inferir parte da integração ou permitem que um smoke passe sem provar todo o contrato descrito pelo próprio guia.

Não houve correção porque o modo é `auditar_apenas`. Os BKs alvo ficam classificados como `PARCIAL`, com findings concretos para uma próxima execução `corrigir_apenas` ou `hidratar_corrigir`.

### Resultado antes e depois desta auditoria

| Métrica | Estado anterior registado no relatório | Estado auditoria atual |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 2 | 0 |
| PARCIAL | 0 | 2 |
| CRITICO | 0 | 0 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado anterior registado | Estado auditoria atual | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-05` | `RNF12` | `P0` | `Andre` | `Oleksii` | `OK` | `PARCIAL` | guia cobre HTTPS/HSTS, mas o smoke não prova todos os critérios de transporte seguro |
| `BK-MF6-06` | `RNF13` | `P0` | `Andre` | `Pedro` | `OK` | `PARCIAL` | guia cobre bcrypt, mas blocos de login/teste continuam demasiado fragmentados para o contrato de código completo |

### Findings confirmados nesta auditoria

#### MF6-AUD-20260623-BK05-F01

- BK/RF/RNF afetado: `BK-MF6-05` / `RNF12`
- Severidade: `P2`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:222` a `230` manda montar `app.set("trust proxy", 1)`, `enforceHttps({ isProduction })` e `applyStrictTransportSecurity({ isProduction })`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:299` a `313` cria um smoke que valida `HTTPS_REQUIRED`, `Strict-Transport-Security` no ficheiro do middleware e a montagem de `enforceHttps`, mas não valida `app.set("trust proxy", 1)` nem `applyStrictTransportSecurity({ isProduction })` em `server.js`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md:424` a `425` define como critérios de aceite que o middleware HTTPS está montado globalmente e que HSTS é aplicado em produção.
- Expected: o smoke textual deve falhar se HSTS não estiver montado no servidor ou se o proxy não estiver configurado, porque esses pontos fazem parte do contrato do próprio BK.
- Observed: um aluno pode criar o middleware com HSTS no ficheiro novo, esquecer a montagem de `applyStrictTransportSecurity` ou `trust proxy` no servidor e ainda assim passar o smoke textual.
- Impacto pedagógico: o aluno recebe uma validação que parece fechar o BK, mas deixa escapar uma parte essencial do contrato.
- Impacto técnico/segurança: HSTS ou reconhecimento de proxy podem ficar ausentes em produção, degradando a proteção de transporte esperada para dados financeiros, fiscais e de sessão.
- Causa provável: o smoke foi escrito para procurar contratos textuais mínimos, mas ficou mais fraco do que os critérios de aceite.
- Correção recomendada: no BK, reforçar `check-mf6-https.mjs` para validar no `server.js` a presença de `app.set("trust proxy", 1)`, `enforceHttps({ isProduction })` e `applyStrictTransportSecurity({ isProduction })`, além de validar que o middleware é montado antes das rotas.

#### MF6-AUD-20260623-BK06-F01

- BK/RF/RNF afetado: `BK-MF6-06` / `RNF13`
- Severidade: `P1`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:232` a `265` apresenta o passo "Confirmar login".
  - O bloco de código em `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:248` a `253` contém apenas um fragmento com `validPassword`, `verifyPassword(...)` e `throw new Error("Credenciais inválidas.")`.
  - A referência existente usa `httpError(401, "INVALID_CREDENTIALS", "Credenciais inválidas")` em `apps/api/src/modules/auth/authService.js:129` a `135`, não `throw new Error(...)`.
- Expected: por ser autenticação, o guia deve mostrar a função completa ou a zona exata completa a substituir, preservando o contrato de erro HTTP existente.
- Observed: o bloco é um snippet parcial e troca o padrão de erro HTTP por `Error` genérico se for aplicado literalmente.
- Impacto pedagógico: aluno do 12.º ano pode copiar o fragmento para o local errado ou perder o padrão de resposta esperado.
- Impacto técnico/segurança: login pode deixar de devolver erro HTTP controlado e consistente, criando regressão em contratos de API e testes.
- Causa provável: o passo pretendia ser uma revisão do fluxo existente, mas acabou por incluir código parcial numa secção que exige código completo.
- Correção recomendada: substituir o bloco por "Sem código neste passo" se for apenas revisão, ou mostrar a função completa `loginUser` integrada com `httpError`, `verifyPassword`, sessão e resposta segura.

#### MF6-AUD-20260623-BK06-F02

- BK/RF/RNF afetado: `BK-MF6-06` / `RNF13`
- Severidade: `P2`
- Estado do finding: `PARCIAL`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:329` a `331` indica `EDITAR: apps/api/tests/unit/mf0-validators.test.js` ou "suite auth existente".
  - `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md:339` a `347` mostra só o corpo do teste, sem imports de `test`, `assert`, `hashPassword` e `verifyPassword`, nem localização exata dentro da suite.
- Expected: um BK `P0` de segurança deve indicar ficheiro e localização exatos e mostrar teste completo ou bloco integrado com imports necessários.
- Observed: o aluno tem de adivinhar imports, suite real e ponto de inserção.
- Impacto pedagógico: aumenta o risco de teste não executável ou colado numa suite sem dependências disponíveis.
- Impacto técnico/segurança: a evidence de bcrypt pode ficar frágil ou não correr, mesmo que o helper principal esteja correto.
- Causa provável: o passo foi escrito como exemplo curto de teste, não como bloco integrado no padrão obrigatório.
- Correção recomendada: escolher uma suite canónica, por exemplo `apps/api/tests/unit/mf0-validators.test.js` ou criar uma suite auth explícita, e mostrar o bloco completo com imports e integração real.

### Mapa de integração da MF

#### BK-MF6-05

- Ficheiros previstos pelo BK: `apps/api/src/modules/security/transportSecurity.js`, `apps/api/src/server.js`, `apps/api/scripts/check-mf6-https.mjs`, `apps/api/package.json`, revisão de `apps/web/src/lib/apiClient.ts`
- Ficheiros editados nesta execução: nenhum
- Exports previstos: `enforceHttps`, `applyStrictTransportSecurity`
- Imports consumidos de BKs anteriores: Express em `server.js`, cliente API e contrato de sessão já existente
- Endpoint previsto: todos os endpoints passam pelo middleware global; o teste manual usa `/api/auth/me`
- DTOs/validators criados: nenhum
- Schemas/modelos criados: nenhum
- Services criados: nenhum
- Componentes/páginas frontend criados: nenhum
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: HTTPS obrigatório em produção, HSTS em produção, `trust proxy`, desenvolvimento local sem bloqueio
- Testes/smokes criados: `check-mf6-https.mjs`, mas com lacuna de cobertura para HSTS montado e `trust proxy`
- BKs seguintes dependentes: `BK-MF6-06` e `BK-MF6-07` dependem da premissa de transporte seguro para password e cookies
- Estado de integração atual: `PARCIAL`

#### BK-MF6-06

- Ficheiros previstos pelo BK: `apps/api/src/modules/auth/password.js`, `apps/api/src/modules/auth/authService.js`, `apps/api/src/modules/auth/passwordResetService.js`, `apps/api/scripts/check-mf6-bcrypt.mjs`, `apps/api/package.json`, suite unitária de autenticação
- Ficheiros editados nesta execução: nenhum
- Exports previstos: `BCRYPT_ROUNDS`, `hashPassword`, `verifyPassword`
- Imports consumidos de BKs anteriores: autenticação MF0, recuperação de password MF0, validators de password, testes unitários existentes
- Endpoint previsto: registo, login e reset existentes
- DTOs/validators criados: nenhum novo obrigatório; reutiliza validators de auth/reset
- Schemas/modelos criados: nenhum schema novo; reutiliza `User.passwordHash` e tokens de reset
- Services criados: endurecimento de helper e revisão de `authService`/`passwordResetService`
- Componentes/páginas frontend criados: nenhum
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: bcrypt com salt, custo mínimo, rejeição de password curta, comparação segura, ausência de persistência de credenciais no browser
- Testes/smokes criados: `check-mf6-bcrypt.mjs` e teste unitário de hashing, mas o bloco de teste não está suficientemente completo
- BKs seguintes dependentes: `BK-MF6-07` depende de auth com hash e sessão segura antes de reforçar cookies
- Estado de integração atual: `PARCIAL`

### Decisões confirmadas

- `CANONICO`: `RNF12` exige HTTPS com TLS 1.2 ou superior.
- `CANONICO`: `RNF13` exige bcrypt com salt seguro.
- `CANONICO`: `RNF14` vem a seguir e reforça cookies `HttpOnly`, `Secure` e `SameSite`.
- `CANONICO`: `RF01` define registo, login e logout com cookies HttpOnly.
- `CANONICO`: `RF05` define recuperação de password via email.
- `CANONICO`: `BK-MF6-05` e `BK-MF6-06` são `P0`, `Reforco`, `Fase 3`, `S10-S11`.
- `DERIVADO`: `app.set("trust proxy", 1)` é uma decisão técnica mínima para Express atrás de proxy, alinhada com o objetivo de validar `x-forwarded-proto`.
- `DERIVADO`: `BCRYPT_ROUNDS = 12` é uma baseline pedagógica razoável para PAP, mas deve continuar mensurável em produção.
- `DERIVADO`: smokes textuais são aceitáveis como evidence educativa, desde que não prometam validação de infraestrutura real de TLS.

### Drift documental encontrado

- Não foi encontrada fuga de caminhos internos `real_dev` nos BKs MF6.
- Não foi encontrado drift de domínio de outras PAPs nos BKs alvo.
- Foi encontrado drift de qualidade entre o estado anterior registado (`OK`) e o critério rigoroso atual: `BK-MF6-05` e `BK-MF6-06` cumprem estrutura, mas ainda deixam lacunas de validação/código completo.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF6-04` -> `BK-MF6-05`: coerência preservada; FIFO medido antecede hardening de transporte e não cria dependência técnica contraditória.
- `BK-MF6-05` -> `BK-MF6-06`: coerência funcional preservada; password segura pressupõe transporte seguro em produção. A lacuna é a validação textual do contrato HTTPS, não a sequência.
- `BK-MF6-06` -> `BK-MF6-07`: coerência funcional preservada; bcrypt e comparação de password antecedem cookies seguros. A lacuna é a completude dos blocos de login/teste.
- `MF5` -> `MF6` -> `MF7`: coerência geral preservada no scope auditado; os findings são pedagógico-técnicos e não introduzem novo requisito ou domínio.

### Verificações executadas

- Pesquisa canónica por `RNF12`, `RNF13`, `RNF14`, `RF01`, `RF05`, `BK-MF6-05` e `BK-MF6-06` em RF/RNF, matriz, backlog, contrato de campos, MF-VIEWS, plano de sprints e guias BK.
- Pesquisa estrutural nos dois BKs alvo para secções obrigatórias, passos, blocos de código, explicações, negativos, evidence e handoff.
- Pesquisa em `apps/api/src`, `apps/web/src`, `real_dev/api/src` e `real_dev/web/src` para confirmar módulos reais usados pelos BKs alvo.
- Pesquisa obrigatória de risco nos BKs alvo:
  - Resultado: sem ocorrências relevantes de `real_dev`, `payload: unknown`, `as any`, `localStorage`, `sessionStorage`, domínio de outras PAPs, pseudo-código ou claims proibidas.
  - Ocorrências de `password` são esperadas em `BK-MF6-06`, porque esse é o domínio do BK.
- Pesquisa obrigatória de risco na MF6 completa:
  - `companyId` aparece em `BK-MF6-01`, `BK-MF6-03`, `BK-MF6-04` e `BK-MF6-10` como contexto backend/autenticado ou input interno de service, não como ownership decidido pelo frontend.
  - `password` aparece em `BK-MF6-06`, que é precisamente o BK de bcrypt/passwords.
- Pesquisa de fuga de caminho interno:
  - `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: sem ocorrências.
- Pesquisa de whitespace no relatório atualizado:
  - `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false`.
  - Nota: o advisory continua a listar avisos heurísticos/globais, incluindo `missing_pedagogic_or_operational_blocks` e `missing_or_placeholder_snippet` em vários BKs. No scope atual, a inspeção manual confirmou a estrutura nova dos dois BKs alvo e promoveu apenas as lacunas específicas registadas acima.

### Riscos restantes e TODOs

- `BK-MF6-05`: reforçar o smoke textual para provar montagem de HSTS e `trust proxy` no servidor.
- `BK-MF6-06`: substituir fragmentos de login/teste por código completo ou por passos explicitamente sem código quando forem apenas revisão.
- Risco residual: os comandos indicados nos BKs dependem de os alunos criarem os ficheiros em `apps/`; esta execução auditou documentação e coerência estrutural, não executou os scripts que ainda não existem fora do guia.

## Execução atual - auditoria pós-correção apenas BK-MF6-03 e BK-MF6-04

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-03`, `BK-MF6-04`
- Modo: `auditar_apenas`
- Implementation root consultado apenas como referência interna: `real_dev`
- Baseline da referência interna: `MF0..MF5`
- Estado assumido da MF alvo em implementação: `not_assumed`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Strict scope: ativo
- BKs editados: nenhum
- Código de implementação editado: nenhum
- Relatório atualizado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais nos 10 BKs MF6 e relatórios untracked em `docs/planificacao/guias-bk/`. Esta auditoria preservou esse estado, não editou BKs, não tocou em `apps/`, não tocou em `real_dev/` e só acrescentou esta secção de relatório.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF6/`, com foco em `BK-MF6-03` e `BK-MF6-04`.
- BK anterior direto: `BK-MF6-02`.
- BK seguinte direto: `BK-MF6-05`.
- BKs anteriores relevantes: `BK-MF2-03`, `BK-MF3-03`, `BK-MF4-10` e `BK-MF5-07`.
- Implementação de referência até MF5 em `real_dev/api/src/modules/treasury`, `real_dev/api/src/modules/inventory`, `real_dev/api/src/modules/auth`, `real_dev/api/src/modules/companies` e `real_dev/api/src/modules/permissions`, apenas para confirmar nomes e convenções já existentes.
- Relatórios existentes `AUDITORIA-HIDRATACAO-MF5.md` e `AUDITORIA-HIDRATACAO-MF6.md`.

### Resumo executivo

A auditoria pós-correção confirma que `BK-MF6-03` e `BK-MF6-04` estão `OK` no scope desta execução.

Em `BK-MF6-03`, o blocker anterior já não se reproduz: o bloco da route importa `requirePermission` e `requireRole` de `../permissions/permissionMiddleware.js`, que existe em `apps/api/src/modules/permissions/permissionMiddleware.js` e na referência interna. O smoke textual também valida que o import de roles não volta para `../users/roleMiddleware.js`. A reconciliação mantém orçamento de `3000 ms`, limite de candidatos, resposta `complete`/`partial`, cabeçalho de duração, sessão, empresa ativa, permissão de tesouraria e role backend.

Em `BK-MF6-04`, a auditoria confirma que o guia preserva FIFO como FIFO, cria orçamento de cálculo, mede duração, valida stock antes de calcular, mantém `write: false` no preview e protege a rota com sessão, empresa ativa e `Permission.INVENTORY_READ`.

Não foram encontrados novos findings `P0`, `P1`, `P2` ou `P3` dentro do scope `BK-MF6-03`/`BK-MF6-04`.

### Resultado antes e depois desta auditoria

| Métrica | Estado anterior registado no relatório | Estado auditoria atual |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 2 | 2 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado anterior registado | Estado auditoria atual | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-03` | `RNF10` | `P1` | `Oleksii` | `Pedro` | `OK` | `OK` | route, service, orçamento, smoke, autorização backend e origem de `requireRole` estão coerentes |
| `BK-MF6-04` | `RNF11` | `P1` | `Andre` | `Oleksii` | `OK` | `OK` | FIFO mantém correção, preview sem escrita, medição, validação de stock e guards coerentes |

### Findings reavaliados

#### MF6-AUD-20260622-BK03-F02

- BK/RF/RNF afetado: `BK-MF6-03` / `RNF10`
- Severidade anterior: `P1`
- Estado nesta auditoria: `JA_CORRIGIDO`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md:419` importa `requirePermission` e `requireRole` de `../permissions/permissionMiddleware.js`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md:548` a `554` valida no smoke a origem correta do import e falha se voltar a aparecer `../users/roleMiddleware.js`.
  - `apps/api/src/modules/permissions/permissionMiddleware.js` e `real_dev/api/src/modules/permissions/permissionMiddleware.js` existem e exportam `requireRole`.
  - `rg -n '^import .*users/roleMiddleware'` no BK alvo não devolveu ocorrências.
- Impacto residual: nenhum blocker técnico confirmado no guia; runtime real depende de o aluno aplicar o BK em `apps/api`.

#### MF6-AUD-20260622-BK04-F01

- BK/RF/RNF afetado: `BK-MF6-04` / `RNF11`
- Severidade anterior: `P1`
- Estado nesta auditoria: `JA_CORRIGIDO`
- Evidência objetiva:
  - O BK já não contém `calculateFifoLayers`.
  - `BK-MF6-04` importa `assertEnoughFifoStock` e `measureFifoCost` de `./fifoPerformance.js`.
  - O preview mantém `write: false`.
  - A route usa `requireCompanyContext(prisma)` e `Permission.INVENTORY_READ`.
- Impacto residual: nenhum blocker técnico confirmado no guia; runtime real depende de o aluno aplicar o BK em `apps/api`.

### Mapa de integracao da MF

#### BK-MF6-03

- Ficheiros previstos pelo BK: `apps/api/src/modules/treasury/reconciliationPerformance.js`, `apps/api/src/modules/treasury/statementRoutes.js`, `apps/api/src/modules/treasury/statementImportService.js`, `apps/api/scripts/check-mf6-reconciliation-performance.mjs`, `apps/api/package.json`
- Ficheiros editados nesta execução: nenhum
- Exports previstos: `RECONCILIATION_BUDGET_MS`, `RECONCILIATION_MAX_CANDIDATES`, `limitReconciliationCandidates`, `measureReconciliation`, `suggestReconciliations`
- Imports consumidos de BKs anteriores: `toHttpError`, `requireAuth`, `requireCompanyContext`, `requirePermission`, `requireRole`, `Permission`, modelos Prisma de extrato, recebimento e pagamento
- Endpoint previsto: `POST /api/treasury/reconciliations/suggestions`
- DTOs/validators criados: validações internas de `statementLineId`, `candidateLimit` e existência da linha de extrato no contexto da empresa ativa
- Schemas/modelos criados: nenhum schema novo; reutiliza extrato bancário, recebimentos e pagamentos já modelados
- Services criados: `suggestReconciliations` em `statementImportService.js`
- Componentes/páginas frontend criados: nenhum neste BK
- Providers de IA criados ou usados: nenhum; as sugestões são heurísticas controladas e não automação contabilística
- Regras de segurança/autorização aplicadas: sessão, empresa ativa, `Permission.TREASURY_WRITE`, roles `ADMIN`, `CONTABILISTA`, `OPERACIONAL`, sem ownership vindo do body
- Testes/smokes criados: `check-mf6-reconciliation-performance.mjs`, incluindo check de import real de permissões
- BKs seguintes dependentes: `BK-MF6-04` reaproveita o padrão de orçamento/performance; `BK-MF6-05` herda endpoints já protegidos por autorização backend
- Estado de integração atual: `OK`

#### BK-MF6-04

- Ficheiros previstos pelo BK: `apps/api/src/modules/inventory/fifoPerformance.js`, `apps/api/src/modules/inventory/fifoCostService.js`, `apps/api/scripts/check-mf6-fifo-performance.mjs`, `apps/api/package.json`, revisão de `apps/api/src/modules/inventory/fifoCostRoutes.js` e `apps/api/src/modules/inventory/stockMovementService.js`
- Ficheiros editados nesta execução: nenhum
- Exports previstos: `FIFO_COST_BUDGET_MS`, `measureFifoCost`, `assertEnoughFifoStock`
- Imports consumidos de BKs anteriores: `httpError`, `consumeFifoLayers`, `previewFifoCost`, guards de autenticação/empresa/permissões, modelos Prisma de camadas FIFO e consumos
- Endpoint previsto: reforço de `GET /api/inventory/fifo-cost/preview`
- DTOs/validators criados: validação interna de quantidade/artigo/armazém e stock suficiente
- Schemas/modelos criados: nenhum schema novo; reutiliza camadas FIFO, movimentos e consumos já modelados
- Services criados: `fifoPerformance.js` e reforço de `fifoCostService.js`
- Componentes/páginas frontend criados: nenhum neste BK
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: sessão, empresa ativa, `Permission.INVENTORY_READ` no preview, filtro por `companyId` vindo do contexto
- Testes/smokes criados: `check-mf6-fifo-performance.mjs`
- BKs seguintes dependentes: `BK-MF6-05` pode assumir FIFO medido e operação crítica separada de consulta
- Estado de integração atual: `OK`

### Decisões confirmadas

- `CANONICO`: `RNF10` exige sugestão de reconciliação bancária em até 3 segundos.
- `CANONICO`: `RNF11` exige FIFO correto sem bloquear operações críticas.
- `CANONICO`: `RF33` define importação de extratos bancários e reconciliação automática.
- `CANONICO`: `RF25` define cálculo FIFO.
- `CANONICO`: `BK-MF6-03` e `BK-MF6-04` são `P1`, `Core`, `Fase 3`, `S10-S11`.
- `CANONICO`: `requireRole` vem do middleware de permissões, não de `users/roleMiddleware.js`.
- `DERIVADO`: `candidateLimit` entre 1 e 250 é proteção operacional local para cumprir o orçamento de 3 segundos.
- `DERIVADO`: `withinBudget` em reconciliação e FIFO é métrica de evidence, não regra de domínio.
- `DERIVADO`: preview FIFO com `write: false` separa consulta de gravação crítica sem inventar novo método de custo.

### Drift documental encontrado

- Não foi encontrado novo drift documental nos dois BKs alvo.
- O drift técnico anterior de `BK-MF6-03` foi reavaliado e permanece corrigido.
- Não foi encontrada fuga de caminhos internos `real_dev` nos BKs MF6.
- Não foi encontrado drift de domínio de outras PAPs nos BKs alvo.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF6-02` -> `BK-MF6-03`: coerência preservada; a reconciliação usa guards, empresa ativa e padrões de performance sem depender de código inexistente.
- `BK-MF6-03` -> `BK-MF6-04`: coerência preservada; ambos usam orçamento/performance, falha controlada e evidence sem bloquear operações críticas.
- `BK-MF6-04` -> `BK-MF6-05`: coerência preservada; FIFO fica medido e separado entre consulta e escrita antes do hardening de transporte.
- `MF5` -> `MF6` -> `MF7`: coerência geral preservada no scope auditado; nenhum blocker novo foi confirmado.

### Verificações executadas

- Pesquisa canónica por `RNF10`, `RNF11`, `RF25`, `RF33`, `BK-MF6-03` e `BK-MF6-04` em RF/RNF, matriz, backlog, contrato de campos, MF-VIEWS, plano de sprints e guias BK.
- Pesquisa estrutural nos dois BKs alvo para secções obrigatórias, passos, blocos de código, explicações, negativos, evidence e handoff.
- Pesquisa em `apps/api/src` e `real_dev/api/src` para confirmar módulos reais usados pelos imports dos BKs alvo.
- Pesquisa focada de import/rota: confirmou que `requireRole` vem de `permissions/permissionMiddleware.js` e que não há import ativo para `users/roleMiddleware.js`.
- Pesquisa obrigatória de risco nos BKs MF6:
  - `companyId` aparece nos BKs alvo como contexto backend autenticado ou input interno de service; não como ownership decidido pelo frontend.
  - `password` aparece no `BK-MF6-06`, que é precisamente o BK de bcrypt/passwords e ficou fora do scope desta auditoria.
  - `companyId` em `BK-MF6-10` ficou fora do scope desta execução e não foi alterado.
- Pesquisa de fuga de caminho interno:
  - `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false`.
  - Nota: o advisory continua a listar avisos heurísticos/globais, incluindo `missing_pedagogic_or_operational_blocks` e `missing_or_placeholder_snippet` em vários BKs. No scope atual, a inspeção manual confirmou secções, código, explicações e handoff suficientes nos dois BKs alvo; estes avisos não foram promovidos a finding bloqueante.

### Riscos restantes e TODOs

- Sem TODOs/blockers restantes nos BKs alvo desta execução.
- Risco residual: a compilação/runtime real dos blocos depende de aplicar os guias numa árvore `apps/api`; esta execução auditou documentação e coerência estrutural, não executou os scripts que ainda não existem fora do guia.
- Risco residual: `bash scripts/validate-planificacao.sh` mantém `advisory_pass: false` por dívida global/heurística fora do scope.

## Execução anterior registada - correção apenas BK-MF6-03 e revalidação BK-MF6-04

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-03`, `BK-MF6-04`
- Modo: `corrigir_apenas`
- Fonte dos findings: secção anterior deste relatório, `Execução anterior registada - auditoria apenas BK-MF6-03 e BK-MF6-04`
- Finding IDs tratados: todos os findings confirmados no scope
- Severidades tratadas: `P0`, `P1`, `P2`, `P3`
- Implementation root consultado apenas como referência interna: `real_dev`
- Baseline da referência interna: `MF0..MF5`
- Estado assumido da MF alvo em implementação: `not_assumed`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- Strict scope: ativo
- BKs editados: `BK-MF6-03`
- BKs revalidados sem edição: `BK-MF6-04`
- Código de implementação editado: nenhum
- Relatório atualizado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais nos 10 BKs MF6 e relatórios untracked em `docs/planificacao/guias-bk/`. Esta correção preservou esse trabalho, não tocou em `apps/`, não tocou em `real_dev/` e alterou apenas `BK-MF6-03` mais este relatório.

### Resumo executivo

A correção atual fecha o finding `MF6-AUD-20260622-BK03-F02`. O bloco principal de `BK-MF6-03` passou a importar `requirePermission` e `requireRole` de `../permissions/permissionMiddleware.js`, que é o módulo real exportado em `apps/api` e na referência privada. O import inexistente `../users/roleMiddleware.js` foi removido do guia.

O smoke textual do próprio BK também foi reforçado para falhar se a route voltar a importar roles de `../users/roleMiddleware.js` ou se não usar o middleware real de permissões. Assim, a lacuna deixa de depender de revisão manual futura.

`BK-MF6-04` foi revalidado no scope desta execução e não precisou de nova alteração: permanece `OK` após a correção do BK anterior.

### Resultado antes e depois desta correção

| Métrica | Estado antes desta correção | Estado depois desta correção |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 1 | 2 |
| PARCIAL | 0 | 0 |
| CRITICO | 1 | 0 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado antes | Estado depois | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-03` | `RNF10` | `P1` | `Oleksii` | `Pedro` | `CRITICO` | `OK` | import partido de `requireRole` corrigido e smoke textual reforçado |
| `BK-MF6-04` | `RNF11` | `P1` | `Andre` | `Oleksii` | `OK` | `OK` | sem novo blocker no scope; FIFO continua documentado com preview sem escrita, medição e guards |

### Findings tratados nesta execução

#### MF6-AUD-20260622-BK03-F02

- BK/RF/RNF afetado: `BK-MF6-03` / `RNF10`
- Severidade: `P1`
- Estado final: `CORRIGIDO`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md:419` mostra `import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md:548` a `554` adiciona checks de smoke para origem correta do import e ausência de `../users/roleMiddleware.js`.
  - `apps/api/src/modules/permissions/permissionMiddleware.js:14` e `real_dev/api/src/modules/permissions/permissionMiddleware.js:14` exportam `requireRole(...)`.
  - `apps/api/src/modules/treasury/statementRoutes.js:9` e `real_dev/api/src/modules/treasury/statementRoutes.js:9` usam o mesmo import combinado de `requirePermission, requireRole`.
- Correção aplicada: substituído o import inexistente por import combinado a partir de `../permissions/permissionMiddleware.js` e reforçado o smoke textual do BK.
- Impacto técnico: a route proposta volta a estar alinhada com o contrato real de autorização backend.
- Impacto pedagógico: o aluno já não precisa de descobrir manualmente o módulo correto para conseguir copiar e integrar o ficheiro.
- Impacto de segurança/domínio: mantém-se `requireAuth`, `requireCompanyContext`, `Permission.TREASURY_WRITE` e `requireRole("ADMIN", "CONTABILISTA", "OPERACIONAL")`; o frontend continua sem decidir empresa ativa, role ou permissão final.

#### MF6-AUD-20260622-BK04-F01

- BK/RF/RNF afetado: `BK-MF6-04` / `RNF11`
- Severidade anterior: `P1`
- Estado final: `JA_CORRIGIDO`
- Evidência objetiva: o BK não contém `calculateFifoLayers`, preserva `write: false` no preview e mantém guards de sessão, empresa ativa e `Permission.INVENTORY_READ`.
- Correção aplicada nesta execução: nenhuma, porque não havia finding novo no scope.

### Mapa de integracao da MF

#### BK-MF6-03

- Ficheiros previstos pelo BK: `apps/api/src/modules/treasury/reconciliationPerformance.js`, `apps/api/src/modules/treasury/statementRoutes.js`, `apps/api/src/modules/treasury/statementImportService.js`, `apps/api/scripts/check-mf6-reconciliation-performance.mjs`, `apps/api/package.json`
- Ficheiros editados nesta execução: apenas o guia `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md`
- Exports previstos: `RECONCILIATION_BUDGET_MS`, `RECONCILIATION_MAX_CANDIDATES`, `limitReconciliationCandidates`, `measureReconciliation`, `suggestReconciliations`
- Imports consumidos de BKs anteriores: `toHttpError`, `requireAuth`, `requireCompanyContext`, `requirePermission`, `requireRole`, `Permission`, modelos Prisma de extrato, recebimento e pagamento
- Endpoint previsto: `POST /api/treasury/reconciliations/suggestions`
- DTOs/validators criados: validações internas de `statementLineId`, `candidateLimit` e existência da linha de extrato no contexto da empresa ativa
- Schemas/modelos criados: nenhum schema novo; reutiliza extrato bancário, recebimentos e pagamentos já modelados
- Services criados: `suggestReconciliations` em `statementImportService.js`
- Componentes/páginas frontend criados: nenhum neste BK
- Providers de IA criados ou usados: nenhum; as sugestões são heurísticas controladas e não automação contabilística
- Regras de segurança/autorização aplicadas: sessão, empresa ativa, `Permission.TREASURY_WRITE`, roles `ADMIN`, `CONTABILISTA`, `OPERACIONAL`, sem ownership vindo do body
- Testes/smokes criados: `check-mf6-reconciliation-performance.mjs`, agora também com check de import real de permissões
- BKs seguintes dependentes: `BK-MF6-04` reaproveita o padrão de orçamento/performance; `BK-MF6-05` herda endpoints já protegidos por autorização backend
- Estado de integração atual: `OK`

#### BK-MF6-04

- Ficheiros previstos pelo BK: `apps/api/src/modules/inventory/fifoPerformance.js`, `apps/api/src/modules/inventory/fifoCostService.js`, `apps/api/scripts/check-mf6-fifo-performance.mjs`, `apps/api/package.json`, revisão de `apps/api/src/modules/inventory/fifoCostRoutes.js` e `apps/api/src/modules/inventory/stockMovementService.js`
- Ficheiros editados nesta execução: nenhum
- Exports previstos: `FIFO_COST_BUDGET_MS`, `measureFifoCost`, `assertEnoughFifoStock`
- Imports consumidos de BKs anteriores: `httpError`, `consumeFifoLayers`, `previewFifoCost`, guards de autenticação/empresa/permissões, modelos Prisma de camadas FIFO e consumos
- Endpoint previsto: reforço de `GET /api/inventory/fifo-cost/preview`
- Regras de segurança/autorização previstas: sessão, empresa ativa, `Permission.INVENTORY_READ` no preview, filtro por `companyId` vindo do contexto
- Estado de integração atual: `OK`
- BKs seguintes dependentes: `BK-MF6-05` pode assumir FIFO medido e operação crítica separada de consulta

### Decisões confirmadas

- `CANONICO`: `RNF10` exige sugestão de reconciliação bancária em até 3 segundos.
- `CANONICO`: `RNF11` exige FIFO correto sem bloquear operações críticas.
- `CANONICO`: `requireRole` pertence ao middleware de permissões, não a um módulo `users/roleMiddleware.js`.
- `CANONICO`: os caminhos escritos nos BKs dos alunos usam `apps/api` e `apps/web`.
- `DERIVADO`: `candidateLimit` entre 1 e 250 continua a ser proteção operacional local para manter o orçamento de 3 segundos.
- `DERIVADO`: `withinBudget` em reconciliação e FIFO continua a ser métrica de evidence, não regra de domínio.
- `DERIVADO`: preview FIFO com `write: false` continua a ser a forma segura de separar consulta de gravação crítica.

### Drift documental encontrado

- Drift técnico confirmado e corrigido em `BK-MF6-03`: `../users/roleMiddleware.js` não correspondia ao módulo real/canónico de autorização.
- Não foi encontrado drift de domínio nos dois BKs alvo.
- Não foi encontrada fuga de caminhos internos `real_dev` nos BKs MF6.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF6-02` -> `BK-MF6-03`: coerência restaurada; o BK3 volta a poder consumir o padrão de guards e middleware existente.
- `BK-MF6-03` -> `BK-MF6-04`: coerência preservada; ambos usam orçamento/performance e guards backend reais.
- `BK-MF6-04` -> `BK-MF6-05`: coerência preservada; FIFO fica medido e separado entre consulta e escrita antes do hardening de transporte.
- `MF5` -> `MF6` -> `MF7`: coerência geral preservada; não ficou blocker técnico confirmado nos BKs alvo desta execução.

### Verificações executadas

- Confirmação estrutural do import real:
  - `rg -n "export function requireRole|export const requireRole|function requireRole|requireRole" apps/api/src/modules/permissions real_dev/api/src/modules/permissions apps/api/src/modules/treasury/statementRoutes.js real_dev/api/src/modules/treasury/statementRoutes.js`
  - Resultado: `requireRole` exportado em `permissions/permissionMiddleware.js` e usado pelas routes reais de tesouraria.
- Confirmação de ausência do módulo antigo:
  - `rg --files apps/api/src real_dev/api/src | rg 'roleMiddleware|permissionMiddleware|users'`
  - Resultado: não existe `roleMiddleware.js`; existem apenas `permissions/permissionMiddleware.js` e módulos `company-users`.
- Pesquisa obrigatória de risco nos BKs MF6:
  - `companyId` aparece nos BKs alvo como contexto backend autenticado ou input interno de service; não como ownership decidido pelo frontend.
  - `password` aparece no `BK-MF6-06`, que é precisamente o BK de bcrypt/passwords e ficou fora do scope desta correção.
  - `companyId` em `BK-MF6-10` ficou fora do scope desta execução e não foi alterado.
- Pesquisa de fuga de caminho interno:
  - `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false`.
  - Nota: o advisory continua a listar avisos heurísticos/globais, incluindo `missing_pedagogic_or_operational_blocks` e `missing_or_placeholder_snippet` em vários BKs. Não bloqueia `overall_pass` e não foi alargado fora do scope.

### Riscos restantes e TODOs

- Sem TODOs/blockers restantes nos BKs alvo desta execução.
- Risco residual: a compilação/runtime real dos blocos depende de aplicar os guias numa árvore `apps/api`; esta execução corrigiu documentação, não código de aplicação.
- Risco residual: `bash scripts/validate-planificacao.sh` mantém `advisory_pass: false` por dívida global/heurística fora do scope.

## Execução anterior registada - auditoria apenas BK-MF6-03 e BK-MF6-04

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-03`, `BK-MF6-04`
- Modo: `auditar_apenas`
- Implementation root consultado apenas como referência interna: `real_dev`
- Baseline da referência interna: `MF0..MF5`
- Estado assumido da MF alvo em implementação: `not_assumed`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Strict scope: ativo
- BKs editados: nenhum
- Código de implementação editado: nenhum
- Relatório atualizado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais nos 10 BKs MF6 e este relatório estava untracked. Esta auditoria preservou esse estado, não editou os BKs e só acrescentou esta secção de relatório.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF6/`, com foco em `BK-MF6-03` e `BK-MF6-04`.
- BK anterior direto: `docs/planificacao/guias-bk/MF6/BK-MF6-02-suportar-25-utilizadores-simultaneos-por-empresa-sem-degradacao-relevante.md`.
- BK seguinte direto: `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md`.
- BKs anteriores relevantes: `BK-MF1-03`, `BK-MF1-08`, `BK-MF2-03`, `BK-MF3-03`, `BK-MF4-10` e `BK-MF5-07`.
- Implementação de referência até MF5 em `real_dev/api/src/modules/treasury`, `real_dev/api/src/modules/inventory`, `real_dev/api/src/modules/auth`, `real_dev/api/src/modules/companies` e `real_dev/api/src/modules/permissions`, apenas para confirmar nomes e convenções já existentes.
- Relatórios existentes `AUDITORIA-HIDRATACAO-MF5.md` e `AUDITORIA-HIDRATACAO-MF6.md`.

### Resumo executivo

A auditoria atual revalida o estado corrente de `BK-MF6-03` e `BK-MF6-04`, depois da correção anterior registada neste relatório. O resultado não confirma os dois guias como `OK`: `BK-MF6-04` permanece `OK`, mas `BK-MF6-03` fica `CRITICO` porque o bloco principal da route contém um import para um módulo inexistente.

Em `BK-MF6-03`, o service de sugestão já está muito mais completo do que na auditoria anterior: cria `suggestReconciliations`, valida `statementLineId`, filtra por empresa ativa, separa recebimentos de pagamentos, mede duração e devolve `complete`/`partial`. Contudo, a route proposta importa `requireRole` de `../users/roleMiddleware.js`; esse ficheiro não existe em `apps/api/src` nem em `real_dev/api/src`. A implementação real importa `requireRole` de `../permissions/permissionMiddleware.js`. Como a route não compila com o caminho atual, o guia não pode ser considerado executável para aluno.

Em `BK-MF6-04`, a auditoria confirma o estado `OK`: o guia mostra `fifoPerformance.js`, substituição completa de `consumeFifoLayers`, validação prévia de stock, preservação de `write: false` no preview, medição `durationMs`/`withinBudget`, route de preview com `requireCompanyContext(prisma)` e smoke textual. Não foram encontrados novos blockers no scope deste BK.

Não houve correção porque `MODO=auditar_apenas`.

### Resultado antes e depois desta auditoria

| Métrica | Estado anterior registado no relatório | Estado auditoria atual |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 2 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 1 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado anterior registado | Estado auditoria atual | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-03` | `RNF10` | `P1` | `Oleksii` | `Pedro` | `OK` | `CRITICO` | route de sugestão usa import inexistente para `requireRole`, quebrando compilação do ficheiro |
| `BK-MF6-04` | `RNF11` | `P1` | `Andre` | `Oleksii` | `OK` | `OK` | FIFO está documentado com função completa, validação de stock, medição, preview sem escrita e guards coerentes |

### Findings confirmados nesta execução

#### MF6-AUD-20260622-BK03-F02

- BK/RF/RNF afetado: `BK-MF6-03` / `RNF10`
- Severidade: `P1`
- Estado nesta auditoria: `BLOQUEADO_POR_SCOPE`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md:421` mostra `import { requireRole } from "../users/roleMiddleware.js";`.
  - `rg --files apps/api/src real_dev/api/src | rg 'roleMiddleware|permissionMiddleware|users'` não encontrou `users/roleMiddleware.js`.
  - `apps/api/src/modules/permissions/permissionMiddleware.js:14` e `real_dev/api/src/modules/permissions/permissionMiddleware.js:14` exportam `requireRole(...)`.
  - `apps/api/src/modules/treasury/statementRoutes.js:9` e `real_dev/api/src/modules/treasury/statementRoutes.js:9` importam `requirePermission, requireRole` a partir de `../permissions/permissionMiddleware.js`.
- Expected: o bloco completo de `apps/api/src/modules/treasury/statementRoutes.js` deve importar `requireRole` do módulo real de permissões, preservando `requireAuth`, `requireCompanyContext`, `requirePermission(Permission.TREASURY_WRITE)`, `requireRole(...)` e `sendError`.
- Observed: o guia aponta para um módulo inexistente. Se o aluno copiar a route, o ficheiro falha por import partido antes de validar o endpoint de reconciliação.
- Impacto pedagógico: o aluno teria de descobrir sozinho o import correto, apesar de o BK prometer código completo e integrado.
- Impacto técnico: a route `POST /api/treasury/reconciliations/suggestions` não compila no contrato atual da app.
- Impacto de segurança/domínio: se o aluno contornar o erro removendo `requireRole`, pode enfraquecer autorização backend numa operação de tesouraria.
- Causa provável: a correção anterior reforçou os guards semanticamente, mas escreveu o caminho de import errado para `requireRole`.
- Correção recomendada: em modo `corrigir_apenas`, alterar o bloco da route no `BK-MF6-03` para importar `requirePermission` e `requireRole` de `../permissions/permissionMiddleware.js`; atualizar o smoke textual para verificar também a origem correta do import.

### Findings reavaliados sem novo problema

#### MF6-AUD-20260622-BK04-F01

- BK/RF/RNF afetado: `BK-MF6-04` / `RNF11`
- Severidade anterior: `P1`
- Estado nesta auditoria: `JA_CORRIGIDO`
- Evidência objetiva:
  - `BK-MF6-04` já não contém `calculateFifoLayers`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md:227` importa `assertEnoughFifoStock` e `measureFifoCost` de `./fifoPerformance.js`.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md:236` mostra `consumeFifoLayers(tx, input)` completo.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md:252` valida stock antes de atualizar camadas.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md:323` preserva `write: false` no preview.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md:392` a `395` mantém `requireAuth`, `requireCompanyContext` e `Permission.INVENTORY_READ`.
- Impacto residual: validação runtime continua dependente de aplicar o guia numa árvore `apps/api`; esta auditoria é documental/estrutural.

### Mapa de integracao da MF

#### BK-MF6-03

- Ficheiros previstos pelo BK: `apps/api/src/modules/treasury/reconciliationPerformance.js`, `apps/api/src/modules/treasury/statementRoutes.js`, `apps/api/src/modules/treasury/statementImportService.js`, `apps/api/scripts/check-mf6-reconciliation-performance.mjs`, `apps/api/package.json`
- Exports previstos: `RECONCILIATION_BUDGET_MS`, `RECONCILIATION_MAX_CANDIDATES`, `limitReconciliationCandidates`, `measureReconciliation`, `suggestReconciliations`
- Imports consumidos de BKs anteriores: `httpError`, helpers de tolerância/referência da reconciliação, guards de autenticação/empresa/permissões/role, modelos Prisma de extrato, recebimento e pagamento
- Endpoint previsto: `POST /api/treasury/reconciliations/suggestions`
- Regras de segurança/autorização previstas: sessão, empresa ativa, `Permission.TREASURY_WRITE`, roles `ADMIN`, `CONTABILISTA`, `OPERACIONAL`, sem ownership vindo do body
- Estado de integração atual: `CRITICO`, porque o bloco da route tem import partido para `requireRole`
- BKs seguintes dependentes: `BK-MF6-04` usa o mesmo padrão de orçamento, mas não depende diretamente do import da route de tesouraria

#### BK-MF6-04

- Ficheiros previstos pelo BK: `apps/api/src/modules/inventory/fifoPerformance.js`, `apps/api/src/modules/inventory/fifoCostService.js`, `apps/api/scripts/check-mf6-fifo-performance.mjs`, `apps/api/package.json`, revisão de `apps/api/src/modules/inventory/fifoCostRoutes.js` e `apps/api/src/modules/inventory/stockMovementService.js`
- Exports previstos: `FIFO_COST_BUDGET_MS`, `measureFifoCost`, `assertEnoughFifoStock`
- Imports consumidos de BKs anteriores: `httpError`, `consumeFifoLayers`, `previewFifoCost`, guards de autenticação/empresa/permissões, modelos Prisma de camadas FIFO e consumos
- Endpoint previsto: reforço de `GET /api/inventory/fifo-cost/preview`
- Regras de segurança/autorização previstas: sessão, empresa ativa, `Permission.INVENTORY_READ` no preview, filtro por `companyId` vindo do contexto
- Estado de integração atual: `OK`
- BKs seguintes dependentes: `BK-MF6-05` pode assumir FIFO medido e operação crítica separada de consulta

### Decisões confirmadas

- `CANONICO`: `RNF10` exige sugestão de reconciliação bancária em até 3 segundos.
- `CANONICO`: `RNF11` exige FIFO correto sem bloquear operações críticas.
- `CANONICO`: `RF33` define importação de extratos e reconciliação automática como fluxo de tesouraria.
- `CANONICO`: `RF25` define FIFO como regra de inventário, não média ponderada.
- `CANONICO`: `BK-MF6-03` e `BK-MF6-04` são `P1`, `Core`, `Fase 3`, `S10-S11`, conforme matriz, backlog e contrato de campos.
- `DERIVADO`: `candidateLimit` entre 1 e 250 é uma proteção operacional local para manter o orçamento de 3 segundos.
- `DERIVADO`: `withinBudget` em reconciliação e FIFO é métrica de evidence, não regra de domínio.
- `DERIVADO`: preview FIFO com `write: false` é a forma segura de separar consulta de gravação crítica.

### Drift documental encontrado

- Não foi encontrado drift de domínio nos dois BKs alvo.
- Foi encontrado drift técnico em `BK-MF6-03`: o caminho `../users/roleMiddleware.js` não corresponde ao módulo real/canónico de autorização, que é `../permissions/permissionMiddleware.js`.
- Não foi encontrada fuga de caminhos internos `real_dev` nos BKs MF6.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF6-02` -> `BK-MF6-03`: coerência conceptual preservada, mas tecnicamente bloqueada até corrigir o import de `requireRole` na route de reconciliação.
- `BK-MF6-03` -> `BK-MF6-04`: coerência conceptual preservada. O padrão de orçamento/fallback existe, mas o BK3 não pode servir como exemplo técnico final enquanto a route não compilar.
- `BK-MF6-04` -> `BK-MF6-05`: coerência preservada. FIFO fica medido e separado entre consulta e escrita antes do hardening de transporte.
- `MF5` -> `MF6` -> `MF7`: coerência geral preservada, com um blocker técnico pontual no BK3.

### Verificações executadas

- Pesquisa canónica por `RNF10`, `RNF11`, `RF25`, `RF33`, `BK-MF6-03` e `BK-MF6-04` em RF/RNF, matriz, backlog, contrato de campos, MF-VIEWS, plano de sprints e guias BK.
- Pesquisa estrutural nos dois BKs alvo para secções obrigatórias, passos, blocos de código, explicações, negatives, evidence e handoff.
- Pesquisa em `real_dev/api/src/modules/treasury/statementImportService.js`, `real_dev/api/src/modules/treasury/statementRoutes.js`, `real_dev/api/src/modules/inventory/fifoCostService.js`, `real_dev/api/src/modules/inventory/fifoCostRoutes.js` e equivalentes em `apps/api/src` para confirmar contratos reais até MF5.
- Pesquisa focada de import/rota: confirmou que `roleMiddleware.js` não existe e que `requireRole` vem de `permissions/permissionMiddleware.js`.
- Pesquisa de padrões antigos nos BKs alvo: sem ocorrências de `scoreReconciliationCandidate`, `calculateFifoLayers`, `req.company`, `payload: unknown`, `as any`, `real_dev`, `placeholder`, `pseudo` ou `TODO (BLOCKER)`.
- Pesquisa obrigatória de risco nos BKs alvo:
  - `companyId` aparece como contexto backend autenticado (`req.companyId`, `context.companyId`, `input.companyId`) e não como ownership decidido pelo frontend.
  - Não apareceram `payload: unknown`, `as any`, `localStorage`, `sessionStorage`, `PRIVATE_KEY`, `deleteMany({})`, `delete({})`, `updateMany({})`, RAG, embeddings, OCR, SAF-T completo ou drift de outros projetos nos BKs alvo.
- Pesquisa de fuga de caminho interno: `rg -n 'real_dev|real-dev|cd real_dev|real_dev/' docs/planificacao/guias-bk/MF6/*.md`.
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false`.
  - Nota: o advisory continua a listar avisos heurísticos/globais, incluindo `missing_pedagogic_or_operational_blocks` e `missing_or_placeholder_snippet` em vários BKs. Não bloqueia `overall_pass` e não foi alargado fora do scope.

### Riscos restantes e TODOs

- `BK-MF6-03` não deve ser entregue como guia final antes de corrigir o import de `requireRole`.
- Sem TODOs restantes em `BK-MF6-04`.
- Risco residual: a compilação/runtime real dos blocos depende de aplicar os guias numa árvore `apps/api`; esta execução auditou documentação, não código de aplicação.
- Risco residual: `bash scripts/validate-planificacao.sh` mantém `advisory_pass: false` por dívida global/heurística fora do scope.
- Bloqueio restante: correção documental de `BK-MF6-03` está fora do modo desta execução (`auditar_apenas`) e deve ser feita numa execução `corrigir_apenas`.

## Execução anterior registada - correção apenas BK-MF6-03 e BK-MF6-04

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-03`, `BK-MF6-04`
- Modo: `corrigir_apenas`
- Fonte dos findings: secção anterior deste relatório, `Execução atual - auditoria apenas BK-MF6-03 e BK-MF6-04`
- Finding IDs tratados: todos os findings confirmados no scope
- Severidades tratadas: `P0`, `P1`, `P2`, `P3`
- Implementation root consultado apenas como referência interna: `real_dev`
- Baseline da referência interna: `MF0..MF5`
- Estado assumido da MF alvo em implementação: `not_assumed`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- Strict scope: ativo
- BKs editados: `BK-MF6-03`, `BK-MF6-04`
- Código de implementação editado: nenhum
- Relatório atualizado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais nos 10 BKs MF6 e relatórios untracked em `docs/planificacao/guias-bk/`. Esta correção preservou o trabalho existente e alterou apenas os dois BKs alvo e este relatório.

### Resumo executivo

A execução atual corrigiu os dois findings `P1` confirmados na auditoria imediatamente anterior. Em `BK-MF6-03`, o fragmento que dependia de `scoreReconciliationCandidate` e de uma rota incompleta foi substituído por uma função completa `suggestReconciliations`, com validação de `statementLineId`, consulta multiempresa a `BankStatementLine`, `Receipt` e `Payment`, medição de duração, `withinBudget`, resposta `complete`/`partial` e route Express com `requireAuth`, `requireCompanyContext`, `requirePermission(Permission.TREASURY_WRITE)`, `requireRole(...)` e `sendError`.

Em `BK-MF6-04`, o fragmento que dependia de `calculateFifoLayers` foi substituído por código completo para `fifoPerformance.js`, `consumeFifoLayers` e `previewFifoCost`. O guia passa a calcular quantidade disponível antes de escrever, devolver `409 INSUFFICIENT_FIFO_LAYERS`, medir `durationMs`/`withinBudget` e preservar a separação entre preview consultivo (`write: false`) e movimento definitivo.

Estado final desta execução: os dois BKs ficam `OK` como guias documentais executáveis. A validação é textual/estrutural, não runtime numa árvore `apps/` aplicada.

### Resultado antes e depois desta correção

| Métrica | Antes da correção atual | Depois da correção atual |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 0 | 2 |
| PARCIAL | 0 | 0 |
| CRITICO | 2 | 0 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado antes | Estado depois | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-03` | `RNF10` | `P1` | `Oleksii` | `Pedro` | `CRITICO` | `OK` | service, route, guards, validação, medição e smoke ficaram completos e coerentes com tesouraria |
| `BK-MF6-04` | `RNF11` | `P1` | `Andre` | `Oleksii` | `CRITICO` | `OK` | FIFO passou de fragmento para função completa com validação prévia, medição e preview sem escrita |

### Findings tratados

#### MF6-AUD-20260622-BK03-F01

- BK/RF/RNF afetado: `BK-MF6-03` / `RNF10`
- Severidade: `P1`
- Estado após correção: `CORRIGIDO_SEM_VALIDACAO_TOTAL`
- Evidência da correção:
  - O guia já não contém `scoreReconciliationCandidate`, `req.company` nem rota apenas com `requireAuth`.
  - `statementImportService.js` passa a criar `suggestReconciliations(prisma, context)` no próprio BK.
  - A função valida `statementLineId`, filtra por `companyId` do contexto autenticado e separa recebimentos de pagamentos pelo sinal do valor.
  - `statementRoutes.js` passa a usar `requireCompanyContext(prisma)`, `requirePermission(Permission.TREASURY_WRITE)`, `requireRole(...)`, `sendError` e cabeçalho `X-OPSA-Reconciliation-Duration-Ms`.
  - O smoke textual passou a verificar orçamento, service exportado, cabeçalho e guard de empresa ativa.
- Validação não executada: o código não foi aplicado numa árvore `apps/api`; por isso não foi usado o estado `CORRIGIDO`.

#### MF6-AUD-20260622-BK04-F01

- BK/RF/RNF afetado: `BK-MF6-04` / `RNF11`
- Severidade: `P1`
- Estado após correção: `CORRIGIDO_SEM_VALIDACAO_TOTAL`
- Evidência da correção:
  - O guia já não contém `calculateFifoLayers` nem fragmento solto de integração FIFO.
  - `fifoPerformance.js` passa a lançar `409 INSUFFICIENT_FIFO_LAYERS` com `httpError`.
  - `consumeFifoLayers` mostra a função completa, calcula `availableQuantity`, valida antes de atualizar camadas e devolve `durationMs`/`withinBudget`.
  - `previewFifoCost` mantém `write: false`, preservando a consulta sem gravação.
  - A rota de preview mantém `requireCompanyContext(prisma)` e `Permission.INVENTORY_READ`.
  - O smoke textual passou a verificar orçamento, medição, validação de stock, `write: false` e guard de empresa ativa.
- Validação não executada: o código não foi aplicado numa árvore `apps/api`; por isso não foi usado o estado `CORRIGIDO`.

### Mapa de integracao da MF

#### BK-MF6-03

- Ficheiros criados pelo BK: `apps/api/src/modules/treasury/reconciliationPerformance.js`, `apps/api/scripts/check-mf6-reconciliation-performance.mjs`
- Ficheiros editados pelo BK: `apps/api/src/modules/treasury/statementImportService.js`, `apps/api/src/modules/treasury/statementRoutes.js`, `apps/api/package.json`
- Exports produzidos: `RECONCILIATION_BUDGET_MS`, `RECONCILIATION_MAX_CANDIDATES`, `limitReconciliationCandidates`, `measureReconciliation`, `suggestReconciliations`
- Imports consumidos de BKs anteriores: `httpError`, `recordIntegrationLog`, `validateStatementImportPayload`, guards de autenticação/empresa/permissões/role, modelos Prisma de extrato, recebimento e pagamento
- Endpoint criado: `POST /api/treasury/reconciliations/suggestions`
- DTOs/validators criados: validação local de `statementLineId` e `candidateLimit`
- Schemas/modelos usados: `BankStatementLine`, `Receipt`, `Payment`, `BankReconciliationSuggestion`
- Services criados ou reforçados: reforço de `statementImportService` com sugestão mensurável
- Componentes/páginas frontend criados: nenhum obrigatório
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: sessão, empresa ativa, `Permission.TREASURY_WRITE`, roles `ADMIN`, `CONTABILISTA`, `OPERACIONAL`, ausência de ownership vindo do body
- Testes criados: smoke textual `check-mf6-reconciliation-performance.mjs`
- BKs seguintes dependentes: `BK-MF6-04` herda o padrão de orçamento; MF seguinte pode usar a evidência de performance sem alterar reconciliação automaticamente

#### BK-MF6-04

- Ficheiros criados pelo BK: `apps/api/src/modules/inventory/fifoPerformance.js`, `apps/api/scripts/check-mf6-fifo-performance.mjs`
- Ficheiros editados pelo BK: `apps/api/src/modules/inventory/fifoCostService.js`, `apps/api/package.json`
- Ficheiros revistos pelo BK: `apps/api/src/modules/inventory/fifoCostRoutes.js`, `apps/api/src/modules/inventory/stockMovementService.js`
- Exports produzidos: `FIFO_COST_BUDGET_MS`, `measureFifoCost`, `assertEnoughFifoStock`
- Imports consumidos de BKs anteriores: `httpError`, `consumeFifoLayers`, `previewFifoCost`, guards de autenticação/empresa/permissões, modelos Prisma de camadas FIFO e consumos
- Endpoint criado: nenhum novo; reforço de `GET /api/inventory/fifo-cost/preview`
- DTOs/validators criados: validação de artigo, armazém, quantidade positiva e stock suficiente
- Schemas/modelos usados: `StockCostLayer`, `StockCostConsumption`, `StockMovement`
- Services criados ou reforçados: reforço de `fifoCostService` com medição e validação antes de escrita
- Componentes/páginas frontend criados: nenhum obrigatório
- Providers de IA criados ou usados: nenhum
- Regras de segurança/autorização aplicadas: sessão, empresa ativa, `Permission.INVENTORY_READ` no preview, filtro por `companyId` vindo do contexto
- Testes criados: smoke textual `check-mf6-fifo-performance.mjs`
- BKs seguintes dependentes: `BK-MF6-05` pode assumir FIFO medido e operação crítica separada de consulta

### Decisões confirmadas

- `CANONICO`: `RNF10` exige sugestão de reconciliação em até 3 segundos.
- `CANONICO`: `RNF11` exige FIFO correto sem bloquear operações críticas.
- `CANONICO`: reconciliação sugere correspondências, mas não confirma matches nem altera contabilidade automaticamente.
- `CANONICO`: FIFO preserva ordem de entrada das camadas, não custo mínimo nem média ponderada.
- `DERIVADO`: `candidateLimit` entre 1 e 250 é uma proteção operacional local para manter o orçamento de 3 segundos.
- `DERIVADO`: `withinBudget` em reconciliação e FIFO é métrica de evidence, não regra de domínio.
- `DERIVADO`: preview FIFO com `write: false` é a forma segura de separar consulta de gravação crítica.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF6-02` -> `BK-MF6-03`: coerência preservada. O BK3 passa a entregar sugestão mensurável, multiempresa e autorizada.
- `BK-MF6-03` -> `BK-MF6-04`: coerência preservada. Ambos usam orçamento, medição e fallback honesto sem automatizar decisões financeiras.
- `BK-MF6-04` -> `BK-MF6-05`: coerência preservada. FIFO fica medido e separado entre consulta e escrita antes do hardening de transporte.
- `MF5` -> `MF6` -> `MF7`: coerência documental preservada. A MF6 continua a reforçar performance e segurança sem assumir implementação real da MF alvo em `real_dev`.

### Verificações executadas

- Pesquisa de padrões antigos nos BKs alvo: sem ocorrências de `scoreReconciliationCandidate`, `calculateFifoLayers`, `req.company`, `requireAuth, async`, `unknown`, `as any`, `real_dev`, `placeholder`, `pseudo` ou `TODO (BLOCKER)`.
- Pesquisa obrigatória de risco em `docs/planificacao/guias-bk/MF6/*.md`:
  - `companyId` aparece nos BKs alvo como contexto backend autenticado (`req.companyId`, `context.companyId`, `input.companyId`) e não como ownership decidido pelo frontend.
  - `password` aparece em `BK-MF6-06`, esperado porque esse BK trata bcrypt.
  - Não apareceram `payload: unknown`, `as any`, `localStorage`, `sessionStorage`, `PRIVATE_KEY`, `deleteMany({})`, `delete({})`, `updateMany({})`, RAG, embeddings, OCR, SAF-T completo ou drift de outros projetos nos BKs alvo.
- Pesquisa de fuga de caminho interno: `rg -n 'real_dev|real-dev|cd real_dev|real_dev/' docs/planificacao/guias-bk/MF6/*.md`.
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false`.
  - Nota: o advisory continua a listar avisos heurísticos/globais, incluindo `missing_pedagogic_or_operational_blocks` e `missing_or_placeholder_snippet` em vários BKs. Não bloqueia `overall_pass` e não foi alargado fora do scope.

### Riscos restantes e TODOs

- Sem TODOs restantes dentro dos dois BKs alvo.
- Risco residual: a compilação/runtime real dos blocos depende de aplicar os guias numa árvore `apps/api`; esta execução corrigiu documentação, não código de aplicação.
- Risco residual: `bash scripts/validate-planificacao.sh` mantém `advisory_pass: false` por dívida global/heurística fora do scope.
- Drift documental encontrado nesta execução: nenhum drift de domínio ou caminho interno nos dois BKs alvo.

## Execução anterior registada - auditoria apenas BK-MF6-03 e BK-MF6-04

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-03`, `BK-MF6-04`
- Modo: `auditar_apenas`
- Implementation root consultado apenas como referência interna: `real_dev`
- Baseline da referência interna: `MF0..MF5`
- Estado assumido da MF alvo em implementação: `not_assumed`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Strict scope: ativo
- BKs editados: nenhum
- Código de implementação editado: nenhum
- Relatório atualizado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais nos 10 BKs MF6 e relatórios untracked em `docs/planificacao/guias-bk/`. Esta auditoria preservou esse estado e não editou nenhum BK. A única escrita desta execução é esta secção de relatório, permitida por `OUTPUT_MODE=relatorio_e_resumo`.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF6/`, com foco em `BK-MF6-03` e `BK-MF6-04`.
- BK anterior direto: `docs/planificacao/guias-bk/MF6/BK-MF6-02-suportar-25-utilizadores-simultaneos-por-empresa-sem-degradacao-relevante.md`.
- BK seguinte direto: `docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md`.
- BKs anteriores relevantes: `BK-MF2-03`, `BK-MF3-03`, `BK-MF4-10`, `BK-MF5-07`.
- Implementação de referência até MF5 em `real_dev/api/src/modules/treasury`, `real_dev/api/src/modules/inventory`, `real_dev/api/src/modules/auth`, `real_dev/api/src/modules/companies` e `real_dev/api/src/modules/permissions`, apenas para confirmar nomes e convenções já existentes.
- Relatórios existentes `AUDITORIA-HIDRATACAO-MF5.md` e `AUDITORIA-HIDRATACAO-MF6.md`.

### Resumo executivo

A reauditoria atual revê apenas `BK-MF6-03` e `BK-MF6-04`. O relatório anterior marcava estes dois guias como `OK` depois da hidratação completa da MF6, mas a leitura atual com a prompt estrita de executabilidade confirma que os passos centrais ainda não são implementáveis por um aluno sem adivinhar peças técnicas.

O problema principal não é a estrutura documental: ambos os BKs têm objetivo, importância, scope, conceitos, passos 1 a 7, validação, negativos, evidence e handoff. O problema está no código apresentado como solução final. `BK-MF6-03` deixa a integração de reconciliação dependente de funções não entregues, como `scoreReconciliationCandidate` e `suggestReconciliations`, e apresenta uma rota que não preserva o padrão real de guards, permissões e tratamento de erro da tesouraria. `BK-MF6-04` apresenta a integração FIFO como fragmento, usando `requestedQuantity`, `availableQuantity`, `layers` e `calculateFifoLayers` sem mostrar a função completa a substituir nem alinhar com o service real `consumeFifoLayers`.

Estado final desta execução: os dois BKs ficam `CRITICO` em auditoria documental, porque o aluno não consegue aplicar os passos principais com segurança técnica e de domínio apenas a partir do guia. Não foi feita correção porque `MODO=auditar_apenas`.

### Resultado antes e depois desta auditoria

| Métrica | Estado anterior registado no relatório | Estado auditoria atual |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 2 | 0 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 2 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado anterior registado | Estado auditoria atual | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-03` | `RNF10` | `P1` | `Oleksii` | `Pedro` | `OK` | `CRITICO` | passos de service e route usam funções não entregues e não mostram código completo integrado |
| `BK-MF6-04` | `RNF11` | `P1` | `Andre` | `Oleksii` | `OK` | `CRITICO` | integração FIFO depende de variáveis/funções inexistentes no guia e não substitui a função real completa |

### Findings confirmados nesta execução

#### MF6-AUD-20260622-BK03-F01

- BK/RF/RNF afetado: `BK-MF6-03` / `RNF10`
- Severidade: `P1`
- Estado nesta auditoria: `BLOQUEADO_POR_SCOPE`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md:223` mostra apenas um fragmento de integração, não a função completa do service.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md:227` chama `scoreReconciliationCandidate(...)`, mas o guia não cria essa função e a referência `real_dev/api/src/modules/treasury/statementImportService.js` usa outro contrato interno (`buildSuggestions`).
  - `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md:268` chama `suggestReconciliations(...)`, mas o guia não cria nem exporta essa função.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md:266` apresenta uma route só com `requireAuth`, enquanto a referência real de tesouraria usa `requireAuth`, `requireCompanyContext`, `requirePermission(Permission.TREASURY_WRITE)`, `requireRole(...)` e `sendError`.
- Expected: código completo e integrado para uma função de sugestão mensurável, com imports, validação, contexto multiempresa, permissões, tratamento de erro e relação clara com `BankStatementLine`, `Receipt`, `Payment` e logs de integração.
- Observed: o BK entrega o módulo de orçamento, mas deixa o núcleo de sugestão e a route como fragmentos não executáveis.
- Impacto pedagógico: o aluno teria de inventar nomes, função de scoring, payload, imports, guards e error handling.
- Impacto técnico: risco de endpoint que não compila, ignora permissões de tesouraria ou duplica o contrato de reconciliação da MF3.
- Impacto de segurança/domínio: sem `requireCompanyContext` e permissões explícitas no snippet, a explicação de empresa ativa fica mais fraca do que o padrão real do backend.
- Causa provável: a hidratação anterior transformou o RNF em roteiro de performance, mas não reescreveu a função real completa de reconciliação.
- Correção recomendada: reescrever `BK-MF6-03` em modo `corrigir_apenas`, criando um bloco completo para `apps/api/src/modules/treasury/reconciliationPerformance.js`, uma função completa exportada no service ou adaptação completa de `importBankStatement`, uma route coerente com `buildStatementRoutes`, e smoke que valide também o nome exportado e a presença dos guards.

#### MF6-AUD-20260622-BK04-F01

- BK/RF/RNF afetado: `BK-MF6-04` / `RNF11`
- Severidade: `P1`
- Estado nesta auditoria: `BLOQUEADO_POR_SCOPE`
- Evidência objetiva:
  - `docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md:219` mostra apenas um fragmento de integração no service.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md:220` usa `requestedQuantity` e `availableQuantity` sem mostrar como são calculadas.
  - `docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md:224` chama `calculateFifoLayers(...)`, função que não existe no guia nem na referência `real_dev/api/src/modules/inventory/fifoCostService.js`.
  - A referência real usa `consumeFifoLayers(tx, input)`, `createCostLayer(tx, input)` e `previewFifoCost(prisma, input)`, pelo que o fragmento atual não indica a substituição completa nem preserva claramente o contrato existente.
- Expected: código completo para adaptar `consumeFifoLayers` e/ou `previewFifoCost`, com imports, cálculo de quantidade disponível, erro HTTP coerente, preservação de `write: false` no preview, medição de duração e ausência de gravação em consulta.
- Observed: o BK cria um módulo de medição, mas não mostra a função FIFO completa a substituir e usa nomes inexistentes.
- Impacto pedagógico: o aluno teria de descobrir sozinho onde calcular stock disponível, como manter transação, como devolver erro HTTP e como anexar `durationMs`.
- Impacto técnico: risco de service que não compila, cálculo FIFO divergente do contrato da MF2 ou preview que altera camadas por engano.
- Impacto de segurança/domínio: custo FIFO é dado sensível e deve manter filtro por empresa ativa; a ausência da função completa torna fácil perder esse filtro ao adaptar o service.
- Causa provável: a hidratação anterior reforçou a teoria e a evidence, mas deixou a alteração principal como pseudo-integração.
- Correção recomendada: reescrever `BK-MF6-04` em modo `corrigir_apenas`, substituindo o fragmento por uma versão completa de `consumeFifoLayers` ou por helpers concretos que existam no próprio guia, com `httpError`, cálculo de disponibilidade, medição, retorno `withinBudget` e teste/smoke que não dependa só de pesquisa textual.

### Mapa de integracao da MF

#### BK-MF6-03

- Ficheiros previstos pelo BK: `apps/api/src/modules/treasury/reconciliationPerformance.js`, `apps/api/src/modules/treasury/statementRoutes.js`, `apps/api/src/modules/treasury/statementImportService.js`, `apps/api/scripts/check-mf6-reconciliation-performance.mjs`, `apps/api/package.json`
- Contratos consumidos: `BK-MF3-03` (`BankStatementImport`, `BankStatementLine`, `BankReconciliationSuggestion`, recebimentos e pagamentos), `BK-MF4-10` (logs de integração), guards de autenticação/empresa/permissões.
- Entrega prometida para BK seguinte: orçamento de 3 segundos, resposta `complete`/`partial` e cabeçalho de duração.
- Estado de integração atual: `CRITICO`, porque o guia promete `reconciliationSuggestionService`/`suggestReconciliations` mas não entrega service completo nem route alinhada com a referência.

#### BK-MF6-04

- Ficheiros previstos pelo BK: `apps/api/src/modules/inventory/fifoPerformance.js`, `apps/api/src/modules/inventory/fifoCostService.js`, `apps/api/scripts/check-mf6-fifo-performance.mjs`, `apps/api/package.json`, revisão de `apps/api/src/modules/inventory/stockMovementService.js`
- Contratos consumidos: `BK-MF2-03` (`StockCostLayer`, `StockCostConsumption`, `consumeFifoLayers`, `previewFifoCost`), movimentos de stock e relatórios de stock.
- Entrega prometida para BK seguinte: FIFO medido e protegido antes da sequência de segurança operacional.
- Estado de integração atual: `CRITICO`, porque o guia usa nomes inexistentes e não mostra a adaptação completa do service real.

### Decisões confirmadas

- `CANONICO`: `RNF10` exige que a reconciliação bancária sugira correspondências em até 3 segundos.
- `CANONICO`: `RNF11` exige que o cálculo FIFO mantenha correção e não bloqueie operações críticas.
- `CANONICO`: `RF33` define importação de extratos e reconciliação automática como sugestão auditável.
- `CANONICO`: `RF25` define FIFO como regra de inventário, não média ponderada.
- `CANONICO`: `BK-MF6-03` e `BK-MF6-04` são `P1`, `Core`, `Fase 3`, em `S10-S11`, conforme matriz, backlog e contrato de campos.
- `DERIVADO`: resposta parcial na reconciliação é aceitável se o lote exceder o orçamento e se não confirmar matches automaticamente.
- `DERIVADO`: medir FIFO sem alterar a regra canónica é aceitável, mas a medição tem de envolver funções reais ou helpers criados no próprio BK.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF6-02` -> `BK-MF6-03`: conceptualmente coerente, porque a leitura de baseline/latência prepara o orçamento de reconciliação. Tecnicamente bloqueado, porque o BK atual não entrega service/route completos.
- `BK-MF6-03` -> `BK-MF6-04`: conceptualmente coerente, porque ambos aplicam orçamentos de performance a operações financeiras sensíveis. Tecnicamente bloqueado, porque `BK-MF6-03` não fecha o contrato executável que deveria servir de padrão.
- `BK-MF6-04` -> `BK-MF6-05`: conceptualmente coerente, porque FIFO protegido antecede hardening de transporte. Tecnicamente bloqueado até `BK-MF6-04` mostrar a função FIFO completa e compatível com MF2.
- `MF6` -> `MF7`: coerência geral preservada em intenção, mas estes dois BKs devem ser corrigidos antes de usar MF6 como base de qualidade final.

### Verificações executadas antes da escrita final

- Pesquisa canónica por `RNF10`, `RNF11`, `RF25`, `RF33`, `BK-MF6-03` e `BK-MF6-04` em RF/RNF, matriz, backlog, contrato de campos, MF-VIEWS, plano de sprints e guias BK.
- Pesquisa estrutural nos dois BKs alvo para secções obrigatórias, passos, blocos de código e explicações.
- Pesquisa em `real_dev/api/src/modules/treasury/statementImportService.js`, `real_dev/api/src/modules/treasury/statementRoutes.js`, `real_dev/api/src/modules/inventory/fifoCostService.js` e `real_dev/api/src/modules/inventory/fifoCostRoutes.js` para confirmar contratos reais até MF5.
- Pesquisa de risco nos BKs MF6:
  - `password` em `BK-MF6-06` é falso positivo esperado porque esse BK trata bcrypt.
  - `companyId` em `BK-MF6-01` e `BK-MF6-10` aparece como contexto backend interno, não como empresa escolhida pelo frontend.
- Pesquisa de fuga de caminho interno: `rg -n 'real_dev|real-dev|cd real_dev|real_dev/' docs/planificacao/guias-bk/MF6/*.md`.
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false`.
  - Nota: o advisory continua ligado a regras legadas do validador (`missing_pedagogic_or_operational_blocks`, `missing_or_placeholder_snippet`) e a documentos globais antigos; não foi corrigido por `STRICT_SCOPE=true`.

### Riscos restantes e TODOs

- `BK-MF6-03` deve ser corrigido antes de ser entregue a alunos como guia executável.
- `BK-MF6-04` deve ser corrigido antes de ser entregue a alunos como guia executável.
- A validação runtime dos snippets depende de aplicar os guias numa árvore `apps/` real; esta execução não implementou código de aplicação.
- O relatório continua untracked, tal como já estava antes desta execução.

## Execução anterior registada - auditoria apenas BK-MF6-01 e BK-MF6-02

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-01`, `BK-MF6-02`
- Modo: `auditar_apenas`
- Implementation root consultado apenas como referência interna: `real_dev`
- Baseline da referência interna: `MF0..MF5`
- Estado assumido da MF alvo em implementação: `not_assumed`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Strict scope: ativo
- BKs editados: nenhum
- Código de implementação editado: nenhum
- Relatório atualizado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais nos 10 BKs MF6 e relatórios untracked em `docs/planificacao/guias-bk/`. Esta auditoria preservou esse estado e não editou nenhum BK. A única escrita desta execução é esta secção de relatório, permitida por `OUTPUT_MODE=relatorio_e_resumo`.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF6/`, com foco em `BK-MF6-01` e `BK-MF6-02`.
- BK anterior direto: `docs/planificacao/guias-bk/MF5/BK-MF5-07-dashboard-e-listagens-devem-carregar-em-2-segundos.md`.
- BK seguinte direto: `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md`.
- Implementação de referência até MF5 em `real_dev/api/src` e `real_dev/web/src`, apenas para confirmar nomes e convenções já existentes.
- Relatórios existentes `AUDITORIA-HIDRATACAO-MF5.md` e `AUDITORIA-HIDRATACAO-MF6.md`.

### Resumo executivo

A auditoria atual revalida os dois BKs alvo depois da correção anterior registada neste relatório. O estado corrente de `BK-MF6-01` e `BK-MF6-02` é `OK`: ambos seguem a estrutura nova exigida, mantêm caminhos `apps/...`, não expõem `real_dev`, preservam os contratos canónicos de `RNF08` e `RNF09`, e já não reproduzem os dois findings anteriores.

No `BK-MF6-01`, a função inexistente `createSaleDocumentInsideTransaction` deixou de aparecer. O guia usa medição nas routes com os services reais `createSaleDocument`, `createPurchaseDocument` e `createManualJournal`, mantendo `req.companyId` e `req.user.id` como contexto backend interno. No `BK-MF6-02`, o teste já exige `OPSA_SESSION_COOKIES_JSON` com 25 sessões, baseline, `allowedP95` e falha objetiva quando a degradação é relevante.

Não foram encontrados novos findings P0, P1, P2 ou P3 nos dois BKs alvo. A validação continua documental/estrutural: os snippets dos BKs não foram aplicados numa árvore `apps/` real nesta execução.

### Resultado antes e depois desta auditoria

| Métrica | Antes da auditoria atual | Depois da auditoria atual |
| --- | ---: | ---: |
| BKs analisados | 2 | 2 |
| OK | 2 | 2 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado anterior registado | Estado auditoria atual | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `P0` | `Oleksii` | `Andre` | `OK` | `OK` | guia autocontido, medição backend integrada nas routes, services reais referenciados e critérios mensuráveis |
| `BK-MF6-02` | `RNF09` | `P1` | `Sofia` | `Pedro` | `OK` | `OK` | guia autocontido, 25 sessões distintas, baseline, limite objetivo de degradação e negativos claros |

### Findings reavaliados

#### MF6-AUD-20260622-REAUD-F01

- BK/RF/RNF afetado: `BK-MF6-01` / `RNF08`
- Severidade original: `P1`
- Estado nesta auditoria: `JA_CORRIGIDO`
- Evidência objetiva atual: `BK-MF6-01` já não contém `createSaleDocumentInsideTransaction`; contém chamadas a `createSaleDocument(prisma, req.companyId, req.user.id, req.body)`, `createPurchaseDocument(prisma, req.companyId, req.user.id, req.body)` e `createManualJournal(prisma, req.companyId, req.user.id, req.body)`.
- Expected: código de guia completo para instrumentar inserções críticas sem inventar helper ou service inexistente.
- Observed atual: snippets completos para routes de venda, compra e lançamento manual, com `X-OPSA-Duration-Ms`, `X-OPSA-Within-Budget` e preservação do JSON de resposta.
- Impacto residual: apenas validação documental; a execução real dependerá de aplicar os snippets em `apps/api`.

#### MF6-AUD-20260622-REAUD-F02

- BK/RF/RNF afetado: `BK-MF6-02` / `RNF09`
- Severidade original: `P1`
- Estado nesta auditoria: `JA_CORRIGIDO`
- Evidência objetiva atual: `BK-MF6-02` usa `OPSA_SESSION_COOKIES_JSON`, exige 25 cookies válidos e calcula `allowedP95`.
- Expected: prova educativa de 25 utilizadores simultâneos por empresa sem repetir a mesma sessão.
- Observed atual: o script falha com menos de 25 sessões, mede baseline e concorrência, regista `baselineP95`, `concurrentP95`, `allowedP95` e recusa falhas HTTP.
- Impacto residual: para validar runtime será necessário criar 25 sessões reais da mesma empresa no ambiente dos alunos.

### Mapa de integracao da MF

#### BK-MF6-01

- Ficheiros criados previstos pelo BK: `apps/api/src/modules/performance/documentPerformance.js`, `apps/api/scripts/check-mf6-document-performance.mjs`
- Ficheiros editados previstos pelo BK: `apps/api/src/modules/sales/saleDocumentRoutes.js`, `apps/api/src/modules/purchases/purchaseDocumentRoutes.js`, `apps/api/src/modules/accounting/manualJournalRoutes.js`, `apps/api/package.json`
- Ficheiros revistos previstos pelo BK: `apps/api/src/modules/sales/saleDocumentService.js`, `apps/api/src/modules/purchases/purchaseDocumentService.js`, `apps/api/src/modules/accounting/manualJournalService.js`, `apps/web/src/lib/apiClient.ts`
- Exports produzidos: `DOCUMENT_INSERT_BUDGET_MS`, `measureDocumentInsert`, `toDocumentInsertLog`
- Imports/contratos consumidos: services de vendas, compras e contabilidade; `req.companyId`; `req.user.id`; guards de autenticação e empresa ativa.
- Endpoints envolvidos: `POST /api/sales/documents`, `POST /api/purchases/documents`, `POST /api/accounting/manual-journals`
- Regras de segurança/autorização: empresa ativa vem do backend; frontend não escolhe ownership; headers de performance não expõem dados financeiros.
- Testes/scripts previstos: `node --check`, `check-mf6-document-performance.mjs`, `npm run test:contracts`, `npm run test:integration`
- BK seguinte dependente: `BK-MF6-02`

#### BK-MF6-02

- Ficheiros criados previstos pelo BK: `apps/api/scripts/check-mf6-concurrency.mjs`
- Ficheiros editados previstos pelo BK: `apps/api/package.json`
- Ficheiros revistos previstos pelo BK: `apps/api/src/server.js`, `apps/api/src/modules/auth/sessionCookie.js`, `apps/api/src/modules/companies/companyContext.js`
- Exports produzidos: nenhum módulo de aplicação; o output do script é a evidence.
- Imports/contratos consumidos: endpoints autenticados existentes, cookies de sessão, contexto de empresa backend e regra de `credentials: "include"` herdada.
- Endpoints envolvidos: endpoints configuráveis por `OPSA_CONCURRENCY_PATHS`, por omissão `/api/customers` e `/api/items`.
- Regras de segurança/autorização: 25 cookies distintos; empresa ativa resolvida por sessão/membership; endpoint sem permissão deve falhar.
- Testes/scripts previstos: `node --check scripts/check-mf6-concurrency.mjs`, `npm run test:mf6:concurrency`
- BK seguinte dependente: `BK-MF6-03`

### Decisões confirmadas

- `CANONICO`: `RNF08` exige inserção de documentos em até 1 segundo.
- `CANONICO`: `RNF09` exige pelo menos 25 utilizadores simultâneos por empresa sem degradação relevante.
- `CANONICO`: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md` e `MF-VIEWS.md` confirmam `BK-MF6-01` e `BK-MF6-02`, owners, prioridades, sequência e handoff.
- `CANONICO`: os BKs dos alunos devem usar caminhos `apps/...`.
- `DERIVADO`: medir performance nas routes preserva os services financeiros existentes e evita alterar transações só para instrumentação.
- `DERIVADO`: `allowedP95 = max(2000 ms, baselineP95 * 2)` torna "sem degradação relevante" mensurável em ambiente PAP local.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF5-07` -> `BK-MF6-01`: coerente. MF5 ensina orçamento e medição de carregamento; MF6-01 aplica a disciplina a inserções críticas no backend.
- `BK-MF6-01` -> `BK-MF6-02`: coerente. A medição individual de operações prepara a leitura de latência e orçamento sob concorrência.
- `BK-MF6-02` -> `BK-MF6-03`: coerente. O script de carga e a interpretação de `p95` preparam o orçamento de reconciliação bancária em até 3 segundos.
- `MF6` -> `MF7`: coerente. Os BKs alvo reforçam performance e robustez antes de entrar em privacidade, backups, compatibilidade e testes críticos.

### Verificações executadas

- Pesquisa canónica por `RNF08`, `RNF09`, `BK-MF6-01` e `BK-MF6-02` em `docs/RNF.md`, matriz, backlog, contrato de campos, MF-VIEWS e plano de sprints.
- Pesquisa estrutural nas secções e passos dos BKs MF6, com foco nos dois alvos e nos BKs vizinhos `BK-MF5-07` e `BK-MF6-03`.
- Pesquisa em `real_dev/api/src` e `real_dev/web/src` para confirmar nomes reais de services/routes e contratos herdados até MF5.
- Pesquisa de risco nos BKs MF6 conforme a prompt.
- Pesquisa de fuga de caminho interno: `rg -n 'real_dev|real-dev|cd real_dev|real_dev/' docs/planificacao/guias-bk/MF6/*.md`.
  - Resultado: sem ocorrências.
- Pesquisa focada nos dois BKs alvo para `createSaleDocumentInsideTransaction`, `OPSA_SESSION_COOKIE\b`, `OPSA_SESSION_COOKIES_JSON`, `allowedP95`, `X-OPSA-Duration-Ms` e `X-OPSA-Within-Budget`.
  - Resultado: sem função antiga nem variável antiga; termos novos esperados presentes.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false`.

### Notas sobre falsos positivos e advisories

- A pesquisa ampla de risco devolve `password` em `BK-MF6-06`, que é esperado porque esse BK trata bcrypt.
- A pesquisa ampla devolve `companyId` em `BK-MF6-10`, fora dos BKs alvo desta execução, e `req.companyId` em `BK-MF6-01`, que é uso backend interno correto, não empresa recebida do frontend.
- O validador continua com `advisory_pass: false` porque procura blocos legados (`Bloco pedagogico`, `Bloco operacional`, `Snippet tecnico aplicavel`) em guias que já seguem a estrutura nova da prompt.

### Riscos restantes e TODOs

- Nenhum blocker documental encontrado nos dois BKs alvo.
- A validação runtime dos snippets depende de aplicar os guias numa árvore `apps/` real; esta execução não implementou código de aplicação.
- `BK-MF6-02` depende de 25 contas/sessões reais da mesma empresa para executar a prova completa.
- O relatório continua untracked, tal como já estava antes desta execução.

## Execução anterior registada - correção apenas BK-MF6-01 e BK-MF6-02

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-01`, `BK-MF6-02`
- Modo: `corrigir_apenas`
- Implementation root consultado apenas como referência interna: `real_dev`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Finding source: reauditoria anterior deste relatório
- Strict scope: ativo
- BKs editados: `BK-MF6-01` e `BK-MF6-02`
- Código de implementação editado: nenhum
- Relatório atualizado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais nos 10 BKs MF6 e vários relatórios em `docs/planificacao/guias-bk/` apareciam como untracked. Esta execução preservou essas alterações e limitou as novas edições aos dois BKs alvo e a esta secção de relatório.

### Resumo executivo

A execução em modo `corrigir_apenas` tratou os dois findings ativos da reauditoria anterior: `BK-MF6-01` estava `CRITICO` por depender de uma função inexistente e por deixar integrações incompletas; `BK-MF6-02` estava `PARCIAL` por simular 25 pedidos com uma única sessão e sem limite objetivo de degradação.

Depois da correção, os dois BKs ficam `OK` em termos documentais/pedagógicos. O `BK-MF6-01` passa a medir a performance ao nível das routes, preservando os services reais de venda, compra e lançamento manual. O `BK-MF6-02` passa a exigir 25 cookies/sessões distintos, baseline local e regra objetiva para `p95` concorrente.

Não foi editado código em `apps/` nem em `real_dev/`. Os snippets corrigidos continuam a ser instruções para os alunos aplicarem na raiz canónica `apps/...`.

### Resultado antes e depois

| Métrica | Antes | Depois |
| --- | ---: | ---: |
| BKs analisados/corrigidos | 2 | 2 |
| OK | 0 | 2 |
| PARCIAL | 1 | 0 |
| CRITICO | 1 | 0 |

### Inventário dos BKs corrigidos

| BK | RNF | Estado anterior | Estado depois | Correção aplicada |
| --- | --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `CRITICO` | `OK` | substituída função inexistente por integração route-level com `createSaleDocument`, `createPurchaseDocument` e `createManualJournal` |
| `BK-MF6-02` | `RNF09` | `PARCIAL` | `OK` | substituído cookie único por `OPSA_SESSION_COOKIES_JSON` com 25 sessões e regra objetiva de degradação |

### Findings corrigidos nesta execução

#### MF6-AUD-20260622-REAUD-F01

- BK/RF/RNF afetado: `BK-MF6-01` / `RNF08`
- Severidade original: `P1`
- Estado depois da correção: `CORRIGIDO_SEM_VALIDACAO_RUNTIME`
- Problema original: o guia usava `createSaleDocumentInsideTransaction(...)`, função inexistente na implementação de referência, e deixava compras e lançamentos manuais como repetição incompleta do padrão.
- Correção aplicada: o BK passou a criar `apps/api/src/modules/performance/documentPerformance.js` e a medir a duração nas routes reais de documentos, chamando `createSaleDocument(prisma, req.companyId, req.user.id, req.body)`, `createPurchaseDocument(prisma, req.companyId, req.user.id, req.body)` e `createManualJournal(prisma, req.companyId, req.user.id, req.body)`.
- Evidência documental: já não existe referência a `createSaleDocumentInsideTransaction`; o BK inclui snippets completos para as três routes, mantém o JSON esperado (`{ saleDocument }`, `{ purchaseDocument }`, `{ journalEntry }`) e adiciona os headers `X-OPSA-Duration-Ms` e `X-OPSA-Within-Budget`.
- Limite da validação: a correção foi validada como guia/documentação; os snippets não foram aplicados nem executados numa app `apps/` real nesta execução.

#### MF6-AUD-20260622-REAUD-F02

- BK/RF/RNF afetado: `BK-MF6-02` / `RNF09`
- Severidade original: `P1`
- Estado depois da correção: `CORRIGIDO_SEM_VALIDACAO_RUNTIME`
- Problema original: o guia media 25 pedidos concorrentes com um único cookie, o que não provava 25 utilizadores simultâneos por empresa.
- Correção aplicada: o BK passou a exigir `OPSA_SESSION_COOKIES_JSON` com 25 cookies válidos de teste, um baseline sequencial e uma execução concorrente com `p95` limitado por `allowedP95 = max(2000 ms, baselineP95 * 2)`.
- Evidência documental: o script falha quando há menos de 25 sessões, quando existe qualquer resposta HTTP falhada ou quando o `concurrentP95` ultrapassa o limite permitido.
- Limite da validação: a correção foi validada como guia/documentação; não foram criadas 25 sessões reais nem executado teste de carga local nesta execução.

### Mapa de integração da MF para os BKs corrigidos

#### BK-MF6-01

- Arquivo novo previsto no BK: `apps/api/src/modules/performance/documentPerformance.js`
- Arquivos alterados previstos no BK: `apps/api/src/modules/sales/saleDocumentRoutes.js`, `apps/api/src/modules/purchases/purchaseDocumentRoutes.js`, `apps/api/src/modules/accounting/manualJournalRoutes.js`, `apps/api/package.json`
- Arquivo de validação previsto no BK: `apps/api/scripts/check-mf6-document-performance.mjs`
- Exports previstos: `DOCUMENT_INSERT_BUDGET_MS`, `measureDocumentInsert`, `toDocumentInsertLog`
- Dependências consumidas: services reais de sales, purchases e accounting; `req.companyId`; `req.user.id`; guards existentes de autenticação e contexto de empresa.
- Endpoints envolvidos: `POST /api/sales/documents`, `POST /api/purchases/documents`, `POST /api/accounting/manual-journals`
- Script previsto: `npm run test:mf6:documents`
- Segurança: a medição não recebe `companyId` do body, não expõe dados financeiros nos headers e não substitui validação, transação, período fiscal nem auditoria dos services.
- Handoff direto: `BK-MF6-02`

#### BK-MF6-02

- Arquivo novo previsto no BK: `apps/api/scripts/check-mf6-concurrency.mjs`
- Arquivo alterado previsto no BK: `apps/api/package.json`
- Endpoints envolvidos: endpoints autenticados configuráveis por `OPSA_CONCURRENCY_PATHS`, por omissão `/api/companies/current`
- Variáveis previstas: `OPSA_SESSION_COOKIES_JSON`, `OPSA_CONCURRENCY_PATHS`
- Script previsto: `npm run test:mf6:concurrency`
- Segurança: cada pedido usa cookie próprio; a empresa ativa continua a ser resolvida pelo backend através de sessão e membership.
- Handoff direto: `BK-MF6-03`

### Decisões confirmadas

- `CANONICO`: `RNF08` exige inserção de documentos em até 1 segundo.
- `CANONICO`: `RNF09` exige pelo menos 25 utilizadores simultâneos por empresa sem degradação relevante.
- `CANONICO`: os BKs dos alunos devem usar caminhos `apps/...`; `real_dev` fica apenas como referência interna da auditoria.
- `DERIVADO`: medir a duração nas routes é aceitável para este BK porque preserva os contratos reais dos services e evita reescrever transações de documentos financeiros só para instrumentação.
- `DERIVADO`: para ambiente local de PAP, `allowedP95 = max(2000 ms, baselineP95 * 2)` é um critério operacional claro para transformar "sem degradação relevante" numa validação objetiva.

### Verificações executadas

- `rg` nos dois BKs alvo para `createSaleDocumentInsideTransaction`, `OPSA_SESSION_COOKIE\b`, `real_dev`, `OPSA_SESSION_COOKIES_JSON`, `measureDocumentInsert` e `X-OPSA-Duration-Ms`.
  - Resultado: sem função inexistente, sem variável antiga de cookie único e sem `real_dev`; os termos novos esperados aparecem nos BKs corretos.
- `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6`
  - Resultado: sem ocorrências nos BKs MF6.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false`.

### Notas sobre advisories e falsos positivos

- O validador continua a emitir advisories porque ainda procura blocos legados como `Bloco pedagogico`, `Bloco operacional` e `Snippet tecnico aplicavel`, embora a prompt atual exija a estrutura nova com `#### Objetivo`, tutorial linear, validação final, critérios e changelog.
- A pesquisa ampla por termos de risco em MF6 devolve falsos positivos fora do scope ou aceitáveis no contexto: `password` em `BK-MF6-06` é esperado por ser o BK de bcrypt; `companyId` em `BK-MF6-10` está fora dos BKs corrigidos; `req.companyId` em `BK-MF6-01` é uso backend interno, não instrução para receber empresa via body.

### Riscos restantes

- Os snippets corrigidos não foram aplicados a uma app `apps/` real nesta execução; a validação é documental e estrutural.
- A execução de carga do `BK-MF6-02` dependerá de os alunos criarem 25 contas/sessões de teste válidas na mesma empresa.
- O relatório estava untracked antes desta execução; esta secção mantém esse estado até haver decisão explícita de commit/stage.

## Execução anterior registada - auditoria apenas BK-MF6-01 e BK-MF6-02

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-01`, `BK-MF6-02`
- Modo: `auditar_apenas`
- Implementation root consultado: `real_dev`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Severidades analisadas: `P0`, `P1`, `P2`, `P3`
- Output: `relatorio_e_resumo`
- Strict scope: ativo
- BKs editados: nenhum
- Código de implementação editado: nenhum
- Relatório atualizado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Nota de worktree

Antes desta execução já existiam alterações locais nos 10 BKs MF6 e vários relatórios em `docs/planificacao/guias-bk/` apareciam como untracked. Essas alterações foram preservadas. Esta execução não reverteu nem editou BKs; apenas acrescentou esta reauditoria ao relatório.

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF6/`, com foco em `BK-MF6-01` e `BK-MF6-02`.
- BK anterior relevante: `docs/planificacao/guias-bk/MF5/BK-MF5-07-dashboard-e-listagens-devem-carregar-em-2-segundos.md`.
- BK seguinte direto: `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md`.
- Implementação de referência até MF5 em `real_dev/api/src` e `real_dev/web/src`, especialmente sales, purchases, manual journals, auth, company context e cliente HTTP.
- Relatórios existentes `AUDITORIA-HIDRATACAO-MF5.md` e `AUDITORIA-HIDRATACAO-MF6.md`.

### Resumo executivo

A reauditoria focada revê o estado atual de `BK-MF6-01` e `BK-MF6-02` em modo `auditar_apenas`. Ambos já usam a estrutura nova exigida pela prompt, têm metadados canónicos, caminhos `apps/...`, linguagem adequada e secções finais completas. Também não contêm `real_dev` nem linguagem interna proibida.

Apesar disso, a auditoria não confirma o estado `OK` para os dois BKs. O `BK-MF6-01` fica `CRITICO` porque os passos de integração de performance não apresentam código completo e integrado com as funções reais da referência: o guia chama `createSaleDocumentInsideTransaction(...)`, que não existe nos services atuais, e deixa compra/lançamento manual como repetição de padrão sem substituição completa. Para um aluno, isto exige adivinhar a alteração em services e routes precisamente num BK `P0` de performance e documentos financeiros.

O `BK-MF6-02` fica `PARCIAL` porque o script proposto mede 25 pedidos concorrentes com um único cookie de sessão, mas o requisito `RNF09` fala de pelo menos 25 utilizadores simultâneos por empresa. O guia também regista `p95`, mas não define um limite objetivo de degradação além de `0` falhas. Assim, a evidence pode demonstrar concorrência básica, mas ainda não prova o contrato semântico completo de 25 utilizadores simultâneos.

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado anterior no relatório | Estado reauditoria | Motivo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-01` | `RNF08` | `P0` | `Oleksii` | `Andre` | `OK` | `CRITICO` | estrutura completa, mas código de integração incompleto e função inexistente em zona crítica |
| `BK-MF6-02` | `RNF09` | `P1` | `Sofia` | `Pedro` | `OK` | `PARCIAL` | script mede pedidos concorrentes, mas não 25 sessões/utilizadores distintos nem limite objetivo de degradação |

### Findings desta execução

#### MF6-AUD-20260622-REAUD-F01

- BK/RF/RNF afetado: `BK-MF6-01` / `RNF08`
- Severidade: `P1`
- Estado: `PARCIAL`
- Tipo: executabilidade e integração técnica.
- Evidência objetiva: `BK-MF6-01`, linhas 229-237, apresenta `createSaleDocumentInsideTransaction(prisma, activeCompany, input)`, mas a implementação de referência expõe `createSaleDocument(prisma, companyId, userId, input)` em `real_dev/api/src/modules/sales/saleDocumentService.js`. O mesmo guia, linhas 251-280, manda repetir o padrão para compras e lançamentos manuais sem fornecer código completo integrado.
- Expected: o BK deve mostrar código completo ou substituições completas para `createSaleDocument`, `createPurchaseDocument`, `createManualJournal` e respetivas routes/controllers, preservando validação, transação, auditoria, período fiscal, `req.companyId` e `req.user.id`.
- Observed: há snippets de zona de integração e uma função inexistente. A rota também recebe um exemplo isolado de `res.set("X-OPSA-Duration-Ms", String(metric.durationMs))`, mas o guia não mostra como `metric` chega de forma completa à route.
- Impacto pedagógico: o aluno tem de adivinhar onde declarar a métrica, como alterar o retorno do service e como não quebrar o JSON esperado pela UI.
- Impacto técnico: risco de imports partidos, métrica indefinida, alteração incompleta de routes e regressão nos fluxos de venda, compra e lançamentos manuais.
- Impacto de segurança/domínio: por tocar documentos financeiros, qualquer integração incompleta pode contornar validação backend, empresa ativa, período fiscal ou auditoria.
- Causa provável: a hidratação anterior transformou o BK em guia pedagógico completo, mas manteve alguns exemplos como snippets de orientação em vez de código final integrado.
- Correção recomendada: reescrever o `BK-MF6-01` em modo `corrigir_apenas` ou `hidratar_corrigir`, substituindo os trechos por código completo alinhado com os nomes reais dos services e routes da referência.

#### MF6-AUD-20260622-REAUD-F02

- BK/RF/RNF afetado: `BK-MF6-02` / `RNF09`
- Severidade: `P1`
- Estado: `PARCIAL`
- Tipo: semântica de escalabilidade e evidence.
- Evidência objetiva: `BK-MF6-02`, linhas 153-187, define um único `SESSION_COOKIE` e cria `USERS` pedidos concorrentes com esse mesmo cookie. A referência de autenticação resolve uma sessão em `real_dev/api/src/modules/auth/authMiddleware.js`, e a empresa ativa vem dessa sessão em `real_dev/api/src/modules/companies/companyContext.js`.
- Expected: para afirmar 25 utilizadores simultâneos, o guia deve usar 25 sessões/cookies de teste, ou então declarar explicitamente que mede apenas 25 pedidos concorrentes de uma sessão e classificar a prova como parcial.
- Observed: o guia chama o resultado de 25 utilizadores simulados, mas tecnicamente só varia o cabeçalho auxiliar `x-opsa-load-user`; a identidade, role e empresa ativa continuam a vir da mesma sessão.
- Impacto pedagógico: o aluno pode defender uma prova que não corresponde ao requisito.
- Impacto técnico: a medição não cobre concorrência real de múltiplas sessões, permissões ou memberships.
- Impacto de segurança/domínio: baixo a médio; o script não quebra multiempresa, mas pode mascarar problemas de sessão e autorização sob carga.
- Causa provável: simplificação educativa legítima para carga local, mas sem explicitar a limitação no próprio contrato do BK.
- Correção recomendada: adaptar o BK para aceitar `OPSA_SESSION_COOKIES` como lista de 25 sessões válidas ou reclassificar a execução como smoke parcial; acrescentar critério de degradação objetivo para `p95`.

### Decisões confirmadas

- `CANONICO`: `RNF08` exige inserção de documentos em até 1 segundo.
- `CANONICO`: `RNF09` exige pelo menos 25 utilizadores simultâneos por empresa sem degradação relevante.
- `CANONICO`: `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md` e `MF-VIEWS.md` confirmam `BK-MF6-01` e `BK-MF6-02` em `MF6`, sprint `S10-S11`, owners, prioridades, RNF e sequência.
- `CANONICO`: a referência atual usa Express, Prisma, ES Modules, cookies HttpOnly e `credentials: "include"`.
- `DERIVADO`: um smoke local sem nova dependência pode ser aceitável para a PAP, mas deve separar prova parcial de prova completa do RNF.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF5-07` -> `BK-MF6-01`: coerente em intenção, porque MF5 prepara performance mensurável. A execução fica bloqueada no detalhe técnico do `BK-MF6-01`, que ainda precisa de código integrado com os services reais.
- `BK-MF6-01` -> `BK-MF6-02`: parcialmente coerente. O helper de medição pode alimentar raciocínio de carga, mas só depois de o BK anterior deixar de depender de snippets incompletos.
- `BK-MF6-02` -> `BK-MF6-03`: parcialmente coerente. A disciplina de medir `p95` prepara reconciliação, mas a prova de 25 utilizadores ainda é parcial.

### Verificações executadas

- `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/BK-MF6-01-...md docs/planificacao/guias-bk/MF6/BK-MF6-02-...md`
  - Resultado: sem ocorrências.
- `rg -n "...termos internos proibidos..." docs/planificacao/guias-bk/MF6/BK-MF6-01-...md docs/planificacao/guias-bk/MF6/BK-MF6-02-...md`
  - Resultado: sem ocorrências.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false` por documentos globais marcados como outdated e pelo validador ainda procurar blocos legados (`Bloco pedagogico`, `Bloco operacional`, `Snippet tecnico aplicavel`) nos BKs, incluindo os dois alvos.

### Riscos restantes e TODOs

- `BK-MF6-01` não deve ser usado como guia final antes de substituir os snippets por código completo e integrado.
- `BK-MF6-02` precisa de decidir se o critério final é 25 sessões/cookies reais ou smoke parcial de 25 pedidos concorrentes. Sem essa distinção, a evidence pode sobreprometer o `RNF09`.
- O validador oficial continua desalinhado com a estrutura nova exigida pela prompt, embora não bloqueie `overall_pass`.

### Resultado final desta execução

| Métrica | Resultado |
| --- | ---: |
| BKs analisados | 2 |
| OK | 0 |
| PARCIAL | 1 |
| CRITICO | 1 |

## Execução anterior registada - hidratação e correção completa MF6

### Escopo desta execução

- Projeto: `OPSA`
- MF processada: `MF6`
- BKs alvo: `BK-MF6-01` a `BK-MF6-10`
- Modo: `hidratar_corrigir`
- Implementation root consultado: `real_dev`
- Raiz canónica escrita nos BKs dos alunos: `apps/api` e `apps/web`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Severidades tratadas: `P0`, `P1`, `P2`, `P3`
- Output: `relatorio_e_resumo`
- Strict scope: ativo
- BKs editados: todos os 10 BKs de `docs/planificacao/guias-bk/MF6/`
- Código de implementação editado: nenhum
- Relatório criado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Commits: não executados, conforme `PERMITIR_COMMITS=nao`

### Documentos e fontes consultadas

- Prompt anexada desta execução.
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
- Todos os BKs em `docs/planificacao/guias-bk/MF6/`
- BKs anteriores relevantes de MF0 a MF5: autenticação, cookies, multiempresa, períodos fiscais, vendas, compras, pagamentos, FIFO, reconciliação, logs de integração, auditoria e performance MF5.
- BK seguinte direto: `docs/planificacao/guias-bk/MF7/BK-MF7-01-backups-automaticos-diarios-com-restauracao-possivel.md`
- Inventário estrutural de `real_dev/api/src`, `real_dev/web/src`, `real_dev/api/package.json`, `real_dev/web/package.json`, `real_dev/api/prisma/schema.prisma` e suites de testes existentes.

### Resumo executivo

A MF6 foi reescrita integralmente porque o estado inicial dos 10 guias ainda seguia um formato antigo com blocos pedagógico/operacional curtos, sem a estrutura obrigatória definida pela prompt atual. Todos os BKs foram classificados inicialmente como `CRITICO`: apesar de terem header canónico e algum conteúdo, não davam ao aluno um tutorial linear autocontido, com passos 1 a 7, código completo por contexto, validação, negativos e handoff real.

Depois da correção, os 10 guias MF6 passam a `OK` em termos documentais/pedagógicos: cada guia tem a estrutura `#### Objetivo` até `#### Changelog`, usa caminhos `apps/...`, preserva IDs e metadados canónicos, inclui passos sequenciais, blocos de código quando a implementação exige código, explicação didática, validação final e evidence para PR/defesa.

Não foi editado código em `real_dev` nem em `apps/`. Os blocos de código nos BKs são instruções para a implementação dos alunos, alinhadas com a stack e com a referência estrutural observada.

### Inventário dos BKs alvo

| BK | RNF | Prioridade | Owner | Apoio | Estado antes | Estado depois | Passos finais |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| `BK-MF6-01` | `RNF08` | `P0` | `Oleksii` | `Andre` | `CRITICO` | `OK` | 8 |
| `BK-MF6-02` | `RNF09` | `P1` | `Sofia` | `Pedro` | `CRITICO` | `OK` | 6 |
| `BK-MF6-03` | `RNF10` | `P1` | `Oleksii` | `Pedro` | `CRITICO` | `OK` | 6 |
| `BK-MF6-04` | `RNF11` | `P1` | `Andre` | `Oleksii` | `CRITICO` | `OK` | 6 |
| `BK-MF6-05` | `RNF12` | `P0` | `Andre` | `Oleksii` | `CRITICO` | `OK` | 8 |
| `BK-MF6-06` | `RNF13` | `P0` | `Andre` | `Pedro` | `CRITICO` | `OK` | 8 |
| `BK-MF6-07` | `RNF14` | `P0` | `Oleksii` | `Andre` | `CRITICO` | `OK` | 8 |
| `BK-MF6-08` | `RNF15` | `P0` | `Oleksii` | `Andre` | `CRITICO` | `OK` | 8 |
| `BK-MF6-09` | `RNF16` | `P0` | `Pedro` | `Andre` | `CRITICO` | `OK` | 8 |
| `BK-MF6-10` | `RNF17` | `P0` | `Oleksii` | `Sofia` | `CRITICO` | `OK` | 8 |

### Findings corrigidos

#### MF6-AUD-20260622-F01

- BK/RF/RNF afetado: `BK-MF6-01..BK-MF6-10` / `RNF08..RNF17`
- Severidade: `P1`
- Estado: `CORRIGIDO`
- Problema principal: estrutura antiga sem o formato tutorial obrigatório.
- Evidência objetiva: antes da correção, os ficheiros tinham cerca de 109 a 126 linhas, secções `## Bloco pedagogico`, `## Bloco operacional` e `## Snippet tecnico aplicavel`; depois da correção, todos usam `#### Objetivo`, `#### Tutorial técnico linear`, passos `### Passo N` e secções finais completas.
- Expected: guias autocontidos com teoria, arquitetura, passos 1 a 7, validação, negativos, evidence e handoff.
- Observed antes: guias curtos, genéricos e insuficientes para alunos implementarem sem adivinhar peças.
- Correção: reescrita integral dos 10 BKs MF6.

#### MF6-AUD-20260622-F02

- BK/RF/RNF afetado: `BK-MF6-01..BK-MF6-04` / `RNF08..RNF11`
- Severidade: `P1`
- Estado: `CORRIGIDO`
- Tipo: performance e robustez funcional.
- Correção aplicada: os BKs passaram a incluir orçamentos mensuráveis para inserção de documentos, concorrência local, reconciliação e FIFO, com smokes, negativos e distinção entre medição, validação e domínio.
- Impacto: a MF6 deixa de falar genericamente de desempenho e passa a ensinar como medir sem quebrar multiempresa, validação, FIFO, reconciliação ou contabilidade.

#### MF6-AUD-20260622-F03

- BK/RF/RNF afetado: `BK-MF6-05..BK-MF6-09` / `RNF12..RNF16`
- Severidade: `P1`
- Estado: `CORRIGIDO`
- Tipo: segurança operacional.
- Correção aplicada: os BKs passaram a cobrir HTTPS/HSTS, bcrypt, cookies seguros, hardening contra ataques comuns e variáveis de ambiente, sempre com validação backend, smokes e cenários negativos.
- Impacto: os guias deixam claro que segurança não pode depender só de UI, configuração implícita ou boas intenções.

#### MF6-AUD-20260622-F04

- BK/RF/RNF afetado: `BK-MF6-10` / `RNF17`
- Severidade: `P1`
- Estado: `CORRIGIDO`
- Tipo: auditoria obrigatória.
- Correção aplicada: o guia passou a definir operações sensíveis, helper central de auditoria, metadados mínimos, integração com permissões, períodos fiscais, documentos e reconciliação.
- Impacto: MF6 fecha com trilho auditável que prepara MF7.

#### MF6-AUD-20260622-F05

- BK/RF/RNF afetado: todos os BKs MF6.
- Severidade: `P2`
- Estado: `CORRIGIDO_SEM_VALIDACAO_TOTAL`
- Tipo: validação textual e execução local.
- Evidência objetiva: `git diff --check` passou; pesquisa por `real_dev` nos BKs MF6 saiu sem resultados; `bash scripts/validate-planificacao.sh` devolveu `overall_pass: true`.
- Limitação: os comandos indicados dentro dos BKs referem ficheiros que os alunos ainda vão criar em `apps/`; por isso não foram executados como código real nesta tarefa documental.
- Nota: a pesquisa ampla de risco ainda produz falsos positivos esperados para `password` no BK de bcrypt e `companyId` como campo interno Prisma/audit log, não como input do frontend.

### Mapa de integração da MF

| BK | Ficheiros previstos nos guias | Contratos consumidos | Entrega para |
| --- | --- | --- | --- |
| `BK-MF6-01` | `apps/api/src/modules/performance/documentPerformance.js`, smokes de inserção | vendas, compras, lançamentos manuais, MF5 performance | `BK-MF6-02` |
| `BK-MF6-02` | `apps/api/scripts/check-mf6-concurrency.mjs` | sessão, empresa ativa, endpoints autenticados | `BK-MF6-03` |
| `BK-MF6-03` | `apps/api/src/modules/treasury/reconciliationPerformance.js` | reconciliação MF3, logs MF4 | `BK-MF6-04` |
| `BK-MF6-04` | `apps/api/src/modules/inventory/fifoPerformance.js` | FIFO MF2, stock e relatórios | `BK-MF6-05` |
| `BK-MF6-05` | `apps/api/src/modules/security/transportSecurity.js` | Express, deploy HTTPS, sessão | `BK-MF6-06` |
| `BK-MF6-06` | `apps/api/src/modules/auth/password.js`, smoke bcrypt | auth MF0, reset MF0 | `BK-MF6-07` |
| `BK-MF6-07` | `apps/api/src/modules/auth/sessionCookie.js`, smoke cookies | HTTPS, auth, cliente API | `BK-MF6-08` |
| `BK-MF6-08` | `apps/api/src/modules/security/requestHardening.js` | cookies, HTTPS, validators | `BK-MF6-09` |
| `BK-MF6-09` | `apps/api/src/config/env.js`, `.env.example`, scanner | email, IA, integrações e config | `BK-MF6-10` |
| `BK-MF6-10` | `apps/api/src/modules/audit/auditLogService.js`, audit gate | auditoria MF4, documentos, permissões | `BK-MF7-01` |

### Decisões confirmadas

- `CANONICO`: `RNF08..RNF17` são os requisitos oficiais da MF6.
- `CANONICO`: a sequência oficial é `BK-MF6-01` a `BK-MF6-10`.
- `CANONICO`: `BK-MF6-01`, `BK-MF6-05`, `BK-MF6-06`, `BK-MF6-07`, `BK-MF6-08`, `BK-MF6-09` e `BK-MF6-10` são `P0`; os restantes são `P1`.
- `CANONICO`: stack documental é Node.js, Express, ES Modules, React, Vite, TypeScript, Prisma/PostgreSQL e cookies HttpOnly.
- `DERIVADO`: orçamentos locais de 1000 ms para inserção/FIFO e 3000 ms para reconciliação são critérios técnicos operacionais para tornar os RNF mensuráveis.
- `DERIVADO`: scripts Node sem novas dependências são suficientes para smokes educativos da PAP.
- `DERIVADO`: resposta parcial em reconciliação é aceitável quando o lote ultrapassa o limite local, desde que não confirme matches automaticamente.

### Drift documental encontrado

- O validador oficial ainda procura blocos legados (`Bloco pedagogico`, `Bloco operacional`, `Snippet tecnico aplicavel`) em todos os guias. A prompt desta execução exige a estrutura nova `#### Objetivo` a `#### Changelog`. Isto deixa `advisory_pass=false`, mas não bloqueia `overall_pass`.
- Alguns documentos de planificação globais aparecem como `outdated_docs` pelo critério de data do validador. Não foram alterados por `STRICT_SCOPE=true`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF5 -> MF6: `BK-MF5-07` introduz medição de performance; `BK-MF6-01` aplica a lógica a inserção de documentos.
- Dentro da MF6: performance individual evolui para concorrência, reconciliação, FIFO, transporte seguro, bcrypt, cookies, hardening, ambiente e auditoria.
- MF6 -> MF7: `BK-MF6-10` entrega auditoria e configuração segura que suportam backups, retenção e exportações da MF7.

### Verificações executadas

- `rg -n "...termos de risco..." docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: falsos positivos restantes contextualizados para `password` no BK de bcrypt e `companyId` como campo interno do modelo/audit log; termos evitáveis foram limpos.
- `rg -n "real_dev|real-dev|cd real_dev|real_dev/" docs/planificacao/guias-bk/MF6/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: passou.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass: true`; `advisory_pass: false` por dívida pré-existente/validador legado e documentos globais com data antiga.

### Riscos restantes e TODOs

- Os BKs estão prontos como guias documentais, mas os ficheiros `apps/...` descritos neles ainda não foram criados nesta execução.
- A execução real dos comandos internos de cada BK depende de uma implementação futura pelos alunos ou de uma tarefa separada de implementação em `real_dev`.
- O validador oficial deve ser atualizado noutra execução para reconhecer a estrutura nova dos BKs, se essa for agora a norma canónica.

### Resultado final

| Métrica | Antes | Depois |
| --- | ---: | ---: |
| BKs analisados | 10 | 10 |
| OK | 0 | 10 |
| PARCIAL | 0 | 0 |
| CRITICO | 10 | 0 |
