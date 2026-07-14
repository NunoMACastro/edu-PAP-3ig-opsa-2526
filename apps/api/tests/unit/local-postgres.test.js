/**
 * @file Contratos unitários do Compose e do gestor PostgreSQL local.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
    buildLocalPostgresEnvironment,
    createLocalPostgresManager,
    LOCAL_POSTGRES_CREDENTIALS,
    parseLocalPostgresArguments,
} from "../../scripts/local-postgres.mjs";

const ADMIN_PASSWORD = LOCAL_POSTGRES_CREDENTIALS.bootstrapPassword;
const APP_PASSWORD = LOCAL_POSTGRES_CREDENTIALS.appPassword;
const ENV_PATH = "/workspace/real_dev/api/.env";
const ENV_EXAMPLE_PATH = "/workspace/real_dev/api/.env.example";

function createHarness(overrides = {}) {
    const calls = [];
    const logs = [];
    const runner = overrides.runner ?? (async (command, args, options) => {
        calls.push({ command, args, options });
        return { exitCode: 0 };
    });
    const files = new Map([
        [
            ENV_EXAMPLE_PATH,
            "NODE_ENV=development\nDATABASE_URL=postgresql://old:old@127.0.0.1:5432/old\nRESTORE_DATABASE_URL=postgresql://opsa_app:opsa-local-postgres-2026@127.0.0.1:5435/opsa_restore_test\nOPSA_POSTGRES_CLI_MODE=compose\n",
        ],
        ...Object.entries(overrides.files ?? {}),
    ]);
    const writes = [];
    const fileSystem = {
        existsSync(path) {
            return files.has(path);
        },
        readFileSync(path) {
            if (!files.has(path)) throw new Error(`missing ${path}`);
            return files.get(path);
        },
        writeFileSync(path, value, options) {
            if (options?.flag === "wx" && files.has(path)) {
                throw new Error("file exists");
            }
            files.set(path, value);
            writes.push({ path, value, options });
        },
    };
    const manager = createLocalPostgresManager({
        runner,
        logger: {
            info(message) { logs.push(message); },
            warn(message) { logs.push(message); },
        },
        env: {},
        apiRoot: "/workspace/real_dev/api",
        composePath: "/workspace/real_dev/compose.yaml",
        envPath: ENV_PATH,
        envExamplePath: ENV_EXAMPLE_PATH,
        fileSystem,
    });
    return { manager, calls, logs, files, writes };
}

test("Compose fixa imagem, projeto, isolamento, profiles, health e SCRAM", () => {
    const source = readFileSync(
        new URL("../../../compose.yaml", import.meta.url),
        "utf8",
    );

    assert.match(source, /^name: opsa-real-dev$/m);
    assert.equal(
        source.match(/image: postgres:17\.10-alpine3\.23@sha256:[a-f0-9]{64}/g)?.length,
        4,
    );
    for (const mapping of [
        "127.0.0.1:5433:5432",
        "127.0.0.1:5434:5432",
        "127.0.0.1:5435:5432",
    ]) {
        assert.match(source, new RegExp(mapping.replaceAll(".", "\\.")));
    }
    assert.match(source, /profiles: \["test"\]/);
    assert.match(source, /profiles: \["restore"\]/);
    assert.match(source, /profiles: \["tools"\]/);
    for (const service of [
        "postgres:",
        "postgres-test:",
        "postgres-restore:",
        "postgres-tools:",
    ]) {
        assert.match(source, new RegExp(`^  ${service}$`, "m"));
    }
    assert.equal(source.match(/tmpfs:/g)?.length, 3);
    assert.match(source, /opsa-postgres-data:\/var\/lib\/postgresql\/data/);
    assert.equal(source.match(/healthcheck:/g)?.length, 3);
    assert.equal(source.match(/pg_isready -h 127\.0\.0\.1/g)?.length, 3);
    assert.equal(source.match(/restart: "no"/g)?.length, 4);
    assert.equal(source.match(/shm_size: 128mb/g)?.length, 3);
    assert.equal(source.match(/password_encryption=scram-sha-256/g)?.length, 3);
    assert.equal(source.match(/--auth-host=scram-sha-256/g)?.length, 3);
    assert.doesNotMatch(source, /container_name\s*:/);
    assert.doesNotMatch(source, /privileged\s*:/);
});

test("init cria role aplicacional sem privilégios administrativos nem eco de segredos", () => {
    const source = readFileSync(
        new URL("../../../docker/postgres/init-app-role.sh", import.meta.url),
        "utf8",
    );

    assert.match(source, /NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION/);
    assert.match(source, /GRANT USAGE, CREATE ON SCHEMA public/);
    assert.match(source, /--set=app_password=/);
    assert.match(source, /%L/);
    assert.match(source, /\\gexec/);
    assert.doesNotMatch(source, /echo.*PASSWORD/i);
    assert.doesNotMatch(source, /set -x/);
});

test("parser exige action e target fechados e confirmação permanece explícita", () => {
    assert.deepEqual(
        parseLocalPostgresArguments([
            "reset",
            "--target=local",
            "--confirm=opsa_dev",
        ]),
        { action: "reset", target: "local", confirm: "opsa_dev" },
    );
    assert.throws(
        () => parseLocalPostgresArguments(["start"]),
        /--target/,
    );
    assert.throws(
        () => parseLocalPostgresArguments(["destroy", "--target=local"]),
        /Ação inválida/,
    );
    assert.throws(
        () => parseLocalPostgresArguments(["start", "--target=prod"]),
        /local, test ou restore/,
    );
    assert.throws(
        () => parseLocalPostgresArguments(["start", "--target=local", "--force"]),
        /Argumento desconhecido/,
    );
});

test("ambiente usa credenciais locais fixas e codifica URLs nas três portas", () => {
    const original = { UNRELATED: "preserved" };
    const result = buildLocalPostgresEnvironment(original);

    assert.deepEqual(original, { UNRELATED: "preserved" });
    assert.equal(new URL(result.urls.local).port, "5433");
    assert.equal(new URL(result.urls.local).pathname, "/opsa_dev");
    assert.equal(new URL(result.urls.test).port, "5434");
    assert.equal(new URL(result.urls.test).pathname, "/opsa_test_ci");
    assert.equal(new URL(result.urls.restore).port, "5435");
    assert.equal(new URL(result.urls.restore).pathname, "/opsa_restore_test");
    assert.equal(new URL(result.urls.local).username, "opsa_app");
    assert.equal(result.urls.local.includes(APP_PASSWORD), true);
    assert.equal(result.databaseEnv.DATABASE_URL, result.urls.local);
    assert.equal(result.databaseEnv.TEST_DATABASE_URL, result.urls.test);
    assert.equal(result.databaseEnv.RESTORE_DATABASE_URL, result.urls.restore);
    assert.doesNotThrow(() => buildLocalPostgresEnvironment({}));
});

test("start valida Compose, seleciona profile e nunca põe secrets nos argumentos/logs", async () => {
    const { manager, calls, logs } = createHarness();
    await manager.run({ action: "start", target: "test" });

    assert.deepEqual(calls[0].args, ["--version"]);
    assert.deepEqual(calls[1].args, ["compose", "version"]);
    assert.deepEqual(calls[2].args, [
        "compose",
        "--file",
        "/workspace/real_dev/compose.yaml",
        "--profile",
        "test",
        "config",
        "--quiet",
    ]);
    assert.deepEqual(calls[3].args.slice(-4), [
        "up",
        "--detach",
        "--wait",
        "postgres-test",
    ]);
    assert.equal(calls[3].args.includes("up"), true);
    assert.deepEqual(calls[4].args.slice(-12), [
        "postgres-test",
        "psql",
        "--host",
        "127.0.0.1",
        "--username",
        "opsa_app",
        "--dbname",
        "opsa_test_ci",
        "--no-psqlrc",
        "--tuples-only",
        "--command",
        "SELECT 1;",
    ]);
    assert.equal(calls[3].options.env.OPSA_POSTGRES_APP_PASSWORD, undefined);
    const publicOutput = JSON.stringify({
        args: calls.map(({ args }) => args),
        logs,
    });
    assert.equal(publicOutput.includes(ADMIN_PASSWORD), false);
    assert.equal(publicOutput.includes(APP_PASSWORD), false);
});

test("check distingue ausência de Docker e de Docker Compose", async () => {
    const noDocker = createHarness({
        runner: async (command, args) => {
            if (command === "docker" && args[0] === "--version") {
                throw Object.assign(new Error("missing"), { code: "ENOENT" });
            }
            return { exitCode: 0 };
        },
    });
    await assert.rejects(
        noDocker.manager.run({ action: "check", target: "local" }),
        /Docker não arrancou/,
    );

    const noCompose = createHarness({
        runner: async (_command, args) => ({
            exitCode: args[0] === "compose" && args[1] === "version" ? 1 : 0,
        }),
    });
    await assert.rejects(
        noCompose.manager.run({ action: "check", target: "local" }),
        /Docker Compose terminou com exit code 1/,
    );
});

test("start falha fechado perante serviço unhealthy ou porta ocupada", async () => {
    for (const simulatedFailure of ["unhealthy", "port-in-use"]) {
        const harness = createHarness({
            runner: async (_command, args) => ({
                exitCode: args.includes("up") ? 1 : 0,
                stderr: simulatedFailure,
            }),
        });
        await assert.rejects(
            harness.manager.run({ action: "start", target: "local" }),
            (error) => error.message ===
                "Arranque PostgreSQL local terminou com exit code 1." &&
                !error.message.includes(simulatedFailure),
        );
    }
});

test("start recomenda reset explícito quando um volume local tem credenciais antigas", async () => {
    const harness = createHarness({
        runner: async (_command, args) => ({
            exitCode: args.includes("psql") ? 1 : 0,
        }),
    });
    await assert.rejects(
        harness.manager.run({ action: "start", target: "local" }),
        /db:local:reset -- --confirm=opsa_dev/,
    );
});

test("setup local cria .env restrito, gera Prisma, migra, semeia e verifica", async () => {
    const local = createHarness();
    await local.manager.run({ action: "setup", target: "local" });
    const npmCalls = local.calls.filter(({ command }) => command === "npm");
    assert.deepEqual(npmCalls.map(({ args }) => args), [
        ["run", "prisma:generate"],
        ["run", "db:migrate:deploy"],
        ["run", "db:seed:demo"],
        ["run", "db:seed:verify"],
    ]);
    assert.equal(new URL(npmCalls[0].options.env.DATABASE_URL).port, "5433");
    assert.equal(
        npmCalls.flatMap(({ args }) => args).join(" ").includes(APP_PASSWORD),
        false,
    );
    assert.equal(local.writes.length, 1);
    assert.equal(local.writes[0].options.mode, 0o600);
    assert.equal(local.writes[0].options.flag, "wx");
    assert.equal(
        new URL(local.files.get(ENV_PATH).match(/^DATABASE_URL=(.*)$/m)[1]).port,
        "5433",
    );
});

test("setup valida .env existente e recusa destino remoto antes de Docker", async () => {
    const expected = buildLocalPostgresEnvironment({}).urls;
    const valid = createHarness({
        files: {
            [ENV_PATH]: `NODE_ENV=development\nDATABASE_URL=${expected.local}\nRESTORE_DATABASE_URL=${expected.restore}\nOPSA_POSTGRES_CLI_MODE=compose\n`,
        },
    });
    await valid.manager.run({ action: "setup", target: "local" });
    assert.equal(valid.writes.length, 0);
    assert.match(valid.logs[0], /.env existente validado/);

    const remote = createHarness({
        files: {
            [ENV_PATH]: "DATABASE_URL=postgresql://opsa_app:password@db.example.test:5432/opsa_dev\n",
        },
    });
    await assert.rejects(
        remote.manager.run({ action: "setup", target: "local" }),
        /diverge da instância local segura/,
    );
    assert.equal(remote.calls.length, 0);
    assert.equal(remote.writes.length, 0);

    const remoteRestore = createHarness({
        files: {
            [ENV_PATH]: `DATABASE_URL=${expected.local}\nRESTORE_DATABASE_URL=postgresql://opsa_app:password@db.example.test:5432/opsa_restore_test\nOPSA_POSTGRES_CLI_MODE=compose\n`,
        },
    });
    await assert.rejects(
        remoteRestore.manager.run({ action: "setup", target: "local" }),
        /RESTORE_DATABASE_URL.*diverge/,
    );
    assert.equal(remoteRestore.calls.length, 0);

    const nativeTools = createHarness({
        files: {
            [ENV_PATH]: `DATABASE_URL=${expected.local}\nRESTORE_DATABASE_URL=${expected.restore}\nOPSA_POSTGRES_CLI_MODE=native\n`,
        },
    });
    await assert.rejects(
        nativeTools.manager.run({ action: "setup", target: "local" }),
        /OPSA_POSTGRES_CLI_MODE.*compose/,
    );
    assert.equal(nativeTools.calls.length, 0);
});

test("setup test mantém a base descartável vazia", async () => {

    const disposable = createHarness();
    await disposable.manager.run({ action: "setup", target: "test" });
    assert.equal(
        disposable.calls.some(({ command }) => command === "npm"),
        false,
    );
    assert.match(disposable.logs.at(-1), /pronta e vazia/);
});

test("stop preserva dados e resets aplicam confirmações conforme o target", async () => {
    const stopped = createHarness();
    await stopped.manager.run({ action: "stop", target: "local" });
    assert.equal(stopped.calls.at(-1).args.includes("--volumes"), false);
    assert.equal(stopped.calls.at(-1).args.includes("stop"), true);

    const local = createHarness();
    await assert.rejects(
        local.manager.run({ action: "reset", target: "local" }),
        /--confirm=opsa_dev/,
    );
    assert.equal(local.calls.length, 0);
    await local.manager.run({
        action: "reset",
        target: "local",
        confirm: "opsa_dev",
    });
    const serviceRemoval = local.calls.find(
        ({ args }) => args.includes("rm") && args.includes("postgres"),
    );
    assert.ok(serviceRemoval);
    assert.equal(serviceRemoval.args.includes("postgres-test"), false);
    assert.equal(serviceRemoval.args.includes("postgres-restore"), false);
    const volumeRemoval = local.calls.find(
        ({ args }) => args[0] === "volume" && args[1] === "rm",
    );
    assert.deepEqual(volumeRemoval.args, [
        "volume",
        "rm",
        "opsa-real-dev-postgres-data",
    ]);
    assert.equal(
        local.calls.filter(({ command }) => command === "npm").length,
        4,
    );

    const disposable = createHarness();
    await disposable.manager.run({ action: "reset", target: "restore" });
    const reset = disposable.calls.find(({ args }) => args.includes("rm"));
    assert.ok(reset);
    assert.equal(reset.args.includes("--volumes"), true);
    assert.equal(reset.args.includes("postgres-restore"), true);
});

test("status e logs são limitados ao serviço e falhas não repetem detalhes externos", async () => {
    const status = createHarness();
    await status.manager.run({ action: "status", target: "restore" });
    assert.deepEqual(status.calls.at(-1).args.slice(-3), [
        "ps",
        "--all",
        "postgres-restore",
    ]);

    const logs = createHarness();
    await logs.manager.run({ action: "logs", target: "local" });
    assert.deepEqual(logs.calls.at(-1).args.slice(-4), [
        "logs",
        "--tail",
        "100",
        "postgres",
    ]);

    const failed = createHarness({
        runner: async () => ({ exitCode: 23, stderr: APP_PASSWORD }),
    });
    await assert.rejects(
        failed.manager.run({ action: "status", target: "local" }),
        (error) => error.message === "Estado PostgreSQL local terminou com exit code 23." &&
            !error.message.includes(APP_PASSWORD),
    );
});
