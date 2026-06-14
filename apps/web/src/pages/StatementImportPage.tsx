// apps/web/src/pages/StatementImportPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { listTreasuryAccounts, type TreasuryAccount } from "../lib/treasuryApi";
import { importStatement, type StatementImportResult } from "../lib/statementApi";

/**
 * Página de importação textual de extratos bancários.
 *
 * Carrega contas reais da tesouraria, envia CSV/OFX simplificado e mostra feedback sem confirmar
 * reconciliação automaticamente.
 *
 * @returns {JSX.Element} Interface de importação de extratos.
 */
export function StatementImportPage() {
    const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
    const [result, setResult] = useState<StatementImportResult | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void listTreasuryAccounts()
            .then(setAccounts)
            .catch((err) => setError(err instanceof Error ? err.message : "Erro inesperado"));
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            setResult(await importStatement({
                treasuryAccountId: String(form.get("treasuryAccountId") ?? ""),
                fileName: String(form.get("fileName") ?? "extrato.csv"),
                format: String(form.get("format") ?? "CSV") as "CSV" | "OFX",
                content: String(form.get("content") ?? ""),
            }));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Importar extrato bancário</h1>
            <form onSubmit={handleSubmit}>
                <select name="treasuryAccountId" required>
                    <option value="">Escolhe a conta</option>
                    {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
                <input name="fileName" placeholder="extrato.csv" required />
                <select name="format" defaultValue="CSV"><option value="CSV">CSV</option><option value="OFX">OFX</option></select>
                <textarea name="content" rows={10} placeholder="data;descrição;referência;valor" required />
                <button disabled={loading}>{loading ? "A importar..." : "Importar"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {accounts.length === 0 && !error && <p>Cria uma conta de tesouraria antes de importar extratos.</p>}
            {result && <p>Importação {result.id} criada com {result.totalLines} linhas e {result.lines.reduce((sum, line) => sum + line.suggestions.length, 0)} sugestões.</p>}
        </main>
    );
}