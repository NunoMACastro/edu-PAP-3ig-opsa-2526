/**
 * @file Gate de modularidade backend para o BK-MF7-08.
 *
 * Este script valida se os dominios principais do OPSA continuam separados por
 * routes, services e montagem controlada no servidor Express.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = fileURLToPath(new URL("..", import.meta.url));
const simulatedMissingFiles = new Set(
    (process.env.OPSA_MF7_SIMULATE_MISSING ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
);

const domainContracts = [
    {
        label: "vendas",
        moduleRoot: "sales",
        pairs: [{ route: "saleDocumentRoutes.js", service: "saleDocumentService.js" }],
        serverBuilders: ["buildSaleDocumentRoutes"],
    },
    {
        label: "compras",
        moduleRoot: "purchases",
        pairs: [{ route: "purchaseDocumentRoutes.js", service: "purchaseDocumentService.js" }],
        serverBuilders: ["buildPurchaseDocumentRoutes"],
    },
    {
        label: "inventario",
        moduleRoot: "inventory",
        pairs: [
            { route: "stockMovementRoutes.js", service: "stockMovementService.js" },
            { route: "fifoCostRoutes.js", service: "fifoCostService.js" },
            { route: "inventoryCountRoutes.js", service: "inventoryCountService.js" },
            { route: "stockAlertRoutes.js", service: "stockAlertService.js" },
        ],
        serverBuilders: [
            "buildStockMovementRoutes",
            "buildFifoCostRoutes",
            "buildInventoryCountRoutes",
            "buildStockAlertRoutes",
        ],
    },
    {
        label: "bancos e tesouraria",
        moduleRoot: "treasury",
        pairs: [
            { route: "bankAccountRoutes.js", service: "bankAccountService.js" },
            { route: "statementRoutes.js", service: "statementImportService.js" },
            { route: "cashflowForecastRoutes.js", service: "cashflowForecastService.js" },
        ],
        serverBuilders: [
            "buildTreasuryAccountRoutes",
            "buildStatementRoutes",
            "buildCashflowForecastRoutes",
        ],
    },
    {
        label: "contabilidade",
        moduleRoot: "accounting",
        pairs: [
            { route: "salePostingRoutes.js", service: "salePostingService.js" },
            { route: "purchasePostingRoutes.js", service: "purchasePostingService.js" },
            { route: "manualJournalRoutes.js", service: "manualJournalService.js" },
        ],
        serverBuilders: [
            "buildSalePostingRoutes",
            "buildPurchasePostingRoutes",
            "buildManualJournalRoutes",
        ],
    },
    {
        label: "reporting contabilistico",
        moduleRoot: "accounting-reports",
        pairs: [{ route: "accountingReportRoutes.js", service: "accountingReportService.js" }],
        serverBuilders: ["buildAccountingReportRoutes"],
    },
    {
        label: "mapas fiscais",
        moduleRoot: "tax",
        pairs: [{ route: "vatMapRoutes.js", service: "vatMapService.js" }],
        serverBuilders: ["buildVatMapRoutes"],
    },
    {
        label: "demonstracoes financeiras",
        moduleRoot: "financial-statements",
        pairs: [{ route: "financialStatementRoutes.js", service: "financialStatementService.js" }],
        serverBuilders: ["buildFinancialStatementRoutes"],
    },
    {
        label: "compliance fiscal",
        moduleRoot: "compliance",
        pairs: [{ route: "saftRoutes.js", service: "saftService.js" }],
        serverBuilders: ["buildSaftRoutes"],
    },
    {
        label: "IA",
        moduleRoot: "ai",
        pairs: [{ route: "aiRoutes.js", service: "aiAnalysisService.js" }],
        serverBuilders: ["buildAiRoutes"],
    },
];

/**
 * Constroi um caminho relativo ao projeto API.
 *
 * @param {string} relativePath - Caminho dentro de `real_dev/api`.
 * @returns {string} Caminho absoluto.
 */
function projectPath(relativePath) {
    return join(apiRoot, relativePath);
}

/**
 * Confirma se um ficheiro existe, respeitando simulacoes de erro usadas nos negativos.
 *
 * @param {string} relativePath - Caminho dentro de `real_dev/api`.
 * @returns {boolean} Verdadeiro quando o ficheiro existe para esta validacao.
 */
function existsInProject(relativePath) {
    return !simulatedMissingFiles.has(relativePath) && existsSync(projectPath(relativePath));
}

/**
 * Le um ficheiro validado pelo gate.
 *
 * @param {string} relativePath - Caminho dentro de `real_dev/api`.
 * @returns {string} Conteudo do ficheiro.
 */
function readProjectFile(relativePath) {
    if (!existsInProject(relativePath)) {
        throw new Error(`Ficheiro obrigatorio em falta: ${relativePath}`);
    }

    return readFileSync(projectPath(relativePath), "utf8");
}

/**
 * Conta quantas vezes um texto aparece numa origem.
 *
 * @param {string} source - Texto onde procurar.
 * @param {string} value - Texto a contar.
 * @returns {number} Numero de ocorrencias.
 */
function countOccurrences(source, value) {
    return source.split(value).length - 1;
}

/**
 * Valida se uma route importa o service do mesmo dominio.
 *
 * @param {{ label: string, moduleRoot: string }} contract - Contrato do dominio.
 * @param {{ route: string, service: string }} pair - Par route-service esperado.
 * @returns {void}
 */
function assertRouteUsesService(contract, pair) {
    const routePath = `src/modules/${contract.moduleRoot}/${pair.route}`;
    const servicePath = `src/modules/${contract.moduleRoot}/${pair.service}`;
    const routeSource = readProjectFile(routePath);
    const serviceSource = readProjectFile(servicePath);

    // A route coordena HTTP; a regra de negocio deve ficar no service do mesmo dominio.
    if (!routeSource.includes(`./${pair.service}`)) {
        throw new Error(`${contract.label}: ${pair.route} deve importar ./${pair.service}`);
    }

    if (!/export\s+(async\s+)?function\s+/.test(serviceSource)) {
        throw new Error(`${contract.label}: ${pair.service} deve exportar funcoes de service`);
    }
}

/**
 * Valida se o servidor importa e monta apenas route builders.
 *
 * @param {string} serverSource - Conteudo de `src/server.js`.
 * @returns {void}
 */
function assertServerBoundaries(serverSource) {
    const simulatedForbiddenImport = process.env.OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT;
    const source =
        simulatedForbiddenImport === undefined
            ? serverSource
            : `${serverSource}\nimport { simulated } from "./modules/${simulatedForbiddenImport}";\n`;
    const forbiddenImports = [
        ...source.matchAll(
            /from\s+"\.\/modules\/[^"]*(Service|Controller|Validators?|Middleware|Context)\.js"/g,
        ),
    ].map((match) => match[0]);

    // `server.js` pode montar routers, mas nao deve conhecer services nem validacoes internas.
    if (forbiddenImports.length > 0) {
        throw new Error(
            `server.js importa ficheiros internos de dominio: ${forbiddenImports.join(", ")}`,
        );
    }

    for (const contract of domainContracts) {
        for (const builder of contract.serverBuilders) {
            if (countOccurrences(source, builder) < 2) {
                throw new Error(`${contract.label}: ${builder} deve ser importado e usado em app.use`);
            }
        }
    }
}

/**
 * Executa o gate completo de modularidade backend.
 *
 * @returns {void}
 */
export function checkBackendModules() {
    for (const contract of domainContracts) {
        for (const pair of contract.pairs) {
            assertRouteUsesService(contract, pair);
        }
    }

    assertServerBoundaries(readProjectFile("src/server.js"));
}

try {
    checkBackendModules();
    console.log("MF7 backend modular: OK");
} catch (error) {
    console.error(error?.message ?? String(error));
    process.exitCode = 1;
}
