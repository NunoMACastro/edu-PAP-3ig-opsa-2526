# BK-MF8-08 - Testes e evidência de subscrições simuladas.

## Header
- `doc_id`: `GUIA-BK-MF8-08`
- `bk_id`: `BK-MF8-08`
- `macro`: `MF8`
- `sprint`: `S12`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-03, BK-MF8-04, BK-MF8-05, BK-MF8-06, BK-MF8-07`
- `rf_rnf`: `RF49, RF50, RF51`
- `fase_documental`: `Fase 3`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-09`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidencia-de-subscricoes-simuladas.md`
- `last_updated`: `2026-06-30`

## Bloco pedagogico

### Objetivo
Criar a evidência final dos fluxos de subscrições simuladas, cobrindo planos, empresa ativa, ativação, renovação, cancelamento, reativação e UI.

### Pre-requisitos
- Concluir `BK-MF8-03..BK-MF8-07`.
- Ter comandos de teste backend/frontend disponíveis.
- Definir onde guardar evidência textual ou visual da MF8.

### Erros comuns
- Validar apenas o caso feliz de ativação.
- Não provar que pagamentos reais estão fora de escopo.
- Deixar screenshots/API payloads sem ligação aos RF49..RF51.

### Check de compreensao
- Sei explicar porque este BK usa uma simulação e não pagamentos reais.
- Sei identificar a empresa ativa como fronteira de dados da subscrição.
- Sei mostrar onde o requisito `RF49, RF50, RF51` aparece na matriz e no backlog.

### Tempo estimado
- Implementação e evidência: `S`.
- Negativos: minimo `2`.

## Bloco operacional

### Entrada
- BK: `BK-MF8-08`
- Requisito: `RF49, RF50, RF51`
- Dependencias: `BK-MF8-03, BK-MF8-04, BK-MF8-05, BK-MF8-06, BK-MF8-07`
- Artefactos de referencia: `real_dev/api`, `real_dev/web`, `docs/planificacao/backlogs/`.

### Passos
1. Confirmar no backlog que `BK-MF8-08` cobre `RF49`, `RF50` e `RF51`.
2. Criar lista de testes backend para catálogo, empresa ativa e transições de estado.
3. Criar lista de testes frontend para página de planos e ações visíveis.
4. Executar smoke de consulta dos três planos.
5. Executar smoke de ativação e consulta da subscrição da empresa ativa.
6. Executar smoke de renovação, cancelamento e reativação.
7. Registar negativos: plano inválido, ação inválida, empresa errada e tentativa de pagamento real.
8. Publicar evidência resumida para handoff dos BKs RNF30..RNF39 renumerados.

### Validacao
- Smoke: todos os fluxos principais têm prova objetiva.
- Negativo: plano inválido e ação inválida ficam documentados.
- Negativo: não existe chamada real a gateway de pagamento.
- Handoff: evidência referencia explicitamente RF49, RF50 e RF51.

### Handoff
- Proximo BK recomendado: `BK-MF8-09`
- Evidence minima: smoke positivo, negativos documentados e prova visual/API quando aplicável.
- Risco residual: manter explicito que a funcionalidade é uma simulação PAP sem pagamentos reais.

## Snippet tecnico aplicavel

### Matriz mínima de testes de subscrição
```ts
export const SUBSCRIPTION_TEST_MATRIX = [
  { rf: 'RF49', case: 'listar tres planos simulados', type: 'smoke' },
  { rf: 'RF50', case: 'ativar subscricao da empresa ativa', type: 'smoke' },
  { rf: 'RF51', case: 'cancelar e reativar subscricao', type: 'smoke' },
  { rf: 'RF51', case: 'bloquear transicao invalida', type: 'negative' },
] as const;

export function summarizeSubscriptionCoverage() {
  return SUBSCRIPTION_TEST_MATRIX.map((item) => `${item.rf}:${item.type}:${item.case}`);
}
```

A matriz ajuda a provar que a funcionalidade nova ficou coberta antes de voltar aos BKs de documentação, IA e testes finais.

## Criterios de aceite
- O requisito `RF49, RF50, RF51` fica rastreavel no backlog, matriz, anexo e guia.
- O fluxo respeita a empresa ativa e não usa o domínio de `payments` de documentos.
- A UI/API comunica claramente que não existe cobrança real.
