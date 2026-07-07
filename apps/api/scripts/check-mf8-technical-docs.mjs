/**
 * @file Gate do BK-MF8-09 para validar a documentacao tecnica minima.
 *
 * O script torna o RNF30 repetivel: confirma que a documentacao existe,
 * cobre arquitetura/modelos/fluxos/limites e nao promete capacidades fiscais,
 * bancarias, contabilisticas ou de IA que o MVP nao implementa.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const technicalDocUrl = new URL(
    "../../../docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md",
    import.meta.url,
);
const technicalDocPath = fileURLToPath(technicalDocUrl);

const requiredSections = [
    "# Arquitetura tecnica minima MF8",
    "## Contexto",
    "## Arquitetura",
    "## Modelos",
    "## Fluxos",
    "## Subscricao simulada",
    "## Limites",
    "## Checklist de atualizacao documental",
];

const requiredMarkers = [
    "real_dev/api",
    "src/server.js",
    "PrismaClient",
    "real_dev/web",
    "src/App.tsx",
    "credentials: \"include\"",
    "CompanySubscription",
    "JournalEntry",
    "SaleDocument",
    "PurchaseDocument",
    "Receipt",
    "Payment",
    "AiInsight",
    "AiActionSuggestion",
    "empresa ativa",
    "cookie HttpOnly",
    "subscricao simulada",
    "sem gateway de pagamento",
    "nao executa acoes",
];

const forbiddenClaims = [
    /(?<!nao )declara certificacao fiscal/i,
    /usa gateway de pagamento real/i,
    /\bcheckout real\b/i,
    /\busa OCR\b|\bOCR ativo\b/i,
    /\busa RAG\b|\bRAG ativo\b/i,
    /\busa embeddings\b|\bembeddings ativos\b/i,
    /executa automacao contabilistica/i,
    /IA altera dados contabilisticos/i,
];

/**
 * Aplica mutacoes controladas para validar negativos sem editar o documento real.
 *
 * @param {string} text - Conteudo original do documento tecnico.
 * @param {string | undefined} mutation - Mutacao pedida por variavel de ambiente.
 * @returns {string} Conteudo original ou conteudo deliberadamente invalido.
 */
function applyControlledMutation(text, mutation) {
    if (mutation === "remove-limits") {
        return text.replace("## Limites", "## Fronteiras do MVP");
    }

    if (mutation === "add-fiscal-certification") {
        return `${text}\n\nEste MVP declara certificacao fiscal.\n`;
    }

    if (mutation === undefined || mutation === "") {
        return text;
    }

    throw new Error(
        `Mutacao desconhecida para o gate MF8: ${mutation}. Use remove-limits ou add-fiscal-certification.`,
    );
}

/**
 * Valida a documentacao tecnica minima exigida por RNF30.
 *
 * @param {string} text - Conteudo completo de `ARQUITETURA-TECNICA-MINIMA.md`.
 * @returns {string[]} Lista de problemas encontrados.
 */
export function validateTechnicalDocumentation(text) {
    const errors = [];

    for (const section of requiredSections) {
        // Cada titulo obrigatorio corresponde a uma parte defendivel do RNF30.
        if (!text.includes(section)) {
            errors.push(`Falta seccao obrigatoria: ${section}`);
        }
    }

    for (const marker of requiredMarkers) {
        if (!text.includes(marker)) {
            errors.push(`Falta marcador tecnico obrigatorio: ${marker}`);
        }
    }

    for (const forbidden of forbiddenClaims) {
        if (forbidden.test(text)) {
            errors.push(`A documentacao inclui promessa fora do MVP: ${forbidden}`);
        }
    }

    return errors;
}

/**
 * Executa o gate completo contra o documento tecnico.
 *
 * @returns {void}
 */
export function checkTechnicalDocumentation() {
    assert.equal(
        existsSync(technicalDocPath),
        true,
        `Documento tecnico obrigatorio em falta: ${technicalDocPath}`,
    );

    const originalText = readFileSync(technicalDocPath, "utf8");
    const text = applyControlledMutation(
        originalText,
        process.env.OPSA_MF8_TECH_DOC_MUTATION,
    );
    const errors = validateTechnicalDocumentation(text);

    if (errors.length > 0) {
        throw new Error(`Documentacao tecnica minima invalida:\n- ${errors.join("\n- ")}`);
    }
}

try {
    checkTechnicalDocumentation();
    console.info("Documentacao tecnica minima MF8 validada.");
} catch (error) {
    console.error(error?.message ?? String(error));
    process.exitCode = 1;
}
