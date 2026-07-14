/**
 * @file Compactação idempotente e paginada dos alias maps legados do chat.
 *
 * Não lê nem reescreve mensagens. Deve ser executado apenas depois do cutover
 * v2 e pode ser repetido sem alterar sessões já compactadas.
 */

import { PrismaClient } from "@prisma/client";
import { loadApiEnv } from "../src/config/env.js";
import { decryptAiChatPayload, encryptAiChatPayload, parseAiChatEncryptionKey } from "../src/modules/ai/aiChatCrypto.js";

const BATCH_SIZE = 100;
const prisma = new PrismaClient();

async function main() {
    const config = loadApiEnv(process.env).ai;
    if (!config.chatEnabled) throw new Error("AI_CHAT_ENABLED tem de estar ativo durante a compactação.");
    const key = parseAiChatEncryptionKey(config.chatEncryptionKey);
    let cursor = null;
    let scanned = 0;
    let compacted = 0;
    while (true) {
        const sessions = await prisma.aiChatSession.findMany({
            orderBy: { id: "asc" },
            take: BATCH_SIZE,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            select: { id: true, aliasMapEncrypted: true },
        });
        if (sessions.length === 0) break;
        for (const session of sessions) {
            scanned += 1;
            const aliases = session.aliasMapEncrypted ? decryptAiChatPayload(session.aliasMapEncrypted, key) : {};
            if (Object.keys(aliases).length === 0) continue;
            await prisma.aiChatSession.update({
                where: { id: session.id },
                data: { aliasMapEncrypted: encryptAiChatPayload({}, key) },
            });
            compacted += 1;
        }
        cursor = sessions.at(-1).id;
    }
    process.stdout.write(`${JSON.stringify({ scanned, compacted })}\n`);
}

try {
    await main();
} finally {
    await prisma.$disconnect();
}
