/**
 * @file Smoke unitario do BK-MF6-07.
 */

import assert from "node:assert/strict";
import {
    buildSessionCookieOptions,
    COOKIE_NAME,
    SESSION_MAX_AGE_MS,
} from "../src/modules/auth/sessionCookie.js";

assert.equal(COOKIE_NAME, "sid");
assert.equal(SESSION_MAX_AGE_MS, 8 * 60 * 60 * 1000);

const devOptions = buildSessionCookieOptions(false);
assert.equal(devOptions.httpOnly, true);
assert.equal(devOptions.secure, false);
assert.equal(devOptions.sameSite, "lax");

const prodOptions = buildSessionCookieOptions(true);
assert.equal(prodOptions.httpOnly, true);
assert.equal(prodOptions.secure, true);
assert.equal(prodOptions.sameSite, "lax");
assert.equal(prodOptions.path, "/");

console.info("MF6 session cookie contract OK");
