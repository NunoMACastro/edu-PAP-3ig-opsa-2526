/**
 * @file Smoke unitario do BK-MF6-05.
 */

import assert from "node:assert/strict";
import {
    applyStrictTransportSecurity,
    enforceHttps,
} from "../src/modules/security/transportSecurity.js";

function createResponse() {
    return {
        statusCode: null,
        payload: null,
        headers: {},
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.payload = payload;
            return this;
        },
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
