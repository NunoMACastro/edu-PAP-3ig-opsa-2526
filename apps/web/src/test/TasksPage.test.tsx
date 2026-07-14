/**
 * @file Prova do seletor de responsáveis com a permissão própria de tarefas.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { createTask, getTaskAssignees, getTasks, updateTaskStatus } = vi.hoisted(() => ({
  createTask: vi.fn(),
  getTaskAssignees: vi.fn(),
  getTasks: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

vi.mock("../lib/mf4Api", async (importOriginal) => {
  const original = await importOriginal<typeof import("../lib/mf4Api")>();
  return {
    ...original,
    createTask,
    getTaskAssignees,
    getTasks,
    updateTaskStatus,
  };
});

import { TasksPage } from "../pages/mf4Pages";

afterEach(() => {
  vi.clearAllMocks();
});

describe("TasksPage", () => {
  it("carrega o endpoint mínimo de responsáveis e mantém a atribuição opcional", async () => {
    getTaskAssignees.mockResolvedValue({
      assignees: [{ id: "user-ana", name: "Ana Operacional" }],
    });
    getTasks.mockResolvedValue({ tasks: [] });
    createTask.mockResolvedValue({ task: { id: "task-1" } });

    render(<TasksPage />);

    expect(await screen.findByRole("option", { name: "Ana Operacional" }))
      .toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Sem responsável" }))
      .toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "Validar documentos" },
    });
    fireEvent.change(screen.getByLabelText("Prazo"), {
      target: { value: "2026-07-31" },
    });
    fireEvent.change(screen.getByLabelText("Responsável (opcional)"), {
      target: { value: "user-ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await waitFor(() => expect(createTask).toHaveBeenCalledWith({
      title: "Validar documentos",
      description: undefined,
      dueAt: "2026-07-31",
      assignedToId: "user-ana",
    }));
    expect(getTaskAssignees).toHaveBeenCalledOnce();
  });
});
