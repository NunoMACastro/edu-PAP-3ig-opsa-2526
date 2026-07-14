/**
 * @file Associação acessível e limpeza dos erros de formulário.
 */

import { type FormEvent, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FieldError, FormErrorSummary, useFormErrors } from "./formErrors";

function ErrorHarness() {
  const formErrors = useFormErrors();
  const [value, setValue] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formErrors.applyErrors([{ field: "nif", message: "O NIF deve ter 9 algarismos." }], event.currentTarget);
  }
  return (
    <form onSubmit={submit}>
      <FormErrorSummary errors={formErrors.errors} summaryRef={formErrors.summaryRef} />
      <label>
        <span>NIF</span>
        <input
          name="nif"
          value={value}
          aria-invalid={Boolean(formErrors.errors.nif)}
          aria-describedby={formErrors.errors.nif ? "nif-error" : undefined}
          onChange={(event) => {
            setValue(event.target.value);
            formErrors.clearField("nif");
          }}
        />
        <FieldError field="nif" message={formErrors.errors.nif} />
      </label>
      <button type="submit">Validar</button>
    </form>
  );
}

describe("useFormErrors", () => {
  it("associa o erro ao campo, move foco e limpa quando a pessoa corrige", async () => {
    const user = userEvent.setup();
    render(<ErrorHarness />);
    const input = screen.getByLabelText("NIF");

    await user.click(screen.getByRole("button", { name: "Validar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("O NIF deve ter 9 algarismos.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "nif-error");
    await waitFor(() => expect(input).toHaveFocus());

    await user.type(input, "5");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).not.toHaveAttribute("aria-describedby");
  });
});
