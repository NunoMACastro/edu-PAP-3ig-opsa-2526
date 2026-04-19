# BK-MF8-02 - Endpoint de health-check.

## Header
- `doc_id`: `GUIA-BK-MF8-02`
- `bk_id`: `BK-MF8-02`
- `macro`: `MF8`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF29`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-03`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Endpoint de health-check.` com rastreabilidade direta ao requisito `RNF29`.
- Foco tecnico da macro: operacao final, i18n e fecho para defesa PAP.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Endpoint de health-check.` com autonomia técnica, garantindo cobertura do requisito `RNF29` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: Preparar operacao final, observabilidade e fecho para defesa PAP..

### Pre-requisitos
- Ler o requisito `RNF29` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF8`.
- [ ] Sei mostrar onde esta o requisito `RNF29` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-02`
- Requisito: `RNF29`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-02` e o requisito `RNF29`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Endpoint de health-check.`.
3. Implementar endpoint `GET /health` com estado global (`ok/degraded/down`) e verificacao de dependencias criticas.
4. Garantir retorno de codigo HTTP coerente (`200` para `ok`, `503` para `degraded/down`).
5. Executar smoke com dependencias ativas para validar resposta estavel e tempo de resposta.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Cenarios negativos recomendados
- base de dados indisponivel deve devolver `503`
- dependencia critica com timeout deve marcar estado `degraded`

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF8-03`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Health-check com mapeamento de estado e HTTP**

Contexto de rastreabilidade: `BK-MF8-02` -> `RNF29`.

```ts
type HealthState = 'ok' | 'degraded' | 'down';

export function construirHealthResponse(dbOk: boolean, cacheOk: boolean) {
  const state: HealthState = dbOk && cacheOk ? 'ok' : dbOk || cacheOk ? 'degraded' : 'down';
  const httpStatus = state === 'ok' ? 200 : 503;
  return {
    bkId: 'BK-MF8-02',
    requisito: 'RNF29',
    state,
    httpStatus,
    checks: { db: dbOk, cache: cacheOk },
  };
}
```

Usar na rota de monitorizacao para garantir leitura automatica de saude operacional (`RNF29`).

## Criterios de aceite
- Endpoint `/health` disponivel com payload estruturado.
- Mapeamento `state -> HTTP` validado (`ok=200`, restantes=`503`).
- Dois cenarios negativos executados com resposta controlada.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
