/**
 * @file Testes unitarios do logger operacional RNF28.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
    createStructuredLogEvent,
    writeStructuredLog,
} from "../../src/modules/ops/structuredLogger.js";

test("BK-MF8-01: aceita os quatro niveis contratados por RNF28", () => {
    const levels = ["info", "warn", "error", "audit"];

    for (const level of levels) {
        const event = createStructuredLogEvent({
            level,
            event: `ops.${level}`,
            module: "ops",
            requirement: "RNF28",
            context: { safe: true },
        });

        // Este positivo prova que todos os niveis partilham o mesmo contrato seguro.
        assert.equal(event.level, level);
        assert.equal(event.context.safe, true);
        assert.match(event.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    }
});

test("BK-MF8-01: rejeita nivel invalido e campos obrigatorios vazios", () => {
    assert.throws(
        () =>
            createStructuredLogEvent({
                level: "debug",
                event: "ops.debug",
                module: "ops",
                requirement: "RNF28",
            }),
        /Nivel de log invalido/,
    );

    assert.throws(
        () =>
            createStructuredLogEvent({
                level: "info",
                event: "",
                module: "ops",
                requirement: "RNF28",
            }),
        /Evento, modulo e requisito sao obrigatorios/,
    );
});

test("BK-MF8-01: bloqueia chaves sensiveis no contexto", () => {
    const blockedKeys = [
        "rawPayload",
        "password",
        "password_hash",
        "token",
        "secret",
        "apiKey",
        "api_key",
        "authorization",
        "cookie",
        "headers",
        "iban",
        "nif",
        "email",
        "accessToken",
        "refresh_token",
        "prompt",
        "aiResponse",
        "stackTrace",
        "financialPayload",
        "recipientEmail",
        "sessionToken",
    ];

    for (const key of blockedKeys) {
        assert.throws(
            () =>
                createStructuredLogEvent({
                    level: "info",
                    event: "security.check",
                    module: "ops",
                    requirement: "RNF28",
                    // O teste impede que credenciais, identificadores sensiveis ou payloads entrem nos logs.
                    context: { [key]: "valor proibido" },
                }),
            /Campo proibido em contexto de log/,
        );
    }
});

test("BK-MF8-01: rejeita contexto com objetos ou arrays aninhados", () => {
    assert.throws(
        () =>
            createStructuredLogEvent({
                level: "audit",
                event: "sale.document",
                module: "sales",
                requirement: "RNF28",
                context: { document: { totalCents: 1000 } },
            }),
        /Valor invalido em contexto de log/,
    );

    assert.throws(
        () =>
            createStructuredLogEvent({
                level: "audit",
                event: "sale.document",
                module: "sales",
                requirement: "RNF28",
                context: { lines: ["linha completa"] },
            }),
        /Valor invalido em contexto de log/,
    );
});

test("BK-MF8-01: encaminha cada nivel para o metodo certo da consola", () => {
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

        // `audit` nao e erro tecnico; por isso segue para stdout juntamente com `info`.
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
        console.info = originalConsole.info;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
    }
});
