/**
 * @file Verifica se um backup PostgreSQL pode ser lido por pg_restore.
 */

import { spawnSync } from "node:child_process";
import { access, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolve o ficheiro de backup indicado por --file ou OPSA_BACKUP_FILE.
 *
 * @param {string[]} args - Argumentos recebidos pela linha de comandos.
 * @param {NodeJS.ProcessEnv} env - Variaveis de ambiente disponiveis.
 * @returns {string} Caminho absoluto do ficheiro de backup.
 * @throws {Error} Quando o caminho nao foi indicado.
 */
function resolveBackupFile(args = process.argv.slice(2), env = process.env) {
    const fileFlagIndex = args.indexOf("--file");
    const selectedFile =
        fileFlagIndex >= 0 ? args[fileFlagIndex + 1] : env.OPSA_BACKUP_FILE;

    if (!selectedFile) {
        throw new Error("Indica o backup com --file <ficheiro> ou OPSA_BACKUP_FILE");
    }

    return resolve(selectedFile);
}

/**
 * Confirma que o ficheiro existe e tem conteudo.
 *
 * @param {string} backupPath - Caminho absoluto do ficheiro de backup.
 * @returns {Promise<number>} Tamanho do ficheiro em bytes.
 * @throws {Error} Quando o ficheiro nao existe ou esta vazio.
 */
async function assertReadableBackupFile(backupPath) {
    try {
        await access(backupPath);
    } catch {
        throw new Error("Backup nao encontrado: indica um ficheiro .dump existente");
    }

    const backupInfo = await stat(backupPath);
    if (backupInfo.size === 0) {
        throw new Error("Backup invalido: ficheiro vazio");
    }

    return backupInfo.size;
}

/**
 * Lista o catalogo interno do dump sem restaurar dados numa base real.
 *
 * @param {string} backupPath - Caminho absoluto do ficheiro de backup.
 * @returns {string[]} Entradas restauraveis do catalogo.
 * @throws {Error} Quando pg_restore nao consegue ler o ficheiro.
 */
function listRestoreCatalog(backupPath) {
    const result = spawnSync("pg_restore", ["--list", backupPath], {
        encoding: "utf8",
        stdio: "pipe",
    });

    if (result.error) {
        throw new Error(
            "pg_restore nao arrancou. Confirma se a ferramenta PostgreSQL esta instalada.",
        );
    }

    if (result.status !== 0) {
        throw new Error("Backup invalido: pg_restore nao conseguiu listar o ficheiro");
    }

    const entries = result.stdout
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith(";"));

    if (entries.length === 0) {
        throw new Error("Backup invalido: catalogo sem entradas restauraveis");
    }

    return entries;
}

/**
 * Verifica um backup ja criado e devolve evidence segura.
 *
 * @param {object} options - Configuracao opcional para execucao local ou teste.
 * @param {string[]} [options.args] - Argumentos da linha de comandos.
 * @param {NodeJS.ProcessEnv} [options.env] - Variaveis de ambiente.
 * @returns {Promise<object>} Evidence de leitura do backup.
 * @throws {Error} Quando falta ficheiro, o ficheiro esta vazio ou pg_restore falha.
 */
export async function verifyBackupRestore({
    args = process.argv.slice(2),
    env = process.env,
} = {}) {
    const backupPath = resolveBackupFile(args, env);
    const sizeBytes = await assertReadableBackupFile(backupPath);
    const restoreEntries = listRestoreCatalog(backupPath);

    // A evidence usa apenas basename para nao publicar caminhos locais privados.
    return {
        file: basename(backupPath),
        sizeBytes,
        checkedAt: new Date().toISOString(),
        restorable: true,
        catalogEntries: restoreEntries.length,
        check: "pg_restore --list",
    };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    verifyBackupRestore()
        .then((result) => console.log(JSON.stringify(result, null, 2)))
        .catch((error) => {
            console.error(error.message);
            process.exitCode = 1;
        });
}
