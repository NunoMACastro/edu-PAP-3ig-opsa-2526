# BK-MF8-05 - Ativação simulada de subscrição.

## Header
- `doc_id`: `GUIA-BK-MF8-05`
- `bk_id`: `BK-MF8-05`
- `macro`: `MF8`
- `sprint`: `S12`
- `owner`: `Andre`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-04`
- `rf_rnf`: `RF50`
- `fase_documental`: `Fase 3`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-06`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md`
- `last_updated`: `2026-06-30`

## Bloco pedagogico

### Objetivo
Permitir ativar uma subscrição simulada para a empresa ativa, escolhendo um dos três planos canónicos e calculando datas simuladas de ciclo.

### Pre-requisitos
- Concluir `BK-MF8-04` com a subscrição por empresa ativa.
- Ter catálogo `RF49` disponível.
- Definir formato de datas e moeda alinhado com o padrão europeu da aplicação.

### Erros comuns
- Ativar subscrição sem validar plano canónico.
- Criar pagamento real, invoice real ou checkout externo.
- Permitir duas subscrições ativas simultâneas para a mesma empresa.

### Check de compreensao
- Sei explicar porque este BK usa uma simulação e não pagamentos reais.
- Sei identificar a empresa ativa como fronteira de dados da subscrição.
- Sei mostrar onde o requisito `RF50` aparece na matriz e no backlog.

### Tempo estimado
- Implementação e evidência: `M`.
- Negativos: minimo `3`.

## Bloco operacional

### Entrada
- BK: `BK-MF8-05`
- Requisito: `RF50`
- Dependencias: `BK-MF8-04`
- Artefactos de referencia: `real_dev/api`, `real_dev/web`, `docs/planificacao/backlogs/`.

### Passos
1. Confirmar que `BK-MF8-05` continua o requisito `RF50`.
2. Criar comando/service `activateSubscription` com `planCode` validado contra o catálogo.
3. Calcular `currentPeriodStart` e `currentPeriodEnd` com base no ciclo do plano.
4. Definir estado inicial `active` e marcador `simulated=true`.
5. Bloquear segunda ativação quando já existe subscrição ativa na empresa.
6. Persistir evento/auditoria mínima de ativação simulada.
7. Devolver payload sem dados de pagamento real.
8. Adicionar smoke e negativos para ativação, plano inválido e duplicação.

### Validacao
- Smoke: ativar plano mensal cria subscrição ativa da empresa.
- Smoke: ativar plano anual calcula ciclo de 12 meses.
- Negativo: plano inexistente é rejeitado.
- Negativo: empresa com subscrição ativa não recebe duplicado.

### Handoff
- Proximo BK recomendado: `BK-MF8-06`
- Evidence minima: smoke positivo, negativos documentados e prova visual/API quando aplicável.
- Risco residual: manter explicito que a funcionalidade é uma simulação PAP sem pagamentos reais.

## Snippet tecnico aplicavel

### Ativação simulada com cálculo de ciclo
```ts
type Plan = { code: string; intervalMonths: number };

type ActivationInput = { companyId: string; plan: Plan; now: Date };

export function buildSimulatedActivation(input: ActivationInput) {
  const end = new Date(input.now);
  end.setMonth(end.getMonth() + input.plan.intervalMonths);

  return {
    companyId: input.companyId,
    planCode: input.plan.code,
    status: 'active' as const,
    currentPeriodStart: input.now.toISOString(),
    currentPeriodEnd: end.toISOString(),
    simulated: true as const,
    bkId: 'BK-MF8-05',
  };
}
```

A ativação é determinística e auditável, sem criar qualquer intenção de cobrança real.

## Criterios de aceite
- O requisito `RF50` fica rastreavel no backlog, matriz, anexo e guia.
- O fluxo respeita a empresa ativa e não usa o domínio de `payments` de documentos.
- A UI/API comunica claramente que não existe cobrança real.
