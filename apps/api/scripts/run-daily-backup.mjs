/**
 * @file Cria um backup PostgreSQL com manifesto verificavel para BK-MF7-01.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnvFile } from "../src/config/envFile.js";

const DEFAULT_BACKUP_DIR = "./backups";

/**
 * Calcula o hash SHA-256 de um ficheiro sem o carregar todo para memoria.
 *
 * @param {string} filePath - Caminho do ficheiro de backup.
 * @returns {Promise<string>} Hash hexadecimal do ficheiro.
 */
async function sha256(filePath) {
    const hash = createHash("sha256");

    for await (const chunk of createReadStream(filePath)) {
        hash.update(chunk);
    }

    return hash.digest("hex");
}

/**
 * Confirma que uma ferramenta PostgreSQL terminou com sucesso.
 *
 * @param {ReturnType<typeof spawnSync>} result - Resultado devolvido pelo Node.
 * @param {string} commandName - Nome do comando executado.
 * @returns {void}
 * @throws {Error} Quando a ferramenta nao existe ou termina com erro.
 */
function assertCommandSucceeded(result, commandName) {
    if (result.error) {
        throw new Error(
            `${commandName} nao arrancou. Confirma se a ferramenta PostgreSQL esta instalada.`,
        );
    }

    if (result.status !== 0) {
        throw new Error(
            `${commandName} terminou com erro. Confirma DATABASE_URL, permissoes e ligacao a base de dados.`,
        );
    }
}

/**
 * Executa pg_dump em formato custom e grava um manifesto seguro.
 *
 * @param {object} options - Configuracao opcional para execucao local ou testes.
 * @param {string} [options.backupDir] - Pasta onde o dump e o manifesto sao gravados.
 * @param {string} [options.databaseUrl] - URL PostgreSQL lido do ambiente.
 * @param {Date} [options.now] - Data usada para gerar o nome do ficheiro.
 * @returns {Promise<object>} Manifesto do backup criado.
 * @throws {Error} Quando falta configuracao, pg_dump falha ou o ficheiro fica vazio.
 */
export async function runDailyBackup({
    backupDir = process.env.OPSA_BACKUP_DIR ?? DEFAULT_BACKUP_DIR,
    databaseUrl = process.env.DATABASE_URL,
    now = new Date(),
} = {}) {
    if (!databaseUrl) {
        throw new Error("DATABASE_URL em falta para executar backup");
    }

    await mkdir(backupDir, { recursive: true });

    const stamp = now.toISOString().replaceAll(":", "-");
    const backupPath = join(backupDir, `opsa-${stamp}.dump`);

    const result = spawnSync(
        "pg_dump",
        ["--format=custom", "--no-owner", "--file", backupPath, databaseUrl],
        {
            encoding: "utf8",
            stdio: "pipe",
        },
    );

    assertCommandSucceeded(result, "pg_dump");

    const backupInfo = await stat(backupPath);
    if (backupInfo.size === 0) {
        throw new Error("Backup falhou: ficheiro gerado sem conteudo");
    }

    const manifest = {
        file: basename(backupPath),
        sizeBytes: backupInfo.size,
        createdAt: new Date().toISOString(),
        engine: "postgresql-pg_dump-custom",
        sha256: await sha256(backupPath),
    };

    // O manifesto nunca inclui DATABASE_URL, caminhos absolutos nem conteudo financeiro.
    await writeFile(`${backupPath}.json`, JSON.stringify(manifest, null, 2));
    return manifest;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    loadLocalEnvFile();

    runDailyBackup()
        .then((manifest) => console.log(JSON.stringify(manifest, null, 2)))
        .catch((error) => {
            console.error(error.message);
            process.exitCode = 1;
        });
}
