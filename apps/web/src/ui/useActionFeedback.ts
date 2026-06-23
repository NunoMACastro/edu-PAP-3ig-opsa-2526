/**
 * @file Hook de feedback imediato para acoes assincronas da interface OPSA.
 */

import { useCallback, useState } from "react";
import { formatUiError } from "../lib/mf5ErrorMessages";

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
  title: "Estado da operacao",
  message: null,
};

/**
 * Converte um erro tecnico numa mensagem curta para a interface.
 *
 * @param error - Erro lancado por validacao local ou chamada a API.
 * @param fallback - Mensagem usada quando o erro nao traz texto util.
 * @returns Mensagem segura para apresentar ao utilizador.
 */
function messageFromError(error: Error, fallback: string) {
  const message = error.message.trim();
  return message ? formatUiError(error) : fallback;
}

/**
 * Gere o ciclo visual de uma acao assincrona.
 *
 * @returns Estado atual, indicador de execucao e funcoes para executar acoes com feedback.
 */
export function useActionFeedback() {
  const [feedback, setFeedback] = useState<ActionFeedbackState>(idleFeedback);

  const start = useCallback((message = "A executar operacao...") => {
    // O feedback aparece antes da API responder para reduzir cliques repetidos.
    setFeedback({
      phase: "running",
      tone: "neutral",
      title: "Operacao em curso",
      message,
    });
  }, []);

  const succeed = useCallback((message = "Operacao concluida com sucesso.") => {
    setFeedback({
      phase: "success",
      tone: "success",
      title: "Operacao concluida",
      message,
    });
  }, []);

  const fail = useCallback(
    (error: Error, fallback = "Nao foi possivel concluir a operacao.") => {
      setFeedback({
        phase: "error",
        tone: "danger",
        title: "Operacao nao concluida",
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
            : new Error(options.errorMessage ?? "Operacao interrompida.");

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
