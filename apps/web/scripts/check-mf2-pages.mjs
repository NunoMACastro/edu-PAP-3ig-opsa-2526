import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));

const app = readFileSync(join(root, "src/App.tsx"), "utf8");
const apiClient = readFileSync(join(root, "src/lib/apiClient.ts"), "utf8");
const purchaseApprovalApi = readFileSync(join(root, "src/lib/purchaseApprovalApi.ts"), "utf8");
const mf1Pages = readFileSync(join(root, "src/pages/mf1Pages.tsx"), "utf8");
const mf2Pages = readFileSync(join(root, "src/pages/mf2Pages.tsx"), "utf8");

function assertIncludes(source, expected, context) {
  if (!source.includes(expected)) {
    throw new Error(`${context} em falta: ${expected}`);
  }
}

function assertContract(context, source, expectedValues) {
  for (const expected of expectedValues) {
    assertIncludes(source, expected, context);
  }
}

const contracts = [
  {
    bk: "BK-MF2-01",
    checks: [
      {
        source: mf1Pages,
        values: [
          "Reprovar compra",
          "Consultar historico",
          "purchaseApprovalApi.rejectDocument",
          "purchaseApprovalApi.approvalHistory",
        ],
      },
      {
        source: purchaseApprovalApi,
        values: [
          "apiClient.purchases.rejectDocument",
          "apiClient.purchases.approvalHistory",
        ],
      },
    ],
  },
  {
    bk: "BK-MF2-02",
    checks: [
      {
        source: app,
        values: ["StockMovementsPage", "Movimentos de stock"],
      },
      {
        source: mf2Pages,
        values: [
          "StockMovementsPage",
          "apiClient.inventory.listStockMovements",
          "apiClient.inventory.createStockMovement",
          "Movimento de stock criado.",
        ],
      },
      {
        source: apiClient,
        values: [
          'request("GET", "/inventory/stock-movements")',
          'request("POST", "/inventory/stock-movements"',
        ],
      },
    ],
  },
  {
    bk: "BK-MF2-03",
    checks: [
      {
        source: app,
        values: ["FifoCostPage", "Custo FIFO"],
      },
      {
        source: mf2Pages,
        values: [
          "FifoCostPage",
          "apiClient.inventory.previewFifoCost",
          "Preview FIFO calculado.",
        ],
      },
      {
        source: apiClient,
        values: [
          "/inventory/fifo-cost/preview",
          "itemId: string",
          "warehouseId: string",
          "quantity: string",
        ],
      },
    ],
  },
  {
    bk: "BK-MF2-04",
    checks: [
      {
        source: app,
        values: ["InventoryCountPage", "Contagens fisicas"],
      },
      {
        source: mf2Pages,
        values: [
          "InventoryCountPage",
          "apiClient.inventory.listCounts",
          "apiClient.inventory.createCount",
          "apiClient.inventory.saveCountLines",
          "apiClient.inventory.postCount",
          "Contagem publicada.",
        ],
      },
      {
        source: apiClient,
        values: [
          'request("GET", "/inventory/counts")',
          'request("POST", "/inventory/counts"',
          'request("PATCH", `/inventory/counts/${id}/lines`',
          'request("POST", `/inventory/counts/${id}/post`',
        ],
      },
    ],
  },
  {
    bk: "BK-MF2-05",
    checks: [
      {
        source: app,
        values: ["StockAlertsPage", "Alertas de stock"],
      },
      {
        source: mf2Pages,
        values: [
          "StockAlertsPage",
          "apiClient.inventory.listStockAlerts",
          "apiClient.inventory.saveStockAlertSetting",
          "Configuração de alertas guardada.",
        ],
      },
      {
        source: apiClient,
        values: [
          'request("GET", "/inventory/stock-alerts")',
          'request("PUT", "/inventory/stock-alerts/settings"',
        ],
      },
    ],
  },
  {
    bk: "BK-MF2-06",
    checks: [
      {
        source: app,
        values: ["ManualJournalPage", "Lancamentos manuais"],
      },
      {
        source: mf2Pages,
        values: [
          "ManualJournalPage",
          'type="file"',
          "contentBase64",
          "fileToBase64",
          "application/pdf,image/png,image/jpeg",
          "apiClient.manualJournals.addAttachment",
        ],
      },
      {
        source: apiClient,
        values: [
          "/accounting/manual-journals",
          'request("POST", `/accounting/manual-journals/${id}/attachments`',
        ],
      },
    ],
  },
  {
    bk: "BK-MF2-07",
    checks: [
      {
        source: app,
        values: ["AccountingReportsPage", "Balancete e razao"],
      },
      {
        source: mf2Pages,
        values: [
          "AccountingReportsPage",
          "apiClient.accountingReports.trialBalance",
          "apiClient.accountingReports.ledger",
          "apiClient.accountingReports.trialBalanceExportUrl",
          "apiClient.accountingReports.ledgerExportUrl",
          "Descarregar balancete Excel",
          "Descarregar razão PDF",
        ],
      },
      {
        source: apiClient,
        values: [
          "/accounting/reports/trial-balance",
          "/accounting/reports/ledger",
          "/accounting/reports/trial-balance.xlsx",
          "/accounting/reports/ledger.pdf",
        ],
      },
    ],
  },
  {
    bk: "BK-MF2-08",
    checks: [
      {
        source: app,
        values: ["FinancialStatementsPage", "DR e Balanco"],
      },
      {
        source: mf2Pages,
        values: [
          "FinancialStatementsPage",
          "apiClient.financialStatements.incomeStatement",
          "apiClient.financialStatements.balanceSheet",
          "Demonstração de Resultados",
          "Balanço interno",
        ],
      },
      {
        source: apiClient,
        values: [
          "/accounting/statements/income-statement",
          "/accounting/statements/balance-sheet",
        ],
      },
    ],
  },
];

for (const contract of contracts) {
  for (const check of contract.checks) {
    assertContract(`Fluxo ${contract.bk} na UI`, check.source, check.values);
  }
}

console.info("MF2 frontend pages contract OK");
