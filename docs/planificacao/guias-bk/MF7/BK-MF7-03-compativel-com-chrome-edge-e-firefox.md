# BK-MF7-03 - Compatível com Chrome, Edge e Firefox.

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
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais transformar o requisito `RNF20` numa entrega técnica verificável: a interface do OPSA deve abrir, navegar e manter os fluxos principais estáveis em Chrome, Edge e Firefox.

O resultado final é duplo. Primeiro, fica criado um gate estático que falha quando o frontend tenta tomar decisões com base no nome do browser. Segundo, fica criada uma matriz de smoke para registar a prova manual nos três browsers definidos pelo requisito.

Este BK não altera regras de negócio, não cria endpoints e não muda o design visual. A compatibilidade é tratada como uma camada de qualidade do frontend: o mesmo código React, o mesmo CSS e o mesmo cliente HTTP devem funcionar nos browsers alvo.

#### Importância

Um ERP financeiro não pode funcionar apenas no browser usado pelo aluno durante o desenvolvimento. Gestores, operacionais, contabilistas e auditores podem abrir a aplicação em ambientes diferentes, e o produto deve comportar-se de forma previsível nos browsers principais.

O `RNF20` protege a entrega final contra decisões frágeis como "se for Chrome faz isto, se for Firefox faz aquilo". Esse tipo de regra cria divergência visual, dificulta testes e pode esconder falhas de acessibilidade, formulários, tabelas ou feedback.

Este BK prepara `BK-MF7-04`, porque a recuperação de acesso, alertas e mensagens por email precisam de uma interface estável para o utilizador completar o fluxo. Também preserva a base de MF5, onde foram definidos feedback visual, responsividade, acessibilidade e validação de formulários.

#### Scope-in

- Criar `apps/web/scripts/check-mf7-browser-compatibility.mjs`.
- Editar `apps/web/package.json` para expor `test:mf7:browser-compatibility` e `test:mf7`.
- Criar `apps/web/evidence/mf7-browser-compatibility.md`.
- Rever superfícies críticas do frontend: `App.tsx`, `styles.css`, `opsaUi.tsx`, `ResponsiveDataTable.tsx` e `apiClient.ts`.
- Validar ausência de ramos por browser.
- Validar `typecheck`, `build` e smoke manual em Chrome, Edge e Firefox.
- Documentar três negativos obrigatórios com resultado esperado.

#### Scope-out

- Não criar teste E2E automatizado real sem ferramenta aprovada no projeto.
- Não suportar browsers fora de `RNF20`.
- Não alterar arquitetura backend.
- Não alterar regras de autenticação, autorização, empresa ativa ou permissões.
- Não redesenhar páginas, tabelas, formulários ou estilos.
- Não criar funcionalidades novas para exportações, importações, SAF-T, email ou IA.

#### Estado antes e depois

- Estado antes: MF5 já definiu contratos de interface, feedback, responsividade, acessibilidade, validação e performance visual; MF6 reforçou segurança e auditoria; falta transformar `RNF20` num gate e numa evidence verificável.
- Estado depois: o frontend passa a ter um script `test:mf7:browser-compatibility`, uma matriz de validação para Chrome, Edge e Firefox e critérios de fecho claros para impedir decisões dependentes de browser.

#### Pre-requisitos

- Ler `RNF20` em `docs/RNF.md`.
- Rever a linha de `BK-MF7-03` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF7-03` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `docs/planificacao/backlogs/MF-VIEWS.md`.
- Rever `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Rever `BK-MF7-02`, porque entrega retenção legal antes desta validação transversal.
- Rever `BK-MF7-04`, porque é o próximo fluxo a beneficiar de compatibilidade estável.
- Confirmar que `apps/web/package.json` já tem `build` e `typecheck`.
- Confirmar que `apps/web/src/lib/apiClient.ts` continua a usar `credentials: "include"` para enviar o cookie de sessão de forma automática.

#### Glossário

- Compatibilidade: capacidade de a mesma funcionalidade trabalhar nos browsers definidos pelo requisito.
- Browser alvo: Chrome, Edge e Firefox, porque são os browsers explicitamente pedidos por `RNF20`.
- Feature detection: validar uma capacidade técnica real, como suporte de CSS ou API web, em vez de perguntar o nome do browser.
- Gate estático: script que lê ficheiros e falha quando encontra padrões proibidos.
- Smoke manual: validação curta, repetida em cada browser, que confirma que a aplicação abre, navega e apresenta feedback correto.
- Evidence: registo objetivo com comandos, outputs, browsers testados, versões e resultado observado.
- Empresa ativa: empresa resolvida pelo backend autenticado; o frontend não decide ownership, papel ou permissão final.

#### Conceitos teóricos essenciais

`CANONICO`: `RNF20` exige compatibilidade com Chrome, Edge e Firefox. Isto define o contrato de browser deste BK e limita o scope a esses três browsers.

`CANONICO`: `BK-MF7-03` é um BK `P0/Reforco`, com owner `Pedro`, apoio `Andre`, sprint `S11-S12` e próximo BK `BK-MF7-04`.

`DERIVADO`: usar um gate estático é a decisão técnica mínima para tornar `RNF20` verificável sem introduzir uma ferramenta E2E nova no projeto.

Compatibilidade de browser não significa escrever três versões da aplicação. A forma correta é escrever código React e CSS standard, validar com build e typecheck, e provar que as páginas críticas se comportam da mesma forma nos browsers alvo.

Feature detection é diferente de browser detection. Feature detection pergunta "esta capacidade existe?". Browser detection pergunta "qual é o browser?". A segunda opção é frágil, porque versões novas podem mudar comportamento e porque Edge, Chrome e outros browsers podem partilhar motor de renderização sem serem a mesma aplicação.

O frontend pode validar apresentação, navegação, mensagens e resposta visual. As regras de autenticação, autorização, permissões, empresa ativa, dados financeiros e auditoria continuam no backend. Este BK não muda essa fronteira: apenas confirma que a interface comunica com o backend usando o cliente HTTP já existente.

Evidence de compatibilidade deve ser objetiva. Para cada browser, o aluno deve guardar versão, páginas testadas, resultado esperado e resultado observado. Sem esta matriz, a frase "funciona em todos" não é prova técnica suficiente.

#### Arquitetura do BK

- Script: `apps/web/scripts/check-mf7-browser-compatibility.mjs`
- Comando npm: `test:mf7:browser-compatibility`
- Comando agregado: `test:mf7`
- Evidence: `apps/web/evidence/mf7-browser-compatibility.md`
- Superfícies frontend revistas:
  - `apps/web/src/App.tsx`
  - `apps/web/src/styles.css`
  - `apps/web/src/ui/opsaUi.tsx`
  - `apps/web/src/ui/ResponsiveDataTable.tsx`
  - `apps/web/src/lib/apiClient.ts`
- Endpoints novos: nenhum.
- Modelo Prisma: não aplicável.
- Service backend: não aplicável.
- Handoff para o próximo BK: `BK-MF7-04` passa a ter uma interface validada nos browsers alvo.

#### Ficheiros a criar/editar/rever

| Ficheiro | Ação | Responsabilidade |
| --- | --- | --- |
| `apps/web/scripts/check-mf7-browser-compatibility.mjs` | criar | Gate estático contra ramos por browser e contratos mínimos de frontend. |
| `apps/web/package.json` | editar | Expor `test:mf7:browser-compatibility` e `test:mf7`. |
| `apps/web/evidence/mf7-browser-compatibility.md` | criar | Guardar a matriz de smoke Chrome, Edge e Firefox. |
| `apps/web/src/App.tsx` | rever | Confirmar navegação principal sem decisões por browser. |
| `apps/web/src/styles.css` | rever | Confirmar CSS standard, responsividade e foco visível. |
| `apps/web/src/ui/opsaUi.tsx` | rever | Confirmar componentes comuns com estados acessíveis. |
| `apps/web/src/ui/ResponsiveDataTable.tsx` | rever | Confirmar tabelas/listas sem regras específicas por browser. |
| `apps/web/src/lib/apiClient.ts` | rever | Confirmar envio de cookies com `credentials: "include"`. |

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e superfícies críticas

1. Objetivo funcional do passo no contexto da app.

Confirmar o que o `RNF20` pede e escolher as superfícies mínimas que representam a experiência real do OPSA nos browsers alvo.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/styles.css`
    - REVER: `apps/web/src/ui/opsaUi.tsx`
    - REVER: `apps/web/src/ui/ResponsiveDataTable.tsx`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: contrato `RNF20`, linha canónica de `BK-MF7-03` e superfícies frontend já entregues por MF5.

3. Instruções do que fazer.

Confirma que o requisito é apenas compatibilidade com Chrome, Edge e Firefox. Depois confirma que as superfícies acima existem no frontend. Estas superfícies cobrem navegação, estilos, componentes comuns, tabelas responsivas e chamadas HTTP.

Não acrescentes browsers, endpoints, regras de negócio ou dependências novas. Este BK valida a interface existente, não muda o domínio financeiro.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e prepara a implementação do gate.

5. Explicação do código.

Não existe código para explicar neste passo. A decisão importante é escolher superfícies que representem a aplicação real: entrada principal, CSS global, componentes comuns, tabelas e cliente HTTP. Isto evita validar apenas um ficheiro isolado e deixar a UI crítica sem prova.

6. Validação do passo.

Confirma por leitura que `BK-MF7-03` está associado a `RNF20`, que o próximo BK é `BK-MF7-04` e que os ficheiros frontend listados existem ou foram criados em BKs anteriores.

7. Cenário negativo/erro esperado.

Se uma superfície crítica ainda não existir, não inventes outra com o mesmo nome. Regista o ficheiro em falta na evidence e corrige primeiro a entrega anterior que deveria tê-lo criado.

### Passo 2 - Criar o gate estático de compatibilidade

1. Objetivo funcional do passo no contexto da app.

Criar um script que falha quando encontra código dependente do nome do browser ou quando faltam contratos mínimos herdados de MF5.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/scripts/check-mf7-browser-compatibility.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a pasta `apps/web/scripts` se ainda não existir. Depois cria o ficheiro `apps/web/scripts/check-mf7-browser-compatibility.mjs` com o conteúdo completo abaixo.

4. Código completo, correto e integrado com a app final.

```js
// apps/web/scripts/check-mf7-browser-compatibility.mjs
/**
 * @file Gate MF7 para validar compatibilidade do frontend em Chrome, Edge e Firefox.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

const sourceFiles = [
  "src/App.tsx",
  "src/lib/apiClient.ts",
  "src/styles.css",
  "src/ui/ResponsiveDataTable.tsx",
  "src/ui/opsaUi.tsx",
];

const forbiddenPatterns = [
  {
    pattern: /\bnavigator\.userAgent\b/i,
    reason: "usa identificação do browser em vez de feature detection",
  },
  {
    pattern: /\bwindow\.chrome\b/i,
    reason: "cria ramo específico para Chrome ou Edge",
  },
  {
    pattern: /\bInstallTrigger\b/i,
    reason: "cria ramo específico para Firefox",
  },
  {
    pattern: /@-moz-document/i,
    reason: "cria CSS específico para Firefox",
  },
  {
    pattern: /::-webkit-/i,
    reason: "cria seletor CSS específico para motores WebKit/Blink",
  },
  {
    pattern: /@supports\s*\([^)]*-webkit-/i,
    reason: "usa suporte CSS como atalho para escolher browser",
  },
];

const requiredContracts = [
  {
    file: "src/lib/apiClient.ts",
    pattern: /credentials:\s*"include"/,
    reason: "o cliente HTTP deve enviar o cookie de sessão de forma automática",
  },
  {
    file: "src/styles.css",
    pattern: /:focus-visible/,
    reason: "o foco por teclado deve ser visível nos browsers alvo",
  },
  {
    file: "src/styles.css",
    pattern: /@media\s*\(max-width:\s*640px\)/,
    reason: "a interface deve manter adaptação mobile sem lógica por browser",
  },
  {
    file: "src/ui/ResponsiveDataTable.tsx",
    pattern: /export function ResponsiveDataTable/,
    reason: "as tabelas responsivas de MF5 devem continuar disponíveis",
  },
];

/**
 * Lê um ficheiro do frontend a partir da raiz de `apps/web`.
 *
 * @param {string} relativePath - Caminho relativo dentro de `apps/web`.
 * @returns {string} Conteúdo textual do ficheiro.
 */
function readWebFile(relativePath) {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

/**
 * Confirma que o ficheiro não contém padrões proibidos por `RNF20`.
 *
 * @param {string} relativePath - Caminho relativo do ficheiro analisado.
 * @param {string} source - Conteúdo textual do ficheiro.
 * @returns {void}
 */
function assertNoBrowserBranch(relativePath, source) {
  for (const { pattern, reason } of forbiddenPatterns) {
    // O gate falha cedo para impedir que a UI tenha caminhos diferentes por browser.
    assert.equal(
      pattern.test(source),
      false,
      `${relativePath} contém regra proibida: ${reason}`,
    );
  }
}

/**
 * Confirma contratos de frontend que devem sobreviver nos três browsers alvo.
 *
 * @returns {void}
 */
function assertRequiredContracts() {
  for (const { file, pattern, reason } of requiredContracts) {
    const source = readWebFile(file);
    // Estes contratos foram escolhidos porque protegem sessão, foco e layout responsivo.
    assert.match(source, pattern, `${file} não cumpre contrato MF7: ${reason}`);
  }
}

/**
 * Executa o gate de compatibilidade browser da MF7.
 *
 * @returns {void}
 */
export function checkMf7BrowserCompatibility() {
  for (const file of sourceFiles) {
    const source = readWebFile(file);
    assertNoBrowserBranch(file, source);
  }

  assertRequiredContracts();
}

checkMf7BrowserCompatibility();
console.info("MF7 browser compatibility gate OK");
```

5. Explicação do código.

O script lê ficheiros críticos do frontend e aplica dois tipos de validação. Primeiro, procura padrões proibidos como `navigator.userAgent`, `window.chrome`, `InstallTrigger`, `@-moz-document` e seletores específicos de WebKit/Blink. Estes padrões são perigosos porque criam caminhos diferentes para browsers diferentes.

Segundo, o script confirma contratos já importantes para a interface: o cliente HTTP mantém `credentials: "include"`, o CSS mantém foco visível, o CSS mantém breakpoint responsivo e o componente `ResponsiveDataTable` continua exportado. Isto liga `RNF20` aos BKs anteriores de MF5 sem duplicar código de UI.

A função `readWebFile` centraliza a leitura a partir da raiz de `apps/web`. A função `assertNoBrowserBranch` dá mensagens de erro úteis para o aluno saber que ficheiro corrigir. A função `assertRequiredContracts` confirma que a compatibilidade não removeu contratos essenciais de sessão, acessibilidade e responsividade.

6. Validação do passo.

Executa:

```bash
cd apps/web
node --check scripts/check-mf7-browser-compatibility.mjs
node scripts/check-mf7-browser-compatibility.mjs
```

Resultado esperado:

```text
MF7 browser compatibility gate OK
```

7. Cenário negativo/erro esperado.

Se colocares temporariamente `const browser = navigator.userAgent;` em `apps/web/src/App.tsx`, o comando deve falhar com uma mensagem que inclui `src/App.tsx contém regra proibida`. Remove essa linha antes de continuar.

### Passo 3 - Ligar o gate ao `package.json`

1. Objetivo funcional do passo no contexto da app.

Criar comandos npm reprodutíveis para o aluno, a equipa e a defesa executarem a validação de `RNF20`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/package.json`
    - LOCALIZAÇÃO: objeto `"scripts"`.

3. Instruções do que fazer.

Edita apenas o objeto `"scripts"` de `apps/web/package.json`. Mantém os scripts anteriores e acrescenta os dois scripts MF7 mostrados abaixo.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "test:mf1": "node scripts/check-mf1-pages.mjs",
    "test:mf2": "node scripts/check-mf2-pages.mjs",
    "test:mf3": "node scripts/check-mf3-pages.mjs",
    "test:mf5:feedback": "node scripts/check-mf5-feedback.mjs",
    "test:mf5:responsive": "node scripts/check-mf5-responsive.mjs",
    "test:mf5:a11y": "node scripts/check-mf5-accessibility.mjs",
    "test:mf5:forms": "node scripts/check-mf5-form-validation.mjs",
    "test:mf5:errors": "node scripts/check-mf5-error-messages.mjs",
    "test:mf5:performance": "node scripts/check-mf5-performance.mjs",
    "test:mf7:browser-compatibility": "node scripts/check-mf7-browser-compatibility.mjs",
    "test:mf7": "npm run test:mf7:browser-compatibility && npm run typecheck && npm run build",
    "typecheck": "tsc --noEmit"
  }
}
```

5. Explicação do código.

O script `test:mf7:browser-compatibility` executa apenas o gate criado neste BK. O script `test:mf7` junta o gate, o typecheck e o build final. Esta ordem é intencional: primeiro falha rápido em regras proibidas, depois confirma tipos TypeScript, e só no fim gera o pacote de frontend.

Este bloco mostra apenas o objeto `"scripts"` para não obrigar o aluno a trocar versões de dependências. Se o teu `package.json` tiver scripts extra, preserva-os e acrescenta estes dois sem remover os anteriores.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run test:mf7:browser-compatibility
```

Resultado esperado:

```text
MF7 browser compatibility gate OK
```

7. Cenário negativo/erro esperado.

Se o script não foi acrescentado, `npm run test:mf7:browser-compatibility` deve falhar com erro de script inexistente. Corrige o objeto `"scripts"` antes de avançar.

### Passo 4 - Criar a matriz de evidence cross-browser

1. Objetivo funcional do passo no contexto da app.

Criar um ficheiro onde a equipa regista a validação manual em Chrome, Edge e Firefox com resultados observáveis.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/evidence/mf7-browser-compatibility.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a pasta `apps/web/evidence` se ainda não existir. Depois cria o ficheiro abaixo e preenche a coluna `Versão testada` durante o smoke manual.

4. Código completo, correto e integrado com a app final.

```md
# MF7 - Evidence de compatibilidade browser

## Contrato

- BK: BK-MF7-03
- RNF: RNF20
- Browsers alvo: Chrome, Edge e Firefox
- Data da validação: registar a data real da execução
- Responsável: Pedro
- Apoio: Andre

## Comandos executados

| Comando | Resultado esperado | Resultado observado |
| --- | --- | --- |
| `cd apps/web && npm run test:mf7:browser-compatibility` | `MF7 browser compatibility gate OK` | registar output real da execução |
| `cd apps/web && npm run typecheck` | sem erros TypeScript | registar output real da execução |
| `cd apps/web && npm run build` | build concluído | registar output real da execução |

## Smoke manual por browser

| Browser | Versão testada | Páginas/fluxos revistos | Resultado esperado | Resultado observado |
| --- | --- | --- | --- | --- |
| Chrome | registar versão instalada | entrada da app, navegação lateral, tabela responsiva, formulário com erro, feedback visual | interface abre, navega, mantém layout e mostra feedback | registar comportamento observado |
| Edge | registar versão instalada | entrada da app, navegação lateral, tabela responsiva, formulário com erro, feedback visual | interface abre, navega, mantém layout e mostra feedback | registar comportamento observado |
| Firefox | registar versão instalada | entrada da app, navegação lateral, tabela responsiva, formulário com erro, feedback visual | interface abre, navega, mantém layout e mostra feedback | registar comportamento observado |

## Negativos executados

| Negativo | Como testar | Resultado esperado | Resultado observado |
| --- | --- | --- | --- |
| Ramo por browser no React | adicionar temporariamente `navigator.userAgent` em `src/App.tsx` | gate falha e indica o ficheiro | registar mensagem de falha observada |
| Ramo por browser no CSS | adicionar temporariamente `@-moz-document url-prefix() { body { outline: 1px solid red; } }` em `src/styles.css` | gate falha e indica o ficheiro | registar mensagem de falha observada |
| Script npm ausente | remover temporariamente `test:mf7:browser-compatibility` do `package.json` | `npm run` falha por script inexistente | registar mensagem de falha observada |

## Decisão

- Estado final: indicar `OK` ou `BLOQUEADO`, conforme o resultado final
- Observações: descrever divergências ou escrever `sem divergências`
```

5. Explicação do código.

Este ficheiro não executa a aplicação; guarda evidence. A tabela de comandos prova que o gate, o typecheck e o build foram executados. A tabela de smoke manual prova que os três browsers pedidos por `RNF20` foram abertos e testados com os mesmos fluxos.

Os negativos ensinam o aluno a verificar a proteção criada no BK. Cada negativo deve ser temporário: o aluno introduz a falha, confirma que o gate a apanha, remove a falha e volta a executar o comando correto.

6. Validação do passo.

Confirma que o ficheiro existe e que as colunas de resultado observado foram registadas antes de fechar o PR ou pacote de entrega.

7. Cenário negativo/erro esperado.

Se a coluna `Resultado observado` ficar vazia, a evidence não prova `RNF20`. O BK não deve ser dado como concluído até a matriz estar preenchida.

### Passo 5 - Rever código fonte e remover ramos por browser

1. Objetivo funcional do passo no contexto da app.

Garantir que as superfícies críticas usam React, CSS e cliente HTTP de forma standard, sem caminhos diferentes por browser.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/styles.css`
    - REVER: `apps/web/src/ui/opsaUi.tsx`
    - REVER: `apps/web/src/ui/ResponsiveDataTable.tsx`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Procura manualmente decisões como `navigator.userAgent`, `window.chrome`, `InstallTrigger`, `@-moz-document`, seletores `::-webkit-*` e blocos `@supports` usados para escolher browser. Se encontrares algum, substitui por CSS standard, componente reutilizável ou validação de capacidade real.

Mantém `credentials: "include"` no cliente HTTP. A sessão continua a ser tratada pelo cookie definido pelo backend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é revisão e correção das superfícies existentes, usando o gate criado no passo 2 como prova final.

5. Explicação do código.

Não há um ficheiro novo neste passo porque o objetivo é impedir divergência no código já existente. A compatibilidade real nasce de usar os mesmos componentes e estilos para todos os browsers alvo.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run test:mf7:browser-compatibility
```

Resultado esperado:

```text
MF7 browser compatibility gate OK
```

7. Cenário negativo/erro esperado.

Se o gate acusar `src/styles.css contém regra proibida`, remove o bloco CSS específico do browser e escreve a solução com propriedades standard.

### Passo 6 - Executar typecheck e build

1. Objetivo funcional do passo no contexto da app.

Confirmar que a correção de compatibilidade não quebrou TypeScript nem o build Vite.

2. Ficheiros envolvidos:
    - REVER: `apps/web/package.json`
    - REVER: `apps/web/tsconfig.json`
    - REVER: `apps/web/vite.config.ts`
    - LOCALIZAÇÃO: comandos definidos no projeto web.

3. Instruções do que fazer.

Executa os comandos do frontend depois do gate estático. Não avances para smoke manual se o projeto não fizer build.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo executa os comandos criados e os comandos já existentes do frontend.

5. Explicação do código.

O typecheck confirma que os componentes e imports TypeScript continuam válidos. O build confirma que Vite consegue gerar a versão final da aplicação. Estes dois comandos não substituem o smoke nos browsers, mas impedem fechar `RNF20` com erros básicos de compilação.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run test:mf7
```

Resultado esperado:

```text
MF7 browser compatibility gate OK
✓ built
```

O texto exato do build pode variar, mas o comando deve terminar com exit code `0`.

7. Cenário negativo/erro esperado.

Se o build falhar por import inexistente ou erro TypeScript, corrige esse erro antes de testar nos browsers. Smoke manual com build partido não fecha o BK.

### Passo 7 - Executar smoke manual em Chrome, Edge e Firefox

1. Objetivo funcional do passo no contexto da app.

Provar que a aplicação abre e mantém fluxos visuais essenciais nos três browsers alvo.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/evidence/mf7-browser-compatibility.md`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/ui/ResponsiveDataTable.tsx`
    - REVER: `apps/web/src/styles.css`
    - LOCALIZAÇÃO: tabela `Smoke manual por browser`.

3. Instruções do que fazer.

Arranca a aplicação com `cd apps/web && npm run dev`. Abre a mesma URL em Chrome, Edge e Firefox. Em cada browser, confirma:

- entrada da aplicação sem erro visível;
- navegação lateral funcional;
- tabela responsiva visível;
- formulário com erro a mostrar feedback claro;
- foco por teclado visível;
- layout sem sobreposição de texto.

Preenche a tabela de evidence com a versão de cada browser e resultado observado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é validação manual controlada e registo de evidence.

5. Explicação do código.

O gate estático encontra ramos por browser, mas não vê o ecrã. O smoke manual confirma o que o utilizador realmente vê: navegação, tabelas, formulários, feedback e foco. Essa combinação fecha melhor o `RNF20` do que apenas executar build.

6. Validação do passo.

Cada linha da tabela `Smoke manual por browser` deve ter:

- browser;
- versão testada;
- fluxos revistos;
- resultado esperado;
- resultado observado.

7. Cenário negativo/erro esperado.

Se Firefox apresentar uma tabela sobreposta ou Edge esconder feedback, regista o browser, a versão, o ficheiro provável e o passo de reprodução. Não marques o BK como concluído até corrigir e repetir o smoke.

### Passo 8 - Executar negativos e fechar handoff

1. Objetivo funcional do passo no contexto da app.

Confirmar que os negativos obrigatórios falham de forma controlada e deixar handoff claro para `BK-MF7-04`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/evidence/mf7-browser-compatibility.md`
    - REVER: `apps/web/scripts/check-mf7-browser-compatibility.mjs`
    - REVER: `apps/web/package.json`
    - LOCALIZAÇÃO: tabela `Negativos executados` e secção `Decisão`.

3. Instruções do que fazer.

Executa os três negativos documentados no ficheiro de evidence:

1. adiciona temporariamente `navigator.userAgent` em `src/App.tsx`;
2. adiciona temporariamente `@-moz-document url-prefix() { body { outline: 1px solid red; } }` em `src/styles.css`;
3. remove temporariamente `test:mf7:browser-compatibility` do objeto `"scripts"`.

Depois de cada negativo, repõe o ficheiro antes de testar o seguinte. No fim, executa novamente `npm run test:mf7`.

4. Código completo, correto e integrado com a app final.

Sem código permanente neste passo. As alterações dos negativos são temporárias e devem ser removidas antes de fechar o BK.

5. Explicação do código.

Os negativos provam que o gate não está apenas a passar por acaso. O primeiro negativo prova deteção de decisão por browser em React. O segundo prova deteção de CSS específico por browser. O terceiro prova que o comando npm é parte obrigatória do contrato de validação.

6. Validação do passo.

Resultado final obrigatório:

```bash
cd apps/web
npm run test:mf7
```

O comando final deve terminar com exit code `0`. A tabela de negativos deve mostrar que cada falha foi reproduzida e depois removida.

7. Cenário negativo/erro esperado.

Se um negativo não falhar, o gate está incompleto. Corrige `check-mf7-browser-compatibility.mjs`, repete os negativos e só depois fecha a evidence.

#### Critérios de aceite

- `apps/web/scripts/check-mf7-browser-compatibility.mjs` existe e executa com sucesso.
- `apps/web/package.json` expõe `test:mf7:browser-compatibility` e `test:mf7`.
- `apps/web/evidence/mf7-browser-compatibility.md` está preenchido com comandos, browsers, versões e resultados observados.
- `npm run test:mf7:browser-compatibility` termina com exit code `0`.
- `npm run typecheck` termina com exit code `0`.
- `npm run build` termina com exit code `0`.
- Chrome, Edge e Firefox foram testados com os mesmos fluxos.
- Os três negativos falham de forma controlada e ficam registados.
- Não existem ramos por browser nas superfícies críticas.
- Não existem caminhos privados no guia.

#### Validação final

Executa, a partir da raiz do repositório:

```bash
cd apps/web
npm run test:mf7
```

Executa também:

```bash
git diff --check
bash scripts/validate-planificacao.sh
```

Resultados esperados:

- `npm run test:mf7`: exit code `0`.
- `git diff --check`: sem erros.
- `bash scripts/validate-planificacao.sh`: `overall_pass=true`.

Se o validador listar advisories antigos noutros BKs, regista a limitação no PR, mas não alteres ficheiros fora do scope deste BK.

#### Evidence para PR/defesa

- `pr`: link ou referência do PR/pacote onde foram criados o script, o comando npm e a evidence.
- `proof`: output de `npm run test:mf7`, `typecheck` e `build`.
- `neg`: tabela preenchida com os três negativos e mensagens observadas.
- `fonte`: `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e este guia.
- `browser`: tabela preenchida para Chrome, Edge e Firefox, com versão e resultado observado.

#### Handoff

- Próximo BK recomendado: `BK-MF7-04`.
- Este BK entrega ao próximo uma interface validada nos browsers alvo, sem ramos por browser e com evidence objetiva.
- `BK-MF7-04` pode implementar email transacional sabendo que recuperação de acesso, alertas e feedback visual têm uma matriz base de compatibilidade.
- Risco restante: se a equipa introduzir novas páginas depois deste BK, deve acrescentá-las ao smoke ou repetir a validação nos três browsers.

#### Changelog

- `2026-06-26`: guia corrigido em modo `corrigir_apenas`; foram fechadas as lacunas de passos, comando npm, evidence cross-browser e negativos reproduzíveis.
- `2026-06-25`: guia reescrito para tutorial técnico linear, autocontido e alinhado com a MF7 completa.
