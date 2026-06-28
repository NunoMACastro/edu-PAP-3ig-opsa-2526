# MF7 - Evidence de compatibilidade browser

## Contrato

- BK: BK-MF7-03
- RNF: RNF20
- Browsers alvo: Chrome, Edge e Firefox
- Data da validação: registar a data real da execução
- Responsável: Pedro
- Apoio: Andre

## Comandos executados

| Comando | Resultado esperado | Resultado observado |
| --- | --- | --- |
| `cd apps/web && npm run test:mf7:browser-compatibility` | `MF7 browser compatibility gate OK` | registar output real da execução |
| `cd apps/web && npm run typecheck` | sem erros TypeScript | registar output real da execução |
| `cd apps/web && npm run build` | build concluído | registar output real da execução |

## Smoke manual por browser

| Browser | Versão testada | Páginas/fluxos revistos | Resultado esperado | Resultado observado |
| --- | --- | --- | --- | --- |
| Chrome | registar versão instalada | entrada da app, navegação lateral, tabela responsiva, formulário com erro, feedback visual | interface abre, navega, mantém layout e mostra feedback | registar comportamento observado |
| Edge | registar versão instalada | entrada da app, navegação lateral, tabela responsiva, formulário com erro, feedback visual | interface abre, navega, mantém layout e mostra feedback | registar comportamento observado |
| Firefox | registar versão instalada | entrada da app, navegação lateral, tabela responsiva, formulário com erro, feedback visual | interface abre, navega, mantém layout e mostra feedback | registar comportamento observado |

## Negativos executados

| Negativo | Como testar | Resultado esperado | Resultado observado |
| --- | --- | --- | --- |
| Ramo por browser no React | adicionar temporariamente `navigator.userAgent` em `src/App.tsx` | gate falha e indica o ficheiro | registar mensagem de falha observada |
| Ramo por browser no CSS | adicionar temporariamente `@-moz-document url-prefix() { body { outline: 1px solid red; } }` em `src/styles.css` | gate falha e indica o ficheiro | registar mensagem de falha observada |
| Script npm ausente | remover temporariamente `test:mf7:browser-compatibility` do `package.json` | `npm run` falha por script inexistente | registar mensagem de falha observada |

## Decisão

- Estado final: indicar `OK` ou `BLOQUEADO`, conforme o resultado final
- Observações: descrever divergências ou escrever `sem divergências`