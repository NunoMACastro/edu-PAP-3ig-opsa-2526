# SCORECARD-SPRINTS

## Header
- `doc_id`: `SCORECARD-SPRINTS`
- `path`: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-17`

## Objetivo
Padronizar avaliacao por sprint com criterios fixos de qualidade e controlo de carga real, alinhado ao contrato canonico comum.

## Contrato do scorecard
Campos obrigatorios por sprint:
`estado_sprint`, `cobertura`, `coerencia`, `pedagogia_guidance_step_by_step`, `adequacao_12o`, `governanca`, `carga_planeada_u`, `carga_real_u`, `desvio_u`, `risco_semaforo`, `acao_corretiva`.

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
| sprint | estado_sprint | cobertura | coerencia | pedagogia_guidance_step_by_step | adequacao_12o | governanca | carga_planeada_u | carga_real_u | desvio_u | risco_semaforo | acao_corretiva |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S01 | PLANEADA | - | - | - | - | - | 12 | - | - | N/A | - |
| S02 | PLANEADA | - | - | - | - | - | 12 | - | - | N/A | - |
| S03 | PLANEADA | - | - | - | - | - | 13 | - | - | N/A | - |
| S04 | PLANEADA | - | - | - | - | - | 12 | - | - | N/A | - |
| S05 | PLANEADA | - | - | - | - | - | 14 | - | - | N/A | - |
| S06 | PLANEADA | - | - | - | - | - | 13 | - | - | N/A | - |
| S07 | PLANEADA | - | - | - | - | - | 14 | - | - | N/A | - |
| S08 | PLANEADA | - | - | - | - | - | 13 | - | - | N/A | - |
| S09 | PLANEADA | - | - | - | - | - | 14 | - | - | N/A | - |
| S10 | PLANEADA | - | - | - | - | - | 14 | - | - | N/A | - |
| S11 | PLANEADA | - | - | - | - | - | 14 | - | - | N/A | - |
| S12 | PLANEADA | - | - | - | - | - | 15 | - | - | N/A | - |

## Regras de semaforo
- Sem `carga_real_u` preenchida, o `risco_semaforo` deve ficar `N/A`.
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
- `2026-04-17`: estado de sprint formalizado e risco default N/A para sprints sem execução.
