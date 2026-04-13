# PLANO-SPRINTS

## Header
- `doc_id`: `PLANO-SPRINTS`
- `path`: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-13`

## Conversao S/M/L
- `S`: 1 unidade de esforco.
- `M`: 2 unidades de esforco.
- `L`: 3 unidades de esforco.

## Capacidade semanal por aluno
| Pessoa | Capacidade alvo (unid./semana) |
| --- | --- |
| Oleksii | 6 |
| Andre | 4 |
| Pedro | 4 |
| Sofia | 3 |
| **Total equipa** | **17** |

## Carga global planeada
- BK totais: `104`
- Esforco total: `160` unidades
- Janela de execucao: `12` sprints (`2026-04-13` a `2026-07-05`)
- Capacidade total da janela: `204` unidades
- Margem operacional: `44` unidades (~`27.5%`) para bloqueios, revisoes e defesa

## Calendario de sprints (semanal)
| Sprint | Periodo | Foco macro | KPI alvo |
| --- | --- | --- | --- |
| S01 | 2026-04-13 a 2026-04-19 | MF0 | >=90% BK planeados com checklist `Core` + evidence minima |
| S02 | 2026-04-20 a 2026-04-26 | MF0 | >=90% BK planeados com checklist `Core` + evidence minima |
| S03 | 2026-04-27 a 2026-05-03 | MF1 | >=90% BK planeados com checklist `Core` + evidence minima |
| S04 | 2026-05-04 a 2026-05-10 | MF1 -> MF2 | >=90% BK planeados com checklist `Core` + evidence minima |
| S05 | 2026-05-11 a 2026-05-17 | MF2 | >=90% BK planeados com checklist `Core` + evidence minima |
| S06 | 2026-05-18 a 2026-05-24 | MF2 -> MF3 | >=90% BK planeados com checklist `Core` + evidence minima |
| S07 | 2026-05-25 a 2026-05-31 | MF3 | >=90% BK planeados com checklist `Core` + evidence minima |
| S08 | 2026-06-01 a 2026-06-07 | MF3 -> MF4 | >=90% BK planeados com checklist `Core` + evidence minima |
| S09 | 2026-06-08 a 2026-06-14 | MF4 + MF5 | >=90% BK planeados com checklist `Core` + evidence minima |
| S10 | 2026-06-15 a 2026-06-21 | MF5 + MF6 + estabilizacao parcial | >=90% BK planeados com checklist `Core` + evidence minima |
| S11 | 2026-06-22 a 2026-06-28 | MF6 + MF7 + integracao | >=90% BK planeados com checklist `Core` + evidence minima |
| S12 | 2026-06-29 a 2026-07-05 | MF7 + MF8 + estabilizacao/fecho | >=90% BK planeados com checklist `Core` + evidence minima |


## Gates de qualidade por sprint
1. Nenhum BK fecha sem checklist `Core`: smoke + negativos + tecnico + evidence minima.
2. BK `P0` seguem checklist `Reforco`: `step-by-step >= 8` e `negativos >= 3`.
3. BK `P1/P2` seguem checklist `Core`: `step-by-step >= 6` e `negativos >= 2`.
4. Sem `Core` concluido na sprint `N`, o `Reforco` da `N+1` nao pode iniciar.
5. Desvios de metadados entre backlog/matriz/guia abrem acao corretiva na sprint; bloqueiam fecho apenas se afetarem BK `P0`.

## Regras de replaneamento
1. Replaneamento apenas no fecho da sprint, salvo bloqueio critico.
2. Prioridade operacional: P0>P1>P2.
3. Qualquer desvio deve refletir-se em BACKLOG-MVP, MATRIZ-CANONICA-BK e MF-VIEWS.
4. Se existir sobrecarga na sprint, reduzir primeiro carga documental de BK `P1/P2`, nunca a cobertura funcional RF/RNF.

## Cadencia obrigatoria por sprint
1. Planeamento semanal (segunda-feira): selecao de BK, riscos, capacidade por aluno.
2. Checkpoint intermadio (quarta-feira): estado real vs plano, bloqueios >48h e redistribuicao.
3. Retro curta (sexta-feira): causas de desvio e acao corretiva da sprint seguinte.
4. Registo de decisoes: toda alteracao de prioridade/scope deve ser documentada no scorecard.

## KPI por sprint
- % BK planeados concluidos.
- % BK com checklist `Core` completo.
- % BK `P0` com checklist `Reforco` completo.
- N de bloqueios >48h.
- % BK com evidence completa.

## Artefactos obrigatorios de governanca
- `SCORECARD-SPRINTS.md`: registo de pontuacao por criterio (pesos fixos).
- `GUIAO-DOCENTE-SEMANAL.md`: intervencoes, checkpoints e remediacao por perfil.

## Changelog
- `2026-04-12`: Plano de sprints normalizado e alinhado com cobertura total.
- `2026-04-12`: KPI e gates reforcados para objetivo Muito Alto do OPSA.
- `2026-04-13`: Janela de execucao ajustada para fecho no inicio de julho (S12) com reducao de sobrecarga pedagogica em BK P1/P2.
- `2026-04-13`: Sprints finais convertidas para integracao/estabilizacao e gate Core->Reforco entre sprints.
