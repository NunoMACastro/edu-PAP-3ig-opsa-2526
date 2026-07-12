/**
 * @file Página de revisão humana das sugestões de reconciliação bancária.
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Permission } from "../auth/permissions";
import { formatDisplayValue } from "../lib/formatters";
import { EMPTY_PAGE_INFO, type CursorPageInfo } from "../lib/cursorPagination";
import {
  getStatementImport,
  listStatementImports,
  refreshReconciliationSuggestions,
  type StatementImportDetail,
  type StatementImportSummary,
} from "../lib/treasuryReconciliationApi";
import { ActionFeedbackMessage, ModuleBadge, PageFrame, StatusMessage } from "../ui/opsaUi";
import { CursorPaginationButton } from "../ui/CursorPaginationButton";
import { useActionFeedback } from "../ui/useActionFeedback";

/**
 * Recupera importações e permite recalcular sugestões sem confirmar movimentos.
 *
 * @returns Página React de reconciliação apenas sugestiva.
 */
export function ReconciliationPage() {
  const { hasPermission } = useAuth();
  const [imports, setImports] = useState<StatementImportSummary[]>([]);
  const [pageInfo, setPageInfo] = useState<CursorPageInfo>(EMPTY_PAGE_INFO);
  const [selected, setSelected] = useState<StatementImportDetail | null>(null);
  const loadAction = useActionFeedback();
  const suggestionAction = useActionFeedback();
  const runLoadAction = loadAction.run;
  const canRecalculate = hasPermission(Permission.TREASURY_WRITE);

  const loadImports = useCallback(async () => {
    try {
      await runLoadAction(
        async () => {
          const page = await listStatementImports({ limit: 50 });
          setImports(page.items);
          setPageInfo(page.pageInfo);
          return page;
        },
        {
          startMessage: "A carregar importações bancárias...",
          successMessage: "Importações bancárias atualizadas.",
          errorMessage: "Não foi possível carregar as importações bancárias.",
        },
      );
    } catch {
      // O hook mantém o erro visível e não inventa dados de reconciliação.
    }
  }, [runLoadAction]);

  useEffect(() => {
    void loadImports();
  }, [loadImports]);

  async function loadMoreImports() {
    const cursor = pageInfo.nextCursor;
    if (!pageInfo.hasNextPage || !cursor || loadAction.busy) return;
    try {
      await loadAction.run(
        async () => {
          const page = await listStatementImports({ cursor, limit: 50 });
          setImports((current) => [...current, ...page.items]);
          setPageInfo(page.pageInfo);
          return page;
        },
        {
          startMessage: "A carregar mais importações bancárias...",
          successMessage: "Página seguinte carregada.",
          errorMessage: "Não foi possível carregar mais importações bancárias.",
        },
      );
    } catch {
      // As páginas já carregadas permanecem disponíveis para revisão.
    }
  }

  async function openImport(id: string) {
    try {
      await loadAction.run(
        async () => {
          const response = await getStatementImport(id);
          setSelected(response.statementImport);
        },
        {
          startMessage: "A carregar linhas e sugestões...",
          successMessage: "Detalhe da importação carregado.",
          errorMessage: "Não foi possível carregar esta importação.",
        },
      );
    } catch {
      // O utilizador pode escolher outra importação ou repetir a leitura.
    }
  }

  async function recalculate(statementLineId: string) {
    if (!selected || !canRecalculate) return;
    try {
      await suggestionAction.run(
        async () => {
          const result = await refreshReconciliationSuggestions(statementLineId);
          setSelected((current) =>
            current
              ? {
                  ...current,
                  lines: current.lines.map((line) =>
                    line.id === statementLineId
                      ? { ...line, suggestions: result.suggestions }
                      : line,
                  ),
                }
              : current,
          );
          return result;
        },
        {
          startMessage: "A recalcular sugestões...",
          successMessage: "Sugestões recalculadas sem alterar movimentos.",
          errorMessage: "Não foi possível recalcular as sugestões.",
        },
      );
    } catch {
      // O estado anterior permanece disponível para revisão humana.
    }
  }

  return (
    <PageFrame
      title="Reconciliação bancária"
      description="Revê correspondências sugeridas. Nenhuma sugestão confirma ou altera movimentos contabilísticos."
      actions={
        <button type="button" onClick={() => void loadImports()} disabled={loadAction.busy}>
          Atualizar importações
        </button>
      }
    >
      <ActionFeedbackMessage feedback={loadAction.feedback} />
      <ActionFeedbackMessage feedback={suggestionAction.feedback} />

      <section aria-labelledby="statement-imports-heading">
        <h3 id="statement-imports-heading">Importações disponíveis</h3>
        {imports.length === 0 ? (
          <p className="empty">Ainda não existem importações bancárias para rever.</p>
        ) : (
          <div className="operationGrid">
            {imports.map((statementImport) => (
              <article className="operation" key={statementImport.id}>
                <h3>{statementImport.fileName}</h3>
                <p>
                  {statementImport.format} · {statementImport.acceptedLines} aceites ·{" "}
                  {statementImport.rejectedLines} rejeitadas
                </p>
                <button
                  type="button"
                  onClick={() => void openImport(statementImport.id)}
                  disabled={loadAction.busy}
                >
                  Rever sugestões
                </button>
              </article>
            ))}
          </div>
        )}
        <CursorPaginationButton
          hasNextPage={pageInfo.hasNextPage}
          busy={loadAction.busy}
          label="importações bancárias"
          onLoadMore={loadMoreImports}
        />
      </section>

      {selected ? (
        <section aria-labelledby="statement-lines-heading">
          <h3 id="statement-lines-heading">Linhas de {selected.fileName}</h3>
          <div className="operationGrid">
            {selected.lines.map((line) => (
              <article className="operation" key={line.id}>
                <h3>{line.description}</h3>
                <p>
                  {formatDisplayValue("entryDate", line.entryDate)} ·{" "}
                  {formatDisplayValue("amountCents", line.amountCents)}
                </p>
                <p>{line.reference ? `Referência: ${line.reference}` : "Sem referência"}</p>
                {line.suggestions.length === 0 ? (
                  <StatusMessage tone="warning" title="Sem correspondência">
                    Não foi encontrada uma correspondência automática para esta linha.
                  </StatusMessage>
                ) : (
                  <ul className="suggestionList">
                    {line.suggestions.map((suggestion, index) => (
                      <li key={suggestion.id ?? `${line.id}-${index}`}>
                        <ModuleBadge
                          label={`${formatDisplayValue("confidenceBps", suggestion.confidenceBps)} confiança`}
                          tone="neutral"
                        />
                        <strong>
                          {suggestion.targetType === "RECEIPT" ? "Recebimento" : "Pagamento"}
                        </strong>
                        <span>{suggestion.reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {canRecalculate ? (
                  <button
                    type="button"
                    disabled={suggestionAction.busy}
                    onClick={() => void recalculate(line.id)}
                  >
                    Recalcular sugestões
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </PageFrame>
  );
}
