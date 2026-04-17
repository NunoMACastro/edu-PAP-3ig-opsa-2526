# BK-MF7-10 - Frontend modular com componentes reutilizáveis.

## Header
- `doc_id`: `GUIA-BK-MF7-10`
- `bk_id`: `BK-MF7-10`
- `macro`: `MF7`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF27`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-11`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-10-frontend-modular-com-componentes-reutilizaveis.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Frontend modular com componentes reutilizáveis.` com rastreabilidade direta ao requisito `RNF27`.
- Foco tecnico da macro: compliance, interoperabilidade e modularidade.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Frontend modular com componentes reutilizáveis.` com autonomia técnica, garantindo cobertura do requisito `RNF27` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF7`: Fechar compliance legal, interoperabilidade e arquitetura modular..

### Pre-requisitos
- Ler o requisito `RNF27` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF7`.
- [ ] Sei mostrar onde esta o requisito `RNF27` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF7-10`
- Requisito: `RNF27`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF7-10` e o requisito `RNF27`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Frontend modular com componentes reutilizáveis.`.
3. Implementar requisito de compliance/interoperabilidade preservando formato e integridade de dados.
4. Validar compatibilidade legal/técnica com output verificável (ficheiro, log ou endpoint).
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).
7. Aplicar reforço técnico (robustez/performance/segurança) no risco principal identificado para este BK.
8. Atualizar evidence (`pr`, `proof`, `neg`) com artefactos concretos e verificaveis.

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF7-11`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validador de output auditavel**

```ts
type Resultado = { status: 'ok' | 'erro'; mensagem: string; fonte?: string };

export function validarResultado(res: Resultado) {
  if (res.status === 'ok' && !res.mensagem) throw new Error('Mensagem obrigatoria');
  if (res.status === 'ok' && !res.fonte) throw new Error('Fonte obrigatoria para rastreabilidade');
  return { bk: 'BK-MF7-10', validado: true };
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
