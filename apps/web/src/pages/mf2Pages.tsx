import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ApiError, apiClient, JsonBody } from "../lib/apiClient";
import {
  ApiObject,
  asObject,
  formatValue,
  optionalText,
  pickArray,
  requiredText,
} from "../lib/mf1FormUtils";

type StockMovementType = "ENTRY" | "EXIT" | "TRANSFER" | "RETURN" | "ADJUSTMENT";

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

function parseNumber(value: FormDataEntryValue | null, label: string) {
  const parsed = Number(String(value ?? "").trim());
  if (!Number.isFinite(parsed)) throw new Error(`${label} invalido`);
  return parsed;
}

function parseOptionalInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return undefined;
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Valor em centimos invalido");
  }
  return parsed;
}

function parseJsonArray(value: FormDataEntryValue | null, label: string) {
  const text = requiredText(value, label);
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error(`${label} deve ser um array JSON`);
  return parsed;
}

function requiredFile(value: FormDataEntryValue | null, label: string) {
  if (!(value instanceof File) || value.size === 0) {
    throw new Error(`${label} obrigatorio`);
  }
  return value;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", () => reject(new Error("Nao foi possivel ler o ficheiro")));
    reader.addEventListener("load", () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.slice(result.indexOf(",") + 1) : result);
    });
    reader.readAsDataURL(file);
  });
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

function DataTable({ rows }: { rows: ApiObject[] }) {
  if (rows.length === 0) return <p className="empty">Sem registos para apresentar.</p>;
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
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => (
                <td key={column}>{formatValue(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

function useApiList(load: () => Promise<ApiObject[]>) {
  const [state, setState] = useState<ListState>({ rows: [], busy: false, error: null });
  async function reload() {
    setState((current) => ({ ...current, busy: true, error: null }));
    try {
      setState({ rows: await load(), busy: false, error: null });
    } catch (caught) {
      setState({ rows: [], busy: false, error: formatError(caught) });
    }
  }
  useEffect(() => {
    void reload();
  }, []);
  return { ...state, reload };
}

function useAction(reload?: () => Promise<void>) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await action();
      await reload?.();
      setMessage(success);
      return result;
    } catch (caught) {
      setError(formatError(caught));
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, message, run };
}

export function StockMovementsPage() {
  const list = useApiList(async () =>
    pickArray(await apiClient.inventory.listStockMovements(), "movements"),
  );
  const action = useAction(list.reload);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(
      () =>
        apiClient.inventory.createStockMovement({
          type: requiredText(form.get("type"), "Tipo") as StockMovementType,
          itemId: requiredText(form.get("itemId"), "Artigo"),
          quantity: parseNumber(form.get("quantity"), "Quantidade"),
          unitCostCents: parseOptionalInteger(form.get("unitCostCents")),
          fromWarehouseId: optionalText(form.get("fromWarehouseId")),
          toWarehouseId: optionalText(form.get("toWarehouseId")),
          reason: requiredText(form.get("reason"), "Motivo"),
        }),
      "Movimento de stock criado.",
    );
  }

  return (
    <PageFrame title="Movimentos de stock">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable rows={list.rows} />
      <form className="operation" onSubmit={submit}>
        <h3>Novo movimento</h3>
        <div className="fields">
          <label>
            <span>Tipo</span>
            <select name="type" required defaultValue="ENTRY">
              <option value="ENTRY">Entrada</option>
              <option value="EXIT">Saida</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="RETURN">Devolucao</option>
              <option value="ADJUSTMENT">Ajuste</option>
            </select>
          </label>
          <label><span>Artigo ID</span><input name="itemId" required /></label>
          <label><span>Quantidade</span><input name="quantity" required defaultValue="1" /></label>
          <label><span>Custo unitario em centimos</span><input name="unitCostCents" type="number" min="1" /></label>
          <label><span>Armazem origem ID</span><input name="fromWarehouseId" /></label>
          <label><span>Armazem destino ID</span><input name="toWarehouseId" /></label>
          <label><span>Motivo</span><input name="reason" required /></label>
        </div>
        <button type="submit" disabled={action.busy}>Registar</button>
      </form>
    </PageFrame>
  );
}

export function FifoCostPage() {
  const action = useAction();
  const [result, setResult] = useState<unknown>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const preview = await action.run(
      () =>
        apiClient.inventory.previewFifoCost({
          itemId: requiredText(form.get("itemId"), "Artigo"),
          warehouseId: requiredText(form.get("warehouseId"), "Armazem"),
          quantity: requiredText(form.get("quantity"), "Quantidade"),
        }),
      "Preview FIFO calculado.",
    );
    setResult(preview);
  }

  return (
    <PageFrame title="Custo FIFO">
      <Feedback busy={action.busy} error={action.error} message={action.message} />
      <form className="operation" onSubmit={submit}>
        <div className="fields">
          <label><span>Artigo ID</span><input name="itemId" required /></label>
          <label><span>Armazem ID</span><input name="warehouseId" required /></label>
          <label><span>Quantidade</span><input name="quantity" required defaultValue="1" /></label>
        </div>
        <button type="submit" disabled={action.busy}>Pré-visualizar</button>
      </form>
      <pre className="result">{JSON.stringify(result, null, 2)}</pre>
    </PageFrame>
  );
}

export function InventoryCountPage() {
  const list = useApiList(async () => pickArray(await apiClient.inventory.listCounts(), "counts"));
  const action = useAction(list.reload);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(
      () =>
        apiClient.inventory.createCount({
          warehouseId: requiredText(form.get("warehouseId"), "Armazem"),
          reason: requiredText(form.get("reason"), "Motivo"),
          countedAt: requiredText(form.get("countedAt"), "Data"),
          lines: parseJsonArray(form.get("lines"), "Linhas"),
        }),
      "Contagem criada.",
    );
  }

  async function saveLines(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = requiredText(form.get("id"), "Contagem");
    await action.run(
      () =>
        apiClient.inventory.saveCountLines(id, {
          lines: parseJsonArray(form.get("lines"), "Linhas"),
        }),
      "Linhas da contagem guardadas.",
    );
  }

  async function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = requiredText(new FormData(event.currentTarget).get("id"), "Contagem");
    await action.run(() => apiClient.inventory.postCount(id), "Contagem publicada.");
  }

  return (
    <PageFrame title="Contagens físicas">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable rows={list.rows} />
      <form className="operation" onSubmit={create}>
        <h3>Nova contagem</h3>
        <div className="fields">
          <label><span>Armazem ID</span><input name="warehouseId" required /></label>
          <label><span>Motivo</span><input name="reason" required /></label>
          <label><span>Data</span><input name="countedAt" type="date" required defaultValue={today()} /></label>
          <label>
            <span>Linhas JSON</span>
            <textarea name="lines" required defaultValue='[{"itemId":"","countedQuantity":1,"unitCostCents":1000}]' />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
      </form>
      <form className="operation" onSubmit={saveLines}>
        <h3>Editar linhas de rascunho</h3>
        <div className="fields">
          <label><span>Contagem ID</span><input name="id" required /></label>
          <label>
            <span>Linhas JSON</span>
            <textarea name="lines" required defaultValue='[{"itemId":"","countedQuantity":1,"unitCostCents":1000}]' />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Guardar linhas</button>
      </form>
      <form className="operation" onSubmit={post}>
        <h3>Publicar contagem</h3>
        <div className="fields">
          <label><span>Contagem ID</span><input name="id" required /></label>
        </div>
        <button type="submit" disabled={action.busy}>Publicar</button>
      </form>
    </PageFrame>
  );
}

export function StockAlertsPage() {
  const list = useApiList(async () => pickArray(await apiClient.inventory.listStockAlerts(), "alerts"));
  const action = useAction(list.reload);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(
      () =>
        apiClient.inventory.saveStockAlertSetting({
          itemId: requiredText(form.get("itemId"), "Artigo"),
          warehouseId: requiredText(form.get("warehouseId"), "Armazem"),
          minQuantity: optionalText(form.get("minQuantity")),
          maxQuantity: optionalText(form.get("maxQuantity")),
          stoppedAfterDays: optionalText(form.get("stoppedAfterDays")),
        }),
      "Configuração de alertas guardada.",
    );
  }

  return (
    <PageFrame title="Alertas de stock">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable rows={list.rows} />
      <form className="operation" onSubmit={submit}>
        <h3>Configurar limite</h3>
        <div className="fields">
          <label><span>Artigo ID</span><input name="itemId" required /></label>
          <label><span>Armazem ID</span><input name="warehouseId" required /></label>
          <label><span>Minimo</span><input name="minQuantity" /></label>
          <label><span>Maximo</span><input name="maxQuantity" /></label>
          <label><span>Dias sem movimento</span><input name="stoppedAfterDays" type="number" min="1" defaultValue="90" /></label>
        </div>
        <button type="submit" disabled={action.busy}>Guardar</button>
      </form>
    </PageFrame>
  );
}

export function ManualJournalPage() {
  const action = useAction();
  const [result, setResult] = useState<unknown>(null);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await action.run(
      () =>
        apiClient.manualJournals.create({
          entryDate: requiredText(form.get("entryDate"), "Data"),
          description: requiredText(form.get("description"), "Descricao"),
          lines: parseJsonArray(form.get("lines"), "Linhas"),
        }),
      "Lançamento manual criado.",
    );
    setResult(response);
  }

  async function get(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = requiredText(new FormData(event.currentTarget).get("id"), "Lancamento");
    setResult(await action.run(() => apiClient.manualJournals.get(id), "Lançamento carregado."));
  }

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = requiredText(form.get("id"), "Lancamento");
    const response = await action.run(
      () =>
        apiClient.manualJournals.update(id, {
          entryDate: requiredText(form.get("entryDate"), "Data"),
          description: requiredText(form.get("description"), "Descricao"),
          lines: parseJsonArray(form.get("lines"), "Linhas"),
        }),
      "Lançamento manual atualizado.",
    );
    setResult(response);
  }

  async function addAttachment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = requiredText(form.get("id"), "Lancamento");
    const file = requiredFile(form.get("file"), "Ficheiro");
    const contentBase64 = await fileToBase64(file);
    const response = await action.run(
      () =>
        apiClient.manualJournals.addAttachment(id, {
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          contentBase64,
        }),
      "Anexo registado.",
    );
    setResult(response);
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Lançamentos manuais">
      <Feedback busy={action.busy} error={action.error} message={action.message} />
      <form className="operation" onSubmit={create}>
        <h3>Criar lançamento</h3>
        <div className="fields">
          <label><span>Data</span><input name="entryDate" type="date" required defaultValue={today()} /></label>
          <label><span>Descricao</span><input name="description" required /></label>
          <label>
            <span>Linhas JSON</span>
            <textarea name="lines" required defaultValue='[{"accountId":"","debitCents":1000},{"accountId":"","creditCents":1000}]' />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
      </form>
      <form className="operation" onSubmit={update}>
        <h3>Editar lançamento</h3>
        <div className="fields">
          <label><span>Lançamento ID</span><input name="id" required /></label>
          <label><span>Data</span><input name="entryDate" type="date" required defaultValue={today()} /></label>
          <label><span>Descricao</span><input name="description" required /></label>
          <label>
            <span>Linhas JSON</span>
            <textarea name="lines" required defaultValue='[{"accountId":"","debitCents":1000},{"accountId":"","creditCents":1000}]' />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Atualizar</button>
      </form>
      <form className="operation" onSubmit={addAttachment}>
        <h3>Registar anexo</h3>
        <div className="fields">
          <label><span>Lançamento ID</span><input name="id" required /></label>
          <label>
            <span>Ficheiro privado</span>
            <input name="file" type="file" accept="application/pdf,image/png,image/jpeg" required />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Registar anexo</button>
      </form>
      <form className="operation" onSubmit={get}>
        <h3>Consultar lançamento</h3>
        <div className="fields">
          <label><span>Lançamento ID</span><input name="id" required /></label>
        </div>
        <button type="submit" disabled={action.busy}>Consultar</button>
      </form>
      <pre className="result">{JSON.stringify(result, null, 2)}</pre>
    </PageFrame>
  );
}

export function AccountingReportsPage() {
  const action = useAction();
  const [result, setResult] = useState<unknown>(null);
  const [exports, setExports] = useState<{ trial?: string; ledger?: string }>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const kind = requiredText(form.get("kind"), "Relatorio");
    const from = requiredText(form.get("from"), "Data inicial");
    const to = requiredText(form.get("to"), "Data final");
    const accountId = optionalText(form.get("accountId"));
    const response = await action.run(
      () =>
        kind === "ledger"
          ? apiClient.accountingReports.ledger(requiredText(accountId ?? "", "Conta"), from, to)
          : apiClient.accountingReports.trialBalance(from, to),
      "Relatório calculado.",
    );
    setResult(response);
    setExports({
      trial: apiClient.accountingReports.trialBalanceExportUrl(from, to),
      ledger: accountId
        ? apiClient.accountingReports.ledgerExportUrl(accountId, from, to)
        : undefined,
    });
  }

  return (
    <PageFrame title="Balancete e razão">
      <Feedback busy={action.busy} error={action.error} message={action.message} />
      <form className="operation" onSubmit={submit}>
        <div className="fields">
          <label>
            <span>Relatorio</span>
            <select name="kind" required defaultValue="trial">
              <option value="trial">Balancete</option>
              <option value="ledger">Razao</option>
            </select>
          </label>
          <label><span>Data inicial</span><input name="from" type="date" required defaultValue={today()} /></label>
          <label><span>Data final</span><input name="to" type="date" required defaultValue={today()} /></label>
          <label><span>Conta ID para razão</span><input name="accountId" /></label>
        </div>
        <button type="submit" disabled={action.busy}>Calcular</button>
      </form>
      {exports.trial || exports.ledger ? (
        <div className="operation">
          <h3>Exportações</h3>
          <p>
            {exports.trial ? <a href={exports.trial}>Descarregar balancete Excel</a> : null}
          </p>
          <p>
            {exports.ledger ? <a href={exports.ledger}>Descarregar razão PDF</a> : "Indica uma conta para exportar a razão."}
          </p>
        </div>
      ) : null}
      <pre className="result">{JSON.stringify(result, null, 2)}</pre>
    </PageFrame>
  );
}

export function FinancialStatementsPage() {
  const action = useAction();
  const [result, setResult] = useState<unknown>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const kind = requiredText(form.get("kind"), "Mapa");
    const from = requiredText(form.get("from"), "Data inicial");
    const to = requiredText(form.get("to"), "Data final");
    const response = await action.run(
      () =>
        kind === "balance"
          ? apiClient.financialStatements.balanceSheet(from, to)
          : apiClient.financialStatements.incomeStatement(from, to),
      "Mapa financeiro calculado.",
    );
    setResult(response);
  }

  return (
    <PageFrame title="Demonstrações financeiras">
      <Feedback busy={action.busy} error={action.error} message={action.message} />
      <form className="operation" onSubmit={submit}>
        <div className="fields">
          <label>
            <span>Mapa</span>
            <select name="kind" required defaultValue="income">
              <option value="income">Demonstração de Resultados</option>
              <option value="balance">Balanço interno</option>
            </select>
          </label>
          <label><span>Data inicial</span><input name="from" type="date" required defaultValue={today()} /></label>
          <label><span>Data final</span><input name="to" type="date" required defaultValue={today()} /></label>
        </div>
        <button type="submit" disabled={action.busy}>Calcular</button>
      </form>
      <pre className="result">{JSON.stringify(result, null, 2)}</pre>
    </PageFrame>
  );
}
