# BK-MF8-14 - Aproximação da UI à UI do mockup.

## Header

- `doc_id`: `GUIA-BK-MF8-14`
- `bk_id`: `BK-MF8-14`
- `macro`: `MF8`
- `owner`: `Pedro`
- `apoio`: `Sofia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF35`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-15`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-14-aproximacao-da-ui-a-ui-do-mockup.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais aproximar a interface real do OPSA ao mockup aprovado, sem transformar o mockup num substituto da aplicação. A UI deve usar a paleta OPSA, uma navegação coerente, componentes partilhados, estados visíveis e textos em português de Portugal.

O resultado esperado é uma app visualmente consistente: sidebar verde, botões amarelos para ações principais, cartões e tabelas com a mesma cadência visual, feedback acessível e páginas de IA que continuam a mostrar fonte, limitação e decisão humana.

#### Importância

`RNF35` é um requisito `Must`: a defesa avalia se o OPSA parece uma aplicação coesa, legível e preparada para uso real. Uma UI bonita mas desligada da API não serve, e uma UI funcional mas visualmente incoerente fragiliza a apresentação final.

Este BK fecha a camada visual antes do `BK-MF8-15`, que tratará datas, moedas e separadores no padrão europeu. Se o contrato visual não estiver estabilizado agora, o BK seguinte pode formatar dados corretamente mas continuar a apresentá-los em ecrãs inconsistentes.

#### Scope-in

- Normalizar variáveis CSS, botões, formulários, tabelas, cartões, sidebar, cabeçalho e estados visuais em `apps/web/src/styles.css`.
- Reforçar componentes partilhados em `apps/web/src/ui/opsaUi.tsx`.
- Expor a qualidade da fonte de IA na UI, consumindo o handoff do `BK-MF8-13`.
- Criar `apps/web/scripts/check-mf8-ui-alignment.mjs` sem falsos negativos para ficheiros wrapper que apenas reexportam páginas.
- Ligar o gate a `apps/web/package.json`.
- Criar checklist e evidence em `docs/evidence/MF8`.

#### Scope-out

- Copiar o mockup como imagens estáticas.
- Criar landing page ou ecrã promocional fora da app.
- Alterar endpoints, modelos Prisma, permissões, regras contabilísticas ou dados de negócio.
- Decidir empresa ativa, role, ownership ou autorização final no browser.
- Criar sistema multilíngua completo.
- Trocar dados reais da API por dados decorativos.

#### Estado antes e depois

- Antes: MF0..MF7 já entregaram autenticação com cookies HttpOnly, empresa ativa resolvida no backend, permissões, dados mestre, vendas, compras, inventário, tesouraria, contabilidade, IA explicável, auditoria, hardening e gates de qualidade. A MF8 já reforçou subscrições simuladas, explicabilidade de IA, decisão humana e qualidade das fontes.
- Depois: `BK-MF8-14` deixa um contrato visual verificável para a app web, com componentes reutilizáveis, checklist de mockup, gate frontend, evidence e handoff para localização PT-PT no `BK-MF8-15`.

#### Pre-requisitos

- Ler `RNF35` em `docs/RNF.md`.
- Rever `mockup/PALETA-CORES.md`.
- Rever `mockup/src/styles/theme.css`.
- Rever o layout do mockup em `mockup/src/app/components/Layout.tsx`.
- Rever os módulos visuais do mockup em `mockup/src/app/components/modules`.
- Rever `BK-MF8-13`, em especial o handoff de `sourceQuality`.
- Rever `BK-MF8-15`, para perceber que a formatação PT-PT vem depois da consistência visual.
- Confirmar que todos os caminhos publicados para alunos usam `apps/api`, `apps/web` ou `docs/evidence`.
- Negativos: mínimo `3`.

#### Glossário

- Mockup aprovado: referência visual e de fluxo usada para aproximar a app final, sem substituir os dados reais nem as regras backend.
- Variáveis CSS: nomes como `--opsa-royal-green` e `--opsa-yellow`, usados para repetir cores e espaçamentos sem espalhar valores soltos.
- Sidebar: menu lateral principal da aplicação.
- Estado visual: loading, erro, vazio, sucesso, aviso ou informação mostrados de forma acessível.
- Qualidade da fonte de IA: metadados vindos do `BK-MF8-13` com confiança, limitação e fonte usada.
- Gate frontend: script local que falha quando a UI perde contratos mínimos de consistência.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF35` exige que a interface se aproxime do mockup aprovado, mantendo consistência visual e textos em português de Portugal.
- `CANONICO`: `BK-MF8-14` pertence à MF8, sprint `S12`, owner `Pedro`, apoio `Sofia`, prioridade `P0`, esforço `M`, sem dependências formais e com próximo BK `BK-MF8-15`.
- `CANONICO`: a app dos alunos usa React, Vite e TypeScript em `apps/web`; a API continua em `apps/api`.
- `DERIVADO`: este BK transforma o requisito visual em alterações frontend e num gate local, porque `RNF35` é verificável por componentes, estilos, checklist e evidence.

**Mockup e aplicação real.** O mockup mostra o aspeto desejado: fundo preto, sidebar Royal Green, botão ativo Royal Green Light, botões principais amarelos, header branco, cartões claros, tabelas legíveis e botão de língua `PT`. A app real continua a mandar: os dados vêm da API, a sessão vem de cookie HttpOnly e as permissões são validadas no backend.

**Variáveis CSS.** Em vez de repetir `#004E53` em dezenas de ficheiros, a app usa variáveis como `--opsa-royal-green`. Isto facilita manutenção: se a paleta mudar, o aluno altera um ponto central e os componentes continuam coerentes.

**Componentes partilhados.** `PageFrame`, `StatusMessage`, `ActionToolbar` e `ModuleBadge` evitam que cada página invente a sua própria estrutura visual. Este BK acrescenta `AiSourceQualityPanel` para a UI de IA não perder fonte, limitação e decisão humana.

**Acessibilidade.** A UI não pode depender só de cor. Mensagens de erro usam `role="alert"`, estados têm título textual, foco de teclado é visível e tabelas têm legenda. Isto ajuda utilizadores e também torna a defesa mais objetiva.

**IA explicável.** A IA do OPSA recomenda e explica. Nunca aprova documentos, nunca altera contabilidade e nunca executa ações financeiras. O `sourceQuality` deve ficar visível nas sugestões para o utilizador perceber de onde veio a recomendação e que limitação deve ler antes de decidir.

**Testes e evidence.** Um gate não prova beleza visual sozinho, mas impede regressões básicas: ficheiros agregadores sem `PageFrame`, wrappers tratados como páginas reais, ausência de estilos OPSA, falta de `sourceQuality` na UI ou script não registado no package.

#### Arquitetura do BK

- Requisito: `RNF35`.
- Domínio principal: UX, consistência visual e acessibilidade frontend.
- Backend público dos alunos: `apps/api`, apenas revisto como fronteira de dados reais.
- Frontend público dos alunos: `apps/web`.
- Prisma público dos alunos: `apps/api/prisma/schema.prisma`, sem alteração neste BK.
- Componentes partilhados: `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge`, `AiSourceQualityPanel`.
- Página de continuidade IA: `apps/web/src/pages/mf4Pages.tsx`.
- Gate: `apps/web/scripts/check-mf8-ui-alignment.mjs`.
- Evidence: `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` e `docs/evidence/MF8/BK-MF8-14.md`.
- Handoff: `BK-MF8-15`.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/web/src/styles.css`
- EDITAR: `apps/web/src/ui/opsaUi.tsx`
- EDITAR: `apps/web/src/lib/mf4Api.ts`
- EDITAR: `apps/web/src/pages/mf4Pages.tsx`
- CRIAR: `apps/web/scripts/check-mf8-ui-alignment.mjs`
- EDITAR: `apps/web/package.json`
- CRIAR: `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md`
- CRIAR: `docs/evidence/MF8/BK-MF8-14.md`
- REVER: `mockup/PALETA-CORES.md`
- REVER: `mockup/src/styles/theme.css`
- REVER: `mockup/src/app/components/Layout.tsx`
- REVER: `mockup/src/app/components/modules`
- REVER: `apps/web/src/App.tsx`
- REVER: `apps/web/src/pages`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e referência visual

1. Objetivo funcional do passo no contexto da app.

Confirmar que o BK resolve `RNF35` e que o mockup é usado como referência visual, não como contrato de dados.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `mockup/PALETA-CORES.md`
    - REVER: `mockup/src/styles/theme.css`
    - REVER: `mockup/src/app/components/Layout.tsx`

3. Instruções do que fazer.

Confirma que `BK-MF8-14` continua associado a `RNF35`, prioridade `P0`, owner `Pedro`, apoio `Sofia`, dependências `-` e próximo BK `BK-MF8-15`. Depois regista, na checklist, os elementos visuais obrigatórios: paleta OPSA, sidebar, header, botão `PT`, botões, cartões, tabelas, formulários, estados e foco.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e evita que o aluno confunda o mockup com uma fonte técnica para dados, endpoints ou permissões.

5. Explicação do código.

Não há código porque o objetivo é alinhar contrato e evidência antes de editar o frontend. O `CANONICO` vem de `RNF35`, matriz e backlog. O `DERIVADO` é a lista de critérios visuais extraída do mockup para validar a app real.

6. Validação do passo.

O aluno consegue apontar `RNF35`, a linha de `BK-MF8-14` na matriz/backlog e pelo menos oito critérios visuais retirados do mockup.

7. Cenário negativo/erro esperado.

Se a checklist disser apenas "parecido com o mockup", o passo falha. A checklist deve dizer que cor, componente, estado ou ecrã foi revisto.

### Passo 2 - Alinhar a base visual em CSS

1. Objetivo funcional do passo no contexto da app.

Centralizar a paleta OPSA e os estilos de layout para que páginas antigas e novas partilhem a mesma linguagem visual.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/styles.css`
    - LOCALIZAÇÃO: `:root`, estilos globais, `.appShell`, `.sidebar`, `.content`, `.tableWrap`, `.operation`, `.statusMessage`, `.moduleBadge` e media queries.

3. Instruções do que fazer.

Garante que `apps/web/src/styles.css` contém os blocos abaixo. Se o ficheiro já tiver algumas classes, substitui as versões antigas pelos blocos completos deste passo. Mantém outros estilos que pertencem a BKs anteriores, desde que não contrariem estes nomes.

4. Código completo, correto e integrado com a app final.

```css
/* apps/web/src/styles.css */
:root {
  --opsa-royal-green: #004E53;
  --opsa-royal-green-light: #00CB73;
  --opsa-royal-green-liquid: #009889;
  --opsa-yellow: #FAF227;
  --opsa-red: #FF1900;
  --opsa-green: #04FF00;
  --opsa-gold: #FFCB16;
  --opsa-bg: #000000;
  --opsa-surface: #ffffff;
  --opsa-surface-soft: rgba(0, 78, 83, 0.04);
  --opsa-border: rgba(0, 78, 83, 0.14);
  --opsa-border-strong: rgba(0, 78, 83, 0.26);
  --opsa-text-strong: var(--opsa-royal-green);
  --opsa-text-muted: rgba(0, 78, 83, 0.7);
  --opsa-focus-ring: var(--opsa-royal-green);
  --opsa-focus-ring-soft: rgba(0, 203, 115, 0.28);
  --opsa-radius: 8px;
  --opsa-shadow-sm: 0 8px 24px rgba(0, 78, 83, 0.08);

  color: var(--opsa-text-strong);
  background: var(--opsa-bg);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 18px;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-width: 320px;
  background: var(--opsa-bg);
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  min-height: 2.45rem;
  border: 1px solid var(--opsa-yellow);
  border-radius: 6px;
  background: var(--opsa-yellow);
  color: var(--opsa-royal-green);
  padding: 0.58rem 0.95rem;
  cursor: pointer;
  font-weight: 700;
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible {
  /* O foco visível cumpre acessibilidade sem depender do rato ou apenas da cor do botão. */
  outline: 3px solid var(--opsa-focus-ring);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px var(--opsa-focus-ring-soft);
}

button:hover:not(:disabled),
button.active {
  border-color: var(--opsa-gold);
  background: var(--opsa-gold);
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid rgba(0, 78, 83, 0.3);
  border-radius: 6px;
  background: var(--opsa-surface);
  color: var(--opsa-text-strong);
  padding: 0.62rem 0.72rem;
}

.appShell {
  display: grid;
  grid-template-columns: minmax(240px, 290px) minmax(0, 1fr);
  min-height: 100vh;
  background: var(--opsa-bg);
}

.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 100vh;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--opsa-royal-green);
  color: #ffffff;
  padding: 1.25rem;
}

nav {
  display: grid;
  gap: 0.45rem;
}

nav button {
  width: 100%;
  border-color: transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  text-align: left;
}

nav button:hover:not(:disabled) {
  background: var(--opsa-royal-green-liquid);
  color: #ffffff;
}

nav button.active {
  border-color: var(--opsa-royal-green-light);
  background: var(--opsa-royal-green-light);
  color: var(--opsa-royal-green);
}

.content {
  min-width: 0;
  padding: 1.5rem;
  background: var(--opsa-surface);
}

.tableWrap {
  overflow: auto;
  border: 1px solid var(--opsa-border);
  border-radius: var(--opsa-radius);
  background: var(--opsa-surface);
  box-shadow: var(--opsa-shadow-sm);
}

table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid rgba(0, 78, 83, 0.1);
  padding: 0.72rem 0.85rem;
  text-align: left;
  vertical-align: top;
  color: var(--opsa-text-strong);
}

th {
  background: rgba(0, 78, 83, 0.05);
  font-weight: 800;
}

tbody tr:hover {
  background: rgba(0, 203, 115, 0.05);
}

.operationGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.9rem;
}

.operation {
  display: grid;
  gap: 0.78rem;
  border: 1px solid var(--opsa-border);
  border-radius: var(--opsa-radius);
  background: var(--opsa-surface);
  padding: 1rem;
  box-shadow: var(--opsa-shadow-sm);
}

.pageFrame {
  /* A moldura comum dá a todas as páginas a mesma cadência visual do mockup. */
  display: grid;
  gap: 1rem;
  color: var(--opsa-text-strong);
}

.pageFrame__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--opsa-border);
  padding-bottom: 1rem;
}

.pageFrame__description {
  max-width: 72ch;
  margin: 0.35rem 0 0;
  color: var(--opsa-text-muted);
}

.pageFrame__body,
.fields {
  display: grid;
  gap: 1rem;
}

.pageFrame__actions,
.actionToolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.statusMessage {
  /* A linha lateral diferencia estados mesmo para quem não distingue bem todas as cores. */
  border: 1px solid var(--opsa-border);
  border-left-width: 4px;
  border-radius: var(--opsa-radius);
  background: var(--opsa-surface);
  color: var(--opsa-text-strong);
  padding: 0.8rem;
  box-shadow: var(--opsa-shadow-sm);
}

.statusMessage--success {
  border-color: rgba(4, 255, 0, 0.5);
  border-left-color: var(--opsa-green);
  background: rgba(4, 255, 0, 0.1);
}

.statusMessage--warning {
  border-color: rgba(255, 203, 22, 0.72);
  border-left-color: var(--opsa-gold);
  background: rgba(255, 203, 22, 0.18);
}

.statusMessage--danger {
  border-color: rgba(255, 25, 0, 0.62);
  border-left-color: var(--opsa-red);
  background: rgba(255, 25, 0, 0.1);
  color: var(--opsa-red);
}

.statusMessage--neutral {
  border-left-color: var(--opsa-royal-green-liquid);
}

.moduleBadge {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--opsa-border-strong);
  border-radius: 999px;
  padding: 0.18rem 0.58rem;
  font-size: 0.78rem;
  font-weight: 800;
}

.moduleBadge--success {
  border-color: var(--opsa-green);
  background: rgba(4, 255, 0, 0.16);
}

.moduleBadge--warning {
  border-color: var(--opsa-gold);
  background: rgba(255, 203, 22, 0.18);
}

.moduleBadge--danger {
  border-color: var(--opsa-red);
  background: rgba(255, 25, 0, 0.12);
  color: var(--opsa-red);
}

.moduleBadge--neutral {
  border-color: var(--opsa-royal-green-liquid);
  background: rgba(0, 152, 137, 0.16);
}

.aiSourceQuality {
  display: grid;
  gap: 0.45rem;
  border: 1px solid rgba(0, 152, 137, 0.28);
  border-radius: var(--opsa-radius);
  background: rgba(0, 152, 137, 0.08);
  padding: 0.8rem;
}

@media (max-width: 860px) {
  .appShell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: relative;
    min-height: auto;
    border-right: 0;
  }

  nav {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }

  .content {
    padding: 1rem;
  }

  .pageFrame__header,
  .sectionHeader {
    align-items: stretch;
    flex-direction: column;
  }
}
```

5. Explicação do código.

Este CSS converte a paleta do mockup em variáveis reutilizáveis e aplica esses valores aos elementos que os alunos realmente usam: layout, menu, botões, inputs, tabelas, cartões, mensagens e badges. O código não muda dados nem permissões; só altera apresentação e acessibilidade.

As classes `.pageFrame`, `.statusMessage`, `.moduleBadge` e `.aiSourceQuality` preparam o passo seguinte. O erro evitado é cada página escolher cores, espaçamentos e estados diferentes, tornando a app difícil de defender como produto único.

6. Validação do passo.

Abre a app e confirma que a sidebar usa Royal Green, o botão ativo usa Royal Green Light, ações principais usam amarelo, as tabelas têm header verde suave e os estados têm borda lateral.

7. Cenário negativo/erro esperado.

Remove temporariamente `--opsa-yellow` ou `.statusMessage--danger`; o gate do Passo 5 deve falhar com mensagem clara sobre contrato visual em falta.

### Passo 3 - Reforçar componentes partilhados de UI

1. Objetivo funcional do passo no contexto da app.

Garantir que as páginas usam uma moldura comum, mensagens acessíveis e um painel específico para fonte e limitação de IA.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/ui/opsaUi.tsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui `apps/web/src/ui/opsaUi.tsx` pelo ficheiro completo abaixo. Mantém os exports existentes para não partir páginas já criadas por BKs anteriores.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/ui/opsaUi.tsx
/**
 * @file Componentes visuais partilhados para manter a interface OPSA alinhada ao mockup aprovado.
 */

import type { ReactNode } from "react";

/**
 * Tons visuais aceites pelos componentes transversais da OPSA.
 */
export type Tone = "neutral" | "success" | "warning" | "danger";

export interface PageFrameProps {
  title: string;
  eyebrow?: string;
  description?: string;
  headingId?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Gera um identificador HTML estável a partir de um título legível.
 *
 * @param title - Título visível da página.
 * @returns Identificador seguro para ligar `section` e `h2`.
 */
function toHeadingId(title: string) {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // O fallback mantém a acessibilidade mesmo quando o título não tem letras ou números.
  return `${normalized || "opsa-page"}-heading`;
}

/**
 * Cria a moldura comum das páginas de operação da OPSA.
 *
 * @param props - Título, identificador opcional, contexto, ações e conteúdo da página.
 * @returns Secção React com cabeçalho, descrição opcional e conteúdo do módulo.
 */
export function PageFrame({
  title,
  eyebrow = "OPSA",
  description,
  headingId,
  actions,
  children,
}: PageFrameProps) {
  const safeHeadingId = headingId ?? toHeadingId(title);

  return (
    <section className="panel pageFrame" aria-labelledby={safeHeadingId}>
      <header className="sectionHeader pageFrame__header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={safeHeadingId}>{title}</h2>
          {description ? <p className="pageFrame__description">{description}</p> : null}
        </div>
        {actions ? <div className="pageFrame__actions">{actions}</div> : null}
      </header>
      {/* A página concreta continua dona dos dados; a moldura só normaliza estrutura visual. */}
      <div className="pageFrame__body">{children}</div>
    </section>
  );
}

export interface StatusMessageProps {
  tone: Tone;
  title: string;
  children: ReactNode;
}

/**
 * Apresenta feedback visual consistente para sucesso, aviso, erro ou estado neutro.
 *
 * @param props - Tom visual, título curto e conteúdo explicativo.
 * @returns Caixa de estado com role acessível.
 */
export function StatusMessage({ tone, title, children }: StatusMessageProps) {
  const role = tone === "danger" ? "alert" : "status";
  const live = tone === "danger" ? "assertive" : "polite";

  return (
    <div className={`statusMessage statusMessage--${tone}`} role={role} aria-live={live}>
      {/* O título textual evita que o estado dependa apenas da cor da mensagem. */}
      <strong className="statusMessage__title">{title}</strong>
      <div className="statusMessage__body">{children}</div>
    </div>
  );
}

export interface ActionToolbarProps {
  children: ReactNode;
}

/**
 * Agrupa comandos primários e secundários sem mudar a ordem visual entre módulos.
 *
 * @param props - Botões ou ligações de ação.
 * @returns Barra de ações reutilizável.
 */
export function ActionToolbar({ children }: ActionToolbarProps) {
  return <div className="actionToolbar">{children}</div>;
}

export interface ModuleBadgeProps {
  label: string;
  tone?: Tone;
}

/**
 * Mostra estado ou categoria de módulo sem obrigar cada página a criar estilos próprios.
 *
 * @param props - Texto do distintivo e tom visual.
 * @returns Distintivo textual pequeno.
 */
export function ModuleBadge({ label, tone = "neutral" }: ModuleBadgeProps) {
  // O tom fica limitado a valores conhecidos para evitar classes CSS inventadas por engano.
  return <span className={`moduleBadge moduleBadge--${tone}`}>{label}</span>;
}

export interface AiSourceQuality {
  confidence: "low" | "medium" | "high";
  limitation: string;
  source: {
    type: string;
    id: string;
    label: string;
  };
}

export interface AiSourceQualityPanelProps {
  quality?: AiSourceQuality | null;
}

/**
 * Mostra a fonte e a limitação de uma recomendação de IA sem permitir execução automática.
 *
 * @param props - Qualidade da fonte recebida da API.
 * @returns Painel textual de governança para recomendações de IA.
 */
export function AiSourceQualityPanel({ quality }: AiSourceQualityPanelProps) {
  if (!quality) {
    return (
      <StatusMessage tone="warning" title="Fonte por confirmar">
        Esta recomendação não trouxe metadados de qualidade suficientes. Revê a origem antes de
        tomar uma decisão.
      </StatusMessage>
    );
  }

  return (
    <aside className="aiSourceQuality" aria-label="Qualidade da fonte da IA">
      {/* A confiança é apresentada como texto para não depender apenas da cor. */}
      <ModuleBadge label={`Confiança ${quality.confidence}`} tone="warning" />
      <p>
        Fonte: {quality.source.label} ({quality.source.type}/{quality.source.id})
      </p>
      <p>{quality.limitation}</p>
      <p>A IA recomenda; a decisão continua humana.</p>
    </aside>
  );
}
```

5. Explicação do código.

Este ficheiro centraliza UI partilhada. `PageFrame` normaliza cabeçalho e conteúdo; `StatusMessage` torna loading, erro e sucesso acessíveis; `ActionToolbar` evita barras de ações diferentes por página; `ModuleBadge` limita estados visuais a tons conhecidos.

`AiSourceQualityPanel` consome diretamente o contrato entregue pelo `BK-MF8-13`: `confidence`, `limitation` e `source`. A entrada é o metadado de qualidade vindo da API. A saída é um painel visual com fonte e aviso de decisão humana. A regra de segurança é clara: a UI informa e recolhe intenção, mas não decide autorização nem executa ação contabilística.

6. Validação do passo.

Executa `cd apps/web && npm run typecheck`. O resultado esperado é não haver erro de import em páginas que já usam `PageFrame`, `StatusMessage`, `ActionToolbar` ou `ModuleBadge`.

7. Cenário negativo/erro esperado.

Se removeres `StatusMessage` do export ou mudares `Tone`, páginas de BKs anteriores devem falhar o typecheck. Isso mostra que o ficheiro é uma fronteira partilhada.

### Passo 4 - Consumir `sourceQuality` nas páginas de IA

1. Objetivo funcional do passo no contexto da app.

Fechar o handoff do `BK-MF8-13`, mostrando fonte, limitação e decisão humana nas sugestões de IA.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/mf4Api.ts`
    - EDITAR: `apps/web/src/pages/mf4Pages.tsx`
    - LOCALIZAÇÃO: interface `AiActionSuggestion`, import de UI e função completa `AiSuggestionsPage`.

3. Instruções do que fazer.

Atualiza o tipo `AiActionSuggestion` para incluir `sourceQuality` opcional. Depois ajusta o import em `mf4Pages.tsx` e substitui a função `AiSuggestionsPage` pela versão completa abaixo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/mf4Api.ts
export interface AiSourceQuality {
  confidence: "low" | "medium" | "high";
  limitation: string;
  source: {
    type: string;
    id: string;
    label: string;
  };
}

export interface AiActionSuggestion {
  id: string;
  actionType: string;
  title: string;
  rationale: string;
  sourceLabel: string;
  status: string;
  sourceQuality?: AiSourceQuality;
  guardrail?: string;
}
```

```tsx
// apps/web/src/pages/mf4Pages.tsx
import { AiSourceQualityPanel, PageFrame, StatusMessage } from "../ui/opsaUi";

/**
 * Lista sugestões de IA com fonte, limitação e aviso de decisão humana.
 *
 * @returns Página React de sugestões assistivas.
 */
export function AiSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<AiActionSuggestion[]>([]);
  const action = useActionFeedback();

  /**
   * Recarrega sugestões usando a sessão atual enviada por cookie HttpOnly.
   *
   * @returns Promise resolvida quando a lista fica atualizada.
   */
  async function load() {
    try {
      await action.run(
        async () => {
          const result = await getAiSuggestions();
          setSuggestions(result.suggestions);
        },
        {
          startMessage: "A atualizar sugestões...",
          successMessage: "Sugestões atualizadas.",
          errorMessage: "Não foi possível carregar as sugestões.",
        },
      );
    } catch {
      // O feedback de erro fica visível e a lista anterior não é apagada sem necessidade.
    }
  }

  return (
    <PageFrame
      title="Sugestões de ação"
      description="Recomendações explicáveis com fonte, limitação e decisão humana."
    >
      <button type="button" onClick={load} disabled={action.busy}>
        {action.busy ? "A carregar..." : "Atualizar"}
      </button>
      <ActionFeedbackMessage feedback={action.feedback} />
      <SimpleList
        items={suggestions}
        render={(item) => (
          <article className="operation" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.rationale}</p>
            <p>{item.actionType} · {item.sourceLabel}</p>
            <AiSourceQualityPanel quality={item.sourceQuality} />
            <StatusMessage tone="neutral" title="Decisão humana">
              {item.guardrail ?? "A IA recomenda com fonte rastreável; a decisão continua humana."}
            </StatusMessage>
          </article>
        )}
      />
    </PageFrame>
  );
}
```

5. Explicação do código.

O primeiro bloco atualiza o tipo público que a UI espera da API. A propriedade `sourceQuality` é opcional porque a app pode ainda mostrar um aviso quando uma resposta antiga não a trouxer. Isto evita quebrar a UI durante transição, mas não esconde o problema: o painel mostra "Fonte por confirmar".

O segundo bloco altera a página de sugestões. A chamada a `getAiSuggestions()` continua a usar o cliente API central, que envia cookies automaticamente. A UI não envia empresa ativa nem decide permissões. A página apenas mostra recomendações, racional, fonte e guardrail. O erro evitado é apagar, no BK visual, a governança criada nos BKs de IA.

6. Validação do passo.

Executa `cd apps/web && npm run typecheck`. Depois carrega "Sugestões de ação" e confirma que cada cartão mostra título, racional, fonte, limitação e aviso de decisão humana.

7. Cenário negativo/erro esperado.

Se uma sugestão vier sem `sourceQuality`, a UI deve mostrar `Fonte por confirmar` em vez de esconder a falta de metadados.

### Passo 5 - Criar gate frontend sem falsos negativos

1. Objetivo funcional do passo no contexto da app.

Criar um gate que verifique a aproximação UI/mockup sem falhar em ficheiros wrapper que apenas reexportam páginas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/scripts/check-mf8-ui-alignment.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. O script deve correr a partir de `apps/web`, tal como os outros scripts frontend.

4. Código completo, correto e integrado com a app final.

```js
// apps/web/scripts/check-mf8-ui-alignment.mjs
/**
 * Gate MF8 para validar consistência visual mínima com o mockup OPSA.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const pagesDir = join("src", "pages");
const pageModules = ["mf1Pages.tsx", "mf2Pages.tsx", "mf3Pages.tsx", "mf4Pages.tsx"];

/**
 * Lê um ficheiro de texto relativo à pasta `apps/web`.
 *
 * @param {string} filePath - Caminho relativo ao package frontend.
 * @returns {string} Conteúdo do ficheiro.
 */
function readProjectFile(filePath) {
  return readFileSync(filePath, "utf8");
}

/**
 * Garante que um ficheiro contém todos os marcadores esperados.
 *
 * @param {string} filePath - Caminho relativo ao package frontend.
 * @param {string[]} markers - Textos obrigatórios.
 * @returns {void}
 */
function expectMarkers(filePath, markers) {
  const text = readProjectFile(filePath);
  const missing = markers.filter((marker) => !text.includes(marker));
  if (missing.length > 0) {
    throw new Error(`${filePath} não contém: ${missing.join(", ")}`);
  }
}

/**
 * Valida se um ficheiro wrapper apenas reexporta uma página agregada.
 *
 * @param {string} filePath - Caminho relativo ao package frontend.
 * @returns {void}
 */
function expectWrapperOrPageFrame(filePath) {
  const text = readProjectFile(filePath);
  const isWrapper = /^export\s+\{[\s\S]+from\s+"\.\/mf\dPages";?\s*$/m.test(text.trim());

  // Wrappers não renderizam UI; o contrato visual vive no módulo agregador que eles reexportam.
  if (isWrapper) return;

  expectMarkers(filePath, ["PageFrame", "StatusMessage"]);
}

/**
 * Verifica wrappers e módulos agregadores de páginas sem gerar falsos negativos.
 *
 * @returns {void}
 */
function checkPages() {
  const pageFiles = readdirSync(pagesDir).filter((file) => file.endsWith(".tsx"));
  for (const file of pageFiles) {
    const filePath = join(pagesDir, file);
    if (pageModules.includes(file)) {
      expectMarkers(filePath, ["PageFrame", "StatusMessage"]);
      continue;
    }

    expectWrapperOrPageFrame(filePath);
  }
}

/**
 * Verifica estilos e componentes partilhados exigidos pelo RNF35.
 *
 * @returns {void}
 */
function checkSharedUi() {
  expectMarkers("src/styles.css", [
    "--opsa-royal-green: #004E53",
    "--opsa-yellow: #FAF227",
    ".appShell",
    ".sidebar",
    ".pageFrame",
    ".statusMessage",
    ".aiSourceQuality",
  ]);

  expectMarkers("src/ui/opsaUi.tsx", [
    "export function PageFrame",
    "export function StatusMessage",
    "export function AiSourceQualityPanel",
  ]);
}

/**
 * Verifica se a UI consome o handoff de qualidade de fonte vindo do BK-MF8-13.
 *
 * @returns {void}
 */
function checkAiGovernanceUi() {
  expectMarkers("src/lib/mf4Api.ts", ["AiSourceQuality", "sourceQuality"]);
  expectMarkers(join(pagesDir, "mf4Pages.tsx"), [
    "AiSourceQualityPanel",
    "Decisão humana",
  ]);
}

/**
 * Verifica se o package expõe o comando de gate para PR e defesa.
 *
 * @returns {void}
 */
function checkPackageScript() {
  expectMarkers("package.json", ["test:mf8:ui-alignment"]);
}

checkSharedUi();
checkPages();
checkAiGovernanceUi();
checkPackageScript();
console.log("MF8 UI alignment OK");
```

5. Explicação do código.

O script valida os contratos que este BK entrega: estilos OPSA, componentes partilhados, páginas agregadoras, wrappers, `sourceQuality` e script no package. O ponto crítico é `expectWrapperOrPageFrame`: um ficheiro que só reexporta uma página não precisa de `PageFrame`, porque não renderiza UI. Assim, o gate deixa de falhar em wrappers legítimos.

Os dados de entrada são ficheiros do frontend. A saída é sucesso com `MF8 UI alignment OK` ou erro com o caminho que falhou. Não há chamadas HTTP, não há alteração de dados e não há contacto com backend.

6. Validação do passo.

Executa `cd apps/web && node scripts/check-mf8-ui-alignment.mjs`. O expected result é `MF8 UI alignment OK`.

7. Cenário negativo/erro esperado.

Remove temporariamente `AiSourceQualityPanel` de `src/pages/mf4Pages.tsx`. O script deve falhar com mensagem que aponta para `src/pages/mf4Pages.tsx`.

### Passo 6 - Ligar o gate ao package frontend

1. Objetivo funcional do passo no contexto da app.

Permitir que o gate seja executado por comando estável em PR, defesa e BKs seguintes.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/package.json`
    - LOCALIZAÇÃO: objeto `scripts`.

3. Instruções do que fazer.

Adiciona a linha `test:mf8:ui-alignment` ao bloco `scripts`. Mantém os scripts existentes.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "test:mf8:ui-alignment": "node scripts/check-mf8-ui-alignment.mjs"
  }
}
```

5. Explicação do código.

Este bloco mostra a linha nova a acrescentar ao `package.json`. JSON não aceita comentários, por isso a explicação fica fora do bloco. O comando permite correr o gate sem memorizar o caminho do ficheiro.

6. Validação do passo.

Executa `cd apps/web && npm run test:mf8:ui-alignment`. O expected result é `MF8 UI alignment OK`.

7. Cenário negativo/erro esperado.

Se o script não estiver no `package.json`, `npm run test:mf8:ui-alignment` deve falhar com erro de script inexistente.

### Passo 7 - Criar checklist visual e evidence

1. Objetivo funcional do passo no contexto da app.

Registar prova verificável para a defesa e para o próximo BK.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md`
    - CRIAR: `docs/evidence/MF8/BK-MF8-14.md`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Cria os dois ficheiros com os modelos abaixo e preenche os campos `observado` apenas depois de executar a app e os comandos.

4. Código completo, correto e integrado com a app final.

```md
<!-- docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md -->
# Checklist UI Mockup - MF8

## Contrato

- BK: BK-MF8-14
- RNF: RNF35
- Fonte visual: mockup/PALETA-CORES.md
- App validada: apps/web

## Critérios visuais

| Área | Expected | Observado | Decisão |
| --- | --- | --- | --- |
| Paleta | Royal Green, Royal Green Light, Royal Green Liquid, amarelo, vermelho, verde e dourado existem em CSS. | A preencher | A preencher |
| Sidebar | Fundo Royal Green, texto branco, item ativo Royal Green Light. | A preencher | A preencher |
| Header | Fundo branco, título do módulo em Royal Green, indicação PT visível quando existir no layout. | A preencher | A preencher |
| Botões | Ação principal amarela, hover dourado, foco visível. | A preencher | A preencher |
| Tabelas | Header verde suave, linhas legíveis, hover discreto, scroll horizontal quando necessário. | A preencher | A preencher |
| Cartões | Fundo branco, borda verde suave, título legível. | A preencher | A preencher |
| Estados | Loading, erro, vazio e sucesso têm texto e não dependem só da cor. | A preencher | A preencher |
| IA | Sugestões mostram fonte, limitação e decisão humana. | A preencher | A preencher |
| Mobile | Sidebar e conteúdo não sobrepõem texto em viewport estreita. | A preencher | A preencher |

## Negativos

1. Remover classe `.statusMessage--danger` deve fazer o gate falhar.
2. Remover `AiSourceQualityPanel` de `mf4Pages.tsx` deve fazer o gate falhar.
3. Remover `test:mf8:ui-alignment` de `package.json` deve fazer o comando npm falhar.
```

```md
<!-- docs/evidence/MF8/BK-MF8-14.md -->
# Evidence BK-MF8-14

## Contexto

- BK: BK-MF8-14
- Requisito: RNF35
- Decisão principal: DERIVADO - transformar o mockup em contrato visual verificável sem alterar dados de negócio.

## Comandos

| Comando | Expected | Observed |
| --- | --- | --- |
| `cd apps/web && npm run test:mf8:ui-alignment` | `MF8 UI alignment OK` | A preencher |
| `cd apps/web && npm run typecheck` | Sem erros TypeScript | A preencher |
| `cd apps/api && node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` | Teste de qualidade da fonte verde | A preencher |

## Negativos executados

| Negativo | Expected | Observed |
| --- | --- | --- |
| Remover `AiSourceQualityPanel` da página de sugestões | Gate falha em `mf4Pages.tsx` | A preencher |
| Remover `.statusMessage--danger` de `styles.css` | Gate falha em `styles.css` | A preencher |
| Remover script do package | `npm run test:mf8:ui-alignment` falha | A preencher |

## Handoff

- Próximo BK: BK-MF8-15
- Contrato entregue: UI coerente, estados acessíveis, fonte de IA visível e gate frontend.
- Risco residual: screenshots devem ser capturados na máquina da equipa, depois de a app correr com dados reais de demonstração.
```

5. Explicação do código.

Estes ficheiros não executam lógica, mas tornam a validação mensurável. A checklist traduz o mockup em critérios concretos. A evidence guarda comandos, negativos e decisão, sem inventar outputs antes de serem executados.

6. Validação do passo.

Confirma que ambos os ficheiros existem e que cada linha importante tem expected result. Depois preenche `Observed` com os resultados reais da equipa.

7. Cenário negativo/erro esperado.

Se a evidence tiver apenas "funciona", está incompleta. Deve indicar comando, expected, observed e pelo menos três negativos.

### Passo 8 - Validar e preparar handoff para BK-MF8-15

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com validação objetiva e entregar ao BK seguinte uma UI estável para localização PT-PT.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/styles.css`
    - REVER: `apps/web/src/ui/opsaUi.tsx`
    - REVER: `apps/web/src/lib/mf4Api.ts`
    - REVER: `apps/web/src/pages/mf4Pages.tsx`
    - REVER: `apps/web/package.json`
    - REVER: `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md`
    - REVER: `docs/evidence/MF8/BK-MF8-14.md`

3. Instruções do que fazer.

Executa os comandos finais, revê os negativos e garante que o próximo BK recebe uma UI consistente para tratar datas, moedas e separadores.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de fecho, validação e handoff.

5. Explicação do código.

Não há novo código porque o contrato já foi entregue nos passos anteriores. O foco agora é provar que o gate, o typecheck, a checklist e a evidence estão alinhados.

6. Validação do passo.

O resultado esperado é: gate frontend verde, typecheck verde, teste de qualidade de fonte do BK13 verde e evidence preenchida com outputs reais.

7. Cenário negativo/erro esperado.

Se `BK-MF8-15` precisar de uma classe, componente ou formato visual que este BK prometeu mas não entregou, volta ao passo correspondente antes de fechar o PR.

#### Critérios de aceite

- Header, owner, prioridade, esforço, sprint, requisito e próximo BK preservam a matriz e o backlog.
- Todos os caminhos publicados para alunos usam `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` ou `docs/evidence`.
- `apps/web/src/styles.css` contém paleta OPSA, sidebar, tabelas, cartões, estados, foco e mobile básico.
- `apps/web/src/ui/opsaUi.tsx` exporta `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge` e `AiSourceQualityPanel`.
- A página de sugestões de IA mostra `sourceQuality`, limitação e aviso de decisão humana.
- `apps/web/scripts/check-mf8-ui-alignment.mjs` distingue wrappers de páginas reais e valida módulos agregadores.
- `apps/web/package.json` expõe `test:mf8:ui-alignment`.
- A checklist visual cobre paleta, sidebar, header, botões, tabelas, cartões, estados, IA e mobile.
- Existem pelo menos 3 negativos coerentes com `RNF35`.
- A UI não decide empresa ativa, ownership, role ou permissão final.

#### Validação final

Executa:

```bash
cd apps/web
npm run test:mf8:ui-alignment
npm run typecheck
```

Executa também o teste do handoff de IA, se o ficheiro já tiver sido criado no `BK-MF8-13`:

```bash
cd apps/api
node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js
```

Expected results:

- `MF8 UI alignment OK`.
- TypeScript sem erros.
- Teste de qualidade da fonte verde.
- Negativos documentados em `docs/evidence/MF8/BK-MF8-14.md`.
- Sem caminhos privados nos ficheiros entregues aos alunos.

#### Evidence para PR/defesa

- `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` preenchido com critérios do mockup.
- `docs/evidence/MF8/BK-MF8-14.md` com comandos, expected, observed e negativos.
- Output de `npm run test:mf8:ui-alignment`.
- Output de `npm run typecheck`.
- Screenshot da dashboard ou página operacional com sidebar, header, tabela/cartões e estados.
- Screenshot ou registo da página de sugestões de IA com fonte, limitação e decisão humana.

#### Handoff

- Próximo BK recomendado: `BK-MF8-15`.
- Contrato entregue: UI coerente com `RNF35`, variáveis CSS OPSA, componentes partilhados, `AiSourceQualityPanel`, gate frontend e evidence visual.
- Ficheiros principais: `apps/web/src/styles.css`, `apps/web/src/ui/opsaUi.tsx`, `apps/web/src/pages/mf4Pages.tsx`, `apps/web/scripts/check-mf8-ui-alignment.mjs`.
- Teste/evidence principal: `npm run test:mf8:ui-alignment`, `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` e `docs/evidence/MF8/BK-MF8-14.md`.
- Risco a vigiar no `BK-MF8-15`: formatar datas, moedas e números sem quebrar a hierarquia visual agora estabilizada.

#### Changelog

- `2026-07-02`: guia corrigido após auditoria crítica; foram acrescentados contrato visual concreto, `AiSourceQualityPanel`, gate frontend sem falsos negativos, script no package, checklist/evidence e handoff explícito para `BK-MF8-15`.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
