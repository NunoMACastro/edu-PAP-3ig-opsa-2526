
// apps/web/src/pages/TasksPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { OperationalTask, OperationalTaskStatus, createOperationalTask, loadOperationalTasks, updateOperationalTaskStatus } from "../lib/mf4Api";

/** Página MF4 para Tarefas. */
export function TasksPage() {
  const [items, setItems] = useState<OperationalTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      // O backend filtra pela empresa ativa, por isso a página não constrói filtros sensíveis.
      const result = await loadOperationalTasks();
      setItems(result.items);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // FormData recolhe os campos no momento do submit.
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await createOperationalTask({
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        dueDate: String(form.get("dueDate") ?? ""),
        assignedToId: String(form.get("assignedToId") ?? ""),
      });
      // Recarregar a lista depois de criar evita divergência entre UI e base de dados.
      event.currentTarget.reset();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: string, status: OperationalTaskStatus) {
    // A UI só pede a transição; o backend decide se a tarefa pertence à empresa.
    await updateOperationalTaskStatus(id, status);
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="panel">
      <h2>Tarefas</h2>
      <form onSubmit={submit}>
        <input name="title" required />
        <textarea name="description" />
        <input name="dueDate" type="date" required />
        <input name="assignedToId" required />
        <button disabled={busy}>{busy ? "A guardar..." : "Criar"}</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <span>{item.status} · responsável {item.assignedToId}</span>
            <button type="button" onClick={() => changeStatus(item.id, "IN_PROGRESS")}>Iniciar</button>
            <button type="button" onClick={() => changeStatus(item.id, "DONE")}>Concluir</button>
          </li>
        ))}
      </ul>
    </section>
  );
}