/**
 * @file Smoke textual do BK-MF6-07.
 */

import { readFileSync } from "node:fs";

const cookieHelper = readFileSync("src/modules/auth/sessionCookie.js", "utf8");

for (const required of ["httpOnly: true", "secure: isProduction", "sameSite: \"lax\"", "path: \"/\""]) {
    if (!cookieHelper.includes(required)) {
        throw new Error(`Falta atributo de cookie: ${required}`);
    }
}

// Login e logout devem usar a mesma base de opções para evitar cookies presos.
if (!cookieHelper.includes("buildSessionCookieOptions")) {
    throw new Error("Falta helper central de opções do cookie.");
}