# Correcao da auditoria end-to-end da implementacao `real_dev`

## 1. Header, escopo e estado global

- `doc_id`: `CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09`
- Projeto: `OPSA`
- Baseline: `2026-07-09`
- Implementation root: `real_dev`
- Backend: `real_dev/api`
- Frontend: `real_dev/web`
- Documentacao/evidence permitida: toda a arvore `docs/`, validadores documentais associados e o manifesto compensatorio, sem alterar a implementacao da aplicacao
- Fora de scope absoluto: `apps/`
- Owner do report: agente principal executor
- Estado global inicial: `NO_GO`
- Estado maximo permitido pelo scope: `PRONTO_ACADEMICO_COM_RISCO_ACEITE`
- Ultima atualizacao: `2026-07-10T16:19:05+01:00`

Estados permitidos: `ABERTO`, `EM_CORRECAO`, `IMPLEMENTADO`, `PRONTO_REAUDITORIA`, `FECHADO`, `BLOQUEADO_AMBIENTE`, `RISCO_ACEITE`, `REABERTO`.

### Instrucoes obrigatorias para qualquer agente executor

1. Ler este report integralmente no início de cada sessão e tratá-lo como fonte
   de verdade canónica.
2. Confirmar `git status` antes de alterar ficheiros e preservar todas as
   alterações preexistentes ou alheias ao finding selecionado.
3. Selecionar apenas findings cujas dependências estejam fechadas ou cujo
   trabalho independente esteja explicitamente identificado no diário.
4. Marcar o finding `EM_CORRECAO` ou `REABERTO` antes da primeira alteração.
5. Só o agente principal pode editar este report; subagentes devolvem ficheiros,
   hashes, comandos, resultados e análise ao principal.
6. Nunca apagar a baseline, evidência inicial ou entradas do diário; o diário é
   append-only e correções a uma entrada recebem uma entrada posterior.
7. Registar data/hora, finding, ficheiros, hashes antes/depois, migrations e a
   razão concreta da alteração.
8. Registar comando exato, diretório, exit code, contagens e resumo fiel do
   output; não converter warnings, skips ou blockers em PASS.
9. Nunca guardar cookies, tokens, credenciais, URLs com passwords, payloads
   pessoais ou dados pessoais neste report ou nas evidences.
10. `IMPLEMENTADO` significa apenas código completo. Só uma reauditoria fresca,
    com prova runtime adequada, pode marcar `FECHADO`.
11. Regex scanners, typecheck, syntax ou build isolados nunca fecham findings
    funcionais.
12. Um teste não executado fica `BLOQUEADO_AMBIENTE`; skip nunca equivale a
    PASS e o gate final não aceita skips.
13. Qualquer regressão reabre o mesmo ID com nova evidência. Defeitos novos
    recebem IDs novos e nunca são escondidos dentro de um finding antigo.
14. Atualizar este report na mesma unidade lógica da alteração.
15. Como `real_dev` não é versionado, executar SHA-256 sobre cada ficheiro
    alterado e ambos os lockfiles; em macOS usa-se `shasum -a 256`.
16. Não realizar commits sem autorização explícita do utilizador.
17. Nunca tocar em `apps/`.
18. Novos riscos só podem passar a `RISCO_ACEITE` por decisão explícita do
    utilizador.

## 2. Baseline imutavel da auditoria de 2026-07-09

Esta secao e imutavel. Correcoes e novas provas entram nas tabelas de estado e no diario append-only; nao apagam a evidencia inicial.

- A configuracao segura de producao bloqueia login, registo e recuperacao sem um rate-limit store partilhado.
- O registo nao cria empresa/membership e nao existe aceitacao completa de convite.
- Os adapters de email nao entregam mensagens reais nem asseguram retry persistente.
- O SAF-T existente identifica-se como `1.04_01-MVP`, nao cumpre o contrato legal e e devolvido dentro de JSON.
- Retention holds nao sao materializados nem consumidos por todas as mutacoes contabilisticas.
- O backup cobre apenas PostgreSQL e a verificacao usa apenas `pg_restore --list`.
- Existem riscos de concorrencia em aprovacoes, fecho fiscal, stock/FIFO e protecao do ultimo ADMIN.
- Datas impossiveis podem ser normalizadas silenciosamente pelo JavaScript.
- O limite global implicito do JSON inviabiliza anexos/importacoes anunciados como muito maiores.
- O frontend rejeita IVA isento a `0%`.
- Existem 12 ficheiros MF8 com conflict markers e validadores que podem terminar verdes com advisories/defeitos ativos.
- `npm audit` reportou 3 vulnerabilidades high e 2 moderate na API.
- Os testes persistidos e browser reais nao cobrem os fluxos criticos.
- A UI expoe 45 opcoes sem sessao, quebra no mobile e depende de IDs/JSON manuais.
- Health, logging, graceful shutdown, paginacao, proxy trust e auditoria transversal estao incompletos.

Preflight observado em `2026-07-09T19:59:53+01:00`:

- `git status --short`: sem output.
- `git diff --check`: sem output.
- Node: `v24.11.1`.
- npm: `11.6.2`.
- `real_dev/` e ambos os lockfiles: ignorados por `.gitignore:4`.
- SHA-256 API lockfile: `05af6403cf02388e7a4d0d4239c0d4bc6c901905c6faeb2a70a60c61206f59c5`.
- SHA-256 web lockfile: `a10cf4c488f288c414d5e9d5d661c23813168089e2353da679f2fab9fe725ed2`.
- `TEST_DATABASE_URL`, Redis, SMTP, S3, restore e backup remoto: ausentes.
- Conflict markers MF8: 12 ficheiros.

## 3. Decisoes do utilizador e riscos aceites

- `apps/` nunca e alterado.
- `real_dev` e lockfiles continuam ignorados.
- `OPSA-E2E-RISK-001` e um risco aceite, nao um finding corrigivel neste scope.
- Como controlo compensatorio, cada alteracao em `real_dev` regista caminho, SHA-256 e validacao no presente report.
- O alvo e academico; nao existe deployment permanente nem alegacao de production readiness.
- Servicos runtime de prova serao remotos e dedicados a desenvolvimento/teste.
- Rate limiting partilhado usa Redis.
- Email usa SMTP com outbox PostgreSQL.
- Ficheiros e backups usam S3 compativel.
- SAF-T so fecha com conformidade `1.04_01`, XSD, reconciliacao de conteudo e revisao externa.
- Fontes normativas verificadas em 2026-07-10:
  [Portal SAF-T da AT](https://info.portaldasfinancas.gov.pt/pt/apoio_ao_contribuinte/Negocios/Faturacao/SAF_T_PT/SAF_T_PT_Versao_PT/Paginas/default.aspx),
  [XSD oficial 1.04_01](https://info.portaldasfinancas.gov.pt/apps/saft-pt04/saftpt1.04_01.xsd),
  [Portaria n.º 302/2016](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Portaria_302_2016.pdf) e
  [FAQ técnica da AT](https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/pages/faqs-00276.aspx).
- A ausencia deliberada de scheduler 24/7 e registada como risco aceite do scope academico.

## 4. Tabela canonica de findings

| ID | Severidade | Resumo | Fase | Dependencias | Estado | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| `OPSA-E2E-P0-001` | P0 | Rate limit bloqueia autenticacao segura | 1 | F0 | IMPLEMENTADO | backend/auth |
| `OPSA-E2E-P1-001` | P1 | Onboarding sem empresa/membership | 1 | F0 | IMPLEMENTADO | backend/auth + frontend |
| `OPSA-E2E-P1-002` | P1 | Email, reset e convites sem entrega real | 1 | F0 | IMPLEMENTADO | backend/auth |
| `OPSA-E2E-P1-003` | P1 | SAF-T nao conforme e sem download | 3/4 | F0,F2 | EM_CORRECAO | backend/compliance + frontend |
| `OPSA-E2E-P1-004` | P1 | Retencao legal desligada das mutacoes | 2 | F0 | IMPLEMENTADO | backend/accounting |
| `OPSA-E2E-P1-005` | P1 | Backup/restauro incompletos | 3 | F0 | IMPLEMENTADO | backend/ops |
| `OPSA-E2E-P1-006` | P1 | Corridas de aprovacao/rejeicao | 2 | F0 | IMPLEMENTADO | backend/domain |
| `OPSA-E2E-P1-007` | P1 | Corrida entre fecho fiscal e lancamento | 2 | F0 | IMPLEMENTADO | backend/domain |
| `OPSA-E2E-P1-008` | P1 | Corridas de stock e FIFO | 2 | F0 | IMPLEMENTADO | backend/inventory |
| `OPSA-E2E-P1-009` | P1 | Corrida do ultimo ADMIN/auditoria | 1/2 | F0 | IMPLEMENTADO | backend/auth |
| `OPSA-E2E-P1-010` | P1 | Datas contabilisticas impossiveis | 2 | F0 | IMPLEMENTADO | backend/domain |
| `OPSA-E2E-P1-011` | P1 | Uploads Base64/JSON e XLSX inacessivel | 3/4 | F0 | IMPLEMENTADO | backend/files + frontend |
| `OPSA-E2E-P1-012` | P1 | IVA isento a zero rejeitado | 4 | F0 | IMPLEMENTADO | frontend |
| `OPSA-E2E-P1-013` | P1 | Conflitos MF8 e falsos verdes | 5 | F0-F4 | IMPLEMENTADO | docs/evidence |
| `OPSA-E2E-P1-014` | P1 | Vulnerabilidades npm da API | 0 | - | IMPLEMENTADO | foundations |
| `OPSA-E2E-P1-015` | P1 | Falta de E2E PostgreSQL/browser real | 0/6 | - | BLOQUEADO_AMBIENTE | quality |
| `OPSA-E2E-P1-016` | P1 | Passwords acima do limite seguro do bcrypt | 1 | F0 | FECHADO | backend/security |
| `OPSA-E2E-P1-017` | P1 | Backups locais em claro e bucket sem isolamento | 3/5 | F0 | PRONTO_REAUDITORIA | backend/ops |
| `OPSA-E2E-RISK-001` | Aceite | `real_dev`/lockfiles sem versionamento/CI | transversal | decisao utilizador | RISCO_ACEITE | utilizador |
| `OPSA-E2E-P2-001` | P2 | Navegacao/auth/permissions/mobile | 4 | F1 | IMPLEMENTADO | frontend |
| `OPSA-E2E-P2-002` | P2 | UUIDs e JSON manuais | 4 | F1-F3 | IMPLEMENTADO | frontend |
| `OPSA-E2E-P2-003` | P2 | Sessao expirada e requests pendurados | 4 | F1 | IMPLEMENTADO | frontend |
| `OPSA-E2E-P2-004` | P2 | Datas frontend em UTC | 4 | F2 | IMPLEMENTADO | frontend |
| `OPSA-E2E-P2-005` | P2 | Acessibilidade incompleta | 4 | F0 | IMPLEMENTADO | frontend |
| `OPSA-E2E-P2-006` | P2 | Formularios perdem dados apos erro | 4 | F0 | IMPLEMENTADO | frontend |
| `OPSA-E2E-P2-007` | P2 | Anexos sem download | 3/4 | F3 files | IMPLEMENTADO | backend/files + frontend |
| `OPSA-E2E-P2-008` | P2 | Reconciliacao sem fluxo recuperavel | 4 | F0 | IMPLEMENTADO | backend/treasury + frontend |
| `OPSA-E2E-P2-009` | P2 | Health-check falso positivo | 5 | F0 | IMPLEMENTADO | backend/ops |
| `OPSA-E2E-P2-010` | P2 | Logging/request IDs/shutdown | 5 | F0 | IMPLEMENTADO | backend/ops |
| `OPSA-E2E-P2-011` | P2 | Listagens sem paginacao | 5 | F0-F4 | IMPLEMENTADO | backend + frontend |
| `OPSA-E2E-P2-012` | P2 | Proxy trust incondicional | 1 | F0 | IMPLEMENTADO | backend/security |
| `OPSA-E2E-P2-013` | P2 | Auditoria ausente/nao atomica | 1/2 | F0 | IMPLEMENTADO | backend/domain |
| `OPSA-E2E-P2-014` | P2 | Toolchain/gate/operacao incompletos | 0/5 | - | BLOQUEADO_AMBIENTE | foundations/ops |
| `OPSA-E2E-P2-015` | P2 | Readiness sem probes de permissao operacional | 5 | F0 | PRONTO_REAUDITORIA | backend/ops |
| `OPSA-E2E-P2-016` | P2 | Requests abortados sem log terminal | 5 | F0 | FECHADO | backend/ops |
| `OPSA-E2E-P2-017` | P2 | Imports grandes fazem escritas sequenciais | 3/5 | F0 | PRONTO_REAUDITORIA | backend/imports |
| `OPSA-E2E-P3-001` | P3 | Sem routing/deep links/historico | 4 | F0 | IMPLEMENTADO | frontend |
| `OPSA-E2E-P3-002` | P3 | JSON tecnico/debug na UI | 4 | F0 | IMPLEMENTADO | frontend |

## 5. Mapa de fases e gates

| Fase | Objetivo | Gate de saida |
| --- | --- | --- |
| F0 | Report, toolchain, dependencias, app testavel, testes reais | app importavel, audit sem moderate/high, suites sem regressao |
| F1 | Auth, Redis, SMTP/outbox, onboarding, convites, proxy/audit | E2E completo com servicos remotos |
| F2 | Datas, concorrencia, auditoria atomica, retencao | invariantes concorrentes em PostgreSQL real |
| F3 | Multipart, S3, SAF-T, backup/restore | ficheiros e restore reais; SAF-T validado |
| F4 | Routing, UX, a11y e fluxos browser | Chrome/Edge/Firefox + axe + viewports |
| F5 | Health, logs, paginacao e evidence | zero conflitos; validadores coerentes |
| F6 | Reauditoria independente | todos os findings classificados com prova |

## 6. Alteracoes previstas de API, schema, configuracao e dependencias

### API

- `POST /api/onboarding/company`
- `POST /api/invitations/preview`
- `POST /api/invitations/accept`
- multipart nos endpoints de anexos/importacoes/extratos
- download autorizado de anexos
- `POST/GET/download /api/compliance/saft/exports`
- listagem/consulta de statement imports
- `/api/health/live` e `/api/health/ready`
- envelopes paginados `{ items, pageInfo }`

### Schema/migrations

- `EmailOutbox`
- `SecurityAuditEvent`
- `JournalEntryRevision`
- extensoes de `CompanyInvitation`, `JournalAttachment` e `SaftExportRun`
- indices de paginacao/concorrencia
- backfill idempotente de retention holds

### Configuracao

- PostgreSQL: `DATABASE_URL`, `TEST_DATABASE_URL`, `RESTORE_DATABASE_URL`
- Redis: `REDIS_URL`, `REDIS_KEY_PREFIX`, `RATE_LIMIT_HMAC_KEY`
- SMTP/outbox: `SMTP_*`, `EMAIL_FROM`, `EMAIL_OUTBOX_ENCRYPTION_KEY`
- S3/backup: `S3_*`, `BACKUP_S3_BUCKET`, `BACKUP_RETENTION_DAYS`
- Runtime: `APP_BASE_URL`, `TRUST_PROXY_HOPS`, `SAFT_EXPORT_ENABLED`

### Dependencias justificadas

- runtime: `redis`, `nodemailer`, `@aws-sdk/client-s3`, `busboy`, `xmlbuilder2`, `iconv-lite`, `react-router-dom`
- teste: `supertest`, Vitest, Testing Library, MSW, Playwright e axe

## 7. Matriz finding -> implementacao -> validacao

Esta matriz reflete o código atual. `Manifesto` significa o inventário SHA-256
final referido no diário; nenhum resultado sem runtime é promovido a
`FECHADO`.

| Finding | Código / migration | Testes específicos | Runtime / resultado | Hashes | Estado |
| --- | --- | --- | --- | --- | --- |
| `OPSA-E2E-P0-001` | `env.js`, `redisRateLimit.js`, auth bootstrap | `auth-remediation`, `local-rate-limit`, integração Redis | Unit local verde; duas instâncias Redis bloqueadas | Manifesto + `LOCAL-RATE-LIMIT-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-001` | onboarding service/routes/UI; `20260709200000_auth_onboarding_email_outbox` | auth/onboarding unit, contract, persistence, MSW | Fluxo local verde; PostgreSQL E2E ausente | Manifesto + `OUTBOX-HEALTH-PROXY-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-002` | outbox cifrado, worker SMTP e adapters comuns; migration 20260709200000 | `notification-outbox`, email contracts, auth persistence | SMTP sandbox/PostgreSQL ausentes | Manifesto + `OUTBOX-HEALTH-PROXY-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-003` | gerador/service/routes, schema contract, fiscal year UI; migrations 20260709203000, 20260710110000 e 20260710123000 | SAF-T generator/export/contracts, MSW fiscal year | Local verde; emissão certificada, motor XSD 1.1, adapter, revisão, PG/S3 ausentes | Manifesto + `CORRECAO-CONTRATO-XSD-005` | EM_CORRECAO |
| `OPSA-E2E-P1-004` | retention policy/gates e revisões; `20260629120000_mf7_retention_holds`, 20260709203000 | retention, manual revision, integration | Backfill/locks locais; PostgreSQL remoto ausente | Manifesto + `RETENTION-FINAL-MUTATIONS-REAUDIT-002` | IMPLEMENTADO |
| `OPSA-E2E-P1-005` | backup bundle, daily backup e restore remoto | backup bundle/hardening, object storage, postgres CLI | Restore real bloqueado por DB/S3/PG tools | Manifesto + `BACKUP-READINESS-BULK-AI-003` | IMPLEMENTADO |
| `OPSA-E2E-P1-006` | approval services com expected status e audit transacional | `workflow-concurrency`, approval minimization | Doubles verdes; corrida PostgreSQL ausente | Manifesto + `BACKEND-INTEGRIDADE-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-007` | fiscal period, posting e advisory locks | workflow/postgres-locks/concurrency integration | PostgreSQL concorrente ausente | Manifesto + `BACKEND-INTEGRIDADE-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-008` | stock/FIFO/inventory count com row locks | workflow, MF2, stock reauditoria | Doubles verdes; PostgreSQL concorrente ausente | Manifesto + `STOCK-FIFO-LOCKED-REAUDIT-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-009` | company users/invitations e lock empresarial | invitation lifecycle, company atomicity, concurrency | Local verde; corrida PostgreSQL ausente | Manifesto + `INVITATIONS-CONCURRENCY-REDIS-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-010` | `strictDate.js` e validators de domínio | `strict-date`, MF0/MF1/MF2/MF3 | Datas impossíveis rejeitadas localmente | Manifesto + `BACKEND-INTEGRIDADE-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-011` | multipart streaming, policy/XLSX worker e S3; migration 20260709203000 | multipart/upload/XLSX/import contracts | Local verde; S3/browser real ausentes | Manifesto + `SAFT-MULTIPART-FAIL-CLOSED-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-012` | MF1 form utils e UI IVA | frontend MF1/unit/gates | IVA 0 aceite em testes; browser bloqueado | Manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-013` | validator, defect gate, evidence e waivers fail-closed | defect/report gate + validator documental | `documentation_sync_pass=true`; 123 mutacoes negativas; blockers runtime preservados | `DOCUMENTATION-SYNC-REAUDIT-003` | IMPLEMENTADO |
| `OPSA-E2E-P1-014` | manifests/lockfiles com bcrypt 6 e uuid override | audit, `npm ls`, suites ExcelJS | `npm audit` local sem moderate/high | Lockfiles + manifesto + `NPM-AUDIT-001` | IMPLEMENTADO |
| `OPSA-E2E-P1-015` | `createApp`/`startServer`, Supertest, Vitest/MSW/Playwright | integração + E2E | PG/Redis/SMTP/S3 e browsers ausentes | Manifesto + `CONSOLIDATED-LOCAL-GATES-001` | BLOQUEADO_AMBIENTE |
| `OPSA-E2E-P1-016` | password policy e hashing | auth remediation + reauditoria independente | Limite bytes/rejeições provados | Manifesto + `PASSWORD-OBSERVABILITY-REAUDIT-001` | FECHADO |
| `OPSA-E2E-P1-017` | isolamento, SSE, plaintext cleanup, retenção/restore | backup/storage/readiness cleanup | Local verde; DB/S3/PG tools ausentes | Manifesto + `CORRECAO-CLEANUP-006` | PRONTO_REAUDITORIA |
| `OPSA-E2E-RISK-001` | `.gitignore`, report e manifesto compensatório | `git check-ignore`, SHA-256 | Risco explicitamente aceite | Lockfiles + manifesto | RISCO_ACEITE |
| `OPSA-E2E-P2-001` | Router, AuthProvider, registry e layout responsivo | App/MSW, MF5 responsive/accessibility | Browser/9 viewports bloqueados | Manifesto + `FRONTEND-INDEPENDENT-REAUDIT-001` | IMPLEMENTADO |
| `OPSA-E2E-P2-002` | selects/autocomplete e line editors nas páginas MF | frontend unit/gates | Fluxos locais sem UUID/JSON; browser ausente | Manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` | IMPLEMENTADO |
| `OPSA-E2E-P2-003` | apiClient timeout/abort e AuthProvider 401 | apiClient/App tests | Local verde; matriz browser ausente | Manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` | IMPLEMENTADO |
| `OPSA-E2E-P2-004` | `dateUtils.ts` e defaults locais | date utils + MF pages | Portugal local provado em unit | Manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` | IMPLEMENTADO |
| `OPSA-E2E-P2-005` | UI semantics, feedback, focus e CSS | UI/MF5 checks + axe scenario | Local verde; axe multi-browser bloqueado | Manifesto + `BROWSER-INDEPENDENT-REAUDIT-001` | IMPLEMENTADO |
| `OPSA-E2E-P2-006` | operation forms e feedback sem reset em erro | UI/App/MF5 feedback tests | Local verde; browser real ausente | Manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` | IMPLEMENTADO |
| `OPSA-E2E-P2-007` | attachment storage/routes/download e UI; migration 20260709203000 | MF2/multipart/storage | Local verde; S3/browser real ausentes | Manifesto + `SAFT-MULTIPART-FAIL-CLOSED-001` | IMPLEMENTADO |
| `OPSA-E2E-P2-008` | statement recovery/service e ReconciliationPage | recovery, contracts, MSW/DOM | Sem auto-confirmação; PG/browser ausentes | Manifesto + `FRONTEND-CURSOR-PAGINATION-002` | IMPLEMENTADO |
| `OPSA-E2E-P2-009` | live/ready routes e probes operacionais | health service/contracts | Local verde; PG/Redis/S3 ausentes | Manifesto + `CORRECAO-CLEANUP-006` | IMPLEMENTADO |
| `OPSA-E2E-P2-010` | request observability, JSON logger e shutdown | observability/logger/shutdown | Supertest local verde | Manifesto + `INTEGRITY-OPS-INDEPENDENT-REAUDIT-002` | IMPLEMENTADO |
| `OPSA-E2E-P2-011` | cursor backend/frontend; migrations 20260710090000 e 20260710113000 | 25 API + 18 web e reauditoria | Implementado; migration/browser real bloqueados | Manifesto + `REAUDITORIA-PAGINACAO-005` | IMPLEMENTADO |
| `OPSA-E2E-P2-012` | proxy hops explícitos e transport hardening | MF6/security contracts | Spoof proxy rejeitado localmente | Manifesto + `OUTBOX-HEALTH-PROXY-001` | IMPLEMENTADO |
| `OPSA-E2E-P2-013` | audit atómico/redigido em operações sensíveis e AI | atomicity/redaction + reauditoria 84/84 | Local verde; PostgreSQL transacional ausente | Manifesto + `BACKUP-READINESS-BULK-AI-003` | IMPLEMENTADO |
| `OPSA-E2E-P2-014` | toolchain pins, academic/report gates e runbook | academic gate/report + docs validator | Node 24.11.1 bloqueia alvo >=24.17 | Manifesto + `CONSOLIDATED-LOCAL-GATES-001` | BLOQUEADO_AMBIENTE |
| `OPSA-E2E-P2-015` | PG/Redis/storage operational probes | health/storage/cleanup | Local verde; três serviços remotos ausentes | Manifesto + `CORRECAO-CLEANUP-006` | PRONTO_REAUDITORIA |
| `OPSA-E2E-P2-016` | request terminal logging em close/abort | observability contract + reauditoria | Eventos terminais provados | Manifesto + `INTEGRITY-OPS-INDEPENDENT-REAUDIT-002` | FECHADO |
| `OPSA-E2E-P2-017` | SQL bulk upsert, cleanup e idempotência; migration 20260710120000 | batching 5000→20, MF2/import/cleanup | Local verde; migration/SQL PostgreSQL ausentes | Manifesto + `CORRECAO-IDEMPOTENCIA-008` | PRONTO_REAUDITORIA |
| `OPSA-E2E-P3-001` | React Router registry, 404/deep links | App/route tests | Local verde; Back/Forward browser bloqueado | Manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` | IMPLEMENTADO |
| `OPSA-E2E-P3-002` | StructuredResult/formatters e tabelas seguras | UI/formatters/MF8 gates | Dumps técnicos removidos localmente | Manifesto + `FRONTEND-INDEPENDENT-REAUDIT-001` | IMPLEMENTADO |

## 8. Blockers ambientais atuais

| ID | Pre-requisito ausente | Findings afetados | Comando/prova a reexecutar | Estado |
| --- | --- | --- | --- | --- |
| `ENV-DB-001` | `TEST_DATABASE_URL`, `RESTORE_DATABASE_URL` e PostgreSQL remoto descartável | P1-001, P1-004..010, P1-015, P1-017, P2-011, P2-013, P2-015, P2-017 | migrations zero, integration, concorrência e restore | BLOQUEADO_AMBIENTE |
| `ENV-REDIS-001` | `REDIS_URL`, prefixo isolado e HMAC key | P0-001, P1-015, P2-015 | teste partilhado de duas instâncias e readiness | BLOQUEADO_AMBIENTE |
| `ENV-SMTP-001` | credenciais SMTP sandbox | P1-002 | reset/convite E2E | BLOQUEADO_AMBIENTE |
| `ENV-S3-001` | endpoint/buckets/prefixos/credenciais S3 de teste | P1-003, P1-005, P1-011, P1-017, P2-007, P2-015 | upload/download/backup/cleanup | BLOQUEADO_AMBIENTE |
| `ENV-PGTOOLS-001` | `pg_dump`, `pg_restore` e `psql` compatíveis | P1-005, P1-017 | backup e restore real | BLOQUEADO_AMBIENTE |
| `ENV-BROWSERS-001` | Google Chrome, Microsoft Edge e Firefox automatizáveis | P1-015, P2-001..008, P2-011, P3-001 | Playwright/axe em 9 projetos | BLOQUEADO_AMBIENTE |
| `ENV-NODE-001` | Node instalado e `v24.11.1`, abaixo de `24.17` | P2-014, gate final | `npm --prefix real_dev/api run gate:academic` | BLOQUEADO_AMBIENTE |
| `ENV-SAFT-EXTERNAL-001` | motor XSD 1.1, adapter, emissão certificada, dados fiscais legítimos e revisão contabilística | P1-003 | validar XML contra XSD 1.04_01, reconciliar e atestar hashes | BLOQUEADO_AMBIENTE |

## 9. Diario de execucao append-only

### 2026-07-09T19:59:53+01:00 - PRE-FLIGHT-001

- Agente: principal.
- Acao: leitura do plano, memoria operacional relevante, worktree e ambiente.
- `git status --short`: exit `0`, sem output.
- `git diff --check`: exit `0`, sem output.
- Confirmado: `real_dev/` ignorado e `apps/` fora de scope.
- Confirmado: report ainda nao existia.
- Confirmado: 12 ficheiros MF8 com conflict markers.
- Confirmado: servicos remotos e PostgreSQL tools ainda indisponiveis.
- Proxima acao: criar este report, marcar trabalho iniciado e distribuir implementacao por areas disjuntas.

### 2026-07-09T20:00:00+01:00 - EXECUCAO-001

- Agente principal criou o report canónico antes de alterar codigo.
- Backend/auth recebeu `P0-001`, `P1-001`, `P1-002`, `P1-009`, `P2-012` e parte de `P2-013`.
- Frontend recebeu `P1-012`, `P2-001..006`, `P2-008` e `P3-001..002`.
- Evidence/docs recebeu `P1-013`.
- Agente principal reteve `P1-006..010` e coordenacao dos restantes findings.
- Apenas o agente principal pode atualizar este report.

### 2026-07-09T20:10:51+01:00 - BACKEND-INTEGRIDADE-001

- Findings: `P1-006`, `P1-007`, `P1-008`, `P1-010` e parte de `P2-013`.
- Implementado parser central de datas civis `YYYY-MM-DD` sem normalizacao de dias impossiveis.
- Aplicado a vendas, compras, recebimentos, pagamentos, lancamentos, contagens e filtros financeiros.
- Aprovacoes de venda/compra usam claim condicional por estado; o perdedor recebe `409 STALE_STATE` antes de history/audit.
- Fecho fiscal, documentos, recebimentos/pagamentos e postings partilham advisory lock transacional por empresa.
- Stock/FIFO usa locks por empresa/artigo/armazem em ordem deterministica; a transacao publica usa isolamento `Serializable` com retry `P2034`.
- Tarefas e lembretes passaram a gravar dominio + auditoria na mesma transacao e usam claim condicional na mudanca de estado.
- Comando: `npm run test:unit` em `real_dev/api`.
- Resultado observado: exit `0`; `86/86` testes passaram; `0` falhas/skips/todos.
- Testes focados novos: `strict-date`, `workflow-concurrency`, `postgres-locks` (`7/7` passaram antes da suite integral).
- Prova PostgreSQL concorrente permanece pendente por `ENV-DB-001`; por isso os findings ficam `IMPLEMENTADO`, nao `FECHADO`.
- Hashes SHA-256 principais:
  - `strictDate.js`: `41e05598a197cef24189d32c5dcac96e8bc49baa252b530d0471b4f277a0b9b7`
  - `postgresLocks.js`: `d5bf8920815f358e9d07524a3a78eec87ba2e52d572486e75eb57c9b092ec38e`
  - `saleDocumentService.js`: `19d0f2a2d35316f7e94245ed18f362238b59b2badf0c611fe4a58e657acf6028`
  - `purchaseDocumentService.js`: `f898169c182ff08d2ec8d3b88e2ad2456eb5de35b2985ceb9e5e46b8f4ea4cfa`
  - `receiptService.js`: `28ea30f143898ec6c445290595fa6d65fe115f5f5639278390fc121a6d2ef2f5`
  - `paymentService.js`: `bec6e7985b28b13f38cb34289913d689f30a5ee2319ee914c95b5d7c7b353d5f`
  - `saleApprovalService.js`: `cfce47421e720c64162d9ee0e538b5d0431b2f67aa0da8d210143b41856eb6d3`
  - `purchaseApprovalService.js`: `83c95e145662281167d147eaf9e9285fa71056d4ff41f66cc70d88a6993a0e06`
  - `fiscalPeriodService.js`: `68889ca125fd0b0edaa910058cdf185a59f2a3e86c1c72a264879b60f138bb13`
  - `stockMovementService.js`: `2f091a4379494d454d96c985797112e054a20c6b9e745497fbc8f4c993e12fcd`
  - `fifoCostService.js`: `d1cc6379ec958f570583d7a268b33d2800c3b8eabea22b0c9ec0754baccc3994`
  - `taskService.js`: `f0f934c7e29556b6dec28e27b5333eceabfb50c211b4a4d26b713fb83036283f`
  - `reminderService.js`: `29d9273331635db772914911f0cdd91457306b04a40a3d2888ce0e5a9ba0dfdf`

### 2026-07-09T20:17:27+01:00 - BACKUP-RECONCILIACAO-001

- Findings: parte de `P1-005` e `P2-008`.
- Os processos PostgreSQL deixaram de receber a URL, e por consequencia a password, nos argumentos visiveis do processo; a password e transmitida apenas por `PGPASSWORD`.
- O backup cria o diretorio com modo `0700`, os artefactos com `0600` e um manifesto deterministico com identificacao da base e obrigatoriedade de restore verification.
- A verificacao deixou de considerar `pg_restore --list` suficiente: exige `RESTORE_DATABASE_URL`, recusa a base de origem e nomes nao descartaveis, executa `pg_restore` real e confirma o schema restaurado por `psql`.
- A listagem e consulta de importacoes bancarias passaram a ser recuperaveis e isoladas por empresa em `GET /api/treasury/statement-imports` e `GET /api/treasury/statement-imports/:id`.
- Comando: `node --check scripts/postgres-cli.mjs scripts/run-daily-backup.mjs scripts/verify-backup-restore.mjs src/modules/treasury/statementImportService.js src/modules/treasury/statementRoutes.js && node --test tests/unit/statement-import-recovery.test.js tests/unit/postgres-cli.test.js` em `real_dev/api`.
- Resultado observado: exit `0`; `4/4` testes passaram, `0` falhas/skips/todos.
- `P1-005` permanece `EM_CORRECAO`: falta incluir objetos S3 no bundle e executar restore remoto real por `ENV-DB-001`, `ENV-S3-001` e `ENV-PGTOOLS-001`.
- Hashes SHA-256:
  - `scripts/postgres-cli.mjs`: `e5bf59524085b5ea51ece61d102778ec8d5bf1c7ac5f8b4366a704f34a6b774a`
  - `scripts/run-daily-backup.mjs`: `d58ab85dd8b016314380324e3b2315dc6946f83be009211e98b1f66de1cb6296`
  - `scripts/verify-backup-restore.mjs`: `377c73cba82f363277ce0bb4a50ac8fada743541d61ced0e3def9a900e11b9e4`
  - `statementImportService.js`: `729de70af845ba6f87914874562d3b6ba1dfa8e8fb6c74c303cecd03276043c2`
  - `statementRoutes.js`: `67bbd3563ff7df9060fcc2a2f7c1370c3ec6eee1a82fb4a9a904b14d4f769e9e`
  - `postgres-cli.test.js`: `78dd3fccf2a042e1c9b0ab898c4a2fe4b4b498e0b663c40fd37329618d82b2fc`
  - `statement-import-recovery.test.js`: `a2f139f412a2d253a6f8c3c62c91d5f2c088b18c5ca8610d5d979c391ef06d55`

### 2026-07-09T20:25:41+01:00 - RETENCAO-AUDITORIA-001

- Findings: `P1-004` e parte de `P2-013`.
- Emissao definitiva de venda, posting de venda e posting de compra criam o respetivo `RetentionHold` na mesma transacao da operacao contabilistica.
- O fecho fiscal materializa de forma idempotente os holds de documentos, lancamentos, mapas de IVA, exportacoes SAF-T e auditoria pertencentes ao periodo, devolvendo contagens por entidade.
- Foi criado `scripts/backfill-retention-holds.mjs`: processa periodos fechados por ordem estavel, uma transacao por periodo, e regista contagens antes/depois sem expor dados contabilisticos ou credenciais.
- Preferencias de alertas e perfil da empresa passaram a gravar mutacao + auditoria na mesma transacao; os detalhes de auditoria guardam apenas tipo/campos alterados, nao valores fiscais ou PII.
- Comando: `node --check src/modules/compliance/retentionPolicy.js src/modules/fiscal-periods/fiscalPeriodService.js src/modules/sales/saleDocumentService.js src/modules/accounting/salePostingService.js src/modules/accounting/purchasePostingService.js scripts/backfill-retention-holds.mjs && node --test tests/unit/retentionPolicy.test.js tests/unit/mf1-services.test.js` em `real_dev/api`.
- Resultado final observado: exit `0`; `27/27` testes passaram, `0` falhas/skips/todos. Uma primeira execucao detetou corretamente um double sem `retentionHold`; o double foi corrigido e a suite repetida integralmente.
- Comando adicional: `node --check src/modules/notifications/alertPreferenceService.js src/modules/company-profile/companyProfileService.js src/modules/company-profile/companyProfileController.js && node --test tests/contracts/mf8-alert-preferences.contract.test.js tests/contracts/mf0-contracts.test.js` em `real_dev/api`.
- Resultados observados em execucoes focadas: alert preferences `4/4` e MF0 `6/6`, ambos exit `0`, sem skips.
- `P1-004` fica `IMPLEMENTADO`, nao `FECHADO`: o backfill e as transacoes precisam de prova PostgreSQL por `ENV-DB-001`.
- Hashes SHA-256:
  - `retentionPolicy.js`: `7614a2cc822ea32943b7a8e4b469fc6d675a02dbacb34b207b82a8680543342c`
  - `fiscalPeriodService.js`: `5500367daea201c2eb31138d632ef12f900e4919b676cbae242a1e764ff1f8d6`
  - `saleDocumentService.js`: `11486bb32d0d620f88f0b293cf8dbaef049cf18129a11be60fb19d39d47adb01`
  - `salePostingService.js`: `53c6e932abe37242e6462834d82bb716d99c20e0c328c3dc010e105d035f9d90`
  - `purchasePostingService.js`: `1c4f5a728d483b6550013982d592108ae6599bd745ed9ebc2ac343d0e119f2b7`
  - `backfill-retention-holds.mjs`: `667956ccb3f181c4a98ed0c2ef76c93917321de4a3014edc7bc73f7e8fb8efe6`
  - `retentionPolicy.test.js`: `f21b1437506a7b4ef0dc7b81920c801fe0d0dd902540842d3cbc0f29b11b564a`
  - `mf1-services.test.js`: `41e01538dbb670a6f77358a2d897d65ca5a8b3ba39621b150d8710ce31949814`
  - `alertPreferenceService.js`: `12260ff81f1f75975de9f92948c95eeedc8a6de27e02b24f4edfb7d4810387c6`
  - `companyProfileService.js`: `507eeec67d88a5bfcd117907196f2b8b7d3bc9101f21d3cc287f047e24da71f6`
  - `companyProfileController.js`: `34139c062b03693c0f3f92a2ebaea998a4e8903e8781a3813169c16308076916`
  - `mf8-alert-preferences.contract.test.js`: `4df54fa29a95fb7248ad384001ce8ef99b02c9c0b368901e83389d03d6fbc156`
  - `mf0-contracts.test.js`: `a2389c1252a8b119aff6ca2916ec0c130231a905673f9da1b578906bf0e95804`

### 2026-07-09T20:26:40+01:00 - EVIDENCE-CORRECTION-001

- Correcao append-only da evidencia `RETENCAO-AUDITORIA-001`: foi acrescentada prova explicita de que perfil e audit log usam uma unica transacao.
- Comando: `node --test tests/contracts/mf0-contracts.test.js` em `real_dev/api`.
- Resultado observado: exit `0`; `7/7` testes passaram, `0` falhas/skips/todos.
- O hash atual, que substitui apenas para efeitos de evidencia o hash anterior do mesmo ficheiro, e `mf0-contracts.test.js`: `57cbd911094d63ba2ca9135c9129e8be236c79fc8a9935023516e918e8af2a6a`.

### 2026-07-09T21:26:29+01:00 - BACKUP-S3-ROUNDTRIP-002

- Findings: `P1-005` e parte de `P2-014`.
- O bundle passou a incluir dump PostgreSQL, cópia dos objetos persistentes
  (excluindo quarentena), manifesto ordenado, tamanhos e SHA-256 calculado sobre
  o conteúdo real; ETags S3 nunca são tratados como hash de conteúdo.
- O bucket de backup é separado por `BACKUP_S3_BUCKET`, exige SSE e só elimina
  objetos fora da retenção depois de o bundle novo estar integralmente gravado.
- A verificação descarrega novamente manifesto e dump do S3, confirma hashes,
  restaura numa base identificada como descartável, compara contagens agregadas
  de seis entidades críticas e restaura cada objeto num prefixo efémero,
  voltando a descarregá-lo antes do cleanup.
- Criado `mf7:backup:roundtrip` e acrescentado ao gate académico. O runbook
  deixou de alegar deployment/scheduler de produção e documenta apenas o
  contrato diário académico e o risco aceite.
- Configuração documentada: `TEST_DATABASE_URL`, `RESTORE_DATABASE_URL`, SMTP
  sandbox, S3/SSE, bucket de backup, retenção e SAF-T fail-closed.
- Comando: `node --check src/modules/storage/backupBundle.js scripts/run-daily-backup.mjs scripts/verify-backup-restore.mjs && node --test tests/unit/object-storage.test.js tests/unit/backup-bundle.test.js tests/unit/postgres-cli.test.js` em `real_dev/api`.
- Resultado: exit `0`; `7/7` testes, `0` falhas, `0` skips, `0` todos.
- Prova positiva remota não executada: `P1-005` fica `IMPLEMENTADO`, nunca
  `FECHADO`, por `ENV-DB-001`, `ENV-S3-001` e `ENV-PGTOOLS-001`.
- Hashes antes/depois conhecidos:
  - `scripts/run-daily-backup.mjs`: `d58ab85dd8b016314380324e3b2315dc6946f83be009211e98b1f66de1cb6296` -> `c6caa5f6825f6d57d590964cf48e1be45b99c448e97225d620874b2a92f506d5`
  - `scripts/verify-backup-restore.mjs`: `377c73cba82f363277ce0bb4a50ac8fada743541d61ced0e3def9a900e11b9e4` -> `96368d90c962b252b483db6b4cb91d8c30d56ee39baec2c02ac5c27eff428ac9`
  - `package-lock.json`: baseline `05af6403cf02388e7a4d0d4239c0d4bc6c901905c6faeb2a70a60c61206f59c5` -> `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`
- Hashes finais adicionais:
  - `objectStorage.js`: `945965bc4ec7a202a4a73e60c28e148d7410a6bdb7643a5774a99fcdf3f39d39`
  - `backupBundle.js` (novo; before N/A): `d7d35c7b65d7f2ec7f87336498963e8499b3ae8fa0594fac2f107a99ab23cd7d`
  - `backup-bundle.test.js` (novo; before N/A): `a5e84b2a467997fc0b8381160f55b4ef6ef9997ab191c3ecc6cb47466564c95b`
  - `run-backup-roundtrip.mjs` (novo; before N/A): `b60dc91c16c588aed7ff4c2fc5f18100f91f659c1f836164de46ca4d9c5c0be9`
  - `run-academic-release-gate.mjs`: `590dc04fced9787cf4512e63a3b13d43c7f2e511f5a90b2f6d4988e2164944a5`
  - `package.json`: `a56de48352bdf9624dd24acb841e417ab4273970119810dd605453754f40a75d`
  - `.env.example`: `a768d6593b2197754e0dcf92058a27b26a3d1a4ee3f6fa03a670d11a7024edb5`
  - `.env.test.example`: `f6366ca1183258ceb529fbec314dccd3b41184bd6f12eb786039eea0166830ba`
  - `OPERACAO-DEPLOY-ROLLBACK.md`: `f366e373fad86d9410a1535ff8ed75d7747b223795c52a8c60437a24213a7d26`
- Desvio de evidência: o hash anterior de `objectStorage.js` não foi congelado
  antes desta unidade, após a criação inicial em paralelo. A lacuna fica
  registada, sem inventar um valor; o hash final e o teste ficam disponíveis
  para a reauditoria fresca.

### 2026-07-10T00:05:23+01:00 - OUTBOX-HEALTH-PROXY-001

- Findings: continuação de `P1-002`, `P2-009`, `P2-010`, `P2-012` e
  `P2-013`.
- Lembretes e smart alerts deixaram de depender de envio direto: a criação das
  notificações, a outbox cifrada/deduplicada e um audit log mínimo decorrem na
  mesma transação PostgreSQL e respeitam as preferências por utilizador.
- O consumidor SMTP passou para um processo separado (`worker:email`), com
  lease, retry exponencial, verificação do provider, modo de drenagem limitado
  para o gate e shutdown explícito. A API apenas grava a outbox.
- Destinatário e assunto SMTP rejeitam CRLF/control characters; links de reset
  passaram a transportar o token no fragmento e nunca em query string.
- O guard HTTPS já não lê `X-Forwarded-Proto` diretamente: usa apenas
  `req.secure`, que o Express só deriva de forwarded headers quando
  `TRUST_PROXY_HOPS` foi configurado. Um header forjado com trust 0 é rejeitado.
- Readiness usa uma query Prisma parametrizada (`Prisma.sql`) em vez da variante
  `Unsafe`; continua a exigir PostgreSQL, Redis e storage.
- Comando: `node --test tests/unit/notification-outbox.test.js` em
  `real_dev/api`; exit `0`, `3/3` testes, zero falhas/skips.
- Comando: `node --test tests/contracts/mf7-email-contracts.test.js`; exit `0`,
  `6/6` testes, zero falhas/skips.
- Comando: `node --test tests/unit/mf6-services.test.js`; exit `0`, `6/6`
  testes, incluindo spoof de proxy.
- Comando: `node --test tests/unit/health-service.test.js tests/contracts/mf8-health.contract.test.js`;
  exit `0`, `11/11` testes.
- SMTP/Redis/PostgreSQL remotos continuam sem prova runtime; os findings ficam
  `IMPLEMENTADO` ou `EM_CORRECAO`, nunca `FECHADO`.
- Hashes finais:
  - `emailOutboxService.js`: `dffcc4abee820252dd811bb727e849795b02d67ca18a10ccab62638c8c667b52`
  - `notificationService.js`: `43d8630600bcb2d30a157f16bb551dffd949dd947bdfa1ea07be089d4684951e`
  - `notificationRoutes.js`: `7528dcd18719f07ed507a5a28a4e5546d9b54f26d0b74662f169fc7488617c5e`
  - `emailOutboxWorker.js`: `21887599bcc689dff8578478105f8a38d35c4a5e904054b2c029b24841f18b18`
  - `transactionalEmailAdapter.js`: `77436bc52779ff5e98a4209174428f4bd14e0571fb03243101f9f8fc333fb6ef`
  - `passwordResetEmailAdapter.js`: `6bb1aa395851b80c2fdfa98a05b2699dc9b4dc0f09e41b33f05580e3bd634547`
  - `run-email-outbox-worker.mjs` (novo; before N/A): `9bb2c7f92f366985395c02b49a41e3dd416a45d0d2d7400b24ec8305b13f3452`
  - `transportSecurity.js`: `7018d799c66c341277ef855d0f45545c26f6c9d69bbbf57d5f17319a8f16f0ec`
  - `healthService.js`: `8ffbfa276c2c460a4a26352740142143acb1871d9887a1aadfe3ca3c6a8e526e`
  - `server.js`: `7e1431cd3046a6f7ed9a2fbe7dd50550b43d5b0361fceb4a380ac98f72d9f7e1`
  - `notification-outbox.test.js` (novo; before N/A): `846b1661c1f80be41497840c3375841e17d0814d5cc5c8ba9f031e7411a7de9d`
- Os hashes anteriores desta unidade não foram congelados antes da retoma, além
  dos ficheiros novos. Esta lacuna é registada como desvio de evidência e será
  compensada pelo inventário final integral de hashes.

### 2026-07-10T00:13:54+01:00 - INVITATIONS-CONCURRENCY-REDIS-001

- Findings: `P0-001`, `P1-002`, `P1-006`, `P1-007`, `P1-008`, `P1-009` e
  parte de `P2-013`.
- O ciclo de convite passou a expor listagem segura, reenvio e revogação. Cada
  operação é company-scoped, usa lock/claim, roda o token/hash, grava outbox e
  auditoria na mesma transação e nunca devolve token/hash/autor interno.
- A aceitação inclui o hash atual no claim, impedindo aceitar um token que
  perdeu a corrida contra reenvio ou revogação. Links de convite usam fragmento.
- Criada prova PostgreSQL real para quatro corridas: stock/FIFO, decisão de
  aprovação, fecho vs lançamento e último ADMIN. `closedAt` é agora capturado
  depois do lock fiscal para não anteceder artificialmente uma mutação que
  estava à frente na fila.
- Criada prova Redis com dois clientes/instâncias sobre o mesmo prefixo HMAC,
  TTL/limite partilhado, reset cruzado e scan sem IP/email em claro.
- Evidência do agente executor: `npm run syntax:check` exit `0`; `npm run
  test:unit` exit `0`, `152/152`, sem skips; focados de convites `10/10` unit e
  `8/8` contract.
- Revalidação do principal após corrigir os doubles MF2: `node --test
  tests/contracts/mf2-contracts.test.js tests/contracts/mf0-contracts.test.js
  tests/contracts/company-invitation-lifecycle.contract.test.js`; exit `0`,
  `16/16`, sem skips.
- A suite concorrente sem `TEST_DATABASE_URL` terminou intencionalmente com exit
  `1`, `0` PASS e `0` skips; o agente confirmou que o skip local explícito é
  identificado como não-PASS. Prova real fica em `ENV-DB-001`.
- Comando Redis: `node --test tests/integration/redis-rate-limit.test.js`; exit
  `1`, `0` PASS, `1` fail, `0` skips, com nomes das duas variáveis ausentes e
  sem imprimir valores. Prova real fica em `ENV-REDIS-001`.
- Hashes finais:
  - `companyUserService.js`: `fa379876279d5694c39722cf59fbaffd2c1fa3ac42fec66d341fa1eebc58f90a`
  - `companyUserController.js`: `31dd6ab680ccfcec1859df1f10aca61b938b36c55a70886734e819d0d73a6482`
  - `companyUserRoutes.js`: `cf9964b053fa9340a54dcf838b683d995c8e79704e13b896b959d689f3cbfbc4`
  - `companyUserValidators.js`: `38e3ce42077fa20ab5c495f874e6b5518ac03beabcdd2e85e792575145c6ae72`
  - `invitationEmailAdapter.js`: `7b51e7c93de002c329f758ecc702760e5c60380838cbe2905e6b3926b3938465`
  - `invitationService.js`: `b1713d237ba1d36e834c0d0c20654c653ae269970ad1568ef86aaba02a5014d4`
  - `company-invitation-lifecycle.test.js` (novo): `2580442659ca2f65fc2c1bef6b17a0f239ecd7171c7375e613138428367be498`
  - `company-invitation-lifecycle.contract.test.js` (novo): `10f9a6cf56b699fd1748d7938152ef315d0875c81af89e7a29e9e4c67b5f9c11`
  - `e2e-concurrency-persistence.test.js` (novo): `ad56bf9d3f54355f6e6a55bf1b0adb99b44c0e425f116cb62d13030dee927d6a`
  - `redis-rate-limit.test.js` (novo): `56714eb9d2919adae54124f36369408914556d6a55ae3ddefb125549bff7b0cf`
  - `fiscalPeriodService.js`: `88ce543f85b5f4cb6b00518a40156537fc843d945b00059dd91ee8bc1cbd8bc9`
  - `auth-remediation.test.js`: `fa36d54129c12b6794cb8eac874fab6459244408af451d8e09cfde89d3467051`

### 2026-07-10T00:19:27+01:00 - STOCK-ALERT-ATOMICITY-001

- Finding: parte de `OPSA-E2E-P2-013`.
- A configuracao do alerta, a verificacao company-scoped de artigo/armazem e a
  auditoria passaram a executar na mesma transacao Prisma. Uma falha da
  auditoria impede a operacao de ser reportada como concluida.
- Os detalhes de auditoria guardam apenas os IDs de dominio e a lista de campos
  alterados; os limiares configurados deixaram de ser copiados para o log.
- Hash anterior de `stockAlertService.js`:
  `c45d0dd9198aca3a32e484097efac6ddacb59f3ec87307b61ccae29544c260d0`.
- `stock-alert-atomicity.test.js` e novo, pelo que o hash anterior e `N/A`.
- Comando: `node --check src/modules/inventory/stockAlertService.js
  tests/unit/stock-alert-atomicity.test.js && node --test
  tests/unit/stock-alert-atomicity.test.js`, em `real_dev/api`.
- Resultado: exit `0`; `2/2` testes passaram, `0` falhas, `0` skips.
- Hashes posteriores:
  - `stockAlertService.js`: `8422233936ba7eb485775f2fdc3b47e8d8f7e3d3890951126ec526b8a0e64a5d`
  - `stock-alert-atomicity.test.js`: `79324d9a7ff192219e6208b7d95757a96304b30cd1b007076f7bfa5f60892958`
- Lockfiles neste ponto da execucao:
  - API: `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`
  - web: `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`

### 2026-07-10T00:20:54+01:00 - NPM-AUDIT-001

- Finding: `OPSA-E2E-P1-014` e parte de `OPSA-E2E-P2-014`.
- Comando API: `npm audit --omit=dev --audit-level=moderate`, em
  `real_dev/api`; exit `0`, resultado `found 0 vulnerabilities`.
- Comando web: `npm audit --omit=dev --audit-level=moderate`, em
  `real_dev/web`; exit `0`, resultado `found 0 vulnerabilities`.
- Nao foi executado `npm audit fix` nem qualquer upgrade automatico.
- Hashes dos manifests/lockfiles auditados:
  - API `package.json`: `962d4aac9fea4066fafd8c14f99631a0a45482616fb7639edaacd962b813a8a5`
  - API lockfile: `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`
  - web `package.json`: `fecdb8f34022c84bdb41fe14dfef22e58d58a3499cc71eeda9697500945cb444`
  - web lockfile: `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`

### 2026-07-10T00:26:21+01:00 - SENSITIVE-CONFIG-ATOMICITY-001

- Finding: parte de `OPSA-E2E-P2-013`.
- Criacao/importacao do plano de contas e criacao/ativacao de taxas de IVA
  passaram a persistir a configuracao e o `AuditLog` na mesma transacao.
- A ativacao de IVA usa `updateMany` company-scoped como claim; um ID de outra
  empresa nao pode ser lido nem auditado.
- Os logs registam apenas campos alterados ou a contagem importada, nunca nomes
  de contas, descricoes fiscais ou motivos de isencao.
- Hashes anteriores:
  - `accountService.js`: `a1842636c918807dc7d20ede88cdd6ade8633adc57f76da5403a514791cc5c0e`
  - `accountController.js`: `801b8a8e94f31f14ae3dffcbc1ba2f732a4565cb620facf95fc3893825dbbc14`
  - `vatRateService.js`: `4c497706786eb9d9b6fb6676c87dcd6ef031999b3e2be9e3351ffe50abea243c`
  - `vatRateRoutes.js`: `746bf704f3206ea5496531ebccc671102e14c46631f4917437d00f4d0d6111af`
  - `sensitive-config-atomicity.test.js`: `N/A` (novo).
- Comando focado: `node --check src/modules/accounting/accounts/accountService.js
  src/modules/accounting/accounts/accountController.js
  src/modules/vat-rates/vatRateService.js src/modules/vat-rates/vatRateRoutes.js
  tests/unit/sensitive-config-atomicity.test.js && node --test
  tests/unit/sensitive-config-atomicity.test.js
  tests/contracts/mf1-contracts.test.js`, em `real_dev/api`; exit `0`, `9/9`,
  `0` falhas/skips.
- Regressao unitaria: `npm run test:unit`, em `real_dev/api`; exit `0`,
  `160/160`, `0` falhas/skips.
- Hashes posteriores:
  - `accountService.js`: `258d45b80bd080ffed98d57a34b62bb1b7592b03ce61141d7154fc5b7af5363b`
  - `accountController.js`: `c943179cefb0885bc3f8def9eb7d24bf61ce2857a2438ffc3efc4924f1287ce1`
  - `vatRateService.js`: `85239b319d0234bb3ba05a2010850d394fba5cf62e0958c89270f042b4840ada`
  - `vatRateRoutes.js`: `c3e12685e6219ec70cb013dc0bf506de4a1218c633968eedb667468bb23db9d8`
  - `sensitive-config-atomicity.test.js`: `9f0a8fa305c11dd21417e7d08a24b97c2bc674155b5abaa5c93af36674663400`
- Lockfiles sem alteracao nesta unidade: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:28:01+01:00 - FISCAL-PERIOD-AUDIT-001

- Finding: parte de `OPSA-E2E-P2-013`.
- A abertura de um periodo fiscal passou a adquirir o lock fiscal, confirmar a
  inexistencia de sobreposicao, criar o periodo e gravar auditoria sensivel na
  mesma transacao. A auditoria nao copia nome nem datas contabilisticas.
- Hashes anteriores:
  - `fiscalPeriodService.js`: `88ce543f85b5f4cb6b00518a40156537fc843d945b00059dd91ee8bc1cbd8bc9`
  - `fiscalPeriodController.js`: `0fc40786ab832bd5b9f1b9fb08e53aef43e71ed7b113dae639be1edfc13ca5e0`
  - `auditLogService.js`: `be305c39781ed6462b36af7122111ef43ac10442333f557c22f0cbd512e65304`
  - `sensitive-config-atomicity.test.js`: `9f0a8fa305c11dd21417e7d08a24b97c2bc674155b5abaa5c93af36674663400`.
- Primeira execucao focada: exit `1`, `4/5` PASS. A prova encontrou corretamente
  que `fiscalPeriod.create` ainda nao pertencia a allowlist fechada de acoes
  sensiveis; nenhuma afirmacao de PASS foi feita.
- Correcao: declarada a nova acao na allowlist, mantendo o fail-closed para
  qualquer acao sensivel desconhecida.
- Comando final: `node --check src/modules/audit/auditLogService.js
  src/modules/fiscal-periods/fiscalPeriodService.js
  src/modules/fiscal-periods/fiscalPeriodController.js
  tests/unit/sensitive-config-atomicity.test.js && node --test
  tests/unit/sensitive-config-atomicity.test.js tests/unit/mf6-services.test.js`,
  em `real_dev/api`; exit `0`, `11/11`, `0` falhas/skips.
- Hashes posteriores:
  - `fiscalPeriodService.js`: `6c6377affc316f1ec9a1fb0064d930b9cb4452545bee4c42e23bf29ab72e16a7`
  - `fiscalPeriodController.js`: `4eb85f06c127db624d6ea288c6ea5dddf349d9d2f6f4c6c8aaf5d6970d2e14d3`
  - `auditLogService.js`: `2fd32af4bb653f5ec8e2e4b633d0658ee47bdf6c8a6feaed06b37d1e4981c1cf`
  - `sensitive-config-atomicity.test.js`: `b6a2bf84afd4115511f16dbcb7593a405a7a8e60a645d8c339fd276aa67dc265`
- Lockfiles sem alteracao: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:29:40+01:00 - COMPANY-SWITCH-ATOMICITY-001

- Finding: parte de `OPSA-E2E-P2-013`.
- A troca de empresa ativa passou a usar a mesma transacao para adquirir o lock
  partilhado com a gestao de memberships, confirmar a membership ativa,
  atualizar apenas a sessao nao revogada do utilizador e criar `AuditLog`.
- O identificador secreto da sessao nunca entra no log; a entidade auditada e a
  membership interna. Uma sessao revogada falha antes de auditar sucesso.
- Hash anterior de `companyService.js`:
  `aa969239c1fc9de2bef6ec4911ebf8c65d72208dffc87705c14d7a7b6d02bcde`;
  o teste e novo (`N/A`).
- Comando: `node --check src/modules/companies/companyService.js
  tests/unit/company-switch-atomicity.test.js && node --test
  tests/unit/company-switch-atomicity.test.js`, em `real_dev/api`.
- Resultado: exit `0`, `2/2`, `0` falhas/skips.
- Hashes posteriores:
  - `companyService.js`: `413e1ea048b0f2c52fef228928f6d0023ff379240106500973ba30bcdee95365`
  - `company-switch-atomicity.test.js`: `200500983e9c65bba88a01283be3e0c5be6aefee3606e7a24db0e5740bf8fb6d`
- Lockfiles sem alteracao: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:31:43+01:00 - LOCAL-RATE-LIMIT-001

- Finding: complemento de `OPSA-E2E-P0-001`.
- Foi criado o fallback local explicitamente permitido pelo plano, mas apenas
  quando o chamador declara `development` ou `test`. A tentativa de o criar em
  `production` falha imediatamente.
- Tal como o adapter Redis, o fallback usa chaves HMAC e nunca guarda IP/email
  em claro; implementa janela TTL e reset. O runtime seguro continua a usar
  Redis e a prova partilhada continua bloqueada por `ENV-REDIS-001`.
- Hash anterior de `redisRateLimit.js`:
  `8b7c37a6685f30ff216ad440740eb5365567c18d7625f974fb63a7060a25eb77`;
  o teste e novo (`N/A`).
- Comando: `node --check src/modules/auth/redisRateLimit.js
  tests/unit/local-rate-limit.test.js && node --test
  tests/unit/local-rate-limit.test.js tests/unit/mf0-validators.test.js`, em
  `real_dev/api`.
- Resultado: exit `0`, `11/11`, `0` falhas/skips.
- Hashes posteriores:
  - `redisRateLimit.js`: `2ae0a7560ead66b9261ebb03ef99eef492f7e4b1ac6ae72c16d11f20a56ee00d`
  - `local-rate-limit.test.js`: `14185477b84a96b2be139b1ee5dc7fc82441299196de5346f57f09221a14fc1f`
- Lockfiles sem alteracao: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:33:04+01:00 - TOOLCHAIN-PIN-001

- Finding: parte de `OPSA-E2E-P2-014`.
- Criado `real_dev/.nvmrc` com Node `24.17.0`; os dois manifests ja declaram
  `node >=24.17 <25`, npm 11 e `packageManager npm@11.6.2`.
- `.nvmrc` e novo (`N/A`); hash:
  `98182b41c9ce3357797985cf12dc3b0124490ef88bc918a905373e7688e6aec9`.
- Comandos de verificacao: `node --version` -> `v24.11.1`; `npm --version` ->
  `11.6.2`, ambos exit `0` no root do repositorio.
- O npm cumpre o contrato; o Node disponivel nesta maquina ainda e inferior a
  `24.17`, pelo que o gate academico permanece corretamente bloqueado e nao e
  registado como PASS.
- Hashes associados: API `package.json`
  `962d4aac9fea4066fafd8c14f99631a0a45482616fb7639edaacd962b813a8a5`, web
  `package.json` `fecdb8f34022c84bdb41fe14dfef22e58d58a3499cc71eeda9697500945cb444`,
  API lockfile `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`,
  web lockfile `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:35:34+01:00 - AUDIT-REDACTION-001

- Finding: parte de `OPSA-E2E-P2-013`.
- A minimizacao de `AuditLog` passou a ser recursiva: password, token, cookie,
  authorization, conteudo bruto, email, destinatario e IP sao redigidos mesmo
  quando aparecem em objetos/arrays aninhados. Buffers nunca sao serializados.
- Foram definidos limites de profundidade e de 100 campos/itens por nivel para
  impedir logs acidentalmente massivos.
- Hash anterior de `auditLogService.js`:
  `2fd32af4bb653f5ec8e2e4b633d0658ee47bdf6c8a6feaed06b37d1e4981c1cf`;
  o teste e novo (`N/A`).
- Comando: `node --check src/modules/audit/auditLogService.js
  tests/unit/audit-redaction.test.js && node --test
  tests/unit/audit-redaction.test.js tests/unit/critical-pagination.test.js
  tests/unit/mf6-services.test.js`, em `real_dev/api`.
- Resultado: exit `0`, `10/10`, `0` falhas/skips.
- Hashes posteriores:
  - `auditLogService.js`: `3d0ef3254c60c9a8df86d6e13f254dc38a46f28c4245a2cf191d8ef2662a1770`
  - `audit-redaction.test.js`: `0a274272d7211faa1a3a42d86f73d784c3825f501dc084155e827222c975bafa`
- Lockfiles sem alteracao: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:38:44+01:00 - APPROVAL-AUDIT-MINIMIZATION-001

- Findings: `OPSA-E2E-P1-006` e parte de `OPSA-E2E-P2-013`.
- Os motivos livres de aprovacao/rejeicao continuam preservados no workflow
  funcional, mas deixaram de ser duplicados no `AuditLog`. O log guarda apenas
  a existencia do motivo e, nas compras, o ID do historico que o contem.
- Hashes anteriores:
  - `saleApprovalService.js`: `cfce47421e720c64162d9ee0e538b5d0431b2f67aa0da8d210143b41856eb6d3`
  - `purchaseApprovalService.js`: `83c95e145662281167d147eaf9e9285fa71056d4ff41f66cc70d88a6993a0e06`
  - teste novo: `N/A`.
- Comando: `node --check src/modules/sales-approval/saleApprovalService.js
  src/modules/purchase-approval/purchaseApprovalService.js
  tests/unit/approval-audit-minimization.test.js && node --test
  tests/unit/approval-audit-minimization.test.js
  tests/unit/workflow-concurrency.test.js`, em `real_dev/api`.
- Resultado: exit `0`, `4/4`, `0` falhas/skips.
- Hashes posteriores:
  - `saleApprovalService.js`: `4858539d562ee61d917a9d34d8648cd770e90d23c923d1947265da36918a10b3`
  - `purchaseApprovalService.js`: `731060876988bae5b0e5337ac8cad7c31bdf23bd850f85299ff67305e80c1fbf`
  - `approval-audit-minimization.test.js`: `960f945c24eb4a5cf9f46b0c871d18d79d92dd43c441b1ef7e43aa07631d2f0a`
- Lockfiles sem alteracao: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:40:31+01:00 - DOCUMENTATION-FAIL-CLOSED-001

- Finding: `OPSA-E2E-P1-013`.
- Os 12 ficheiros de evidence deixaram de conter conflict markers. O auditor
  passou a validar semanticamente o contrato tutorial atual, os passos
  positivos/negativos e o handoff final; 345 falsos positivos foram removidos e
  15 problemas reais foram corrigidos (13 handoffs e 2 documentos desatualizados).
- Resultado atual: `0` conflict markers, `0` advisories, `0` waivers. O ficheiro
  `VALIDATION-WAIVERS.json` existe com schema fechado e lista vazia.
- Comando independente do principal: `bash scripts/validate-planificacao.sh`,
  no root do repositorio; exit `1`. Contagens: `51` RF, `39` RNF e `93/93/93`
  BK em matriz/backlog/guias. `coverage_pass`, `consistency_pass`, `guides_pass`,
  `naming_pass`, `conflict_markers_pass`, `advisory_pass` e
  `waiver_config_pass` sao `true`; `blockers_pass` e `overall_pass` sao `false`.
- O exit `1` e o comportamento correto: permanecem tres decisoes de evidence
  ambientais nao waived (`BLOQUEADO_AMBIENTE`, `BLOQUEADO_ATE_CORRECAO` e
  `BLOQUEADO_ATE_BD_EFEMERA`). Nenhum blocker foi convertido em PASS.
- `git diff --check` e o scan de conflitos do agente terminaram em PASS; o
  bytecode Python gerado pela compilacao foi reposto e nao ficou no diff.
- Hashes `antes -> depois` de evidence/validadores:
  - `ARQUITETURA-TECNICA-MINIMA.md`: `7bc739382d349ed31d0c8e0b7a84e666f2705b97ab28f7b4dc720507d37920f6` -> `0c37dd5543eb278496a8859af7da1df5eb220c710ae52476a0c1dfdf023d6b4e`
  - `BK-MF8-04.md`: `41932681e3a665105af46a3c5001ad764dd3edb1270f8bf98233152002532c9c` -> `02a4b99f94a62cd23d4c9c2e9e2b4cbc1be448c36277bbd2345b3d401c1c8175`
  - `BK-MF8-08.md`: `87b3c266c2d4d8404d816f3f615e420440d09980b3a67632fabe77095a7e993f` -> `935f3beeedc57173eb33498db54c8156714320e82252773893bcf0f579ca5018`
  - `BK-MF8-09.md`: `e17da60617a2da9b2bb23ac5fde457966a48762810a5b02fde2611d229fc8e9e` -> `eeb7658a588c5caf41235ec57de9768d0e45aa12e1e1600af43824ba171a5d4b`
  - `BK-MF8-10.md`: `d59e12adea8e6bde9cfc8296ee4025218dceeb0657f9c3c5827c36fc63c38698` -> `8e8bf97d2150009fb1bed831f7564b1e66e89991a7f34f1d55636b18c57c8c40`
  - `BK-MF8-11.md`: `4d834308ba87077a8f04359787d4f97306334a0865eaac87f2ce3b0d7981bfc7` -> `599ba63b9d462fd7c5258be59dad7a771b5b0be1736b15c15a65900494285155`
  - `BK-MF8-12.md`: `f31740061265b6f738283c1cfad74c3ebc54941ee4ca37ea5fba2d7436e972b0` -> `95e6291fe684553ed87ca5936fae58244dba08aff343c5eea32ae2bc14b3524d`
  - `BK-MF8-14.md`: `773eb4baf6b1478e0ecaec4d61019df1000f5e36b2e6976a6e33dcbf4a2961eb` -> `8faa12579efcf7257f6a4e9bcd6379818cc7154f6d7b400ed2e9036d554cdde7`
  - `CORRECAO-ERROS-REPORT.md`: `f62d4628c7a44e4bcba49c327b9be3a85cb3a7d817e8712547143a40c6a23ffd` -> `41b4e5af5f53d3d568c10d7c76fb08518a5018b07f1788351ee73750b3454b5d`
  - `EXECUCAO-FINAL-TESTES.md`: `b468a2647830b3f87ef60642f06634f0a84626bc6e7863f995232f7aee734d6e` -> `cf62ed896fd22b54d972153d379f794b678356babe2169f84dc9d6350c5fddb0`
  - `TESTES-EM-FALTA.md`: `85bb488ebd5f832a0d96ca0d71768a1642229c5e7cafc40432205ddd3cbd4798` -> `5e0a6430aeed44b5c3b84aebbae611df4e121c495beb0ead35bce8f90c616061`
  - `UI-MOCKUP-CHECKLIST.md`: `f4d804fd8589d29ab3dd7bb41229eaee38db86002baf4214cfeff9ed3c1bd375` -> `d037f4a4f48c09d0be9668334e7c7aef64d99fef10d06c5ee3f2f7515ab193d7`
  - `auditar_planificacao.py`: `51d1661fac9cc0dc90a7b798ada359a2406a4b78f5fe0e50ef2dda777a910544` -> `d60d5f06ffa3e933d7fa97c342fa58f40811834a9d4de22a4a874bcaa160058a`
  - `validate-planificacao.sh`: `3cc7e3bbfd8d5d4e745bccbdbb8211300ca1e69f37cdc6ea649350d74bf8a85c` -> `802e534520fa8f70a5e100f4ef05dab3c296ea45f1678dc98d493b0c42781de4`
- Hashes `antes -> depois` dos 13 handoffs e documentos sincronizados:
  - `BK-MF0-01`: `5fab1d3efbb04cebc96a3f5bfe8743657340b356466514fb7a9a73962076df74` -> `e54dd285a716b3976262031f1b1d316a9b484e5b3dcfe9c61d7e107855d99d33`
  - `BK-MF0-02`: `14da800dbedf71d248480d476d9cb57b39e4747ea60c89335ef26b0bff3e979d` -> `1ab42eb4e1a334eaba48f2d8b9916b08a4ffaed00a4f775ab377fe989ec8dfc4`
  - `BK-MF0-03`: `eec9cf58f5c903e05754f1f90931a6669247d54b23428bc43abfdc96fcf0416b` -> `40058120778382b2578fc17f695a4a542ec648fada060df45f5da02967ac9f7f`
  - `BK-MF0-04`: `b2495e857c393d58584569467ff2b3b46ba3eacb3a34ab77f37a3ada30993754` -> `a10decd9495d8a0f83ec27843fd4dc0639756c4e56939cfd33bb0f58a35cd4ec`
  - `BK-MF0-06`: `f0ebc5a8c4dc90ab77ee7378154c7f0c0ff52b81596d1e1d932ff41224040b11` -> `e21833656763f8abf7cb5222e72186d7fe0fd22fd0194c9a5e7d6101dc3fa2d2`
  - `BK-MF0-07`: `cb7caea85cedfe0737f6322fd6b509bc63b08c211619984e6e00fc67ce883e67` -> `dca90bfa34e923cdc1469972d5900c0674ca37feb36c8ac84015a93369186ad6`
  - `BK-MF0-08`: `00a14c80ed674c43713940903fa0baf28d856a8409a530ddb5fa1f77ef14d47f` -> `192a0ccceba0e48f106e35d419da45747ac56ef62efd1443af3c9c9527c99a98`
  - `BK-MF0-09`: `5c30073098258883de4d1762dcebf545a779753dc3416e1483fc42502fe9e604` -> `4caba3b75bedf7bcb3c9e3988b8ec6bdf3dbbb1e31ec3938552d9a5582227b26`
  - `BK-MF0-10`: `06f8a109dfd67e7470aa90c174c5759f3bfb6b38af4b7613cedddba42f972acd` -> `ae36d7a6bbcab6557d542f70c466c5dc21be2ae8ab6fbec356bbe413da2afd6b`
  - `BK-MF0-12`: `8db4f46c9007af550fe93605852ee3b77d098b941bf1e0321483bf3c2aff23d4` -> `f2b0571e7c35f20e3970b25a3e7c9ada1cb716e0e6ef0d487d5d7a0f445aa0a7`
  - `BK-MF1-04`: `f2e2034acfb0320f05da92f76acb6a9b1999e4bb2a2106cdfd8493675d60fa95` -> `125480377d87322ac431d4220f7937a272c8df6a0228d55a5e0595125aca90d0`
  - `BK-MF1-09`: `a6b9f1c00c619a811ccb6fb491d342b30ec9e77e227d7d28c5a9e3f1a4fd5555` -> `af4287c950fd5a515d97cf012e3e8ad06546284c136e50033e1b38b43dd8e88d`
  - `BK-MF2-05`: `e1488b879e201358902b173890f930827d89b3ccf93a7e21dc3857a77b66e4d6` -> `b03e76f8aca7c36de20decb6dd026adccb8abfab2f348a78b1905919deceeb47`
  - guia README: `b7631b9763ce9a1a7c799d0765ddb85786fbcfed145f5fd6913ee91477db8e48` -> `0c00f9e986ca943c66be5b93d0d90b931573aeda44aae20b8a3cf348eba6c13c`
  - `SCORECARD-SPRINTS.md`: `821ec512d8346b8feedf6b39f77bd49ac2fea07da3d7ce56b2abd77f79037698` -> `acdc3ca527892f32a9220087c6b4ba3a4ac299dfcc69cc992fc0a6dd9d57b98d`
  - `GUIAO-DOCENTE-SEMANAL.md`: `c13078d1a8d74898a8569331c08e81c719c70254a81d62e666202cba7f8bd59d` -> `e32242058ffdc5613596ef5b4778545aa2c1b442080e7aaa500378bf2ba274aa`
  - waiver config novo: `cfbc6293bfee027f7edd4b5ea567b3fd7e8c2a989e40ef83e2f771e714bce43b`.
- `P1-013` fica `IMPLEMENTADO`, nao `FECHADO`: a reauditoria final ainda tem de
  confirmar o gate e os tres blockers ambientais continuam legitimamente ativos.

### 2026-07-10T00:43:32+01:00 - S3-CONFIG-HARDENING-001

- Findings: complemento de `OPSA-E2E-P1-005`, `OPSA-E2E-P1-011` e
  `OPSA-E2E-P2-007`.
- A factory S3 valida agora URL, ausencia de credenciais embebidas, bucket e o
  valor de SSE antes de construir o cliente. Em `test`/`production` o endpoint
  tem obrigatoriamente HTTPS; HTTP explicito fica limitado a `development`.
- `S3_SSE` aceita apenas `AES256`, `aws:kms` ou `aws:kms:dsse`.
- Hashes anteriores:
  - `objectStorage.js`: `945965bc4ec7a202a4a73e60c28e148d7410a6bdb7643a5774a99fcdf3f39d39`
  - `object-storage.test.js`: `6acea4160744efcb370ea0a8a596595d6f0c23a603d971eceed558071e205b45`.
- Comando: `node --check src/modules/storage/objectStorage.js
  tests/unit/object-storage.test.js && node --test
  tests/unit/object-storage.test.js tests/unit/backup-bundle.test.js`, em
  `real_dev/api`; exit `0`, `7/7`, `0` falhas/skips.
- Hashes posteriores:
  - `objectStorage.js`: `7b9233df358d0c724010b585563035b9e97eef81c84041af46bce214b142424f`
  - `object-storage.test.js`: `108a62b99b77afd9b6bdca8b639e7409cf64501e94edd795ea7b824aea40cd40`.
- Lockfiles sem alteracao: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:44:30+01:00 - SAFT-MULTIPART-FAIL-CLOSED-001

- Findings: `OPSA-E2E-P1-003`, `OPSA-E2E-P1-011` e `OPSA-E2E-P2-007`.
- O endpoint SAF-T legado foi removido. O contrato company-scoped passou a
  `POST/GET/download /api/compliance/saft/exports`, usando exclusivamente
  `fiscalPeriodId` fechado e recusando intervalos arbitrarios.
- O exportador exige flag explicita, XSD oficial com fingerprint conhecido,
  pipeline injetado, XML Windows-1252/namespace correto, hashes, reconciliacao e
  revisao externa. Apenas um run `READY` integralmente atestado pode ser
  descarregado; o processo CLI direto injeta `null` e permanece fail-closed.
- O preflight passou a exigir metadata fiscal configuravel no perfil, plano de
  contas e IVA, bem como ATCUD/hash nos documentos. Nao inventa estes dados.
- Extratos e business imports recusam o antigo `content` JSON e recebem ficheiro
  multipart. CSV, OFX UTF-8/Windows-1252 e XLSX limitado sao derivados dos
  bytes reais. Abort/error limpa a quarentena.
- Anexos sao promovidos, verificados por tamanho/MIME/SHA-256 e descarregados
  apenas quando objeto e `JournalAttachment` coincidem.
- Evidence SAF-T obsoleta foi atualizada: deixou de alegar GET legado, MVP ou
  `PASS_COM_SKIP`; estado atual e `BLOQUEADO_AMBIENTE`.
- Validacoes do agente em `real_dev/api`:
  - `npm run syntax:check`: exit `0`, 248 ficheiros abrangidos;
  - `npm run test:unit`: exit `0`, `178/178`, zero skips;
  - `npm run test:contracts`: exit `0`, `133/133`, zero skips;
  - `npm run test:mf7`: exit `0`, 39 testes e check modular verdes;
  - `DATABASE_URL=<synthetic-test-url> npx prisma validate`:
    exit `0`, schema valido;
  - `npm run test:integration`: exit `1`, 2 PASS/4 fail/0 skips, por ausencia de
    `TEST_DATABASE_URL`, `REDIS_URL` e `RATE_LIMIT_HMAC_KEY`.
- Uma execucao intermédia de quatro contratos Supertest no sandbox terminou
  exit `1`, 16 PASS/4 `listen EPERM`; nao foi contada. A suite completa posterior
  fora dessa restricao passou os mesmos contratos.
- Desvio de evidencia: os 27 ficheiros desta unidade foram editados antes de o
  agente capturar hashes `before`. Como `real_dev` e ignorado, esses valores nao
  sao recuperaveis com rigor. O unico `before` certo e `N/A` para o novo
  `saft-export-service.test.js`. O inventario final integral compensa a lacuna.
- Hashes finais da unidade:
  - `src/server.js`: `5caca82dcab7253f0023746df8d4b74927f53d63676d67c6295fa4dab96c4139`
  - `src/lib/multipartUpload.js`: `1c57deaf2876f362e93c57764d1bc6f67bfb22872ee1092beed103cc7c2d423c`
  - `saftRoutes.js`: `3d1fcfad6fee1f641c4d042d4bce488de7a57b9283df9e2865897d36ea8fb4df`
  - `saftService.js`: `fd280cad4e86d8b503264edaf3a401510fab7f041f6482cede39461d5dcd3698`
  - `saftComplianceChecklist.js`: `1f97964c9a9155b4569d36748ae06215c5ecc5ef2d3aa994a4f0be73a14f3add`
  - `statementImportService.js`: `cc133ab70692b45bae86f8b2f33ed2e41538dc46cd9d35c5b9a6bc0b93c9027c`
  - `statementImportValidators.js`: `1c39dc87cd9fb95e9ea4e7ed4fbc1ed01cf022976bba5577dd2ffbc920f4ad68`
  - `businessImportValidators.js`: `2dc47075c348c2fdf03ee5dc4250e1fc814f4cd26f1cd53d7269f12940f004d1`
  - `companyProfileValidators.js`: `78a091827752e48a583f3e4626cdcbfcd09c5d7dd385785672d2e93f0e16a34c`
  - `accountValidators.js`: `90f849011f61641439c7e3a1debd381d1e35099727f00e2113c5739a729c36ae`
  - `accountService.js`: `7bc4e2f4754cccc4c65a9b999c04acb19bc37d6ce0036fee124cec4715c0309d`
  - `accountController.js`: `e7f5f830c78e52fd1820731a04099e48e88a3b88ff889d54b07c7bd1ab48a1d7`
  - `accountRoutes.js`: `c8e06100b7c56d6b474c453974b44d72be803f52cba7295e6e52a04c820ba331`
  - `vatRateService.js`: `b6e4e02dab17f1e7b60fce1733cb1a581c0d7fee5efc94027fa8e20a5d6e19c7`
  - `vatRateRoutes.js`: `4f53ca337b2e36b1b19cea4badd9fdd30e863eb8ea723367fd4ca14432f24ebc`
  - `manualJournalService.js`: `56012be97d8e1630eec76ff36f443020c57a1be44029b7da41191585a2b75374`
  - `manualJournalRoutes.js`: `06d7d1546ccfff86d6caadff980354359596aebfd1e7eed995db74f6181ec504`
  - `prisma/seed.js`: `f3010247f97cd4fd1f87bd764195a9cb51b6edf64f2e5f22e458826b18e12b23`
  - `mf3-persistence.test.js`: `d87db0a3925d9a8eab8bada54a0dd36050b55d1e58480ebffa4331b913c66664`
  - `saft-export-service.test.js`: `d9c35f57845e50ff1a2bceb29e48b612b46decdd05555efec3dbacfb180e02c5`
  - `mf3-services.test.js`: `5fef1a2f834a4098ff95e0f6ba4cd97add6a1fba6ee12af73a086c2b36f1ab5a`
  - `mf0-validators.test.js`: `e0cd14975e4674eea318d100192d0da76e77d447df3cc1c6e5ba15ad63ea4c97`
  - `mf1-services.test.js`: `6a5eaaed1e04a5e69cfa2d5a0b02e6599d557089ca6e2b624f9b8da393e20f27`
  - `mf2-services.test.js`: `73bc84bc2b13154168b02707b911a004b034e074b7168148aae4f1be66811bdd`
  - `multipart-upload.test.js`: `dce2bf0f891de47dbe1e1e498ad918e10a49d94e132a69ab71c7e197ac95dcc2`
  - `sensitive-config-atomicity.test.js`: `1869bbff917b9fd7742516c04f5ad7b862adf7f5b53495a8ece41d35ffe94255`
  - `mf7-saft-contracts.test.js`: `b1534c9da0d6b4d6fdcbb0ea4653f9fff147216a554fb5484ea92d938435c6b9`.
- Hash da evidence atualizada: `cca383e7d4e3b2e49809f8c584ebaec2d2d51484780e76d26a3b62f97d94f30a`
  (antes `6bdfd6726c409ee8c925046f45123c3b276b833ef2bf7340a2a41724a5635f51`).
- `P1-003` permanece `EM_CORRECAO`: nao existe adapter externo real nem revisao
  contabilistica. Nenhum resultado local e apresentado como conformidade legal.

### 2026-07-10T00:45:27+01:00 - DOCUMENTATION-COMMANDS-001

- Complemento append-only de comandos exatos para
  `DOCUMENTATION-FAIL-CLOSED-001`; cwd comum: root do repositorio.
- Syntax, exit `0`: `env PYTHONDONTWRITEBYTECODE=1 python3 -c
  'from pathlib import Path;
  path=Path("docs/planificacao/scripts/auditar_planificacao.py");
  compile(path.read_text(encoding="utf-8"),str(path),"exec");
  print("syntax_ok")'`.
- Resumo do gate, wrapper exit `0` e validator interno exit `1`: `env
  PYTHONDONTWRITEBYTECODE=1 python3 -c
  'import json,subprocess,collections; p=subprocess.run(["bash",
  "scripts/validate-planificacao.sh"],capture_output=True,text=True,
  env={**__import__("os").environ,"PYTHONDONTWRITEBYTECODE":"1"});
  d=json.loads(p.stdout); vp=d["validation_policy"];
  print("validator_exit",p.returncode); print("blockers",
  len(vp["unwaived_blockers"])); print("advisories",
  len(vp["unwaived_advisories"])); print("conflicts",
  len(vp["conflict_marker_issues"])); print("categories",
  dict(collections.Counter(x["category"] for x in
  vp["unwaived_blockers"]))); print("status",
  json.dumps(d["status"],sort_keys=True))'`.
- Scan: `if rg -n '^(<<<<<<<|=======|>>>>>>>)' docs -g '*.md' -g '*.json'
  -g '*.txt' -g '*.yaml' -g '*.yml'; then exit 1; else echo
  conflict_marker_scan_ok; fi`; `rg` encontrou zero marcadores (exit `1`) e o
  wrapper terminou exit `0`.
- Mutacao fail-closed, exit `0`: `env PYTHONDONTWRITEBYTECODE=1 python3 -c
  'import importlib.util,tempfile; from pathlib import Path;
  p=Path("docs/planificacao/scripts/auditar_planificacao.py");
  s=importlib.util.spec_from_file_location("audit",p);
  m=importlib.util.module_from_spec(s); s.loader.exec_module(m);
  root=Path(tempfile.mkdtemp(prefix="opsa-audit-failclosed-"));
  (root/"docs").mkdir();
  (root/"docs"/"broken.md").write_text("<<<<<<< ours\ntexto\n=======\noutro\n>>>>>>> theirs\n",encoding="utf-8");
  issues=m.scan_conflict_markers(root); assert len(issues)==1 and
  issues[0]["waivable"] is False;
  print("fail_closed_conflict_mutation_ok",issues[0]["issue_id"])'`.

### 2026-07-10T00:46:50+01:00 - UPLOAD-NAME-HARDENING-001

- Findings: `OPSA-E2E-P1-011` e `OPSA-E2E-P2-007`.
- Nomes multipart passam a remover de forma uniforme caminhos POSIX e Windows
  antes de validar extensao, persistir metadata ou construir o nome de download.
  O browser nunca consegue gravar `C:\\fakepath` ou segmentos de traversal.
- Hashes anteriores:
  - `uploadPolicy.js`: `ce18e30fb6de27b6712e38973da1ddc88fe7b0c2aca3db1c7c3a1604d01e56c2`
  - `journalAttachmentStorage.js`: `04d0d382880d8c14f8f94d885d42012a0cbcba4a62be2ed61a20432acf9cb4a3`
  - `upload-policy.test.js`: `a8b61c51c083ce42d7ef40b81ec60185a43668c6e123f5dac7bbc6a03901862c`.
- Comando: `node --check src/lib/uploadPolicy.js
  src/modules/accounting/journalAttachmentStorage.js
  tests/unit/upload-policy.test.js && node --test tests/unit/upload-policy.test.js
  tests/unit/mf2-services.test.js`, em `real_dev/api`.
- Resultado: exit `0`, `22/22`, `0` falhas/skips.
- Hashes posteriores:
  - `uploadPolicy.js`: `1c47f9ea782ebf792081a8218832de8258cdbf9efeb81a07f80ed5d2dfac1852`
  - `journalAttachmentStorage.js`: `b395132f2a19ecfff9ecdc3dcea65edebe5874ea2f8d1da70083f4fbd3b5cfaf`
  - `upload-policy.test.js`: `6f4a6a9f4c86da069ae72a30c5aad728e9a17133f26cc84b95113efce6eef779`.
- Lockfiles sem alteracao: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:49:39+01:00 - MASTER-DATA-ATOMIC-AUDIT-001

- Finding: fecho de implementacao de `OPSA-E2E-P2-013`.
- Criacao/edicao/desativacao de clientes, fornecedores e artigos, bem como
  criacao de armazens/localizacoes, passaram a executar mutacao e `AuditLog` na
  mesma transacao. Controllers transmitem `req.user.id`; queries mutaveis
  preservam `companyId`.
- Logs contêm apenas `changedFields`, sem NIF, email, nome ou payload. Colisoes
  `P2002` concorrentes sao mapeadas para `409` de dominio.
- Hashes `antes -> depois`:
  - `customerService.js`: `487ac4e786bbd0ed7378cd216d6e191963037a3657a5a40cb00ce84da517b00a` -> `bb7b55b0d01badbe8058319c9efa94bfa0ccc4902c4de8d1797174bae9563219`
  - `customerController.js`: `02e847feb6906a1aaaeda6831e70373137cc870816f07bd961fbfa42db9355ff` -> `51630d6760dcbfb5446fb4f768a07a9b1b675853e87a9716fbca5204acf5dff1`
  - `supplierService.js`: `ca3411019f3bd96e02df94a4cab1418647adadc4f58e287d7ee8cc5e0981e1ac` -> `5853cea0ba081401e26a3c6cf0857bd913cd363989dd025745a24ea667308c56`
  - `supplierController.js`: `8c82e3c86df2cf233216c967679f07b199945a1c028033c03c6ec5239434f558` -> `b798e877ca7bb43f03cabe5f69db06a4bc0ccdbc549bc36cf01339fda341dca9`
  - `itemService.js`: `95a84ef43406d8f42e88cb1a1cc9322b3bc3298d071423d4e8981b2fed058d94` -> `07949d548affa042d7459196c80670c447e532f7d13ad53d8b12e0ab1b07bbe6`
  - `itemController.js`: `f741a6138fd53d2a810a25f7f40220c0dc68c9da5be2595d2c09635773f69e60` -> `c7b4e6f8a8c009f3d0e22b63ff4acb4cfefb9bdd51522a1d49b09333e5527d13`
  - `warehouseService.js`: `995b036255f519c171e30749f5a72589c192e48d0e77721f0af0210011867acd` -> `b4be91629d95c74b2d25df6a88958a521f5f9b8cced7a245c4f84e7649baa472`
  - `warehouseController.js`: `bdbf4f08bc677f72f4d01fccdd58b1652887f6f4d6d8dccab481eb2fffa2f4e1` -> `aa0bb6fea5fc2d195b6a3b441ce72a660f87339d5ceac130d1fc14072b08590a`
  - `master-data-atomicity.test.js`: `N/A` -> `b38f4721be573261fb3af4319e5fef33f2388cb745be9e71d4649b8ad7699034`.
- Comandos finais em `real_dev/api`:
  - `node --check tests/unit/master-data-atomicity.test.js && node --test
    tests/unit/master-data-atomicity.test.js`: exit `0`, `11/11`;
  - `npm run syntax:check`: exit `0`;
  - `node --test tests/contracts/mf0-contracts.test.js`: exit `0`, `6/6`;
  - `npm run test:unit` fora do sandbox: exit `0`, `192/192`, zero skips.
- Uma suite composta anterior no sandbox teve `189` PASS e `3` `listen EPERM`;
  nao foi contada. O principal voltou a executar `npm run test:unit` no estado
  consolidado: exit `0`, `192/192`, zero falhas/skips.
- `P2-013` fica `IMPLEMENTADO`, nao `FECHADO`, ate reauditoria fresca e prova
  PostgreSQL das transacoes por `ENV-DB-001`.

### 2026-07-10T00:52:56+01:00 - MF8-DEFECT-GATE-REOPEN-001

- Finding: `OPSA-E2E-P1-013`, reaberto antes da correcao.
- A revalidacao do principal encontrou um falso verde residual: o validador
  documental reconhecia honestamente `BLOQUEADO_AMBIENTE`, mas o comando de
  gate terminava com exit `0`. Isto contradiz o contrato da Fase 5, segundo o
  qual blockers ativos devem fazer falhar `mf8:defect-report`.
- Comando: `npm run mf8:defect-report`, em `real_dev/api`.
- Resultado observado antes da correcao: exit `0`, com
  `BK-MF8-18 validado: BLOQUEADO_AMBIENTE (npm --prefix real_dev/api run
  test:integration)`.
- Hash anterior de `scripts/check-mf8-defect-report.mjs`:
  `156a8eb065f8354870ab2a8ba0efc84774f92a236c2bcea2baee527c86e0f864`.
- Lockfiles sem alteracao no momento da reabertura: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:54:03+01:00 - MF8-DEFECT-GATE-FIX-001

- Finding: `OPSA-E2E-P1-013`, novamente `IMPLEMENTADO`; continua a precisar de
  reauditoria fresca para poder fechar.
- O validador estrutural e o release gate foram separados: uma evidence
  `BLOQUEADO_AMBIENTE` continua a ser reconhecida como evidence honesta, mas o
  CLI transforma-a obrigatoriamente em exit `1`. Erros do validador sao
  apresentados sem stack trace e tambem terminam fail-closed.
- Hashes `antes -> depois`:
  - `scripts/check-mf8-defect-report.mjs`:
    `156a8eb065f8354870ab2a8ba0efc84774f92a236c2bcea2baee527c86e0f864`
    -> `4b709eef0005ce258a340f4639f8b547dfc4ac335128413090329732c35d7a8f`;
  - `tests/unit/mf8-defect-report-gate.test.js`: `N/A` ->
    `60b63ae04f3da59ae094c9127cae4f23ad0b4e308c7093594e903366545d519f`.
- Comando: `node --check scripts/check-mf8-defect-report.mjs && node --check
  tests/unit/mf8-defect-report-gate.test.js && node --test
  tests/unit/mf8-defect-report-gate.test.js`, em `real_dev/api`.
- Resultado: exit `0`, `3/3`, zero falhas/skips.
- Comando negativo: `npm run mf8:defect-report`, em `real_dev/api`.
- Resultado negativo esperado: exit `1`, com
  `MF8_DEFECT_REPORT_BLOCKED`; o blocker deixou de produzir falso verde.
- Lockfiles sem alteracao: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T00:59:56+01:00 - BACKEND-REAUDIT-REOPEN-001

- Auditor: subagente independente, em leitura, sem confiar apenas nos testes
  introduzidos durante a correcao.
- `OPSA-E2E-P1-003` permanece `EM_CORRECAO`: `xmlbuilder2` e `iconv-lite` nao
  alimentam um gerador SAF-T; o snapshot nao recolhe master files, tax table nem
  linhas contabilisticas; `startServer` injeta `null` como pipeline por omissao;
  os documentos reais nao recebem ATCUD/hash/hash control. O comportamento e
  fail-closed, mas nao e uma implementacao conforme nem uma prova legal.
- `OPSA-E2E-P1-004` foi `REABERTO`: a materializacao de retention holds nao
  cobria runs SAF-T/IVA e logs de auditoria criados depois do fecho.
- `OPSA-E2E-P1-008` foi `REABERTO`: `saveInventoryCountLines` e
  `postInventoryCount` ainda permitiam concorrencia sobre a mesma contagem.
- `OPSA-E2E-P2-011` continua `EM_CORRECAO`: open items e reports contabilisticos
  ainda devolviam listagens sem cursor.
- `OPSA-E2E-P2-013` foi `REABERTO`: lifecycle de subscricoes ainda aceitava
  last-writer-wins e havia operacoes compliance sem auditoria/atomicidade.
- Estado global mantido em `NO_GO`. As correcoes independentes foram atribuídas
  antes de voltar a marcar qualquer finding como `IMPLEMENTADO`.

### 2026-07-10T01:00:20+01:00 - DOCS-REAUDIT-REOPEN-001

- Auditor: subagente independente, leitura fresca.
- O comportamento fail-closed de `mf8:defect-report` foi confirmado: exit `1`
  com `MF8_DEFECT_REPORT_BLOCKED`.
- `validate-planificacao.sh` foi confirmado com exit `1`, zero conflitos, tres
  blockers, zero advisories e zero waivers.
- `OPSA-E2E-P1-013` foi `REABERTO` porque duas evidences ainda publicavam
  contagens antigas/contraditorias (`122`, `4`, `22/23/3/21`, `361`) face ao
  estado fresco (`195`, `133`, integration `6` com `2/4`, inventario
  `36/25/5/24`, zero advisories). Permaneciam tambem paths Windows/`apps`
  indevidos e placeholders em BKs MF8.
- `OPSA-E2E-P2-014` continua `EM_CORRECAO`: o gate académico ainda nao lia o
  estado dos P0/P1 do report canónico apesar de o runbook o prometer.
- As correcoes foram atribuídas sem alterar, apagar ou converter os tres
  blockers ambientais em PASS.

### 2026-07-10T01:04:11+01:00 - DOCS-GATES-CORRECTION-002

- Findings: `OPSA-E2E-P1-013` volta a `IMPLEMENTADO`; `OPSA-E2E-P2-014`
  passa a `BLOQUEADO_AMBIENTE` porque o código do gate ficou implementado, mas
  a toolchain e o gate integral ainda nao foram demonstrados.
- Um parser dedicado do report canónico passou a rejeitar, fail-closed, todos
  os P0/P1 cujo estado seja diferente de `FECHADO`. O CLI foi integrado no
  início lógico do gate e tem teste unitário por estado/malformed report.
- O syntax gate passou a cobrir `.js` e `.mjs`; o runbook foi sincronizado com
  este precheck.
- Evidence MF8 foi atualizada sem eliminar blockers: `201/201` unitários,
  `133/133` contratos, integração `6` total (`2` pass, `4` fail, `0` skip),
  inventário `38/25/5/26/14`. Paths Windows/`apps` indevidos e placeholders
  encontrados na reauditoria passaram a zero.
- Comandos independentes e resultados:
  - `npm run test:unit`: exit `0`, `201/201`;
  - `npm run test:contracts`: exit `0`, `133/133`;
  - `npm run test:integration`: exit `1`, `2` pass/`4` fail/`0` skip;
  - testes focados de report/defect gate: exit `0`, `9/9`;
  - `npm run gate:academic:report`: exit `1`, listando os P0/P1 ainda nao
    `FECHADO`;
  - `npm run mf8:defect-report`: exit `1`, blocker explícito;
  - `bash scripts/validate-planificacao.sh`: exit `1`, `0` conflitos, `3`
    blockers, `0` advisories e `0` waivers;
  - `npm run gate:academic`: exit `1`, Node `24.11.1` abaixo de `24.17`;
  - `git diff --check`: exit `0`.
- Hashes finais:
  - `academic-report-gate.mjs`: `e9935535faf1b48a61af54a7b58c6d0130e550f2ccd63a56606499270e493686`;
  - `check-academic-report-state.mjs`: `37ac3ee4f91c301fdb35c0cd610dd71ef4843b3478c568f7ca4b500ed916c202`;
  - `run-academic-release-gate.mjs`: `e34d27792299642923cc05ae5751f3e78c6b01d6491bdc4459a9357573214730`;
  - `academic-report-gate.test.js`: `915fc3ce6e0331f7ad4cce35595472fdac55c165097cf7ea7da8e6a26320523e`;
  - API `package.json`: `301f7a5578b460cf3fd059e655ae549aac221afd2e40791c12ccb210b8b72cfa`;
  - runbook: `8221bcfa66136183ce0db1967733234ce230d2f1e0360ea7b66ed8c61762d1d5`;
  - BK01/BK02/BK03/BK07/BK15: `a24cd65fc5fac5bd63ebc69c8b5b2da93c76a9a27987e50d7f75c1a0df8b95a7`,
    `0c38df6d36a3086b333c356e151987aa6a91088b1011634cef2b5b89e4f14fcc`,
    `713b2c177fca0345549adf799eeb57097f3189014b789ad496d53f139527b634`,
    `3d9bc352008e432bfdf25af647aa145c4b812f4ad2a81a15a589a0320ab158ff`,
    `d3c1892f4f3cc1610e38734b32bf3aa61ca2f613f348521662455f2cfa5a41c8`;
  - TESTES/EXECUCAO/CORRECAO: `b1596d49a49e116e65b453d1249cfeb986d4c12517f7c3a1e18fff92ca7cd5a6`,
    `0e576b7cb1319f8db9b12b673d7cb112e38a5a46487a8c0d8f67a43889c00669`,
    `0e3f7f35053fc02da259f19eed4d75bdbb145db844fa59e30e4f3837f073fada`.
- Os hashes `before` desta segunda unidade foram entregues pelo subagente apenas
  como prefixos de oito caracteres; a evidência nao os expande artificialmente.
  O manifest final integral regista todos os hashes finais. Lockfile API ficou
  inalterado em `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`.

### 2026-07-10T01:04:11+01:00 - SAFT-XSD-OFFICIAL-FINGERPRINT-001

- Finding: evidência parcial de `OPSA-E2E-P1-003`; nao fecha o finding.
- O XSD foi descarregado apenas para `/tmp`, diretamente do URL oficial da AT,
  sem ser incorporado no repositorio. `shasum -a 256` devolveu
  `292c0ab4611e3f5a0cdf2abb4e62d9bd41254dc2e76a1fae4d35a8b132d79350`
  para `104696` bytes e confirmou a declaração Windows-1252.
- Comando de contrato em `real_dev/api`: `node --input-type=module -e
  'import { readFile } from "node:fs/promises"; import {
  assertOfficialSaftSchema } from
  "./src/modules/compliance/saftSchemaContract.js"; const result =
  assertOfficialSaftSchema(await
  readFile("/tmp/opsa-saftpt1.04_01.xsd"));
  console.log(JSON.stringify(result));'`.
- Resultado: exit `0`, versão `1.04_01`, namespace oficial e fingerprint iguais
  ao contrato da aplicação. Continua a faltar o XML integral, reconciliação,
  validação do artefacto e revisão externa.

### 2026-07-10T01:06:18+01:00 - ACADEMIC-REPORT-ALL-FUNCTIONAL-001

- Finding: endurecimento adicional de `OPSA-E2E-P2-014`.
- A revisão do principal detetou que o precheck inicialmente entregue só
  bloqueava P0/P1. O contrato final exige todos os findings funcionais
  `FECHADO`; o parser passou por isso a inventariar e bloquear também P2/P3.
  Apenas `OPSA-E2E-RISK-001=RISCO_ACEITE` permanece admissível.
- Hashes `antes -> depois`:
  - `academic-report-gate.mjs`:
    `e9935535faf1b48a61af54a7b58c6d0130e550f2ccd63a56606499270e493686`
    -> `6d860ef751da9f8a6232de0f932e48cb946aadadc2028151c8e9a706d9cf0b2d`;
  - `check-academic-report-state.mjs`:
    `37ac3ee4f91c301fdb35c0cd610dd71ef4843b3478c568f7ca4b500ed916c202`
    -> `5c44ea7ae271c830f598094decf5c6c48439899c5db2fc08404345bf3df0e426`;
  - `academic-report-gate.test.js`:
    `915fc3ce6e0331f7ad4cce35595472fdac55c165097cf7ea7da8e6a26320523e`
    -> `b4988c0adf59094100986659c5df236d3f353377c639ed12452d6b531feea678`.
- Comando: `node --check scripts/academic-report-gate.mjs && node --check
  scripts/check-academic-report-state.mjs && node --check
  tests/unit/academic-report-gate.test.js && node --test
  tests/unit/academic-report-gate.test.js
  tests/unit/mf8-defect-report-gate.test.js`, em `real_dev/api`.
- Resultado: exit `0`, `9/9`, zero falhas/skips.
- Comando negativo: `npm run gate:academic:report`; exit `1`, enumerando os
  `32` findings funcionais ainda nao fechados sem expor dados sensíveis.
- Lockfiles inalterados: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`.

### 2026-07-10T01:08:00+01:00 - FRONTEND-FINAL-IMPLEMENTATION-001

- Findings preparados para reauditoria: `OPSA-E2E-P1-011`, `P1-012`,
  `P2-001..008` e `P3-001..002`. `P1-003`, `P1-015`, `P2-011` e
  `P2-014` nao foram fechados por esta unidade.
- Implementados AuthProvider deny-by-default com estado de erro/retry,
  onboarding, token de convite/reset em fragment removido da URL, multipart e
  downloads, selects em vez de UUIDs, editores estruturados em vez de JSON,
  reconciliação recuperável, formulários preservados e UI sem dumps técnicos.
- A registry de rotas usa agora componentes lazy e `Suspense`. A matriz
  Playwright é fail-closed para Google Chrome, Edge e Firefox nos viewports
  `375x667`, `768x1024` e `1440x900`, mais uma prova browser isolada de 25
  sessões. Axe integra os cenários críticos.
- Comando: `npm run test:final:prepare`, em `real_dev/web`; exit `0`.
  Contagens: Vitest `18/18`; MF1/MF2/MF3/MF5/MF7/MF8, typecheck e builds lazy
  passaram sem skip declarado.
- `npm audit --omit=dev --audit-level=moderate`: exit `0`, zero vulnerabilidades.
- `npm ls --depth=0`: exit `0`, sem extraneous depois de `npm prune --offline`.
  Uma tentativa normal de prune ficou sem output e foi interrompida com exit
  `130`; não foi contada como PASS.
- `npm run test:e2e`: exit `1` esperado e fail-closed com
  `E2E_BROWSER_MISSING: Google Chrome, Firefox, Microsoft Edge`. Nenhum browser
  foi descarregado ou omitido silenciosamente; permanece `ENV-BROWSERS-001`.
- Hash composto fornecido pelo subagente para 19 ficheiros da unidade:
  `a6808a12bc4b4a139e2c2f7c17c9278ec76bcf8b9967eb6984c47a34168b3e2b`.
  O manifest final integral expande todos os ficheiros web alterados.
- Hash do lockfile web: `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`
  (antes desta unidade:
  `dc365183d7f33811189920e928bf3c0407d732959721dfc2b3170795bf618b87`).
- Hash do lockfile API, sem alteração:
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`.

### 2026-07-10T01:09:00+01:00 - AUTH-PERSISTED-E2E-GATE-001

- Findings: `OPSA-E2E-P1-001` e `OPSA-E2E-P1-002` passam a
  `IMPLEMENTADO`, nunca `FECHADO`; `OPSA-E2E-P1-015` permanece
  `BLOQUEADO_AMBIENTE`.
- Novo teste HTTP fail-closed com `createApp`/Supertest, PostgreSQL/Redis/SMTP
  reais e migrations cobre: registo A, onboarding, convite cifrado, worker SMTP,
  registo B, preview/aceitação, troca de empresa, segunda sessão, recuperação,
  segundo email, reset, revogação de sessões e login apenas com a nova password.
- Tokens, envelopes, cookies e emails completos ficam apenas em memória e nunca
  são impressos. O cleanup é limitado por prefixo aleatório e as URLs de DB/Redis
  são recusadas se não forem remotas/dedicadas a teste.
- Ficheiro novo:
  `real_dev/api/tests/integration/auth-onboarding-email-persistence.test.js`;
  hash `e8a8d34a290c58be682a299ae1f6cbb32ed05f6e957f030a1619d40daf99f13e`
  (`before`: `N/A`).
- Comandos em `real_dev/api`:
  - `npm run syntax:check`: exit `0`;
  - `node --test tests/integration/auth-onboarding-email-persistence.test.js`:
    exit `1` esperado, `1` teste/`0` pass/`1` fail/`0` skip, listando apenas os
    nomes das 12 variáveis ausentes;
  - `npm run test:integration`: exit `1` esperado, `7` testes/`2` pass/`5`
    fail/`0` skip;
  - `npm run test:unit`: exit `0`, `201/201`;
  - `npm run test:contracts`: exit `0`, `133/133`.
- A ausência de runtime remoto não foi transformada em PASS; reexecutar quando
  `ENV-DB-001`, `ENV-REDIS-001` e `ENV-SMTP-001` forem resolvidos.
- Lockfiles no momento da unidade: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.

### 2026-07-10T01:15:45+01:00 - FRONTEND-INDEPENDENT-REAUDIT-001

- Auditor: agente principal, nova execução depois da entrega frontend.
- `OPSA-E2E-P1-011`, `P1-012`, `P2-001..008` e `P3-001..002` passam de
  `PRONTO_REAUDITORIA` a `IMPLEMENTADO`, nunca `FECHADO`, porque a prova
  multi-browser continua bloqueada.
- `npm run test:final:prepare`, em `real_dev/web`: exit `0`; `7` ficheiros
  Vitest, `18/18`; MF1/MF2/MF3/MF5/MF7/MF8, typecheck e dois builds passaram.
  O build confirma chunks lazy próprios de MF1, MF2, MF3, MF4, subscrições e
  reconciliação.
- `npm audit --omit=dev --audit-level=moderate`: exit `0`, zero
  vulnerabilidades. `npm ls --depth=0`: exit `0`, sem extraneous.
- `npm run test:e2e`: exit `1` esperado em menos de um segundo, listando Google
  Chrome, Firefox e Microsoft Edge ausentes. Não houve listener, download ou
  skip; `ENV-BROWSERS-001` permanece.
- Scan de production sources por Base64, labels ID, `<pre>` e `JsonResult`:
  zero ocorrências. O fixture unitário que verifica redaction de
  `contentBase64` foi corretamente excluído deste scan de UI de produção.
- O cenário axe foi reforçado para correr tanto na rota pública de auth como
  num deep link autenticado após reload, em cada projeto/viewpoint configurado.
  `npm run typecheck` após a alteração: exit `0`.
- Hashes finais principais:
  - web lockfile: `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`;
  - `App.tsx`: `0e3ae44d070d2c747c509a5c1661fd9a5e5bce4bc48319259bc624bd02a98b7c`;
  - `apiClient.ts`: `a82d17728e123194c6aba09ea4f6a3e10f18318f127f72c9b1ddd5711161e777`;
  - `mf1Pages.tsx`: `3980c0d38704da1ee575ba7a44b29ddab4ae8c3ea5f1f90ee507f843f45b6722`;
  - `mf2Pages.tsx`: `e84a396389d678b3dacb6ca0f79551fb25149f140020f9ed1512b7afb538e2d4`;
  - `mf3Pages.tsx`: `d549e94d098c354abc47e2e9ca0f8865c380a16f4009891f6f172c249f03c5d7`;
  - `mf4Pages.tsx`: `09ebfe8da635b20e1b92fcdf67735aff75da0c06845befb282774e6005c6e191`;
  - `playwright.config.ts`: `57b02cd6f0a6d4282396c540c20b9970020416bd92b32ff2865d14b82eaf9416`;
  - `App.msw.test.tsx`: `730a943e6f6d96380e585aff2b55f4cf1f3686bd730331fc3c2190965c051faf`;
  - `e2e/app.spec.ts`: `c7aa42999914d09ba6defb5dc0a6cffede4501984168390cd63983d8da790d88`.
- O hash `before` do último ajuste axe não foi capturado antes do patch; o
  manifest final integral substitui qualquer tentativa de o inventar.

### 2026-07-10T01:23:30+01:00 - BACKEND-REAUDIT-NEW-FINDINGS-001

- Auditor: subagente independente depois das correcoes backend.
- Novos IDs criados antes da correção, sem os converter em riscos aceites:
  - `OPSA-E2E-P1-016`: bcrypt ignora bytes para além do limite de 72, mas os
    validadores nao impunham teto UTF-8 consistente;
  - `OPSA-E2E-P1-017`: bundle/manifesto local de backup podia permanecer em
    claro após execução e o bucket de backup nao era obrigado a ser distinto;
  - `OPSA-E2E-P2-015`: readiness verificava conectividade sem provar as
    permissões operacionais mínimas de PostgreSQL, Redis e S3;
  - `OPSA-E2E-P2-016`: requests abortados podiam não emitir o log terminal por
    apenas se observar `finish`;
  - `OPSA-E2E-P2-017`: imports no limite faziam milhares de writes sequenciais
    dentro da transação.
- Runs operacionais, KPI e cashflow sem auditoria transacional permanecem no
  finding existente `OPSA-E2E-P2-013`; nao recebem um ID duplicado.
- A entrega automática contínua de notificações depende de trigger/scheduler.
  A ausência deliberada de scheduler 24/7 já consta das decisões aceites do
  scope académico; o fluxo HTTP/outbox continua sujeito à prova SMTP de
  `OPSA-E2E-P1-002` e não foi convertido em novo `RISCO_ACEITE`.
- Estado global: `NO_GO`; as cinco correções foram distribuídas em unidades
  independentes e nenhum novo finding foi marcado `IMPLEMENTADO` nesta entrada.

### 2026-07-10T01:26:16+01:00 - BROWSER-INDEPENDENT-REAUDIT-001

- Findings revalidados parcialmente: `OPSA-E2E-P2-001`, `P2-003..006` e
  `P3-001`; permanecem `IMPLEMENTADO`, não `FECHADO`, por
  `ENV-BROWSERS-001` e ausência da API runtime.
- O frontend foi arrancado temporariamente em `127.0.0.1:4173` e inspecionado
  no Browser embebido. O servidor foi encerrado no fim. Os requests `/api`
  devolveram proxy `ECONNREFUSED` porque a API/DB não estavam em execução; a UI
  tratou-os com estado de erro/retry e sem erros de consola.
- Provas de layout no browser:
  - `375x667`: `scrollWidth=375`, sem overflow, conteúdo a `0px`, drawer fechado
    (`aria-expanded=false`) e formulário de reset a `80px` do topo;
  - `768x1024`: `scrollWidth=768`, sem overflow e drawer fechado;
  - `1440x900`: `scrollWidth=1440`, sem overflow, sidebar de `290px` e toggle
    móvel oculto.
- O drawer abriu com `aria-expanded=true` e transform visível. Links de convite
  e reset removeram o fragmento da barra; o formulário de reset manteve os dois
  valores (comprimento `19`) após erro HTTP.
- A reauditoria encontrou um defeito novo dentro dos findings existentes: abrir
  um segundo fragmento na mesma rota já montada podia deixar o novo token no
  histórico. `usePrivateFragmentToken` passou a consumir `hashchange` e
  `popstate`, rodar o token apenas em memória e limpar cada entrada com
  `replaceState`.
- Regressão MSW: o token inicial é substituído por um segundo token no mesmo
  componente; o URL volta a hash vazio e apenas o token rodado segue no POST.
  Browser reexecutado confirmou URL sem hash após rotação, Back e Forward.
- O E2E axe passou a verificar auth e deep link autenticado; adicionou também
  prova de teclado: primeiro Tab foca o skip link e Enter foca o `main`.
- Comandos: `npm run test:unit` exit `0`, `18/18`; `npm run typecheck` exit `0`.
  A matriz Playwright real continua sem execução por browsers ausentes.
- Hashes `antes -> depois`:
  - `App.tsx`: `0e3ae44d070d2c747c509a5c1661fd9a5e5bce4bc48319259bc624bd02a98b7c`
    -> `66cfa1c8807aadb02ddb8559320d8ed29e9309757b6113aae7fb6103a86d78e2`;
  - `App.msw.test.tsx`:
    `730a943e6f6d96380e585aff2b55f4cf1f3686bd730331fc3c2190965c051faf`
    -> `51eea9e981d527c0feb3549920a110afa5ecfea238edb81ee162d1f7ac20232e`;
  - `e2e/app.spec.ts`: hash intermédio antes do teste de teclado
    `c7aa42999914d09ba6defb5dc0a6cffede4501984168390cd63983d8da790d88`
    -> `b1b05e92ef49e24c3e7683e80d4f7af02d22938e40ab6b91e8ee7f66841e7e6b`.
- Lockfiles inalterados: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.

### 2026-07-10T01:27:07+01:00 - ACADEMIC-REPORT-INVENTORY-EXPANSION-001

- Finding: `OPSA-E2E-P2-014`.
- O gate canónico foi atualizado na mesma unidade lógica dos cinco novos IDs;
  o inventário obrigatório passou de `32` para `37` findings funcionais. Apagar
  uma das novas linhas passa a ser erro estrutural, não uma forma de contornar o
  gate.
- Hashes `antes -> depois`:
  - `academic-report-gate.mjs`:
    `6d860ef751da9f8a6232de0f932e48cb946aadadc2028151c8e9a706d9cf0b2d`
    -> `4217785585eacbc49cb06d7ed0c2aab6b629c58300585abb01c6fef8d6d4559e`;
  - `academic-report-gate.test.js`:
    `b4988c0adf59094100986659c5df236d3f353377c639ed12452d6b531feea678`
    -> `6eecab28589b2a54c6b4c0d49007184d9c21c5a215ef651be6a027a1d51c8c33`.
- Comando focado: `node --check scripts/academic-report-gate.mjs && node
  --check tests/unit/academic-report-gate.test.js && node --test
  tests/unit/academic-report-gate.test.js`, em `real_dev/api`; exit `0`, `6/6`.
- `npm run gate:academic:report`: exit `1` esperado, enumerando os `37` IDs e
  incluindo os cinco novos em `EM_CORRECAO`.
- Lockfiles inalterados: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.

### 2026-07-10T01:32:39+01:00 - STOCK-FIFO-LOCKED-REAUDIT-001

- Finding: `OPSA-E2E-P1-008`, de `REABERTO` para `IMPLEMENTADO`; só uma
  reauditoria runtime PostgreSQL pode promover o estado.
- A publicação de uma contagem deixou de calcular o ajuste contra
  `expectedQuantity`, que é apenas o snapshot do rascunho. Adquire agora o
  mesmo advisory lock usado pelos movimentos, bloqueia `StockBalance` com
  `SELECT ... FOR UPDATE` e calcula `countedQuantity - currentQuantity` dentro
  da transação serializável.
- Todos os movimentos de stock bloqueiam também a linha `StockBalance` antes
  do read-modify-write. As camadas `StockCostLayer` a consumir são selecionadas
  em ordem estável e bloqueadas com `FOR UPDATE`; previews FIFO permanecem
  read-only e não adquirem estes locks de linha.
- A prova persistida foi reforçada: depois de criar a contagem com snapshot 5,
  introduz uma entrada posterior de 2 e exige que a publicação concorrente
  converta o saldo atual 7 na quantidade contada 4, com um único ajuste e um
  único audit log. O teste foi escrito mas continua sujeito a
  `ENV-DB-001`; não foi reportado como PASS.
- Hashes `antes -> depois`:
  - `inventoryCountService.js`:
    `aba6f1246a85c8ad03df15440b3d17265312b3e039f76d8cdc14dacec3199d3a`
    -> `f481e9dca124dc36695cd5e83ff8b0763ad18f3a6db09985520c0849d71a886c`;
  - `fifoCostService.js`:
    `d1cc6379ec958f570583d7a268b33d2800c3b8eabea22b0c9ec0754baccc3994`
    -> `d28c32826efc2e326ea07a07cca86771447e7fd61bc0bbdae7d197b5b9a21433`;
  - `stockMovementService.js`:
    `f62d6890dc0ea6799b56297f89fb949643733bff83f87aca464e0bc969eb3771`
    -> `393f525ab1dae255d2f1e15628af78267fbe93eb22733db4115d1356a3e131c1`;
  - `mf2-services.test.js`:
    `1d23da1718dde2472e21ae245bd6ef0d5cbe9bf8e699697f57b5256fbaae3925`
    -> `a7965b6b1f95686c36323c3439734a2e00cec58c77c5c898e8e07b1dfa031698`;
  - `postgres-locks.test.js`:
    `ac94ebcf525f89e23e0eaa3695c3fd861165deaa2557f908ae192da8c4b1705a`
    -> `5a47f186ee798ba68fa6057ff4b54af338afeefc27604a10a5c8982d36778f8b`;
  - `e2e-concurrency-persistence.test.js`:
    `1a44afd8fbcb296fc0d22f5222e5b2e9890eea1737d1a73d7aac0b01ff8f4d95`
    -> `38eaad1b295900983ad99b6928737d3059b02373952af5c87110b0c6b3893574`.
- Comandos, em `real_dev/api`:
  - `node --test tests/unit/mf2-services.test.js`: exit `0`, `18/18`, zero
    skip;
  - `node --test tests/unit/mf2-services.test.js tests/unit/postgres-locks.test.js`:
    exit `0`, `20/20`, zero skip;
  - `node --check src/modules/inventory/inventoryCountService.js`, `node
    --check src/modules/inventory/fifoCostService.js` e `node --check
    src/modules/inventory/stockMovementService.js`: exit `0`.
- Lockfiles inalterados: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.

### 2026-07-10T01:39:44+01:00 - PASSWORD-OBSERVABILITY-REAUDIT-001

- `OPSA-E2E-P1-016` foi corrigido e uma reauditoria read-only independente
  marcou-o `FECHADO`: registo, reset e o boundary `hashPassword` rejeitam mais
  de 72 bytes UTF-8; login preserva compatibilidade sem expor um oracle de
  política. A prova bcrypt real confirmou hash/verify a 72 bytes e rejeição a
  73 bytes.
- Implementação inicial de `OPSA-E2E-P2-016`: `finish`, `close`, `aborted` e o
  error boundary convergem num único logger terminal, removem listeners e não
  guardam URL, query, body, mensagem de erro ou credenciais.
- A reauditoria independente reabriu corretamente `P2-016` ao provar dois
  bypasses: o enforcement HTTPS terminava antes da observabilidade e nomes de
  erro alfanuméricos arbitrários podiam entrar em `errorType`.
- Correção adicional: request observability passou a ser o primeiro middleware
  da composição HTTP, antes de HTTPS/HSTS; `errorType` usa agora uma allowlist
  fixa, mapeia erros Prisma para `DatabaseError` e reduz todo o resto a
  `UnknownError`. O estado fica `PRONTO_REAUDITORIA` até uma nova passagem
  independente sobre esta versão.
- Testes focados da primeira implementação: `node --test
  tests/unit/mf0-validators.test.js tests/unit/request-observability.test.js
  tests/contracts/mf0-contracts.test.js
  tests/contracts/request-observability.contract.test.js`, exit `0`, `32/32`,
  zero skips. `npm run test:mf6:bcrypt`, exit `0`.
- Depois da correção adicional, `node --test
  tests/unit/request-observability.test.js
  tests/contracts/request-observability.contract.test.js` falhou no sandbox
  com `listen EPERM` (`11/12`); a mesma linha reexecutada fora do sandbox, sem
  alterar código ou dependências, terminou exit `0`, `12/12`, zero skips. O
  teste prova o 403 HTTPS precoce com `X-Request-ID`, um único terminal e route
  template `unmatched`.
- Hashes da implementação inicial `antes -> depois`:
  - `authValidators.js`: `23c8def26aebcaba22e7b8ba54c0ea0218c012270f78471bf16f499f231315b6`
    -> `7671773558f7026a95b2c73113bb8aebb1fea9f620e7e00fa737eda3b83e68b9`;
  - `passwordResetValidators.js`:
    `9e3ae1cca8a674e501b75285d4546c45c5b9e2acbb48dfc9737c068ea6e39d6f`
    -> `895a4fa35eeb9f9bfd9b00062d48e5bd76011d796835e441d45745f8e2baa581`;
  - `password.js`: `c62c2634207844e7b415b1a4946496f292df7cbb8583801aa9ff8dfca2d51760`
    -> `2ee36b6ba462a62c641c3dfd73f966687c6027e679d3cb3ed3cdc42052801dff`;
  - `passwordPolicy.js`: novo ->
    `c701fdfb1fb231b15e05d31a588fcf238da1e2ab9e93508f2e51175fc146fc94`.
- Hashes da observabilidade inicial e da correção pós-reauditoria:
  - `server.js`: `5caca82dcab7253f0023746df8d4b74927f53d63676d67c6295fa4dab96c4139`
    -> `fabf4d884fb88d953f4b8a72abf8fcff05ebd82a7daa886c21e530f64fc79d5b`
    -> `e6bebd271795749d7ca00ad713ec7f32559034375332b1d28d8de2eba2757343`;
  - `requestObservability.js`:
    `58b8fe30700ae88ef26bbf75c6186bc247e732115fc7929d6bf0d3720857e0fb`
    -> `594dc6547041da6f848ce5868a4c8d13c7b64c9e63af850c4f0571177bb0a7c1`
    -> `751d1f775cd4cee1f7c689458e69300cfeba1597b26d089b83c36a33fd0cb5b1`;
  - `request-observability.test.js`:
    `ebfae72dcfef675e8dc507975f9a1806b6232604c82cd580fe9f630436775248`
    -> `7861846bdf31a95b648897be63947020e87b45cc44aa35240bce1bba485ddb3b`
    -> `0be8ad4e00e3f02301926219c2e9b7533191aee2fe359f44ddd9bbfe67f21c14`;
  - `request-observability.contract.test.js`: novo
    `2b8563b3bdac3d79b4a6d5431dd8398fcced122b6d19f9799f344616421e8b29`
    -> `939b71c60f7eee6403dbe83237cfef6cfd7ec7d4a190b4902795750b6157443b`.
- Lockfiles inalterados: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.

### 2026-07-10T01:40:49+01:00 - IMPORT-BATCHING-RUN-AUDIT-001

- Findings `OPSA-E2E-P2-017` e residual de `OPSA-E2E-P2-013`, ambos de
  `EM_CORRECAO`/`REABERTO` para `IMPLEMENTADO`. A persistência PostgreSQL
  continua bloqueada e impede `FECHADO`.
- Foi criada uma primitiva de batching: `createMany` em chunks de `250` e
  mapper/upsert com concorrência máxima `25`, ordem estável e propagação de
  erro para rollback da transação exterior.
- Imports de clientes/fornecedores sem chave e linhas de extrato usam bulk;
  chaves naturais usam upsert limitado, deduplicado e last-write-wins. O fluxo
  bancário gera UUIDs antes dos writes, persiste linhas/sugestões em chunks e
  continua apenas a sugerir reconciliação.
- `OperationalReportRun`, `ExecutiveKpiRun` e `CashflowForecastRun` passaram a
  criar run e `AuditLog` minimizado dentro da mesma `$transaction`; falha do
  audit aborta o run. `VatMapRun`, `BusinessImportRun` e `SaftExportRun` já
  tinham esta atomicidade e não foram duplicados.
- Reauditoria principal do código confirmou company scope, ausência de payload
  financeiro no audit e propagação de falhas de base de dados sem criar runs
  enganadores.
- Comando focado reexecutado pelo agente principal: `node --test
  tests/unit/import-batching-run-audit.test.js tests/unit/mf3-services.test.js`,
  em `real_dev/api`; exit `0`, `23/23`, zero skips.
- Consolidação do subagente: `npm run syntax:check` exit `0`; `npm run
  test:unit` exit `0`, `237/237`; `npm run test:contracts` exit `0`, `141/141`.
  `npm run test:integration` exit `1`, `2` pass/`5` fail/zero skips por variáveis
  PostgreSQL/Redis/SMTP ausentes; o cenário persistido MF3 não foi marcado PASS.
- Hashes `antes -> depois`:
  - `batchPersistence.js`: novo ->
    `5fa4318fd754052c405c75565ff51a8674f24b592cf054f929e97ff933c6800e`;
  - `businessImportService.js`:
    `5ca432cc508e88429504fc06d56583f9d2dc875ae32e3f9d3b3ac296713183de`
    -> `de4b424e67277f1e2cda4bed9e2657b9ae757a5926afdc5b45966684553e85f0`;
  - `statementImportService.js`:
    `cc133ab70692b45bae86f8b2f33ed2e41538dc46cd9d35c5b9a6bc0b93c9027c`
    -> `b15241cf1b8edb429affaf7baa79902abdc6bdb2e7714f82379730025c890bad`;
  - `operationalReportService.js`:
    `70b9e3c444823b36f44c55a5a11cf734d9bf7b5a4c7e6cf586cccf97d5b71ad3`
    -> `e8943fa83d95b410edb53b1ba1f410cf09221e265d82f90f9d7653bbb3594bb8`;
  - `executiveKpiService.js`:
    `c85cee175720653851da210b4e63e15e83e3b2207455229d7b68432df9b53975`
    -> `3eeb9e7c4d4674bd31eeb4c0d59ecd4fc3596715f7b4558db21678c3d1cc5b1d`;
  - `cashflowForecastService.js`:
    `b99e7d8ee3ad744c9d4bbb426fd16c6c23a0eb830c23e27c623169748deb7884`
    -> `3076976f2660c24d82f4a83b816ad55807993a1e8597684c170ceb234a68e6f3`;
  - `mf3-services.test.js`:
    `07f504d09f8307f15c28cf9795e4423cf4801befd6133544b18a6bcd0219c42b`
    -> `8b33952088c3337f0767b7dc11de0c1cb3e7c8ed319c52af48a75a07a45bad40`;
  - `import-batching-run-audit.test.js`: novo ->
    `d5c0aea68c0ca8adb2df1dff7ff7f7666808be2737399dc67d99ab1b4cc0287b`;
  - `mf3-persistence.test.js`:
    `c3be6d30253f0d66852e838a1bdd54097e539651d5ac2c45eadd1516ae2b1749`
    -> `aea46c6a2ae353b998263200ef0df109ed4a6d5dc015d8420f709f0843669ca4`.
- Lockfiles inalterados: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.

### 2026-07-10T01:45:02+01:00 - RETENTION-FINAL-MUTATIONS-REAUDIT-002

- Finding `OPSA-E2E-P1-004`, de `REABERTO` para `IMPLEMENTADO`; não
  `FECHADO` porque backfill, transações e concorrência exigem PostgreSQL real.
- A reauditoria principal encontrou dois resíduos que a primeira correção não
  cobria: `Receipt`/`Payment` definitivos não tinham hold próprio e um anexo
  podia ser promovido para storage depois de o lançamento manual estar fechado
  ou protegido.
- `Receipt` e `Payment` entraram no inventário canónico de entidades retidas,
  no materializador do fecho fiscal e nas respetivas mutações. Registo, respetivo
  `AuditLog` e dois holds são agora atómicos e usam o fim do período resolvido
  pelo backend.
- Auditorias de emissão/posting de venda, posting de compra, fecho fiscal,
  criação/revisão de lançamento manual e anexos passam a criar o hold do
  `AuditLog` na mesma transação. O helper sensível mantém a allowlist e a
  minimização de detalhes.
- A promoção de anexo faz um segundo preflight dentro da transação: advisory
  lock fiscal, ownership, hold e período aberto. Em conflito, a metadata não é
  criada e os objetos de quarentena/final são removidos pelo cleanup
  compensatório.
- Comandos, em `real_dev/api`:
  - `node --check` sobre os nove services alterados: exit `0`;
  - primeira execução focada dos quatro ficheiros de teste: exit `1`, `45/49`,
    quatro doubles ainda sem os novos delegates;
  - segunda execução depois de atualizar os doubles: exit `1`, `50/51`, detetou
    corretamente um AuditLog double sem `id`;
  - execução final `node --test tests/unit/retentionPolicy.test.js
    tests/unit/mf1-services.test.js tests/unit/manual-journal-revision.test.js
    tests/unit/mf2-services.test.js`: exit `0`, `51/51`, zero skips.
- Hashes `antes -> depois`:
  - `auditLogService.js`:
    `a3d14011db2e39f82aa9bb2287de3e9702b047dc87aa384d18bfa3d73cdcd356`
    -> `12f5190aa96aff8e4b0ee68e50344d7bdf4a95ebf5d1234ac72b068271551bb2`;
  - `retentionPolicy.js`:
    `7614a2cc822ea32943b7a8e4b469fc6d675a02dbacb34b207b82a8680543342c`
    -> `84604f869a7ceffee2e3f2971abc49ba0487c683e3cbba4ee07882325749c1ee`;
  - `receiptService.js`:
    `28ea30f143898ec6c445290595fa6d65fe115f5f5639278390fc121a6d2ef2f5`
    -> `47b787fefb36be455c8f188d0fa6434338bc5ab9e78830ef34b872e6784f4eb8`;
  - `paymentService.js`:
    `bec6e7985b28b13f38cb34289913d689f30a5ee2319ee914c95b5d7c7b353d5f`
    -> `58ebc84fd8aa0460b37546404d94864cdbe5de9ec441c38ec7490886328c44fb`;
  - `saleDocumentService.js`:
    `9ccb074a9a89bed4bd26abb25cb6023a3c028771a17981d9707d7e748a3d7a06`
    -> `1f129fd1d0ecdae6d68b19642135b596939852a1b950d4adbf5bb4091577f52b`;
  - `salePostingService.js`:
    `53c6e932abe37242e6462834d82bb716d99c20e0c328c3dc010e105d035f9d90`
    -> `9a30424a43e98fb6e23bdfc27ef707e1d35c7a73ad8057509597c49079810369`;
  - `purchasePostingService.js`:
    `1c4f5a728d483b6550013982d592108ae6599bd745ed9ebc2ac343d0e119f2b7`
    -> `1201c0545dca52f8d139935de5ac4768fa04be68427b9c7e6ca77f9739b75613`;
  - `fiscalPeriodService.js`:
    `6c6377affc316f1ec9a1fb0064d930b9cb4452545bee4c42e23bf29ab72e16a7`
    -> `302280458711e6c2b421dfe4fe2c5a8de23eb7760bf745d5d9c8bbce577d91ca`;
  - `manualJournalService.js`:
    `47d70dd0c5083bb958a2d719744d3ddc9fffab10ae79eac7c702bec2d3a4192c`
    -> `4879ce8f79a187936ce1562ee9e46ac50687c6cc305d67d539aff082aa4bb1a6`;
  - `retentionPolicy.test.js`:
    `f21b1437506a7b4ef0dc7b81920c801fe0d0dd902540842d3cbc0f29b11b564a`
    -> `b5f9c26b188ee01898f3e6a19c26cb07cff2138ca7dc43fb0922a8085fceb063`;
  - `mf1-services.test.js`:
    `da1756f9a93ff7dc24c09abf4319a22ea130eb8086d587231ca1392291dfc95a`
    -> `ba8c867a303b3818e64f0f9fd11c93b93da53617f88c9d324b245be324200a5b`;
  - `manual-journal-revision.test.js`:
    `984f1fb20f7f296fac99a4aa480a3135f283a39de53a3e348fbca0030e1d2f4d`
    -> `4e6bcc8659e92b723a3600d2f71ba4f15c9e2f41d6b410c6e7e5407302dba2f8`;
  - `mf2-services.test.js`:
    `a7965b6b1f95686c36323c3439734a2e00cec58c77c5c898e8e07b1dfa031698`
    -> `88293cac8dcb3c2748dfde237c08830f2c803e234d59517a2a466f7720c647a0`.
- Lockfiles inalterados: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.

### 2026-07-10T01:49:24+01:00 - CRITICAL-PAGINATION-REAUDIT-001

- Finding `OPSA-E2E-P2-011`, de `EM_CORRECAO` para `IMPLEMENTADO`; a
  reauditoria PostgreSQL/browser continua pendente e impede `FECHADO`.
- O inventário crítico coberto pelo contrato inclui contas, clientes,
  fornecedores, artigos, vendas, compras, movimentos de stock, lançamentos
  manuais, títulos em aberto, AuditLog, IntegrationLog, balancete e razão.
  Todos usam cursor keyset opaco, company scope, default `50`, máximo `100`,
  query `limit + 1` e envelope `{ items, pageInfo }`.
- Balancete/razão mantêm metadata do relatório, e demonstrações financeiras
  percorrem internamente todas as páginas necessárias em vez de truncarem os
  totais. Aliases transitórios servem apenas consumidores anteriores e apontam
  para os mesmos itens limitados.
- Os consumidores frontend normalizam primeiro `items`; MF2 também reconhece o
  envelope dos relatórios. Não foi alegada prova de navegação multi-browser.
- Comando reexecutado, em `real_dev/api`: `node --test
  tests/unit/cursor-pagination.test.js tests/unit/critical-pagination.test.js
  tests/contracts/mf2-ledger-report-contracts.test.js`; exit `0`, `13/13`, zero
  skips.
- Hashes finais revalidados (os hashes `before` desta correção delegada não
  sobreviveram ao handoff consolidado e não são reconstruídos):
  - `cursorPagination.js`:
    `78b7b2c475b0ff1f58bd39611733e4a0ae5b3b7f46ba28d8477058ecd3a1e5f2`;
  - `salesOpenItemsService.js`:
    `3a67e3861faefe5829e85c33ed80e77f4e1dafb112a4866a8ef9113eee27c896`;
  - `accountingReportService.js`:
    `c6afec84fb67faa75b9759195f88e908e7dfb92766d772c9bb410232a6e7b767`;
  - `financialStatementService.js`:
    `ab6d9f072d9db25d9e398c462737d50e198ccac00ad216cb5da5a26360901c34`;
  - `critical-pagination.test.js`:
    `5e1c1a32e3281e0b7cf732853ef8e7159eaa3208b49b85ccd74d8827130b17f5`;
  - `mf2-ledger-report-contracts.test.js`:
    `7f8d1ca6d28506fbb5bc738754f424fa1f09336e965c3f44202e4f4387166312`;
  - migration `20260710090000_critical_listing_pagination`:
    `65baee940985e6fefdf4b6076c33a03b0223e6f444ef6c3def2c0d65f45eddc5`.
- O manifest final integral será a fonte de hashes finais de todos os services
  paginados, incluindo os que também mudaram em unidades posteriores.

### 2026-07-10T01:56:47+01:00 - INTEGRITY-OPS-INDEPENDENT-REAUDIT-002

- Auditor: subagente read-only independente sobre a versão posterior às
  correções; não alterou código, docs ou report.
- `OPSA-E2E-P2-016` passa de `PRONTO_REAUDITORIA` a `FECHADO`: confirmou a
  ordem observability -> HTTPS -> HSTS, allowlist fechada de `errorType`,
  redaction e logger terminal único. A suite local sem listener passou `8/8` e
  a prova Supertest já executada fora do sandbox pelo principal passou `12/12`.
- `OPSA-E2E-P2-011` é `REABERTO`: os services/rotas backend produzem
  `pageInfo`, mas vários consumidores frontend não enviam cursor nem expõem
  continuação; AuditLog, IntegrationLog, reconciliação e recursos genéricos
  descartam a página seguinte. Um envelope correto no servidor não torna o
  fluxo end-to-end paginado.
- `OPSA-E2E-P2-017` é `REABERTO`: `mapInBatches` limita promises simultâneas,
  mas continua a emitir um statement por chave. A prova do auditor com `5 000`
  ITEMS observou `acceptedRows=5000`, `upsertStatements=5000` e
  `createManyCalls=0`; numa transação Prisma de uma ligação isto não resolve a
  pressão de writes.
- `OPSA-E2E-P2-013` é `REABERTO`: runs operacionais/KPI/cashflow ficaram
  atómicos, mas `generateAiInsights`, `generateAiSuggestions` e
  `generateSmartAlerts` fazem múltiplos upserts fora de transação e sem
  `AuditLog`; `answerAiQuestion` cria `AiQuestionRun` sem audit. Uma falha
  intermédia pode deixar persistência parcial.
- `OPSA-E2E-P1-004` mantém `IMPLEMENTADO`: a análise não encontrou novo bypass
  no código de retenção; a promoção depende da prova PostgreSQL remota.
- Estas regressões usam os mesmos IDs canónicos e não foram convertidas em
  riscos aceites nem em findings duplicados.

### 2026-07-10T02:24:40+01:00 - SAFT-INTERNAL-GENERATOR-002

- Finding `OPSA-E2E-P1-003` mantém `EM_CORRECAO`: existe agora implementação
  interna substancial, mas não existe ainda prova externa nem um pipeline de
  faturação certificada capaz de produzir os dados fiscais definitivos usados
  pelo gerador.
- Foi criado um gerador determinístico SAF-T PT `1.04_01` com `xmlbuilder2`,
  serialização Windows-1252, namespace oficial, Header, GeneralLedgerAccounts,
  clientes, fornecedores, produtos, TaxTable, GeneralLedgerEntries e
  SalesInvoices. Totais globais, lançamentos e documentos são reconciliados
  antes de qualquer validação/storage.
- O artefacto interno é a única versão aceite: o boundary externo recebe cópias
  defensivas, não pode substituir bytes e só pode atestar `READY` se declarar
  XSD 1.1 válido, hash do XSD oficial, hash do artefacto, hash da reconciliação,
  reconciliação externa e revisão contabilística aprovada. A flag continua
  `false` por omissão.
- A migration expand-only `20260710110000_saft_internal_source_fields` adiciona
  campos fiscais nullable a CompanyProfile, Customer, Supplier, Item, VatRate e
  JournalEntry. Não existem defaults nem backfill fiscal inventado; registos
  incompletos falham com `422 SAFT_SOURCE_NOT_READY`.
- Validação do implementador, cwd `real_dev/api`: gerador/service focados
  `19/19` PASS; contrato `11/11` PASS; `npm run syntax:check` PASS; Prisma
  format/validate/generate PASS; XML bem formado em `xmllint`. A suite unitária
  integral posterior do principal passou `257/257` e os contratos `145/145`.
- Identidade do XSD oficial usada: `1.04_01`, namespace
  `urn:OECD:StandardAuditFile-Tax:PT_1.04_01`, SHA-256
  `292c0ab4611e3f5a0cdf2abb4e62d9bd41254dc2e76a1fae4d35a8b132d79350`.
- Hashes finais principais: `saftGenerator.js`
  `315760f7500eea03a036aac79bc84f9878910ea2443462984f12e8250e48b57b`;
  `saftService.js`
  `7e675ba3f2e81ed588e4f692d2bdfd9ec899e2802fee9263f9fccf00be051a59`;
  `saftComplianceChecklist.js`
  `c5428b576ca1f72b88123d45ff8d544e9f0eedf8fdf7f38917fa978e28c260c5`;
  schema Prisma
  `ebaefe051eb2ba65659143e6830c54342f697376a252ce4274522c4bd937d92d`;
  migration nova
  `592f96a81a8233228926295e83a0ed50c5280727c8ffc9d62218b8b248d5eb9a`.
- O subagente recolheu alguns `before` apenas de forma abreviada depois da
  edição. Como `real_dev` é ignorado, esses hashes não são reconstruídos; os
  `after` completos entram no manifesto final. Novos ficheiros tinham baseline
  `ABSENT`.
- Permanecem bloqueantes: XSD 1.1 por motor externo, reconciliação externa,
  revisão contabilística, migration PostgreSQL real, configuração explícita dos
  registos históricos e integração fiscal/certificada que produza número no
  formato legal, ATCUD, hash e HashControl. Nenhum teste local é apresentado
  como conformidade legal.

### 2026-07-10T02:24:40+01:00 - BACKUP-READINESS-BULK-AI-003

- `OPSA-E2E-P1-017`, `OPSA-E2E-P2-015` e `OPSA-E2E-P2-017` passam a
  `PRONTO_REAUDITORIA`; `OPSA-E2E-P2-013` passa a `IMPLEMENTADO` depois de
  reauditoria independente de código. Nenhum passa a `FECHADO` sem runtime
  PostgreSQL/Redis/S3.
- Backup: origem operacional e destino exigem bucket/raiz distintos; S3 exige
  SSE; dump e manifesto transitórios usam permissões privadas e são apagados em
  `finally` mesmo em falha; uploads ambíguos fazem cleanup compensatório. O
  roundtrip deixou de tentar reutilizar o dump local já apagado: descarrega um
  manifesto remoto autenticado por SHA-256, descarrega e verifica o dump,
  executa `pg_restore` numa base descartável, compara todas as tabelas públicas
  e restaura/descarrega todos os objetos por hash. `pg_restore --list` foi
  removido do fluxo.
- Readiness: PostgreSQL usa transação read-only e prova USAGE do schema e
  SELECT/INSERT/UPDATE/DELETE em todas as tabelas funcionais; Redis prova
  PING+SET/GET/DEL com TTL e cleanup; storage prova HEAD bucket e
  PUT/HEAD/GET/DELETE com bytes imprevisíveis e cleanup. O payload público só
  expõe `up/down` e duração.
- Bulk import: clientes/fornecedores/artigos com chave natural usam `INSERT ...
  ON CONFLICT ... DO UPDATE` parametrizado em chunks de 250; campos opcionais
  omitidos preservam o valor anterior e chaves repetidas mantêm last-write-wins.
  A prova com 5 000 artigos observou exatamente 20 statements, não 5 000.
- AI/auditoria: insights, sugestões, pergunta e smart alerts passaram a fazer
  writes e um AuditLog minimizado na mesma `$transaction`. Testes injetam falha
  do audit e falha no segundo upsert; a reauditoria independente observou 12
  writes scoped por `tx`, zero writes equivalentes por `prisma` raiz e `84/84`
  testes focados verdes. `markNotificationRead` continua classificado como
  read-receipt não sensível, não como operação financeira/administrativa.
- Testes do principal, cwd `real_dev/api`: import/MF7 `19/19` PASS; backup,
  object storage e health `23/23` PASS; health/backup com Supertest fora do
  sandbox `28/28` PASS; suite unitária integral fora do sandbox `257/257` PASS;
  contratos integrais `145/145` PASS; zero skips.
- Hashes `before -> after` principais: `businessImportService.js`
  `de4b424e67277f1e2cda4bed9e2657b9ae757a5926afdc5b45966684553e85f0`
  -> `5e9cb878348f070eea588d34f3a1c136c8c66ca33eeb5ce62aa6c86334694fb8`;
  teste batching
  `d5c0aea68c0ca8adb2df1dff7ff7f7666808be2737399dc67d99ab1b4cc0287b`
  -> `3e5d2a17aa77af3998240bb05449ff96ab62f1f5b66b519c51afbb4ae94d1550`;
  `aiService.js`
  `0d1f3eccaae8578ec3108d762d7dc54c7446250f869ee4ddc95fad0a78769ab3`
  -> `fd39673853ced5c2b6ad95492034e24e8cb41e7ca1cedb14306e945f6e8c908f`;
  teste AI novo
  `42e5d10a80f3ab2a003957e679dac29b2e29f044d41a831fb831e0ec2791fd06`.
- Hashes finais ops: `healthService.js`
  `509df7877d485009b5afb7f5f61458c1c09b1baecb5a6f8468137c6fa735db71`;
  `backupBundle.js`
  `119551c1b81a277875d51e29b2b8152bbaf35e22860c749bda20ded62832d798`;
  `objectStorage.js`
  `a5842252d475b11e7c229fa3285778e1c795d03accc27fc5a755d2afe13a8c02`;
  `run-daily-backup.mjs`
  `c8e492b4878fb3ac477f1026b9fa41f217b2d4589c0c14c670b79c982c693dd5`;
  `verify-backup-restore.mjs`
  `05cda3bbc54b335910b04d9d01811c2861927164291b54e27d270aa1e39d52d2`;
  `run-backup-roundtrip.mjs`
  `0b905e2c8478e442a81345fa613bd7f9129fa916e26058cee83d8711464c0841`.
- O subagente de backup foi interrompido antes de entregar todos os hashes
  `before`; não foram inventados. O principal registou o `before` da última
  correção de health (`1e4c2e08dcea84b037dca3aa50c8004d3ed198269c8674cee2e7fa62a68dde48`)
  e os hashes finais integrais ficam no manifesto.

### 2026-07-10T02:24:40+01:00 - CONSOLIDATED-LOCAL-GATES-001

- API, cwd `real_dev/api`: `npm run syntax:check` PASS; `npm run test:unit`
  dentro do sandbox teve `254/257` e três `listen EPERM` Supertest; reexecução
  fora do sandbox terminou exit `0`, `257/257`, zero skips. `npm run
  test:contracts` fora do sandbox terminou exit `0`, `145/145`, zero skips.
- `npm run test:integration` terminou exit `1`, `2/7` PASS e `5/7` FAIL
  fail-closed por ausência de PostgreSQL/Redis/SMTP. Uma primeira execução
  tinha ainda um double MF1 desatualizado (`retentionHold.upsert` ausente); o
  double foi corrigido e o cenário MF1 passou `2/2` antes da reexecução
  integral. Não existe skip.
- `npm run test:mf6` encontrou e corrigiu dois checkers estáticos obsoletos: o
  smoke HTTPS aceitava `X-Forwarded-Proto` falso com `TRUST_PROXY_HOPS=0`, e o
  smoke de audit exigia o helper antigo em vez de
  `recordRetainedSensitiveAudit`. O checker de ambiente passou a fornecer
  Redis prefix/HMAC e `EMAIL_FROM`. Execução final MF6: exit `0`.
- `npm run test:mf7 && npm run test:mf8`: exit `0`; MF7 executou 42 testes mais
  check modular; MF8 executou subscrições, explainability, governance,
  documentação e inventário. O inventário prova existência de camadas, não
  runtime remoto.
- Prisma validate/generate: exit `0`; schema válido. `npm ls --all` API/web:
  exit `0`, sem módulos extraneous (dependências opcionais ausentes não são
  erros). `npm audit --omit=dev --audit-level=moderate` API e web: exit `0`,
  zero vulnerabilidades.
- Toolchain observada: Node `v24.11.1`, npm `11.6.2`; Node continua abaixo de
  `24.17`. `pg_dump`, `pg_restore` e `psql` continuam ausentes do PATH.
- Lockfiles inalterados: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.

### 2026-07-10T02:24:40+01:00 - FRONTEND-CURSOR-PAGINATION-002

- `OPSA-E2E-P2-011` passa de `REABERTO` a `PRONTO_REAUDITORIA`. API clients
  aceitam cursor/limit e envelopes; ResourcePanel, MF1, MF2, AuditLog,
  IntegrationLog e reconciliação expõem navegação `Carregar mais`, acumulam
  páginas e preservam as já carregadas perante erro.
- O controlo está dentro de `nav` com label, usa `aria-busy`, fica disabled
  durante a chamada e desaparece quando `hasNextPage=false`. Selects de
  operações passam a incluir também os registos das páginas seguintes.
- Validação do implementador e do principal, cwd `real_dev/web`: `npm run
  test:final:prepare` exit `0`; `8` ficheiros/`25/25` testes Vitest, contratos
  MF1/MF2/MF3/MF5/MF7/MF8, typecheck e dois builds Vite com 67 módulos, zero
  skips. E2E TypeScript adicional passou compilação estrita.
- Foi acrescentado cenário Playwright que exige sessão autenticada, devolve duas
  páginas de clientes, clica `Carregar mais`, confirma ambas as páginas, fim do
  cursor e axe sem violações blocking. `npm run test:e2e -- --reporter=line`
  continua exit `1` antes dos testes com `E2E_BROWSER_MISSING: Google Chrome,
  Firefox, Microsoft Edge`; não foi convertido em PASS.
- Prova complementar pelo browser integrado, com Vite e mock HTTP locais: a
  primeira página mostrou `Cliente página um`; o clique enviou o cursor opaco,
  preservou esse registo, acrescentou `Cliente página dois`, atualizou os
  selects e removeu o botão terminal. No viewport disponível `1280x720`,
  `scrollWidth=1265 <= innerWidth=1280`. Esta prova não substitui a matriz
  multi-browser/viewport bloqueada.
- Hashes `before -> after` principais: `apiClient.ts`
  `a82d17728e123194c6aba09ea4f6a3e10f18318f127f72c9b1ddd5711161e777`
  -> `61895f2d5c03084f75346e152921afb660f129966fdb53e7de27170a817ec20d`;
  `App.tsx`
  `66cfa1c8807aadb02ddb8559320d8ed29e9309757b6113aae7fb6103a86d78e2`
  -> `b0b0cf7a5c9cff16a00913db00be92e44a2198baf3b5ad98a47417615171464e`;
  novos `cursorPagination.ts`
  `c94a7922ea7c5352f9e555346e4e02666242900251fab6f4ce4444f74b39b775`
  e `CursorPaginationButton.tsx`
  `2d2430aa8f0d563bf0ba50774f1428fe02ca927aefc22c77ddabddcd99d24210`.
- `e2e/app.spec.ts` foi alterado depois do handoff do subagente; o hash final
  será registado no manifesto. Lockfile web inalterado.

### 2026-07-10T08:47:15+01:00 - REAUDITORIA-PAGINACAO-003

- A reauditoria independente reabre `OPSA-E2E-P2-011`. O veredito anterior
  `PRONTO_REAUDITORIA` não se sustenta perante quatro lacunas funcionais: os
  selects críticos de MF1/MF2 só carregam os primeiros 100 registos; pesquisa
  genérica e data de open items podem combinar um cursor antigo com uma query
  nova; uma página vazia intermédia de open items oculta o controlo de
  continuação; faltam os índices compostos alinhados com as ordenações de
  `IntegrationLog` e `BankStatementImport`.
- Evidência fresca do auditor, cwd `real_dev/api`: `node --test
  tests/unit/cursor-pagination.test.js tests/unit/critical-pagination.test.js
  tests/unit/statement-import-recovery.test.js
  tests/contracts/mf2-ledger-report-contracts.test.js`, exit `0`, `15/15`
  PASS, zero skips. Cwd `real_dev/web`: `vitest` focado em paginação, manual
  journals e MSW, exit `0`, `14/14` PASS, zero skips. Estes testes confirmam o
  núcleo existente, mas não cobrem as quatro lacunas agora reabertas.
- Nenhum ficheiro de implementação foi alterado pela reauditoria. O finding é
  marcado `REABERTO` antes da primeira correção, conforme o contrato deste
  relatório.

### 2026-07-10T08:55:00+01:00 - CORRECAO-PAGINACAO-004

- `OPSA-E2E-P2-011` passa de `REABERTO` a `PRONTO_REAUDITORIA`. Um helper
  defensivo percorre todas as páginas das referências estruturadas e rejeita
  cursores ausentes, repetidos ou mais de 1 000 páginas, em vez de truncar
  silenciosamente. MF1 cobre clientes, fornecedores e artigos; MF2 cobre
  artigos e contas.
- `ResourcePanel` separa o texto editável da pesquisa efetivamente aplicada;
  Open Items faz o mesmo para a data de referência. O cursor seguinte usa
  sempre a query que produziu a página anterior. As tabelas MF1/MF2 renderizam
  o controlo de continuação mesmo quando uma página intermédia não tem linhas.
- O schema e a migration expand-only
  `20260710113000_cursor_listing_indexes` adicionam
  `BankStatementImport(companyId, importedAt, id)` e
  `IntegrationLog(companyId, createdAt, id)`.
- Validação do implementador: API focada exit `0`, `16/16` PASS; web focada
  final exit `0`, `18/18` PASS em cinco ficheiros, zero skips; uma execução
  intermédia teve `17/18` por seletor DOM ambíguo e foi corrigida; `npm run
  typecheck` e `npm run build` passaram, com 67 módulos; `prisma validate`
  passou com URL sintética. A migration não foi aplicada a PostgreSQL remoto e
  browser E2E continua bloqueado.
- Hashes `before -> after`: `cursorPagination.ts`
  `c94a7922ea7c5352f9e555346e4e02666242900251fab6f4ce4444f74b39b775`
  -> `02cc6a3731baa42316b701cc6f4811faec0f6226b25c6741cb3dfac51d4b92e8`;
  `App.tsx` `b0b0cf7a5c9cff16a00913db00be92e44a2198baf3b5ad98a47417615171464e`
  -> `2232132aa9cb5df1bbf118478e276cfdf2240ec6bae5cba1277f27418801b3c5`;
  `mf1Pages.tsx`
  `c191a07e62be6e0bd49aa73fbacd7de0a96f2180bceb3acbf1ace155cf0ebeb3`
  -> `202c1e6f1869b2c30bc75ddda6b1bf9d776f5a3e7d03fdf2ef663e46909d80f5`;
  `mf2Pages.tsx`
  `2bdb01374d1ef710104b72d5ba0c6fb632c18441f1382d70a3692cc93e22da0f`
  -> `cf055de55f8f0f887cb779ac2b41e4968ea679d396f92548868ea483ed39079a`;
  `schema.prisma`
  `ebaefe051eb2ba65659143e6830c54342f697376a252ce4274522c4bd937d92d`
  -> `361693e0aff8528293212f863093bcd0d8a6366f23fb6fe68d368a75df4af165`.
- Novos ficheiros: migration
  `c5eb73872e8204efecde3e6e2a950ec2e0d82c5fa4dfedc1d48befb59d0b0cb2`;
  contrato de índices
  `5fcba096fef95e418173a4ef3592a8ab31436d46829fb8d539125773a6ab1877`;
  testes DOM de páginas operacionais
  `6b3e84b64480e007731d51a48a2a895665ad75e2656c9325913d3b35233d0091`
  e referências
  `6ef9798035bc57aab99c5658708f8d2a565f7d883eda0d9114768d66a3b8b9df`.
- A reauditoria fresca foi atribuída a outro agente; até ao respetivo veredito
  este finding não é `FECHADO`.

### 2026-07-10T08:56:29+01:00 - STORAGE-CLEANUP-POSTCONDITION-004

- Hardening adicional de `OPSA-E2E-P1-017` e `OPSA-E2E-P2-015`, motivado pela
  reauditoria independente: um `deleteObject()` resolvido deixou de ser tomado
  como prova suficiente. Cada cleanup crítico executa uma única eliminação e
  confirma a ausência por `HEAD/objectExists`; erros de autorização/rede são
  propagados e apenas `404/NoSuchKey` significa ausência.
- Readiness fica negativo perante um delete no-op. Upload ambíguo, bundle,
  restore, dump, manifesto e diretórios temporários verificam a pós-condição.
  Quando a operação e o cleanup falham, `AggregateError` conserva ambos, sem
  mascarar a causa operacional.
- Validação do implementador, cwd `real_dev/api`: `npm run syntax:check`, exit
  `0`; testes focados, exit `0`, `35/35` PASS, zero skips; zero resíduos locais
  de backup/private storage. Não houve instalação de dependências.
- Hashes `before -> after`: `backupBundle.js`
  `119551c1b81a277875d51e29b2b8152bbaf35e22860c749bda20ded62832d798`
  -> `e2de290c8d1a55566f2ce3867526af5934dd3498eb349c9798a46fbb926fee45`;
  `objectStorage.js`
  `a5842252d475b11e7c229fa3285778e1c795d03accc27fc5a755d2afe13a8c02`
  -> `5f2acb2cd8ef948c1c64a5b50a15a3a866cb5526b412f9cb891f2e7679fd9066`;
  `run-daily-backup.mjs`
  `c8e492b4878fb3ac477f1026b9fa41f217b2d4589c0c14c670b79c982c693dd5`
  -> `bf5026c801d8d39c926eb278048aa0eeca4b852401109f91003c7c1cf9f861be`;
  `verify-backup-restore.mjs`
  `05cda3bbc54b335910b04d9d01811c2861927164291b54e27d270aa1e39d52d2`
  -> `cb4c7975c4f42b77df8b26b8bfee7535b3db6edf63185d8657b04b197ee5e959`;
  `run-backup-roundtrip.mjs`
  `0b905e2c8478e442a81345fa613bd7f9129fa916e26058cee83d8711464c0841`
  -> `0e30a29aae1edd03d25fb7bee0c733a63caf1e719a01cb101dca01213ccdee33`.
- Trade-offs explícitos: mais um `HEAD` por eliminação crítica; providers S3
  eventualmente consistentes podem falhar de forma conservadora; versões
  históricas do bucket e interrupções por `SIGKILL` continuam fora do alcance
  de um `finally`. O código alterado foi atribuído a reauditoria fresca antes de
  consolidar os estados.

### 2026-07-10T09:01:34+01:00 - REAUDITORIA-PAGINACAO-005

- Um agente diferente do implementador reauditorou `OPSA-E2E-P2-011` em modo
  read-only e confirmou o estado `IMPLEMENTADO`. Cliente/artigo/conta 101 são
  selecionáveis, páginas anteriores são preservadas, pesquisa/data ficam
  fixadas durante a continuação e uma página vazia com `hasNextPage=true`
  mantém `Carregar mais` acessível.
- O auditor confirmou 13/13 índices keyset materializados nas migrations; a
  migration nova é apenas expand. Web: cinco ficheiros, `18/18` PASS e
  typecheck PASS. API: seis ficheiros, `25/25` PASS. Zero skips e hashes
  estáveis durante a reauditoria.
- Não foi encontrado blocker de código. O finding não passa a `FECHADO` porque
  `TEST_DATABASE_URL`/`DATABASE_URL` e `psql` estão ausentes, a migration e as
  queries reais não foram provadas, e Chrome/Edge/Firefox continuam ausentes.

### 2026-07-10T09:03:32+01:00 - REAUDITORIA-SAFT-003

- Reauditoria read-only mantém `OPSA-E2E-P1-003` em `EM_CORRECAO` e a decisão
  global em `NO_GO`. Foram confirmados o gerador interno `1.04_01`, namespace,
  Windows-1252 com round-trip, Header/MasterFiles/TaxTable/GL/SalesInvoices,
  readiness 422 sem dados fiscais, fingerprint oficial, pipeline fail-closed,
  ownership por empresa e migration expand-first nullable.
- Foram encontrados gaps corrigíveis: o contrato confundia a versão normativa
  `1.04_01` com `xsdVersion: "1.1"`; a reconciliação não ligava cada venda e
  compra definitiva ao lançamento contabilístico nem incluía compras; o
  exercício era inferido do ano civil; o download confiava em comprimento e
  metadata sem recalcular o hash dos bytes.
- Permanecem fora da autoridade local: adapter/validador externo real sobre o
  XSD oficial, relatório ligado aos hashes, revisão contabilística, emissão
  certificada/encadeada de número, ATCUD, Hash e HashControl e backfill fiscal
  legítimo. PostgreSQL/S3 remotos também estão ausentes.
- Não houve validação XSD nesta retoma: o XSD não estava em `/tmp`, `curl`
  normal falhou por DNS com exit `6` e a tentativa escalada foi interrompida.
  O auditor não executou testes focados nem recolheu hashes antes da instrução
  de terminar; estes valores não são inventados. Nenhum ficheiro foi alterado.
- Os quatro gaps locais foram atribuídos ao mesmo especialista para correção;
  não lhe foi autorizado inventar adapter externo, dados fiscais ou backfill.

### 2026-07-10T09:05:44+01:00 - REAUDITORIA-CLEANUP-005

- Reauditoria read-only reabre `OPSA-E2E-P1-017`, `OPSA-E2E-P2-015` e
  `OPSA-E2E-P2-017` antes de novas alterações. O hardening `DELETE+HEAD` está
  correto no caminho principal, mas o pruning de retenção ainda contabiliza
  `deleteObject()` no-op como removido e pode deixar um bundle parcialmente
  apagado.
- No probe Redis, uma falha de `DEL` no `finally` pode mascarar a falha original;
  os timeouts por `Promise.race` não cancelam operações penduradas. Nos imports
  multipart, `failure ??= cleanupError` descarta a segunda falha e não confirma
  a ausência da quarentena. O upload de manual journal pode enviar `201` antes
  de conhecer o resultado do cleanup.
- Testes read-only no sandbox: `43` total, `36` PASS e `7` `listen EPERM`
  Supertest, zero skips; a repetição fora do sandbox foi interrompida e não é
  apresentada como PASS. S3/Redis/PostgreSQL/restore remotos continuam
  bloqueados. Nenhum ficheiro foi alterado pelo auditor e os hashes não foram
  inventados.
- A correção foi atribuída sem apagar a evidência positiva anterior:
  `objectExists` propaga 403/rede; backup/restore já preservam causa com
  `AggregateError`; `lstat` confirma cleanup local; readiness de storage agrega
  corretamente operação e cleanup.

### 2026-07-10T09:11:32+01:00 - CORRECAO-SAFT-004

- Os quatro gaps SAF-T corrigíveis foram implementados; `OPSA-E2E-P1-003`
  permanece `EM_CORRECAO`. A atestação exige agora
  `schemaVersion === SAFT_VERSION` (`1.04_01`) e o scanner não encontra
  `xsdVersion` nem “XSD 1.1” no código/testes.
- Cada venda e compra definitiva exige exatamente um `JournalEntry`
  determinístico; lançamentos órfãos/duplicados são rejeitados e data, bruto,
  débito e crédito são reconciliados. A reconciliação assinada inclui compras,
  documentos e totais por tipo.
- `FiscalPeriod.fiscalYear Int?` foi acrescentado por migration expand-only,
  sem default ou backfill. Ausência bloqueia exportação; períodos que atravessam
  anos civis deixam de ser rejeitados por inferência. O formulário frontend
  expõe o exercício fiscal obrigatório como número 1900..9999 e o client passa
  a tipar a resposta.
- O download consome os bytes de storage com limite rígido, recalcula SHA-256 e
  só devolve um novo stream após tamanho e hash coincidirem com o run
  persistido.
- Validação do implementador em `real_dev/api`: testes focados `50/50` PASS;
  `npm run test:mf7:saft`, `13/13` PASS; `npm run syntax:check` PASS; `prisma
  validate` PASS com warning informativo sobre futura configuração Prisma 7;
  zero skips. Não houve `npm install` nem alteração de lockfiles.
- Hashes `before -> after`: `saftService.js`
  `7e675ba3...` -> `c041e829576a5abbab797c82ce97e1b0be814923ed37405e3c4b0fb5daf7576b`;
  `saftGenerator.js` `315760f7...` ->
  `d54ab648278dea2910cd1f70b482ab16b837677cc8b4b591d74f16d63695c855`;
  `saftComplianceChecklist.js` `c5428b...` ->
  `921f2b27cf44ffe1e5eb6e8a675ef86beef797c201ee3363bbff5545436a1838`;
  `fiscalPeriodService.js` `302280...` ->
  `f1350677f8c3cf349de825a6a095193e2b97b9817f39f5d2e15800b10aecfd2a`;
  `fiscalPeriodValidators.js` `d03890...` ->
  `8f9fdbb04cb03aa9c920dd05a3d6b54650720ea00f64b718437116621a8d7fc8`;
  `schema.prisma` `361693...` ->
  `9a7a23b7aa2c336836fd83cce7f48a27f840b86399402e248bdc8c8ea3618520`;
  migration nova
  `be08b88cffb82380e261da856b0cc9782b7edaf9da6bbeb88b041f98634db8cd`.
- Frontend, alterado pelo principal: `App.tsx`
  `2232132aa9cb5df1bbf118478e276cfdf2240ec6bae5cba1277f27418801b3c5`
  -> `f26e334de0df1083816b8ee239c18c4c0996291516de28081a28f869ed0bdd01`;
  `apiClient.ts`
  `61895f2d5c03084f75346e152921afb660f129966fdb53e7de27170a817ec20d`
  -> `32522e81d6b9467b976dd1fdebfed68eae8e6623e0988e583c1021a3480a5249`.
- Teste funcional frontend acrescentado pelo principal: `npm run test:unit --
  src/test/App.msw.test.tsx`, cwd `real_dev/web`, exit `0`, `11/11` PASS. O
  teste confirma input number 1900..9999 e payload `fiscalYear: 2026`; hash
  `App.msw.test.tsx`
  `b429a650f074e7fef201e7b4f0e02135283c2800813f0f2cf567b93245376b95`
  -> `f9489ac9562e72f50b29eaee0ba68c67714675d32a928f26acb77e64179cde6c`.
- Continuam bloqueantes e não inventados: pipeline externo operacional,
  validação real pelo XSD oficial, revisão contabilística, PostgreSQL/S3
  remotos, emissão certificada/encadeada de número, ATCUD, Hash e HashControl e
  backfill fiscal legítimo. A correção foi entregue a reauditoria independente.

### 2026-07-10T09:24:38+01:00 - CORRECAO-CONTRATO-XSD-005

- Correção append-only à interpretação de `REAUDITORIA-SAFT-003`: “estrutura
  SAF-T 1.04_01” e “linguagem/processador XSD 1.1” são dimensões distintas e
  ambas são obrigatórias. O XSD oficial foi finalmente descarregado apenas para
  `/tmp` com `curl -fsSL` autorizado, exit `0`; tem `104696` bytes, SHA-256
  `292c0ab4611e3f5a0cdf2abb4e62d9bd41254dc2e76a1fae4d35a8b132d79350`,
  declara `version="1.04_01"`, `vc:minVersion="1.1"` e contém 19
  `xs:assert`.
- A atestação exige agora simultaneamente `schemaVersion === SAFT_VERSION`,
  `xsdProcessorVersion === "1.1"` e o hash oficial. O campo ambíguo
  `xsdVersion` continua proibido. Testes rejeitam estrutura `1.03_01` e
  processador `1.0`, e persistem ambas as versões no caso positivo.
- Validação: testes focados `51/51` PASS, zero skips; `npm run syntax:check`
  PASS; scanner de `xsdVersion` com zero ocorrências. Hashes `before -> after`:
  `saftService.js`
  `c041e829576a5abbab797c82ce97e1b0be814923ed37405e3c4b0fb5daf7576b`
  -> `0885e4897da8e5eee6fb27b855392630d0caeaa4ccd1e7f60e99c443e3812920`;
  `saft-export-service.test.js` `1f421c...` ->
  `41ad36ff8476145afd872d861211f787589c3810f6278914e3d1beb7bf21194c`;
  `mf7-saft-contracts.test.js` `589387...` ->
  `d6bcde09f2ac9bee7dc9643c26de4a41ad52db9c1f92a85a010a00e0698aa2c7`;
  `OFFICIAL-XSD.md` `9c3bf7...` ->
  `e3aa1f2e6299882fdf76c7dc29d9b590f767a6737d6c6a92eac5af86c157efce`.
- O XSD em `/tmp` é evidência efémera e não transforma o finding em PASS. Falta
  um motor externo XSD 1.1 operacional, a execução contra o XML gerado, a
  revisão contabilística e os restantes blockers fiscais já registados.

### 2026-07-10T09:27:19+01:00 - CORRECAO-CLEANUP-006

- `OPSA-E2E-P1-017`, `OPSA-E2E-P2-015` e `OPSA-E2E-P2-017` passam de
  `REABERTO` a `PRONTO_REAUDITORIA`. No pruning, um bundle só é expirado quando
  todos os objetos o são; dados são eliminados e confirmados antes do manifesto,
  o contador só avança após todas as pós-condições e uma falha posterior ao
  commit lógico nunca apaga o bundle novo.
- Redis conserva operação e cleanup em `AggregateError`, tenta `DEL` após SET
  ambíguo e readiness usa `AbortController`. Object storage aceita e encaminha
  `AbortSignal`; o boundary espera no máximo 250 ms pelo settlement. Um driver
  que ignore o signal pode continuar depois desse grace; a chave Redis tem TTL
  10 s e o cleanup é tentado quando o driver volta.
- O parser multipart expõe a quarentena; `rm` é confirmado por `lstat`.
  Business import, statement import e anexos agregam operação+cleanup; anexos
  só enviam 201 depois da confirmação local.
- Validação do implementador: syntax de 13 ficheiros PASS; storage, backup,
  readiness e MF2 `44/44` PASS; multipart sem listener `2/2` PASS; total
  `46/46`, zero skips. A tentativa Supertest fora do sandbox foi interrompida e
  não é contada; a suite integral fica para o gate consolidado.
- Hashes `before -> after`: `run-daily-backup.mjs`
  `bf5026c801d8d39c926eb278048aa0eeca4b852401109f91003c7c1cf9f861be`
  -> `d5a13dc78104d7b234ef64cc2fe575e947293d1565ae3eb065858df8203f1fb4`;
  `healthService.js`
  `509df7877d485009b5afb7f5f61458c1c09b1baecb5a6f8468137c6fa735db71`
  -> `cc7238515b386cf26cb21be895bb9eda7a83685e352b41d93c57c347cc7184de`;
  `objectStorage.js`
  `5f2acb2cd8ef948c1c64a5b50a15a3a866cb5526b412f9cb891f2e7679fd9066`
  -> `4a0e432759646e7d633d4a0df92baec1d0f9f2c530fccbac837864b5dbfdd55a`;
  `multipartUpload.js`
  `1c57deaf2876f362e93c57764d1bc6f67bfb22872ee1092beed103cc7c2d423c`
  -> `786fd23200b69b2dce28167db624fcaa7cc75d79e458d96ae070a9c6a7f716e3`;
  `businessImportRoutes.js`
  `ecf353a999b8ede594d4b53c519dbbb06a6911f7c66f84cd19435a8baf050710`
  -> `ce0ab03bcfffbe8bf11656f37a22f92090fd7ed3abf4372884b45328d0ae68ef`;
  `statementRoutes.js`
  `e0cb2b8a535e934a1f296c684687f0225527eb3aef25191b9af86f3353c5851d`
  -> `19561388a9f66b0be32d88ae1c788e8a68007ebde4b676313984533b6a2895fc`;
  `manualJournalRoutes.js`
  `b0ce26e4b61b87f3b0294fc4e8996741a08b91249dce85ef71dc3b74fdf0135a`
  -> `d516928f43ebdbb6c4c37d24e1c10fab30659a756b66de9482b8c8305d9bd9cb`.
- Hashes finais dos testes ficam no manifesto; lockfile API manteve
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`.
  Uma reauditoria fresca foi atribuída a outro agente.

### 2026-07-10T09:35:11+01:00 - REAUDITORIA-CLEANUP-007

- Reauditoria read-only confirma `OPSA-E2E-P1-017` e
  `OPSA-E2E-P2-015` em `PRONTO_REAUDITORIA`: pruning data-first e
  manifest-last, proteção do bundle novo, erro Redis+cleanup agregado, SET
  ambíguo com DEL e AbortSignal até ao SDK S3. Runtime S3/restore/Redis/PG ainda
  impede `FECHADO`; drivers Redis/Prisma não canceláveis continuam risco de
  runtime, já explícito.
- `OPSA-E2E-P2-017` é `REABERTO`: no catch interno do parser multipart, uma
  falha de cleanup mascarava o erro original; e uma falha de cleanup local após
  commit de anexo podia devolver 500 com objeto+metadata persistidos, permitindo
  duplicação num retry sem idempotência.
- Testes no sandbox: 54 total, 47 PASS e 7 Supertest `listen EPERM`, zero skips;
  a repetição escalada foi interrompida e não é contada. Nenhum ficheiro foi
  alterado pelo auditor. As duas lacunas foram atribuídas antes de nova edição.

### 2026-07-10T09:45:27+01:00 - CORRECAO-IDEMPOTENCIA-008

- `OPSA-E2E-P2-017` passa de `REABERTO` a `PRONTO_REAUDITORIA`. O catch do
  parser conserva agora operação e cleanup em `AggregateError` através do
  helper comum.
- `JournalAttachment.idempotencyKey` foi adicionado nullable, sem default nem
  backfill, com unique por empresa+lançamento+chave. Novas escritas usam o
  SHA-256 como chave; históricos `NULL` permanecem válidos. Um retry devolve o
  anexo ativo; numa corrida `P2002`, o perdedor elimina/confirma apenas as suas
  chaves aleatórias e devolve o vencedor.
- Migration expand-only `20260710120000_attachment_content_idempotency` e
  testes focados: MF2 services `21/21`, MF2 contracts `13/13`, parser `1/1`;
  total `35/35` PASS, zero skips; cinco `node --check` e `prisma validate`
  passaram. PostgreSQL real continua ausente.
- Hashes `before -> after`: `multipartUpload.js`
  `786fd23200b69b2dce28167db624fcaa7cc75d79e458d96ae070a9c6a7f716e3`
  -> `4a9cf2cbdf5a86fb8817e5ad16478d1cb7a895f8a770f48f31e71752085cc4b6`;
  `manualJournalService.js`
  `56012be97d8e1630eec76ff36f443020c57a1be44029b7da41191585a2b75374`
  -> `5080659c1f4fa02039d06c8f5b7aff49aa3d6084bb608f8c18ecd7d3cb95df7b`;
  `schema.prisma`
  `9a7a23b7aa2c336836fd83cce7f48a27f840b86399402e248bdc8c8ea3618520`
  -> `4cd1d5da0821474c486d6b7952618ee7746e8b5521fae8af56ef9217ede2ecc0`;
  migration nova
  `0b4f8272a4533cddf05a59b888f339f4e3eb867b2727151a482ad4fb9e8cd236`;
  `multipart-upload.test.js`
  `1ace0446b45b9c33ccf111e87b338ad4f4ce2d373301a82a4e4d59652191130b`
  -> `1a5abce9e11d85b52b64f55b01384149d5fc0dafc3fa7e4cfc5cf191d9ad0513`;
  `mf2-contracts.test.js`
  `76a55785775ce42742f5c2f9a9793517ca763543712040237894cc1d00a620f8`
  -> `be6553e03188f78f3ee1961880dd59b1012d5975e0aa123d8e459a6afc2611ee`.
- Lockfiles permanecem inalterados; a correção foi atribuída a reauditoria
  independente antes de qualquer promoção de estado adicional.

### 2026-07-10T09:46:56+01:00 - REAUDITORIA-IDEMPOTENCIA-009

- Reauditoria read-only confirma a correção local de `OPSA-E2E-P2-017` em
  `PRONTO_REAUDITORIA`: `AggregateError` do parser, migration nullable sem
  default/backfill, retry SHA-256, corrida `P2002` e bulk 5 000→20.
- Testes focados `48/48` PASS, zero skips; `prisma validate` passou com URL
  sintética não conectada e warning Prisma 7. O finding não é `FECHADO` sem
  aplicar a migration e provar a corrida/SQL numa PostgreSQL real. Nenhum
  ficheiro foi alterado pelo auditor.

### 2026-07-10T09:46:56+01:00 - GATES-FINAIS-002

- API, cwd `real_dev/api`: syntax exit `0`; unit `278/278` PASS; contracts
  `153/153` PASS; zero skips. Integração exit `1`, `2/7` PASS, `5/7` FAIL e
  zero skips, exclusivamente fail-closed por PostgreSQL/Redis/SMTP ausentes.
- `test:mf6` PASS; `test:mf7` PASS com 44 testes e modularidade; `test:mf8`
  PASS com 16 testes/inventário. Estes gates locais não substituem runtime.
- Prisma validate/generate passou com URL sintética e client 6.19.3; a primeira
  tentativa final de validate sem quoting do `?` falhou no zsh (`no matches
  found`) e foi repetida corretamente. `npm audit --omit=dev
  --audit-level=moderate` e `npm ls --all` passaram na API e web, zero
  vulnerabilidades e zero módulos extraneous.
- Web, cwd `real_dev/web`: `test:final:prepare` exit `0`, 10/10 ficheiros e
  `30/30` Vitest, gates MF1/MF2/MF3/MF5/MF7/MF8, dois typechecks e dois builds
  Vite de 67 módulos. Playwright exit `1` antes de iniciar testes, com
  `E2E_BROWSER_MISSING: Google Chrome, Firefox, Microsoft Edge`; zero skips.
- Gate do report exit `1` porque findings funcionais não estão `FECHADO`; gate
  académico exit `1` porque Node `24.11.1` não satisfaz `>=24.17 <25`.
  `mf8:defect-report` foi corrigido estruturalmente e termina agora exit `1`
  pela razão esperada `MF8_DEFECT_REPORT_BLOCKED`, não por secção ausente.
- Validador documental final: exit `1`, 51 RF, 39 RNF, 93 BK, cobertura e
  consistência verdes, zero conflitos, zero advisories, zero waivers e três
  blockers ambientais explícitos. `overall_pass=false` e
  `advisory_pass=true`.
- A evidência MF8 foi sincronizada para `278/278`, `153/153`, integração `2/7`
  e frontend `30/30`. A mensagem do gate SAF-T distingue esquema `1.04_01` de
  processador XSD 1.1; `run-academic-release-gate.mjs` mudou de
  `e34d27792299642923cc05ae5751f3e78c6b01d6491bdc4459a9357573214730`
  para `9ecd6acec178e28da6a1f62890ffb22b152e9f3cdf18e035d456480cdda97c61`,
  com teste focado `6/6` PASS.
- Não houve `npm install`, `npm audit fix`, commit ou alteração em `apps/`.
  Os lockfiles finais continuam API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`
  e web
  `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.

### 2026-07-10T09:51:04+01:00 - MANIFESTO-SHA256-001

- Criado o manifesto compensatório em
  `docs/planificacao/auditorias/evidence/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.sha256`.
  Contém 439 ficheiros de `real_dev/api`, `real_dev/web` e documentação/scripts
  alterados ou associados, excluindo secrets, `node_modules`, builds, reports
  de browser, storage privado e o próprio report/manifesto para evitar ciclo.
- Comando de verificação: `shasum -a 256 -c
  docs/planificacao/auditorias/evidence/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.sha256`,
  cwd raiz, exit `0`, 439/439 `OK`.
- Hash do manifesto:
  `41b34e5b1b72c05d12bd92b4e322f8359deb1e2cada01fc70d378d25d08ed7c2`.
  O report canónico é excluído por autorreferência; o respetivo hash final é
  calculado depois desta última entrada e entregue no handoff.

### 2026-07-10T09:52:40+01:00 - MANIFESTO-SHA256-002

- Correção append-only: o scan de segurança encontrou quatro exemplos de URL
  PostgreSQL sintética com password literal em documentação/evidência. Foram
  substituídos por `<synthetic-test-url>`; nenhum valor real estava presente.
- Hashes `before -> after`: `mf7-imports.md`
  `6c09d7559b73d256057090909f6cac95d8178493f927cda21dfe948b756f0881`
  -> `528d733fb332f8a14b0011f9b7e928c3a41bb6e003cdf69e70a3f6a4e20a59df`;
  `mf7-saft-readiness.md`
  `cca383e7d4e3b2e49809f8c584ebaec2d2d51484780e76d26a3b62f97d94f30a`
  -> `810792f94ddeea17714d56fc6e6947678e8ba29b2094932ff67dc3af816b794d`;
  `BK-MF8-13.md`
  `c2a6c11c3ed4488c5ddd296be99bcc206755613b9141630e272ab602530ebd95`
  -> `c549962546a023216cb9bc5d5ab44ef5226cf77eea84b2f5e318f33824d4125d`.
  O próprio report também foi redigido e continua fora do manifesto.
- O manifesto foi regenerado com 440 ficheiros, verificado `440/440 OK` por
  `shasum -a 256 -c`, e tem SHA-256
  `df627004ad1d5386d1a8517740ccf4c2012e57d0367bd50bc667a24e7a50921d`.

### 2026-07-10T09:54:36+01:00 - MANIFESTO-SHA256-003

- O scan final de trailing whitespace encontrou apenas sete linhas JSDoc
  antigas com `* `; foram normalizadas para `*`, sem alteração funcional. Os
  sete ficheiros passaram `node --check`.
- Hashes `before -> after`: `authValidators.js` `7671773558f7026a95b2c73113bb8aebb1fea9f620e7e00fa737eda3b83e68b9`
  -> `f071bc8a242d1ae7c6b7b20caf5aa46b479dc98a6786e72a16e1611c7253f5d9`;
  `password.js` `2ee36b6ba462a62c641c3dfd73f966687c6027e679d3cb3ed3cdc42052801dff`
  -> `b434a633ae7957ef40124fcc2c443a96209152d7415badd07c385bd7d9f290df`;
  `precheck-mf0-migration.js` `8172e0961843baf9f6fdacf27250514aa8a2e7b5fd5318a106d746f9f488cf86`
  -> `82b4a8a7475bccecb83bde73fd90739a05bc79de4142897dfda36d93dedb2a11`;
  `sessionCookie.js` `77ccac02e82123cea0becc167857a4d549d138d0377f6166e77ab52a37c461c4`
  -> `7506ff0f537b8a1579add210a6979267ad84d2542b085c8c324e6fb3c7f2e10b`;
  `httpErrors.js` `dab0e5f013c9811107b4e7031cf706d09fd05efafb5b3242b38fe212f987cc61`
  -> `f53b3eb96bb9a37a2560982ea1375b82ad364ae924a13d247dba0013eecb1748`;
  `permissions.js` `f41975ba8435ac7da45f6e32f44036cff7896dbd35ecf54bb76965b302d0a5e7`
  -> `c1bfd43eda05e49465ba29a0d7c878679ef1b265915fc9cf5a7b9f63e50ff085`;
  `mf2-persistence.test.js` `3c0fe8c7f1f152f799d6511dfad6e59724090299ae245b31348e473d35923e5b`
  -> `ccea0620c380e06e0cc1662e716585024eddd4efe69b75a7a801ca38e81bd433`.
- Manifesto regenerado: 440/440 `OK`; SHA-256 final
  `4a3a8be0e15633e54ada1fe425270d057d1cbdd1bb9e04d8648b32fee9c183f2`.

### 2026-07-10T15:28:57+01:00 - DOCUMENTATION-SYNC-START-001

- O utilizador autorizou uma sincronizacao integral, exclusivamente documental,
  entre `docs/` e o comportamento atual de `real_dev`. Nao e autorizado alterar
  codigo da aplicacao, executar `npm install`, tocar em `apps/` ou criar commits.
- `OPSA-E2E-P1-013` passa de `IMPLEMENTADO` a `REABERTO` antes da primeira
  alteracao documental desta unidade logica. O objetivo e separar
  `documentation_sync_pass` do estado funcional; nenhum finding funcional sera
  fechado e a decisao global continua `NO_GO` enquanto os blockers runtime
  permanecerem.
- Baseline preservada: `git status --short` mostrou apenas alteracoes anteriores
  desta conversa em evidence, guias, validadores, runbook e o report/manifesto
  ainda nao versionados; `git diff --check` terminou com exit `0`. `real_dev/` e
  ambos os lockfiles continuam ignorados por `.gitignore:4`.
- Snapshot antes da sincronizacao: 223 ficheiros sob `docs/`; hash agregado
  ordenado SHA-256 `7dd735495fdca785d47c62a2d6bcd57c139b5a1086a41797e273836323cbce5d`;
  hash deste report
  `55c46133f9910effe27edce57302a584af2689b209638ddb6a185e03b513460e`.
  Lockfiles inalterados: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web
  `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.
- A contagem operacional encontrada nesta retoma e 211 Markdown/223 ficheiros
  totais em `docs/`, nao os 216 documentos mencionados no plano. Esta diferenca
  sera reconciliada pelo inventario/validador, sem criar IDs RF/RNF/BK nem
  inventar ficheiros apenas para atingir uma contagem nominal.
- Trabalho independente autorizado: governação/contratos, guias, evidence,
  historico e validator podem progredir em paralelo. Apenas o agente principal
  edita este report e consolida hashes, comandos e resultados.

### 2026-07-10T16:10:00+01:00 - DOCUMENTATION-SYNC-IMPLEMENTATION-002

- Escopo executado: apenas `docs/`, os validadores documentais associados e o
  manifesto compensatorio. Nao houve alteracoes em `apps/`, codigo da
  aplicacao em `real_dev`, migrations ou lockfiles. Nao foi executado
  `npm install` e nao foi criado qualquer commit.
- A governação passou a separar explicitamente a verdade pedagógica
  (`estado_alunos` na matriz/backlog) da verdade da referência privada
  (`real_dev`, relatório canónico, evidence, arquitetura e runbook). S12 da
  referência permanece `NO_GO` sem alterar estados dos alunos.
- Foi criado
  `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md`, com catálogo único
  de endpoints, envelopes paginados, modelos, migrations, configuração,
  workers e contratos removidos. O stack foi alinhado com Node `>=24.17 <25`,
  npm 11, Express/Prisma/React Router, Redis, SMTP/outbox, S3, multipart e o
  toolchain real.
- Foram revistos semanticamente os 93 guias e alterados 73, sempre com paths
  públicos `apps/api` e `apps/web`. O scan final encontrou zero referências a
  `real_dev/` nos guias. Foram sincronizados auth/onboarding/email,
  integridade/locks/datas, multipart/S3/importações, SAF-T/backup, routing/UX,
  acessibilidade, health/observabilidade, paginação e gates sem skips.
- A reauditoria cruzada encontrou um drift residual no guia SAF-T:
  `INVALID_SAFT_EXPORT_REQUEST` não existe no runtime. Foi corrigido para
  `INVALID_SAFT_REQUEST`, mantendo `INVALID_SAFT_EXPORT_TYPE` para o tipo
  inválido, e a regra foi adicionada ao gate anti-drift.
- Os 30 relatórios históricos identificados receberam o banner uniforme
  `SNAPSHOT_HISTORICO_SUPERSEDED`, ligação ao estado atual e aviso de não
  reutilização de contagens/comandos. O corpo foi preservado, salvo redação de
  exemplos sensíveis e normalização não semântica de whitespace.
- A arquitetura técnica foi reescrita para documentar `createApp/startServer`,
  serviços remotos, modelos, Router/AuthProvider, logs, paginação, workers e
  shutdown. `BK-MF8-05.md` foi completado, `BK-MF8-06.md` foi criado e a
  evidence de health passou a refletir 18/18 testes.
- O gate documental passou a produzir `documentation_sync_pass` e
  `canonical_runtime_pass` separadamente. Cobre contratos legados, evidence,
  histórico, segredos, links, paginação, arquitetura, contrato central e
  estado canónico; o wrapper usa `python3 -B` para não criar bytecode novo.
- Baseline `HEAD -> final` de artefactos centrais (os hashes finais de todos os
  ficheiros estão no manifesto):

| Ficheiro | SHA-256 baseline | SHA-256 final |
| --- | --- | --- |
| `docs/planificacao/README.md` | `10e0f0e70da32ad44455ea5ddfacf338fef0928ba841b9c60c1ad76c6641297c` | `90026298ba1d2e26782ddd407b81c08a2102b1d9479f3da7fc8f35b912b04711` |
| `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` | `543e32a1c9d90984daa8569600b71d59b88dd913892e8676ab7107a62fe284ef` | `e51a63ccb7042bede663d802e5f8e503c0f02a1029f7995cdf0b84e20b79054b` |
| `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md` | ausente | `828c3cc326a66f84c52f6534803e17e700195a57fc1f1e58d20515d656bdb81f` |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `145092389797b49ee04a82cb1b2197cc2eb21d1413a12831f1b2c9540905af3f` | `b899c98b3998ad4520191e6bfac2cbdd694497428935b7da1b67aee2567daee5` |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | `6e870342c8c81272f4a4bafdc696858be3992a999d9b20afeb91cd0dd6afc07a` | `88f60b444374f588a8d199bfd16e22e5ce0fa4cd0105e6f91b2abe78eeeb17aa` |
| `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md` | `7bc739382d349ed31d0c8e0b7a84e666f2705b97ab28f7b4dc720507d37920f6` | `d1e08d9802237d873eecf0c7008a16662fd620f608fff0492f6675067226e93c` |
| `docs/evidence/MF8/BK-MF8-05.md` | `daecf2c44eb9a7480b536e5f81ec6cd2f6d32296b52729d8471bf382f43ba07b` | `39390b829d7092a1df3e6fb8d76713535cd97cbafcdb03656eead8437ae16086` |
| `docs/evidence/MF8/BK-MF8-06.md` | ausente | `f581024ff5390e82b24f811994132aa0d6d84db95b8424ac09cb148bcd39b802` |
| `docs/planificacao/scripts/auditar_planificacao.py` | `51d1661fac9cc0dc90a7b798ada359a2406a4b78f5fe0e50ef2dda777a910544` | `252e64fcaf4d7c04c8ed38d0b9f64ebeadf9db3373312f212976d023d94ae8c2` |
| `docs/planificacao/scripts/documentation_sync_contract.py` | ausente | `52462d5969c99df98f2458a8f1bba411b2eb4c9189d31b79d1d583403aadef9b` |
| `scripts/validate-planificacao.sh` | `3cc7e3bbfd8d5d4e745bccbdbb8211300ca1e69f37cdc6ea649350d74bf8a85c` | `7d0cfd7f2d2347a40458b5e4b343ed9db8c0bf7ab0efc3ae2ac7ebffbde8058b` |

- Ledgers transitórios capturados antes de cada lote: auth/integridade
  `dc5aa4a456d4dbc5a466ce0ba6f4d9ca74d8c171224234f30eafc99587369086`;
  guias MF3-MF8 before
  `1e5200b9ef67f60921995214130c401cf835d17a2182b60a20016ff8f69fde1f`;
  histórico before
  `31b5b34ea6a65000e66bc349b668c8c75147dc9cd71820cc55ee18550aa50e31`;
  whitespace 20 ficheiros before
  `a40201a4de35624c50d9ee73c20bcee9e9cc0b2258a20909c074914bb0536223`
  e after
  `a05117d3832edf6af0406d3c626c1bfda0618c88b3e39a48f95fd3d48c3ef06e`.

### 2026-07-10T16:14:00+01:00 - DOCUMENTATION-SYNC-REAUDIT-003

- Reauditoria independente inicial: `PASS_COM_1_DRIFT_DOCUMENTAL_P2`; o único
  defeito foi o código `INVALID_SAFT_EXPORT_REQUEST` no guia SAF-T. Depois da
  correção e do novo negativo de mutação, a reexecução ficou sem issues de
  sincronização. `OPSA-E2E-P1-013` passa de `REABERTO` para `IMPLEMENTADO`,
  nunca para `FECHADO`, porque esta unidade documental não fecha findings
  funcionais nem substitui prova runtime.
- `python3 -B docs/planificacao/scripts/auditar_planificacao.py --self-test`,
  na raiz: exit `0`, `mutation_assertions=123`.
- `bash scripts/validate-planificacao.sh`, na raiz: exit `1` esperado;
  51 RF, 39 RNF, 93 BK na matriz, 93 no backlog e 93 guias;
  `documentation_sync_pass=true`, `canonical_runtime_pass=false` e
  `overall_pass=false`; zero issues de sync, zero conflitos, zero advisories,
  zero waivers e exatamente três blockers runtime/evidence.
- Scans finais: 30/30 históricos com banner; zero contratos legados ativos,
  placeholders correntes, resultados contraditórios, secrets, links partidos,
  conflict markers ou paths privados nos guias. As 54 ocorrências antigas de
  trailing whitespace em 20 evidences foram removidas; o scan global ficou a
  zero e `git diff --check` terminou com exit `0`.
- API em `real_dev/api`: `syntax:check` exit `0`; unit 278/278; contracts
  153/153; health focado 18/18; integração exit `1` com 2/7 pass, 5 falhas
  ambientais e zero skips; MF6, MF7 e MF8 exit `0`; `npm ls --all` e
  `npm audit --omit=dev --audit-level=moderate` exit `0`; Prisma validate e
  generate exit `0` com URL sem credenciais.
- Web em `real_dev/web`: `test:final:prepare` exit `0`, 10 ficheiros/30 testes,
  typecheck e build verdes; `npm ls --all` e audit exit `0`. Playwright exit
  `1` antes de iniciar testes: Chrome e Edge ausentes; Firefox não foi iniciado
  porque o preflight abortou a matriz. Resultado: 0 iniciado, nunca PASS.
- `npm run mf8:defect-report` exit `1` com `MF8_DEFECT_REPORT_BLOCKED`, como
  esperado. `npm run gate:academic` exit `1` no preflight porque Node
  `24.11.1` não cumpre `>=24.17 <25`; npm é `11.6.2`. `pg_dump`, `pg_restore`
  e `psql` continuam ausentes do PATH.
- Matriz de impacto documental e estado residual:

| Finding | Documentos corrigidos | Validação | Resultado |
| --- | --- | --- | --- |
| `OPSA-E2E-P1-013` | governação, 93 guias revistos, evidence MF8, auditor e wrapper | 123 mutações; sync sem issues; defect report fail-closed | IMPLEMENTADO |
| `OPSA-E2E-P1-003` | contrato central, guias/evidence SAF-T e arquitetura | contratos locais verdes; XSD/reconciliação/revisão externa ausentes | EM_CORRECAO |
| `OPSA-E2E-P1-005`, `OPSA-E2E-P1-017` | guia backup, contrato e runbook | fluxo implementado; restore remoto/PG tools ausentes | estados funcionais inalterados |
| `OPSA-E2E-P1-015` | evidence de integração/browser e gates | integração 2/7; Playwright 0 iniciado | BLOQUEADO_AMBIENTE |
| `OPSA-E2E-P2-009`, `010`, `011` | arquitetura, health/logging/paginação e guias | health 18/18 e gates locais; runtime remoto ausente | IMPLEMENTADO, sem fecho runtime |
| `OPSA-E2E-P2-014` | stack, scorecard, gates e runbook | Node incompatível e gate académico vermelho | BLOQUEADO_AMBIENTE |

### 2026-07-10T16:15:52+01:00 - DOCUMENTATION-SYNC-MANIFEST-004

- O manifesto anterior tinha 440 entradas e SHA-256
  `4a3a8be0e15633e54ada1fe425270d057d1cbdd1bb9e04d8648b32fee9c183f2`.
  Antes de o substituir, a verificação deu 417 OK/23 desatualizados: todos os
  319 ficheiros API e 83 web ficaram OK; as 23 diferenças eram apenas os 22
  documentos e o wrapper alterados nesta sincronização. Isto confirma que
  `real_dev` não foi modificado.
- O manifesto foi regenerado por allowlist determinística, excluindo secrets,
  ambientes locais, dependências, builds, caches, outputs browser, storage,
  dumps, bytecode, chaves, o próprio manifesto e este report para evitar
  ciclos. A evidence transitória de `real_dev/{api,web}/evidence` saiu da
  allowlist; `docs/evidence` permanece incluído.
- Conteúdo final: 614 ficheiros = 218 em `docs`, 313 API, 81 web,
  `real_dev/.nvmrc` e `scripts/validate-planificacao.sh`. A árvore documental
  substantiva tem agora 219 ficheiros (213 Markdown, 5 Python e 1 JSON), isto é,
  a baseline operacional de 216 mais os três artefactos previstos: contrato
  central, `BK-MF8-06.md` e módulo anti-drift.
- `shasum -a 256 -c <manifesto>`: exit `0`, 614/614 OK. SHA-256 do manifesto:
  `7fe25e67d258447da68d8de768966d8e6814e6182f31c19856460148ec2f0b9c`.
- Lockfiles inalterados: API
  `bf30f03e978506f697051ad88c3a9a3d8e946b636fad52038d7860731a5618df`;
  web
  `e7d1badf295fc9b0f07888022385b3b8d2d30eab8505b1ba4e6975e9709ec084`.
- `git status --short -- apps` e `git diff --quiet -- apps`: sem alterações.
  Não houve `npm install`, alteração de código da aplicação ou commit.

## 10. Reauditorias por fase

| Fase | Data | Auditor | Resultado | Findings reabertos | Evidencia |
| --- | --- | --- | --- | --- | --- |
| F0 | 2026-07-10 | principal + validadores independentes | toolchain/dep/test harness implementados; ambiente incompleto | P1-015, P2-014 permanecem blockers | `GATES-FINAIS-002` |
| F1 | 2026-07-10 | auditor backend/auth independente | código auth/onboarding/outbox/Redis implementado; runtime remoto ausente | P1-016 foi novo e fechado após correção | `PASSWORD-OBSERVABILITY-REAUDIT-001` |
| F2 | 2026-07-10 | auditores integridade/ops independentes | locks, datas, retenção e audit implementados; PG concorrente ausente | P1-004, P1-008, P2-013 reabertos e corrigidos | `RETENTION-FINAL-MUTATIONS-REAUDIT-002` |
| F3 | 2026-07-10 | auditores SAF-T/storage/import independentes | backup/import/cleanup prontos para runtime; SAF-T ainda incompleto | P1-003, P1-017, P2-015, P2-017 reabertos durante ciclos | `REAUDITORIA-IDEMPOTENCIA-009` |
| F4 | 2026-07-10 | auditor frontend/browser independente | 30/30 local; paginação corrigida; browsers ausentes | P2-011 reaberto e confirmado implementado | `REAUDITORIA-PAGINACAO-005` |
| F5 | 2026-07-10 | principal + auditor docs/ops | health/logs/docs/gates fail-closed; 3 blockers honestos | P1-013 e P2-014 reabertos/corrigidos localmente | `GATES-FINAIS-002` |
| F5-docs | 2026-07-10 | principal + dois reauditores independentes | `documentation_sync_pass=true`; 123 mutações; zero drift residual | P1-013 fica IMPLEMENTADO; blockers runtime preservados | `DOCUMENTATION-SYNC-REAUDIT-003` |
| F6 | 2026-07-10 | principal com reauditorias cruzadas | `NO_GO`; nenhum skip convertido em PASS | P1-003 continua EM_CORRECAO; blockers runtime ativos | secções 7, 8 e 11 |

## 11. Decisao final

### Matriz final finding -> ficheiros -> migration -> testes -> resultado -> hashes

O manifesto referido abaixo é
`docs/planificacao/auditorias/evidence/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.sha256`.

| Finding | Ficheiros principais | Migration | Testes finais / runtime | Resultado | Hashes |
| --- | --- | --- | --- | --- | --- |
| `OPSA-E2E-P0-001` | auth/env/Redis rate limit | - | unit verde; Redis 2 instâncias ausente | IMPLEMENTADO | manifesto + diário P0 |
| `OPSA-E2E-P1-001` | onboarding API/UI | 20260709200000 | unit/contract/MSW; PG E2E ausente | IMPLEMENTADO | manifesto + `OUTBOX-HEALTH-PROXY-001` |
| `OPSA-E2E-P1-002` | outbox/SMTP/adapters | 20260709200000 | unit/contracts; SMTP/PG ausentes | IMPLEMENTADO | manifesto + `OUTBOX-HEALTH-PROXY-001` |
| `OPSA-E2E-P1-003` | SAF-T generator/service/UI | 20260709203000, 20260710110000, 20260710123000 | 51 local + 41 reauditoria; XSD/emissão/revisão ausentes | EM_CORRECAO | manifesto + `CORRECAO-CONTRATO-XSD-005` |
| `OPSA-E2E-P1-004` | retention/revisions/gates | 20260629120000, 20260709203000 | local verde; PG/backfill real ausente | IMPLEMENTADO | manifesto + `RETENTION-FINAL-MUTATIONS-REAUDIT-002` |
| `OPSA-E2E-P1-005` | backup/restore/storage | - | local verde; restore remoto ausente | IMPLEMENTADO | manifesto + `BACKUP-READINESS-BULK-AI-003` |
| `OPSA-E2E-P1-006` | sale/purchase approvals | - | concurrency doubles; PG corrida ausente | IMPLEMENTADO | manifesto + `BACKEND-INTEGRIDADE-001` |
| `OPSA-E2E-P1-007` | fiscal close/posting locks | - | local verde; PG corrida ausente | IMPLEMENTADO | manifesto + `BACKEND-INTEGRIDADE-001` |
| `OPSA-E2E-P1-008` | stock/FIFO/count locks | - | local verde; PG concorrente ausente | IMPLEMENTADO | manifesto + `STOCK-FIFO-LOCKED-REAUDIT-001` |
| `OPSA-E2E-P1-009` | users/invitations/locks | 20260709200000 | lifecycle local; PG concorrente ausente | IMPLEMENTADO | manifesto + `INVITATIONS-CONCURRENCY-REDIS-001` |
| `OPSA-E2E-P1-010` | strict date/validators | - | datas impossíveis rejeitadas | IMPLEMENTADO | manifesto + `BACKEND-INTEGRIDADE-001` |
| `OPSA-E2E-P1-011` | multipart/import/XLSX/storage | 20260709203000 | local verde; S3/browser ausentes | IMPLEMENTADO | manifesto + `SAFT-MULTIPART-FAIL-CLOSED-001` |
| `OPSA-E2E-P1-012` | MF1 form/UI IVA | - | frontend local verde; browser ausente | IMPLEMENTADO | manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` |
| `OPSA-E2E-P1-013` | docs validator/defect gate | - | `documentation_sync_pass=true`; 123 mutações; defect report fail-closed | IMPLEMENTADO | manifesto + `DOCUMENTATION-SYNC-REAUDIT-003` |
| `OPSA-E2E-P1-014` | package/lockfiles | - | npm audit API/web 0 vulnerabilidades | IMPLEMENTADO | ambos os lockfiles + manifesto |
| `OPSA-E2E-P1-015` | integration/E2E harness | - | integração 2/7; Playwright 0 iniciado | BLOQUEADO_AMBIENTE | manifesto + `GATES-FINAIS-002` |
| `OPSA-E2E-P1-016` | password policy/hash | - | reauditoria independente verde | FECHADO | manifesto + `PASSWORD-OBSERVABILITY-REAUDIT-001` |
| `OPSA-E2E-P1-017` | backup isolation/cleanup | - | local reauditorado; S3/restore/PG tools ausentes | PRONTO_REAUDITORIA | manifesto + `REAUDITORIA-CLEANUP-007` |
| `OPSA-E2E-RISK-001` | `.gitignore` + controlo SHA | - | `git check-ignore` confirmado | RISCO_ACEITE | lockfiles + manifesto |
| `OPSA-E2E-P2-001` | Router/AuthProvider/layout | - | 30/30 local; browsers ausentes | IMPLEMENTADO | manifesto + `FRONTEND-INDEPENDENT-REAUDIT-001` |
| `OPSA-E2E-P2-002` | selects/editors MF | - | gates locais; browser ausente | IMPLEMENTADO | manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` |
| `OPSA-E2E-P2-003` | apiClient/AuthProvider | - | unit/MSW verde | IMPLEMENTADO | manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` |
| `OPSA-E2E-P2-004` | dateUtils/pages | - | unit local verde | IMPLEMENTADO | manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` |
| `OPSA-E2E-P2-005` | semantics/focus/CSS | - | MF5 local; axe browsers ausente | IMPLEMENTADO | manifesto + `BROWSER-INDEPENDENT-REAUDIT-001` |
| `OPSA-E2E-P2-006` | forms/feedback | - | unit/MSW local verde | IMPLEMENTADO | manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` |
| `OPSA-E2E-P2-007` | attachment API/UI | 20260709203000, 20260710120000 | local/idempotência verde; S3 ausente | IMPLEMENTADO | manifesto + `CORRECAO-IDEMPOTENCIA-008` |
| `OPSA-E2E-P2-008` | statement/reconciliation UI | 20260615130000 | local verde; PG/browser ausentes | IMPLEMENTADO | manifesto + `FRONTEND-CURSOR-PAGINATION-002` |
| `OPSA-E2E-P2-009` | health routes/service | - | local verde; PG/Redis/S3 ausentes | IMPLEMENTADO | manifesto + `CORRECAO-CLEANUP-006` |
| `OPSA-E2E-P2-010` | observability/logger/shutdown | - | unit/contract verde | IMPLEMENTADO | manifesto + `INTEGRITY-OPS-INDEPENDENT-REAUDIT-002` |
| `OPSA-E2E-P2-011` | cursor API/UI/indexes | 20260710090000, 20260710113000 | 25 API + 18 web reauditorados; PG/browser ausentes | IMPLEMENTADO | manifesto + `REAUDITORIA-PAGINACAO-005` |
| `OPSA-E2E-P2-012` | request hardening/proxy | - | MF6 local verde | IMPLEMENTADO | manifesto + `OUTBOX-HEALTH-PROXY-001` |
| `OPSA-E2E-P2-013` | atomic audit/domain/AI | várias expand-first | 84/84 reauditoria; PG real ausente | IMPLEMENTADO | manifesto + `BACKUP-READINESS-BULK-AI-003` |
| `OPSA-E2E-P2-014` | toolchain/gates/runbook | - | gate report vermelho; Node incompatível | BLOQUEADO_AMBIENTE | manifesto + `GATES-FINAIS-002` |
| `OPSA-E2E-P2-015` | operational readiness | - | local reauditorado; PG/Redis/S3 ausentes | PRONTO_REAUDITORIA | manifesto + `REAUDITORIA-CLEANUP-007` |
| `OPSA-E2E-P2-016` | terminal request logging | - | reauditoria independente verde | FECHADO | manifesto + `INTEGRITY-OPS-INDEPENDENT-REAUDIT-002` |
| `OPSA-E2E-P2-017` | bulk/import/idempotency | 20260710120000 | 48/48 reauditoria; PG migration/SQL ausentes | PRONTO_REAUDITORIA | manifesto + `REAUDITORIA-IDEMPOTENCIA-009` |
| `OPSA-E2E-P3-001` | React Router/routes | - | local verde; browser history ausente | IMPLEMENTADO | manifesto + `FRONTEND-FINAL-IMPLEMENTATION-001` |
| `OPSA-E2E-P3-002` | StructuredResult/formatters | - | local verde | IMPLEMENTADO | manifesto + `FRONTEND-INDEPENDENT-REAUDIT-001` |

### Riscos aceites pelo utilizador

- `OPSA-E2E-RISK-001`: `real_dev`, aplicação real e lockfiles continuam
  ignorados/sem CI; o manifesto SHA-256 e este diário são o controlo
  compensatório.
- Ausência deliberada de deployment e scheduler 24/7 no scope académico. Foi
  entregue contrato de execução/agendamento, sem alegação de operação
  permanente.
- Não existem outros riscos aceites. Drivers não canceláveis, dados fiscais,
  serviços remotos e browsers continuam blockers ou riscos residuais dos
  findings correspondentes; não foram promovidos a `RISCO_ACEITE`.

### Decisão académica final

Decisão: `NO_GO`.

Estado documental: `SINCRONIZADO_COM_A_IMPLEMENTACAO_ATUAL`;
`documentation_sync_pass=true`, com zero issues residuais. Este resultado não
altera estados funcionais nem substitui as provas runtime em falta.

Razões:

- `OPSA-E2E-P0-001` está implementado, mas não fechado sem Redis partilhado.
- `OPSA-E2E-P1-003` permanece `EM_CORRECAO`: falta emissão certificada,
  validação do XML por motor XSD 1.1 sobre o esquema oficial `1.04_01`, adapter
  externo, reconciliação/revisão externa e runtime PostgreSQL/S3.
- `OPSA-E2E-P1-015` e `OPSA-E2E-P2-014` estão `BLOQUEADO_AMBIENTE`.
- Backup/restore, readiness e idempotência/import SQL estão prontos para
  reauditoria runtime, mas não fechados sem PostgreSQL/Redis/S3/PG tools.
- Integração termina `2/7`, com cinco falhas ambientais e zero skips;
  Playwright inicia zero testes: Chrome e Edge estão ausentes e Firefox não é
  iniciado porque o preflight aborta toda a matriz.
- Node `24.11.1` não cumpre `>=24.17 <25`; o validador documental mantém três
  blockers, zero advisories e zero waivers.

`PRONTO_ACADEMICO_COM_RISCO_ACEITE` não foi atingido. Só uma nova execução com
serviços remotos, migrations desde zero, restore completo, browsers reais e
validação/revisão SAF-T externa pode alterar esta decisão.
