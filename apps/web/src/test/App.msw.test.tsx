/**
 * @file Integração React + cliente HTTP real usando MSW no limite da rede.
 */

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { App } from "../App";
import { AuthProvider } from "../auth/AuthProvider";

const server = setupServer(
  http.get("http://localhost/api/auth/me", () =>
    HttpResponse.json({
      user: { id: "user-msw", email: "auditor@example.test", name: "Auditora" },
      activeCompanyId: "company-msw",
      role: "AUDITOR",
      permissions: ["company.read"],
      company: { id: "company-msw", name: "Empresa MSW" },
    }),
  ),
  http.get("http://localhost/api/permissions/me", () =>
    HttpResponse.json({
      userId: "user-msw",
      companyId: "company-msw",
      role: "AUDITOR",
      permissions: ["company.read"],
    }),
  ),
  http.get("http://localhost/api/companies", () =>
    HttpResponse.json({
      items: [{ id: "company-msw", name: "Empresa MSW" }],
      pageInfo: { nextCursor: null, hasNextPage: false },
    }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
let interceptedFetch: typeof globalThis.fetch;

beforeEach(() => {
  interceptedFetch = globalThis.fetch;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const absoluteInput =
      typeof input === "string" && input.startsWith("/")
        ? new URL(input, "http://localhost")
        : input;
    return interceptedFetch(absoluteInput, init);
  };
});

afterEach(() => {
  globalThis.fetch = interceptedFetch;
  server.resetHandlers();
  window.history.replaceState({}, "", "/");
});
afterAll(() => server.close());

describe("App com transporte MSW", () => {
  it("hidrata sessão, permissões e listagem através do cliente HTTP real", async () => {
    render(
      <MemoryRouter initialEntries={["/companies"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Empresas e contexto" }))
      .toBeInTheDocument();
    expect((await screen.findAllByText("Empresa MSW")).length).toBeGreaterThan(0);
  });

  it("lê o convite do fragmento, limpa o URL e envia preview apenas no body", async () => {
    const token = "a".repeat(64);
    let previewBody: unknown;
    window.history.replaceState({}, "", `/aceitar-convite#token=${token}`);
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json({ error: "UNAUTHORIZED", message: "Sem sessão" }, { status: 401 }),
      ),
      http.post("http://localhost/api/invitations/preview", async ({ request }) => {
        previewBody = await request.json();
        return HttpResponse.json({
          invitation: {
            companyName: "Empresa Convite",
            role: "CONTABILISTA",
            emailMasked: "a***@example.test",
            expiresAt: "2026-07-12T12:00:00.000Z",
          },
        });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/aceitar-convite"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Empresa: Empresa Convite")).toBeInTheDocument();
    expect(window.location.hash).toBe("");
    expect(previewBody).toEqual({ token });
    expect(screen.queryByLabelText(/^Token$/i)).not.toBeInTheDocument();
  });

  it("aceita o convite autenticado pelo body e atualiza a empresa da sessão", async () => {
    const token = "b".repeat(64);
    let accepted = false;
    let acceptBody: unknown;
    window.history.replaceState({}, "", `/aceitar-convite#token=${token}`);
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json(
          accepted
            ? {
                user: { id: "user-invite", email: "invite@example.test" },
                activeCompanyId: "company-msw",
                role: "CONTABILISTA",
                permissions: ["company.read"],
                company: { id: "company-msw", name: "Empresa Convite" },
              }
            : {
                user: { id: "user-invite", email: "invite@example.test" },
                activeCompanyId: null,
                role: null,
                permissions: [],
                company: null,
              },
        ),
      ),
      http.post("http://localhost/api/invitations/preview", () =>
        HttpResponse.json({
          invitation: {
            companyName: "Empresa Convite",
            role: "CONTABILISTA",
            emailMasked: "i***@example.test",
            expiresAt: "2026-07-12T12:00:00.000Z",
          },
        }),
      ),
      http.post("http://localhost/api/invitations/accept", async ({ request }) => {
        acceptBody = await request.json();
        accepted = true;
        return HttpResponse.json({
          context: {
            companyId: "company-msw",
            companyName: "Empresa Convite",
            role: "CONTABILISTA",
          },
        });
      }),
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/aceitar-convite"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole("button", { name: "Aceitar convite" }));
    expect(await screen.findByRole("heading", { name: "Empresas e contexto" }))
      .toBeInTheDocument();
    expect(acceptBody).toEqual({ token });
    expect(window.location.hash).toBe("");
  });

  it("repõe a password com token do fragmento sem criar um campo de token", async () => {
    const token = "c".repeat(64);
    const rotatedToken = "d".repeat(64);
    let resetBody: unknown;
    window.history.replaceState({}, "", `/recuperar-password#token=${token}`);
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json({ error: "UNAUTHORIZED", message: "Sem sessão" }, { status: 401 }),
      ),
      http.post("http://localhost/api/auth/password/reset", async ({ request }) => {
        resetBody = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/recuperar-password"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(window.location.hash).toBe("");
    expect(screen.queryByLabelText(/^Token$/i)).not.toBeInTheDocument();
    act(() => {
      window.location.hash = `token=${rotatedToken}`;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    await waitFor(() => expect(window.location.hash).toBe(""));
    await user.type(screen.getByLabelText("Nova password"), "password-segura");
    await user.type(screen.getByLabelText("Confirmar nova password"), "password-segura");
    await user.click(screen.getByRole("button", { name: "Alterar password" }));

    expect(await screen.findByText("Password alterada. Inicia uma nova sessão."))
      .toBeInTheDocument();
    expect(resetBody).toEqual({ token: rotatedToken, password: "password-segura" });
  });

  it("conclui onboarding transacional e atualiza a sessão sem IDs manuais", async () => {
    let created = false;
    let onboardingBody: unknown;
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json(
          created
            ? {
                user: { id: "user-new", email: "new@example.test" },
                activeCompanyId: "company-msw",
                role: "ADMIN",
                permissions: ["company.read"],
                company: { id: "company-msw", name: "Empresa Nova" },
              }
            : {
                user: { id: "user-new", email: "new@example.test" },
                activeCompanyId: null,
                role: null,
                permissions: [],
                company: null,
              },
        ),
      ),
      http.post("http://localhost/api/onboarding/company", async ({ request }) => {
        onboardingBody = await request.json();
        created = true;
        return HttpResponse.json(
          {
            company: { id: "company-msw", name: "Empresa Nova", nif: "509442013" },
            context: { companyId: "company-msw", role: "ADMIN" },
          },
          { status: 201 },
        );
      }),
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/onboarding"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.type(await screen.findByLabelText("Nome da empresa"), "Empresa Nova");
    await user.type(screen.getByLabelText("Denominação legal"), "Empresa Nova, Lda.");
    await user.type(screen.getByLabelText("NIF português"), "509442013");
    await user.type(screen.getByLabelText("Morada"), "Rua do Teste 1");
    await user.type(screen.getByLabelText("Código postal"), "1000-001");
    await user.type(screen.getByLabelText("Cidade"), "Lisboa");
    await user.click(screen.getByRole("button", { name: "Criar empresa" }));

    expect(await screen.findByRole("heading", { name: "Empresas e contexto" }))
      .toBeInTheDocument();
    expect(onboardingBody).toEqual(
      expect.objectContaining({
        name: "Empresa Nova",
        profile: expect.objectContaining({
          legalName: "Empresa Nova, Lda.",
          nif: "509442013",
          fiscalYearStartMonth: 1,
          fiscalYearStartDay: 1,
        }),
      }),
    );
  });

  it("distingue falha de bootstrap de sessão anónima e permite retry", async () => {
    let authCalls = 0;
    server.use(
      http.get("http://localhost/api/auth/me", () => {
        authCalls += 1;
        if (authCalls === 1) {
          return HttpResponse.json(
            { error: "SERVICE_UNAVAILABLE", message: "Autenticação indisponível" },
            { status: 503 },
          );
        }
        return HttpResponse.json({
          user: { id: "user-retry", email: "retry@example.test" },
          activeCompanyId: "company-msw",
          role: "ADMIN",
          permissions: ["company.read"],
          company: { id: "company-msw", name: "Empresa MSW" },
        });
      }),
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/companies"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Sessão indisponível" }))
      .toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Identidade e acesso" }))
      .not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByRole("heading", { name: "Empresas e contexto" }))
      .toBeInTheDocument();
  });

  it("ResourcePanel preserva a primeira página e envia cursor/limit ao carregar mais", async () => {
    const requestedQueries: string[] = [];
    const permissions = ["company.read", "accounting.read"];
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json({
          user: { id: "user-pages", email: "pages@example.test" },
          activeCompanyId: "company-msw",
          role: "CONTABILISTA",
          permissions,
          company: { id: "company-msw", name: "Empresa MSW" },
        }),
      ),
      http.get("http://localhost/api/permissions/me", () =>
        HttpResponse.json({
          userId: "user-pages",
          companyId: "company-msw",
          role: "CONTABILISTA",
          permissions,
        }),
      ),
      http.get("http://localhost/api/accounting/accounts", ({ request }) => {
        const url = new URL(request.url);
        requestedQueries.push(url.search);
        return url.searchParams.get("cursor")
          ? HttpResponse.json({
              items: [{ id: "account-2", code: "12", name: "Bancos" }],
              pageInfo: { nextCursor: null, hasNextPage: false },
            })
          : HttpResponse.json({
              items: [{ id: "account-1", code: "11", name: "Caixa" }],
              pageInfo: { nextCursor: "cursor-account-1", hasNextPage: true },
            });
      }),
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/accounting/accounts"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect((await screen.findAllByText("Caixa")).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Carregar mais" }));
    expect((await screen.findAllByText("Bancos")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Caixa").length).toBeGreaterThan(0);
    expect(requestedQueries).toEqual([
      "?limit=50",
      "?cursor=cursor-account-1&limit=50",
    ]);
    expect(screen.queryByRole("button", { name: "Carregar mais" }))
      .not.toBeInTheDocument();
  });

  it("ResourcePanel fixa a pesquisa aplicada durante a continuação por cursor", async () => {
    const requestedQueries: string[] = [];
    const permissions = ["company.read", "customers.read", "customers.write"];
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json({
          user: { id: "user-search-pages", email: "search-pages@example.test" },
          activeCompanyId: "company-msw",
          role: "CONTABILISTA",
          permissions,
          company: { id: "company-msw", name: "Empresa MSW" },
        }),
      ),
      http.get("http://localhost/api/permissions/me", () =>
        HttpResponse.json({
          userId: "user-search-pages",
          companyId: "company-msw",
          role: "CONTABILISTA",
          permissions,
        }),
      ),
      http.get("http://localhost/api/customers", ({ request }) => {
        const url = new URL(request.url);
        requestedQueries.push(url.search);
        return url.searchParams.get("cursor")
          ? HttpResponse.json({
              items: [{ id: "customer-2", name: "Cliente seguinte" }],
              pageInfo: { nextCursor: null, hasNextPage: false },
            })
          : HttpResponse.json({
              items: [{ id: "customer-1", name: "Cliente inicial" }],
              pageInfo: { nextCursor: "cursor-customer-1", hasNextPage: true },
            });
      }),
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/sales/customers"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect((await screen.findAllByText("Cliente inicial")).length).toBeGreaterThan(0);
    await user.type(screen.getByLabelText("Pesquisar por nome ou NIF"), "ainda não aplicada");
    await user.click(screen.getByRole("button", { name: "Carregar mais" }));
    expect((await screen.findAllByText("Cliente seguinte")).length).toBeGreaterThan(0);
    expect(requestedQueries).toEqual([
      "?limit=50",
      "?cursor=cursor-customer-1&limit=50",
    ]);
  });

  it("auditoria e integração tornam a segunda página acessível", async () => {
    const permissions = ["company.read", "audit.read", "integrations.read"];
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json({
          user: { id: "user-logs", email: "logs@example.test" },
          activeCompanyId: "company-msw",
          role: "ADMIN",
          permissions,
          company: { id: "company-msw", name: "Empresa MSW" },
        }),
      ),
      http.get("http://localhost/api/permissions/me", () =>
        HttpResponse.json({
          userId: "user-logs",
          companyId: "company-msw",
          role: "ADMIN",
          permissions,
        }),
      ),
      http.get("http://localhost/api/audit/logs", ({ request }) => {
        const cursor = new URL(request.url).searchParams.get("cursor");
        return HttpResponse.json({
          items: [{
            id: cursor ? "audit-2" : "audit-1",
            action: cursor ? "SECOND_AUDIT_EVENT" : "FIRST_AUDIT_EVENT",
            entity: "Company",
            entityId: "company-msw",
            createdAt: "2026-07-10T01:00:00.000Z",
          }],
          pageInfo: cursor
            ? { nextCursor: null, hasNextPage: false }
            : { nextCursor: "cursor-audit-1", hasNextPage: true },
        });
      }),
      http.get("http://localhost/api/integrations/logs", ({ request }) => {
        const cursor = new URL(request.url).searchParams.get("cursor");
        return HttpResponse.json({
          items: [{
            id: cursor ? "integration-2" : "integration-1",
            operation: cursor ? "SECOND_INTEGRATION_EVENT" : "FIRST_INTEGRATION_EVENT",
            integrationType: "IMPORT",
            status: "SUCCESS",
            createdAt: "2026-07-10T01:00:00.000Z",
          }],
          pageInfo: cursor
            ? { nextCursor: null, hasNextPage: false }
            : { nextCursor: "cursor-integration-1", hasNextPage: true },
        });
      }),
    );
    const user = userEvent.setup();

    const auditView = render(
      <MemoryRouter initialEntries={["/audit/logs"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText("FIRST_AUDIT_EVENT")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Carregar mais" }));
    expect(await screen.findByText("SECOND_AUDIT_EVENT")).toBeInTheDocument();
    auditView.unmount();

    render(
      <MemoryRouter initialEntries={["/integrations/logs"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText("FIRST_INTEGRATION_EVENT")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Carregar mais" }));
    expect(await screen.findByText("SECOND_INTEGRATION_EVENT")).toBeInTheDocument();
  });

  it("reconciliação acrescenta a segunda página sem confirmação automática", async () => {
    const permissions = ["company.read", "treasury.read"];
    const queries: string[] = [];
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json({
          user: { id: "user-reconciliation", email: "treasury@example.test" },
          activeCompanyId: "company-msw",
          role: "CONTABILISTA",
          permissions,
          company: { id: "company-msw", name: "Empresa MSW" },
        }),
      ),
      http.get("http://localhost/api/permissions/me", () =>
        HttpResponse.json({
          userId: "user-reconciliation",
          companyId: "company-msw",
          role: "CONTABILISTA",
          permissions,
        }),
      ),
      http.get("http://localhost/api/treasury/statement-imports", ({ request }) => {
        const url = new URL(request.url);
        queries.push(url.search);
        const second = Boolean(url.searchParams.get("cursor"));
        return HttpResponse.json({
          items: [{
            id: second ? "import-2" : "import-1",
            fileName: second ? "segunda-pagina.ofx" : "primeira-pagina.ofx",
            format: "OFX",
            status: "IMPORTED",
            totalLines: 1,
            acceptedLines: 1,
            rejectedLines: 0,
            importedAt: "2026-07-10T01:00:00.000Z",
          }],
          pageInfo: second
            ? { nextCursor: null, hasNextPage: false }
            : { nextCursor: "cursor-import-1", hasNextPage: true },
        });
      }),
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/treasury/reconciliation"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("primeira-pagina.ofx")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Carregar mais" }));
    expect(await screen.findByText("segunda-pagina.ofx")).toBeInTheDocument();
    expect(screen.getByText("primeira-pagina.ofx")).toBeInTheDocument();
    expect(queries).toEqual([
      "?limit=50",
      "?cursor=cursor-import-1&limit=50",
    ]);
    expect(screen.queryByRole("button", { name: /confirmar/i }))
      .not.toBeInTheDocument();
  });

  it("cria período com exercício fiscal explícito e numérico", async () => {
    const permissions = [
      "company.read",
      "fiscal-periods.read",
      "fiscal-periods.manage",
    ];
    let createBody: unknown;
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json({
          user: { id: "user-period", email: "period@example.test" },
          activeCompanyId: "company-msw",
          role: "CONTABILISTA",
          permissions,
          company: { id: "company-msw", name: "Empresa MSW" },
        }),
      ),
      http.get("http://localhost/api/permissions/me", () =>
        HttpResponse.json({
          userId: "user-period",
          companyId: "company-msw",
          role: "CONTABILISTA",
          permissions,
        }),
      ),
      http.get("http://localhost/api/fiscal-periods", () =>
        HttpResponse.json({ periods: [] }),
      ),
      http.post("http://localhost/api/fiscal-periods", async ({ request }) => {
        createBody = await request.json();
        return HttpResponse.json({
          period: {
            id: "period-2026",
            name: "Exercicio 2026",
            fiscalYear: 2026,
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            status: "OPEN",
          },
        }, { status: 201 });
      }),
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/accounting/fiscal-periods"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Períodos fiscais" }))
      .toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    const dialog = screen.getByRole("dialog", { name: "Abrir período" });
    const fiscalYearInput = within(dialog).getByLabelText("Exercício fiscal");
    expect(fiscalYearInput).toHaveAttribute("type", "number");
    expect(fiscalYearInput).toHaveAttribute("min", "1900");
    expect(fiscalYearInput).toHaveAttribute("max", "9999");
    await user.type(within(dialog).getByLabelText("Nome"), "Exercicio 2026");
    await user.type(fiscalYearInput, "2026");
    await user.type(within(dialog).getByLabelText("Data de início"), "2026-01-01");
    await user.type(within(dialog).getByLabelText("Data de fim"), "2026-12-31");
    await user.click(within(dialog).getByRole("button", { name: "Abrir" }));

    await waitFor(() => expect(createBody).toEqual({
      name: "Exercicio 2026",
      fiscalYear: 2026,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    }));
  });

  it("GESTOR gere apenas memberships e convites não ADMIN", async () => {
    const permissions = ["company.read", "users.manage"];
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json({
          user: { id: "gestor-1", email: "gestor@example.test" },
          activeCompanyId: "company-msw",
          role: "GESTOR",
          permissions,
          company: { id: "company-msw", name: "Empresa MSW" },
        }),
      ),
      http.get("http://localhost/api/permissions/me", () =>
        HttpResponse.json({
          userId: "gestor-1",
          companyId: "company-msw",
          role: "GESTOR",
          permissions,
        }),
      ),
      http.get("http://localhost/api/company/users", () =>
        HttpResponse.json({
          users: [
            { userId: "admin-1", email: "admin@example.test", name: "Admin Principal", role: "ADMIN" },
            { userId: "operacional-1", email: "ops@example.test", name: "Operacional Um", role: "OPERACIONAL" },
            { userId: "gestor-1", email: "gestor@example.test", name: "Gestor Atual", role: "GESTOR" },
          ],
        }),
      ),
      http.get("http://localhost/api/company/invitations", () =>
        HttpResponse.json({
          invitations: [
            {
              id: "invite-admin",
              email: "future-admin@example.test",
              role: "ADMIN",
              status: "PENDING",
              expiresAt: "2026-07-20T12:00:00.000Z",
              acceptedAt: null,
              revokedAt: null,
              createdAt: "2026-07-10T12:00:00.000Z",
              updatedAt: "2026-07-10T12:00:00.000Z",
            },
            {
              id: "invite-auditor",
              email: "future-auditor@example.test",
              role: "AUDITOR",
              status: "PENDING",
              expiresAt: "2026-07-20T12:00:00.000Z",
              acceptedAt: null,
              revokedAt: null,
              createdAt: "2026-07-10T12:00:00.000Z",
              updatedAt: "2026-07-10T12:00:00.000Z",
            },
          ],
        }),
      ),
    );

    render(
      <MemoryRouter initialEntries={["/company/users"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Utilizadores da empresa" }))
      .toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "ADMIN" })).not.toBeInTheDocument();
    const adminCard = (await screen.findByRole("heading", { name: "Admin Principal" })).closest("article");
    const operationalCard = screen.getByRole("heading", { name: "Operacional Um" }).closest("article");
    const adminInvite = screen.getByRole("heading", { name: "future-admin@example.test" }).closest("article");
    const auditorInvite = screen.getByRole("heading", { name: "future-auditor@example.test" }).closest("article");
    expect(adminCard).not.toBeNull();
    expect(operationalCard).not.toBeNull();
    expect(adminInvite).not.toBeNull();
    expect(auditorInvite).not.toBeNull();
    expect(within(adminCard!).queryByRole("button")).not.toBeInTheDocument();
    expect(within(operationalCard!).getByRole("button", { name: "Alterar role" }))
      .toBeInTheDocument();
    expect(within(adminInvite!).queryByRole("button")).not.toBeInTheDocument();
    expect(within(auditorInvite!).getByRole("button", { name: "Reenviar" }))
      .toBeInTheDocument();
    expect(within(auditorInvite!).getByRole("button", { name: "Revogar" }))
      .toBeInTheDocument();
  });

  it("GESTOR vê forecast e relatórios, mas não IVA, escrita de tesouraria ou Lançar", async () => {
    const permissions = [
      "company.read",
      "treasury.read",
      "cashflow-forecast.read",
      "operational-reports.read",
      "executive-kpis.read",
      "purchases.read",
      "purchases.approve",
      "purchase-approval-history.read",
    ];
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json({
          user: { id: "gestor-2", email: "gestor2@example.test" },
          activeCompanyId: "company-msw",
          role: "GESTOR",
          permissions,
          company: { id: "company-msw", name: "Empresa MSW" },
        }),
      ),
      http.get("http://localhost/api/permissions/me", () =>
        HttpResponse.json({
          userId: "gestor-2",
          companyId: "company-msw",
          role: "GESTOR",
          permissions,
        }),
      ),
      http.get("http://localhost/api/purchases/documents", () =>
        HttpResponse.json({
          items: [{ id: "purchase-1", number: "CMP-1", status: "DRAFT" }],
          pageInfo: { nextCursor: null, hasNextPage: false },
        }),
      ),
    );

    const accountsView = render(
      <MemoryRouter initialEntries={["/treasury/accounts"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "Contas bancarias e caixa" }))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previsão de tesouraria" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Relatórios operacionais" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "KPIs executivos" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Mapa de IVA" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Nova conta" })).not.toBeInTheDocument();
    accountsView.unmount();

    render(
      <MemoryRouter initialEntries={["/purchases/approval"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "Aprovação de compras" }))
      .toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Aprovar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Lancar" })).not.toBeInTheDocument();
  });

  it("AUDITOR consulta histórico, lembretes e notificações sem criar compras", async () => {
    const permissions = [
      "company.read",
      "purchases.read",
      "purchase-approval-history.read",
      "reminders.write",
      "notifications.read",
      "suppliers.read",
      "items.read",
      "warehouses.read",
    ];
    server.use(
      http.get("http://localhost/api/auth/me", () =>
        HttpResponse.json({
          user: { id: "auditor-1", email: "auditor@example.test" },
          activeCompanyId: "company-msw",
          role: "AUDITOR",
          permissions,
          company: { id: "company-msw", name: "Empresa MSW" },
        }),
      ),
      http.get("http://localhost/api/permissions/me", () =>
        HttpResponse.json({
          userId: "auditor-1",
          companyId: "company-msw",
          role: "AUDITOR",
          permissions,
        }),
      ),
      http.get("http://localhost/api/purchases/documents", () =>
        HttpResponse.json({
          items: [{ id: "purchase-audit-1", number: "CMP-AUD-1", status: "APPROVED" }],
          pageInfo: { nextCursor: null, hasNextPage: false },
        }),
      ),
    );

    render(
      <MemoryRouter initialEntries={["/purchases/documents"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "Documentos de compra" }))
      .toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Histórico" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Criar rascunho de compra" }))
      .not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lembretes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Notificações" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Previsão de tesouraria" }))
      .not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "KPIs executivos" }))
      .not.toBeInTheDocument();
  });
});
