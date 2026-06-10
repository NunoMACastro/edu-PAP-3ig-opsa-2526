// apps/web/src/pages/AccountingReportsPage.tsx
import { FormEvent, useState } from "react";
import { fetchLedger, fetchTrialBalance } from "../lib/accountingReportsApi";
import type { LedgerRow, TrialBalanceRow } from "../lib/accountingReportsApi";

export function AccountingReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [accountId, setAccountId] = useState("");
  const [trialBalanceRows, setTrialBalanceRows] = useState<TrialBalanceRow[]>([]);
  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const [trialBalance, ledger] = await Promise.all([
        fetchTrialBalance({ from, to }),
        accountId ? fetchLedger({ from, to, accountId }) : Promise.resolve({ report: { rows: [] } }),
      ]);
      setTrialBalanceRows(trialBalance.report.rows);
      setLedgerRows(ledger.report.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar relatórios.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Balancete e razão</h1>

      <form onSubmit={onSubmit}>
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <input value={accountId} onChange={(event) => setAccountId(event.target.value)} placeholder="Conta para razão" />
        <button type="submit" disabled={loading}>{loading ? "A carregar..." : "Consultar"}</button>
        <a href={`/api/accounting/reports/trial-balance.xlsx?from=${from}&to=${to}`}>Excel</a>
        <a href={`/api/accounting/reports/ledger.pdf?from=${from}&to=${to}&accountId=${accountId}`}>PDF</a>
      </form>

      {error ? <p role="alert">{error}</p> : null}
      {loading ? <p>A carregar relatórios...</p> : null}

      <h2>Balancete</h2>
      {trialBalanceRows.length === 0 ? <p>Sem movimentos no período.</p> : null}
      <ul>
        {trialBalanceRows.map((row) => (
          <li key={row.accountId}>
            {row.code} {row.name}: D {row.debitCents} / C {row.creditCents}
          </li>
        ))}
      </ul>

      <h2>Razão</h2>
      {ledgerRows.length === 0 ? <p>Sem linhas para a conta selecionada.</p> : null}
      <ul>
        {ledgerRows.map((row) => (
          <li key={row.lineId}>
            {row.date}: D {row.debitCents} / C {row.creditCents} / Saldo {row.balanceCents}
          </li>
        ))}
      </ul>
    </section>
  );
}