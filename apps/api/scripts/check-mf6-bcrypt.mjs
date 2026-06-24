/**
 * @file Smoke textual do BK-MF6-06.
 */

import { readFileSync } from "node:fs";

const passwordModule = readFileSync("src/modules/auth/password.js", "utf8");
const authService = readFileSync("src/modules/auth/authService.js", "utf8");
const resetService = readFileSync("src/modules/auth/passwordResetService.js", "utf8");

if (!passwordModule.includes("bcrypt.hash")) {
    throw new Error("Falta hash bcrypt.");
}

if (!passwordModule.includes("BCRYPT_ROUNDS = 12")) {
    throw new Error("Custo bcrypt inferior ao contrato do BK.");
}

// Registo e reset têm de reutilizar a mesma política de hash.
for (const [name, content] of [["auth", authService], ["reset", resetService]]) {
    if (!content.includes("hashPassword")) {
        throw new Error(`Fluxo ${name} não usa hashPassword.`);
    }
}