# BK-MF7-09 - Frontend modular com routing, autenticação e componentes reutilizáveis

## Header

- `doc_id`: `GUIA-BK-MF7-09`
- `bk_id`: `BK-MF7-09`
- `macro`: `MF7`
- `owner`: `Andre`
- `apoio`: `Sofia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF26`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-10`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md`
- `last_updated`: `2026-07-10`

## Objetivo

Organizar o frontend em módulos navegáveis com React Router, autenticação deny-by-default e uma camada HTTP comum. Deep links, Back/Forward, 404, sessão expirada, acessibilidade e mobile fazem parte do contrato, não são melhorias opcionais.

## Arquitetura mínima

```text
apps/web/src/
├── app/
│   ├── router.tsx
│   ├── routeRegistry.ts
│   └── AppProviders.tsx
├── auth/
│   ├── AuthProvider.tsx
│   └── ProtectedRoute.tsx
├── lib/api/
│   └── apiClient.ts
├── layout/
│   ├── AppShell.tsx
│   └── Navigation.tsx
├── components/
│   ├── FormField.tsx
│   ├── AccessibleDialog.tsx
│   └── CursorList.tsx
└── pages/
    ├── LoginPage.tsx
    └── NotFoundPage.tsx
```

## Registry de rotas

Existe uma única registry tipada com path, visibilidade, permissão e lazy component. A navegação é derivada da mesma registry; não mantém uma segunda lista de 45 links.

```ts
type AppRoute = {
  path: string;
  public: boolean;
  requiredPermission?: string;
  navigationGroup?: string;
  lazy: () => Promise<{ Component: React.ComponentType }>;
};
```

Rotas não reconhecidas mostram 404. Rotas protegidas esperam pelo bootstrap; nunca renderizam conteúdo privado durante o carregamento.

## `AuthProvider`

Estados explícitos:

```text
bootstrapping | anonymous | authenticated | error
```

`/api/auth/me` e `/api/permissions/me` são a fonte de verdade. Ausência, erro ou permissão desconhecida resulta em deny. Em `401`, o cliente cancela pedidos relevantes, limpa estado de sessão e navega para login com um único `returnTo` interno validado. URLs absolutas, `//host` e esquemas externos são rejeitados.

## Cliente HTTP

- timeout e `AbortSignal` central;
- JSON apenas nas routes JSON;
- `FormData` sem definir boundary manual;
- envelope de erro consistente;
- nenhuma repetição automática de `POST`, `PATCH`, `PUT` ou `DELETE`;
- 401 tratado uma vez pelo provider;
- abort ao desmontar páginas/alterar pesquisa.

## Cursor pagination

Consumidores de listagens usam:

```ts
type CursorPage<T> = {
  items: T[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
};
```

O componente de lista substitui itens apenas no primeiro pedido e acrescenta-os ao carregar mais. Cancela pesquisa anterior e deduplica por ID.

## Formulários e domínio

- UUIDs técnicos são `select`/autocomplete com labels humanas.
- Linhas contabilísticas e documentos usam editores de linhas, não JSON manual.
- IVA isento aceita exatamente `0`; vazio continua distinto de zero.
- Datas default usam calendário local de Portugal, sem conversão UTC.
- Erro `400`, `409` ou `500` preserva valores; sucesso confirmado é a única ação que limpa.
- Reconciliação mostra sugestões, permite rever/aceitar/rejeitar e recupera `409 STALE_STATE` sem confirmação automática.

## Acessibilidade e responsividade

- skip link para o conteúdo principal;
- `label`/`htmlFor`, `aria-invalid` e `aria-describedby` em erros;
- foco movido para heading/erro após navegação ou submissão inválida;
- diálogo com nome, foco preso, Escape e retorno do foco;
- navegação mobile em drawer fechado por omissão;
- sem overflow horizontal em 375 px;
- conteúdo principal começa até 120 px do topo;
- sem dumps técnicos ou `<pre>` na UI de produção;
- contraste AA e axe sem violações serious/critical.

## Tutorial técnico linear

### Passo 1 - Criar Router e registry

Usa `react-router-dom`, cria `routeRegistry.ts`, migra caminhos e deriva a navegação da mesma fonte.

### Passo 2 - Proteger com `AuthProvider`

Cria `AuthProvider`/`ProtectedRoute` deny-by-default e liga fontes `/auth/me` e `/permissions/me`.

### Passo 3 - Centralizar HTTP

Implementa 401, timeout, abort, multipart e ausência de retry automático de mutações.

### Passo 4 - Migrar componentes de domínio

Usa formulários, editores de linhas e listagens com cursor acessíveis.

### Passo 5 - Completar navegação

Adiciona 404, deep links, Back/Forward e drawer mobile.

### Passo 6 - Provar em testes

Adiciona unitários, integração MSW e E2E browser/axe.

## Testes obrigatórios

- bootstrap anonymous/authenticated/error;
- route privada nunca pisca conteúdo;
- permissão ausente nega;
- `returnTo` externo é rejeitado;
- 401 limpa sessão e preserva apenas destino interno;
- timeout/abort e ausência de retry de mutações;
- deep link e Back/Forward;
- 404;
- cursor load-more sem duplicados;
- formulário preservado em erros;
- IVA zero e data local PT;
- teclado, foco, diálogo e axe;
- Chrome, Edge e Firefox em 375×667, 768×1024 e 1440×900.

## Validação final

```bash
cd apps/web
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Playwright sem browsers instalados ou sem execução iniciada é blocker, não PASS. Não aceites skips no gate final.

## Critérios de aceite

- Uma registry governa Router e navegação.
- Auth e permissions são deny-by-default.
- Sessão expirada, timeout e abort têm comportamento comum.
- Todos os fluxos críticos evitam UUID/JSON manual.
- Paginação, mobile e acessibilidade funcionam em browsers reais.
- Deep links, 404 e histórico estão cobertos.

## Evidence para PR/defesa

- matriz rota/permissão;
- testes AuthProvider/401/returnTo;
- screenshots nos três viewports sem dados pessoais;
- relatório Playwright por browser;
- axe das páginas críticas;
- comandos, exit codes e contagens reais.

## Importância

Sem routing/autorização central, o menu e as páginas divergem e podem expor conteúdo durante bootstrap ou sessão expirada.

## Scope-in

- Router, AuthProvider, cliente HTTP, paginação, formulários, a11y e mobile.

## Scope-out

- Autorização final no browser ou repetição automática de mutações.

## Estado antes e depois

- Antes: navegação monolítica e decisões espalhadas.
- Depois: registry única, deny-by-default e componentes reutilizáveis testados.

## Pre-requisitos

- Concluir contratos MF5 e disponibilizar API/MSW/Playwright.

## Glossário

- **Route registry:** fonte única de path, permissão e componente.
- **Bootstrapping:** estado antes de conhecer a sessão.

## Conceitos teóricos essenciais

Autenticação responde “quem”; autorização responde “pode”; ambas falham fechado quando o estado é desconhecido.

## Arquitetura do BK

Providers → Router/registry → protected routes/layout → pages → API client → backend.

## Ficheiros a criar/editar/rever

Revê os ficheiros `apps/web/...` listados no mapa de arquitetura e os respetivos testes.

## Cenários negativos mínimos

Executa pelo menos 3 cenários negativos: permissão ausente, `returnTo` externo e mutação interrompida sem retry.

## Handoff

Entrega a `BK-MF7-10` superfícies críticas modularizadas e prontas para testes automatizados reais.

## Changelog

- `2026-07-10`: adicionados Router, AuthProvider, 401/abort, cursor pagination, a11y, mobile e browser E2E.
