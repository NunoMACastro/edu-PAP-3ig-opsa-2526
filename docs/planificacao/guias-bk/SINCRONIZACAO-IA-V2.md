# Sincronização da implementação de referência — IA OPSA v2

Data: 2026-07-12
Âmbito: RF39-RF43, RNF31-RNF34, MF3, MF4 e MF8

## Como ler este documento

Os guias BK preservam o percurso pedagógico e os caminhos públicos `apps/api` e `apps/web`. Este documento regista a paridade atual da implementação privada `real_dev` depois da reestruturação da IA. Quando um exemplo antigo de MF4 divergir desta secção sobre comportamento runtime, prevalecem:

1. `docs/ARQUITETURA-IA-OPSA-V2.md` para arquitetura e segurança;
2. este documento para mapeamento BK;
3. `real_dev/api/docs/ai-operations.md` para operação.

O estado pedagógico `TODO` ou `DONE` dos alunos não é alterado pela existência da implementação de referência.

## Delta por BK

### BK-MF3-07 e BK-MF3-08 — métricas que alimentam a IA

- Totais são agregados no PostgreSQL e não limitados por `take` ou paginação.
- Todas as métricas têm `from`, `to`, `asOf`, timezone `Europe/Lisbon`, cobertura e limitações.
- Receita, gastos, resultado operacional e margem usam lançamentos e classes SNC.
- EBITDA pode ser `null` com `INSUFFICIENT_DATA`; não é estimado pela OpenAI.
- PMR/PMP são ponderados pelo valor recebido/pago, incluindo parciais.
- Stock atual usa `StockBalance`; stock histórico é reconstruído por movimentos.

### BK-MF4-01 — insights

- `GET /api/ai/insights` é leitura pura e paginada.
- A atualização cria `POST /api/ai/analysis-runs`; a UI acompanha o run até conclusão.
- `AiInsight` inclui regra/versão, fingerprint, score, prioridade, período, evidência, ocorrência, origem e lifecycle.
- O worker atualiza riscos existentes e resolve os que desapareceram.

### BK-MF4-02 — sugestões

- Sugestões continuam read-only e nunca executam a ação recomendada.
- Estados suportados: `OPEN`, `ACCEPTED`, `DISMISSED` e `DONE`.
- Feedback e motivo são controlados; atualizar a lista não substitui o autor original.
- A ordenação usa score/prioridade e qualidade da fonte.

### BK-MF4-03 — chat contextual

- O formulário de uma pergunta foi substituído pela página `/ai/chat` e por um drawer global.
- O chat tem sessões, histórico cifrado, streaming SSE, fontes, limitações, follow-ups, feedback e eliminação.
- A OpenAI é opcional e só redige enquadramento qualitativo; o classificador local fixa uma única tool/período e o backend é o único autor de factos.
- A chamada externa exige configuração global, opt-in da empresa por `ADMIN` e consentimento individual.
- Pergunta, histórico, IDs, aliases e valores nunca saem da API; o provider recebe apenas intenção e sinais qualitativos canónicos.
- O adapter `POST /api/ai/questions` permanece temporariamente com `Deprecation` e `Sunset`.
- A rota frontend `/ai/questions` redireciona para `/ai/chat`.

### BK-MF4-04 — alertas

- `GET /api/ai/alerts` é leitura pura e paginada; a geração ocorre através de `AiAnalysisRun`.
- `SmartAlert` inclui regra/versão, fingerprint, score, prioridade, período, evidência, ocorrências e lifecycle.
- Estados: `OPEN`, `ACKNOWLEDGED`, `RESOLVED` e `DISMISSED`.
- Preferências afetam entrega in-app/email, mas não eliminam deteção interna.
- Alertas resolvidos não são reenviados como ativos.

### BK-MF4-05 e BK-MF8-10 — explicabilidade

- Cada resultado analítico contém fórmula, período, contagens, qualidade, limitações e `sourceRefs`.
- O provider já não produz claims; `facts`, fontes e frases factuais são compostos integralmente pelo backend.
- `GET /api/ai/insights/:id/explanation` mantém filtro por empresa, permissão e role.

### BK-MF4-08 e BK-MF8-12 — notificações e preferências

- `AlertPreference` continua por utilizador e controla entrega.
- A página de notificações expõe os toggles e só mostra o tipo IA a roles com `AI_ALERTS_READ`.
- `AiRuleSetting` controla deteção e thresholds por empresa dentro de limites seguros.
- Notificações refletem lifecycle final e não reenviam alertas resolvidos.
- O worker de IA e o worker SMTP são processos separados.

### BK-MF8-09 — documentação técnica

- A arquitetura completa está em `docs/ARQUITETURA-IA-OPSA-V2.md`.
- O runbook está em `real_dev/api/docs/ai-operations.md`.
- Configuração e secrets de IA estão documentados em `.env.example`, sem valores reais.

### BK-MF8-11 — fronteira recomendatória

- O modelo não recebe SQL, Prisma, IDs reais, pergunta livre, valores nem qualquer tool.
- Nenhuma resposta do chat aprova documentos, lança contabilidade, paga, muda stock ou altera preços.
- `assertAiRecommendationOnly` continua a proteger a persistência de sugestões.

### BK-MF8-13 — dados reais, qualidade e enviesamento

- O catálogo fechado de tools determina os domínios suportados.
- Perguntas fora de cashflow, recebimentos, stock, margem, KPIs, comparação e explicação são recusadas.
- Narrativas com números, moeda, percentagens, aliases, referências desconhecidas ou schema inválido são rejeitadas e substituídas pelo fallback determinístico.
- O corpus PT-PT tem mais de 100 pedidos suportados, ambíguos e fora de âmbito.

## Permissões efetivas

| Capacidade | Permissão | Roles |
| --- | --- | --- |
| Chat | `AI_CHAT_USE` | `ADMIN`, `GESTOR`, `CONTABILISTA` |
| Criar análises | `AI_ANALYSIS_RUN` | `ADMIN`, `GESTOR`, `CONTABILISTA` |
| Settings | `AI_SETTINGS_MANAGE` | `ADMIN` |
| Insights | `AI_INSIGHTS_READ` | `ADMIN`, `GESTOR`, `CONTABILISTA` |
| Gerir insights | `AI_INSIGHTS_MANAGE` | `ADMIN`, `GESTOR`, `CONTABILISTA` |
| Sugestões | `AI_SUGGESTIONS_READ` | `ADMIN`, `GESTOR` |
| Gerir sugestões | `AI_SUGGESTIONS_MANAGE` | `ADMIN`, `GESTOR` |
| Alertas | `AI_ALERTS_READ` | `ADMIN`, `GESTOR` |
| Gerir alertas | `AI_ALERTS_MANAGE` | `ADMIN`, `GESTOR` |

## Evidência de validação

As contagens e resultados são snapshots datados do relatório de correção, não constantes arquiteturais. Testes de integração completos continuam a exigir PostgreSQL, Redis e SMTP reais. O smoke OpenAI live é manual, opt-in, restrito a empresa demo e nunca obrigatório em CI.
