// apps/api/scripts/check-mf8-technical-docs.mjs

import { readFile } from "node:fs/promises";

const technicalDocUrl = new URL(
  "../../../docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md",
  import.meta.url,
);

const requiredSections = [
  "## Arquitetura",
  "## Modelos",
  "## Fluxos",
  "## Subscrição simulada",
  "## Limites",
];

/**
 * Valida a documentação técnica mínima exigida pelo RNF30.
 *
 * @param {string} text - Conteúdo completo de `ARQUITETURA-TECNICA-MINIMA.md`.
 * @returns {string[]} Lista de problemas encontrados na documentação.
 */
export function validateTechnicalDocumentation(text) {
  const errors = [];

  for (const section of requiredSections) {
    // Cada título obrigatório representa uma parte defensável da arquitetura OPSA.
    if (!text.includes(section)) {
      errors.push(`Falta secção obrigatória: ${section}`);
    }
  }

  if (!text.includes("subscrição simulada") && !text.includes("Subscrição simulada")) {
    errors.push("Falta explicar que a subscrição da MF8 é simulada e sem pagamento real.");
  }

  if (text.includes("certificação fiscal")) {
    // O BK documenta limites: não deve transformar o MVP numa promessa legal.
    errors.push("A documentação não pode declarar certificação fiscal.");
  }

  return errors;
}

const text = await readFile(technicalDocUrl, "utf8");
const errors = validateTechnicalDocumentation(text);

if (errors.length > 0) {
  throw new Error(`Documentação técnica mínima inválida:\n- ${errors.join("\n- ")}`);
}

console.log("Documentação técnica mínima MF8 validada.");