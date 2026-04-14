# RELATORIO-CONFORMIDADE-PLANIFICACAO

## Header
- `doc_id`: `RELATORIO-CONFORMIDADE-PLANIFICACAO`
- `path`: `docs/planificacao/RELATORIO-CONFORMIDADE-PLANIFICACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-13`

## Objetivo
Ser o relatorio unico de conformidade da planificacao OPSA, com verificacao deterministica e resultado `PASS/FAIL` por regra.

## Escopo validado
- Artefactos de requisitos: `docs/RF.md`, `docs/RNF.md`
- Artefactos de planificacao: matriz, backlog, MF views, sprints, distribuicao, guias BK
- Scripts de suporte: `gerar_anexos_rastreabilidade.py`, `auditar_planificacao.py`, `migrar_guias_slug.py`

## Contrato de conformidade
| Regra | Resultado esperado |
| --- | --- |
| Cobertura RF | 64/64 RF com pelo menos 1 BK |
| Cobertura RNF | 40/40 RNF com pelo menos 1 BK |
| Integridade BK | 104 BK na matriz = 104 BK no backlog = 104 guias |
| Integridade de refs | 0 RF/RNF invalidos e 0 dependencias invalidas |
| Integridade de ligacoes | 0 links de guia quebrados |
| Naming de guias | 100% no formato `BK-MF*-**-slug-semantico.md` |
| Pedagogia + operacao | 100% dos guias com blocos explicitos obrigatorios |
| Snippet tecnico | 100% dos guias com snippet aplicavel e nao-placeholder |
| Coerencia temporal | Meta unificada em `S12 (2026-07-05)` |
| Governanca sprint | scorecard + guiao docente alinhados ao rebalanceamento |

## Resultado atual (2026-04-13)
| Categoria | Estado |
| --- | --- |
| Cobertura/rastreabilidade | `PASS` |
| Coerencia documental | `PASS` |
| Guias (pedagogico+operacional) | `PASS` |
| Snippet tecnico aplicavel | `PASS` |
| Naming com slug | `PASS` |
| Governanca/avaliacao | `PASS` |

## Evidencia de verificacao
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
- `2026-04-13`: relatorio atualizado para o pos-migracao (naming com slug + blocos pedagico/operacional + snippets tecnicos).
