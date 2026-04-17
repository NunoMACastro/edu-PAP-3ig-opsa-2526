# BK-MF5-01 - Configurar níveis de aprovação essenciais com limites financeiros.

## Header
- `doc_id`: `GUIA-BK-MF5-01`
- `bk_id`: `BK-MF5-01`
- `macro`: `MF5`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF4-12`
- `rf_rnf`: `RF60`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-02`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-01-configurar-niveis-de-aprovacao-essenciais-com-limites-financeiros.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Configurar níveis de aprovação essenciais com limites financeiros.` com rastreabilidade direta ao requisito `RF60`.
- Foco tecnico da macro: experiencia de utilizacao e fluxos transversais de negocio.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Configurar níveis de aprovação essenciais com limites financeiros.` com autonomia técnica, garantindo cobertura do requisito `RF60` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF5`: Tornar a UX previsivel, clara e orientada a fluxos reais de trabalho..

### Pre-requisitos
- Ler o requisito `RF60` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF4-12`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF5`.
- [ ] Sei mostrar onde esta o requisito `RF60` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF5-01`
- Requisito: `RF60`
- Dependencias: `BK-MF4-12`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF5-01` e o requisito `RF60`.
2. Validar dependencias técnicas (`BK-MF4-12`) e preparar dados de teste mínimos para `Configurar níveis de aprovação essenciais com limites financeiros.`.
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
- Proximo BK recomendado: `BK-MF5-02`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validador de output auditavel**

```ts
type Resultado = { status: 'ok' | 'erro'; mensagem: string; fonte?: string };

export function validarResultado(res: Resultado) {
  if (res.status === 'ok' && !res.mensagem) throw new Error('Mensagem obrigatoria');
  if (res.status === 'ok' && !res.fonte) throw new Error('Fonte obrigatoria para rastreabilidade');
  return { bk: 'BK-MF5-01', validado: true };
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
