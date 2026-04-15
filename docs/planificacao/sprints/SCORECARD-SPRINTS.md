# SCORECARD-SPRINTS

## Header
- `doc_id`: `SCORECARD-SPRINTS`
- `path`: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-14`

## Objetivo
Padronizar avaliacao por sprint com criterios fixos de qualidade e controlo de carga real, alinhado ao contrato canonico comum.

## Contrato do scorecard
Campos obrigatorios por sprint:
`cobertura`, `coerencia`, `pedagogia_guidance_step_by_step`, `adequacao_12o`, `governanca`, `carga_planeada_u`, `carga_real_u`, `desvio_u`, `risco_semaforo`, `acao_corretiva`.

## Pesos oficiais (0-100)
| Criterio | Peso |
| --- | --- |
| Cobertura/rastreabilidade | 25 |
| Coerencia documental | 20 |
| Pedagogia/guidance/step-by-step | 25 |
| Adequacao ao 12o | 20 |
| Governanca/avaliacao | 10 |
| **Total** | **100** |

## Scorecard por sprint
| sprint | cobertura | coerencia | pedagogia_guidance_step_by_step | adequacao_12o | governanca | carga_planeada_u | carga_real_u | desvio_u | risco_semaforo | acao_corretiva |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S01 | - | - | - | - | - | 12 | - | - | Verde | - |
| S02 | - | - | - | - | - | 12 | - | - | Verde | - |
| S03 | - | - | - | - | - | 13 | - | - | Verde | - |
| S04 | - | - | - | - | - | 12 | - | - | Verde | - |
| S05 | - | - | - | - | - | 14 | - | - | Verde | - |
| S06 | - | - | - | - | - | 13 | - | - | Verde | - |
| S07 | - | - | - | - | - | 14 | - | - | Verde | - |
| S08 | - | - | - | - | - | 13 | - | - | Verde | - |
| S09 | - | - | - | - | - | 14 | - | - | Verde | - |
| S10 | - | - | - | - | - | 14 | - | - | Verde | - |
| S11 | - | - | - | - | - | 14 | - | - | Verde | - |
| S12 | - | - | - | - | - | 15 | - | - | Verde | - |

## Regras de semaforo
- `Verde`: desvio absoluto <= 2 unidades e sem bloqueio critico.
- `Amarelo`: desvio entre 3 e 4 unidades ou bloqueio >48h em BK `P1/P2`.
- `Vermelho`: desvio >= 5 unidades, bloqueio em BK `P0` ou quebra de rastreabilidade.

## Acao automatica
- `Verde`: manter plano.
- `Amarelo`: replanear dentro da sprint e reforcar checkpoint docente.
- `Vermelho`: congelar `Reforco`, priorizar `Core` e abrir decisao do orientador.

## Changelog
- `2026-04-13`: scorecard alinhado ao rebalanceamento de carga por sprint e controlo de desvio em unidades.
- `2026-04-14`: nomenclatura unificada para `Pedagogia/guidance/step-by-step`.
