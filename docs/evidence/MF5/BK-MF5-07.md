- @Oleksii113 ➜ /workspaces/edu-PAP-3ig-opsa-2526/apps/web (feat/bk-mf5-07-performance-ui-oleksii) $ npm run test:mf5:performance

> @opsa/web@1.0.0 test:mf5:performance
> node scripts/check-mf5-performance.mjs

MF5 performance budget contract OK

- @Oleksii113 ➜ /workspaces/edu-PAP-3ig-opsa-2526/apps/web (feat/bk-mf5-07-performance-ui-oleksii) $ npm run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit

- @Oleksii113 ➜ /workspaces/edu-PAP-3ig-opsa-2526/apps/web (feat/bk-mf5-07-performance-ui-oleksii) $ npm run test:mf1

> @opsa/web@1.0.0 test:mf1
> node scripts/check-mf1-pages.mjs

MF1 frontend pages contract OK
- @Oleksii113 ➜ /workspaces/edu-PAP-3ig-opsa-2526/apps/web (feat/bk-mf5-07-performance-ui-oleksii) $ npm run test:mf2

> @opsa/web@1.0.0 test:mf2
> node scripts/check-mf2-pages.mjs

MF2 frontend pages contract OK
- @Oleksii113 ➜ /workspaces/edu-PAP-3ig-opsa-2526/apps/web (feat/bk-mf5-07-performance-ui-oleksii) $ npm run test:mf3

> @opsa/web@1.0.0 test:mf3
> node scripts/check-mf3-pages.mjs

MF3 pages smoke OK

- @Oleksii113 ➜ /workspaces/edu-PAP-3ig-opsa-2526/apps/web (feat/bk-mf5-07-performance-ui-oleksii) $ npm run test:mf5:errors

> @opsa/web@1.0.0 test:mf5:errors
> node scripts/check-mf5-error-messages.mjs

MF5 error messages smoke OK

- @Oleksii113 ➜ /workspaces/edu-PAP-3ig-opsa-2526/apps/web (feat/bk-mf5-07-performance-ui-oleksii) $ npm run test:mf5:performance

> @opsa/web@1.0.0 test:mf5:performance
> node scripts/check-mf5-performance.mjs

MF5 performance budget contract OK

10) Evidencia obrigatoria
pr
Ainda não criado

proof
Transformado o RNF07 numa regra observável: dashboards e listagens da OPSA devem carregar em até 2 segundos.

A aplicação fica preparada para medir carregamentos no frontend, avisar quando um ecrã ultrapassa o orçamento de performance e produzir evidence para PR ou defesa PAP. Este BK não cria endpoints, não muda regras financeiras e não decide permissões no browser.

files
apps/web/src/lib/mf5PerformanceBudget.ts
apps/web/src/App.tsx
apps/web/src/pages/mf3Pages.tsx
apps/web/scripts/check-mf5-performance.mjs
apps/web/package.json

commands
cd apps/web
npm run typecheck
npm run test:mf1
npm run test:mf2
npm run test:mf3
npm run test:mf5:feedback
npm run test:mf5:a11y
npm run test:mf5:forms
npm run test:mf5:errors
npm run test:mf5:performance