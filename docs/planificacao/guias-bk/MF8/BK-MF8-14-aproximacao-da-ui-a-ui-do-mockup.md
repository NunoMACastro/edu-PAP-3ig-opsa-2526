# BK-MF8-14 - Aproximação da UI à UI do mockup.

## Header
- `doc_id`: `GUIA-BK-MF8-14`
- `bk_id`: `BK-MF8-14`
- `macro`: `MF8`
- `owner`: `Pedro`
- `apoio`: `Sofia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF35`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-15`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-14-aproximacao-da-ui-a-ui-do-mockup.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: aproximar a interface real ao mockup aprovado, mantendo consistência visual, navegação previsível e textos em português de Portugal.
- Foco tecnico da macro: operacao final, UI, testes finais e fecho para defesa PAP.
- Regra de governanca: o mockup é referência de fluxo, hierarquia visual, nomes visíveis e comportamento esperado; não é contrato pixel-perfect nem substitui requisitos funcionais.

## Bloco pedagogico
### Objetivo
Executar `Aproximação da UI à UI do mockup.` com autonomia técnica, garantindo cobertura do requisito `RNF35` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: preparar a aplicação para defesa, tornando a UI suficientemente coerente para demonstrar o produto como sistema integrado.

### Pre-requisitos
- Rever o requisito `RNF35` em `docs/RNF.md`.
- Rever `mockup/` apenas como referência de fluxo, navegação, hierarquia, labels e comportamento visual esperado.
- Confirmar as páginas/componentes reais em `apps/web` antes de alterar UI.
- Garantir que alterações visuais não removem estados `loading`, `error`, `empty` e `success`.

### Erros comuns
- Copiar código do mockup sem adaptar à aplicação real.
- Fazer alterações visuais que escondem erros de backend ou quebram permissões.
- Tratar o mockup como obrigação pixel-perfect.
- Trocar componentes partilhados por soluções isoladas sem necessidade.

### Check de compreensao
- [ ] Sei explicar que o mockup é referência visual/fluxo e não implementação final.
- [ ] Sei identificar os ecrãs reais que mais divergem do mockup.
- [ ] Sei demonstrar pelo menos 3 negativos de UI sem quebrar o fluxo principal.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-14`
- Requisito: `RNF35`
- Dependencias: `-`
- Artefactos de referencia: `mockup/`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-14` e o requisito `RNF35`.
2. Escolher os ecrãs mais importantes para defesa: dashboard, documentos, relatórios, IA/insights e configurações.
3. Comparar esses ecrãs com o mockup em navegação, layout geral, hierarquia, labels, botões e estados de feedback.
4. Registar uma lista curta de divergências com prioridade: bloqueante, importante ou cosmética.
5. Corrigir apenas divergências que melhorem consistência, clareza, demonstração ou navegação sem alterar regras de negócio.
6. Garantir textos visíveis em português de Portugal e coerentes com a terminologia usada nos restantes BKs.
7. Validar desktop, tablet e mobile para evitar sobreposição, scroll horizontal indevido ou botões inacessíveis.
8. Executar cenários negativos obrigatórios e guardar evidence com screenshots ou logs de validação.

### Cenarios negativos recomendados
- mockup sugere ação sem endpoint real: a UI não deve inventar operação funcional;
- ecrã sem dados deve manter estado `empty` legível e coerente;
- erro de API deve continuar visível depois do ajuste visual.

### Validacao
- [ ] Smoke: ecrãs principais abrem e continuam a chamar endpoints reais quando aplicável.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: componentes partilhados continuam reutilizados quando já existiam.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com screenshots/logs sanitizados.

### Handoff
- Proximo BK recomendado: `BK-MF8-15`
- Registar no handoff: ecrãs revistos, divergências corrigidas, divergências adiadas e riscos visuais residuais.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Checklist de comparação UI/mockup**

Contexto de rastreabilidade: `BK-MF8-14` -> `RNF35`.

```ts
type UiMockupCheck = {
  bkId: 'BK-MF8-14';
  screen: string;
  mockupReference: string;
  status: 'aligned' | 'accepted-drift' | 'needs-fix';
  evidence: string;
};

export const uiMockupChecks: UiMockupCheck[] = [
  {
    bkId: 'BK-MF8-14',
    screen: 'Dashboard',
    mockupReference: 'mockup/dashboard',
    status: 'needs-fix',
    evidence: 'screenshot-before-dashboard.png',
  },
];
```

Usar esta estrutura como inventário simples para justificar o que foi alinhado, o que ficou como drift aceite e o que precisa de correção.

## Criterios de aceite
- Ecrãs principais visualmente mais próximos do mockup sem quebrar comportamento funcional.
- Textos críticos em português de Portugal.
- Estados `loading`, `error`, `empty` e `success` preservados.
- Três cenários negativos executados com evidência objetiva.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteração visual.
- `proof`: screenshots antes/depois ou relatório de comparação UI/mockup.
- `neg`: cenário negativo executado com resultado esperado.

## Changelog
- `2026-06-29`: guia criado para substituir o antigo escopo restrito a interface em português de Portugal.
