# BK-MF7-09 - Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).

## Header
- `doc_id`: `GUIA-BK-MF7-09`
- `bk_id`: `BK-MF7-09`
- `macro`: `MF7`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF27`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-10`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-09-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabilidade-ia.md`
- `last_updated`: `2026-04-13`

## Contexto do BK
- Entrega alvo: implementar `Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).` com rastreabilidade direta ao requisito `RNF27`.
- Foco tecnico da macro: compliance, interoperabilidade e modularidade.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).` com rastreabilidade explicita para `RNF27` e demonstracao tecnica no contexto da sprint `S11-S12`.

### Pre-requisitos
- Ler o requisito `RNF27` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF7`.
- [ ] Sei mostrar onde esta o requisito `RNF27` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF7-09`
- Requisito: `RNF27`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do BK-MF7-09 e o requisito `RNF27`.
2. Verificar pre-condicoes tecnicas (-) e validar ambiente local antes de implementar.
3. Definir contrato de entrada/saida do fluxo principal para `Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).`.
4. Implementar caminho principal com registo de logs/erros relevantes para auditoria.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).
7. Aplicar reforco tecnico (robustez/performance/seguranca) associado ao risco principal do BK.
8. Atualizar evidence (`pr`, `proof`, `neg`) com artefactos concretos e verificaveis.

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF7-10`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validacao fiscal minima antes de lancar documento**

```ts
type LinhaDocumento = { conta: string; base: number; taxaIVA: number };

export function validarDocumentoFiscal(linhas: LinhaDocumento[], bkId = 'BK-MF7-09') {
  if (!linhas.length) throw new Error('Documento sem linhas');
  for (const l of linhas) {
    if (l.base <= 0) throw new Error(`Base invalida em ${l.conta}`);
    if (l.taxaIVA < 0 || l.taxaIVA > 1) throw new Error(`Taxa IVA invalida em ${l.conta}`);
  }
  return { bkId, totalIVA: linhas.reduce((acc, l) => acc + l.base * l.taxaIVA, 0) };
}
```

Aplicar antes de persistir documento para evitar registos contabilisticos inconsistentes e garantir rastreio do requisito.

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
