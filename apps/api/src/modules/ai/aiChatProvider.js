/**
 * @file Providers qualitativos do chat OPSA.
 *
 * O provider externo nunca escolhe ferramentas, não recebe perguntas livres,
 * histórico, identificadores ou métricas. A API entrega-lhe apenas um contrato
 * canónico qualitativo e mantém a autoria exclusiva de todos os factos.
 */

import OpenAI from "openai";
import { assertOutboundAiSafe } from "./aiPrivacy.js";

export const AI_CHAT_OUTPUT_SCHEMA = Object.freeze({
    type: "object",
    additionalProperties: false,
    properties: {
        status: { type: "string", enum: ["ANSWERED", "INSUFFICIENT_DATA", "REFUSED"] },
        narrative: { type: "string", minLength: 1, maxLength: 2_000 },
        limitations: { type: "array", maxItems: 10, items: { type: "string", maxLength: 240 } },
        followUpSuggestions: { type: "array", minItems: 1, maxItems: 3, items: { type: "string", maxLength: 240 } },
    },
    required: ["status", "narrative", "limitations", "followUpSuggestions"],
});

export class AiChatProvider {
    async generate() {
        throw new Error("AiChatProvider.generate deve ser implementado.");
    }
}

/** Provider injetável usado em testes do limite de confiança. */
export class FakeProvider extends AiChatProvider {
    constructor(handler) {
        super();
        this.handler = handler;
        this.payloads = [];
    }

    async generate(input) {
        this.payloads.push(structuredClone({ ...input, signal: undefined }));
        return this.handler(input);
    }
}

export class OpenAiProvider extends AiChatProvider {
    constructor(config) {
        super();
        this.model = config.model;
        this.maxOutputTokens = config.maxOutputTokens;
        this.client = new OpenAI({ apiKey: config.apiKey, timeout: config.timeoutMs, maxRetries: 0 });
    }

    /** Gera apenas enquadramento qualitativo a partir de sinais fechados. */
    async generate({ canonical, safetyIdentifier, signal }) {
        const payload = assertOutboundAiSafe({
            model: this.model,
            instructions: [
                "És o assistente qualitativo read-only da OPSA.",
                "Não inventes números, moedas, percentagens, fontes, entidades ou identificadores.",
                "Não calcules métricas e não proponhas alterações automáticas a dados empresariais.",
                "Usa apenas a intenção, qualidade, sinais e limitações canónicas recebidas.",
                "Responde em português de Portugal sem algarismos.",
            ].join(" "),
            input: [{ role: "user", content: JSON.stringify(canonical) }],
            max_output_tokens: this.maxOutputTokens,
            store: false,
            safety_identifier: safetyIdentifier,
            text: { format: { type: "json_schema", name: "opsa_qualitative_response", strict: true, schema: AI_CHAT_OUTPUT_SCHEMA } },
        });
        const response = await this.client.responses.create(payload, { signal });
        const text = response.output_text ?? response.output
            ?.flatMap((item) => item.content ?? [])
            .find((part) => part.type === "output_text")?.text;
        if (!text) throw new Error("AI_PROVIDER_EMPTY_RESPONSE");
        return {
            response: JSON.parse(text),
            inputTokens: response.usage?.input_tokens ?? 0,
            outputTokens: response.usage?.output_tokens ?? 0,
            model: response.model ?? this.model,
            provider: "openai",
        };
    }
}

export function createAiChatProvider(aiConfig, override = null) {
    if (override) return override;
    if (!aiConfig.chatEnabled || aiConfig.providerMode !== "openai") return null;
    return new OpenAiProvider({
        apiKey: aiConfig.openAiApiKey,
        model: aiConfig.model,
        timeoutMs: aiConfig.timeoutMs,
        maxOutputTokens: aiConfig.maxOutputTokens,
    });
}
