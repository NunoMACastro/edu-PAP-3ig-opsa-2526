# Evidence MF8 / BK-MF8-03

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-03`
- Tema: catalogo de planos simulados
- RF/RNF: `RF49`
- Data de revalidacao: `2026-07-10`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Catalogo: `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- Router: `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- Composicao HTTP: `real_dev/api/src/server.js`
- Contrato: `real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js`

## Contrato observado

- `GET /api/subscriptions/plans` devolve os tres planos simulados em EUR.
- `GET /api/subscriptions/plans/:code` devolve apenas codigos conhecidos.
- As rotas exigem autenticacao e role autorizada.
- O catalogo e imutavel para o chamador e nao expoe campos de pagamento real.

## Comando executado

| Diretorio | Comando | Resultado observado |
| --- | --- | --- |
| `real_dev/api` | `node --test tests/contracts/mf8-subscription-plans.contract.test.js` | `PASS`; 10 testes, 10 pass, 0 fail, 0 skipped. |

## Limites

- O fluxo e deliberadamente pedagogico e simulado; nao existe gateway, checkout, cartao, invoice ou cobranca real.
- O teste dedicado nao substitui o E2E autenticado em browser.

## Decisao

`PASS_CONTRATO`; a evidence deixa de reutilizar outputs Windows ou comandos da implementacao `apps/`.
