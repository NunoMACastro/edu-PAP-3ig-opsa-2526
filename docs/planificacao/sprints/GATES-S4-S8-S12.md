# GATES-S4-S8-S12

## Header
- `doc_id`: `GATES-S4-S8-S12`
- `path`: `docs/planificacao/sprints/GATES-S4-S8-S12.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-18`

## Objetivo
Estabelecer baseline oficial de validacao para os gates S4, S8 e S12 com contrato unico entre as 4 PAPs.

## Gates
| gate | data_planeada | escopo_macro | criterios_minimos | estado |
| --- | --- | --- | --- | --- |
| S4 | 2026-05-10 | MF0-MF1 | Cobertura RF sem orfaos + 100% guias com header canonico | PENDING |
| S8 | 2026-06-07 | MF0-MF4 | Coerencia matriz/backlog/guias + score >= 97/100 | PENDING |
| S12 | 2026-07-05 | MF0-MF8 | Auditoria automatica PASS + pacote final de defesa | PENDING |

## Evidencias obrigatorias por gate
- JSON do validador canonico (`scripts/validate-planificacao.sh`).
- Snapshot do scorecard da sprint de gate.
- Lista de desvios e acoes corretivas (quando existir).
- No gate `S12`: evidencia operacional de `deploy` e `rollback` conforme `OPERACAO-DEPLOY-ROLLBACK.md`.

## Changelog
- `2026-04-18`: gates unificados no contrato canónico v2 cross-PAP.
