/**
 * @file Testes de segurança do backup sem PostgreSQL, S3 ou credenciais reais.
 */

import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
    pruneExpiredBackupObjects,
    runDailyBackup,
    validateBackupPrefix,
} from "../../scripts/run-daily-backup.mjs";
import { resolveRemoteBackupBundle } from "../../scripts/verify-backup-restore.mjs";
import { LocalObjectStorage } from "../../src/modules/storage/objectStorage.js";

const DATABASE_URL = "postgresql://backup_user:test@127.0.0.1:5432/opsa_test";

/**
 * Simula apenas a criação do ficheiro que `pg_dump --file` produziria.
 *
 * @param {string} _command - Executável pedido.
 * @param {string[]} args - Argumentos de pg_dump.
 * @returns {{status: number, stdout: string, stderr: string}} Resultado sintético.
 */
function successfulPgDump(_command, args) {
    const outputPath = args[args.indexOf("--file") + 1];
    writeFileSync(outputPath, Buffer.from("PGDMP-test-content"), { mode: 0o600 });
    return { status: 0, stdout: "", stderr: "" };
}

test("backup persiste o bundle e remove sempre dump/manifesto plaintext locais", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-backup-hardening-"));
    const work = path.join(root, "work");
    const source = new LocalObjectStorage(path.join(root, "operational"));
    const backup = new LocalObjectStorage(path.join(root, "backup"));
    try {
        await source.putBuffer({
            key: "private/manual-journals/example.pdf",
            buffer: Buffer.from("%PDF-test"),
            contentType: "application/pdf",
        });
        const manifest = await runDailyBackup({
            backupDir: work,
            databaseUrl: DATABASE_URL,
            now: new Date("2026-07-10T01:00:00.000Z"),
            sourceStorage: source,
            backupStorage: backup,
            retentionDays: 30,
            runCommand: successfulPgDump,
        });

        assert.equal(manifest.objectCount, 1);
        assert.equal(manifest.encryption, "INJECTED_TEST_ADAPTER");
        assert.equal(
            manifest.manifestBackupKey,
            `${manifest.bundlePrefix}/manifest.json`,
        );
        assert.match(manifest.manifestSha256, /^[a-f0-9]{64}$/);
        assert.deepEqual(await readdir(work), []);
        assert.deepEqual(
            (await backup.listObjects(manifest.bundlePrefix)).map(({ key }) => key),
            [
                `${manifest.bundlePrefix}/database.dump`,
                `${manifest.bundlePrefix}/manifest.json`,
                `${manifest.bundlePrefix}/objects/private/manual-journals/example.pdf`,
            ],
        );
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("roundtrip parte do manifesto remoto autenticado e nunca do dump removido", () => {
    const sha256 = "a".repeat(64);
    assert.deepEqual(
        resolveRemoteBackupBundle([], {}, {
            manifestBackupKey: "backups/academic/manifest.json",
            manifestSha256: sha256.toUpperCase(),
        }),
        {
            manifestBackupKey: "backups/academic/manifest.json",
            manifestSha256: sha256,
        },
    );
    assert.throws(
        () => resolveRemoteBackupBundle(["--manifest-key", "../manifest.json"], {
            OPSA_BACKUP_MANIFEST_SHA256: sha256,
        }),
        /chave remota segura/,
    );
    assert.throws(
        () => resolveRemoteBackupBundle([], {
            OPSA_BACKUP_MANIFEST_KEY: "backups/academic/manifest.json",
            OPSA_BACKUP_MANIFEST_SHA256: "fraco",
        }),
        /SHA-256/,
    );

    const roundtripSource = readFileSync(
        new URL("../../scripts/run-backup-roundtrip.mjs", import.meta.url),
        "utf8",
    );
    assert.match(roundtripSource, /verifyBackupRestore\(\{\s*bundle: backup/s);
    assert.doesNotMatch(roundtripSource, /--file|OPSA_BACKUP_FILE/);
});

test("falha ambígua no upload limpa remoto e plaintext local", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-backup-upload-fail-"));
    const work = path.join(root, "work");
    const source = new LocalObjectStorage(path.join(root, "operational"));
    const backup = new LocalObjectStorage(path.join(root, "backup"));
    const putFile = backup.putFile.bind(backup);
    backup.putFile = async (input) => {
        const result = await putFile(input);
        if (input.key.endsWith("/manifest.json")) {
            throw new Error("resposta remota perdida depois do PUT");
        }
        return result;
    };
    try {
        await assert.rejects(
            runDailyBackup({
                backupDir: work,
                databaseUrl: DATABASE_URL,
                now: new Date("2026-07-10T01:05:00.000Z"),
                sourceStorage: source,
                backupStorage: backup,
                retentionDays: 30,
                runCommand: successfulPgDump,
            }),
            /resposta remota perdida/,
        );
        assert.deepEqual(await readdir(work), []);
        assert.deepEqual(await backup.listObjects(), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("cleanup remoto deteta DELETE no-op sem ocultar a falha original", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-backup-noop-delete-"));
    const work = path.join(root, "work");
    const source = new LocalObjectStorage(path.join(root, "operational"));
    const backup = new LocalObjectStorage(path.join(root, "backup"));
    const putFile = backup.putFile.bind(backup);
    backup.putFile = async (input) => {
        const result = await putFile(input);
        if (input.key.endsWith("/manifest.json")) {
            throw new Error("resposta remota perdida depois do PUT");
        }
        return result;
    };
    backup.deleteObject = async () => undefined;
    try {
        await source.putBuffer({
            key: "private/manual-journals/example.pdf",
            buffer: Buffer.from("%PDF-test"),
            contentType: "application/pdf",
        });
        let failure;
        try {
            await runDailyBackup({
                backupDir: work,
                databaseUrl: DATABASE_URL,
                now: new Date("2026-07-10T01:10:00.000Z"),
                sourceStorage: source,
                backupStorage: backup,
                retentionDays: 30,
                runCommand: successfulPgDump,
            });
        } catch (error) {
            failure = error;
        }

        assert.ok(failure instanceof AggregateError);
        assert.match(failure.message, /cleanup remoto não pôde ser confirmado/);
        assert.equal(
            failure.errors.some(
                (error) => error.message === "resposta remota perdida depois do PUT",
            ),
            true,
        );
        assert.equal((await backup.listObjects()).length, 3);
        assert.deepEqual(await readdir(work), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("pg_dump falhado também remove o ficheiro parcial", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-backup-dump-fail-"));
    const work = path.join(root, "work");
    const source = new LocalObjectStorage(path.join(root, "operational"));
    const backup = new LocalObjectStorage(path.join(root, "backup"));
    try {
        await assert.rejects(
            runDailyBackup({
                backupDir: work,
                databaseUrl: DATABASE_URL,
                sourceStorage: source,
                backupStorage: backup,
                retentionDays: 30,
                runCommand: (_command, args) => {
                    const outputPath = args[args.indexOf("--file") + 1];
                    writeFileSync(outputPath, Buffer.from("partial"));
                    return { status: 1, stdout: "", stderr: "private failure" };
                },
            }),
            /pg_dump terminou com erro/,
        );
        assert.deepEqual(await readdir(work), []);
        assert.deepEqual(await backup.listObjects(), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("retenção confirma DELETE e só remove o manifesto depois dos dados", async () => {
    const keys = new Set([
        "academic-backups/old/database.dump",
        "academic-backups/old/objects/a.pdf",
        "academic-backups/old/manifest.json",
    ]);
    const calls = [];
    const backupStorage = {
        listObjects: async () => [...keys].map((key) => ({
            key,
            lastModified: new Date("2026-06-01T00:00:00.000Z"),
        })),
        deleteObject: async (key) => {
            calls.push(key);
            if (!key.endsWith("database.dump")) keys.delete(key);
        },
        objectExists: async (key) => keys.has(key),
    };

    await assert.rejects(
        pruneExpiredBackupObjects({
            backupStorage,
            retentionDays: 30,
            now: new Date("2026-07-10T00:00:00.000Z"),
            backupRootPrefix: "academic-backups",
            protectedPrefix: "academic-backups/current",
        }),
        /remoção dos dados/,
    );
    assert.equal(calls.includes("academic-backups/old/manifest.json"), false);
    assert.equal(keys.has("academic-backups/old/manifest.json"), true);
});

test("falha de pruning posterior preserva integralmente o bundle novo", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-backup-pruning-fail-"));
    const work = path.join(root, "work");
    const source = new LocalObjectStorage(path.join(root, "operational"));
    const backup = new LocalObjectStorage(path.join(root, "backup"));
    const oldPrefix = "academic-backups/2026-06-01T00-00-00.000Z";
    try {
        await backup.putBuffer({
            key: `${oldPrefix}/database.dump`,
            buffer: Buffer.from("old"),
            contentType: "application/octet-stream",
        });
        await backup.putBuffer({
            key: `${oldPrefix}/manifest.json`,
            buffer: Buffer.from("{}"),
            contentType: "application/json",
        });
        const listObjects = backup.listObjects.bind(backup);
        backup.listObjects = async (prefix) => (await listObjects(prefix)).map((object) => ({
            ...object,
            lastModified: object.key.startsWith(oldPrefix)
                ? new Date("2026-06-01T00:00:00.000Z")
                : object.lastModified,
        }));
        const deleteObject = backup.deleteObject.bind(backup);
        backup.deleteObject = async (key) => {
            if (key === `${oldPrefix}/database.dump`) return;
            return deleteObject(key);
        };
        const now = new Date("2026-07-10T02:00:00.000Z");

        await assert.rejects(
            runDailyBackup({
                backupDir: work,
                databaseUrl: DATABASE_URL,
                now,
                sourceStorage: source,
                backupStorage: backup,
                retentionDays: 30,
                backupPrefix: "academic-backups",
                runCommand: successfulPgDump,
            }),
            /remoção dos dados/,
        );

        const newPrefix = `academic-backups/${now.toISOString().replaceAll(":", "-")}`;
        const newKeys = (await listObjects(newPrefix)).map(({ key }) => key);
        assert.deepEqual(newKeys, [
            `${newPrefix}/database.dump`,
            `${newPrefix}/manifest.json`,
        ]);
        assert.equal((await backup.objectExists(`${oldPrefix}/manifest.json`)), true);
        assert.deepEqual(await readdir(work), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("prefixos operacionais, traversal e storages sobrepostos são rejeitados", async () => {
    assert.equal(validateBackupPrefix("backups/academic"), "backups/academic");
    assert.throws(() => validateBackupPrefix("../private"), /BACKUP_S3_PREFIX/);
    assert.throws(() => validateBackupPrefix("private/backup"), /BACKUP_S3_PREFIX/);

    const root = await mkdtemp(path.join(tmpdir(), "opsa-backup-overlap-"));
    const source = new LocalObjectStorage(path.join(root, "objects"));
    const nestedBackup = new LocalObjectStorage(path.join(root, "objects", "backup"));
    try {
        await assert.rejects(
            runDailyBackup({
                backupDir: path.join(root, "work"),
                databaseUrl: DATABASE_URL,
                sourceStorage: source,
                backupStorage: nestedBackup,
                retentionDays: 30,
                runCommand: successfulPgDump,
            }),
            /não podem sobrepor-se/,
        );
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
