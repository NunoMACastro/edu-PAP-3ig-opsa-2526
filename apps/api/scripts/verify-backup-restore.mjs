// apps/api/scripts/verify-backup-restore.mjs
/**
 * @file Verifica se um backup PostgreSQL pode ser lido por pg_restore.
 */

import { spawnSync } from "node:child_process";
import { access, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

/**
 * Lê o caminho do backup a partir de --file ou da variável OPSA_BACKUP_FILE.
 *
 * @param {string[]} args - Argumentos recebidos pela linha de comandos.
 * @param {NodeJS.ProcessEnv} env - Variáveis de ambiente disponíveis.
 * @returns {string} Caminho absoluto do ficheiro de backup.
 * @throws {Error} Quando o caminho não foi indicado.
 */
function resolveBackupFile(args = process.argv.slice(2), env = process.env) {
  const fileFlagIndex = args.indexOf("--file");
  const selectedFile = fileFlagIndex >= 0 ? args[fileFlagIndex + 1] : env.OPSA_BACKUP_FILE;

  if (!selectedFile) {
    throw new Error("Indica o backup com --file <ficheiro> ou OPSA_BACKUP_FILE");
  }

  return resolve(selectedFile);
}

/**
 * Confirma que o ficheiro existe e tem conteúdo.
 *
 * @param {string} backupPath - Caminho absoluto do ficheiro de backup.
 * @returns {Promise<number>} Tamanho do ficheiro em bytes.
 * @throws {Error} Quando o ficheiro não existe ou está vazio.
 */
async function assertReadableBackupFile(backupPath) {
  try {
    await access(backupPath);
  } catch {
    throw new Error("Backup não encontrado: indica um ficheiro .dump existente");
  }

  const backupInfo = await stat(backupPath);

  if (backupInfo.size === 0) {
    throw new Error("Backup inválido: ficheiro vazio");
  }

  return backupInfo.size;
}

/**
 * Lista o conteúdo do backup com pg_restore sem repor dados.
 *
 * @param {string} backupPath - Caminho absoluto do ficheiro de backup.
 * @returns {string[]} Entradas do catálogo do dump.
 * @throws {Error} Quando pg_restore não consegue ler o ficheiro.
 */
function listRestoreCatalog(backupPath) {
  // --list valida a estrutura do dump sem escrever numa base de dados real.
  const result = spawnSync("pg_restore", ["--list", backupPath], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.error) {
    throw new Error("pg_restore não arrancou. Confirma se a ferramenta PostgreSQL está instalada.");
  }

  if (result.status !== 0) {
    throw new Error("Backup inválido: pg_restore não conseguiu listar o ficheiro");
  }

  const entries = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith(";"));

  if (entries.length === 0) {
    throw new Error("Backup inválido: catálogo sem entradas restauráveis");
  }

  return entries;
}

/**
 * Verifica um backup já criado e devolve evidence segura para PR ou defesa.
 *
 * @param {object} options - Configuração opcional para execução local ou teste.
 * @param {string[]} [options.args] - Argumentos da linha de comandos.
 * @param {NodeJS.ProcessEnv} [options.env] - Variáveis de ambiente.
 * @returns {Promise<object>} Evidence de leitura do backup.
 * @throws {Error} Quando falta ficheiro, o ficheiro está vazio ou pg_restore falha.
 */
export async function verifyBackupRestore({ args = process.argv.slice(2), env = process.env } = {}) {
  const backupPath = resolveBackupFile(args, env);
  const sizeBytes = await assertReadableBackupFile(backupPath);
  const restoreEntries = listRestoreCatalog(backupPath);

  // A evidence usa basename para não publicar caminhos locais completos do aluno.
  return {
    file: basename(backupPath),
    sizeBytes,
    checkedAt: new Date().toISOString(),
    restorable: true,
    catalogEntries: restoreEntries.length,
    check: "pg_restore --list",
  };
}

if (import.meta.url === "file://" + process.argv[1]) {
  verifyBackupRestore()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}