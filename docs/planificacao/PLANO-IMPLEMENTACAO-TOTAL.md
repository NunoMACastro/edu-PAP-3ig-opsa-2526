# PLANO-IMPLEMENTACAO-TOTAL

## Header
- `doc_id`: `PLANO-IMPLEMENTACAO-TOTAL`
- `path`: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Objetivo
Definir o plano macro executavel da Opsa com rastreabilidade RF/RNF -> BK -> Guia e governanca alinhada ao contrato canónico v2.

## Assuncoes
- IDs RF/RNF/BK sao imutaveis após esta vaga de normalizacao.
- Escopo funcional aprovado desta vaga mantem-se sem reintroduzir itens removidos.
- Fecho documental exige score consolidado `>=97/100`.

## Tabela MF0..MF8
| Macro | Janela | Total BK | Owner stream P0 |
| --- | --- | --- | --- |
| MF0 | Janela canónica S01-S12 | 12 | Oleksii |
| MF1 | Janela canónica S01-S12 | 10 | Oleksii |
| MF2 | Janela canónica S01-S12 | 8 | Andre |
| MF3 | Janela canónica S01-S12 | 8 | Oleksii |
| MF4 | Janela canónica S01-S12 | 10 | Pedro |
| MF5 | Janela canónica S01-S12 | 7 | Oleksii |
| MF6 | Janela canónica S01-S12 | 10 | Oleksii |
| MF7 | Janela canónica S01-S12 | 10 | Andre |
| MF8 | Janela canónica S01-S12 | 9 | Oleksii |

## Fases
1. Fase 1 (`S01-S04`): fundacoes + consolidacao do nucleo inicial.
2. Fase 2 (`S05-S08`): capacidades de produto + coerencia cross-artefactos.
3. Fase 3 (`S09-S12`): qualidade final, evidencias e defesa.

## Regras transversais por macro
1. Owner unico por BK com apoio explicito.
2. BK fecha apenas com `Smoke`, `Negativos`, `Tecnico` e `Evidence` completos.
3. BK `P0` em modo `Reforco`; BK `P1/P2` em modo `Core`.
4. Qualquer drift entre matriz/backlog/guias/sprints bloqueia fecho da sprint.

## Gates S4/S8/S12
- Fonte oficial: `docs/planificacao/sprints/GATES-S4-S8-S12.md`.
- Operacao de release: `docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md`.
- `S4`: cobertura inicial + consistencia estrutural.
- `S8`: coerencia documental + score parcial `>=97/100`.
- `S12`: fecho integral com validacao automatica em `PASS`.

## Criterios de saida
- `bash scripts/validate-planificacao.sh` com `overall_pass: true`.
- Score consolidado no scorecard `>=97/100`.
- Evidencias de gate publicadas (`S4`, `S8`, `S12`).
- Evidencias operacionais de `deploy` e `rollback` publicadas no gate `S12`.

## Changelog
- `2026-04-19`: plano macro recalculado para baseline reduzido (84 BK).
