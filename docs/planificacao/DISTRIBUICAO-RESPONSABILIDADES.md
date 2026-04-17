# DISTRIBUICAO-RESPONSABILIDADES

## Header
- `doc_id`: `DISTRIBUICAO-RESPONSABILIDADES`
- `path`: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-17`

## Equipa e carga alvo
| Pessoa | Papel principal | Total BK | P0 | P1 | P2 | Carga alvo semanal |
| --- | --- | --- | --- | --- | --- | --- |
| Oleksii | Execucao tecnica e handoff | 28 | 22 | 5 | 1 | 6 unid./semana |
| Andre | Execucao tecnica e handoff | 28 | 16 | 12 | 0 | 4 unid./semana |
| Pedro | Execucao tecnica e handoff | 27 | 15 | 12 | 0 | 4 unid./semana |
| Sofia | Execucao tecnica e handoff | 17 | 3 | 14 | 0 | 3 unid./semana |

## Teto semanal recomendado (12o ano)
| Perfil | Teto recomendado | Regra de excecao |
| --- | --- | --- |
| P0 | <= 6 unid./semana | Excecao aprovada por orientador e registada no scorecard da sprint. |
| P1 | <= 4 unid./semana | Se exceder, converter carga adicional para `Reforco` opcional. |
| P2 | <= 3 unid./semana | Se exceder, adiar para sprint seguinte mantendo cobertura final. |

## Regras principais
1. Owner unico por BK com apoio obrigatorio.
2. BK so fecha com criterios de aceite e evidence (pr/proof/neg).
3. BK P0 concentrados nos melhores programadores para reduzir risco tecnico.
4. Perfis de menor capacidade tecnica focam P1/P2, QA e governance operacional.
5. Carga pedagogica: BK `P0` em modo `Reforco`; BK `P1/P2` em modo `Core`.
6. Sempre que houver sobrecarga semanal, aliviar primeiro documental de `P1/P2` sem cortar cobertura funcional.
7. Qualquer excecao de carga semanal exige risco associado + acao de mitigacao no scorecard da sprint.

## Matriz por artefacto
| Artefacto | Owner |
| --- | --- |
| PLANO-IMPLEMENTACAO-TOTAL.md | Nuno |
| MATRIZ-CANONICA-BK.md | Nuno |
| BACKLOG-MVP.md | Oleksii |
| MF-VIEWS.md | Andre |
| PLANO-SPRINTS.md | Pedro |
| guias-bk/MF0..MF8/*.md | Owner do BK |

## Cerimonias
- Planeamento semanal: alinhamento de BK por prioridade e desbloqueio.
- Sync tecnico intermadio: dependencias, riscos e handoff.
- Fecho semanal: validacao de checklist e evidence.

## Remediacao por perfil de aluno
- Perfil forte: pode absorver `Reforco` adicional e apoiar desbloqueio tecnico P0.
- Perfil intermadio: manter foco em `Core`, com reforco apenas apos fecho do core da sprint.
- Perfil em risco: reduzir paralelismo, dividir BK em micro-entregas e aumentar checkpoint docente.

## Papel do orientador
- Nuno valida coerencia macro, gates e conformidade final.
- Nuno aprova excecoes de escopo e conflitos de dependencia.

## Changelog
- `2026-04-12`: Redistribuicao de ownership alinhada com perfil da equipa.
- `2026-04-13`: Capacidade semanal formalizada e regras de sobrecarga ajustadas para fecho ate inicio de julho.
- `2026-04-13`: Tetos semanais por perfil e regime de excecoes/remediacao adicionados.
- `2026-04-17`: contagens por owner atualizadas para o escopo final de 100 BK.
- `2026-04-17`: ownership rebalance aplicado para reduzir gargalo inicial de MF0 e distribuir carga P1.
