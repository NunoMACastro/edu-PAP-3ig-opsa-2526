# BK-MF4-01 - Gerar insights automáticos (tendências, riscos, clientes, artigos parados).

## Header
- `doc_id`: `GUIA-BK-MF4-01`
- `bk_id`: `BK-MF4-01`
- `macro`: `MF4`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF3-10`
- `rf_rnf`: `RF49`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-02`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-01-gerar-insights-automaticos-tendencias-riscos-clientes-artigos-parados.md`
- `last_updated`: `2026-04-13`

## Contexto do BK
- Entrega alvo: implementar `Gerar insights automáticos (tendências, riscos, clientes, artigos parados).` com rastreabilidade direta ao requisito `RF49`.
- Foco tecnico da macro: inteligencia operacional, alertas e governanca de operacoes.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Gerar insights automáticos (tendências, riscos, clientes, artigos parados).` com rastreabilidade explicita para `RF49` e demonstracao tecnica no contexto da sprint `S08-S09`.

### Pre-requisitos
- Ler o requisito `RF49` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF3-10`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF4`.
- [ ] Sei mostrar onde esta o requisito `RF49` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF4-01`
- Requisito: `RF49`
- Dependencias: `BK-MF3-10`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do BK-MF4-01 e o requisito `RF49`.
2. Verificar pre-condicoes tecnicas (BK-MF3-10) e validar ambiente local antes de implementar.
3. Definir contrato de entrada/saida do fluxo principal para `Gerar insights automáticos (tendências, riscos, clientes, artigos parados).`.
4. Implementar caminho principal com registo de logs/erros relevantes para auditoria.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).
7. Aplicar reforco tecnico (robustez/performance/seguranca) associado ao risco principal do BK.
8. Atualizar evidence (`pr`, `proof`, `neg`) com artefactos concretos e verificaveis.

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF4-02`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Regra de alerta com limiar explicito**

```ts
type Regra = { nome: string; limite: number };

export function avaliarAlerta(valorAtual: number, regra: Regra) {
  const ativo = valorAtual >= regra.limite;
  return {
    bkId: 'BK-MF4-01',
    regra: regra.nome,
    ativo,
    mensagem: ativo ? `Alerta ativo: ${regra.nome}` : 'Sem alerta',
  };
}
```

Usar para gerar alertas auditaveis com criterio transparente (limiar), evitando decisoes opacas na camada de IA/operacao.

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
