# Evidence MF8 / BK-MF8-02

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-02`
- Tema: liveness e readiness
- RF/RNF: `RNF29`
- Data de revalidacao: `2026-07-10`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Service: `real_dev/api/src/modules/ops/healthService.js`
- Router: `real_dev/api/src/modules/ops/healthRoutes.js`
- Composicao HTTP: `real_dev/api/src/server.js`
- Testes: `real_dev/api/tests/unit/health-service.test.js`
- Contratos: `real_dev/api/tests/contracts/mf8-health.contract.test.js`

## Contrato observado

- `GET /api/health/live` nao depende de PostgreSQL, Redis ou storage.
- `GET /api/health/ready` testa as tres dependencias criticas e devolve `503` quando alguma falha.
- `GET /api/health` e alias de readiness.
- Falhas internas e timeouts nao sao expostos na resposta publica.

## Comando executado

| Diretorio | Comando | Resultado observado |
| --- | --- | --- |
| `real_dev/api` | `node --test tests/unit/health-service.test.js tests/contracts/mf8-health.contract.test.js` | Exit `0`; 18 testes, 18 pass, 0 fail, 0 skipped. Reexecutado em 2026-07-10. |

## Limites

- As dependencias remotas nao estavam configuradas nesta revalidacao; o estado positivo e negativo de readiness continua por demonstrar contra PostgreSQL, Redis e S3 reais de teste.
- O resultado fecha o contrato unitario/HTTP, nao a prova operacional remota.

## Decisao

`PASS_CONTRATO_COM_BLOQUEIO_AMBIENTAL`; a evidence deixa de reutilizar outputs Windows ou comandos da implementacao `apps/`.
