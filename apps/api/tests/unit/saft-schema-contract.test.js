/**
 * @file Testes do feature gate e fingerprint SAF-T oficial.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
    OFFICIAL_SAFT_XSD_SHA256,
    assertOfficialSaftSchema,
    assertSaftExportEnabled,
    sha256Bytes,
} from "../../src/modules/compliance/saftSchemaContract.js";

test("export SAF-T fica desativado por omissão", () => {
    assert.throws(() => assertSaftExportEnabled(undefined), {
        code: "SAFT_EXPORT_DISABLED",
    });
    assert.doesNotThrow(() => assertSaftExportEnabled("true"));
});

test("XSD adulterado é rejeitado pelo fingerprint", () => {
    assert.throws(
        () =>
            assertOfficialSaftSchema(
                Buffer.from(
                    '<?xml version="1.0" encoding="Windows-1252"?><xs:schema version="1.04_01" targetNamespace="urn:OECD:StandardAuditFile-Tax:PT_1.04_01"/>',
                ),
            ),
        { code: "SAFT_XSD_FINGERPRINT_MISMATCH" },
    );
});

test("manifest documenta o hash oficial fechado", async () => {
    const manifest = await readFile(
        new URL("../../resources/saft/OFFICIAL-XSD.md", import.meta.url),
        "utf8",
    );
    assert.match(manifest, new RegExp(OFFICIAL_SAFT_XSD_SHA256));
    assert.equal(sha256Bytes(Buffer.from("SAF-T")).length, 64);
});
