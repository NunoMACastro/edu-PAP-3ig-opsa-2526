/**
 * @file Pseudonimização e gate fail-closed de dados enviados a providers.
 */

import { httpError } from "../../lib/httpErrors.js";

const PROHIBITED_PATTERNS = Object.freeze([
    { code: "EMAIL", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
    { code: "IBAN", regex: /\bPT50[\s-]?(?:\d[\s-]?){21}\b/i },
    { code: "NIF", regex: /\b[125689]\d{8}\b/ },
    { code: "PHONE", regex: /(?:\+351[\s-]?)?(?:2\d{8}|9[1236]\d{7})\b/ },
    { code: "POSTAL_CODE", regex: /\b\d{4}-\d{3}\b/ },
    { code: "UUID", regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i },
    { code: "CREDENTIAL", regex: /\b(?:password|passwd|api[_ -]?key|secret|token|bearer)\b/i },
    { code: "ATTACHMENT", regex: /\b(?:anexo|attachment|SAF-?T|ficheiro completo)\b/i },
    { code: "PROMPT_INJECTION", regex: /\b(?:ignore|ignora|revela|mostra)\b.{0,30}\b(?:instruções|instructions|prompt|system)\b/i },
]);

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function nextAlias(aliasMap, category, entityKey) {
    const existing = Object.entries(aliasMap).find(([, entry]) => entry.entityKey === entityKey);
    if (existing) return existing[0];
    const count = Object.keys(aliasMap).filter((alias) => alias.startsWith(`${category}_`)).length + 1;
    const alias = `${category}_${String(count).padStart(3, "0")}`;
    aliasMap[alias] = { category, entityKey };
    return alias;
}

/** Substitui entidades conhecidas no texto e bloqueia identificadores residuais. */
export async function pseudonymizeUserText(prisma, { companyId, text, aliasMap = {} }) {
    let sanitized = String(text ?? "").trim();
    if (sanitized.length < 2 || sanitized.length > 1_000) {
        throw httpError(400, "INVALID_AI_MESSAGE", "Mensagem inválida");
    }
    const [company, customers, suppliers, items, sales, purchases] = await Promise.all([
        prisma.company.findUnique({ where: { id: companyId }, select: { id: true, name: true, nif: true } }),
        prisma.customer.findMany({ where: { companyId }, select: { id: true, name: true, nif: true, email: true, phone: true, addressLine: true } }),
        prisma.supplier.findMany({ where: { companyId }, select: { id: true, name: true, nif: true, email: true, phone: true, addressLine: true } }),
        prisma.item.findMany({ where: { companyId }, select: { id: true, name: true, sku: true } }),
        prisma.saleDocument.findMany({ where: { companyId, number: { not: null } }, select: { id: true, number: true } }),
        prisma.purchaseDocument.findMany({ where: { companyId }, select: { id: true, supplierNumber: true } }),
    ]);
    const groups = [
        ["COMPANY", company ? [company] : [], ["name", "nif"]],
        ["CUSTOMER", customers, ["name", "nif", "email", "phone", "addressLine"]],
        ["SUPPLIER", suppliers, ["name", "nif", "email", "phone", "addressLine"]],
        ["ITEM", items, ["name", "sku"]],
        ["DOCUMENT", sales, ["number"]],
        ["DOCUMENT", purchases, ["supplierNumber"]],
    ];
    for (const [category, entities, fields] of groups) {
        for (const entity of entities) {
            const alias = nextAlias(aliasMap, category, `${category}:${entity.id}`);
            for (const field of fields) {
                const value = entity[field];
                if (typeof value === "string" && value.trim().length >= 3) {
                    sanitized = sanitized.replace(new RegExp(escapeRegex(value.trim()), "giu"), alias);
                }
            }
        }
    }
    assertOutboundAiSafe({ question: sanitized });
    return { sanitized, aliasMap };
}

/** Troca todos os IDs técnicos de um resultado por aliases da sessão. */
export function pseudonymizeToolResult(value, aliasMap = {}) {
    const visit = (current, keyName = "") => {
        if (Array.isArray(current)) return current.slice(0, 10).map((entry) => visit(entry));
        if (current && typeof current === "object") {
            const result = {};
            for (const [key, nested] of Object.entries(current)) {
                if (/id$/i.test(key) && typeof nested === "string") {
                    const category = /item/i.test(key) ? "ITEM" : /customer/i.test(key) ? "CUSTOMER" : /supplier/i.test(key) ? "SUPPLIER" : /document/i.test(key) ? "DOCUMENT" : /insight/i.test(key) ? "INSIGHT" : /warehouse/i.test(key) ? "WAREHOUSE" : "REFERENCE";
                    result[key.replace(/Id$/i, "Ref")] = nextAlias(aliasMap, category, `${category}:${nested}`);
                } else if (!/label|name|email|nif|iban|phone|address/i.test(key)) {
                    result[key] = visit(nested, key);
                }
            }
            return result;
        }
        return current;
    };
    const sanitized = visit(value);
    assertOutboundAiSafe(sanitized);
    return { sanitized, aliasMap };
}

/** Último gate antes do SDK; deve receber o payload integral. */
export function assertOutboundAiSafe(payload) {
    const serialized = JSON.stringify(payload);
    const finding = PROHIBITED_PATTERNS.find(({ regex }) => regex.test(serialized));
    if (finding) {
        throw httpError(400, "AI_OUTBOUND_DATA_BLOCKED", "A mensagem contém dados que não podem ser enviados ao provider.", { category: finding.code });
    }
    if (serialized.length > 120_000) {
        throw httpError(413, "AI_OUTBOUND_PAYLOAD_TOO_LARGE", "Payload externo demasiado grande");
    }
    return payload;
}
