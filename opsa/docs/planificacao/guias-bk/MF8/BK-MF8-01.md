# BK-MF8-01 - Logs estruturados (info, warn, error, audit).

## Header
- `doc_id`: `GUIA-BK-MF8-01`
- `bk_id`: `BK-MF8-01`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-02`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-01.md`
- `last_updated`: `2026-04-13`

## O que vamos fazer neste BK
Implementar e documentar o requisito `RNF30` associado a `Logs estruturados (info, warn, error, audit).`, com entrega verificavel e rastreabilidade 1:1 entre backlog, matriz e guia.
A execucao e orientada a stack OPSA: frontend React/Next, backend Node.js (NestJS/Express) e dados PostgreSQL/Redis (quando aplicavel).

## Porque isto e importante
- Impacto funcional: `Logs estruturados (info, warn, error, audit).` desbloqueia valor direto no produto OPSA.
- Impacto tecnico: reforca a dimensao `Observabilidade & Operacao` sob o criterio `Logs, metricas, alertas e operacao de producao documentados e auditaveis.`.
- Risco se nao fizer bem: regressao funcional, falhas operacionais e evidencia fraca para defesa PAP.

## O que entra (scope)
- Implementacao do fluxo principal e dos caminhos de erro ligados ao requisito.
- Onde tocar no projeto: Logs estruturados, metricas, alertas e runbooks de operacao para incidentes.
- Definicao de evidence objetiva para demonstrar conclusao tecnica e pedagogica.

## O que nao entra (scope-out)
- Refatoracoes amplas sem relacao direta com o requisito deste BK.
- Alteracao de RF/RNF de origem ou de ownership definido na matriz canonica.
- Implementacao de BK futuros que nao sejam pre-condicao direta deste BK.

## Como saber que isto ficou bem
- O requisito `RNF30` e demonstrado em cenario real de utilizacao.
- Existe validacao do caminho feliz e de pelo menos 3 cenarios negativos relevantes.
- Criterios de aceite estao mensuraveis e acompanhados de evidence.
- Handoff para o proximo BK inclui riscos e estado de dependencias.


## Pre-requisitos operacionais
- Dependencias tecnicas declaradas: `-`.
- Contexto minimo lido: RF/RNF do BK + matriz + backlog + guia anterior.
- Ambiente local pronto para executar smoke e cenarios negativos.

## Objetivo pedagogico (12o ano)
- Consolidar autonomia na execucao do BK com rastreabilidade e evidence.
- Treinar decisao tecnica com validacao de erros e qualidade de entrega.

## Tempo estimado
- `Core`: 45-90 minutos (execucao minima + validacao).
- `Reforco` (apenas P0): +20-40 minutos para robustez extra e defesa.

## Erros comuns a evitar
- Fechar BK sem validar cenarios negativos.
- Alterar metadados no guia sem alinhar backlog/matriz.
- Entregar evidencia incompleta (`pr`, `proof`, `neg`).

## Check de compreensao (rapido)
- [ ] Sei explicar em 60 segundos o objetivo e impacto deste BK.
- [ ] Sei indicar o RF/RNF coberto e as dependencias do BK.
- [ ] Sei demonstrar um negativo relevante e o respetivo resultado esperado.

## Pre-leitura minima (10-15 min)
- `docs/RF.md` e/ou `docs/RNF.md` (requisito de origem).
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (metadados oficiais do BK).
- `docs/planificacao/backlogs/BACKLOG-MVP.md` (sequencia e dependencias).
- `docs/planificacao/backlogs/MF-VIEWS.md` (encaixe no macro-fluxo).
- Guia do BK anterior e do proximo BK para garantir continuidade tecnica.

## Glossario rapido
- `BK`: unidade atomica de trabalho rastreavel a RF/RNF.
- `Smoke test`: validacao rapida do caminho principal.
- `Negativo`: teste de erro/limite para prevenir regressao.
- `Evidence`: prova objetiva (output, log, screenshot, diff, teste).
- `Handoff`: transferencia de contexto para o proximo BK.
- `Gate`: criterio obrigatorio para considerar entrega pronta.

## Guia de execucao (passo-a-passo)
1. Ler `RF/RNF` do BK (RNF30) e confirmar contexto tecnico antes de tocar no codigo.
2. Validar dependencias declaradas (-) e confirmar pre-condicoes em ambiente local.
3. Escrever mini-plano de implementacao (entrada, processamento, saida, erros) em 5-8 linhas.
4. Mapear onde alterar no projeto (frontend/backend/dados/integracao) para o BK `BK-MF8-01`.
5. Instrumentar logs/metricas/alertas com limiares e acao operacional documentada.
6. Implementar cenarios negativos e comportamento de erro antes do fecho funcional.
7. Executar smoke + negativos e registar resultados observaveis (logs, output, capturas).
8. Atualizar checklist, criterios de aceite e evidence (`pr`, `proof`, `neg`) com dados reais.
9. Fazer handoff para o proximo BK com riscos, pontos de atencao e pendencias abertas.

## Snippets de codigo (evolucao)
Adicionar aqui, durante implementacao real, excertos pequenos e comentados que provem a evolucao do BK (frontend, backend, dados, integracoes e testes).
Formato recomendado: trecho curto + explicacao do porque + resultado esperado.

## Checklist de validacao
### Smoke
- [ ] Fluxo principal do BK executa sem erro bloqueante no ambiente de desenvolvimento.
- [ ] Resultado funcional e observavel por um colega sem explicacao extra.
- [ ] Dependencias declaradas estao satisfeitas antes do handoff.

### Negativos
- [ ] Erro critico sem `correlation_id` e considerado falha de prontidao.
- [ ] Metrica acima do limiar aciona alerta e runbook correspondente.
- [ ] Queda de dependencia externa fica visivel em dashboard e logs.

### Tecnico
- [ ] Metadados (owner, prioridade, estado, dependencias) iguais entre guia, backlog e matriz.
- [ ] Criterios de aceite definidos com valores/condicoes verificaveis.
- [ ] Evidence (`pr`, `proof`, `neg`) preparada com links/artefactos reais.
- [ ] Handoff do proximo BK inclui pendencias e riscos tecnicos.

## Criterios de aceite
- `Logs estruturados e metricas chave estao instrumentados no fluxo do BK.`
- `Alertas e limiares operacionais estao definidos com acao correspondente.`
- `Runbook minimo de resposta a incidente esta documentado.`
- Checklist de Smoke, Negativos e Tecnico concluida sem itens pendentes criticos.

## Evidence para PR/defesa
- `pr`: link de PR/commit + resumo do que mudou neste BK.
- `proof`: 2-3 evidencias objetivas (ex.: output de teste, screenshot funcional, log estruturado).
- `neg`: prova de pelo menos 1 cenario negativo relevante com resultado esperado.

## Proximo BK recomendado
`BK-MF8-02`
