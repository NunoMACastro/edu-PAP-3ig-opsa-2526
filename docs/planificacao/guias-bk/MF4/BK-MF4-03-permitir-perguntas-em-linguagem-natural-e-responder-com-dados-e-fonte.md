# BK-MF4-03 - Permitir perguntas em linguagem natural e responder com dados e fonte.

## Header
- `doc_id`: `GUIA-BK-MF4-03`
- `bk_id`: `BK-MF4-03`
- `macro`: `MF4`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-07`
- `rf_rnf`: `RF41`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-04`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-03-permitir-perguntas-em-linguagem-natural-e-responder-com-dados-e-fonte.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Permitir perguntas em linguagem natural e responder com dados e fonte.` com rastreabilidade direta ao requisito `RF41`.
- Foco tecnico da macro: inteligencia operacional, alertas e governanca de operacoes.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Permitir perguntas em linguagem natural e responder com dados e fonte.` com autonomia técnica, garantindo cobertura do requisito `RF41` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF4`: Operacionalizar IA assistiva com explicabilidade e controlo de risco..

### Pre-requisitos
- Ler o requisito `RF41` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF3-07`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF4`.
- [ ] Sei mostrar onde esta o requisito `RF41` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF4-03`
- Requisito: `RF41`
- Dependencias: `BK-MF3-07`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF4-03` e o requisito `RF41`.
2. Validar dependencias técnicas (`BK-MF3-07`) e preparar dados de teste mínimos para `Permitir perguntas em linguagem natural e responder com dados e fonte.`.
3. Implementar endpoint de pergunta com resposta estruturada (`pergunta`, `resposta`, `fontes`, `query_id`).
4. Garantir regra de bloqueio para pedidos mutaveis (a IA nao executa alteracoes contabilisticas).
5. Executar smoke com pergunta real de negocio e validar que a resposta inclui pelo menos uma fonte valida.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Cenarios negativos recomendados
- pergunta vazia ou abaixo do tamanho minimo
- resposta gerada sem fontes associadas

### Validacao
- [ ] Smoke: endpoint responde sem erro bloqueante e com `query_id` unico.
- [ ] Rastreabilidade: resposta valida inclui pelo menos `1` fonte e referencia temporal dos dados.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais (request/response + fontes retornadas).

### Handoff
- Proximo BK recomendado: `BK-MF4-04`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validador de resposta IA rastreavel**

Contexto de rastreabilidade: `BK-MF4-03` -> `RF41`.

```ts
type RespostaIA = {
  bk: 'BK-MF4-03';
  requisito: 'RF41';
  resposta: string;
  fontes: string[];
  mutacaoSolicitada: boolean;
};

export function validarRespostaIA(payload: RespostaIA) {
  if (!payload.resposta.trim()) throw new Error('Resposta vazia');
  if (payload.fontes.length === 0) throw new Error('Fonte obrigatoria para RF41');
  if (payload.mutacaoSolicitada) throw new Error('A IA nao pode executar alteracoes contabilisticas');
  return { bk: payload.bk, requisito: payload.requisito, validado: true };
}
```

Forca resposta com fonte obrigatoria e bloqueia pedidos de mutacao para cumprir `RF41`.

## Criterios de aceite
- Endpoint de perguntas ativo com resposta estruturada e `query_id`.
- Respostas validas com fonte explicita em `100%` dos testes de aceite.
- Dois cenarios negativos executados com comportamento controlado.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).
- Evidence pronta para revisao tecnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: request/response do endpoint com `resposta`, `fontes` e `query_id`.
- `proof`: evidencias de bloqueio de pedido mutavel.
- `neg`: dois cenarios negativos com codigo HTTP e mensagem esperada.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
