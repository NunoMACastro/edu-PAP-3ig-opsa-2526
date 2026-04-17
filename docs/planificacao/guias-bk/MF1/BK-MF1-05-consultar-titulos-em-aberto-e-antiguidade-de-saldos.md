# BK-MF1-05 - Consultar títulos em aberto e antiguidade de saldos.

## Header
- `doc_id`: `GUIA-BK-MF1-05`
- `bk_id`: `BK-MF1-05`
- `macro`: `MF1`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RF17`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-06`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-05-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Consultar títulos em aberto e antiguidade de saldos.` com rastreabilidade direta ao requisito `RF17`.
- Foco tecnico da macro: fluxo comercial (vendas/compras) com impacto contabilistico imediato.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Consultar títulos em aberto e antiguidade de saldos.` com autonomia técnica, garantindo cobertura do requisito `RF17` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF1`: Fechar o ciclo comercial minimo com impacto contabilistico validado..

### Pre-requisitos
- Ler o requisito `RF17` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF1`.
- [ ] Sei mostrar onde esta o requisito `RF17` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF1-05`
- Requisito: `RF17`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF1-05` e o requisito `RF17`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Consultar títulos em aberto e antiguidade de saldos.`.
3. Implementar fluxo comercial fim-a-fim com cálculo fiscal e registo contabilístico associado.
4. Validar transição de estados/documentos e coerência entre documento comercial e lançamento.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF1-06`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Contrato de comando com validacao de permissao**

```ts
type Contexto = { userId: string; roles: string[]; empresaId: string };

export function validarComando(ctx: Contexto, role: string) {
  if (!ctx.userId || !ctx.empresaId) throw new Error('Contexto incompleto');
  if (!ctx.roles.includes(role)) throw new Error(`Permissao insuficiente para RF17`);
  return { bkId: 'BK-MF1-05', ok: true };
}
```

Garante pré-condições de identidade e autorização antes de executar regras de negócio.

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
