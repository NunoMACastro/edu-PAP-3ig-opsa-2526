# BK-MF5-07 - Dashboard e listagens devem carregar em ≤ 2 segundos.

## Header
- `doc_id`: `GUIA-BK-MF5-07`
- `bk_id`: `BK-MF5-07`
- `macro`: `MF5`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF07`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-01`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-07-dashboard-e-listagens-devem-carregar-em-2-segundos.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Dashboard e listagens devem carregar em ≤ 2 segundos.` com rastreabilidade direta ao requisito `RNF07`.
- Foco tecnico da macro: experiencia de utilizacao e fluxos transversais de negocio.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Dashboard e listagens devem carregar em ≤ 2 segundos.` com autonomia técnica, garantindo cobertura do requisito `RNF07` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF5`: Tornar a UX previsivel, clara e orientada a fluxos reais de trabalho..

### Pre-requisitos
- Ler o requisito `RNF07` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF5`.
- [ ] Sei mostrar onde esta o requisito `RNF07` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF5-07`
- Requisito: `RNF07`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF5-07` e o requisito `RNF07`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Dashboard e listagens devem carregar em ≤ 2 segundos.`.
3. Implementar comportamento UX transversal (validação, feedback, consistência visual e erro claro).
4. Executar testes de usabilidade rápida em cenário real de operação (desktop e tablet).
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).
7. Aplicar reforço técnico (robustez/performance/segurança) no risco principal identificado para este BK.
8. Atualizar evidence (`pr`, `proof`, `neg`) com artefactos concretos e verificaveis.

### Cenarios negativos recomendados
- entrada obrigatoria em falta
- estado de negocio invalido
- tentativa sem permissoes/contexto valido

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF6-01`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Consulta agregada para KPI**

Contexto de rastreabilidade: `BK-MF5-07` -> `RNF07`.

```sql
-- BK: BK-MF5-07
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
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
