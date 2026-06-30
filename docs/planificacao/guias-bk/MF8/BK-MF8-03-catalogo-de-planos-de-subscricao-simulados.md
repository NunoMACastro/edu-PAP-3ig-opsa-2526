# BK-MF8-03 - Catálogo de planos de subscrição simulados.

## Header
- `doc_id`: `GUIA-BK-MF8-03`
- `bk_id`: `BK-MF8-03`
- `macro`: `MF8`
- `sprint`: `S12`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF49`
- `fase_documental`: `Fase 3`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-04`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
- `last_updated`: `2026-06-30`

## Bloco pedagogico

### Objetivo
Definir o catálogo canónico de três planos simulados: mensal, trimestral e anual, com preço, ciclo e descrição claros para uso posterior na subscrição da empresa ativa.

### Pre-requisitos
- Confirmar que não existe domínio real de billing/subscriptions no `real_dev`.
- Ler RF49 em `docs/RF.md` e a matriz canónica MF8.
- Definir valores simulados estáveis e em EUR, sem gateway externo.

### Erros comuns
- Criar mais de três planos ou nomes paralelos ao catálogo canónico.
- Misturar planos simulados com pagamentos de documentos existentes.
- Prometer Stripe, MB WAY, faturas reais ou webhooks.

### Check de compreensao
- Sei explicar porque este BK usa uma simulação e não pagamentos reais.
- Sei identificar a empresa ativa como fronteira de dados da subscrição.
- Sei mostrar onde o requisito `RF49` aparece na matriz e no backlog.

### Tempo estimado
- Implementação e evidência: `M`.
- Negativos: minimo `3`.

## Bloco operacional

### Entrada
- BK: `BK-MF8-03`
- Requisito: `RF49`
- Dependencias: `-`
- Artefactos de referencia: `real_dev/api`, `real_dev/web`, `docs/planificacao/backlogs/`.

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` que `BK-MF8-03` cobre `RF49`.
2. Definir constantes dos planos `mensal`, `trimestral` e `anual` com preço simulado, duração em meses e ordem de apresentação.
3. Expor leitura dos planos em endpoint ou helper dedicado, separado de `payments`.
4. Garantir que os valores são devolvidos com moeda `EUR` e sem promessa de cobrança real.
5. Adicionar texto curto de simulação PAP na resposta/API ou contrato da UI.
6. Validar que não existem planos extra, nulos ou duplicados.
7. Criar smoke test para obter os três planos na ordem canónica.
8. Documentar evidência com payload esperado e decisão de não integrar gateway real.

### Validacao
- Smoke: consulta devolve exatamente três planos.
- Negativo: pedido de plano inexistente devolve erro controlado.
- Negativo: nenhum endpoint cria cobrança real ou sessão checkout.
- Negativo: catálogo rejeita plano duplicado em seed/configuração.

### Handoff
- Proximo BK recomendado: `BK-MF8-04`
- Evidence minima: smoke positivo, negativos documentados e prova visual/API quando aplicável.
- Risco residual: manter explicito que a funcionalidade é uma simulação PAP sem pagamentos reais.

## Snippet tecnico aplicavel

### Catálogo imutável de planos simulados
```ts
export const SUBSCRIPTION_PLANS = [
  { code: 'monthly', label: 'Mensal', intervalMonths: 1, priceCents: 1900 },
  { code: 'quarterly', label: 'Trimestral', intervalMonths: 3, priceCents: 4900 },
  { code: 'yearly', label: 'Anual', intervalMonths: 12, priceCents: 14900 },
] as const;

export function listSimulatedPlans() {
  return SUBSCRIPTION_PLANS.map((plan) => ({
    ...plan,
    currency: 'EUR',
    simulated: true,
    bkId: 'BK-MF8-03',
  }));
}
```

Usar como contrato inicial para impedir deriva de planos e manter a simulação isolada do domínio de pagamentos reais.

## Criterios de aceite
- O requisito `RF49` fica rastreavel no backlog, matriz, anexo e guia.
- O fluxo respeita a empresa ativa e não usa o domínio de `payments` de documentos.
- A UI/API comunica claramente que não existe cobrança real.
