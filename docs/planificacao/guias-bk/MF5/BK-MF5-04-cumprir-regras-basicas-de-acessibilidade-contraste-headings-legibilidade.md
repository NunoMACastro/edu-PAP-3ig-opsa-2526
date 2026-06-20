# BK-MF5-04 - Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade).

## Header
- `doc_id`: `GUIA-BK-MF5-04`
- `bk_id`: `BK-MF5-04`
- `macro`: `MF5`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF04`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-05`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-04-cumprir-regras-basicas-de-acessibilidade-contraste-headings-legibilidade.md`
- `last_updated`: `2026-06-20`

#### Objetivo

Neste BK vais reforçar a acessibilidade básica da interface OPSA: contraste suficiente, hierarquia correta de títulos, foco visível por teclado, mensagens com semântica acessível e legibilidade consistente.

O resultado final é uma camada transversal de interface que ajuda utilizadores a navegar, ler mensagens e completar tarefas financeiras sem depender apenas da cor, do rato ou de texto visualmente grande. Este BK não cria regras fiscais, endpoints ou modelos de dados; melhora a forma como a aplicação apresenta a informação já produzida pelos módulos anteriores.

Também vais criar um smoke textual para provar que os contratos mínimos de acessibilidade continuam presentes antes da defesa ou de uma revisão técnica.

#### Importância

Acessibilidade não é decoração. Num ERP financeiro, o utilizador precisa de perceber rapidamente se está num módulo de vendas, compras, inventário, contabilidade ou IA, se uma operação falhou e qual é o próximo passo seguro.

Contraste fraco, foco invisível e títulos sem semântica tornam a app mais difícil de usar, especialmente em ecrãs pequenos, ambientes com pouca luz, navegação por teclado ou tecnologias de apoio. Em operações financeiras, essa dificuldade pode levar a erros de leitura, repetição de ações e perda de confiança.

Este BK prepara `BK-MF5-05`, porque formulários com validação antes da submissão precisam de foco visível, mensagens legíveis e uma hierarquia clara para o utilizador corrigir erros sem adivinhar onde está o problema.

#### Scope-in

- Reforçar semântica de `PageFrame` e `StatusMessage`, criados em `BK-MF5-01`.
- Documentar a dependência técnica derivada em relação a `BK-MF5-01` e `BK-MF5-03`, sem alterar metadados canónicos.
- Acrescentar regras CSS para foco visível, contraste, legibilidade, mensagens e preferência de movimento reduzido.
- Criar `real_dev/web/scripts/check-mf5-accessibility.mjs`.
- Atualizar `real_dev/web/package.json` com `test:mf5:a11y`.
- Definir validação manual por teclado e cenários negativos de acessibilidade.

#### Scope-out

- Criar endpoints, controllers, services, DTOs, validators backend ou modelos Prisma.
- Alterar regras de domínio financeiro, fiscal, contabilístico ou legal.
- Alterar RF/RNF, matriz, backlog, sprints, owners, prioridades ou dependências canónicas.
- Trocar React, Vite, TypeScript ou o cliente HTTP existente.
- Adicionar bibliotecas de UI ou ferramentas externas de acessibilidade.
- Decidir permissões, empresa ativa, ownership ou validação final no frontend.

#### Estado antes e depois

- Antes: `BK-MF5-01` define uma moldura visual comum e `BK-MF5-03` normaliza mensagens de feedback, mas `RNF04` ainda não fecha foco visível, legibilidade, smoke específico de acessibilidade e evidence manual.
- Depois: `PageFrame` e `StatusMessage` ficam tratados como contratos acessíveis, o CSS transversal cobre foco/contraste/legibilidade, existe um smoke `test:mf5:a11y` e o aluno sabe validar teclado, títulos e mensagens.

#### Pre-requisitos

- Ler `RNF04` em `docs/RNF.md`.
- Confirmar em `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` que este BK pertence à `MF5`, tem prioridade `P1`, owner `Pedro`, apoio `Andre` e sprint `S09-S10`.
- `DERIVADO`: ter concluído `BK-MF5-01`, porque este BK reutiliza `PageFrame` e `StatusMessage` de `real_dev/web/src/ui/opsaUi.tsx`.
- `DERIVADO`: ter concluído `BK-MF5-03`, porque este BK melhora a semântica e a legibilidade das mensagens de feedback.
- Confirmar que `real_dev/web/src/lib/apiClient.ts` usa `credentials: "include"`.
- Confirmar que o backend continua responsável por autenticação, permissões, empresa ativa, validação final e auditoria de operações sensíveis.

#### Glossário

- `Acessibilidade`: conjunto de decisões que permite usar a aplicação com teclado, leitor de ecrã, diferentes capacidades visuais e diferentes condições de leitura.
- `Contraste`: diferença visual entre texto e fundo; texto com pouco contraste fica difícil de ler.
- `Heading`: título semântico (`h1`, `h2`, `h3`) que organiza a página para pessoas e tecnologias de apoio.
- `Foco visível`: contorno ou destaque que mostra qual botão, link ou campo está selecionado pelo teclado.
- `Leitor de ecrã`: tecnologia de apoio que lê estrutura, títulos, mensagens e controlos.
- `aria-labelledby`: atributo que liga uma zona da página ao título que a identifica.
- `aria-live`: atributo que avisa tecnologias de apoio quando uma mensagem de estado muda.
- `role="status"`: semântica para mensagens informativas sem urgência.
- `role="alert"`: semântica para mensagens de erro que precisam de ser anunciadas com prioridade.
- `prefers-reduced-motion`: preferência do sistema para reduzir animações e movimentos.
- `Smoke textual`: comando rápido que confirma contratos estruturais em ficheiros do projeto.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF04` exige regras básicas de acessibilidade: contraste, headings e legibilidade.
- `CANONICO`: a stack validada para o frontend OPSA é React, Vite e TypeScript em `real_dev/web`.
- `CANONICO`: autenticação e sessão usam cookies HttpOnly; o frontend envia pedidos com `credentials: "include"` e não assume autoridade sobre permissões.
- `DERIVADO`: como `RNF04` é transversal de UI, a solução vive sobretudo em componentes React, CSS e checks textuais, sem criar persistência nova.
- Um heading semântico não é apenas texto grande. Um `h2` dentro de uma `section` com `aria-labelledby` permite saltar entre regiões da app e perceber o contexto atual.
- O foco visível mostra onde o teclado está. Sem esse sinal, o utilizador pode ativar o botão errado ou não perceber que já chegou ao campo pretendido.
- `StatusMessage` precisa de semântica porque mensagens de erro, sucesso e loading não devem depender apenas de cor. `role="alert"` ajuda erros a serem anunciados com prioridade; `role="status"` serve estados informativos.
- Contraste e legibilidade reduzem erro operacional. Numa app com dados financeiros, a leitura de valores, estados e mensagens deve ser clara antes de o utilizador submeter uma ação.
- A preferência de movimento reduzido evita animações ou deslocações inesperadas para quem configurou o sistema dessa forma.
- O smoke textual não prova acessibilidade completa, mas impede regressões óbvias: remover foco visível, headings ligados ou mensagens com semântica passa a falhar rapidamente.

#### Arquitetura do BK

- `real_dev/web/src/ui/opsaUi.tsx` concentra os contratos visuais transversais criados em `BK-MF5-01`.
- `PageFrame` liga cada página a um heading semântico e continua a ser reutilizado pelas páginas MF1-MF4.
- `StatusMessage` apresenta mensagens com `role`, `aria-live` e texto legível, preparando `BK-MF5-06`.
- `real_dev/web/src/styles.css` define foco visível, legibilidade, contraste e movimento reduzido.
- `real_dev/web/scripts/check-mf5-accessibility.mjs` valida os contratos textuais de `RNF04`.
- `real_dev/web/package.json` expõe `test:mf5:a11y`.
- `real_dev/web/src/App.tsx` e as páginas MF1-MF4 são revistos para confirmar que consomem `PageFrame` e `StatusMessage` após os BKs anteriores.

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/web/src/ui/opsaUi.tsx`
- EDITAR: `real_dev/web/src/styles.css`
- CRIAR: `real_dev/web/scripts/check-mf5-accessibility.mjs`
- EDITAR: `real_dev/web/package.json`
- REVER: `real_dev/web/src/App.tsx`
- REVER: `real_dev/web/src/pages/mf1Pages.tsx`
- REVER: `real_dev/web/src/pages/mf2Pages.tsx`
- REVER: `real_dev/web/src/pages/mf3Pages.tsx`
- REVER: `real_dev/web/src/pages/mf4Pages.tsx`
- REVER: `real_dev/web/src/lib/apiClient.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contratos anteriores de interface

1. Objetivo funcional do passo no contexto da app.

Confirmar que vais melhorar contratos já criados na MF5 em vez de criar uma segunda camada visual paralela.

`BK-MF5-01` entrega `PageFrame` e `StatusMessage`. `BK-MF5-03` faz as ações assíncronas usarem mensagens comuns. Este BK reforça a acessibilidade desses contratos.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/ui/opsaUi.tsx`
    - REVER: `real_dev/web/src/App.tsx`
    - REVER: `real_dev/web/src/pages/mf1Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf2Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf3Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf4Pages.tsx`
    - LOCALIZAÇÃO: imports de `PageFrame`, uso de `StatusMessage` e títulos de páginas.

3. Instruções do que fazer.

Verifica se `PageFrame` e `StatusMessage` existem em `real_dev/web/src/ui/opsaUi.tsx`. Depois confirma que as páginas MF1-MF4 usam `PageFrame` importado desse ficheiro. Se ainda houver funções locais `PageFrame`, termina primeiro a migração indicada por `BK-MF5-01`.

Confirma também que as mensagens de feedback criadas em `BK-MF5-03` usam `StatusMessage`, para que a melhoria semântica feita neste BK beneficie todos os módulos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é preparatório porque confirma contratos que vêm de BKs anteriores.

5. Explicação do código.

Não há código novo neste passo porque a decisão principal é de integração. Se este BK criasse outro componente de mensagem ou outra moldura de página, a MF5 passaria a ter dois padrões de interface. Isso dificultaria manutenção e faria o `BK-MF5-05` procurar mensagens e formulários em sítios diferentes. Confirmar os contratos antes de editar evita duplicação e protege a sequência dos BKs.

6. Validação do passo.

Executa estas pesquisas dentro de `real_dev/web` depois de aplicar `BK-MF5-01` e `BK-MF5-03`:

```bash
rg -n "export function PageFrame|export function StatusMessage" src/ui/opsaUi.tsx
rg -n "../ui/opsaUi" src/pages/mf1Pages.tsx src/pages/mf2Pages.tsx src/pages/mf3Pages.tsx src/pages/mf4Pages.tsx
rg -n "StatusMessage" src/App.tsx src/pages/mf3Pages.tsx src/pages/mf4Pages.tsx
```

As pesquisas devem devolver ocorrências nos ficheiros indicados.

7. Cenário negativo/erro esperado.

Se `src/ui/opsaUi.tsx` não existir, este BK deve parar e a equipa deve terminar `BK-MF5-01` antes de continuar. Se as páginas ainda tiverem `function PageFrame` local, a app pode ficar com títulos e classes divergentes.

### Passo 2 - Reforçar semântica de `PageFrame` e `StatusMessage`

1. Objetivo funcional do passo no contexto da app.

Garantir que a moldura de página e as mensagens comuns têm semântica acessível reutilizável.

Este passo liga cada página ao seu heading e faz as mensagens serem anunciadas com a prioridade certa.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/ui/opsaUi.tsx`
    - LOCALIZAÇÃO: exports `PageFrame`, `StatusMessage` e tipos relacionados.

3. Instruções do que fazer.

No ficheiro `real_dev/web/src/ui/opsaUi.tsx`, confirma ou substitui os exports abaixo. Mantém outros exports existentes, como `ActionToolbar` e `ModuleBadge`, porque vieram de `BK-MF5-01` e são usados por BKs seguintes.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/ui/opsaUi.tsx
import type { ReactNode } from "react";

export type StatusTone = "neutral" | "success" | "danger" | "warning";

export interface PageFrameProps {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
}

export interface StatusMessageProps {
  tone: StatusTone;
  title: string;
  children: ReactNode;
}

/**
 * Cria um identificador estável para ligar headings ao conteúdo.
 *
 * @param title - Título visível da página.
 * @returns Identificador seguro para usar em `id` e `aria-labelledby`.
 */
function toSafeHeadingId(title: string) {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized ? `page-${normalized}` : "page-heading";
}

/**
 * Moldura semântica para páginas operacionais OPSA.
 *
 * @param props - Título, descrição e conteúdo da página.
 * @returns Secção com heading ligado por `aria-labelledby`.
 */
export function PageFrame({ title, eyebrow, description, children }: PageFrameProps) {
  const headingId = toSafeHeadingId(title);

  return (
    <section className="panel pageFrame" aria-labelledby={headingId}>
      <header className="sectionHeader pageFrame__header">
        {eyebrow ? <p className="pageFrame__eyebrow">{eyebrow}</p> : null}
        {/* O id liga o h2 à secção para leitores de ecrã e navegação estrutural. */}
        <h2 id={headingId}>{title}</h2>
        {description ? <p className="pageFrame__description">{description}</p> : null}
      </header>

      <div className="pageFrame__body">{children}</div>
    </section>
  );
}

/**
 * Mensagem de estado comum para loading, sucesso, aviso e erro.
 *
 * @param props - Tom visual, título e conteúdo da mensagem.
 * @returns Bloco anunciado com prioridade adequada ao tipo de estado.
 */
export function StatusMessage({ tone, title, children }: StatusMessageProps) {
  const role = tone === "danger" ? "alert" : "status";
  const live = tone === "danger" ? "assertive" : "polite";

  return (
    <div className={`statusMessage statusMessage--${tone}`} role={role} aria-live={live}>
      {/* O título curto evita mensagens só por cor e ajuda a perceber o estado. */}
      <strong className="statusMessage__title">{title}</strong>
      <div className="statusMessage__body">{children}</div>
    </div>
  );
}
```

5. Explicação do código.

Este código reforça dois contratos centrais da MF5. `PageFrame` recebe um `title`, cria um `id` previsível e liga a `section` ao `h2` através de `aria-labelledby`. Assim, a página deixa de depender apenas de texto grande para comunicar estrutura. O aluno pode mudar o título visível, mas não deve remover a ligação entre `section`, `id` e `h2`, porque essa ligação é a evidência semântica de `RNF04`.

`StatusMessage` recebe um `tone`, um `title` e conteúdo. O tom `danger` usa `role="alert"` e `aria-live="assertive"` porque erros precisam de atenção imediata. Os outros tons usam `role="status"` e `aria-live="polite"` para comunicar progresso ou sucesso sem interromper a leitura. A mensagem tem sempre um título textual, evitando depender apenas de cor.

Este passo consome `PageFrame` e `StatusMessage` de `BK-MF5-01`, melhora as mensagens usadas em `BK-MF5-03` e prepara `BK-MF5-05`, onde erros de formulários precisam de foco e texto claro. Não altera chamadas HTTP, autenticação, permissões, empresa ativa ou regras financeiras.

6. Validação do passo.

Executa:

```bash
cd real_dev/web
npm run typecheck
rg -n "aria-labelledby|aria-live|role=\\{role\\}|statusMessage__title" src/ui/opsaUi.tsx
```

O typecheck deve passar e a pesquisa deve mostrar os contratos acessíveis no ficheiro.

7. Cenário negativo/erro esperado.

Remove temporariamente `aria-labelledby={headingId}` e repete a pesquisa. A ocorrência deve desaparecer, mostrando que a ligação semântica foi quebrada. Reverte a remoção antes de continuar.

### Passo 3 - Reforçar foco, contraste e legibilidade no CSS

1. Objetivo funcional do passo no contexto da app.

Tornar foco por teclado, texto, listas, mensagens e regiões de página mais fáceis de ler.

Este passo aplica regras visuais transversais sem mudar lógica de negócio.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/styles.css`
    - LOCALIZAÇÃO: fim do ficheiro, numa zona marcada como `MF5-04`.

3. Instruções do que fazer.

Copia o bloco abaixo para o fim de `real_dev/web/src/styles.css`. Se já existirem regras iguais, mantém apenas uma versão para evitar duplicação.

4. Código completo, correto e integrado com a app final.

```css
/* MF5-04 - acessibilidade base para navegação, leitura e mensagens. */
:root {
  --opsa-text-strong: #17201a;
  --opsa-focus-ring: #0f766e;
  --opsa-focus-ring-soft: rgba(15, 118, 110, 0.18);
  --opsa-danger-text: #991b1b;
  --opsa-success-text: #166534;
  --opsa-warning-text: #854d0e;
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible {
  /* O contorno espesso mostra onde o teclado está sem depender do rato. */
  outline: 3px solid var(--opsa-focus-ring);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px var(--opsa-focus-ring-soft);
}

.pageFrame {
  color: var(--opsa-text-strong);
}

.pageFrame__description,
p,
li,
label,
input,
select,
textarea {
  line-height: 1.55;
}

.statusMessage {
  border-left: 4px solid currentColor;
  color: var(--opsa-text-strong);
  line-height: 1.5;
  padding: 0.85rem 1rem;
}

.statusMessage--danger {
  color: var(--opsa-danger-text);
}

.statusMessage--success {
  color: var(--opsa-success-text);
}

.statusMessage--warning {
  color: var(--opsa-warning-text);
}

.statusMessage__title {
  display: block;
  margin-bottom: 0.25rem;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    /* Respeita a preferência do sistema e evita deslocações inesperadas. */
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    scroll-behavior: auto;
    transition-duration: 0.01ms;
  }
}
```

5. Explicação do código.

As variáveis em `:root` dão nomes claros às cores de texto, foco e estados. O foco usa `outline` e `box-shadow` para ser visível mesmo em botões pequenos ou campos de formulário. A regra inclui `[tabindex]` porque alguns elementos podem tornar-se focáveis para navegação assistida.

`line-height` melhora a leitura em parágrafos, listas, labels e campos. Isto reduz esforço visual quando o utilizador lê mensagens de erro ou confirma valores financeiros. `statusMessage` usa uma linha lateral e texto forte para não depender apenas de fundo colorido. Os tons de erro, sucesso e aviso mantêm semântica visual consistente para o `StatusMessage` do passo anterior.

A media query de movimento reduzido respeita a preferência do sistema e reduz animações ou transições bruscas. O bloco não toca em dados, permissões, autenticação ou chamadas à API; limita-se a tornar a interface mais legível e navegável.

6. Validação do passo.

Executa:

```bash
cd real_dev/web
rg -n ":focus-visible|prefers-reduced-motion|statusMessage__title|line-height" src/styles.css
npm run typecheck
```

Depois abre a app, usa a tecla Tab e confirma que botões, links e campos mostram foco visível.

7. Cenário negativo/erro esperado.

Remove temporariamente `button:focus-visible` e navega com Tab até um botão. O botão deixa de mostrar contorno forte. Reverte a remoção antes de avançar.

### Passo 4 - Criar smoke textual de acessibilidade

1. Objetivo funcional do passo no contexto da app.

Criar um comando rápido que falha se alguém remover os contratos mínimos de `RNF04`.

Este smoke não substitui validação manual, mas protege a app contra regressões óbvias.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/scripts/check-mf5-accessibility.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Mantém as mensagens de erro em português de Portugal para a evidence ficar clara durante a defesa.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual MF5 para contratos básicos de acessibilidade.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const opsaUi = readFileSync(new URL("../src/ui/opsaUi.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");

/**
 * Confirma que um contrato textual existe no ficheiro analisado.
 *
 * @param source - Conteúdo do ficheiro.
 * @param expected - Texto obrigatório para o contrato.
 * @param context - Descrição curta da regra validada.
 */
function assertIncludes(source, expected, context) {
  assert.ok(source.includes(expected), `${context} em falta: ${expected}`);
}

const uiContracts = [
  ["aria-labelledby", "PageFrame liga heading ao conteúdo"],
  ["aria-live", "StatusMessage anuncia alterações de estado"],
  ["role={role}", "StatusMessage escolhe status ou alert"],
  ["statusMessage__title", "Mensagens têm título textual"],
];

for (const [expected, context] of uiContracts) {
  // Cada assert protege um contrato de acessibilidade criado nos componentes comuns.
  assertIncludes(opsaUi, expected, context);
}

const styleContracts = [
  [":focus-visible", "Foco visível por teclado"],
  ["line-height", "Legibilidade do texto"],
  ["prefers-reduced-motion", "Preferência de movimento reduzido"],
  ["--opsa-text-strong", "Cor base de texto com contraste"],
];

for (const [expected, context] of styleContracts) {
  // O CSS é validado por texto para apanhar regressões simples antes do browser.
  assertIncludes(styles, expected, context);
}

assertIncludes(app, "PageFrame", "App usa a moldura comum");
assertIncludes(packageJson, "\"test:mf5:a11y\"", "Package expõe smoke de acessibilidade");

console.info("MF5 accessibility contract OK");
```

5. Explicação do código.

O script lê quatro ficheiros locais: `App.tsx`, `opsaUi.tsx`, `styles.css` e `package.json`. A função `assertIncludes` falha com uma mensagem clara se um contrato textual desaparecer. Isto permite detectar rapidamente remoções perigosas, como apagar `aria-labelledby`, tirar `aria-live`, remover `:focus-visible` ou esquecer o comando `test:mf5:a11y`.

Os arrays `uiContracts` e `styleContracts` agrupam regras por responsabilidade. Os contratos de UI vivem nos componentes React; os contratos visuais vivem no CSS. Esta separação evita misturar semântica com estilos e ajuda o aluno a encontrar o ficheiro certo quando o smoke falha.

O script confirma `PageFrame` em `App.tsx` porque a aplicação precisa de consumir a moldura comum para a melhoria chegar aos ecrãs reais. Também confirma o script no `package.json`, garantindo que a evidence pode ser reproduzida por qualquer elemento da equipa.

6. Validação do passo.

Depois de atualizares `package.json` no passo seguinte, executa:

```bash
cd real_dev/web
npm run test:mf5:a11y
```

O output esperado é:

```text
MF5 accessibility contract OK
```

7. Cenário negativo/erro esperado.

Remove temporariamente `aria-live` de `opsaUi.tsx` e executa o comando. O script deve falhar com mensagem sobre `StatusMessage anuncia alterações de estado`. Reverte a remoção antes de continuar.

### Passo 5 - Registar o comando no `package.json`

1. Objetivo funcional do passo no contexto da app.

Tornar o smoke de acessibilidade fácil de executar durante PR, revisão e defesa.

O comando fica junto dos smokes MF1, MF2, MF3 e MF5 já previstos.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/package.json`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Atualiza a secção `scripts` para incluir `test:mf5:a11y`. Mantém os scripts anteriores e o smoke `test:mf5:feedback` criado em `BK-MF5-03`.

4. Código completo, correto e integrado com a app final.

```json
{
  "name": "@opsa/web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Frontend MF0 da OPSA em React, Vite e TypeScript.",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "test:mf1": "node scripts/check-mf1-pages.mjs",
    "test:mf2": "node scripts/check-mf2-pages.mjs",
    "test:mf3": "node scripts/check-mf3-pages.mjs",
    "test:mf5:feedback": "node scripts/check-mf5-feedback.mjs",
    "test:mf5:a11y": "node scripts/check-mf5-accessibility.mjs",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.2",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "typescript": "^5.9.3",
    "vite": "^8.0.14"
  }
}
```

5. Explicação do código.

Este ficheiro define como a equipa executa tarefas do frontend. O novo comando `test:mf5:a11y` aponta diretamente para o smoke criado no passo anterior. Manter `test:mf5:feedback` é importante porque `BK-MF5-04` constrói sobre as mensagens comuns do `BK-MF5-03`; apagar esse comando quebraria a sequência da MF5.

A entrada do script é o comando `npm run test:mf5:a11y`. A saída esperada é uma mensagem curta de sucesso ou um erro com o contrato em falta. O aluno pode adaptar versões de dependências se o projeto tiver sido atualizado, mas não deve remover os scripts de validação sem substituir por comandos equivalentes e documentados.

6. Validação do passo.

Executa:

```bash
cd real_dev/web
npm run test:mf5:a11y
npm run typecheck
```

Os dois comandos devem terminar sem erro.

7. Cenário negativo/erro esperado.

Remove temporariamente a linha `"test:mf5:a11y"` e executa `npm run test:mf5:a11y`. O npm deve indicar que o script não existe. Reverte a remoção antes de fechar o BK.

### Passo 6 - Validar teclado, headings e legibilidade

1. Objetivo funcional do passo no contexto da app.

Confirmar que a melhoria técnica é observável por uma pessoa a usar a interface.

Este passo fecha `RNF04` com evidence manual e comandos locais.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/App.tsx`
    - REVER: `real_dev/web/src/pages/mf1Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf2Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf3Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf4Pages.tsx`
    - LOCALIZAÇÃO: ecrãs principais de vendas, compras, inventário, contabilidade, tesouraria, IA e tarefas.

3. Instruções do que fazer.

Abre a app e percorre os ecrãs principais com Tab. Em cada ecrã, confirma quatro pontos:

- existe um heading claro para a página;
- o foco é visível em botões, links e campos;
- mensagens de erro, sucesso e estado têm título textual;
- o texto é legível sem depender apenas da cor.

Regista evidence com uma captura ou descrição curta de pelo menos dois ecrãs: um formulário e uma listagem.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação manual e evidence.

5. Explicação do código.

Os passos anteriores criaram contratos em componentes, CSS e smoke textual. Este passo confirma que esses contratos chegam à experiência real. A validação por teclado mostra se o foco é utilizável. A validação de headings mostra se a página está organizada. A validação das mensagens mostra se erros e sucessos continuam compreensíveis sem depender apenas da cor.

Esta verificação não muda regras de domínio. Se uma operação falhar por permissões, dados inválidos ou empresa ativa, a decisão continua a vir do backend. O frontend apenas apresenta o estado de forma mais clara.

6. Validação do passo.

Executa:

```bash
cd real_dev/web
npm run test:mf1
npm run test:mf2
npm run test:mf3
npm run test:mf5:feedback
npm run test:mf5:a11y
npm run typecheck
```

Depois confirma manualmente navegação por Tab em pelo menos dois ecrãs.

7. Cenário negativo/erro esperado.

Se uma página tiver texto visualmente grande mas não tiver heading semântico, a navegação estrutural fica fraca. Corrige usando `PageFrame` em vez de criar uma moldura local.

#### Critérios de aceite

- `RNF04` fica coberto por semântica de headings, foco visível, legibilidade, mensagens acessíveis e smoke textual.
- `PageFrame` usa `aria-labelledby` para ligar a secção ao heading.
- `StatusMessage` usa `role`, `aria-live` e título textual.
- O CSS inclui `:focus-visible`, `line-height`, cores fortes de texto e `prefers-reduced-motion`.
- `package.json` expõe `test:mf5:a11y`.
- O smoke `npm run test:mf5:a11y` imprime `MF5 accessibility contract OK`.
- O typecheck passa depois das alterações.
- O aluno consegue validar teclado, headings e mensagens sem criar componentes paralelos.
- Nenhuma regra de negócio passa a ser decidida apenas no frontend.

#### Validação final

Executar em `real_dev/web`:

```bash
npm run test:mf1
npm run test:mf2
npm run test:mf3
npm run test:mf5:feedback
npm run test:mf5:a11y
npm run typecheck
```

Validar manualmente:

- navegar com Tab por um formulário;
- navegar com Tab por uma listagem;
- confirmar foco visível em botões e campos;
- confirmar heading visível e semântico em cada página testada;
- confirmar que erro, sucesso e estado aparecem com texto legível.

Resultado esperado:

- todos os comandos terminam sem erro;
- o foco é visível;
- a página mantém estrutura por headings;
- as mensagens não dependem apenas de cor;
- a app continua a usar cookies HttpOnly via `credentials: "include"` no cliente HTTP.

#### Evidence para PR/defesa

- Output de `npm run test:mf5:a11y`.
- Output de `npm run typecheck`.
- Output dos smokes MF1, MF2, MF3 e MF5 feedback.
- Captura ou descrição curta de navegação por teclado num formulário.
- Captura ou descrição curta de navegação por teclado numa listagem.
- Lista de ficheiros alterados: `opsaUi.tsx`, `styles.css`, `check-mf5-accessibility.mjs`, `package.json`.
- Fonte canónica: `RNF04` em `docs/RNF.md`.

#### Handoff

- Próximo BK: `BK-MF5-05`.
- `BK-MF5-05` deve preservar `PageFrame` e `StatusMessage` em vez de criar mensagens ou molduras paralelas.
- Os erros de validação de formulários devem aparecer dentro de `StatusMessage`.
- O foco visível criado neste BK deve ajudar o utilizador a corrigir campos inválidos no próximo BK.
- O smoke `test:mf5:a11y` deve continuar a passar depois de adicionar validações frontend.
- Se o próximo BK alterar `package.json`, deve manter `test:mf5:feedback` e `test:mf5:a11y`.

#### Changelog

- `2026-06-20`: guia corrigido para 6 passos, com dependências técnicas derivadas, contratos acessíveis de `PageFrame`/`StatusMessage`, CSS reforçado, smoke MF5 de acessibilidade, validação manual e handoff para `BK-MF5-05`.
- `2026-06-18`: documenta foco visível, legibilidade e smoke textual de acessibilidade alinhado com os componentes MF5.
- `2026-04-17`: guia migrado para naming com slug e template pedagógico-operacional inicial.
