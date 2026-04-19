# BK-MF8-03 - Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).

## Header
- `doc_id`: `GUIA-BK-MF8-03`
- `bk_id`: `BK-MF8-03`
- `macro`: `MF8`
- `owner`: `Sofia`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-04`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-03-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).` com rastreabilidade direta ao requisito `RNF30`.
- Foco tecnico da macro: operacao final, i18n e fecho para defesa PAP.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).` com autonomia técnica, garantindo cobertura do requisito `RNF30` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: Preparar operacao final, observabilidade e fecho para defesa PAP..

### Pre-requisitos
- Ler o requisito `RNF30` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF8`.
- [ ] Sei mostrar onde esta o requisito `RNF30` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-03`
- Requisito: `RNF30`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-03` e o requisito `RNF30`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).`.
3. Estruturar documento tecnico minimo com secoes obrigatorias: arquitetura, modelos de dados e fluxo contabilistico.
4. Garantir exemplos concretos (diagrama/fluxo textual) alinhados com RF criticos do MVP.
5. Executar smoke de revisao cruzada: validar se a documentacao permite reproduzir um fluxo contabilistico sem ambiguidade.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Cenarios negativos recomendados
- documento sem secao de arquitetura
- fluxo contabilistico descrito sem mapeamento para contas/eventos

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF8-04`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validador de completude da documentacao tecnica**

Contexto de rastreabilidade: `BK-MF8-03` -> `RNF30`.

```ts
const REQUIRED_SECTIONS = ['## Arquitetura', '## Modelos de Dados', '## Fluxo Contabilistico'];

export function validarDocumentacaoTecnica(markdown: string) {
  for (const section of REQUIRED_SECTIONS) {
    if (!markdown.includes(section)) {
      throw new Error(`Secao obrigatoria em falta para RNF30: ${section}`);
    }
  }
  return { bkId: 'BK-MF8-03', requisito: 'RNF30', validado: true };
}
```

Aplicar no pipeline documental antes do fecho para garantir cobertura minima de `RNF30`.

## Criterios de aceite
- Documento tecnico publicado com as 3 secoes obrigatorias de `RNF30`.
- Revisao cruzada confirma que o fluxo contabilistico e reproduzivel.
- Dois cenarios negativos executados com correcao documentada.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
