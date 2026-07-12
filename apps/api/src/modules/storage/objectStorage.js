/**
 * @file Adapter privado de object storage S3 compatível e fallback local de desenvolvimento.
 *
 * Produção e testes de integração exigem configuração S3. O adapter local só
 * pode ser selecionado automaticamente em `development` e nunca expõe pastas
 * via Express static.
 */

import {
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { randomBytes, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
    copyFile,
    mkdir,
    readFile,
    readdir,
    rm,
    stat,
    writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { httpError } from "../../lib/httpErrors.js";

const ALLOWED_S3_SSE = new Set(["AES256", "aws:kms", "aws:kms:dsse"]);
const HEALTH_OBJECT_PREFIX = "health/readiness";

/**
 * Valida endpoint, bucket e cifra antes de criar um cliente que possa receber
 * documentos contabilísticos. Fora de development, S3 nunca usa HTTP simples.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente runtime.
 * @param {string} bucketName - Bucket primário ou de backup já selecionado.
 * @returns {{ endpoint: string, bucket: string, serverSideEncryption: string }} Configuração normalizada.
 */
function validateRemoteS3Configuration(env, bucketName) {
    let endpoint;
    try {
        endpoint = new URL(String(env.S3_ENDPOINT));
    } catch {
        throw new Error("S3_ENDPOINT deve ser um URL válido.");
    }
    if (!["http:", "https:"].includes(endpoint.protocol)) {
        throw new Error("S3_ENDPOINT deve usar HTTP ou HTTPS.");
    }
    if (endpoint.username || endpoint.password) {
        throw new Error("S3_ENDPOINT não pode conter credenciais.");
    }
    if ((env.NODE_ENV ?? "development") !== "development" && endpoint.protocol !== "https:") {
        throw new Error("S3_ENDPOINT deve usar HTTPS fora de development.");
    }
    const bucket = String(bucketName ?? "").trim();
    if (
        bucket.length < 3 ||
        bucket.length > 63 ||
        !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(bucket) ||
        bucket.includes("..")
    ) {
        throw new Error("Nome de bucket S3 inválido.");
    }
    const serverSideEncryption = String(env.S3_SSE ?? "").trim();
    if (!ALLOWED_S3_SSE.has(serverSideEncryption)) {
        throw new Error(
            "S3_SSE deve ser AES256, aws:kms ou aws:kms:dsse.",
        );
    }
    return {
        endpoint: endpoint.toString(),
        bucket,
        serverSideEncryption,
    };
}

/**
 * Valida uma storage key relativa e sem traversal.
 *
 * @param {unknown} value - Chave externa ou interna.
 * @returns {string} Chave normalizada.
 */
function normalizeKey(value) {
    const key = String(value ?? "").replaceAll("\\", "/").replace(/^\/+/, "");
    if (!key || key.split("/").some((part) => !part || part === "." || part === "..")) {
        throw httpError(400, "INVALID_STORAGE_KEY", "Chave de storage inválida.");
    }
    return key;
}

/**
 * Reconhece apenas respostas inequívocas de objeto inexistente. Erros de rede,
 * autenticação ou autorização são propagados para manter o probe fail-closed.
 *
 * @param {unknown} error - Erro devolvido pelo provider S3.
 * @returns {boolean} `true` apenas para uma resposta not-found reconhecida.
 */
function isObjectMissingError(error) {
    const codes = [error?.name, error?.Code, error?.code].map((value) =>
        String(value ?? ""),
    );
    return (
        error?.$metadata?.httpStatusCode === 404 ||
        codes.some((code) =>
            ["NotFound", "NoSuchKey", "NoSuchObject"].includes(code),
        )
    );
}

function throwIfAborted(signal) {
    if (!signal?.aborted) return;
    throw signal.reason instanceof Error
        ? signal.reason
        : new Error("Object storage operation aborted");
}

function sdkRequestOptions(signal) {
    return signal ? { abortSignal: signal } : undefined;
}

/**
 * Converte metadata em strings aceites pelo protocolo S3.
 *
 * @param {Record<string, unknown> | undefined} metadata - Metadados não sensíveis.
 * @returns {Record<string, string>} Metadata normalizada.
 */
function normalizeMetadata(metadata = {}) {
    return Object.fromEntries(
        Object.entries(metadata).map(([key, value]) => [
            key.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
            String(value).slice(0, 1000),
        ]),
    );
}

/**
 * Prova permissões mínimas de escrita, leitura e remoção com um objeto pequeno
 * e imprevisível. A chave fica isolada no prefixo de health e é removida mesmo
 * quando uma validação intermédia falha.
 *
 * @param {S3ObjectStorage | LocalObjectStorage} storage - Adapter a validar.
 * @returns {Promise<true>} `true` quando todas as operações terminam e o cleanup passa.
 */
async function checkObjectStorageOperationalAccess(storage, { signal } = {}) {
    throwIfAborted(signal);
    await storage.checkHealth({ signal });
    const key = `${HEALTH_OBJECT_PREFIX}/${randomUUID()}`;
    const payload = randomBytes(32);
    let putAttempted = false;
    let operationError;
    try {
        putAttempted = true;
        await storage.putBuffer({
            key,
            buffer: payload,
            contentType: "application/octet-stream",
            metadata: { purpose: "readiness" },
            signal,
        });
        throwIfAborted(signal);
        const head = await storage.headObject(key, { signal });
        if (head.contentLength !== payload.length) {
            throw new Error("Storage readiness devolveu tamanho inesperado.");
        }
        const downloaded = await storage.getObject(key, { signal });
        const chunks = [];
        let size = 0;
        for await (const chunk of downloaded.body) {
            throwIfAborted(signal);
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            size += buffer.length;
            if (size > payload.length) {
                downloaded.body.destroy?.();
                throw new Error("Storage readiness devolveu conteúdo excessivo.");
            }
            chunks.push(buffer);
        }
        if (!Buffer.concat(chunks).equals(payload)) {
            throw new Error("Storage readiness devolveu conteúdo divergente.");
        }
        return true;
    } catch (error) {
        operationError = error;
        throw error;
    } finally {
        // Uma falha ambígua no PUT pode ter persistido o objeto. DELETE é por
        // isso tentado sempre que o upload arrancou, sem reutilizar a chave.
        if (putAttempted) {
            try {
                await storage.deleteObject(key);
                if (await storage.objectExists(key)) {
                    throw new Error(
                        "Storage readiness não confirmou o cleanup do objeto efémero.",
                    );
                }
            } catch (cleanupError) {
                if (operationError) {
                    throw new AggregateError(
                        [operationError, cleanupError],
                        "Storage readiness falhou e o cleanup também falhou.",
                        { cause: operationError },
                    );
                }
                throw cleanupError;
            }
        }
    }
}

export class S3ObjectStorage {
    /**
     * @param {{ endpoint: string, region: string, bucket: string, accessKeyId: string, secretAccessKey: string, forcePathStyle: boolean, serverSideEncryption?: string }} config - Configuração validada.
     */
    constructor(config) {
        this.provider = "S3";
        this.bucket = config.bucket;
        this.serverSideEncryption = config.serverSideEncryption || undefined;
        this.client = new S3Client({
            endpoint: config.endpoint,
            region: config.region,
            forcePathStyle: config.forcePathStyle,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
    }

    async checkHealth({ signal } = {}) {
        await this.client.send(
            new HeadBucketCommand({ Bucket: this.bucket }),
            sdkRequestOptions(signal),
        );
        return true;
    }

    async checkOperationalAccess(options = {}) {
        return checkObjectStorageOperationalAccess(this, options);
    }

    async putFile({ key, filePath, contentType, metadata }) {
        const objectKey = normalizeKey(key);
        const info = await stat(filePath);
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: objectKey,
                Body: createReadStream(filePath),
                ContentLength: info.size,
                ContentType: contentType,
                Metadata: normalizeMetadata(metadata),
                ServerSideEncryption: this.serverSideEncryption,
            }),
        );
        return { key: objectKey, sizeBytes: info.size, provider: this.provider };
    }

    async putBuffer({ key, buffer, contentType, metadata, signal }) {
        const objectKey = normalizeKey(key);
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: objectKey,
                Body: buffer,
                ContentLength: buffer.length,
                ContentType: contentType,
                Metadata: normalizeMetadata(metadata),
                ServerSideEncryption: this.serverSideEncryption,
            }),
            sdkRequestOptions(signal),
        );
        return { key: objectKey, sizeBytes: buffer.length, provider: this.provider };
    }

    /**
     * Grava um stream com tamanho conhecido sem materializar o objeto em memória.
     *
     * @param {{ key: string, stream: import("node:stream").Readable, contentLength: number, contentType?: string, metadata?: Record<string, unknown> }} input - Objeto a persistir.
     * @returns {Promise<{ key: string, sizeBytes: number, provider: string }>} Descriptor seguro.
     */
    async putStream({ key, stream, contentLength, contentType, metadata }) {
        const objectKey = normalizeKey(key);
        if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
            throw new Error("contentLength inválido para upload S3.");
        }
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: objectKey,
                Body: stream,
                ContentLength: contentLength,
                ContentType: contentType,
                Metadata: normalizeMetadata(metadata),
                ServerSideEncryption: this.serverSideEncryption,
            }),
        );
        return { key: objectKey, sizeBytes: contentLength, provider: this.provider };
    }

    async copyObject(sourceKey, destinationKey) {
        const source = normalizeKey(sourceKey);
        const destination = normalizeKey(destinationKey);
        const encodedSource = `/${this.bucket}/${source
            .split("/")
            .map(encodeURIComponent)
            .join("/")}`;
        await this.client.send(
            new CopyObjectCommand({
                Bucket: this.bucket,
                CopySource: encodedSource,
                Key: destination,
                ServerSideEncryption: this.serverSideEncryption,
            }),
        );
        return { key: destination, provider: this.provider };
    }

    async getObject(key, { signal } = {}) {
        const result = await this.client.send(
            new GetObjectCommand({ Bucket: this.bucket, Key: normalizeKey(key) }),
            sdkRequestOptions(signal),
        );
        return {
            body: result.Body,
            contentLength: result.ContentLength,
            contentType: result.ContentType,
            metadata: result.Metadata ?? {},
        };
    }

    async headObject(key, { signal } = {}) {
        const result = await this.client.send(
            new HeadObjectCommand({ Bucket: this.bucket, Key: normalizeKey(key) }),
            sdkRequestOptions(signal),
        );
        return {
            contentLength: result.ContentLength,
            contentType: result.ContentType,
            metadata: result.Metadata ?? {},
        };
    }

    async objectExists(key, options = {}) {
        try {
            await this.headObject(key, options);
            return true;
        } catch (error) {
            if (isObjectMissingError(error)) return false;
            throw error;
        }
    }

    async deleteObject(key, { signal } = {}) {
        await this.client.send(
            new DeleteObjectCommand({ Bucket: this.bucket, Key: normalizeKey(key) }),
            sdkRequestOptions(signal),
        );
    }

    async listObjects(prefix = "") {
        const normalizedPrefix = prefix ? normalizeKey(prefix) : undefined;
        const objects = [];
        let continuationToken;
        do {
            const result = await this.client.send(
                new ListObjectsV2Command({
                    Bucket: this.bucket,
                    Prefix: normalizedPrefix,
                    ContinuationToken: continuationToken,
                }),
            );
            objects.push(
                ...(result.Contents ?? []).map((item) => ({
                    key: item.Key,
                    sizeBytes: item.Size,
                    etag: item.ETag?.replaceAll('"', "") ?? null,
                    lastModified: item.LastModified ?? null,
                })),
            );
            continuationToken = result.IsTruncated
                ? result.NextContinuationToken
                : undefined;
        } while (continuationToken);
        return objects;
    }
}

export class LocalObjectStorage {
    /**
     * @param {string} root - Raiz privada de desenvolvimento.
     */
    constructor(root) {
        this.provider = "LOCAL";
        this.root = path.resolve(root);
    }

    resolve(key) {
        const normalized = normalizeKey(key);
        const filePath = path.resolve(this.root, ...normalized.split("/"));
        if (!filePath.startsWith(`${this.root}${path.sep}`)) {
            throw httpError(400, "INVALID_STORAGE_KEY", "Chave de storage inválida.");
        }
        return { normalized, filePath, metadataPath: `${filePath}.metadata.json` };
    }

    async checkHealth({ signal } = {}) {
        throwIfAborted(signal);
        await mkdir(this.root, { recursive: true, mode: 0o700 });
        throwIfAborted(signal);
        return true;
    }

    async checkOperationalAccess(options = {}) {
        return checkObjectStorageOperationalAccess(this, options);
    }

    async putFile({ key, filePath: sourcePath, contentType, metadata }) {
        const target = this.resolve(key);
        await mkdir(path.dirname(target.filePath), { recursive: true, mode: 0o700 });
        await copyFile(sourcePath, target.filePath);
        await writeFile(
            target.metadataPath,
            JSON.stringify({ contentType, metadata: normalizeMetadata(metadata) }),
            { mode: 0o600 },
        );
        const info = await stat(target.filePath);
        return { key: target.normalized, sizeBytes: info.size, provider: this.provider };
    }

    async putBuffer({ key, buffer, contentType, metadata, signal }) {
        throwIfAborted(signal);
        const target = this.resolve(key);
        await mkdir(path.dirname(target.filePath), { recursive: true, mode: 0o700 });
        await writeFile(target.filePath, buffer, { mode: 0o600 });
        await writeFile(
            target.metadataPath,
            JSON.stringify({ contentType, metadata: normalizeMetadata(metadata) }),
            { mode: 0o600 },
        );
        throwIfAborted(signal);
        return { key: target.normalized, sizeBytes: buffer.length, provider: this.provider };
    }

    /**
     * Grava um stream no adapter local com o mesmo contrato do provider S3.
     *
     * @param {{ key: string, stream: import("node:stream").Readable, contentLength: number, contentType?: string, metadata?: Record<string, unknown> }} input - Objeto a persistir.
     * @returns {Promise<{ key: string, sizeBytes: number, provider: string }>} Descriptor seguro.
     */
    async putStream({ key, stream, contentLength, contentType, metadata }) {
        const target = this.resolve(key);
        if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
            throw new Error("contentLength inválido para upload local.");
        }
        await mkdir(path.dirname(target.filePath), { recursive: true, mode: 0o700 });
        const { createWriteStream } = await import("node:fs");
        await pipeline(stream, createWriteStream(target.filePath, { mode: 0o600 }));
        const info = await stat(target.filePath);
        if (info.size !== contentLength) {
            await rm(target.filePath, { force: true });
            throw new Error("Stream incompleto: tamanho persistido não corresponde ao anunciado.");
        }
        await writeFile(
            target.metadataPath,
            JSON.stringify({ contentType, metadata: normalizeMetadata(metadata) }),
            { mode: 0o600 },
        );
        return { key: target.normalized, sizeBytes: info.size, provider: this.provider };
    }

    async copyObject(sourceKey, destinationKey) {
        const source = this.resolve(sourceKey);
        const destination = this.resolve(destinationKey);
        await mkdir(path.dirname(destination.filePath), {
            recursive: true,
            mode: 0o700,
        });
        await copyFile(source.filePath, destination.filePath);
        try {
            await copyFile(source.metadataPath, destination.metadataPath);
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
        }
        return { key: destination.normalized, provider: this.provider };
    }

    async getObject(key, { signal } = {}) {
        throwIfAborted(signal);
        const target = this.resolve(key);
        const info = await stat(target.filePath);
        let descriptor = {};
        try {
            descriptor = JSON.parse(await readFile(target.metadataPath, "utf8"));
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
        }
        throwIfAborted(signal);
        return {
            body: createReadStream(target.filePath),
            contentLength: info.size,
            contentType: descriptor.contentType,
            metadata: descriptor.metadata ?? {},
        };
    }

    async headObject(key, options = {}) {
        const object = await this.getObject(key, options);
        object.body.destroy();
        return {
            contentLength: object.contentLength,
            contentType: object.contentType,
            metadata: object.metadata,
        };
    }

    async objectExists(key, { signal } = {}) {
        throwIfAborted(signal);
        const target = this.resolve(key);
        const checks = await Promise.allSettled([
            stat(target.filePath),
            stat(target.metadataPath),
        ]);
        throwIfAborted(signal);
        if (checks.some(({ status }) => status === "fulfilled")) return true;
        const unexpected = checks.find(
            ({ status, reason }) =>
                status === "rejected" && reason?.code !== "ENOENT",
        );
        if (unexpected) throw unexpected.reason;
        return false;
    }

    async deleteObject(key, { signal } = {}) {
        throwIfAborted(signal);
        const target = this.resolve(key);
        await Promise.all([
            rm(target.filePath, { force: true }),
            rm(target.metadataPath, { force: true }),
        ]);
        throwIfAborted(signal);
    }

    async listObjects(prefix = "") {
        await this.checkHealth();
        const normalizedPrefix = prefix ? normalizeKey(prefix) : "";
        const start = normalizedPrefix ? this.resolve(normalizedPrefix).filePath : this.root;
        const objects = [];

        async function walk(directory, root) {
            let entries;
            try {
                entries = await readdir(directory, { withFileTypes: true });
            } catch (error) {
                if (error.code === "ENOENT") return;
                throw error;
            }
            for (const entry of entries) {
                const fullPath = path.join(directory, entry.name);
                if (entry.isDirectory()) {
                    await walk(fullPath, root);
                } else if (!entry.name.endsWith(".metadata.json")) {
                    const info = await stat(fullPath);
                    objects.push({
                        key: path.relative(root, fullPath).split(path.sep).join("/"),
                        sizeBytes: info.size,
                        etag: null,
                        lastModified: info.mtime,
                    });
                }
            }
        }
        await walk(start, this.root);
        return objects.sort((left, right) => left.key.localeCompare(right.key));
    }
}

/**
 * Seleciona S3 ou desenvolvimento local sem fallback inseguro em test/prod.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente.
 * @param {{ localRoot?: string }} [options] - Raiz local explícita.
 * @returns {S3ObjectStorage | LocalObjectStorage} Adapter configurado.
 */
export function createObjectStorage(env = process.env, options = {}) {
    const requiredConnection = [
        "S3_ENDPOINT",
        "S3_REGION",
        "S3_ACCESS_KEY_ID",
        "S3_SECRET_ACCESS_KEY",
    ];
    const bucketName = options.bucket ?? env.S3_BUCKET;
    const suppliedValues = [
        ...requiredConnection.map((key) => env[key]),
        bucketName,
        env.S3_FORCE_PATH_STYLE,
        env.S3_SSE,
    ];
    const hasAnyS3Value = suppliedValues.some((value) => String(value ?? "").trim());
    const configured =
        requiredConnection.every((key) => String(env[key] ?? "").trim()) &&
        Boolean(String(bucketName ?? "").trim()) &&
        Boolean(String(env.S3_SSE ?? "").trim());
    if (configured) {
        if (!["true", "false"].includes(String(env.S3_FORCE_PATH_STYLE ?? ""))) {
            throw new Error("S3_FORCE_PATH_STYLE deve ser true ou false.");
        }
        const remote = validateRemoteS3Configuration(env, bucketName);
        return new S3ObjectStorage({
            endpoint: remote.endpoint,
            region: env.S3_REGION,
            bucket: remote.bucket,
            accessKeyId: env.S3_ACCESS_KEY_ID,
            secretAccessKey: env.S3_SECRET_ACCESS_KEY,
            forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
            serverSideEncryption: remote.serverSideEncryption,
        });
    }
    if (!hasAnyS3Value && (env.NODE_ENV ?? "development") === "development") {
        return new LocalObjectStorage(
            options.localRoot ?? env.OPSA_PRIVATE_STORAGE_ROOT ?? "private-storage",
        );
    }
    throw new Error(
        "Configuração S3 completa, incluindo S3_SSE, é obrigatória fora de development e quando qualquer opção S3 é fornecida.",
    );
}

/**
 * Cria o storage isolado de backups usando o bucket dedicado do ambiente.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env - Ambiente.
 * @param {{ localRoot?: string }} [options] - Apenas para testes unitários explícitos.
 * @returns {S3ObjectStorage | LocalObjectStorage} Adapter do bundle de backup.
 */
export function createBackupObjectStorage(env = process.env, options = {}) {
    const backupBucket = String(env.BACKUP_S3_BUCKET ?? "").trim();
    if (!backupBucket) {
        if ((env.NODE_ENV ?? "development") === "development" && options.localRoot) {
            return new LocalObjectStorage(options.localRoot);
        }
        throw new Error("BACKUP_S3_BUCKET é obrigatório para backups.");
    }
    const operationalBucket = String(env.S3_BUCKET ?? "").trim();
    if (!operationalBucket) {
        throw new Error(
            "S3_BUCKET é obrigatório para provar o isolamento do bucket de backups.",
        );
    }
    if (backupBucket === operationalBucket) {
        throw new Error(
            "BACKUP_S3_BUCKET tem de ser distinto de S3_BUCKET.",
        );
    }
    return createObjectStorage(env, { ...options, bucket: backupBucket });
}
