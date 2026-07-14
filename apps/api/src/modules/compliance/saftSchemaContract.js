/**
 * @file Contrato imutável do XSD oficial SAF-T PT 1.04_01.
 */

import { createHash } from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";

export const SAFT_VERSION = "1.04_01";
export const SAFT_NAMESPACE =
    "urn:OECD:StandardAuditFile-Tax:PT_1.04_01";
export const SAFT_ENCODING = "Windows-1252";
export const OFFICIAL_SAFT_XSD_SHA256 =
    "292c0ab4611e3f5a0cdf2abb4e62d9bd41254dc2e76a1fae4d35a8b132d79350";

/**
 * Calcula o SHA-256 hexadecimal de bytes em memória.
 *
 * @param {Buffer | Uint8Array} bytes - Conteúdo a identificar.
 * @returns {string} Hash hexadecimal.
 */
export function sha256Bytes(bytes) {
    return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Confirma que o schema fornecido pelo ambiente é exatamente o contrato AT
 * observado na baseline. O erro não inclui caminhos locais nem conteúdo.
 *
 * @param {Buffer} xsdBuffer - XSD carregado a partir de `SAFT_XSD_PATH`.
 * @returns {{ sha256: string, version: string, namespace: string }} Identidade aprovada.
 */
export function assertOfficialSaftSchema(xsdBuffer) {
    if (!Buffer.isBuffer(xsdBuffer) || xsdBuffer.length === 0) {
        throw httpError(503, "SAFT_XSD_REQUIRED", "XSD oficial SAF-T indisponível.");
    }
    const sha256 = sha256Bytes(xsdBuffer);
    if (sha256 !== OFFICIAL_SAFT_XSD_SHA256) {
        throw httpError(
            503,
            "SAFT_XSD_FINGERPRINT_MISMATCH",
            "O fingerprint do XSD SAF-T não corresponde à baseline aprovada.",
        );
    }
    const source = xsdBuffer.toString("latin1");
    if (
        !source.includes(`version="${SAFT_VERSION}"`) ||
        !source.includes(`targetNamespace="${SAFT_NAMESPACE}"`) ||
        !source.includes('encoding="Windows-1252"')
    ) {
        throw httpError(
            503,
            "SAFT_XSD_CONTRACT_MISMATCH",
            "O XSD não declara a versão, namespace e encoding esperados.",
        );
    }
    return { sha256, version: SAFT_VERSION, namespace: SAFT_NAMESPACE };
}

/**
 * Bloqueia qualquer exportação enquanto a feature flag não for explicitamente
 * verdadeira. Não existe fallback para o exportador MVP anterior.
 *
 * @param {unknown} value - Valor de `SAFT_EXPORT_ENABLED`.
 * @returns {void}
 */
export function assertSaftExportEnabled(value) {
    if (String(value ?? "").trim().toLowerCase() !== "true") {
        throw httpError(
            503,
            "SAFT_EXPORT_DISABLED",
            "A exportação SAF-T está desativada até concluir validação XSD e revisão externa.",
        );
    }
}
