/**
 * @file Orchestrates the MF8 final validation for BK-MF8-17.
 *
 * This script implements the RNF38 execution contract: it verifies the
 * BK-MF8-16 input evidence, runs the final API, web and planning gates, and
 * writes a Markdown evidence file with commands, outputs, exit codes and the
 * final decision for BK-MF8-18.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const apiRoot = process.cwd();
const repoRoot = resolve(apiRoot, "../..");
const appRoot = resolve(apiRoot, "..");
const webRoot = resolve(appRoot, "web");
const evidencePath = resolve(repoRoot, "docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md");
const testInventoryEvidencePath = resolve(repoRoot, "docs/evidence/MF8/TESTES-EM-FALTA.md");

const requiredPreconditions = [
    {
        label: "Evidence de testes em falta criada no BK-MF8-16",
        path: testInventoryEvidencePath,
        expected: "O ficheiro existe antes da execucao final."
    }
];

const finalCommands = [
    {
        area: "API",
        command: "npm",
        args: ["run", "test:final:prepare"],
        cwd: apiRoot,
        expected: "syntax, unitarios, contratos, integracao, MF6, MF7 e MF8 sem falhas."
    },
    {
        area: "WEB",
        command: "npm",
        args: ["run", "test:final:prepare"],
        cwd: webRoot,
        expected: "gates frontend, typecheck e build sem falhas."
    },
    {
        area: "PLANIFICACAO",
        command: "bash",
        args: ["scripts/validate-planificacao.sh"],
        cwd: repoRoot,
        expected: "overall_pass=true no relatorio JSON do validador."
    }
];

/**
 * Formats a command specification into the exact command shown in evidence.
 *
 * @param {{ command: string, args: string[] }} commandSpec - Command to format.
 * @returns {string} Human-readable command.
 */
function formatCommand(commandSpec) {
    return [commandSpec.command, ...commandSpec.args].join(" ");
}

/**
 * Reads a short preview of the BK-MF8-16 evidence used as input.
 *
 * @param {string} filePath - Absolute path to the evidence file.
 * @returns {string} Preview text or a missing-file notice.
 */
function readPreview(filePath) {
    if (!existsSync(filePath)) {
        return "Ficheiro ausente.";
    }

    return readFileSync(filePath, "utf8")
        .split("\n")
        .slice(0, 12)
        .join("\n")
        .trim();
}

/**
 * Checks all mandatory inputs before running the expensive final battery.
 *
 * @returns {{ ok: boolean, checks: Array<{ label: string, path: string, expected: string, observed: string, decision: string }> }} Preconditions result.
 */
function validatePreconditions() {
    const checks = requiredPreconditions.map((item) => {
        const exists = existsSync(item.path);

        return {
            label: item.label,
            path: item.path,
            expected: item.expected,
            observed: exists ? "Encontrado." : "Ausente.",
            decision: exists ? "OK" : "BLOQUEANTE"
        };
    });

    return {
        ok: checks.every((check) => check.decision === "OK"),
        checks
    };
}

/**
 * Runs one final validation command and preserves stdout/stderr for evidence.
 *
 * @param {{ area: string, command: string, args: string[], cwd: string, expected: string }} commandSpec - Final command.
 * @returns {{ area: string, command: string, cwd: string, expected: string, status: number, stdout: string, stderr: string, decision: string }} Observed result.
 */
function runFinalCommand(commandSpec) {
    const result = spawnSync(commandSpec.command, commandSpec.args, {
        cwd: commandSpec.cwd,
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 20
    });

    const status = typeof result.status === "number" ? result.status : 1;

    return {
        area: commandSpec.area,
        command: formatCommand(commandSpec),
        cwd: commandSpec.cwd,
        expected: commandSpec.expected,
        status,
        stdout: result.stdout?.trim() ?? "",
        stderr: result.stderr?.trim() || result.error?.message || "",
        decision: status === 0 ? "OK" : "BLOQUEANTE"
    };
}

/**
 * Keeps long command output readable inside Markdown tables and code blocks.
 *
 * @param {string} value - Raw command output.
 * @returns {string} Compact Markdown-safe output.
 */
function compactCell(value) {
    const clean = value.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");

    return clean.length > 1800 ? `${clean.slice(0, 1800)}...` : clean;
}

/**
 * Builds the Markdown evidence for the MF8 final validation.
 *
 * @param {object} report - Observed report data.
 * @param {string} report.generatedAt - ISO timestamp.
 * @param {{ ok: boolean, checks: Array<object> }} report.preconditions - Preconditions result.
 * @param {Array<object>} report.results - Executed command results.
 * @returns {string} Complete Markdown evidence.
 */
function buildEvidenceMarkdown({ generatedAt, preconditions, results }) {
    const finalDecision = preconditions.ok && results.every((result) => result.decision === "OK")
        ? "PODE_AVANCAR_PARA_BK-MF8-18"
        : "BLOQUEADO_ATE_CORRECAO";

    const lines = [
        "# Execução final de testes MF8",
        "",
        "## Identificação",
        "",
        "- BK: BK-MF8-17",
        "- Requisito: RNF38",
        "- Data/hora: " + generatedAt,
        "- Evidence de entrada: `docs/evidence/MF8/TESTES-EM-FALTA.md`",
        "- Decisão final: `" + finalDecision + "`",
        "",
        "## Precondições",
        "",
        "| Verificação | Resultado esperado | Resultado observado | Decisão |",
        "| --- | --- | --- | --- |"
    ];

    for (const check of preconditions.checks) {
        lines.push(`| ${check.label} | ${check.expected} | ${check.observed} | ${check.decision} |`);
    }

    lines.push(
        "",
        "## Resumo da evidence do BK-MF8-16",
        "",
        "```md",
        readPreview(testInventoryEvidencePath),
        "```",
        "",
        "## Comandos executados",
        "",
        "| Área | Diretório | Comando | Resultado esperado | Exit code | Decisão |",
        "| --- | --- | --- | --- | ---: | --- |"
    );

    for (const result of results) {
        lines.push(
            `| ${result.area} | \`${result.cwd}\` | \`${result.command}\` | ${result.expected} | ${result.status} | ${result.decision} |`
        );
    }

    lines.push("", "## Output observado");

    for (const result of results) {
        lines.push(
            "",
            "### " + result.area + " - " + result.command,
            "",
            "- Diretório: `" + result.cwd + "`",
            "- Exit code: `" + result.status + "`",
            "- Decisão: `" + result.decision + "`",
            "",
            "#### stdout",
            "",
            "```text",
            compactCell(result.stdout || "Sem stdout."),
            "```",
            "",
            "#### stderr",
            "",
            "```text",
            compactCell(result.stderr || "Sem stderr."),
            "```"
        );
    }

    lines.push(
        "",
        "## Cenários negativos",
        "",
        "| Cenário | Resultado esperado | Decisão |",
        "| --- | --- | --- |",
        "| `TESTES-EM-FALTA.md` ausente | Script termina antes da bateria final com decisão `BLOQUEANTE`. | Coberto por precondição. |",
        "| `test:final:prepare` falha na API ou na web | Evidence regista exit code diferente de zero e decisão `BLOQUEANTE`. | Coberto por execução real. |",
        "",
        "## Handoff para BK-MF8-18",
        "",
        "- Se a decisão final for `PODE_AVANCAR_PARA_BK-MF8-18`, o próximo BK só precisa verificar se não há falhas residuais.",
        "- Se a decisão final for `BLOQUEADO_ATE_CORRECAO`, o próximo BK deve começar pelo primeiro comando com decisão `BLOQUEANTE`.",
        "- Nunca apagar outputs antigos sem guardar a nova execução.",
        "",
        "## Decisão",
        "",
        "Decisão final: `" + finalDecision + "`",
        ""
    );

    return lines.join("\n");
}

/**
 * Runs the MF8 final validation and writes the evidence file.
 *
 * @returns {{ ok: boolean, evidencePath: string }} Final execution result.
 */
function runFinalValidation() {
    const generatedAt = new Date().toISOString();
    const preconditions = validatePreconditions();
    const results = preconditions.ok ? finalCommands.map(runFinalCommand) : [];
    const markdown = buildEvidenceMarkdown({ generatedAt, preconditions, results });

    mkdirSync(dirname(evidencePath), { recursive: true });
    writeFileSync(evidencePath, markdown, "utf8");

    return {
        ok: preconditions.ok && results.every((result) => result.decision === "OK"),
        evidencePath
    };
}

const execution = runFinalValidation();

if (!execution.ok) {
    console.error(`Execução final bloqueada. Consulta ${execution.evidencePath}.`);
    process.exitCode = 1;
} else {
    console.log(`Execução final concluída. Evidence: ${execution.evidencePath}`);
}
