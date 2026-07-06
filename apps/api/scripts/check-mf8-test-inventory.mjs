// apps/api/scripts/check-mf8-test-inventory.mjs
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const CRITICAL_FLOWS = [
    {
        id: "MF0-identidade-sessao-roles-multiempresa",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract"],
        keywords: ["mf0", "auth", "session", "role", "membership"],
        description: "Identidade, sessão, papéis e isolamento por empresa ativa."
    },
    {
        id: "MF1-vendas-compras-iva-tesouraria",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract", "api-integration"],
        keywords: ["mf1", "sale", "purchase", "vat", "payment", "receipt"],
        description: "Documentos de venda, compra, IVA, recebimentos e pagamentos."
    },
    {
        id: "MF2-inventario-fifo-contabilidade-reporting",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract", "api-integration"],
        keywords: ["mf2", "inventory", "stock", "fifo", "ledger", "report"],
        description: "Inventário, FIFO, movimentos contabilísticos e reporting."
    },
    {
        id: "MF3-bancos-reconciliacao-exportacao-relatorios",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract", "api-integration"],
        keywords: ["mf3", "bank", "reconciliation", "saft", "cashflow", "report"],
        description: "Bancos, reconciliação, exportação prevista e relatórios."
    },
    {
        id: "MF4-ia-explicavel-auditoria",
        priority: "P1",
        requiredLayers: ["api-unit", "api-contract"],
        keywords: ["mf4", "ai", "insight", "source", "audit"],
        description: "IA explicável, recomendações com fonte e auditoria."
    },
    {
        id: "MF5-interface-formularios-acessibilidade-desempenho",
        priority: "P1",
        requiredLayers: ["web-script", "web-typecheck"],
        keywords: ["mf5", "form", "accessibility", "responsive", "performance", "feedback"],
        description: "Interface, formulários, acessibilidade, mensagens e desempenho."
    },
    {
        id: "MF6-seguranca-performance-hardening",
        priority: "P0",
        requiredLayers: ["api-contract", "api-script"],
        keywords: ["mf6", "security", "hardening", "https", "bcrypt", "cookie", "audit"],
        description: "Segurança, performance, sessão, hardening e auditoria."
    },
    {
        id: "MF7-compatibilidade-exportacoes-importacoes-modularidade",
        priority: "P1",
        requiredLayers: ["api-contract", "api-script", "web-script"],
        keywords: ["mf7", "export", "import", "compatibility", "module", "retention"],
        description: "Compatibilidade, exportações, importações, retenção e modularidade."
    },
    {
        id: "MF8-subscricoes-localizacao-fecho",
        priority: "P1",
        requiredLayers: ["api-contract", "api-script", "web-script", "web-typecheck", "web-build"],
        keywords: ["mf8", "subscription", "locale", "format", "billing", "inventory"],
        description: "Subscrições simuladas, localização PT-PT e preparação do fecho."
    }
];

export const REQUIRED_API_SCRIPTS = [
    "syntax:check",
    "test:unit",
    "test:contracts",
    "test:integration",
    "test:mf6",
    "test:mf7",
    "test:mf8"
];

export const REQUIRED_WEB_SCRIPTS = [
    "typecheck",
    "build",
    "test:mf1",
    "test:mf2",
    "test:mf3",
    "test:mf5:forms",
    "test:mf5:errors",
    "test:mf5:performance",
    "test:mf7",
    "test:mf8"
];

const FILE_FOLDERS = ["tests/unit", "tests/contracts", "tests/integration", "scripts"];
const WEB_FILE_FOLDERS = ["scripts"];

/**
 * Normaliza texto para comparação simples em nomes de ficheiros e scripts.
 *
 * @param {string} value - Texto original.
 * @returns {string} Texto em minúsculas e sem acentos.
 */
export function normalizeText(value) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

/**
 * Lê ficheiros de forma recursiva a partir de várias pastas.
 *
 * @param {string} rootDir - Diretório base.
 * @param {string[]} folders - Pastas relativas a visitar.
 * @returns {string[]} Caminhos relativos encontrados.
 */
export function collectFiles(rootDir, folders) {
    const collected = [];

    for (const folder of folders) {
        const absoluteFolder = join(rootDir, folder);
        if (!existsSync(absoluteFolder)) {
            continue;
        }

        const visit = (currentDir) => {
            for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
                const absoluteEntry = join(currentDir, entry.name);
                if (entry.isDirectory()) {
                    visit(absoluteEntry);
                    continue;
                }

                if (entry.isFile()) {
                    collected.push(relative(rootDir, absoluteEntry));
                }
            }
        };

        // A leitura recursiva evita que uma suite organizada por subpastas fique invisível.
        visit(absoluteFolder);
    }

    return collected.sort();
}

/**
 * Lê scripts de um package.json.
 *
 * @param {string} packagePath - Caminho absoluto para package.json.
 * @returns {Record<string, string>} Scripts declarados.
 */
export function readPackageScripts(packagePath) {
    if (!existsSync(packagePath)) {
        return {};
    }

    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    return packageJson.scripts ?? {};
}

/**
 * Classifica um ficheiro numa camada de prova.
 *
 * @param {string} source - Caminho relativo do ficheiro.
 * @param {"api" | "web"} area - Área de origem.
 * @returns {string} Camada de prova.
 */
export function classifyFile(source, area) {
    if (area === "web") {
        return "web-script";
    }

    if (source.startsWith("tests/unit/")) {
        return "api-unit";
    }

    if (source.startsWith("tests/contracts/")) {
        return "api-contract";
    }

    if (source.startsWith("tests/integration/")) {
        return "api-integration";
    }

    if (source.startsWith("scripts/")) {
        return "api-script";
    }

    return "unknown";
}

/**
 * Cria o inventário de ficheiros e scripts disponíveis.
 *
 * @param {object} options - Opções de leitura.
 * @param {string} [options.apiRoot=process.cwd()] - Raiz de apps/api.
 * @param {string} [options.webRoot=../web] - Raiz de apps/web.
 * @returns {object} Inventário bruto para avaliação.
 */
export function buildInventory(options = {}) {
    const apiRoot = options.apiRoot ? resolve(options.apiRoot) : process.cwd();
    const webRoot = options.webRoot ? resolve(options.webRoot) : resolve(apiRoot, "../web");

    const apiFiles = collectFiles(apiRoot, FILE_FOLDERS).map((source) => ({
        source,
        layer: classifyFile(source, "api"),
        searchable: normalizeText(source)
    }));

    const webFiles = collectFiles(webRoot, WEB_FILE_FOLDERS).map((source) => ({
        source,
        layer: classifyFile(source, "web"),
        searchable: normalizeText(source)
    }));

    const apiScripts = readPackageScripts(join(apiRoot, "package.json"));
    const webScripts = readPackageScripts(join(webRoot, "package.json"));

    return {
        apiRoot,
        webRoot,
        apiFiles,
        webFiles,
        apiScripts,
        webScripts
    };
}

/**
 * Verifica se uma camada tem prova para um fluxo crítico.
 *
 * @param {object} inventory - Inventário criado por buildInventory.
 * @param {object} flow - Fluxo crítico.
 * @param {string} layer - Camada exigida.
 * @returns {boolean} Verdadeiro quando existe prova para a camada.
 */
export function hasLayerEvidence(inventory, flow, layer) {
    if (layer === "web-typecheck") {
        return Object.hasOwn(inventory.webScripts, "typecheck");
    }

    if (layer === "web-build") {
        return Object.hasOwn(inventory.webScripts, "build");
    }

    const files = layer === "web-script" ? inventory.webFiles : inventory.apiFiles;
    const normalizedKeywords = flow.keywords.map(normalizeText);

    // A prova exige uma palavra do fluxo e a camada certa; contar ficheiros sem ligação ao fluxo seria frágil.
    return files.some((file) => {
        return file.layer === layer && normalizedKeywords.some((keyword) => file.searchable.includes(keyword));
    });
}

/**
 * Avalia o inventário contra a matriz mínima do BK.
 *
 * @param {object} inventory - Inventário criado por buildInventory.
 * @returns {object} Resultado com linhas da matriz, lacunas e scripts em falta.
 */
export function evaluateInventory(inventory) {
    const rows = CRITICAL_FLOWS.map((flow) => {
        const layerResults = flow.requiredLayers.map((layer) => ({
            layer,
            ok: hasLayerEvidence(inventory, flow, layer)
        }));

        return {
            ...flow,
            layerResults,
            ok: layerResults.every((result) => result.ok)
        };
    });

    const missingApiScripts = REQUIRED_API_SCRIPTS.filter((scriptName) => {
        return !Object.hasOwn(inventory.apiScripts, scriptName);
    });

    const missingWebScripts = REQUIRED_WEB_SCRIPTS.filter((scriptName) => {
        return !Object.hasOwn(inventory.webScripts, scriptName);
    });

    const gaps = rows.flatMap((row) => {
        return row.layerResults
            .filter((result) => !result.ok)
            .map((result) => ({
                flowId: row.id,
                priority: row.priority,
                layer: result.layer,
                reason: "LACUNA: falta prova mínima para este fluxo e camada."
            }));
    });

    return {
        rows,
        missingApiScripts,
        missingWebScripts,
        gaps,
        ok: gaps.length === 0 && missingApiScripts.length === 0 && missingWebScripts.length === 0
    };
}

/**
 * Formata o inventário como relatório Markdown para evidence.
 *
 * @param {object} inventory - Inventário criado por buildInventory.
 * @param {object} result - Resultado criado por evaluateInventory.
 * @returns {string} Relatório Markdown.
 */
export function formatMarkdownReport(inventory, result) {
    const lines = [
        "# Inventário de testes MF8",
        "",
        "## Matriz mínima de testes por prioridade",
        "",
        "| Fluxo | Prioridade | Camadas exigidas | Estado |",
        "| --- | --- | --- | --- |"
    ];

    for (const row of result.rows) {
        const layers = row.layerResults.map((layer) => {
            return `${layer.layer}: ${layer.ok ? "OK" : "LACUNA"}`;
        });
        lines.push(`| ${row.id} | ${row.priority} | ${layers.join("<br>")} | ${row.ok ? "OK" : "LACUNA"} |`);
    }

    lines.push(
        "",
        "## Evidência de testes por camada",
        "",
        `- API unitária: ${inventory.apiFiles.filter((file) => file.layer === "api-unit").length}`,
        `- API contratos: ${inventory.apiFiles.filter((file) => file.layer === "api-contract").length}`,
        `- API integração: ${inventory.apiFiles.filter((file) => file.layer === "api-integration").length}`,
        `- API scripts: ${inventory.apiFiles.filter((file) => file.layer === "api-script").length}`,
        `- Frontend scripts: ${inventory.webFiles.length}`,
        "",
        "## Scripts obrigatórios",
        "",
        `- API em falta: ${result.missingApiScripts.length > 0 ? result.missingApiScripts.join(", ") : "nenhum"}`,
        `- Web em falta: ${result.missingWebScripts.length > 0 ? result.missingWebScripts.join(", ") : "nenhum"}`,
        "",
        "## Lacunas",
        ""
    );

    if (result.gaps.length === 0) {
        lines.push("- Nenhuma lacuna crítica encontrada.");
    } else {
        for (const gap of result.gaps) {
            lines.push(`- ${gap.priority} | ${gap.flowId} | ${gap.layer} | ${gap.reason}`);
        }
    }

    lines.push("", `Resultado final: ${result.ok ? "OK" : "LACUNA"}`);
    return `${lines.join("\n")}\n`;
}

/**
 * Executa o inventário no terminal.
 *
 * @returns {void}
 */
export function runCli() {
    const inventory = buildInventory();
    const result = evaluateInventory(inventory);
    const report = formatMarkdownReport(inventory, result);

    console.log(report);

    if (!result.ok) {
        process.exitCode = 1;
    }
}

const executedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === executedPath) {
    runCli();
}