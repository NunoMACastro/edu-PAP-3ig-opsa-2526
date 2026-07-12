/**
 * @file Visão geral autenticada da empresa ativa, sem dados demonstrativos hardcoded.
 */

import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Permission } from "../auth/permissions";
import { useDashboard } from "../dashboard/DashboardContext";
import { formatEuroFromCents, formatPortugueseDate } from "../lib/formatters";
import { ModuleBadge, PageFrame, StatusMessage } from "../ui/opsaUi";

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <article className="dashboardMetric">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

export function DashboardPage() {
  const auth = useAuth();
  const { summary, loading, error, refresh } = useDashboard();

  return (
    <PageFrame
      eyebrow="Visão geral"
      title="Dashboard"
      description="Pendências e alertas operacionais da empresa ativa."
      actions={<button type="button" disabled={loading} onClick={() => void refresh()}>Atualizar</button>}
    >
      {loading && !summary ? (
        <StatusMessage tone="neutral" title="A carregar resumo">
          A consultar os dados autorizados da empresa ativa.
        </StatusMessage>
      ) : null}
      {error ? (
        <StatusMessage tone="danger" title="Resumo indisponível">
          <p>Não foi possível apresentar o dashboard. Os restantes módulos continuam disponíveis.</p>
          <button type="button" onClick={() => void refresh()}>Tentar novamente</button>
        </StatusMessage>
      ) : null}
      {summary ? (
        <>
          <section className="dashboardContext" aria-label="Contexto do dashboard">
            <div>
              <span>Empresa</span>
              <strong>{summary.company.name}</strong>
            </div>
            <div>
              <span>Data de referência</span>
              <strong>{formatPortugueseDate(summary.asOf)}</strong>
            </div>
            <div>
              <span>Período fiscal</span>
              <strong>{summary.activeFiscalPeriod?.name ?? "Sem período aberto"}</strong>
            </div>
            <ModuleBadge label="Dados reais" tone="success" />
          </section>
          <section className="dashboardGrid" aria-label="Indicadores operacionais">
            <MetricCard label="Vendas submetidas" value={summary.sales.submitted} detail={`${summary.sales.approved} aprovadas por emitir`} />
            <MetricCard label="Compras aprovadas" value={summary.purchases.approved} detail={`${summary.purchases.draft} em rascunho`} />
            <MetricCard label="Recebíveis vencidos" value={formatEuroFromCents(summary.receivables.overdueCents)} detail={`${summary.receivables.overdueCount} títulos vencidos`} />
            <MetricCard label="Alertas de stock" value={summary.stockAlerts.total} detail={`${summary.stockAlerts.lowStock} abaixo do mínimo`} />
            <MetricCard label="Notificações por ler" value={summary.notifications.unread} detail="Associadas à tua conta" />
          </section>
        </>
      ) : null}
      <section className="dashboardShortcuts" aria-labelledby="dashboard-shortcuts-title">
        <h3 id="dashboard-shortcuts-title">Atalhos</h3>
        <div>
          {auth.hasPermission(Permission.SALES_READ) ? <Link to="/sales/documents">Documentos de venda</Link> : null}
          {auth.hasPermission(Permission.PURCHASES_READ) ? <Link to="/purchases/documents">Documentos de compra</Link> : null}
          {auth.hasPermission(Permission.INVENTORY_READ) ? <Link to="/inventory/alerts">Alertas de stock</Link> : null}
          {auth.hasPermission(Permission.NOTIFICATIONS_READ) ? <Link to="/operations/notifications">Notificações</Link> : null}
          {auth.hasPermission(Permission.EXECUTIVE_KPIS_READ) ? <Link to="/reports/executive-kpis">KPIs executivos</Link> : null}
        </div>
      </section>
    </PageFrame>
  );
}
