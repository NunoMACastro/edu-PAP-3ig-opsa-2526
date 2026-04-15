# Planificacao PAP - OPSA

## Header
- `doc_id`: `PLANIFICACAO-README`
- `path`: `docs/planificacao/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-14`

## Objetivo
Centralizar planificacao executavel, auditavel e coerente com rastreabilidade 1:1 entre RF/RNF, BK e guia pedagogico-operacional.

## Hierarquia de verdade (obrigatoria)
`MATRIZ-CANONICA-BK` > `BACKLOG-MVP` > `PLANO-SPRINTS` > `MF-VIEWS` > `guias-bk/*` > artefactos derivados.

## Contrato canonico comum (OPSA + FaithFlix)
- Scorecard fixo: `Cobertura/rastreabilidade=25`, `Coerencia documental=20`, `Pedagogia/guidance/step-by-step=25`, `Adequacao ao 12o=20`, `Governanca/avaliacao=10`.
- Header obrigatorio por guia BK:
`bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `fase_documental`, `sprint`, `core_or_reforco`, `proximo_bk`, `guia_path`, `last_updated`.
- Regra de modo: `P0 => Reforco`; `P1/P2 => Core`.
- Regra de rastreabilidade: `Matriz 100% + Backlog 100%` para RF/RNF.

## Meta documental desta vaga
- Manter identidade OPSA (ERP financeiro) com governanca canonica.
- Garantir 100% de BK com guia executavel (bloco pedagogico + bloco operacional + snippet tecnico aplicavel).
- Fechar execucao planeada em `S12 (2026-07-05)` sem reduzir cobertura RF/RNF.
- Preservar metadados canonicos (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Regra de naming dos guias BK
- Formato: `BK-MF*-**-slug-semantico.md`.
- Exemplo: `BK-MF2-03-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md`.
- O ID `BK-MF*-**` e imutavel; o slug melhora navegacao e contexto.

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
- `scripts/gerar_anexos_rastreabilidade.py`
- `scripts/auditar_planificacao.py`
- `scripts/migrar_guias_slug.py`

## Regra de atualizacao em cadeia
Qualquer alteracao em RF/RNF ou BK exige atualizar, no mesmo commit:
1. `backlogs/MATRIZ-CANONICA-BK.md`
2. `backlogs/BACKLOG-MVP.md`
3. `backlogs/ANEXO-*.md` de rastreabilidade
4. guia BK afetado
5. `sprints/SCORECARD-SPRINTS.md` e `sprints/GUIAO-DOCENTE-SEMANAL.md`

## Resumo de cobertura
- Total RF: **64**
- Total RNF: **40**
- Total BK: **104**
- Total guias BK: **104**
- Cobertura BK<->guia: **100% (1:1)**

## Changelog
- `2026-04-13`: naming com slug semantico aplicado aos 104 guias BK.
- `2026-04-13`: rebalanceamento de sprints aplicado com carga realista por semana, sem mexer na escala global.
- `2026-04-13`: contrato pedagogico-operacional reforcado com snippet tecnico obrigatorio.
- `2026-04-14`: contrato comum OPSA/FaithFlix consolidado (scorecard, header e rastreabilidade).
