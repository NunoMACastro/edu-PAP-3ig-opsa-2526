/**
 * @file Request IDs e logging JSON de início/fim para Express.
 *
 * O middleware não regista URL concreta, query string, headers, body, cookie ou
 * mensagem de erro. A rota é obtida apenas do template Express depois do
 * matching, evitando colocar identificadores de negócio nos logs.
 */

import { randomUUID } from "node:crypto";
import {
    createStructuredLogEvent,
    writeStructuredLog,
} from "./structuredLogger.js";

const REQUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR_TYPES = new Map([
    ["AggregateError", "AggregateError"],
    ["Error", "Error"],
    ["EvalError", "EvalError"],
    ["HttpError", "HttpError"],
    ["PrismaClientInitializationError", "DatabaseError"],
    ["PrismaClientKnownRequestError", "DatabaseError"],
    ["PrismaClientRustPanicError", "DatabaseError"],
    ["PrismaClientUnknownRequestError", "DatabaseError"],
    ["RangeError", "RangeError"],
    ["ReferenceError", "ReferenceError"],
    ["SyntaxError", "SyntaxError"],
    ["TypeError", "TypeError"],
    ["URIError", "URIError"],
    ["ValidationError", "ValidationError"],
]);
const TERMINAL_LOGGER = Symbol("requestTerminalLogger");

/**
 * Um erro do logger não deve interromper nem duplicar a resposta HTTP.
 *
 * @param {(event: object) => void} write - Writer operacional.
 * @param {object} event - Evento já validado.
 * @returns {void}
 */
function safelyWrite(write, event) {
    try {
        write(event);
    } catch {
        // O transporte do log não pode alterar o resultado do pedido observado.
    }
}

/**
 * Reduz o tipo de erro a uma classificação sem mensagem ou dados livres.
 *
 * @param {unknown} error - Erro capturado pelo boundary HTTP.
 * @returns {string} Nome seguro e limitado.
 */
function resolveErrorType(error) {
    const name = error instanceof Error ? error.name : "";
    return SAFE_ERROR_TYPES.get(name) ?? "UnknownError";
}

/**
 * Aceita apenas o token HTTP, evitando transportar texto livre para o log.
 *
 * @param {unknown} method - Método observado no pedido.
 * @returns {string} Método seguro ou `unknown`.
 */
function resolveMethod(method) {
    return typeof method === "string" && /^[A-Z]{1,16}$/.test(method)
        ? method
        : "unknown";
}

/**
 * Devolve o status apenas quando representa uma resposta observável.
 *
 * @param {object} res - Resposta Node/Express.
 * @param {string} outcome - Motivo terminal do pedido.
 * @returns {number | null} Status válido ou `null` quando ainda não existia.
 */
function resolveTerminalStatus(res, outcome) {
    const statusCode = Number(res?.statusCode);
    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
        return null;
    }
    if (
        outcome === "finished" ||
        outcome === "error" ||
        res.headersSent === true ||
        res.writableFinished === true
    ) {
        return statusCode;
    }
    return null;
}

/**
 * Aceita apenas UUIDs bem formados como correlation ID externo.
 *
 * @param {unknown} value - Header `X-Request-ID`.
 * @returns {string} UUID aceite ou recém-gerado.
 */
export function resolveRequestId(value) {
    const candidate = typeof value === "string" ? value.trim() : "";
    return REQUEST_ID_PATTERN.test(candidate) ? candidate : randomUUID();
}

/**
 * Compõe o template Express sem incluir params concretos.
 *
 * @param {object} req - Pedido Express após route matching.
 * @returns {string} Template seguro ou `unmatched`.
 */
export function resolveRouteTemplate(req) {
    const baseUrl = typeof req.baseUrl === "string" ? req.baseUrl : "";
    const routePath =
        typeof req.route?.path === "string" ? req.route.path : "unmatched";
    return routePath === "unmatched" ? routePath : `${baseUrl}${routePath}`;
}

/**
 * Cria o middleware de observabilidade com writer injetável para testes.
 *
 * @param {{ write?: (event: object) => void, clock?: () => number }} [options] - Dependências determinísticas.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function createRequestObservability(options = {}) {
    const write = options.write ?? writeStructuredLog;
    const clock = options.clock ?? (() => performance.now());

    return function requestObservability(req, res, next) {
        const requestId = resolveRequestId(req.get?.("x-request-id"));
        const startedAt = clock();
        req.requestId = requestId;
        res.set("X-Request-ID", requestId);

        safelyWrite(
            write,
            createStructuredLogEvent({
                level: "info",
                event: "http.request.start",
                module: "http",
                requirement: "OPSA-E2E-P2-010",
                context: {
                    requestId,
                    method: resolveMethod(req.method),
                },
            }),
        );

        let terminalLogged = false;
        const listeners = {};

        /**
         * Emite uma única conclusão do pedido, independentemente da ordem dos
         * eventos `finish`, `close`, `aborted` e do error boundary.
         *
         * @param {"finished" | "closed" | "aborted" | "error"} outcome - Causa terminal.
         * @param {unknown} [error] - Erro, usado apenas para classificação segura.
         * @returns {boolean} `true` apenas para o primeiro evento terminal.
         */
        const logTerminal = (outcome, error) => {
            if (terminalLogged) return false;
            terminalLogged = true;

            res.off?.("finish", listeners.finish);
            res.off?.("close", listeners.close);
            req.off?.("aborted", listeners.aborted);

            const elapsed = Number(clock()) - Number(startedAt);
            const statusCode = resolveTerminalStatus(res, outcome);
            const context = {
                requestId,
                method: resolveMethod(req.method),
                routeTemplate: resolveRouteTemplate(req),
                durationMs: Number.isFinite(elapsed)
                    ? Math.max(0, Math.round(elapsed))
                    : null,
                outcome,
            };
            if (statusCode !== null) context.statusCode = statusCode;
            if (outcome === "error") {
                context.errorType = resolveErrorType(error);
            }

            const isServerError = statusCode !== null && statusCode >= 500;
            const level =
                outcome === "error" || isServerError
                    ? "error"
                    : outcome === "aborted" || outcome === "closed"
                      ? "warn"
                      : "info";
            const eventSuffix =
                outcome === "finished"
                    ? "finish"
                    : outcome === "closed"
                      ? "close"
                      : outcome;

            safelyWrite(
                write,
                createStructuredLogEvent({
                    level,
                    event: `http.request.${eventSuffix}`,
                    module: "http",
                    requirement: "OPSA-E2E-P2-016",
                    context,
                }),
            );
            return true;
        };

        listeners.finish = () => logTerminal("finished");
        listeners.close = () => logTerminal("closed");
        listeners.aborted = () => logTerminal("aborted");

        Object.defineProperty(req, TERMINAL_LOGGER, {
            configurable: false,
            enumerable: false,
            value: logTerminal,
            writable: false,
        });
        res.once("finish", listeners.finish);
        res.once("close", listeners.close);
        req.once?.("aborted", listeners.aborted);

        next();
    };
}

/**
 * Regista erro não tratado usando apenas classificação e request ID.
 *
 * @param {unknown} error - Erro capturado pelo boundary Express.
 * @param {object} req - Pedido Express.
 * @param {(event: object) => void} [write] - Writer injetável.
 * @returns {void}
 */
export function logUnhandledRequestError(
    error,
    req,
    write = writeStructuredLog,
) {
    if (typeof req?.[TERMINAL_LOGGER] === "function") {
        req[TERMINAL_LOGGER]("error", error);
        return;
    }

    const context = {
        requestId: req?.requestId ?? "unknown",
        method: resolveMethod(req?.method),
        routeTemplate: resolveRouteTemplate(req ?? {}),
        durationMs: null,
        outcome: "error",
        errorType: resolveErrorType(error),
    };
    const statusCode = Number(req?.res?.statusCode);
    if (Number.isInteger(statusCode) && statusCode >= 100 && statusCode <= 599) {
        context.statusCode = statusCode;
    }

    safelyWrite(
        write,
        createStructuredLogEvent({
            level: "error",
            event: "http.request.error",
            module: "http",
            requirement: "OPSA-E2E-P2-016",
            context,
        }),
    );
}
