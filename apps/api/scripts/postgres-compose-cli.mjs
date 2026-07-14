/**
 * @file Executor das ferramentas PostgreSQL através do serviço Compose local.
 *
 * O adapter mantém passwords apenas no ambiente do processo Docker, traduz
 * exclusivamente endpoints loopback conhecidos e monta apenas o diretório do
 * dump. Não recebe nem constrói URLs de ligação nos argumentos públicos.
 */

import { spawnSync } from "node:child_process";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const COMPOSE_FILE = fileURLToPath(
    new URL("../../compose.yaml", import.meta.url),
);
const TOOLS_SERVICE = "postgres-tools";
const CONTAINER_BACKUP_DIR = "/backup";
const ENDPOINTS = new Map([
    ["5433", { host: "postgres", port: "5432" }],
    ["5435", { host: "postgres-restore", port: "5432" }],
]);
const SUPPORTED_TOOLS = new Set(["pg_dump", "pg_restore", "psql"]);

/**
 * Mantém os artefactos do bind mount pertencentes ao utilizador do host em
 * Docker Linux rootful. Plataformas sem UID/GID POSIX preservam o default.
 *
 * @returns {string | null} Identidade `uid:gid` ou `null` quando indisponível.
 */
function resolveHostContainerUser() {
    if (typeof process.getuid !== "function" || typeof process.getgid !== "function") {
        return null;
    }
    return `${process.getuid()}:${process.getgid()}`;
}

/**
 * Obtém o índice do valor de uma opção CLI no formato `--flag value`.
 *
 * @param {string[]} args - Argumentos PostgreSQL.
 * @param {string} flag - Flag procurada.
 * @returns {number} Índice do valor ou -1.
 */
function optionValueIndex(args, flag) {
    const flagIndex = args.indexOf(flag);
    return flagIndex >= 0 ? flagIndex + 1 : -1;
}

/**
 * Traduz apenas endpoints do Compose conhecidos e rejeita rede remota.
 *
 * @param {string[]} args - Argumentos PostgreSQL sem segredos.
 * @returns {string[]} Cópia com host e porto internos.
 */
function translateConnection(args) {
    const translated = [...args];
    const hostIndex = optionValueIndex(translated, "--host");
    const portIndex = optionValueIndex(translated, "--port");

    // Chamadas `--version` não abrem ligações e usam o mesmo tools image.
    if (hostIndex < 0 && portIndex < 0) return translated;
    if (
        hostIndex <= 0 ||
        portIndex <= 0 ||
        hostIndex >= translated.length ||
        portIndex >= translated.length
    ) {
        throw new Error("Argumentos PostgreSQL incompletos para modo Compose.");
    }

    const host = translated[hostIndex];
    const port = translated[portIndex];
    if (host !== "127.0.0.1" || !ENDPOINTS.has(port)) {
        throw new Error(
            "Modo Compose aceita apenas PostgreSQL local em 127.0.0.1 nas portas 5433 e 5435.",
        );
    }

    const endpoint = ENDPOINTS.get(port);
    translated[hostIndex] = endpoint.host;
    translated[portIndex] = endpoint.port;
    return translated;
}

/**
 * Traduz o único caminho de dump e produz o bind mount mínimo necessário.
 *
 * @param {string} tool - Ferramenta PostgreSQL.
 * @param {string[]} args - Argumentos já traduzidos para a rede Compose.
 * @returns {{ args: string[], volumeArgs: string[] }} Argumentos e volume Docker.
 */
function translateDumpPath(tool, args) {
    const translated = [...args];
    let dumpIndex = -1;
    let readOnly = false;

    if (tool === "pg_dump") {
        dumpIndex = optionValueIndex(translated, "--file");
    } else if (tool === "pg_restore" && !translated.includes("--version")) {
        dumpIndex = translated.length - 1;
        readOnly = true;
    }

    if (dumpIndex < 0) return { args: translated, volumeArgs: [] };
    const dumpPath = translated[dumpIndex];
    if (
        typeof dumpPath !== "string" ||
        !dumpPath.trim() ||
        /[\u0000-\u001f\u007f]/.test(dumpPath)
    ) {
        throw new Error("Caminho de dump inválido para modo Compose.");
    }

    const absoluteDumpPath = resolve(dumpPath);
    const dumpDirectory = dirname(absoluteDumpPath);
    if (dumpDirectory.includes(":")) {
        throw new Error("Diretório de dump incompatível com bind mount Compose.");
    }
    translated[dumpIndex] = `${CONTAINER_BACKUP_DIR}/${basename(absoluteDumpPath)}`;
    return {
        args: translated,
        volumeArgs: [
            "--volume",
            `${dumpDirectory}:${CONTAINER_BACKUP_DIR}${readOnly ? ":ro" : ""}`,
        ],
    };
}

/**
 * Cria um runner compatível com `spawnSync` que executa no tools container.
 *
 * @param {object} [options] - Dependências injetáveis.
 * @param {typeof spawnSync} [options.runCommand] - Executor Docker.
 * @param {string} [options.composeFile] - Compose file, útil em testes.
 * @param {string | null} [options.containerUser] - UID/GID aplicado ao tools container.
 * @returns {typeof spawnSync} Runner PostgreSQL seguro.
 */
export function createPostgresComposeRunner({
    runCommand = spawnSync,
    composeFile = COMPOSE_FILE,
    containerUser = resolveHostContainerUser(),
} = {}) {
    const absoluteComposeFile = resolve(composeFile);
    if (containerUser !== null && !/^\d+:\d+$/.test(containerUser)) {
        throw new Error("Utilizador do tools container inválido.");
    }

    return function runPostgresTool(tool, args = [], options = {}) {
        if (!SUPPORTED_TOOLS.has(tool)) {
            throw new Error(`Ferramenta PostgreSQL não suportada: ${tool}.`);
        }
        if (!Array.isArray(args)) {
            throw new TypeError("Os argumentos PostgreSQL têm de ser uma lista.");
        }
        const connectionArgs = translateConnection(args);
        const translated = translateDumpPath(tool, connectionArgs);
        const environment = options.env ?? process.env;
        const needsConnection = !args.includes("--version");
        if (
            needsConnection &&
            (typeof environment.PGPASSWORD !== "string" ||
                environment.PGPASSWORD.length === 0)
        ) {
            throw new Error("PGPASSWORD é obrigatória para PostgreSQL via Compose.");
        }

        const forwardedEnvironment = needsConnection
            ? ["--env", "PGPASSWORD"]
            : [];
        if (
            needsConnection &&
            typeof environment.PGSSLMODE === "string" &&
            environment.PGSSLMODE
        ) {
            forwardedEnvironment.push("--env", "PGSSLMODE");
        }
        return runCommand(
            "docker",
            [
                "compose",
                "-f",
                absoluteComposeFile,
                "--profile",
                "tools",
                "run",
                "--rm",
                "--no-deps",
                ...(containerUser ? ["--user", containerUser] : []),
                ...forwardedEnvironment,
                ...translated.volumeArgs,
                TOOLS_SERVICE,
                tool,
                ...translated.args,
            ],
            {
                ...options,
                env: environment,
            },
        );
    };
}

export const POSTGRES_COMPOSE_DEFAULTS = Object.freeze({
    composeFile: COMPOSE_FILE,
    toolsService: TOOLS_SERVICE,
    backupDirectory: CONTAINER_BACKUP_DIR,
});
