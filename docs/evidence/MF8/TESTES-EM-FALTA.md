# Testes em falta MF8

## Identificacao

- BK: `BK-MF8-16`
- Requisito: `RNF37`
- Data de revalidacao: `2026-07-10`
- Implementation root validado: `real_dev`

## Evidencia local atual

| Camada | Resultado reproduzido | Limite da prova |
| --- | --- | --- |
| API unit | `278/278` PASS, zero skips | Doubles não provam PostgreSQL/Redis/S3. |
| API contracts | `153/153` PASS, zero skips | Contratos HTTP/estáticos não substituem browser/runtime remoto. |
| API integration | `2/7` PASS, `5/7` FAIL, zero skips | Failures são fail-closed por variáveis remotas ausentes. |
| API MF6/MF7/MF8 | gates locais verdes | Incluem inventário/smokes; não fecham serviços externos. |
| Frontend | `30/30` Vitest + typecheck/build/gates verdes | Playwright real não arrancou sem browsers. |
| npm audit | API e web com zero vulnerabilidades | Snapshot de 2026-07-10. |
| Documentacao | `documentation_sync_pass=true`; 0 conflitos, 0 advisories, 3 blockers runtime | `canonical_runtime_pass=false` e `overall_pass=false`, como esperado perante `NO_GO`. |

## Matriz minima de testes por prioridade

| Fluxo critico | Prioridade | Camadas inventariadas | Estado atual |
| --- | --- | --- | --- |
| MF0 identidade, sessão, roles, onboarding e convites | P0 | unit + contract + integration HTTP/SMTP | `OK_LOCAL`; E2E remoto bloqueado. |
| MF1 vendas, compras, IVA, recebimentos e pagamentos | P0 | unit + contract + integração leve | `OK_LOCAL`; persistência real bloqueada. |
| MF2 inventário, FIFO, contabilidade e reporting | P0 | unit + contract + PostgreSQL integration | `BLOQUEADO_AMBIENTE`. |
| MF3 bancos, reconciliação, imports e reporting | P0 | unit + contract + PostgreSQL integration | `BLOQUEADO_AMBIENTE`. |
| Concorrência E2E | P0 | PostgreSQL integration | `BLOQUEADO_AMBIENTE`. |
| Rate limiting distribuído | P0 | Redis entre duas instâncias | `BLOQUEADO_AMBIENTE`. |
| Email/outbox | P0 | unit + SMTP integration | `OK_LOCAL`; SMTP sandbox bloqueado. |
| Ficheiros/backup/restore | P0 | unit + S3/PostgreSQL roundtrip | `OK_LOCAL`; roundtrip remoto bloqueado. |
| SAF-T | P0 legal | gerador/contract + XSD/revisão externa | `EM_CORRECAO`; validação externa ausente. |
| MF4 IA explicável/auditoria | P1 | unit + contract | `OK_LOCAL`; runtime PostgreSQL bloqueado. |
| MF5 interface/a11y | P1 | Vitest + scripts + Playwright/axe | `OK_LOCAL`; matriz de browsers bloqueada. |
| MF6 segurança/performance | P0 | unit + contracts + scripts | `OK_LOCAL`; Redis e carga real pendentes. |

## Inventario executado

O gate de inventário atual encontrou:

- API unitária: 43 ficheiros;
- API contratos: 28 ficheiros;
- API integração: 6 ficheiros;
- API scripts: 26 ficheiros;
- frontend scripts: 14 ficheiros;
- scripts obrigatórios ausentes: nenhum.

Isto prova existência e classificação, não execução runtime. O próprio
`test:integration` permanece vermelho sem skips.

## Lacunas bloqueantes

- PostgreSQL de teste/restauro, Redis, SMTP e S3 remotos dedicados.
- `pg_dump`, `pg_restore` e `psql` compatíveis com o servidor remoto.
- Google Chrome e Microsoft Edge estão ausentes; Firefox está por executar nos
  viewports definidos porque o preflight aborta antes de iniciar a matriz.
- Node `>=24.17 <25`.
- Motor XSD 1.1 sobre o esquema oficial SAF-T `1.04_01`, reconciliação externa e revisão contabilística.
- Reauditoria final depois de todas as provas anteriores.

## Handoff para BK-MF8-17

- Configurar o ambiente por canal seguro, sem gravar valores na evidence.
- Exigir `7/7` integrações, zero skips e backup/restore completo.
- Executar Playwright/axe nos 9 projetos de browser/viewport e carga concorrente.
- Manter os três blockers documentais enquanto estes pré-requisitos faltarem.

## Decisao

Decisao final: `BLOQUEADO_ATE_AMBIENTE_REMOTO_E_GATES_VERDES`.
