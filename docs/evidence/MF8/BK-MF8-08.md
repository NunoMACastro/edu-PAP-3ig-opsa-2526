# Evidence MF8 / BK-MF8-08

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-08`
- Tema: testes de subscricoes simuladas
- RF/RNF: `RF49`, `RF50`, `RF51`
- Data de revalidacao: `2026-07-09`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Contrato agregador: `real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js`
- Catalogo: `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- Service: `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- Router: `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`

## Matriz de prova

| Requisito | Prova automatizada | Resultado observado |
| --- | --- | --- |
| `RF49` | Lista planos simulados e verifica a ausencia de campos de pagamento real. | `PASS`. |
| `RF50` | Ativa a subscricao com a empresa ativa recebida do contexto backend e regista auditoria minima. | `PASS`. |
| `RF51` | Renova, cancela e reativa apenas nas transicoes permitidas. | `PASS`. |
| Negativos | Rejeita transicao invalida, plano em falta e empresa ativa em falta. | `PASS`. |

## Comandos executados

| Comando | Resultado observado |
| --- | --- |
| `npm --prefix real_dev/api run test:mf8:subscriptions` | `PASS`; 4 testes, 4 pass, 0 fail, 0 skipped. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; `MF8 subscriptions UI smoke OK`. |

## Limites

- O contrato e explicitamente simulado: nao valida gateway, checkout, cartao, invoice, webhook ou cobranca real.
- A execucao nao incluiu browser interativo nem persistencia real.
- O isolamento persistido continua dependente de uma `TEST_DATABASE_URL` efemera segura.

## Handoff

- Gate API repetivel: `npm --prefix real_dev/api run test:mf8:subscriptions`.
- Gate UI estatico repetivel: `npm --prefix real_dev/web run test:mf8:subscriptions-ui`.

## Decisao

`PASS_CONTRATO`; os quatro casos do contrato agregador e o gate UI passaram. O fecho E2E persistido permanece bloqueado pelo ambiente de base de dados.
