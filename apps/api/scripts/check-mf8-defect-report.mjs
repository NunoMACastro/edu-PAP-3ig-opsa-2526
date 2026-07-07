/**
 * @file Validates the BK-MF8-18 defect-correction evidence.
 *
 * The checker links the final MF8 execution evidence from BK-MF8-17 to the
 * BK-MF8-18 report. It accepts a clean corrected path, a no-correction-needed
 * path, or an explicit environment blocker when the affected command cannot be
 * revalidated without a safe ephemeral database.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../../..");

const finalExecutionPath = resolve(
    repoRoot,
    "docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md"
);
const defectReportPath = resolve(
    repoRoot,
    "docs/evidence/MF8/CORRECAO-ERROS-REPORT.md"
);

const CORRECTED_DECISION = "CORRIGIDO_REVALIDADO";
const NO_CORRECTION_DECISION = "SEM_CORRECAO_NECESSARIA";
const ENV_BLOCKED_DECISION = "BLOQUEADO_AMBIENTE";
const NO_CORRECTION_COMMAND = "SEM_ERRO_BLOQUEANTE";
const NOT_APPLICABLE = "NAO_APLICAVEL";

const requiredSections = [
    "## Identificação",
    "## Erro observado",
    "## Causa raiz",
    "## Correção aplicada",
    "## Teste afetado reexecutado",
    "## Decisão final",
    "## Risco residual"
];

const requiredFields = [
    "BK",
    "Requisito",
    "Fonte",
    "Comando original",
    "Resultado observado",
    "Causa raiz resumida",
    "Ficheiros corrigidos",
    "Correção aplicada",
    "Comando reexecutado",
    "Resultado da reexecução",
    "Decisão final",
    "Risco residual"
];

const allowedDecisions = [
    CORRECTED_DECISION,
    NO_CORRECTION_DECISION,
    ENV_BLOCKED_DECISION
];
const passMarkers = ["PODE_AVANCAR_PARA_BK-MF8-18", "PASS"];
const blockingMarkers = ["BLOQUEADO_ATE_CORRECAO", "BLOQUEANTE", "FAIL"];
const environmentMarkers = [
    "TEST_DATABASE_URL",
    "OPSA_SKIP_PERSISTENCE_TESTS",
    "Schema engine",
    "BLOQUEADO_AMBIENTE",
    "FAIL_AMBIENTE"
];

/**
 * Reads a mandatory evidence file and rejects empty content.
 *
 * @param {string} filePath Absolute file path to read.
 * @param {string} label Human-readable label for error messages.
 * @returns {string} Trimmed file content.
 * @throws {Error} When the file does not exist or is empty.
 */
export function readRequiredFile(filePath, label) {
    if (!existsSync(filePath)) {
        throw new Error(`${label} não existe: ${filePath}`);
    }

    const content = readFileSync(filePath, "utf8").trim();

    if (content.length === 0) {
        throw new Error(`${label} existe, mas está vazio.`);
    }

    return content;
}

/**
 * Escapes literal text before building a regular expression.
 *
 * @param {string} value Literal value to escape.
 * @returns {string} Regular-expression safe value.
 */
export function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Asserts that a required Markdown section is present.
 *
 * @param {string} report Report content.
 * @param {string} section Required section heading.
 * @returns {void}
 * @throws {Error} When the heading is missing.
 */
export function assertSection(report, section) {
    if (!report.includes(section)) {
        throw new Error(`Secção obrigatória em falta: ${section}`);
    }
}

/**
 * Extracts a Markdown list field written as "- Field: value".
 *
 * @param {string} report Report content.
 * @param {string} fieldName Field name without the leading dash.
 * @returns {string} Extracted field value.
 * @throws {Error} When the field is missing or empty.
 */
export function extractField(report, fieldName) {
    const pattern = new RegExp(`^- ${escapeRegExp(fieldName)}:\\s*(.+)$`, "mu");
    const match = report.match(pattern);

    if (!match || match[1].trim().length === 0) {
        throw new Error(`Campo obrigatório em falta: ${fieldName}`);
    }

    return match[1].trim();
}

/**
 * Confirms that the report references the final-execution evidence file.
 *
 * @param {string} source Source field from the defect report.
 * @returns {void}
 * @throws {Error} When the source does not match the BK-MF8-17 evidence path.
 */
export function assertExpectedSource(source) {
    if (source !== "docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md") {
        throw new Error("A fonte deve ser docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md.");
    }
}

/**
 * Confirms that the final-execution evidence contains the affected command.
 *
 * @param {string} finalExecution BK-MF8-17 evidence content.
 * @param {string} originalCommand Command recorded in BK-MF8-18.
 * @returns {void}
 * @throws {Error} When the command is not present in the original evidence.
 */
export function assertOriginalCommandWasExecuted(finalExecution, originalCommand) {
    if (!finalExecution.includes(originalCommand)) {
        throw new Error(
            "O comando original não aparece em docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md."
        );
    }
}

/**
 * Confirms that the report decision belongs to the BK-MF8-18 contract.
 *
 * @param {string} decision Decision extracted from the report.
 * @returns {void}
 * @throws {Error} When the decision is not recognised.
 */
export function assertAllowedDecision(decision) {
    if (!allowedDecisions.includes(decision)) {
        throw new Error(`Decisão final inválida. Usa ${allowedDecisions.join(" ou ")}.`);
    }
}

/**
 * Checks whether a text contains at least one marker from a list.
 *
 * @param {string} value Text to inspect.
 * @param {string[]} markers Markers to search.
 * @returns {boolean} True when any marker exists.
 */
function hasAnyMarker(value, markers) {
    return markers.some((marker) => value.includes(marker));
}

/**
 * Validates the path where a real defect was corrected and revalidated.
 *
 * @param {string} finalExecution BK-MF8-17 evidence content.
 * @param {string} originalCommand Command that failed in final execution.
 * @param {string} rerunCommand Command repeated after correction.
 * @param {string} rerunResult Textual result of the rerun.
 * @returns {void}
 * @throws {Error} When the rerun does not prove the same command passed.
 */
export function assertCorrectedPath(
    finalExecution,
    originalCommand,
    rerunCommand,
    rerunResult
) {
    assertOriginalCommandWasExecuted(finalExecution, originalCommand);

    if (rerunCommand !== originalCommand) {
        throw new Error("O comando reexecutado deve ser igual ao comando original.");
    }

    if (!rerunResult.includes("PASS")) {
        throw new Error("O resultado da reexecução deve incluir PASS.");
    }
}

/**
 * Validates the path where the final execution had no blocking defect.
 *
 * @param {string} finalExecution BK-MF8-17 evidence content.
 * @param {string} originalCommand Original command field.
 * @param {string} rerunCommand Rerun command field.
 * @param {string} rerunResult Rerun result field.
 * @returns {void}
 * @throws {Error} When the final execution still contains blocking markers.
 */
export function assertNoCorrectionWasNeeded(
    finalExecution,
    originalCommand,
    rerunCommand,
    rerunResult
) {
    if (originalCommand !== NO_CORRECTION_COMMAND) {
        throw new Error(`Sem correção, o comando original deve ser ${NO_CORRECTION_COMMAND}.`);
    }

    if (rerunCommand !== NOT_APPLICABLE || rerunResult !== NOT_APPLICABLE) {
        throw new Error(`Sem correção, usa ${NOT_APPLICABLE} na reexecução.`);
    }

    if (!hasAnyMarker(finalExecution, passMarkers) || hasAnyMarker(finalExecution, blockingMarkers)) {
        throw new Error("A execução final não prova que era seguro fechar sem correção.");
    }
}

/**
 * Validates the honest blocked path for missing or unavailable test infrastructure.
 *
 * @param {string} finalExecution BK-MF8-17 evidence content.
 * @param {string} originalCommand Command that remains blocked.
 * @param {string} rerunCommand Command attempted after investigation.
 * @param {string} rerunResult Result recorded in the defect report.
 * @param {string} causeRoot Root-cause field from the report.
 * @returns {void}
 * @throws {Error} When the blocker is not supported by final evidence.
 */
export function assertEnvironmentBlockedPath(
    finalExecution,
    originalCommand,
    rerunCommand,
    rerunResult,
    causeRoot
) {
    assertOriginalCommandWasExecuted(finalExecution, originalCommand);

    if (![originalCommand, NOT_APPLICABLE].includes(rerunCommand)) {
        throw new Error(
            `Quando há bloqueio ambiental, o comando reexecutado deve ser ${originalCommand} ou ${NOT_APPLICABLE}.`
        );
    }

    const combinedEvidence = `${finalExecution}\n${rerunResult}\n${causeRoot}`;

    if (!hasAnyMarker(finalExecution, blockingMarkers)) {
        throw new Error("A decisão ambiental exige uma execução final bloqueada.");
    }

    if (!hasAnyMarker(combinedEvidence, environmentMarkers)) {
        throw new Error("A decisão ambiental deve mencionar TEST_DATABASE_URL, skip explícito ou erro de engine.");
    }

    if (!rerunResult.includes("BLOQUEADO") && !rerunResult.includes("FAIL")) {
        throw new Error("O resultado ambiental deve manter o bloqueio explícito.");
    }
}

/**
 * Validates the BK-MF8-18 correction report against BK-MF8-17 evidence.
 *
 * @returns {{ originalCommand: string, rerunCommand: string, decision: string }} Validated summary.
 * @throws {Error} When the report is incomplete or unsupported.
 */
export function validateDefectReport() {
    const finalExecution = readRequiredFile(finalExecutionPath, "Evidência da execução final");
    const report = readRequiredFile(defectReportPath, "Relatório de correção de erros");

    for (const section of requiredSections) {
        assertSection(report, section);
    }

    for (const fieldName of requiredFields) {
        extractField(report, fieldName);
    }

    const source = extractField(report, "Fonte");
    const originalCommand = extractField(report, "Comando original");
    const rerunCommand = extractField(report, "Comando reexecutado");
    const rerunResult = extractField(report, "Resultado da reexecução");
    const decision = extractField(report, "Decisão final");
    const causeRoot = extractField(report, "Causa raiz resumida");

    assertExpectedSource(source);
    assertAllowedDecision(decision);

    if (decision === NO_CORRECTION_DECISION) {
        assertNoCorrectionWasNeeded(finalExecution, originalCommand, rerunCommand, rerunResult);
    } else if (decision === ENV_BLOCKED_DECISION) {
        assertEnvironmentBlockedPath(
            finalExecution,
            originalCommand,
            rerunCommand,
            rerunResult,
            causeRoot
        );
    } else {
        assertCorrectedPath(finalExecution, originalCommand, rerunCommand, rerunResult);
    }

    return {
        originalCommand,
        rerunCommand,
        decision
    };
}

const executedFileUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";

if (import.meta.url === executedFileUrl) {
    const result = validateDefectReport();
    console.log(`BK-MF8-18 validado: ${result.decision} (${result.rerunCommand})`);
}
