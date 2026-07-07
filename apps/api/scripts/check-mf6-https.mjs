/**
 * @file Smoke unitario do BK-MF6-05.
 */

import assert from "node:assert/strict";
import {
    applyStrictTransportSecurity,
    enforceHttps,
} from "../src/modules/security/transportSecurity.js";

/**
 * Cria uma resposta Express mínima para validar HTTPS/HSTS sem servidor real.
 * O double regista status, payload e headers para os asserts inspecionarem o resultado.
 *
 * @returns {{ statusCode: number | null, payload: unknown, headers: Record<string, string>, status: Function, json: Function, set: Function }} Resposta simulada.
 */
function createResponse() {
    return {
        statusCode: null,
        payload: null,
        headers: {},
        /**
         * Guarda o status HTTP definido pelo middleware e permite chaining.
         *
         * @param {number} code - Código HTTP recebido pelo middleware.
         * @returns {object} A própria resposta simulada.
         */
        status(code) {
            this.statusCode = code;
            return this;
        },
        /**
         * Guarda o payload JSON enviado pelo middleware e permite chaining.
         *
         * @param {unknown} payload - Corpo JSON devolvido pelo middleware.
         * @returns {object} A própria resposta simulada.
         */
        json(payload) {
            this.payload = payload;
            return this;
        },
        /**
         * Guarda um header definido pelo middleware de transporte seguro.
         *
         * @param {string} key - Nome do header HTTP.
         * @param {string} value - Valor do header HTTP.
         * @returns {object} A própria resposta simulada.
         */
        set(key, value) {
            this.headers[key] = value;
            return this;
        },
    };
}

const blockedRes = createResponse();
let nextCalled = false;
enforceHttps({ isProduction: true })(
    { secure: false, headers: { "x-forwarded-proto": "http" } },
    blockedRes,
    () => {
        nextCalled = true;
    },
);
assert.equal(blockedRes.statusCode, 403);
assert.equal(blockedRes.payload.error, "HTTPS_REQUIRED");
assert.equal(nextCalled, false);

const secureRes = createResponse();
enforceHttps({ isProduction: true })(
    { secure: false, headers: { "x-forwarded-proto": "https" } },
    secureRes,
    () => {
        nextCalled = true;
    },
);
assert.equal(nextCalled, true);

applyStrictTransportSecurity({ isProduction: true })({}, secureRes, () => {});
assert.match(
    secureRes.headers["Strict-Transport-Security"],
    /max-age=31536000/,
);

console.info("MF6 HTTPS transport contract OK");
