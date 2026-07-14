/**
 * @file Contratos do executor PostgreSQL no serviço Compose de tools.
 */

import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
    POSTGRES_COMPOSE_DEFAULTS,
    createPostgresComposeRunner,
} from "../../scripts/postgres-compose-cli.mjs";

function connectionArgs({ host = "127.0.0.1", port = "5433" } = {}) {
    return [
        "--host",
        host,
        "--port",
        port,
        "--username",
        "opsa",
        "--dbname",
        "opsa_test",
    ];
}

test("tools Compose usam um único serviço e não precisam de ligação para --version", () => {
    const calls = [];
    const runner = createPostgresComposeRunner({
        composeFile: "/tmp/opsa-compose.yaml",
        containerUser: "1000:1000",
        runCommand: (command, args, options) => {
            calls.push({ command, args, options });
            return { status: 0, stdout: "PostgreSQL 17", stderr: "" };
        },
    });

    runner("pg_dump", ["--version"], { encoding: "utf8", stdio: "pipe" });

    assert.equal(calls[0].command, "docker");
    assert.deepEqual(calls[0].args, [
        "compose",
        "-f",
        "/tmp/opsa-compose.yaml",
        "--profile",
        "tools",
        "run",
        "--rm",
        "--no-deps",
        "--user",
        "1000:1000",
        "postgres-tools",
        "pg_dump",
        "--version",
    ]);
    assert.equal(path.isAbsolute(POSTGRES_COMPOSE_DEFAULTS.composeFile), true);
    assert.throws(
        () => createPostgresComposeRunner({ containerUser: "root" }),
        /Utilizador do tools container inválido/,
    );
});

test("pg_dump traduz origem local e monta apenas o diretório do dump com escrita", () => {
    const calls = [];
    const dumpPath = "/private/tmp/opsa-backups/demo.dump";
    const runner = createPostgresComposeRunner({
        composeFile: "/tmp/opsa-compose.yaml",
        runCommand: (command, args, options) => {
            calls.push({ command, args, options });
            return { status: 0, stdout: "", stderr: "" };
        },
    });

    runner(
        "pg_dump",
        ["--format=custom", "--file", dumpPath, ...connectionArgs()],
        {
            env: { PGPASSWORD: "dump-secret" },
            encoding: "utf8",
            stdio: "pipe",
        },
    );

    const dockerArgs = calls[0].args;
    const toolArgs = dockerArgs.slice(dockerArgs.indexOf("pg_dump") + 1);
    assert.deepEqual(
        dockerArgs.slice(
            dockerArgs.indexOf("--volume"),
            dockerArgs.indexOf("--volume") + 2,
        ),
        ["--volume", "/private/tmp/opsa-backups:/backup"],
    );
    const fileIndex = toolArgs.indexOf("--file");
    assert.deepEqual(toolArgs.slice(fileIndex, fileIndex + 2), [
        "--file",
        "/backup/demo.dump",
    ]);
    assert.equal(toolArgs[toolArgs.indexOf("--host") + 1], "postgres");
    assert.equal(toolArgs[toolArgs.indexOf("--port") + 1], "5432");
    assert.deepEqual(
        dockerArgs.slice(dockerArgs.indexOf("--env"), dockerArgs.indexOf("--env") + 2),
        ["--env", "PGPASSWORD"],
    );
    assert.doesNotMatch(JSON.stringify(dockerArgs), /dump-secret|postgresql:\/\//);
    assert.equal(calls[0].options.env.PGPASSWORD, "dump-secret");
});

test("pg_restore traduz destino local e monta o dump como readonly", () => {
    const calls = [];
    const runner = createPostgresComposeRunner({
        composeFile: "/tmp/opsa-compose.yaml",
        runCommand: (command, args, options) => {
            calls.push({ command, args, options });
            return { status: 0, stdout: "", stderr: "" };
        },
    });

    runner(
        "pg_restore",
        [
            "--clean",
            ...connectionArgs({ port: "5435" }),
            "/private/tmp/opsa-restore/demo.dump",
        ],
        { env: { PGPASSWORD: "restore-secret" } },
    );

    const dockerArgs = calls[0].args;
    const toolArgs = dockerArgs.slice(dockerArgs.indexOf("pg_restore") + 1);
    assert.equal(
        dockerArgs[dockerArgs.indexOf("--volume") + 1],
        "/private/tmp/opsa-restore:/backup:ro",
    );
    assert.equal(toolArgs[toolArgs.indexOf("--host") + 1], "postgres-restore");
    assert.equal(toolArgs[toolArgs.indexOf("--port") + 1], "5432");
    assert.equal(toolArgs.at(-1), "/backup/demo.dump");
    assert.doesNotMatch(JSON.stringify(dockerArgs), /restore-secret/);
});

test("psql traduz as duas ligações sem montar diretórios", () => {
    const calls = [];
    const runner = createPostgresComposeRunner({
        runCommand: (_command, args) => {
            calls.push(args);
            return { status: 0, stdout: "1", stderr: "" };
        },
    });

    for (const port of ["5433", "5435"]) {
        runner(
            "psql",
            [...connectionArgs({ port }), "--command", "SELECT 1;"],
            { env: { PGPASSWORD: "query-secret" } },
        );
    }

    assert.equal(calls.every((args) => !args.includes("--volume")), true);
    assert.deepEqual(
        calls.map((args) => {
            const toolArgs = args.slice(args.indexOf("psql") + 1);
            return toolArgs[toolArgs.indexOf("--host") + 1];
        }),
        ["postgres", "postgres-restore"],
    );
});

test("Compose rejeita endpoints remotos ou portas locais desconhecidas", () => {
    let executions = 0;
    const runner = createPostgresComposeRunner({
        runCommand: () => {
            executions += 1;
            return { status: 0, stdout: "", stderr: "" };
        },
    });
    const options = { env: { PGPASSWORD: "secret" } };

    assert.throws(
        () => runner("psql", connectionArgs({ host: "db.example.test" }), options),
        /apenas PostgreSQL local/,
    );
    assert.throws(
        () => runner("psql", connectionArgs({ port: "5440" }), options),
        /apenas PostgreSQL local/,
    );
    assert.equal(executions, 0);
});

test("Compose exige password apenas no ambiente da execução com ligação", () => {
    const runner = createPostgresComposeRunner({
        runCommand: () => ({ status: 0, stdout: "", stderr: "" }),
    });
    assert.throws(
        () => runner("psql", connectionArgs(), { env: {} }),
        /PGPASSWORD é obrigatória/,
    );
});
