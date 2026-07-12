# Relatório de correção integral da IA em `real_dev`

Data: 2026-07-12

Âmbito: `real_dev/api`, `real_dev/web`, migration Prisma, workers, testes e documentação IA

Estratégia: migration aditiva e cutover coordenado, sem dependências novas

## Resultado executivo

Os dezoito findings receberam correção de implementação. As suites unitárias/contratuais, Prisma, builds e gates locais passaram. O estado global é `IMPLEMENTADO_COM_PROVA_LOCAL_E_CUTOVER_BLOQUEADO_POR_AMBIENTE`: não é correto declarar o cutover operacional concluído sem PostgreSQL, Redis, SMTP e browsers reais neste ambiente.

Invariantes preservados:

- IA read-only e company-scoped;
- nenhuma alteração automática a contabilidade, stock, pagamentos ou preços;
- migration apenas aditiva;
- mensagens cifradas v1 continuam legíveis;
- `POST /api/ai/questions` permanece com o `Sunset` publicado, mas já não escreve `AiQuestionRun`;
- nenhum registo legado é removido;
- nenhuma dependência foi acrescentada.

## Matriz IA-01 a IA-18

| Finding | Estado de código | Prova local | Fecho operacional |
| --- | --- | --- | --- |
| IA-01 | SmartAlert filtrado por `AI_ALERTS_READ`; lembretes inalterados; upsert não limpa `readAt`. | Teste ADMIN/GESTOR/OPERACIONAL e preferências. | Fechado localmente; SMTP/outbox real pendente. |
| IA-02 | Provider qualitativo; `facts` e `answer` factuais compostos no backend; números/moeda/%/aliases/referências rejeitados. | Unit de narrativa e factos. | Fechado localmente. |
| IA-03 | Caminho externo sem full scan, aliases indiscriminados ou resolução N+1; contexto valida uma entidade por query. | Teste impede scans e confirma uma query de entidade/uma tool. | Fechado localmente. |
| IA-04 | Recusas, falhas e cancelamentos consomem turno; caps de sessão/mensagem e rate limits estáveis. | Outcomes `REFUSED/CANCELLED/FAILED`, caps 409 e quota atómica. | Redis real pendente. |
| IA-05 | Leases, heartbeat, reclaim, três tentativas e backoff; bucket horário único. | Lease ativo/expirado e terceira falha terminal. | Concorrência PostgreSQL real pendente. |
| IA-06 | Scopes fechados e dependência `SUGGESTIONS -> INSIGHTS`; período/status/rule/origin entram na query e persistência/resolução respeita scopes. | Units de scopes e query shape. | Fechado localmente. |
| IA-07 | Permissões de gestão próprias; lifecycle fechado, claim otimista e AuditLog transacional. | Matriz de roles, corrida com um vencedor e run+audit na mesma transação. | HTTP persistido real pendente. |
| IA-08 | Reserva Redis/Lua conjunta de utilizador e empresa, fail-closed em produção. | Vinte reservas concorrentes respeitam limite dois. | Redis real pendente. |
| IA-09 | Classificador local fixa uma tool/período; provider não escolhe tools. | Payload fake contém apenas contrato canónico. | Fechado localmente. |
| IA-10 | API, worker e seed usam `aiAnalysisService`; pipeline MF4 ficou sem imports runtime; `AiQuestionRun` é read-only. | Scans sem imports runtime/escritas legadas; sourceQuality v2 testada. | Seed persistida real pendente. |
| IA-11 | Texto livre e histórico nunca saem da API; provider recebe apenas intenção/sinais/códigos qualitativos; DLP permanece como defesa adicional. | Captura de payload sem pergunta, ID ou valor. | Fechado localmente. |
| IA-12 | Cobertura considera todas as contas existentes no início; falta de snapshot produz `PARTIAL`; regra crítica exige `COMPLETE`. | Unit com conta coberta e conta em falta. | Fixture PostgreSQL real pendente. |
| IA-13 | Margem por `groupBy`; PMR/PMP agregados; recebíveis e stock histórico por CTE parametrizada; detalhes limitados a dez. | Query shape e carga lógica de 5 000 registos. | Comparação SQL real/fixtures pendente. |
| IA-14 | `GET /capabilities`; `AI_CHAT_ENABLED`; chave válida no startup/readiness; UI distingue cinco estados. | Env/readiness, contrato API e unit UI. | Smoke de deploy pendente. |
| IA-15 | Sessões 20/página e mensagens 50/página com cursor estável e recentes primeiro; DTO v1/v2 normalizado. | Teste com 21 sessões e 201 mensagens. | Fechado localmente. |
| IA-16 | Estado React partilhado; AbortSignal browser/rota/provider; `message.cancelled`; sem delta sintético. | Unit/contrato frontend e backend. | E2E browser bloqueado por Chrome/Edge ausentes. |
| IA-17 | Modelo explícito apenas em modo OpenAI; `.env.example`, arquitetura, runbook e MF4/MF8 sincronizados; contagens só neste snapshot. | Contratos source/env/docs e gates MF8. | Fechado localmente. |
| IA-18 | Testes negativos novos cobrem as garantias principais e os gates locais passam. | Resultados abaixo. | Integração real e E2E continuam bloqueados. |

## Alterações públicas

- novo `GET /api/ai/capabilities`;
- `pageInfo` em sessões/mensagens, preservando os arrays;
- `payloadVersion: 2` e `facts` na resposta;
- SSE sem `message.delta` e com `message.cancelled`;
- novas permissões `AI_ANALYSIS_RUN`, `AI_INSIGHTS_MANAGE`, `AI_SUGGESTIONS_MANAGE` e `AI_ALERTS_MANAGE`;
- erros estáveis de chat, limites, lease e retries;
- migration `20260712210000_ai_hardening`;
- compactação idempotente `npm run ai:compact-aliases`.

## Evidência executada

Snapshot desta execução:

- `npm test` na API, fora do sandbox devido a sockets Supertest: 332 unitários + 173 contratuais, todos passados;
- `npm run syntax:check`: passado;
- `prisma validate` e `prisma generate`: passados com URL técnica não conectada;
- `npm run test:mf6`: passado após sincronizar o gate de env;
- `npm run test:mf7`: passado;
- `npm run test:mf8`: passado;
- web `npm run typecheck`: passado;
- web `npm run test:unit`: 48 testes passados;
- web `npm run build`: passado;
- web gates MF7 e MF8: passados;
- `npm audit --omit=dev --json`: zero vulnerabilidades de produção;
- scan runtime: sem import de `aiService.js`, sem escrita `AiQuestionRun`, sem uso runtime de pseudonimização e sem `message.delta`.
- `scripts/validate-planificacao.sh`: cobertura, consistência, guides e sincronização documental passaram; o estado global permaneceu `NO_GO` por findings/evidence blockers E2E já existentes fora deste âmbito.

## Bloqueios ambientais reproduzidos

`npm run test:integration` não teve configuração de `TEST_DATABASE_URL`, Redis e SMTP: duas provas puramente locais passaram e cinco suites persistidas terminaram por pré-condição ausente. `npm run test:seed:integration` terminou por ausência de `TEST_DATABASE_URL` efémera. O E2E fake não arrancou porque o gate exige Google Chrome e Microsoft Edge instalados.

Não foram executados, e por isso não são declarados como provados:

- aplicação real da migration e rollback num PostgreSQL descartável;
- quota Lua e reclaim de lease entre processos Redis/PostgreSQL reais;
- entrega SMTP/outbox real;
- smoke autenticado de cutover;
- E2E browser fake completo;
- smoke OpenAI real opcional.

## Riscos residuais e próximos passos de cutover

1. Disponibilizar PostgreSQL de teste, Redis e SMTP reais e repetir integração/seed.
2. Aplicar a migration numa cópia descartável, comparar métricas antigas/novas e provar restore.
3. Instalar Chrome e Edge exigidos pelo gate e correr o E2E fake.
4. Executar o runbook `real_dev/api/docs/ai-operations.md`, primeiro com provider desativado.
5. Só depois, opcionalmente, ativar OpenAI numa empresa demo e executar smoke manual sem dados reais.

Até essas provas existirem, a correção está pronta para revisão e ensaio de cutover, mas não deve ser descrita como deploy concluído ou production-ready.
