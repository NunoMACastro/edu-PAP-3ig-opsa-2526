// apps/api/scripts/check-mf8-defect-report.mjs
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "../../..");

const FINAL_EXECUTION_PATH = join(
  PROJECT_ROOT,
  "docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md",
);

const DEFECT_REPORT_PATH = join(
  PROJECT_ROOT,
  "docs/evidence/MF8/CORRECAO-ERROS-REPORT.md",
);

const CORRECTED_DECISION = "CORRIGIDO_REVALIDADO";
const NO_CORRECTION_DECISION = "SEM_CORRECAO_NECESSARIA";
const NO_CORRECTION_COMMAND = "SEM_ERRO_BLOQUEANTE";
const NOT_APPLICABLE = "NAO_APLICAVEL";

const REQUIRED_SECTIONS = [
  "## Identificação",
  "## Erro observado",
  "## Causa raiz",
  "## Correção aplicada",
  "## Teste afetado reexecutado",
  "## Decisão final",
  "## Risco residual",
];

const REQUIRED_FIELDS = [
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
  "Risco residual",
];

const ALLOWED_DECISIONS = [CORRECTED_DECISION, NO_CORRECTION_DECISION];
const PASS_MARKERS = ["PODE_AVANCAR_PARA_BK-MF8-18", "PASS"];
const BLOCKING_MARKERS = ["BLOQUEADO_ATE_CORRECAO", "BLOQUEANTE", "FAIL"];

/**
 * Lê um ficheiro obrigatório e devolve o seu conteúdo textual.
 *
 * @param {string} filePath Caminho absoluto do ficheiro a ler.
 * @param {string} label Nome humano usado nas mensagens de erro.
 * @returns {string} Conteúdo do ficheiro.
 * @throws {Error} Quando o ficheiro não existe ou está vazio.
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
 * Escapa texto para ser usado de forma segura numa expressão regular.
 *
 * @param {string} value Texto literal a escapar.
 * @returns {string} Texto pronto para usar numa expressão regular.
 */
export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Confirma que uma secção obrigatória existe no relatório.
 *
 * @param {string} report Conteúdo do relatório de correção.
 * @param {string} section Título da secção obrigatória.
 * @throws {Error} Quando a secção não existe.
 */
export function assertSection(report, section) {
  if (!report.includes(section)) {
    throw new Error(`Secção obrigatória em falta: ${section}`);
  }
}

/**
 * Extrai um campo escrito no formato "- Nome: valor".
 *
 * @param {string} report Conteúdo do relatório de correção.
 * @param {string} fieldName Nome do campo a procurar.
 * @returns {string} Valor textual do campo.
 * @throws {Error} Quando o campo não existe ou está vazio.
 */
export function extractField(report, fieldName) {
  const fieldPattern = new RegExp(
    `^- ${escapeRegExp(fieldName)}:\\s*(.+)$`,
    "mu",
  );
  const match = report.match(fieldPattern);

  if (!match || match[1].trim().length === 0) {
    throw new Error(`Campo obrigatório em falta: ${fieldName}`);
  }

  return match[1].trim();
}

/**
 * Confirma que o comando corrigido vem da execução final do BK-MF8-17.
 *
 * @param {string} finalExecution Conteúdo da evidência do BK-MF8-17.
 * @param {string} originalCommand Comando que falhou na execução final.
 * @throws {Error} Quando o comando não aparece na evidência original.
 */
export function assertOriginalCommandWasExecuted(finalExecution, originalCommand) {
  if (!finalExecution.includes(originalCommand)) {
    throw new Error(
      "O comando original não aparece em docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md.",
    );
  }
}

/**
 * Confirma que a decisão final pertence ao contrato deste BK.
 *
 * @param {string} decision Decisão extraída do relatório.
 * @throws {Error} Quando a decisão não é reconhecida.
 */
export function assertAllowedDecision(decision) {
  if (!ALLOWED_DECISIONS.includes(decision)) {
    throw new Error(
      `Decisão final inválida. Usa ${ALLOWED_DECISIONS.join(" ou ")}.`,
    );
  }
}

/**
 * Valida o ramo em que houve erro e correção efetiva.
 *
 * @param {string} finalExecution Conteúdo da evidência do BK-MF8-17.
 * @param {string} originalCommand Comando que falhou na execução final.
 * @param {string} rerunCommand Comando repetido depois da correção.
 * @param {string} rerunResult Resultado textual da reexecução.
 * @throws {Error} Quando o relatório não prova a correção do comando afetado.
 */
export function assertCorrectedPath(
  finalExecution,
  originalCommand,
  rerunCommand,
  rerunResult,
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
 * Valida o ramo em que a execução final já não tinha erro bloqueante.
 *
 * @param {string} finalExecution Conteúdo da evidência do BK-MF8-17.
 * @param {string} originalCommand Valor do campo "Comando original".
 * @param {string} rerunCommand Valor do campo "Comando reexecutado".
 * @param {string} rerunResult Valor do campo "Resultado da reexecução".
 * @throws {Error} Quando a evidência não suporta a ausência de correção.
 */
export function assertNoCorrectionWasNeeded(
  finalExecution,
  originalCommand,
  rerunCommand,
  rerunResult,
) {
  if (originalCommand !== NO_CORRECTION_COMMAND) {
    throw new Error(`Sem correção, o comando original deve ser ${NO_CORRECTION_COMMAND}.`);
  }

  if (rerunCommand !== NOT_APPLICABLE || rerunResult !== NOT_APPLICABLE) {
    throw new Error(`Sem correção, usa ${NOT_APPLICABLE} na reexecução.`);
  }

  const hasPassMarker = PASS_MARKERS.some((marker) => finalExecution.includes(marker));
  const hasBlockingMarker = BLOCKING_MARKERS.some((marker) =>
    finalExecution.includes(marker),
  );

  // Este ramo só é seguro quando a própria evidência final já permite avançar.
  if (!hasPassMarker || hasBlockingMarker) {
    throw new Error(
      "A execução final não prova que era seguro fechar sem correção.",
    );
  }
}

/**
 * Valida a evidência de correção do BK-MF8-18.
 *
 * @returns {{ originalCommand: string, rerunCommand: string, decision: string }} Resumo validado.
 * @throws {Error} Quando a evidência não prova a correção do erro afetado.
 */
export function validateDefectReport() {
  const finalExecution = readRequiredFile(
    FINAL_EXECUTION_PATH,
    "Evidência da execução final",
  );
  const report = readRequiredFile(
    DEFECT_REPORT_PATH,
    "Relatório de correção de erros",
  );

  for (const section of REQUIRED_SECTIONS) {
    assertSection(report, section);
  }

  for (const fieldName of REQUIRED_FIELDS) {
    extractField(report, fieldName);
  }

  const source = extractField(report, "Fonte");
  const originalCommand = extractField(report, "Comando original");
  const rerunCommand = extractField(report, "Comando reexecutado");
  const rerunResult = extractField(report, "Resultado da reexecução");
  const decision = extractField(report, "Decisão final");

  if (source !== "docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md") {
    throw new Error("A fonte deve ser docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md.");
  }

  assertAllowedDecision(decision);

  if (decision === NO_CORRECTION_DECISION) {
    assertNoCorrectionWasNeeded(
      finalExecution,
      originalCommand,
      rerunCommand,
      rerunResult,
    );
  } else {
    // A correção só é aceite se partir do comando realmente registado no BK-MF8-17.
    assertCorrectedPath(finalExecution, originalCommand, rerunCommand, rerunResult);
  }

  return {
    originalCommand,
    rerunCommand,
    decision,
  };
}

const executedFileUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";

if (import.meta.url === executedFileUrl) {
  const result = validateDefectReport();
  console.log(
    `BK-MF8-18 validado: ${result.decision} (${result.rerunCommand})`,
  );
}