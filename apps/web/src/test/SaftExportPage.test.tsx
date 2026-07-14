/**
 * @file Contratos visuais do modo SAF-T académico e do estado indisponível.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { SaftExportPage } from "../pages/mf3Pages";

const server = setupServer();
let originalFetch: typeof globalThis.fetch;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  originalFetch = globalThis.fetch;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const absolute = typeof input === "string" && input.startsWith("/")
      ? new URL(input, "http://localhost")
      : input;
    return originalFetch(absolute, init);
  };
  server.use(
    http.get("http://localhost/api/fiscal-periods", () =>
      HttpResponse.json({
        periods: [{
          id: "period-1",
          name: "Exercício 2026",
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          status: "CLOSED",
        }],
      }),
    ),
  );
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  server.resetHandlers();
});
afterAll(() => server.close());

it("marca o exportador académico como não certificado", async () => {
  server.use(
    http.get("http://localhost/api/compliance/saft/status", () =>
      HttpResponse.json({
        mode: "ACADEMIC",
        available: true,
        certifiedOutput: false,
      }),
    ),
  );

  render(<SaftExportPage />);

  expect(await screen.findByText(/Demonstração académica — não certificado/i))
    .toBeInTheDocument();
  expect(await screen.findByRole("button", { name: "Gerar XML académico" }))
    .toBeEnabled();
});

it("não permite gerar quando o runtime SAF-T está desligado", async () => {
  server.use(
    http.get("http://localhost/api/compliance/saft/status", () =>
      HttpResponse.json({
        mode: "DISABLED",
        available: false,
        certifiedOutput: false,
      }),
    ),
  );

  render(<SaftExportPage />);

  expect(await screen.findByText("O SAF-T não está configurado neste ambiente."))
    .toBeInTheDocument();
  expect(await screen.findByRole("button", { name: "Gerar SAF-T" }))
    .toBeDisabled();
});

it("explica quando falta a validação oficial no modo externo", async () => {
  server.use(
    http.get("http://localhost/api/compliance/saft/status", () =>
      HttpResponse.json({
        mode: "EXTERNAL",
        available: false,
        certifiedOutput: false,
      }),
    ),
  );

  render(<SaftExportPage />);

  expect(await screen.findByText(/requer o pipeline e o XSD oficiais/i))
    .toBeInTheDocument();
  expect(await screen.findByRole("button", { name: "Gerar SAF-T" }))
    .toBeDisabled();
});

it("permite selecionar período aberto em académico e mostra o corte devolvido", async () => {
  let submittedBody: unknown;
  server.use(
    http.get("http://localhost/api/fiscal-periods", () =>
      HttpResponse.json({
        periods: [{
          id: "period-open",
          name: "Exercício aberto 2026",
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          status: "OPEN",
        }],
      }),
    ),
    http.get("http://localhost/api/compliance/saft/status", () =>
      HttpResponse.json({
        mode: "ACADEMIC",
        available: true,
        certifiedOutput: false,
      }),
    ),
    http.post("http://localhost/api/compliance/saft/exports", async ({ request }) => {
      submittedBody = await request.json();
      return HttpResponse.json({
        export: {
          id: "export-academic",
          type: "FULL",
          fiscalPeriodId: "period-open",
          status: "READY",
          createdAt: "2026-07-14T12:00:00.000Z",
          validationMode: "ACADEMIC",
          certified: false,
          legalValidity: false,
          openPeriodSnapshot: true,
          asOfDate: "2026-07-14",
          fromDate: "2026-01-01",
          toDate: "2026-07-14",
          warning: "Demonstração académica sem validade legal e não certificada.",
          fileName: "saft-DEMO-NAO-CERTIFICADO.xml",
          sha256: "a".repeat(64),
          sizeBytes: 1024,
          validation: {
            xsdStatus: "NOT_VALIDATED",
            totalsStatus: "VALID",
            externalReviewStatus: "NOT_REVIEWED",
          },
          completedAt: "2026-07-14T12:00:01.000Z",
          downloadAvailable: true,
        },
      }, { status: 201 });
    }),
  );
  const user = userEvent.setup();
  render(<SaftExportPage />);

  const openOption = await screen.findByRole("option", { name: /Exercício aberto 2026 — Aberto/i });
  expect(openOption).toBeEnabled();
  await waitFor(() => {
    expect(screen.getByLabelText("Período fiscal")).toHaveValue("period-open");
  });
  expect(screen.getByText("Data de corte prevista")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Gerar XML académico" }));

  expect(await screen.findByText("Pronta para descarregar")).toBeInTheDocument();
  expect(screen.getByText("Snapshot académico sem validade legal")).toBeInTheDocument();
  expect(screen.getAllByText("2026-07-14").length).toBeGreaterThan(0);
  expect(screen.queryByText("READY")).not.toBeInTheDocument();
  expect(submittedBody).toEqual({ type: "FULL", fiscalPeriodId: "period-open" });
});

it("desativa períodos abertos e seleciona um período fechado no modo externo", async () => {
  server.use(
    http.get("http://localhost/api/fiscal-periods", () =>
      HttpResponse.json({
        periods: [
          {
            id: "period-open",
            name: "Exercício aberto 2026",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            status: "OPEN",
          },
          {
            id: "period-closed",
            name: "Exercício fechado 2025",
            startDate: "2025-01-01",
            endDate: "2025-12-31",
            status: "CLOSED",
          },
        ],
      }),
    ),
    http.get("http://localhost/api/compliance/saft/status", () =>
      HttpResponse.json({
        mode: "EXTERNAL",
        available: true,
        certifiedOutput: true,
      }),
    ),
  );
  render(<SaftExportPage />);

  const openOption = await screen.findByRole("option", { name: /Exercício aberto 2026 — Aberto/i });
  await waitFor(() => {
    expect(openOption).toBeDisabled();
    expect(screen.getByLabelText("Período fiscal")).toHaveValue("period-closed");
  });
  expect(screen.getByText("Modo atual: Externo")).toBeInTheDocument();
});
