# BK-MF7-05 - Exportações disponíveis em CSV, Excel e PDF.

## Header

- `doc_id`: `GUIA-BK-MF7-05`
- `bk_id`: `BK-MF7-05`
- `macro`: `MF7`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF7-04, BK-MF2-07`
- `rf_rnf`: `RNF22`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-06`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-05-exportacoes-disponiveis-em-csv-excel-e-pdf.md`
- `last_updated`: `2026-07-10`

#### Contrato de download atualizado

Os endpoints de exportação autorizam novamente utilizador, empresa e permissão no momento do download. Respondem por streaming com `Content-Disposition: attachment`, `X-Content-Type-Options: nosniff` e `Cache-Control: no-store`; não devolvem ficheiros dentro de JSON. Nomes são seguros e fórmulas CSV/XLSX são neutralizadas. Exportações grandes têm limites/timeout e não são montadas integralmente em memória sem orçamento explícito. Listagens de runs usam `{ items, pageInfo }` com cursor.

#### Objetivo

Neste BK vais transformar o requisito `RNF22` numa entrega técnica verificável: os relatórios contabilísticos essenciais passam a poder ser descarregados em `csv`, `xlsx` e `pdf`, sem recalcular valores fora dos services já existentes.

O resultado observável é simples: balancete e razão continuam a usar os contratos de `BK-MF2-07`, mas ganham endpoints de exportação por formato, cabeçalhos HTTP corretos, validação de formato, neutralização de células perigosas em folhas de cálculo e evidence própria para defesa.

Este BK não cria novos relatórios contabilísticos. Ele acrescenta uma camada de entrega de ficheiros sobre os relatórios já autorizados e filtrados por empresa no backend.

#### Importância

`CANONICO`: `RNF22` exige exportações essenciais em CSV, Excel e PDF.

Num ERP financeiro, exportar dados não é copiar uma tabela do ecrã. O ficheiro descarregado pode ser usado em análise externa, arquivo, auditoria e defesa PAP. Por isso, os dados exportados têm de vir da mesma fonte autorizada que alimenta a consulta no ecrã.

Este BK também é uma fronteira de segurança. O frontend pode pedir um formato, uma data ou uma conta, mas não escolhe a empresa ativa, a permissão final ou o conjunto de dados autorizado. A empresa continua a vir do contexto autenticado no backend.

#### Scope-in

- Criar `apps/api/src/modules/exports/exportFormatService.js`.
- Acrescentar endpoints `/trial-balance/export` e `/ledger/export`.
- Suportar `csv`, `xlsx` e `pdf` para balancete e razão.
- Reutilizar `buildTrialBalance`, `buildLedger`, `exportTrialBalanceXlsx` e `exportLedgerPdf`.
- Actualizar o cliente API do frontend para construir URLs de download a partir de `baseUrl`.
- Criar testes de contrato para formatos válidos, formato inválido, nome do ficheiro e neutralização de fórmulas.
- Criar evidence em `apps/api/evidence/mf7-export-formats.md`.

#### Scope-out

- Criar novos relatórios contabilísticos.
- Alterar o cálculo de balancete ou razão.
- Alterar modelos Prisma.
- Criar exportação SAF-T.
- Enviar ficheiros por email.
- Decidir permissões no frontend.
- Aceitar empresa ativa enviada pelo browser.

#### Estado antes e depois

- Antes: `BK-MF2-07` já deixou relatórios de balancete e razão, incluindo exportação XLSX para balancete e PDF para razão. A API já resolve sessão, empresa ativa e permissão de leitura contabilística no backend.
- Depois: `BK-MF7-05` acrescenta um contrato comum de exportação por formato, mantendo a fonte de dados contabilística anterior e preparando `BK-MF7-06` para continuar a interoperabilidade da MF7.

#### Pre-requisitos

- Ler `RNF22` em `docs/RNF.md`.
- Rever `RF29`, porque `BK-MF2-07` é a base funcional de balancete e razão.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `docs/planificacao/backlogs/MF-VIEWS.md`.
- Rever `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Rever `BK-MF2-07`, porque entrega os services e exporters contabilísticos usados neste BK.
- Rever `BK-MF7-04`, porque deixa o contexto operacional de autenticação, empresa ativa e permissões para a MF7.
- Rever `BK-MF7-06`, porque é o próximo BK da sequência.

#### Glossário

- Exportação: transformação de dados já autorizados num ficheiro descarregável.
- CSV: ficheiro de texto tabular, útil para análise simples e importação noutros sistemas.
- XLSX: ficheiro Excel real, útil para análise com folhas de cálculo.
- PDF: ficheiro fixo para leitura, arquivo ou defesa.
- Balancete: resumo por conta SNC dentro de um intervalo.
- Razão: detalhe cronológico dos movimentos de uma conta.
- Empresa ativa: empresa resolvida no backend a partir da sessão autenticada.
- `Content-Type`: cabeçalho HTTP que diz ao browser o tipo do ficheiro.
- `Content-Disposition`: cabeçalho HTTP que indica download como anexo.
- Neutralização de fórmula: proteção que impede células começadas por `=`, `+`, `-` ou `@` de serem executadas pela folha de cálculo.

#### Conceitos teóricos essenciais

`CANONICO`: `RNF22` define o requisito deste BK. `CANONICO`: `RF29` já definiu balancete e razão exportáveis em `BK-MF2-07`. `DERIVADO`: os endpoints `/export?format=...` são a forma mínima de acrescentar CSV, XLSX e PDF sem duplicar o cálculo contabilístico.

Balancete e razão são relatórios contabilísticos. O balancete resume débitos, créditos e saldos por conta. A razão mostra os movimentos de uma conta ao longo do tempo. Em ambos os casos, os dados vêm de lançamentos contabilísticos já registados e filtrados por empresa.

Exportar não deve alterar dados. O pedido entra pela rota HTTP, passa pelos guards de sessão, empresa ativa e permissão, chama o service contabilístico existente e só depois transforma as linhas em ficheiro. Esta ordem evita que a exportação contorne regras de segurança.

CSV e XLSX exigem cuidado adicional: uma célula que começa por `=` pode ser interpretada como fórmula por uma folha de cálculo. Por isso, valores textuais suspeitos são prefixados com `'` antes de serem escritos no ficheiro.

No frontend, uma URL de download não substitui autenticação. O browser continua a enviar a sessão através do cookie HttpOnly. O código do frontend só constrói o caminho de download; não decide empresa, papel, permissão ou ownership.

#### Arquitetura do BK

- Endpoints novos:
  - `GET /api/accounting/reports/trial-balance/export?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|xlsx|pdf`
  - `GET /api/accounting/reports/ledger/export?accountId=ID&from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|xlsx|pdf`
- Endpoints preservados:
  - `GET /api/accounting/reports/trial-balance`
  - `GET /api/accounting/reports/ledger`
  - `GET /api/accounting/reports/trial-balance.xlsx`
  - `GET /api/accounting/reports/ledger.pdf`
- Service novo: `apps/api/src/modules/exports/exportFormatService.js`.
- Services consumidos de `BK-MF2-07`: `buildTrialBalance` e `buildLedger`.
- Exporters consumidos de `BK-MF2-07`: `exportTrialBalanceXlsx` e `exportLedgerPdf`.
- Guards consumidos: `requireAuth`, `requireCompanyContext` e `requirePermission(Permission.ACCOUNTING_READ)`.
- Cliente frontend: `apps/web/src/lib/apiClient.ts`.
- Testes: `apps/api/tests/contracts/mf7-export-contracts.test.js`.
- Evidence: `apps/api/evidence/mf7-export-formats.md`.
- Handoff para o próximo BK: `BK-MF7-06` recebe um padrão de validação de ficheiros e evidence que pode reutilizar nas importações.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/exports/exportFormatService.js`
- EDITAR: `apps/api/src/modules/accounting-reports/accountingReportRoutes.js`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- CRIAR: `apps/api/tests/contracts/mf7-export-contracts.test.js`
- EDITAR: `apps/api/package.json`
- CRIAR: `apps/api/evidence/mf7-export-formats.md`
- REVER: `docs/RNF.md`
- REVER: `docs/RF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-07-consultar-balancete-e-razao-exportavel-pdf-excel.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-06-importacoes-csv-excel-com-validacao-e-logs-de-erro.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e fronteira de segurança

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK acrescenta formatos de exportação a relatórios existentes, sem mudar cálculos contabilísticos e sem deslocar decisões de segurança para o frontend.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-07-consultar-balancete-e-razao-exportavel-pdf-excel.md`
    - LOCALIZAÇÃO: linhas de `RNF22`, `RF29`, `BK-MF7-05` e `BK-MF2-07`.

3. Instruções do que fazer.

Confirma estas decisões antes de escrever código:

- `CANONICO`: `RNF22` pede exportações em CSV, Excel e PDF.
- `CANONICO`: `RF29` já entregou balancete e razão exportáveis.
- `DERIVADO`: os endpoints `/export?format=csv|xlsx|pdf` acrescentam formatos sem remover os endpoints antigos.
- `CANONICO`: empresa ativa, permissões e sessão pertencem ao backend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é uma verificação de contrato antes da implementação.

5. Explicação do código.

Sem código neste passo porque a decisão principal é de arquitetura. A exportação deve consumir os mesmos services contabilísticos que a consulta no ecrã. Isto evita dois cálculos diferentes para o mesmo relatório.

6. Validação do passo.

Resultado esperado:

- `RNF22` confirmado como fonte do requisito.
- `RF29` confirmado como fonte dos relatórios base.
- `BK-MF7-05` mantém owner, prioridade, sprint e próximo BK sem alteração.
- Nenhum endpoint novo aceita empresa ativa no query string ou no body.

7. Cenário negativo/erro esperado.

Se alguém propuser `companyId` no pedido do browser para escolher a empresa exportada, rejeita a decisão. O resultado esperado é manter a origem da empresa em `req.companyId`, já resolvida no backend.

### Passo 2 - Criar o service comum de formatos

1. Objetivo funcional do passo no contexto da app.

Criar um service pequeno e reutilizável que valida o formato, gera CSV, gera XLSX, gera PDF simples e devolve metadados prontos para a resposta HTTP.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/exports/exportFormatService.js`
    - REVER: `apps/api/src/modules/accounting-reports/accountingReportExporters.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a pasta `apps/api/src/modules/exports` se ainda não existir. Depois cria o ficheiro abaixo. Este service não consulta a base de dados, não conhece Express e não decide permissões.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Service comum para gerar ficheiros CSV, XLSX e PDF a partir de linhas já autorizadas.
 */

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import { httpError } from "../../lib/httpErrors.js";

export const ExportFormat = Object.freeze({
  CSV: "csv",
  XLSX: "xlsx",
  PDF: "pdf",
});

const EXPORT_CONTENT_TYPES = Object.freeze({
  [ExportFormat.CSV]: "text/csv; charset=utf-8",
  [ExportFormat.XLSX]: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  [ExportFormat.PDF]: "application/pdf",
});

/**
 * Normaliza o formato pedido pelo cliente.
 *
 * @param {string | undefined} format - Valor recebido na query string.
 * @returns {"csv" | "xlsx" | "pdf"} Formato validado.
 * @throws {Error} Erro HTTP 400 quando o formato não pertence ao contrato RNF22.
 */
export function normalizeExportFormat(format) {
  const normalizedFormat = String(format ?? "").trim().toLowerCase();

  if (!Object.values(ExportFormat).includes(normalizedFormat)) {
    throw httpError(
      400,
      "INVALID_EXPORT_FORMAT",
      "Formato de exportação inválido. Usa csv, xlsx ou pdf.",
    );
  }

  return normalizedFormat;
}

/**
 * Cria um nome base seguro para usar no header de download.
 *
 * @param {string} baseName - Nome funcional do relatório.
 * @returns {string} Nome sem caracteres perigosos.
 */
export function safeExportBaseName(baseName) {
  const safeName = String(baseName)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeName || "opsa-export";
}

/**
 * Neutraliza valores que uma folha de cálculo poderia interpretar como fórmula.
 *
 * @param {string | number | boolean | null | undefined | Date} value - Valor original da célula.
 * @returns {string | number | boolean} Valor seguro para CSV/XLSX/PDF.
 */
export function neutralizeSpreadsheetFormula(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  const text = String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

/**
 * Escapa uma célula CSV usando `;` como separador europeu.
 *
 * @param {string | number | boolean | null | undefined | Date} value - Valor original.
 * @returns {string} Célula segura para CSV.
 */
export function csvCell(value) {
  const safeValue = neutralizeSpreadsheetFormula(value);
  const text = String(safeValue);

  if (/[",\n\r;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/**
 * Valida que a exportação recebeu linhas tabulares.
 *
 * @param {Array<Record<string, unknown>>} rows - Linhas já autorizadas pelo backend.
 * @throws {Error} Erro HTTP 500 quando o service recebe uma shape inválida.
 */
function assertRows(rows) {
  if (!Array.isArray(rows)) {
    throw httpError(500, "INVALID_EXPORT_ROWS", "As linhas da exportação devem ser uma lista.");
  }

  for (const row of rows) {
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      throw httpError(500, "INVALID_EXPORT_ROW", "Cada linha da exportação deve ser um objeto.");
    }
  }
}

/**
 * Resolve as colunas usadas por CSV, XLSX e PDF.
 *
 * @param {Array<Record<string, unknown>>} rows - Linhas a exportar.
 * @param {Array<{ key: string, label: string }> | undefined} columns - Colunas explícitas.
 * @returns {Array<{ key: string, label: string }>} Colunas finais.
 */
function resolveColumns(rows, columns) {
  if (Array.isArray(columns) && columns.length > 0) {
    return columns.map((column) => ({ key: column.key, label: column.label }));
  }

  if (rows.length === 0) {
    throw httpError(
      500,
      "INVALID_EXPORT_COLUMNS",
      "Exportações sem linhas precisam de colunas explícitas.",
    );
  }

  return Object.keys(rows[0]).map((key) => ({ key, label: key }));
}

/**
 * Gera um ficheiro CSV em memória.
 *
 * @param {{ rows: Array<Record<string, unknown>>, columns?: Array<{ key: string, label: string }> }} input - Dados tabulares.
 * @returns {Buffer} Conteúdo CSV.
 */
export function buildCsvBuffer({ rows, columns }) {
  assertRows(rows);
  const resolvedColumns = resolveColumns(rows, columns);

  const header = resolvedColumns.map((column) => csvCell(column.label)).join(";");
  const body = rows.map((row) =>
    resolvedColumns.map((column) => csvCell(row[column.key])).join(";"),
  );

  return Buffer.from([header, ...body].join("\n"), "utf8");
}

/**
 * Gera um ficheiro XLSX genérico em memória.
 *
 * @param {{ title: string, rows: Array<Record<string, unknown>>, columns?: Array<{ key: string, label: string }> }} input - Dados tabulares.
 * @returns {Promise<Buffer>} Conteúdo XLSX.
 */
export async function buildXlsxBuffer({ title, rows, columns }) {
  assertRows(rows);
  const resolvedColumns = resolveColumns(rows, columns);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title.slice(0, 31) || "Export");

  worksheet.columns = resolvedColumns.map((column) => ({
    header: column.label,
    key: column.key,
    width: Math.max(14, Math.min(36, column.label.length + 6)),
  }));

  for (const row of rows) {
    const safeRow = {};

    // A neutralização é centralizada para proteger todos os relatórios exportados.
    for (const column of resolvedColumns) {
      safeRow[column.key] = neutralizeSpreadsheetFormula(row[column.key]);
    }

    worksheet.addRow(safeRow);
  }

  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

/**
 * Gera um PDF tabular simples em memória.
 *
 * @param {{ title: string, rows: Array<Record<string, unknown>>, columns?: Array<{ key: string, label: string }> }} input - Dados tabulares.
 * @returns {Promise<Buffer>} Conteúdo PDF.
 */
export function buildPdfBuffer({ title, rows, columns }) {
  assertRows(rows);
  const resolvedColumns = resolveColumns(rows, columns);

  return new Promise((resolve, reject) => {
    const chunks = [];
    const document = new PDFDocument({ margin: 40, size: "A4" });

    document.on("data", (chunk) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document.fontSize(16).text(title, { underline: true });
    document.moveDown();

    for (const row of rows) {
      // O PDF usa pares label/valor para ser legível mesmo quando há muitas colunas.
      for (const column of resolvedColumns) {
        const value = neutralizeSpreadsheetFormula(row[column.key]);
        document.fontSize(9).text(`${column.label}: ${value}`);
      }

      document.moveDown(0.5);
    }

    document.end();
  });
}

/**
 * Gera o ficheiro final e os metadados necessários para a resposta HTTP.
 *
 * @param {{ format: string, baseName: string, title: string, rows: Array<Record<string, unknown>>, columns?: Array<{ key: string, label: string }>, xlsx?: () => Promise<Buffer>, pdf?: () => Promise<Buffer> }} input - Pedido de exportação.
 * @returns {Promise<{ contentType: string, fileName: string, body: Buffer }>} Ficheiro e metadados.
 */
export async function buildExportFile({ format, baseName, title, rows, columns, xlsx, pdf }) {
  const normalizedFormat = normalizeExportFormat(format);
  const safeBaseName = safeExportBaseName(baseName);
  const fileName = `${safeBaseName}.${normalizedFormat}`;

  if (normalizedFormat === ExportFormat.CSV) {
    return {
      contentType: EXPORT_CONTENT_TYPES[normalizedFormat],
      fileName,
      body: buildCsvBuffer({ rows, columns }),
    };
  }

  if (normalizedFormat === ExportFormat.XLSX) {
    return {
      contentType: EXPORT_CONTENT_TYPES[normalizedFormat],
      fileName,
      body: xlsx ? await xlsx() : await buildXlsxBuffer({ title, rows, columns }),
    };
  }

  return {
    contentType: EXPORT_CONTENT_TYPES[normalizedFormat],
    fileName,
    body: pdf ? await pdf() : await buildPdfBuffer({ title, rows, columns }),
  };
}

/**
 * Cria o valor final do header `Content-Disposition`.
 *
 * @param {string} fileName - Nome do ficheiro já validado.
 * @returns {string} Header seguro para download.
 */
export function buildContentDisposition(fileName) {
  const extension = String(fileName).split(".").pop();
  const baseName = safeExportBaseName(String(fileName).replace(/\.[a-z0-9]+$/i, ""));
  return `attachment; filename="${baseName}.${extension}"`;
}
```

5. Explicação do código.

Este service separa geração de ficheiros da camada HTTP. `normalizeExportFormat` cumpre `RNF22` ao aceitar apenas `csv`, `xlsx` e `pdf`; `safeExportBaseName` impede nomes perigosos no header; `neutralizeSpreadsheetFormula` protege CSV e XLSX contra células que uma folha de cálculo poderia executar como fórmula.

`buildExportFile` devolve sempre `contentType`, `fileName` e `body`. Isso dá à route um contrato simples: validar, chamar o service contabilístico, pedir o ficheiro e enviar a resposta. O aluno pode adaptar títulos e colunas, mas não deve remover a validação do formato nem a neutralização de fórmulas.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/exports/exportFormatService.js
```

Resultado esperado: o comando termina sem erro de sintaxe.

7. Cenário negativo/erro esperado.

Chamar `normalizeExportFormat("html")` deve lançar erro HTTP `400` com código `INVALID_EXPORT_FORMAT`. Esse negativo prova que o service não aceita formatos fora do contrato.

### Passo 3 - Integrar exportação nas rotas contabilísticas

1. Objetivo funcional do passo no contexto da app.

Acrescentar endpoints de exportação sem quebrar os endpoints JSON e sem trocar os guards de autenticação, empresa ativa e permissão.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/accounting-reports/accountingReportRoutes.js`
    - REVER: `apps/api/src/modules/accounting-reports/accountingReportService.js`
    - REVER: `apps/api/src/modules/accounting-reports/accountingReportExporters.js`
    - LOCALIZAÇÃO: ficheiro completo `accountingReportRoutes.js`.

3. Instruções do que fazer.

Substitui o ficheiro de rotas pelo conteúdo abaixo, preservando os endpoints existentes de `BK-MF2-07` e acrescentando os endpoints `/export`.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Rotas de balancete, razão e exportações contabilísticas.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { parseDateRange } from "./accountingReportFilters.js";
import {
  buildLedger,
  buildTrialBalance,
} from "./accountingReportService.js";
import {
  exportLedgerPdf,
  exportTrialBalanceXlsx,
} from "./accountingReportExporters.js";
import {
  buildContentDisposition,
  buildExportFile,
  ExportFormat,
  normalizeExportFormat,
} from "../exports/exportFormatService.js";

const trialBalanceColumns = [
  { key: "code", label: "Conta" },
  { key: "name", label: "Descrição" },
  { key: "debit", label: "Débito" },
  { key: "credit", label: "Crédito" },
  { key: "balance", label: "Saldo" },
];

const ledgerColumns = [
  { key: "entryDate", label: "Data" },
  { key: "description", label: "Descrição" },
  { key: "source", label: "Origem" },
  { key: "debit", label: "Débito" },
  { key: "credit", label: "Crédito" },
  { key: "balance", label: "Saldo" },
];

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param res - Resposta Express usada para enviar o erro ao cliente.
 * @param error - Erro capturado durante a operação.
 * @returns Resposta HTTP de erro.
 */
function sendError(res, error) {
  const response = toHttpError(error);
  return res
    .status(response.status)
    .json({ error: response.code, message: response.message });
}

/**
 * Formata valores em cêntimos para apresentação nos ficheiros.
 *
 * @param {number} value - Valor monetário em cêntimos.
 * @returns {string} Valor em euros com duas casas decimais.
 */
function cents(value) {
  return (Number(value ?? 0) / 100).toFixed(2);
}

/**
 * Formata datas de relatório no padrão ISO curto.
 *
 * @param {Date | string} value - Data vinda do service contabilístico.
 * @returns {string} Data no formato YYYY-MM-DD.
 */
function dateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

/**
 * Converte o balancete real da MF2 para linhas tabulares de exportação.
 *
 * @param {object} trialBalance - Resultado de `buildTrialBalance`.
 * @returns {Array<Record<string, string>>} Linhas prontas para CSV/XLSX/PDF.
 */
function toTrialBalanceRows(trialBalance) {
  return trialBalance.rows.map((row) => ({
    code: row.code,
    name: row.name,
    debit: cents(row.debitCents),
    credit: cents(row.creditCents),
    balance: cents(row.balanceCents),
  }));
}

/**
 * Converte a razão real da MF2 para linhas tabulares de exportação.
 *
 * @param {object} ledger - Resultado de `buildLedger`.
 * @returns {Array<Record<string, string>>} Linhas prontas para CSV/XLSX/PDF.
 */
function toLedgerRows(ledger) {
  return ledger.rows.map((row) => ({
    entryDate: dateOnly(row.entryDate),
    description: row.description,
    source: row.source,
    debit: cents(row.debitCents),
    credit: cents(row.creditCents),
    balance: cents(row.balanceCents),
  }));
}

/**
 * Envia um ficheiro de relatório contabilístico na resposta HTTP.
 *
 * @param res - Resposta Express.
 * @param {object} input - Pedido de exportação validado.
 * @returns {Promise<object>} Resposta HTTP final.
 */
async function sendAccountingReportFile(res, input) {
  const file = await buildExportFile(input);

  res.setHeader("Content-Type", file.contentType);
  res.setHeader("Content-Disposition", buildContentDisposition(file.fileName));
  return res.status(200).end(file.body);
}

/**
 * Monta as rotas Express dos relatórios contabilísticos.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} input - Dependências do router.
 * @returns Router Express configurado para relatórios e exportações.
 */
export function buildAccountingReportRoutes({ prisma }) {
  const router = Router();
  const guards = [
    requireAuth(prisma),
    requireCompanyContext(prisma),
    requirePermission(Permission.ACCOUNTING_READ),
  ];

  router.get("/trial-balance", guards, async (req, res) => {
    try {
      const range = parseDateRange(req.query);
      const trialBalance = await buildTrialBalance(prisma, {
        // A empresa vem do contexto autenticado para impedir exportação de outra empresa.
        companyId: req.companyId,
        ...range,
      });
      return res.status(200).json({ trialBalance });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/ledger", guards, async (req, res) => {
    try {
      const range = parseDateRange(req.query);
      const ledger = await buildLedger(prisma, {
        companyId: req.companyId,
        accountId: String(req.query.accountId ?? ""),
        ...range,
      });
      return res.status(200).json({ ledger });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/trial-balance.xlsx", guards, async (req, res) => {
    try {
      const range = parseDateRange(req.query);
      const trialBalance = await buildTrialBalance(prisma, {
        companyId: req.companyId,
        ...range,
      });
      const file = await exportTrialBalanceXlsx(trialBalance);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader("Content-Disposition", 'attachment; filename="balancete.xlsx"');
      return res.status(200).end(file);
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/ledger.pdf", guards, async (req, res) => {
    try {
      const range = parseDateRange(req.query);
      const ledger = await buildLedger(prisma, {
        companyId: req.companyId,
        accountId: String(req.query.accountId ?? ""),
        ...range,
      });
      const file = await exportLedgerPdf(ledger);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="razao.pdf"');
      return res.status(200).end(file);
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/trial-balance/export", guards, async (req, res) => {
    try {
      const format = normalizeExportFormat(req.query.format);
      const range = parseDateRange(req.query);
      const trialBalance = await buildTrialBalance(prisma, {
        companyId: req.companyId,
        ...range,
      });

      return sendAccountingReportFile(res, {
        format,
        baseName: "opsa-balancete",
        title: "Balancete OPSA",
        rows: toTrialBalanceRows(trialBalance),
        columns: trialBalanceColumns,
        // O XLSX especializado preserva o layout contabilístico já entregue em BK-MF2-07.
        xlsx:
          format === ExportFormat.XLSX
            ? () => exportTrialBalanceXlsx(trialBalance)
            : undefined,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/ledger/export", guards, async (req, res) => {
    try {
      const format = normalizeExportFormat(req.query.format);
      const range = parseDateRange(req.query);
      const ledger = await buildLedger(prisma, {
        companyId: req.companyId,
        accountId: String(req.query.accountId ?? ""),
        ...range,
      });

      return sendAccountingReportFile(res, {
        format,
        baseName: "opsa-razao",
        title: "Razão OPSA",
        rows: toLedgerRows(ledger),
        columns: ledgerColumns,
        // O PDF especializado preserva o layout contabilístico já entregue em BK-MF2-07.
        pdf: format === ExportFormat.PDF ? () => exportLedgerPdf(ledger) : undefined,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}
```

5. Explicação do código.

Esta route preserva os quatro endpoints de `BK-MF2-07` e adiciona dois endpoints novos para `RNF22`. Os imports usam os módulos já existentes: autenticação, contexto de empresa, permissão de leitura contabilística, filtros de datas, services de balancete/razão e exporters especializados.

`toTrialBalanceRows` e `toLedgerRows` corrigem a integração com a shape real dos services: `code`, `name`, `debitCents`, `creditCents`, `balanceCents`, `entryDate`, `description` e `source`. Isto evita o erro de chamar campos que não existem.

Os endpoints `/export` validam primeiro o formato, depois validam datas, depois chamam o service contabilístico. A autorização está nos guards. O frontend não envia `companyId`; o backend usa `req.companyId`.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/accounting-reports/accountingReportRoutes.js
```

Resultado esperado: o comando termina sem erro de sintaxe e os endpoints antigos continuam presentes no ficheiro.

7. Cenário negativo/erro esperado.

Pedir `GET /api/accounting/reports/trial-balance/export?format=html` deve devolver HTTP `400` com `INVALID_EXPORT_FORMAT`. Um pedido sem sessão deve falhar nos guards antes de gerar ficheiro.

### Passo 4 - Atualizar o cliente API do frontend

1. Objetivo funcional do passo no contexto da app.

Permitir que o frontend construa URLs de download para os novos endpoints sem guardar credenciais e sem criar uma raiz de API paralela.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: tipos junto dos restantes tipos do cliente e bloco `accountingReports` dentro de `createApiClient`.

3. Instruções do que fazer.

Acrescenta os tipos abaixo junto dos tipos do cliente. Depois substitui o bloco `accountingReports` pelo bloco completo apresentado. O ponto importante é usar o `baseUrl` interno de `createApiClient`, não uma constante paralela.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/apiClient.ts
/**
 * Identifica os relatórios contabilísticos que podem gerar ficheiro.
 *
 * Estes valores existem para impedir que a UI construa URLs para relatórios
 * que o backend não expõe neste BK.
 */
export type AccountingReportExportKind = "trial-balance" | "ledger";

/**
 * Identifica os formatos de exportação aceites pelo backend.
 *
 * O formato continua a ser validado no backend; este tipo só evita erros
 * simples na chamada feita pelo frontend.
 */
export type AccountingReportExportFormat = "csv" | "xlsx" | "pdf";

/**
 * Payload usado pelo cliente API para construir uma URL de exportação.
 *
 * @property report - Relatório contabilístico pedido pelo utilizador.
 * @property format - Formato de ficheiro permitido por RNF22.
 * @property from - Data inicial opcional do filtro já usado nos relatórios.
 * @property to - Data final opcional do filtro já usado nos relatórios.
 * @property accountId - Conta usada apenas no razão contabilístico.
 */
export interface AccountingReportExportUrlInput {
  report: AccountingReportExportKind;
  format: AccountingReportExportFormat;
  from?: string;
  to?: string;
  accountId?: string;
}
```

```ts
// apps/web/src/lib/apiClient.ts
accountingReports: {
  // As consultas antigas continuam a devolver JSON para os ecrãs já existentes.
  trialBalance: (from: string, to: string) =>
    request("GET", `/accounting/reports/trial-balance${queryString({ from, to })}`),
  ledger: (accountId: string, from: string, to: string) =>
    request(
      "GET",
      `/accounting/reports/ledger${queryString({ accountId, from, to })}`,
    ),

  // Estes helpers preservam compatibilidade com páginas que já esperavam um formato fixo.
  trialBalanceExportUrl: (from: string, to: string) =>
    `${baseUrl}/accounting/reports/trial-balance.xlsx${queryString({ from, to })}`,
  ledgerExportUrl: (accountId: string, from: string, to: string) =>
    `${baseUrl}/accounting/reports/ledger.pdf${queryString({ accountId, from, to })}`,

  /**
   * Constrói uma URL de download para o endpoint de exportação contabilística.
   *
   * @param input - Relatório, formato e filtros selecionados na UI.
   * @returns URL relativa à API central, sem companyId nem credenciais no query string.
   */
  exportUrl: (input: AccountingReportExportUrlInput) => {
    const params: Record<string, string | undefined> = {
      format: input.format,
      from: input.from,
      to: input.to,
      // A conta só pertence ao razão; no balancete este campo não deve ser enviado.
      accountId: input.report === "ledger" ? input.accountId : undefined,
    };

    // A URL usa o mesmo baseUrl do cliente autenticado; o browser envia o cookie HttpOnly.
    return `${baseUrl}/accounting/reports/${input.report}/export${queryString(params)}`;
  },
},
```

Exemplo de uso numa página React:

```tsx
// apps/web/src/pages/AccountingReportsPage.tsx
<a
  className="button button-secondary"
  href={apiClient.accountingReports.exportUrl({
    report: "trial-balance",
    format: "xlsx",
    from: filters.from,
    to: filters.to,
  })}
>
  {/* O browser faz o download por cookie HttpOnly; a UI não envia companyId nem token. */}
  Exportar balancete Excel
</a>
```

5. Explicação do código.

Os tipos impedem valores fora de `trial-balance`, `ledger`, `csv`, `xlsx` e `pdf`. O helper `exportUrl` constrói a URL a partir de `baseUrl`, que já pertence ao cliente central. Isto evita uma segunda origem de API e mantém a sessão web no fluxo normal do browser.

O frontend continua sem decidir empresa ativa ou permissões. Ele só escolhe relatório, formato e filtros de data/conta. A validação final fica no backend.

6. Validação do passo.

Executa o comando de frontend existente no projecto:

```bash
cd apps/web
npm run typecheck
```

Resultado esperado: o tipo `AccountingReportExportUrlInput` é aceite e a chamada de exemplo só permite formatos do contrato.

7. Cenário negativo/erro esperado.

Tentar chamar `exportUrl({ report: "ledger", format: "html" })` deve falhar no TypeScript porque `"html"` não pertence ao tipo `AccountingReportExportFormat`.

### Passo 5 - Criar testes de contrato das exportações

1. Objetivo funcional do passo no contexto da app.

Garantir que o service de exportação valida formatos, gera metadados corretos e protege células de folha de cálculo.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf7-export-contracts.test.js`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: teste completo e scripts de validação.

3. Instruções do que fazer.

Cria o teste abaixo. Depois acrescenta os scripts `test:mf7:exports` e, se ainda não existir, um agregador `test:mf7` que inclua este teste e os testes MF7 já criados.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Testes de contrato para exportações RNF22.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildContentDisposition,
  buildCsvBuffer,
  buildExportFile,
  normalizeExportFormat,
} from "../../src/modules/exports/exportFormatService.js";

const columns = [
  { key: "accountCode", label: "Conta" },
  { key: "accountName", label: "Descrição" },
  { key: "balance", label: "Saldo" },
];

test("gera CSV com cabeçalho, separador europeu e fórmula neutralizada", () => {
  const csv = buildCsvBuffer({
    columns,
    rows: [
      {
        accountCode: "12",
        accountName: "=SOMA(A1:A2)",
        balance: "150.00",
      },
    ],
  }).toString("utf8");

  // A fórmula fica como texto para a folha de cálculo não executar conteúdo inesperado.
  assert.match(csv, /Conta;Descrição;Saldo/);
  assert.match(csv, /'=SOMA\(A1:A2\)/);
});

test("gera metadados corretos para exportação CSV", async () => {
  const file = await buildExportFile({
    format: "csv",
    baseName: "Balancete OPSA",
    title: "Balancete OPSA",
    columns,
    rows: [
      {
        accountCode: "12",
        accountName: "Depósitos à ordem",
        balance: "150.00",
      },
    ],
  });

  assert.equal(file.contentType, "text/csv; charset=utf-8");
  assert.equal(file.fileName, "balancete-opsa.csv");
  assert.ok(Buffer.isBuffer(file.body));
  assert.ok(file.body.length > 0);
});

test("gera metadados corretos para exportação XLSX", async () => {
  const file = await buildExportFile({
    format: "xlsx",
    baseName: "Balancete OPSA",
    title: "Balancete OPSA",
    columns,
    rows: [
      {
        accountCode: "12",
        accountName: "Depósitos à ordem",
        balance: "150.00",
      },
    ],
  });

  assert.equal(
    file.contentType,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  assert.equal(file.fileName, "balancete-opsa.xlsx");
  assert.ok(Buffer.isBuffer(file.body));
  assert.ok(file.body.length > 0);
});

test("rejeita formatos fora do contrato RNF22", () => {
  assert.throws(
    () => normalizeExportFormat("html"),
    (error) => error.status === 400 && error.code === "INVALID_EXPORT_FORMAT",
  );
});

test("gera Content-Disposition de anexo", () => {
  assert.equal(
    buildContentDisposition("balancete-opsa.csv"),
    'attachment; filename="balancete-opsa.csv"',
  );
});
```

```json
{
  "scripts": {
    "test:mf7:exports": "node --test tests/contracts/mf7-export-contracts.test.js",
    "test:mf7": "npm run test:mf7:exports"
  }
}
```

5. Explicação do código.

O teste cobre o contrato que pode falhar sem servidor HTTP: CSV com separador correto, proteção contra fórmula, metadados de CSV, metadados de XLSX, rejeição de formato inválido e header de anexo.

Estes testes não substituem o smoke autenticado, mas reduzem o risco de regressão no service. O aluno pode acrescentar novos casos para PDF, mas não deve remover o negativo de formato inválido.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run test:mf7:exports
```

Resultado esperado: todos os testes terminam com `pass`.

7. Cenário negativo/erro esperado.

O teste `"rejeita formatos fora do contrato RNF22"` deve falhar se `normalizeExportFormat` aceitar `html`, `xml` ou qualquer formato não definido em `RNF22`.

### Passo 6 - Guardar evidence técnica

1. Objetivo funcional do passo no contexto da app.

Registar a prova técnica da exportação, incluindo comandos, endpoints, formatos e negativos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/evidence/mf7-export-formats.md`
    - REVER: `apps/api/src/modules/accounting-reports/accountingReportRoutes.js`
    - LOCALIZAÇÃO: ficheiro completo de evidence.

3. Instruções do que fazer.

Cria a evidence abaixo depois de executar os comandos. Preenche a data real, os outputs observados e o estado de cada verificação.

4. Código completo, correto e integrado com a app final.

````md
# Evidence MF7 - exportações CSV, Excel e PDF

## Contexto

- Data: 2026-06-26
- BK: BK-MF7-05
- Requisito: RNF22
- Origem da empresa: sessão autenticada resolvida no backend

## Comandos executados

```bash
cd apps/api
node --check src/modules/exports/exportFormatService.js
node --check src/modules/accounting-reports/accountingReportRoutes.js
npm run test:mf7:exports
```

## Smoke manual autenticado

```bash
curl -i --cookie apps/api/evidence/sessao-local.txt "http://localhost:3000/api/accounting/reports/trial-balance/export?from=2026-01-01&to=2026-12-31&format=csv"
curl -i --cookie apps/api/evidence/sessao-local.txt "http://localhost:3000/api/accounting/reports/trial-balance/export?from=2026-01-01&to=2026-12-31&format=xlsx"
curl -i --cookie apps/api/evidence/sessao-local.txt "http://localhost:3000/api/accounting/reports/ledger/export?accountId=ACC-001&from=2026-01-01&to=2026-12-31&format=pdf"
curl -i --cookie apps/api/evidence/sessao-local.txt "http://localhost:3000/api/accounting/reports/trial-balance/export?format=html"
```

## Resultado esperado

| Verificação | Resultado |
| --- | --- |
| CSV devolve `Content-Type: text/csv; charset=utf-8` | PASS |
| XLSX devolve content type de Excel | PASS |
| PDF devolve `Content-Type: application/pdf` | PASS |
| Ficheiros válidos usam `Content-Disposition: attachment` | PASS |
| `format=html` devolve HTTP 400 e `INVALID_EXPORT_FORMAT` | PASS |
| Nenhum pedido aceita empresa vinda do browser | PASS |
````

5. Explicação do código.

A evidence prova que a entrega não ficou apenas descrita no guia. Os comandos estáticos confirmam sintaxe e testes. Os `curl` confirmam o comportamento HTTP que o browser vai usar para descarregar ficheiros.

O ficheiro não deve guardar dados financeiros reais nem cookies. O nome `sessao-local.txt` indica apenas um ficheiro local usado no ambiente de validação.

6. Validação do passo.

Confirma que a evidence contém:

- comandos executados;
- três formatos válidos;
- um negativo de formato inválido;
- indicação explícita de que a empresa vem da sessão autenticada.

7. Cenário negativo/erro esperado.

Se o servidor local não estiver disponível, regista a limitação na evidence e mantém os comandos estáticos executados. Não marques smoke HTTP como executado sem resposta real.

### Passo 7 - Validar fecho e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com validação textual, técnica e pedagógica, deixando claro o que `BK-MF7-06` pode reutilizar.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/exports/exportFormatService.js`
    - REVER: `apps/api/src/modules/accounting-reports/accountingReportRoutes.js`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/api/tests/contracts/mf7-export-contracts.test.js`
    - REVER: `apps/api/evidence/mf7-export-formats.md`
    - LOCALIZAÇÃO: validação final do BK.

3. Instruções do que fazer.

Executa a validação final e confirma manualmente os pontos de segurança. A validação só fecha se os endpoints usarem guards, `req.companyId`, formato validado e `Content-Disposition`.

4. Código completo, correto e integrado com a app final.

```bash
cd apps/api
node --check src/modules/exports/exportFormatService.js
node --check src/modules/accounting-reports/accountingReportRoutes.js
npm run test:mf7:exports
npm run test:contracts
```

5. Explicação do código.

Estes comandos verificam as peças novas e a suite de contratos existente. `node --check` apanha erros de sintaxe antes de correr a app. `test:mf7:exports` valida o contrato específico deste BK. `test:contracts` protege compatibilidade com os contratos já existentes.

O handoff para `BK-MF7-06` é a disciplina de ficheiros: formatos explícitos, validação antes de processar e evidence com negativo. A diferença é que `BK-MF7-06` vai receber ficheiros do utilizador, enquanto este BK gera ficheiros a partir de dados já autorizados.

6. Validação do passo.

Resultado esperado:

- `node --check` passa nos ficheiros novos/editados.
- `npm run test:mf7:exports` passa.
- `npm run test:contracts` passa ou regista uma falha preexistente com evidência.
- A pesquisa textual não encontra caminhos privados no guia.
- A pesquisa textual encontra `companyId` apenas como contexto backend autorizado.

7. Cenário negativo/erro esperado.

Se `npm run test:contracts` falhar por testes antigos não relacionados com este BK, não escondas a falha. Regista o erro exacto na evidence e no PR, e mantém `test:mf7:exports` como prova focal deste requisito.

#### Critérios de aceite

- `RNF22` fica coberto por endpoints de exportação em `csv`, `xlsx` e `pdf`.
- Os endpoints novos usam autenticação, empresa ativa e permissão no backend.
- O frontend não envia empresa ativa.
- Formatos inválidos devolvem HTTP `400` com `INVALID_EXPORT_FORMAT`.
- CSV e XLSX neutralizam células começadas por `=`, `+`, `-` ou `@`.
- Os ficheiros válidos devolvem `Content-Type` correcto.
- Os ficheiros válidos devolvem `Content-Disposition: attachment`.
- O cliente frontend constrói URLs com o `baseUrl` do cliente API central.
- Existe teste de contrato para formato válido e formato inválido.
- Existe evidence com CSV, XLSX, PDF e negativo de formato.

#### Validação final

Executa:

```bash
cd apps/api
node --check src/modules/exports/exportFormatService.js
node --check src/modules/accounting-reports/accountingReportRoutes.js
npm run test:mf7:exports
npm run test:contracts
```

Depois confirma:

- `GET /api/accounting/reports/trial-balance/export?format=csv` devolve CSV.
- `GET /api/accounting/reports/trial-balance/export?format=xlsx` devolve Excel.
- `GET /api/accounting/reports/ledger/export?format=pdf` devolve PDF.
- `format=html` devolve `400`.
- pedidos sem sessão não geram ficheiro.
- pedidos sem permissão de leitura contabilística não geram ficheiro.
- nenhum pedido usa empresa ativa vinda do browser.

#### Evidence para PR/defesa

- `pr`: referência do PR ou pacote de entrega.
- `proof`: outputs de `node --check`, `npm run test:mf7:exports`, `npm run test:contracts` e smoke autenticado.
- `neg`: `format=html`, pedido sem sessão e pedido sem permissão.
- `fonte`: `docs/RNF.md`, `docs/RF.md`, matriz, backlog, `BK-MF2-07` e este guia.
- `multiempresa`: confirmação de que `companyId` vem de `req.companyId` no backend.

#### Handoff

Próximo BK recomendado: `BK-MF7-06`.

Este BK entrega a `BK-MF7-06` um contrato operacional validado: ficheiros têm formatos explícitos, validação antes de gerar resposta, evidence com negativos e separação clara entre frontend, backend e dados autorizados.

`BK-MF7-06` deve seguir o mesmo rigor, mas no sentido inverso: em vez de gerar ficheiros a partir de relatórios, vai receber ficheiros CSV/Excel e validar extensão, volume, linhas rejeitadas e logs de integração.

#### Changelog

- `2026-06-27`: reforçados JSDoc e comentários didáticos nos blocos frontend de `apiClient.ts` e no exemplo TSX de exportação.
- `2026-06-26`: guia reestruturado para o contrato `####` e passos 1 a 7, com validação e evidence alinhadas a `RNF22`.
- `2026-06-26`: código backend alinhado com os contratos reais de `buildTrialBalance(prisma, input)`, `buildLedger(prisma, input)`, guards e exporters de `BK-MF2-07`.
- `2026-06-26`: helper frontend corrigido para usar `baseUrl` do cliente API central.
