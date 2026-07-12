# Evidence MF8 / BK-MF8-05

## Identificação

- Projeto: `OPSA`
- BK: `BK-MF8-05`
- Tema: ativação simulada de subscrição
- Requisito: `RF50`
- Data de revalidação: `2026-07-10`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Router: `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- Service: `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- Catálogo: `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- Contrato: `real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js`

## Contrato observado

- `POST /api/subscriptions/current/activate` exige autenticação, role autorizada
  e empresa ativa resolvida no backend.
- O body aceita apenas a intenção `planCode`; ownership enviado pelo cliente é
  rejeitado.
- O plano tem de existir no catálogo simulado e as datas usam
  `billingCycle`/`intervalCount`.
- Persistência da subscrição e auditoria mínima pertencem à mesma operação de
  serviço.
- Não existe gateway, checkout, cartão, invoice ou pagamento real.

## Comando executado

| Diretório | Comando | Exit code | Resultado observado |
| --- | --- | ---: | --- |
| `real_dev/api` | `node --test tests/contracts/mf8-subscription-activation.contract.test.js tests/contracts/mf8-subscription-lifecycle.contract.test.js` | 0 | 20 testes, 20 pass, 0 fail, 0 skipped. Os oito casos de ativação passaram. |

## Negativos cobertos

- Plano inexistente e body sem `planCode` não escrevem dados.
- Tentativa de escolher ownership no body é rejeitada.
- Role sem acesso é bloqueada antes do service.
- Ausência de empresa ativa é rejeitada.

## Limites

- A prova é de contrato com doubles; não demonstra persistência PostgreSQL real.
- O fluxo browser autenticado continua bloqueado pela ausência dos browsers.
- A subscrição é deliberadamente simulada e não representa cobrança.

## Decisão

`PASS_CONTRATO_COM_BLOQUEIO_AMBIENTAL`; a evidence é reproduzida e não contém
placeholders. O fecho E2E depende de PostgreSQL e browser reais.
