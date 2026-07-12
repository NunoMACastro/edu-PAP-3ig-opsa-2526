# Evidence MF8 / BK-MF8-06

## Identificação

- Projeto: `OPSA`
- BK: `BK-MF8-06`
- Tema: renovação, cancelamento e reativação simuladas
- Requisito: `RF51`
- Data de revalidação: `2026-07-10`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Router: `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- Service: `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- Contrato dedicado: `real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js`
- Contrato agregado: `real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js`

## Contrato observado

- `POST /api/subscriptions/current/actions` aceita `renew`, `cancel` e
  `reactivate` nas transições previstas.
- A empresa ativa e o utilizador vêm do contexto autenticado; campos de
  ownership no body são rejeitados.
- Reativação exige um plano canónico. Renovação/cancelamento não aceitam um
  plano arbitrário.
- Claims concorrentes usam o estado esperado e perdem com `409 STALE_STATE`,
  sem auditoria falsa.
- Cada ação é auditada sem dados de pagamento, porque o fluxo é simulado.

## Comandos executados

| Diretório | Comando | Exit code | Resultado observado |
| --- | --- | ---: | --- |
| `real_dev/api` | `node --test tests/contracts/mf8-subscription-activation.contract.test.js tests/contracts/mf8-subscription-lifecycle.contract.test.js` | 0 | 20 testes, 20 pass, 0 fail, 0 skipped. Os doze casos de lifecycle passaram. |
| `real_dev/api` | `node --test tests/contracts/mf8-subscriptions.contract.test.js tests/contracts/mf8-current-subscription.contract.test.js tests/contracts/mf8-subscription-plans.contract.test.js` | 0 | 20 testes, 20 pass, 0 fail, 0 skipped. |

## Negativos cobertos

- Reativação sem plano e ação desconhecida.
- Transição inválida e claim concorrente perdido.
- Tentativa de escolher ownership no body.
- Role sem acesso e empresa ativa ausente.

## Limites

- Não foi executada a corrida contra PostgreSQL real.
- Não foi executado browser autenticado.
- Não existe cobrança, gateway ou efeito contabilístico.

## Decisão

`PASS_CONTRATO_COM_BLOQUEIO_AMBIENTAL`; o lifecycle local está coberto sem
skips, mas a prova persistida/browser continua bloqueada pelo ambiente.
