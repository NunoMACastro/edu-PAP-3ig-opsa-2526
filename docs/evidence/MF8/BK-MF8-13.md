# Evidence MF8 / BK-MF8-13

- Projeto: OPSA
- BK: BK-MF8-13
- Tema: IA deve evitar enviesamentos e sugerir acoes baseadas em dados reais
- RF/RNF: RNF34
- Data de revalidação documental: 2026-07-10
- Responsavel: Oleksii
- Apoio: Pedro
- Implementation root validado: real_dev

## Artefactos verificados

- Guia canonico: `docs/planificacao/guias-bk/MF8/BK-MF8-13-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md`
- Guardrail de fonte: `real_dev/api/src/modules/ai/aiSourceGuardrails.js`
- Service principal: `real_dev/api/src/modules/ai/aiService.js`
- Router principal: `real_dev/api/src/modules/ai/aiRoutes.js`
- Politica de governanca AI: `real_dev/api/src/modules/ai/aiGovernancePolicy.js`
- Teste de contrato: `real_dev/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js`
- Relatorio de implementacao: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- Relatorio de auditoria: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

## Matriz de prova

| RNF | Prova automatica | Criterio de sucesso | Resultado observado |
| --- | --- | --- | --- |
| RNF34 | `assertAiSourceQuality()` exige `companyId`. | A sugestao so e avaliada no contexto da empresa ativa resolvida no backend. | PASS; ausencia de empresa ativa falha com `AI_SOURCE_COMPANY_REQUIRED`. |
| RNF34 | `assertAiSourceQuality()` exige `sourceType`, `sourceId` e `sourceLabel`. | A IA nao apresenta sugestoes sem fonte real e rastreavel. | PASS; ausencia de identificador de fonte falha com `AI_SOURCE_TRACE_REQUIRED`. |
| RNF34 | `assertAiSourceQuality()` exige `actionType` e explicacao minima. | A sugestao tem acao explicita e justificacao defensavel. | PASS; explicacao fraca falha com `AI_SOURCE_EXPLANATION_TOO_SHORT`. |
| RNF34 | `classifyAiSourceQuality()` devolve `confidence`, `limitation` e `source`. | A API/UI pode mostrar prudencia, origem e limitacao ao utilizador. | PASS; caso positivo devolve `confidence: "medium"` para fonte conhecida e inclui a fonte usada. |
| RNF34/BK10 | `generateAiSuggestions()` le apenas insights `OPEN` da empresa ativa e consome `sourceType`, `sourceId`, `sourceLabel` e `explanation`. | A qualidade da fonte assenta nos metadados de explicabilidade ja entregues por BK10. | PASS; o teste dedicado confirma a query `{ companyId, status: "OPEN" }`. |
| RNF34/BK11 | `generateAiSuggestions()` chama `assertAiRecommendationOnly()` antes de `assertAiSourceQuality()`. | A IA continua a recomendar com fonte, sem executar acoes financeiras ou contabilisticas. | PASS; a sequencia no service mantem a fronteira de recomendacao segura antes do `upsert`. |
| RNF34 | `assertAiSourceQuality()` corre antes de `prisma.aiActionSuggestion.upsert`. | Uma sugestao sem fonte nao e persistida nem devolvida. | PASS; o negativo de integracao deixa `persisted.length` igual a `0`. |
| Multiempresa | `aiRoutes.js` passa `companyId: req.companyId` para `generateAiSuggestions()`. | O frontend nao escolhe a empresa usada pela IA. | PASS; pesquisa estatica nao encontrou `body.companyId` ou `query.companyId` no modulo AI auditado. |

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run syntax:check` | PASS; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=<synthetic-test-url> npm --prefix real_dev/api run prisma:validate` | PASS; schema Prisma valido. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | PASS; 5 testes, 5 pass. |
| `npm --prefix real_dev/api run test:contracts` | Exit `0`; 153 testes, 153 pass, 0 fail, 0 skipped, reexecutados em 2026-07-10. |
| `npm --prefix real_dev/api run test:unit` | Exit `0`; 278 testes, 278 pass, 0 fail, 0 skipped, reexecutados em 2026-07-10. |
| `npm --prefix real_dev/web run typecheck` | PASS; TypeScript frontend sem erros. |
| `npm --prefix real_dev/web run build` | PASS; build Vite concluida. |
| Pesquisa estatica de risco no escopo AI/BK13 | PASS; sem ocorrencias de marcadores de implementacao pendente, storage sensivel, execucao dinamica, segredos, casts inseguros, operacoes destrutivas globais, CORS permissivo ou ownership pelo pedido HTTP. |
| Pesquisa de drift de dominio no escopo AI/BK13 | PASS; sem referencias a dominios externos. |
| `bash scripts/validate-planificacao.sh` | Exit `1` esperado: `documentation_sync_pass=true`, `canonical_runtime_pass=false`, `overall_pass=false`, 3 blockers runtime, 0 advisories e 0 waivers. |
| `test -f docs/evidence/MF8/BK-MF8-13.md` | PASS; ficheiro de evidence dedicado existe. |
| `git diff --check` | PASS; sem whitespace errors em ficheiros rastreados. |

## Negativos validados

- Sugestao sem `sourceId` falha com `AI_SOURCE_TRACE_REQUIRED`.
- Sugestao sem empresa ativa falha com `AI_SOURCE_COMPANY_REQUIRED`.
- Sugestao com explicacao fraca falha com `AI_SOURCE_EXPLANATION_TOO_SHORT`.
- Insight sem fonte rastreavel falha antes de `upsert`; a sugestao nao e persistida.
- `companyId` vem do contexto backend (`req.companyId`) e nao de body/query.
- A fronteira `assertAiRecommendationOnly()` continua a impedir acoes financeiras ou contabilisticas automaticas.

## Limites confirmados

- A evidence corrige apenas o finding documental `P3-BK-MF8-13-EVIDENCE-001`.
- Nao houve alteracao de codigo nesta correcao; o contrato runtime ja estava implementado em `real_dev`.
- Nao foram criadas metricas estatisticas avancadas de enviesamento, provider externo de IA, nova persistencia Prisma ou UI frontend.
- Smoke HTTP autenticado com servidor real e base de dados persistente real nao foram executados; a prova ficou em schema, service, router, testes automatizados e scans estaticos.
- O estado pedagógico dos alunos permanece separado da referência. O gate global
  não fica verde enquanto os blockers runtime estiverem ativos.

## Handoff para BK-MF8-14

- Contrato entregue: sugestoes de IA incluem `sourceQuality` com `confidence`, `limitation` e `source`.
- Regra para UI: mostrar a fonte e a limitacao da sugestao sem transformar a IA num executor automatico.
- Fonte reutilizavel: `assertAiSourceQuality()` pode ser chamada antes de novas superficies de sugestoes.
- Decisao humana: a resposta publica inclui `guardrail: "A IA recomenda com fonte rastreavel; a decisao continua humana."`.
- Teste repetivel: `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api`.

## Decisao

`BK-MF8-13` fica com evidence dedicada criada e o finding `P3-BK-MF8-13-EVIDENCE-001` corrigido. A implementacao real continua validada como backend AI guardrail, multiempresa, baseada em fonte rastreavel e sem execucao automatica de acoes.
