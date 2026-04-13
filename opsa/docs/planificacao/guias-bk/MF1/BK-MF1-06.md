# BK-MF1-06 - Submeter documentos de venda para aprovacao antes de emissao definitiva.

## Header
- `doc_id`: `GUIA-BK-MF1-06`
- `bk_id`: `BK-MF1-06`
- `macro`: `MF1`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-02`
- `rf_rnf`: `RF18`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-07`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-06.md`
- `last_updated`: `2026-04-13`

## O que vamos fazer neste BK
Implementar e documentar o requisito `RF18` associado a `Submeter documentos de venda para aprovacao antes de emissao definitiva.`, com entrega verificavel e rastreabilidade 1:1 entre backlog, matriz e guia.
A execucao e orientada a stack OPSA: frontend React/Next, backend Node.js (NestJS/Express) e dados PostgreSQL/Redis (quando aplicavel).

## Porque isto e importante
- Impacto funcional: `Submeter documentos de venda para aprovacao antes de emissao definitiva.` desbloqueia valor direto no produto OPSA.
- Impacto tecnico: reforca a dimensao `Backend` sob o criterio `Fluxos de dominio e logica server-side cobertos, com rastreabilidade RF/RNF.`.
- Risco se nao fizer bem: regressao funcional, falhas operacionais e evidencia fraca para defesa PAP.

## O que entra (scope)
- Implementacao do fluxo principal e dos caminhos de erro ligados ao requisito.
- Onde tocar no projeto: Servicos de dominio, controladores e regras de negocio no backend com contratos claros de entrada/saida.
- Definicao de evidence objetiva para demonstrar conclusao tecnica e pedagogica.

## O que nao entra (scope-out)
- Refatoracoes amplas sem relacao direta com o requisito deste BK.
- Alteracao de RF/RNF de origem ou de ownership definido na matriz canonica.
- Implementacao de BK futuros que nao sejam pre-condicao direta deste BK.

## Como saber que isto ficou bem
- O requisito `RF18` e demonstrado em cenario real de utilizacao.
- Existe validacao do caminho feliz e de pelo menos 3 cenarios negativos relevantes.
- Criterios de aceite estao mensuraveis e acompanhados de evidence.
- Handoff para o proximo BK inclui riscos e estado de dependencias.


## Pre-requisitos operacionais
- Dependencias tecnicas declaradas: `BK-MF1-02`.
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
1. Ler `RF/RNF` do BK (RF18) e confirmar contexto tecnico antes de tocar no codigo.
2. Validar dependencias declaradas (BK-MF1-02) e confirmar pre-condicoes em ambiente local.
3. Escrever mini-plano de implementacao (entrada, processamento, saida, erros) em 5-8 linhas.
4. Mapear onde alterar no projeto (frontend/backend/dados/integracao) para o BK `BK-MF1-06`.
5. Implementar endpoints/servicos com validacao de regras de negocio, autorizacao e resposta padronizada.
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
- [ ] Pedido com regra de negocio invalida devolve erro controlado sem side-effects.
- [ ] Conflito de concorrencia nao duplica registos nem corrompe estado contabilistico.
- [ ] Operacao sem permissao retorna `403` e regista auditoria minima.

### Tecnico
- [ ] Metadados (owner, prioridade, estado, dependencias) iguais entre guia, backlog e matriz.
- [ ] Criterios de aceite definidos com valores/condicoes verificaveis.
- [ ] Evidence (`pr`, `proof`, `neg`) preparada com links/artefactos reais.
- [ ] Handoff do proximo BK inclui pendencias e riscos tecnicos.

## Criterios de aceite
- `Endpoint/servico cumpre regras de negocio e permissao definidas para o requisito.`
- `Tratamento de erros devolve codigos e mensagens consistentes sem corrupcao de estado.`
- `Contrato de entrada/saida esta documentado e validado em cenario real.`
- Checklist de Smoke, Negativos e Tecnico concluida sem itens pendentes criticos.

## Evidence para PR/defesa
- `pr`: link de PR/commit + resumo do que mudou neste BK.
- `proof`: 2-3 evidencias objetivas (ex.: output de teste, screenshot funcional, log estruturado).
- `neg`: prova de pelo menos 1 cenario negativo relevante com resultado esperado.

## Proximo BK recomendado
`BK-MF1-07`
