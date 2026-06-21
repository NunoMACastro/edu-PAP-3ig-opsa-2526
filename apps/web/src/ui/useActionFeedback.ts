/**
 * @file Hook de feedback imediato para ações assíncronas da interface OPSA.
 */

import { useCallback, useState } from "react";

export type FeedbackPhase = "idle" | "running" | "success" | "error";
export type FeedbackTone = "neutral" | "success" | "danger";

export interface ActionFeedbackState {
    phase: FeedbackPhase;
    tone: FeedbackTone;
    title: string;
    message: string | null;
}

export interface ActionFeedbackRunOptions {
    startMessage?: string;
    successMessage?: string;
    errorMessage?: string;
}

const idleFeedback: ActionFeedbackState = {
    phase: "idle",
    tone: "neutral",
    title: "Estado da operação",
    message: null,
};

/**
 * Converte um erro técnico numa mensagem curta para a interface.
 *
 * @param error - Erro lançado por validação local ou chamada à API.
 * @param fallback - Mensagem usada quando o erro não traz texto útil.
 * @returns Mensagem segura para apresentar ao utilizador.
 */
function messageFromError(error: Error, fallback: string) {
    const message = error.message.trim();
    return message || fallback;
}

/**
 * Gere o ciclo visual de uma ação assíncrona.
 *
 * @returns Estado atual, indicador de execução e funções para executar ações com feedback.
 */
export function useActionFeedback() {
    const [feedback, setFeedback] = useState<ActionFeedbackState>(idleFeedback);

    const start = useCallback((message = "A executar operação...") => {
        // O feedback aparece antes da API responder para evitar cliques repetidos.
        setFeedback({
            phase: "running",
            tone: "neutral",
            title: "Operação em curso",
            message,
        });
    }, []);

    const succeed = useCallback((message = "Operação concluída com sucesso.") => {
        setFeedback({
            phase: "success",
            tone: "success",
            title: "Operação concluída",
            message,
        });
    }, []);

    const fail = useCallback(
        (error: Error, fallback = "Não foi possível concluir a operação.") => {
            // O hook recebe o erro já capturado e devolve uma mensagem previsível.
            setFeedback({
                phase: "error",
                tone: "danger",
                title: "Operação não concluída",
                message: messageFromError(error, fallback),
            });
        },
        [],
    );

    const reset = useCallback(() => {
        setFeedback(idleFeedback);
    }, []);

    const run = useCallback(
        async <TResult>(
            action: () => Promise<TResult>,
            options: ActionFeedbackRunOptions = {},
        ) => {
            start(options.startMessage);

            try {
                const result = await action();
                succeed(options.successMessage);
                return result;
            } catch (caught) {
                const error =
                    caught instanceof Error
                        ? caught
                        : new Error(options.errorMessage ?? "Operação interrompida.");

                fail(error, options.errorMessage);
                throw error;
            }
        },
        [fail, start, succeed],
    );

    return {
        feedback,
        busy: feedback.phase === "running",
        start,
        succeed,
        fail,
        reset,
        run,
    };
}