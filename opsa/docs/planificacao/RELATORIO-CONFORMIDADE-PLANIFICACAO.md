# RELATORIO-CONFORMIDADE-PLANIFICACAO

## Header
- `doc_id`: `RELATORIO-CONFORMIDADE-PLANIFICACAO`
- `path`: `docs/planificacao/RELATORIO-CONFORMIDADE-PLANIFICACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-13`

## Objetivo
Ser o **relatorio unico de conformidade** da planificacao OPSA, com checks deterministicos e resultado `PASS/FAIL` por regra.

## Escopo validado
- Artefactos de requisitos: `docs/RF.md`, `docs/RNF.md`
- Artefactos de planificacao: matriz, backlog, MF views, sprints, distribuicao, guias BK
- Anexos canónicos: `RF -> BK`, `RNF -> BK`, `BK -> sprint -> owner`

## Contrato de conformidade (deterministico)
| Regra | Resultado esperado |
| --- | --- |
| Cobertura RF | 64/64 RF com pelo menos 1 BK |
| Cobertura RNF | 40/40 RNF com pelo menos 1 BK |
| Integridade BK | 104 BK na matriz = 104 BK no backlog = 104 guias |
| Integridade de refs | 0 RF/RNF invalidos e 0 dependencias invalidas |
| Integridade de ligacoes | 0 links de guia quebrados |
| Coerencia temporal | Meta de prazo unificada em `S12 (2026-07-05)` |
| Contrato pedagogico | P0>=8 passos e >=3 negativos; P1/P2>=6 passos e >=2 negativos |
| Contrato de dados BK | campos canónicos obrigatorios presentes e auditaveis |
| Governanca sprint | scorecard por sprint + cadencia semanal registavel |

## Resultado atual (2026-04-13)
| Categoria | Estado |
| --- | --- |
| Cobertura/rastreabilidade | `PASS` |
| Coerencia documental | `PASS` |
| Pedagogia/guidance | `PASS` |
| Adequacao ao 12o | `PASS` |
| Governanca/avaliacao | `PASS` |

## Evidencia de verificacao
- Script de auditoria: `docs/planificacao/scripts/auditar_planificacao.py`
- Script de anexos: `docs/planificacao/scripts/gerar_anexos_rastreabilidade.py`
- Comando de validacao recomendado:
  - `python docs/planificacao/scripts/gerar_anexos_rastreabilidade.py`
  - `python docs/planificacao/scripts/auditar_planificacao.py`

## Politica de atualizacao obrigatoria
Qualquer alteracao em RF/RNF ou BK deve atualizar no mesmo commit:
1. `MATRIZ-CANONICA-BK.md`
2. `BACKLOG-MVP.md`
3. anexos `ANEXO-*.md`
4. guia BK afetado
5. este relatorio de conformidade

## Changelog
- `2026-04-12`: Relatorio inicial de subida OPSA para Muito Alto.
- `2026-04-13`: Convertido para relatorio unico com contrato deterministico PASS/FAIL por regra.
