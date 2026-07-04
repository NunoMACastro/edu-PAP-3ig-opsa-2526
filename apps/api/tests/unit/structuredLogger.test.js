// apps/api/tests/unit/structuredLogger.test.js

import { test } from "node:test";
import assert from "node:assert/strict";
import {
    createStructuredLogEvent,
    writeStructuredLog,
} from "../../src/modules/ops/structuredLogger.js";

test("aceita todos os níveis contratados em RNF28", () => {
    const levels = ["info", "warn", "error", "audit"];

    for (const level of levels) {
        const event = createStructuredLogEvent({
            level,
            event: `ops.${level}`,
            module: "ops",
            requirement: "RNF28",
            context: { safe: true },
        });

        // Este positivo prova que os quatro níveis do RNF28 usam o mesmo contrato seguro.
        assert.equal(event.level, level);
        assert.equal(event.context.safe, true);
        assert.match(event.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    }
});

test("rejeita nível inválido e campos obrigatórios em falta", () => {
    // O logger só aceita os níveis contratados em RNF28.
    assert.throws(
        () =>
            createStructuredLogEvent({
                level: "debug",
                event: "x",
                module: "ops",
                requirement: "RNF28",
            }),
        /Nível de log inválido/,
    );

    assert.throws(
        () =>
            createStructuredLogEvent({
                level: "info",
                event: "",
                module: "ops",
                requirement: "RNF28",
            }),
        /Evento, módulo e requisito são obrigatórios/,
    );
});

test("bloqueia chaves sensíveis no contexto", () => {
    const blockedKeys = ["rawPayload", "password", "token", "secret", "apiKey"];

    for (const key of blockedKeys) {
        assert.throws(
            () =>
                createStructuredLogEvent({
                    level: "info",
                    event: "security.check",
                    module: "ops",
                    requirement: "RNF28",
                    // Este negativo prova que credenciais nunca entram nos logs.
                    context: { [key]: "valor proibido" },
                }),
            /Campo proibido em contexto de log/,
        );
    }
});

test("encaminha cada nível para o método certo da consola", () => {
    const originalConsole = {
        info: console.info,
        warn: console.warn,
        error: console.error,
    };
    const calls = {
        info: [],
        warn: [],
        error: [],
    };

    console.info = (message) => calls.info.push(JSON.parse(message));
    console.warn = (message) => calls.warn.push(JSON.parse(message));
    console.error = (message) => calls.error.push(JSON.parse(message));

    try {
        for (const level of ["info", "audit", "warn", "error"]) {
            writeStructuredLog(
                createStructuredLogEvent({
                    level,
                    event: `writer.${level}`,
                    module: "ops",
                    requirement: "RNF28",
                }),
            );
        }

        // `audit` fica em info porque é operacionalmente pesquisável sem ser erro técnico.
        assert.deepEqual(
            calls.info.map((event) => event.level),
            ["info", "audit"],
        );
        assert.deepEqual(
            calls.warn.map((event) => event.level),
            ["warn"],
        );
        assert.deepEqual(
            calls.error.map((event) => event.level),
            ["error"],
        );
    } finally {
        // Restaurar a consola evita que este teste contamine outros testes unitários.
        console.info = originalConsole.info;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
    }
});

test("rejeita contexto com objetos aninhados", () => {
    assert.throws(
        () =>
            createStructuredLogEvent({
                level: "audit",
                event: "sale.document",
                module: "sales",
                requirement: "RNF28",
                // Payloads financeiros completos devem ficar fora do logger operacional.
                context: { document: { totalCents: 1000 } },
            }),
        /Valor inválido em contexto de log/,
    );
});