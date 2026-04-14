# BK-MF2-06 - Alertas de stock (mínimos, máximos, artigos parados).

## Header
- `doc_id`: `GUIA-BK-MF2-06`
- `bk_id`: `BK-MF2-06`
- `macro`: `MF2`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-03`
- `rf_rnf`: `RF30`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-07`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-06-alertas-de-stock-minimos-maximos-artigos-parados.md`
- `last_updated`: `2026-04-13`

## Contexto do BK
- Entrega alvo: implementar `Alertas de stock (mínimos, máximos, artigos parados).` com rastreabilidade direta ao requisito `RF30`.
- Foco tecnico da macro: stock, analitica e contabilidade operacional.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Conseguir explicar e executar o BK `BK-MF2-06` de forma autonoma, incluindo caminho feliz, negativos e evidencia pronta para defesa.

### Pre-requisitos
- Ler o requisito `RF30` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF2-03`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF2`.
- [ ] Sei mostrar onde esta o requisito `RF30` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF2-06`
- Requisito: `RF30`
- Dependencias: `BK-MF2-03`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do BK-MF2-06 e o requisito `RF30`.
2. Verificar pre-condicoes tecnicas (BK-MF2-03) e validar ambiente local antes de implementar.
3. Definir contrato de entrada/saida do fluxo principal para `Alertas de stock (mínimos, máximos, artigos parados).`.
4. Implementar caminho principal com registo de logs/erros relevantes para auditoria.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF2-07`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Movimento de stock com bloqueio de saldo negativo**

```sql
-- BK: BK-MF2-06
BEGIN;

UPDATE stock_saldo
SET quantidade = quantidade + :delta,
    updated_at = NOW()
WHERE empresa_id = :empresa_id
  AND artigo_id = :artigo_id;

-- Negativo controlado
DO $$
DECLARE q numeric;
BEGIN
  SELECT quantidade INTO q
  FROM stock_saldo
  WHERE empresa_id = :empresa_id AND artigo_id = :artigo_id;
  IF q < 0 THEN
    RAISE EXCEPTION 'Saldo negativo nao permitido no BK BK-MF2-06';
  END IF;
END $$;

COMMIT;
```

Executar em transacao para preservar integridade do inventario e impedir estados invalidos apos movimento.

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
