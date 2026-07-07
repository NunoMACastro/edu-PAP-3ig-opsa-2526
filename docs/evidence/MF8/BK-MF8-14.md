<<<<<<< HEAD
<!-- docs/evidence/MF8/BK-MF8-14.md -->
# Evidence BK-MF8-14

## Contexto

- BK: BK-MF8-14
- Requisito: RNF35
- Decisão principal: DERIVADO - transformar o mockup em contrato visual verificável sem alterar dados de negócio.

## Comandos

| Comando | Expected | Observed |
| --- | --- | --- |
| `cd apps/web && npm run test:mf8:ui-alignment` | `MF8 UI alignment OK` | A preencher |
| `cd apps/web && npm run typecheck` | Sem erros TypeScript | A preencher |
| `cd apps/api && node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` | Teste de qualidade da fonte verde | A preencher |

## Negativos executados

| Negativo | Expected | Observed |
| --- | --- | --- |
| Remover `AiSourceQualityPanel` da página de sugestões | Gate falha em `mf4Pages.tsx` | A preencher |
| Remover `.statusMessage--danger` de `styles.css` | Gate falha em `styles.css` | A preencher |
| Remover script do package | `npm run test:mf8:ui-alignment` falha | A preencher |

## Handoff

- Próximo BK: BK-MF8-15
- Contrato entregue: UI coerente, estados acessíveis, fonte de IA visível e gate frontend.
- Risco residual: screenshots devem ser capturados na máquina da equipa, depois de a app correr com dados reais de demonstração.
=======
# Evidence MF8 / BK-MF8-14

- Projeto: OPSA
- BK: BK-MF8-14
- Tema: aproximacao da UI a UI do mockup
- RF/RNF: RNF35
- Data: 2026-07-06
- Responsavel: Pedro
- Apoio: Sofia
- Implementation root validado: real_dev

## Artefactos verificados

- Guia canonico: `docs/planificacao/guias-bk/MF8/BK-MF8-14-aproximacao-da-ui-a-ui-do-mockup.md`
- Checklist visual: `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md`
- Paleta do mockup: `mockup/PALETA-CORES.md`
- Layout de referencia: `mockup/src/app/components/Layout.tsx`
- CSS real: `real_dev/web/src/styles.css`
- Componentes partilhados: `real_dev/web/src/ui/opsaUi.tsx`
- Cliente API MF4: `real_dev/web/src/lib/mf4Api.ts`
- Paginas MF4/IA: `real_dev/web/src/pages/mf4Pages.tsx`
- Gate frontend: `real_dev/web/scripts/check-mf8-ui-alignment.mjs`
- Package frontend: `real_dev/web/package.json`
- Relatorio de implementacao: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- Relatorio de auditoria: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

## Matriz de prova

| RNF | Prova automatica/documental | Criterio de sucesso | Resultado observado |
| --- | --- | --- | --- |
| RNF35 | `styles.css` define tokens OPSA e aplica fundo preto. | A app real usa a paleta do mockup sem imagem estatica nem decoracao falsa. | PASS; tokens `--opsa-royal-green`, `--opsa-yellow` e `--opsa-bg` existem e sao consumidos. |
| RNF35 | `.sidebar`, `nav button:hover` e `nav button.active` usam tons OPSA. | A navegacao lateral aproxima-se do mockup e distingue estado ativo/hover. | PASS; sidebar usa `Royal Green`, hover usa verde liquido e ativo usa verde claro. |
| RNF35 | `button`, inputs, tabelas, cards e estados usam regras comuns. | A interface deixa de depender de estilos avulsos por pagina. | PASS; botoes amarelos, forms, `.tableWrap`, `.operation`, `.statusMessage` e badges partilhados existem. |
| RNF35 | `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge` e `AiSourceQualityPanel` estao centralizados. | Modulos usam componentes transversais em vez de wrappers isolados. | PASS; `real_dev/web/src/ui/opsaUi.tsx` exporta os componentes exigidos. |
| RNF35/BK13 | `AiActionSuggestion` aceita `sourceQuality` e `guardrail`. | A UI consegue mostrar fonte, limitacao e regra de decisao humana. | PASS; `real_dev/web/src/lib/mf4Api.ts` tipa os campos vindos da API. |
| RNF35/BK13 | `AiSuggestionsPage` renderiza `AiSourceQualityPanel` e mensagem de decisao humana. | A IA recomenda com fonte, mas nao executa a decisao pelo utilizador. | PASS; a pagina mostra qualidade da fonte e `StatusMessage` de decisao humana. |
| RNF35 | `test:mf8:ui-alignment` executa o gate local. | O contrato visual fica repetivel em PR/auditoria. | PASS; o script valida CSS, componentes, paginas, `sourceQuality` e script no package. |
| RNF35 | `UI-MOCKUP-CHECKLIST.md` existe e enumera criterios concretos. | A validacao visual nao fica resumida a "parecido com o mockup". | PASS; a checklist cobre paleta, sidebar, botoes, tabelas, cards, estados, IA e limites. |

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/web run test:mf8:ui-alignment` | PASS; `MF8 UI alignment OK`. |
| `npm --prefix real_dev/web run typecheck` | PASS; TypeScript frontend sem erros. |
| `npm --prefix real_dev/web run build` | PASS; build Vite concluida. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | PASS; 5 testes, 5 pass. |
| `npm --prefix real_dev/api run syntax:check` | PASS; sintaxe JS valida. |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa npm --prefix real_dev/api run prisma:validate` | PASS; schema Prisma valido. |
| `test -f docs/evidence/MF8/BK-MF8-14.md` | PASS; ficheiro de evidence dedicado existe. |
| `test -f docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` | PASS; checklist visual dedicada existe. |
| Pesquisa estatica de risco no escopo BK14 | PASS; sem marcadores de implementacao pendente, storage sensivel, execucao dinamica, segredos, casts inseguros ou configuracao HTTP permissiva. |
| Pesquisa de drift de dominio no escopo BK14 | PASS; sem referencias indevidas a outros produtos/dominios. |
| `bash scripts/validate-planificacao.sh` | PASS_COM_RESSALVAS; `overall_pass=true`, `advisory_pass=false` por advisories documentais legados fora do scope desta evidence. |
| `git diff --check` | PASS; sem whitespace errors em ficheiros rastreados. |

## Negativos documentados

| Negativo | Resultado esperado | Estado |
| --- | --- | --- |
| Remover tokens OPSA essenciais de `styles.css`. | `test:mf8:ui-alignment` falha ao procurar `--opsa-royal-green`, `--opsa-yellow`, `.appShell`, `.sidebar`, `.pageFrame`, `.statusMessage` ou `.aiSourceQuality`. | Coberto pelo gate; mutacao destrutiva nao executada. |
| Remover `PageFrame` ou `StatusMessage` de paginas reais. | O gate falha em paginas que renderizam UI e nao sao wrappers legitimos. | Coberto pelo gate; mutacao destrutiva nao executada. |
| Remover `AiSourceQualityPanel` ou `sourceQuality` da UI de IA. | O gate falha em `src/pages/mf4Pages.tsx` ou `src/lib/mf4Api.ts`. | Coberto pelo gate; mutacao destrutiva nao executada. |
| Remover o script `test:mf8:ui-alignment` do package. | O gate falha no check de package. | Coberto pelo gate; mutacao destrutiva nao executada. |

## Limites confirmados

- A evidence corrige apenas o finding documental `P3-BK-MF8-14-EVIDENCE-001`.
- Nao houve alteracao de codigo nesta correcao; o contrato runtime ja estava implementado em `real_dev`.
- Nao foi feito screenshot/browser nesta correcao; a prova ficou em CSS, componentes, gate, typecheck, build e checklist documental.
- Nao foram alterados endpoints, Prisma, permissoes, autenticacao, ownership ou regras contabilisticas.
- Os advisories pedagogicos antigos do validador de planificacao permanecem fora desta correcao; o validador manteve `overall_pass=true`.

## Handoff para BK-MF8-15

- Contrato entregue: UI coerente com RNF35, tokens OPSA, componentes partilhados e painel de fonte IA.
- Checklist entregue: `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md`.
- Teste repetivel: `npm --prefix real_dev/web run test:mf8:ui-alignment`.
- O proximo BK pode trabalhar localizacao PT-PT sem reabrir a camada visual nem alterar o contrato de IA.

## Decisao

`BK-MF8-14` fica com evidence dedicada e checklist visual criadas. O finding `P3-BK-MF8-14-EVIDENCE-001` fica corrigido, mantendo o runtime sem alteracoes.
>>>>>>> 81619f4 (Update: Mid)
