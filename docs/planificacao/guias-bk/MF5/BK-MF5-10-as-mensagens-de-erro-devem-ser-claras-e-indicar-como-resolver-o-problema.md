# BK-MF5-10 - As mensagens de erro devem ser claras e indicar como resolver o problema.

## Header
- `doc_id`: `GUIA-BK-MF5-10`
- `bk_id`: `BK-MF5-10`
- `macro`: `MF5`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF06`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-11`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-10-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md`
- `last_updated`: `2026-04-13`

## Contexto do BK
- Entrega alvo: implementar `As mensagens de erro devem ser claras e indicar como resolver o problema.` com rastreabilidade direta ao requisito `RNF06`.
- Foco tecnico da macro: experiencia de utilizacao e fluxos transversais de negocio.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `As mensagens de erro devem ser claras e indicar como resolver o problema.` com rastreabilidade explicita para `RNF06` e demonstracao tecnica no contexto da sprint `S09-S10`.

### Pre-requisitos
- Ler o requisito `RNF06` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF5`.
- [ ] Sei mostrar onde esta o requisito `RNF06` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF5-10`
- Requisito: `RNF06`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do BK-MF5-10 e o requisito `RNF06`.
2. Verificar pre-condicoes tecnicas (-) e validar ambiente local antes de implementar.
3. Definir contrato de entrada/saida do fluxo principal para `As mensagens de erro devem ser claras e indicar como resolver o problema.`.
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
- Proximo BK recomendado: `BK-MF5-11`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validador base de entrada de dominio**

```ts
type Payload = Record<string, unknown>;

export function validarEntradaBK(payload: Payload) {
  const camposObrigatorios = ['empresaId', 'utilizadorId'];
  const emFalta = camposObrigatorios.filter((c) => !payload[c]);
  if (emFalta.length) throw new Error(`BK BK-MF5-10: faltam campos ${emFalta.join(', ')}`);
  return { ok: true, bk: 'BK-MF5-10', payload };
}
```

Ponto de entrada seguro para reduzir erros de dados e facilitar diagnostico nos testes de smoke/negativos.

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
