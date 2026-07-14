/**
 * @file Páginas React dos fluxos MF2 de inventário, FIFO, contagens, alertas, lançamentos e relatórios contabilísticos.
 */

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { PermissionGate } from "../auth/PermissionGate";
import { Permission } from "../auth/permissions";
import { apiClient, JsonBody, type AccountingExportFormat } from "../lib/apiClient";
import {
  collectCursorPages,
  EMPTY_PAGE_INFO,
  normalizeCursorPage,
  type CursorPage,
  type CursorPageInfo,
  type CursorPagination,
} from "../lib/cursorPagination";
import { toLocalDateInputValue } from "../lib/dateUtils";
import { formatUiError } from "../lib/mf5ErrorMessages";
import { assertMf5FormData } from "../lib/mf5FormValidators";
import {
  ApiObject,
  asObject,
  formatValue,
  optionalText,
  pickArray,
  requiredText,
} from "../lib/mf1FormUtils";
import { PageFrame, StatusMessage, StructuredResult } from "../ui/opsaUi";
import { CursorPaginationButton } from "../ui/CursorPaginationButton";
import { ConfirmationDialog } from "../ui/modal";

type StockMovementType = "ENTRY" | "EXIT" | "TRANSFER" | "RETURN" | "ADJUSTMENT";
const ACCOUNTING_EXPORT_FORMATS: AccountingExportFormat[] = ["csv", "xlsx", "pdf"];

interface ListState {
  rows: ApiObject[];
  busy: boolean;
  error: string | null;
  pageInfo: CursorPageInfo;
}

/**
 * Converte erros da API ou erros nativos numa mensagem curta para apresentar ao utilizador.
 *
 * @param error - Erro capturado durante a operação.
 * @returns Mensagem de erro pronta a apresentar ao utilizador.
 */
function formatError(error: unknown): string {
  // O detalhe financeiro continua validado no backend; a UI so melhora a orientacao do erro.
  return formatUiError(error);
}

/**
 * Devolve a data corrente no formato ISO curto usado pelos inputs de data.
 *
 * @returns Data corrente em formato ISO curto.
 */
/**
 * Converte um campo de formulário num número finito para quantidades de stock.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param label - Nome amigável usado em mensagens de erro ou UI.
 * @returns Número finito validado.
 */
function parseNumber(value: FormDataEntryValue | null, label: string) {
  const parsed = Number(String(value ?? "").trim());
  if (!Number.isFinite(parsed)) throw new Error(`${label} invalido`);
  return parsed;
}

/**
 * Converte um campo opcional em inteiro positivo, usado para valores em cêntimos.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Inteiro positivo, ou undefined quando o campo está vazio.
 */
function parseOptionalInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return undefined;
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Valor em centimos invalido");
  }
  return parsed;
}

/**
 * Valida o motivo auditável exigido para rever um lançamento já existente.
 *
 * @param value - Texto introduzido pelo utilizador no editor.
 * @returns Motivo normalizado entre 5 e 500 caracteres.
 */
function parseRevisionReason(value: FormDataEntryValue | null) {
  const reason = requiredText(value, "Motivo da revisão");
  if (reason.length < 5 || reason.length > 500) {
    throw new Error("Motivo da revisão deve ter entre 5 e 500 caracteres");
  }
  return reason;
}

/**
 * Valida que o formulário contém um ficheiro real antes de tentar ler o conteúdo.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param label - Nome amigável usado em mensagens de erro ou UI.
 * @returns Ficheiro validado do formulário.
 */
function requiredFile(value: FormDataEntryValue | null, label: string) {
  if (!(value instanceof File) || value.size === 0) {
    throw new Error(`${label} obrigatorio`);
  }
  return value;
}

/**
 * Renderiza uma tabela simples a partir das chaves presentes nas linhas devolvidas pela API.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com a tabela de dados.
 */
function DataTable({
  rows,
  columns,
  pagination,
}: {
  rows: ApiObject[];
  columns: Array<{ key: string; label: string }>;
  pagination?: {
    pageInfo: CursorPageInfo;
    busy: boolean;
    loadMore: () => Promise<void>;
  };
}) {
  if (rows.length === 0) {
    return (
      <>
        <p className="empty">Sem registos para apresentar.</p>
        {pagination ? (
          <CursorPaginationButton
            hasNextPage={pagination.pageInfo.hasNextPage}
            busy={pagination.busy}
            onLoadMore={pagination.loadMore}
          />
        ) : null}
      </>
    );
  }
  return (
    <>
      <div className="tableWrap">
        <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => (
                <td key={column.key}>{formatValue(row[column.key], column.key)}</td>
              ))}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      {pagination ? (
        <CursorPaginationButton
          hasNextPage={pagination.pageInfo.hasNextPage}
          busy={pagination.busy}
          onLoadMore={pagination.loadMore}
        />
      ) : null}
    </>
  );
}

const STOCK_MOVEMENT_COLUMNS = [
  { key: "type", label: "Tipo" },
  { key: "itemName", label: "Artigo" },
  { key: "quantity", label: "Quantidade" },
  { key: "fromWarehouseName", label: "Origem" },
  { key: "toWarehouseName", label: "Destino" },
  { key: "reason", label: "Motivo" },
  { key: "createdAt", label: "Data" },
];
const INVENTORY_COUNT_COLUMNS = [
  { key: "reference", label: "Referência" },
  { key: "warehouseName", label: "Armazém" },
  { key: "status", label: "Estado" },
  { key: "countedAt", label: "Data" },
  { key: "reason", label: "Motivo" },
];
const STOCK_ALERT_COLUMNS = [
  { key: "type", label: "Tipo" },
  { key: "itemName", label: "Artigo" },
  { key: "warehouseName", label: "Armazém" },
  { key: "quantity", label: "Quantidade" },
  { key: "threshold", label: "Limite" },
];
const ACCOUNTING_REPORT_COLUMNS = [
  { key: "accountCode", label: "Conta" },
  { key: "accountName", label: "Designação" },
  { key: "debitCents", label: "Débito" },
  { key: "creditCents", label: "Crédito" },
  { key: "balanceCents", label: "Saldo" },
];

/**
 * Aceita o envelope paginado canónico e os contratos contabilísticos legados durante a transição.
 *
 * @param response - Resposta do balancete ou razão.
 * @returns Linhas prontas para tabela, sem despejar o envelope técnico na UI.
 */
function accountingReportRows(response: unknown): ApiObject[] {
  const root = asObject(response);
  if (Array.isArray(root.items)) return root.items.map(asObject);
  for (const key of ["trialBalance", "ledger"]) {
    const report = asObject(root[key]);
    if (Array.isArray(report.items)) return report.items.map(asObject);
    if (Array.isArray(report.rows)) return report.rows.map(asObject);
  }
  return [];
}

/**
 * Mostra estados de carregamento, erro e sucesso de forma consistente nas páginas operacionais.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Fragmento React com estados de carregamento, erro e sucesso.
 */
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
      {busy ? (
        <StatusMessage tone="neutral" title="A carregar">
          A obter dados atualizados...
        </StatusMessage>
      ) : null}
      {error ? (
        <StatusMessage tone="danger" title="Erro">
          {error}
        </StatusMessage>
      ) : null}
      {message ? (
        <StatusMessage tone="success" title="Sucesso">
          {message}
        </StatusMessage>
      ) : null}
    </>
  );
}

/**
 * Carrega uma lista da API e expõe estado reutilizável para páginas operacionais.
 *
 * @param load - Função que carrega dados a partir da API.
 * @returns Estado da lista e função para a recarregar.
 */
function useApiList(load: (pagination: CursorPagination) => Promise<CursorPage<ApiObject>>) {
  const [state, setState] = useState<ListState>({
    rows: [],
    busy: false,
    error: null,
    pageInfo: EMPTY_PAGE_INFO,
  });
  /**
   * Recarrega a lista principal e guarda estados de carregamento ou erro.
   *
   * @returns Promise resolvida depois de recarregar a lista.
   */
  async function reload() {
    setState((current) => ({ ...current, busy: true, error: null }));
    try {
      const page = await load({ limit: 50 });
      setState({
        rows: page.items,
        pageInfo: page.pageInfo,
        busy: false,
        error: null,
      });
    } catch (caught) {
      setState({
        rows: [],
        pageInfo: EMPTY_PAGE_INFO,
        busy: false,
        error: formatError(caught),
      });
    }
  }
  async function loadMore() {
    const cursor = state.pageInfo.nextCursor;
    if (!state.pageInfo.hasNextPage || !cursor || state.busy) return;
    setState((current) => ({ ...current, busy: true, error: null }));
    try {
      const page = await load({ cursor, limit: 50 });
      setState((current) => ({
        rows: [...current.rows, ...page.items],
        pageInfo: page.pageInfo,
        busy: false,
        error: null,
      }));
    } catch (caught) {
      setState((current) => ({
        ...current,
        busy: false,
        error: formatError(caught),
      }));
    }
  }
  useEffect(() => {
    void reload();
  }, []);
  return { ...state, reload, loadMore };
}

/**
 * Centraliza o estado de ações assíncronas executadas por formulários e botões.
 *
 * @param reload - Função usada para recarregar os dados após a ação.
 * @returns Estado da ação e função para a executar.
 */
function useAction(reload?: () => Promise<void>) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /**
   * Executa uma ação assíncrona atualizando estados de carregamento, erro e mensagem de sucesso.
   *
   * @param action - Operação assíncrona a executar.
   * @param success - Mensagem apresentada quando a ação termina com sucesso.
   * @returns Promise com o resultado da ação executada quando existe.
   */
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

interface ReferenceOption {
  value: string;
  label: string;
}

/**
 * Converte registos de referência em opções legíveis sem mostrar UUIDs como tarefa ao utilizador.
 *
 * @param rows - Linhas devolvidas pela API.
 * @returns Opções com identificador interno e designação visível.
 */
function referenceOptions(rows: ApiObject[]): ReferenceOption[] {
  return rows.flatMap((row) => {
    if (typeof row.id !== "string") return [];
    const readable = [row.name, row.sku, row.code, row.reference, row.reason]
      .find((value) => typeof value === "string" && value.length > 0);
    return [{ value: row.id, label: typeof readable === "string" ? readable : row.id }];
  });
}

/**
 * Carrega artigos, armazéns e contas que alimentam os editores estruturados MF2.
 *
 * @param needs - Referências necessárias à página atual.
 * @returns Opções carregadas e erro comum quando alguma referência falha.
 */
function useMf2References(
  needs: { items?: boolean; warehouses?: boolean; accounts?: boolean },
) {
  const [items, setItems] = useState<ReferenceOption[]>([]);
  const [warehouses, setWarehouses] = useState<ReferenceOption[]>([]);
  const [accounts, setAccounts] = useState<ReferenceOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const requests: Promise<void>[] = [];
    if (needs.items) {
      requests.push(
        collectCursorPages((pagination) => apiClient.items.list(pagination)).then((items) => {
          if (active) setItems(referenceOptions(items.map(asObject)));
        }),
      );
    }
    if (needs.warehouses) {
      requests.push(
        apiClient.warehouses.list().then((response) => {
          if (active) setWarehouses(referenceOptions(pickArray(response, "warehouses")));
        }),
      );
    }
    if (needs.accounts) {
      requests.push(
        collectCursorPages((pagination) =>
          apiClient.accounting.listAccounts(pagination)).then((accounts) => {
          if (active) setAccounts(referenceOptions(accounts.map(asObject)));
        }),
      );
    }
    void Promise.all(requests).catch(() => {
      if (active) setError("Não foi possível carregar todas as opções necessárias.");
    });
    return () => {
      active = false;
    };
  }, [needs.accounts, needs.items, needs.warehouses]);

  return { items, warehouses, accounts, error };
}

function ReferenceSelect({
  name,
  label,
  options,
  required = false,
}: {
  name: string;
  label: string;
  options: ReferenceOption[];
  required?: boolean;
}) {
  return (
    <label>
      <span>{label}</span>
      <select name={name} required={required} defaultValue="">
        <option value="">Selecionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

interface CountLineDraft {
  key: number;
  itemId: string;
  countedQuantity: string;
  unitCostCents: string;
}

let nextCountLineKey = 1;

function newCountLine(): CountLineDraft {
  const line = {
    key: nextCountLineKey,
    itemId: "",
    countedQuantity: "1",
    unitCostCents: "1000",
  };
  nextCountLineKey += 1;
  return line;
}

function CountLinesEditor({
  lines,
  items,
  onChange,
  label,
}: {
  lines: CountLineDraft[];
  items: ReferenceOption[];
  onChange: (lines: CountLineDraft[]) => void;
  label: string;
}) {
  function update(key: number, patch: Partial<CountLineDraft>) {
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  return (
    <fieldset className="lineEditor">
      <legend>{label}</legend>
      {lines.map((line, index) => (
        <div className="lineEditor__row" key={line.key}>
          <label>
            <span>Artigo {index + 1}</span>
            <select
              value={line.itemId}
              required
              onChange={(event) => update(line.key, { itemId: event.target.value })}
            >
              <option value="">Selecionar artigo</option>
              {items.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Quantidade contada</span>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={line.countedQuantity}
              onChange={(event) => update(line.key, { countedQuantity: event.target.value })}
            />
          </label>
          <label>
            <span>Custo unitário em cêntimos</span>
            <input
              type="number"
              min="0"
              required
              value={line.unitCostCents}
              onChange={(event) => update(line.key, { unitCostCents: event.target.value })}
            />
          </label>
          <button
            type="button"
            disabled={lines.length === 1}
            onClick={() => onChange(lines.filter(({ key }) => key !== line.key))}
          >
            Remover linha
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...lines, newCountLine()])}>
        Adicionar linha
      </button>
    </fieldset>
  );
}

function serializeCountLines(lines: CountLineDraft[]) {
  return lines.map((line) => {
    const countedQuantity = Number(line.countedQuantity);
    const unitCostCents = Number(line.unitCostCents);
    if (!line.itemId || !Number.isFinite(countedQuantity) || countedQuantity < 0) {
      throw new Error("Revê o artigo e a quantidade de cada linha da contagem.");
    }
    if (!Number.isInteger(unitCostCents) || unitCostCents < 0) {
      throw new Error("O custo unitário deve ser um inteiro não negativo em cêntimos.");
    }
    return { itemId: line.itemId, countedQuantity, unitCostCents };
  });
}

interface JournalLineDraft {
  key: number;
  accountId: string;
  side: "DEBIT" | "CREDIT";
  amountCents: string;
  memo: string;
}

let nextJournalLineKey = 2;

function initialJournalLines(): JournalLineDraft[] {
  return [
    { key: 0, accountId: "", side: "DEBIT", amountCents: "1000", memo: "" },
    { key: 1, accountId: "", side: "CREDIT", amountCents: "1000", memo: "" },
  ];
}

function JournalLinesEditor({
  lines,
  accounts,
  onChange,
  label,
}: {
  lines: JournalLineDraft[];
  accounts: ReferenceOption[];
  onChange: (lines: JournalLineDraft[]) => void;
  label: string;
}) {
  function update(key: number, patch: Partial<JournalLineDraft>) {
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  return (
    <fieldset className="lineEditor">
      <legend>{label}</legend>
      {lines.map((line, index) => (
        <div className="lineEditor__row" key={line.key}>
          <label>
            <span>Conta {index + 1}</span>
            <select
              required
              value={line.accountId}
              onChange={(event) => update(line.key, { accountId: event.target.value })}
            >
              <option value="">Selecionar conta</option>
              {accounts.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Lado</span>
            <select
              value={line.side}
              onChange={(event) =>
                update(line.key, { side: event.target.value as JournalLineDraft["side"] })
              }
            >
              <option value="DEBIT">Débito</option>
              <option value="CREDIT">Crédito</option>
            </select>
          </label>
          <label>
            <span>Montante em cêntimos</span>
            <input
              type="number"
              min="1"
              required
              value={line.amountCents}
              onChange={(event) => update(line.key, { amountCents: event.target.value })}
            />
          </label>
          <label>
            <span>Descrição da linha</span>
            <input
              value={line.memo}
              onChange={(event) => update(line.key, { memo: event.target.value })}
            />
          </label>
          <button
            type="button"
            disabled={lines.length <= 2}
            onClick={() => onChange(lines.filter(({ key }) => key !== line.key))}
          >
            Remover linha
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const key = nextJournalLineKey;
          nextJournalLineKey += 1;
          onChange([
            ...lines,
            { key, accountId: "", side: "DEBIT", amountCents: "", memo: "" },
          ]);
        }}
      >
        Adicionar linha
      </button>
    </fieldset>
  );
}

function serializeJournalLines(lines: JournalLineDraft[]) {
  if (lines.length < 2) throw new Error("O lançamento precisa de pelo menos duas linhas.");
  return lines.map((line) => {
    const amountCents = Number(line.amountCents);
    if (!line.accountId || !Number.isInteger(amountCents) || amountCents <= 0) {
      throw new Error("Seleciona uma conta e um montante válido em cada linha.");
    }
    return {
      accountId: line.accountId,
      debitCents: line.side === "DEBIT" ? amountCents : 0,
      creditCents: line.side === "CREDIT" ? amountCents : 0,
      memo: line.memo.trim() || undefined,
    };
  });
}

/**
 * Renderiza o ecrã Stock Movements e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para movimentos de stock.
 */
export function StockMovementsPage() {
  const list = useApiList(async (pagination) =>
    normalizeCursorPage(
      await apiClient.inventory.listStockMovements(pagination),
      "movements",
      asObject,
    ),
  );
  const action = useAction(list.reload);
  const { hasPermission } = useAuth();
  const canWriteInventory = hasPermission(Permission.INVENTORY_WRITE);
  const references = useMf2References({
    items: canWriteInventory,
    warehouses: canWriteInventory,
  });

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
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
      {references.error ? (
        <StatusMessage tone="danger" title="Opções indisponíveis">{references.error}</StatusMessage>
      ) : null}
      <DataTable rows={list.rows} columns={STOCK_MOVEMENT_COLUMNS} pagination={list} />
      <PermissionGate permission={Permission.INVENTORY_WRITE}>
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
          <ReferenceSelect name="itemId" label="Artigo" options={references.items} required />
          <label><span>Quantidade</span><input name="quantity" required defaultValue="1" /></label>
          <label><span>Custo unitario em centimos</span><input name="unitCostCents" type="number" min="1" /></label>
          <ReferenceSelect name="fromWarehouseId" label="Armazém de origem" options={references.warehouses} />
          <ReferenceSelect name="toWarehouseId" label="Armazém de destino" options={references.warehouses} />
          <label><span>Motivo</span><input name="reason" required /></label>
        </div>
        <button type="submit" disabled={action.busy}>Registar</button>
        </form>
      </PermissionGate>
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Fifo Cost e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para preview de custo FIFO.
 */
export function FifoCostPage() {
  const action = useAction();
  const [result, setResult] = useState<unknown>(null);
  const references = useMf2References({ items: true, warehouses: true });

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
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
      {references.error ? (
        <StatusMessage tone="danger" title="Opções indisponíveis">{references.error}</StatusMessage>
      ) : null}
      <form className="operation" onSubmit={submit}>
        <div className="fields">
          <ReferenceSelect name="itemId" label="Artigo" options={references.items} required />
          <ReferenceSelect name="warehouseId" label="Armazém" options={references.warehouses} required />
          <label><span>Quantidade</span><input name="quantity" required defaultValue="1" /></label>
        </div>
        <button type="submit" disabled={action.busy}>Pré-visualizar</button>
      </form>
      <StructuredResult value={result} title="Pré-visualização FIFO" />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Inventory Count e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para contagens físicas.
 */
export function InventoryCountPage() {
  const list = useApiList(async () =>
    normalizeCursorPage(await apiClient.inventory.listCounts(), "counts", asObject));
  const action = useAction(list.reload);
  const { hasPermission, snapshot } = useAuth();
  const canWriteInventory = hasPermission(Permission.INVENTORY_WRITE);
  const references = useMf2References({
    items: canWriteInventory,
    warehouses: canWriteInventory,
  });
  const [createLines, setCreateLines] = useState<CountLineDraft[]>([newCountLine()]);
  const [editLines, setEditLines] = useState<CountLineDraft[]>([newCountLine()]);
  const [pendingPublishId, setPendingPublishId] = useState<string | null>(null);
  const counts = referenceOptions(list.rows);

  /**
   * Documenta a função create no contexto deste módulo.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de criar o registo pedido pelo formulário.
   */
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(
      () => {
        assertMf5FormData(form, [{ name: "countedAt", required: true }]);
        return apiClient.inventory.createCount({
          warehouseId: requiredText(form.get("warehouseId"), "Armazem"),
          reason: requiredText(form.get("reason"), "Motivo"),
          countedAt: requiredText(form.get("countedAt"), "Data"),
          lines: serializeCountLines(createLines),
        });
      },
      "Contagem criada.",
    );
  }

  /**
   * Processa a gravação das linhas editáveis de uma contagem em rascunho.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de guardar as linhas da contagem.
   */
  async function saveLines(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = requiredText(form.get("id"), "Contagem");
    await action.run(
      () =>
        apiClient.inventory.saveCountLines(id, {
          lines: serializeCountLines(editLines),
        }),
      "Linhas da contagem guardadas.",
    );
  }

  /**
   * Processa a publicação do registo indicado no formulário.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de publicar o registo indicado.
   */
  async function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = requiredText(new FormData(event.currentTarget).get("id"), "Contagem");
    setPendingPublishId(id);
  }

  return (
    <PageFrame title="Contagens físicas">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      {references.error ? (
        <StatusMessage tone="danger" title="Opções indisponíveis">{references.error}</StatusMessage>
      ) : null}
      <DataTable rows={list.rows} columns={INVENTORY_COUNT_COLUMNS} pagination={list} />
      <PermissionGate permission={Permission.INVENTORY_WRITE}>
        <form className="operation" onSubmit={create}>
        <h3>Nova contagem</h3>
        <div className="fields">
          <ReferenceSelect name="warehouseId" label="Armazém" options={references.warehouses} required />
          <label><span>Motivo</span><input name="reason" required /></label>
          <label><span>Data</span><input name="countedAt" type="date" required defaultValue={toLocalDateInputValue()} /></label>
          <CountLinesEditor
            label="Linhas contadas"
            lines={createLines}
            items={references.items}
            onChange={setCreateLines}
          />
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
        </form>
        <form className="operation" onSubmit={saveLines}>
        <h3>Editar linhas de rascunho</h3>
        <div className="fields">
          <ReferenceSelect name="id" label="Contagem em rascunho" options={counts} required />
          <CountLinesEditor
            label="Linhas contadas"
            lines={editLines}
            items={references.items}
            onChange={setEditLines}
          />
        </div>
        <button type="submit" disabled={action.busy}>Guardar linhas</button>
        </form>
        <form className="operation" onSubmit={post}>
        <h3>Publicar contagem</h3>
        <div className="fields">
          <ReferenceSelect name="id" label="Contagem" options={counts} required />
        </div>
        <button type="submit" disabled={action.busy}>Publicar</button>
        </form>
      </PermissionGate>
      <ConfirmationDialog
        open={Boolean(pendingPublishId)}
        title="Confirmar publicação da contagem"
        description="A publicação aplica os ajustes de inventário calculados a partir desta contagem."
        confirmLabel="Publicar"
        entityLabel={pendingPublishId}
        companyName={snapshot?.company?.name}
        busy={action.busy}
        onCancel={() => setPendingPublishId(null)}
        onConfirm={async () => {
          if (!pendingPublishId) return;
          const result = await action.run(
            () => apiClient.inventory.postCount(pendingPublishId),
            "Contagem publicada.",
          );
          if (result) setPendingPublishId(null);
        }}
      />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Stock Alerts e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para alertas de stock.
 */
export function StockAlertsPage() {
  const list = useApiList(async () =>
    normalizeCursorPage(
      await apiClient.inventory.listStockAlerts(),
      "alerts",
      asObject,
    ));
  const action = useAction(list.reload);
  const { hasPermission } = useAuth();
  const canWriteInventory = hasPermission(Permission.INVENTORY_WRITE);
  const references = useMf2References({
    items: canWriteInventory,
    warehouses: canWriteInventory,
  });

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
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
      {references.error ? (
        <StatusMessage tone="danger" title="Opções indisponíveis">{references.error}</StatusMessage>
      ) : null}
      <DataTable rows={list.rows} columns={STOCK_ALERT_COLUMNS} pagination={list} />
      <PermissionGate permission={Permission.INVENTORY_WRITE}>
        <form className="operation" onSubmit={submit}>
        <h3>Configurar limite</h3>
        <div className="fields">
          <ReferenceSelect name="itemId" label="Artigo" options={references.items} required />
          <ReferenceSelect name="warehouseId" label="Armazém" options={references.warehouses} required />
          <label><span>Minimo</span><input name="minQuantity" /></label>
          <label><span>Maximo</span><input name="maxQuantity" /></label>
          <label><span>Dias sem movimento</span><input name="stoppedAfterDays" type="number" min="1" defaultValue="90" /></label>
        </div>
        <button type="submit" disabled={action.busy}>Guardar</button>
        </form>
      </PermissionGate>
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Manual Journal e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para lançamentos manuais.
 */
export function ManualJournalPage() {
  const journalList = useApiList(async (pagination) =>
    normalizeCursorPage(
      await apiClient.manualJournals.list(pagination),
      "journalEntries",
      asObject,
    ),
  );
  const action = useAction(journalList.reload);
  const [result, setResult] = useState<unknown>(null);
  const references = useMf2References({ accounts: true });
  const [createLines, setCreateLines] = useState<JournalLineDraft[]>(initialJournalLines);
  const [editLines, setEditLines] = useState<JournalLineDraft[]>(initialJournalLines);
  const [activeJournalId, setActiveJournalId] = useState("");
  const [attachments, setAttachments] = useState<
    Array<{ id: string; fileName: string; mimeType?: string; sizeBytes?: number }>
  >([]);
  const journalOptions = referenceOptions(journalList.rows);

  /**
   * Atualiza o lançamento ativo e respetivos anexos a partir de uma resposta da API.
   *
   * @param response - Resposta de criação, consulta ou edição.
   */
  function syncJournalContext(response: unknown) {
    const entry = asObject(asObject(response).journalEntry);
    const id = typeof entry.id === "string" ? entry.id : "";
    if (!id) return;
    setActiveJournalId(id);
    if (Array.isArray(entry.lines) && entry.lines.length >= 2) {
      setEditLines(
        entry.lines.flatMap((value) => {
          const line = asObject(value);
          if (typeof line.accountId !== "string") return [];
          const debitCents = typeof line.debitCents === "number" ? line.debitCents : 0;
          const creditCents = typeof line.creditCents === "number" ? line.creditCents : 0;
          const key = nextJournalLineKey;
          nextJournalLineKey += 1;
          return [{
            key,
            accountId: line.accountId,
            side: debitCents > 0 ? "DEBIT" as const : "CREDIT" as const,
            amountCents: String(debitCents > 0 ? debitCents : creditCents),
            memo: typeof line.memo === "string" ? line.memo : "",
          }];
        }),
      );
    }
    const nextAttachments = Array.isArray(entry.attachments)
      ? entry.attachments.flatMap((value) => {
          const attachment = asObject(value);
          if (typeof attachment.id !== "string") return [];
          return [{
            id: attachment.id,
            fileName:
              typeof attachment.fileName === "string" ? attachment.fileName : "Anexo",
            mimeType:
              typeof attachment.mimeType === "string" ? attachment.mimeType : undefined,
            sizeBytes:
              typeof attachment.sizeBytes === "number" ? attachment.sizeBytes : undefined,
          }];
        })
      : [];
    setAttachments(nextAttachments);
  }

  /**
   * Documenta a função create no contexto deste módulo.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de criar o registo pedido pelo formulário.
   */
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await action.run(
      () => {
        assertMf5FormData(form, [{ name: "entryDate", required: true }]);
        return apiClient.manualJournals.create({
          entryDate: requiredText(form.get("entryDate"), "Data"),
          description: requiredText(form.get("description"), "Descricao"),
          lines: serializeJournalLines(createLines),
        });
      },
      "Lançamento manual criado.",
    );
    setResult(response);
    syncJournalContext(response);
  }

  /**
   * Documenta a função get no contexto deste módulo.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de carregar o registo pedido.
   */
  async function get(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = requiredText(new FormData(event.currentTarget).get("id"), "Lancamento");
    const response = await action.run(
      () => apiClient.manualJournals.get(id),
      "Lançamento carregado.",
    );
    setResult(response);
    syncJournalContext(response);
  }

  /**
   * Processa a atualização do registo indicado no formulário.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de atualizar o registo indicado.
   */
  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!activeJournalId) {
      await action.run(
        async () => {
          throw new Error("Cria ou consulta primeiro o lançamento que pretendes editar.");
        },
        "",
      );
      return;
    }
    const response = await action.run(
      () => {
        assertMf5FormData(form, [{ name: "entryDate", required: true }]);
        return apiClient.manualJournals.update(activeJournalId, {
          entryDate: requiredText(form.get("entryDate"), "Data"),
          description: requiredText(form.get("description"), "Descricao"),
          lines: serializeJournalLines(editLines),
          reason: parseRevisionReason(form.get("reason")),
        });
      },
      "Lançamento manual atualizado.",
    );
    setResult(response);
    syncJournalContext(response);
  }

  /**
   * Processa a submissão multipart do formulário de anexo privado.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de registar o anexo.
   */
  async function addAttachment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (!activeJournalId) {
      await action.run(
        async () => {
          throw new Error("Cria ou consulta primeiro o lançamento que receberá o anexo.");
        },
        "",
      );
      return;
    }
    const file = requiredFile(form.get("file"), "Ficheiro");
    const response = await action.run(
      () => apiClient.manualJournals.addAttachment(activeJournalId, file),
      "Anexo registado.",
    );
    setResult(response);
    if (response) {
      const attachment = asObject(asObject(response).attachment);
      if (typeof attachment.id === "string") {
        setAttachments((current) => [
          ...current.filter(({ id }) => id !== attachment.id),
          {
            id: attachment.id as string,
            fileName:
              typeof attachment.fileName === "string" ? attachment.fileName : file.name,
            mimeType:
              typeof attachment.mimeType === "string" ? attachment.mimeType : file.type,
            sizeBytes:
              typeof attachment.sizeBytes === "number" ? attachment.sizeBytes : file.size,
          },
        ]);
      }
      formElement.reset();
    }
  }

  /**
   * Descarrega um anexo autorizado sem expor a storage key no frontend.
   *
   * @param attachmentId - Identificador público devolvido pelo lançamento.
   */
  async function downloadAttachment(attachmentId: string) {
    if (!activeJournalId) return;
    await action.run(
      async () => {
        const file = await apiClient.manualJournals.downloadAttachment(
          activeJournalId,
          attachmentId,
        );
        const url = URL.createObjectURL(file.blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = file.fileName;
        anchor.click();
        globalThis.setTimeout(() => URL.revokeObjectURL(url), 0);
      },
      "Download iniciado.",
    );
  }

  return (
    <PageFrame title="Lançamentos manuais">
      <Feedback
        busy={journalList.busy || action.busy}
        error={journalList.error ?? action.error}
        message={action.message}
      />
      <CursorPaginationButton
        hasNextPage={journalList.pageInfo.hasNextPage}
        busy={journalList.busy}
        label="lançamentos manuais"
        onLoadMore={journalList.loadMore}
      />
      {references.error ? (
        <StatusMessage tone="danger" title="Contas indisponíveis">{references.error}</StatusMessage>
      ) : null}
      <form className="operation" onSubmit={create}>
        <h3>Criar lançamento</h3>
        <div className="fields">
          <label><span>Data</span><input name="entryDate" type="date" required defaultValue={toLocalDateInputValue()} /></label>
          <label><span>Descricao</span><input name="description" required /></label>
          <JournalLinesEditor
            label="Linhas contabilísticas"
            lines={createLines}
            accounts={references.accounts}
            onChange={setCreateLines}
          />
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
      </form>
      <form className="operation" onSubmit={update}>
        <h3>Editar lançamento</h3>
        <p>
          {activeJournalId
            ? "A edição será aplicada ao lançamento atualmente carregado."
            : "Cria ou consulta primeiro um lançamento."}
        </p>
        <div className="fields">
          <label><span>Data</span><input name="entryDate" type="date" required defaultValue={toLocalDateInputValue()} /></label>
          <label><span>Descricao</span><input name="description" required /></label>
          <JournalLinesEditor
            label="Linhas contabilísticas"
            lines={editLines}
            accounts={references.accounts}
            onChange={setEditLines}
          />
          <label>
            <span>Motivo da revisão</span>
            <textarea
              name="reason"
              required
              minLength={5}
              maxLength={500}
              rows={3}
              placeholder="Explica a alteração para o histórico de auditoria"
            />
          </label>
        </div>
        <button type="submit" disabled={action.busy || !activeJournalId}>Atualizar</button>
      </form>
      <form className="operation" onSubmit={addAttachment}>
        <h3>Registar anexo</h3>
        <p>
          {activeJournalId
            ? "O anexo será associado ao lançamento atualmente carregado."
            : "Cria ou consulta primeiro um lançamento."}
        </p>
        <div className="fields">
          <label>
            <span>Ficheiro privado</span>
            <input name="file" type="file" accept="application/pdf,image/png,image/jpeg" required />
          </label>
        </div>
        <button type="submit" disabled={action.busy || !activeJournalId}>Registar anexo</button>
      </form>
      {attachments.length > 0 ? (
        <section className="operation" aria-labelledby="manual-journal-attachments">
          <h3 id="manual-journal-attachments">Anexos disponíveis</h3>
          <ul>
            {attachments.map((attachment) => (
              <li key={attachment.id}>
                <span>
                  {attachment.fileName}
                  {attachment.sizeBytes ? ` (${attachment.sizeBytes} bytes)` : ""}
                </span>{" "}
                <button
                  type="button"
                  disabled={action.busy}
                  onClick={() => void downloadAttachment(attachment.id)}
                >
                  Descarregar
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <form className="operation" onSubmit={get}>
        <h3>Consultar lançamento</h3>
        <div className="fields">
          <ReferenceSelect
            name="id"
            label="Lançamento manual"
            options={journalOptions}
            required
          />
        </div>
        <button type="submit" disabled={action.busy}>Consultar</button>
      </form>
      <StructuredResult value={result} title="Detalhes do lançamento" />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Accounting Reports e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para balancete e razão.
 */
export function AccountingReportsPage() {
  const action = useAction();
  const [rows, setRows] = useState<ApiObject[]>([]);
  const [pageInfo, setPageInfo] = useState<CursorPageInfo>(EMPTY_PAGE_INFO);
  const [kind, setKind] = useState("trial");
  const [activeQuery, setActiveQuery] = useState<{
    kind: "trial" | "ledger";
    from: string;
    to: string;
    accountId?: string;
  } | null>(null);
  const references = useMf2References({ accounts: true });
  const [exports, setExports] = useState<{
    trial?: Record<AccountingExportFormat, string>;
    ledger?: Record<AccountingExportFormat, string>;
  }>({});

  async function requestReport(
    query: NonNullable<typeof activeQuery>,
    pagination: CursorPagination,
  ) {
    return query.kind === "ledger"
      ? apiClient.accountingReports.ledger(
          requiredText(query.accountId ?? "", "Conta"),
          query.from,
          query.to,
          pagination,
        )
      : apiClient.accountingReports.trialBalance(
          query.from,
          query.to,
          pagination,
        );
  }

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await action.run(
      async () => {
        assertMf5FormData(form, [
          { name: "from", required: true },
          { name: "to", required: true },
        ]);
        const selectedKind = requiredText(form.get("kind"), "Relatorio") as
          | "trial"
          | "ledger";
        const from = requiredText(form.get("from"), "Data inicial");
        const to = requiredText(form.get("to"), "Data final");
        const accountId = optionalText(form.get("accountId"));
        const trialExports = Object.fromEntries(
          ACCOUNTING_EXPORT_FORMATS.map((format) => [
            format,
            apiClient.accountingReports.trialBalanceExportUrl(from, to, format),
          ]),
        ) as Record<AccountingExportFormat, string>;
        const ledgerExports = accountId
          ? Object.fromEntries(
              ACCOUNTING_EXPORT_FORMATS.map((format) => [
                format,
                apiClient.accountingReports.ledgerExportUrl(
                  accountId,
                  from,
                  to,
                  format,
                ),
              ]),
            ) as Record<AccountingExportFormat, string>
          : undefined;
        const query = { kind: selectedKind, from, to, accountId };
        const nextResponse = await requestReport(query, { limit: 50 });
        setActiveQuery(query);
        setExports({ trial: trialExports, ledger: ledgerExports });
        return nextResponse;
      },
      "Relatório calculado.",
    );
    if (response) {
      const page = normalizeCursorPage(response, "items", asObject);
      setRows(page.items.length > 0 ? page.items : accountingReportRows(response));
      setPageInfo(page.pageInfo);
    }
  }

  async function loadMoreReport() {
    const cursor = pageInfo.nextCursor;
    if (!activeQuery || !pageInfo.hasNextPage || !cursor || action.busy) return;
    const response = await action.run(
      () => requestReport(activeQuery, { cursor, limit: 50 }),
      "Página seguinte carregada.",
    );
    if (!response) return;
    const page = normalizeCursorPage(response, "items", asObject);
    setRows((current) => [...current, ...page.items]);
    setPageInfo(page.pageInfo);
  }

  return (
    <PageFrame title="Balancete e razão">
      <Feedback busy={action.busy} error={action.error} message={action.message} />
      {references.error ? (
        <StatusMessage tone="danger" title="Contas indisponíveis">{references.error}</StatusMessage>
      ) : null}
      <form className="operation" onSubmit={submit}>
        <div className="fields">
          <label>
            <span>Relatorio</span>
            <select
              name="kind"
              required
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              <option value="trial">Balancete</option>
              <option value="ledger">Razao</option>
            </select>
          </label>
          <label><span>Data inicial</span><input name="from" type="date" required defaultValue={toLocalDateInputValue()} /></label>
          <label><span>Data final</span><input name="to" type="date" required defaultValue={toLocalDateInputValue()} /></label>
          <ReferenceSelect
            name="accountId"
            label="Conta para razão"
            options={references.accounts}
            required={kind === "ledger"}
          />
        </div>
        <button type="submit" disabled={action.busy}>Calcular</button>
      </form>
      {exports.trial || exports.ledger ? (
        <div className="operation">
          <h3>Exportações</h3>
          <p>
            {exports.trial
              ? ACCOUNTING_EXPORT_FORMATS.map((format) => (
                  <a key={format} href={exports.trial?.[format]}>
                    Balancete {format.toUpperCase()}
                  </a>
                ))
              : null}
          </p>
          <p>
            {exports.ledger
              ? ACCOUNTING_EXPORT_FORMATS.map((format) => (
                  <a key={format} href={exports.ledger?.[format]}>
                    Razão {format.toUpperCase()}
                  </a>
                ))
              : "Indica uma conta para exportar a razão."}
          </p>
        </div>
      ) : null}
      <DataTable
        rows={rows}
        columns={ACCOUNTING_REPORT_COLUMNS}
        pagination={{ pageInfo, busy: action.busy, loadMore: loadMoreReport }}
      />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã de demonstrações financeiras e chama os endpoints de balanço ou resultados.
 *
 * @returns Elemento React renderizado para demonstrações financeiras.
 */
export function FinancialStatementsPage() {
  const action = useAction();
  const [result, setResult] = useState<unknown>(null);

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await action.run(
      () => {
        assertMf5FormData(form, [
          { name: "from", required: true },
          { name: "to", required: true },
        ]);
        const kind = requiredText(form.get("kind"), "Mapa");
        const from = requiredText(form.get("from"), "Data inicial");
        const to = requiredText(form.get("to"), "Data final");
        return kind === "balance"
          ? apiClient.financialStatements.balanceSheet(from, to)
          : apiClient.financialStatements.incomeStatement(from, to);
      },
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
          <label><span>Data inicial</span><input name="from" type="date" required defaultValue={toLocalDateInputValue()} /></label>
          <label><span>Data final</span><input name="to" type="date" required defaultValue={toLocalDateInputValue()} /></label>
        </div>
        <button type="submit" disabled={action.busy}>Calcular</button>
      </form>
      <StructuredResult value={result} title="Mapa financeiro" />
    </PageFrame>
  );
}
