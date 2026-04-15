# BK-MF6-03 - Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.

## Header
- `doc_id`: `GUIA-BK-MF6-03`
- `bk_id`: `BK-MF6-03`
- `macro`: `MF6`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF10`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-04`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md`
- `last_updated`: `2026-04-13`

## Contexto do BK
- Entrega alvo: implementar `Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.` com rastreabilidade direta ao requisito `RNF10`.
- Foco tecnico da macro: desempenho, seguranca e robustez tecnica.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.` com rastreabilidade explicita para `RNF10` e demonstracao tecnica no contexto da sprint `S10-S11`.

### Pre-requisitos
- Ler o requisito `RNF10` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF6`.
- [ ] Sei mostrar onde esta o requisito `RNF10` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF6-03`
- Requisito: `RNF10`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do BK-MF6-03 e o requisito `RNF10`.
2. Verificar pre-condicoes tecnicas (-) e validar ambiente local antes de implementar.
3. Definir contrato de entrada/saida do fluxo principal para `Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.`.
4. Implementar caminho principal com registo de logs/erros relevantes para auditoria.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF6-04`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Emparelhamento simples de movimentos bancarios**

```ts
type Movimento = { id: string; valor: number; data: string; descricao: string };

export function sugerirCorrespondencias(extrato: Movimento[], pendentes: Movimento[]) {
  return extrato.map((m) => {
    const match = pendentes.find((p) => p.valor === m.valor && p.data === m.data);
    return { bk: 'BK-MF6-03', movimento: m.id, documento: match?.id ?? null };
  });
}
```

Serve como base para reconciliacao automatica, mantendo criterio deterministico (valor+data) antes de regras avancadas.

## Criterios de aceite
- BK implementado no scope definido, sem romper dependencias.
- Validacao de smoke e negativos concluida.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).
- Evidence pronta para revisao tecnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-13`: guia migrado para naming com slug e template pedagogico-operacional executavel.
