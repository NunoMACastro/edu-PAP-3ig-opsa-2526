# BK-MF6-02 - Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação.

## Header
- `doc_id`: `GUIA-BK-MF6-02`
- `bk_id`: `BK-MF6-02`
- `macro`: `MF6`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF09`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-03`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-02-suportar-50-utilizadores-simultaneos-por-empresa-sem-degradacao.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação.` com rastreabilidade direta ao requisito `RNF09`.
- Foco tecnico da macro: desempenho, seguranca e robustez tecnica.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação.` com autonomia técnica, garantindo cobertura do requisito `RNF09` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF6`: Assegurar robustez tecnica de performance, seguranca e continuidade..

### Pre-requisitos
- Ler o requisito `RNF09` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF6`.
- [ ] Sei mostrar onde esta o requisito `RNF09` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF6-02`
- Requisito: `RNF09`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF6-02` e o requisito `RNF09`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação.`.
3. Aplicar hardening/performance no ponto crítico do BK com medição objetiva do limiar definido.
4. Executar teste negativo de segurança/performance e registar evidência comparativa antes/depois.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF6-03`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validador de output auditavel**

```ts
type Resultado = { status: 'ok' | 'erro'; mensagem: string; fonte?: string };

export function validarResultado(res: Resultado) {
  if (res.status === 'ok' && !res.mensagem) throw new Error('Mensagem obrigatoria');
  if (res.status === 'ok' && !res.fonte) throw new Error('Fonte obrigatoria para rastreabilidade');
  return { bk: 'BK-MF6-02', validado: true };
}
```

Impõe resposta auditável e rastreável em fluxos de IA/governança/operação final.

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
