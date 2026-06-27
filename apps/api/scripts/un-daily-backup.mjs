// apps/api/scripts/run-daily-backup.mjs
/**
 * @file Cria um backup diário PostgreSQL com manifesto verificável.
 */

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_BACKUP_DIR = "./backups";

/**
 * Calcula o hash SHA-256 do ficheiro gerado.
 *
 * @param {string} filePath - Caminho do backup físico.
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
 * Confirma que um comando externo terminou com sucesso.
 *
 * @param {ReturnType<typeof spawnSync>} result - Resultado devolvido pelo Node.
 * @param {string} commandName - Nome do comando executado.
 * @returns {void}
 * @throws {Error} Quando o comando não existe ou termina com erro.
 */
function assertCommandSucceeded(result, commandName) {
  if (result.error) {
    throw new Error(commandName + " não arrancou. Confirma se a ferramenta PostgreSQL está instalada.");
  }

  if (result.status !== 0) {
    throw new Error(commandName + " terminou com erro. Confirma DATABASE_URL, permissões e ligação à base de dados.");
  }
}

/**
 * Executa pg_dump sem passar pela shell para evitar injeção em argumentos.
 *
 * @param {object} options - Configuração opcional usada por testes ou smokes locais.
 * @param {string} [options.backupDir] - Pasta onde o dump e o manifesto serão gravados.
 * @param {string} [options.databaseUrl] - URL PostgreSQL lido do ambiente.
 * @param {Date} [options.now] - Data usada para gerar o nome do ficheiro.
 * @returns {Promise<object>} Manifesto do backup criado.
 * @throws {Error} Quando falta configuração, o dump falha ou o ficheiro fica vazio.
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
  const backupPath = join(backupDir, "opsa-" + stamp + ".dump");

  // O URL da base de dados fica apenas no processo; nunca é escrito no manifesto nem na evidence.
  const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--file", backupPath, databaseUrl], {
    encoding: "utf8",
    stdio: "pipe",
  });

  assertCommandSucceeded(result, "pg_dump");

  const backupInfo = await stat(backupPath);
  if (backupInfo.size === 0) {
    throw new Error("Backup falhou: ficheiro gerado sem conteúdo");
  }

  // O hash permite detetar corrupção acidental antes de confiar no ficheiro para retenção ou restauro.
  const manifest = {
    file: basename(backupPath),
    sizeBytes: backupInfo.size,
    createdAt: new Date().toISOString(),
    engine: "postgresql-pg_dump-custom",
    sha256: await sha256(backupPath),
  };
  await writeFile(backupPath + ".json", JSON.stringify(manifest, null, 2));
  return manifest;
}

if (import.meta.url === "file://" + process.argv[1]) {
  runDailyBackup()
    .then((manifest) => console.log(JSON.stringify(manifest, null, 2)))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}