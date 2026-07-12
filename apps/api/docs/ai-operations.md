# IA OPSA v2 — runbook de cutover e rollback

## Pré-condições

- congelar os workers de IA, notificações e email;
- criar backup PostgreSQL e provar o restauro numa base descartável;
- guardar contagens de `AiAnalysisRun`, `AiInsight`, `AiActionSuggestion`, `SmartAlert`, `AiChatSession`, `AiChatMessage`, `AiUsageEvent` e `AiQuestionRun`;
- validar PostgreSQL, Redis, SMTP, storage e todas as variáveis;
- manter `AI_PROVIDER_MODE=disabled` durante migration e smoke determinístico.

Variáveis essenciais:

```dotenv
AI_CHAT_ENABLED=true
AI_PROVIDER_MODE=disabled
OPENAI_API_KEY=
OPENAI_MODEL=
AI_CHAT_ENCRYPTION_KEY=<32 bytes>
AI_SAFETY_HMAC_KEY=<segredo HMAC distinto>
AI_WORKER_POLL_INTERVAL_MS=5000
AI_WORKER_INTERVAL_MS=3600000
AI_WORKER_LEASE_MS=300000
AI_WORKER_MAX_ATTEMPTS=3
```

Em produção, `AI_CHAT_ENABLED` tem de ser explícito. Chat ativo exige chave válida no arranque/readiness. Modo OpenAI exige chave e modelo explícito.

## Cutover único

1. Aplicar a migration aditiva `20260712210000_ai_hardening`.
2. Fazer deploy coordenado de API, web e workers.
3. Arrancar o worker de IA em drain: `npm run worker:ai:drain`.
4. Correr smoke autenticado: capabilities, análise manual até `COMPLETED`, filtros, sugestão com `sourceQuality`, alerta autorizado, chat determinístico, cancelamento, preferências e eliminação.
5. Arrancar workers contínuos: `worker:ai`, `worker:notifications` e `worker:email`.
6. Compactar aliases antigos com `npm run ai:compact-aliases`; o comando é idempotente, paginado e não altera mensagens.
7. Opcionalmente, configurar `AI_PROVIDER_MODE=openai`, modelo e chave, reiniciar API/readiness e ativar apenas uma empresa demo por `ADMIN` com consentimento individual.

## Observabilidade

`AiAnalysisRun` é a evidência dos runs automáticos. Logs estruturados registam apenas códigos, duração de tools, tentativas e contagens; nunca prompts, respostas, valores financeiros, IDs funcionais ou aliases.

Outcomes de chat: `COMPLETED`, `FALLBACK`, `REFUSED`, `FAILED` e `CANCELLED`. Os contadores Redis usam identificadores HMAC e calendário `Europe/Lisbon`.

## Validação

```text
npm run syntax:check
DATABASE_URL=postgresql://... npm run prisma:validate
DATABASE_URL=postgresql://... npm run prisma:generate
npm run test:unit
npm run test:contracts
npm run test:integration
npm run test:seed:integration
npm run test:mf6
npm run test:mf7
npm run test:mf8
npm audit --omit=dev
```

No web: `npm run test:unit`, `npm run typecheck`, `npm run build` e E2E com provider fake. PostgreSQL, Redis e SMTP reais são necessários para fechar quotas, leases, migration, notificações e outbox. O smoke OpenAI real é manual e não bloqueia CI.

## Rollback

1. Definir `AI_PROVIDER_MODE=disabled`.
2. Parar os workers contínuos.
3. Repor a versão anterior da aplicação.
4. Manter as colunas aditivas; não executar down migration destrutiva.
5. Restaurar a base apenas perante corrupção comprovada, nunca como rollback rotineiro.

As mensagens v1 continuam legíveis e `AiQuestionRun` permanece intacto. Não apagar sessões, mensagens, runs ou registos legados durante rollback.

## Incidentes e chaves

O chat usa AES-256-GCM e uma chave distinta da outbox. A rotação exige chat desligado, backup provado e re-encriptação operacional dedicada em batches. Se uma chave for comprometida, revogar a chave OpenAI, desligar o provider, preservar logs minimizados e seguir o processo de incidente/privacidade aplicável.
