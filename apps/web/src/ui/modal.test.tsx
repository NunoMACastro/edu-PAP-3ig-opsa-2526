/**
 * @file Contratos de teclado e confirmação das superfícies modais partilhadas.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmationDialog, ModalSurface } from "./modal";

function ModalHarness() {
  const [open, setOpen] = useState(false);
  return (
    <div className="appShell">
      <button type="button" onClick={() => setOpen(true)}>Abrir diálogo</button>
      <ModalSurface open={open} title="Editar registo" onClose={() => setOpen(false)}>
        <input aria-label="Nome" />
        <button type="button">Guardar</button>
      </ModalSurface>
    </div>
  );
}

describe("ModalSurface", () => {
  it("isola o fundo, fecha com Escape e devolve o foco ao comando de origem", async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    const trigger = screen.getByRole("button", { name: "Abrir diálogo" });
    await user.click(trigger);

    expect(screen.getByRole("dialog", { name: "Editar registo" })).toBeVisible();
    expect(document.querySelector(".appShell")).toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Fechar diálogo" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector(".appShell")).not.toHaveAttribute("inert");
    expect(trigger).toHaveFocus();
  });

  it("mantém o foco dentro do diálogo ao navegar com Tab", async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    await user.click(screen.getByRole("button", { name: "Abrir diálogo" }));
    const close = screen.getByRole("button", { name: "Fechar diálogo" });

    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByRole("button", { name: "Guardar" })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
  });
});

describe("ConfirmationDialog", () => {
  it("exige reconhecimento explícito numa operação terminal", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    render(
      <div className="appShell">
        <ConfirmationDialog
          open
          title="Fechar período"
          description="Bloqueia novos lançamentos."
          confirmLabel="Fechar"
          companyName="Empresa Teste"
          entityLabel="Exercício 2026"
          requireAcknowledgement
          onCancel={vi.fn()}
          onConfirm={confirm}
        />
      </div>,
    );

    const button = screen.getByRole("button", { name: "Fechar", hidden: true });
    expect(button).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { hidden: true }));
    expect(button).toBeEnabled();
    await user.click(button);
    expect(confirm).toHaveBeenCalledOnce();
  });
});
