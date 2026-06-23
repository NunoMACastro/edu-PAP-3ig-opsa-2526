/**
 * @file Smoke textual da MF5 para confirmar o contrato responsivo do BK-MF5-02.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const apiClient = readFileSync(new URL("../src/lib/apiClient.ts", import.meta.url), "utf8");
const component = readFileSync(
  new URL("../src/ui/ResponsiveDataTable.tsx", import.meta.url),
  "utf8",
);
const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

/**
 * Confirma que um contrato textual existe num ficheiro fonte.
 *
 * @param source - Conteudo do ficheiro analisado.
 * @param expected - Expressao regular que representa o contrato esperado.
 * @param context - Descricao curta usada na mensagem de erro.
 * @returns Nao devolve valor; lanca erro se o contrato nao existir.
 */
function assertContract(source, expected, context) {
  assert.match(source, expected, `MF5 responsivo em falta: ${context}`);
}

assertContract(component, /export function ResponsiveDataTable/, "componente exportado");
assertContract(component, /className="tableWrap responsiveTable"/, "tabela desktop");
assertContract(component, /className="mobileList"/, "lista mobile");
assertContract(component, /columns\.map/, "fonte unica de colunas");
assertContract(component, /data-label=\{column\}/, "rotulo de celula preservado");

assertContract(app, /import \{ ResponsiveDataTable \}/, "import em App.tsx");
assertContract(app, /function toSafeCell\(value: unknown\): TableCellValue/, "normalizacao segura");
assertContract(app, /function DataTable\(\{ rows \}: \{ rows: ApiObject\[\] \}\)/, "assinatura de DataTable");
assertContract(app, /<ResponsiveDataTable/, "delegacao no componente responsivo");
assertContract(app, /renderMobileTitle/, "titulo mobile previsivel");

assertContract(styles, /\.responsiveTable caption/, "caption acessivel");
assertContract(styles, /@media \(max-width: 640px\)/, "breakpoint mobile");
assertContract(styles, /\.responsiveTable\s*\{\s*display: none;/s, "tabela escondida em mobile");
assertContract(styles, /\.mobileList\s*\{\s*display: grid;/s, "cartoes visiveis em mobile");
assertContract(styles, /overflow-wrap: anywhere;/, "valores longos protegidos");

assertContract(apiClient, /credentials:\s*"include"/, "cookie HttpOnly preservado no cliente API");

console.info("MF5 responsive table smoke OK");
