// apps/web/src/pages/SaftExportPage.tsx
import { FormEvent, useState } from "react";
import { fetchSaftExport, type SaftExportResult } from "../lib/complianceApi";

/**
 * Página de exportação SAF-T MVP.
 *
 * Gere datas, loading, erro e resultado. O XML pode ser inspecionado no ecrã e descarregado sem
 * fazer submissão automática a entidades externas.
 *
 * @returns {JSX.Element} Interface de compliance.
 */
export function SaftExportPage() {
    const [result, setResult] = useState<SaftExportResult | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // A API valida perfil fiscal e roles; a UI apenas recolhe o período.
            setResult(await fetchSaftExport(String(form.get("from")), String(form.get("to"))));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Exportar SAF-T (PT)</h1>
            <form onSubmit={handleSubmit}><input name="from" type="date" required /><input name="to" type="date" required /><button disabled={loading}>{loading ? "A gerar..." : "Gerar XML"}</button></form>
            {error && <p role="alert">{error}</p>}
            {result && <section><p>Ficheiro: {result.fileName}</p><a download={result.fileName} href={`data:text/xml;charset=utf-8,${encodeURIComponent(result.xml)}`}>Descarregar XML</a><pre>{result.xml}</pre></section>}
        </main>
    );
}