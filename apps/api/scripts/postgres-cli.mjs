/**
 * @file Helpers seguros para validar e invocar ferramentas PostgreSQL.
 */

import { spawnSync } from "node:child_process";
import { createPostgresComposeRunner } from "./postgres-compose-cli.mjs";

const DISPOSABLE_DATABASE_TOKEN = /(?:^|[_-])(restore|test|audit|ci|demo)(?:[_-]|$)/i;

/**
 * Seleciona explicitamente ferramentas nativas ou o tools container local.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente.
 * @returns {"native" | "compose"} Modo validado.
 */
export function resolvePostgresCliMode(env = process.env) {
    const mode = String(env.OPSA_POSTGRES_CLI_MODE ?? "native")
        .trim()
        .toLowerCase();
    if (!new Set(["native", "compose"]).has(mode)) {
        throw new Error(
            "OPSA_POSTGRES_CLI_MODE deve ser native ou compose.",
        );
    }
    return mode;
}

/**
 * Constrói o runner PostgreSQL sem fallback implícito entre modos.
 *
 * @param {object} [options] - Configuração e dependências.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [options.env] - Ambiente.
 * @param {typeof spawnSync} [options.runCommand] - Executor nativo/Docker.
 * @param {"local" | "remote"} [options.backupMode] - Percurso selecionado.
 * @param {string} [options.composeFile] - Compose file injetável.
 * @returns {typeof spawnSync} Runner compatível com os scripts existentes.
 */
export function createPostgresCommandRunner({
    env = process.env,
    runCommand = spawnSync,
    backupMode = "local",
    composeFile,
} = {}) {
    const cliMode = resolvePostgresCliMode(env);
    if (cliMode === "native") return runCommand;
    if (backupMode !== "local") {
        throw new Error(
            "PostgreSQL via Compose está limitado ao backup local; o modo remoto exige ferramentas nativas.",
        );
    }
    return createPostgresComposeRunner({ runCommand, composeFile });
}

/**
 * Confirma antecipadamente que os binários PostgreSQL necessários estão no PATH.
 * O preflight não recebe ligações nem credenciais.
 *
 * @param {string[]} tools - Executáveis exigidos pela fase atual.
 * @param {typeof spawnSync} [runCommand] - Executor injetável para testes unitários.
 * @returns {void}
 * @throws {Error} Quando uma ferramenta não existe ou não pode ser executada.
 */
export function assertPostgresToolsAvailable(tools, runCommand = spawnSync) {
    for (const tool of [...new Set(tools)]) {
        const result = runCommand(tool, ["--version"], {
            encoding: "utf8",
            stdio: "pipe",
        });
        if (result?.error?.code === "ENOENT") {
            throw new Error(
                `Ferramenta PostgreSQL em falta: ${tool}. Instala os PostgreSQL client tools e confirma o PATH.`,
            );
        }
        if (result?.error || result?.status !== 0) {
            throw new Error(
                `Preflight PostgreSQL falhou para ${tool}. Confirma a instalação e o PATH.`,
            );
        }
    }
}

/**
 * Valida uma URL PostgreSQL e separa os argumentos públicos da password.
 *
 * @param {string} value - URL PostgreSQL recebida exclusivamente por variável de ambiente.
 * @returns {{ args: string[], env: NodeJS.ProcessEnv, databaseName: string, host: string }} Ligação pronta para `spawnSync`.
 */
export function postgresCliConnection(value) {
    let url;
    try {
        url = new URL(value);
    } catch {
        throw new Error("URL PostgreSQL inválida");
    }

    if (!["postgres:", "postgresql:"].includes(url.protocol)) {
        throw new Error("A ligação deve usar postgres:// ou postgresql://");
    }

    const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
    const username = decodeURIComponent(url.username);
    if (
        !url.hostname ||
        !databaseName ||
        !username ||
        /[\u0000-\u001f\u007f]/.test(`${url.hostname}${databaseName}${username}`)
    ) {
        throw new Error("Ligação PostgreSQL sem host, utilizador ou base de dados");
    }

    const args = [
        "--host",
        url.hostname,
        "--port",
        url.port || "5432",
        "--username",
        username,
        "--dbname",
        databaseName,
    ];
    const env = {
        ...process.env,
        PGPASSWORD: decodeURIComponent(url.password),
        PGSSLMODE: url.searchParams.get("sslmode") ?? process.env.PGSSLMODE,
    };

    return { args, env, databaseName, host: url.hostname };
}

/**
 * Impede que o verificador destrua uma base que não esteja identificada como descartável.
 *
 * @param {string} databaseName - Nome extraído de `RESTORE_DATABASE_URL`.
 * @returns {void}
 */
export function assertDisposableRestoreDatabase(databaseName) {
    if (!DISPOSABLE_DATABASE_TOKEN.test(databaseName)) {
        throw new Error(
            "RESTORE_DATABASE_URL deve apontar para uma base descartável com um token restore, test, audit, ci ou demo delimitado por _ ou -",
        );
    }
}
