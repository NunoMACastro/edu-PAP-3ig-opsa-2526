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
Ficheiros editados:
- apps/web/src/pages/mf3Pages.tsx
- apps/web/src/pages/mf4Pages.tsx

Regras implementadas:
- função local PageFrame removida de mf3Pages.tsx;
- função local PageFrame removida de mf4Pages.tsx;
- MF3 passou a importar PageFrame de ../ui/opsaUi;
- MF4 passou a importar PageFrame de ../ui/opsaUi;
- usos existentes de <PageFrame title="..."> foram preservados;
- componentes exportados de MF3 não foram alterados;
- componentes exportados de MF4 não foram alterados;
- chamadas HTTP e regras funcionais não foram alteradas;
- MF4 manteve ReactNode porque ListPanel ainda usa esse tipo;
- MF3 removeu ReactNode porque deixou de ser necessário.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path apps/web/src/pages/mf3Pages.tsx,apps/web/src/pages/mf4Pages.tsx -Pattern "function PageFrame"
- PS D:\PAP\edu-PAP-3ig-opsa-2526> Select-String -Path apps/web/src/pages/mf3Pages.tsx,apps/web/src/pages/mf4Pages.tsx -Pattern "../ui/opsaUi"

apps\web\src\pages\mf3Pages.tsx:3:import { PageFrame } from "../ui/opsaUi";
apps\web\src\pages\mf4Pages.tsx:32:import { PageFrame } from "../ui/opsaUi";

Passo 6
Ficheiros editados:
- apps/web/src/styles.css

Regras implementadas:
- adicionados estilos MF5 no fim do ficheiro;
- criado suporte visual para pageFrame;
- criado suporte visual para pageFrame__header;
- criado suporte visual para pageFrame__description;
- criado suporte visual para pageFrame__actions;
- criado suporte visual para actionToolbar;
- criado suporte visual para statusMessage;
- criado suporte visual para moduleBadge;
- estilos existentes foram preservados;
- sidebar, content e operationGrid não foram alterados.

Smoke validado:
- cabeçalhos mantêm espaçamento coerente;
- botão Atualizar mantém alinhamento;
- mensagens de erro/sucesso aparecem com estrutura consistente;
- páginas MF1, MF2, MF3 e MF4 mantêm layout funcional.

Negativo validado:
- CSS não quebrou sidebar;
- CSS não quebrou content;
- CSS não quebrou operationGrid;
- alteração não mexeu em chamadas HTTP, permissões ou validações.

Passo 7
- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/web
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\web> npm run typecheck

> tsc --noEmit

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\web> npm run test:mf1

> node scripts/check-mf1-pages.mjs

MF1 frontend pages contract OK

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\web> npm run test:mf2


MF2 frontend pages contract OK

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\web> npm run test:mf3

> @opsa/web@1.0.0 test:mf3
> node scripts/check-mf3-pages.mjs

Select-String : Cannot find path 'D:\PAP\edu-PAP-3ig-opsa-2526\apps\web\apps\web\src\pages\mf1Pages.tsx' because it does not exist.
At line:1 char:1
+ Select-String -Path apps/web/src/pages/mf1Pages.tsx,apps/web/src/page ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (D:\PAP\edu-PAP-...es\mf1Pages.tsx:String) [Select-String], ItemNotFoundException
    + FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.SelectStringCommand
 
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\web> Select-String -Path src/pages/mf1Pages.tsx,src/pages/mf2Pages.tsx,src/pages/mf3Pages.tsx,src/pages/mf4Pages.tsx -Pattern "function PageFrame"  

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\web> Select-String -Path src/pages/mf1Pages.tsx,src/pages/mf2Pages.tsx,src/pages/mf3Pages.tsx,src/pages/mf4Pages.tsx -Pattern "../ui/opsaUi"                                    

src\pages\mf1Pages.tsx:20:import { PageFrame } from "../ui/opsaUi";
src\pages\mf2Pages.tsx:11:import { PageFrame } from "../ui/opsaUi";
src\pages\mf3Pages.tsx:3:import { PageFrame } from "../ui/opsaUi";
src\pages\mf4Pages.tsx:32:import { PageFrame } from "../ui/opsaUi";

Passo 8
Exports criados em apps/web/src/ui/opsaUi.tsx:
- PageFrame
- StatusMessage
- ActionToolbar
- ModuleBadge

Ficheiros migrados para PageFrame transversal:
- apps/web/src/App.tsx
- apps/web/src/pages/mf1Pages.tsx
- apps/web/src/pages/mf2Pages.tsx
- apps/web/src/pages/mf3Pages.tsx
- apps/web/src/pages/mf4Pages.tsx

Ficheiros alterados/criados:
- criado apps/web/src/ui/opsaUi.tsx;
- editado apps/web/src/App.tsx;
- editado apps/web/src/pages/mf1Pages.tsx;
- editado apps/web/src/pages/mf2Pages.tsx;
- editado apps/web/src/pages/mf3Pages.tsx;
- editado apps/web/src/pages/mf4Pages.tsx;
- editado apps/web/src/styles.css.

Validação automática:
- npm --prefix apps/web run typecheck;
- npm --prefix apps/web run build;
- npm --prefix apps/web run test:mf1;
- npm --prefix apps/web run test:mf2;
- npm --prefix apps/web run test:mf3.

Validação manual:
- ResourcePanel abriu com PageFrame;
- MF1 abriu com PageFrame transversal;
- MF2 abriu com PageFrame transversal;
- MF3 abriu com PageFrame transversal;
- MF4 abriu com PageFrame transversal;
- AiInsightsPage manteve layout funcional;
- AiSuggestionsPage manteve layout funcional;
- NotificationsPage manteve layout funcional;
- AuditLogsPage manteve layout funcional;
- IntegrationLogsPage manteve layout funcional.

Screenshots/evidence visual:
- screenshot antes/depois de um módulo MF1 ou MF2;
- screenshot antes/depois de um módulo MF3 ou MF4;
- screenshot de ResourcePanel com botão Atualizar;
- screenshot de mensagem StatusMessage, se houver erro controlado.

Handoff para BK-MF5-02:
- BK-MF5-02 deve reutilizar PageFrame para responsividade;
- BK-MF5-02 deve reutilizar ActionToolbar para ações em desktop/tablet/mobile;
- BK-MF5-02 deve reutilizar StatusMessage para estados empty/error/loading/success;
- BK-MF5-02 pode reutilizar ModuleBadge para categorias ou estados;
- não criar componentes paralelos para a mesma responsabilidade.

Scope respeitado:
- não foram criados endpoints backend;
- não foram criados modelos Prisma;
- não foram alteradas permissões;
- não foram alteradas regras de negócio;
- não foi criado novo cliente HTTP;
- apiClient e cookies HttpOnly foram preservados;
- frontend continua sem ser fonte de autorização.