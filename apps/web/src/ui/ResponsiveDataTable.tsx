/**
 * @file Tabela responsiva da MF5 para listagens transversais da OPSA.
 */

import type { ReactNode } from "react";
import { formatDisplayValue } from "../lib/formatters";

export type TableCellValue = string | number | boolean | null | undefined;
export type TableRow = Record<string, TableCellValue>;

export interface ResourceColumn<Row extends TableRow = TableRow> {
  key: keyof Row & string;
  label: string;
  priority: "primary" | "secondary" | "desktop";
  format?: (value: TableCellValue, row: Row) => ReactNode;
}

export interface ResponsiveDataTableProps {
  rows: TableRow[];
  columns: ResourceColumn[];
  caption: string;
  renderMobileTitle: (row: TableRow, index: number) => ReactNode;
  emptyState?: ReactNode;
  renderRowActions?: (row: TableRow) => ReactNode;
}

/**
 * Converte valores simples para texto PT-PT seguro e consistente na UI.
 *
 * @param column - Nome da coluna usada para escolher a formatação correta.
 * @param value - Valor simples recebido depois da normalizacao feita em App.tsx.
 * @returns Texto pronto a apresentar em tabela ou cartao.
 */
function formatCell(column: ResourceColumn, row: TableRow) {
  // A tabela responsiva usa o mesmo formatador das MF1/MF2 para evitar drift visual.
  return column.format
    ? column.format(row[column.key], row)
    : formatDisplayValue(column.key, row[column.key]);
}

/**
 * Apresenta uma colecao como tabela desktop e como cartoes mobile.
 *
 * @param props - Linhas normalizadas, legenda acessivel e funcao para titulo mobile.
 * @returns Estrutura React com a mesma fonte de dados para os dois formatos.
 */
export function ResponsiveDataTable({
  rows,
  columns,
  caption,
  renderMobileTitle,
  emptyState,
  renderRowActions,
}: ResponsiveDataTableProps) {
  if (rows.length === 0) {
    return <>{emptyState ?? <p className="empty">Ainda não existem registos.</p>}</>;
  }
  const mobileColumns = columns
    .filter((column) => column.priority !== "desktop")
    .slice(0, 5);

  // A tabela e os cartoes partilham rows e columns para manter a mesma fonte de dados.
  return (
    <>
      <div className="tableWrap responsiveTable" role="region" aria-label={caption}>
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col">
                  {column.label}
                </th>
              ))}
              {renderRowActions ? <th scope="col">Ações</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)}>
                {columns.map((column) => (
                  <td key={column.key} data-label={column.label}>
                    {formatCell(column, row)}
                  </td>
                ))}
                {renderRowActions ? <td>{renderRowActions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobileList" aria-label={`${caption} em cartoes`}>
        {rows.map((row, index) => (
          <article className="mobileList__card" key={String(row.id ?? index)}>
            <h3>{renderMobileTitle(row, index)}</h3>
            {/* As colunas sao as mesmas da tabela para nao perder dados no mobile. */}
            {mobileColumns.map((column) => (
              <p key={column.key}>
                <span>{column.label}</span>
                <strong>{formatCell(column, row)}</strong>
              </p>
            ))}
            {renderRowActions ? <div className="mobileList__actions">{renderRowActions(row)}</div> : null}
          </article>
        ))}
      </div>
    </>
  );
}
