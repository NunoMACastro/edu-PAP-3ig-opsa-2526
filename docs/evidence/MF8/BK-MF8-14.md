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