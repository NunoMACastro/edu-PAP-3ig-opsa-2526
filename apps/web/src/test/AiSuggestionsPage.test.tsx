/**
 * @file Contrato DOM das sugestões de IA legíveis e sujeitas a decisão humana.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getAiSuggestions, updateAiSuggestionStatus } = vi.hoisted(() => ({
  getAiSuggestions: vi.fn(),
  updateAiSuggestionStatus: vi.fn(),
}));

vi.mock("../lib/mf4Api", async (importOriginal) => {
  const original = await importOriginal<typeof import("../lib/mf4Api")>();
  return { ...original, getAiSuggestions, updateAiSuggestionStatus };
});

vi.mock("../auth/AuthProvider", () => ({
  useAuth: () => ({ hasPermission: () => true }),
}));

import { AiSuggestionsPage } from "../pages/mf4Pages";

afterEach(() => vi.clearAllMocks());

describe("AiSuggestionsPage", () => {
  it("apresenta rótulos PT-PT, recolhe referências técnicas e fecha as ações após decisão", async () => {
    const user = userEvent.setup();
    const technicalRationale = "StockBalance versus configured daily outflow";
    const technicalReference = "AI_METRIC_V2/STOCK_RISK:item-1";
    getAiSuggestions.mockResolvedValue({
      suggestions: [{
        id: "suggestion-1",
        actionType: "REVIEW_STOCK",
        title: "Validar reposição antes de agir",
        rationale: technicalRationale,
        sourceLabel: "Resumo canónico de stock",
        status: "OPEN",
        sourceQuality: {
          confidence: "high",
          limitation: "Confirma o contexto operacional antes de decidir.",
          source: {
            type: "AI_METRIC_V2",
            id: "STOCK_RISK:item-1",
            label: "Resumo canónico de stock",
          },
        },
        guardrail: "A decisão e a execução continuam humanas.",
      }],
    });
    updateAiSuggestionStatus.mockResolvedValue({});

    render(<AiSuggestionsPage />);
    await user.click(screen.getByRole("button", { name: "Atualizar" }));

    expect(await screen.findByRole("heading", { name: "Validar reposição antes de agir" }))
      .toBeInTheDocument();
    expect(screen.getByText(/Rever níveis de stock/)).toBeInTheDocument();
    expect(screen.getByText("Confiança alta")).toBeInTheDocument();
    expect(screen.queryByText("REVIEW_STOCK")).not.toBeInTheDocument();
    expect(screen.getByText(technicalRationale)).not.toBeVisible();
    expect(screen.getByText(technicalReference)).not.toBeVisible();

    await user.click(screen.getByText("Ver fundamento técnico"));
    await user.click(screen.getByText("Ver referência técnica"));
    expect(screen.getByText(technicalRationale)).toBeVisible();
    expect(screen.getByText(technicalReference)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Aceitar" }));
    await waitFor(() => expect(updateAiSuggestionStatus).toHaveBeenCalledWith(
      "suggestion-1",
      "ACCEPTED",
      "USEFUL",
    ));
    expect(screen.getByText("Aceite")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Aceitar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dispensar" })).not.toBeInTheDocument();
  });
});
