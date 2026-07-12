/**
 * @file Testes DOM da apresentação segura de resultados operacionais.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActionFeedbackMessage, StructuredResult } from "./opsaUi";

describe("StructuredResult", () => {
  it("apresenta campos úteis e remove segredos ou cargas técnicas", () => {
    render(
      <StructuredResult
        value={{
          id: "export-1",
          status: "READY",
          token: "secret-token",
          contentBase64: "private-file",
        }}
      />,
    );

    expect(screen.getByText("export-1")).toBeInTheDocument();
    expect(screen.getByText("READY")).toBeInTheDocument();
    expect(screen.queryByText("secret-token")).not.toBeInTheDocument();
    expect(screen.queryByText("private-file")).not.toBeInTheDocument();
  });
});

describe("ActionFeedbackMessage", () => {
  it("mantém códigos HTTP fora da mensagem principal e recolhidos em detalhes", () => {
    render(
      <ActionFeedbackMessage
        feedback={{
          phase: "error",
          tone: "danger",
          title: "Operação não concluída",
          message: "Confirma os dados e tenta novamente.",
          technical: { status: 409, code: "CONFLICT" },
        }}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Confirma os dados e tenta novamente.");
    expect(screen.getByText("Detalhes técnicos")).toBeInTheDocument();
    expect(screen.getByText("HTTP 409 · CONFLICT")).not.toBeVisible();
  });
});
