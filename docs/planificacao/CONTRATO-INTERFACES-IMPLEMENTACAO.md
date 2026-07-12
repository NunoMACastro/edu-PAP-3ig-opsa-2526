# CONTRATO-INTERFACES-IMPLEMENTACAO

## Header

- `doc_id`: `CONTRATO-INTERFACES-IMPLEMENTACAO`
- `path`: `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-11`

## Objetivo, autoridade e limites

Este é o catálogo único das interfaces técnicas atualmente implementadas na referência privada `real_dev`. Os guias dos alunos traduzem estes contratos para `apps/api` e `apps/web`; nunca copiam caminhos privados.

Em caso de conflito sobre estado, blockers ou validação runtime, prevalece o [relatório canónico de 2026-07-09](auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md). Este catálogo descreve contratos implementados, mas não os declara production-ready nem fecha findings.

A sincronização de IA de 2026-07-11, documentada em `docs/ARQUITETURA-IA-OPSA-V2.md`, é posterior e prevalece apenas para interfaces, modelos e validação desse domínio. Não fecha blockers externos do relatório geral.

## Convenções HTTP transversais

- Autenticação por cookie HttpOnly e autorização por empresa/permissão, deny-by-default.
- Tokens de convite chegam ao browser no fragmento do link, seguem no body da API e são removidos da URL depois de lidos. Tokens, cookies, email e IP em claro não entram em logs.
- Mutações concorrentes usam estado esperado. Quando outra operação já venceu, a API devolve `409` com `code: "STALE_STATE"`.
- Datas de calendário usam `YYYY-MM-DD` estrito; dias impossíveis são rejeitados.
- Uploads são `multipart/form-data` em streaming, com um único ficheiro, limite de 10 MiB, quarentena, validação de assinatura/MIME/extensão, SHA-256, nome de storage aleatório e cleanup compensatório.
- Downloads autorizados definem `Content-Disposition`, `X-Content-Type-Options: nosniff` e política de cache privada/`no-store`.
- Listagens críticas aceitam `cursor` opaco e `limit`; o default é 50 e o máximo 100.

### Inventário nominal auditável

Este bloco duplica apenas método e path para permitir validação automática sem
inferir células de tabelas Markdown:

- `POST /api/onboarding/company`
- `POST /api/invitations/preview`
- `POST /api/invitations/accept`
- `GET /api/company/invitations`
- `POST /api/company/invitations`
- `POST /api/company/invitations/:id/resend`
- `POST /api/company/invitations/:id/revoke`
- `PATCH /api/company/users/:id/role`
- `DELETE /api/company/users/:id`
- `GET /api/notifications`
- `POST /api/notifications/sync`
- `POST /api/accounting/manual-journals/:id/attachments`
- `GET /api/accounting/manual-journals/:journalId/attachments/:attachmentId/download`
- `POST /api/imports/business-data`
- `POST /api/treasury/statements/import`
- `GET /api/treasury/statement-imports`
- `GET /api/treasury/statement-imports/:id`
- `POST /api/compliance/saft/exports`
- `GET /api/compliance/saft/exports/:exportId`
- `GET /api/compliance/saft/exports/:exportId/download`
- `GET /api/health/live`
- `GET /api/health/ready`
- `GET /api/health`
- `POST /api/ai/analysis-runs`
- `GET /api/ai/analysis-runs/:id`
- `GET /api/ai/insights`
- `GET /api/ai/suggestions`
- `GET /api/ai/alerts`
- `GET /api/ai/insights/:id/explanation`
- `PATCH /api/ai/insights/:id/status`
- `PATCH /api/ai/suggestions/:id/status`
- `PATCH /api/ai/alerts/:id/status`
- `GET /api/ai/settings`
- `PATCH /api/ai/settings`
- `GET /api/ai/consent`
- `POST /api/ai/consent`
- `DELETE /api/ai/consent`
- `POST /api/ai/chat/sessions`
- `GET /api/ai/chat/sessions`
- `GET /api/ai/chat/sessions/:id/messages`
- `DELETE /api/ai/chat/sessions/:id`
- `POST /api/ai/chat/sessions/:id/messages`
- `POST /api/ai/chat/messages/:id/feedback`

Envelope nominal: `{ items, pageInfo: { nextCursor, hasNextPage } }`.
Contrato legado `GET /api/compliance/saft`: `REMOVIDO`.

## Autenticação, onboarding e empresas

| Método | Endpoint | Contrato principal | Resultado |
| --- | --- | --- | --- |
| `POST` | `/api/onboarding/company` | Utilizador autenticado cria `Company`, `CompanyProfile`, membership `ADMIN`, `activeCompanyId` e auditoria numa transação. | `201` com empresa/contexto ativo. |
| `POST` | `/api/invitations/preview` | Body contém o token lido do fragmento; não exige contexto de empresa. | Metadados mínimos do convite válido, sem expor hash/token persistido. |
| `POST` | `/api/invitations/accept` | Body contém token; utilizador autenticado aceita atomicamente. | Membership e contexto ativo; conflito stale devolve `409`. |
| `GET` | `/api/company/users` | Requer gestão de utilizadores. | Lista autorizada da empresa ativa. |
| `GET` | `/api/company/invitations` | Requer gestão de utilizadores. | Lista autorizada de convites da empresa ativa. |
| `POST` | `/api/company/invitations` | Email, role e dados mínimos; enqueue na `EmailOutbox` dentro da transação. `GESTOR` não pode convidar `ADMIN`. | Convite criado sem devolver token secreto; `403 ADMIN_ROLE_REQUIRES_ADMIN` quando aplicável. |
| `POST` | `/api/company/invitations/:id/resend` | Apenas convite pendente; roda token e audita atomicamente. Um convite `ADMIN` exige ator `ADMIN`. | Convite atualizado ou `403 ADMIN_MEMBER_REQUIRES_ADMIN`. |
| `POST` | `/api/company/invitations/:id/revoke` | Claim de convite pendente; um convite `ADMIN` exige ator `ADMIN`. | Estado `REVOKED`, `revokedAt` e auditoria com ator. |
| `PATCH` | `/api/company/users/:id/role` | Role válida; ator, role atual e role pretendida são validados depois do lock. | Membership atualizada; `409 CANNOT_CHANGE_SELF_ROLE`, `409 LAST_ADMIN` ou `403` hierárquico. |
| `DELETE` | `/api/company/users/:id` | Lock empresarial protege o último `ADMIN`; `GESTOR` nunca remove `ADMIN`; remoção e auditoria são atómicas. | `204` ou conflito explícito. |

Recuperação de password, convites, lembretes e notificações usam o mesmo adapter transacional de outbox. Login, logout, falhas e resets geram `SecurityAuditEvent` persistente, com identificadores sensíveis derivados por hash/HMAC.

### Permissões funcionais

- `customers.read`, `suppliers.read`, `items.read` e `warehouses.read`: todas as cinco roles.
- `purchase-approval-history.read`: `ADMIN`, `GESTOR`, `AUDITOR`.
- `cashflow-forecast.read` e `executive-kpis.read`: `ADMIN`, `GESTOR`.
- `operational-reports.read`: `ADMIN`, `GESTOR`, `OPERACIONAL`.
- `subscriptions.manage`: `ADMIN`, `GESTOR`.
- `AUDITOR` inclui `reminders.write` e `notifications.read`.
- `GESTOR` não inclui `tax.read` nem `treasury.write`.
- `reports.read` permanece apenas como alias legado; nenhuma rota ou navegação nova depende dele.

O backend é a fonte de autorização. O frontend usa a mesma matriz apenas para não apresentar ações que serão recusadas.

### Notificações

| Método | Endpoint | Contrato principal | Resultado |
| --- | --- | --- | --- |
| `GET` | `/api/notifications` | Lista apenas as notificações do utilizador e empresa ativos. | `200` sem materialização lateral. |
| `POST` | `/api/notifications/sync` | Endpoint legado sem efeitos laterais. | `410 NOTIFICATION_SYNC_MANAGED_BY_WORKER`. |

## IA v2

| Método | Endpoint | Contrato principal |
| --- | --- | --- |
| `POST` | `/api/ai/analysis-runs` | Agenda análise manual do período; devolve `202` com run. |
| `GET` | `/api/ai/analysis-runs/:id` | Estado e resumo seguro do run da empresa ativa. |
| `GET` | `/api/ai/insights`, `/suggestions`, `/alerts` | Leitura paginada sem gerar nem alterar resultados. |
| `PATCH` | `/api/ai/{insights\|suggestions\|alerts}/:id/status` | Lifecycle e feedback autorizados. |
| `GET/PATCH` | `/api/ai/settings` | Opt-in, quotas e regras; apenas `ADMIN`. |
| `GET` | `/api/ai/capabilities` | Disponibilidade, modo efetivo, opt-in, consentimento, política e limites sem segredos. |
| `GET/POST/DELETE` | `/api/ai/consent` | Consulta, aceitação e revogação individual. |
| `POST/GET` | `/api/ai/chat/sessions` | Criação e listagem de sessões do utilizador e empresa ativos. |
| `GET` | `/api/ai/chat/sessions/:id/messages` | Histórico autorizado da sessão. |
| `DELETE` | `/api/ai/chat/sessions/:id` | Hard-delete da sessão e conteúdo cifrado. |
| `POST` | `/api/ai/chat/sessions/:id/messages` | Resposta SSE com events seguros. |
| `POST` | `/api/ai/chat/messages/:id/feedback` | Apenas `USEFUL` ou `NOT_USEFUL`. |

`POST /api/ai/questions` permanece adapter de um turno com `Deprecation` e `Sunset`; não usa Conversations API nem `previous_response_id`. A rota frontend `/ai/questions` redireciona para `/ai/chat`.

PostgreSQL e `aiMetricCatalog.js` são a fonte dos valores. A OpenAI recebe apenas intenção, módulo, qualidade, limitações codificadas e sinais qualitativos. Não recebe pergunta, histórico, IDs, valores ou tools. `facts`, fontes e frases factuais são compostos pelo backend; narrativa externa inválida produz fallback determinístico.

Sessões e mensagens preservam os arrays atuais e acrescentam `pageInfo`. A resposta inclui `payloadVersion: 2` e `facts`, mantendo os campos v1 compatíveis. O stream público limita-se a `message.started`, `tool.started`, `tool.completed`, `message.completed`, `message.failed` e `message.cancelled`; não existe delta sintético.

## Ficheiros, importações e anexos

| Método | Endpoint | Media type/entrada | Resultado |
| --- | --- | --- | --- |
| `POST` | `/api/accounting/manual-journals/:id/attachments` | `multipart/form-data`; campo de ficheiro da rota. | Metadata de `JournalAttachment` depois da promoção para storage. |
| `GET` | `/api/accounting/manual-journals/:journalId/attachments/:attachmentId/download` | Sem body; autorização pela empresa e pelo lançamento. | Stream do objeto com headers de download seguros. |
| `POST` | `/api/imports/business-data` | `multipart/form-data`; ficheiro CSV ou XLSX e campos de tipo da importação. | Resultado/import run; o binário não entra no JSON. |
| `POST` | `/api/treasury/statements/import` | `multipart/form-data`; ficheiro CSV/OFX/XLSX e `treasuryAccountId`. | Importação e transações candidatas. |
| `GET` | `/api/treasury/statement-imports` | `cursor` e `limit` opcionais. | Envelope paginado de importações. |
| `GET` | `/api/treasury/statement-imports/:id` | ID pertencente à empresa ativa. | `{ statementImport }`. |

O metadata fica em PostgreSQL; o binário fica em S3 compatível fora de development. Falhas entre quarentena, base de dados e promoção executam cleanup para não deixar metadata ou objetos órfãos.

## SAF-T

| Método | Endpoint | Contrato | Resultado |
| --- | --- | --- | --- |
| `POST` | `/api/compliance/saft/exports` | Body `{ "type": "FULL", "fiscalPeriodId": "<id>" }`; o período fiscal é a única origem do intervalo. | `202` com `{ export }`. |
| `GET` | `/api/compliance/saft/exports/:exportId` | Exportação da empresa ativa. | Metadata, estado e resultados de validação. |
| `GET` | `/api/compliance/saft/exports/:exportId/download` | Só exportação concluída e autorizada. | XML Windows-1252 armazenado em S3. |

O exportador usa namespace e XSD oficial `1.04_01`, master files, tax table, documentos e movimentos contabilísticos. O fluxo é fail-closed por `SAFT_EXPORT_ENABLED=false` até passarem XSD, reconciliação de totais, pipeline externo e revisão contabilística.

### Contrato removido

`GET /api/compliance/saft` foi removido no mesmo release coordenado. Não existe fallback JSON/XML para o exportador antigo, e nenhum guia o pode apresentar como funcional.

## Health, observabilidade e shutdown

| Método | Endpoint | Semântica |
| --- | --- | --- |
| `GET` | `/api/health/live` | Apenas prova que o processo HTTP responde; não consulta dependências. |
| `GET` | `/api/health/ready` | Verifica PostgreSQL, Redis e object storage crítico; devolve `503` se algum estiver indisponível. |
| `GET` | `/api/health` | Alias de readiness, com a mesma semântica e os mesmos estados HTTP. |

A API aceita ou cria request ID validado, emite logs JSON de início/fim, duração e route template, redige erros e drena HTTP antes de `prisma.$disconnect()` no shutdown. `TRUST_PROXY_HOPS` controla explicitamente os saltos confiáveis; o default é `0`.

## Envelope de paginação

Todas as listagens críticas usam exatamente esta forma externa:

```json
{
  "items": [],
  "pageInfo": {
    "nextCursor": null,
    "hasNextPage": false
  }
}
```

- `nextCursor` é opaco para o browser e só é reenviado como query param.
- `hasNextPage=false` implica `nextCursor=null`.
- `limit` tem default 50, mínimo 1 e máximo 100.
- A ordenação inclui sempre um desempate estável por ID.
- Exportações que percorrem várias páginas têm um limite total próprio e não expõem cursores internos no ficheiro final.

Aplicam-se envelopes paginados, pelo menos, a contas, clientes, fornecedores, itens, documentos de venda/compra, movimentos de stock, lançamentos manuais, títulos em aberto, importações de extrato, relatórios contabilísticos, audit logs e integration logs. O frontend deve atualizar os consumidores no mesmo release em que uma listagem adota o envelope.

## Modelos e invariantes de dados

| Modelo/campo | Contrato atual |
| --- | --- |
| `EmailOutbox` | Payload cifrado AES-256-GCM, `dedupeKey`, estado, tentativas, `nextAttemptAt`, lease (`lockedAt`/`lockedBy`), erro redigido e `sentAt`. |
| `SecurityAuditEvent` | Evento/outcome persistentes; `ipHash` e `subjectHash` sem email/IP em claro; detalhes sem segredos. |
| `CompanyInvitation` | `acceptedById`, `acceptedAt` e `revokedAt`; o ator da revogação fica no `AuditLog` atómico. |
| `JournalEntryRevision` | `snapshotBefore`, `snapshotAfter`, motivo, ator e número de revisão antes de substituir linhas manuais. |
| `JournalAttachment` | `sha256`, provider, status, `storageMetadata`, `storageKey`, tamanho, MIME e idempotency key. |
| `SaftExportRun` | `type`, `fiscalPeriodId`, storage key, SHA-256, tamanho, status e resultados XSD/totais/revisão externa. |
| `FiscalPeriod.fiscalYear` | Ano fiscal explícito e nullable. Registos legados permanecem `NULL` até classificação por pessoa autorizada; a aplicação não o infere nem faz backfill automático a partir das datas. |
| `RetentionHold` | Hold idempotente por empresa/entidade, ligado a períodos fechados e operações contabilísticas finais. |
| `AiInsight` e `SmartAlert` | Regra/versão, fingerprint, score, prioridade, período, evidência, ocorrências, origem e lifecycle. |
| `AiActionSuggestion` | Estados `OPEN`, `ACCEPTED`, `DISMISSED`, `DONE`, feedback e conclusão sem substituir o autor. |
| `CompanyAiSettings` e `AiRuleSetting` | Opt-in, política, quotas, regras ativas e thresholds limitados por empresa. |
| `AiUserConsent` | Consentimento individual por empresa e versão da política. |
| `AiChatSession` e `AiChatMessage` | Ownership empresa/utilizador, conteúdo e aliases cifrados, expiry e feedback controlado. |
| `AiUsageEvent` e `AiDeletionAudit` | Metadados minimizados de uso e HMAC de eliminação, sem prompts ou valores financeiros. |
| `AiAnalysisRun` | Execução manual/sistema, lease seguro, período, scopes e estados do worker. |
| Índices de paginação | Índices compostos por empresa, ordenação e ID para cursor estável; não substituem filtros de autorização. |

Escrita de negócio, revisão/hold e `AuditLog` pertencem à mesma transação. Correções históricas são reversões auditadas; um fecho ou hold impede destruição silenciosa.

## Migrations de sincronização

As migrations seguem expand-and-contract quando existe uma transformação segura.
Campos contabilísticos que exigem decisão humana, como `fiscalYear`, são
adicionados nullable e bloqueiam o fluxo dependente até classificação
autorizada; não recebem backfill inventado.

| Migration | Responsabilidade |
| --- | --- |
| `20260629120000_mf7_retention_holds` | Retention holds. |
| `20260709200000_auth_onboarding_email_outbox` | Onboarding, convites, outbox e eventos de segurança. |
| `20260709203000_e2e_integrity_files_saft` | Revisões, metadata de ficheiros e export runs SAF-T. |
| `20260710090000_critical_listing_pagination` | Primeiro conjunto de listagens críticas. |
| `20260710110000_saft_internal_source_fields` | Campos fonte necessários à reconciliação SAF-T. |
| `20260710113000_cursor_listing_indexes` | Índices compostos para cursor pagination. |
| `20260710120000_attachment_content_idempotency` | Idempotência de anexos e conteúdo. |
| `20260710123000_fiscal_period_explicit_fiscal_year` | Adiciona ano fiscal explícito nullable e valida apenas o intervalo; proíbe inferência e backfill automático. |
| `20260711120000_ai_restructure` | Métricas/reporting v2, lifecycle, settings, consentimento, chat cifrado, uso, regras, runs e auditoria de eliminação. |

Nenhuma migration é considerada provada apenas por leitura estática: o gate exige aplicação desde uma base vazia e validações numa base remota descartável. Backfills só existem quando a migration os define e a origem dos dados é legítima.

## Configuração por ambiente

Valores reais entram apenas por canal seguro. Evidence e exemplos nunca incluem passwords, tokens, cookies, credenciais ou URLs com user/password.

### PostgreSQL

- `DATABASE_URL`: base da instância em execução.
- `TEST_DATABASE_URL`: base remota efémera e não produtiva para integração.
- `RESTORE_DATABASE_URL`: base remota descartável e separada para roundtrip de backup.

### Redis e rate limiting

- `REDIS_URL`
- `REDIS_KEY_PREFIX`
- `RATE_LIMIT_HMAC_KEY`

Fora de development, as três são obrigatórias e não existe store em memória como fallback.

### SMTP e outbox

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_REQUIRE_TLS`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_FROM`
- `EMAIL_OUTBOX_ENCRYPTION_KEY`
- `NOTIFICATION_WORKER_INTERVAL_MS` (`300000` por omissão; mínimo `60000`, máximo `86400000`)

Produção/configuração equivalente proíbe provider de log/mock e exige TLS conforme a política do sandbox/servidor.

### Object storage e backups

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE`
- `S3_SSE`
- `BACKUP_S3_BUCKET`
- `BACKUP_S3_PREFIX`
- `BACKUP_RETENTION_DAYS`
- `OPSA_BACKUP_MANIFEST_KEY`
- `OPSA_BACKUP_MANIFEST_SHA256`

O bucket de backup é distinto do bucket funcional. O adapter local é selecionável apenas em development através de `OPSA_PRIVATE_STORAGE_ROOT`.

### Runtime e SAF-T

- `APP_BASE_URL`
- `TRUST_PROXY_HOPS`
- `SAFT_EXPORT_ENABLED`
- `SAFT_XSD_PATH`

### IA e OpenAI opcional

- `AI_PROVIDER_MODE` (`disabled` por omissão ou `openai`)
- `AI_CHAT_ENABLED` (explícita em produção)
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TIMEOUT_MS`
- `OPENAI_MAX_OUTPUT_TOKENS`
- `AI_USER_DAILY_TURN_LIMIT`
- `AI_COMPANY_DAILY_TURN_LIMIT`
- `AI_CHAT_RETENTION_DAYS`
- `AI_WORKER_INTERVAL_MS`
- `AI_WORKER_POLL_INTERVAL_MS`
- `AI_WORKER_LEASE_MS`
- `AI_WORKER_MAX_ATTEMPTS`
- `AI_WORKER_BATCH_SIZE`
- `AI_CHAT_ENCRYPTION_KEY`
- `AI_SAFETY_HMAC_KEY`

A aplicação arranca sem OpenAI quando `AI_PROVIDER_MODE=disabled`. A chave OpenAI nunca chega ao browser. A chave AES do chat deve representar 32 bytes e não pode reutilizar `EMAIL_OUTBOX_ENCRYPTION_KEY`.

### Smoke e carga opcionais

- `OPSA_API_BASE_URL`
- `OPSA_CONCURRENCY_PATHS`
- `OPSA_SESSION_COOKIES_JSON`
- `OPSA_SKIP_PERSISTENCE_TESTS`

Estas variáveis não pertencem ao contrato normal da aplicação. `OPSA_SKIP_PERSISTENCE_TESTS` só serve diagnóstico local; o gate final exige `false` e zero skips.

## Workers e processos operacionais

API, materialização de notificações e envio SMTP são três processos separados. A API atende HTTP; o worker de notificações cria notificações e registos `EmailOutbox`; o worker de email é o único consumidor SMTP.

### Notificações

- Processo contínuo: `npm --prefix apps/api run worker:notifications`.
- Ciclo finito: `npm --prefix apps/api run worker:notifications:drain`.
- As empresas são percorridas em páginas de 100 e cada empresa usa uma transação independente.
- Falhas isoladas não interrompem o ciclo; o resumo estruturado inclui empresas processadas/falhadas, notificações materializadas e emails enfileirados.
- O runtime impede ciclos sobrepostos no mesmo processo.

### EmailOutbox

- Processo contínuo: `npm --prefix apps/api run worker:email`.
- Drenagem finita para teste/encerramento controlado: `npm --prefix apps/api run worker:email:drain`.
- O arranque verifica SMTP antes de consumir mensagens.
- O worker reclama uma mensagem por lease atómico, recupera leases expirados, incrementa tentativas e usa backoff exponencial limitado.
- Sucesso marca `SENT`; esgotar tentativas marca falha persistente sem registar payload ou destinatário.
- Um supervisor académico inicia API e worker separadamente, reinicia o worker após falha, envia `SIGTERM`, aguarda drenagem/desconexão e trata exit code não zero como blocker.

### IA

- Processo contínuo: `npm --prefix apps/api run worker:ai`.
- Drenagem finita: `npm --prefix apps/api run worker:ai:drain`.
- Agenda runs horários, reclama batches de forma concorrente segura, atualiza lifecycle e elimina sessões expiradas.
- Desativar `AI_PROVIDER_MODE` interrompe chamadas externas sem desligar métricas, insights, alertas ou fallback determinístico.

### Backup e restore

- Backup diário demonstrável: `npm --prefix apps/api run mf7:backup`.
- Verificação do manifesto: `npm --prefix apps/api run mf7:backup:verify`.
- Prova roundtrip: `npm --prefix apps/api run mf7:backup:roundtrip`.
- A prova válida descarrega bundle/objetos por hash, restaura PostgreSQL numa base descartável e compara entidades. Listar um dump não prova restauro.
- A PAP documenta o contrato de agendamento diário, mas não alega scheduler permanente.

## Estado de validação

A documentação pode atingir `documentation_sync_pass=true` enquanto o estado global permanece `NO_GO`. Só o relatório canónico pode alterar essa decisão depois de integração PostgreSQL/Redis/SMTP/S3, browser E2E, restore e validação externa SAF-T sem blockers.

## Changelog

- `2026-07-11`: acrescentados contratos canónicos de métricas, lifecycle, analysis runs, chat OpenAI controlado, privacidade, settings, consentimento, worker e UI da IA v2.
- `2026-07-10`: catálogo criado a partir das interfaces, schema, migrations e configuração da implementação de referência corrigida.
