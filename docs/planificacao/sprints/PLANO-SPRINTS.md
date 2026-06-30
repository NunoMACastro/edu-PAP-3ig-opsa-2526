# PLANO-SPRINTS

## Header
- `doc_id`: `PLANO-SPRINTS`
- `path`: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-06-30`

## Conversao S/M/L
- `S`: 1 unidade
- `M`: 2 unidades
- `L`: 3 unidades

## Capacidade semanal por aluno
| Pessoa | Capacidade alvo (u/semana) |
| --- | --- |
| Andre | 4 |
| Oleksii | 6 |
| Pedro | 4 |
| Sofia | 2 |
| Total equipa | 16 |

## Carga global planeada
- BK totais: `93`
- Esforco total: `154` unidades
- Janela de execucao: `12` sprints (`2026-04-13` a `2026-07-05`)
- Capacidade total da janela: `192` unidades
- Margem operacional global: `+38` unidades (~`+19.8%`) para bloqueios, revisoes e defesa

## Linha temporal oficial (12 sprints)
| sprint | periodo | foco_macro | objetivo_operacional | carga_planeada_u | gate |
| --- | --- | --- | --- | --- | --- |
| S01 | 2026-04-13 a 2026-04-19 | MF0 | Carga planeada e entrega com evidence completa | 11 | NAO |
| S02 | 2026-04-20 a 2026-04-26 | MF0 | Carga planeada e entrega com evidence completa | 12 | NAO |
| S03 | 2026-04-27 a 2026-05-03 | MF1 | Carga planeada e entrega com evidence completa | 11 | NAO |
| S04 | 2026-05-04 a 2026-05-10 | MF1 | Carga planeada e entrega com evidence completa | 11 | SIM |
| S05 | 2026-05-11 a 2026-05-17 | MF2 | Carga planeada e entrega com evidence completa | 11 | NAO |
| S06 | 2026-05-18 a 2026-05-24 | MF2 | Carga planeada e entrega com evidence completa | 11 | NAO |
| S07 | 2026-05-25 a 2026-05-31 | MF3 | Carga planeada e entrega com evidence completa | 11 | NAO |
| S08 | 2026-06-01 a 2026-06-07 | MF3/MF4 | Carga planeada e entrega com evidence completa | 12 | SIM |
| S09 | 2026-06-08 a 2026-06-14 | MF4/MF5 | Carga planeada e entrega com evidence completa | 12 | NAO |
| S10 | 2026-06-15 a 2026-06-21 | MF6/MF5 | Carga planeada e entrega com evidence completa | 12 | NAO |
| S11 | 2026-06-22 a 2026-06-28 | MF7/MF6 | Carga planeada e entrega com evidence completa | 13 | NAO |
| S12 | 2026-06-29 a 2026-07-05 | MF7/MF8 | Carga planeada e entrega com evidence completa | 27 | SIM |

## Regra de replaneamento
1. Replaneamento apenas no fecho da sprint, salvo bloqueio critico.
2. Prioridade operacional: `P0 > P1 > P2`.
3. Qualquer desvio exige sincronizacao de matriz/backlog/guias/sprints no mesmo ciclo.
4. Em sobrecarga, reduzir primeiro paralelismo `P1/P2` sem perder cobertura RF/RNF.

## KPI minimos por sprint
- `% BK planeados concluidos >= 85%`.
- `% BK com smoke/negativos/evidence completos >= 90%`.
- `% BK com snippet coerente com `bk_id` e `rf_rnf` = 100%`.

## Artefactos obrigatorios
- `SCORECARD-SPRINTS.md`
- `GUIAO-DOCENTE-SEMANAL.md`
- `GATES-S4-S8-S12.md`

## Changelog
- `2026-06-30`: capacidade semanal diferenciada para a MF8, mantendo total de equipa em 16u: Oleksii 6u, Andre 4u, Pedro 4u e Sofia 2u.
- `2026-06-30`: S12 recalibrada para incluir RF49..RF51 e os BK-MF8-03 a BK-MF8-08, atualizando a baseline para 93 BK / 154u.
- `2026-06-29`: S12 recalibrada para incluir BK-MF8-10 a BK-MF8-12, atualizando a baseline para 87 BK / 143u.
- `2026-04-19`: plano de sprints recalibrado para baseline reduzido (84 BK / 140u).
