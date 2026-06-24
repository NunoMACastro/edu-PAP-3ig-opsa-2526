/**
 * @file Smoke textual do BK-MF6-10.
 */

import { readFileSync } from "node:fs";

const auditService = readFileSync("src/modules/audit/auditLogService.js", "utf8");
const companyUserService = readFileSync(
    "src/modules/company-users/companyUserService.js",
    "utf8",
);
const fiscalPeriodService = readFileSync(
    "src/modules/fiscal-periods/fiscalPeriodService.js",
    "utf8",
);
const saleDocumentService = readFileSync(
    "src/modules/sales/saleDocumentService.js",
    "utf8",
);

for (const action of [
    "permissions.update",
    "fiscalPeriod.close",
    "document.issue",
]) {
    if (!auditService.includes(action)) {
        throw new Error(`Falta ação sensível declarada: ${action}`);
    }
}

for (const forbiddenField of ["targetType", "targetId", "metadata:"]) {
    if (auditService.includes(forbiddenField)) {
        throw new Error(`Campo incompatível com AuditLog: ${forbiddenField}`);
    }
}

for (const forbiddenDetailKey of ["rawpayload", "documentlines"]) {
    if (!auditService.includes(`"${forbiddenDetailKey}"`)) {
        throw new Error(`Falta detalhe proibido normalizado: ${forbiddenDetailKey}`);
    }
}

const serviceContracts = [
    ["company-users", companyUserService, "permissions.update"],
    ["fiscal-periods", fiscalPeriodService, "fiscalPeriod.close"],
    ["sales", saleDocumentService, "document.issue"],
];

for (const [name, content, action] of serviceContracts) {
    // O gate prova cobertura mínima: cada fluxo crítico tem chamada real ao helper.
    if (!content.includes("recordSensitiveAudit") || !content.includes(action)) {
        throw new Error(`Falta auditoria sensível no service ${name}`);
    }
}

if (!auditService.includes("recordSensitiveAudit")) {
    throw new Error("Falta helper de auditoria sensível.");
}