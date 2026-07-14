# Evidence MF8 / BK-MF8-02

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-02`
- Tema: liveness e readiness
- RF/RNF: `RNF29`
- Data de revalidacao: `2026-07-12`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Service: `real_dev/api/src/modules/ops/healthService.js`
- Router: `real_dev/api/src/modules/ops/healthRoutes.js`
- Composicao HTTP: `real_dev/api/src/server.js`
- Testes: `real_dev/api/tests/unit/health-service.test.js`
- Contratos: `real_dev/api/tests/contracts/mf8-health.contract.test.js`
- Diagnostico profundo: `real_dev/api/scripts/run-readiness-deep-diagnostic.mjs`

## Contrato observado

- `GET /api/health/live` nao depende de PostgreSQL, Redis ou storage.
- `GET /api/health/ready` testa as três dependências críticas com `SELECT 1`, `PING` e probe read-only de storage; devolve `503` quando alguma falha.
- `GET /api/health` e alias de readiness.
- OpenAI aparece como `disabled`/`optional` e não altera o estado global.
- Provas mutáveis de permissões e cleanup foram preservadas em `health:deep-check`.
- Falhas internas e timeouts nao sao expostos na resposta publica.

## Comando executado

| Diretorio | Comando | Resultado observado |
| --- | --- | --- |
| `real_dev/api` | `node --test tests/unit/health-service.test.js tests/contracts/mf8-health.contract.test.js` | Exit `0`; 17 testes, 17 pass, 0 fail, 0 skipped. Reexecutado em 2026-07-12. |

## Limites

- As dependencias remotas nao estavam configuradas nesta revalidacao; o estado positivo e negativo de readiness e o comando profundo continuam por demonstrar contra PostgreSQL, Redis e S3 reais de teste.
- O resultado fecha o contrato unitario/HTTP, nao a prova operacional remota.

## Decisao

`PASS_CONTRATO_COM_BLOQUEIO_AMBIENTAL`; a evidence deixa de reutilizar outputs Windows ou comandos da implementacao `apps/`.

## Apêndice posterior — 2026-07-13

PostgreSQL local passou a ter prova runtime reproduzível:

- Docker `29.6.1`, Compose `v5.2.0` e config PASS;
- imagem `postgres:17.10-alpine3.23`, digest observado
  `sha256:8189a1f6e40904781fc9e2612687877791d21679866db58b1de996b31fc312e4`;
- serviço healthy em `127.0.0.1:5433`;
- ligação autenticada com `SELECT 1`, `21` migrations e seed/verify;
- API `407/407` unitários e `174/174` contratos no conjunto final.

Esta execução prova a disponibilidade da dependência PostgreSQL local e mantém
o contrato read-only de readiness. Não foi fornecido resultado separado do
endpoint HTTP `/api/health/ready` contra Redis/S3 externos nem do comando
`health:deep-check`; esses resultados não são inventados.

Decisão posterior: `PASS_CONTRATO_E_POSTGRESQL_LOCAL`; readiness com providers
externos continua fora desta evidence.
