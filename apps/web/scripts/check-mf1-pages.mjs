import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));

const expectedFiles = [
  "src/lib/vatRateApi.ts",
  "src/lib/salesApi.ts",
  "src/lib/receiptApi.ts",
  "src/lib/salesOpenItemsApi.ts",
  "src/lib/accountingApi.ts",
  "src/lib/purchasesApi.ts",
  "src/lib/paymentApi.ts",
  "src/lib/purchaseApprovalApi.ts",
  "src/pages/VatRatesPage.tsx",
  "src/pages/SaleDocumentsPage.tsx",
  "src/pages/ReceiptsPage.tsx",
  "src/pages/SalePostingsPage.tsx",
  "src/pages/SalesOpenItemsPage.tsx",
  "src/pages/SaleApprovalPage.tsx",
  "src/pages/PurchaseDocumentsPage.tsx",
  "src/pages/PaymentsPage.tsx",
  "src/pages/PurchasePostingsPage.tsx",
  "src/pages/PurchaseApprovalPage.tsx",
];

const missing = expectedFiles.filter((file) => !existsSync(join(root, file)));
if (missing.length > 0) {
  throw new Error(`Ficheiros MF1 em falta: ${missing.join(", ")}`);
}

const app = readFileSync(join(root, "src/App.tsx"), "utf8");
const mf1Pages = readFileSync(join(root, "src/pages/mf1Pages.tsx"), "utf8");

if (app.includes("Linhas JSON") || mf1Pages.includes("Linhas JSON")) {
  throw new Error("Os formularios MF1 nao devem expor Linhas JSON ao utilizador.");
}

for (const page of [
  "VatRatesPage",
  "SaleDocumentsPage",
  "ReceiptsPage",
  "SalesOpenItemsPage",
  "SaleApprovalPage",
  "SalePostingsPage",
  "PurchaseDocumentsPage",
  "PaymentsPage",
  "PurchaseApprovalPage",
  "PurchasePostingsPage",
]) {
  if (!app.includes(page)) {
    throw new Error(`Pagina MF1 nao ligada na navegacao: ${page}`);
  }
}

console.info("MF1 frontend pages contract OK");
