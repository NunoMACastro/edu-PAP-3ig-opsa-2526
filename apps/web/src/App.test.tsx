/**
 * @file Testes DOM da navegação protegida e do menu responsivo da aplicação OPSA.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthProvider";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function renderApplication(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("apresenta o dashboard autenticado com dados reais e atalhos autorizados", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const permissions = ["dashboard.read", "sales.read", "notifications.read"];
      if (url.endsWith("/api/auth/me")) return jsonResponse({
        user: { id: "user-1", email: "gestor@example.test", name: "Gestor" },
        activeCompanyId: "company-1",
        role: "GESTOR",
        permissions,
        company: { id: "company-1", name: "Empresa Real" },
      });
      if (url.endsWith("/api/permissions/me")) return jsonResponse({
        userId: "user-1",
        companyId: "company-1",
        role: "GESTOR",
        permissions,
      });
      if (url.endsWith("/api/dashboard/summary")) return jsonResponse({
        summary: {
          asOf: "2026-07-12",
          company: { id: "company-1", name: "Empresa Real" },
          activeFiscalPeriod: {
            id: "period-1",
            name: "Exercício 2026",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            status: "OPEN",
          },
          sales: { draft: 2, submitted: 3, approved: 1 },
          purchases: { draft: 4, approved: 5 },
          receivables: { openCount: 6, overdueCount: 2, overdueCents: 12345 },
          stockAlerts: { total: 7, lowStock: 4, highStock: 2, stoppedItems: 1 },
          notifications: { unread: 8 },
        },
      });
      throw new Error(`Pedido não simulado: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApplication("/dashboard");

    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getAllByText("Empresa Real").length).toBeGreaterThan(0);
    expect(await screen.findByText(/123,45/)).toBeInTheDocument();
    expect(screen.getAllByText("Exercício 2026")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Documentos de venda" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Documentos de compra" })).not.toBeInTheDocument();
  });

  it("redireciona uma rota protegida para a identidade quando não há sessão", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ error: "UNAUTHORIZED", message: "Sessão expirada" }, 401),
      ),
    );

    renderApplication("/sales/documents");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "OPSA — Contabilidade inteligente, potencializada por IA.",
      }),
    ).toBeInTheDocument();
    expect(document.querySelector(".sidebarBrand__logo")).toHaveAttribute(
      "src",
      expect.stringContaining("opsa-logo.png"),
    );
    expect(await screen.findByRole("heading", { level: 2, name: "Iniciar sessão" }))
      .toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Documentos de venda" }))
      .not.toBeInTheDocument();
  });

  it("separa registo, login e recuperação e configura autofill", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ error: "UNAUTHORIZED", message: "Sem sessão" }, 401),
      ),
    );

    renderApplication("/registar");

    expect(await screen.findByRole("heading", { level: 2, name: "Criar conta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Palavra-passe")).toHaveAttribute("autocomplete", "new-password");
    expect(screen.queryByRole("heading", { name: "Login" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Já tenho conta" })).toHaveAttribute("href", "/auth");
  });

  it("mostra apenas destinos autorizados e abre o drawer móvel por comando acessível", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/auth/me")) {
        return jsonResponse({
          user: { id: "user-1", email: "auditor@example.test", name: "Auditora" },
          activeCompanyId: "company-1",
          role: "AUDITOR",
          permissions: ["company.read"],
          company: { id: "company-1", name: "Empresa Teste" },
        });
      }
      if (url.endsWith("/api/permissions/me")) {
        return jsonResponse({
          userId: "user-1",
          companyId: "company-1",
          role: "AUDITOR",
          permissions: ["company.read"],
        });
      }
      if (url.endsWith("/api/companies")) {
        return jsonResponse({ items: [{ id: "company-1", name: "Empresa Teste" }] });
      }
      throw new Error(`Pedido não simulado: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    renderApplication("/companies");

    expect(await screen.findByRole("heading", { name: "Empresas e contexto" }))
      .toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Perfil da empresa" }))
      .toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Utilizadores da empresa" }))
      .not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Documentos de venda" }))
      .not.toBeInTheDocument();

    const menuButton = screen.getByRole("button", { name: "Abrir menu" });
    await user.click(menuButton);
    expect(menuButton).toHaveAccessibleName("Fechar menu");
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector(".sidebar")).toHaveClass("sidebar--open");
    expect(screen.getAllByRole("button", { name: "Fechar menu" })).toHaveLength(2);

    await user.keyboard("{Escape}");
    expect(menuButton).toHaveAccessibleName("Abrir menu");
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector(".sidebar")).not.toHaveClass("sidebar--open");

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });

  it("redireciona perguntas legadas para o chat e expõe o launcher apenas a uma role analítica", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/auth/me")) return jsonResponse({ user: { id: "user-1", email: "admin@example.test", name: "Admin" }, activeCompanyId: "company-1", role: "ADMIN", permissions: ["ai.chat.use", "ai.insights.read"], company: { id: "company-1", name: "Empresa Demo" } });
      if (url.endsWith("/api/permissions/me")) return jsonResponse({ userId: "user-1", companyId: "company-1", role: "ADMIN", permissions: ["ai.chat.use", "ai.insights.read"] });
      if (url.endsWith("/api/ai/chat/sessions")) return jsonResponse({ sessions: [] });
      if (url.endsWith("/api/ai/consent")) return jsonResponse({ consent: { policyVersion: "2026-01", accepted: false, acceptedAt: null } });
      throw new Error(`Pedido não simulado: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    renderApplication("/ai/questions");

    expect((await screen.findAllByRole("heading", { name: "Assistente OPSA" })).length).toBeGreaterThan(0);
    const launcher = screen.getByRole("button", { name: "Assistente OPSA" });
    expect(launcher).toHaveAttribute("aria-expanded", "false");
    await user.click(launcher);
    expect(launcher).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Assistente OPSA" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(launcher).toHaveAttribute("aria-expanded", "false");
  });
});
