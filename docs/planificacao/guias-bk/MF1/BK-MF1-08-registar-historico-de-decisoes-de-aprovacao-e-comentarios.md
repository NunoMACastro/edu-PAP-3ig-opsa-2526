# BK-MF1-08 - Registar histórico de decisões de aprovação e comentários.

## Header
- `doc_id`: `GUIA-BK-MF1-08`
- `bk_id`: `BK-MF1-08`
- `macro`: `MF1`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-06`
- `rf_rnf`: `RF20`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-09`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-08-registar-historico-de-decisoes-de-aprovacao-e-comentarios.md`
- `last_updated`: `2026-04-13`

## Contexto do BK
- Entrega alvo: implementar `Registar histórico de decisões de aprovação e comentários.` com rastreabilidade direta ao requisito `RF20`.
- Foco tecnico da macro: fluxo comercial (vendas/compras) com impacto contabilistico imediato.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Registar histórico de decisões de aprovação e comentários.` com rastreabilidade explicita para `RF20` e demonstracao tecnica no contexto da sprint `S03-S04`.

### Pre-requisitos
- Ler o requisito `RF20` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF1-06`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF1`.
- [ ] Sei mostrar onde esta o requisito `RF20` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF1-08`
- Requisito: `RF20`
- Dependencias: `BK-MF1-06`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do BK-MF1-08 e o requisito `RF20`.
2. Verificar pre-condicoes tecnicas (BK-MF1-06) e validar ambiente local antes de implementar.
3. Definir contrato de entrada/saida do fluxo principal para `Registar histórico de decisões de aprovação e comentários.`.
4. Implementar caminho principal com registo de logs/erros relevantes para auditoria.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF1-09`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validador base de entrada de dominio**

```ts
type Payload = Record<string, unknown>;

export function validarEntradaBK(payload: Payload) {
  const camposObrigatorios = ['empresaId', 'utilizadorId'];
  const emFalta = camposObrigatorios.filter((c) => !payload[c]);
  if (emFalta.length) throw new Error(`BK BK-MF1-08: faltam campos ${emFalta.join(', ')}`);
  return { ok: true, bk: 'BK-MF1-08', payload };
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
