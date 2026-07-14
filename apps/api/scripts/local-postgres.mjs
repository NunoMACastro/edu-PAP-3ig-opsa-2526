/**
 * @file Gestor seguro das instâncias PostgreSQL locais definidas no Compose.
 *
 * Uso: `node scripts/local-postgres.mjs <action> --target=<local|test|restore>`.
 * As credenciais fixas são exclusivas das instâncias loopback locais. URLs com
 * password seguem apenas no ambiente dos subprocessos, nunca em argumentos ou
 * mensagens. O runner é injetável para os testes não dependerem de Docker.
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { parseEnv } from "node:util";

const scriptPath = fileURLToPath(import.meta.url);
const defaultApiRoot = resolve(dirname(scriptPath), "..");
const defaultRealDevRoot = resolve(defaultApiRoot, "..");
const defaultComposePath = resolve(defaultRealDevRoot, "compose.yaml");
const defaultEnvPath = resolve(defaultApiRoot, ".env");
const defaultEnvExamplePath = resolve(defaultApiRoot, ".env.example");
const LOCAL_POSTGRES_VOLUME = "opsa-real-dev-postgres-data";

export const LOCAL_POSTGRES_CREDENTIALS = Object.freeze({
    bootstrapUser: "opsa_bootstrap",
    bootstrapPassword: "opsa-bootstrap-local-2026",
    appUser: "opsa_app",
    appPassword: "opsa-local-postgres-2026",
});

const ACTIONS = new Set([
    "check",
    "start",
    "status",
    "logs",
    "setup",
    "stop",
    "reset",
]);

export const LOCAL_POSTGRES_TARGETS = Object.freeze({
    local: Object.freeze({
        service: "postgres",
        profile: null,
        port: 5433,
        database: "opsa_dev",
        environmentName: "DATABASE_URL",
    }),
    test: Object.freeze({
        service: "postgres-test",
        profile: "test",
        port: 5434,
        database: "opsa_test_ci",
        environmentName: "TEST_DATABASE_URL",
    }),
    restore: Object.freeze({
        service: "postgres-restore",
        profile: "restore",
        port: 5435,
        database: "opsa_restore_test",
        environmentName: "RESTORE_DATABASE_URL",
    }),
});

/**
 * Constrói uma URL PostgreSQL com encoding seguro das credenciais.
 *
 * @param {{ password: string, port: number, database: string }} input - Destino local.
 * @returns {string} URL aplicacional.
 */
function buildDatabaseUrl({ password, port, database }) {
    const url = new URL("postgresql://127.0.0.1");
    url.username = LOCAL_POSTGRES_CREDENTIALS.appUser;
    url.password = password;
    url.port = String(port);
    url.pathname = `/${database}`;
    return url.toString();
}

/**
 * Prepara ambientes Compose/API sem alterar `process.env`.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente de entrada.
 * @returns {{ composeEnv: Record<string, string | undefined>, databaseEnv: Record<string, string | undefined>, urls: Record<string, string> }} Ambientes derivados.
 */
export function buildLocalPostgresEnvironment(env = process.env) {
    const urls = Object.fromEntries(
        Object.entries(LOCAL_POSTGRES_TARGETS).map(([target, config]) => [
            target,
            buildDatabaseUrl({
                password: LOCAL_POSTGRES_CREDENTIALS.appPassword,
                port: config.port,
                database: config.database,
            }),
        ]),
    );
    const composeEnv = { ...env };
    return {
        composeEnv,
        databaseEnv: {
            ...composeEnv,
            DATABASE_URL: urls.local,
            TEST_DATABASE_URL: urls.test,
            RESTORE_DATABASE_URL: urls.restore,
        },
        urls,
    };
}

/**
 * Interpreta apenas a interface CLI fechada do gestor.
 *
 * @param {string[]} argv - Argumentos sem `node` e caminho do script.
 * @returns {{ action: string, target: "local" | "test" | "restore", confirm: string | null }} Pedido normalizado.
 */
export function parseLocalPostgresArguments(argv) {
    const [action, ...flags] = argv;
    if (!ACTIONS.has(action)) {
        throw new Error(
            "Ação inválida. Usa check, start, status, logs, setup, stop ou reset.",
        );
    }
    let target = null;
    let confirm = null;
    for (const flag of flags) {
        if (flag.startsWith("--target=")) {
            if (target !== null) throw new Error("--target só pode ser indicado uma vez.");
            target = flag.slice("--target=".length);
            continue;
        }
        if (flag.startsWith("--confirm=")) {
            if (confirm !== null) throw new Error("--confirm só pode ser indicado uma vez.");
            confirm = flag.slice("--confirm=".length);
            continue;
        }
        throw new Error(`Argumento desconhecido: ${flag}`);
    }
    if (!Object.hasOwn(LOCAL_POSTGRES_TARGETS, target ?? "")) {
        throw new Error("--target deve ser local, test ou restore.");
    }
    return { action, target, confirm };
}

/**
 * Runner real que preserva stdout/stderr dos comandos sem serializar o ambiente.
 *
 * @param {string} command - Executável.
 * @param {string[]} args - Argumentos não sensíveis.
 * @param {{ cwd: string, env: Record<string, string | undefined> }} options - Execução.
 * @returns {Promise<{ exitCode: number }>} Código terminal.
 */
export function runProcess(command, args, options) {
    return new Promise((resolvePromise, rejectPromise) => {
        const child = spawn(command, args, {
            cwd: options.cwd,
            env: options.env,
            stdio: "inherit",
        });
        child.once("error", rejectPromise);
        child.once("exit", (code, signal) => {
            resolvePromise({ exitCode: code ?? (signal ? 1 : 0) });
        });
    });
}

/**
 * Cria o gestor funcional com infraestrutura injetável.
 *
 * @param {{ runner?: Function, logger?: Pick<Console, "info" | "warn">, env?: Record<string, string | undefined>, apiRoot?: string, composePath?: string, envPath?: string, envExamplePath?: string, fileSystem?: object }} options - Dependências.
 * @returns {{ run(input: {action: string, target: string, confirm?: string | null}): Promise<void> }} Gestor.
 */
export function createLocalPostgresManager({
    runner = runProcess,
    logger = console,
    env = process.env,
    apiRoot = defaultApiRoot,
    composePath = defaultComposePath,
    envPath = defaultEnvPath,
    envExamplePath = defaultEnvExamplePath,
    fileSystem = { existsSync, readFileSync, writeFileSync },
} = {}) {
    const runtimeEnv = buildLocalPostgresEnvironment(env);

    function targetConfig(target) {
        const config = LOCAL_POSTGRES_TARGETS[target];
        if (!config) throw new Error("Target PostgreSQL local inválido.");
        return config;
    }

    function composeArgs(target, commandArgs) {
        const config = targetConfig(target);
        return [
            "compose",
            "--file",
            composePath,
            ...(config.profile ? ["--profile", config.profile] : []),
            ...commandArgs,
        ];
    }

    /**
     * Confirma que a API nunca aponta silenciosamente para PostgreSQL remoto
     * nem para credenciais/porta diferentes das instâncias deste gestor.
     *
     * @param {string} source - Conteúdo do ficheiro `.env`.
     * @returns {void}
     */
    function validateLocalEnvSource(source) {
        let parsed;
        try {
            parsed = parseEnv(source);
        } catch {
            throw new Error("O ficheiro .env local não tem sintaxe válida.");
        }
        const requiredUrls = [
            ["DATABASE_URL", runtimeEnv.urls.local],
            ["RESTORE_DATABASE_URL", runtimeEnv.urls.restore],
        ];
        if (parsed.TEST_DATABASE_URL) {
            requiredUrls.push(["TEST_DATABASE_URL", runtimeEnv.urls.test]);
        }
        for (const [name, expected] of requiredUrls) {
            if (!parsed[name]) {
                throw new Error(`O ficheiro .env local não define ${name}.`);
            }
            let configured;
            try {
                configured = new URL(parsed[name]).toString();
            } catch {
                throw new Error(`${name} do ficheiro .env local não é válida.`);
            }
            if (configured !== expected) {
                throw new Error(
                    `${name} do ficheiro .env diverge da instância local segura.`,
                );
            }
        }
        if (parsed.OPSA_POSTGRES_CLI_MODE !== "compose") {
            throw new Error(
                "OPSA_POSTGRES_CLI_MODE do ficheiro .env tem de ser compose.",
            );
        }
    }

    /**
     * Cria `.env` a partir do exemplo apenas quando não existe. Um ficheiro já
     * existente nunca é reescrito e tem de apontar exatamente para a base local.
     *
     * @returns {void}
     */
    function ensureLocalEnvFile() {
        if (fileSystem.existsSync(envPath)) {
            validateLocalEnvSource(fileSystem.readFileSync(envPath, "utf8"));
            logger.info("[local-postgres] local: .env existente validado.");
            return;
        }
        if (!fileSystem.existsSync(envExamplePath)) {
            throw new Error(".env.example em falta; o gestor não cria configuração incompleta.");
        }
        const example = fileSystem.readFileSync(envExamplePath, "utf8");
        if (!/^DATABASE_URL=.*$/mu.test(example)) {
            throw new Error(".env.example não contém DATABASE_URL substituível.");
        }
        const created = example.replace(
            /^DATABASE_URL=.*$/mu,
            `DATABASE_URL=${runtimeEnv.urls.local}`,
        );
        validateLocalEnvSource(created);
        fileSystem.writeFileSync(envPath, created, {
            encoding: "utf8",
            flag: "wx",
            mode: 0o600,
        });
        logger.info("[local-postgres] local: .env criado com permissões restritas.");
    }

    async function execute(label, command, args, commandEnv = runtimeEnv.composeEnv) {
        let result;
        try {
            result = await runner(command, args, {
                cwd: apiRoot,
                env: commandEnv,
            });
        } catch {
            throw new Error(`${label} não arrancou.`);
        }
        const exitCode = typeof result === "number"
            ? result
            : result?.exitCode ?? result?.code ?? 0;
        if (exitCode !== 0) {
            throw new Error(`${label} terminou com exit code ${exitCode}.`);
        }
    }

    async function check(target) {
        await execute("Docker", "docker", ["--version"]);
        await execute("Docker Compose", "docker", ["compose", "version"]);
        await execute(
            "Validação do Compose",
            "docker",
            composeArgs(target, ["config", "--quiet"]),
        );
        logger.info(`[local-postgres] ${target}: Docker e Compose válidos.`);
    }

    async function start(target, { checked = false } = {}) {
        const config = targetConfig(target);
        if (!checked) await check(target);
        await execute(
            `Arranque PostgreSQL ${target}`,
            "docker",
            composeArgs(target, [
                "up",
                "--detach",
                "--wait",
                config.service,
            ]),
        );
        try {
            await execute(
                `Autenticação PostgreSQL ${target}`,
                "docker",
                composeArgs(target, [
                    "exec",
                    "--no-TTY",
                    "--env",
                    "PGPASSWORD",
                    config.service,
                    "psql",
                    "--host",
                    "127.0.0.1",
                    "--username",
                    LOCAL_POSTGRES_CREDENTIALS.appUser,
                    "--dbname",
                    config.database,
                    "--no-psqlrc",
                    "--tuples-only",
                    "--command",
                    "SELECT 1;",
                ]),
                {
                    ...runtimeEnv.composeEnv,
                    PGPASSWORD: LOCAL_POSTGRES_CREDENTIALS.appPassword,
                },
            );
        } catch (error) {
            if (target !== "local") throw error;
            throw new Error(
                "A autenticação da base local falhou. Confirma a configuração; " +
                "se o volume tiver credenciais antigas, executa o reset explícito " +
                "com `npm run db:local:reset -- --confirm=opsa_dev`.",
            );
        }
        logger.info(
            `[local-postgres] ${target}: ${config.database} saudável em 127.0.0.1:${config.port}.`,
        );
    }

    async function status(target) {
        const config = targetConfig(target);
        await execute(
            `Estado PostgreSQL ${target}`,
            "docker",
            composeArgs(target, ["ps", "--all", config.service]),
        );
    }

    async function logs(target) {
        const config = targetConfig(target);
        await execute(
            `Logs PostgreSQL ${target}`,
            "docker",
            composeArgs(target, ["logs", "--tail", "100", config.service]),
        );
    }

    async function setup(target) {
        const config = targetConfig(target);
        if (target === "local") ensureLocalEnvFile();
        await check(target);
        await start(target, { checked: true });
        if (target === "local") {
            await execute(
                "Geração do Prisma Client",
                "npm",
                ["run", "prisma:generate"],
                runtimeEnv.databaseEnv,
            );
            await execute(
                "Migrations da base local",
                "npm",
                ["run", "db:migrate:deploy"],
                runtimeEnv.databaseEnv,
            );
            await execute(
                "Seed da demonstração local",
                "npm",
                ["run", "db:seed:demo"],
                runtimeEnv.databaseEnv,
            );
            await execute(
                "Verificação da seed local",
                "npm",
                ["run", "db:seed:verify"],
                runtimeEnv.databaseEnv,
            );
            logger.info(
                "[local-postgres] local: Prisma, migrations, seed e verificação concluídos.",
            );
            return;
        }
        logger.info(
            `[local-postgres] ${target}: ${config.environmentName} pronta e vazia.`,
        );
    }

    async function stop(target) {
        const config = targetConfig(target);
        await execute(
            `Paragem PostgreSQL ${target}`,
            "docker",
            composeArgs(target, ["stop", config.service]),
        );
        logger.info(`[local-postgres] ${target}: serviço parado sem apagar dados.`);
    }

    async function reset(target, confirm) {
        const config = targetConfig(target);
        if (target === "local" && confirm !== "opsa_dev") {
            throw new Error(
                "Reset local exige confirmação explícita --confirm=opsa_dev.",
            );
        }
        logger.warn(
            `[local-postgres] ${target}: a reinicializar a base ${config.database}.`,
        );
        await check(target);
        if (target === "local") {
            await execute(
                "Remoção do serviço PostgreSQL local",
                "docker",
                composeArgs(target, ["rm", "--force", "--stop", config.service]),
            );
            await execute(
                "Reset do volume PostgreSQL local",
                "docker",
                ["volume", "rm", LOCAL_POSTGRES_VOLUME],
            );
        } else {
            await execute(
                `Reset PostgreSQL ${target}`,
                "docker",
                composeArgs(target, [
                    "rm",
                    "--force",
                    "--stop",
                    "--volumes",
                    config.service,
                ]),
            );
        }
        if (target === "local") {
            await setup(target);
            return;
        }
        await start(target, { checked: true });
    }

    return {
        async run({ action, target, confirm = null }) {
            if (!ACTIONS.has(action)) throw new Error("Ação PostgreSQL local inválida.");
            if (action === "check") return check(target);
            if (action === "start") return start(target);
            if (action === "status") return status(target);
            if (action === "logs") return logs(target);
            if (action === "setup") return setup(target);
            if (action === "stop") return stop(target);
            return reset(target, confirm);
        },
    };
}

/**
 * Executa a interface CLI testável.
 *
 * @param {string[]} argv - Argumentos CLI.
 * @param {Parameters<typeof createLocalPostgresManager>[0]} dependencies - Doubles opcionais.
 * @returns {Promise<void>} Conclusão do comando.
 */
export async function runLocalPostgresCli(
    argv = process.argv.slice(2),
    dependencies = {},
) {
    const input = parseLocalPostgresArguments(argv);
    const manager = createLocalPostgresManager(dependencies);
    await manager.run(input);
}

if (
    process.argv[1] &&
    pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
    runLocalPostgresCli().catch((error) => {
        console.error(`[local-postgres] ERRO: ${error.message}`);
        process.exitCode = 1;
    });
}
