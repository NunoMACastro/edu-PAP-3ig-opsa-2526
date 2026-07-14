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
    let resolveAlerts!: (value: { alerts: Array<Record<string, unknown>> }) => void;
    const alertsPromise = new Promise<{ alerts: Array<Record<string, unknown>> }>((resolve) => {
      resolveAlerts = resolve;
    });
    createRun.mockResolvedValue({ run: { id: "run-1", status: "QUEUED" } });
    getRun.mockResolvedValue({ run: { id: "run-1", status: "COMPLETED" } });
    getAlerts.mockReturnValue(alertsPromise);
    const alertResult = {
        alerts: [{
          id: "alert-1",
          type: "STOCKOUT_FORECAST",
          severity: "HIGH",
          title: "Risco de rutura de stock",
          message: "PROD-001 tem cobertura estimada de 4 dias.",
          sourceLabel: "PROD-001 · Armazém principal",
          status: "OPEN",
          score: 90,
          periodFrom: "2026-04-16T00:00:00.000Z",
          periodTo: "2026-07-14T23:59:59.999Z",
          ruleCode: "STOCKOUT_FORECAST",
          ruleVersion: 1,
          evidence: {
            metrics: {
              balance: 8,
              averageDailyOutflow: 2,
              daysOfCover: 4,
              observedDays: 90,
              outflowCount: 3,
            },
            formula: "saldo / saída média diária",
            quality: "SUFFICIENT",
            limitations: [],
          },
        }],
      };

    render(<SmartAlertsPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Analisar dados da empresa" }));
    });

    expect(screen.getByText(/Em fila/)).toBeInTheDocument();
    expect(screen.getByText(/A análise está a ser processada/)).toBeInTheDocument();
    expect(screen.getByText("Análise agendada para o worker.")).toBeInTheDocument();
    expect(screen.queryByText("run-1")).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });

    expect(getRun).toHaveBeenCalledWith("run-1");
    expect(getAlerts).toHaveBeenCalled();
    await act(async () => {
      resolveAlerts(alertResult);
      await alertsPromise;
    });
    expect(screen.getByText("Concluída")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Risco de rutura de stock" })).toBeInTheDocument();
    expect(screen.getByText(/Saída média diária/)).toBeInTheDocument();
    expect(screen.getByText(/Amostra suficiente/)).toBeInTheDocument();
  });
});
