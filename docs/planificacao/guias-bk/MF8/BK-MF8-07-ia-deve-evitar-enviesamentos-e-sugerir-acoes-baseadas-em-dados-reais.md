# BK-MF8-07 - IA deve evitar enviesamentos e sugerir ações baseadas em dados reais.

## Header
- `doc_id`: `GUIA-BK-MF8-07`
- `bk_id`: `BK-MF8-07`
- `macro`: `MF8`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF34`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-08`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-07-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `IA deve evitar enviesamentos e sugerir ações baseadas em dados reais.` com rastreabilidade direta ao requisito `RNF34`.
- Foco tecnico da macro: operacao final, i18n e fecho para defesa PAP.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `IA deve evitar enviesamentos e sugerir ações baseadas em dados reais.` com autonomia técnica, garantindo cobertura do requisito `RNF34` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: Preparar operacao final, observabilidade e fecho para defesa PAP..

### Pre-requisitos
- Ler o requisito `RNF34` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF8`.
- [ ] Sei mostrar onde esta o requisito `RNF34` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-07`
- Requisito: `RNF34`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-07` e o requisito `RNF34`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `IA deve evitar enviesamentos e sugerir ações baseadas em dados reais.`.
3. Definir regra minima para aceitar sugestoes da IA: evidencias suficientes, confianca minima e ausencia de viés obvio.
4. Implementar validacao de recomendacoes com bloqueio quando faltarem dados ou justificacao.
5. Executar smoke com casos validos para confirmar que recomendacoes saem com base de dados explicita.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Cenarios negativos recomendados
- recomendacao sem evidencias de dados
- recomendacao com confianca abaixo do limiar minimo

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF8-08`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Filtro minimo de qualidade para recomendacoes da IA**

Contexto de rastreabilidade: `BK-MF8-07` -> `RNF34`.

```ts
type SugestaoIA = {
  bkId: 'BK-MF8-07';
  requisito: 'RNF34';
  acao: string;
  confianca: number;
  evidencias: string[];
};

export function validarSugestaoIA(s: SugestaoIA) {
  if (s.evidencias.length < 2) throw new Error('RNF34: evidencias insuficientes');
  if (s.confianca < 0.6) throw new Error('RNF34: confianca abaixo do minimo');
  return { bkId: s.bkId, requisito: s.requisito, validado: true };
}
```

Aplicar antes de publicar sugestoes para reduzir enviesamento e reforcar decisao baseada em dados reais.

## Criterios de aceite
- Regra minima de qualidade para sugestoes ativa no backend.
- Dois cenarios negativos executados com rejeicao controlada.
- Smoke com sugestoes validas contendo evidencias de dados reais.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
