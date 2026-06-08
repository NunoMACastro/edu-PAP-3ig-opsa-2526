# BK-MF2-08 - Gerar Demonstração de Resultados e Balanço.

## Header

- `doc_id`: `GUIA-BK-MF2-08`
- `bk_id`: `BK-MF2-08`
- `macro`: `MF2`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-07`
- `rf_rnf`: `RF30`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-01`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-08-gerar-demonstracao-de-resultados-e-balanco.md`
- `last_updated`: `2026-06-08`

## Objetivo

Neste BK vais gerar Demonstração de Resultados por período e Balanço interno à data final do intervalo, a partir do balancete, com origem dos saldos visível.

## Importância funcional e pedagógica

RF30 fecha a MF2 com reporting financeiro. O aluno aprende a transformar diário em mapas sem inventar valores nem prometer submissão legal oficial.

## Scope-in

- DR por período.
- Balanço interno à data final do intervalo, usando saldos acumulados no intervalo escolhido.
- Origem dos saldos.
- Consulta por gestor/contabilista.

## Scope-out

- Submissão legal oficial.
- SAF-T.
- Notas anexas.
- Consolidação multiempresa.

## Estado antes

Há balancete e razão, mas não há demonstrações organizadas.

## Estado depois

A app mostra DR e Balanço internos, explicando contas usadas.

## Pré-requisitos

- Ler RF30.
- Confirmar BK-MF2-07.
- Confirmar plano SNC.

## Fundamentação documental

- `CANONICO`: RF30 exige DR e Balanço.
- `CANONICO`: BK-MF2-07 fornece balancete.
- `DERIVADO`: relatório é interno e explicável, não submissão legal oficial.

## Glossário

- **DR:** rendimentos menos gastos.
- **Balanço:** ativo, passivo e capital próprio.
- **Origem:** contas e saldos usados.

## Conceitos teóricos essenciais

- **Demonstração de Resultados no domínio contabilístico:** resume rendimentos e gastos de um período. Vem das contas de resultados presentes no balancete, separa proveitos e custos, segue para a UI como mapa interno, serve para perceber desempenho operacional, e evita calcular lucro a partir de documentos soltos.
- **Balanço interno à data final:** resume ativo, passivo e capital próprio usando saldos acumulados até uma data. Vem do balancete calculado para o intervalo escolhido, organiza contas de balanço em secções, serve para analisar posição financeira, e evita apresentar um mapa legal oficial sem todas as regras formais de prestação de contas.
- **Origem dos saldos:** cada total deve indicar as contas que o compõem. A origem vem das linhas agregadas do balancete, segue com a resposta da API, aparece na UI, serve para defesa e auditoria, e evita valores sem explicação.
- **Backend de transformação contabilística:** o service não inventa valores; apenas classifica contas por prefixos ou regras documentadas. O pedido vem da rota protegida, reutiliza `buildTrialBalance`, devolve secções calculadas, serve para manter consistência com BK-MF2-07, e evita duplicar queries divergentes.
- **Governança fiscal:** estes mapas são internos e explicáveis, não submissão legal oficial. A fronteira vem da fundamentação documental, é comunicada no backend e na UI, serve para gerir expectativas, e evita prometer SAF-T, IES ou demonstrações legais completas sem suporte documental.
- **Segurança de reporting:** gestor e contabilista consultam dados da empresa ativa. A sessão fornece `companyId` e role, as queries filtram por empresa, serve para proteger informação financeira, e evita exposição de resultados de outra empresa.

## Arquitetura do BK

- Endpoints: `/income-statement`, `/balance-sheet`.
- Reutiliza `buildTrialBalance`.
- Reutiliza `parseDateRange` do `BK-MF2-07` para manter o mesmo contrato de datas em todos os relatórios contabilísticos.

## Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/financial-statements/financialStatementService.js`.
- CRIAR: `apps/api/src/modules/financial-statements/financialStatementRoutes.js`.
- EDITAR: `apps/api/src/server.js`.
- CRIAR: `apps/web/src/lib/financialStatementsApi.ts`.
- CRIAR: `apps/web/src/pages/FinancialStatementsPage.tsx`.
- REVER: `apps/api/src/modules/accounting-reports/accountingReportService.js`.
- REVER: `apps/api/src/modules/accounting-reports/accountingReportFilters.js`.

## Erros comuns

- Usar documentos operacionais como fonte.
- Misturar empresas.
- Chamar relatório interno de submissão oficial.

## Cenários negativos

- Pedido sem sessão deve devolver `401`.
- Pedido sem empresa ativa deve devolver `403`.
- Recurso de outra empresa deve devolver `404` ou `403`, sem expor dados.
- Período inválido devolve `400`.
- Sem lançamentos devolve totais zero.

## Passos lineares

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Confirmar que BK-MF2-08 cobre apenas RF30 e mantém metadados alinhados com matriz, backlog e contrato de campos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro neste passo.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `README.md`, `docs/RF.md`, `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `CONTRATO-STACK-IMPLEMENTACAO.md`.
    - LOCALIZAÇÃO: `docs/planificacao/guias-bk/MF2/BK-MF2-08-gerar-demonstracao-de-resultados-e-balanco.md`, header deste guia e linha canónica de `BK-MF2-08`.

3. Instruções do que fazer.

Comparar header, dependências e próximo BK. Se os caminhos reais da app divergirem, preservar o contrato funcional e registar a adaptação na evidence.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF2-08
macro=MF2
rf=RF30
dependencias=BK-MF2-07
proximo=BK-MF3-01
```

5. Explicação do código.

Este contrato impede drift antes da implementação. Num ERP, uma alteração errada em stock ou contabilidade propaga-se para relatórios, auditoria e defesa PAP.

6. Validação do passo.

A evidence deve indicar que `RF30` e `BK-MF2-07` foram confirmados.

7. Cenário negativo/erro esperado.

Se aparecer regra sem fonte documental, registar dúvida e não a transformar em requisito.

### Passo 2 - Declarar limite contabilístico

1. Objetivo funcional do passo no ERP.

Definir relatório interno explicável sem prometer submissão legal.

2. Ficheiros envolvidos:
    - REVER: RF30, BK-MF0-07 e BK-MF2-07.

3. Instruções do que fazer.

Registar na evidence o limite do relatório.

4. Código completo, correto e integrado com a app final.

```text
CANONICO: RF30 pede Demonstração de Resultados e Balanço.
DERIVADO: agrupamento interno por classes de contas e natureza do saldo.
Limite: não é submissão legal oficial nem SAF-T.
```

5. Explicação do código.

A documentação não define mapa legal completo. O BK entrega relatório interno coerente e não inventa obrigação fiscal.

6. Validação do passo.

Confirmar texto da UI e evidence.

7. Cenário negativo/erro esperado.

Se for exigido mapa oficial, marcar bloqueio de detalhe legal.

### Passo 3 - Validar intervalo

1. Objetivo funcional do passo no ERP.

Validar datas antes de calcular, reutilizando o filtro criado no BK-MF2-07.

2. Ficheiros envolvidos:
    - CRIAR: sem ficheiro novo; reutilizar `apps/api/src/modules/accounting-reports/accountingReportFilters.js`.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `apps/api/src/modules/accounting-reports/accountingReportFilters.js`.
    - LOCALIZAÇÃO: `apps/api/src/modules/financial-statements/financialStatementRoutes.js`, import `parseDateRange` usado nas rotas deste BK.

3. Instruções do que fazer.

Não criar outro validator para o mesmo conceito. Confirmar que `parseDateRange` continua a devolver `{ from, to }` e que lança erro controlado para períodos inválidos.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/financial-statements/financialStatementRoutes.js
import { parseDateRange } from "../accounting-reports/accountingReportFilters.js";
```

5. Explicação do código.

O BK-MF2-07 já criou o validator de intervalo para balancete e razão. Este BK usa o mesmo import para DR e Balanço, evitando dois validadores parecidos com mensagens ou regras ligeiramente diferentes. O backend continua a bloquear datas inválidas antes de consultar saldos.

6. Validação do passo.

Testar período invertido.

7. Cenário negativo/erro esperado.

Período invertido devolve `400`.

### Passo 4 - Calcular DR

1. Objetivo funcional do passo no ERP.

Usar classes 6 e 7 do balancete.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/financial-statements/financialStatementService.js`.
    - REVER: `apps/api/src/modules/accounting-reports/accountingReportService.js`.
    - LOCALIZAÇÃO: função `buildIncomeStatement` em `apps/api/src/modules/financial-statements/financialStatementService.js`.

3. Instruções do que fazer.

Implementar cálculo.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/financial-statements/financialStatementService.js
import { buildTrialBalance } from "../accounting-reports/accountingReportService.js";

export async function buildIncomeStatement(prisma, { companyId, from, to }) {
  const trialBalance = await buildTrialBalance(prisma, { companyId, from, to });
  const revenues = trialBalance.rows.filter((row) => row.code.startsWith("7"));
  const expenses = trialBalance.rows.filter((row) => row.code.startsWith("6"));
  const revenueCents = revenues.reduce((sum, row) => sum + Math.max(0, -row.balanceCents), 0);
  const expenseCents = expenses.reduce((sum, row) => sum + Math.max(0, row.balanceCents), 0);

  return {
    from,
    to,
    sections: [
      { key: "revenues", totalCents: revenueCents, accounts: revenues },
      { key: "expenses", totalCents: expenseCents, accounts: expenses },
    ],
    netIncomeCents: revenueCents - expenseCents,
    source: "JournalEntryLine -> TrialBalance",
  };
}
```

5. Explicação do código.

A DR não recebe valores manuais; nasce do balancete.

6. Validação do passo.

Teste com contas 72 e 62.

7. Cenário negativo/erro esperado.

Sem contas 6/7 devolve zero.

### Passo 5 - Calcular Balanço

1. Objetivo funcional do passo no ERP.

Agrupar contas patrimoniais à data final do intervalo e verificar equilíbrio.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/financial-statements/financialStatementService.js`.
    - REVER: `apps/api/src/modules/accounting-reports/accountingReportService.js`.
    - LOCALIZAÇÃO: função `buildBalanceSheet` em `apps/api/src/modules/financial-statements/financialStatementService.js`.

3. Instruções do que fazer.

Implementar Balanço interno à data final do intervalo validado em `parseDateRange`, usando os saldos acumulados devolvidos por `buildTrialBalance`.

4. Código completo, correto e integrado com a app final.

```js
export async function buildBalanceSheet(prisma, { companyId, from, to }) {
  const trialBalance = await buildTrialBalance(prisma, { companyId, from, to });
  const rows = trialBalance.rows.filter((row) => !row.code.startsWith("6") && !row.code.startsWith("7"));
  const assets = rows.filter((row) => row.balanceCents > 0 && !row.code.startsWith("5"));
  const liabilities = rows.filter((row) => row.balanceCents < 0 && !row.code.startsWith("5"));
  const equity = rows.filter((row) => row.code.startsWith("5"));
  const assetCents = assets.reduce((sum, row) => sum + row.balanceCents, 0);
  const liabilityCents = liabilities.reduce((sum, row) => sum + Math.abs(row.balanceCents), 0);
  const equityCents = equity.reduce((sum, row) => sum + Math.abs(row.balanceCents), 0);

  return {
    from,
    to,
    sections: [
      { key: "assets", totalCents: assetCents, accounts: assets },
      { key: "liabilities", totalCents: liabilityCents, accounts: liabilities },
      { key: "equity", totalCents: equityCents, accounts: equity },
    ],
    checkCents: assetCents - liabilityCents - equityCents,
    source: "JournalEntryLine -> TrialBalance",
  };
}
```

5. Explicação do código.

O Balanço é interno e calculado à data final do intervalo consultado, sem substituir mapas legais de fecho. Mostra secções e `checkCents`; se não equilibrar, a UI deve mostrar aviso, não esconder.

6. Validação do passo.

Teste com saldos patrimoniais.

7. Cenário negativo/erro esperado.

Diferença no check gera aviso.

### Passo 6 - Expor rotas e frontend

1. Objetivo funcional do passo no ERP.

Consultar DR e Balanço com sessão.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/financial-statements/financialStatementRoutes.js`.
    - CRIAR: `apps/web/src/lib/financialStatementsApi.ts`.
    - CRIAR: `apps/web/src/pages/FinancialStatementsPage.tsx`.
    - EDITAR: `apps/api/src/server.js`.
    - EDITAR: `apps/web/src/App.tsx`.
    - LOCALIZAÇÃO: `/api/accounting/statements` em `apps/api/src/server.js`.

3. Instruções do que fazer.

Rotas GET protegidas para os dois mapas.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/financial-statements/financialStatementRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { parseDateRange } from "../accounting-reports/accountingReportFilters.js";
import { buildBalanceSheet, buildIncomeStatement } from "./financialStatementService.js";

export function createFinancialStatementRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "AUDITOR")];
  const sendError = (res, error) => {
    const response = toHttpError(error);
    return res.status(response.status).json(response.body);
  };

  router.get("/income-statement", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const statement = await buildIncomeStatement(prisma, { companyId: req.companyId, ...filters });
      return res.json({ statement });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/balance-sheet", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const statement = await buildBalanceSheet(prisma, { companyId: req.companyId, ...filters });
      return res.json({ statement });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

// apps/api/src/server.js
import { createFinancialStatementRouter } from "./modules/financial-statements/financialStatementRoutes.js";

app.use("/api/accounting/statements", createFinancialStatementRouter(prisma));
```

```ts
// apps/web/src/lib/financialStatementsApi.ts
export type StatementSection = {
  key: string;
  totalCents: number;
  accounts: Array<{
    accountId: string;
    code: string;
    name: string;
    balanceCents: number;
  }>;
};

export type IncomeStatement = {
  sections: StatementSection[];
  netIncomeCents: number;
  source: string;
};

export type BalanceSheet = {
  sections: StatementSection[];
  checkCents: number;
  source: string;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(body.message ?? "Erro inesperado.");
  }

  return response.json() as Promise<T>;
}

function toQuery(params: { from: string; to: string }) {
  return new URLSearchParams(params).toString();
}

export async function fetchIncomeStatement(params: { from: string; to: string }) {
  const response = await fetch(`/api/accounting/statements/income-statement?${toQuery(params)}`, {
    credentials: "include",
  });

  return readJson<{ statement: IncomeStatement }>(response);
}

export async function fetchBalanceSheet(params: { from: string; to: string }) {
  const response = await fetch(`/api/accounting/statements/balance-sheet?${toQuery(params)}`, {
    credentials: "include",
  });

  return readJson<{ statement: BalanceSheet }>(response);
}
```

```tsx
// apps/web/src/pages/FinancialStatementsPage.tsx
import { FormEvent, useState } from "react";
import { fetchBalanceSheet, fetchIncomeStatement } from "../lib/financialStatementsApi";
import type { BalanceSheet, IncomeStatement, StatementSection } from "../lib/financialStatementsApi";

function StatementSections({ sections }: { sections: StatementSection[] }) {
  return (
    <ul>
      {sections.map((section) => (
        <li key={section.key}>
          <strong>{section.key}</strong>: {section.totalCents}
          <ul>
            {section.accounts.map((account) => (
              <li key={account.accountId}>
                {account.code} {account.name}: {account.balanceCents}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function FinancialStatementsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const [incomeResult, balanceResult] = await Promise.all([
        fetchIncomeStatement({ from, to }),
        fetchBalanceSheet({ from, to }),
      ]);
      setIncomeStatement(incomeResult.statement);
      setBalanceSheet(balanceResult.statement);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar demonstrações financeiras.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Demonstrações financeiras</h1>

      <form onSubmit={onSubmit}>
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "A carregar..." : "Consultar"}</button>
      </form>

      {error ? <p role="alert">{error}</p> : null}
      {loading ? <p>A carregar demonstrações financeiras...</p> : null}

      {incomeStatement ? (
        <>
          <h2>Demonstração de resultados</h2>
          <StatementSections sections={incomeStatement.sections} />
          <p>Resultado líquido: {incomeStatement.netIncomeCents}</p>
          <p>Origem: {incomeStatement.source}</p>
        </>
      ) : null}

      {balanceSheet ? (
        <>
          <h2>Balanço</h2>
          <StatementSections sections={balanceSheet.sections} />
          <p>Verificação: {balanceSheet.checkCents}</p>
          {balanceSheet.checkCents !== 0 ? <p role="alert">O balanço não está equilibrado.</p> : null}
          <p>Origem: {balanceSheet.source}</p>
        </>
      ) : null}
    </section>
  );
}
```

5. Explicação do código.

As rotas são só leitura e não alteram dados contabilísticos.

6. Validação do passo.

Smoke com contabilista e gestor.

7. Cenário negativo/erro esperado.

Operacional sem permissão devolve `403`.

### Passo 7 - Validar smoke, negativos e segurança

1. Objetivo funcional do passo no ERP.

Provar que BK-MF2-08 funciona no caso principal e falha de forma controlada nos casos negativos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/financial-statements/financialStatementService.test.js`.
    - CRIAR: `apps/api/src/modules/financial-statements/financialStatementRoutes.test.js`.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-08-gerar-demonstracao-de-resultados-e-balanco.md` e ficheiros criados nos passos anteriores.
    - LOCALIZAÇÃO: `apps/api/src/modules/financial-statements/` e smoke manual em `apps/web/src/pages/FinancialStatementsPage.tsx`.

3. Instruções do que fazer.

Criar teste do fluxo principal, negativos indicados neste guia e smoke manual com sessão real.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:unit -- financialStatement
npm run test:integration -- financialStatement
```

5. Explicação do código.

Os testes provam comportamento, não apenas execução. O aluno consegue defender o que foi verificado e que risco foi bloqueado.

6. Validação do passo.

Confirmar HTTP status, mensagem controlada, ausência de escrita parcial e ausência de dados de outra empresa.

7. Cenário negativo/erro esperado.

Se o smoke passa mas um negativo falha, corrigir service ou rota antes de pedir revisão.

### Passo 8 - Preparar evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar BK-MF2-08 com provas objetivas e deixar o próximo BK pronto para reutilizar os contratos criados.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF2/BK-MF2-08.md`.
    - EDITAR: nenhum ficheiro de aplicação neste passo.
    - REVER: outputs de testes, screenshots e resumo do PR.
    - LOCALIZAÇÃO: `docs/evidence/MF2/BK-MF2-08.md`.

3. Instruções do que fazer.

Registar ficheiros alterados, endpoints criados, comandos executados, resultados dos negativos e riscos que ficam para o próximo BK.

4. Código completo, correto e integrado com a app final.

```md
# BK-MF2-08

- Requisito validado: RF30
- Endpoints: GET /api/accounting/statements/income-statement, GET /api/accounting/statements/balance-sheet
- Negativos: intervalo inválido, role sem permissão, empresa sem lançamentos, balanço não equilibrado
- Resultado: preencher com comandos, resposta HTTP e imagem da página
```

5. Explicação do código.

A evidence liga requisito, código e validação. Sem esta prova, o BK continua fraco para revisão e defesa PAP.

6. Validação do passo.

Confirmar handoff para `BK-MF3-01` com exports, endpoints, modelos e limitações.

7. Cenário negativo/erro esperado.

Se existir bloqueio real, marcar no relatório e evidence com erro observado e impacto.

## Expected results

- DR mostra rendimentos, gastos e resultado líquido.
- Balanço mostra ativo, passivo, capital próprio e verificação.
- Cada secção inclui origem dos dados.

## Critérios de aceite

- Todos os passos seguem a estrutura obrigatória 1 a 7.
- Backend aplica autenticação, autorização e contexto multiempresa.
- Frontend usa `credentials: "include"` e não guarda tokens em `localStorage`.
- Erros são controlados e em português de Portugal.
- Evidence inclui smoke, negativos e ficheiros alterados.

## Validação final

- DR com contas 6/7.
- Balanço com contas patrimoniais.
- Estado vazio.

## Evidence para PR/defesa

- Output de DR.
- Output de Balanço.
- Negativo de período inválido.

## Handoff

BK-MF3-01 deve ler contas de IVA e diário, não a DR como fonte fiscal.

## Changelog

- `2026-06-07`: guia reescrito como tutorial técnico linear, autocontido e alinhado com RF/RNF, MF0, MF1 e contrato de stack.
