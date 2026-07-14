/**
 * @file Contratos visuais do modo SAF-T académico e do estado indisponível.
 */

import { render, screen } from "@testing-library/react";
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
