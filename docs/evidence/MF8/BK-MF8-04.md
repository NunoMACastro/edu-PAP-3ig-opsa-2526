# Evidence MF8 / BK-MF8-04

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-04`
- Tema: subscricao da empresa ativa
- RF/RNF: `RF50`
- Data de revalidacao: `2026-07-09`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Router: `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- Service: `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- Catalogo: `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- Modelo: `CompanySubscription` em `real_dev/api/prisma/schema.prisma`
- Contrato: `real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js`

## Contrato observado

- `GET /api/subscriptions/current` esta exposto no router de subscricoes.
- A consulta usa a empresa ativa resolvida pelos guards do backend.
- Sem subscricao persistida, o payload devolve o estado `none`.
- Pedidos sem empresa ativa ou sem acesso sao rejeitados antes da consulta.
- Um plano persistido que ja nao existe no catalogo produz erro de dominio controlado.

## Comando executado

| Comando | Resultado observado |
| --- | --- |
| `node --test real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js` | `PASS`; 6 testes, 6 pass, 0 fail, 0 skipped. |

## Negativos cobertos

- Role sem acesso.
- Pedido sem empresa ativa.
- Empresa sem subscricao.
- Plano persistido ausente do catalogo atual.

## Limites

- Este BK valida consulta por empresa ativa; nao prova cobranca, checkout, faturacao ou gateway externo.
- Nao foi executado smoke HTTP com sessao e base de dados reais nesta revalidacao.

## Decisao

`PASS_CONTRATO`; o contrato automatizado dedicado esta verde. A prova persistida E2E continua dependente de `TEST_DATABASE_URL`, conforme `EXECUCAO-FINAL-TESTES.md`.
