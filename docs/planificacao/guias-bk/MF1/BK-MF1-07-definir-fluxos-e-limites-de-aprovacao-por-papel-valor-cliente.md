# BK-MF1-07 - Definir fluxos e limites de aprovação (por papel, valor, cliente).

## Header
- `doc_id`: `GUIA-BK-MF1-07`
- `bk_id`: `BK-MF1-07`
- `macro`: `MF1`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P2`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-06`
- `rf_rnf`: `RF19`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-08`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-07-definir-fluxos-e-limites-de-aprovacao-por-papel-valor-cliente.md`
- `last_updated`: `2026-04-13`

## Contexto do BK
- Entrega alvo: implementar `Definir fluxos e limites de aprovação (por papel, valor, cliente).` com rastreabilidade direta ao requisito `RF19`.
- Foco tecnico da macro: fluxo comercial (vendas/compras) com impacto contabilistico imediato.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Definir fluxos e limites de aprovação (por papel, valor, cliente).` com rastreabilidade explicita para `RF19` e demonstracao tecnica no contexto da sprint `S03-S04`.

### Pre-requisitos
- Ler o requisito `RF19` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF1-06`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF1`.
- [ ] Sei mostrar onde esta o requisito `RF19` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF1-07`
- Requisito: `RF19`
- Dependencias: `BK-MF1-06`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do BK-MF1-07 e o requisito `RF19`.
2. Verificar pre-condicoes tecnicas (BK-MF1-06) e validar ambiente local antes de implementar.
3. Definir contrato de entrada/saida do fluxo principal para `Definir fluxos e limites de aprovação (por papel, valor, cliente).`.
4. Implementar caminho principal com registo de logs/erros relevantes para auditoria.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF1-08`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Guard de permissao e sessao**

```ts
const BK_ID = 'BK-MF1-07';

export function validarSessao(user: { id: string; roles: string[] } | null, roleNecessario: string) {
  if (!user) throw new Error('Sessao invalida');
  if (!user.roles.includes(roleNecessario)) throw new Error('Acesso negado');
  return { ok: true, bk: BK_ID };
}

// Exemplo de uso no endpoint associado ao requisito RF19
const sessao = validarSessao(ctx.user, 'ADMIN');
```

Usar este guard no endpoint principal do BK para bloquear acessos sem sessao/permissao e manter comportamento previsivel.

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
