# Evidence MF8 / BK-MF8-11

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-11`
- Tema: governanca de IA recomendatoria
- RF/RNF: `RNF32`
- Data de revalidacao: `2026-07-09`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Politica: `real_dev/api/src/modules/ai/aiGovernancePolicy.js`
- Service: `real_dev/api/src/modules/ai/aiService.js`
- Modelo: `AiActionSuggestion` em `real_dev/api/prisma/schema.prisma`
- Contrato: `real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js`

## Contrato observado

- Sugestoes precisam de `actionType` explicito.
- A denylist bloqueia acoes financeiras e contabilisticas automaticas.
- A politica e aplicada antes da persistencia.
- As sugestoes persistidas ficam abertas para revisao humana e nao incluem campos de execucao financeira.

## Comandos executados

| Comando | Resultado observado |
| --- | --- |
| `npm --prefix real_dev/api run test:mf8:ai-governance` | `PASS`; 5 testes, 5 pass, 0 fail, 0 skipped. |

## Negativos cobertos

- `actionType` ausente ou vazio.
- Aprovacao automatica de documentos.
- Criacao automatica de lancamentos.
- Alteracao automatica de dados contabilisticos.
- Execucao automatica de pagamentos ou recebimentos.

## Limites

- O gate valida a policy local e a integracao antes do upsert; nao valida providers externos.
- O modulo continua a recomendar para decisao humana; nao executa acoes.
- Nao foi executado smoke HTTP autenticado nesta revalidacao.

## Decisao

`PASS_CONTRATO`; os cinco casos dedicados passaram e a fronteira recomendacao/execucao ficou preservada.
