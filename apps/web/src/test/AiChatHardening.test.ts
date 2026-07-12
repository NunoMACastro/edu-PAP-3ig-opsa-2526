/**
 * @file Contratos UI do estado partilhado, capability e cancelamento do chat.
 */

import { describe, expect, it } from "vitest";
import appSource from "../App.tsx?raw";
import chatSource from "../ai/AiChat.tsx?raw";
import apiSource from "../lib/aiChatApi.ts?raw";

describe("chat IA v2", () => {
  it("monta um provider comum para página e drawer", () => {
    expect(appSource).toContain("<AiChatStateProvider");
    expect(chatSource).toContain("AiChatStateContext");
    expect(chatSource).toContain("function AiChatPage");
    expect(chatSource).toContain("function AiAssistantDrawer");
  });

  it("propaga AbortSignal e cancela ao fechar o drawer", () => {
    expect(chatSource).toContain("new AbortController()");
    expect(chatSource).toContain("controller.signal");
    expect(chatSource).toMatch(/if \(chat\.busy\) chat\.cancel\(\)/);
    expect(apiSource).toContain("signal?: AbortSignal");
  });

  it("remove deltas simulados e trata conclusão, falha e cancelamento", () => {
    expect(apiSource).not.toContain('event: "message.delta"');
    expect(apiSource).toContain('event: "message.cancelled"');
    expect(chatSource).toContain('streamEvent.event === "message.completed"');
  });

  it("apresenta separadamente todas as condições de capability", () => {
    for (const label of ["Chat:", "Modo determinístico:", "OpenAI configurada:", "Empresa ativada:", "Consentimento aceite:"]) {
      expect(chatSource).toContain(label);
    }
  });
});
