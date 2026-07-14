/**
 * @file Standalone fail-closed check for the canonical remediation report.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertCanonicalReportReady } from "./academic-report-gate.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const reportPath = resolve(
    scriptDirectory,
    "../../../docs/planificacao/auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md",
);

try {
    const result = assertCanonicalReportReady(readFileSync(reportPath, "utf8"));
    console.info(
        `[academic-report] PASS ${result.functionalCount} findings funcionais fechados; ${result.acceptedRiskCount} risco aceite.`,
    );
} catch (error) {
    const message = error instanceof Error ? error.message : "erro desconhecido";
    console.error(`[academic-report] FAIL ${message}`);
    process.exitCode = 1;
}
