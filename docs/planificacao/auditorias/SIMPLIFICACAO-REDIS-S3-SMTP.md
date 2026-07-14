# Simplificação de Redis, S3 e SMTP na demo OPSA

- Data: 2026-07-13
- Sistema: `dependencias-externas-redis-s3-smtp`
- Modo: `implementar_simplificacao`
- Implementação: `real_dev/api`
- Runtime alvo: `demo_academica_local`
- Veredito: `PASS_COM_RESSALVAS`

## Resumo e veredito

A demo deixou de criar ou ligar a Redis, S3 ou SMTP por omissão. A composição
central seleciona rate limiting local, storage local privado e email simulado
em `development`/`test`; `production` exige explicitamente Redis, S3 e SMTP.

Os contratos funcionais foram preservados: a autenticação continua limitada, os
anexos e SAF-T continuam a usar o mesmo object storage, e convites, recuperação
de password, alertas e lembretes continuam a entrar na `EmailOutbox` cifrada. O
worker simulado termina a mensagem em `SIMULATED`, nunca em `SENT`, e elimina o
payload cifrado sem expor destinatário, conteúdo, token ou link.

O veredito tem ressalvas porque o checkout não contém `.env`/`DATABASE_URL` para
um arranque com PostgreSQL real e porque o gate legado `test:mf6:env` produz um
falso positivo fora desta alteração. As suites unitárias, de contrato e os
testes focados passaram integralmente.

## Estado anterior

### Redis

- `startServer()` criava sempre `createClient(...)`, ligava Redis antes do
  listener e construía sempre `createRedisRateLimiter(...)`.
- `createApp()` e a readiness exigiam sempre `redisClient`.
- O adapter `createLocalRateLimiter(...)` já existia, com HMAC, TTL e reset, mas
  não era selecionado pelo composition root.
- As rotas de IA já aceitavam `redisClient=null` fora de production-like e
  mantinham um lock no processo, sem prometer coordenação distribuída.

### Storage

- `LocalObjectStorage` e `S3ObjectStorage` já partilhavam o contrato de
  put/get/head/delete/copy/list, metadata, readiness e cleanup.
- O fallback local só era automático em `development` sem qualquer opção S3.
- A raiz local não era montada com `express.static`; downloads continuavam nas
  rotas autenticadas e company-scoped existentes.

### Email

- A API já gravava a `EmailOutbox` cifrada dentro da transação de negócio.
- O worker só construía SMTP e qualquer `provider.send(...)` bem-sucedido era
  persistido como `SENT`.
- O worker já tinha lease, retry exponencial, limite de tentativas e `FAILED`.

## Matriz de modos final

| Serviço | Demo (`development`) | Teste | Production-like (`production`) | Falha esperada |
| --- | --- | --- | --- | --- |
| Redis/rate limit | `REDIS_PROVIDER=local`; memória do processo, HMAC, TTL e reset | local por omissão; Redis/double explícito | `REDIS_PROVIDER=redis` obrigatório | configuração/ligação falha; rate limiter Redis devolve `503`, sem bypass |
| Storage | `STORAGE_PROVIDER=local`; raiz privada | local temporário por omissão ou S3 explícito | `STORAGE_PROVIDER=s3` obrigatório | configuração S3 ausente/parcial/inválida é rejeitada sem fallback |
| Email | `EMAIL_PROVIDER=simulated`; outbox termina em `SIMULATED` | simulated/fake por omissão ou SMTP explícito | `EMAIL_PROVIDER=smtp` obrigatório | SMTP mantém retry e termina em `FAILED` quando esgota tentativas |

## Adapters reutilizados, criados e removidos

Reutilizados:

- `createLocalRateLimiter` e `createRedisRateLimiter`;
- `LocalObjectStorage`, `S3ObjectStorage` e `createBackupObjectStorage`;
- `createEmailOutbox`, `createEmailOutboxWorker` e `buildSmtpEmailProvider`;
- interfaces já injetáveis de `createApp(...)` e dos workers.

Criados/adaptados:

- `buildSimulatedEmailProvider()` sem transport ou rede;
- `createEmailProvider(apiEnv)` como factory do worker;
- seleção central `providers.redis/storage/email` em `loadApiEnv()`;
- readiness condicional para dependências realmente ativas.

Não foi removido código production-like nem adicionada qualquer dependência.

## Compatibilidade de contratos

- Login, registo, forgot/reset e respetivos resets continuam a usar o mesmo
  adapter `consume/reset` e as mesmas políticas.
- Chaves de rate limit continuam derivadas por HMAC; email/IP não ficam em claro
  no store local nem no Redis.
- Em production-like, local/simulated são rejeitados durante configuração e a
  falha Redis continua fail-closed com `RATE_LIMIT_UNAVAILABLE`.
- `createApp(...)` continua a aceitar doubles e passa também a aceitar ausência
  de Redis quando o modo central é local.
- Anexos e SAF-T conservam as interfaces de object storage, autorização,
  metadata e cleanup. S3 parcial continua a falhar.
- Ficheiros e metadata locais são forçados a `0600`; a raiz é criada a `0700`.
- Backups remotos continuam opt-in e exigem bucket S3 dedicado; aliases npm não
  foram alterados.
- Os comandos `worker:email` e `worker:email:drain` mantêm-se compatíveis.
- Não houve alteração de endpoints, schema Prisma, migrations, autenticação,
  autorização ou isolamento multiempresa.

## Fluxos de email simulados

A mesma outbox suporta os motivos existentes:

- `COMPANY_INVITATION`;
- `PASSWORD_RESET`;
- `SMART_ALERT`;
- `PAYMENT_REMINDER`.

O request continua apenas a criar a operação de negócio e a mensagem cifrada na
mesma transação. O drain do worker decifra em memória, chama o provider
simulado, grava `status=SIMULATED`, mantém `sentAt=null` e remove
`encryptedPayload`. A linha da outbox conserva `type`, estado e tentativas para
demonstrar o que teria sido processado, sem criar inbox de tokens.

## Garantias de segurança

- Não existe bypass de autenticação, reset ou convite.
- Não foi criado endpoint/inbox de desenvolvimento.
- O provider simulated não cria transport, não abre rede e não retém a mensagem.
- Logs do worker contêm apenas evento, tipo e estado; não contêm destinatário,
  assunto, corpo, token ou link.
- O estado `SIMULATED` distingue inequivocamente simulação de entrega SMTP.
- Production-like exige providers remotos e TLS para SMTP.
- Storage local mantém traversal rejeitado, nomes/keys controlados, metadata,
  cleanup e downloads pelas rotas autorizadas existentes.
- A aplicação não monta a raiz privada com `express.static`.

## Ficheiros alterados

Implementação e configuração:

- `real_dev/api/src/config/env.js`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/storage/objectStorage.js`
- `real_dev/api/src/modules/ops/healthService.js`
- `real_dev/api/src/modules/ops/healthRoutes.js`
- `real_dev/api/src/modules/notifications/smtpEmailProvider.js`
- `real_dev/api/src/modules/notifications/emailOutboxWorker.js`
- `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js`
- `real_dev/api/scripts/run-email-outbox-worker.mjs`
- `real_dev/api/scripts/check-local-config.mjs`
- `real_dev/api/.env.example`
- `real_dev/api/.env.test.example`

Testes:

- `real_dev/api/tests/unit/local-startup-config.test.js`
- `real_dev/api/tests/unit/local-rate-limit.test.js`
- `real_dev/api/tests/unit/object-storage.test.js`
- `real_dev/api/tests/unit/health-service.test.js`
- `real_dev/api/tests/unit/notification-outbox.test.js`
- `real_dev/api/tests/contracts/mf7-email-contracts.test.js`
- `real_dev/api/tests/contracts/mf8-health.contract.test.js`

Documentação diretamente afetada:

- `real_dev/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md`
- `docs/planificacao/auditorias/SIMPLIFICACAO-REDIS-S3-SMTP.md`

## Testes executados

| Comando | Resultado |
| --- | --- |
| `npm run syntax:check` | PASS |
| testes focados Redis/storage/email/readiness/bootstrap | PASS, 56/56 |
| `npm run test:unit` | PASS, 356/356 |
| `npm run test:contracts` | PASS, 174/174 |
| `npm run test:mf7:email` | PASS, 7/7 |
| `npm run test:mf6:hardening` | PASS |
| `npm run test:mf6:session-cookie` | PASS |
| `npm run test:mf6:env` | BLOQUEADO por falso positivo legado descrito abaixo |
| `npm run demo:check` | BLOQUEADO: checkout sem `.env`/`DATABASE_URL` |
| `git diff --check` | PASS antes da criação deste relatório; repetido no fecho |

## Blockers e riscos residuais

1. `test:mf6:env` classifica `DISPOSABLE_DATABASE_TOKEN` em
   `scripts/postgres-cli.mjs` como provável credencial porque o scanner trata o
   sufixo `TOKEN` seguido de uma expressão regular como segredo. Não existe
   credencial nesse valor. O ficheiro e o scanner são anteriores e não foram
   alterados para evitar uma correção fora do scope.
2. Não existe `.env` neste checkout; `demo:check` para corretamente em
   `DATABASE_URL é obrigatória`. A `.env.example` foi validada em teste e
   seleciona os três adapters locais/simulados.
3. Não foi executado E2E persistido com PostgreSQL real. Composição, contratos
   HTTP e workers foram validados com doubles e suites existentes.
4. Os testes correram com Node.js `v24.11.1`, abaixo do intervalo declarado no
   `package.json` (`>=24.17 <25`). Os resultados são positivos, mas a evidence
   final deve ser repetida numa versão suportada.
5. Rate limiting e locks/quotas de IA não são distribuídos na demo. A proteção
   de autenticação funciona num único processo; production-like conserva Redis.
6. Depois de processada, a outbox simulada não permite recuperar o link secreto.
   Esta limitação é intencional; uma demo que necessite do link deve usar fixture
   determinística separada, nunca logs ou endpoints normais.

## Follow-ups fora de scope

- Corrigir o falso positivo do scanner MF6 numa tarefa própria e reexecutar
  `test:mf6:env`.
- Criar `.env` a partir do exemplo, configurar PostgreSQL local e executar smoke
  autenticado de login, convite, reset, anexo, SAF-T e drain da outbox.
- Rever, sem propagação automática, os guias pedagógicos de health/readiness e
  email worker para refletirem Redis local e `SIMULATED` na demo.

Não foram adicionadas dependências, criadas migrations ou realizados commits.
