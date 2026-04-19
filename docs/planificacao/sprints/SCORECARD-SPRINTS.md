# SCORECARD-SPRINTS

## Header
- `doc_id`: `SCORECARD-SPRINTS`
- `path`: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Contrato de avaliacao (pesos oficiais)
| criterio | peso |
| --- | --- |
| Cobertura/rastreabilidade | 25 |
| Coerencia documental | 20 |
| Pedagogia/guidance/step-by-step | 25 |
| Adequacao ao 12o | 20 |
| Governanca/avaliacao | 10 |
| Total | 100 |

## Scorecard por sprint
| sprint | estado_sprint | cobertura | coerencia | pedagogia_guidance_step_by_step | adequacao_12o | governanca | carga_planeada_u | carga_real_u | desvio_u | risco_semaforo | acao_corretiva |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S01 | PLANEADA | - | - | - | - | - | 11 | - | - | N/A | - |
| S02 | PLANEADA | - | - | - | - | - | 12 | - | - | N/A | - |
| S03 | PLANEADA | - | - | - | - | - | 11 | - | - | N/A | - |
| S04 | PLANEADA | - | - | - | - | - | 11 | - | - | N/A | - |
| S05 | PLANEADA | - | - | - | - | - | 11 | - | - | N/A | - |
| S06 | PLANEADA | - | - | - | - | - | 11 | - | - | N/A | - |
| S07 | PLANEADA | - | - | - | - | - | 11 | - | - | N/A | - |
| S08 | PLANEADA | - | - | - | - | - | 12 | - | - | N/A | - |
| S09 | PLANEADA | - | - | - | - | - | 12 | - | - | N/A | - |
| S10 | PLANEADA | - | - | - | - | - | 12 | - | - | N/A | - |
| S11 | PLANEADA | - | - | - | - | - | 13 | - | - | N/A | - |
| S12 | PLANEADA | - | - | - | - | - | 13 | - | - | N/A | - |

## Regra de preenchimento
1. `estado_sprint` so pode ser `PLANEADA`, `EM_CURSO` ou `FECHADA`.
2. Quando `carga_real_u` estiver vazia (`-`), `desvio_u` deve ficar `-` e `risco_semaforo` deve ficar `N/A`.
3. Sprint com total < 93 exige plano corretivo na sprint seguinte.
4. Gates `S4/S8/S12` exigem evidencias anexas de cobertura e coerencia.

## Regras de semaforo
- `Verde`: desvio absoluto <= 2 unidades e sem bloqueio critico.
- `Amarelo`: desvio entre 3 e 4 unidades ou bloqueio >48h em BK `P1/P2`.
- `Vermelho`: desvio >= 5 unidades, bloqueio em BK `P0` ou quebra de rastreabilidade.

## Changelog
- `2026-04-19`: scorecard sincronizado com carga planeada do baseline reduzido.
