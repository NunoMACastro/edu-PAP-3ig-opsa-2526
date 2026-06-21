Passo 1
* RNF01 pede consistência entre módulos
* A aplicação já tem páginas de Vendas, Compras, Inventário, Contabilidade, Tesouraria, IA, auditoria e notificações que usam panel, sectionHeader, operationGrid, error, success e empty.

Passo 2
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit