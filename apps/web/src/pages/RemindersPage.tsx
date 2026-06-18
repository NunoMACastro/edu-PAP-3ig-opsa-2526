// apps/web/src/pages/RemindersPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { ReminderItem, ReminderStatus, createReminder, loadReminders, updateReminderStatus } from "../lib/mf4Api";

/** Página MF4 para Lembretes. */
export function RemindersPage() {
  const [items, setItems] = useState<ReminderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      // A API já sabe a empresa através da sessão; a página só pede os dados.
      const result = await loadReminders();
      setItems(result.items);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // FormData lê os campos reais do formulário sem manter estado duplicado para cada input.
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await createReminder({
        type: String(form.get("type")) as "DEADLINE" | "PAYMENT" | "TAX",
        title: String(form.get("title") ?? ""),
        dueDate: String(form.get("dueDate") ?? ""),
        notes: String(form.get("notes") ?? ""),
      });
      // Depois de criar, limpamos o formulário e recarregamos para mostrar a fonte de verdade.
      event.currentTarget.reset();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: string, status: ReminderStatus) {
    // A UI envia só o novo estado; o backend confirma ownership e permissões.
    await updateReminderStatus(id, status);
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="panel">
      <h2>Lembretes</h2>
      <form onSubmit={submit}>
        <select name="type" defaultValue="DEADLINE">
          <option value="DEADLINE">Prazo</option>
          <option value="PAYMENT">Pagamento</option>
          <option value="TAX">Imposto</option>
        </select>
        <input name="title" required />
        <input name="dueDate" type="date" required />
        <textarea name="notes" />
        <button disabled={busy}>{busy ? "A guardar..." : "Criar"}</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <span>{item.type} · {item.status}</span>
            <button type="button" onClick={() => changeStatus(item.id, "DONE")}>Concluir</button>
            <button type="button" onClick={() => changeStatus(item.id, "CANCELLED")}>Cancelar</button>
          </li>
        ))}
      </ul>
    </section>
  );
}