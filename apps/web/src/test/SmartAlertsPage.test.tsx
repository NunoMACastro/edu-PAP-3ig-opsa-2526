/**
 * @file Prova comportamental do workflow assíncrono de alertas inteligentes.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { createRun, getRun, getAlerts } = vi.hoisted(() => ({
  createRun: vi.fn(),
  getRun: vi.fn(),
  getAlerts: vi.fn(),
}));

vi.mock("../lib/mf4Api", async (importOriginal) => {
  const original = await importOriginal<typeof import("../lib/mf4Api")>();
  return {
    ...original,
    createAiAnalysisRun: createRun,
    getAiAnalysisRun: getRun,
    getSmartAlerts: getAlerts,
  };
});

vi.mock("../auth/AuthProvider", () => ({
  useAuth: () => ({ hasPermission: () => true }),
}));

import { SmartAlertsPage } from "../pages/mf4Pages";

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("SmartAlertsPage", () => {
  it("acompanha uma análise de QUEUED até COMPLETED e atualiza os alertas", async () => {
    vi.useFakeTimers();
    createRun.mockResolvedValue({ run: { id: "run-1", status: "QUEUED" } });
    getRun.mockResolvedValue({ run: { id: "run-1", status: "COMPLETED" } });
    getAlerts
      .mockResolvedValueOnce({ alerts: [] })
      .mockResolvedValueOnce({
        alerts: [{
          id: "alert-1",
          type: "CASHFLOW_RISK",
          severity: "HIGH",
          title: "Risco de tesouraria",
          message: "Saldo projetado abaixo do limite.",
          sourceLabel: "Previsão de tesouraria",
          status: "OPEN",
          score: 90,
        }],
      });

    render(<SmartAlertsPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Consultar" }));
    });

    expect(screen.getByText(/QUEUED/)).toBeInTheDocument();
    expect(screen.getByText("Análise agendada para o worker.")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });

    expect(getRun).toHaveBeenCalledWith("run-1");
    expect(screen.getByText(/COMPLETED/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Risco de tesouraria" })).toBeInTheDocument();
  });
});
