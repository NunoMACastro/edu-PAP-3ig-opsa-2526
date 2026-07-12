# BK-MF7-04 - Integração SMTP com outbox persistente

## Header

- `doc_id`: `GUIA-BK-MF7-04`
- `bk_id`: `BK-MF7-04`
- `macro`: `MF7`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF21`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-05`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-04-integracao-com-servicos-de-email-recuperacao-de-password-alertas.md`
- `last_updated`: `2026-07-10`

## Objetivo

Entregar recuperação de password, convites, lembretes e alertas através de uma `EmailOutbox` PostgreSQL e de um worker SMTP separado. A transação de domínio apenas enfileira; o worker faz lease, envio, retry e fecho do item.

## Decisões de segurança

- SMTP é obrigatório em produção/configuração equivalente; não existe fallback para consola ou mock.
- O payload da outbox é cifrado com AES-256-GCM através de `EMAIL_OUTBOX_ENCRYPTION_KEY`.
- Email, token, link completo e conteúdo sensível nunca entram em logs/evidence.
- Tokens de recuperação e convite seguem no fragmento do link do browser e são enviados no body da API depois de lidos; a UI remove-os da URL.
- A resposta a pedidos de recuperação não revela se o utilizador existe.

## Configuração

```text
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_REQUIRE_TLS
SMTP_USER
SMTP_PASSWORD
EMAIL_FROM
EMAIL_OUTBOX_ENCRYPTION_KEY
APP_BASE_URL
```

Valida as variáveis no startup. Não coloques valores reais ou sintéticos em documentação, logs ou comandos de evidence.

## Ficheiros públicos do aluno

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/email/emailOutboxService.js`
- `apps/api/src/modules/email/emailOutboxCrypto.js`
- `apps/api/src/workers/emailOutboxWorker.js`
- `apps/api/src/workers/startEmailWorker.js`
- `apps/api/src/modules/auth/passwordResetService.js`
- `apps/api/src/modules/company/invitationService.js`
- `apps/api/src/modules/notifications/notificationService.js`
- `apps/api/tests/contracts/email-outbox.contract.test.js`
- `apps/api/tests/integration/email-outbox.integration.test.js`

## Tutorial técnico linear

### Passo 1 - Criar `EmailOutbox`

O modelo deve incluir:

- `id`, `type`, `status`;
- payload cifrado, IV e authentication tag;
- `attempts`, `maxAttempts`, `nextAttemptAt`;
- `leaseOwner`, `leaseExpiresAt`;
- `createdAt`, `sentAt`, `failedAt`;
- erro final redigido e índices de polling.

Nunca guardes o token ou o email em colunas pesquisáveis em claro. Se precisares de deduplicação, usa uma chave HMAC apropriada ao evento.

### Passo 2 - Enfileirar na transação de domínio

`requestPasswordReset`, criação/reenvio de convite e criação de notificação persistem o evento e a outbox na mesma transação PostgreSQL. Se a transação falhar, não há mensagem. Se confirmar, o worker pode retomar mesmo depois de reinício.

O producer não liga diretamente ao SMTP.

### Passo 3 - Cifrar o payload

Usa uma chave de 32 bytes fornecida por canal seguro, IV aleatório por mensagem e AES-256-GCM. Autentica também metadata estável necessária para impedir troca de payload entre linhas. A desencriptação falha fechado e marca o item para investigação sem imprimir o conteúdo.

### Passo 4 - Implementar lease atómico

O worker reclama um pequeno lote elegível com uma operação atómica/lock adequado. Apenas um worker pode possuir cada item. Um lease expirado volta a ser elegível depois de crash.

Estados mínimos:

```text
PENDING -> PROCESSING -> SENT
                    \-> RETRY
                    \-> FAILED
```

O retry usa backoff exponencial com jitter e limite de tentativas. Erros permanentes não entram em loop infinito.

### Passo 5 - Enviar por SMTP

Configura `nodemailer` com TLS segundo `SMTP_SECURE` e `SMTP_REQUIRE_TLS`. Verifica ligação no startup do worker sem revelar host/user/password. O envelope e headers usam `EMAIL_FROM` controlado; assunto e templates são construídos por tipo conhecido, não por HTML arbitrário do utilizador.

### Passo 6 - Supervisão e shutdown

Executa o worker como processo separado com:

- health/status próprio não público ou integrado no mecanismo operacional;
- logs JSON redigidos com item ID, tipo, tentativa, duração e resultado;
- polling com intervalo controlado;
- tratamento de sinais;
- fim do polling, espera dos envios em curso e fecho do transporter/Prisma.

Sem supervisor permanente, regista a limitação académica. Não declares entrega contínua apenas porque o worker arranca manualmente.

### Passo 7 - Ligar fluxos

Ligar ao outbox comum:

- recuperação de password;
- convite, reenvio e revogação quando aplicável;
- lembretes;
- alertas/notificações configurados para email.

O link usa `APP_BASE_URL` validado e token no fragmento. A API recebe o token no body, nunca em query params ou logs.

### Passo 8 - Testar em SMTP sandbox

- reset e convite chegam à sandbox;
- mensagem é persistida antes do envio;
- dois workers não enviam a mesma linha em paralelo;
- crash após lease permite recuperação;
- erro temporário faz retry/backoff;
- erro permanente termina em `FAILED`;
- payload adulterado falha GCM;
- logs não contêm email, token, cookie, password ou URL privada;
- shutdown drena item em curso;
- configuração de produção sem SMTP/TLS/outbox key bloqueia startup.

## Validação final

```bash
cd apps/api
npm run test:contracts
npm run test:integration
npm run test:mf7
npm run worker:email
```

O último comando é uma execução controlada, não deve ficar aberto durante um gate não interativo. Regista a prova SMTP por ID técnico redigido, nunca pelo destinatário/token.

## Critérios de aceite

- Todos os fluxos usam uma outbox persistente comum.
- Payload sensível está cifrado em repouso.
- Lease, retry, tentativas e estados são atómicos e retomáveis.
- SMTP/TLS é obrigatório no modo seguro.
- Worker tem logs redigidos, supervisão contratada e shutdown.
- Teste sandbox prova entrega de reset e convite.
- Ausência de ambiente fica `BLOQUEADO_AMBIENTE`, nunca PASS.

## Evidence para PR/defesa

- migration e índices;
- diagrama de estados da outbox;
- teste de dois workers e recuperação de lease;
- contagens de tentativas/retry;
- prova sandbox redigida;
- scan de logs por campos proibidos;
- comandos, exit codes e contagens.

## Importância

Entrega de email é assíncrona e pode falhar depois da transação do utilizador. A outbox evita perder a intenção e permite retoma controlada.

## Scope-in

- Outbox cifrada, worker SMTP, lease, retry, supervisão e quatro fluxos transacionais.

## Scope-out

- Marketing, fallback de produção para logs e supervisor 24/7 não demonstrado.

## Estado antes e depois

- Antes: adapter sem entrega persistente garantida.
- Depois: mensagens retomáveis e provadas numa sandbox SMTP.

## Pre-requisitos

- PostgreSQL, SMTP sandbox, chave de outbox e base URL fornecidos por canal seguro.

## Glossário

- **Lease:** posse temporária e atómica de um item.
- **Backoff:** atraso crescente entre tentativas.
- **Outbox:** fila persistida na mesma base/transação do domínio.

## Conceitos teóricos essenciais

At-least-once exige idempotência/deduplicação no consumidor; GCM protege confidencialidade e integridade do payload.

## Arquitetura do BK

Service de domínio → EmailOutbox PostgreSQL → worker com lease → SMTP → estado/retry e logs redigidos.

## Ficheiros a criar/editar/rever

Revê schema/migration, producers, worker, config e testes sob `apps/api`.

## Cenários negativos mínimos

Executa pelo menos 3 cenários negativos: dois workers concorrentes, payload adulterado e SMTP temporariamente indisponível.

## Handoff

Entrega a `BK-MF7-05` notificações externas persistentes; downloads/exportações continuam separados do email.

## Changelog

- `2026-07-10`: adapter direto substituído por SMTP com outbox cifrada, lease, retry e shutdown.
