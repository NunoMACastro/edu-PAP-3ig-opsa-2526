/**
 * @file Testes do manifesto e restauro real de objetos do bundle de backup.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
    createObjectBackupManifest,
    verifyObjectBackupRestore,
} from "../../src/modules/storage/backupBundle.js";
import { LocalObjectStorage } from "../../src/modules/storage/objectStorage.js";

test("bundle copia objetos com SHA-256 e prova restauro num prefixo descartável", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-backup-bundle-test-"));
    const source = new LocalObjectStorage(path.join(root, "source"));
    const backup = new LocalObjectStorage(path.join(root, "backup"));
    try {
        await source.putBuffer({
            key: "private/manual-journals/a.pdf",
            buffer: Buffer.from("%PDF-backup"),
            contentType: "application/pdf",
        });
        await source.putBuffer({
            key: "quarantine/unfinished.pdf",
            buffer: Buffer.from("ignore"),
            contentType: "application/pdf",
        });

        const objects = await createObjectBackupManifest({
            sourceStorage: source,
            backupStorage: backup,
            bundlePrefix: "backups/2026-07-09",
            temporaryRoot: root,
        });
        assert.equal(objects.length, 1);
        assert.equal(objects[0].sourceKey, "private/manual-journals/a.pdf");
        assert.match(objects[0].sha256, /^[a-f0-9]{64}$/);

        const result = await verifyObjectBackupRestore({
            backupStorage: backup,
            objects,
            restorePrefix: "restore-verification/test",
            temporaryRoot: root,
        });
        assert.deepEqual(
            { objectCount: result.objectCount, totalBytes: result.totalBytes },
            { objectCount: 1, totalBytes: 11 },
        );
        assert.deepEqual(
            (await backup.listObjects("restore-verification")).map(({ key }) => key),
            [],
        );
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("restauro rejeita manifesto sem hash forte", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-backup-invalid-test-"));
    const backup = new LocalObjectStorage(path.join(root, "backup"));
    try {
        await assert.rejects(
            verifyObjectBackupRestore({
                backupStorage: backup,
                objects: [{ sourceKey: "a", backupKey: "b", sha256: "abc" }],
                temporaryRoot: root,
            }),
            /manifesto/i,
        );
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("restauro deteta cleanup no-op no prefixo descartável", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-backup-cleanup-noop-"));
    const source = new LocalObjectStorage(path.join(root, "source"));
    const backup = new LocalObjectStorage(path.join(root, "backup"));
    try {
        await source.putBuffer({
            key: "private/manual-journals/a.pdf",
            buffer: Buffer.from("%PDF-backup"),
            contentType: "application/pdf",
        });
        const objects = await createObjectBackupManifest({
            sourceStorage: source,
            backupStorage: backup,
            bundlePrefix: "backups/2026-07-10",
            temporaryRoot: root,
        });
        backup.deleteObject = async () => undefined;

        await assert.rejects(
            verifyObjectBackupRestore({
                backupStorage: backup,
                objects,
                restorePrefix: "restore-verification/noop",
                temporaryRoot: root,
            }),
            /cleanup da verificação de restauro não pôde ser confirmado/,
        );
        assert.equal(
            (await backup.listObjects("restore-verification/noop")).length,
            2,
        );
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
