# SCORECARD-SPRINTS

## Header
- `doc_id`: `SCORECARD-SPRINTS`
- `path`: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-10`

## Contrato de avaliacao (pesos oficiais)
| criterio | peso |
| --- | --- |
| Cobertura/rastreabilidade | 25 |
| Coerencia documental | 20 |
| Pedagogia/guidance/step-by-step | 25 |
| Adequacao ao 12o | 20 |
| Governanca/avaliacao | 10 |
| Total | 100 |

## Separação de estados

Este scorecard mede exclusivamente o trabalho dos alunos. `estado_sprint` é uma projeção de `estado_alunos`; não é substituído pelo estado de findings, testes ou ficheiros em `real_dev`.

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
| S12 | PLANEADA | - | - | - | - | - | 27 | - | - | N/A | - |

## Regra de preenchimento
1. `estado_sprint` so pode ser `PLANEADA`, `EM_CURSO` ou `FECHADA`.
2. Quando `carga_real_u` estiver vazia (`-`), `desvio_u` deve ficar `-` e `risco_semaforo` deve ficar `N/A`.
3. Sprint com total < 93 exige plano corretivo na sprint seguinte.
4. Gates `S4/S8/S12` exigem evidencias anexas de cobertura e coerencia.

## Regras de semaforo
- `Verde`: desvio absoluto <= 2 unidades e sem bloqueio critico.
- `Amarelo`: desvio entre 3 e 4 unidades ou bloqueio >48h em BK `P1/P2`.
- `Vermelho`: desvio >= 5 unidades, bloqueio em BK `P0` ou quebra de rastreabilidade.

## Gate da implementação de referência

| gate | estado_referencia | documentation_sync | overall | fonte |
| --- | --- | --- | --- | --- |
| S12 | `NO_GO` | Calculado pelo validador documental | `false` enquanto existirem blockers runtime | [Relatório canónico de 2026-07-09](../auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md) |

Esta linha não contribui para os pesos `25/20/25/20/10`, não fecha sprints e não altera a tabela pedagógica. Mesmo com `documentation_sync_pass=true`, integração persistida, browser E2E, restore remoto e validação SAF-T continuam sujeitos às provas runtime do relatório canónico.

## Changelog
- `2026-07-10`: acrescentado gate S12 separado para a referência, atualmente `NO_GO`, sem alterar o score pedagógico.
- `2026-07-10`: scorecard revisto e carga planeada de S12 sincronizada com `PLANO-SPRINTS.md` (27u).
- `2026-04-19`: scorecard sincronizado com carga planeada do baseline reduzido.
