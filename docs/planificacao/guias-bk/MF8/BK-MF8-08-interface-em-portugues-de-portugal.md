# BK-MF8-08 - Interface em português de Portugal.

## Header
- `doc_id`: `GUIA-BK-MF8-08`
- `bk_id`: `BK-MF8-08`
- `macro`: `MF8`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF35`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-09`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-08-interface-em-portugues-de-portugal.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Interface em português de Portugal.` com rastreabilidade direta ao requisito `RNF35`.
- Foco tecnico da macro: operacao final, i18n e fecho para defesa PAP.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Interface em português de Portugal.` com autonomia técnica, garantindo cobertura do requisito `RNF35` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: Preparar operacao final, observabilidade e fecho para defesa PAP..

### Pre-requisitos
- Ler o requisito `RNF35` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF8`.
- [ ] Sei mostrar onde esta o requisito `RNF35` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-08`
- Requisito: `RNF35`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-08` e o requisito `RNF35`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Interface em português de Portugal.`.
3. Configurar locale default da aplicacao para `pt-PT` em frontend e mensagens do backend.
4. Padronizar labels, mensagens de erro e textos de ajuda para portugues de Portugal.
5. Garantir fallback controlado para chaves sem traducao sem quebrar o fluxo.
6. Executar smoke navegando pelos modulos principais e validar texto em `pt-PT`.
7. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).
8. Atualizar evidence (`pr`, `proof`, `neg`) com capturas e logs de locale aplicado.

### Cenarios negativos recomendados
- chave de traducao em falta deve cair em fallback controlado
- mensagem em variante nao-PT deve ser bloqueada em review
- locale indefinido na sessao deve assumir `pt-PT`

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF8-09`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Resolucao de locale com fallback para pt-PT**

Contexto de rastreabilidade: `BK-MF8-08` -> `RNF35`.

```ts
const SUPPORTED_LOCALES = ['pt-PT'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export function resolverLocale(preferido?: string): { bkId: 'BK-MF8-08'; requisito: 'RNF35'; locale: Locale } {
  const locale = preferido && SUPPORTED_LOCALES.includes(preferido as Locale) ? (preferido as Locale) : 'pt-PT';
  return { bkId: 'BK-MF8-08', requisito: 'RNF35', locale };
}
```

Aplicar na inicializacao da sessao e na camada de i18n para garantir interface em `pt-PT`.

## Criterios de aceite
- Interface principal e mensagens criticas apresentadas em `pt-PT`.
- Tres cenarios negativos executados com fallback controlado.
- Smoke funcional sem texto residual noutra variante.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
