/**
 * @file Contrato frontend do contexto transacional mantido apenas em memória React.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import chatSource from "../ai/AiChat.tsx?raw";
import apiSource from "../lib/aiChatApi.ts?raw";
import {
  AiPageContextProvider,
  useAiTransactionContext,
} from "../ai/AiPageContext";

function ContextProbe() {
  const context = useAiTransactionContext();
  return (
    <div>
      <span>{context.transaction?.label ?? "sem contexto"}</span>
      <button type="button" onClick={() => context.setTransaction({ documentType: "SALE", documentId: "sale-id", label: "FT 2026/3" })}>Selecionar venda</button>
      <button type="button" onClick={context.clearTransaction}>Limpar</button>
    </div>
  );
}

describe("contexto transacional da IA", () => {
  it("seleciona, limpa e descarta o documento ao mudar de módulo", async () => {
    const view = render(<AiPageContextProvider value={{ module: "sales" }}><ContextProbe /></AiPageContextProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Selecionar venda" }));
    expect(screen.getByText("FT 2026/3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(screen.getByText("sem contexto")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Selecionar venda" }));
    view.rerender(<AiPageContextProvider value={{ module: "purchases" }}><ContextProbe /></AiPageContextProvider>);
    await waitFor(() => expect(screen.getByText("sem contexto")).toBeInTheDocument());
  });

  it("envia apenas tipo/id e expõe cliente tipado do endpoint", () => {
    expect(chatSource).toContain("documentType: pageContext.transaction.documentType");
    expect(chatSource).toContain("documentId: pageContext.transaction.documentId");
    expect(chatSource).not.toContain("localStorage");
    expect(chatSource).not.toContain("sessionStorage");
    expect(apiSource).toContain('"/ai/transaction-analysis"');
    expect(apiSource).toContain("transactionAnalysis:");
  });
});
