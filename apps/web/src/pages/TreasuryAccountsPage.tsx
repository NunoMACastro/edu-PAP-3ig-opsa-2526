// apps/web/src/pages/TreasuryAccountsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createTreasuryAccount, listTreasuryAccounts, type TreasuryAccount } from "../lib/treasuryApi";

/**
 * Formata cêntimos em euros para apresentacao.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor legível em EUR.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Página de gestão de contas bancárias e caixa.
 *
 * Controla estados de lista, erro e loading. A validação final fica no backend para impedir que uma
 * alteração manual no HTML crie contas inválidas.
 *
 * @returns {JSX.Element} Interface de tesouraria.
 */
export function TreasuryAccountsPage() {
    const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function load() {
        setAccounts(await listTreasuryAccounts());
    }

    useEffect(() => { void load().catch((err) => setError(err instanceof Error ? err.message : "Erro inesperado")); }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // O formulario envia euros legiveis; a API recebe cêntimos inteiros.
            await createTreasuryAccount({
                name: String(form.get("name") ?? ""),
                type: String(form.get("type") ?? "BANK") as "BANK" | "CASH",
                iban: String(form.get("iban") ?? ""),
                currency: "EUR",
                initialBalanceCents: Math.round(Number(form.get("initialBalance") ?? 0) * 100),
            });
            await load();
            event.currentTarget.reset();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Contas bancárias e caixa</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Nome da conta" required />
                <select name="type" defaultValue="BANK"><option value="BANK">Banco</option><option value="CASH">Caixa</option></select>
                <input name="iban" placeholder="IBAN se for banco" />
                <input name="initialBalance" type="number" step="0.01" defaultValue="0" />
                <button disabled={loading}>{loading ? "A guardar..." : "Criar conta"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {accounts.length === 0 && !error && <p>Ainda não existem contas de tesouraria.</p>}
            <ul>{accounts.map((account) => <li key={account.id}>{account.name} - {account.type} - {euros(account.snapshots[0]?.balanceCents ?? 0)}</li>)}</ul>
        </main>
    );
}