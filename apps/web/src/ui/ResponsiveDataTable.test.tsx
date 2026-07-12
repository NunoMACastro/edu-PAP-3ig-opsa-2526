/**
 * @file Contratos de apresentação segura da tabela responsiva.
 */

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResponsiveDataTable } from "./ResponsiveDataTable";

describe("ResponsiveDataTable", () => {
  it("renderiza apenas colunas declaradas e nunca expõe identificadores internos", () => {
    render(
      <ResponsiveDataTable
        caption="Clientes"
        rows={[{
          id: "customer-secret-id",
          companyId: "company-secret-id",
          name: "Cliente Alfa",
          nif: "501234567",
          internalMetadata: "não apresentar",
        }]}
        columns={[
          { key: "name", label: "Cliente", priority: "primary" },
          { key: "nif", label: "NIF", priority: "secondary" },
        ]}
        renderMobileTitle={(row) => row.name}
      />,
    );

    const table = screen.getByRole("table", { name: "Clientes" });
    expect(within(table).getByRole("columnheader", { name: "Cliente" })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "NIF" })).toBeInTheDocument();
    expect(screen.queryByText("customer-secret-id")).not.toBeInTheDocument();
    expect(screen.queryByText("company-secret-id")).not.toBeInTheDocument();
    expect(screen.queryByText("não apresentar")).not.toBeInTheDocument();
  });

  it("limita o cartão mobile a cinco campos prioritários", () => {
    render(
      <ResponsiveDataTable
        caption="Artigos"
        rows={[{ name: "Artigo A", one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }]}
        columns={[
          { key: "name", label: "Nome", priority: "primary" },
          { key: "one", label: "Um", priority: "secondary" },
          { key: "two", label: "Dois", priority: "secondary" },
          { key: "three", label: "Três", priority: "secondary" },
          { key: "four", label: "Quatro", priority: "secondary" },
          { key: "five", label: "Cinco", priority: "secondary" },
          { key: "six", label: "Seis", priority: "desktop" },
        ]}
        renderMobileTitle={(row) => row.name}
      />,
    );

    const mobile = screen.getByLabelText("Artigos em cartoes");
    expect(within(mobile).getAllByText(/Nome|Um|Dois|Três|Quatro/)).toHaveLength(5);
    expect(within(mobile).queryByText("Cinco")).not.toBeInTheDocument();
    expect(within(mobile).queryByText("Seis")).not.toBeInTheDocument();
  });
});
