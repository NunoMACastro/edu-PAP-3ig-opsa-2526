/**
 * @file Smoke unitario do BK-MF6-08.
 */

import assert from "node:assert/strict";
import {
    escapeHtml,
    requireTrustedOrigin,
} from "../src/modules/security/requestHardening.js";

function createResponse() {
    return {
        statusCode: null,
        payload: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.payload = payload;
            return this;
        },
    };
}

let nextCalls = 0;
const middleware = requireTrustedOrigin({
    appBaseUrl: "https://opsa.example.test/app",
    isProduction: true,
});

const blocked = createResponse();
middleware(
    { method: "POST", headers: { origin: "https://evil.example.test" } },
    blocked,
    () => {
        nextCalls += 1;
    },
);
assert.equal(blocked.statusCode, 403);
assert.equal(blocked.payload.error, "UNTRUSTED_ORIGIN");

const allowed = createResponse();
middleware(
    { method: "POST", headers: { origin: "https://opsa.example.test" } },
    allowed,
    () => {
        nextCalls += 1;
    },
);
assert.equal(nextCalls, 1);

middleware({ method: "GET", headers: {} }, createResponse(), () => {
    nextCalls += 1;
});
assert.equal(nextCalls, 2);
assert.equal(escapeHtml("<b>OPSA</b>"), "&lt;b&gt;OPSA&lt;/b&gt;");

console.info("MF6 request hardening contract OK");
