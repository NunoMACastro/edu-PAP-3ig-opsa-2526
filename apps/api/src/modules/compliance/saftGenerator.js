/**
 * @file Gerador interno do SAF-T PT 1.04_01.
 *
 * O módulo transforma exclusivamente um snapshot persistido e já limitado à
 * empresa/período num XML determinístico. Campos fiscais obrigatórios nunca são
 * inventados: a ausência ou incoerência de qualquer valor necessário produz
 * uma resposta de readiness 422 antes de o validador externo ou o storage serem
 * chamados.
 */

import { create } from "xmlbuilder2";
import iconvLite from "iconv-lite";
import { httpError } from "../../lib/httpErrors.js";
import {
    SAFT_ENCODING,
    SAFT_NAMESPACE,
    SAFT_VERSION,
    sha256Bytes,
} from "./saftSchemaContract.js";

const ACCOUNTING_BASES = new Set(["C", "I"]);
const TAXONOMY_REFERENCES = new Set(["S", "M", "N", "O"]);
const GROUPING_CATEGORIES = new Set(["GR", "GA", "GM", "AR", "AA", "AM"]);
const MANUAL_TRANSACTION_TYPES = new Set(["N", "R", "A", "J"]);
const SALE_KIND_TO_SAFT = Object.freeze({
    INVOICE: "FT",
    INVOICE_RECEIPT: "FR",
    CREDIT_NOTE: "NC",
});
const ITEM_TYPE_TO_SAFT = Object.freeze({ PRODUCT: "P", SERVICE: "S" });
const VAT_TYPE_TO_SAFT = Object.freeze({
    NORMAL: "NOR",
    INTERMEDIATE: "INT",
    REDUCED: "RED",
    EXEMPT: "ISE",
    OTHER: "OUT",
});
const JOURNAL_METADATA = Object.freeze({
    SALE: { id: "SALES", description: "Vendas" },
    PURCHASE: { id: "PURCHASES", description: "Compras" },
    MANUAL: { id: "MANUAL", description: "Lançamentos manuais" },
});

// 85 símbolos XML-safe. Um UUID de 128 bits cabe exatamente em 20 dígitos
// base85, o limite de DocArchivalNumber, sem truncagem nem perda de entropia.
const BASE85_ALPHABET =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%()*+,-./:;=?@^_{|}~";
const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

/**
 * Cria um erro de readiness fiscal sem incluir o valor recebido.
 *
 * @param {string} field - Caminho técnico seguro do campo.
 * @param {string} message - Explicação sem dados pessoais.
 * @returns {Error} Erro HTTP 422.
 */
function readinessError(field, message) {
    return httpError(422, "SAFT_SOURCE_NOT_READY", `${field}: ${message}`);
}

/**
 * Exige texto persistido dentro dos limites do XSD e representável em CP1252.
 *
 * @param {unknown} value - Valor persistido.
 * @param {{ field: string, min?: number, max: number, pattern?: RegExp }} options - Contrato.
 * @returns {string} Texto validado.
 */
function requiredText(value, { field, min = 1, max, pattern }) {
    const text = typeof value === "string" ? value.trim() : "";
    if (
        text.length < min ||
        text.length > max ||
        /[\u0000-\u001f\u007f]/.test(text) ||
        (pattern && !pattern.test(text))
    ) {
        throw readinessError(field, "valor obrigatório ausente ou incompatível com o XSD");
    }
    const encoded = iconvLite.encode(text, SAFT_ENCODING);
    if (iconvLite.decode(encoded, SAFT_ENCODING) !== text) {
        throw readinessError(field, `texto não representável em ${SAFT_ENCODING}`);
    }
    return text;
}

/**
 * Exige uma data persistida válida.
 *
 * @param {unknown} value - Date ou ISO persistido.
 * @param {string} field - Caminho técnico.
 * @returns {Date} Data clonada e validada.
 */
function requiredDate(value, field) {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw readinessError(field, "data obrigatória inválida");
    }
    return date;
}

/**
 * Formata uma data civil em UTC, tal como persistida pelo domínio.
 *
 * @param {Date} value - Data válida.
 * @returns {string} YYYY-MM-DD.
 */
function dateOnly(value) {
    return value.toISOString().slice(0, 10);
}

/**
 * Formata um timestamp XSD sem alterar o instante persistido.
 *
 * @param {Date} value - Data válida.
 * @returns {string} Timestamp ISO.
 */
function dateTime(value) {
    return value.toISOString();
}

/**
 * Valida um montante interno em cêntimos.
 *
 * @param {unknown} value - Inteiro persistido.
 * @param {string} field - Caminho técnico.
 * @returns {number} Cêntimos não negativos.
 */
function cents(value, field) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw readinessError(field, "montante em cêntimos inválido");
    }
    return value;
}

/**
 * Converte cêntimos em decimal SAF-T exato.
 *
 * @param {number} value - Inteiro seguro em cêntimos.
 * @returns {string} Decimal com duas casas.
 */
function money(value) {
    return `${Math.floor(value / 100)}.${String(value % 100).padStart(2, "0")}`;
}

/**
 * Valida quantidades decimais sem as converter por ponto flutuante.
 *
 * @param {unknown} value - Int, Decimal Prisma ou string decimal.
 * @param {string} field - Caminho técnico.
 * @returns {string} Decimal canónico positivo.
 */
function quantity(value, field) {
    const raw = String(value ?? "").trim();
    if (!/^\d+(?:\.\d+)?$/.test(raw) || Number(raw) <= 0) {
        throw readinessError(field, "quantidade positiva obrigatória");
    }
    const [whole, fraction = ""] = raw.split(".");
    const normalizedFraction = fraction.replace(/0+$/, "");
    return normalizedFraction ? `${BigInt(whole)}.${normalizedFraction}` : String(BigInt(whole));
}

/**
 * Exige indicador fiscal explicitamente persistido.
 *
 * @param {unknown} value - 0 ou 1.
 * @param {string} field - Caminho técnico.
 * @returns {number} Indicador validado.
 */
function indicator(value, field) {
    if (value !== 0 && value !== 1) {
        throw readinessError(field, "indicador fiscal 0/1 não persistido");
    }
    return value;
}

/**
 * Converte um UUID persistido em base85 reversível com 20 carateres.
 *
 * @param {unknown} value - UUID da entidade.
 * @param {string} field - Caminho técnico.
 * @returns {string} Identificador sem espaços compatível com o XSD.
 */
function uuidArchivalNumber(value, field) {
    const uuid = String(value ?? "").trim();
    if (!UUID_PATTERN.test(uuid)) {
        throw readinessError(
            field,
            "saftDocArchivalNumber é obrigatório quando o id persistido não é UUID",
        );
    }
    let numeric = BigInt(`0x${uuid.replaceAll("-", "")}`);
    let encoded = "";
    do {
        const index = Number(numeric % 85n);
        encoded = BASE85_ALPHABET[index] + encoded;
        numeric /= 85n;
    } while (numeric > 0n);
    return encoded.padStart(20, BASE85_ALPHABET[0]);
}

/**
 * Produz um identificador SAF-T estável a partir de um identificador persistido.
 * Strings já compatíveis são preservadas; UUIDs são compactados sem perdas.
 *
 * @param {unknown} value - Identificador persistido.
 * @param {string} prefix - Prefixo semântico de um caráter.
 * @param {string} field - Caminho técnico.
 * @returns {string} Identificador até 30 carateres.
 */
function compactIdentifier(value, prefix, field) {
    const persisted = String(value ?? "").trim();
    if (/^[^\s^]{1,29}$/.test(persisted)) return `${prefix}${persisted}`;
    if (UUID_PATTERN.test(persisted)) {
        const numeric = BigInt(`0x${persisted.replaceAll("-", "")}`);
        return `${prefix}${numeric.toString(36)}`;
    }
    throw readinessError(field, "identificador persistido não cabe no contrato SAF-T");
}

/**
 * Exige uma coleção carregada explicitamente pelo service.
 *
 * @param {unknown} value - Fonte recebida.
 * @param {string} field - Nome da fonte.
 * @returns {object[]} Coleção validada.
 */
function sourceArray(value, field) {
    if (!Array.isArray(value)) {
        throw readinessError(field, "fonte persistida não foi carregada");
    }
    return value;
}

/**
 * Valida uma morada obrigatória sem preencher país ou códigos em falta.
 *
 * @param {object} entity - Cliente, fornecedor ou perfil.
 * @param {string} prefix - Caminho técnico.
 * @param {string} lineField - Nome do campo de morada.
 * @returns {{ addressDetail: string, city: string, postalCode: string, country: string }} Morada.
 */
function normalizeAddress(entity, prefix, lineField) {
    return {
        addressDetail: requiredText(entity?.[lineField], {
            field: `${prefix}.${lineField}`,
            max: 210,
        }),
        city: requiredText(entity?.city, { field: `${prefix}.city`, max: 50 }),
        postalCode: requiredText(entity?.postalCode, {
            field: `${prefix}.postalCode`,
            max: 20,
        }),
        country: requiredText(entity?.country, {
            field: `${prefix}.country`,
            max: 2,
            pattern: /^[A-Z]{2}$/,
        }),
    };
}

/**
 * Normaliza o perfil usado pelo Header sem deduzir opções fiscais.
 *
 * @param {object} profile - CompanyProfile persistido.
 * @returns {object} Header normalizado.
 */
function normalizeProfile(profile) {
    if (!profile || typeof profile !== "object") {
        throw readinessError("profile", "perfil fiscal não carregado");
    }
    const taxAccountingBasis = requiredText(profile.saftTaxAccountingBasis, {
        field: "profile.saftTaxAccountingBasis",
        max: 1,
    });
    if (!ACCOUNTING_BASES.has(taxAccountingBasis)) {
        throw readinessError("profile.saftTaxAccountingBasis", "base contabilística deve ser C ou I");
    }
    const taxonomyReference = requiredText(profile.saftTaxonomyReference, {
        field: "profile.saftTaxonomyReference",
        max: 1,
    });
    if (!TAXONOMY_REFERENCES.has(taxonomyReference)) {
        throw readinessError("profile.saftTaxonomyReference", "referência de taxonomia inválida");
    }
    if (!Number.isInteger(profile.softwareCertificateNumber) || profile.softwareCertificateNumber < 0) {
        throw readinessError("profile.softwareCertificateNumber", "número de certificado inválido");
    }
    const nif = requiredText(profile.nif, {
        field: "profile.nif",
        min: 9,
        max: 9,
        pattern: /^\d{9}$/,
    });
    return {
        companyId: requiredText(profile.commercialRegistrationNumber, {
            field: "profile.commercialRegistrationNumber",
            max: 50,
            pattern: /^(?:\d{9}|.+ [0-9/]+)$/,
        }),
        nif,
        taxAccountingBasis,
        legalName: requiredText(profile.legalName, { field: "profile.legalName", max: 100 }),
        address: normalizeAddress(profile, "profile", "addressLine1"),
        currency: requiredText(profile.currency, {
            field: "profile.currency",
            min: 3,
            max: 3,
            pattern: /^EUR$/,
        }),
        taxEntity: requiredText(profile.saftTaxEntity, {
            field: "profile.saftTaxEntity",
            max: 20,
        }),
        productCompanyTaxId: requiredText(profile.productCompanyTaxId, {
            field: "profile.productCompanyTaxId",
            max: 30,
        }),
        softwareCertificateNumber: profile.softwareCertificateNumber,
        productId: requiredText(profile.productId, {
            field: "profile.productId",
            min: 3,
            max: 255,
            pattern: /^[^/]+\/[^/]+$/,
        }),
        productVersion: requiredText(profile.productVersion, {
            field: "profile.productVersion",
            max: 30,
        }),
        taxonomyReference,
        specialRegimes: {
            selfBillingIndicator: indicator(
                profile.saftSelfBillingIndicator,
                "profile.saftSelfBillingIndicator",
            ),
            cashVatSchemeIndicator: indicator(
                profile.saftCashVatSchemeIndicator,
                "profile.saftCashVatSchemeIndicator",
            ),
            thirdPartiesBillingIndicator: indicator(
                profile.saftThirdPartiesBillingIndicator,
                "profile.saftThirdPartiesBillingIndicator",
            ),
        },
    };
}

/**
 * Normaliza clientes/fornecedores e exige todos os campos mestres obrigatórios.
 *
 * @param {object} entity - Entidade persistida.
 * @param {"customer" | "supplier"} kind - Tipo de terceiro.
 * @param {number} index - Posição para diagnóstico.
 * @returns {object} Terceiro normalizado.
 */
function normalizeParty(entity, kind, index) {
    const prefix = `${kind}s[${index}]`;
    const customer = kind === "customer";
    return {
        id: compactIdentifier(entity?.id, customer ? "C" : "S", `${prefix}.id`),
        persistedId: String(entity?.id ?? ""),
        accountId: requiredText(entity?.saftAccountId, {
            field: `${prefix}.saftAccountId`,
            min: 2,
            max: 30,
        }),
        taxId: requiredText(entity?.nif, { field: `${prefix}.nif`, max: 30 }),
        companyName: requiredText(entity?.name, { field: `${prefix}.name`, max: 100 }),
        address: normalizeAddress(entity, prefix, "addressLine"),
        email: entity?.email
            ? requiredText(entity.email, { field: `${prefix}.email`, max: 254 })
            : null,
        telephone: entity?.phone
            ? requiredText(entity.phone, { field: `${prefix}.phone`, max: 20 })
            : null,
        selfBillingIndicator: indicator(
            entity?.selfBillingIndicator,
            `${prefix}.selfBillingIndicator`,
        ),
    };
}

/**
 * Normaliza um artigo e aplica apenas o mapping canónico ItemType -> ProductType.
 *
 * @param {object} item - Item persistido.
 * @param {number} index - Posição para diagnóstico.
 * @returns {object} Produto normalizado.
 */
function normalizeProduct(item, index) {
    const prefix = `items[${index}]`;
    const type = ITEM_TYPE_TO_SAFT[item?.type];
    if (!type) throw readinessError(`${prefix}.type`, "ItemType sem mapping SAF-T");
    const code = requiredText(item?.sku, { field: `${prefix}.sku`, max: 60 });
    return {
        persistedId: String(item?.id ?? ""),
        type,
        code,
        description: requiredText(item?.name, {
            field: `${prefix}.name`,
            min: 2,
            max: 200,
        }),
        numberCode: code,
        unitOfMeasure: requiredText(item?.unitOfMeasure, {
            field: `${prefix}.unitOfMeasure`,
            max: 20,
        }),
    };
}

/**
 * Normaliza uma taxa de IVA e aplica o mapping canónico VatRateType -> TaxCode.
 *
 * @param {object} rate - VatRate persistida.
 * @param {number} index - Posição para diagnóstico.
 * @returns {object} Taxa normalizada.
 */
function normalizeTax(rate, index) {
    const prefix = `vatRates[${index}]`;
    const taxCode = VAT_TYPE_TO_SAFT[rate?.type];
    if (!taxCode) throw readinessError(`${prefix}.type`, "VatRateType sem mapping SAF-T");
    if (!Number.isInteger(rate?.rateBps) || rate.rateBps < 0 || rate.rateBps > 10_000) {
        throw readinessError(`${prefix}.rateBps`, "taxa em basis points inválida");
    }
    if (rate.type === "EXEMPT" && rate.rateBps !== 0) {
        throw readinessError(`${prefix}.rateBps`, "taxa isenta tem de ser exatamente zero");
    }
    return {
        persistedId: String(rate?.id ?? ""),
        type: rate.type,
        taxType: "IVA",
        taxCountryRegion: requiredText(rate?.taxCountryRegion, {
            field: `${prefix}.taxCountryRegion`,
            max: 5,
            pattern: /^[A-Z]{2}(?:-(?:AC|MA))?$/,
        }),
        taxCode,
        description: requiredText(rate?.description, {
            field: `${prefix}.description`,
            max: 255,
        }),
        percentage: rate.rateBps / 100,
        exemptionReason: rate.type === "EXEMPT"
            ? requiredText(rate?.exemptionReason, {
                field: `${prefix}.exemptionReason`,
                min: 6,
                max: 60,
            })
            : null,
        exemptionCode: rate.type === "EXEMPT"
            ? requiredText(rate?.exemptionCode, {
                field: `${prefix}.exemptionCode`,
                min: 3,
                max: 3,
                pattern: /^M\d{2}$/,
            })
            : null,
    };
}

/**
 * Normaliza o plano de contas e valida hierarquia/taxonomia XSD.
 *
 * @param {object[]} accounts - Contas persistidas.
 * @returns {object[]} Contas normalizadas.
 */
function normalizeAccounts(accounts) {
    if (accounts.length === 0) {
        throw readinessError("accounts", "plano de contas vazio");
    }
    const codes = new Set(accounts.map((account) => String(account?.code ?? "").trim()));
    return accounts.map((account, index) => {
        const prefix = `accounts[${index}]`;
        const code = requiredText(account?.code, { field: `${prefix}.code`, min: 1, max: 30 });
        const groupingCategory = requiredText(account?.saftGroupingCategory, {
            field: `${prefix}.saftGroupingCategory`,
            min: 2,
            max: 2,
        });
        if (!GROUPING_CATEGORIES.has(groupingCategory)) {
            throw readinessError(`${prefix}.saftGroupingCategory`, "categoria inválida");
        }
        const firstDegree = groupingCategory === "GR" || groupingCategory === "AR";
        const groupingCode = account?.saftGroupingCode == null
            ? null
            : requiredText(account.saftGroupingCode, {
                field: `${prefix}.saftGroupingCode`,
                min: 1,
                max: 30,
            });
        if (
            (firstDegree && groupingCode !== null) ||
            (!firstDegree && (!groupingCode || groupingCode === code || !codes.has(groupingCode)))
        ) {
            throw readinessError(`${prefix}.saftGroupingCode`, "hierarquia contabilística inválida");
        }
        const taxonomyCode = account?.saftTaxonomyCode;
        if (
            (groupingCategory === "GM" &&
                (!Number.isInteger(taxonomyCode) || taxonomyCode < 1 || taxonomyCode > 999)) ||
            (groupingCategory !== "GM" && taxonomyCode != null)
        ) {
            throw readinessError(`${prefix}.saftTaxonomyCode`, "taxonomia incompatível com a conta");
        }
        return {
            persistedId: String(account?.id ?? ""),
            code,
            description: requiredText(account?.name, { field: `${prefix}.name`, max: 100 }),
            groupingCategory,
            groupingCode,
            taxonomyCode: taxonomyCode ?? null,
        };
    });
}

/**
 * Valida linhas contabilísticas usadas no saldo ou no detalhe do período.
 *
 * @param {object[]} entries - Lançamentos carregados.
 * @param {Map<string, object>} accountById - Contas company-scoped.
 * @param {string} sourceName - Nome da fonte.
 * @returns {object[]} Entradas com linhas monetárias normalizadas.
 */
function normalizeAccountingLines(entries, accountById, sourceName) {
    return entries.map((entry, entryIndex) => {
        const lines = sourceArray(entry?.lines, `${sourceName}[${entryIndex}].lines`);
        if (lines.length < 2) {
            throw readinessError(`${sourceName}[${entryIndex}].lines`, "lançamento sem duas linhas");
        }
        return {
            source: entry,
            lines: lines.map((line, lineIndex) => {
                const prefix = `${sourceName}[${entryIndex}].lines[${lineIndex}]`;
                const account = accountById.get(String(line?.accountId ?? line?.account?.id ?? ""));
                if (!account) throw readinessError(`${prefix}.accountId`, "conta não carregada");
                const debitCents = cents(line?.debitCents, `${prefix}.debitCents`);
                const creditCents = cents(line?.creditCents, `${prefix}.creditCents`);
                if ((debitCents > 0) === (creditCents > 0)) {
                    throw readinessError(prefix, "linha deve ter exatamente um lado monetário positivo");
                }
                return {
                    source: line,
                    account,
                    debitCents,
                    creditCents,
                };
            }),
        };
    });
}

/**
 * Determina o período contabilístico relativo ao início fiscal persistido.
 *
 * @param {Date} date - Data do movimento.
 * @param {Date} fiscalStart - Primeiro dia do período exportado.
 * @param {string} field - Caminho técnico.
 * @returns {number} Período 1..12.
 */
function accountingPeriod(date, fiscalStart, field) {
    const value =
        (date.getUTCFullYear() - fiscalStart.getUTCFullYear()) * 12 +
        date.getUTCMonth() - fiscalStart.getUTCMonth() + 1;
    if (value < 1 || value > 12) {
        throw readinessError(field, "movimento fora dos doze períodos contabilísticos exportados");
    }
    return value;
}

/**
 * Obtém o número de arquivo sem inventar uma sequência fiscal.
 *
 * @param {object} entry - Lançamento persistido.
 * @param {string} field - Caminho técnico.
 * @returns {string} Número até 20 carateres.
 */
function archivalNumber(entry, field) {
    if (entry?.saftDocArchivalNumber != null) {
        return requiredText(entry.saftDocArchivalNumber, {
            field: `${field}.saftDocArchivalNumber`,
            max: 20,
            pattern: /^\S+$/,
        });
    }
    return uuidArchivalNumber(entry?.id, `${field}.id`);
}

/**
 * Adiciona um elemento de texto e devolve o nó pai.
 *
 * @param {object} parent - Nó xmlbuilder2.
 * @param {string} name - Nome SAF-T.
 * @param {string | number} value - Conteúdo validado.
 * @returns {object} Nó pai.
 */
function element(parent, name, value) {
    parent.ele(name).txt(String(value)).up();
    return parent;
}

/**
 * Escreve uma morada na ordem rígida do XSD.
 *
 * @param {object} parent - Nó da morada.
 * @param {object} address - Morada normalizada.
 * @returns {void}
 */
function appendAddress(parent, address) {
    element(parent, "AddressDetail", address.addressDetail);
    element(parent, "City", address.city);
    element(parent, "PostalCode", address.postalCode);
    element(parent, "Country", address.country);
}

/**
 * Exige uma ligação contabilística única e reconcilia data e total bruto do
 * documento com o lançamento persistido. O gerador não tenta deduzir ou criar
 * lançamentos em falta.
 *
 * @param {Map<string, object>} transactionBySource - Lançamentos do período.
 * @param {"SALE" | "PURCHASE"} source - Origem contabilística esperada.
 * @param {object} document - Documento definitivo persistido.
 * @param {string} prefix - Caminho técnico seguro.
 * @param {Date} documentDate - Data fiscal validada do documento.
 * @param {number} grossCents - Total bruto reconciliado das linhas.
 * @returns {object} Transação SAF-T associada.
 */
function requireDocumentPosting(
    transactionBySource,
    source,
    document,
    prefix,
    documentDate,
    grossCents,
) {
    const transaction = transactionBySource.get(`${source}:${String(document?.id ?? "")}`);
    if (!transaction) {
        throw readinessError(
            `${prefix}.journalEntry`,
            "documento definitivo sem lançamento contabilístico associado",
        );
    }
    if (dateOnly(transaction.date) !== dateOnly(documentDate)) {
        throw readinessError(
            `${prefix}.journalEntry.entryDate`,
            "data do lançamento diverge da data do documento",
        );
    }
    if (
        transaction.totalDebitCents !== grossCents ||
        transaction.totalCreditCents !== grossCents
    ) {
        throw readinessError(
            `${prefix}.journalEntry.lines`,
            "total contabilístico não reconcilia com o total bruto do documento",
        );
    }
    return transaction;
}

/**
 * Resume documentos reconciliados por tipo sem depender da ordem de chegada.
 *
 * @param {object[]} documents - Documentos normalizados.
 * @returns {Record<string, object>} Totais por tipo em ordem lexical estável.
 */
function summarizeDocumentsByType(documents) {
    const summaries = new Map();
    for (const document of documents) {
        const current = summaries.get(document.documentType) ?? {
            numberOfEntries: 0,
            netCents: 0,
            vatCents: 0,
            grossCents: 0,
            ledgerDebitCents: 0,
            ledgerCreditCents: 0,
        };
        current.numberOfEntries += 1;
        current.netCents += document.netCents;
        current.vatCents += document.vatCents;
        current.grossCents += document.grossCents;
        current.ledgerDebitCents += document.transaction.totalDebitCents;
        current.ledgerCreditCents += document.transaction.totalCreditCents;
        summaries.set(document.documentType, current);
    }
    return Object.fromEntries([...summaries.entries()].sort(([left], [right]) =>
        left.localeCompare(right, "en")));
}

/**
 * Constrói e reconcilia o snapshot interno antes de serializar XML.
 *
 * @param {{ sources: object, fiscalPeriod: object, createdAt?: Date | string }} input - Snapshot persistido.
 * @returns {object} Modelo SAF-T normalizado e reconciliação determinística.
 */
function normalizeSnapshot({ sources, fiscalPeriod, createdAt = new Date() }) {
    const startDate = requiredDate(fiscalPeriod?.startDate, "fiscalPeriod.startDate");
    const endDate = requiredDate(fiscalPeriod?.endDate, "fiscalPeriod.endDate");
    if (endDate < startDate) throw readinessError("fiscalPeriod", "intervalo invertido");
    if (
        !Number.isInteger(fiscalPeriod?.fiscalYear) ||
        fiscalPeriod.fiscalYear < 1900 ||
        fiscalPeriod.fiscalYear > 9999
    ) {
        throw readinessError(
            "fiscalPeriod.fiscalYear",
            "exercício fiscal explícito não persistido",
        );
    }
    const creationDate = requiredDate(createdAt, "createdAt");
    const profile = normalizeProfile(sources?.profile);
    const accounts = normalizeAccounts(sourceArray(sources?.accounts, "accounts"));
    const accountById = new Map(accounts.map((account) => [account.persistedId, account]));
    const customers = sourceArray(sources?.customers, "customers").map((value, index) =>
        normalizeParty(value, "customer", index));
    const suppliers = sourceArray(sources?.suppliers, "suppliers").map((value, index) =>
        normalizeParty(value, "supplier", index));
    const accountCodes = new Set(accounts.map((account) => account.code));
    for (const [kind, parties] of [["customers", customers], ["suppliers", suppliers]]) {
        for (const [index, party] of parties.entries()) {
            if (!accountCodes.has(party.accountId)) {
                throw readinessError(
                    `${kind}[${index}].saftAccountId`,
                    "conta SAF-T não existe no plano carregado",
                );
            }
        }
    }
    const products = sourceArray(sources?.items, "items").map(normalizeProduct);
    const taxes = sourceArray(sources?.vatRates, "vatRates").map(normalizeTax);
    const customerById = new Map(customers.map((value) => [value.persistedId, value]));
    const supplierById = new Map(suppliers.map((value) => [value.persistedId, value]));
    const productById = new Map(products.map((value) => [value.persistedId, value]));
    const taxById = new Map(taxes.map((value) => [value.persistedId, value]));
    const saleDocuments = sourceArray(sources?.saleDocuments, "saleDocuments");
    const purchaseDocuments = sourceArray(sources?.purchaseDocuments, "purchaseDocuments");
    const purchaseById = new Map(purchaseDocuments.map((value) => [String(value.id), value]));
    const saleById = new Map(saleDocuments.map((value) => [String(value.id), value]));

    const openingEntries = normalizeAccountingLines(
        sourceArray(sources?.openingJournalEntries, "openingJournalEntries"),
        accountById,
        "openingJournalEntries",
    );
    const currentEntries = normalizeAccountingLines(
        sourceArray(sources?.journalEntries, "journalEntries"),
        accountById,
        "journalEntries",
    );
    const balances = new Map(accounts.map((account) => [account.code, {
        openingDebit: 0,
        openingCredit: 0,
        currentDebit: 0,
        currentCredit: 0,
    }]));
    for (const entry of openingEntries) {
        for (const line of entry.lines) {
            const balance = balances.get(line.account.code);
            balance.openingDebit += line.debitCents;
            balance.openingCredit += line.creditCents;
        }
    }
    for (const entry of currentEntries) {
        for (const line of entry.lines) {
            const balance = balances.get(line.account.code);
            balance.currentDebit += line.debitCents;
            balance.currentCredit += line.creditCents;
        }
    }
    for (const account of accounts) {
        const balance = balances.get(account.code);
        const openingNet = balance.openingDebit - balance.openingCredit;
        const closingNet = openingNet + balance.currentDebit - balance.currentCredit;
        Object.assign(account, {
            openingDebitCents: Math.max(openingNet, 0),
            openingCreditCents: Math.max(-openingNet, 0),
            closingDebitCents: Math.max(closingNet, 0),
            closingCreditCents: Math.max(-closingNet, 0),
        });
    }

    const journals = new Map(Object.entries(JOURNAL_METADATA).map(([source, metadata]) => [
        source,
        { ...metadata, transactions: [] },
    ]));
    let ledgerDebitCents = 0;
    let ledgerCreditCents = 0;
    const transactionBySource = new Map();
    for (const [index, normalizedEntry] of currentEntries.entries()) {
        const entry = normalizedEntry.source;
        const prefix = `journalEntries[${index}]`;
        const journal = journals.get(entry?.source);
        if (!journal) throw readinessError(`${prefix}.source`, "JournalSource sem mapping SAF-T");
        const transactionDate = requiredDate(entry?.entryDate, `${prefix}.entryDate`);
        const archival = archivalNumber(entry, prefix);
        const transactionType = entry.source === "MANUAL"
            ? requiredText(entry?.saftTransactionType, {
                field: `${prefix}.saftTransactionType`,
                max: 1,
            })
            : "N";
        if (!MANUAL_TRANSACTION_TYPES.has(transactionType)) {
            throw readinessError(`${prefix}.saftTransactionType`, "TransactionType inválido");
        }
        const sourceId = compactIdentifier(entry?.createdById, "U", `${prefix}.createdById`);
        const systemEntryDate = requiredDate(entry?.createdAt, `${prefix}.createdAt`);
        const debitLines = normalizedEntry.lines.filter((line) => line.debitCents > 0);
        const creditLines = normalizedEntry.lines.filter((line) => line.creditCents > 0);
        const totalDebitCents = debitLines.reduce((sum, line) => sum + line.debitCents, 0);
        const totalCreditCents = creditLines.reduce((sum, line) => sum + line.creditCents, 0);
        if (debitLines.length === 0 || creditLines.length === 0 || totalDebitCents !== totalCreditCents) {
            throw readinessError(prefix, "lançamento contabilístico não está balanceado");
        }
        const transactionId = `${dateOnly(transactionDate)} ${journal.id} ${archival}`;
        const sale = entry.source === "SALE" ? saleById.get(String(entry.sourceId)) : null;
        const purchase = entry.source === "PURCHASE"
            ? purchaseById.get(String(entry.sourceId))
            : null;
        if (entry.source === "SALE" && !sale) {
            throw readinessError(
                `${prefix}.sourceId`,
                "lançamento SALE sem documento definitivo no período",
            );
        }
        if (entry.source === "PURCHASE" && !purchase) {
            throw readinessError(
                `${prefix}.sourceId`,
                "lançamento PURCHASE sem documento definitivo no período",
            );
        }
        const party = sale
            ? customerById.get(String(sale.customerId))
            : purchase
                ? supplierById.get(String(purchase.supplierId))
                : null;
        if ((sale || purchase) && !party) {
            throw readinessError(`${prefix}.sourceId`, "terceiro do documento de origem não carregado");
        }
        const transaction = {
            id: transactionId,
            period: accountingPeriod(transactionDate, startDate, `${prefix}.entryDate`),
            date: transactionDate,
            sourceId,
            description: requiredText(entry?.description, {
                field: `${prefix}.description`,
                max: 200,
            }),
            archival,
            transactionType,
            postingDate: transactionDate,
            systemEntryDate,
            party: party ? { kind: sale ? "customer" : "supplier", id: party.id } : null,
            debitLines,
            creditLines,
            totalDebitCents,
            totalCreditCents,
            sourceType: entry.source,
            sourceDocumentId: String(entry.sourceId ?? ""),
        };
        journal.transactions.push(transaction);
        if (entry.source === "SALE" || entry.source === "PURCHASE") {
            const sourceKey = `${entry.source}:${entry.sourceId}`;
            if (transactionBySource.has(sourceKey)) {
                throw readinessError(
                    `${prefix}.sourceId`,
                    "mais de um lançamento associado ao mesmo documento",
                );
            }
            transactionBySource.set(sourceKey, transaction);
        }
        ledgerDebitCents += totalDebitCents;
        ledgerCreditCents += totalCreditCents;
    }
    if (ledgerDebitCents !== ledgerCreditCents) {
        throw readinessError("journalEntries", "totais globais de débito e crédito divergem");
    }

    const invoices = saleDocuments.map((document, documentIndex) => {
        const prefix = `saleDocuments[${documentIndex}]`;
        const invoiceType = SALE_KIND_TO_SAFT[document?.kind];
        if (!invoiceType) throw readinessError(`${prefix}.kind`, "SaleDocumentKind sem mapping SAF-T");
        if (document?.status !== "ISSUED" && document?.status !== "SETTLED") {
            throw readinessError(`${prefix}.status`, "documento não definitivo no snapshot");
        }
        const customer = customerById.get(String(document?.customerId ?? document?.customer?.id ?? ""));
        if (!customer) throw readinessError(`${prefix}.customerId`, "cliente não carregado");
        const documentLines = sourceArray(document?.lines, `${prefix}.lines`);
        if (documentLines.length === 0) throw readinessError(`${prefix}.lines`, "fatura sem linhas");
        let lineNetCents = 0;
        let lineVatCents = 0;
        let lineGrossCents = 0;
        const lines = documentLines.map((line, lineIndex) => {
            const linePrefix = `${prefix}.lines[${lineIndex}]`;
            const product = productById.get(String(line?.itemId ?? line?.item?.id ?? ""));
            const tax = taxById.get(String(line?.vatRateId ?? line?.vatRate?.id ?? ""));
            if (!product) throw readinessError(`${linePrefix}.itemId`, "produto não carregado");
            if (!tax) throw readinessError(`${linePrefix}.vatRateId`, "taxa não carregada");
            const subtotalCents = cents(line?.subtotalCents, `${linePrefix}.subtotalCents`);
            const vatCents = cents(line?.vatCents, `${linePrefix}.vatCents`);
            const totalCents = cents(line?.totalCents, `${linePrefix}.totalCents`);
            if (subtotalCents + vatCents !== totalCents) {
                throw readinessError(linePrefix, "subtotal + IVA não coincide com o total da linha");
            }
            if (tax.type === "EXEMPT" && vatCents !== 0) {
                throw readinessError(`${linePrefix}.vatCents`, "linha isenta contém IVA");
            }
            lineNetCents += subtotalCents;
            lineVatCents += vatCents;
            lineGrossCents += totalCents;
            return {
                lineNumber: lineIndex + 1,
                product,
                quantity: quantity(line?.quantity, `${linePrefix}.quantity`),
                unitPriceCents: cents(line?.unitPriceCents, `${linePrefix}.unitPriceCents`),
                taxPointDate: requiredDate(document?.issuedAt, `${prefix}.issuedAt`),
                description: requiredText(line?.description, {
                    field: `${linePrefix}.description`,
                    max: 200,
                }),
                amountCents: subtotalCents,
                tax,
            };
        });
        const netCents = cents(document?.subtotalCents, `${prefix}.subtotalCents`);
        const vatCents = cents(document?.vatCents, `${prefix}.vatCents`);
        const grossCents = cents(document?.totalCents, `${prefix}.totalCents`);
        if (
            netCents + vatCents !== grossCents ||
            lineNetCents !== netCents ||
            lineVatCents !== vatCents ||
            lineGrossCents !== grossCents
        ) {
            throw readinessError(prefix, "totais persistidos não reconciliam com as linhas");
        }
        const issuedAt = requiredDate(document?.issuedAt, `${prefix}.issuedAt`);
        const systemEntryDate = requiredDate(document?.createdAt, `${prefix}.createdAt`);
        const statusDate = requiredDate(
            document?.issuedDefinitiveAt,
            `${prefix}.issuedDefinitiveAt`,
        );
        const number = requiredText(document?.number, {
            field: `${prefix}.number`,
            max: 60,
            pattern: /^[^ ]+ [^/^ ]+\/\d+$/,
        });
        if (!number.startsWith(`${invoiceType} `)) {
            throw readinessError(
                `${prefix}.number`,
                "prefixo fiscal não corresponde ao tipo do documento",
            );
        }
        const transaction = requireDocumentPosting(
            transactionBySource,
            "SALE",
            document,
            prefix,
            issuedAt,
            grossCents,
        );
        return {
            persistedId: String(document?.id ?? ""),
            number,
            atcud: requiredText(document?.atcud, { field: `${prefix}.atcud`, max: 100 }),
            status: "N",
            statusDate,
            sourceId: compactIdentifier(
                document?.issuedById ?? document?.createdById,
                "U",
                `${prefix}.issuedById`,
            ),
            hash: requiredText(document?.saftHash, { field: `${prefix}.saftHash`, max: 172 }),
            hashControl: requiredText(document?.saftHashControl, {
                field: `${prefix}.saftHashControl`,
                max: 70,
            }),
            period: accountingPeriod(issuedAt, startDate, `${prefix}.issuedAt`),
            date: issuedAt,
            invoiceType,
            specialRegimes: profile.specialRegimes,
            systemEntryDate,
            transactionId: transaction.id,
            transaction,
            documentType: invoiceType,
            customerId: customer.id,
            lines,
            netCents,
            vatCents,
            grossCents,
            direction: document.kind === "CREDIT_NOTE" ? "DEBIT" : "CREDIT",
        };
    });
    const salesDebitCents = invoices
        .filter((invoice) => invoice.direction === "DEBIT")
        .reduce((sum, invoice) => sum + invoice.grossCents, 0);
    const salesCreditCents = invoices
        .filter((invoice) => invoice.direction === "CREDIT")
        .reduce((sum, invoice) => sum + invoice.grossCents, 0);

    const reconciledPurchases = purchaseDocuments.map((document, documentIndex) => {
        const prefix = `purchaseDocuments[${documentIndex}]`;
        if (document?.status !== "POSTED" && document?.status !== "PAID") {
            throw readinessError(`${prefix}.status`, "documento não definitivo no snapshot");
        }
        if (
            document?.kind !== "SUPPLIER_INVOICE" &&
            document?.kind !== "SUPPLIER_CREDIT_NOTE"
        ) {
            throw readinessError(`${prefix}.kind`, "PurchaseDocumentKind sem mapping SAF-T");
        }
        const supplier = supplierById.get(
            String(document?.supplierId ?? document?.supplier?.id ?? ""),
        );
        if (!supplier) throw readinessError(`${prefix}.supplierId`, "fornecedor não carregado");
        const documentLines = sourceArray(document?.lines, `${prefix}.lines`);
        if (documentLines.length === 0) {
            throw readinessError(`${prefix}.lines`, "documento de compra sem linhas");
        }
        let lineNetCents = 0;
        let lineVatCents = 0;
        let lineGrossCents = 0;
        for (const [lineIndex, line] of documentLines.entries()) {
            const linePrefix = `${prefix}.lines[${lineIndex}]`;
            const product = productById.get(String(line?.itemId ?? line?.item?.id ?? ""));
            const tax = taxById.get(String(line?.vatRateId ?? line?.vatRate?.id ?? ""));
            if (!product) throw readinessError(`${linePrefix}.itemId`, "produto não carregado");
            if (!tax) throw readinessError(`${linePrefix}.vatRateId`, "taxa não carregada");
            quantity(line?.quantity, `${linePrefix}.quantity`);
            cents(line?.unitCostCents, `${linePrefix}.unitCostCents`);
            const subtotalCents = cents(line?.subtotalCents, `${linePrefix}.subtotalCents`);
            const vatCents = cents(line?.vatCents, `${linePrefix}.vatCents`);
            const totalCents = cents(line?.totalCents, `${linePrefix}.totalCents`);
            if (subtotalCents + vatCents !== totalCents) {
                throw readinessError(linePrefix, "subtotal + IVA não coincide com o total da linha");
            }
            if (tax.type === "EXEMPT" && vatCents !== 0) {
                throw readinessError(`${linePrefix}.vatCents`, "linha isenta contém IVA");
            }
            lineNetCents += subtotalCents;
            lineVatCents += vatCents;
            lineGrossCents += totalCents;
        }
        const netCents = cents(document?.subtotalCents, `${prefix}.subtotalCents`);
        const vatCents = cents(document?.vatCents, `${prefix}.vatCents`);
        const grossCents = cents(document?.totalCents, `${prefix}.totalCents`);
        if (
            netCents + vatCents !== grossCents ||
            lineNetCents !== netCents ||
            lineVatCents !== vatCents ||
            lineGrossCents !== grossCents
        ) {
            throw readinessError(prefix, "totais persistidos não reconciliam com as linhas");
        }
        const issuedAt = requiredDate(document?.issuedAt, `${prefix}.issuedAt`);
        const transaction = requireDocumentPosting(
            transactionBySource,
            "PURCHASE",
            document,
            prefix,
            issuedAt,
            grossCents,
        );
        return {
            persistedId: String(document?.id ?? ""),
            number: requiredText(document?.supplierNumber, {
                field: `${prefix}.supplierNumber`,
                max: 60,
            }),
            documentType: document.kind,
            direction: document.kind === "SUPPLIER_CREDIT_NOTE" ? "CREDIT" : "DEBIT",
            netCents,
            vatCents,
            grossCents,
            transaction,
        };
    });

    const reconciliation = {
        version: SAFT_VERSION,
        generalLedger: {
            numberOfEntries: currentEntries.length,
            totalDebitCents: ledgerDebitCents,
            totalCreditCents: ledgerCreditCents,
            transactions: [...journals.values()].flatMap((journal) =>
                journal.transactions.map((transaction) => ({
                    transactionId: transaction.id,
                    sourceType: transaction.sourceType,
                    sourceDocumentId: transaction.sourceDocumentId,
                    totalDebitCents: transaction.totalDebitCents,
                    totalCreditCents: transaction.totalCreditCents,
                }))),
        },
        salesInvoices: {
            numberOfEntries: invoices.length,
            totalDebitCents: salesDebitCents,
            totalCreditCents: salesCreditCents,
            byType: summarizeDocumentsByType(invoices),
            documents: invoices.map((invoice) => ({
                invoiceNo: invoice.number,
                documentType: invoice.documentType,
                direction: invoice.direction,
                netCents: invoice.netCents,
                vatCents: invoice.vatCents,
                grossCents: invoice.grossCents,
                transactionId: invoice.transaction.id,
                ledgerDebitCents: invoice.transaction.totalDebitCents,
                ledgerCreditCents: invoice.transaction.totalCreditCents,
            })),
        },
        purchases: {
            numberOfEntries: reconciledPurchases.length,
            totalNetCents: reconciledPurchases.reduce(
                (sum, document) => sum + document.netCents,
                0,
            ),
            totalVatCents: reconciledPurchases.reduce(
                (sum, document) => sum + document.vatCents,
                0,
            ),
            totalGrossCents: reconciledPurchases.reduce(
                (sum, document) => sum + document.grossCents,
                0,
            ),
            byType: summarizeDocumentsByType(reconciledPurchases),
            documents: reconciledPurchases.map((document) => ({
                supplierDocumentNo: document.number,
                documentType: document.documentType,
                direction: document.direction,
                netCents: document.netCents,
                vatCents: document.vatCents,
                grossCents: document.grossCents,
                transactionId: document.transaction.id,
                ledgerDebitCents: document.transaction.totalDebitCents,
                ledgerCreditCents: document.transaction.totalCreditCents,
            })),
        },
    };
    return {
        profile,
        fiscalPeriod: { startDate, endDate, fiscalYear: fiscalPeriod.fiscalYear },
        creationDate,
        accounts,
        customers,
        suppliers,
        products,
        taxes,
        journals: [...journals.values()].filter((journal) => journal.transactions.length > 0),
        ledger: {
            numberOfEntries: currentEntries.length,
            totalDebitCents: ledgerDebitCents,
            totalCreditCents: ledgerCreditCents,
        },
        invoices,
        sales: {
            numberOfEntries: invoices.length,
            totalDebitCents: salesDebitCents,
            totalCreditCents: salesCreditCents,
        },
        reconciliation,
    };
}

/**
 * Serializa o modelo normalizado na ordem exata do XSD 1.04_01.
 *
 * @param {object} model - Snapshot normalizado.
 * @returns {string} XML Unicode antes da codificação Windows-1252.
 */
function buildXml(model) {
    const root = create({ version: "1.0", encoding: "Windows-1252" })
        .ele(SAFT_NAMESPACE, "AuditFile");
    const header = root.ele("Header");
    element(header, "AuditFileVersion", SAFT_VERSION);
    element(header, "CompanyID", model.profile.companyId);
    element(header, "TaxRegistrationNumber", model.profile.nif);
    element(header, "TaxAccountingBasis", model.profile.taxAccountingBasis);
    element(header, "CompanyName", model.profile.legalName);
    const companyAddress = header.ele("CompanyAddress");
    appendAddress(companyAddress, model.profile.address);
    companyAddress.up();
    element(header, "FiscalYear", model.fiscalPeriod.fiscalYear);
    element(header, "StartDate", dateOnly(model.fiscalPeriod.startDate));
    element(header, "EndDate", dateOnly(model.fiscalPeriod.endDate));
    element(header, "CurrencyCode", model.profile.currency);
    element(header, "DateCreated", dateOnly(model.creationDate));
    element(header, "TaxEntity", model.profile.taxEntity);
    element(header, "ProductCompanyTaxID", model.profile.productCompanyTaxId);
    element(header, "SoftwareCertificateNumber", model.profile.softwareCertificateNumber);
    element(header, "ProductID", model.profile.productId);
    element(header, "ProductVersion", model.profile.productVersion);
    header.up();

    const masterFiles = root.ele("MasterFiles");
    const ledgerAccounts = masterFiles.ele("GeneralLedgerAccounts");
    element(ledgerAccounts, "TaxonomyReference", model.profile.taxonomyReference);
    for (const account of model.accounts) {
        const node = ledgerAccounts.ele("Account");
        element(node, "AccountID", account.code);
        element(node, "AccountDescription", account.description);
        element(node, "OpeningDebitBalance", money(account.openingDebitCents));
        element(node, "OpeningCreditBalance", money(account.openingCreditCents));
        element(node, "ClosingDebitBalance", money(account.closingDebitCents));
        element(node, "ClosingCreditBalance", money(account.closingCreditCents));
        element(node, "GroupingCategory", account.groupingCategory);
        if (account.groupingCode) element(node, "GroupingCode", account.groupingCode);
        if (account.taxonomyCode != null) element(node, "TaxonomyCode", account.taxonomyCode);
        node.up();
    }
    ledgerAccounts.up();
    for (const customer of model.customers) {
        const node = masterFiles.ele("Customer");
        element(node, "CustomerID", customer.id);
        element(node, "AccountID", customer.accountId);
        element(node, "CustomerTaxID", customer.taxId);
        element(node, "CompanyName", customer.companyName);
        const address = node.ele("BillingAddress");
        appendAddress(address, customer.address);
        address.up();
        if (customer.telephone) element(node, "Telephone", customer.telephone);
        if (customer.email) element(node, "Email", customer.email);
        element(node, "SelfBillingIndicator", customer.selfBillingIndicator);
        node.up();
    }
    for (const supplier of model.suppliers) {
        const node = masterFiles.ele("Supplier");
        element(node, "SupplierID", supplier.id);
        element(node, "AccountID", supplier.accountId);
        element(node, "SupplierTaxID", supplier.taxId);
        element(node, "CompanyName", supplier.companyName);
        const address = node.ele("BillingAddress");
        appendAddress(address, supplier.address);
        address.up();
        if (supplier.telephone) element(node, "Telephone", supplier.telephone);
        if (supplier.email) element(node, "Email", supplier.email);
        element(node, "SelfBillingIndicator", supplier.selfBillingIndicator);
        node.up();
    }
    for (const product of model.products) {
        const node = masterFiles.ele("Product");
        element(node, "ProductType", product.type);
        element(node, "ProductCode", product.code);
        element(node, "ProductDescription", product.description);
        element(node, "ProductNumberCode", product.numberCode);
        node.up();
    }
    if (model.taxes.length > 0) {
        const taxTable = masterFiles.ele("TaxTable");
        for (const tax of model.taxes) {
            const node = taxTable.ele("TaxTableEntry");
            element(node, "TaxType", tax.taxType);
            element(node, "TaxCountryRegion", tax.taxCountryRegion);
            element(node, "TaxCode", tax.taxCode);
            element(node, "Description", tax.description);
            element(node, "TaxPercentage", tax.percentage);
            node.up();
        }
        taxTable.up();
    }
    masterFiles.up();

    const ledgerEntries = root.ele("GeneralLedgerEntries");
    element(ledgerEntries, "NumberOfEntries", model.ledger.numberOfEntries);
    element(ledgerEntries, "TotalDebit", money(model.ledger.totalDebitCents));
    element(ledgerEntries, "TotalCredit", money(model.ledger.totalCreditCents));
    for (const journal of model.journals) {
        const journalNode = ledgerEntries.ele("Journal");
        element(journalNode, "JournalID", journal.id);
        element(journalNode, "Description", journal.description);
        for (const transaction of journal.transactions) {
            const transactionNode = journalNode.ele("Transaction");
            element(transactionNode, "TransactionID", transaction.id);
            element(transactionNode, "Period", transaction.period);
            element(transactionNode, "TransactionDate", dateOnly(transaction.date));
            element(transactionNode, "SourceID", transaction.sourceId);
            element(transactionNode, "Description", transaction.description);
            element(transactionNode, "DocArchivalNumber", transaction.archival);
            element(transactionNode, "TransactionType", transaction.transactionType);
            element(transactionNode, "GLPostingDate", dateOnly(transaction.postingDate));
            if (transaction.party?.kind === "customer") {
                element(transactionNode, "CustomerID", transaction.party.id);
            } else if (transaction.party?.kind === "supplier") {
                element(transactionNode, "SupplierID", transaction.party.id);
            }
            const linesNode = transactionNode.ele("Lines");
            for (const [index, line] of transaction.debitLines.entries()) {
                const lineNode = linesNode.ele("DebitLine");
                element(lineNode, "RecordID", String(index + 1));
                element(lineNode, "AccountID", line.account.code);
                element(lineNode, "SystemEntryDate", dateTime(transaction.systemEntryDate));
                element(lineNode, "Description", transaction.description);
                element(lineNode, "DebitAmount", money(line.debitCents));
                lineNode.up();
            }
            for (const [index, line] of transaction.creditLines.entries()) {
                const lineNode = linesNode.ele("CreditLine");
                element(lineNode, "RecordID", String(transaction.debitLines.length + index + 1));
                element(lineNode, "AccountID", line.account.code);
                element(lineNode, "SystemEntryDate", dateTime(transaction.systemEntryDate));
                element(lineNode, "Description", transaction.description);
                element(lineNode, "CreditAmount", money(line.creditCents));
                lineNode.up();
            }
            linesNode.up();
            transactionNode.up();
        }
        journalNode.up();
    }
    ledgerEntries.up();

    const sourceDocuments = root.ele("SourceDocuments");
    const salesInvoices = sourceDocuments.ele("SalesInvoices");
    element(salesInvoices, "NumberOfEntries", model.sales.numberOfEntries);
    element(salesInvoices, "TotalDebit", money(model.sales.totalDebitCents));
    element(salesInvoices, "TotalCredit", money(model.sales.totalCreditCents));
    for (const invoice of model.invoices) {
        const invoiceNode = salesInvoices.ele("Invoice");
        element(invoiceNode, "InvoiceNo", invoice.number);
        element(invoiceNode, "ATCUD", invoice.atcud);
        const status = invoiceNode.ele("DocumentStatus");
        element(status, "InvoiceStatus", invoice.status);
        element(status, "InvoiceStatusDate", dateTime(invoice.statusDate));
        element(status, "SourceID", invoice.sourceId);
        element(status, "SourceBilling", "P");
        status.up();
        element(invoiceNode, "Hash", invoice.hash);
        element(invoiceNode, "HashControl", invoice.hashControl);
        element(invoiceNode, "Period", invoice.period);
        element(invoiceNode, "InvoiceDate", dateOnly(invoice.date));
        element(invoiceNode, "InvoiceType", invoice.invoiceType);
        const regimes = invoiceNode.ele("SpecialRegimes");
        element(regimes, "SelfBillingIndicator", invoice.specialRegimes.selfBillingIndicator);
        element(regimes, "CashVATSchemeIndicator", invoice.specialRegimes.cashVatSchemeIndicator);
        element(
            regimes,
            "ThirdPartiesBillingIndicator",
            invoice.specialRegimes.thirdPartiesBillingIndicator,
        );
        regimes.up();
        element(invoiceNode, "SourceID", invoice.sourceId);
        element(invoiceNode, "SystemEntryDate", dateTime(invoice.systemEntryDate));
        if (invoice.transactionId) element(invoiceNode, "TransactionID", invoice.transactionId);
        element(invoiceNode, "CustomerID", invoice.customerId);
        for (const line of invoice.lines) {
            const lineNode = invoiceNode.ele("Line");
            element(lineNode, "LineNumber", line.lineNumber);
            element(lineNode, "ProductCode", line.product.code);
            element(lineNode, "ProductDescription", line.product.description);
            element(lineNode, "Quantity", line.quantity);
            element(lineNode, "UnitOfMeasure", line.product.unitOfMeasure);
            element(lineNode, "UnitPrice", money(line.unitPriceCents));
            element(lineNode, "TaxPointDate", dateOnly(line.taxPointDate));
            element(lineNode, "Description", line.description);
            element(
                lineNode,
                invoice.direction === "DEBIT" ? "DebitAmount" : "CreditAmount",
                money(line.amountCents),
            );
            const taxNode = lineNode.ele("Tax");
            element(taxNode, "TaxType", line.tax.taxType);
            element(taxNode, "TaxCountryRegion", line.tax.taxCountryRegion);
            element(taxNode, "TaxCode", line.tax.taxCode);
            element(taxNode, "TaxPercentage", line.tax.percentage);
            taxNode.up();
            if (line.tax.type === "EXEMPT") {
                element(lineNode, "TaxExemptionReason", line.tax.exemptionReason);
                element(lineNode, "TaxExemptionCode", line.tax.exemptionCode);
            }
            lineNode.up();
        }
        const totals = invoiceNode.ele("DocumentTotals");
        element(totals, "TaxPayable", money(invoice.vatCents));
        element(totals, "NetTotal", money(invoice.netCents));
        element(totals, "GrossTotal", money(invoice.grossCents));
        totals.up();
        invoiceNode.up();
    }
    salesInvoices.up();
    sourceDocuments.up();
    return root.end({ prettyPrint: false });
}

/**
 * Gera internamente os bytes SAF-T e a prova de reconciliação do snapshot.
 *
 * A função não valida o XSD nem substitui a revisão externa; apenas produz o
 * único artefacto que pode ser entregue a essas fronteiras.
 *
 * @param {{ sources: object, fiscalPeriod: object, createdAt?: Date | string }} input - Snapshot.
 * @returns {{ artifact: Buffer, artifactSha256: string, reconciliation: object, reconciliationSha256: string }} Resultado interno.
 */
export function generateInternalSaft(input) {
    const model = normalizeSnapshot(input);
    const reconciliationBytes = Buffer.from(JSON.stringify(model.reconciliation), "utf8");
    const reconciliationSha256 = sha256Bytes(reconciliationBytes);
    const xml = buildXml(model);
    const artifact = iconvLite.encode(xml, SAFT_ENCODING);
    const roundTrip = iconvLite.decode(artifact, SAFT_ENCODING);
    if (roundTrip !== xml) {
        throw readinessError("artifact", `XML não representável em ${SAFT_ENCODING}`);
    }
    return {
        artifact,
        artifactSha256: sha256Bytes(artifact),
        reconciliation: model.reconciliation,
        reconciliationSha256,
    };
}
