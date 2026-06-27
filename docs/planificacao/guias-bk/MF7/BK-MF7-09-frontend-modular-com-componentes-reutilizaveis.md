# BK-MF7-09 - Frontend modular com componentes reutilizáveis.

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
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais transformar o requisito `RNF26` numa entrega técnica verificável: fica criado um gate de modularidade frontend para reutilizar UI, clientes API e páginas por domínio.

A MF7 fecha temas de operação, compatibilidade, interoperabilidade e manutenção. O guia usa os contratos entregues até MF6 como baseline e escreve sempre caminhos públicos sob `apps/api` e `apps/web`.

#### Importância

O requisito `RNF26` evita que o ERP funcione apenas em ambiente de demonstração. Num ERP financeiro, operação, exportação, importação, retenção, modularidade e testes são parte da segurança do produto.

Este BK prepara `BK-MF7-10` e mantém continuidade com `BK-MF6-10`, que tornou a auditoria obrigatória em operações sensíveis.

#### Scope-in

- Verificar componentes partilhados.
- Confirmar cliente API central.
- Evitar lógica HTTP duplicada em páginas.
- Preparar handoff para PT-PT e formatação europeia em MF8.

#### Scope-out

- Redesenhar a UI.
- Introduzir biblioteca de componentes nova.
- Mover todas as páginas existentes.

#### Estado antes e depois

- Antes: MF0..MF6 já entregaram autenticação, empresa ativa, permissões, documentos, relatórios, importações, auditoria e hardening básico.
- Depois: `BK-MF7-09` deixa um contrato técnico validável: fica criado um gate de modularidade frontend para reutilizar UI, clientes API e páginas por domínio.

#### Pre-requisitos

- Ler `RNF26` em `docs/RNF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`.
- Confirmar scripts reais em `apps/web/package.json` antes de acrescentar comandos.
- Confirmar que a empresa ativa continua resolvida no backend a partir da sessão.

#### Glossário

- Componente reutilizável: peça React usada em vários módulos.
- Cliente API: camada única para chamadas HTTP.
- PageFrame: estrutura visual comum da página.
- Evidence: prova objetiva que mostra o fluxo principal e os negativos.
- Empresa ativa: contexto autenticado usado pelo backend para filtrar dados por empresa.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF26` define o requisito deste BK.
- `CANONICO`: a sequência oficial da MF7 está na matriz e no backlog.
- `DERIVADO`: os nomes de scripts e ficheiros abaixo são decisões técnicas mínimas para tornar o requisito executável sem trocar a stack.

Frontend modular não é só dividir ficheiros. É partilhar estados, feedback, tabelas, layout e cliente API para que os módulos financeiros se comportem de forma consistente.

A regra de segurança transversal mantém-se: o frontend pode pedir uma ação, mas autorização, empresa ativa, permissões, validação e auditoria pertencem ao backend.

Neste BK, o contrato executável confirma quatro ideias em conjunto: páginas compostas em `App.tsx`, UI partilhada em `apps/web/src/ui`, cliente API central em `apps/web/src/lib/apiClient.ts` e sessão preservada por `credentials: "include"`. Esta combinação evita páginas isoladas com `fetch` próprio, tabelas duplicadas ou mensagens de erro inconsistentes.

Os erros principais a evitar são práticos: procurar `purchases` em `App.tsx` quando a UI usa `purchase-*`, validar `credentials: "include"` apenas em comentários, ou ligar o comando no pacote `apps/api` quando o gate pertence ao frontend. Por isso, o tutorial separa marcadores de UI e marcadores de API antes de criar o script.

#### Arquitetura do BK

- Script: `check-mf7-frontend-modules.mjs`.
- UI: `src/ui/*`.
- Clientes API: `src/lib/*`.
- Páginas: `src/pages/*`.
- Handoff para o próximo BK: `BK-MF7-10`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/scripts/check-mf7-frontend-modules.mjs`
- EDITAR: `apps/web/package.json`, apenas para acrescentar o script de validação indicado neste BK.
- REVER: `docs/RNF.md`.
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`.

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e risco principal

1. Objetivo funcional do passo no contexto da app.

Confirmar o contrato canónico antes de escrever código, para não misturar requisitos nem alterar a sequência da macrofase.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-08-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabilidade-ia.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md`

3. Instruções do que fazer.

Confirma que `RNF26` pede frontend modular e que este BK fica entre o backend modular (`BK-MF7-08`) e os testes automatizados (`BK-MF7-10`). Depois escreve uma checklist técnica com estes contratos mínimos:

- páginas compostas em `apps/web/src/App.tsx`;
- componentes partilhados em `apps/web/src/ui`;
- chamadas HTTP concentradas em `apps/web/src/lib/apiClient.ts`;
- feedback reutilizável com `StatusMessage` e `useActionFeedback`;
- tabelas reutilizáveis com `ResponsiveDataTable`;
- sessão por cookie preservada com `credentials: "include"`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura, desenho técnico ou validação documental antes da implementação.

5. Explicação do código.

Sem código neste passo porque primeiro é preciso separar contrato de implementação. O contrato vem dos documentos canónicos; a implementação concreta vem dos ficheiros em `apps/web`. Esta separação evita dois erros comuns: criar um script que valida nomes inventados, ou escrever um guia que parece correto mas não corresponde à app real.

6. Validação do passo.

Executa pesquisas rápidas a partir da raiz do repositório:

```bash
rg -n "RNF26|Frontend modular" docs/RNF.md docs/planificacao/backlogs
rg -n "PageFrame|StatusMessage|ResponsiveDataTable|useActionFeedback|apiClient|credentials:\\s*\"include\"" apps/web/src
```

A validação deste passo passa quando consegues apontar a fonte canónica (`RNF26`) e pelo menos um uso real de cada contrato frontend.

7. Cenário negativo/erro esperado.

Se o guia ou a evidence usar caminhos privados, nomes não existentes na app ou validação só documental, o BK não está pronto. Corrige primeiro o contrato para apontar apenas para `apps/web` e para marcadores reais da aplicação.

### Passo 2 - Desenhar o contrato técnico mínimo

1. Objetivo funcional do passo no contexto da app.

Definir e validar modularidade frontend com componentes reutilizáveis, cliente API e estados previsíveis.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/web/src/ui/opsaUi.tsx`
    - REVER: `apps/web/src/ui/ResponsiveDataTable.tsx`
    - REVER: `apps/web/src/ui/useActionFeedback.ts`

3. Instruções do que fazer.

Mapeia cada domínio financeiro para um marcador de página e um marcador do cliente API. Usa nomes reais da app, mesmo quando o singular/plural muda entre rota e API:

- vendas: página `sales-documents`, `SaleDocumentsPage` ou `SalesOpenItemsPage`; API `sales:` ou `/sales/`;
- compras: página `purchase-documents`, `PurchaseDocumentsPage` ou `PurchaseApprovalPage`; API `purchases:` ou `/purchases/`;
- inventário: página `inventory-counts`, `StockMovementsPage` ou `FifoCostPage`; API `inventory:` ou `/inventory/`;
- tesouraria: página `treasury-accounts`, `TreasuryAccountsPage` ou `PaymentsPage`; API `treasury:` ou `/treasury/`;
- contabilidade: página `accounting-reports`, `AccountingReportsPage` ou `ManualJournalPage`; API `accounting:`, `accountingReports:` ou `/accounting/`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura, desenho técnico ou validação documental antes da implementação.

5. Explicação do código.

Sem código neste passo porque estás a desenhar a tabela de verdade que o script vai usar no passo seguinte. A regra importante é validar UI e API separadamente. Por exemplo, procurar literalmente `purchases` em `App.tsx` pode falhar de forma injusta, porque as rotas e páginas usam `purchase-*`, enquanto o namespace HTTP vive em `apiClient.ts` como `purchases`.

6. Validação do passo.

Confirma manualmente que cada domínio tem pelo menos um marcador de UI em `apps/web/src/App.tsx` e pelo menos um marcador de API em `apps/web/src/lib/apiClient.ts`.

```bash
rg -n "sales-documents|purchase-documents|inventory-counts|treasury-accounts|accounting-reports" apps/web/src/App.tsx
rg -n "sales:|purchases:|inventory:|treasury:|accounting:|accountingReports:" apps/web/src/lib/apiClient.ts
```

7. Cenário negativo/erro esperado.

Se o script validar apenas nomes de páginas, pode deixar passar chamadas HTTP fora do cliente central. Se validar apenas namespaces de API, pode deixar passar páginas sem composição frontend real. O contrato deve cobrir os dois lados.

### Passo 3 - Criar o ficheiro principal do BK

1. Objetivo funcional do passo no contexto da app.

Definir e validar modularidade frontend com componentes reutilizáveis, cliente API e estados previsíveis.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/scripts/check-mf7-frontend-modules.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro `apps/web/scripts/check-mf7-frontend-modules.mjs` com o conteúdo completo abaixo. Mantém os imports no topo e não movas regras de segurança para o frontend.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Verifica que o frontend reutiliza páginas, clientes API e componentes comuns.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));
const requiredFiles = [
  "src/ui/opsaUi.tsx",
  "src/ui/ResponsiveDataTable.tsx",
  "src/ui/useActionFeedback.ts",
  "src/lib/apiClient.ts",
];
const requiredDomains = [
  {
    id: "sales",
    pageMarkers: ["sales-documents", "SaleDocumentsPage", "SalesOpenItemsPage"],
    apiMarkers: ["sales:", "/sales/"],
  },
  {
    id: "purchases",
    pageMarkers: ["purchase-documents", "PurchaseDocumentsPage", "PurchaseApprovalPage"],
    apiMarkers: ["purchases:", "/purchases/"],
  },
  {
    id: "inventory",
    pageMarkers: ["inventory-counts", "StockMovementsPage", "FifoCostPage"],
    apiMarkers: ["inventory:", "/inventory/"],
  },
  {
    id: "treasury",
    pageMarkers: ["treasury-accounts", "TreasuryAccountsPage", "PaymentsPage"],
    apiMarkers: ["treasury:", "/treasury/"],
  },
  {
    id: "accounting",
    pageMarkers: ["accounting-reports", "AccountingReportsPage", "ManualJournalPage"],
    apiMarkers: ["accounting:", "accountingReports:", "/accounting/"],
  },
];

/**
 * Indica se pelo menos um marcador esperado existe no texto analisado.
 *
 * @param {string} content - Conteúdo textual do ficheiro.
 * @param {string[]} markers - Marcadores que provam o contrato.
 * @returns {boolean} `true` quando o contrato foi encontrado.
 */
function hasAnyMarker(content, markers) {
  return markers.some((marker) => content.includes(marker));
}

/**
 * Remove comentários antes de validar contratos que têm de existir em código executável.
 *
 * @param {string} content - Conteúdo textual do ficheiro.
 * @returns {string} Conteúdo sem comentários de bloco ou de linha.
 */
function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

/**
 * Confirma contratos reutilizáveis mínimos do frontend.
 *
 * @returns {void}
 */
export function checkFrontendModules() {
  for (const file of requiredFiles) {
    assert.equal(existsSync(join(webRoot, file)), true, "Contrato frontend em falta: " + file);
  }
  const app = readFileSync(join(webRoot, "src/App.tsx"), "utf8");
  const apiClient = readFileSync(join(webRoot, "src/lib/apiClient.ts"), "utf8");
  const apiClientExecutable = stripComments(apiClient);

  // A App deve compor páginas e UI partilhada; lógica HTTP nova fica em src/lib.
  assert.match(app, /PageFrame/);
  assert.match(app, /StatusMessage/);

  // O cookie HttpOnly só acompanha chamadas feitas com credentials: "include" em código real.
  assert.match(apiClientExecutable, /credentials:\s*"include"/);

  for (const domain of requiredDomains) {
    // Validamos a UI e o apiClient em conjunto para não confundir nomes de página com namespaces HTTP.
    assert.equal(
      hasAnyMarker(app, domain.pageMarkers),
      true,
      "Página ou rota frontend em falta para domínio: " + domain.id,
    );
    assert.equal(
      hasAnyMarker(apiClientExecutable, domain.apiMarkers),
      true,
      "Cliente API em falta para domínio: " + domain.id,
    );
  }
}

checkFrontendModules();
console.log("MF7 frontend modular: OK");
```

5. Explicação do código.

O bloco cria um contrato pequeno e testável para este BK. Primeiro confirma que os ficheiros partilhados existem: `opsaUi.tsx`, `ResponsiveDataTable.tsx`, `useActionFeedback.ts` e `apiClient.ts`. Depois lê `App.tsx` e `apiClient.ts`, porque a modularidade frontend depende destes dois lados: a UI deve compor páginas reutilizáveis e as chamadas HTTP devem passar pelo cliente central. A função `stripComments` remove comentários antes de validar o cliente API, para impedir que um texto explicativo faça passar um contrato que desapareceu do código real.

A lista `requiredDomains` usa marcadores reais da app. No domínio de compras, por exemplo, a UI usa nomes `purchase-*`, enquanto o cliente API expõe o namespace `purchases`. O script valida ambos em separado para evitar o erro de procurar literalmente `purchases` em `App.tsx`. A validação de `credentials: "include"` protege o contrato de sessão por cookie HttpOnly herdado da MF0/MF6. O aluno pode acrescentar novos marcadores quando criar páginas novas, mas não deve remover a validação do `apiClient`, porque isso permitiria chamadas HTTP soltas sem sessão, feedback comum ou tratamento de erro consistente.

6. Validação do passo.

Executa a validação sintática do ficheiro quando estiver criado: `cd apps/web && node --check scripts/check-mf7-frontend-modules.mjs`. A partir da raiz do repositório, o comando equivalente é `node apps/web/scripts/check-mf7-frontend-modules.mjs`.

7. Cenário negativo/erro esperado.

Componente obrigatório, cliente API ou estado de feedback em falta deve falhar no gate frontend com caminho claro.

### Passo 4 - Ligar o contrato ao módulo certo

1. Objetivo funcional do passo no contexto da app.

Usar o gate frontend para impedir páginas isoladas sem cliente API, feedback ou componentes partilhados.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/package.json`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/web/src/ui/*`
    - LOCALIZAÇÃO: scripts web e composição principal da aplicação.

3. Instruções do que fazer.

Acrescenta um script `check:mf7:frontend-modules` em `apps/web/package.json`. Depois confirma que páginas de vendas, compras, inventário, tesouraria e contabilidade reutilizam UI partilhada e fazem chamadas HTTP através de `apiClient`.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "check:mf7:frontend-modules": "node scripts/check-mf7-frontend-modules.mjs"
  }
}
```

5. Explicação do código.

O script fica no pacote web porque valida ficheiros de `apps/web`. O gate exige cliente API com cookies de sessão, UI partilhada e presença dos domínios principais. Isto reduz o risco de cada página criar fetches, tabelas e mensagens de erro próprias.

6. Validação do passo.

Executa `cd apps/web && npm run check:mf7:frontend-modules`. Depois remove temporariamente `credentials: "include"` do cliente API e confirma que o gate falha.

7. Cenário negativo/erro esperado.

Uma página nova que chama `fetch` diretamente sem `apiClient` deve ser corrigida antes de avançar, porque poderia quebrar sessão e feedback comum.

### Passo 5 - Adicionar comando de validação

1. Objetivo funcional do passo no contexto da app.

Tornar o gate executável por qualquer pessoa da equipa sem depender de comandos avulsos.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/package.json`
    - REVER: `apps/web/scripts/check-mf7-frontend-modules.mjs`

3. Instruções do que fazer.

Confirma que o `package.json` de `apps/web` tem o script indicado no passo 4. Depois valida o ficheiro criado antes de executar o gate completo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura, desenho técnico ou validação documental antes da implementação.

5. Explicação do código.

Sem código adicional neste passo porque o código já foi criado no passo 3 e ligado no passo 4. Aqui o foco é confirmar que o comando oficial chama o ficheiro certo e que a validação sintática não depende do ambiente de browser.

6. Validação do passo.

Executa:

```bash
cd apps/web && node --check scripts/check-mf7-frontend-modules.mjs
cd apps/web && npm run check:mf7:frontend-modules
```

O output esperado do segundo comando é:

```text
MF7 frontend modular: OK
```

7. Cenário negativo/erro esperado.

Se o script não existir, o erro esperado é de ficheiro em falta. Se o script existir mas o comando em `package.json` apontar para outro caminho, o `npm run check:mf7:frontend-modules` deve falhar e o caminho do script deve ser corrigido.

### Passo 6 - Executar negativos obrigatórios

1. Objetivo funcional do passo no contexto da app.

Provar que o gate não passa apenas em cenário feliz e que apanha regressões importantes.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/web/scripts/check-mf7-frontend-modules.mjs`

3. Instruções do que fazer.

Executa negativos em cópias temporárias ou reverte imediatamente as alterações de teste. Não deixes ficheiros permanentes alterados depois dos negativos.

1. Remove temporariamente a propriedade `credentials: "include"` das opções do `fetch` em `apps/web/src/lib/apiClient.ts`.
2. Remove temporariamente todos os marcadores de página de compras usados pelo contrato, por exemplo `purchase-documents`, `PurchaseDocumentsPage` e `PurchaseApprovalPage`, de `apps/web/src/App.tsx`.
3. Remove temporariamente todos os marcadores API de compras usados pelo contrato, por exemplo `purchases:` e `/purchases/`, de `apps/web/src/lib/apiClient.ts`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura, desenho técnico ou validação documental antes da implementação.

5. Explicação do código.

Sem código novo neste passo porque os negativos testam o código já criado. O primeiro negativo protege sessão autenticada por cookie. O segundo protege composição real das páginas. O terceiro protege centralização das chamadas HTTP por domínio.

6. Validação do passo.

Cada negativo deve falhar com uma mensagem útil:

- sem `credentials: "include"` nas opções do `fetch`: falha no `assert.match(apiClientExecutable, /credentials:\s*"include"/)`;
- sem marcadores de compras em `App.tsx`: `Página ou rota frontend em falta para domínio: purchases`;
- sem marcadores API de compras em `apiClient.ts`: `Cliente API em falta para domínio: purchases`.

7. Cenário negativo/erro esperado.

Se um negativo continuar a passar depois de remover o contrato correspondente, o gate está demasiado fraco. Nesse caso, reforça os marcadores do domínio antes de fechar o BK.

### Passo 7 - Fechar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com validação, evidence e handoff mensurável para a próxima entrega.

2. Ficheiros envolvidos:
    - REVER: `apps/web/scripts/check-mf7-frontend-modules.mjs`
    - REVER: `apps/web/package.json`
    - REVER: evidence do PR ou pacote de entrega

3. Instruções do que fazer.

Regista a evidence final com comandos, outputs e negativos. Usa este modelo:

4. Código completo, correto e integrado com a app final.

```md
# Evidence BK-MF7-09 - Frontend modular

## Fonte
- RNF26: frontend modular.
- Guia: docs/planificacao/guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md.

## Proof
- Comando: cd apps/web && node --check scripts/check-mf7-frontend-modules.mjs
- Resultado: sem erros de sintaxe.
- Comando: cd apps/web && npm run check:mf7:frontend-modules
- Resultado: MF7 frontend modular: OK

## Negativos
- Sem credentials include nas opções do fetch: falha no contrato de sessão.
- Sem marcadores de página de compras: falha com Página ou rota frontend em falta para domínio: purchases.
- Sem marcadores API de compras: falha com Cliente API em falta para domínio: purchases.

## Multiempresa
- A empresa ativa continua resolvida no backend a partir da sessão autenticada.
- O frontend não escolhe empresa por parâmetro livre.

## Handoff
- BK-MF7-10 pode reutilizar este gate como pré-condição dos testes automatizados.
```

5. Explicação do código.

O bloco acima é um modelo de evidence em Markdown, não código da aplicação. Ele separa `proof` positivo, negativos e handoff, o que facilita defesa técnica e revisão por outra pessoa.

6. Validação do passo.

Antes de fechar, confirma que a evidence contém obrigatoriamente as palavras `proof`, `negativos`, `fonte` e `multiempresa`, além do output `MF7 frontend modular: OK`.

7. Cenário negativo/erro esperado.

Evidence sem negativos executados, ou evidence baseada em caminhos privados, não é aceite para este BK.

#### Critérios de aceite

- O requisito `RNF26` fica demonstrável por ficheiro, script, teste ou output controlado.
- O código indicado tem JSDoc nos elementos principais e comentários didáticos junto das decisões de segurança ou domínio.
- O backend mantém autenticação, autorização e empresa ativa como fonte de verdade.
- Negativos: minimo `3` cenários com resultado esperado documentado.
- Não há caminhos privados nem linguagem interna no guia.

#### Validação final

- `git diff --check` deve sair limpo.
- `bash scripts/validate-planificacao.sh` deve manter `overall_pass=true`; advisory antigo fora da MF7 pode continuar registado.
- Validar o ficheiro criado com `cd apps/web && node --check scripts/check-mf7-frontend-modules.mjs`.
- Validar o gate com `cd apps/web && npm run check:mf7:frontend-modules`.

#### Evidence para PR/defesa

- `pr`: referência do PR ou pacote de entrega.
- `proof`: output do script/teste criado neste BK.
- `neg`: negativos executados e mensagens observadas.
- `fonte`: `docs/RNF.md`, matriz, backlog e este guia.
- `multiempresa`: confirmação de que a empresa ativa vem do contexto autenticado no backend.

#### Handoff

- Proximo BK recomendado: `BK-MF7-10`
- Este BK entrega a `BK-MF7-10` um contrato validado: fica criado um gate de modularidade frontend para reutilizar UI, clientes API e páginas por domínio.
- Risco restante: decisões externas de fornecedor, certificação ou infraestrutura devem ficar documentadas antes de produção real.

#### Changelog

- `2026-06-27`: removido o layout antigo de blocos introdutórios e comando isolado, mantendo o conteúdo útil dentro das secções obrigatórias.
- `2026-06-27`: corrigidos marcadores reais de compras, passos 1/2/5/6/7, comandos frontend, evidence obrigatória e blocos reconhecidos pelo validador.
- `2026-06-25`: guia reescrito para tutorial técnico linear, autocontido e alinhado com a MF7 completa.
