# Execucao final de testes MF8

## Identificacao

- BK: `BK-MF8-17`
- Requisito: `RNF38`
- Data de revalidacao: `2026-07-10`
- Evidence de entrada: `docs/evidence/MF8/TESTES-EM-FALTA.md`
- Implementation root validado: `real_dev`
- Decisão final: `BLOQUEADO_AMBIENTE_E_VALIDACAO_EXTERNA`

## Escopo da revalidacao

Foram repetidos todos os gates locais que não exigem credenciais e os comandos
que devem falhar honestamente sem infraestrutura remota. Nenhum scanner de
existência, build ou teste com doubles foi usado para substituir PostgreSQL,
Redis, SMTP, S3, restore, browsers reais ou revisão externa SAF-T.

## Comandos executados

| Area | Diretorio | Comando | Exit code | Resultado observado | Decisao |
| --- | --- | --- | ---: | --- | --- |
| API syntax | `real_dev/api` | `npm run syntax:check` | 0 | Todos os `.js`/`.mjs` de `src`, `tests` e `scripts` passaram `node --check`. | `OK` |
| API unit | `real_dev/api` | `npm run test:unit` | 0 | 278 testes, 278 pass, 0 fail, 0 skipped. | `OK` |
| API contracts | `real_dev/api` | `npm run test:contracts` | 0 | 153 testes, 153 pass, 0 fail, 0 skipped. | `OK` |
| API integration | `real_dev/api` | `npm run test:integration` | 1 | 7 testes, 2 pass, 5 fail, 0 skipped. Cinco suites falharam cedo por serviços remotos ausentes. | `BLOQUEADO_AMBIENTE` |
| API MF6 | `real_dev/api` | `npm run test:mf6` | 0 | Todos os contratos MF6 passaram após sincronizar três checkers obsoletos com os contratos atuais. | `OK_LOCAL` |
| API MF7 | `real_dev/api` | `npm run test:mf7` | 0 | 44 testes focados e check modular passaram, sem skips. | `OK_LOCAL` |
| API MF8 | `real_dev/api` | `npm run test:mf8` | 0 | 16 testes de subscrições, IA, docs/inventário passaram. O inventário encontrou 43 ficheiros unitários, 28 de contrato e 6 de integração. | `OK_INVENTARIO` |
| Frontend | `real_dev/web` | `npm run test:final:prepare` | 0 | 10 ficheiros/30 testes Vitest, MF1/MF2/MF3/MF5/MF7/MF8, typecheck e dois builds Vite passaram. | `OK_LOCAL` |
| Browser | `real_dev/web` | `npm run test:e2e -- --reporter=line` | 1 | Fail-closed antes dos testes: Google Chrome e Microsoft Edge não estão instalados. Firefox não foi iniciado porque o preflight aborta toda a matriz. | `BLOQUEADO_AMBIENTE` |
| Dependencias | API e web | `npm audit --omit=dev --audit-level=moderate` | 0 | Zero vulnerabilidades em ambos os projetos. | `OK` |
| Dependencias | API e web | `npm ls --all` | 0 | Sem módulos extraneous; dependências opcionais ausentes não são erro. | `OK` |
| Prisma | `real_dev/api` | `prisma validate` e `prisma generate` com URL sintética | 0 | Schema válido e client gerado; migration remota não executada. | `OK_ESTRUTURAL` |
| API MF8 | `real_dev/api` | `npm run mf8:defect-report` | 1 | O report mantém decisão bloqueada e o checker recusou falso verde. | `BLOQUEANTE_ESPERADO` |
| Gate anti-drift | raiz | `python3 -B docs/planificacao/scripts/auditar_planificacao.py --self-test` | 0 | 123 mutações negativas passaram, incluindo remoção de contratos, evidence, markers de arquitetura, envelopes paginados, estado canónico e códigos SAF-T. | `OK` |
| Documentacao | raiz | `bash scripts/validate-planificacao.sh` | 1 | `documentation_sync_pass=true`, 0 conflict markers, 3 blockers runtime, 0 advisories e 0 waivers ativos; `canonical_runtime_pass=false` por decisão `NO_GO`. | `BLOQUEANTE_RUNTIME` |
| Gate academico | `real_dev/api` | `npm run gate:academic` | 1 | Node `24.11.1` está abaixo do contrato `>=24.17 <25`. | `BLOQUEANTE` |

## Provas complementares sem poder de fecho

- O browser integrado confirmou, com mock HTTP local, que a paginação de
  clientes envia o cursor, preserva a primeira página, acrescenta a segunda e
  remove o controlo quando termina. Esta prova não substitui Chrome/Edge/Firefox.
- O gerador SAF-T interno produz XML Windows-1252 bem formado e os testes
  focados passam; motor XSD 1.1 sobre o esquema oficial `1.04_01`, reconciliação externa e revisão
  contabilística continuam por demonstrar.
- Backup/readiness/bulk import têm testes locais verdes; `pg_dump`, `pg_restore`
  e `psql` não existem no PATH e os serviços PostgreSQL/Redis/S3 não estão
  configurados.

## Bloqueios persistidos

- `TEST_DATABASE_URL` e `RESTORE_DATABASE_URL` ausentes.
- `REDIS_URL`, prefixo e HMAC de teste ausentes.
- SMTP sandbox e S3/bucket de backup remotos ausentes.
- Ferramentas PostgreSQL client ausentes.
- Google Chrome e Microsoft Edge ausentes; Firefox fica por executar porque o
  preflight da matriz termina antes de iniciar qualquer teste.
- Node local `v24.11.1`, abaixo de `24.17`.
- Motor XSD 1.1 externo sobre o esquema SAF-T `1.04_01`, reconciliação externa e revisão contabilística ausentes.
- Três decisões documentais bloqueantes permanecem explícitas e sem waiver.

Não foi usado `OPSA_SKIP_PERSISTENCE_TESTS=true`. Um skip nunca substitui a
prova runtime exigida.

## Handoff para BK-MF8-18

1. Atualizar Node para `>=24.17 <25`.
2. Fornecer serviços remotos exclusivamente por canal seguro.
3. Instalar os PostgreSQL client tools, Google Chrome e Microsoft Edge; depois
   reexecutar também os projetos Firefox da matriz.
4. Executar migrations desde zero, integração `7/7`, backup/restore e browser/axe.
5. Obter validação/reconciliação/revisão SAF-T externas.
6. Só depois repetir gate académico, defect report e validador documental.

## Decisao

Decisao final: `BLOQUEADO_AMBIENTE_E_VALIDACAO_EXTERNA`.

## Apêndice posterior — reexecução de 2026-07-13

Esta secção não altera os resultados históricos de 2026-07-10. Regista a
execução posterior após introduzir PostgreSQL local isolado em Docker Compose.

| Área | Resultado posterior observado | Decisão |
| --- | --- | --- |
| Docker/Compose | Docker `29.6.1`, Compose `v5.2.0`, config PASS | `OK` |
| PostgreSQL | imagem `postgres:17.10-alpine3.23`, digest `sha256:8189a1f6e40904781fc9e2612687877791d21679866db58b1de996b31fc312e4` | `OK_OBSERVADO` |
| Setup | `SELECT 1` autenticado, `21` migrations, seed+verify e demo healthy em `127.0.0.1:5433` | `OK` |
| Integração PostgreSQL | `11/11` PASS; seed/sentinela `1/1`, zero skips | `OK` |
| Carga | `light` em `901 ms`; `medium` em `4485 ms` | `OK_LOCAL` |
| Backup/restore | dump `429610` bytes; verify e roundtrip PASS; `21` migrations e `69` entidades/tabelas comparadas; cleanup | `OK_LOCAL` |
| API | `407/407` unitários; `174/174` contratos; MF6/MF7/MF8 PASS | `OK` |
| Web | `18` ficheiros/`55` testes; typecheck e build PASS | `OK` |
| Browser normal | Playwright `25/25` em três viewports; seeded `3/3` | `OK` |
| Dependências | npm audit API/web: `0` vulnerabilidades | `OK` |
| Integração externa | executada e fail-closed sem base remota, Redis e SMTP | `BLOQUEADO_AMBIENTE` |
| Gate académico | parou no preflight com Node `24.11.1`, abaixo de `>=24.17` | `BLOQUEADO_TOOLCHAIN` |

S3, SAF-T externo e a matriz adicional Chrome/Edge/Firefox continuam externos.
Como o gate académico não passou o preflight, nenhuma fase posterior desse gate
é apresentada como executada. Decisão posterior:
`PASS_LOCAL_COM_BLOQUEIOS_EXTERNOS_E_TOOLCHAIN`.
