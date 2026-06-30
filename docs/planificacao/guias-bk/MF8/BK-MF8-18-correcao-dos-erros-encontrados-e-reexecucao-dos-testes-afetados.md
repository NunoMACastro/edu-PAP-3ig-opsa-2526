# BK-MF8-18 - Correção dos erros encontrados e reexecução dos testes afetados.

## Header
- `doc_id`: `GUIA-BK-MF8-18`
- `bk_id`: `BK-MF8-18`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-17`
- `rf_rnf`: `RNF39`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `-`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-18-correcao-dos-erros-encontrados-e-reexecucao-dos-testes-afetados.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: corrigir erros encontrados na execução final e reexecutar os testes afetados até obter prova objetiva de fecho.
- Foco tecnico da macro: operacao final, UI, testes finais e fecho para defesa PAP.
- Regra de governanca: corrigir apenas erros confirmados ou riscos de entrega; melhorias fora do escopo devem ficar registadas como follow-up.

## Bloco pedagogico
### Objetivo
Executar `Correção dos erros encontrados e reexecução dos testes afetados.` com autonomia técnica, garantindo cobertura do requisito `RNF39` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: mostrar que testar não é o fim do processo; o produto só fecha quando falhas relevantes são corrigidas e revalidadas.

### Pre-requisitos
- Ter a lista de falhas de `BK-MF8-17`.
- Separar erros reais de falhas de ambiente ou comandos inexistentes.
- Confirmar que cada correção tem teste afetado ou smoke de revalidação.

### Erros comuns
- Corrigir sem reexecutar o teste que encontrou a falha.
- Fazer refactor amplo durante uma correção final.
- Apagar/ignorar testes falhados para obter PASS artificial.

### Check de compreensao
- [ ] Sei explicar a causa provável de cada erro corrigido.
- [ ] Sei indicar que teste prova a correção.
- [ ] Sei distinguir correção obrigatória de melhoria pós-defesa.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-18`
- Requisito: `RNF39`
- Dependencias: `BK-MF8-17`
- Artefactos de referencia: relatório de `BK-MF8-17`, `docs/evidence/`, testes afetados e backlog/matriz

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-18` e o requisito `RNF39`.
2. Priorizar falhas encontradas em `BK-MF8-17`: bloqueante, importante, follow-up.
3. Corrigir primeiro erros que impedem build, arranque, autenticação, dados multiempresa, cálculos financeiros ou demonstração principal.
4. Manter cada correção pequena, rastreável e ligada a uma falha concreta.
5. Reexecutar o teste afetado por cada correção.
6. Reexecutar smoke mínimo do fluxo corrigido quando houver impacto visual ou funcional.
7. Atualizar evidence com antes/depois, comando reexecutado e estado final.

### Cenarios negativos recomendados
- tentativa de encerrar BK com teste afetado ainda falhado deve ficar bloqueada;
- erro classificado como ambiente deve ter justificação e comando de reprodução;
- melhoria sem ligação a falha final deve ficar como follow-up.

### Validacao
- [ ] Smoke: fluxos corrigidos revalidados.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: cada correção referencia falha/teste de origem.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com antes/depois sanitizado.

### Handoff
- Proximo BK recomendado: `-`
- Registar no handoff: erros corrigidos, testes reexecutados, riscos residuais e decisão final de fecho.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Registo de correção e revalidação**

Contexto de rastreabilidade: `BK-MF8-18` -> `RNF39`.

```ts
type FinalFixRecord = {
  bkId: 'BK-MF8-18';
  issue: string;
  cause: string;
  fix: string;
  rerunCommand: string;
  result: 'PASS' | 'BLOCKED';
};

export const finalFixes: FinalFixRecord[] = [
  {
    bkId: 'BK-MF8-18',
    issue: 'contrato de faturação falhava no cálculo de IVA',
    cause: 'caso de arredondamento não tratado',
    fix: 'normalização de cêntimos antes do total',
    rerunCommand: 'npm run test:contracts',
    result: 'PASS',
  },
];
```

Usar o registo para ligar cada correção a uma prova de revalidação.

## Criterios de aceite
- Falhas relevantes da execução final corrigidas ou justificadas.
- Testes afetados reexecutados com resultado registado.
- Dois cenários negativos executados com evidência objetiva.
- Riscos residuais documentados de forma honesta.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com correções finais.
- `proof`: output dos testes reexecutados e resumo antes/depois.
- `neg`: falhas revalidadas ou bloqueios justificados.

## Changelog
- `2026-06-29`: guia genérico criado para a nova etapa de correção final da MF8.
