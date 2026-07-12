# Evidence MF8 / BK-MF8-01

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-01`
- Tema: logging estruturado por nivel
- RF/RNF: `RNF28`
- Data de revalidacao: `2026-07-10`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Logger: `real_dev/api/src/modules/ops/structuredLogger.js`
- Observabilidade HTTP: `real_dev/api/src/modules/ops/requestObservability.js`
- Teste focado: `real_dev/api/tests/unit/structuredLogger.test.js`

## Contrato observado

- O logger aceita apenas os quatro niveis contratados por `RNF28`.
- Nivel, evento, modulo e requisito sao validados antes da escrita.
- Chaves sensiveis e estruturas aninhadas fora do contrato sao rejeitadas.
- Cada nivel e encaminhado para o metodo correspondente da consola.

## Comando executado

| Diretorio | Comando | Resultado observado |
| --- | --- | --- |
| `real_dev/api` | `node --test tests/unit/structuredLogger.test.js` | `PASS`; 5 testes, 5 pass, 0 fail, 0 skipped. |

## Limites

- Este teste prova o contrato unitario do logger; nao prova recolha centralizada ou retencao de logs num ambiente remoto.
- A passagem runtime de request IDs e shutdown e validada por suites operacionais separadas.

## Decisao

`PASS_UNITARIO`; a evidence deixa de reutilizar outputs Windows ou comandos da implementacao `apps/`.
