/**
 * @file Tabela responsiva da MF5 para listagens transversais da OPSA.
 */

import type { ReactNode } from "react";

export type TableCellValue = string | number | boolean | null | undefined;
export type TableRow = Record<string, TableCellValue>;

export interface ResponsiveDataTableProps {
  rows: TableRow[];
  caption: string;
  renderMobileTitle: (row: TableRow, index: number) => ReactNode;
  actions?: (row: TableRow, index: number) => ReactNode;
}

/**
 * Converte valores simples para texto seguro e consistente na UI.
 *
 * @param value - Valor simples recebido depois da normalização feita em App.tsx.
 * @returns Texto pronto a apresentar em tabela ou cartão.
 */
function formatCell(value: TableCellValue) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "sim" : "não";
  return String(value);
}

/**
 * Apresenta uma coleção como tabela desktop e como cartões mobile.
 *
 * @param props - Linhas normalizadas, legenda acessível e função para título mobile.
 * @returns Estrutura React com a mesma fonte de dados para os dois formatos.
 */
export function ResponsiveDataTable({ rows, caption, renderMobileTitle, actions }: ResponsiveDataTableProps) {
  if (rows.length === 0) {
    return <p className="empty">Sem registos para apresentar.</p>;
  }

  // Reúne colunas de todas as linhas para cobrir campos opcionais devolvidos pela API.
  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );

  // A tabela e os cartões partilham rows e columns para manter a mesma fonte de dados.
  return (
    <>
      <div className="tableWrap responsiveTable" role="region" aria-label={caption}>
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
              {actions ? <th scope="col">Ações</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)}>
                {columns.map((column) => (
                  <td key={column} data-label={column}>
                    {formatCell(row[column])}
                  </td>
                ))}
                {actions ? <td>{actions(row, index)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobileList" aria-label={`${caption} em cartões`}>
        {rows.map((row, index) => (
          <article className="mobileList__card" key={String(row.id ?? index)}>
            <h3>{renderMobileTitle(row, index)}</h3>
            {/* As colunas são as mesmas da tabela para não perder dados no mobile. */}
            {columns.map((column) => (
              <p key={column}>
                <span>{column}</span>
                <strong>{formatCell(row[column])}</strong>
              </p>
            ))}
            {actions ? <div className="mobileList__actions">{actions(row, index)}</div> : null}
          </article>
        ))}
      </div>
    </>
  );
}