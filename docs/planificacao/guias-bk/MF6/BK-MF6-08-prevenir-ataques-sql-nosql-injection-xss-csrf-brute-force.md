# BK-MF6-08 - Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force).

## Header

- `doc_id`: `GUIA-BK-MF6-08`
- `bk_id`: `BK-MF6-08`
- `macro`: `MF6`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF15`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-09`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais criar uma camada mínima de hardening para prevenir SQL/NoSQL Injection, XSS, CSRF e brute force. O `RNF15` pede prevenção, não apenas reação depois do incidente.

O aluno vai aplicar validação de input, limitar tentativas de autenticação, exigir origem controlada em pedidos mutáveis e criar um smoke textual para impedir regressões evidentes.

#### Importância

OPSA guarda dados financeiros e fiscais. Um ataque de injeção pode expor dados de outras empresas; XSS pode comprometer sessão; CSRF pode tentar ações sem intenção do utilizador; brute force tenta descobrir credenciais.

Este BK reforça regras já existentes: validação no backend, cookies seguros e HTTPS.

#### Scope-in

- Criar middleware de origem para métodos mutáveis.
- Reforçar rate limit de autenticação.
- Confirmar validação backend antes de Prisma.
- Criar utilitário de escape para texto devolvido em HTML quando existir.
- Criar smoke textual para padrões perigosos.
- Definir negativos de CSRF, brute force e input malicioso.

#### Scope-out

- Criar WAF externo.
- Substituir Prisma.
- Guardar HTML livre sem sanitização.
- Implementar biblioteca externa sem justificação.
- Criar segurança apenas no frontend.

#### Estado antes e depois

- Antes: autenticação, cookies e validações existem em BKs anteriores.
- Depois: há guia claro para hardening transversal e validação de regressões.

#### Pre-requisitos

- Ler `RNF15`.
- Rever `BK-MF6-05`, `BK-MF6-06` e `BK-MF6-07`.
- Confirmar validators nos módulos financeiros.
- Confirmar rate limit de autenticação.
- Confirmar que Prisma usa parâmetros e APIs estruturadas.

#### Glossário

- Injection: tentativa de inserir instruções maliciosas em input.
- XSS: execução de script indevido no browser.
- CSRF: pedido mutável enviado a partir de origem não confiável.
- Brute force: muitas tentativas para adivinhar credenciais.
- Rate limit: limite de tentativas por janela temporal.
- Método mutável: `POST`, `PUT`, `PATCH` ou `DELETE`.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF15` cobre SQL/NoSQL Injection, XSS, CSRF e brute force.
- `DERIVADO`: Prisma reduz risco de SQL Injection quando se usam APIs estruturadas, mas input continua a precisar de validação.
- `DERIVADO`: com cookies HttpOnly, proteção de origem ajuda contra CSRF.

Segurança deve estar no backend. O frontend ajuda o utilizador, mas um atacante pode chamar a API diretamente.

#### Arquitetura do BK

- Endpoint(s): todos os endpoints mutáveis.
- Modelo/schema Prisma: sem alteração.
- Service(s): continuam a validar domínio.
- Controller/route: recebe middleware de origem.
- Guard/middleware: `requireTrustedOrigin` e rate limit.
- Cliente API: envia cookies, sem guardar sessão no JavaScript.
- Testes: smoke textual e negativos.
- Handoff para o próximo BK: credenciais por ambiente.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/security/requestHardening.js`
- EDITAR: `apps/api/src/server.js`
- REVER: `apps/api/src/modules/auth/authRateLimit.js`
- CRIAR: `apps/api/scripts/check-mf6-hardening.mjs`
- EDITAR: `apps/api/package.json`

#### Tutorial técnico linear

### Passo 1 - Inventariar superfícies de ataque

1. Objetivo funcional do passo no contexto da app.

Saber onde aplicar hardening.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`
    - REVER: módulos de autenticação e domínio.
    - LOCALIZAÇÃO: rotas mutáveis.

3. Instruções do que fazer.

Lista rotas `POST`, `PUT`, `PATCH` e `DELETE` e identifica quais já têm validação.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É revisão de risco.

5. Explicação do código.

Sem inventário, a equipa endurece apenas uma rota e deixa outras vulneráveis.

6. Validação do passo.

Tabela de rotas mutáveis com middleware esperado.

7. Cenário negativo/erro esperado.

Rota mutável sem autenticação ou validação deve ser tratada antes de fechar.

### Passo 2 - Criar proteção de origem

1. Objetivo funcional do passo no contexto da app.

Reduzir risco de CSRF em pedidos que alteram dados.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/security/requestHardening.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o middleware abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Hardening de pedidos HTTP para a API OPSA.
 */

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Exige origem esperada em pedidos que alteram dados.
 *
 * @param {{ appBaseUrl: string, isProduction: boolean }} options - Configuração do ambiente.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function requireTrustedOrigin({ appBaseUrl, isProduction }) {
    const trustedOrigin = new URL(appBaseUrl).origin;

    return (req, res, next) => {
        if (!MUTATING_METHODS.has(req.method)) {
            next();
            return;
        }

        const origin = req.headers.origin;
        if (isProduction && origin !== trustedOrigin) {
            // Pedidos mutáveis com cookie de sessão só são aceites a partir da origem da app.
            res.status(403).json({
                code: "UNTRUSTED_ORIGIN",
                message: "A origem do pedido não é autorizada.",
            });
            return;
        }

        next();
    };
}

/**
 * Escapa texto antes de ser usado em HTML gerado pela API.
 *
 * @param {string} value - Texto controlado pelo utilizador.
 * @returns {string} Texto com caracteres perigosos escapados.
 */
export function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}
```

5. Explicação do código.

O middleware só bloqueia métodos mutáveis. Leituras continuam acessíveis conforme autenticação. `escapeHtml` existe para casos em que a API gere HTML; dados JSON devem continuar tratados como dados, não como marcação.

6. Validação do passo.

Executa `cd apps/api && node --check src/modules/security/requestHardening.js`.

7. Cenário negativo/erro esperado.

Em produção, `POST` com origem externa devolve `403`.

### Passo 3 - Montar hardening global

1. Objetivo funcional do passo no contexto da app.

Aplicar proteção antes das rotas.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/server.js`
    - LOCALIZAÇÃO: zona inicial do ficheiro, desde os imports até imediatamente antes do primeiro router `app.use("/api/auth", ...)`.

3. Instruções do que fazer.

Importa `requireTrustedOrigin` e monta o middleware depois de `express.json()` e antes de qualquer router. Mantém a montagem dos routers existentes logo abaixo deste bloco.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Ponto de entrada Express para a API OPSA MF0.
 *
 * O servidor monta middlewares transversais antes dos routers de domínio para
 * garantir que autenticação, validação e hardening se aplicam por omissão.
 */

import express from "express";
import { PrismaClient } from "@prisma/client";
import { buildAuthRoutes } from "./modules/auth/authRoutes.js";
import { buildPermissionsRoutes } from "./modules/permissions/permissionsRoutes.js";
import { buildCompanyRoutes } from "./modules/companies/companyRoutes.js";
import { buildCompanyUserRoutes } from "./modules/company-users/companyUserRoutes.js";
import { buildCompanyProfileRoutes } from "./modules/company-profile/companyProfileRoutes.js";
import { buildAccountRoutes } from "./modules/accounting/accounts/accountRoutes.js";
import { buildFiscalPeriodRoutes } from "./modules/fiscal-periods/fiscalPeriodRoutes.js";
import { buildCustomerRoutes } from "./modules/customers/customerRoutes.js";
import { buildSupplierRoutes } from "./modules/suppliers/supplierRoutes.js";
import { buildItemRoutes } from "./modules/items/itemRoutes.js";
import { buildWarehouseRoutes } from "./modules/warehouses/warehouseRoutes.js";
import { buildVatRateRoutes } from "./modules/vat-rates/vatRateRoutes.js";
import { buildSaleDocumentRoutes } from "./modules/sales/saleDocumentRoutes.js";
import { buildReceiptRoutes } from "./modules/receipts/receiptRoutes.js";
import { buildSalePostingRoutes } from "./modules/accounting/salePostingRoutes.js";
import { buildSalesOpenItemsRoutes } from "./modules/open-items/salesOpenItemsRoutes.js";
import { buildSaleApprovalRoutes } from "./modules/sales-approval/saleApprovalRoutes.js";
import { buildPurchaseDocumentRoutes } from "./modules/purchases/purchaseDocumentRoutes.js";
import { buildPaymentRoutes } from "./modules/payments/paymentRoutes.js";
import { buildPurchasePostingRoutes } from "./modules/accounting/purchasePostingRoutes.js";
import { buildPurchaseApprovalRoutes } from "./modules/purchase-approval/purchaseApprovalRoutes.js";
import { buildStockMovementRoutes } from "./modules/inventory/stockMovementRoutes.js";
import { buildFifoCostRoutes } from "./modules/inventory/fifoCostRoutes.js";
import { buildInventoryCountRoutes } from "./modules/inventory/inventoryCountRoutes.js";
import { buildStockAlertRoutes } from "./modules/inventory/stockAlertRoutes.js";
import { buildManualJournalRoutes } from "./modules/accounting/manualJournalRoutes.js";
import { buildAccountingReportRoutes } from "./modules/accounting-reports/accountingReportRoutes.js";
import { buildFinancialStatementRoutes } from "./modules/financial-statements/financialStatementRoutes.js";
import { buildVatMapRoutes } from "./modules/tax/vatMapRoutes.js";
import { buildTreasuryAccountRoutes } from "./modules/treasury/bankAccountRoutes.js";
import { buildStatementRoutes } from "./modules/treasury/statementRoutes.js";
import { buildCashflowForecastRoutes } from "./modules/treasury/cashflowForecastRoutes.js";
import { buildBusinessImportRoutes } from "./modules/imports/businessImportRoutes.js";
import { buildAiRoutes } from "./modules/ai/aiRoutes.js";
import { buildReminderRoutes } from "./modules/reminders/reminderRoutes.js";
import { buildOperationalTaskRoutes } from "./modules/tasks/taskRoutes.js";
import { buildNotificationRoutes } from "./modules/notifications/notificationRoutes.js";
import { buildAuditLogRoutes } from "./modules/audit/auditLogRoutes.js";
import { buildIntegrationLogRoutes } from "./modules/integrations/integrationLogRoutes.js";
import { buildSaftRoutes } from "./modules/compliance/saftRoutes.js";
import { buildOperationalReportRoutes } from "./modules/reports/operationalReportRoutes.js";
import { buildExecutiveKpiRoutes } from "./modules/reports/executiveKpiRoutes.js";
import { requireTrustedOrigin } from "./modules/security/requestHardening.js";

const prisma = new PrismaClient();
const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const isProduction = process.env.NODE_ENV === "production";
const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:5173";

app.use(express.json());

// Este middleware fica antes de todos os routers para proteger qualquer POST, PUT, PATCH ou DELETE atual e futuro.
app.use(requireTrustedOrigin({ appBaseUrl, isProduction }));
```

5. Explicação do código.

Este bloco mostra a zona inicial completa do servidor que precisa de contexto para compilar: imports, criação do `app`, leitura de `isProduction` e `appBaseUrl`, parsing JSON e montagem de `requireTrustedOrigin`.

A montagem global impede que novos módulos mutáveis fiquem sem proteção por esquecimento. Como o middleware fica antes do primeiro router, aplica-se a autenticação, empresas, vendas, compras, inventário, tesouraria, IA, auditoria e integrações sem duplicar lógica em cada módulo.

6. Validação do passo.

`node --check src/server.js` deve passar.

7. Cenário negativo/erro esperado.

Se montado depois dos routers, não protege as rotas.

### Passo 4 - Confirmar rate limit de autenticação

1. Objetivo funcional do passo no contexto da app.

Reduzir brute force.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/auth/authRateLimit.js`
    - LOCALIZAÇÃO: limite de login.

3. Instruções do que fazer.

Confirma limite por IP ou identificador equivalente e resposta controlada.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Reutiliza o módulo de autenticação existente.

5. Explicação do código.

Brute force deve falhar antes de chegar a muitas comparações bcrypt.

6. Validação do passo.

Várias tentativas inválidas devolvem `429`.

7. Cenário negativo/erro esperado.

Se tentativas ilimitadas forem aceites, o BK falha.

### Passo 5 - Confirmar validação antes de Prisma

1. Objetivo funcional do passo no contexto da app.

Reduzir risco de injeção e dados inválidos.

2. Ficheiros envolvidos:
    - REVER: validators de módulos financeiros.
    - LOCALIZAÇÃO: services antes de chamadas Prisma.

3. Instruções do que fazer.

Confirma que inputs monetários, datas, IDs e strings passam por validators.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Usa validators dos BKs anteriores.

5. Explicação do código.

Prisma ajuda, mas não substitui validação de domínio.

6. Validação do passo.

Teste negativo com string maliciosa devolve erro de validação.

7. Cenário negativo/erro esperado.

Input com operador inesperado não chega à query.

### Passo 6 - Criar smoke textual

1. Objetivo funcional do passo no contexto da app.

Detetar regressões óbvias.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf6-hardening.mjs`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: script e entrada `test:mf6:hardening`.

3. Instruções do que fazer.

Cria o script abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual do BK-MF6-08.
 */

import { readFileSync } from "node:fs";

const hardening = readFileSync("src/modules/security/requestHardening.js", "utf8");
const server = readFileSync("src/server.js", "utf8");
const authLimit = readFileSync("src/modules/auth/authRateLimit.js", "utf8");

for (const required of ["UNTRUSTED_ORIGIN", "escapeHtml", "POST", "DELETE"]) {
    if (!hardening.includes(required)) {
        throw new Error(`Falta proteção esperada: ${required}`);
    }
}

if (!server.includes("requireTrustedOrigin")) {
    throw new Error("Hardening de origem não está montado.");
}

// O rate limit protege login contra muitas tentativas repetidas.
if (!authLimit.includes("429")) {
    throw new Error("Rate limit de autenticação não devolve 429.");
}
```

5. Explicação do código.

O smoke confirma origem, escape e limite de tentativas. Ele não substitui revisão de código, mas apanha remoções perigosas.

6. Validação do passo.

Executa `cd apps/api && node scripts/check-mf6-hardening.mjs`.

7. Cenário negativo/erro esperado.

Se removeres `requireTrustedOrigin`, o smoke falha.

### Passo 7 - Testar negativos de segurança

1. Objetivo funcional do passo no contexto da app.

Provar que ataques básicos são recusados.

2. Ficheiros envolvidos:
    - REVER: requests manuais e testes.
    - LOCALIZAÇÃO: endpoints de auth e domínio.

3. Instruções do que fazer.

Executa tentativas de origem externa, login repetido e input malicioso.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É validação comportamental.

5. Explicação do código.

Negativos são tão importantes quanto o fluxo principal porque provam que a defesa existe.

6. Validação do passo.

CSRF simulado devolve `403`, brute force devolve `429`, input inválido devolve `400` ou `422`.

7. Cenário negativo/erro esperado.

Se algum ataque devolver sucesso, o BK não está concluído.

### Passo 8 - Recolher evidence

1. Objetivo funcional do passo no contexto da app.

Fechar o hardening com provas objetivas.

2. Ficheiros envolvidos:
    - REVER: outputs dos comandos.
    - LOCALIZAÇÃO: PR ou relatório.

3. Instruções do que fazer.

Guarda output do smoke e dos três negativos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É evidence.

5. Explicação do código.

A evidence deve mostrar códigos HTTP e mensagens sem expor dados sensíveis.

6. Validação do passo.

Outputs anexados ao PR.

7. Cenário negativo/erro esperado.

Logs com cookies, cabeçalhos completos ou dados financeiros devem ser removidos.

#### Critérios de aceite

- Origem não confiável é recusada em métodos mutáveis.
- Login repetido é limitado.
- Input malicioso é validado no backend.
- Não há dependência de proteção apenas frontend.
- Negativos: mínimo `3`: CSRF simulado, brute force e input malicioso.

#### Validação final

- `cd apps/api && node --check src/modules/security/requestHardening.js`
- `cd apps/api && node scripts/check-mf6-hardening.mjs`
- `cd apps/api && npm run test:contracts`
- Testes manuais dos três negativos.

#### Evidence para PR/defesa

- `pr`: link ou identificador do PR.
- `proof`: output do smoke.
- `neg`: origem externa, tentativas repetidas e input malicioso.
- `fonte`: `RNF15`, `BK-MF6-05`, `BK-MF6-07`.
- `multiempresa`: ataque não pode escolher empresa ativa.

#### Handoff

- Entrega hardening transversal antes de gerir credenciais por ambiente.
- Próximo BK recomendado: `BK-MF6-09`

#### Changelog

- `2026-06-22`: guia revisto com proteção de origem, escape HTML, rate limit, smoke e negativos de segurança.
