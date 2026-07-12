# BK-MF7-10 - Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação).

## Header

- `doc_id`: `GUIA-BK-MF7-10`
- `bk_id`: `BK-MF7-10`
- `macro`: `MF7`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF27`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-01`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md`
- `last_updated`: `2026-07-10`

#### Contrato de testes atualizado

Os módulos críticos exigem testes persistidos PostgreSQL, concorrência e isolamento multiempresa, além de unitários/contratos. A matriz cobre Redis entre duas instâncias, SMTP sandbox, S3, backup/restore, SAF-T XSD/reconciliação, health negativo, browser Playwright/axe e 25 utilizadores autenticados concorrentes. Um check por imports/regex não substitui comportamento. `skip`, suite não iniciada ou serviço ausente é `BLOQUEADO_AMBIENTE`, nunca PASS, e o gate académico exige zero skips.

#### Objetivo

Neste BK vais implementar um gate de testes automatizados para o requisito `RNF27`: os módulos críticos de faturação, IVA, balancetes e reconciliação passam a ter um contrato executável que falha quando uma peça essencial desaparece.

O objetivo não é substituir todos os testes unitários ou de integração. O objetivo é criar uma primeira barreira de qualidade, rápida e reproduzível, que confirma que os services financeiros principais continuam a existir, continuam filtrados por empresa e continuam ligados aos dados que alimentam a contabilidade e a auditoria.

#### Importância

Num ERP financeiro, uma alteração pequena pode quebrar um fluxo importante: uma fatura pode deixar de calcular IVA, um balancete pode deixar de filtrar a empresa ativa, ou uma importação bancária pode deixar de registar logs de integração. O `RNF27` existe para reduzir esse risco antes de a app chegar à defesa e antes de uma alteração entrar no código principal.

Este BK fecha a MF7 com uma prova técnica que prepara `BK-MF8-01`: os logs estruturados da MF8 precisam de módulos críticos previsíveis, rastreáveis e testáveis.

#### Scope-in

- Criar `apps/api/tests/contracts/mf7-critical-modules.test.js`.
- Validar presença de contratos reais em faturação, IVA, balancetes e reconciliação bancária.
- Confirmar que os módulos críticos continuam a usar contexto multiempresa no backend.
- Expor um script específico `test:mf7:critical-modules` em `apps/api/package.json`.
- Definir negativos reproduzíveis e evidence para PR/defesa.

#### Scope-out

- Criar testes de carga.
- Criar dados reais de produção.
- Reescrever os services de faturação, IVA, relatórios contabilísticos ou tesouraria.
- Criar endpoints novos.
- Substituir as suites `unit`, `contracts` ou `integration` já existentes.
- Automatizar certificação fiscal ou integrações bancárias de produção.

#### Estado antes e depois

- Antes: MF0..MF6 já entregaram autenticação, empresa ativa, permissões, documentos de venda, mapas de IVA, balancete/razão, importação de extratos, auditoria e logs de integração.
- Depois: `BK-MF7-10` acrescenta uma suite de contrato que valida os pontos mínimos desses módulos críticos e fica pronta para correr isoladamente ou dentro dos contratos backend.

#### Pre-requisitos

- Ler `RNF27` em `docs/RNF.md`.
- Rever `BK-MF7-08`, porque o backend modular prepara a organização por domínio.
- Rever `BK-MF7-09`, porque a modularidade frontend pode ser usada como precondição de qualidade da MF7.
- Rever `BK-MF6-10`, porque operações sensíveis exigem auditoria.
- Confirmar que existem estes ficheiros em `apps/api`:
  - `apps/api/src/modules/sales/saleDocumentService.js`
  - `apps/api/src/modules/tax/vatMapService.js`
  - `apps/api/src/modules/accounting-reports/accountingReportService.js`
  - `apps/api/src/modules/treasury/statementImportService.js`
  - `apps/api/package.json`
- Confirmar que a empresa ativa continua resolvida no backend e não vem escolhida pelo frontend.

#### Glossário

- Teste de contrato: teste que confirma que uma fronteira técnica mantém os nomes, ficheiros e invariantes mínimos esperados por outros módulos.
- Módulo crítico: parte da app cujo erro pode afetar faturação, IVA, contabilidade, tesouraria, reporting ou auditoria.
- Faturação: criação e emissão de documentos de venda, com totais e IVA calculados no backend.
- IVA: imposto tratado em mapas que agregam IVA liquidado e dedutível a partir de documentos contabilizados.
- Balancete: relatório contabilístico que resume débitos, créditos e saldos por conta SNC.
- Reconciliação bancária: sugestão de correspondência entre linhas de extrato e recebimentos ou pagamentos.
- Evidence: prova objetiva da execução, com comando, output e negativos observados.
- Empresa ativa: empresa obtida a partir da sessão/contexto autenticado, usada para filtrar dados no backend.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF27` pede testes automatizados para módulos críticos: faturação, IVA, balancetes e reconciliação.
- `CANONICO`: `BK-MF7-10` é o último BK da MF7 e prepara `BK-MF8-01`.
- `DERIVADO`: a suite `mf7-critical-modules.test.js` é uma decisão técnica mínima para transformar `RNF27` numa prova executável com a stack Node.js já usada em `apps/api`.
- `DERIVADO`: o script `test:mf7:critical-modules` dá feedback rápido sem substituir `test:contracts`.

Um teste de contrato não prova todos os cálculos financeiros. Ele prova que as fronteiras críticas continuam presentes. Neste BK, o contrato valida quatro áreas:

- Faturação: o service de vendas mantém criação, emissão, totais, IVA, período fiscal aberto, empresa ativa e auditoria.
- IVA: o service de mapa de IVA mantém período, empresa ativa, IVA liquidado, IVA dedutível, saldo de IVA e fonte contabilística.
- Balancetes: o service contabilístico mantém `buildTrialBalance`, `buildLedger`, linhas de diário, contas e totais.
- Reconciliação: o service de extratos mantém importação, deduplicação, sugestões, logs de integração e empresa ativa.

O frontend não decide ownership, empresa ativa, role ou permissão final. Mesmo quando este BK testa por leitura de ficheiros, o critério de qualidade continua backend-first: os módulos críticos têm de provar que usam `companyId` como contexto interno e que preservam auditoria ou logs quando mexem em dados sensíveis.

#### Arquitetura do BK

- Teste principal: `apps/api/tests/contracts/mf7-critical-modules.test.js`
- Package a editar: `apps/api/package.json`
- Runner: `node:test`
- Módulos verificados:
  - `apps/api/src/modules/sales/saleDocumentService.js`
  - `apps/api/src/modules/tax/vatMapService.js`
  - `apps/api/src/modules/accounting-reports/accountingReportService.js`
  - `apps/api/src/modules/treasury/statementImportService.js`
- Handoff: `BK-MF8-01` recebe uma baseline de módulos críticos já validada por contrato.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/tests/contracts/mf7-critical-modules.test.js`
- EDITAR: `apps/api/package.json`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-08-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabilidade-ia.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar o contrato RNF27

1. Objetivo funcional do passo no contexto da app.

Confirmar que vais testar os módulos certos antes de escrever o ficheiro de testes.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md`
    - LOCALIZAÇÃO: entradas `RNF27`, `BK-MF7-09` e `BK-MF7-10`.

3. Instruções do que fazer.

Confirma que `RNF27` fala de testes automatizados para faturação, IVA, balancetes e reconciliação. Depois confirma que `BK-MF7-09` é o BK anterior e que `BK-MF8-01` é o próximo BK.

Não alteres metadados do header. A matriz e o backlog mantêm `dependencias: -`; tecnicamente, este BK consome contratos anteriores, mas essa dependência não deve ser inventada no header sem alteração canónica.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental: serve para confirmar que o teste nasce do `RNF27` e da sequência oficial da MF7.

5. Explicação do código.

Sem código neste passo porque ainda não estás a implementar a suite. Primeiro fechas o contrato: que requisito estás a provar, que módulos entram, que BK anterior prepara esta validação e que BK seguinte recebe a evidence.

6. Validação do passo.

Executa estas pesquisas:

```bash
rg -n "RNF27|BK-MF7-10|Testes automatizados" docs/RNF.md docs/planificacao/backlogs
rg -n "BK-MF7-10" docs/planificacao/guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md
```

Resultado esperado: encontras `RNF27`, encontras `BK-MF7-10` na matriz/backlog e encontras o handoff vindo de `BK-MF7-09`.

7. Cenário negativo/erro esperado.

Se a pesquisa não encontrar `RNF27` ou se o BK alvo não existir na matriz/backlog, não avances para testes. Regista o bloqueio na evidence, porque o teste ficaria sem contrato canónico.

### Passo 2 - Mapear os módulos críticos reais

1. Objetivo funcional do passo no contexto da app.

Confirmar os ficheiros reais que a suite vai ler e os marcadores que representam cada contrato crítico.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/sales/saleDocumentService.js`
    - REVER: `apps/api/src/modules/tax/vatMapService.js`
    - REVER: `apps/api/src/modules/accounting-reports/accountingReportService.js`
    - REVER: `apps/api/src/modules/treasury/statementImportService.js`
    - LOCALIZAÇÃO: funções exportadas e invariantes de domínio.

3. Instruções do que fazer.

Lê os quatro ficheiros e confirma estes marcadores reais:

- Faturação: `createSaleDocument`, `issueSaleDocument`, `assertOpenFiscalPeriod`, `totalCents`, `vatCents`, `auditLog.create`, `companyId`.
- IVA: `buildVatMap`, `fromDate`, `toDate`, `liquidatedVatCents`, `deductibleVatCents`, `vatBalanceCents`, `companyId`.
- Balancetes: `buildTrialBalance`, `buildLedger`, `journalEntry`, `debitCents`, `creditCents`, `balanceCents`, `companyId`.
- Reconciliação: `importBankStatement`, `deduplicateStatementRows`, `buildSuggestions`, `bankReconciliationSuggestion`, `recordIntegrationLog`, `companyId`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de análise técnica antes da criação do teste.

5. Explicação do código.

Sem código neste passo porque a decisão importante é escolher marcadores existentes. Um marcador como `totalGrossCents` parece plausível, mas não pertence ao service atual. O contrato deve usar `totalCents`, porque esse é o campo realmente gravado e auditado nos documentos de venda.

6. Validação do passo.

Executa:

```bash
rg -n "createSaleDocument|issueSaleDocument|totalCents|vatCents|auditLog.create|companyId" apps/api/src/modules/sales/saleDocumentService.js
rg -n "buildVatMap|fromDate|toDate|liquidatedVatCents|deductibleVatCents|vatBalanceCents|companyId" apps/api/src/modules/tax/vatMapService.js
rg -n "buildTrialBalance|buildLedger|journalEntry|debitCents|creditCents|balanceCents|companyId" apps/api/src/modules/accounting-reports/accountingReportService.js
rg -n "importBankStatement|deduplicateStatementRows|buildSuggestions|bankReconciliationSuggestion|recordIntegrationLog|companyId" apps/api/src/modules/treasury/statementImportService.js
```

Resultado esperado: cada comando encontra os marcadores indicados.

7. Cenário negativo/erro esperado.

Se um marcador não existir, não o substituas por outro ao acaso. Revê o service e escolhe um marcador que prove a mesma regra de domínio. Exemplo: para balancete, usa `buildTrialBalance`, não `trialBalance`, porque o nome real da função exportada é `buildTrialBalance`.

### Passo 3 - Criar o teste de contrato dos módulos críticos

1. Objetivo funcional do passo no contexto da app.

Criar a suite automatizada que transforma o `RNF27` numa validação executável.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf7-critical-modules.test.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria `apps/api/tests/contracts/mf7-critical-modules.test.js` com o conteúdo completo abaixo. Mantém o teste dentro de `apps/api/tests/contracts`, porque `npm run test:contracts` já executa `tests/contracts/*.test.js`.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Testes de contrato para módulos críticos cobertos por RNF27.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const criticalContracts = [
    {
        domain: "faturação",
        file: "src/modules/sales/saleDocumentService.js",
        requiredMarkers: [
            "createSaleDocument",
            "issueSaleDocument",
            "assertOpenFiscalPeriod",
            "totalCents",
            "vatCents",
            "auditLog.create",
            "companyId",
        ],
        forbiddenMarkers: ["totalGrossCents"],
    },
    {
        domain: "IVA",
        file: "src/modules/tax/vatMapService.js",
        requiredMarkers: [
            "buildVatMap",
            "fromDate",
            "toDate",
            "liquidatedVatCents",
            "deductibleVatCents",
            "vatBalanceCents",
            "companyId",
        ],
        forbiddenMarkers: [],
    },
    {
        domain: "balancetes",
        file: "src/modules/accounting-reports/accountingReportService.js",
        requiredMarkers: [
            "buildTrialBalance",
            "buildLedger",
            "journalEntry",
            "debitCents",
            "creditCents",
            "balanceCents",
            "companyId",
        ],
        forbiddenMarkers: ["trialBalance"],
    },
    {
        domain: "reconciliação",
        file: "src/modules/treasury/statementImportService.js",
        requiredMarkers: [
            "importBankStatement",
            "deduplicateStatementRows",
            "buildSuggestions",
            "bankReconciliationSuggestion",
            "recordIntegrationLog",
            "companyId",
        ],
        forbiddenMarkers: [],
    },
];

/**
 * Lê um ficheiro da API a partir da pasta de testes de contrato.
 *
 * @param {string} file - Caminho relativo dentro de `apps/api`.
 * @returns {string} Conteúdo textual do ficheiro.
 */
function readApiFile(file) {
    return readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
}

/**
 * Confirma que todos os marcadores esperados continuam presentes.
 *
 * @param {{ domain: string, file: string, requiredMarkers: string[] }} contract - Contrato crítico.
 * @param {string} content - Conteúdo do ficheiro analisado.
 * @returns {void}
 */
function assertRequiredMarkers(contract, content) {
    for (const marker of contract.requiredMarkers) {
        assert.ok(
            content.includes(marker),
            `${contract.domain}: ${contract.file} deve manter o marcador crítico ${marker}`,
        );
    }
}

/**
 * Confirma que marcadores errados não voltam a entrar no contrato.
 *
 * @param {{ domain: string, file: string, forbiddenMarkers: string[] }} contract - Contrato crítico.
 * @param {string} content - Conteúdo do ficheiro analisado.
 * @returns {void}
 */
function assertForbiddenMarkers(contract, content) {
    for (const marker of contract.forbiddenMarkers) {
        assert.equal(
            content.includes(marker),
            false,
            `${contract.domain}: ${contract.file} não deve usar marcador obsoleto ${marker}`,
        );
    }
}

test("RNF27 mantém contratos críticos de faturação, IVA, balancetes e reconciliação", () => {
    for (const contract of criticalContracts) {
        const content = readApiFile(contract.file);

        // Cada domínio precisa de pelo menos um export para ser testável por outras suites.
        assert.ok(
            content.includes("export"),
            `${contract.domain}: ${contract.file} deve expor funções testáveis`,
        );
        assertRequiredMarkers(contract, content);
    }
});

test("RNF27 mantém contexto multiempresa nos módulos críticos", () => {
    for (const contract of criticalContracts) {
        const content = readApiFile(contract.file);

        // O companyId tem de aparecer nos services para impedir leituras entre empresas.
        assert.ok(
            content.includes("companyId"),
            `${contract.domain}: ${contract.file} deve filtrar por empresa ativa no backend`,
        );
        assert.equal(
            content.includes("req.body.companyId") || content.includes("req.query.companyId"),
            false,
            `${contract.domain}: ${contract.file} não deve aceitar empresa ativa vinda do pedido HTTP`,
        );
    }
});

test("RNF27 rejeita marcadores obsoletos que não existem nos services reais", () => {
    for (const contract of criticalContracts) {
        const content = readApiFile(contract.file);

        // Este negativo impede regressões para nomes conceptuais que não pertencem à app.
        assertForbiddenMarkers(contract, content);
    }
});
```

5. Explicação do código.

O ficheiro usa `node:test`, que já é o runner usado pelo backend. A lista `criticalContracts` é o centro do BK: cada objeto liga um domínio financeiro a um ficheiro real e a marcadores que provam contratos mínimos.

Na faturação, o teste procura `createSaleDocument`, `issueSaleDocument`, `totalCents`, `vatCents`, `assertOpenFiscalPeriod`, `auditLog.create` e `companyId`. Isto confirma que o service continua a calcular totais e IVA no backend, continua a bloquear períodos fiscais fechados e continua a registar auditoria.

No IVA, o teste procura `buildVatMap`, datas de período, IVA liquidado, IVA dedutível, saldo de IVA e empresa ativa. Isto evita transformar o mapa de IVA numa exportação genérica sem ligação contabilística.

Nos balancetes, o teste procura `buildTrialBalance`, `buildLedger`, `journalEntry` e totais de débito, crédito e saldo. Isto protege o relatório contabilístico contra uma regressão para dados soltos sem diário contabilístico.

Na reconciliação, o teste procura importação de extratos, deduplicação, sugestões, `bankReconciliationSuggestion`, `recordIntegrationLog` e empresa ativa. Isto confirma que a app sugere correspondências sem confirmar ações automaticamente e que a importação fica rastreável.

O segundo teste reforça a regra multiempresa: os services podem receber `companyId` como contexto backend, mas não devem aceitar `req.body.companyId` nem `req.query.companyId` como fonte da empresa ativa.

O terceiro teste bloqueia regressões para nomes que pareciam válidos mas não pertencem ao código real, como `totalGrossCents` ou `trialBalance`.

6. Validação do passo.

Depois de criares o ficheiro, executa:

```bash
cd apps/api
node --check tests/contracts/mf7-critical-modules.test.js
node --test tests/contracts/mf7-critical-modules.test.js
```

Resultado esperado:

```txt
ok 1 - RNF27 mantém contratos críticos de faturação, IVA, balancetes e reconciliação
ok 2 - RNF27 mantém contexto multiempresa nos módulos críticos
ok 3 - RNF27 rejeita marcadores obsoletos que não existem nos services reais
```

7. Cenário negativo/erro esperado.

Remove temporariamente `buildSuggestions` de uma cópia local de `apps/api/src/modules/treasury/statementImportService.js` e executa novamente o teste. Resultado esperado: a suite falha com mensagem a indicar que o domínio `reconciliação` perdeu o marcador crítico `buildSuggestions`. Repõe o ficheiro antes de continuar.

### Passo 4 - Ligar a suite aos scripts da API

1. Objetivo funcional do passo no contexto da app.

Garantir que o teste corre isoladamente e também fica compatível com o fluxo de contratos backend.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: objeto `"scripts"`.

3. Instruções do que fazer.

Edita apenas `apps/api/package.json`. Acrescenta `test:mf7:critical-modules`. Se `test:mf7` ainda não existir, cria-o a apontar para este teste. Se já existir por causa de outro BK da MF7, preserva o comando existente e junta `&& npm run test:mf7:critical-modules` no fim.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "dev": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:validate": "prisma validate",
    "migration:precheck-mf0": "node scripts/precheck-mf0-migration.js",
    "syntax:check": "find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check",
    "test": "npm run test:unit && npm run test:contracts",
    "test:unit": "node --test tests/unit/*.test.js",
    "test:contracts": "node --test tests/contracts/*.test.js",
    "test:integration": "node --test tests/integration/*.test.js",
    "test:mf7:critical-modules": "node --test tests/contracts/mf7-critical-modules.test.js",
    "test:mf7": "npm run test:mf7:critical-modules"
  }
}
```

5. Explicação do código.

`test:mf7:critical-modules` é o comando específico deste BK. Ele corre apenas a suite criada no passo 3 e dá feedback rápido quando o aluno está a trabalhar no `RNF27`.

`test:contracts` já apanha `tests/contracts/*.test.js`, por isso a suite também entra no fluxo geral de contratos backend. O script `test:mf7` serve como agregador da macrofase. Neste momento aponta para este BK; se os BKs anteriores já tiverem acrescentado outros scripts MF7, o agregador deve preservar esses comandos e acrescentar este no fim.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run test:mf7:critical-modules
npm run test:contracts
```

Resultado esperado: ambos terminam com exit code `0`.

7. Cenário negativo/erro esperado.

Remove temporariamente a entrada `test:mf7:critical-modules` do `package.json` e executa `npm run test:mf7:critical-modules`. Resultado esperado: o npm falha por script ausente. Repõe o script antes de seguir.

### Passo 5 - Validar a suite contra os módulos atuais

1. Objetivo funcional do passo no contexto da app.

Provar que o teste usa nomes reais e que não bloqueia a app por marcadores inventados.

2. Ficheiros envolvidos:
    - REVER: `apps/api/tests/contracts/mf7-critical-modules.test.js`
    - REVER: `apps/api/src/modules/sales/saleDocumentService.js`
    - REVER: `apps/api/src/modules/tax/vatMapService.js`
    - REVER: `apps/api/src/modules/accounting-reports/accountingReportService.js`
    - REVER: `apps/api/src/modules/treasury/statementImportService.js`
    - LOCALIZAÇÃO: execução dos comandos de teste.

3. Instruções do que fazer.

Executa primeiro o teste específico e depois a suite de contratos. Se o teste falhar, lê a mensagem e confirma se a falha é um problema real do service ou se escolheste um marcador frágil.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação dos ficheiros criados nos passos anteriores.

5. Explicação do código.

Sem código neste passo porque já criaste o teste e o script. Agora estás a confirmar a integração. Esta validação fecha o erro mais comum deste BK: criar uma suite que parece correta no papel, mas falha contra o código real por usar nomes que não existem.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run test:mf7:critical-modules
npm run test:contracts
```

Guarda na evidence o comando e o output. Resultado esperado:

```txt
# pass 3
# fail 0
```

7. Cenário negativo/erro esperado.

Altera temporariamente `totalCents` para `totalGrossCents` no teste e executa `npm run test:mf7:critical-modules`. Resultado esperado: a suite falha, porque `totalGrossCents` não é o campo real do service de vendas. Repõe `totalCents` antes de fechar.

### Passo 6 - Executar negativos obrigatórios

1. Objetivo funcional do passo no contexto da app.

Confirmar que a suite falha quando um contrato crítico desaparece, em vez de apenas passar em ambiente feliz.

2. Ficheiros envolvidos:
    - REVER: `apps/api/tests/contracts/mf7-critical-modules.test.js`
    - REVER: cópia local temporária dos services críticos durante a validação manual.
    - LOCALIZAÇÃO: negativos de faturação, balancetes e reconciliação.

3. Instruções do que fazer.

Executa pelo menos estes três negativos, um de cada vez, sempre repondo o ficheiro antes do próximo:

- Negativo de faturação: remove temporariamente `assertOpenFiscalPeriod` de uma cópia local de `saleDocumentService.js`.
- Negativo de balancete: remove temporariamente `buildTrialBalance` de uma cópia local de `accountingReportService.js`.
- Negativo de reconciliação: remove temporariamente `recordIntegrationLog` de uma cópia local de `statementImportService.js`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação negativa controlada.

5. Explicação do código.

Sem código neste passo porque não vais guardar alterações nos services. Os negativos servem para provar que a suite falha pelas razões certas. Isto é essencial em testes automatizados: um teste que nunca falha quando tiras a regra principal não protege o produto.

6. Validação do passo.

Para cada negativo, executa:

```bash
cd apps/api
npm run test:mf7:critical-modules
```

Resultados esperados:

- Sem `assertOpenFiscalPeriod`: falha no domínio `faturação`.
- Sem `buildTrialBalance`: falha no domínio `balancetes`.
- Sem `recordIntegrationLog`: falha no domínio `reconciliação`.

Depois de repor os ficheiros, executa novamente:

```bash
cd apps/api
npm run test:mf7:critical-modules
```

Resultado esperado: a suite volta a passar.

7. Cenário negativo/erro esperado.

Se remover `recordIntegrationLog` não fizer a suite falhar, o teste não está a proteger logs de integração da importação bancária. Corrige `requiredMarkers` antes de fechar o BK.

### Passo 7 - Fechar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Registar provas objetivas para PR/defesa e entregar a MF8 uma baseline de qualidade verificável.

2. Ficheiros envolvidos:
    - REVER: `apps/api/tests/contracts/mf7-critical-modules.test.js`
    - REVER: `apps/api/package.json`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`
    - LOCALIZAÇÃO: secções `Evidence para PR/defesa` e `Handoff`.

3. Instruções do que fazer.

Regista na PR ou no pacote de entrega:

- comando `node --check tests/contracts/mf7-critical-modules.test.js`;
- comando `npm run test:mf7:critical-modules`;
- comando `npm run test:contracts`;
- três negativos executados e mensagem observada;
- confirmação de que `apps/api/package.json` expõe o script específico;
- confirmação de que não editaste `apps/web/package.json` neste BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha a entrega e organiza a evidence.

5. Explicação do código.

Sem código neste passo porque a alteração técnica já está nos passos 3 e 4. A evidence fecha a rastreabilidade: mostra que o teste existe, compila, passa, entra nos contratos backend e falha quando uma proteção crítica é retirada.

6. Validação do passo.

Executa a validação final:

```bash
cd apps/api
node --check tests/contracts/mf7-critical-modules.test.js
npm run test:mf7:critical-modules
npm run test:contracts
cd ../..
git diff --check
bash scripts/validate-planificacao.sh
```

Resultado esperado:

- `node --check` termina sem output.
- `npm run test:mf7:critical-modules` passa.
- `npm run test:contracts` passa.
- `git diff --check` termina sem output.
- `validate-planificacao.sh` mantém `overall_pass=true`.

7. Cenário negativo/erro esperado.

Se `validate-planificacao.sh` mantiver apenas `advisory_pass=false` por dívida documental antiga fora deste BK, regista isso na evidence. Se surgir erro novo em `BK-MF7-10`, corrige antes de fechar.

#### Critérios de aceite

- `apps/api/tests/contracts/mf7-critical-modules.test.js` existe e usa `node:test`.
- O teste valida faturação, IVA, balancetes e reconciliação com marcadores reais dos services.
- O teste confirma `companyId` nos services críticos e rejeita `req.body.companyId` ou `req.query.companyId` como fonte de empresa ativa.
- O teste rejeita marcadores obsoletos como `totalGrossCents` e `trialBalance`.
- `apps/api/package.json` expõe `test:mf7:critical-modules`.
- `npm run test:mf7:critical-modules` passa.
- `npm run test:contracts` passa.
- Existem pelo menos três negativos com falha esperada documentada.
- O guia não usa caminhos privados nem manda editar `apps/web/package.json`.

#### Validação final

Executa:

```bash
cd apps/api
node --check tests/contracts/mf7-critical-modules.test.js
npm run test:mf7:critical-modules
npm run test:contracts
cd ../..
git diff --check
bash scripts/validate-planificacao.sh
```

Resultados esperados:

- `node --check`: sem output.
- `npm run test:mf7:critical-modules`: `3` testes a passar.
- `npm run test:contracts`: suite de contratos backend a passar.
- `git diff --check`: sem output.
- `validate-planificacao.sh`: `overall_pass=true`; se existir `advisory_pass=false` antigo, regista o detalhe na evidence.

#### Evidence para PR/defesa

- `pr`: referência do PR ou pacote de entrega.
- `proof`: output de `node --check`, `npm run test:mf7:critical-modules` e `npm run test:contracts`.
- `neg`: resultados dos três negativos obrigatórios:
  - remover `assertOpenFiscalPeriod` falha em faturação;
  - remover `buildTrialBalance` falha em balancetes;
  - remover `recordIntegrationLog` falha em reconciliação.
- `fonte`: `RNF27`, matriz, backlog, `BK-MF7-09` e este guia.
- `multiempresa`: confirmação de que a empresa ativa vem do contexto backend e que o teste rejeita `req.body.companyId` e `req.query.companyId`.
- `handoff`: indicação de que `BK-MF8-01` recebe módulos críticos com contrato automatizado.

#### Handoff

- Próximo BK recomendado: `BK-MF8-01`
- Este BK entrega uma suite de contrato backend para módulos críticos.
- `BK-MF8-01` pode usar esta baseline para garantir que logs estruturados são acrescentados sobre services que continuam testáveis.
- Risco restante: esta suite é um gate de contrato, não substitui testes funcionais completos com base de dados, autenticação real e cenários contabilísticos detalhados.

#### Changelog

- `2026-06-25`: guia reescrito para tutorial técnico linear, autocontido e alinhado com a MF7 completa.
- `2026-06-27`: corrigidos os marcadores inválidos do teste, removida ambiguidade com `apps/web/package.json`, detalhados scripts, negativos e evidence para `RNF27`.
