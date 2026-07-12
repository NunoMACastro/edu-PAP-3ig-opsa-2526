/**
 * @file Entrypoint CLI da infraestrutura modular de seeds OPSA.
 */

import { PrismaClient } from "@prisma/client";
import { loadLocalEnvFile } from "../src/config/envFile.js";
import { createObjectStorage } from "../src/modules/storage/objectStorage.js";
import { buildSeedConfig, DEMO_NAMESPACE, LOAD_NAMESPACE } from "./seeds/config.js";
import { seedDemoProfile } from "./seeds/demo.js";
import { seedLoadProfile } from "./seeds/load.js";
import {
    acquireSeedLock,
    releaseSeedLock,
    resetSeedNamespace,
} from "./seeds/reset.js";
import { verifySeedProfile } from "./seeds/verify.js";

loadLocalEnvFile();

function cliOption(name) {
    const exactIndex = process.argv.indexOf(`--${name}`);
    if (exactIndex >= 0) return process.argv[exactIndex + 1];
    const inline = process.argv.find((argument) => argument.startsWith(`--${name}=`));
    return inline ? inline.slice(name.length + 3) : null;
}

function selectedProfile() {
    const profile = String(cliOption("profile") ?? "demo").trim().toLowerCase();
    if (!["demo", "load", "verify"].includes(profile)) {
        throw new Error("--profile deve ser demo, load ou verify.");
    }
    return profile;
}

function verificationNamespace() {
    const target = String(
        cliOption("target") ?? process.env.OPSA_SEED_VERIFY_PROFILE ?? "demo",
    ).trim().toLowerCase();
    if (!["demo", "load"].includes(target)) {
        throw new Error("--target deve ser demo ou load.");
    }
    return target === "load" ? LOAD_NAMESPACE : DEMO_NAMESPACE;
}

function printSummary(payload, config) {
    console.info(JSON.stringify(payload, null, 2));
    if (payload.seed?.profile === "demo") {
        console.info(`Login demo: admin@opsa.demo / ${config.password}`);
        console.info("Depois do login, seleciona 'OPSA Demo Comercio, Lda' em Empresas e contexto.");
    }
}

/**
 * Executa reset, seed e verificacao com lock de processo na base PostgreSQL.
 *
 * @returns {Promise<object>} Seed e auditoria final.
 */
export async function main() {
    const profile = selectedProfile();
    const config = buildSeedConfig();
    const namespace = profile === "verify"
        ? verificationNamespace()
        : profile === "load" ? LOAD_NAMESPACE : DEMO_NAMESPACE;
    const prisma = new PrismaClient();
    const objectStorage = createObjectStorage(process.env);
    let locked = false;
    try {
        await acquireSeedLock(prisma, namespace);
        locked = true;
        if (profile === "verify") {
            const verification = await verifySeedProfile(prisma, {
                namespace,
                config,
                objectStorage,
            });
            const payload = { verification };
            printSummary(payload, config);
            return payload;
        }

        await objectStorage.checkOperationalAccess();
        const reset = await resetSeedNamespace(prisma, { namespace, objectStorage });
        const seed = profile === "load"
            ? await seedLoadProfile(prisma, { config })
            : await seedDemoProfile(prisma, { config, objectStorage });
        const verification = await verifySeedProfile(prisma, {
            namespace,
            config,
            objectStorage,
        });
        const payload = { reset, seed, verification };
        printSummary(payload, config);
        return payload;
    } finally {
        if (locked) await releaseSeedLock(prisma, namespace);
        await prisma.$disconnect();
    }
}

await main();
