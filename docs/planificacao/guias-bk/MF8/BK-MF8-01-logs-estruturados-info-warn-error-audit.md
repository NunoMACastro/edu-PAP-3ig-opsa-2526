# BK-MF8-01 - Logs estruturados (info, warn, error, audit).

## Header
- `doc_id`: `GUIA-BK-MF8-01`
- `bk_id`: `BK-MF8-01`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF28`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-02`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Logs estruturados (info, warn, error, audit).` com rastreabilidade direta ao requisito `RNF28`.
- Foco tecnico da macro: operacao final, i18n e fecho para defesa PAP.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Logs estruturados (info, warn, error, audit).` com autonomia técnica, garantindo cobertura do requisito `RNF28` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: Preparar operacao final, observabilidade e fecho para defesa PAP..

### Pre-requisitos
- Ler o requisito `RNF28` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF8`.
- [ ] Sei mostrar onde esta o requisito `RNF28` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-01`
- Requisito: `RNF28`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-01` e o requisito `RNF28`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Logs estruturados (info, warn, error, audit).`.
3. Definir contrato de log estruturado com campos obrigatorios (`timestamp`, `level`, `bk_id`, `requisito`, `evento`, `contexto`).
4. Implementar emissao de logs para `info/warn/error/audit` nos fluxos criticos do MVP.
5. Garantir mascaramento de dados sensiveis e rejeicao de eventos sem metadados minimos.
6. Executar smoke validando escrita e consulta de logs por nivel e por `bk_id`.
7. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).
8. Atualizar evidence (`pr`, `proof`, `neg`) com amostras reais de logs.

### Cenarios negativos recomendados
- evento sem `bk_id` ou sem `requisito`
- tentativa de log com `level` invalido
- payload com dado sensivel sem mascaramento

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF8-02`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Emissor de log estruturado com validacao minima**

Contexto de rastreabilidade: `BK-MF8-01` -> `RNF28`.

```ts
type LogLevel = 'info' | 'warn' | 'error' | 'audit';
type EventoLog = {
  level: LogLevel;
  bkId: 'BK-MF8-01';
  requisito: 'RNF28';
  evento: string;
  contexto: Record<string, string | number | boolean>;
};

export function registarEventoLog(payload: EventoLog) {
  if (!payload.evento.trim()) throw new Error('Evento obrigatorio em RNF28');
  if (!payload.contexto || Object.keys(payload.contexto).length === 0) {
    throw new Error('Contexto obrigatorio para auditoria');
  }
  return {
    timestamp: new Date().toISOString(),
    level: payload.level,
    bkId: payload.bkId,
    requisito: payload.requisito,
    evento: payload.evento,
    contexto: payload.contexto,
  };
}
```

Aplicar em todos os pontos de entrada criticos para cumprir `RNF28` com rastreabilidade uniforme.

## Criterios de aceite
- Emissao de logs `info/warn/error/audit` ativa nos fluxos criticos.
- `100%` dos logs de fluxo critico incluem `bk_id` e `requisito`.
- Tres cenarios negativos executados com bloqueio controlado.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
