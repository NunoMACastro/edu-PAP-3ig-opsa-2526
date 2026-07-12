# Arquitetura da IA OPSA v2

Data de sincronização: 2026-07-12

Implementação de referência: `real_dev/api` e `real_dev/web`

## Fronteira de confiança

A OPSA separa dois subsistemas:

1. uma pipeline analítica determinística, baseada em PostgreSQL;
2. um chat read-only, com enquadramento OpenAI opcional.

O backend é o único autor de números, unidades, períodos, fontes e frases factuais. A OpenAI não recebe a pergunta livre, histórico textual, IDs, aliases, valores financeiros, Prisma, SQL ou ferramentas. Recebe apenas `intent`, módulo autorizado, qualidade, códigos de limitações e sinais qualitativos.

```text
Utilizador autenticado e empresa ativa
  -> capability + permissão + consentimento
  -> classificador local fixa uma tool e um período
  -> catálogo OPSA consulta PostgreSQL de forma company-scoped
  -> backend cria facts tipados e fontes canónicas
  -> OpenAI opcional redige apenas uma narrativa qualitativa
  -> backend rejeita narrativa com números/referências desconhecidas
  -> backend compõe e cifra a resposta final
```

Não existem tools mutáveis. A IA nunca aprova documentos, cria lançamentos, movimenta stock, paga, recebe ou altera preços.

## Métricas e grounding

`real_dev/api/src/modules/ai/aiMetricCatalog.js` define as tools autorizadas:

- `get_cashflow_summary`;
- `get_receivables_summary`;
- `get_stock_risk_summary`;
- `get_margin_summary`;
- `get_executive_kpis`;
- `compare_periods`;
- `get_insight_explanation`.

Os períodos usam `Europe/Lisbon`, têm no máximo 366 dias e as referências apresentadas estão limitadas a dez. Totais de margem usam `groupBy`; recebíveis e stock histórico usam CTEs parametrizadas; PMR/PMP são agregados e ponderados no PostgreSQL. As queries de detalhe são separadas e limitadas.

Na tesouraria histórica, todas as contas criadas até ao início do período precisam de snapshot. Cobertura incompleta produz `PARTIAL`; a regra crítica de cashflow só materializa resultado quando a qualidade é `COMPLETE`.

O DTO público de chat v2 inclui `facts`, cada um com valor bruto, valor formatado, unidade e fonte. `answer` é composto na API. Mensagens v1 continuam legíveis e são normalizadas para o mesmo DTO público.

## Pipeline analítica e worker

`aiAnalysisService.js` é a entrypoint canónica para API, worker, seed e testes v2. Os scopes válidos são `INSIGHTS`, `SUGGESTIONS` e `ALERTS`; `SUGGESTIONS` exige `INSIGHTS`. Só os domínios pedidos são persistidos e resolvidos.

`AiAnalysisRun` usa:

- `attempts`, `nextAttemptAt` e máximo de três tentativas;
- `leaseExpiresAt` e `lastHeartbeatAt` para recuperar runs órfãos;
- backoff de cinco segundos, trinta segundos e dois minutos;
- `scheduleBucket` único por empresa, origem e bucket horário;
- erro terminal `AI_ANALYSIS_RETRIES_EXHAUSTED`.

Polling e agendamento são separados: fila a cada cinco segundos e bucket automático horário. O processo impede ciclos sobrepostos. Cada tool tem budget e telemetria de duração sem valores financeiros.

Sugestões passam por allowlist fechada de ações recomendatórias e guardrails de fonte antes de persistir. `AI_METRIC_V2` só é confiável com `metrics` e `formula` estruturados.

## Autorização e lifecycle

| Capacidade | ADMIN | GESTOR | CONTABILISTA | OPERACIONAL | AUDITOR |
| --- | :---: | :---: | :---: | :---: | :---: |
| Chat | Sim | Sim | Sim | Não | Não |
| Criar análise | Sim | Sim | Sim | Não | Não |
| Ler/gerir insights | Sim | Sim | Sim | Não | Não |
| Ler/gerir sugestões | Sim | Sim | Não | Não | Não |
| Ler/gerir alertas IA | Sim | Sim | Não | Não | Não |
| Settings IA | Sim | Não | Não | Não | Não |

GET usa permissões `*.read`; POST/PATCH usa permissões de gestão próprias. `AI_WRITE` permanece apenas por compatibilidade e não protege rotas novas.

Transições de estado usam allowlist fechada e `updateMany` otimista com estado e `updatedAt` observados. Estados terminais não podem ser reabertos manualmente. Runs humanos, settings, consentimento, eliminação e lifecycle gravam `AuditLog` minimizado na mesma transação.

`SmartAlert` só é entregue a memberships com `AI_ALERTS_READ`. Lembretes preservam os destinatários existentes. Um upsert de notificação inalterada não limpa `readAt`.

## Chat, quotas e cancelamento

Limites PAP:

- vinte sessões não expiradas por utilizador/empresa;
- duzentas mensagens por sessão;
- cinco tentativas por minuto/utilizador;
- dez sessões novas por hora/utilizador;
- duas análises manuais por dez minutos/utilizador e cinco por empresa;
- cinquenta turnos diários por utilizador e quinhentos por empresa.

Redis/Lua reserva atomicamente os limites de utilizador e empresa. O dia civil usa `Europe/Lisbon`. Em produção, indisponibilidade do Redis é fail-closed. `COMPLETED`, `FALLBACK`, `REFUSED`, `FAILED` e `CANCELLED` geram telemetria e consomem o turno já aceite.

As sessões são paginadas por `updatedAt/id` descendente, vinte por página. As mensagens são paginadas por `createdAt/id`, cinquenta por página, começando pelas mais recentes. Os envelopes preservam `sessions`/`messages` e acrescentam `pageInfo`.

SSE expõe `message.started`, eventos de tool, `message.completed`, `message.failed` e `message.cancelled`. Não existe `message.delta` sintético. O `AbortSignal` atravessa browser, rota e provider; fechar o drawer ou escolher Cancelar termina a geração sem mostrar resposta parcial.

Página e drawer usam um único provider React, partilhando capability, sessão, mensagens, busy state e cancelamento.

## Capability e configuração

`GET /api/ai/capabilities` devolve, sem segredos:

- disponibilidade global do chat;
- modo efetivo `disabled`, `deterministic` ou `openai`;
- provider configurado;
- opt-in da empresa;
- consentimento e versão da política;
- limites públicos.

`AI_CHAT_ENABLED` é explícito em produção. Quando ativo, `AI_CHAT_ENCRYPTION_KEY` válida é obrigatória no arranque e refletida na readiness. `OPENAI_MODEL` só é obrigatório quando `AI_PROVIDER_MODE=openai`; não existe default oculto.

## API e compatibilidade

Além das rotas existentes, a v2 acrescenta `GET /api/ai/capabilities`, `pageInfo`, `payloadVersion: 2` e `facts`. `POST /api/ai/questions` permanece até ao `Sunset` publicado. `AiQuestionRun` é legado sem novas escritas.

A migration `20260712210000_ai_hardening` é aditiva: não remove tabelas/colunas nem reescreve payloads cifrados. O comando `npm run ai:compact-aliases` limpa mapas de aliases antigos de forma idempotente e paginada, sem tocar em mensagens.

## Operação e prova

O runbook está em `real_dev/api/docs/ai-operations.md`. Contagens de testes pertencem ao relatório datado da execução e não a esta arquitetura. PostgreSQL, Redis, SMTP, migrations e outbox reais são obrigatórios para declarar o cutover operacionalmente provado. O smoke OpenAI é manual, opcional, restrito a empresa demo e nunca bloqueia CI.
