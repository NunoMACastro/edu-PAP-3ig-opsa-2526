# BK-MF8-07 - UI de planos e gestão da subscrição.

## Header
- `doc_id`: `GUIA-BK-MF8-07`
- `bk_id`: `BK-MF8-07`
- `macro`: `MF8`
- `sprint`: `S12`
- `owner`: `Andre`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-03, BK-MF8-04, BK-MF8-06`
- `rf_rnf`: `RF49, RF50, RF51`
- `fase_documental`: `Fase 3`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-08`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-07-ui-de-planos-e-gestao-da-subscricao.md`
- `last_updated`: `2026-06-30`

## Bloco pedagogico

### Objetivo
Adicionar a UI de consulta de planos e gestão da subscrição simulada, ligada à empresa ativa e com comunicação clara de que não há pagamentos reais.

### Pre-requisitos
- Concluir catálogo, subscrição por empresa e ações simuladas.
- Rever padrões visuais atuais e o mockup aprovado.
- Definir mensagens PT-PT para estados `active`, `cancelled` e sem subscrição.

### Erros comuns
- Mostrar botões de pagamento real ou prometer cobrança.
- Permitir ações sem feedback imediato.
- Ocultar a empresa ativa ou o estado atual da subscrição.

### Check de compreensao
- Sei explicar porque este BK usa uma simulação e não pagamentos reais.
- Sei identificar a empresa ativa como fronteira de dados da subscrição.
- Sei mostrar onde o requisito `RF49, RF50, RF51` aparece na matriz e no backlog.

### Tempo estimado
- Implementação e evidência: `M`.
- Negativos: minimo `3`.

## Bloco operacional

### Entrada
- BK: `BK-MF8-07`
- Requisito: `RF49, RF50, RF51`
- Dependencias: `BK-MF8-03, BK-MF8-04, BK-MF8-06`
- Artefactos de referencia: `real_dev/api`, `real_dev/web`, `docs/planificacao/backlogs/`.

### Passos
1. Confirmar que `BK-MF8-07` cobre `RF49`, `RF50` e `RF51`.
2. Criar rota/página ou painel de subscrição dentro da área autenticada.
3. Mostrar os três planos com preço simulado, ciclo e ação principal.
4. Mostrar a subscrição atual da empresa ativa com estado e datas do ciclo.
5. Adicionar ações de ativar, renovar, cancelar e reativar conforme o estado.
6. Adicionar aviso visível de simulação PAP sem cobrança real.
7. Garantir feedback de loading, sucesso e erro para cada ação.
8. Testar responsividade mínima e consistência PT-PT dos textos.

### Validacao
- Smoke: página lista exatamente três planos.
- Smoke: empresa com subscrição ativa vê estado e ações válidas.
- Negativo: ação inválida mostra erro claro.
- Negativo: nenhum texto sugere cobrança real ou checkout externo.

### Handoff
- Proximo BK recomendado: `BK-MF8-08`
- Evidence minima: smoke positivo, negativos documentados e prova visual/API quando aplicável.
- Risco residual: manter explicito que a funcionalidade é uma simulação PAP sem pagamentos reais.

## Snippet tecnico aplicavel

### Estado derivado para UI de subscrição
```ts
type UiSubscriptionState = {
  status: 'none' | 'active' | 'cancelled' | 'expired';
};

export function availableSubscriptionActions(state: UiSubscriptionState) {
  if (state.status === 'none') return ['activate'];
  if (state.status === 'active') return ['renew', 'cancel'];
  return ['reactivate'];
}

export const SIMULATION_NOTICE = 'Subscricao simulada para a PAP. Nao existe pagamento real.';
```

A UI deve derivar ações do estado, reduzindo erros e mantendo a mensagem de simulação sempre presente.

## Criterios de aceite
- O requisito `RF49, RF50, RF51` fica rastreavel no backlog, matriz, anexo e guia.
- O fluxo respeita a empresa ativa e não usa o domínio de `payments` de documentos.
- A UI/API comunica claramente que não existe cobrança real.
