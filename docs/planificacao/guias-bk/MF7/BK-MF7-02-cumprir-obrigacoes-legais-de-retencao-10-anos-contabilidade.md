# BK-MF7-02 - Retenção legal de 10 anos em contabilidade

## Header

- `doc_id`: `GUIA-BK-MF7-02`
- `bk_id`: `BK-MF7-02`
- `macro`: `MF7`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF19`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-03`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-02-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade.md`
- `last_updated`: `2026-07-10`

## Objetivo

Ligar `RetentionHold` às mutações contabilísticas finais e ao fecho fiscal, preservando história e impedindo destruição silenciosa. Após fecho/hold, a correção usa reversão auditada; não apaga nem reescreve o passado.

## Invariantes

- Hold é criado/confirmado quando uma operação contabilística se torna final e quando um período fecha.
- `retainUntil` deriva da data fiscal/contabilística e da política legal, não da hora do browser.
- Fecho e criação de holds são atómicos.
- Edição/substituição de linhas após fecho/hold é bloqueada.
- Lançamento manual editável cria `JournalEntryRevision` com snapshot before/after e motivo antes da substituição.
- Correção histórica cria lançamento reverso e novo lançamento, ambos auditados.
- Não existe bypass genérico de eliminação porque o prazo terminou; qualquer política de arquivo/eliminação futura exige decisão legal própria.

## Ficheiros públicos do aluno

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/accounting/retentionService.js`
- `apps/api/src/modules/accounting/fiscalPeriodService.js`
- `apps/api/src/modules/accounting/manualJournalService.js`
- `apps/api/src/modules/accounting/journalReversalService.js`
- `apps/api/scripts/backfill-retention-holds.mjs`
- `apps/api/tests/integration/retention.integration.test.js`
- `apps/api/tests/integration/manual-journal-revision.integration.test.js`

## Tutorial técnico linear

### Passo 1 - Modelar holds e revisões

`RetentionHold` inclui empresa, período/entidade protegida, data de origem, `retainUntil`, razão, ator e timestamps. Constraints impedem duplicados por empresa/entidade. `JournalEntryRevision` guarda entry, empresa, versão, motivo, ator, snapshot before/after e data.

Snapshots são dados contabilísticos protegidos; aplicam-se os mesmos controlos de autorização e retenção.

### Passo 2 - Criar hold em operações finais

No mesmo `$transaction` que aprova/publica/fecha:

1. reclama o estado esperado;
2. valida período aberto e data estrita;
3. grava mutação final;
4. cria/upsert hold idempotente;
5. grava histórico e `AuditLog`.

Se qualquer passo falhar, nenhum confirma isoladamente.

### Passo 3 - Coordenar fecho fiscal

Adquire lock transacional por empresa/período antes de verificar lançamentos e fechar. O fecho cria holds para o período e entidades abrangidas dentro da mesma transação. Lançamento concorrente usa o mesmo protocolo; nunca pode confirmar depois do fecho.

### Passo 4 - Rever lançamento manual

Enquanto o período está aberto e sem hold impeditivo, uma edição válida:

1. carrega entry/linhas com lock;
2. cria `JournalEntryRevision` before;
3. substitui linhas e valida equilíbrio;
4. completa snapshot after;
5. grava auditoria;
6. confirma tudo junto.

Após fecho/hold, devolve `409 RETENTION_HOLD_ACTIVE`/`FISCAL_PERIOD_CLOSED` e orienta para reversão.

### Passo 5 - Reverter sem destruir

Uma reversão cria novo lançamento com débitos/créditos invertidos, referência ao original, motivo e ator. O original permanece imutável. Se necessário, cria outro lançamento corrigido. Ambos respeitam data/período aberto e recebem holds quando finais.

### Passo 6 - Fazer backfill idempotente

O script encontra períodos já fechados e entidades finais sem hold, regista contagens antes, faz upsert em lotes e regista contagens depois. Reexecução produz zero novos holds e não muda datas existentes. Executa primeiro em base de teste e suporta dry-run.

### Passo 7 - Testar concorrência e isolamento

- fecho vs lançamento concorrente;
- duas execuções do backfill;
- edição após fecho/hold;
- revisão before/after em edição permitida;
- reversão conserva original;
- hold de empresa A não é consultável por B;
- falha de auditoria/hold reverte mutação;
- datas impossíveis são rejeitadas.

## Validação final

```bash
cd apps/api
npm run prisma:validate
npm run test:contracts
npm run test:integration
npm run test:mf7
```

## Critérios de aceite

- Holds estão ligados a operações finais e fecho.
- Fecho e lançamentos partilham lock transacional.
- Revisões precedem substituição de linhas.
- Períodos fechados/holds bloqueiam edição destrutiva.
- Correção histórica é reversão auditada.
- Backfill é idempotente e tem contagens.
- Testes persistidos não usam skips.

## Evidence para PR/defesa

- migration, dry-run e contagens do backfill;
- teste concorrente fecho/lançamento;
- snapshot de revisão redigido;
- prova de reversão e imutabilidade;
- negativo multiempresa;
- comandos, exit codes e contagens.

## Importância

Apagar ou reescrever história contabilística destrói auditabilidade. Holds, revisões e reversões mantêm a cadeia de prova.

## Scope-in

- Holds automáticos, lock de fecho, revisões, reversões e backfill.

## Scope-out

- Eliminação genérica após prazo e aconselhamento jurídico específico.

## Estado antes e depois

- Antes: retenção desligada das mutações finais.
- Depois: operações finais/fecho criam proteção atómica e correções preservam originais.

## Pre-requisitos

- Períodos fiscais, lançamentos, auditoria e parser de datas estrito.

## Glossário

- **Hold:** proteção persistente associada a entidade/período.
- **Revisão:** snapshot before/after de edição permitida.
- **Reversão:** novo lançamento que neutraliza o original.

## Conceitos teóricos essenciais

Imutabilidade não impede correção: exige que a correção seja aditiva e rastreável.

## Arquitetura do BK

Service transacional → lock de período → hold/revision/audit → commit; backfill separado, idempotente e mensurável.

## Ficheiros a criar/editar/rever

Revê schema, migrations, services contabilísticos, script de backfill e testes em `apps/api`.

## Cenários negativos mínimos

Executa pelo menos 3 cenários negativos: edição após hold, fecho concorrente e acesso entre empresas.

## Handoff

Entrega a `BK-MF7-03` uma base contabilística íntegra; a prova cross-browser não pode contornar estes guards.

## Changelog

- `2026-07-10`: substituído gate de eliminação por holds ligados, revisões, reversões e backfill.
