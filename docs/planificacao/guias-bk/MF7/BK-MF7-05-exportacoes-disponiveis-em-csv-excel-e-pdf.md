# BK-MF7-05 - Exportações disponíveis em CSV, Excel e PDF.

## Header
- `doc_id`: `GUIA-BK-MF7-05`
- `bk_id`: `BK-MF7-05`
- `macro`: `MF7`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF22`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-06`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-05-exportacoes-disponiveis-em-csv-excel-e-pdf.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Exportações disponíveis em CSV, Excel e PDF.` com rastreabilidade direta ao requisito `RNF22`.
- Foco tecnico da macro: compliance, interoperabilidade e modularidade.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Exportações disponíveis em CSV, Excel e PDF.` com autonomia técnica, garantindo cobertura do requisito `RNF22` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF7`: Fechar compliance legal, interoperabilidade e arquitetura modular..

### Pre-requisitos
- Ler o requisito `RNF22` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF7`.
- [ ] Sei mostrar onde esta o requisito `RNF22` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF7-05`
- Requisito: `RNF22`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF7-05` e o requisito `RNF22`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Exportações disponíveis em CSV, Excel e PDF.`.
3. Implementar requisito de compliance/interoperabilidade preservando formato e integridade de dados.
4. Validar compatibilidade legal/técnica com output verificável (ficheiro, log ou endpoint).
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF7-06`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validacao de cabecalho de importacao**

```ts
const CAMPOS_MINIMOS = ['codigo', 'descricao', 'valor'];

export function validarCabecalhoImportacao(headers: string[]) {
  const faltam = CAMPOS_MINIMOS.filter((c) => !headers.includes(c));
  if (faltam.length) {
    throw new Error(`BK BK-MF7-05: cabecalho invalido, faltam ${faltam.join(', ')}`);
  }
  return { ok: true, bk: 'BK-MF7-05' };
}
```

Aplicar no inicio do fluxo de importacao/exportacao para bloquear ficheiros invalidos antes de tocar nos dados de negocio.

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
