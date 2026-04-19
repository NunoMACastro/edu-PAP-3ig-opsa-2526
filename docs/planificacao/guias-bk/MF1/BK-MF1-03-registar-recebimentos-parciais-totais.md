# BK-MF1-03 - Registar recebimentos (parciais/totais).

## Header
- `doc_id`: `GUIA-BK-MF1-03`
- `bk_id`: `BK-MF1-03`
- `macro`: `MF1`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF15`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-04`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-03-registar-recebimentos-parciais-totais.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Registar recebimentos (parciais/totais).` com rastreabilidade direta ao requisito `RF15`.
- Foco tecnico da macro: fluxo comercial (vendas/compras) com impacto contabilistico imediato.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Registar recebimentos (parciais/totais).` com autonomia técnica, garantindo cobertura do requisito `RF15` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF1`: Fechar o ciclo comercial minimo com impacto contabilistico validado..

### Pre-requisitos
- Ler o requisito `RF15` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF1`.
- [ ] Sei mostrar onde esta o requisito `RF15` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF1-03`
- Requisito: `RF15`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF1-03` e o requisito `RF15`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Registar recebimentos (parciais/totais).`.
3. Implementar fluxo comercial fim-a-fim com cálculo fiscal e registo contabilístico associado.
4. Validar transição de estados/documentos e coerência entre documento comercial e lançamento.
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
- Proximo BK recomendado: `BK-MF1-04`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Contrato de comando com validacao de permissao**

```ts
type Contexto = { userId: string; roles: string[]; empresaId: string };

export function validarComando(ctx: Contexto, role: string) {
  if (!ctx.userId || !ctx.empresaId) throw new Error('Contexto incompleto');
  if (!ctx.roles.includes(role)) throw new Error(`Permissao insuficiente para RF15`);
  return { bkId: 'BK-MF1-03', ok: true };
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
