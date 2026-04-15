# BK-MF4-11 - Permitir reabertura de períodos apenas com registo de motivo.

## Header
- `doc_id`: `GUIA-BK-MF4-11`
- `bk_id`: `BK-MF4-11`
- `macro`: `MF4`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-08`
- `rf_rnf`: `RF59`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-12`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-11-permitir-reabertura-de-periodos-apenas-com-registo-de-motivo.md`
- `last_updated`: `2026-04-13`

## Contexto do BK
- Entrega alvo: implementar `Permitir reabertura de períodos apenas com registo de motivo.` com rastreabilidade direta ao requisito `RF59`.
- Foco tecnico da macro: inteligencia operacional, alertas e governanca de operacoes.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Permitir reabertura de períodos apenas com registo de motivo.` com rastreabilidade explicita para `RF59` e demonstracao tecnica no contexto da sprint `S08-S09`.

### Pre-requisitos
- Ler o requisito `RF59` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF0-08`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF4`.
- [ ] Sei mostrar onde esta o requisito `RF59` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF4-11`
- Requisito: `RF59`
- Dependencias: `BK-MF0-08`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do BK-MF4-11 e o requisito `RF59`.
2. Verificar pre-condicoes tecnicas (BK-MF0-08) e validar ambiente local antes de implementar.
3. Definir contrato de entrada/saida do fluxo principal para `Permitir reabertura de períodos apenas com registo de motivo.`.
4. Implementar caminho principal com registo de logs/erros relevantes para auditoria.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF4-12`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validador base de entrada de dominio**

```ts
type Payload = Record<string, unknown>;

export function validarEntradaBK(payload: Payload) {
  const camposObrigatorios = ['empresaId', 'utilizadorId'];
  const emFalta = camposObrigatorios.filter((c) => !payload[c]);
  if (emFalta.length) throw new Error(`BK BK-MF4-11: faltam campos ${emFalta.join(', ')}`);
  return { ok: true, bk: 'BK-MF4-11', payload };
}
```

Ponto de entrada seguro para reduzir erros de dados e facilitar diagnostico nos testes de smoke/negativos.

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
