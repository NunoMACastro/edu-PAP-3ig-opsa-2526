/**
 * @file Testes do adapter local que espelha o contrato S3.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
    LocalObjectStorage,
    createBackupObjectStorage,
    createObjectStorage,
} from "../../src/modules/storage/objectStorage.js";

async function streamBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

test("adapter local suporta quarentena, promoção, download e cleanup", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-storage-test-"));
    const sourcePath = path.join(root, "source.pdf");
    await writeFile(sourcePath, Buffer.from("%PDF-test"));
    const storage = new LocalObjectStorage(path.join(root, "objects"));
    try {
        assert.equal(await storage.checkHealth(), true);
        await storage.putFile({
            key: "quarantine/file.pdf",
            filePath: sourcePath,
            contentType: "application/pdf",
            metadata: { sha256: "abc" },
        });
        await storage.copyObject(
            "quarantine/file.pdf",
            "private/manual-journals/file.pdf",
        );
        const downloaded = await storage.getObject(
            "private/manual-journals/file.pdf",
        );
        const storedPath = storage.resolve("private/manual-journals/file.pdf");
        assert.equal((await stat(storage.root)).mode & 0o777, 0o700);
        assert.equal((await stat(storedPath.filePath)).mode & 0o777, 0o600);
        assert.equal((await stat(storedPath.metadataPath)).mode & 0o777, 0o600);
        assert.equal((await streamBuffer(downloaded.body)).toString(), "%PDF-test");
        assert.equal(downloaded.metadata.sha256, "abc");
        assert.deepEqual(
            (await storage.listObjects("private")).map(({ key }) => key),
            ["private/manual-journals/file.pdf"],
        );
        await storage.deleteObject("quarantine/file.pdf");
        await storage.deleteObject("private/manual-journals/file.pdf");
        assert.deepEqual(await storage.listObjects(), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("factory nunca usa storage local silenciosamente em test ou production", () => {
    assert.throws(() => createObjectStorage({ NODE_ENV: "test" }), /S3/);
    assert.throws(() => createObjectStorage({ NODE_ENV: "production" }), /S3/);
    assert.equal(
        createObjectStorage(
            { NODE_ENV: "test" },
            { provider: "local", localRoot: "private-storage-test" },
        ).provider,
        "LOCAL",
    );
    assert.throws(
        () =>
            createObjectStorage(
                { NODE_ENV: "test", S3_BUCKET: "partial" },
                { provider: "local" },
            ),
        /fallback/,
    );
});

test("S3 remoto exige HTTPS, endpoint sem credenciais e SSE reconhecida", () => {
    const valid = {
        NODE_ENV: "test",
        S3_ENDPOINT: "https://objects.example.test",
        S3_REGION: "eu-west-1",
        S3_BUCKET: "opsa-test-files",
        S3_ACCESS_KEY_ID: "test-access-key",
        S3_SECRET_ACCESS_KEY: "test-secret-key",
        S3_FORCE_PATH_STYLE: "false",
        S3_SSE: "AES256",
    };

    assert.equal(createObjectStorage(valid).provider, "S3");
    assert.throws(
        () => createObjectStorage({ ...valid, S3_ENDPOINT: "http://objects.example.test" }),
        /HTTPS/,
    );
    assert.throws(
        () =>
            createObjectStorage({
                ...valid,
                S3_ENDPOINT: "https://user:password@objects.example.test",
            }),
        /credenciais/,
    );
    assert.throws(
        () => createObjectStorage({ ...valid, S3_SSE: "none" }),
        /S3_SSE/,
    );
});

test("development pode usar endpoint HTTP explícito mas continua a exigir SSE", () => {
    const storage = createObjectStorage({
        NODE_ENV: "development",
        S3_ENDPOINT: "http://127.0.0.1:9000",
        S3_REGION: "local",
        S3_BUCKET: "opsa-dev-files",
        S3_ACCESS_KEY_ID: "dev-access-key",
        S3_SECRET_ACCESS_KEY: "dev-secret-key",
        S3_FORCE_PATH_STYLE: "true",
        S3_SSE: "AES256",
    });
    assert.equal(storage.provider, "S3");
});

test("storage local rejeita traversal", () => {
    const storage = new LocalObjectStorage("private-storage-test");
    assert.throws(() => storage.resolve("../secret"), {
        code: "INVALID_STORAGE_KEY",
    });
});

test("probe operacional de storage faz put/head/get/delete e não deixa objetos", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-storage-health-test-"));
    const storage = new LocalObjectStorage(root);
    try {
        assert.equal(await storage.checkOperationalAccess(), true);
        assert.deepEqual(await storage.listObjects("health"), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("probe operacional remove o objeto mesmo quando a leitura falha", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-storage-health-fail-"));
    const storage = new LocalObjectStorage(root);
    const originalGetObject = storage.getObject.bind(storage);
    storage.getObject = async (key) => {
        if (String(key).startsWith("health/readiness/")) {
            throw new Error("falha privada de leitura");
        }
        return originalGetObject(key);
    };
    try {
        await assert.rejects(storage.checkOperationalAccess(), /falha privada/);
        assert.deepEqual(await storage.listObjects("health"), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("probe cancelável aborta a operação e executa cleanup antes de terminar", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-storage-health-abort-"));
    const storage = new LocalObjectStorage(root);
    const originalGetObject = storage.getObject.bind(storage);
    const controller = new AbortController();
    let markStarted;
    const started = new Promise((resolve) => {
        markStarted = resolve;
    });
    storage.getObject = async (key, { signal } = {}) => {
        if (!String(key).startsWith("health/readiness/")) {
            return originalGetObject(key, { signal });
        }
        markStarted();
        return new Promise((resolve, reject) => {
            signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        });
    };
    try {
        const probe = storage.checkOperationalAccess({ signal: controller.signal });
        await started;
        controller.abort(new Error("timeout"));
        await assert.rejects(probe, /timeout/);
        assert.deepEqual(await storage.listObjects("health"), []);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("probe operacional falha quando DELETE resolve sem remover o objeto", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opsa-storage-health-noop-delete-"));
    const storage = new LocalObjectStorage(root);
    storage.deleteObject = async () => undefined;
    try {
        await assert.rejects(
            storage.checkOperationalAccess(),
            /não confirmou o cleanup/,
        );
        assert.equal((await storage.listObjects("health")).length, 1);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("objectExists S3 aceita apenas not-found e propaga falhas de autorização", async () => {
    const storage = createObjectStorage({
        NODE_ENV: "test",
        S3_ENDPOINT: "https://objects.example.test",
        S3_REGION: "eu-west-1",
        S3_BUCKET: "opsa-test-files",
        S3_ACCESS_KEY_ID: "test-access-key",
        S3_SECRET_ACCESS_KEY: "test-secret-key",
        S3_FORCE_PATH_STYLE: "false",
        S3_SSE: "AES256",
    });

    storage.client = { send: async () => ({ ContentLength: 1 }) };
    assert.equal(await storage.objectExists("health/readiness/probe"), true);

    storage.client = {
        send: async () => {
            throw Object.assign(new Error("not found"), {
                $metadata: { httpStatusCode: 404 },
            });
        },
    };
    assert.equal(await storage.objectExists("health/readiness/probe"), false);

    storage.client = {
        send: async () => {
            throw Object.assign(new Error("private provider detail"), {
                name: "AccessDenied",
                $metadata: { httpStatusCode: 403 },
            });
        },
    };
    await assert.rejects(
        storage.objectExists("health/readiness/probe"),
        /private provider detail/,
    );
});

test("factory de backup exige bucket distinto e mantém SSE em todos os PUT", async () => {
    const env = {
        NODE_ENV: "test",
        S3_ENDPOINT: "https://objects.example.test",
        S3_REGION: "eu-west-1",
        S3_BUCKET: "opsa-test-files",
        BACKUP_S3_BUCKET: "opsa-test-backups",
        S3_ACCESS_KEY_ID: "test-access-key",
        S3_SECRET_ACCESS_KEY: "test-secret-key",
        S3_FORCE_PATH_STYLE: "false",
        S3_SSE: "AES256",
    };
    assert.throws(
        () =>
            createBackupObjectStorage({
                ...env,
                BACKUP_S3_BUCKET: env.S3_BUCKET,
            }),
        /distinto/,
    );
    const storage = createBackupObjectStorage(env);
    let commandInput;
    storage.client = {
        send: async (command) => {
            commandInput = command.input;
            return {};
        },
    };
    await storage.putBuffer({
        key: "backups/test/probe.bin",
        buffer: Buffer.from("encrypted-at-rest"),
        contentType: "application/octet-stream",
    });
    assert.equal(commandInput.Bucket, "opsa-test-backups");
    assert.equal(commandInput.ServerSideEncryption, "AES256");
});
