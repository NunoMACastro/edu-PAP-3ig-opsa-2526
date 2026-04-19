# BK-MF8-09 - Datas, moedas e separadores no padrão europeu.

## Header
- `doc_id`: `GUIA-BK-MF8-09`
- `bk_id`: `BK-MF8-09`
- `macro`: `MF8`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF36`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `-`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-09-datas-moedas-e-separadores-no-padrao-europeu.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Datas, moedas e separadores no padrão europeu.` com rastreabilidade direta ao requisito `RNF36`.
- Foco tecnico da macro: operacao final, i18n e fecho para defesa PAP.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Datas, moedas e separadores no padrão europeu.` com autonomia técnica, garantindo cobertura do requisito `RNF36` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: Preparar operacao final, observabilidade e fecho para defesa PAP..

### Pre-requisitos
- Ler o requisito `RNF36` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF8`.
- [ ] Sei mostrar onde esta o requisito `RNF36` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-09`
- Requisito: `RNF36`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-09` e o requisito `RNF36`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Datas, moedas e separadores no padrão europeu.`.
3. Aplicar formatacao europeia (`pt-PT`) para datas, moeda, milhares e casas decimais em todos os componentes criticos.
4. Rever exportacoes/listagens para garantir consistencia entre UI, PDF e Excel.
5. Executar smoke com conjunto de valores de fronteira (milhares, centimos, datas de fim/inicio de mes).
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Cenarios negativos recomendados
- valor monetario renderizado no formato US
- data invalida sem tratamento deve gerar erro controlado

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `-`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Formatacao PT-PT de data e moeda**

Contexto de rastreabilidade: `BK-MF8-09` -> `RNF36`.

```ts
export function formatarValorPT(valor: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(valor);
}

export function formatarDataPT(iso: string) {
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short' }).format(new Date(iso));
}

// BK BK-MF8-09: usar estas funcoes em listagens e detalhes
```

Garantir consistencia visual/legal no padrao europeu para todos os campos de data/moeda do BK.

## Criterios de aceite
- Datas e moedas apresentadas em formato europeu em UI e exportacoes.
- Dois cenarios negativos executados com tratamento controlado.
- Smoke com valores de fronteira sem regressao visual/funcional.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
