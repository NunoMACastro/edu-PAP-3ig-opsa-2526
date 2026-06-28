/**
 * @file Testes contratuais de importações CSV/Excel da MF7.
 */

import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import {
  buildImportLogInput,
  MAX_IMPORT_ROWS,
  parseImportRows,
} from "../../src/modules/imports/importFileParser.js";
import { validateBusinessImportPayload } from "../../src/modules/imports/businessImportValidators.js";

/**
 * Cria um workbook Excel em memória para testar parser `.xlsx`.
 *
 * @param {Array<Array<string | number>>} rows - Linhas a escrever na folha.
 * @returns {Promise<string>} Conteúdo Excel em base64.
 */
async function buildWorkbookBase64(rows) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("dados");

  for (const row of rows) {
    worksheet.addRow(row);
  }

  // O teste usa buffer em memória para não depender de ficheiros temporários.
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer).toString("base64");
}

test("parseImportRows lê Excel real e devolve linhas por cabeçalho", async () => {
  const contentBase64 = await buildWorkbookBase64([
    ["name", "nif"],
    ["Cliente A", "501234567"],
    ["Cliente B", "501234568"],
  ]);

  const result = await parseImportRows({ fileName: "clientes.xlsx", contentBase64 });

  assert.equal(result.sourceFormat, "XLSX");
  assert.deepEqual(result.rows, [
    { name: "Cliente A", nif: "501234567" },
    { name: "Cliente B", nif: "501234568" },
  ]);
});

test("validateBusinessImportPayload rejeita formato não suportado", async () => {
  await assert.rejects(
    validateBusinessImportPayload({
      type: "CUSTOMERS",
      fileName: "clientes.txt",
      content: "name;nif\nCliente A;501234567",
    }),
    /Formato de importação inválido/,
  );
});

test("validateBusinessImportPayload rejeita CSV sem linhas úteis", async () => {
  await assert.rejects(
    validateBusinessImportPayload({
      type: "CUSTOMERS",
      fileName: "clientes.csv",
      content: "name;nif",
    }),
    /CSV deve ter cabeçalho/,
  );
});

test("parseImportRows rejeita importações acima do limite operacional", async () => {
  const lines = ["name;nif"];
  for (let index = 0; index <= MAX_IMPORT_ROWS; index += 1) {
    lines.push(`Cliente ${index};501234567`);
  }

  await assert.rejects(
    parseImportRows({ fileName: "clientes.csv", content: lines.join("\n") }),
    /excede o limite/,
  );
});

test("buildImportLogInput respeita o contrato de recordIntegrationLog", () => {
  const logInput = buildImportLogInput({
    context: { companyId: "comp-1", userId: "user-1" },
    data: { type: "CUSTOMERS", sourceFormat: "XLSX" },
    run: { id: "run-1", fileName: "clientes.xlsx", totalRows: 3 },
    acceptedRows: 2,
    rejectedRows: 1,
  });

  assert.deepEqual(logInput, {
    companyId: "comp-1",
    userId: "user-1",
    integrationType: "CUSTOMERS",
    operation: "IMPORT",
    status: "PARTIAL",
    sourceId: "run-1",
    fileName: "clientes.xlsx",
    totalRows: 3,
    successRows: 2,
    errorRows: 1,
    message: "Importacao XLSX de CUSTOMERS concluida com validacao por linha.",
  });
  assert.equal(Object.hasOwn(logInput, "details"), false);
});