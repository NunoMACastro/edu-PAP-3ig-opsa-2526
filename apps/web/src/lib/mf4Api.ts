// real_dev/web/src/lib/mf4Api.ts
import { createApiClient } from "./apiClient";

const client = createApiClient();

export interface AiInsight {
  id: string;
  type: string;
  severity: string;
  title: string;
  summary: string;
  explanation: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  suggestedAction: string | null;
  status: string;
}

/** Consulta insights automáticos da empresa ativa. */
export function getAiInsights(from: string, to: string) {
  // A query string leva apenas filtros de período.
  // A empresa ativa continua protegida no cookie de sessão e no backend.
  const query = "?from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to);
  return client.request<{ insights: AiInsight[] }>("GET", "/ai/insights" + query);
}
export interface AiActionSuggestion {
  id: string;
  insightId: string;
  actionType: string;
  title: string;
  rationale: string;
  sourceLabel: string;
  status: string;
}

/** Consulta sugestões de ação geradas a partir dos insights abertos. */
export function getAiSuggestions() {
  // O endpoint não recebe filtros por empresa. O backend usa a empresa ativa
  // guardada na sessão para escolher os insights e sugestões corretos.
  return client.request<{ suggestions: AiActionSuggestion[] }>("GET", "/ai/suggestions");
}

// função a adicionar em apps/web/src/lib/mf4Api.ts
export interface AiSourceReference {
  type: string;
  id: string;
  label: string;
}

export interface AiQuestionAnswer {
  queryId?: string;
  answer: string;
  intent: string;
  sources: AiSourceReference[];
}

/** Envia uma pergunta de leitura e recebe resposta com fontes. */
export function askAiQuestion(question: string) {
  // A UI envia apenas o texto. O backend decide se a pergunta é permitida
  // e resolve empresa/utilizador a partir da sessão.
  return client.request<{ answer: AiQuestionAnswer }>("POST", "/ai/questions", { body: { question } });
}

// apps/web/src/pages/AiQuestionsPage.tsx
import { FormEvent, useState } from "react";
import { AiQuestionAnswer, askAiQuestion } from "../lib/mf4Api";

/** Formulário de pergunta em linguagem natural controlada. */
export function AiQuestionsPage() {
  const [answer, setAnswer] = useState<AiQuestionAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = String(new FormData(event.currentTarget).get("question") ?? "");
    try {
      // O estado anterior é substituído pela resposta nova para o aluno ver
      // claramente o resultado de cada submissão.
      const result = await askAiQuestion(question);
      setAnswer(result.answer);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  return (
    <section className="panel">
      <h2>Perguntas com fonte</h2>
      <form onSubmit={submit}>
        <textarea name="question" required />
        <button>Perguntar</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {answer ? (
        <article>
          <strong>{answer.intent}</strong>
          <p>{answer.answer}</p>
          <ul>
            {answer.sources.map((source) => (
              <li key={source.id}>{source.type}: {source.label}</li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
// função a adicionar em apps/web/src/lib/mf4Api.ts
export type ReminderType = "DEADLINE" | "PAYMENT" | "TAX";
export type ReminderStatus = "OPEN" | "DONE" | "CANCELLED";

export interface ReminderItem {
  id: string;
  type: ReminderType;
  title: string;
  dueDate: string;
  status: ReminderStatus;
  notes: string | null;
}

export interface ReminderInput {
  type: ReminderType;
  title: string;
  dueDate: string;
  notes?: string;
}

/** Lista lembretes da empresa ativa. */
export function loadReminders() {
  return client.request<{ items: ReminderItem[] }>("GET", "/reminders");
}

/** Cria lembrete operacional. */
export function createReminder(body: ReminderInput) {
  return client.request<{ item: ReminderItem }>("POST", "/reminders", { body });
}

/** Atualiza estado de um lembrete existente. */
export function updateReminderStatus(id: string, status: ReminderStatus) {
  return client.request<{ item: ReminderItem }>("PATCH", "/reminders/" + encodeURIComponent(id) + "/status", {
    body: { status },
  });
}
