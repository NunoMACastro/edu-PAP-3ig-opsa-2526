# BK-MF8-04 - Subscrição por empresa ativa.

## Header
- `doc_id`: `GUIA-BK-MF8-04`
- `bk_id`: `BK-MF8-04`
- `macro`: `MF8`
- `sprint`: `S12`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-03`
- `rf_rnf`: `RF50`
- `fase_documental`: `Fase 3`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-05`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md`
- `last_updated`: `2026-06-30`

## Bloco pedagogico

### Objetivo
Criar a estrutura de subscrição simulada associada à empresa ativa, garantindo que cada empresa tem no máximo uma subscrição corrente no contexto PAP.

### Pre-requisitos
- Concluir `BK-MF8-03` com catálogo de planos estável.
- Rever como o `real_dev` identifica empresa ativa no contexto autenticado.
- Confirmar que o módulo `payments` atual não é usado para subscrições SaaS.

### Erros comuns
- Guardar a subscrição sem `companyId`/empresa ativa.
- Permitir uma subscrição global partilhada por várias empresas.
- Adicionar campos de cobrança real ou dados sensíveis de cartão.

### Check de compreensao
- Sei explicar porque este BK usa uma simulação e não pagamentos reais.
- Sei identificar a empresa ativa como fronteira de dados da subscrição.
- Sei mostrar onde o requisito `RF50` aparece na matriz e no backlog.

### Tempo estimado
- Implementação e evidência: `M`.
- Negativos: minimo `3`.

## Bloco operacional

### Entrada
- BK: `BK-MF8-04`
- Requisito: `RF50`
- Dependencias: `BK-MF8-03`
- Artefactos de referencia: `real_dev/api`, `real_dev/web`, `docs/planificacao/backlogs/`.

### Passos
1. Confirmar no backlog que `BK-MF8-04` cobre `RF50`.
2. Criar modelo/tabela ou storage equivalente para `CompanySubscription` com `companyId`, `planCode`, `status`, datas e `simulated=true`.
3. Garantir unicidade lógica por empresa ativa.
4. Criar service dedicado de subscrições, separado de `payments`.
5. Ler a empresa ativa a partir do contexto autenticado, nunca do corpo livre quando isso abrir bypass.
6. Criar endpoint de leitura da subscrição atual da empresa ativa.
7. Validar estados suportados: `none`, `active`, `cancelled` e `expired` quando aplicável.
8. Registar decisão de arquitetura e handoff para ativação simulada.

### Validacao
- Smoke: empresa sem subscrição devolve estado vazio controlado.
- Smoke: empresa com subscrição devolve apenas a sua própria subscrição.
- Negativo: tentativa de consultar outra empresa falha por autorização.
- Negativo: plano inexistente não pode ser associado à empresa.

### Handoff
- Proximo BK recomendado: `BK-MF8-05`
- Evidence minima: smoke positivo, negativos documentados e prova visual/API quando aplicável.
- Risco residual: manter explicito que a funcionalidade é uma simulação PAP sem pagamentos reais.

## Snippet tecnico aplicavel

### Contrato de subscrição por empresa
```ts
type CompanySubscription = {
  companyId: string;
  planCode: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodEnd: string;
  simulated: true;
};

export function assertCompanySubscriptionScope(subscription: CompanySubscription, activeCompanyId: string) {
  if (subscription.companyId !== activeCompanyId) {
    throw new Error('BK-MF8-04: subscricao fora da empresa ativa');
  }
  return subscription;
}
```

Este contrato fixa a fronteira multi-empresa antes de existirem ações de ativação, renovação ou cancelamento.

## Criterios de aceite
- O requisito `RF50` fica rastreavel no backlog, matriz, anexo e guia.
- O fluxo respeita a empresa ativa e não usa o domínio de `payments` de documentos.
- A UI/API comunica claramente que não existe cobrança real.
