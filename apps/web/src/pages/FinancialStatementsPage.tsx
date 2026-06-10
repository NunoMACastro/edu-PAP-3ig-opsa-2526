// apps/web/src/pages/FinancialStatementsPage.tsx
import { FormEvent, useState } from "react";
import { fetchBalanceSheet, fetchIncomeStatement } from "../lib/financialStatementsApi";
import type { BalanceSheet, IncomeStatement, StatementSection } from "../lib/financialStatementsApi";

function StatementSections({ sections }: { sections: StatementSection[] }) {
  return (
    <ul>
      {sections.map((section) => (
        <li key={section.key}>
          <strong>{section.key}</strong>: {section.totalCents}
          <ul>
            {section.accounts.map((account) => (
              <li key={account.accountId}>
                {account.code} {account.name}: {account.balanceCents}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function FinancialStatementsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const [incomeResult, balanceResult] = await Promise.all([
        fetchIncomeStatement({ from, to }),
        fetchBalanceSheet({ from, to }),
      ]);
      setIncomeStatement(incomeResult.statement);
      setBalanceSheet(balanceResult.statement);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar demonstrações financeiras.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Demonstrações financeiras</h1>

      <form onSubmit={onSubmit}>
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "A carregar..." : "Consultar"}</button>
      </form>

      {error ? <p role="alert">{error}</p> : null}
      {loading ? <p>A carregar demonstrações financeiras...</p> : null}

      {incomeStatement ? (
        <>
          <h2>Demonstração de resultados</h2>
          <StatementSections sections={incomeStatement.sections} />
          <p>Resultado líquido: {incomeStatement.netIncomeCents}</p>
          <p>Origem: {incomeStatement.source}</p>
        </>
      ) : null}

      {balanceSheet ? (
        <>
          <h2>Balanço</h2>
          <StatementSections sections={balanceSheet.sections} />
          <p>Verificação: {balanceSheet.checkCents}</p>
          {balanceSheet.checkCents !== 0 ? <p role="alert">O balanço não está equilibrado.</p> : null}
          <p>Origem: {balanceSheet.source}</p>
        </>
      ) : null}
    </section>
  );
}