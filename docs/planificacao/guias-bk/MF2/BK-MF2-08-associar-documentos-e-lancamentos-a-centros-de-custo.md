# BK-MF2-08 - Associar documentos e lançamentos a centros de custo.

## Header
- `doc_id`: `GUIA-BK-MF2-08`
- `bk_id`: `BK-MF2-08`
- `macro`: `MF2`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-07`
- `rf_rnf`: `RF32`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-09`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-08-associar-documentos-e-lancamentos-a-centros-de-custo.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Associar documentos e lançamentos a centros de custo.` com rastreabilidade direta ao requisito `RF32`.
- Foco tecnico da macro: stock, analitica e contabilidade operacional.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Associar documentos e lançamentos a centros de custo.` com autonomia técnica, garantindo cobertura do requisito `RF32` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF2`: Garantir integridade de inventario e contabilidade operacional por evento..

### Pre-requisitos
- Ler o requisito `RF32` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF2-07`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF2`.
- [ ] Sei mostrar onde esta o requisito `RF32` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF2-08`
- Requisito: `RF32`
- Dependencias: `BK-MF2-07`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF2-08` e o requisito `RF32`.
2. Validar dependencias técnicas (`BK-MF2-07`) e preparar dados de teste mínimos para `Associar documentos e lançamentos a centros de custo.`.
3. Implementar regra operacional de stock/centro analítico/lançamento garantindo consistência transacional.
4. Validar impacto em saldos e trilho de auditoria após a operação principal.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF2-09`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validador transacional de consistencia financeira**

```sql
-- BK: BK-MF2-08
BEGIN;

SELECT 1
FROM empresas
WHERE id = :empresa_id
FOR UPDATE;

-- Validacoes de consistencia específicas do requisito RF32
-- devem ocorrer antes de qualquer COMMIT.

COMMIT;
```

Usar como envelope transacional para preservar consistência em operações de stock/tesouraria/contabilidade.

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
