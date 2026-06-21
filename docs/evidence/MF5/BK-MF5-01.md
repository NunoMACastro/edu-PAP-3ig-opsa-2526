Passo 1
* RNF01 pede consistência entre módulos
* A aplicação já tem páginas de Vendas, Compras, Inventário, Contabilidade, Tesouraria, IA, auditoria e notificações que usam panel, sectionHeader, operationGrid, error, success e empty.

Passo 2
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit

Passo 3
Ficheiros editados:
- apps/web/src/App.tsx

Regras implementadas:
- ResourcePanel passou a usar PageFrame;
- ações passaram a usar ActionToolbar;
- erros passaram a usar StatusMessage;
- botão Atualizar mantém estado busy;
- pesquisa continua opcional apenas para recursos searchable;
- DataTable continua a receber rows carregadas pela API;
- OperationForm continua a fazer reload após onDone;
- apiClient e cookies HttpOnly não foram alterados.

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

Passo 4
Ficheiros editados:
- apps/web/src/pages/mf1Pages.tsx
- apps/web/src/pages/mf2Pages.tsx

Regras implementadas:
- função local PageFrame removida de mf1Pages.tsx;
- função local PageFrame removida de mf2Pages.tsx;
- MF1 passou a importar PageFrame de ../ui/opsaUi;
- MF2 passou a importar PageFrame de ../ui/opsaUi;
- usos existentes de <PageFrame title="..."> foram preservados;
- lógica funcional das páginas não foi alterada;
- APIs chamadas pelas páginas não foram alteradas;
- validação e autorização continuam no backend.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path apps/web/src/pages/mf1Pages.tsx,apps/web/src/pages/mf2Pages.tsx -Pattern "function PageFrame"

- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path apps/web/src/pages/mf1Pages.tsx,apps/web/src/pages/mf2Pages.tsx -Pattern "../ui/opsaUi"

apps\web\src\pages\mf1Pages.tsx:20:import { PageFrame } from "../ui/opsaUi";
apps\web\src\pages\mf2Pages.tsx:11:import { PageFrame } from "../ui/opsaUi";

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit

Passo 5