/**
 * @file Orquestrador da execução final de testes da MF8.
 *
 * Este script cumpre o contrato do BK-MF8-17: executar a bateria final
 * preparada no BK-MF8-16, guardar evidence Markdown e bloquear a entrega
 * quando existir falha em API, web ou planificação.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const apiRoot = process.cwd();
const repoRoot = resolve(apiRoot, "../..");
const webRoot = resolve(repoRoot, "apps/web");
const evidencePath = resolve(repoRoot, "docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md");
const testInventoryEvidencePath = resolve(repoRoot, "docs/evidence/MF8/TESTES-EM-FALTA.md");

const requiredPreconditions = [
    {
        label: "Evidence de testes em falta criada no BK-MF8-16",
        path: testInventoryEvidencePath,
        expected: "O ficheiro existe antes da execução final."
    }
];

const finalCommands = [
    {
        area: "API",
        command: "npm",
        args: ["run", "test:final:prepare"],
        cwd: apiRoot,
        expected: "syntax, unitários, contratos, integração, MF6, MF7 e MF8 sem falhas."
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
        expected: "overall_pass=true no relatório JSON do validador."
    }
];

/**
 * Converte comando e argumentos numa string legível para evidence.
 *
 * @param {{ command: string, args: string[] }} commandSpec - Comando a formatar.
 * @returns {string} Comando completo para mostrar no relatório.
 */
function formatCommand(commandSpec) {
    return [commandSpec.command, ...commandSpec.args].join(" ");
}

/**
 * Lê uma amostra curta do ficheiro de entrada para facilitar a auditoria.
 *
 * @param {string} filePath - Caminho absoluto do ficheiro a ler.
 * @returns {string} Primeiras linhas relevantes do ficheiro, ou aviso de ausência.
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
 * Valida se os ficheiros obrigatórios existem antes de iniciar a bateria final.
 *
 * @returns {{ ok: boolean, checks: Array<{ label: string, path: string, expected: string, observed: string, decision: string }> }} Resultado das precondições.
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
 * Executa um comando da bateria final e preserva stdout/stderr para evidence.
 *
 * @param {{ area: string, command: string, args: string[], cwd: string, expected: string }} commandSpec - Comando a executar.
 * @returns {{ area: string, command: string, cwd: string, expected: string, status: number, stdout: string, stderr: string, decision: string }} Resultado observado.
 */
function runFinalCommand(commandSpec) {
    // Cada comando corre no seu diretório para respeitar dependências e scripts próprios de API/web.
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
 * Escapa quebras de linha para manter a tabela Markdown legível.
 *
 * @param {string} value - Texto original.
 * @returns {string} Texto compacto para tabela.
 */
function compactCell(value) {
    const clean = value.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
    return clean.length > 1800 ? `${clean.slice(0, 1800)}...` : clean;
}

/**
 * Gera a evidence Markdown da execução final.
 *
 * @param {object} report - Dados observados.
 * @param {string} report.generatedAt - Data ISO da execução.
 * @param {{ ok: boolean, checks: Array<object> }} report.preconditions - Resultado das precondições.
 * @param {Array<object>} report.results - Resultados dos comandos.
 * @returns {string} Conteúdo Markdown final.
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
 * Executa a validação final e escreve o ficheiro de evidence.
 *
 * @returns {{ ok: boolean, evidencePath: string }} Resultado da execução final.
 */
function runFinalValidation() {
    const generatedAt = new Date().toISOString();
    const preconditions = validatePreconditions();
    const results = preconditions.ok ? finalCommands.map(runFinalCommand) : [];
    const markdown = buildEvidenceMarkdown({ generatedAt, preconditions, results });

    // A pasta de evidence pode ainda não existir numa instalação limpa dos alunos.
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