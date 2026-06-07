import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ApiError, JsonBody } from "../lib/apiClient";
import { accountingApi } from "../lib/accountingApi";
import {
  ApiObject,
  asObject,
  formatValue,
  optionalText,
  pickArray,
  requiredText,
  toPositiveInteger,
} from "../lib/mf1FormUtils";
import { paymentApi } from "../lib/paymentApi";
import { purchaseApprovalApi } from "../lib/purchaseApprovalApi";
import { purchasesApi } from "../lib/purchasesApi";
import { receiptApi } from "../lib/receiptApi";
import { salesApi } from "../lib/salesApi";
import { salesOpenItemsApi } from "../lib/salesOpenItemsApi";
import { vatRateApi } from "../lib/vatRateApi";

type Method = "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER";
type SaleDocumentKind = "INVOICE" | "INVOICE_RECEIPT" | "CREDIT_NOTE";
type PurchaseDocumentKind = "SUPPLIER_INVOICE" | "SUPPLIER_CREDIT_NOTE";

interface ListState {
  rows: ApiObject[];
  busy: boolean;
  error: string | null;
}

function formatError(error: unknown): string {
  if (error instanceof ApiError) return `${error.code}: ${error.message}`;
  if (error instanceof Error) return error.message;
  return "Erro inesperado";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function PageFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="sectionHeader">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DataTable({
  rows,
  actions,
}: {
  rows: ApiObject[];
  actions?: (row: ApiObject) => ReactNode;
}) {
  if (rows.length === 0) {
    return <p className="empty">Sem registos para apresentar.</p>;
  }

  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );

  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
            {actions ? <th>Acoes</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => (
                <td key={column}>{formatValue(row[column])}</td>
              ))}
              {actions ? <td>{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentSelect({
  name,
  label,
  documents,
}: {
  name: string;
  label: string;
  documents: ApiObject[];
}) {
  return (
    <label>
      <span>{label}</span>
      <select name={name} required>
        <option value="">Selecionar documento</option>
        {documents.map((document) => (
          <option key={String(document.id)} value={String(document.id)}>
            {String(document.number ?? document.supplierNumber ?? document.id)}
          </option>
        ))}
      </select>
    </label>
  );
}

function MethodSelect() {
  return (
    <label>
      <span>Metodo</span>
      <select name="method" required defaultValue="BANK_TRANSFER">
        <option value="CASH">Numerario</option>
        <option value="BANK_TRANSFER">Transferencia</option>
        <option value="CARD">Cartao</option>
        <option value="OTHER">Outro</option>
      </select>
    </label>
  );
}

function useApiList(load: () => Promise<ApiObject[]>) {
  const [state, setState] = useState<ListState>({
    rows: [],
    busy: false,
    error: null,
  });

  async function reload() {
    setState((current) => ({ ...current, busy: true, error: null }));
    try {
      setState({ rows: await load(), busy: false, error: null });
    } catch (error) {
      setState({ rows: [], busy: false, error: formatError(error) });
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  return { ...state, reload };
}

function useAction(reload: () => Promise<void>) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await action();
      await reload();
      setMessage(success);
    } catch (caught) {
      setError(formatError(caught));
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, message, run };
}

function Feedback({
  busy,
  error,
  message,
}: {
  busy?: boolean;
  error?: string | null;
  message?: string | null;
}) {
  return (
    <>
      {busy ? <p className="empty">A carregar...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="success">{message}</p> : null}
    </>
  );
}

function parseSaleDocument(form: FormData): JsonBody {
  return {
    kind: requiredText(form.get("kind"), "Tipo") as SaleDocumentKind,
    customerId: requiredText(form.get("customerId"), "Cliente"),
    issuedAt: requiredText(form.get("issuedAt"), "Data"),
    dueDate: optionalText(form.get("dueDate")),
    lines: [
      {
        itemId: requiredText(form.get("itemId"), "Artigo"),
        vatRateId: requiredText(form.get("vatRateId"), "Taxa de IVA"),
        description: optionalText(form.get("description")),
        quantity: toPositiveInteger(form.get("quantity"), "Quantidade"),
        unitPriceCents: toPositiveInteger(form.get("unitPriceCents"), "Preco"),
      },
    ],
  };
}

function parsePurchaseDocument(form: FormData): JsonBody {
  return {
    kind: requiredText(form.get("kind"), "Tipo") as PurchaseDocumentKind,
    supplierId: requiredText(form.get("supplierId"), "Fornecedor"),
    supplierNumber: requiredText(form.get("supplierNumber"), "Numero do fornecedor"),
    issuedAt: requiredText(form.get("issuedAt"), "Data"),
    dueDate: optionalText(form.get("dueDate")),
    lines: [
      {
        itemId: requiredText(form.get("itemId"), "Artigo"),
        vatRateId: requiredText(form.get("vatRateId"), "Taxa de IVA"),
        description: optionalText(form.get("description")),
        quantity: toPositiveInteger(form.get("quantity"), "Quantidade"),
        unitCostCents: toPositiveInteger(form.get("unitCostCents"), "Custo"),
      },
    ],
  };
}

function parseMoneyMovement(form: FormData, dateField: "receivedAt" | "paidAt") {
  return {
    amountCents: toPositiveInteger(form.get("amountCents"), "Valor"),
    [dateField]: requiredText(form.get(dateField), "Data"),
    method: requiredText(form.get("method"), "Metodo") as Method,
    reference: optionalText(form.get("reference")),
    notes: optionalText(form.get("notes")),
  };
}

function DocumentLineFields({ cost }: { cost?: boolean }) {
  return (
    <fieldset className="lineFields">
      <legend>Linha do documento</legend>
      <label>
        <span>Artigo ID</span>
        <input name="itemId" required />
      </label>
      <label>
        <span>Taxa de IVA ID</span>
        <input name="vatRateId" required />
      </label>
      <label>
        <span>Descricao</span>
        <input name="description" />
      </label>
      <label>
        <span>Quantidade</span>
        <input name="quantity" type="number" min="1" required defaultValue="1" />
      </label>
      <label>
        <span>{cost ? "Custo em centimos" : "Preco em centimos"}</span>
        <input
          name={cost ? "unitCostCents" : "unitPriceCents"}
          type="number"
          min="1"
          required
          defaultValue="1000"
        />
      </label>
    </fieldset>
  );
}

export function VatRatesPage() {
  const list = useApiList(async () =>
    pickArray(await vatRateApi.list(), "vatRates"),
  );
  const action = useAction(list.reload);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(
      () =>
        vatRateApi.create({
          code: requiredText(form.get("code"), "Codigo"),
          description: requiredText(form.get("description"), "Descricao"),
          rateBps: toPositiveInteger(form.get("rateBps"), "Taxa"),
          type: requiredText(form.get("type"), "Tipo"),
          exemptionReason: optionalText(form.get("exemptionReason")),
        }),
      "Taxa de IVA criada.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Tabelas de IVA">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <button
            type="button"
            onClick={() =>
              void action.run(
                () =>
                  vatRateApi.setActive(String(row.id), {
                    isActive: row.isActive !== true,
                  }),
                "Estado da taxa atualizado.",
              )
            }
          >
            {row.isActive === true ? "Desativar" : "Ativar"}
          </button>
        )}
      />
      <form className="operation" onSubmit={submit}>
        <h3>Criar taxa de IVA</h3>
        <div className="fields">
          <label>
            <span>Codigo</span>
            <input name="code" required />
          </label>
          <label>
            <span>Descricao</span>
            <input name="description" required />
          </label>
          <label>
            <span>Taxa bps</span>
            <input name="rateBps" type="number" min="0" max="10000" required />
          </label>
          <label>
            <span>Tipo</span>
            <select name="type" required defaultValue="NORMAL">
              <option value="NORMAL">Normal</option>
              <option value="INTERMEDIATE">Intermedia</option>
              <option value="REDUCED">Reduzida</option>
              <option value="EXEMPT">Isenta</option>
              <option value="OTHER">Outra</option>
            </select>
          </label>
          <label>
            <span>Motivo de isencao</span>
            <input name="exemptionReason" />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
      </form>
    </PageFrame>
  );
}

export function SaleDocumentsPage() {
  const list = useApiList(async () =>
    pickArray(await salesApi.listDocuments(), "saleDocuments"),
  );
  const action = useAction(list.reload);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = parseSaleDocument(new FormData(event.currentTarget));
    await action.run(
      () => salesApi.createDocument(payload),
      "Documento de venda criado.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Documentos de venda">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <div className="inlineActions">
            <button type="button" onClick={() => void action.run(() => salesApi.submitDocument(String(row.id)), "Venda submetida.")}>Submeter</button>
            <button type="button" onClick={() => void action.run(() => salesApi.approveDocument(String(row.id)), "Venda aprovada.")}>Aprovar</button>
            <button type="button" onClick={() => void action.run(() => salesApi.issueDocument(String(row.id)), "Venda emitida.")}>Emitir</button>
          </div>
        )}
      />
      <form className="operation" onSubmit={submit}>
        <h3>Criar rascunho de venda</h3>
        <div className="fields">
          <label>
            <span>Tipo</span>
            <select name="kind" required defaultValue="INVOICE">
              <option value="INVOICE">Fatura</option>
              <option value="INVOICE_RECEIPT">Fatura-recibo</option>
              <option value="CREDIT_NOTE">Nota de credito</option>
            </select>
          </label>
          <label>
            <span>Cliente ID</span>
            <input name="customerId" required />
          </label>
          <label>
            <span>Data</span>
            <input name="issuedAt" type="date" required defaultValue={today()} />
          </label>
          <label>
            <span>Vencimento</span>
            <input name="dueDate" type="date" />
          </label>
          <DocumentLineFields />
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
      </form>
    </PageFrame>
  );
}

export function ReceiptsPage() {
  const list = useApiList(async () =>
    pickArray(await salesApi.listDocuments(), "saleDocuments"),
  );
  const action = useAction(list.reload);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(
      () =>
        receiptApi.register(
          requiredText(form.get("id"), "Documento"),
          parseMoneyMovement(form, "receivedAt"),
        ),
      "Recebimento registado.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Recebimentos">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable rows={list.rows} />
      <form className="operation" onSubmit={submit}>
        <h3>Registar recebimento</h3>
        <div className="fields">
          <DocumentSelect name="id" label="Documento de venda" documents={list.rows} />
          <label>
            <span>Valor em centimos</span>
            <input name="amountCents" type="number" min="1" required />
          </label>
          <label>
            <span>Data</span>
            <input name="receivedAt" type="date" required defaultValue={today()} />
          </label>
          <MethodSelect />
          <label>
            <span>Referencia</span>
            <input name="reference" />
          </label>
          <label>
            <span>Notas</span>
            <input name="notes" />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Registar</button>
      </form>
    </PageFrame>
  );
}

export function SalePostingsPage() {
  const list = useApiList(async () =>
    pickArray(await salesApi.listDocuments(), "saleDocuments"),
  );
  const action = useAction(list.reload);

  return (
    <PageFrame title="Lancamentos de vendas">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <button
            type="button"
            onClick={() =>
              void action.run(
                () => accountingApi.postSaleDocument(String(row.id)),
                "Venda contabilizada.",
              )
            }
          >
            Contabilizar
          </button>
        )}
      />
    </PageFrame>
  );
}

export function SalesOpenItemsPage() {
  const [asOfDate, setAsOfDate] = useState(today());
  const [rows, setRows] = useState<ApiObject[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      setRows(pickArray(await salesOpenItemsApi.list(asOfDate), "openItems"));
    } catch (caught) {
      setError(formatError(caught));
      setRows([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <PageFrame title="Titulos em aberto">
      <Feedback busy={busy} error={error} />
      <form
        className="search"
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
      >
        <input
          type="date"
          value={asOfDate}
          onChange={(event) => setAsOfDate(event.target.value)}
        />
        <button type="submit" disabled={busy}>Atualizar</button>
      </form>
      <DataTable rows={rows} />
    </PageFrame>
  );
}

export function SaleApprovalPage() {
  const list = useApiList(async () =>
    pickArray(await salesApi.listDocuments(), "saleDocuments"),
  );
  const action = useAction(list.reload);

  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(
      () =>
        salesApi.rejectDocument(requiredText(form.get("id"), "Documento"), {
          reason: requiredText(form.get("reason"), "Motivo"),
        }),
      "Venda rejeitada.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Aprovacao de vendas">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <div className="inlineActions">
            <button type="button" onClick={() => void action.run(() => salesApi.submitDocument(String(row.id)), "Venda submetida.")}>Submeter</button>
            <button type="button" onClick={() => void action.run(() => salesApi.approveDocument(String(row.id)), "Venda aprovada.")}>Aprovar</button>
            <button type="button" onClick={() => void action.run(() => salesApi.issueDocument(String(row.id)), "Venda emitida.")}>Emitir</button>
          </div>
        )}
      />
      <form className="operation" onSubmit={reject}>
        <h3>Rejeitar venda</h3>
        <div className="fields">
          <DocumentSelect name="id" label="Documento de venda" documents={list.rows} />
          <label>
            <span>Motivo</span>
            <input name="reason" required minLength={3} />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Rejeitar</button>
      </form>
    </PageFrame>
  );
}

export function PurchaseDocumentsPage() {
  const list = useApiList(async () =>
    pickArray(await purchasesApi.listDocuments(), "purchaseDocuments"),
  );
  const action = useAction(list.reload);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = parsePurchaseDocument(new FormData(event.currentTarget));
    await action.run(
      () => purchasesApi.createDocument(payload),
      "Documento de compra criado.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Documentos de compra">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable rows={list.rows} />
      <form className="operation" onSubmit={submit}>
        <h3>Criar rascunho de compra</h3>
        <div className="fields">
          <label>
            <span>Tipo</span>
            <select name="kind" required defaultValue="SUPPLIER_INVOICE">
              <option value="SUPPLIER_INVOICE">Fatura de fornecedor</option>
              <option value="SUPPLIER_CREDIT_NOTE">Nota de credito</option>
            </select>
          </label>
          <label>
            <span>Fornecedor ID</span>
            <input name="supplierId" required />
          </label>
          <label>
            <span>Numero do fornecedor</span>
            <input name="supplierNumber" required />
          </label>
          <label>
            <span>Data</span>
            <input name="issuedAt" type="date" required defaultValue={today()} />
          </label>
          <label>
            <span>Vencimento</span>
            <input name="dueDate" type="date" />
          </label>
          <DocumentLineFields cost />
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
      </form>
    </PageFrame>
  );
}

export function PaymentsPage() {
  const list = useApiList(async () =>
    pickArray(await purchasesApi.listDocuments(), "purchaseDocuments"),
  );
  const action = useAction(list.reload);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(
      () =>
        paymentApi.register(
          requiredText(form.get("id"), "Documento"),
          parseMoneyMovement(form, "paidAt"),
        ),
      "Pagamento registado.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Pagamentos">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable rows={list.rows} />
      <form className="operation" onSubmit={submit}>
        <h3>Registar pagamento</h3>
        <div className="fields">
          <DocumentSelect name="id" label="Documento de compra" documents={list.rows} />
          <label>
            <span>Valor em centimos</span>
            <input name="amountCents" type="number" min="1" required />
          </label>
          <label>
            <span>Data</span>
            <input name="paidAt" type="date" required defaultValue={today()} />
          </label>
          <MethodSelect />
          <label>
            <span>Referencia</span>
            <input name="reference" />
          </label>
          <label>
            <span>Notas</span>
            <input name="notes" />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Registar</button>
      </form>
    </PageFrame>
  );
}

export function PurchasePostingsPage() {
  const list = useApiList(async () =>
    pickArray(await purchasesApi.listDocuments(), "purchaseDocuments"),
  );
  const action = useAction(list.reload);

  return (
    <PageFrame title="Lancamentos de compras">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <button
            type="button"
            onClick={() =>
              void action.run(
                () => accountingApi.postPurchaseDocument(String(row.id)),
                "Compra contabilizada.",
              )
            }
          >
            Contabilizar
          </button>
        )}
      />
    </PageFrame>
  );
}

export function PurchaseApprovalPage() {
  const list = useApiList(async () =>
    pickArray(await purchasesApi.listDocuments(), "purchaseDocuments"),
  );
  const action = useAction(list.reload);

  return (
    <PageFrame title="Aprovacao de compras">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <div className="inlineActions">
            <button
              type="button"
              onClick={() =>
                void action.run(
                  () => purchaseApprovalApi.approveDocument(String(row.id)),
                  "Compra aprovada.",
                )
              }
            >
              Aprovar
            </button>
            <button
              type="button"
              onClick={() =>
                void action.run(
                  () => purchaseApprovalApi.postState(String(row.id)),
                  "Compra lancada.",
                )
              }
            >
              Lancar
            </button>
          </div>
        )}
      />
    </PageFrame>
  );
}
