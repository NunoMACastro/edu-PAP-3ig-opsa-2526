/**
 * @file Preflight seguro da configuração local da API OPSA.
 *
 * Valida apenas contratos e seleção de adapters. Não abre sockets, não liga a
 * PostgreSQL/Redis/S3/SMTP/OpenAI e nunca imprime valores de ambiente.
 */

import { assertApiStartupEnv, loadApiEnv } from "../src/config/env.js";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import { createEmailOutbox } from "../src/runtimeDependencies.js";
import { createObjectStorage } from "../src/modules/storage/objectStorage.js";

loadLocalEnvFile();

const apiEnv = loadApiEnv(process.env);
assertApiStartupEnv(apiEnv);
const objectStorage = createObjectStorage(process.env, {
    provider: apiEnv.providers.storage,
});
createEmailOutbox({ encryptionKey: apiEnv.emailOutboxEncryptionKey });

console.info(
    JSON.stringify({
        event: "local_config.valid",
        profile: apiEnv.isProduction ? "production_like" : "demo_academica_local",
        database: "configured",
        redis: apiEnv.providers.redis,
        storage: objectStorage.provider,
        email: apiEnv.providers.email,
        aiChat: apiEnv.ai.chatEnabled ? "enabled" : "disabled",
        aiProvider: apiEnv.ai.providerMode,
    }),
);
