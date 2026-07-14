/**
 * @file Contratos do formulário isolado de criação de empresa.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { CompanySetupPage } from "../pages/CompanySetupPage";

const server = setupServer();
let originalFetch: typeof globalThis.fetch;

const setupResult = {
  company: { id: "company-created", name: "Empresa PAP 2026", nif: "509442013" },
  context: {
    companyId: "company-created",
    companyName: "Empresa PAP 2026",
    nif: "509442013",
    role: "ADMIN" as const,
  },
  bootstrap: {
    fiscalPeriod: {
      id: "period-created",
      name: "Exercício 2026",
      fiscalYear: 2026,
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-12-31T00:00:00.000Z",
      status: "OPEN" as const,
    },
    accountCodes: ["211", "221", "2432", "2433", "62", "71", "72"],
    vatRate: { id: "vat-created", code: "IVA23", rateBps: 2300 },
    warehouse: { id: "warehouse-created", code: "PRINCIPAL", name: "Armazém principal" },
    demoData: {
      prepared: true,
      product: { id: "item-created", sku: "PAP-DEMO-001", name: "Produto demonstrativo PAP" },
      openingStock: { quantity: 20, movementId: "movement-created" },
    },
  },
};

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  originalFetch = globalThis.fetch;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const absolute = typeof input === "string" && input.startsWith("/")
      ? new URL(input, "http://localhost")
      : input;
    return originalFetch(absolute, init);
  };
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  server.resetHandlers();
});
afterAll(() => server.close());

async function fillValidCompany(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nome da empresa"), "Empresa PAP 2026");
  await user.type(screen.getByLabelText("Denominação legal"), "Empresa PAP 2026, Lda.");
  await user.type(screen.getByLabelText("Morada"), "Rua da Escola, 1");
  await user.type(screen.getByLabelText("Código postal"), "1000-001");
  await user.type(screen.getByLabelText("Localidade"), "Lisboa");
  await user.type(screen.getByLabelText("NIF português"), "509442013");
}

it("cria a primeira empresa com preparação académica explícita e callback", async () => {
  let submittedBody: unknown;
  let requestCount = 0;
  server.use(
    http.post("http://localhost/api/onboarding/company", async ({ request }) => {
      requestCount += 1;
      submittedBody = await request.json();
      await new Promise((resolve) => globalThis.setTimeout(resolve, 20));
      return HttpResponse.json(setupResult, { status: 201 });
    }),
  );
  const onCreated = vi.fn();
  const user = userEvent.setup();
  render(<CompanySetupPage mode="initial" onCreated={onCreated} />);

  await fillValidCompany(user);
  await user.click(screen.getByLabelText(/Preparar um produto de exemplo/i));
  const submit = screen.getByRole("button", { name: "Criar e ativar empresa" });
  await user.click(submit);
  expect(screen.getByRole("button", { name: "A criar empresa..." })).toBeDisabled();

  expect(await screen.findByText(/ficou pronta com exercício fiscal, contas, IVA/i))
    .toBeInTheDocument();
  expect(screen.getByText(/produto demonstrativo e o respetivo stock inicial/i))
    .toBeInTheDocument();
  expect(requestCount).toBe(1);
  expect(onCreated).toHaveBeenCalledWith(setupResult);
  expect(submittedBody).toMatchObject({
    name: "Empresa PAP 2026",
    prepareDemoData: true,
    profile: {
      nif: "509442013",
      country: "PT",
      currency: "EUR",
      fiscalYearStartMonth: 1,
      fiscalYearStartDay: 1,
    },
  });
});

it("usa POST /companies no modo adicional sem preparar dados por omissão", async () => {
  let submittedBody: Record<string, unknown> | null = null;
  server.use(
    http.post("http://localhost/api/companies", async ({ request }) => {
      submittedBody = await request.json() as Record<string, unknown>;
      return HttpResponse.json({
        ...setupResult,
        bootstrap: { ...setupResult.bootstrap, demoData: { prepared: false } },
      }, { status: 201 });
    }),
  );
  const user = userEvent.setup();
  render(<CompanySetupPage mode="additional" />);

  await fillValidCompany(user);
  await user.click(screen.getByRole("button", { name: "Criar e ativar empresa" }));

  expect(await screen.findByText("Empresa criada e ativada")).toBeInTheDocument();
  expect(submittedBody).toMatchObject({ prepareDemoData: false });
});

it("bloqueia localmente um NIF inválido sem chamar a API", async () => {
  let requestCount = 0;
  server.use(
    http.post("http://localhost/api/onboarding/company", () => {
      requestCount += 1;
      return HttpResponse.json(setupResult, { status: 201 });
    }),
  );
  const user = userEvent.setup();
  render(<CompanySetupPage mode="initial" />);

  await fillValidCompany(user);
  const nif = screen.getByLabelText("NIF português");
  await user.clear(nif);
  await user.type(nif, "123456780");
  await user.click(screen.getByRole("button", { name: "Criar e ativar empresa" }));

  expect(await screen.findByText(/não passou a validação de controlo/i)).toBeInTheDocument();
  expect(nif).toHaveAttribute("aria-invalid", "true");
  expect(requestCount).toBe(0);
});
