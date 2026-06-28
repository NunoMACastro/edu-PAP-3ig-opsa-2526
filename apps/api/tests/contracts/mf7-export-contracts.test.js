/**
 * @file Testes de contrato para exportações RNF22.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildContentDisposition,
  buildCsvBuffer,
  buildExportFile,
  normalizeExportFormat,
} from "../../src/modules/exports/exportFormatService.js";

const columns = [
  { key: "accountCode", label: "Conta" },
  { key: "accountName", label: "Descrição" },
  { key: "balance", label: "Saldo" },
];

test("gera CSV com cabeçalho, separador europeu e fórmula neutralizada", () => {
  const csv = buildCsvBuffer({
    columns,
    rows: [
      {
        accountCode: "12",
        accountName: "=SOMA(A1:A2)",
        balance: "150.00",
      },
    ],
  }).toString("utf8");

  // A fórmula fica como texto para a folha de cálculo não executar conteúdo inesperado.
  assert.match(csv, /Conta;Descrição;Saldo/);
  assert.match(csv, /'=SOMA\(A1:A2\)/);
});

test("gera metadados corretos para exportação CSV", async () => {
  const file = await buildExportFile({
    format: "csv",
    baseName: "Balancete OPSA",
    title: "Balancete OPSA",
    columns,
    rows: [
      {
        accountCode: "12",
        accountName: "Depósitos à ordem",
        balance: "150.00",
      },
    ],
  });

  assert.equal(file.contentType, "text/csv; charset=utf-8");
  assert.equal(file.fileName, "balancete-opsa.csv");
  assert.ok(Buffer.isBuffer(file.body));
  assert.ok(file.body.length > 0);
});

test("gera metadados corretos para exportação XLSX", async () => {
  const file = await buildExportFile({
    format: "xlsx",
    baseName: "Balancete OPSA",
    title: "Balancete OPSA",
    columns,
    rows: [
      {
        accountCode: "12",
        accountName: "Depósitos à ordem",
        balance: "150.00",
      },
    ],
  });

  assert.equal(
    file.contentType,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  assert.equal(file.fileName, "balancete-opsa.xlsx");
  assert.ok(Buffer.isBuffer(file.body));
  assert.ok(file.body.length > 0);
});

test("rejeita formatos fora do contrato RNF22", () => {
  assert.throws(
    () => normalizeExportFormat("html"),
    (error) => error.status === 400 && error.code === "INVALID_EXPORT_FORMAT",
  );
});

test("gera Content-Disposition de anexo", () => {
  assert.equal(
    buildContentDisposition("balancete-opsa.csv"),
    'attachment; filename="balancete-opsa.csv"',
  );
});