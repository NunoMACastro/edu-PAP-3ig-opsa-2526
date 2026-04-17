# BK-MF5-02 - Painel simples para monitorizar aprovações pendentes por tipo de documento.

## Header
- `doc_id`: `GUIA-BK-MF5-02`
- `bk_id`: `BK-MF5-02`
- `macro`: `MF5`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF4-12`
- `rf_rnf`: `RF61`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-03`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-02-painel-simples-para-monitorizar-aprovacoes-pendentes-por-tipo-de-documento.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Painel simples para monitorizar aprovações pendentes por tipo de documento.` com rastreabilidade direta ao requisito `RF61`.
- Foco tecnico da macro: experiencia de utilizacao e fluxos transversais de negocio.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Painel simples para monitorizar aprovações pendentes por tipo de documento.` com autonomia técnica, garantindo cobertura do requisito `RF61` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF5`: Tornar a UX previsivel, clara e orientada a fluxos reais de trabalho..

### Pre-requisitos
- Ler o requisito `RF61` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF4-12`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF5`.
- [ ] Sei mostrar onde esta o requisito `RF61` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF5-02`
- Requisito: `RF61`
- Dependencias: `BK-MF4-12`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF5-02` e o requisito `RF61`.
2. Validar dependencias técnicas (`BK-MF4-12`) e preparar dados de teste mínimos para `Painel simples para monitorizar aprovações pendentes por tipo de documento.`.
3. Implementar comportamento UX transversal (validação, feedback, consistência visual e erro claro).
4. Executar testes de usabilidade rápida em cenário real de operação (desktop e tablet).
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF5-03`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validador de output auditavel**

```ts
type Resultado = { status: 'ok' | 'erro'; mensagem: string; fonte?: string };

export function validarResultado(res: Resultado) {
  if (res.status === 'ok' && !res.mensagem) throw new Error('Mensagem obrigatoria');
  if (res.status === 'ok' && !res.fonte) throw new Error('Fonte obrigatoria para rastreabilidade');
  return { bk: 'BK-MF5-02', validado: true };
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
