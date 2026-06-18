// apps/web/src/pages/AuditLogsPage.tsx
import { useState } from "react";
import { AuditLogItem, getAuditLogs } from "../lib/mf4Api";

/** Página MF4 para Auditoria. */
export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // A API só responde se a sessão tiver papel ADMIN ou AUDITOR.
      const result = await getAuditLogs();
      setLogs(result.logs);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  return (
    <section className="panel">
      <h2>Auditoria</h2>
      <button type="button" onClick={load}>Consultar</button>
      {error ? <p className="error">{error}</p> : null}
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <strong>{log.action}</strong>
            <span>{log.entity} · {log.entityId}</span>
            <small>{log.createdAt}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}