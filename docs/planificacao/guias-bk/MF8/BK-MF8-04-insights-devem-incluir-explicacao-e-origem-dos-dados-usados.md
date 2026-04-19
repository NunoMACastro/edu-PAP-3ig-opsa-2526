# BK-MF8-04 - Insights devem incluir explicação e origem dos dados usados.

## Header
- `doc_id`: `GUIA-BK-MF8-04`
- `bk_id`: `BK-MF8-04`
- `macro`: `MF8`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF31`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-05`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-04-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Insights devem incluir explicação e origem dos dados usados.` com rastreabilidade direta ao requisito `RNF31`.
- Foco tecnico da macro: operacao final, i18n e fecho para defesa PAP.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Insights devem incluir explicação e origem dos dados usados.` com autonomia técnica, garantindo cobertura do requisito `RNF31` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: Preparar operacao final, observabilidade e fecho para defesa PAP..

### Pre-requisitos
- Ler o requisito `RNF31` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF8`.
- [ ] Sei mostrar onde esta o requisito `RNF31` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-04`
- Requisito: `RNF31`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-04` e o requisito `RNF31`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Insights devem incluir explicação e origem dos dados usados.`.
3. Implementar contrato de insight com campos obrigatorios (`insight`, `explicacao`, `fontes`, `periodo`).
4. Garantir que cada insight referencia origem concreta dos dados (query, dataset ou relatorio).
5. Validar em ambiente de teste que o frontend apresenta explicacao e fontes sem omissoes.
6. Executar smoke com pelo menos 3 insights de categorias diferentes.
7. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).
8. Atualizar evidence (`pr`, `proof`, `neg`) com payloads reais de insight.

### Cenarios negativos recomendados
- insight gerado sem `explicacao`
- insight com `fontes` vazias
- insight com fonte referenciada inexistente

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF8-05`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Builder de insight com explicacao e origem obrigatorias**

Contexto de rastreabilidade: `BK-MF8-04` -> `RNF31`.

```ts
type InsightPayload = {
  bkId: 'BK-MF8-04';
  requisito: 'RNF31';
  insight: string;
  explicacao: string;
  fontes: string[];
};

export function construirInsight(payload: InsightPayload) {
  if (!payload.insight.trim()) throw new Error('Insight vazio');
  if (!payload.explicacao.trim()) throw new Error('Explicacao obrigatoria em RNF31');
  if (payload.fontes.length === 0) throw new Error('Fonte obrigatoria em RNF31');
  return {
    ...payload,
    validado: true,
  };
}
```

Aplicar no ponto de geracao de insights para assegurar explicabilidade e rastreabilidade de origem.

## Criterios de aceite
- Contrato de insight inclui `explicacao` e `fontes` em `100%` dos casos de aceite.
- Tres cenarios negativos executados com bloqueio controlado.
- Smoke com 3 insights de categorias distintas sem erro bloqueante.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
