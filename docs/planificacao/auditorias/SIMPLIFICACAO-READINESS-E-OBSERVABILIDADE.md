# Simplificação de readiness e observabilidade da OPSA

**Data:** 2026-07-12

**Sistema:** `readiness-observabilidade`

**Implementação:** `real_dev/api`

**Modo:** `implementar_simplificacao`

**Decisão:** `SIMPLIFICADO_COM_RISCOS`

## Resumo executivo

O readiness público deixou de executar uma auditoria profunda a cada pedido.
PostgreSQL usa agora `SELECT 1`, Redis usa apenas `PING` e o storage usa uma
operação read-only coerente com o adapter ativo: `HeadBucket` em S3 ou
verificação de acesso à raiz local já preparada pelo bootstrap. Não são criadas
linhas, chaves Redis ou objetos no hot path.

As provas profundas existentes foram preservadas num comando operacional
explícito, `npm --prefix real_dev/api run health:deep-check`. Esse comando
confirma permissões PostgreSQL, executa `SET/GET/DEL` sobre uma chave efémera e
prova `PUT/HEAD/GET/DELETE` com cleanup no storage. Não foi criado um endpoint
público adicional.

A observabilidade HTTP passou de dois eventos por pedido para exatamente um
evento terminal. Mantém request ID, método, route template, status, duração,
outcome e tipo de erro limitado. O error boundary e o shutdown não foram
alterados. A política do logger foi reforçada para rejeitar emails completos,
tokens compostos, prompts/respostas de IA, stack traces e payloads financeiros,
sem bloquear métricas agregadas como `emailsQueued`.

Os paths `/api/health/live`, `/api/health/ready` e `/api/health` foram
preservados. A demo atual continua a exigir PostgreSQL, Redis e storage porque
essa é a composição funcional efetiva documentada; OpenAI aparece apenas como
`disabled` ou `optional` e nunca torna o percurso base indisponível.

## Contrato antes/depois

| Capacidade | Antes | Depois | Compatibilidade |
| --- | --- | --- | --- |
| liveness | Payload do processo, sem dependências | Sem alteração | Path, HTTP 200 e campos anteriores preservados |
| readiness demo | Catálogo/permissões CRUD PostgreSQL, `PING+SET+GET+DEL` Redis e objeto completo de storage em cada pedido | `SELECT 1`, `PING` e probe read-only; PostgreSQL/Redis/storage continuam críticos na composição atual | `ready/not_ready`, `200/503`, service, version, timestamp e lista de dependências preservados; `profile`/`required` são aditivos |
| readiness production | As três dependências críticas, sem fallback local | As mesmas dependências com probes mínimos e fail-closed | Falha crítica continua a devolver 503; sem fallback silencioso |
| deep diagnostics | Misturados no readiness público | Comando explícito `health:deep-check` | Capacidade preservada fora do hot path |
| request logs | `http.request.start` e um terminal | Exatamente um terminal | Request ID e nomes dos eventos terminais preservados |
| error logs | Tipo de erro limitado, sem mensagem | Igual, com denylist reforçada | Error boundary continua genérico e inclui request ID |
| shutdown | Drenagem HTTP, timeout, Redis e Prisma | Sem alteração | `stop()` continua idempotente e imports não registam sinais |

## Dependências por perfil

### Demo académica local

| Dependência | Estado na composição | Probe normal | Impacto |
| --- | --- | --- | --- |
| PostgreSQL | obrigatória | `SELECT 1` no cliente gerido | falha produz 503 |
| Redis | obrigatória para rate limits/quotas da demo atual | `PING` | falha produz 503 |
| Storage local | obrigatório e preparado no bootstrap | acesso read-only à raiz existente | falha produz 503 |
| OpenAI | desativada por omissão ou opcional | sem chamada remota | aparece `disabled`/`optional`; não falha readiness |
| SMTP/workers/backups | não compostos no processo HTTP normal | nenhum | não aparecem numa lista fixa artificial |

### Production-like

- PostgreSQL, Redis e S3 continuam críticos e fail-closed.
- `createObjectStorage` continua a proibir fallback local fora de development.
- O probe S3 é `HeadBucket`; não cria objetos.
- OpenAI continua opcional no percurso base e não é contactada pelo readiness.
- Configuração production-like inválida continua a falhar antes do listener.

## Probes normais e diagnóstico profundo

### Hot path público

1. PostgreSQL: uma query constante e read-only, sem transação nem catálogo.
2. Redis: `PING`, sem prefixo, chaves ou TTL.
3. S3: metadata do bucket com `HeadBucket`.
4. Storage local: `access` com permissões de leitura/escrita sobre a raiz já
   criada no bootstrap; a operação não cria diretórios ou ficheiros.
5. Timeout individual até 1500 ms por omissão, com `AbortSignal` cooperativo.

### Gate explícito

```bash
npm --prefix real_dev/api run health:deep-check
```

O gate reutiliza os helpers profundos anteriores. A prova unitária confirmou
`SET/GET/DEL` com cleanup e a chamada ao diagnóstico operacional de storage. A
prova real contra infraestrutura não foi executada por falta de configuração e
serviços locais neste checkout.

## Eventos finais de log

Cada pedido produz no máximo um dos eventos:

- `http.request.finish`;
- `http.request.close`;
- `http.request.aborted`;
- `http.request.error`.

O contexto é fechado a valores primitivos e contém apenas request ID, método,
route template, duração, outcome, status quando observável e classificação de
erro quando aplicável. `finish`, `close`, `aborted` e error boundary competem
pelo mesmo logger terminal idempotente.

Não ficou qualquer consumer real de `http.request.start`; os testes e os três
documentos diretamente afetados foram atualizados para o contrato terminal.

## Garantias de privacidade

- URL concreta, query string, params, headers e body não entram no evento HTTP.
- Route template usa a rota Express e nunca IDs concretos.
- Mensagens e nomes de erro não aprovados não entram no log.
- O logger rejeita chaves que representem authorization, cookies, credenciais,
  emails completos, NIF, IBAN, passwords, secrets, tokens, prompts, stacks e
  payloads/respostas sensíveis.
- Métricas agregadas sem dados pessoais, como `emailsQueued`, continuam válidas.
- Uma falha do writer continua absorvida e nunca altera a resposta HTTP.

## Compatibilidade pública

- `/api/health/live`, `/api/health/ready` e `/api/health` mantêm-se públicos.
- O alias continua a executar exatamente o handler de readiness.
- Liveness mantém o payload anterior.
- Readiness mantém `status`, `service`, `version`, `checkedAt` e
  `dependencies`; `profile` e `required` são campos aditivos seguros.
- Dependências críticas mantêm `up/down`; OpenAI usa `disabled/optional` e
  `required=false`.
- `X-Request-ID` mantém-se e UUID externo inválido continua substituído.
- O error boundary continua a devolver `INTERNAL_SERVER_ERROR`, mensagem
  genérica e request ID.
- `createApp(...)` continua importável/testável com doubles e não abre listener.
- Não foram alteradas regras de domínio, auth, sessões, roles, multiempresa,
  Prisma schema/migrations, UI, IA funcional, SAF-T, subscrições ou backups.

## Ficheiros alterados

### Implementação e scripts

- `real_dev/api/src/modules/ops/healthService.js`;
- `real_dev/api/src/modules/ops/healthRoutes.js`;
- `real_dev/api/src/modules/ops/requestObservability.js`;
- `real_dev/api/src/modules/ops/structuredLogger.js`;
- `real_dev/api/src/modules/storage/objectStorage.js`;
- `real_dev/api/src/server.js`;
- `real_dev/api/scripts/run-readiness-deep-diagnostic.mjs`;
- `real_dev/api/package.json`.

### Testes

- `real_dev/api/tests/unit/health-service.test.js`;
- `real_dev/api/tests/unit/request-observability.test.js`;
- `real_dev/api/tests/unit/structuredLogger.test.js`;
- `real_dev/api/tests/unit/local-startup-config.test.js`;
- `real_dev/api/tests/contracts/mf8-health.contract.test.js`;
- `real_dev/api/tests/contracts/request-observability.contract.test.js`;
- `real_dev/api/tests/contracts/server-bootstrap.test.js`;
- `real_dev/api/tests/integration/auth-onboarding-email-persistence.test.js`.

### Documentação diretamente afetada

- `docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md`;
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md`;
- `docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md`;
- `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`;
- `docs/evidence/MF8/BK-MF8-02.md`;
- este relatório.

As alterações preexistentes em `CONTRATO-STACK-IMPLEMENTACAO.md`, no guia
`BK-MF7-01` e nos relatórios de arranque/backups foram preservadas e não fazem
parte desta execução.

## Testes e resultados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run syntax:check` | PASS; todos os ficheiros JS/MJS válidos |
| `npm --prefix real_dev/api run test:unit` fora do sandbox | PASS; 353/353 |
| `npm --prefix real_dev/api run test:contracts` fora do sandbox | PASS; 173/173 |
| testes focados health/observabilidade/storage/shutdown | PASS; 43/43 sem listener |
| health unitário + contrato MF8 | PASS; 17/17 |
| `npm --prefix real_dev/api run test:mf6:https` | PASS |
| `npm --prefix real_dev/api run test:mf6:hardening` | PASS |
| `npm --prefix real_dev/api run test:mf8` | PASS; subscriptions, explainability, governance, documentação e inventário |
| smoke HTTP com porta efémera e doubles | PASS; `/live` 200 e `/ready` 200; um evento terminal por pedido |
| `git diff --check` | PASS |

As primeiras duas provas Supertest dentro do sandbox falharam apenas com
`listen EPERM`. A repetição integral fora do sandbox passou 353/353 e 173/173.

## Validações bloqueadas ou não executadas

- Não existe `real_dev/api/.env` neste checkout.
- Não foram fornecidas credenciais/serviços PostgreSQL, Redis e S3 reais.
- Por isso, `npm --prefix real_dev/api run health:deep-check` não foi executado
  contra infraestrutura real.
- O smoke HTTP usou uma porta real e pedidos `fetch`, mas dependências injetadas;
  não prova conectividade PostgreSQL/Redis/S3 da máquina de demonstração.
- Não foi necessário nem autorizado realizar commits.

## Riscos residuais

1. A máquina de demonstração ainda deve executar `/ready` e
   `health:deep-check` com os serviços reais antes da apresentação.
2. Drivers externos que não cooperem com `AbortSignal` podem continuar trabalho
   interno após o timeout, embora a resposta pública não fique pendurada; os
   probes normais foram reduzidos precisamente para minimizar esse risco.
3. Os campos aditivos `profile` e `required`, e o item informativo OpenAI,
   devem ser tratados por consumers como extensão compatível. A pesquisa no
   repositório encontrou apenas testes/documentação, todos atualizados.

## Decisão final

`SIMPLIFICADO_COM_RISCOS`

O código e os contratos estão simplificados e com regressão limpa. Liveness é
isolada, readiness normal é barato e não mutável, dependências opcionais não
falham o perfil base, o diagnóstico profundo continua disponível, cada request
gera um único evento terminal seguro, e error boundary/shutdown mantêm-se.

O risco restante é exclusivamente operacional: falta executar readiness e o
gate profundo contra PostgreSQL, Redis e S3 reais da instalação final.
