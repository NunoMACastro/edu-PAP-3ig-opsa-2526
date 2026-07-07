/**
 * @file Inventario executavel dos testes e gates criticos da MF8.
 *
 * O BK-MF8-16 transforma a revisao de testes num gate objetivo: os fluxos
 * criticos de MF0 a MF8 ficam mapeados para camadas minimas de prova, e a
 * execucao falha quando falta uma camada ou um script acumulado.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const CRITICAL_FLOWS = [
    {
        id: "MF0-identidade-sessao-roles-multiempresa",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract"],
        keywords: ["mf0", "auth", "session", "role", "membership"],
        description: "Identidade, sessao, papeis e isolamento por empresa ativa.",
    },
    {
        id: "MF1-vendas-compras-iva-recebimentos-pagamentos",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract", "api-integration"],
        keywords: ["mf1", "sale", "purchase", "vat", "payment", "receipt"],
        description: "Documentos de venda, compra, IVA, recebimentos e pagamentos.",
    },
    {
        id: "MF2-inventario-fifo-contabilidade-reporting",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract", "api-integration"],
        keywords: ["mf2", "inventory", "stock", "fifo", "ledger", "report"],
        description: "Inventario, FIFO, movimentos contabilisticos e reporting.",
    },
    {
        id: "MF3-bancos-reconciliacao-exportacao-relatorios",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract", "api-integration"],
        keywords: ["mf3", "bank", "reconciliation", "saft", "cashflow", "report"],
        description: "Bancos, reconciliacao, exportacao prevista e relatorios.",
    },
    {
        id: "MF4-ia-explicavel-auditoria",
        priority: "P1",
        requiredLayers: ["api-unit", "api-contract"],
        keywords: ["mf4", "ai", "insight", "source", "audit"],
        description: "IA explicavel, recomendacoes com fonte e auditoria.",
    },
    {
        id: "MF5-interface-formularios-acessibilidade-desempenho",
        priority: "P1",
        requiredLayers: ["web-script", "web-typecheck"],
        keywords: ["mf5", "form", "accessibility", "responsive", "performance", "feedback"],
        description: "Interface, formularios, acessibilidade, mensagens e desempenho.",
    },
    {
        id: "MF6-seguranca-performance-hardening",
        priority: "P0",
        requiredLayers: ["api-contract", "api-script"],
        keywords: ["mf6", "security", "hardening", "https", "bcrypt", "cookie", "audit"],
        description: "Seguranca, performance, sessao, hardening e auditoria.",
    },
    {
        id: "MF7-compatibilidade-exportacoes-importacoes-modularidade",
        priority: "P1",
        requiredLayers: ["api-contract", "api-script", "web-script"],
        keywords: ["mf7", "export", "import", "compatibility", "module", "retention"],
        description: "Compatibilidade, exportacoes, importacoes, retencao e modularidade.",
    },
    {
        id: "MF8-subscricoes-localizacao-fecho",
        priority: "P1",
        requiredLayers: ["api-contract", "api-script", "web-script", "web-typecheck", "web-build"],
        keywords: ["mf8", "subscription", "locale", "format", "billing", "inventory"],
        description: "Subscricoes simuladas, localizacao PT-PT e preparacao do fecho.",
    },
];

export const REQUIRED_API_SCRIPTS = [
    "syntax:check",
    "test:unit",
    "test:contracts",
    "test:integration",
    "test:mf6",
    "test:mf7",
    "test:mf8:subscriptions",
    "test:mf8:ai-explainability",
    "test:mf8:ai-governance",
    "test:mf8:technical-docs",
    "test:mf8:inventory",
    "test:mf8:inventory-contracts",
    "test:mf8",
    "test:final:prepare",
];

export const REQUIRED_WEB_SCRIPTS = [
    "typecheck",
    "build",
    "test:mf1",
    "test:mf2",
    "test:mf3",
    "test:mf5:feedback",
    "test:mf5:responsive",
    "test:mf5:a11y",
    "test:mf5:forms",
    "test:mf5:errors",
    "test:mf5:performance",
    "test:mf7",
    "test:mf8:subscriptions-ui",
    "test:mf8:ui-alignment",
    "test:mf8:formatters",
    "test:mf8",
    "test:final:prepare",
];

const API_FILE_FOLDERS = ["tests/unit", "tests/contracts", "tests/integration", "scripts"];
const WEB_FILE_FOLDERS = ["scripts"];

/**
 * Normaliza texto para comparacoes por nome de ficheiro ou script.
 *
 * @param {unknown} value - Valor original.
 * @returns {string} Texto minusculo e sem acentos.
 */
export function normalizeText(value) {
    return String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

/**
 * Lê recursivamente ficheiros de varias pastas relativas.
 *
 * @param {string} rootDir - Diretoria base da area de implementacao.
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

        /**
         * Visita recursivamente uma pasta de testes ou scripts e recolhe ficheiros encontrados.
         * A função mantém o caminho absoluto fora do resultado para a matriz usar caminhos relativos.
         *
         * @param {string} currentDir - Diretoria atual da travessia recursiva.
         * @returns {void}
         */
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

        // A recursao evita que uma suite organizada por subpastas fique invisivel.
        visit(absoluteFolder);
    }

    return collected.sort();
}

/**
 * Lê scripts de um package.json sem assumir que todos os packages existem.
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
 * Classifica um ficheiro numa camada minima de prova.
 *
 * @param {string} source - Caminho relativo do ficheiro.
 * @param {"api" | "web"} area - Area tecnica do ficheiro.
 * @returns {string} Camada de prova usada pela matriz.
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
 * Cria o inventario bruto de ficheiros e scripts API/web.
 *
 * @param {object} options - Opcoes de leitura.
 * @param {string} [options.apiRoot=process.cwd()] - Raiz real de API.
 * @param {string} [options.webRoot=../web] - Raiz real de web.
 * @returns {object} Inventario bruto.
 */
export function buildInventory(options = {}) {
    const apiRoot = options.apiRoot ? resolve(options.apiRoot) : process.cwd();
    const webRoot = options.webRoot ? resolve(options.webRoot) : resolve(apiRoot, "../web");

    const apiFiles = collectFiles(apiRoot, API_FILE_FOLDERS).map((source) => ({
        source,
        layer: classifyFile(source, "api"),
        searchable: normalizeText(source),
    }));

    const webFiles = collectFiles(webRoot, WEB_FILE_FOLDERS).map((source) => ({
        source,
        layer: classifyFile(source, "web"),
        searchable: normalizeText(source),
    }));

    return {
        apiRoot,
        webRoot,
        apiFiles,
        webFiles,
        apiScripts: readPackageScripts(join(apiRoot, "package.json")),
        webScripts: readPackageScripts(join(webRoot, "package.json")),
    };
}

/**
 * Confirma se uma camada minima tem evidencia associada a um fluxo.
 *
 * @param {object} inventory - Inventario criado por buildInventory.
 * @param {object} flow - Fluxo critico da matriz.
 * @param {string} layer - Camada exigida.
 * @returns {boolean} Verdadeiro quando existe prova minima.
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

    // Exigimos camada e palavra-chave do fluxo para evitar falsos positivos por contagem cega.
    return files.some((file) => {
        return file.layer === layer && normalizedKeywords.some((keyword) => file.searchable.includes(keyword));
    });
}

/**
 * Avalia a matriz minima de cobertura e os scripts acumulados.
 *
 * @param {object} inventory - Inventario criado por buildInventory.
 * @returns {object} Resultado com linhas da matriz, lacunas e scripts em falta.
 */
export function evaluateInventory(inventory) {
    const rows = CRITICAL_FLOWS.map((flow) => {
        const layerResults = flow.requiredLayers.map((layer) => ({
            layer,
            ok: hasLayerEvidence(inventory, flow, layer),
        }));

        return {
            ...flow,
            layerResults,
            ok: layerResults.every((result) => result.ok),
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
                reason: "LACUNA: falta prova minima para este fluxo e camada.",
            }));
    });

    return {
        rows,
        missingApiScripts,
        missingWebScripts,
        gaps,
        ok: gaps.length === 0 && missingApiScripts.length === 0 && missingWebScripts.length === 0,
    };
}

/**
 * Formata o resultado do inventario em Markdown copiavel para evidence/relatorio.
 *
 * @param {object} inventory - Inventario criado por buildInventory.
 * @param {object} result - Resultado criado por evaluateInventory.
 * @returns {string} Relatorio Markdown.
 */
export function formatMarkdownReport(inventory, result) {
    const lines = [
        "# Inventario de testes MF8",
        "",
        "## Matriz minima de testes por prioridade",
        "",
        "| Fluxo | Prioridade | Camadas exigidas | Estado |",
        "| --- | --- | --- | --- |",
    ];

    for (const row of result.rows) {
        const layers = row.layerResults.map((layer) => {
            return `${layer.layer}: ${layer.ok ? "OK" : "LACUNA"}`;
        });
        lines.push(`| ${row.id} | ${row.priority} | ${layers.join("<br>")} | ${row.ok ? "OK" : "LACUNA"} |`);
    }

    lines.push(
        "",
        "## Evidencia de testes por camada",
        "",
        `- API unitaria: ${inventory.apiFiles.filter((file) => file.layer === "api-unit").length}`,
        `- API contratos: ${inventory.apiFiles.filter((file) => file.layer === "api-contract").length}`,
        `- API integracao: ${inventory.apiFiles.filter((file) => file.layer === "api-integration").length}`,
        `- API scripts: ${inventory.apiFiles.filter((file) => file.layer === "api-script").length}`,
        `- Frontend scripts: ${inventory.webFiles.length}`,
        "",
        "## Scripts obrigatorios",
        "",
        `- API em falta: ${result.missingApiScripts.length > 0 ? result.missingApiScripts.join(", ") : "nenhum"}`,
        `- Web em falta: ${result.missingWebScripts.length > 0 ? result.missingWebScripts.join(", ") : "nenhum"}`,
        "",
        "## Lacunas",
        "",
    );

    if (result.gaps.length === 0) {
        lines.push("- Nenhuma lacuna critica encontrada.");
    } else {
        for (const gap of result.gaps) {
            lines.push(`- ${gap.priority} | ${gap.flowId} | ${gap.layer} | ${gap.reason}`);
        }
    }

    lines.push("", `Resultado final: ${result.ok ? "OK" : "LACUNA"}`);
    return `${lines.join("\n")}\n`;
}

/**
 * Executa o inventario em modo CLI.
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
