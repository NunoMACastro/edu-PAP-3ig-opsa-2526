/**
 * @file Testes do percurso local de backup/restore sem o confundir com prova PostgreSQL real.
 */

import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { mkdtemp, mkdir, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
    resolveBackupMode,
    runDailyBackup,
} from "../../scripts/run-daily-backup.mjs";
import {
    resolveLocalBackupBundle,
    verifyBackupRestore,
} from "../../scripts/verify-backup-restore.mjs";
import {
    assertDisposableRestoreDatabase,
    assertPostgresToolsAvailable,
    postgresCliConnection,
} from "../../scripts/postgres-cli.mjs";
import { removeLocalPathsAndConfirmAbsent } from "../../src/modules/storage/backupBundle.js";

const DATABASE_URL =
    "postgresql://backup_user:very-secret@127.0.0.1:5432/opsa_dev";
const RESTORE_DATABASE_URL =
    "postgresql://restore_user:other-secret@127.0.0.1:5432/opsa_demo_restore";
const COMPOSE_DATABASE_URL =
    "postgresql://backup_user:very-secret@127.0.0.1:5433/opsa_dev";

/**
 * Simula apenas pg_dump para testar orchestration, manifesto e segurança do argv.
 * Não constitui prova de restore operacional.
 *
 * @param {string} command - Executável pedido.
 * @param {string[]} args - Argumentos públicos.
 * @returns {{ status: number, stdout: string, stderr: string }} Resultado sintético.
 */
function fakePgDump(command, args) {
    if (args.includes("--version")) {
        return { status: 0, stdout: `${command} (PostgreSQL) 17`, stderr: "" };
    }
    const outputPath = args[args.indexOf("--file") + 1];
    writeFileSync(outputPath, Buffer.from("PGDMP-local-academic-test"), {
        mode: 0o600,
    });
    return { status: 0, stdout: "", stderr: "" };
}

/**
 * Cria um backup local unitário num diretório isolado.
 *
 * @param {string} root - Diretório temporário do teste.
 * @returns {Promise<object>} Descritor devolvido pelo backup.
 */
function createLocalBackup(root) {
    return runDailyBackup({
        mode: "local",
        backupDir: path.join(root, "backups"),
        databaseUrl: DATABASE_URL,
        now: new Date("2026-07-12T12:00:00.000Z"),
        runCommand: fakePgDump,
    });
}

test("preflight identifica ferramentas PostgreSQL ausentes com mensagem acionável", () => {
    assert.throws(
        () =>
            assertPostgresToolsAvailable(["pg_dump"], () => ({
                error: Object.assign(new Error("missing"), { code: "ENOENT" }),
                status: null,
            })),
        /Ferramenta PostgreSQL em falta: pg_dump/,
    );
});

test("ligações inválidas e nomes de restore ambíguos são rejeitados", () => {
    assert.throws(() => postgresCliConnection("https://example.test/db"), /postgres/);
    assert.throws(() => postgresCliConnection("postgresql://host-only"), /utilizador/);
    assert.throws(() => assertDisposableRestoreDatabase("opsa_production"), /descartável/);
    assert.throws(() => assertDisposableRestoreDatabase("contest"), /descartável/);
    assert.doesNotThrow(() => assertDisposableRestoreDatabase("opsa_demo_restore"));
});

test("backup local é o default, não usa S3 e não expõe URL/password no argv ou manifesto", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-local-backup-"));
    const calls = [];
    try {
        const backup = await runDailyBackup({
            backupDir: path.join(root, "backups"),
            databaseUrl: DATABASE_URL,
            now: new Date("2026-07-12T12:01:00.000Z"),
            runCommand: (command, args, options) => {
                calls.push({ command, args, envPassword: options?.env?.PGPASSWORD });
                return fakePgDump(command, args);
            },
        });
        assert.equal(backup.mode, "local");
        assert.equal(backup.database, "opsa_dev");
        assert.match(backup.manifestSha256, /^[a-f0-9]{64}$/);
        assert.deepEqual(
            (await readdir(path.dirname(backup.backupPath))).sort(),
            [
                path.basename(backup.backupPath),
                path.basename(backup.manifestPath),
                path.basename(backup.manifestChecksumPath),
            ].sort(),
        );
        const publicArguments = JSON.stringify(calls.map(({ command, args }) => ({ command, args })));
        assert.doesNotMatch(publicArguments, /very-secret|postgresql:\/\//);
        assert.equal(
            calls.find(
                ({ command, args }) => command === "pg_dump" && args.includes("--file"),
            ).envPassword,
            "very-secret",
        );
        assert.doesNotMatch(readFileSync(backup.manifestPath, "utf8"), /very-secret|postgresql:\/\//);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("backup local Compose cria dump pelo tools service sem expor credenciais", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-compose-backup-"));
    const calls = [];
    try {
        const backup = await runDailyBackup({
            mode: "local",
            env: { OPSA_POSTGRES_CLI_MODE: "compose" },
            backupDir: path.join(root, "backups"),
            databaseUrl: COMPOSE_DATABASE_URL,
            now: new Date("2026-07-12T12:01:30.000Z"),
            runCommand: (command, args, options) => {
                calls.push({ command, args, options });
                const toolIndex = args.indexOf("postgres-tools") + 1;
                const tool = args[toolIndex];
                const toolArgs = args.slice(toolIndex + 1);
                if (toolArgs.includes("--version")) {
                    return {
                        status: 0,
                        stdout: `${tool} (PostgreSQL) 17`,
                        stderr: "",
                    };
                }
                assert.equal(tool, "pg_dump");
                const volume = args[args.indexOf("--volume") + 1];
                const hostDirectory = volume.slice(0, volume.indexOf(":"));
                const containerPath = toolArgs[toolArgs.indexOf("--file") + 1];
                writeFileSync(
                    path.join(hostDirectory, path.basename(containerPath)),
                    Buffer.from("PGDMP-compose-academic-test"),
                    { mode: 0o600 },
                );
                return { status: 0, stdout: "", stderr: "" };
            },
        });

        assert.equal(backup.mode, "local");
        assert.equal(calls.every(({ command }) => command === "docker"), true);
        const dumpCall = calls.find(({ args }) =>
            args.includes("pg_dump") && !args.includes("--version"),
        );
        assert.ok(dumpCall);
        assert.equal(
            dumpCall.args[dumpCall.args.indexOf("--volume") + 1],
            `${path.dirname(backup.backupPath)}:/backup`,
        );
        assert.equal(dumpCall.options.env.PGPASSWORD, "very-secret");
        assert.doesNotMatch(
            JSON.stringify(calls.map(({ command, args }) => ({ command, args }))),
            /very-secret|postgresql:\/\//,
        );
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("falha de pg_dump remove artefactos locais parciais", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-local-partial-"));
    const backupDir = path.join(root, "backups");
    try {
        await assert.rejects(
            runDailyBackup({
                mode: "local",
                backupDir,
                databaseUrl: DATABASE_URL,
                runCommand: (command, args) => {
                    if (args.includes("--version")) return fakePgDump(command, args);
                    writeFileSync(args[args.indexOf("--file") + 1], "partial");
                    return { status: 1, stdout: "", stderr: "sensitive detail" };
                },
            }),
            /pg_dump terminou com erro/,
        );
        assert.deepEqual(await readdir(backupDir), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("manifesto alterado, dump truncado e hash divergente falham antes do restore", async (t) => {
    await t.test("manifesto alterado", async () => {
        const root = await mkdtemp(path.join(tmpdir(), "opsa-local-manifest-"));
        try {
            const backup = await createLocalBackup(root);
            writeFileSync(backup.manifestPath, `${readFileSync(backup.manifestPath, "utf8")}\n`);
            await assert.rejects(
                verifyBackupRestore({
                    mode: "local",
                    bundle: { manifestPath: backup.manifestPath },
                    env: { DATABASE_URL, RESTORE_DATABASE_URL },
                    runCommand: () => {
                        throw new Error("restore não deveria arrancar");
                    },
                }),
                /Hash do manifesto local divergente/,
            );
        } finally {
            await rm(root, { recursive: true, force: true });
        }
    });

    await t.test("dump truncado", async () => {
        const root = await mkdtemp(path.join(tmpdir(), "opsa-local-truncated-"));
        try {
            const backup = await createLocalBackup(root);
            writeFileSync(backup.backupPath, "x");
            await assert.rejects(
                verifyBackupRestore({
                    mode: "local",
                    bundle: backup,
                    env: { DATABASE_URL, RESTORE_DATABASE_URL },
                    runCommand: () => {
                        throw new Error("restore não deveria arrancar");
                    },
                }),
                /Dump local truncado/,
            );
        } finally {
            await rm(root, { recursive: true, force: true });
        }
    });

    await t.test("hash do dump divergente", async () => {
        const root = await mkdtemp(path.join(tmpdir(), "opsa-local-hash-"));
        try {
            const backup = await createLocalBackup(root);
            writeFileSync(backup.backupPath, "X".repeat(backup.sizeBytes));
            await assert.rejects(
                verifyBackupRestore({
                    mode: "local",
                    bundle: backup,
                    env: { DATABASE_URL, RESTORE_DATABASE_URL },
                    runCommand: () => {
                        throw new Error("restore não deveria arrancar");
                    },
                }),
                /Hash do dump local divergente/,
            );
        } finally {
            await rm(root, { recursive: true, force: true });
        }
    });
});

test("restore local bloqueia base não descartável e igualdade com a origem", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-local-target-"));
    try {
        const backup = await createLocalBackup(root);
        await assert.rejects(
            verifyBackupRestore({
                mode: "local",
                bundle: backup,
                env: {
                    DATABASE_URL,
                    RESTORE_DATABASE_URL:
                        "postgresql://user:secret@127.0.0.1:5432/opsa_production",
                },
                runCommand: () => ({ status: 0, stdout: "", stderr: "" }),
            }),
            /base descartável/,
        );
        const sameDisposableUrl =
            "postgresql://user:secret@127.0.0.1:5432/opsa_demo_restore";
        await assert.rejects(
            verifyBackupRestore({
                mode: "local",
                bundle: backup,
                env: {
                    DATABASE_URL: sameDisposableUrl,
                    RESTORE_DATABASE_URL: sameDisposableUrl,
                },
                runCommand: () => ({ status: 0, stdout: "", stderr: "" }),
            }),
            /não pode apontar para a base de origem/,
        );
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("verify local deteta pg_restore ausente sem expor credenciais", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-local-tool-"));
    try {
        const backup = await createLocalBackup(root);
        await assert.rejects(
            verifyBackupRestore({
                mode: "local",
                bundle: backup,
                env: { DATABASE_URL, RESTORE_DATABASE_URL },
                runCommand: () => ({
                    error: Object.assign(new Error("missing"), { code: "ENOENT" }),
                    status: null,
                }),
            }),
            /Ferramenta PostgreSQL em falta: pg_restore/,
        );
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("verify unitário preserva formato público sem ser apresentado como roundtrip real", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-local-verify-"));
    const calls = [];
    try {
        const backup = await createLocalBackup(root);
        const result = await verifyBackupRestore({
            mode: "local",
            bundle: backup,
            env: { DATABASE_URL, RESTORE_DATABASE_URL },
            runCommand: (command, args) => {
                calls.push({ command, args });
                if (args.includes("--version")) {
                    return { status: 0, stdout: `${command} 17`, stderr: "" };
                }
                if (command === "pg_restore") {
                    return { status: 0, stdout: "", stderr: "" };
                }
                const sql = args[args.indexOf("--command") + 1];
                if (sql.includes("_prisma_migrations") && sql.startsWith("SELECT COUNT")) {
                    return { status: 0, stdout: "3\n", stderr: "" };
                }
                if (sql.includes("information_schema.tables")) {
                    return { status: 0, stdout: "Company\n_prisma_migrations\n", stderr: "" };
                }
                return {
                    status: 0,
                    stdout: '{"Company":"2","_prisma_migrations":"3"}\n',
                    stderr: "",
                };
            },
        });
        assert.equal(result.mode, "local");
        assert.equal(result.restorable, true);
        assert.equal(result.migrationCount, 3);
        assert.deepEqual(result.comparedEntities, ["Company", "_prisma_migrations"]);
        assert.doesNotMatch(JSON.stringify(calls), /very-secret|other-secret|postgresql:\/\//);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("verify local Compose usa restore readonly e compara origem/destino sem mounts extra", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-compose-verify-"));
    const calls = [];
    const composeRestoreUrl =
        "postgresql://restore_user:other-secret@127.0.0.1:5435/opsa_demo_restore";
    try {
        const backup = await createLocalBackup(root);
        const result = await verifyBackupRestore({
            mode: "local",
            bundle: backup,
            env: {
                OPSA_POSTGRES_CLI_MODE: "compose",
                DATABASE_URL: COMPOSE_DATABASE_URL,
                RESTORE_DATABASE_URL: composeRestoreUrl,
            },
            runCommand: (command, args, options) => {
                calls.push({ command, args, options });
                const toolIndex = args.indexOf("postgres-tools") + 1;
                const tool = args[toolIndex];
                const toolArgs = args.slice(toolIndex + 1);
                if (toolArgs.includes("--version")) {
                    return {
                        status: 0,
                        stdout: `${tool} (PostgreSQL) 17`,
                        stderr: "",
                    };
                }
                if (tool === "pg_restore") {
                    return { status: 0, stdout: "", stderr: "" };
                }
                assert.equal(tool, "psql");
                const sql = toolArgs[toolArgs.indexOf("--command") + 1];
                if (
                    sql.includes("_prisma_migrations") &&
                    sql.startsWith("SELECT COUNT")
                ) {
                    return { status: 0, stdout: "3\n", stderr: "" };
                }
                if (sql.includes("information_schema.tables")) {
                    return {
                        status: 0,
                        stdout: "Company\n_prisma_migrations\n",
                        stderr: "",
                    };
                }
                return {
                    status: 0,
                    stdout: '{"Company":"2","_prisma_migrations":"3"}\n',
                    stderr: "",
                };
            },
        });

        assert.equal(result.restorable, true);
        const restoreCall = calls.find(({ args }) =>
            args.includes("pg_restore") && !args.includes("--version"),
        );
        assert.match(
            restoreCall.args[restoreCall.args.indexOf("--volume") + 1],
            /:\/backup:ro$/,
        );
        const psqlCalls = calls.filter(({ args }) =>
            args.includes("psql") && !args.includes("--version"),
        );
        assert.equal(psqlCalls.every(({ args }) => !args.includes("--volume")), true);
        const queriedHosts = new Set(
            psqlCalls.map(({ args }) => {
                const toolArgs = args.slice(args.indexOf("psql") + 1);
                return toolArgs[toolArgs.indexOf("--host") + 1];
            }),
        );
        assert.deepEqual(queriedHosts, new Set(["postgres", "postgres-restore"]));
        assert.doesNotMatch(
            JSON.stringify(calls.map(({ command, args }) => ({ command, args }))),
            /very-secret|other-secret|postgresql:\/\//,
        );
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("modo remoto incompleto falha sem fallback local silencioso", async () => {
    await assert.rejects(
        verifyBackupRestore({
            mode: "remote",
            args: [
                "--manifest-key",
                "backups/demo/manifest.json",
                "--manifest-sha256",
                "a".repeat(64),
            ],
            env: { DATABASE_URL, RESTORE_DATABASE_URL, NODE_ENV: "development" },
            runCommand: (command) => ({
                status: 0,
                stdout: `${command} 17`,
                stderr: "",
            }),
        }),
        /BACKUP_S3_BUCKET é obrigatório/,
    );
});

test("aliases antigos mantêm o percurso local e os aliases remotos são explícitos", () => {
    const packageJson = JSON.parse(
        readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    );
    assert.equal(packageJson.scripts["mf7:backup"], "node scripts/run-daily-backup.mjs");
    assert.equal(
        packageJson.scripts["mf7:backup:verify"],
        "node scripts/verify-backup-restore.mjs",
    );
    assert.equal(resolveBackupMode([], {}), "local");
    assert.equal(resolveBackupMode(["--remote"], {}), "remote");
    assert.match(packageJson.scripts["mf7:backup:remote"], /--remote$/);
    assert.deepEqual(
        resolveLocalBackupBundle(["--file", "/tmp/opsa-demo.dump"], {}),
        { manifestPath: "/tmp/opsa-demo.dump.json", manifestSha256: undefined },
    );
});

test("cleanup local é idempotente em sucesso", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-cleanup-idempotent-"));
    const target = path.join(root, "nested");
    await mkdir(target);
    await removeLocalPathsAndConfirmAbsent([target], "cleanup falhou");
    await removeLocalPathsAndConfirmAbsent([target], "cleanup repetido falhou");
    await rm(root, { recursive: true, force: true });
});
