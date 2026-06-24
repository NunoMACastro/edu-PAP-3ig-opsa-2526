/**
 * @file Scanner textual do BK-MF6-09.
 */

import { readFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const checkedFiles = [
    "src/config/env.js",
    "src/server.js",
    ".env.example",
];

for (const file of checkedFiles) {
    const content = readFileSync(file, "utf8");
    if (content.includes("LIVE_VALUE_DO_NOT_COMMIT")) {
        throw new Error(`Valor real detetado em ${file}`);
    }
}

function listJavaScriptFiles(directory) {
    return readdirSync(directory)
        .flatMap((entry) => {
            const fullPath = join(directory, entry);
            if (statSync(fullPath).isDirectory()) {
                return listJavaScriptFiles(fullPath);
            }

            return fullPath.endsWith(".js") ? [fullPath] : [];
        });
}

const sourceFiles = listJavaScriptFiles("src");
for (const file of sourceFiles) {
    const content = readFileSync(file, "utf8");
    if (content.includes("sk_live_") || content.includes("pk_live_")) {
        throw new Error(`Credencial provável no código: ${file}`);
    }
}