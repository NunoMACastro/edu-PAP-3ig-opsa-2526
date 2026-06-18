// apps/web/src/pages/IntegrationLogsPage.tsx
import { useState } from "react";
import { IntegrationLogItem, getIntegrationLogs } from "../lib/mf4Api";

/** Página MF4 para Logs de integração. */
export function IntegrationLogsPage() {
  const [logs, setLogs] = useState<IntegrationLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // A API só devolve logs se a sessão for Admin da empresa ativa.
      const result = await getIntegrationLogs();
      setLogs(result.logs);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  return (
    <section className="panel">
      <h2>Logs de integração</h2>
      <button type="button" onClick={load}>Consultar</button>
      {error ? <p className="error">{error}</p> : null}
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <strong>{log.integrationType}</strong>
            <span>{log.status} · {log.successCount}/{log.totalCount}</span>
            <small>{log.message ?? "Sem mensagem"}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}