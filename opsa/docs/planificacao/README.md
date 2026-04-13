# Planificacao PAP - OPSA

## Header
- `doc_id`: `PLANIFICACAO-README`
- `path`: `docs/planificacao/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-13`

## Objetivo
Centralizar planificacao executavel, auditavel e coerente com rastreabilidade 1:1 entre RF/RNF, BK e guia pedagogico.

## Hierarquia de verdade (obrigatoria)
`MATRIZ-CANONICA-BK` > `BACKLOG-MVP` > `PLANO-SPRINTS` > `MF-VIEWS` > `guias-bk/*` > relatorios derivados.

## Meta documental desta vaga
- Subir o OPSA para nivel `Muito Alto` na matriz comparativa global.
- Garantir que cada BK tem guia com passos executaveis, negativos concretos, aceite mensuravel e evidence pronta para defesa.
- Fechar execucao planeada no inicio de julho (`S12 = 2026-07-05`) sem reduzir cobertura RF/RNF.
- Preservar metadados canonicos (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).
- Formalizar contrato de campos obrigatorios por BK e anexos canónicos de rastreabilidade bidirecional.

## Estrutura
- `PLANO-IMPLEMENTACAO-TOTAL.md`
- `DISTRIBUICAO-RESPONSABILIDADES.md`
- `backlogs/MATRIZ-CANONICA-BK.md`
- `backlogs/BACKLOG-MVP.md`
- `backlogs/MF-VIEWS.md`
- `backlogs/CONTRATO-CAMPOS-BK.md`
- `backlogs/ANEXO-RF-PARA-BKS.md`
- `backlogs/ANEXO-RNF-PARA-BKS.md`
- `backlogs/ANEXO-BK-SPRINT-OWNER.md`
- `sprints/PLANO-SPRINTS.md`
- `sprints/SCORECARD-SPRINTS.md`
- `sprints/GUIAO-DOCENTE-SEMANAL.md`
- `guias-bk/README.md`
- `guias-bk/_TEMPLATE-BK.md`
- `guias-bk/ROADMAP-BKS-RESTANTES.md`
- `guias-bk/MAPA-MIGRACAO-LEGACY-PARA-CANONICO.md`
- `RELATORIO-CONFORMIDADE-PLANIFICACAO.md`
- `scripts/gerar_anexos_rastreabilidade.py`
- `scripts/auditar_planificacao.py`

## Contrato pedagogico por BK
- BK `P0` em modo `Reforco`: step-by-step >= 8 e >= 3 negativos.
- BK `P1/P2` em modo `Core`: step-by-step >= 6 e >= 2 negativos.
- Campos obrigatorios no guia: `pre-requisitos`, `objetivo pedagogico`, `tempo estimado`, `erros comuns`, `check de compreensao`.
- Criterios de aceite mensuraveis e verificaveis.
- Evidence obrigatoria em formato `pr`, `proof`, `neg`.

## Contrato de dados canónico por BK
Todos os artefactos de planificacao devem manter os campos:
`bk_id`, `mf`, `sprint`, `owner`, `rf_rnf[]`, `deps[]`, `guia_path`, `core_or_reforco`.
Referencia canónica: `backlogs/CONTRATO-CAMPOS-BK.md`.

## Regra de atualizacao em cadeia
Qualquer alteracao em RF/RNF ou em BK exige atualizar, no mesmo commit:
1. `backlogs/MATRIZ-CANONICA-BK.md`
2. `backlogs/BACKLOG-MVP.md`
3. `backlogs/ANEXO-*.md` de rastreabilidade
4. guia BK afetado
5. `RELATORIO-CONFORMIDADE-PLANIFICACAO.md` (estado PASS/FAIL)

## Resumo de cobertura
- Total RF: **64**
- Total RNF: **40**
- Total BK: **104**
- Total guias BK: **104**
- Cobertura BK<->guia: **100% (1:1)**

## Ordem de leitura recomendada
1. `PLANO-IMPLEMENTACAO-TOTAL.md`
2. `DISTRIBUICAO-RESPONSABILIDADES.md`
3. `backlogs/MATRIZ-CANONICA-BK.md`
4. `backlogs/BACKLOG-MVP.md`
5. `backlogs/MF-VIEWS.md`
6. `sprints/PLANO-SPRINTS.md`
7. `guias-bk/README.md`
8. `RELATORIO-CONFORMIDADE-PLANIFICACAO.md`

## Changelog
- `2026-04-12`: Subida OPSA para Muito Alto (reescrita pedagogica 104/104 BK + recalibracao de matriz).
- `2026-04-13`: Contrato pedagogico recalibrado para reduzir sobrecarga em BK P1/P2 e encurtar calendario ate inicio de julho.
- `2026-04-13`: Hierarquia de verdade, contrato canónico de campos BK, anexos de rastreabilidade e scorecards adicionados.
