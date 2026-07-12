# BK-MF8-09 - Documentação técnica mínima: arquitetura, modelos e fluxos

> **Atualização IA v2:** a arquitetura canónica do domínio está em `docs/ARQUITETURA-IA-OPSA-V2.md`; o runbook de operação, retenção, incidentes e rotação está em `real_dev/api/docs/ai-operations.md`. O mapeamento pedagógico está em [`../SINCRONIZACAO-IA-V2.md`](../SINCRONIZACAO-IA-V2.md).

## Header

- `doc_id`: `GUIA-BK-MF8-09`
- `bk_id`: `BK-MF8-09`
- `macro`: `MF8`
- `owner`: `Pedro`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-10`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-09-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md`
- `last_updated`: `2026-07-10`

## Objetivo

Criar `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md` a partir do código e schema existentes, sem inventar serviços nem alegar readiness de produção. A evidence técnica e o estado pedagógico do aluno permanecem separados.

## Estrutura obrigatória do documento

### 1. Runtime e fronteiras

- `createApp(dependencies)` monta Express sem abrir portas.
- `startServer()` cria listener, workers e sinais.
- Prisma/PostgreSQL, Redis, SMTP/outbox e S3 são dependências externas.
- JSON global continua pequeno; multipart é route-scoped.
- empresa ativa, role e permissões são resolvidas no backend.

### 2. API e módulos

Mapeia autenticação/onboarding, empresas/convites, vendas, compras, inventário/FIFO, tesouraria/reconciliação, contabilidade, compliance/SAF-T, imports, subscriptions, IA, notificações e ops. Liga ao [CONTRATO-INTERFACES-IMPLEMENTACAO.md](../../CONTRATO-INTERFACES-IMPLEMENTACAO.md) em vez de duplicar endpoints divergentes.

### 3. Persistência

Além das entidades de domínio, documenta:

- `EmailOutbox` e worker;
- `SecurityAuditEvent`;
- `JournalEntryRevision`;
- `RetentionHold`;
- metadata/hash/status de `JournalAttachment`;
- período/storage/hash/validações de `SaftExportRun`;
- `FiscalPeriod.fiscalYear`;
- índices de cursor e locks transacionais.

Inclui as migrations de 2026-07-09 e 2026-07-10, com finalidade e ordem expand-and-contract.

### 4. Frontend

- React Router e registry única;
- `AuthProvider` deny-by-default;
- routes protegidas/lazy, 404, deep links e histórico;
- cliente HTTP com 401, timeout e abort;
- cursor pagination;
- formulários tipados, multipart, acessibilidade e mobile.

### 5. Fluxos críticos

Representa pelo menos:

1. registo → onboarding → empresa/membership/admin/auditoria;
2. convite → outbox → SMTP → preview/accept;
3. documento → approval claim → lançamento → período/hold;
4. stock/FIFO com locks;
5. upload → quarentena → DB → promoção/cleanup → download;
6. SAF-T → período → XML/XSD/reconciliação → S3/download;
7. backup → dump+manifesto → S3 → restore remoto;
8. request → request ID/logs → response → shutdown.

### 6. Operação e limites

Documenta liveness/readiness, logs start/end/duração/route template, worker de email, graceful shutdown e gate académico. Assinala explicitamente serviços/testes bloqueados por ambiente. Não declares production-ready, scheduler 24/7, certificação fiscal ou restore aprovado sem prova runtime.

## Ficheiros públicos do aluno

- CRIAR/EDITAR: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
- CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-09.md`
- CRIAR/EDITAR: `apps/api/scripts/check-mf8-technical-docs.mjs`
- EDITAR: `apps/api/package.json`
- REVER: `apps/api/src/app.js`, `apps/api/src/server.js`, `apps/api/prisma/schema.prisma`
- REVER: `apps/web/src/app/router.tsx`, `apps/web/src/auth/AuthProvider.tsx`

## Tutorial técnico linear

### Passo 1 - Inventariar a implementação

Usa `rg --files` e pesquisa mounts, models, workers e migrations. Regista apenas o que existe. Para cada afirmação, mantém uma referência de ficheiro/linha na evidence de trabalho; a versão final pode usar links estáveis sem copiar dados sensíveis.

### Passo 2 - Desenhar dependências

Mostra quem depende de PostgreSQL, Redis, SMTP e S3. Diferencia dependência crítica de readiness, worker assíncrono e adapter local permitido só em desenvolvimento.

### Passo 3 - Documentar modelos e migrations

Extrai nomes do schema e migrations. Não copies URLs, seeds com dados pessoais ou valores de `.env`. Explica invariantes: multiempresa, atomicidade, retenção, revisões, hashes, paginação e idempotência.

### Passo 4 - Documentar fluxos

Para cada fluxo, indica entrada, autorização, transação/lock, side effects, falhas e evidence. Se um teste runtime não correu, escreve `BLOQUEADO_AMBIENTE`.

### Passo 5 - Criar gate semântico

O script deve exigir secções e marcadores atuais e falhar perante contratos retirados, credenciais, placeholders ou afirmações contraditórias. Adiciona negativos de mutação: remove temporariamente cada marcador numa cópia e confirma que o validador falha.

### Passo 6 - Rever contra código

Uma segunda leitura independente compara documento com mounts, schema, config templates e package scripts. Regex e typecheck isolados não provam arquitetura runtime.

## Validação final

```bash
cd apps/api
npm run test:mf8:technical-docs
npm run test:contracts

cd ../web
npm run typecheck
npm run test
npm run build
```

## Critérios de aceite

- App/listener, serviços externos, modelos, Router/AuthProvider, observabilidade, paginação, workers e shutdown estão documentados.
- Endpoints e variáveis apontam para o contrato central.
- Fluxos críticos incluem falhas e blockers.
- Não existem secrets, paths privados dos alunos ou promessas não demonstradas.
- Gate semântico e negativos de mutação passam.

## Evidence para PR/defesa

- inventário de fontes consultadas;
- resultado do gate e mutações negativas;
- revisão independente;
- lista explícita de blockers;
- hashes dos dois documentos finais.

## Importância

Sem arquitetura atual, a defesa e a manutenção podem seguir contratos retirados, confundir blockers com sucesso ou omitir serviços externos críticos.

## Scope-in

- Runtime, módulos, schema/migrations, frontend, fluxos, operação e limites.

## Scope-out

- Inventar infraestrutura de produção, certificação ou comportamento não observado.

## Estado antes e depois

- Antes: documento mínimo sem novos serviços/modelos/routing/operação.
- Depois: mapa atual rastreável ao código e contrato central.

## Pre-requisitos

- Ler código, schema, migrations, env templates, package scripts e relatório canónico corrente.

## Glossário

- **Fonte de verdade:** documento/código que prevalece num tipo de conflito.
- **Fronteira:** responsabilidade entre módulos/processos.

## Conceitos teóricos essenciais

Arquitetura documenta decisões e invariantes; evidence demonstra execução; nenhuma delas substitui a outra.

## Arquitetura do BK

Inventário automatizado + leitura semântica → documento técnico → gate de presença/legado/secrets → revisão independente.

## Ficheiros a criar/editar/rever

Revê evidence, contrato central, app/server/schema, Router/AuthProvider e scripts de validação, sempre com paths públicos nos exemplos dos alunos.

## Cenários negativos mínimos

Executa pelo menos 2 cenários negativos: remover um modelo obrigatório e reintroduzir um contrato retirado numa cópia do documento.

## Handoff

Entrega a `BK-MF8-10` uma arquitetura atual que permite explicar fontes e limites da IA sem drift técnico.

## Changelog

- `2026-07-10`: arquitetura expandida para app/listener, serviços externos, novos modelos, Router/AuthProvider, paginação, workers e shutdown.
