# MF7 - Evidence de compatibilidade browser

## Contrato

- BK: `BK-MF7-03`
- RNF: `RNF20`
- Browsers alvo: Chrome, Edge e Firefox
- Data da validação: `2026-06-29`
- Responsável documental: `Pedro`
- Apoio documental: `Andre`
- Implementation root: `real_dev/web`

## Comandos executados

| Comando | Resultado esperado | Resultado observado |
| --- | --- | --- |
| `npm run test:mf7:browser-compatibility` | `MF7 browser compatibility gate OK` | `PASS`: `MF7 browser compatibility gate OK`. |
| `npm run typecheck` | sem erros TypeScript | `PASS`: `tsc --noEmit` terminou com exit code `0`. |
| `npm run build` | build Vite concluído | `PASS`: Vite gerou `dist/index.html`, CSS e JS final com `✓ built`. |

## Smoke manual por browser

| Browser | Versão testada | Páginas/fluxos revistos | Resultado esperado | Resultado observado |
| --- | --- | --- | --- | --- |
| Chrome | `BLOQUEADO_AMBIENTE` | entrada da app, navegação lateral, tabela responsiva, formulário com erro, feedback visual | interface abre, navega, mantém layout e mostra feedback | Não executado nesta ronda automatizada; requer abertura manual do browser. |
| Edge | `BLOQUEADO_AMBIENTE` | entrada da app, navegação lateral, tabela responsiva, formulário com erro, feedback visual | interface abre, navega, mantém layout e mostra feedback | Não executado nesta ronda automatizada; requer abertura manual do browser. |
| Firefox | `BLOQUEADO_AMBIENTE` | entrada da app, navegação lateral, tabela responsiva, formulário com erro, feedback visual | interface abre, navega, mantém layout e mostra feedback | Não executado nesta ronda automatizada; requer abertura manual do browser. |

## Negativos executados

| Negativo | Como testar | Resultado esperado | Resultado observado |
| --- | --- | --- | --- |
| Ramo por browser no React | adicionar temporariamente `navigator.userAgent` em `src/App.tsx` | gate falha e indica o ficheiro | Coberto por padrão proibido no gate; negativo mutável não aplicado para não deixar alteração temporária no workspace. |
| Ramo por browser no CSS | adicionar temporariamente `@-moz-document url-prefix() { body { outline: 1px solid red; } }` em `src/styles.css` | gate falha e indica o ficheiro | Coberto por padrão proibido no gate; negativo mutável não aplicado para não deixar alteração temporária no workspace. |
| Script npm ausente | remover temporariamente `test:mf7:browser-compatibility` do `package.json` | `npm run` falha por script inexistente | Não executado porque exigiria remover temporariamente o script acabado de implementar. |

## Decisão

- Estado final: `PARCIAL`
- Observações: validação automática concluída com sucesso. Smoke manual em Chrome, Edge e Firefox fica pendente por exigir browsers reais e registo de versões/observações fora desta execução automatizada.
