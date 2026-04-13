# BK-XXXX - Titulo do BK

## Header
- `doc_id`: `GUIA-BK-XXXX`
- `bk_id`: `BK-XXXX`
- `macro`: `MFX`
- `owner`: `...`
- `apoio`: `...`
- `prioridade`: `P0|P1|P2`
- `estado`: `TODO|IN_PROGRESS|DONE|BLOCKED`
- `esforco`: `S|M|L`
- `dependencias`: `BK-...`
- `rf_rnf`: `RFxx|RNFxx`
- `fase_documental`: `Fase 1|Fase 2|Fase 3`
- `sprint`: `Sxx-Syy`
- `core_or_reforco`: `Core|Reforco`
- `proximo_bk`: `BK-...`
- `guia_path`: `docs/planificacao/guias-bk/MFx/BK-MFx-NN.md`
- `last_updated`: `2026-04-13`

## O que vamos fazer neste BK

## Porque isto e importante

## O que entra (scope)

## O que nao entra (scope-out)

## Como saber que isto ficou bem


## Pre-requisitos operacionais
- Dependencias tecnicas declaradas: `BK-...`.
- Contexto minimo lido: RF/RNF do BK + matriz + backlog + guia anterior.
- Ambiente local pronto para executar smoke e cenarios negativos.

## Objetivo pedagogico (12o ano)
- Consolidar autonomia na execucao do BK com rastreabilidade e evidence.
- Treinar decisao tecnica com validacao de erros e qualidade de entrega.

## Tempo estimado
- `Core`: 45-90 minutos (execucao minima + validacao).
- `Reforco` (apenas P0): +20-40 minutos para robustez extra e defesa.

## Erros comuns a evitar
- Fechar BK sem validar cenarios negativos.
- Alterar metadados no guia sem alinhar backlog/matriz.
- Entregar evidencia incompleta (`pr`, `proof`, `neg`).

## Check de compreensao (rapido)
- [ ] Sei explicar em 60 segundos o objetivo e impacto deste BK.
- [ ] Sei indicar o RF/RNF coberto e as dependencias do BK.
- [ ] Sei demonstrar um negativo relevante e o respetivo resultado esperado.

## Pre-leitura minima (10-15 min)

## Glossario rapido

## Guia de execucao (passo-a-passo)
Minimos pedagogicos por prioridade:
- `P0` (Reforco): >= 8 passos executaveis.
- `P1/P2` (Core): >= 6 passos executaveis.

1. Confirmar dependencias e contexto do BK no backlog e na matriz canonica.
2. Executar o objetivo funcional do BK com foco no requisito `rf_rnf`.
3. Validar smoke, negativos e consistencia tecnica.
4. Registar evidence e preparar handoff para o proximo BK.

## Snippets de codigo (evolucao)
Neste momento este BK ainda nao tem snippet consolidado; os snippets serao adicionados aqui com a evolucao do projeto.

## Checklist de validacao
### Smoke
- Fluxo principal do BK executa sem erro bloqueante.
- Entregavel observavel no contexto do projeto.

### Negativos
- `P0` (Reforco): minimo 3 cenarios negativos concretos.
- `P1/P2` (Core): minimo 2 cenarios negativos concretos.
- Entrada invalida tratada com erro controlado.
- Dependencia em falta bloqueia com comportamento previsivel.

### Tecnico
- Metadados iguais entre guia, backlog e matriz canonica.
- Evidence (`pr`, `proof`, `neg`) pronta para revisao.

## Criterios de aceite
- BK concluido no scope definido.
- Dependencias respeitadas.
- Evidence minima preenchida.

## Evidence para PR/defesa
- `pr`: referencia de PR/commit.
- `proof`: evidencia objetiva da entrega.
- `neg`: teste negativo executado e resultado.

## Proximo BK recomendado
`BK-XXXX`

## Changelog
- `2026-04-12`: template canonico unificado para OPSA.
- `2026-04-13`: introduzido modelo `Core/Reforco` para reduzir sobrecarga em BK P1/P2 sem reduzir cobertura.
- `2026-04-13`: campos pedagogicos obrigatorios adicionados (pre-requisitos, objetivo, tempo, erros comuns, check de compreensao).
