# BK-MF2-07 - Consultar balancete e razão exportável (PDF/Excel).

## Header

- `doc_id`: `GUIA-BK-MF2-07`
- `bk_id`: `BK-MF2-07`
- `macro`: `MF2`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-06`
- `rf_rnf`: `RF29`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-08`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-07-consultar-balancete-e-razao-exportavel-pdf-excel.md`
- `last_updated`: `2026-06-08`

## Objetivo

Neste BK vais consultar balancete e razão por empresa/período e exportar PDF/Excel a partir dos mesmos dados.

## Importância funcional e pedagógica

RF29 transforma lançamentos em controlo contabilístico. O aluno aprende agregação por conta, detalhe de razão e exportação verificável.

## Scope-in

- Balancete por período.
- Razão por conta.
- Exportação XLSX e PDF.
- Roles de leitura.

## Scope-out

- DR/Balanço.
- SAF-T.
- Mapas de IVA.

## Estado antes

Há lançamentos, mas não há consulta contabilística agregada.

## Estado depois

Contabilista, auditor e gestor consultam e exportam relatórios coerentes.

## Pré-requisitos

- Ler RF29.
- Confirmar BK-MF2-06.
- Justificar `exceljs` e `pdfkit`.

## Fundamentação documental

- `CANONICO`: RF29 exige balancete/razão exportável.
- `DERIVADO`: `exceljs` e `pdfkit` são necessários para XLSX/PDF reais.
- `CANONICO`: dados são filtrados por empresa.

## Glossário

- **Balancete:** resumo por conta.
- **Razão:** detalhe por conta.
- **XLSX/PDF:** artefactos de exportação.

## Conceitos teóricos essenciais

- **Balancete no domínio contabilístico:** é o resumo dos movimentos por conta num intervalo. Vem de `JournalEntryLine` ligada a `JournalEntry`, agrupa débitos e créditos por conta SNC, segue para a UI e exportação, serve para validar saldos e preparar mapas financeiros, e evita analisar contabilidade linha a linha sem síntese.
- **Razão por conta:** é o detalhe cronológico dos lançamentos de uma conta. Vem das mesmas linhas contabilísticas do balancete, é filtrado por conta e intervalo, serve para explicar a origem de cada saldo, e evita relatórios sem capacidade de auditoria.
- **Fonte única de dados para UI e exports:** a exportação usa a mesma query e service da consulta no ecrã. O pedido vem da UI ou de rota de exportação, passa por `buildTrialBalance` ou `buildLedger`, segue para JSON, XLSX ou PDF, serve para garantir que o ficheiro exportado coincide com o que foi visto, e evita divergência entre ecrã e documento.
- **Exports XLSX/PDF:** são artefactos de leitura e defesa, não novas fontes contabilísticas. Os dados vêm do service, os exporters apenas formatam, servem para entregar evidência e análise externa, e evitam gerar Excel como CSV renomeado ou PDF com valores recalculados noutro sítio.
- **Segurança e autorização de leitura:** auditor ou contabilista pode consultar sem editar. A role e a empresa vêm da sessão, as queries filtram por `companyId`, servem para separar empresas, e evitam expor linhas contabilísticas sensíveis.

## Arquitetura do BK

- Endpoints: `/trial-balance`, `/ledger`, `/trial-balance.xlsx`, `/ledger.pdf`.
- Services: `buildTrialBalance`, `buildLedger`.

## Ficheiros a criar/editar/rever

- EDITAR: `apps/api/package.json`.
- CRIAR: `apps/api/src/modules/accounting-reports/accountingReportFilters.js`.
- CRIAR: `apps/api/src/modules/accounting-reports/accountingReportService.js`.
- CRIAR: `apps/api/src/modules/accounting-reports/accountingReportExporters.js`.
- CRIAR: `apps/api/src/modules/accounting-reports/accountingReportRoutes.js`.
- EDITAR: `apps/api/src/server.js`.
- CRIAR: `apps/web/src/lib/accountingReportsApi.ts`.
- CRIAR: `apps/web/src/pages/AccountingReportsPage.tsx`.
- REVER: `apps/api/src/modules/accounting/manualJournalService.js`.

## Erros comuns

- Somar várias empresas.
- Exportar dados diferentes da UI.
- Gerar Excel como CSV renomeado.

## Cenários negativos

- Pedido sem sessão deve devolver `401`.
- Pedido sem empresa ativa deve devolver `403`.
- Recurso de outra empresa deve devolver `404` ou `403`, sem expor dados.
- Data inicial maior que final devolve `400`.
- Conta inexistente devolve `404`.

## Passos lineares

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Confirmar que BK-MF2-07 cobre apenas RF29 e mantém metadados alinhados com matriz, backlog e contrato de campos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro neste passo.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `README.md`, `docs/RF.md`, `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `CONTRATO-STACK-IMPLEMENTACAO.md`.
    - LOCALIZAÇÃO: `docs/planificacao/guias-bk/MF2/BK-MF2-07-consultar-balancete-e-razao-exportavel-pdf-excel.md`, header deste guia e linha canónica de `BK-MF2-07`.

3. Instruções do que fazer.

Comparar header, dependências e próximo BK. Se os caminhos reais da app divergirem, preservar o contrato funcional e registar a adaptação na evidence.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF2-07
macro=MF2
rf=RF29
dependencias=BK-MF2-06
proximo=BK-MF2-08
```

5. Explicação do código.

Este contrato impede drift antes da implementação. Num ERP, uma alteração errada em stock ou contabilidade propaga-se para relatórios, auditoria e defesa PAP.

6. Validação do passo.

A evidence deve indicar que `RF29` e `BK-MF2-06` foram confirmados.

7. Cenário negativo/erro esperado.

Se aparecer regra sem fonte documental, registar dúvida e não a transformar em requisito.

### Passo 2 - Justificar dependências

1. Objetivo funcional do passo no ERP.

Adicionar exportação real PDF/Excel.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`.
    - REVER: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
    - LOCALIZAÇÃO: dependências backend em `apps/api/package.json`.

3. Instruções do que fazer.

Adicionar dependências só no backend.

4. Código completo, correto e integrado com a app final.

```json
{
  "dependencies": {
    "exceljs": "^4.4.0",
    "pdfkit": "^0.15.0"
  }
}
```

5. Explicação do código.

Node.js não gera XLSX/PDF completo com APIs nativas. Renomear CSV não cumpre o requisito.

6. Validação do passo.

Instalar e atualizar lockfile no PR real.

7. Cenário negativo/erro esperado.

Se dependências não puderem ser instaladas, registar bloqueio.

### Passo 3 - Validar filtros

1. Objetivo funcional do passo no ERP.

Validar datas e conta da razão.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/accounting-reports/accountingReportFilters.js`.
    - LOCALIZAÇÃO: `apps/api/src/modules/accounting-reports/accountingReportFilters.js`.

3. Instruções do que fazer.

Criar parse de datas.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/accounting-reports/accountingReportFilters.js
import { httpError } from "../../lib/httpErrors.js";

export function parseDateRange(query) {
  const from = new Date(String(query.from ?? ""));
  const to = new Date(String(query.to ?? ""));
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    throw httpError(400, "INVALID_DATE_RANGE", "Intervalo de datas inválido.");
  }
  return { from, to };
}
```

5. Explicação do código.

Datas inválidas geram relatórios errados; por isso falham antes da query.

6. Validação do passo.

Testar intervalo invertido.

7. Cenário negativo/erro esperado.

Intervalo invertido devolve `400`.

### Passo 4 - Construir balancete e razão

1. Objetivo funcional do passo no ERP.

Ler `JournalEntryLine` filtrado por empresa e período.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/accounting-reports/accountingReportService.js`.

3. Instruções do que fazer.

Implementar agregação.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/accounting-reports/accountingReportService.js
import {
  buildCursorPage,
  buildKeysetCondition,
  decodePageCursor,
  parsePageLimit,
} from "../../lib/cursorPagination.js";
import { httpError } from "../../lib/httpErrors.js";

export async function buildTrialBalance(prisma, { companyId, from, to, cursor: opaqueCursor, limit: rawLimit }) {
  const limit = parsePageLimit(rawLimit);
  const cursor = decodePageCursor(opaqueCursor, "string");
  const keyset = buildKeysetCondition(cursor, { sortField: "code", direction: "asc" });
  const baseWhere = { companyId, isActive: true };
  const accounts = await prisma.account.findMany({
    where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
    orderBy: [{ code: "asc" }, { id: "asc" }],
    take: limit + 1,
  });
  const accountPage = buildCursorPage(accounts, {
    limit,
    sortField: "code",
    sortType: "string",
  });
  const rows = [];

  for (const account of accountPage.items) {
    const lines = await prisma.journalEntryLine.findMany({
      where: {
        accountId: account.id,
        journalEntry: { companyId, entryDate: { gte: from, lte: to } },
      },
    });
    const debitCents = lines.reduce((sum, line) => sum + line.debitCents, 0);
    const creditCents = lines.reduce((sum, line) => sum + line.creditCents, 0);

    if (debitCents || creditCents) {
      rows.push({
        accountId: account.id,
        code: account.code,
        name: account.name,
        debitCents,
        creditCents,
        balanceCents: debitCents - creditCents,
      });
    }
  }

  return { from, to, rows, pageInfo: accountPage.pageInfo };
}

export async function buildLedger(prisma, { companyId, accountId, from, to, cursor: opaqueCursor, limit: rawLimit }) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, companyId, isActive: true },
    select: { id: true, code: true, name: true },
  });

  if (!account) throw httpError(404, "ACCOUNT_NOT_FOUND", "Conta SNC não encontrada.");

  const limit = parsePageLimit(rawLimit);
  const cursor = decodePageCursor(opaqueCursor, "date");
  const baseWhere = {
    accountId,
    journalEntry: { companyId, entryDate: { gte: from, lte: to } },
  };
  const afterCursor = cursor ? {
    OR: [
      { journalEntry: { entryDate: { gt: cursor.sortValue } } },
      { journalEntry: { entryDate: cursor.sortValue }, id: { gt: cursor.id } },
    ],
  } : null;
  const beforeCursor = cursor ? {
    OR: [
      { journalEntry: { entryDate: { lt: cursor.sortValue } } },
      { journalEntry: { entryDate: cursor.sortValue }, id: { lt: cursor.id } },
    ],
  } : null;
  const [lines, prior] = await Promise.all([prisma.journalEntryLine.findMany({
    where: afterCursor ? { AND: [baseWhere, afterCursor] } : baseWhere,
    orderBy: [{ journalEntry: { entryDate: "asc" } }, { id: "asc" }],
    include: {
      journalEntry: {
        select: { id: true, entryDate: true, description: true, source: true },
      },
    },
    take: limit + 1,
  }), beforeCursor ? prisma.journalEntryLine.aggregate({
    where: { AND: [baseWhere, beforeCursor] },
    _sum: { debitCents: true, creditCents: true },
  }) : Promise.resolve({ _sum: null })]);

  let runningBalanceCents = (prior._sum?.debitCents ?? 0) - (prior._sum?.creditCents ?? 0);
  const page = buildCursorPage(lines.map((line) => ({
    ...line,
    entryDate: line.journalEntry.entryDate,
  })), {
    limit,
    sortField: "entryDate",
    sortType: "date",
    serialize: (line) => {
      runningBalanceCents += line.debitCents - line.creditCents;
      return {
        entryId: line.journalEntry.id,
        lineId: line.id,
        date: line.entryDate,
        description: line.journalEntry.description,
        source: line.journalEntry.source,
        debitCents: line.debitCents,
        creditCents: line.creditCents,
        balanceCents: runningBalanceCents,
      };
    },
  });

  return { from, to, account, rows: page.items, pageInfo: page.pageInfo };
}

async function collectAllPages(loader) {
  const rows = [];
  let cursor;
  let report;
  do {
    report = await loader({ cursor, limit: 100 });
    rows.push(...report.rows);
    cursor = report.pageInfo.nextCursor ?? undefined;
  } while (report.pageInfo.hasNextPage);
  return { ...report, rows, pageInfo: { nextCursor: null, hasNextPage: false } };
}

export function buildTrialBalanceForExport(prisma, input) {
  return collectAllPages((page) => buildTrialBalance(prisma, { ...input, ...page }));
}

export function buildLedgerForExport(prisma, input) {
  return collectAllPages((page) => buildLedger(prisma, { ...input, ...page }));
}
```

5. Explicação do código.

A query filtra por `companyId` dentro do diário. O saldo é débito menos crédito.

6. Validação do passo.

Criar lançamentos e validar totais.

7. Cenário negativo/erro esperado.

Conta de outra empresa não entra.

### Passo 5 - Criar exporters

1. Objetivo funcional do passo no ERP.

Gerar XLSX/PDF a partir dos relatórios.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/accounting-reports/accountingReportExporters.js`.

3. Instruções do que fazer.

Usar `exceljs` e `pdfkit`.

4. Código completo, correto e integrado com a app final.

```js
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export async function trialBalanceToXlsx(report) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Balancete");
  sheet.columns = [{ header: "Conta", key: "code" }, { header: "Nome", key: "name" }, { header: "Débito", key: "debit" }, { header: "Crédito", key: "credit" }];
  report.rows.forEach((row) => sheet.addRow({ code: row.code, name: row.name, debit: row.debitCents / 100, credit: row.creditCents / 100 }));
  return workbook.xlsx.writeBuffer();
}

export function ledgerToPdf(report) {
  const doc = new PDFDocument();
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.text("Razão " + report.account.code + " " + report.account.name);
  report.rows.forEach((row) => doc.text(String(row.date) + " " + row.description));
  doc.end();
  return new Promise((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));
}
```

5. Explicação do código.

Exporters não fazem queries; recebem dados já filtrados.

6. Validação do passo.

Gerar buffers não vazios.

7. Cenário negativo/erro esperado.

Sem linhas gera cabeçalho, não erro cru.

### Passo 6 - Expor rotas e frontend

1. Objetivo funcional do passo no ERP.

Servir JSON e ficheiros com os mesmos filtros.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/accounting-reports/accountingReportRoutes.js`.
    - CRIAR: `apps/web/src/lib/accountingReportsApi.ts`.
    - CRIAR: `apps/web/src/pages/AccountingReportsPage.tsx`.
    - EDITAR: `apps/api/src/server.js`.
    - EDITAR: `apps/web/src/App.tsx`.
    - LOCALIZAÇÃO: `/api/accounting/reports` em `apps/api/src/server.js`.

3. Instruções do que fazer.

Rotas GET para consulta e exportação.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/accounting-reports/accountingReportRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { parseDateRange } from "./accountingReportFilters.js";
import {
  buildLedger,
  buildLedgerForExport,
  buildTrialBalance,
  buildTrialBalanceForExport,
} from "./accountingReportService.js";
import { ledgerToPdf, trialBalanceToXlsx } from "./accountingReportExporters.js";

export function createAccountingReportRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "AUDITOR")];
  const sendError = (res, error) => {
    const response = toHttpError(error);
    return res.status(response.status).json(response.body);
  };

  router.get("/trial-balance", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const report = await buildTrialBalance(prisma, {
        companyId: req.companyId,
        ...filters,
        cursor: req.query.cursor,
        limit: req.query.limit,
      });
      return res.json({ items: report.rows, pageInfo: report.pageInfo });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/ledger", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const report = await buildLedger(prisma, {
        companyId: req.companyId,
        accountId: String(req.query.accountId ?? ""),
        ...filters,
        cursor: req.query.cursor,
        limit: req.query.limit,
      });

      return res.json({ items: report.rows, pageInfo: report.pageInfo });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/trial-balance.xlsx", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const report = await buildTrialBalanceForExport(prisma, { companyId: req.companyId, ...filters });
      const buffer = await trialBalanceToXlsx(report);

      res.setHeader("content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("content-disposition", "attachment; filename=balancete.xlsx");
      return res.send(Buffer.from(buffer));
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/ledger.pdf", guards, async (req, res) => {
    try {
      const filters = parseDateRange(req.query);
      const report = await buildLedgerForExport(prisma, {
        companyId: req.companyId,
        accountId: String(req.query.accountId ?? ""),
        ...filters,
      });
      const buffer = await ledgerToPdf(report);

      res.setHeader("content-type", "application/pdf");
      res.setHeader("content-disposition", "attachment; filename=razao.pdf");
      return res.send(buffer);
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

// apps/api/src/server.js
import { createAccountingReportRouter } from "./modules/accounting-reports/accountingReportRoutes.js";

app.use("/api/accounting/reports", createAccountingReportRouter(prisma));
```

```ts
// apps/web/src/lib/accountingReportsApi.ts
export type TrialBalanceRow = {
  accountId: string;
  code: string;
  name: string;
  debitCents: number;
  creditCents: number;
  balanceCents: number;
};

export type LedgerRow = {
  entryId: string;
  lineId: string;
  date: string;
  description: string;
  debitCents: number;
  creditCents: number;
  balanceCents: number;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(body.message ?? "Erro inesperado.");
  }

  return response.json() as Promise<T>;
}

function toQuery(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export async function fetchTrialBalance(params: { from: string; to: string }) {
  const response = await fetch(`/api/accounting/reports/trial-balance?${toQuery(params)}`, {
    credentials: "include",
  });

  return readJson<{
    items: TrialBalanceRow[];
    pageInfo: { nextCursor: string | null; hasNextPage: boolean };
  }>(response);
}

export async function fetchLedger(params: { from: string; to: string; accountId: string }) {
  const response = await fetch(`/api/accounting/reports/ledger?${toQuery(params)}`, {
    credentials: "include",
  });

  return readJson<{
    items: LedgerRow[];
    pageInfo: { nextCursor: string | null; hasNextPage: boolean };
  }>(response);
}
```

```tsx
// apps/web/src/pages/AccountingReportsPage.tsx
import { FormEvent, useState } from "react";
import { fetchLedger, fetchTrialBalance } from "../lib/accountingReportsApi";
import type { LedgerRow, TrialBalanceRow } from "../lib/accountingReportsApi";

export function AccountingReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [accountId, setAccountId] = useState("");
  const [trialBalanceRows, setTrialBalanceRows] = useState<TrialBalanceRow[]>([]);
  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const [trialBalance, ledger] = await Promise.all([
        fetchTrialBalance({ from, to }),
        accountId ? fetchLedger({ from, to, accountId }) : Promise.resolve({ items: [], pageInfo: { nextCursor: null, hasNextPage: false } }),
      ]);
      setTrialBalanceRows(trialBalance.items);
      setLedgerRows(ledger.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar relatórios.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Balancete e razão</h1>

      <form onSubmit={onSubmit}>
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <input value={accountId} onChange={(event) => setAccountId(event.target.value)} placeholder="Conta para razão" />
        <button type="submit" disabled={loading}>{loading ? "A carregar..." : "Consultar"}</button>
        <a href={`/api/accounting/reports/trial-balance.xlsx?from=${from}&to=${to}`}>Excel</a>
        <a href={`/api/accounting/reports/ledger.pdf?from=${from}&to=${to}&accountId=${accountId}`}>PDF</a>
      </form>

      {error ? <p role="alert">{error}</p> : null}
      {loading ? <p>A carregar relatórios...</p> : null}

      <h2>Balancete</h2>
      {trialBalanceRows.length === 0 ? <p>Sem movimentos no período.</p> : null}
      <ul>
        {trialBalanceRows.map((row) => (
          <li key={row.accountId}>
            {row.code} {row.name}: D {row.debitCents} / C {row.creditCents}
          </li>
        ))}
      </ul>

      <h2>Razão</h2>
      {ledgerRows.length === 0 ? <p>Sem linhas para a conta selecionada.</p> : null}
      <ul>
        {ledgerRows.map((row) => (
          <li key={row.lineId}>
            {row.date}: D {row.debitCents} / C {row.creditCents} / Saldo {row.balanceCents}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. Explicação do código.

As rotas devem chamar os mesmos services para UI e ficheiros.

6. Validação do passo.

Comparar JSON com XLSX/PDF.

7. Cenário negativo/erro esperado.

Data inválida devolve JSON de erro.

### Passo 7 - Validar smoke, negativos e segurança

1. Objetivo funcional do passo no ERP.

Provar que BK-MF2-07 funciona no caso principal e falha de forma controlada nos casos negativos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/accounting-reports/accountingReportService.test.js`.
    - CRIAR: `apps/api/src/modules/accounting-reports/accountingReportRoutes.test.js`.
    - CRIAR: `apps/api/src/modules/accounting-reports/accountingReportExporters.test.js`.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-07-consultar-balancete-e-razao-exportavel-pdf-excel.md` e ficheiros criados nos passos anteriores.
    - LOCALIZAÇÃO: `apps/api/src/modules/accounting-reports/` e smoke manual em `apps/web/src/pages/AccountingReportsPage.tsx`.

3. Instruções do que fazer.

Criar teste do fluxo principal, negativos indicados neste guia e smoke manual com sessão real.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:unit -- accountingReport
npm run test:integration -- accountingReport
```

5. Explicação do código.

Os testes provam comportamento, não apenas execução. O aluno consegue defender o que foi verificado e que risco foi bloqueado.

6. Validação do passo.

Confirmar HTTP status, mensagem controlada, ausência de escrita parcial e ausência de dados de outra empresa.

7. Cenário negativo/erro esperado.

Se o smoke passa mas um negativo falha, corrigir service ou rota antes de pedir revisão.

### Passo 8 - Preparar evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar BK-MF2-07 com provas objetivas e deixar o próximo BK pronto para reutilizar os contratos criados.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF2/BK-MF2-07.md`.
    - EDITAR: nenhum ficheiro de aplicação neste passo.
    - REVER: outputs de testes, screenshots e resumo do PR.
    - LOCALIZAÇÃO: `docs/evidence/MF2/BK-MF2-07.md`.

3. Instruções do que fazer.

Registar ficheiros alterados, endpoints criados, comandos executados, resultados dos negativos e riscos que ficam para o próximo BK.

4. Código completo, correto e integrado com a app final.

```md
# BK-MF2-07

- Requisito validado: RF29
- Endpoints: GET /api/accounting/reports/trial-balance, GET /api/accounting/reports/ledger, GET /api/accounting/reports/trial-balance.xlsx, GET /api/accounting/reports/ledger.pdf
- Negativos: intervalo inválido, conta inexistente, utilizador sem sessão, conta de outra empresa
- Resultado: preencher com comandos, ficheiros exportados e imagem da página
```

5. Explicação do código.

A evidence liga requisito, código e validação. Sem esta prova, o BK continua fraco para revisão e defesa PAP.

6. Validação do passo.

Confirmar handoff para `BK-MF2-08` com exports, endpoints, modelos e limitações.

7. Cenário negativo/erro esperado.

Se existir bloqueio real, marcar no relatório e evidence com erro observado e impacto.

## Expected results

- Balancete agrega débitos/créditos.
- Razão lista movimentos e saldo acumulado.
- Exportações usam os mesmos filtros.

## Critérios de aceite

- Todos os passos seguem a estrutura obrigatória 1 a 7.
- Backend aplica autenticação, autorização e contexto multiempresa.
- Frontend usa `credentials: "include"` e não guarda tokens em `localStorage`.
- Erros são controlados e em português de Portugal.
- Evidence inclui smoke, negativos e ficheiros alterados.

## Validação final

- Totais por conta.
- Razão de uma conta.
- Export XLSX/PDF.

## Evidence para PR/defesa

- Output de agregação.
- Ficheiro exportado.
- Negativo de data inválida.

## Handoff

BK-MF2-08 reutiliza balancete para DR e Balanço.

## Changelog

- `2026-06-07`: guia reescrito como tutorial técnico linear, autocontido e alinhado com RF/RNF, MF0, MF1 e contrato de stack.
