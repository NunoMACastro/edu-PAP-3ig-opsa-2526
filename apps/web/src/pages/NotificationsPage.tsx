// apps/web/src/pages/NotificationsPage.tsx
import { useEffect, useState } from "react";
import { InAppNotification, loadNotifications, markNotificationAsRead, syncNotifications } from "../lib/mf4Api";

/** Página MF4 para Notificações. */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // A listagem devolve apenas notificações da sessão atual.
      const result = await loadNotifications();
      setNotifications(result.notifications);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  async function sync() {
    // Sincroniza fontes existentes e substitui a lista local pelo resultado do backend.
    const result = await syncNotifications();
    setNotifications(result.notifications);
  }

  async function markRead(id: string) {
    // O backend valida se este id pertence ao utilizador antes de escrever readAt.
    await markNotificationAsRead(id);
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="panel">
      <h2>Notificações</h2>
      <button type="button" onClick={sync}>Sincronizar</button>
      {error ? <p className="error">{error}</p> : null}
      {notifications.length === 0 ? <p>Sem notificações.</p> : null}
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
            <small>{notification.sourceType} · {notification.readAt ? "lida" : "por ler"}</small>
            {!notification.readAt ? (
              <button type="button" onClick={() => markRead(notification.id)}>Marcar como lida</button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}