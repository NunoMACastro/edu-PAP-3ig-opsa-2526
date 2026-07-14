# Arquitetura tecnica minima MF8

## Contexto

- Projeto: `OPSA`
- Implementação observada: `real_dev/api` e `real_dev/web`
- Data da revalidação documental: `2026-07-10`
- Contrato central: `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md`
- Estado funcional canónico: `NO_GO`

Esta nota responde a `RNF30` e descreve a arquitetura realmente observada. Não
declara certificação fiscal, deployment permanente, scheduler 24/7, serviços
remotos disponíveis ou conclusão dos testes bloqueados pelo ambiente.

## Arquitetura

A referência separa `real_dev/api` e `real_dev/web`. A composição da API vive
em `src/server.js`, instancia `PrismaClient` apenas no runtime e deixa a app
Express importável. O frontend compõe as rotas e páginas em `src/App.tsx`.

## Composição da API

A API usa Node.js, ES Modules, Express e Prisma. A composição separa dois
níveis:

- `createApp(deps)` constrói a aplicação HTTP sem abrir um listener e recebe
  Prisma, Redis/rate limiter, `EmailOutbox`, object storage e o boundary SAF-T
  por injeção. Isto permite testes HTTP sem efeitos laterais de processo.
- `startServer(options)` carrega e valida configuração, liga Redis e storage,
  cria as dependências, abre o socket e devolve uma função `stop()` idempotente.

O arranque falha de forma conservadora quando falta uma dependência obrigatória.
O JSON global mantém o limite de 1 MiB; anexos e importações usam rotas
`multipart/form-data` com streaming e limites próprios.

## Serviços externos e workers

- PostgreSQL é a fonte persistente e transacional.
- Redis suporta rate limiting distribuído, TTL e chaves derivadas por HMAC.
- SMTP recebe mensagens exclusivamente através de `EmailOutbox` persistente e
  cifrada.
- S3 compatível guarda anexos, SAF-T e bundles de backup; o adapter local existe
  apenas para desenvolvimento explícito.
- `worker:email` executa continuamente o outbox; `worker:email:drain` drena um
  lote controlado para gates. O worker reclama mensagens por lease, confirma
  SMTP antes de processar, aplica retry/backoff e suporta shutdown.
- O parser XLSX usa um worker terminável para impor limites e timeout.

O contrato académico descreve supervisão e agendamento, mas não afirma que há
um processo 24/7 instalado.

## Segurança, sessão e autorização

A sessão vive num cookie HttpOnly. O backend resolve o utilizador, a empresa
ativa e as permissões; `companyId` enviado pelo browser nunca decide ownership.
O onboarding cria `Company`, `CompanyProfile`, membership `ADMIN`,
`activeCompanyId` e `AuditLog` na mesma transação.

Convites suportam preview, aceitação, reenvio e revogação. O token entra no
browser pelo fragmento, segue no body da API e é removido da URL depois de lido.
Eventos de login, logout, falha e reset são persistidos em
`SecurityAuditEvent` sem email ou IP em claro. `TRUST_PROXY_HOPS` tem default
zero e forwarded headers só são usados quando a topologia é configurada.

## Integridade e concorrência

Datas civis são validadas como calendário estrito `YYYY-MM-DD`. Transições de
estado usam claims com estado esperado e devolvem `409 STALE_STATE` ao perder
uma corrida. Alteração, histórico e auditoria pertencem à mesma transação.

Fecho fiscal e lançamento coordenam-se por lock empresarial/período. Stock,
FIFO e contagens bloqueiam saldos/camadas numa ordem estável; alterações ao
último `ADMIN` são verificadas sob lock. `RetentionHold` é materializado no
fecho e consumido pelas mutações finais. Antes de substituir linhas de um
lançamento manual, `JournalEntryRevision` guarda snapshots before/after e o
motivo.

## Modelos

Além dos modelos funcionais de vendas, compras, inventário, tesouraria,
contabilidade e IA assistiva, o schema atual inclui:

- `EmailOutbox`, com payload cifrado, estado, tentativas, próxima tentativa,
  lease e resultado do envio;
- `SecurityAuditEvent`, com hashes de IP/subject e detalhes minimizados;
- `CompanyInvitation`, com aceitação/revogação e ator de aceitação;
- `JournalEntryRevision`, com snapshot anterior/posterior, motivo e ator;
- `JournalAttachment`, com storage key, SHA-256, provider, estado, metadata e
  chave de idempotência;
- `SaftExportRun`, ligado a `FiscalPeriod`, storage, SHA-256 e resultados de
  validação;
- `FiscalPeriod.fiscalYear`, que evita inferir o exercício pelo ano civil.
- `CompanyAiSettings`, `AiRuleSetting` e `AiUserConsent`, para opt-in, quotas,
  regras e consentimento da IA por empresa/utilizador;
- `AiChatSession` e `AiChatMessage`, com conteúdo, fontes, resumo e aliases
  cifrados por AES-256-GCM;
- `AiAnalysisRun`, `AiUsageEvent` e `AiDeletionAudit`, para worker, métricas
  operacionais minimizadas e hard-delete auditável.

O domínio inclui ainda `CompanySubscription`, `JournalEntry`, `SaleDocument`,
`PurchaseDocument`, `Receipt`, `Payment`, `AiInsight`, `AiActionSuggestion` e
`SmartAlert`. Os três últimos incluem lifecycle, score, período, evidência,
fingerprint e ocorrência conforme o tipo.

Índices compostos acompanham isolamento multiempresa, paginação keyset e os
locks. As migrations de 2026-07-09 e 2026-07-10 seguem expand-and-contract; a
aplicação real numa PostgreSQL remota continua por demonstrar.

## Fluxos

Os fluxos de venda/recebimento, compra/pagamento, inventário, contabilidade,
tesouraria, compliance e IA mantêm entidades separadas e usam sempre a empresa
ativa resolvida no backend. A IA permanece recomendatória e não executa ações
(`nao executa acoes`, marcador técnico do gate).

PostgreSQL e `aiMetricCatalog.js` são a única fonte dos valores. Insights e
alertas são atualizados por `AiAnalysisRun` manual ou por worker. O chat em
`/ai/chat` classifica localmente a intenção e fixa uma tool/período read-only.
A Responses API opcional recebe apenas sinais qualitativos e redige uma
narrativa sem números. Pergunta, histórico, IDs e valores não saem da API;
factos e referências são sempre compostos no backend. Provider desativado,
timeout, recusa ou narrativa inválida acionam fallback determinístico.

OpenAI requer configuração global, opt-in da empresa por `ADMIN` e
consentimento individual. Usa `store: false`, sem Conversations API, pesquisa
web, ficheiros, Code Interpreter ou MCP externo. O histórico local é cifrado,
apagável e retido no máximo 90 dias. A arquitetura detalhada está em
`docs/ARQUITETURA-IA-OPSA-V2.md`.

O processo separado `npm run worker:ai` agenda e processa análises e retenção;
o processo `npm run worker:email` continua responsável apenas pela outbox SMTP.

## Ficheiros, importações, SAF-T e backup

Uploads usam parsing multipart streaming, limite de 10 MiB, validação de
assinatura/MIME/extensão, SHA-256, nomes aleatórios, quarentena, promoção e
cleanup com pós-condição. O download de anexos volta a validar empresa e
permissão e usa headers de download, `nosniff` e `no-store`.

CSV, OFX e XLSX entram como ficheiro real. O XLSX tem limites de tamanho
comprimido/descomprimido, linhas, colunas, células e duração.

SAF-T é criado por execução associada a `fiscalPeriodId`, usa estrutura oficial
`1.04_01`, namespace correto e Windows-1252. Os bytes finais ficam no storage e
PostgreSQL guarda metadata/hash. O exportador permanece fail-closed com
`SAFT_EXPORT_ENABLED=false` até existirem XSD externo, reconciliação e revisão
contabilística aceites. O estado atual não constitui conformidade legal.

O backup produz dump PostgreSQL, manifesto de objetos, hashes, cifragem e
retenção. A prova suficiente exige restaurar numa base descartável, comparar
entidades e voltar a descarregar objetos por hash. Esse roundtrip remoto ainda
está bloqueado pelo ambiente.

## Frontend

O frontend usa React, TypeScript, Vite e React Router. `BrowserRouter` envolve
um `AuthProvider` deny-by-default com estados `bootstrapping`, `anonymous`,
`authenticated` e `error`. `/api/auth/me` e `/api/permissions/me` são as fontes
de verdade; uma resposta 401 limpa o estado em memória.

`App.tsx` mantém um registry único de rotas públicas/protegidas, permissão
necessária, componentes lazy, 404, deep links e Back/Forward. O cliente HTTP
central envia cookies com `credentials: include`, aplica timeout/abort e não
repete automaticamente mutações. A navegação mobile usa drawer e os formulários
preservam dados após 400/409/500.

Listagens críticas usam cursor opaco com limite 50 por omissão e máximo 100:
`{ items, pageInfo: { nextCursor, hasNextPage } }`. A UI acumula páginas e
mantém as anteriores quando a página seguinte falha.

A interface usa selects/autocomplete e editores de linhas, datas civis locais
PT, IVA isento exatamente zero, skip link, labels, ARIA de erro, foco
controlado, diálogos acessíveis e componentes responsivos. Resultados técnicos
não são expostos em blocos de debug na UI de produção.

O assistente OPSA tem página `/ai/chat` e drawer global para `ADMIN`, `GESTOR`
e `CONTABILISTA`. Ambas as superfícies partilham sessões e API SSE e apresentam
empresa, período, `asOf`, modo OpenAI/determinístico, fontes, qualidade,
limitações e consentimento. `/ai/settings` é reservado a `ADMIN`.

O cliente central envia o cookie com `credentials: "include"`; não guarda
sessão em Web Storage.

## Subscricao simulada

`CompanySubscription` suporta catálogo, ativação, renovação, cancelamento e
reativação por empresa ativa. É uma subscricao simulada sem gateway de pagamento,
checkout, cartão, invoice ou efeito contabilístico automático.

## Observabilidade, health e shutdown

`GET /api/health/live` prova apenas que o processo responde.
`GET /api/health/ready` usa probes mínimos e read-only: `SELECT 1`, `PING` e
metadata/acesso do storage ativo. Devolve 503 quando uma dependência crítica
está indisponível. `GET /api/health` é alias de readiness. Provas mutáveis de
permissões ficam no comando explícito `health:deep-check`.

Cada request recebe um ID e exatamente um log JSON terminal com duração,
método, route template e estado, com erros redigidos. `SIGINT`/`SIGTERM` deixam de aceitar
trabalho, drenam HTTP com timeout, fecham Redis e executam
`prisma.$disconnect()`.

## Limites

- API local: 299/299 unitários e 157/157 contratos na execução integral de
  2026-07-11; Prisma validate/generate e gates MF6-MF8 passaram.
- Frontend local: 31/31 Vitest, typecheck e build na execução de 2026-07-11.
- Integração: 2/7; cinco cenários falham de forma conservadora sem os serviços
  remotos.
- Playwright: zero testes iniciados porque o preflight detetou Google Chrome e
  Microsoft Edge em falta; Firefox não foi executado porque a matriz aborta
  integralmente antes dos testes.
- O cenário E2E de chat com provider fake existe mas permanece sem prova runtime
  neste ambiente; o smoke OpenAI live não foi executado e é sempre manual,
  opt-in e sem dados reais.
- Node observado: 24.11.1, abaixo do contrato `>=24.17 <25`.
- SAF-T externo e backup/restore remoto continuam por provar.

O estado corrente e as contagens só são canónicos no relatório de 2026-07-09 e
na evidence corrente. Relatórios com o banner
`SNAPSHOT_HISTORICO_SUPERSEDED` não devem ser usados como estado atual.

## Checklist de atualizacao documental

- Atualizar este documento e o contrato central quando mudar uma interface.
- Manter separados estado pedagógico dos alunos e estado da referência.
- Não guardar secrets, cookies, tokens, URLs autenticadas ou dados pessoais.
- Não transformar build, scanner, skip ou teste com doubles em prova runtime.
- Manter `NO_GO` enquanto existir um blocker crítico registado.

## Apêndice posterior — runtime local observado em 2026-07-13

A arquitetura local passou a incluir `real_dev/compose.yaml` apenas para
PostgreSQL. API, workers e web continuam processos Node.js separados. O projeto
Compose usa:

- `postgres` persistente em `127.0.0.1:5433`;
- `postgres-test` descartável em `127.0.0.1:5434`;
- `postgres-restore` descartável em `127.0.0.1:5435`;
- `postgres-tools` sem porta pública para `pg_dump`, `pg_restore` e `psql`.

Foi observada a imagem `postgres:17.10-alpine3.23` com digest
`sha256:8189a1f6e40904781fc9e2612687877791d21679866db58b1de996b31fc312e4`.
Compose config, setup, `21` migrations, seed/verify e health do PostgreSQL
passaram. A integração PostgreSQL passou `11/11`, com sentinela `1/1` e zero
skips; backup/restore comparou `69` entidades/tabelas e fez cleanup.

A regressão posterior terminou com API `407/407` unitários e `174/174`
contratos, MF6/MF7/MF8 PASS, web `18` ficheiros/`55` testes, typecheck/build,
Playwright `25/25` em três viewports e seeded `3/3`. Isto substitui os limites
locais de PostgreSQL e Chromium descritos acima, mas não as dependências
externas.

O teste externo falhou fechado sem base remota, Redis e SMTP; S3 e SAF-T externo
continuam por provar. O gate académico parou com Node `24.11.1`, abaixo de
`>=24.17`; nenhuma fase posterior desse gate é declarada executada.
