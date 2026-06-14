// apps/web/src/pages/BusinessImportPage.tsx
import { FormEvent, useState } from "react";
import { importBusinessData, type BusinessImportType } from "../lib/importApi";

/**
 * Página de importação CSV de dados operacionais.
 *
 * Gere estados de loading, erro e sucesso. A validação completa é feita no backend, porque o utilizador
 * pode alterar manualmente o HTML ou enviar pedidos fora da UI.
 *
 * @returns {JSX.Element} Interface de importação.
 */
export function BusinessImportPage() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // O frontend recolhe CSV textual; o backend decide linha a linha o que pode ser gravado.
            const result = await importBusinessData(String(form.get("type")) as BusinessImportType, String(form.get("fileName")), String(form.get("content")));
            setMessage(`Importação concluída: ${result.acceptedRows} aceites, ${result.rejectedRows} rejeitadas.`);
        } catch (err) {
            setMessage("");
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Importar dados operacionais</h1>
            <form onSubmit={handleSubmit}>
                <select name="type" defaultValue="CUSTOMERS"><option value="CUSTOMERS">Clientes</option><option value="SUPPLIERS">Fornecedores</option><option value="ITEMS">Artigos</option><option value="STATEMENTS">Extratos</option></select>
                <input name="fileName" defaultValue="import.csv" required />
                <textarea name="content" rows={12} required />
                <button disabled={loading}>{loading ? "A importar..." : "Importar CSV"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {message && <p>{message}</p>}
        </main>
    );
}