# BK-MF3-11 - KPIs executivos (receita, custos, EBITDA, PMR, PMP).

## Header
- `doc_id`: `GUIA-BK-MF3-11`
- `bk_id`: `BK-MF3-11`
- `macro`: `MF3`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-10`
- `rf_rnf`: `RF47`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-12`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-11-kpis-executivos-receita-custos-ebitda-pmr-pmp.md`
- `last_updated`: `2026-04-13`

## Contexto do BK
- Entrega alvo: implementar `KPIs executivos (receita, custos, EBITDA, PMR, PMP).` com rastreabilidade direta ao requisito `RF47`.
- Foco tecnico da macro: tesouraria, integracoes e relatorio funcional.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `KPIs executivos (receita, custos, EBITDA, PMR, PMP).` com rastreabilidade explicita para `RF47` e demonstracao tecnica no contexto da sprint `S07-S08`.

### Pre-requisitos
- Ler o requisito `RF47` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF3-10`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF3`.
- [ ] Sei mostrar onde esta o requisito `RF47` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF3-11`
- Requisito: `RF47`
- Dependencias: `BK-MF3-10`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do BK-MF3-11 e o requisito `RF47`.
2. Verificar pre-condicoes tecnicas (BK-MF3-10) e validar ambiente local antes de implementar.
3. Definir contrato de entrada/saida do fluxo principal para `KPIs executivos (receita, custos, EBITDA, PMR, PMP).`.
4. Implementar caminho principal com registo de logs/erros relevantes para auditoria.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF3-12`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Consulta agregada para KPI**

```sql
-- BK: BK-MF3-11
SELECT
  DATE_TRUNC('month', data_lancamento) AS mes,
  SUM(CASE WHEN tipo = 'RECEITA' THEN valor ELSE 0 END) AS receita,
  SUM(CASE WHEN tipo = 'CUSTO' THEN valor ELSE 0 END) AS custo,
  SUM(CASE WHEN tipo = 'RECEITA' THEN valor ELSE 0 END)
    - SUM(CASE WHEN tipo = 'CUSTO' THEN valor ELSE 0 END) AS margem
FROM fact_lancamentos
WHERE empresa_id = :empresa_id
GROUP BY 1
ORDER BY 1;
```

Base para painel mensal: calcula receita/custo/margem de forma reprodutivel para validacao funcional do BK.

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
