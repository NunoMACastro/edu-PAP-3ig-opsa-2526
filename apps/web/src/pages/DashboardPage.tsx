/**
 * @file Visão geral autenticada da empresa ativa, sem dados demonstrativos hardcoded.
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Permission } from "../auth/permissions";
import { useDashboard } from "../dashboard/DashboardContext";
import {
  formatDocumentTypeLabel,
  formatEuroFromCents,
  formatPortugueseDate,
  formatPortugueseDateTime,
  formatStatusLabel,
} from "../lib/formatters";
import type { RecentTransaction } from "../lib/apiClient";
import { ModuleBadge, PageFrame, StatusMessage } from "../ui/opsaUi";
import { useAiTransactionContext } from "../ai/AiPageContext";

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <article className="dashboardMetric">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function stockBadge(transaction: RecentTransaction) {
  if (!transaction.postedAt) return <ModuleBadge label="Stock pendente" tone="neutral" />;
  if (transaction.productLineCount === 0) {
    return <ModuleBadge label="Sem movimento de stock (serviço)" tone="neutral" />;
  }
  if (transaction.stockMovementCount > 0) {
    return <ModuleBadge label="Stock atualizado" tone="success" />;
  }
  return <ModuleBadge label="Verificar stock: movimento em falta" tone="warning" />;
}

function RecentOperation({
  transaction,
  canUseAi,
  canViewAccounting,
  canViewInventory,
  canViewAudit,
  onAnalyze,
}: {
  transaction: RecentTransaction;
  canUseAi: boolean;
  canViewAccounting: boolean;
  canViewInventory: boolean;
  canViewAudit: boolean;
  onAnalyze: (transaction: RecentTransaction) => void;
}) {
  const documentPath = transaction.documentType === "SALE"
    ? "/sales/documents"
    : "/purchases/documents";
  const postingPath = transaction.documentType === "SALE"
    ? "/accounting/sale-postings"
    : "/accounting/purchase-postings";
  return (
    <article className="operation recentOperation">
      <header>
        <div>
          <span>{formatDocumentTypeLabel(transaction.documentType)}</span>
          <h3>{transaction.number}</h3>
        </div>
        {stockBadge(transaction)}
      </header>
      <p><strong>{transaction.counterpartyName}</strong></p>
      <dl>
        <div><dt>Data</dt><dd>{formatPortugueseDate(transaction.issuedAt)}</dd></div>
        <div><dt>Total</dt><dd>{formatEuroFromCents(transaction.totalCents)}</dd></div>
        <div><dt>Estado</dt><dd>{formatStatusLabel(transaction.status)}</dd></div>
        <div>
          <dt>Contabilidade</dt>
          <dd>{transaction.postedAt ? `Contabilizada em ${formatPortugueseDateTime(transaction.postedAt)}` : "Por contabilizar"}</dd>
        </div>
      </dl>
      <div className="inlineActions">
        <Link to={documentPath}>Ver documento</Link>
        {canViewAccounting ? <Link to={postingPath}>Ver lançamento</Link> : null}
        {canViewInventory ? <Link to="/inventory/stock">Ver stock</Link> : null}
        {canViewAudit ? <Link to="/audit/logs">Ver auditoria</Link> : null}
        {canUseAi ? <button type="button" onClick={() => onAnalyze(transaction)}>Analisar com IA</button> : null}
      </div>
    </article>
  );
}

export function DashboardPage() {
  const auth = useAuth();
  const { summary, loading, error, refresh } = useDashboard();
  const { setTransaction, clearTransaction } = useAiTransactionContext();

  useEffect(() => clearTransaction, [clearTransaction]);

  function analyze(transaction: RecentTransaction) {
    setTransaction({
      documentType: transaction.documentType,
      documentId: transaction.documentId,
      label: transaction.number,
    });
    globalThis.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(".aiLauncher")?.click();
    });
  }

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
          <section className="dashboardRecent" aria-labelledby="dashboard-recent-title">
            <div className="sectionHeader">
              <div>
                <h2 id="dashboard-recent-title">Operações recentes</h2>
                <p>Vendas e compras reais da empresa ativa, ordenadas pela data do documento.</p>
              </div>
            </div>
            {(summary.recentTransactions ?? []).length > 0 ? (
              <div className="operationGrid dashboardRecentGrid">
                {(summary.recentTransactions ?? []).map((transaction) => (
                  <RecentOperation
                    key={`${transaction.documentType}-${transaction.documentId}`}
                    transaction={transaction}
                    canUseAi={
                      auth.hasPermission(Permission.AI_CHAT_USE) &&
                      auth.hasPermission(
                        transaction.documentType === "SALE"
                          ? Permission.SALES_READ
                          : Permission.PURCHASES_READ,
                      )
                    }
                    canViewAccounting={auth.hasPermission(Permission.ACCOUNTING_READ)}
                    canViewInventory={auth.hasPermission(Permission.INVENTORY_READ)}
                    canViewAudit={auth.hasPermission(Permission.AUDIT_READ)}
                    onAnalyze={analyze}
                  />
                ))}
              </div>
            ) : (
              <StatusMessage tone="neutral" title="Preparar a primeira operação">
                <ol className="demoChecklist">
                  <li><Link to="/sales/customers">Adicionar um cliente</Link></li>
                  <li><Link to="/purchases/suppliers">Adicionar um fornecedor</Link></li>
                  <li><Link to="/inventory/stock">Confirmar produto, armazém e stock inicial</Link></li>
                  <li><Link to="/purchases/documents">Criar a primeira compra</Link></li>
                </ol>
              </StatusMessage>
            )}
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
