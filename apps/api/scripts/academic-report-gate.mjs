/**
 * @file Fail-closed parser for the canonical end-to-end remediation report.
 *
 * The academic release gate must not infer readiness from code/tests while a P0
 * functional finding is merely implemented, blocked or waiting for re-audit.
 * Only `FECHADO` is release-ready. The single accepted risk remains explicit
 * and cannot be used as a waiver for functional findings.
 */

const FUNCTIONAL_ID_PATTERN = /^OPSA-E2E-(P0|P1|P2|P3)-\d{3}$/;
const TRACKED_ID_PATTERN = /^OPSA-E2E-(P0|P1|P2|P3|RISK)-\d{3}$/;
const ACCEPTED_RISK_ID = "OPSA-E2E-RISK-001";
const CLOSED_STATE = "FECHADO";
const ACCEPTED_RISK_STATE = "RISCO_ACEITE";

const REQUIRED_FINDING_IDS = Object.freeze([
    "OPSA-E2E-P0-001",
    ...Array.from(
        { length: 17 },
        (_, index) => `OPSA-E2E-P1-${String(index + 1).padStart(3, "0")}`,
    ),
    ...Array.from(
        { length: 17 },
        (_, index) => `OPSA-E2E-P2-${String(index + 1).padStart(3, "0")}`,
    ),
    ...Array.from(
        { length: 2 },
        (_, index) => `OPSA-E2E-P3-${String(index + 1).padStart(3, "0")}`,
    ),
    ACCEPTED_RISK_ID,
]);

/**
 * Removes one Markdown inline-code wrapper without changing inner text.
 *
 * @param {string} value - Raw table cell.
 * @returns {string} Normalized cell value.
 */
function normalizeCell(value) {
    const trimmed = String(value).trim();
    return trimmed.startsWith("`") && trimmed.endsWith("`")
        ? trimmed.slice(1, -1).trim()
        : trimmed;
}

/**
 * Splits a simple Markdown table row into normalized cells.
 *
 * The canonical findings table does not contain escaped pipes. Rejecting any
 * structural drift is safer than guessing a state from a malformed row.
 *
 * @param {string} line - Markdown table row.
 * @returns {string[]} Parsed cells.
 */
function parseTableCells(line) {
    if (!line.trim().startsWith("|") || !line.trim().endsWith("|")) {
        return [];
    }
    return line
        .trim()
        .slice(1, -1)
        .split("|")
        .map(normalizeCell);
}

/**
 * Extracts the first canonical findings table and validates its inventory.
 *
 * @param {string} markdown - Complete canonical report.
 * @returns {Array<{ id: string, severity: string, state: string }>} Findings.
 * @throws {Error} When the table is absent, malformed, incomplete or duplicated.
 */
export function parseCanonicalFindings(markdown) {
    if (typeof markdown !== "string" || markdown.trim() === "") {
        throw new Error("ACADEMIC_REPORT_INVALID: relatório canónico vazio.");
    }

    const lines = markdown.split(/\r?\n/u);
    const expectedHeader = [
        "ID",
        "Severidade",
        "Resumo",
        "Fase",
        "Dependencias",
        "Estado",
        "Owner",
    ];
    const headerIndex = lines.findIndex((line) => {
        const cells = parseTableCells(line);
        return cells.length === expectedHeader.length
            && cells.every((cell, index) => cell === expectedHeader[index]);
    });

    if (headerIndex < 0) {
        throw new Error(
            "ACADEMIC_REPORT_INVALID: tabela canónica de findings não encontrada.",
        );
    }

    const rows = [];
    const seen = new Set();
    for (let index = headerIndex + 2; index < lines.length; index += 1) {
        const cells = parseTableCells(lines[index]);
        if (cells.length === 0) break;
        if (cells.length !== expectedHeader.length) {
            throw new Error(
                `ACADEMIC_REPORT_INVALID: linha ${index + 1} da tabela tem ${cells.length} colunas.`,
            );
        }

        const [id, severity, , , , state] = cells;
        if (!TRACKED_ID_PATTERN.test(id)) continue;
        if (seen.has(id)) {
            throw new Error(`ACADEMIC_REPORT_INVALID: finding duplicado ${id}.`);
        }
        seen.add(id);
        rows.push({ id, severity, state });
    }

    const missing = REQUIRED_FINDING_IDS.filter((id) => !seen.has(id));
    if (missing.length > 0) {
        throw new Error(
            `ACADEMIC_REPORT_INVALID: findings obrigatórios ausentes: ${missing.join(", ")}.`,
        );
    }

    return rows;
}

/**
 * Enforces release readiness for every functional finding and the accepted risk.
 *
 * @param {string} markdown - Complete canonical report.
 * @returns {{ functionalCount: number, acceptedRiskCount: number }} Safe summary.
 * @throws {Error} When any functional finding is not closed or risk state drifts.
 */
export function assertCanonicalReportReady(markdown) {
    const rows = parseCanonicalFindings(markdown);
    const functionalRows = rows.filter((row) => FUNCTIONAL_ID_PATTERN.test(row.id));

    for (const row of functionalRows) {
        const expectedSeverity = row.id.match(/-P([0-3])-/u)?.[0].slice(1, -1);
        if (row.severity !== expectedSeverity) {
            throw new Error(
                `ACADEMIC_REPORT_INVALID: ${row.id} tem severidade ${row.severity}, esperada ${expectedSeverity}.`,
            );
        }
        if (row.state === ACCEPTED_RISK_STATE) {
            throw new Error(
                `ACADEMIC_REPORT_BLOCKED: RISCO_ACEITE não é permitido em ${row.id}.`,
            );
        }
    }

    const nonClosed = functionalRows.filter((row) => row.state !== CLOSED_STATE);
    if (nonClosed.length > 0) {
        throw new Error(
            "ACADEMIC_REPORT_BLOCKED: findings funcionais não fechados: "
                + nonClosed.map((row) => `${row.id}=${row.state}`).join(", ")
                + ".",
        );
    }

    const riskRows = rows.filter((row) => row.id.includes("-RISK-"));
    if (
        riskRows.length !== 1
        || riskRows[0].id !== ACCEPTED_RISK_ID
        || riskRows[0].state !== ACCEPTED_RISK_STATE
    ) {
        throw new Error(
            `ACADEMIC_REPORT_INVALID: apenas ${ACCEPTED_RISK_ID} pode permanecer ${ACCEPTED_RISK_STATE}.`,
        );
    }

    return {
        functionalCount: functionalRows.length,
        acceptedRiskCount: riskRows.length,
    };
}
