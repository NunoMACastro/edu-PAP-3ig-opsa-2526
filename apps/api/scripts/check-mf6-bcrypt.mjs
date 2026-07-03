/**
 * @file Smoke unitario do BK-MF6-06.
 */

import assert from "node:assert/strict";
import {
    BCRYPT_ROUNDS,
    hashPassword,
    verifyPassword,
} from "../src/modules/auth/password.js";

assert.equal(BCRYPT_ROUNDS >= 12, true);

const hash = await hashPassword("Password-Forte-123!");
assert.match(hash, /^\$2[aby]\$/);
assert.equal(hash.includes("Password-Forte-123!"), false);
assert.equal(await verifyPassword("Password-Forte-123!", hash), true);
assert.equal(await verifyPassword("outra-password", hash), false);

console.info("MF6 bcrypt contract OK");
