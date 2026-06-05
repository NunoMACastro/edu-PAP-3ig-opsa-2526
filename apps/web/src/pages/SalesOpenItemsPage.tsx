// apps/web/src/pages/SalesOpenItemsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { fetchSalesOpenItems, type SalesOpenItem } from "../lib/salesOpenItemsApi";

export function SalesOpenItemsPage() {
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
    const [items, setItems] = useState<SalesOpenItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadItems(date = asOfDate) {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchSalesOpenItems(date);
            setItems(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar títulos em aberto.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { void loadItems(); }, []);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void loadItems(asOfDate);
    }

    return (
        <main>
            <h1>Titulos em aberto</h1>
            <form onSubmit={handleSubmit} aria-label="Filtrar títulos em aberto">
                <input type="date" value={asOfDate} onChange={(event) => setAsOfDate(event.target.value)} />
                <button type="submit">Atualizar</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {loading ? <p>A carregar títulos...</p> : items.length === 0 ? <p>Não existem valores em aberto.</p> : (
                <table>
                    <thead><tr><th>Documento</th><th>Cliente</th><th>Valor em aberto</th><th>Atraso</th><th>Bucket</th></tr></thead>
                    <tbody>{items.map((item) => <tr key={item.id}><td>{item.number}</td><td>{item.customerName}</td><td>{item.openAmountCents / 100} EUR</td><td>{item.daysOverdue} dias</td><td>{item.bucket}</td></tr>)}</tbody>
                </table>
            )}
        </main>
    );
}