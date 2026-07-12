# Evidence MF8 / BK-MF8-10

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-10`
- Tema: explicabilidade e origem dos insights
- RF/RNF: `RNF31`
- Data de revalidacao: `2026-07-09`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Service: `real_dev/api/src/modules/ai/aiService.js`
- Router: `real_dev/api/src/modules/ai/aiRoutes.js`
- Modelo: `AiInsight` em `real_dev/api/prisma/schema.prisma`
- Cliente frontend: `real_dev/web/src/lib/mf4Api.ts`
- Pagina consumidora: `real_dev/web/src/pages/mf4Pages.tsx`
- Contrato: `real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js`

## Contrato observado

- Um insight publicavel precisa de titulo, explicacao e fonte rastreavel.
- A consulta da explicacao usa o identificador do insight e a empresa ativa.
- `GET /api/ai/insights/:id/explanation` devolve explicacao, fonte e guardrail recomendatorio.
- Um insight de outra empresa e tratado como inexistente.

## Comandos executados

| Comando | Resultado observado |
| --- | --- |
| `npm --prefix real_dev/api run test:mf8:ai-explainability` | `PASS`; 5 testes, 5 pass, 0 fail, 0 skipped. |

## Negativos cobertos

- Explicacao vazia ou demasiado curta.
- Fonte sem identificador ou label.
- Insight inexistente ou pertencente a outra empresa.
- Registo persistido sem os campos minimos de explicabilidade.

## Limites

- O contrato valida explicabilidade e isolamento por empresa; nao prova a qualidade semantica de um provider generativo externo.
- A IA permanece recomendatoria e nao executa alteracoes operacionais ou contabilisticas.
- Nao foi executado browser autenticado nesta revalidacao.

## Decisao

`PASS_CONTRATO`; os cinco casos dedicados passaram.
