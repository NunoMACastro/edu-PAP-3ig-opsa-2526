/**
 * @file Carregamento opcional de variaveis locais da API OPSA.
 *
 * Este modulo permite que `npm run dev` use um ficheiro `.env` local sem
 * codificar segredos no repositório. Em ambientes geridos, as variaveis podem
 * continuar a ser injetadas diretamente pelo processo.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Carrega `.env` local quando o ficheiro existe.
 *
 * @param {string} envFilePath - Caminho do ficheiro de ambiente.
 * @returns {boolean} `true` quando o ficheiro foi carregado.
 */
export function loadLocalEnvFile(envFilePath = resolve(".env")) {
    if (!existsSync(envFilePath)) {
        return false;
    }

    if (typeof process.loadEnvFile !== "function") {
        throw new Error(
            "Ficheiro .env encontrado, mas esta versao do Node.js nao suporta process.loadEnvFile().",
        );
    }

    process.loadEnvFile(envFilePath);
    return true;
}
