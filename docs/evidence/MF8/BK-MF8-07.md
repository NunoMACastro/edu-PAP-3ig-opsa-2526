# Evidence MF8 / BK-MF8-07

- Projeto: OPSA
- BK: BK-MF8-07
- Tema: UI de planos e gestão da subscrição simulada
- Data: YYYY-MM-DD
- Responsável: Andre
- Apoio: Pedro

## Ficheiros alterados

- apps/web/src/lib/subscriptionsApi.ts
- apps/web/src/pages/SubscriptionsPage.tsx
- apps/web/src/App.tsx
- apps/web/src/styles.css
- apps/web/scripts/check-mf8-subscriptions-ui.mjs
- apps/web/package.json

## Comandos executados

| Comando | Critério de sucesso | Evidência a anexar |
| --- | --- | --- |
| `cd apps/web && npm run typecheck` | O comando termina com exit code `0` e não apresenta erros de TypeScript. | Anexar o output real do terminal; se falhar, manter o BK aberto e resumir o erro corrigido. |
| `cd apps/web && npm run test:mf8:subscriptions-ui` | O gate confirma página, cliente API, aviso de simulação e ausência de `companyId` decidido pela UI. | Anexar o output real do terminal; se falhar, indicar a regra de UI ou segurança que ficou por corrigir. |

## Verificação manual

- [ ] A página `Subscrições` aparece na navegação.
- [ ] A lista de planos mostra mensal, trimestral e anual quando a API devolve catálogo.
- [ ] O estado sem subscrição permite ativar plano.
- [ ] O estado ativo permite renovar e cancelar.
- [ ] O estado cancelado ou expirado permite reativar com plano escolhido.
- [ ] A UI mostra aviso de ações simuladas e não promete pagamento real.
- [ ] A UI não pede identificador de empresa ao utilizador.

## Notas para BK-MF8-08

BK-MF8-08 deve usar esta evidence para validar o fluxo completo de subscrições simuladas.