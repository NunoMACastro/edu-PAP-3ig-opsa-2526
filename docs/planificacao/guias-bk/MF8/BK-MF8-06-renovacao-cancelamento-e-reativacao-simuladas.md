# BK-MF8-06 - Renovação, cancelamento e reativação simuladas.

## Header
- `doc_id`: `GUIA-BK-MF8-06`
- `bk_id`: `BK-MF8-06`
- `macro`: `MF8`
- `sprint`: `S12`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-05`
- `rf_rnf`: `RF51`
- `fase_documental`: `Fase 3`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-07`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-06-renovacao-cancelamento-e-reativacao-simuladas.md`
- `last_updated`: `2026-06-30`

## Bloco pedagogico

### Objetivo
Implementar ações simuladas de renovação, cancelamento e reativação, com transições de estado simples e previsíveis.

### Pre-requisitos
- Concluir ativação simulada em `BK-MF8-05`.
- Ter estados de subscrição documentados.
- Confirmar quem pode executar ações de gestão da subscrição.

### Erros comuns
- Renovar subscrição cancelada sem reativação explícita.
- Cancelar subscrição inexistente sem erro controlado.
- Alterar datas de ciclo sem guardar evidência/auditoria.

### Check de compreensao
- Sei explicar porque este BK usa uma simulação e não pagamentos reais.
- Sei identificar a empresa ativa como fronteira de dados da subscrição.
- Sei mostrar onde o requisito `RF51` aparece na matriz e no backlog.

### Tempo estimado
- Implementação e evidência: `M`.
- Negativos: minimo `3`.

## Bloco operacional

### Entrada
- BK: `BK-MF8-06`
- Requisito: `RF51`
- Dependencias: `BK-MF8-05`
- Artefactos de referencia: `real_dev/api`, `real_dev/web`, `docs/planificacao/backlogs/`.

### Passos
1. Confirmar no backlog que `BK-MF8-06` cobre `RF51`.
2. Definir transições permitidas para `active`, `cancelled` e `expired`.
3. Criar ação `cancel` que mantém histórico e coloca estado `cancelled`.
4. Criar ação `reactivate` que reabre subscrição cancelada com plano escolhido ou anterior.
5. Criar ação `renew` que avança `currentPeriodEnd` pelo ciclo do plano.
6. Bloquear ações sobre empresa diferente da empresa ativa.
7. Registar auditoria mínima por ação simulada.
8. Cobrir smoke e negativos para cada transição principal.

### Validacao
- Smoke: subscrição ativa pode ser cancelada.
- Smoke: subscrição cancelada pode ser reativada.
- Smoke: renovação avança a data fim do ciclo.
- Negativo: cancelar subscrição inexistente devolve erro controlado.

### Handoff
- Proximo BK recomendado: `BK-MF8-07`
- Evidence minima: smoke positivo, negativos documentados e prova visual/API quando aplicável.
- Risco residual: manter explicito que a funcionalidade é uma simulação PAP sem pagamentos reais.

## Snippet tecnico aplicavel

### Máquina de estados de subscrição simulada
```ts
type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
type Action = 'renew' | 'cancel' | 'reactivate';

const transitions: Record<SubscriptionStatus, Action[]> = {
  active: ['renew', 'cancel'],
  cancelled: ['reactivate'],
  expired: ['reactivate'],
};

export function assertSubscriptionAction(status: SubscriptionStatus, action: Action) {
  if (!transitions[status].includes(action)) {
    throw new Error(`BK-MF8-06: transicao invalida ${status} -> ${action}`);
  }
  return { status, action, simulated: true };
}
```

A máquina de estados torna explícito o que é permitido e evita comportamentos mágicos difíceis de defender na PAP.

## Criterios de aceite
- O requisito `RF51` fica rastreavel no backlog, matriz, anexo e guia.
- O fluxo respeita a empresa ativa e não usa o domínio de `payments` de documentos.
- A UI/API comunica claramente que não existe cobrança real.
