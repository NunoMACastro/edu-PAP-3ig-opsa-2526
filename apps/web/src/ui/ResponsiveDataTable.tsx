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
}

/**
 * Converte valores simples para texto seguro e consistente na UI.
 *
 * @param value - Valor simples recebido depois da normalizacao feita em App.tsx.
 * @returns Texto pronto a apresentar em tabela ou cartao.
 */
function formatCell(value: TableCellValue) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "sim" : "nao";
  return String(value);
}

/**
 * Apresenta uma colecao como tabela desktop e como cartoes mobile.
 *
 * @param props - Linhas normalizadas, legenda acessivel e funcao para titulo mobile.
 * @returns Estrutura React com a mesma fonte de dados para os dois formatos.
 */
export function ResponsiveDataTable({
  rows,
  caption,
  renderMobileTitle,
}: ResponsiveDataTableProps) {
  if (rows.length === 0) {
    return <p className="empty">Sem registos para apresentar.</p>;
  }

  // Reune colunas de todas as linhas para cobrir campos opcionais devolvidos pela API.
  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );

  // A tabela e os cartoes partilham rows e columns para manter a mesma fonte de dados.
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
            {columns.map((column) => (
              <p key={column}>
                <span>{column}</span>
                <strong>{formatCell(row[column])}</strong>
              </p>
            ))}
          </article>
        ))}
      </div>
    </>
  );
}
