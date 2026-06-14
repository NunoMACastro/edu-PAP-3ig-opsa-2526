import { validateStatementImportPayload } from "./apps/api/src/modules/treasury/statementImportValidators.js";

const result = validateStatementImportPayload({
  treasuryAccountId: "treasury-1",
  fileName: "extrato.csv",
  format: "CSV",
  content: "2026-01-02;Pagamento cliente;FT 1;123.45",
});

console.log(result);

if (result.rows.length !== 1) {
  throw new Error("Era esperada 1 linha.");
}

if (result.rows[0].amountCents !== 12345) {
  throw new Error("Era esperado amountCents = 12345.");
}

console.log("Teste CSV passou: 123.45 EUR convertido para 12345 cêntimos.");

try {
  validateStatementImportPayload({
    treasuryAccountId: "treasury-1",
    fileName: "extrato.pdf",
    format: "PDF",
    content: "conteudo",
  });

  throw new Error("Era esperado INVALID_STATEMENT_FORMAT.");
} catch (error) {
  console.log({
    status: error.status,
    code: error.code,
    message: error.message,
  });

  if (error.status !== 400 || error.code !== "INVALID_STATEMENT_FORMAT") {
    throw error;
  }

  console.log("Teste negativo passou: PDF devolve INVALID_STATEMENT_FORMAT.");
}