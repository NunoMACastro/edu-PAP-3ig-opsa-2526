# Auditoria completa ao funcionamento da IA em `real_dev`

**Projeto:** OPSA

**Data:** 2026-07-12

**Âmbito auditado:** `real_dev/api`, `real_dev/web`, schema/migrations Prisma, workers, permissões, testes e documentação operacional diretamente relacionada com IA

**Tipo de trabalho:** descrição técnica e funcional, auditoria de riscos e recomendações; sem correções de código

**Estado global:** `FUNCIONAL_COM_FINDINGS_RELEVANTES`

## 1. Resumo executivo

A aplicação não tem uma única “IA”. O nome cobre dois subsistemas diferentes:

1. um **motor analítico determinístico**, que lê dados da própria OPSA, calcula métricas contabilísticas e operacionais, aplica regras e cria insights, sugestões e alertas;
2. um **assistente conversacional**, que funciona sempre com ferramentas internas read-only e pode, opcionalmente, usar a OpenAI para interpretar a pergunta e redigir a resposta.

A OpenAI não é a fonte dos valores, não recebe Prisma ou SQL e não executa alterações financeiras. Quando está desativada, indisponível ou devolve um resultado rejeitado, o backend responde através do motor determinístico. Insights, sugestões e alertas não dependem da OpenAI.

A arquitetura tem boas decisões de base: isolamento por empresa/utilizador, provider desligado por omissão, consentimento versionado, ferramentas read-only, cifragem AES-256-GCM do chat, `store: false`, fallback local e uma fronteira explícita que mantém a decisão final no utilizador.

Contudo, a auditoria confirmou falhas relevantes. As mais importantes são:

- alertas de IA são materializados e enviados por email a todos os membros ativos da empresa, incluindo roles sem permissão para alertas de IA;
- a validação das respostas externas confirma as claims estruturadas, mas não confirma que os números escritos no texto correspondem às claims nem valida a fonte de cada claim;
- a pseudonimização cria aliases para todos os clientes, fornecedores, artigos e documentos da empresa, mesmo quando não são mencionados, e depois faz resolução N+1 desses aliases;
- pedidos fora do domínio são persistidos mas não consomem quota nem geram telemetria; a criação de sessões também não tem limite funcional;
- uma execução do worker que fique em `RUNNING` após crash não tem lease, timeout ou mecanismo de recuperação e pode bloquear análises automáticas futuras da empresa;
- filtros de período enviados pela UI às listagens são ignorados pelo backend;
- permissões com nome `*.read` protegem endpoints que criam análises e alteram estados;
- a nova pipeline v2 e a pipeline MF4 anterior coexistem com contratos diferentes, originando regressões visíveis, como sugestões sempre apresentadas com “Fonte por confirmar”.

Não foi encontrado qualquer P0 que permita à IA lançar, aprovar ou pagar automaticamente. Foram confirmados findings P1, P2 e P3 suficientes para desaconselhar apresentar o módulo como completamente pronto para produção sem uma fase de hardening.

## 2. O que a IA faz realmente

### 2.1 Motor analítico determinístico

O motor calcula valores diretamente a partir do PostgreSQL através de `aiMetricCatalog.js`. Não usa um modelo externo para calcular totais.

| Domínio | Origem principal | Resultado |
| --- | --- | --- |
| Margem e resultado | `JournalEntryLine` e contas SNC das classes 6 e 7 | receita, gastos operacionais, resultado, margem e EBITDA quando existe cobertura suficiente |
| Recebíveis | documentos de venda e recibos | total em aberto, total vencido e peso do vencido |
| Cashflow | contas/snapshots de tesouraria, recebimentos, pagamentos e vencimentos | saldo inicial, entradas, saídas e saldo final/projetado |
| Stock | `StockBalance`, movimentos e thresholds por artigo/armazém | contagem de riscos de stock baixo e alto |
| KPIs | margem, recebimentos e pagamentos | margem, EBITDA, PMR e PMP ponderados por montante pago/recebido |
| Comparações | duas execuções da mesma métrica | valores lado a lado para dois períodos |
| Explicação | `AiInsight` já autorizado | fórmula, evidência, ocorrência, qualidade, limitações e fonte |

As ferramentas canónicas expostas internamente são:

- `get_cashflow_summary`;
- `get_receivables_summary`;
- `get_stock_risk_summary`;
- `get_margin_summary`;
- `get_executive_kpis`;
- `compare_periods`;
- `get_insight_explanation`.

Cada período usa `Europe/Lisbon`, aceita no máximo 366 dias e limita a dez as referências apresentadas. Este `topN` não limita os totais calculados.

### 2.2 Insights, sugestões e alertas

Uma execução de análise (`AiAnalysisRun`) pode nascer de duas formas:

- manualmente, através de `POST /api/ai/analysis-runs`;
- automaticamente, pelo worker de IA, que tenta criar uma execução de sistema por empresa em cada ciclo horário.

O run passa por `QUEUED -> RUNNING -> COMPLETED` ou `FAILED`. O worker calcula quatro famílias de métricas e aplica quatro regras:

| Regra | Condição base | Prioridade |
| --- | --- | ---: |
| `NEGATIVE_CASHFLOW` | saldo final abaixo do threshold | 100 |
| `OVERDUE_RECEIVABLES` | recebíveis vencidos acima do threshold | 80 |
| `LOW_OPERATING_MARGIN` | margem abaixo do threshold | 70 |
| `STOCK_RISK` | quantidade de riscos de stock acima do threshold | 60 |

Cada risco material produz ou atualiza:

- um `AiInsight`, com explicação, evidência, score, severidade, período e fonte;
- uma `AiActionSuggestion`, sempre formulada como revisão humana;
- um `SmartAlert`, com severidade, score, prioridade e lifecycle.

Insights e alertas usam os estados `OPEN`, `ACKNOWLEDGED`, `RESOLVED` e `DISMISSED`. Sugestões usam `OPEN`, `ACCEPTED`, `DISMISSED` e `DONE`.

Quando um risco deixa de existir, insights e alertas abertos/reconhecidos da pipeline `AI_METRIC_V2` são marcados como resolvidos. Uma ocorrência dispensada não é reaberta automaticamente pelo mesmo upsert.

### 2.3 Notificações e email

O worker de notificações, separado do worker de IA, percorre empresas, lê lembretes e `SmartAlert` abertos e cria notificações in-app. O mesmo ciclo coloca emails numa outbox cifrada e idempotente. Um terceiro worker consome essa outbox e comunica com SMTP.

Fluxo operacional:

```text
worker IA
  -> AiInsight + AiActionSuggestion + SmartAlert
  -> worker de notificações
  -> InAppNotification + EmailOutbox cifrada
  -> worker de email
  -> SMTP
```

As preferências `stock`, `cashflow`, `ai` e `deadline` podem desligar a entrega. A API de preferências existe, mas não foi encontrada uma interface correspondente em `real_dev/web`.

### 2.4 Chat e OpenAI

O chat só aceita perguntas reconhecidas pelo classificador local: cashflow, recebíveis/clientes, stock, margem, KPIs, comparação ou explicação de insight. Uma pergunta não reconhecida é recusada localmente antes de chegar a um provider externo.

Quando a pergunta é suportada, o fluxo é:

```text
utilizador autenticado
  -> empresa ativa e AI_CHAT_USE
  -> ownership da sessão
  -> quota diária
  -> classificação local do pedido
  -> pseudonimização e contexto autorizado
  -> decisão OpenAI ou modo determinístico
  -> execução de tools internas company-scoped
  -> validação/fallback
  -> resolução local de aliases
  -> persistência cifrada + telemetria minimizada
  -> resposta SSE para a UI
```

A chamada externa só é considerada quando existem, em simultâneo:

1. `AI_PROVIDER_MODE=openai` no backend;
2. `OPENAI_API_KEY` configurada;
3. opt-in da empresa (`CompanyAiSettings.openAiEnabled`);
4. consentimento do utilizador para a versão atual da política.

Se uma destas condições falhar, a pergunta continua a ser respondida em modo determinístico. O opt-in da empresa não liga/desliga a análise interna; controla apenas o provider externo.

O provider usa a Responses API com:

- `store: false`;
- function tools read-only;
- `parallel_tool_calls: false`;
- máximo de quatro tool calls;
- output estruturado por JSON Schema;
- `safety_identifier` derivado por HMAC;
- sem Conversations API ou `previous_response_id`;
- sem web search, ficheiros, Code Interpreter ou MCP.

O provider recebe a pergunta e o histórico pseudonimizados, contexto mínimo, schemas das tools e resultados agregados. Não recebe Prisma, SQL, credenciais, anexos ou SAF-T.

### 2.5 Fallback e falhas

Se a OpenAI falhar, ultrapassar o limite de tools, devolver JSON inválido, falhar o gate de dados ou produzir claims rejeitadas, o serviço usa a primeira tool já executada ou executa a tool do classificador local e gera uma resposta determinística.

A resposta determinística apresenta chaves e valores técnicos, qualidade, período e limitações. É segura e previsível, mas menos natural e menos pedagógica do que a resposta redigida pelo provider.

## 3. Quem pode usar

Todas as APIs de IA exigem sessão válida e empresa ativa. A empresa vem do contexto de sessão; não é aceite do body como fronteira de ownership.

| Capacidade | ADMIN | GESTOR | CONTABILISTA | OPERACIONAL | AUDITOR |
| --- | :---: | :---: | :---: | :---: | :---: |
| Chat e drawer | Sim | Sim | Sim | Não | Não |
| Ler/criar análises e insights | Sim | Sim | Sim | Não | Não |
| Ler/alterar sugestões | Sim | Sim | Não | Não | Não |
| Ler/alterar alertas | Sim | Sim | Não | Não | Não |
| Gerir OpenAI, política, quotas e regras | Sim | Não | Não | Não | Não |
| Receber notificações gerais | Sim | Sim | Sim | Sim | Sim |

O comportamento real tem duas ressalvas:

- endpoints de escrita sobre runs e estados usam permissões de leitura;
- o worker de notificações entrega `SmartAlert` a todos os membros ativos, sem testar `AI_ALERTS_READ`, pelo que OPERACIONAL e AUDITOR podem receber conteúdo de alertas apesar de não terem acesso à página `/ai/alerts`.

## 4. Onde aparece e como aparece

### 4.1 Navegação principal

O frontend agrupa as páginas no menu **IA e trabalho**:

| Rota | Interface | Conteúdo principal |
| --- | --- | --- |
| `/ai/insights` | Insights automáticos | intervalo, agendamento do worker, status do run, cartões, score, fonte, período, reconhecimento e explicação |
| `/ai/suggestions` | Sugestões de ação | rationale, action type, fonte, qualidade/limitação e aceitar/dispensar |
| `/ai/chat` | Assistente OPSA | sessões, histórico, período, consentimento, chat, fontes, limitações, follow-ups, feedback e eliminação |
| `/ai/alerts` | Alertas inteligentes | intervalo, agendamento, severidade, score, fonte e reconhecer/resolver |
| `/ai/settings` | Administração da IA | provider, opt-in, política, quotas e thresholds; apenas ADMIN |
| `/operations/notifications` | Notificações | notificações in-app, incluindo alertas materializados |

A rota antiga `/ai/questions` redireciona para `/ai/chat`. O endpoint antigo `POST /api/ai/questions` permanece como adapter depreciado de um turno, com `Sunset` em 2027-01-01.

### 4.2 Drawer global

Quem tem `AI_CHAT_USE` vê também o botão global **Assistente OPSA**, independentemente da página atual. O drawer monta outra instância de `ChatWorkspace` e reutiliza a mesma API, mas não partilha estado React em tempo real com a página de chat.

O contexto enviado pelo frontend contém atualmente, de forma efetiva, sobretudo o identificador do módulo/rota. A infraestrutura suporta entidade, filtros e período, mas `App.tsx` fornece apenas `module`; cada workspace escolhe o seu próprio intervalo.

### 4.3 Apresentação das respostas

Cada resposta de chat pode apresentar:

- texto final;
- modo `openai` ou `deterministic`;
- modelo, quando aplicável;
- período, timezone e `asOf`;
- qualidade e limitações;
- fontes;
- sugestões de perguntas seguintes;
- feedback “Útil” ou “Não útil”.

O servidor envia SSE, mas o texto externo não é transmitido token a token. O provider consome primeiro o stream completo, o backend recebe a resposta estruturada final e só depois divide o texto em blocos de até 80 caracteres para a UI.

## 5. Origem, tratamento e destino dos dados

### 5.1 Fontes internas

Os valores vêm de dados company-scoped já existentes na aplicação:

- plano de contas e lançamentos;
- documentos de venda e compra;
- recibos e pagamentos;
- contas e snapshots de tesouraria;
- artigos, armazéns, saldos e movimentos de stock;
- thresholds de alertas;
- insights já persistidos.

Não existe treino de modelo com dados da empresa dentro desta codebase. A aplicação faz retrieval e cálculo sobre dados operacionais; a OpenAI, quando ativada, atua como camada de interpretação/tool calling/redação.

### 5.2 Pseudonimização

O backend tenta substituir empresa, clientes, fornecedores, artigos e documentos por aliases como `CUSTOMER_001`. O mapa entre alias e ID real fica no backend e é cifrado. Resultados de tools removem labels livres e convertem chaves terminadas em `Id` para referências pseudonimizadas.

Um gate regex bloqueia emails, IBAN PT, NIF, telefone PT, código postal, UUID, palavras de credenciais, anexos/SAF-T e alguns padrões de prompt injection.

### 5.3 Persistência

| Modelo | Conteúdo |
| --- | --- |
| `CompanyAiSettings` | opt-in, política e quotas por empresa |
| `AiUserConsent` | consentimento versionado por utilizador e empresa |
| `AiChatSession` | título, aliases, resumo local e expiração |
| `AiChatMessage` | payload cifrado, role, provider, modelo, tokens e feedback |
| `AiUsageEvent` | duração, tools, outcome, provider/modelo e tokens; sem texto |
| `AiRuleSetting` | ativação e threshold por regra |
| `AiAnalysisRun` | fila, ownership, estado, período, scopes e resumo |
| `AiDeletionAudit` | prova minimizada de eliminação |

Título, conteúdo, fontes, contexto, resumo e mapa de aliases do chat usam AES-256-GCM. A chave do chat deve ter 32 bytes e não pode ser igual à chave da outbox de email.

### 5.4 Retenção e eliminação

Cada sessão expira no máximo após 90 dias, renovados quando um turno suportado termina. A eliminação manual e a retenção removem sessão e mensagens por cascade, desligam os eventos de utilização da sessão e guardam apenas empresa, owner, motivo, data e HMAC do ID eliminado.

Revogar consentimento não elimina o histórico; apenas impede chamadas externas futuras até novo consentimento válido.

## 6. Fronteiras de segurança que estão bem implementadas

- autenticação e empresa ativa antes das rotas de IA;
- queries principais filtradas por `companyId`;
- ownership de chat por empresa e utilizador;
- OpenAI desligada por omissão;
- chave do provider apenas no backend;
- opt-in de empresa e consentimento individual versionado;
- tools read-only, sem acesso técnico direto à base de dados;
- ausência de endpoints de execução automática financeira;
- `store: false` e ausência de ferramentas externas adicionais;
- histórico e aliases cifrados com autenticação do envelope;
- fallback determinístico quando o provider falha;
- telemetria sem prompt/resposta em claro;
- eliminação física da conversa e auditoria minimizada;
- limits explícitos de período, tamanho da mensagem, output e tool calls;
- contexto de entidade revalidado no backend quando fornecido;
- separação dos workers de IA, notificações e email;
- testes unitários, contratuais e E2E fake para partes centrais do fluxo.

## 7. Pontos fracos e limitações funcionais

Estas limitações não são necessariamente bugs, mas condicionam a promessa de produto:

1. **“IA” analítica é sobretudo um rules engine.** Existem quatro regras e sete tools; não há aprendizagem automática, deteção estatística de anomalias ou previsão probabilística.
2. **Cashflow projetado é uma aproximação determinística.** Usa saldos atuais/snapshots e vencimentos, não um modelo de comportamento futuro.
3. **O classificador limita o LLM.** Uma formulação financeiramente válida mas sem keywords reconhecidas é recusada antes de o provider a interpretar.
4. **Sem conhecimento externo.** Não há legislação em tempo real, web, ficheiros, anexos ou pesquisa externa.
5. **Sem autonomia operacional.** “Aceitar” uma sugestão altera o lifecycle da sugestão; não cria automaticamente tarefa, lançamento, pagamento ou alteração de preço.
6. **Sem dashboard de custos/qualidade para o ADMIN.** A telemetria existe na base, mas não há interface operacional para tokens, fallback rate, latência, quota ou feedback.
7. **Preferências de alertas sem UI.** O backend suporta preferências, mas o utilizador não tem uma superfície web identificada para as gerir.
8. **Histórico contextual curto.** A OpenAI recebe no máximo 16 mensagens anteriores e o “resumo” persistido contém contagem de turnos e tools recentes, não uma síntese semântica da conversa.

## 8. Findings confirmados

### Escala de prioridade

- **P0:** execução financeira indevida, exposição massiva ou comprometimento imediato;
- **P1:** risco elevado de autorização, integridade, privacidade, abuso ou indisponibilidade;
- **P2:** falha funcional/operacional relevante sem impacto crítico imediato;
- **P3:** drift, UX, manutenção ou melhoria de baixo risco.

### IA-01 — P1 — Alertas entregues a roles sem permissão de IA

**Evidência:** `notificationService.js:92-108` lê todos os membros ativos e todos os alertas abertos; `notificationService.js:119-180` materializa e envia cada alerta sem testar a role/permissão. `permissions.js:135-180` não atribui `AI_ALERTS_READ` a OPERACIONAL ou AUDITOR, mas atribui `NOTIFICATIONS_READ`.

**Impacto:** conteúdo financeiro/operacional de alertas pode chegar por in-app e email a pessoas que não conseguem abrir `/ai/alerts`. A navegação esconde a página, mas o canal de notificação contorna essa decisão de autorização.

**Correção recomendada:** selecionar role na membership e aplicar `hasPermission(role, AI_ALERTS_READ)` antes de materializar qualquer `SmartAlert`; adicionar testes negativos para OPERACIONAL/AUDITOR e decidir explicitamente se existe uma versão redigida para destinatários sem permissão.

### IA-02 — P1 — Números do texto não são ligados às claims validadas

**Evidência:** `aiChatService.js:248-259` valida apenas `claim.metric/value` contra o conjunto de números das tools e valida `response.sourceRefs`. Não analisa os valores escritos em `response.answer` e não valida `claim.sourceRef`.

Foi executada uma prova direta em que `answer="A margem é 99%."`, a claim validada era `operatingMarginBps=1200` e `claim.sourceRef="fonte-inventada"`; `validateProviderClaims(...)` devolveu `true`.

**Impacto:** uma resposta pode apresentar um número inventado no texto e, em paralelo, incluir uma claim válida não correspondente. Isto contradiz a garantia documental de que cada valor numérico final é revalidado.

**Correção recomendada:** gerar a frase numérica final no backend a partir das claims validadas ou exigir placeholders tipados no output; validar `claim.sourceRef`; rejeitar qualquer número monetário/percentual no texto que não tenha correspondência inequívoca numa claim.

### IA-03 — P1 — Pseudonimização carrega e indexa toda a empresa em cada turno

**Evidência:** `aiPrivacy.js:38-45` lê sem paginação todos os clientes, fornecedores, artigos e documentos. `aiPrivacy.js:54-63` chama `nextAlias(...)` antes de confirmar se algum campo da entidade aparece no texto, adicionando todas as entidades ao mapa. `aiChatService.js:280-299` percorre depois todo o mapa e executa queries individuais para resolver aliases.

**Impacto:** crescimento desnecessário do payload cifrado, N+1 queries, latência e memória proporcionais ao volume total da empresa, repetidos também para o histórico. O mapa cifrado passa a conter referências a entidades nunca usadas, aumentando o blast radius de uma chave comprometida.

**Correção recomendada:** criar alias apenas após match; usar pesquisa/indexação limitada; guardar só aliases efetivamente usados; resolver referências em batch por categoria; impor limites e métricas de cardinalidade.

### IA-04 — P1 — Quota e armazenamento podem ser contornados com pedidos recusados/sessões vazias

**Evidência:** `aiChatService.js:334-347` verifica quota e persiste duas mensagens para um pedido não classificado, mas retorna antes de criar `AiUsageEvent`, atualizar expiração/alias map ou executar o bloco comum. `createChatSession` não impõe limite por utilizador. Não existe rate limit global nas rotas de IA; o rate limiter Redis atual está montado nas rotas de autenticação.

**Impacto:** um utilizador autorizado pode criar sessões e acumular mensagens recusadas sem consumir a quota diária registada, causando crescimento de base de dados e cifragem até à retenção.

**Correção recomendada:** contabilizar todo o turno aceite pela API, incluindo recusas e falhas; usar reserva atómica antes da persistência; limitar sessões ativas/mensagens por sessão; aplicar rate limiting específico ao chat e à criação de runs.

### IA-05 — P1 — Runs `RUNNING` não têm lease nem recuperação

**Evidência:** `claimNextAnalysisRun` muda o run para `RUNNING` e guarda `startedAt/claimedBy`; não existe heartbeat, `leaseUntil`, timeout ou requeue. `enqueueHourlyCompanyRuns` considera qualquer run de sistema `RUNNING` como ativo e não agenda outro.

**Impacto:** crash ou terminação do worker após o claim pode deixar a empresa sem novas análises automáticas indefinidamente. A UI continuará a fazer polling de um run que nunca termina.

**Correção recomendada:** implementar lease renovável e requeue de runs expirados, tentativas máximas, `lastHeartbeatAt`, dead-letter/error final e alerta de run bloqueado.

### IA-06 — P2 — Período e scopes não controlam as listagens/processamento como aparentam

**Evidência:** a UI envia `from/to` em `getAiInsights` e `getSmartAlerts`, mas `listAiRecords` usa apenas `companyId` e, opcionalmente, `status`. `AiAnalysisRun.scopes` é persistido, mas `processAnalysisRun` calcula e persiste sempre insights, sugestões e alertas.

**Impacto:** depois de pedir um período, a página pode misturar registos de outros períodos. Um caller que peça scopes limitados recebe comportamento diferente do contrato sugerido.

**Correção recomendada:** validar/aplicar `from`, `to`, `ruleCode`, `origin` e `status` nas listagens; validar enum de scopes e fazer o worker respeitá-lo ou remover o campo da API.

### IA-07 — P2 — Permissões de leitura autorizam escritas e não existe trilho auditável v2

**Evidência:** `aiRoutes.js:48-87` protege criação de runs e PATCH de estados com `AI_INSIGHTS_READ`, `AI_SUGGESTIONS_READ` e `AI_ALERTS_READ`. `AI_WRITE` existe na matriz, mas não é usada nestas rotas. `updateAiRecordStatus`, `updateAiSettings`, consentimento e criação/processamento de runs não escrevem `AuditLog` funcional.

**Impacto:** o princípio de least privilege fica enfraquecido e decisões humanas sobre alertas/sugestões não têm um histórico funcional consistente. As transições também aceitam qualquer estado permitido sem `from-state` ou controlo otimista.

**Correção recomendada:** criar permissões explícitas `AI_ANALYSIS_RUN`, `AI_INSIGHTS_MANAGE`, `AI_SUGGESTIONS_MANAGE` e `AI_ALERTS_MANAGE`, ou aplicar `AI_WRITE`; auditar alterações minimizadas e definir uma state machine com versão/claim concorrente.

### IA-08 — P2 — Quota de empresa não é atómica entre utilizadores

**Evidência:** `enforceQuota` faz `count` e só cria `AiUsageEvent` no fim do turno. O lock distribuído é por utilizador, não por empresa.

**Impacto:** vários utilizadores podem passar simultaneamente pelo mesmo limite da empresa e excedê-lo. Uma falha após o count também altera a relação entre reserva e consumo.

**Correção recomendada:** contador diário atómico em Redis ou tabela de quota com update condicional; reservar antes da geração e reconciliar outcome no final.

### IA-09 — P2 — O provider não está limitado ao intent/período autorizado do pedido

**Evidência:** depois de classificar o pedido, o backend passa todas as `AI_FUNCTION_TOOLS` ao provider. `executeSanitizedTool` valida a empresa e os argumentos da tool, mas não exige que tool/período coincidam com `classified.tool` e `defaultPeriod`.

**Impacto:** o provider pode consultar outra métrica ou outro período válido, até 366 dias, diferente do escolhido na UI. Continua company-scoped e read-only, mas quebra data minimization e coerência da resposta.

**Correção recomendada:** expor apenas as tools necessárias ao intent; intersetar argumentos com o período/contexto autorizado; permitir expansão apenas após confirmação explícita do utilizador.

### IA-10 — P2 — Drift entre pipeline MF4 legada e pipeline v2

**Evidência:** `aiService.js` mantém geração anterior com `assertAiRecommendationOnly`, `assertAiSourceQuality` e auditoria; a runtime v2 usa `aiAnalysisService.js`. A nova sugestão persiste apenas `sourceLabel` e a listagem devolve a row sem `sourceQuality/guardrail`. A UI mostra então “Fonte por confirmar”. O seed continua a chamar a pipeline anterior.

**Impacto:** seed/demo e runtime não exercitam exatamente o mesmo comportamento; garantias dos testes MF8 sobre a pipeline antiga não provam a pipeline usada pelo worker v2; a UX degrada todas as sugestões legítimas.

**Correção recomendada:** consolidar numa única pipeline; aplicar os guardrails à persistência v2; devolver DTO enriquecido ou persistir metadados de qualidade; migrar seed e testes para a mesma entrypoint operacional.

### IA-11 — P2 — DLP regex não garante remoção de toda a PII livre

**Evidência:** o gate cobre padrões concretos e substitui valores conhecidos na base, mas nomes/pessoas livres, referências atípicas e identificadores não reconhecidos podem sobreviver. Entidades com valores curtos inferiores a três caracteres não são substituídas.

**Impacto:** a promessa “apenas agregados e pseudónimos” é mais forte do que a garantia técnica atual para texto livre do utilizador.

**Correção recomendada:** aviso de composição mais explícito; deteção de entidades/PII em PT; allowlist de conteúdo em vez de denylist isolada; testes adversariais com corpus português; opção de desativar texto livre em contextos de maior risco.

### IA-12 — P2 — Qualidade histórica de tesouraria pode ser sobrestimada

**Evidência:** em cashflow histórico, basta existir snapshot para uma conta para `openingBalanceCents` deixar de ser `null` e a qualidade passar a `COMPLETE`; não existe comparação com o conjunto de contas que deveria ter snapshot.

**Impacto:** uma reconstrução parcial pode ser apresentada como completa e alimentar um alerta de cashflow negativo/positivo incorreto.

**Correção recomendada:** calcular cobertura por conta ativa, devolver `PARTIAL` quando faltam snapshots e impedir regras críticas quando a cobertura mínima não é cumprida.

### IA-13 — P2 — Consultas analíticas fazem full scans em memória da aplicação

**Evidência:** margem carrega todas as linhas do período; recebíveis carregam documentos e recibos; stock histórico carrega todos os movimentos até à data. O comentário assume deliberadamente conjuntos integrais para preservar totais.

**Impacto:** empresas grandes podem consumir muita memória e CPU no Node.js, competir com pedidos HTTP e ultrapassar o ciclo do worker.

**Correção recomendada:** mover agregações para SQL/Prisma aggregate, paginar processamento quando necessário, manter top references separadas dos totais e definir budgets/telemetria por tool.

### IA-14 — P2 — Chat pode ficar visível enquanto não está operacional

**Evidência:** `AI_CHAT_ENCRYPTION_KEY` só é obrigatória no arranque quando `AI_PROVIDER_MODE=openai`, mas criar/listar sessões exige sempre a chave. A UI mostra página e drawer a qualquer utilizador com `AI_CHAT_USE`, sem capability/readiness específico para o chat.

**Impacto:** deployment com provider desativado e sem chave pode ter health global verde, mas chat determinístico devolve `AI_CHAT_NOT_CONFIGURED`.

**Correção recomendada:** exigir a chave sempre que o módulo de chat estiver habilitado, adicionar capability/readiness segura e esconder/desativar a UI com explicação operacional.

### IA-15 — P2 — História e sessões não têm paginação utilizável

**Evidência:** sessões usam `take: 100`; mensagens usam `take: 200` ordenado ascendente. Não existe cursor nem ação para alcançar sessões acima das primeiras 100 ou mensagens mais recentes depois das primeiras 200.

**Impacto:** conversas longas deixam de mostrar os turnos mais recentes e sessões antigas podem tornar-se inacessíveis para leitura/eliminação individual.

**Correção recomendada:** cursor por `updatedAt/id` nas sessões; cursor por `createdAt/id` nas mensagens; carregar a janela mais recente e permitir “carregar anteriores”.

### IA-16 — P3 — Streaming, consentimento e contexto são apresentados de forma demasiado forte

**Evidência:** o backend recebe a resposta externa completa e só depois simula deltas de 80 caracteres. A UI mostra “OpenAI: consentida” com base apenas no consentimento, não no provider/opt-in efetivo. Página e drawer têm estado independente.

**Impacto:** a perceção do utilizador não corresponde exatamente ao estado operacional; não existe cancelamento real de geração no provider quando se fecha o drawer.

**Correção recomendada:** mostrar capability efetiva (`determinístico`, `OpenAI disponível`, `OpenAI consentida`); propagar stream real se trouxer valor; partilhar store de sessão; suportar abort/cancelamento.

### IA-17 — P3 — Drift de configuração e documentação

**Evidência:** `env.js` usa `gpt-5.6-luna` por omissão e `.env.example` usa `gpt-5.4-mini`. O relatório de arquitetura existente contém contagens de testes inferiores às observadas nesta auditoria. O teste contratual verifica o modelo no source, mas não compara source e `.env.example`.

**Impacto:** ambientes podem arrancar com modelos diferentes consoante copiem ou não o exemplo; documentação de prova fica desatualizada.

**Correção recomendada:** uma única constante/config gerada; teste de paridade; atualizar evidência por comando e timestamp. Esta auditoria não avaliou se os nomes de modelo configurados estão disponíveis no provider externo.

### IA-18 — P2 — Cobertura verde não cobre as garantias mais importantes

Faltam provas diretas para:

- texto numérico ligado às claims e fontes;
- quota atómica e bypass por recusas;
- pseudonimização com milhares de entidades;
- filtering de notificações por permissão;
- recovery de run preso;
- aplicação real de período/scopes;
- DTO v2 de sugestões com source quality;
- chat sem chave de cifragem;
- migrations e fluxo E2E com PostgreSQL/Redis/SMTP reais;
- smoke externo OpenAI em empresa demo.

## 9. Plano de melhorias recomendado

### Fase 0 — Conter os P1

1. Corrigir destinatários de `SmartAlert` por permissão.
2. Tornar a resposta numérica backend-authored ou validar texto, claim e fonte como unidade.
3. Reescrever pseudonimização para aliases usados e resolução em batch.
4. Meter recusas/sessões/runs sob quota e rate limit.
5. Adicionar lease e recuperação de runs.

### Fase 1 — Restaurar coerência funcional

1. Aplicar filtros de período e scopes.
2. Separar read/write permissions e auditar decisões.
3. Tornar quota atómica.
4. Restringir tools/períodos ao contexto autorizado.
5. Unificar pipeline MF4/v2 e DTOs.
6. Corrigir qualidade histórica e regras dependentes de dados parciais.

### Fase 2 — Escala e experiência

1. Agregações na base de dados e budgets por tool.
2. Poll frequente da fila separado do agendamento horário; wake-up de runs manuais.
3. Paginação de sessões/mensagens e limites de retenção por cardinalidade.
4. UI para preferências, quotas, utilização, fallback rate e feedback.
5. Capability/readiness específico de IA.
6. Estado partilhado entre página e drawer e cancelamento real.

### Fase 3 — Governação contínua

1. Corpus adversarial PT-PT para PII, prompt injection e números.
2. Avaliações automáticas de groundedness, source attribution e recusa.
3. Métricas/SLOs de latência, queue age, fallback, qualidade e custo.
4. Runbook de incidentes testado e rotação de chaves automatizada.
5. Revisão periódica das regras/thresholds e versionamento da política com changelog apresentado ao utilizador.

## 10. Validação executada nesta auditoria

| Validação | Resultado |
| --- | --- |
| `real_dev/api: npm test` | PASS — 313 unitários + 171 contratos |
| `real_dev/api: npm run syntax:check` | PASS |
| `real_dev/api: npm run prisma:validate` | primeira execução bloqueada por ausência de `DATABASE_URL`; repetida com URL sintaticamente válida e sem ligação, PASS |
| `real_dev/web: npm run test:unit` | PASS — 14 ficheiros, 44 testes |
| `real_dev/web: npm run typecheck` | PASS |
| `real_dev/web: npm run build` | PASS |
| Prova direta de `validateProviderClaims` | CONFIRMOU IA-02: resposta textual não suportada foi aceite |

Não foram executados nesta auditoria:

- testes de integração dependentes de PostgreSQL/Redis/SMTP;
- E2E browser;
- worker live com dados seed;
- chamada live à OpenAI;
- prova de carga com empresa de grande dimensão.

As suites verdes provam que os contratos atualmente testados continuam a passar; não provam que os findings acima estejam ausentes.

## 11. Ficheiros centrais do funcionamento

### Backend

- `real_dev/api/src/modules/ai/aiRoutes.js`
- `real_dev/api/src/modules/ai/aiAnalysisService.js`
- `real_dev/api/src/modules/ai/aiAnalysisWorker.js`
- `real_dev/api/src/modules/ai/aiMetricCatalog.js`
- `real_dev/api/src/modules/ai/aiChatService.js`
- `real_dev/api/src/modules/ai/aiChatProvider.js`
- `real_dev/api/src/modules/ai/aiPrivacy.js`
- `real_dev/api/src/modules/ai/aiChatCrypto.js`
- `real_dev/api/src/modules/ai/aiService.js`
- `real_dev/api/src/modules/notifications/notificationService.js`
- `real_dev/api/src/modules/permissions/permissions.js`
- `real_dev/api/src/config/env.js`
- `real_dev/api/prisma/schema.prisma`

### Frontend

- `real_dev/web/src/App.tsx`
- `real_dev/web/src/ai/AiChat.tsx`
- `real_dev/web/src/ai/AiPageContext.tsx`
- `real_dev/web/src/lib/aiChatApi.ts`
- `real_dev/web/src/lib/mf4Api.ts`
- `real_dev/web/src/pages/mf4Pages.tsx`

### Operação e prova

- `real_dev/api/scripts/run-ai-analysis-worker.mjs`
- `real_dev/api/scripts/run-notification-worker.mjs`
- `real_dev/api/scripts/run-email-outbox-worker.mjs`
- `real_dev/api/docs/ai-operations.md`
- `real_dev/api/tests/unit/ai-v2.test.js`
- `real_dev/api/tests/contracts/ai-v2.contract.test.js`
- `real_dev/web/e2e/app.spec.ts`

## 12. Conclusão

A direção arquitetural é sensata: valores calculados internamente, provider opcional, tools read-only, consentimento, cifragem, fallback e decisão humana. A app evita corretamente o padrão perigoso de dar ao LLM acesso direto à base de dados ou capacidade de executar operações contabilísticas.

O problema principal não está na ideia, mas nas garantias laterais ainda incompletas: autorização de notificações, groundedness do texto, escala da pseudonimização, controlo de abuso, recuperação do worker e drift entre a pipeline antiga e a v2. Corrigidos os P1 e os P2 de coerência, o módulo poderá passar de uma implementação tecnicamente promissora para uma funcionalidade operacionalmente defensável.
