import { useState } from "react";
import { SmartAlert, getSmartAlerts } from "../lib/mf4Api";

export function SmartAlertsPage() {
    const [alerts, setAlerts] = useState<SmartAlert[]>([]);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            const result = await getSmartAlerts();
            setAlerts(result.alerts);
            setError(null);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Erro inesperado"
            );
        }
    }

    return (
        <section className="panel">
            <h2>Alertas inteligentes</h2>

            <button type="button" onClick={load}>
                Consultar
            </button>

            {error ? <p className="error">{error}</p> : null}

            {alerts.length === 0 ? (
                <p>Sem alertas abertos.</p>
            ) : null}

            <ul>
                {alerts.map((alert) => (
                    <li key={alert.id}>
                        <strong>{alert.title}</strong>
                        <p>{alert.message}</p>
                        <small>
                            {alert.severity} · {alert.sourceType}
                        </small>
                    </li>
                ))}
            </ul>
        </section>
    );
}