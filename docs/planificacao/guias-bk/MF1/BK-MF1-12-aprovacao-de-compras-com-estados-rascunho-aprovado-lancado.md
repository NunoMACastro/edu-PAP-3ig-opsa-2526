# BK-MF1-12 - Aprovação de compras com estados “Rascunho → Aprovado → Lançado”.

## Header
- `doc_id`: `GUIA-BK-MF1-12`
- `bk_id`: `BK-MF1-12`
- `macro`: `MF1`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RF24`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-01`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-12-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Aprovação de compras com estados “Rascunho → Aprovado → Lançado”.` com rastreabilidade direta ao requisito `RF24`.
- Foco tecnico da macro: fluxo comercial (vendas/compras) com impacto contabilistico imediato.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Aprovação de compras com estados “Rascunho → Aprovado → Lançado”.` com autonomia técnica, garantindo cobertura do requisito `RF24` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF1`: Fechar o ciclo comercial minimo com impacto contabilistico validado..

### Pre-requisitos
- Ler o requisito `RF24` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF1`.
- [ ] Sei mostrar onde esta o requisito `RF24` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF1-12`
- Requisito: `RF24`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF1-12` e o requisito `RF24`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Aprovação de compras com estados “Rascunho → Aprovado → Lançado”.`.
3. Implementar fluxo comercial fim-a-fim com cálculo fiscal e registo contabilístico associado.
4. Validar transição de estados/documentos e coerência entre documento comercial e lançamento.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF2-01`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validacao fiscal minima antes de lancar documento**

```ts
type LinhaDocumento = { conta: string; base: number; taxaIVA: number };

export function validarDocumentoFiscal(linhas: LinhaDocumento[], bkId = 'BK-MF1-12') {
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
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
