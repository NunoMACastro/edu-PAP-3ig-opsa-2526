// apps/web/scripts/check-mf8-subscriptions-ui.mjs

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function readProjectFile(path) {
  return readFileSync(resolve(root, path), "utf8");
}

function assertIncludes(label, content, expected, reason) {
  if (!content.includes(expected)) {
    throw new Error(`${label}: falta ${reason}`);
  }
}

function assertNotIncludes(label, content, forbidden, reason) {
  if (content.includes(forbidden)) {
    throw new Error(`${label}: contém ${reason}`);
  }
}

const api = readProjectFile("src/lib/subscriptionsApi.ts");
const page = readProjectFile("src/pages/SubscriptionsPage.tsx");
const app = readProjectFile("src/App.tsx");
const packageJson = readProjectFile("package.json");

const browserStorageTerms = ["local" + "Storage", "session" + "Storage"];
const deprecatedTerms = ["interval" + "Months", "/subscriptions" + "/actions"];

assertIncludes(
  "subscriptionsApi.ts",
  api,
  "createApiClient()",
  "uso do cliente API central",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "\"GET\", \"/subscriptions/plans\"",
  "consulta de planos simulados",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "\"GET\", \"/subscriptions/current\"",
  "consulta da subscrição atual",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "\"/subscriptions/current/activate\"",
  "endpoint de ativação simulada",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "\"/subscriptions/current/actions\"",
  "endpoint de ações de ciclo de vida",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "billingCycle",
  "campo canónico do ciclo",
);
assertIncludes(
  "subscriptionsApi.ts",
  api,
  "intervalCount",
  "campo canónico da quantidade de ciclos",
);
assertNotIncludes(
  "subscriptionsApi.ts",
  api,
  "fetch(",
  "chamada HTTP direta fora do cliente central",
);

for (const term of deprecatedTerms) {
  assertNotIncludes("subscriptionsApi.ts", api, term, `termo obsoleto ${term}`);
}

for (const term of browserStorageTerms) {
  assertNotIncludes("subscriptionsApi.ts", api, term, "storage do browser");
  assertNotIncludes("SubscriptionsPage.tsx", page, term, "storage do browser");
}

assertIncludes(
  "SubscriptionsPage.tsx",
  page,
  "loadSubscriptionOverview",
  "carregamento do contrato de subscrições",
);
assertIncludes(
  "SubscriptionsPage.tsx",
  page,
  "runSubscriptionAction",
  "execução de ações simuladas",
);
assertIncludes(
  "SubscriptionsPage.tsx",
  page,
  "Estado da subscrição",
  "estado visível da subscrição",
);
assertIncludes("SubscriptionsPage.tsx", page, "Ativar plano", "ação de ativação");
assertIncludes("SubscriptionsPage.tsx", page, "Renovar", "ação de renovação");
assertIncludes("SubscriptionsPage.tsx", page, "Cancelar", "ação de cancelamento");
assertIncludes("SubscriptionsPage.tsx", page, "Reativar", "ação de reativação");
assertIncludes(
  "SubscriptionsPage.tsx",
  page,
  "Estas ações são simuladas",
  "aviso de ausência de pagamento real",
);

assertIncludes(
  "App.tsx",
  app,
  "SubscriptionsPage",
  "importação ou uso da página de subscrições",
);
assertIncludes("App.tsx", app, "subscriptions", "id de navegação da página");
assertIncludes(
  "package.json",
  packageJson,
  "test:mf8:subscriptions-ui",
  "script de validação MF8",
);

console.log("MF8 subscriptions UI gate passed.");