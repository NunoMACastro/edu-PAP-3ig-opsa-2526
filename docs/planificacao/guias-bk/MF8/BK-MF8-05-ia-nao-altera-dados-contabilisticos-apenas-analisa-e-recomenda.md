# BK-MF8-05 - IA não altera dados contabilísticos; apenas analisa e recomenda.

## Header
- `doc_id`: `GUIA-BK-MF8-05`
- `bk_id`: `BK-MF8-05`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF32`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-06`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-05-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `IA não altera dados contabilísticos; apenas analisa e recomenda.` com rastreabilidade direta ao requisito `RNF32`.
- Foco tecnico da macro: operacao final, i18n e fecho para defesa PAP.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `IA não altera dados contabilísticos; apenas analisa e recomenda.` com autonomia técnica, garantindo cobertura do requisito `RNF32` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: Preparar operacao final, observabilidade e fecho para defesa PAP..

### Pre-requisitos
- Ler o requisito `RNF32` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF8`.
- [ ] Sei mostrar onde esta o requisito `RNF32` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-05`
- Requisito: `RNF32`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-05` e o requisito `RNF32`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `IA não altera dados contabilísticos; apenas analisa e recomenda.`.
3. Implementar guardrail de mutacao: pedidos de IA com intencao de alterar dados devem ser bloqueados.
4. Garantir separacao explicita entre camada de recomendacao e comandos transacionais.
5. Registar auditoria quando uma tentativa de mutacao via IA for rejeitada.
6. Executar smoke com pedidos apenas de analise/recomendacao e validar resposta segura.
7. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).
8. Atualizar evidence (`pr`, `proof`, `neg`) com exemplos de bloqueio e pedidos validos.

### Cenarios negativos recomendados
- prompt de IA a pedir lancamento contabilistico automatico
- pedido de alteracao direta de saldo/valor por linguagem natural
- tentativa de bypass da validacao de mutacao

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF8-06`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Guardrail de nao-mutacao para comandos da IA**

Contexto de rastreabilidade: `BK-MF8-05` -> `RNF32`.

```ts
type PedidoIA = {
  bkId: 'BK-MF8-05';
  requisito: 'RNF32';
  intencao: 'analise' | 'recomendacao' | 'mutacao';
  texto: string;
};

export function validarPedidoIA(pedido: PedidoIA) {
  if (!pedido.texto.trim()) throw new Error('Pedido vazio');
  if (pedido.intencao === 'mutacao') {
    throw new Error('RNF32: IA apenas analisa e recomenda; mutacao nao permitida');
  }
  return { bkId: pedido.bkId, requisito: pedido.requisito, permitido: true };
}
```

Aplicar antes de qualquer execucao para garantir separacao estrita entre recomendacao e alteracao de dados.

## Criterios de aceite
- Bloqueio de mutacao via IA ativo e auditavel.
- Tres cenarios negativos executados com rejeicao controlada.
- Smoke de pedidos de analise/recomendacao sem erro bloqueante.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
