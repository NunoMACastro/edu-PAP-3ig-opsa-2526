# BK-MF7-03 - Compatível com Chrome, Edge e Firefox

## Header

- `doc_id`: `GUIA-BK-MF7-03`
- `bk_id`: `BK-MF7-03`
- `macro`: `MF7`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF20`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-04`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-03-compativel-com-chrome-edge-e-firefox.md`
- `last_updated`: `2026-07-10`

## Objetivo

Provar os fluxos críticos da OPSA em Chrome, Edge e Firefox reais através de Playwright. Typecheck, build, regex contra browser detection e smoke manual são úteis, mas não fecham compatibilidade.

## Matriz obrigatória

Browsers:

- Chromium/Chrome;
- canal Microsoft Edge;
- Firefox.

Viewports:

- `375×667`;
- `768×1024`;
- `1440×900`.

Fluxos mínimos:

- login/bootstrap e logout;
- deep link protegido e Back/Forward;
- navegação por permissões e 404;
- listagem com cursor;
- formulário com validação/erro preservado;
- upload/importação por file picker;
- reconciliação com decisão humana;
- sessão expirada/401;
- foco, diálogo e navegação por teclado.

## Ficheiros públicos do aluno

- `apps/web/playwright.config.ts`
- `apps/web/tests/e2e/auth-navigation.spec.ts`
- `apps/web/tests/e2e/critical-flows.spec.ts`
- `apps/web/tests/e2e/responsive-accessibility.spec.ts`
- `apps/web/scripts/check-mf7-browser-compatibility.mjs`
- `apps/web/package.json`
- `apps/web/evidence/mf7-browser-compatibility.md`

## Tutorial técnico linear

### Passo 1 - Configurar projetos Playwright

Define projetos separados e não reutilizes um único browser como substituto:

```ts
projects: [
  { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
  { name: "edge", use: { ...devices["Desktop Edge"], channel: "msedge" } },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
]
```

Se Chrome/Edge instalados não estiverem disponíveis no ambiente, classifica como `BLOQUEADO_AMBIENTE`; não muda o projeto para Chromium e chama-lhe Edge.

### Passo 2 - Preparar dados determinísticos

Usa uma base dedicada de teste, empresa/utilizadores artificiais e reset idempotente. Não reutilizes produção nem guardes cookies, tokens, emails reais ou URLs credenciadas na evidence. Cada teste deve isolar a empresa e limpar ficheiros temporários.

### Passo 3 - Testar routing e sessão

Confirma deep links, 404, Back/Forward, deny-by-default e 401. Um `returnTo` externo deve ser rejeitado. A página privada nunca deve aparecer durante bootstrap anonymous/error.

### Passo 4 - Testar domínio e pedidos

Executa pelo menos uma leitura paginada e uma mutação. Prova que timeout/abort não duplica mutações, que `409 STALE_STATE` preserva dados e que o formulário limpa apenas após sucesso.

### Passo 5 - Testar responsive e acessibilidade

Para cada viewport:

- zero overflow horizontal;
- conteúdo começa até 120 px do topo em mobile;
- drawer começa fechado e gere foco;
- skip link funciona;
- labels/erros são anunciados;
- diálogos aceitam Escape e devolvem foco.

Integra axe e falha por violações `serious` ou `critical` nas páginas críticas.

### Passo 6 - Manter gate estático complementar

O script pode impedir `navigator.userAgent`, CSS exclusivo de engine e outros ramos por nome de browser. Isto é um negativo complementar, não prova renderização nem interação.

### Passo 7 - Registar evidence

Regista por projeto: versão, viewport, testes iniciados/passados/falhados/skipped, duração e artefactos redigidos. A contagem “0 iniciado” é blocker explícito.

## Validação final

```bash
cd apps/web
npm run typecheck
npm run test
npm run build
npm run test:mf7:browser-compatibility
npm run test:e2e
```

O gate final não aceita `--pass-with-no-tests`, exclusões oportunistas nem skips.

## Critérios de aceite

- Chrome, Edge e Firefox executam os mesmos fluxos.
- Três viewports passam sem quebra visual funcional.
- Routing, sessão, paginação, formulários e upload têm prova browser.
- Teclado/axe passam nas páginas críticas.
- Relatório distingue falha de produto de blocker ambiental.
- Zero testes obrigatórios skipped.

## Evidence para PR/defesa

- relatório Playwright por projeto e viewport;
- screenshots/traces apenas de falhas, sem dados pessoais;
- relatório axe;
- negativo de browser detection;
- comandos, exit codes e contagens reais.

## Importância

Build e regex não observam renderização, foco, routing nem uploads. Browsers reais são a prova funcional do requisito.

## Scope-in

- Playwright nos três browsers/viewports, fluxos críticos e axe.

## Scope-out

- Browsers fora de RNF20 e forks de código por user agent.

## Estado antes e depois

- Antes: gate estático e smoke manual.
- Depois: E2E repetível por browser, com blockers explícitos.

## Pre-requisitos

- App/API de teste, browsers instalados e dados artificiais isolados.

## Glossário

- **Projeto Playwright:** configuração independente por browser.
- **Trace:** artefacto de diagnóstico de uma execução.

## Conceitos teóricos essenciais

Feature detection é aceitável; browser detection cria divergência. Compatibilidade exige comportamento equivalente, não pixels idênticos.

## Arquitetura do BK

Playwright inicia web/API controladas, prepara fixtures e executa a mesma suite por projeto e viewport.

## Ficheiros a criar/editar/rever

Revê `apps/web/playwright.config.ts`, specs E2E, package scripts e evidence redigida.

## Cenários negativos mínimos

Executa pelo menos 3 cenários negativos: `returnTo` externo, sessão expirada e browser obrigatório não iniciado.

## Handoff

Entrega a `BK-MF7-04` uma UI validada nos browsers usados pelos fluxos de reset e convite.

## Changelog

- `2026-07-10`: smoke manual deixou de fechar o BK; Playwright/axe multi-browser passa a ser obrigatório.
