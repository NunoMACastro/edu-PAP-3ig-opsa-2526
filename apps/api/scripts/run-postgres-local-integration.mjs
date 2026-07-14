/**
 * @file Gate PostgreSQL local sobre o serviço descartável do Docker Compose.
 *
 * O runner mantém os ficheiros de teste sequenciais para que migrations e
 * cleanup não concorram pela mesma base. A concorrência de domínio continua a
 * ser exercitada dentro dos próprios cenários persistentes.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const apiRoot = fileURLToPath(new URL("../", import.meta.url));
const LOCAL_TEST_DATABASE_URL =
    "postgresql://opsa_app:opsa-local-postgres-2026@127.0.0.1:5434/opsa_test_ci";
const LOCAL_RESTORE_DATABASE_URL =
    "postgresql://opsa_app:opsa-local-postgres-2026@127.0.0.1:5435/opsa_restore_test";

const LOCAL_INTEGRATION_FILES = Object.freeze([
    "tests/integration/e2e-concurrency-persistence.test.js",
    "tests/integration/mf1-sales-purchases-treasury-flow.test.js",
    "tests/integration/mf2-persistence.test.js",
    "tests/integration/mf3-persistence.test.js",
    "tests/integration/migration-upgrade-persistence.test.js",
]);

/**
 * Executa um passo sem shell e sem colocar URLs ou passwords nos argumentos.
 *
 * @param {{ label: string, command: string, args: string[], env: NodeJS.ProcessEnv }} step - Passo seguro.
 * @returns {void}
 */
function runStep(step) {
    console.info(`[postgres-local] START ${step.label}`);
    const result = spawnSync(step.command, step.args, {
        cwd: apiRoot,
        env: step.env,
        encoding: "utf8",
        stdio: "inherit",
    });
    if (result.error) {
        throw new Error(`${step.label} não arrancou.`);
    }
    if (result.status !== 0) {
        throw new Error(`${step.label} terminou com exit code ${result.status}.`);
    }
    console.info(`[postgres-local] PASS ${step.label}`);
}

/**
 * Recria a base Compose, aplica migrations e executa integração/seed em série.
 *
 * @param {NodeJS.ProcessEnv} env - Ambiente base do operador.
 * @returns {void}
 */
export function runPostgresLocalIntegration(env = process.env) {
    const databaseEnvironment = {
        ...env,
        NODE_ENV: "test",
        DATABASE_URL: LOCAL_TEST_DATABASE_URL,
        TEST_DATABASE_URL: LOCAL_TEST_DATABASE_URL,
        RESTORE_DATABASE_URL: LOCAL_RESTORE_DATABASE_URL,
        OPSA_POSTGRES_CLI_MODE: "compose",
        OPSA_SKIP_PERSISTENCE_TESTS: "false",
    };
    const integrationEnvironment = { ...databaseEnvironment };
    delete integrationEnvironment.DATABASE_URL;

    let primaryError = null;
    try {
        runStep({
            label: "reset da base de teste",
            command: "npm",
            args: ["run", "db:test:reset"],
            env: databaseEnvironment,
        });
        runStep({
            label: "base de teste vazia",
            command: "npm",
            args: ["run", "migration:assert-empty-test-db"],
            env: databaseEnvironment,
        });
        runStep({
            label: "migrations PostgreSQL",
            command: "npx",
            args: ["prisma", "migrate", "deploy"],
            env: databaseEnvironment,
        });
        runStep({
            label: "integração PostgreSQL sequencial",
            command: process.execPath,
            args: ["--test", "--test-concurrency=1", ...LOCAL_INTEGRATION_FILES],
            env: integrationEnvironment,
        });
        runStep({
            label: "seed idempotente e sentinela externa",
            command: process.execPath,
            args: ["--test", "--test-concurrency=1", "tests/seed/seed-idempotency.test.js"],
            env: integrationEnvironment,
        });
    } catch (error) {
        primaryError = error;
    } finally {
        try {
            runStep({
                label: "paragem da base de teste",
                command: "npm",
                args: ["run", "db:test:stop"],
                env: databaseEnvironment,
            });
        } catch (error) {
            primaryError ??= error;
        }
    }

    if (primaryError) throw primaryError;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        runPostgresLocalIntegration();
    } catch (error) {
        console.error(`[postgres-local] FAIL ${error?.message ?? "erro desconhecido"}`);
        process.exitCode = 1;
    }
}
