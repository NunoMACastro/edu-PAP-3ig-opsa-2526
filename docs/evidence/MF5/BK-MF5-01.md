Passo 1
* RNF01 pede consistência entre módulos
* A aplicação já tem páginas de Vendas, Compras, Inventário, Contabilidade, Tesouraria, IA, auditoria e notificações que usam panel, sectionHeader, operationGrid, error, success e empty.

Passo 2
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit

Passo 3
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build

> @opsa/web@1.0.0 build
> vite build

vite v8.0.16 building client environment for production...
✓ 42 modules transformed.
computing gzip size...
dist/index.html                   0.40 kB │ gzip:  0.28 kB
dist/assets/index-I1u2FZO0.css    2.81 kB │ gzip:  1.06 kB
dist/assets/index-CVdGO9Au.js   264.62 kB │ gzip: 73.10 kB

✓ built in 3.07s