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
- Margem operacional global: `44` unidades (~`27.5%`) para bloqueios, revisoes e defesa

## Rebalanceamento de carga por sprint (realista)
| Sprint | Periodo | Foco macro | Carga planeada (u) | Buffer semanal (u) | KPI alvo |
| --- | --- | --- | --- | --- | --- |
| S01 | 2026-04-13 a 2026-04-19 | MF0 (base) | 12 | 5 | >=90% BK planeados com `Core` + evidencia minima |
| S02 | 2026-04-20 a 2026-04-26 | MF0 (fecho) | 12 | 5 | >=90% BK planeados com `Core` + evidencia minima |
| S03 | 2026-04-27 a 2026-05-03 | MF1 (base) | 13 | 4 | >=90% BK planeados com `Core` + evidencia minima |
| S04 | 2026-05-04 a 2026-05-10 | MF1 (fecho) + consolidacao | 12 | 5 | >=90% BK planeados com `Core` + evidencia minima |
| S05 | 2026-05-11 a 2026-05-17 | MF2 (base) | 14 | 3 | >=90% BK planeados com `Core` + evidencia minima |
| S06 | 2026-05-18 a 2026-05-24 | MF2 (fecho) + preparacao MF3 | 13 | 4 | >=90% BK planeados com `Core` + evidencia minima |
| S07 | 2026-05-25 a 2026-05-31 | MF3 (base) | 14 | 3 | >=90% BK planeados com `Core` + evidencia minima |
| S08 | 2026-06-01 a 2026-06-07 | MF3 (fecho) + arranque MF4 | 13 | 4 | >=90% BK planeados com `Core` + evidencia minima |
| S09 | 2026-06-08 a 2026-06-14 | MF4 + MF5 | 14 | 3 | >=90% BK planeados com `Core` + evidencia minima |
| S10 | 2026-06-15 a 2026-06-21 | MF5 + MF6 | 14 | 3 | >=90% BK planeados com `Core` + evidencia minima |
| S11 | 2026-06-22 a 2026-06-28 | MF6 + MF7 | 14 | 3 | >=90% BK planeados com `Core` + evidencia minima |
| S12 | 2026-06-29 a 2026-07-05 | MF7 + MF8 + fecho | 15 | 2 | >=90% BK planeados com `Core` + evidencia minima |

## Janela oficial por macro (apos rebalanceamento)
- `MF0`: `S01-S02`
- `MF1`: `S03-S04`
- `MF2`: `S05-S06`
- `MF3`: `S07-S08`
- `MF4`: `S08-S09`
- `MF5`: `S09-S10`
- `MF6`: `S10-S11`
- `MF7`: `S11-S12`
- `MF8`: `S12`

## Gates de qualidade por sprint
1. Nenhum BK fecha sem validacao completa de `Smoke`, `Negativos`, `Tecnico` e `Evidence`.
2. BK `P0` seguem modo `Reforco`: `>=8 passos` e `>=3 negativos`.
3. BK `P1/P2` seguem modo `Core`: `>=6 passos` e `>=2 negativos`.
4. Sem `Core` concluido na sprint `N`, o `Reforco` da `N+1` nao pode iniciar.
5. Desvios de metadados entre backlog/matriz/guia abrem acao corretiva na sprint; bloqueiam fecho se afetarem BK `P0`.

## Regras de replaneamento
1. Replaneamento apenas no fecho da sprint, salvo bloqueio critico.
2. Prioridade operacional: `P0 > P1 > P2`.
3. Qualquer desvio deve refletir-se em `BACKLOG-MVP`, `MATRIZ-CANONICA-BK`, anexos e guias BK.
4. Em sobrecarga semanal, reduzir primeiro carga documental de BK `P1/P2`, nunca a cobertura RF/RNF.

## Cadencia obrigatoria por sprint
1. Planeamento semanal (segunda-feira): selecao de BK, capacidade real e riscos.
2. Checkpoint intermadio (quarta-feira): estado real vs plano e bloqueios >48h.
3. Retro curta (sexta-feira): causas de desvio e acao corretiva da sprint seguinte.
4. Registo de decisoes: toda alteracao de prioridade/scope deve ficar no scorecard.

## KPI por sprint
- % BK planeados concluidos.
- % BK com bloco pedagogico + operacional conforme.
- % BK com snippet tecnico aplicavel (nao placeholder).
- N de bloqueios >48h.
- Desvio de carga (`planeada - real`) em unidades.

## Artefactos obrigatorios de governanca
- `SCORECARD-SPRINTS.md`: registo de criterios, carga e risco por sprint.
- `GUIAO-DOCENTE-SEMANAL.md`: intervencoes docentes, checkpoints e remediacao por perfil.

## Changelog
- `2026-04-13`: rebalanceamento de carga por sprint aplicado sem alterar a escala global do plano.
- `2026-04-13`: janelas de macro atualizadas (`MF2 -> S05-S06`, `MF3 -> S07-S08`) para maior executabilidade pedagogica.
