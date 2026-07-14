/**
 * @file Páginas React dos fluxos MF1 de IVA, vendas, compras, recebimentos, pagamentos e aprovações.
 */

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { PermissionGate } from "../auth/PermissionGate";
import { Permission } from "../auth/permissions";
import {
  apiClient,
  JsonBody,
  type PaymentInput,
  type ReceiptInput,
} from "../lib/apiClient";
import { accountingApi } from "../lib/accountingApi";
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
import { assertMf5FormData, assertMf5FormValues } from "../lib/mf5FormValidators";
import {
  ApiObject,
  asObject,
  formatValue,
  optionalText,
  pickArray,
  requiredText,
  toNonNegativeInteger,
  toPositiveInteger,
} from "../lib/mf1FormUtils";
import { paymentApi } from "../lib/paymentApi";
import { purchaseApprovalApi } from "../lib/purchaseApprovalApi";
import { purchasesApi } from "../lib/purchasesApi";
import { receiptApi } from "../lib/receiptApi";
import { salesApi } from "../lib/salesApi";
import { salesOpenItemsApi } from "../lib/salesOpenItemsApi";
import { vatRateApi } from "../lib/vatRateApi";
import { PageFrame, StatusMessage, StructuredResult } from "../ui/opsaUi";
import { CursorPaginationButton } from "../ui/CursorPaginationButton";
import { ConfirmationDialog, ConfirmableActionButton, ModalSurface } from "../ui/modal";
import {
  ResponsiveDataTable,
  type ResourceColumn,
  type TableRow,
} from "../ui/ResponsiveDataTable";
import {
  formatDocumentTypeLabel,
  formatEuroFromCents,
  formatPortugueseDate,
  formatStatusLabel,
} from "../lib/formatters";
import { useAiTransactionContext } from "../ai/AiPageContext";

type Method = "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER";
type SaleDocumentKind = "INVOICE" | "INVOICE_RECEIPT" | "CREDIT_NOTE";
type PurchaseDocumentKind = "SUPPLIER_INVOICE" | "SUPPLIER_CREDIT_NOTE";

interface ListState {
  rows: ApiObject[];
  busy: boolean;
  error: string | null;
  pageInfo: CursorPageInfo;
}

interface ReferenceOption {
  value: string;
  label: string;
  type?: string;
}

interface TreasuryAccountOption {
  id: string;
  label: string;
}

/**
 * Carrega apenas contas de tesouraria ativas da empresa selecionada.
 *
 * @returns Opções de conta e estado do carregamento para os movimentos financeiros.
 */
function useTreasuryAccountOptions() {
  const [accounts, setAccounts] = useState<TreasuryAccountOption[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void apiClient.treasury.listAccounts()
      .then((response) => {
        if (!active) return;
        const rows = pickArray(response, "accounts");
        setAccounts(rows.flatMap((row) => {
          const account = asObject(row);
          if (typeof account.id !== "string") return [];
          const name = typeof account.name === "string" ? account.name : "Conta";
          return [{ id: account.id, label: name }];
        }));
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar as contas de tesouraria.");
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { accounts, busy, error };
}

function toReferenceOptions(rows: ApiObject[]): ReferenceOption[] {
  return rows.flatMap((row) => {
    if (typeof row.id !== "string") return [];
    const code = [row.sku, row.code]
      .find((value): value is string => typeof value === "string" && value.length > 0);
    const name = [row.name, row.description, row.nif]
      .find((value): value is string => typeof value === "string" && value.length > 0);
    const label = code && name ? `${code} — ${name}` : code ?? name ?? "Registo sem designação";
    return [{
      value: row.id,
      label,
      type: typeof row.type === "string" ? row.type : undefined,
    }];
  });
}

function ReferenceSelect({
  name,
  label,
  options,
  required = true,
  value,
  defaultValue = "",
  onChange,
}: {
  name: string;
  label: string;
  options: ReferenceOption[];
  required?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <select
        key={`${name}-${defaultValue}-${options.length}`}
        name={name}
        required={required}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      >
        <option value="">Selecionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

/**
 * Carrega referências de negócio usadas na criação de documentos sem pedir UUIDs.
 *
 * @param party - Tipo de entidade comercial necessária ao documento.
 * @returns Clientes/fornecedores, artigos, taxas de IVA e erro de carregamento.
 */
function useDocumentReferences(party: "customers" | "suppliers", enabled: boolean) {
  const [parties, setParties] = useState<ReferenceOption[]>([]);
  const [items, setItems] = useState<ReferenceOption[]>([]);
  const [vatRates, setVatRates] = useState<ReferenceOption[]>([]);
  const [warehouses, setWarehouses] = useState<ReferenceOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setParties([]);
      setItems([]);
      setVatRates([]);
      setWarehouses([]);
      setError(null);
      return () => {
        active = false;
      };
    }
    const partyRequest = collectCursorPages((pagination) =>
      party === "customers"
        ? apiClient.customers.list(undefined, pagination)
        : apiClient.suppliers.list(undefined, pagination));
    const itemRequest = collectCursorPages((pagination) =>
      apiClient.items.list(pagination));
    void Promise.all([
      partyRequest,
      itemRequest,
      vatRateApi.list(),
      apiClient.warehouses.list(),
    ])
      .then(([partyResponse, itemResponse, vatResponse, warehouseResponse]) => {
        if (!active) return;
        setParties(toReferenceOptions(partyResponse.map(asObject)));
        setItems(toReferenceOptions(itemResponse.map(asObject)));
        setVatRates(toReferenceOptions(pickArray(vatResponse, "vatRates")));
        setWarehouses(toReferenceOptions(
          pickArray(warehouseResponse, "warehouses")
            .filter((warehouse) => warehouse.isActive !== false),
        ));
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar contraparte, artigos, IVA ou armazéns.");
      });
    return () => {
      active = false;
    };
  }, [enabled, party]);

  return { parties, items, vatRates, warehouses, error };
}

/**
 * Converte erros da API ou erros nativos numa mensagem curta para apresentar ao utilizador.
 *
 * @param error - Erro capturado durante a operação.
 * @returns Mensagem de erro pronta a apresentar ao utilizador.
 */
function formatError(error: unknown): string {
  // MF1 usa o tradutor comum para nao voltar a mostrar apenas "CODE: mensagem".
  return formatUiError(error);
}

/**
 * Devolve a data corrente no formato ISO curto usado pelos inputs de data.
 *
 * @returns Data corrente em formato ISO curto.
 */
/**
 * Renderiza uma tabela simples a partir das chaves presentes nas linhas devolvidas pela API.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com a tabela de dados.
 */
function DataTable({
  rows,
  columns,
  actions,
  pagination,
}: {
  rows: ApiObject[];
  columns: Array<{ key: string; label: string }>;
  actions?: (row: ApiObject) => ReactNode;
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
            {actions ? <th>Ações</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => (
                <td key={column.key}>{formatValue(row[column.key], column.key)}</td>
              ))}
              {actions ? <td>{actions(row)}</td> : null}
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

const VAT_COLUMNS = [
  { key: "code", label: "Código" },
  { key: "description", label: "Descrição" },
  { key: "rateBps", label: "Taxa" },
  { key: "type", label: "Tipo" },
  { key: "isActive", label: "Ativa" },
];
const SALE_DOCUMENT_COLUMNS = [
  { key: "number", label: "Número" },
  { key: "kind", label: "Tipo" },
  { key: "status", label: "Estado" },
  { key: "issuedAt", label: "Data" },
  { key: "dueDate", label: "Vencimento" },
  { key: "totalCents", label: "Total" },
];
const RECEIPT_COLUMNS = [
  { key: "documentNumber", label: "Documento" },
  { key: "amountCents", label: "Valor" },
  { key: "receivedAt", label: "Data" },
  { key: "method", label: "Método" },
  { key: "reference", label: "Referência" },
];
const OPEN_ITEM_COLUMNS = [
  { key: "number", label: "Documento" },
  { key: "customerName", label: "Cliente" },
  { key: "dueDate", label: "Vencimento" },
  { key: "openCents", label: "Valor em aberto" },
  { key: "agingBucket", label: "Antiguidade" },
];
const PURCHASE_DOCUMENT_COLUMNS = [
  { key: "supplierNumber", label: "Número do fornecedor" },
  { key: "kind", label: "Tipo" },
  { key: "status", label: "Estado" },
  { key: "issuedAt", label: "Data" },
  { key: "dueDate", label: "Vencimento" },
  { key: "totalCents", label: "Total" },
];
const PAYMENT_COLUMNS = [
  { key: "supplierNumber", label: "Documento" },
  { key: "amountCents", label: "Valor" },
  { key: "paidAt", label: "Data" },
  { key: "method", label: "Método" },
  { key: "reference", label: "Referência" },
];

const DOCUMENT_COLUMNS: ResourceColumn[] = [
  { key: "displayNumber", label: "Documento", priority: "primary" },
  { key: "counterparty", label: "Contraparte", priority: "secondary" },
  {
    key: "kind",
    label: "Tipo",
    priority: "desktop",
    format: (value) => typeof value === "string" ? formatDocumentTypeLabel(value) : "-",
  },
  {
    key: "issuedAt",
    label: "Data",
    priority: "secondary",
    format: (value) => {
      if (typeof value !== "string" || value.length === 0) return "-";
      try {
        return formatPortugueseDate(value);
      } catch {
        return "-";
      }
    },
  },
  {
    key: "totalCents",
    label: "Total",
    priority: "secondary",
    format: (value) => typeof value === "number" ? formatEuroFromCents(value) : "-",
  },
  {
    key: "status",
    label: "Estado comercial",
    priority: "secondary",
    format: (value) => typeof value === "string" ? formatStatusLabel(value) : "-",
  },
  {
    key: "postingStatus",
    label: "Contabilidade",
    priority: "desktop",
  },
  { key: "warehouseName", label: "Armazém", priority: "desktop" },
];

function documentRows(rows: ApiObject[], type: "SALE" | "PURCHASE"): TableRow[] {
  return rows.map((row, index) => {
    const counterparty = asObject(type === "SALE" ? row.customer : row.supplier);
    const warehouse = asObject(row.warehouse);
    return {
      id: typeof row.id === "string" ? row.id : `${type}-${index}`,
      displayNumber: String(
        (type === "SALE" ? row.number : row.supplierNumber) ??
        (type === "SALE" ? "Rascunho de venda" : "Rascunho de compra"),
      ),
      counterparty: typeof counterparty.name === "string"
        ? counterparty.name
        : type === "SALE" ? "Cliente" : "Fornecedor",
      kind: typeof row.kind === "string" ? row.kind : "",
      issuedAt: typeof row.issuedAt === "string" ? row.issuedAt : "",
      totalCents: typeof row.totalCents === "number" ? row.totalCents : 0,
      status: typeof row.status === "string" ? row.status : "",
      postingStatus: row.postedAt ? "Contabilizada" : "Por contabilizar",
      warehouseName: typeof warehouse.name === "string"
        ? `${typeof warehouse.code === "string" ? `${warehouse.code} — ` : ""}${warehouse.name}`
        : "Sem armazém (serviços)",
    };
  });
}

function openTransactionAssistant(
  setTransaction: (transaction: {
    documentType: "SALE" | "PURCHASE";
    documentId: string;
    label: string;
  }) => void,
  transaction: {
    documentType: "SALE" | "PURCHASE";
    documentId: string;
    label: string;
  },
) {
  setTransaction(transaction);
  globalThis.requestAnimationFrame(() => {
    document.querySelector<HTMLButtonElement>(".aiLauncher")?.click();
  });
}

/**
 * Renderiza uma lista de documentos usando número de negócio quando existe e ID como fallback.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com uma lista de documentos.
 */
function DocumentSelect({
  name,
  label,
  documents,
  value,
  onChange,
}: {
  name: string;
  label: string;
  documents: ApiObject[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <select
        name={name}
        required
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      >
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

/**
 * Apresenta as contas ativas sem pedir ao utilizador que copie identificadores.
 *
 * @param props - Contas disponíveis para o movimento financeiro.
 * @returns Seletor obrigatório de conta de tesouraria.
 */
function TreasuryAccountSelect({ accounts }: { accounts: TreasuryAccountOption[] }) {
  return (
    <label>
      <span>Conta de tesouraria</span>
      <select name="treasuryAccountId" required defaultValue="" disabled={accounts.length === 0}>
        <option value="">Selecionar conta</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>{account.label}</option>
        ))}
      </select>
    </label>
  );
}

/**
 * Renderiza as opções normalizadas de método de pagamento ou recebimento.
 *
 * @returns Elemento React renderizado com métodos de pagamento ou recebimento.
 */
function MethodSelect() {
  return (
    <label>
      <span>Método</span>
      <select name="method" required defaultValue="BANK_TRANSFER">
        <option value="CASH">Numerário</option>
        <option value="BANK_TRANSFER">Transferência</option>
        <option value="CARD">Cartão</option>
        <option value="OTHER">Outro</option>
      </select>
    </label>
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
    } catch (error) {
      setState({
        rows: [],
        pageInfo: EMPTY_PAGE_INFO,
        busy: false,
        error: formatError(error),
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
    } catch (error) {
      setState((current) => ({
        ...current,
        busy: false,
        error: formatError(error),
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
function useAction(reload: () => Promise<void>) {
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
      await reload();
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
 * Constrói o payload de documento de venda com uma linha normalizada para a API.
 *
 * @param form - Dados submetidos pelo formulário.
 * @returns Payload normalizado de documento de venda.
 */
function parseSaleDocument(form: FormData): JsonBody {
  assertMf5FormData(form, [
    { name: "issuedAt", required: true },
    "dueDate",
    { name: "vatRateId", required: true },
  ]);

  return {
    kind: requiredText(form.get("kind"), "Tipo") as SaleDocumentKind,
    customerId: requiredText(form.get("customerId"), "Cliente"),
    warehouseId: optionalText(form.get("warehouseId")),
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

/**
 * Constrói o payload de documento de compra com uma linha normalizada para a API.
 *
 * @param form - Dados submetidos pelo formulário.
 * @returns Payload normalizado de documento de compra.
 */
function parsePurchaseDocument(form: FormData): JsonBody {
  assertMf5FormData(form, [
    { name: "issuedAt", required: true },
    "dueDate",
    { name: "vatRateId", required: true },
  ]);

  return {
    kind: requiredText(form.get("kind"), "Tipo") as PurchaseDocumentKind,
    supplierId: requiredText(form.get("supplierId"), "Fornecedor"),
    warehouseId: optionalText(form.get("warehouseId")),
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

/**
 * Constrói o payload comum de recebimentos e pagamentos a partir de campos do formulário.
 *
 * @param form - Dados submetidos pelo formulário.
 * @param dateField - Nome do campo de data a preencher no payload.
 * @returns Payload normalizado de recebimento ou pagamento.
 */
function parseMoneyMovement(form: FormData, dateField: "receivedAt"): ReceiptInput;
function parseMoneyMovement(form: FormData, dateField: "paidAt"): PaymentInput;
function parseMoneyMovement(
  form: FormData,
  dateField: "receivedAt" | "paidAt",
): ReceiptInput | PaymentInput {
  assertMf5FormData(form, [{ name: dateField, required: true }]);

  const common = {
    treasuryAccountId: requiredText(form.get("treasuryAccountId"), "Conta de tesouraria"),
    amountCents: toPositiveInteger(form.get("amountCents"), "Valor"),
    method: requiredText(form.get("method"), "Metodo") as Method,
    reference: optionalText(form.get("reference")),
    notes: optionalText(form.get("notes")),
  };
  const movementDate = requiredText(form.get(dateField), "Data");
  return dateField === "receivedAt"
    ? { ...common, receivedAt: movementDate }
    : { ...common, paidAt: movementDate };
}

/**
 * Renderiza os campos comuns de uma linha de documento de venda ou compra.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com campos de linha de documento.
 */
function DocumentLineFields({
  cost,
  items,
  vatRates,
  selectedItemId,
  onItemChange,
}: {
  cost?: boolean;
  items: ReferenceOption[];
  vatRates: ReferenceOption[];
  selectedItemId?: string;
  onItemChange?: (value: string) => void;
}) {
  return (
    <fieldset className="lineFields">
      <legend>Linha do documento</legend>
      <ReferenceSelect
        name="itemId"
        label="Artigo"
        options={items}
        value={selectedItemId}
        onChange={onItemChange}
      />
      <ReferenceSelect name="vatRateId" label="Taxa de IVA" options={vatRates} />
      <label>
        <span>Descrição</span>
        <input name="description" />
      </label>
      <label>
        <span>Quantidade</span>
        <input name="quantity" type="number" min="1" required defaultValue="1" />
      </label>
      <label>
        <span>{cost ? "Custo em cêntimos" : "Preço em cêntimos"}</span>
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

/**
 * Renderiza o ecrã Vat Rates e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para taxas de IVA.
 */
export function VatRatesPage() {
  const list = useApiList(async () =>
    normalizeCursorPage(await vatRateApi.list(), "vatRates", asObject),
  );
  const action = useAction(list.reload);

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const result = await action.run(
      () => {
        assertMf5FormData(form, [{ name: "rateBps", required: true }]);
        return vatRateApi.create({
          code: requiredText(form.get("code"), "Codigo"),
          description: requiredText(form.get("description"), "Descricao"),
          rateBps: toNonNegativeInteger(form.get("rateBps"), "Taxa"),
          type: requiredText(form.get("type"), "Tipo"),
          exemptionReason: optionalText(form.get("exemptionReason")),
        });
      },
      "Taxa de IVA criada.",
    );
    if (result) formElement.reset();
  }

  return (
    <PageFrame title="Tabelas de IVA">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        columns={VAT_COLUMNS}
        pagination={list}
        actions={(row) => (
          <PermissionGate permission={Permission.VAT_RATES_WRITE}>
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
          </PermissionGate>
        )}
      />
      <PermissionGate permission={Permission.VAT_RATES_WRITE}>
        <form className="operation" onSubmit={submit}>
        <h3>Criar taxa de IVA</h3>
        <div className="fields">
          <label>
            <span>Código</span>
            <input name="code" required />
          </label>
          <label>
            <span>Descrição</span>
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
            <span>Motivo de isenção</span>
            <input name="exemptionReason" />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
        </form>
      </PermissionGate>
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Sale Documents e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para documentos de venda.
 */
export function SaleDocumentsPage() {
  const list = useApiList(async (pagination) =>
    normalizeCursorPage(
      await salesApi.listDocuments(pagination),
      "saleDocuments",
      asObject,
    ),
  );
  const action = useAction(list.reload);
  const [issuedAt, setIssuedAt] = useState(toLocalDateInputValue());
  const [creating, setCreating] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const auth = useAuth();
  const { setTransaction, clearTransaction } = useAiTransactionContext();
  const references = useDocumentReferences(
    "customers",
    auth.hasPermission(Permission.SALES_WRITE),
  );
  const requiresWarehouse = references.items
    .find(({ value }) => value === selectedItemId)?.type === "PRODUCT";

  useEffect(() => clearTransaction, [clearTransaction]);

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const result = await action.run(
      () => salesApi.createDocument(parseSaleDocument(form)),
      "Documento de venda criado.",
    );
    if (result) {
      formElement.reset();
      setSelectedItemId("");
      setCreating(false);
    }
  }

  function rowActions(row: TableRow) {
    const document = list.rows.find(({ id }) => id === row.id);
    if (!document || typeof document.id !== "string") return null;
    const status = String(document.status ?? "");
    const label = String(document.number ?? "Rascunho de venda");
    return (
      <div className="inlineActions">
        {auth.hasPermission(Permission.AI_CHAT_USE) ? (
          <button
            type="button"
            onClick={() => openTransactionAssistant(setTransaction, {
              documentType: "SALE",
              documentId: document.id as string,
              label,
            })}
          >
            Analisar com IA
          </button>
        ) : null}
        {status === "DRAFT" && auth.hasPermission(Permission.SALES_WRITE) ? (
          <button
            type="button"
            disabled={action.busy}
            onClick={() => void action.run(
              () => salesApi.submitDocument(document.id as string),
              "Venda submetida.",
            )}
          >
            Submeter
          </button>
        ) : null}
        {status === "SUBMITTED" && auth.hasPermission(Permission.SALES_APPROVE) ? (
          <ConfirmableActionButton
            label="Aprovar"
            description="Confirma que o documento foi revisto e pode avançar."
            entityLabel={label}
            busy={action.busy}
            onConfirm={() => action.run(
              () => salesApi.approveDocument(document.id as string),
              "Venda aprovada.",
            )}
          />
        ) : null}
        {status === "APPROVED" && auth.hasPermission(Permission.SALES_WRITE) ? (
          <ConfirmableActionButton
            label="Emitir"
            description="A emissão atribui a numeração comercial definitiva."
            entityLabel={label}
            busy={action.busy}
            onConfirm={() => action.run(
              () => salesApi.issueDocument(document.id as string),
              "Venda emitida.",
            )}
          />
        ) : null}
        {status === "ISSUED" && !document.postedAt && auth.hasPermission(Permission.ACCOUNTING_WRITE) ? (
          <ConfirmableActionButton
            label="Contabilizar"
            description="Cria o journal e o efeito de stock na mesma operação."
            entityLabel={label}
            busy={action.busy}
            requireAcknowledgement
            onConfirm={() => action.run(
              () => accountingApi.postSaleDocument(document.id as string),
              "Venda contabilizada e stock atualizado.",
            )}
          />
        ) : null}
      </div>
    );
  }

  return (
    <PageFrame
      title="Documentos de venda"
      description="Cria, aprova, emite e contabiliza uma venda seguindo apenas as ações válidas para o estado atual."
      actions={auth.hasPermission(Permission.SALES_WRITE) ? (
        <button type="button" onClick={() => setCreating(true)}>Nova venda</button>
      ) : undefined}
    >
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      {references.error ? (
        <StatusMessage tone="danger" title="Opções indisponíveis">{references.error}</StatusMessage>
      ) : null}
      <ResponsiveDataTable
        rows={documentRows(list.rows, "SALE")}
        columns={DOCUMENT_COLUMNS}
        caption="Documentos de venda"
        renderMobileTitle={(row) => String(row.displayNumber)}
        renderRowActions={rowActions}
        emptyState={(
          <StatusMessage tone="neutral" title="Ainda não existem vendas">
            Cria a primeira venda quando já tiveres um cliente e um artigo ou serviço.
          </StatusMessage>
        )}
      />
      <CursorPaginationButton
        hasNextPage={list.pageInfo.hasNextPage}
        busy={list.busy}
        label="documentos de venda"
        onLoadMore={list.loadMore}
      />
      <ModalSurface open={creating} title="Nova venda" onClose={() => setCreating(false)}>
        <form className="operation" onSubmit={submit}>
        <h3>Dados do documento</h3>
        <div className="fields">
          <label>
            <span>Tipo</span>
            <select name="kind" required defaultValue="INVOICE">
              <option value="INVOICE">Fatura</option>
              <option value="INVOICE_RECEIPT">Fatura-recibo</option>
              <option value="CREDIT_NOTE">Nota de credito</option>
            </select>
          </label>
          <ReferenceSelect name="customerId" label="Cliente" options={references.parties} />
          <ReferenceSelect
            name="warehouseId"
            label={requiresWarehouse ? "Armazém (obrigatório para produto)" : "Armazém (opcional para serviço)"}
            options={references.warehouses}
            required={requiresWarehouse}
            defaultValue={references.warehouses.length === 1 ? references.warehouses[0].value : ""}
          />
          <label>
            <span>Data</span>
            <input
              name="issuedAt"
              type="date"
              required
              value={issuedAt}
              onChange={(event) => setIssuedAt(event.target.value)}
            />
          </label>
          <label>
            <span>Vencimento</span>
            <input name="dueDate" type="date" min={issuedAt || undefined} />
          </label>
          <DocumentLineFields
            items={references.items}
            vatRates={references.vatRates}
            selectedItemId={selectedItemId}
            onItemChange={setSelectedItemId}
          />
        </div>
        <button type="submit" disabled={action.busy || references.items.length === 0}>Criar rascunho</button>
        </form>
      </ModalSurface>
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Receipts e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para recebimentos.
 */
export function ReceiptsPage() {
  const list = useApiList(async (pagination) =>
    normalizeCursorPage(
      await salesApi.listDocuments(pagination),
      "saleDocuments",
      asObject,
    ),
  );
  const action = useAction(list.reload);
  const treasury = useTreasuryAccountOptions();
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const selectedDocument = list.rows.find((row) => row.id === selectedDocumentId);
  const minimumDate = typeof selectedDocument?.issuedAt === "string"
    ? selectedDocument.issuedAt.slice(0, 10)
    : undefined;

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const result = await action.run(
      () =>
        receiptApi.register(
          requiredText(form.get("id"), "Documento"),
          parseMoneyMovement(form, "receivedAt"),
        ),
      "Recebimento registado.",
    );
    if (result) {
      formElement.reset();
      setSelectedDocumentId("");
    }
  }

  return (
    <PageFrame title="Recebimentos">
      <Feedback
        busy={list.busy || action.busy || treasury.busy}
        error={list.error ?? action.error ?? treasury.error}
        message={action.message}
      />
      {!treasury.busy && !treasury.error && treasury.accounts.length === 0 ? (
        <StatusMessage tone="neutral" title="Sem contas de tesouraria">
          Cria primeiro uma conta bancária ou de caixa para registar recebimentos.
        </StatusMessage>
      ) : null}
      <DataTable rows={list.rows} columns={RECEIPT_COLUMNS} pagination={list} />
      <PermissionGate permission={Permission.SALES_WRITE}>
        <form className="operation" onSubmit={submit}>
        <h3>Registar recebimento</h3>
        <div className="fields">
          <DocumentSelect
            name="id"
            label="Documento de venda"
            documents={list.rows}
            value={selectedDocumentId}
            onChange={setSelectedDocumentId}
          />
          <TreasuryAccountSelect accounts={treasury.accounts} />
          <label>
            <span>Valor em cêntimos</span>
            <input name="amountCents" type="number" min="1" required />
          </label>
          <label>
            <span>Data</span>
            <input
              name="receivedAt"
              type="date"
              required
              min={minimumDate}
              defaultValue={toLocalDateInputValue()}
            />
          </label>
          <MethodSelect />
          <label>
            <span>Referência</span>
            <input name="reference" />
          </label>
          <label>
            <span>Notas</span>
            <input name="notes" />
          </label>
        </div>
        <button type="submit" disabled={action.busy || treasury.busy || treasury.accounts.length === 0}>Registar</button>
        </form>
      </PermissionGate>
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Sale Postings e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para lançamentos de vendas.
 */
export function SalePostingsPage() {
  const list = useApiList(async (pagination) =>
    normalizeCursorPage(
      await salesApi.listDocuments(pagination),
      "saleDocuments",
      asObject,
    ),
  );
  const action = useAction(list.reload);

  return (
    <PageFrame title="Lançamentos de vendas">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        columns={SALE_DOCUMENT_COLUMNS}
        pagination={list}
        actions={(row) => row.status === "ISSUED" && !row.postedAt ? (
          <ConfirmableActionButton
            label="Contabilizar"
            description="Esta operação cria o lançamento contabilístico da venda e não deve ser repetida por engano."
            entityLabel={String(row.number ?? row.id)}
            busy={action.busy}
            requireAcknowledgement
            onConfirm={() => action.run(
              () => accountingApi.postSaleDocument(String(row.id)),
              "Venda contabilizada.",
            )}
          />
        ) : <span>{row.postedAt ? "Já contabilizada" : "Ainda não elegível"}</span>}
      />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Sales Open Items e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para títulos em aberto.
 */
export function SalesOpenItemsPage() {
  const [asOfDate, setAsOfDate] = useState(toLocalDateInputValue());
  const [appliedAsOfDate, setAppliedAsOfDate] = useState(asOfDate);
  const [rows, setRows] = useState<ApiObject[]>([]);
  const [pageInfo, setPageInfo] = useState<CursorPageInfo>(EMPTY_PAGE_INFO);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega dados da API para atualizar o estado visível do ecrã.
   *
   * @returns Promise resolvida depois de atualizar os dados visíveis.
   */
  async function load(append = false, requestedAsOfDate = appliedAsOfDate) {
    const cursor = append ? pageInfo.nextCursor ?? undefined : undefined;
    if (append && !cursor) return;
    const queryAsOfDate = append ? appliedAsOfDate : requestedAsOfDate;
    setBusy(true);
    setError(null);
    try {
      assertMf5FormValues(
        { asOfDate: queryAsOfDate },
        [{ name: "asOfDate", required: true }],
      );
      const page = normalizeCursorPage(
        await salesOpenItemsApi.list(queryAsOfDate, { cursor, limit: 50 }),
        "openItems",
        asObject,
      );
      setRows((current) => append ? [...current, ...page.items] : page.items);
      setPageInfo(page.pageInfo);
      if (!append) setAppliedAsOfDate(queryAsOfDate);
    } catch (caught) {
      setError(formatError(caught));
      if (!append) {
        setRows([]);
        setPageInfo(EMPTY_PAGE_INFO);
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load(false, asOfDate);
  }, []);

  return (
    <PageFrame title="Títulos em aberto">
      <Feedback busy={busy} error={error} />
      <form
        className="search"
        onSubmit={(event) => {
          event.preventDefault();
          void load(false, asOfDate);
        }}
      >
        <label>
          <span>Data de referência</span>
          <input
            type="date"
            value={asOfDate}
            onChange={(event) => setAsOfDate(event.target.value)}
          />
        </label>
        <button type="submit" disabled={busy}>Atualizar</button>
      </form>
      <DataTable
        rows={rows}
        columns={OPEN_ITEM_COLUMNS}
        pagination={{ pageInfo, busy, loadMore: () => load(true) }}
      />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Sale Approval e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para aprovação de vendas.
 */
export function SaleApprovalPage() {
  const list = useApiList(async (pagination) =>
    normalizeCursorPage(
      await salesApi.listDocuments(pagination),
      "saleDocuments",
      asObject,
    ),
  );
  const action = useAction(list.reload);
  const auth = useAuth();
  const [pendingRejection, setPendingRejection] = useState<{ id: string; reason: string } | null>(null);

  /**
   * Processa a rejeição do documento indicado no formulário com o motivo obrigatório.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de rejeitar o documento indicado.
   */
  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPendingRejection({
      id: requiredText(form.get("id"), "Documento"),
      reason: requiredText(form.get("reason"), "Motivo"),
    });
  }

  return (
    <PageFrame title="Aprovação de vendas">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        columns={SALE_DOCUMENT_COLUMNS}
        pagination={list}
        actions={(row) => (
          <div className="inlineActions">
            {row.status === "DRAFT" ? (
              <button type="button" onClick={() => void action.run(() => salesApi.submitDocument(String(row.id)), "Venda submetida.")}>Submeter</button>
            ) : null}
            {row.status === "SUBMITTED" ? <ConfirmableActionButton
              label="Aprovar"
              description="Confirma que o documento foi revisto e pode avançar no workflow."
              entityLabel={String(row.number ?? row.id)}
              busy={action.busy}
              onConfirm={() => action.run(() => salesApi.approveDocument(String(row.id)), "Venda aprovada.")}
            /> : null}
            {row.status === "APPROVED" ? <ConfirmableActionButton
              label="Emitir"
              description="A emissão atribui estado definitivo ao documento de venda."
              entityLabel={String(row.number ?? row.id)}
              busy={action.busy}
              onConfirm={() => action.run(() => salesApi.issueDocument(String(row.id)), "Venda emitida.")}
            /> : null}
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
      <ConfirmationDialog
        open={Boolean(pendingRejection)}
        title="Confirmar rejeição da venda"
        description={pendingRejection
          ? `O documento será rejeitado com o motivo: ${pendingRejection.reason}`
          : "Confirma a rejeição do documento."}
        confirmLabel="Rejeitar"
        entityLabel={pendingRejection?.id}
        companyName={auth.snapshot?.company?.name}
        busy={action.busy}
        onCancel={() => setPendingRejection(null)}
        onConfirm={async () => {
          if (!pendingRejection) return;
          const result = await action.run(
            () => salesApi.rejectDocument(pendingRejection.id, { reason: pendingRejection.reason }),
            "Venda rejeitada.",
          );
          if (result) setPendingRejection(null);
        }}
      />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Purchase Documents e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para documentos de compra.
 */
export function PurchaseDocumentsPage() {
  const list = useApiList(async (pagination) =>
    normalizeCursorPage(
      await purchasesApi.listDocuments(pagination),
      "purchaseDocuments",
      asObject,
    ),
  );
  const action = useAction(list.reload);
  const [issuedAt, setIssuedAt] = useState(toLocalDateInputValue());
  const [history, setHistory] = useState<unknown>(null);
  const [creating, setCreating] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const auth = useAuth();
  const { setTransaction, clearTransaction } = useAiTransactionContext();
  const references = useDocumentReferences(
    "suppliers",
    auth.hasPermission(Permission.PURCHASES_WRITE),
  );
  const requiresWarehouse = references.items
    .find(({ value }) => value === selectedItemId)?.type === "PRODUCT";

  useEffect(() => clearTransaction, [clearTransaction]);

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const result = await action.run(
      () => purchasesApi.createDocument(parsePurchaseDocument(form)),
      "Documento de compra criado.",
    );
    if (result) {
      formElement.reset();
      setSelectedItemId("");
      setCreating(false);
    }
  }

  async function loadHistory(id: string) {
    const response = await action.run(
      () => purchaseApprovalApi.approvalHistory(id),
      "Histórico carregado.",
    );
    setHistory(response);
  }

  function rowActions(row: TableRow) {
    const document = list.rows.find(({ id }) => id === row.id);
    if (!document || typeof document.id !== "string") return null;
    const status = String(document.status ?? "");
    const label = String(document.supplierNumber ?? "Rascunho de compra");
    return (
      <div className="inlineActions">
        {auth.hasPermission(Permission.AI_CHAT_USE) ? (
          <button
            type="button"
            onClick={() => openTransactionAssistant(setTransaction, {
              documentType: "PURCHASE",
              documentId: document.id as string,
              label,
            })}
          >
            Analisar com IA
          </button>
        ) : null}
        {status === "DRAFT" && auth.hasPermission(Permission.PURCHASES_APPROVE) ? (
          <ConfirmableActionButton
            label="Aprovar"
            description="Confirma que a compra foi revista e pode avançar."
            entityLabel={label}
            busy={action.busy}
            onConfirm={() => action.run(
              () => purchaseApprovalApi.approveDocument(document.id as string),
              "Compra aprovada.",
            )}
          />
        ) : null}
        {status === "APPROVED" && !document.postedAt && auth.hasPermission(Permission.ACCOUNTING_WRITE) ? (
          <ConfirmableActionButton
            label="Contabilizar"
            description="Cria o journal e a entrada de stock na mesma operação."
            entityLabel={label}
            busy={action.busy}
            requireAcknowledgement
            onConfirm={() => action.run(
              () => accountingApi.postPurchaseDocument(document.id as string),
              "Compra contabilizada e stock atualizado.",
            )}
          />
        ) : null}
        {auth.hasPermission(Permission.PURCHASE_APPROVAL_HISTORY_READ) ? (
          <button
            type="button"
            disabled={action.busy}
            onClick={() => void loadHistory(document.id as string)}
          >
            Histórico
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <PageFrame
      title="Documentos de compra"
      description="Cria, aprova e contabiliza uma compra real. A compra contabilizada é a âncora segura do SAF-T académico."
      actions={auth.hasPermission(Permission.PURCHASES_WRITE) ? (
        <button type="button" onClick={() => setCreating(true)}>Nova compra</button>
      ) : undefined}
    >
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      {references.error ? (
        <StatusMessage tone="danger" title="Opções indisponíveis">{references.error}</StatusMessage>
      ) : null}
      <ResponsiveDataTable
        rows={documentRows(list.rows, "PURCHASE")}
        columns={DOCUMENT_COLUMNS}
        caption="Documentos de compra"
        renderMobileTitle={(row) => String(row.displayNumber)}
        renderRowActions={rowActions}
        emptyState={(
          <StatusMessage tone="neutral" title="Ainda não existem compras">
            Cria a primeira compra quando já tiveres um fornecedor e um produto.
          </StatusMessage>
        )}
      />
      <CursorPaginationButton
        hasNextPage={list.pageInfo.hasNextPage}
        busy={list.busy}
        label="documentos de compra"
        onLoadMore={list.loadMore}
      />
      <ModalSurface open={creating} title="Nova compra" onClose={() => setCreating(false)}>
        <form className="operation" onSubmit={submit}>
        <h3>Dados do documento</h3>
        <div className="fields">
          <label>
            <span>Tipo</span>
            <select name="kind" required defaultValue="SUPPLIER_INVOICE">
              <option value="SUPPLIER_INVOICE">Fatura de fornecedor</option>
              <option value="SUPPLIER_CREDIT_NOTE">Nota de credito</option>
            </select>
          </label>
          <ReferenceSelect name="supplierId" label="Fornecedor" options={references.parties} />
          <ReferenceSelect
            name="warehouseId"
            label={requiresWarehouse ? "Armazém (obrigatório para produto)" : "Armazém (opcional para serviço)"}
            options={references.warehouses}
            required={requiresWarehouse}
            defaultValue={references.warehouses.length === 1 ? references.warehouses[0].value : ""}
          />
          <label>
            <span>Número do fornecedor</span>
            <input name="supplierNumber" required />
          </label>
          <label>
            <span>Data</span>
            <input
              name="issuedAt"
              type="date"
              required
              value={issuedAt}
              onChange={(event) => setIssuedAt(event.target.value)}
            />
          </label>
          <label>
            <span>Vencimento</span>
            <input name="dueDate" type="date" min={issuedAt || undefined} />
          </label>
          <DocumentLineFields
            cost
            items={references.items}
            vatRates={references.vatRates}
            selectedItemId={selectedItemId}
            onItemChange={setSelectedItemId}
          />
        </div>
        <button type="submit" disabled={action.busy || references.items.length === 0}>Criar rascunho</button>
        </form>
      </ModalSurface>
      <StructuredResult value={history} title="Histórico de aprovação" />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Payments e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para pagamentos.
 */
export function PaymentsPage() {
  const list = useApiList(async (pagination) =>
    normalizeCursorPage(
      await purchasesApi.listDocuments(pagination),
      "purchaseDocuments",
      asObject,
    ),
  );
  const action = useAction(list.reload);
  const treasury = useTreasuryAccountOptions();
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const selectedDocument = list.rows.find((row) => row.id === selectedDocumentId);
  const minimumDate = typeof selectedDocument?.issuedAt === "string"
    ? selectedDocument.issuedAt.slice(0, 10)
    : undefined;

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const result = await action.run(
      () =>
        paymentApi.register(
          requiredText(form.get("id"), "Documento"),
          parseMoneyMovement(form, "paidAt"),
        ),
      "Pagamento registado.",
    );
    if (result) {
      formElement.reset();
      setSelectedDocumentId("");
    }
  }

  return (
    <PageFrame title="Pagamentos">
      <Feedback
        busy={list.busy || action.busy || treasury.busy}
        error={list.error ?? action.error ?? treasury.error}
        message={action.message}
      />
      {!treasury.busy && !treasury.error && treasury.accounts.length === 0 ? (
        <StatusMessage tone="neutral" title="Sem contas de tesouraria">
          Cria primeiro uma conta bancária ou de caixa para registar pagamentos.
        </StatusMessage>
      ) : null}
      <DataTable rows={list.rows} columns={PAYMENT_COLUMNS} pagination={list} />
      <form className="operation" onSubmit={submit}>
        <h3>Registar pagamento</h3>
        <div className="fields">
          <DocumentSelect
            name="id"
            label="Documento de compra"
            documents={list.rows}
            value={selectedDocumentId}
            onChange={setSelectedDocumentId}
          />
          <TreasuryAccountSelect accounts={treasury.accounts} />
          <label>
            <span>Valor em cêntimos</span>
            <input name="amountCents" type="number" min="1" required />
          </label>
          <label>
            <span>Data</span>
            <input
              name="paidAt"
              type="date"
              required
              min={minimumDate}
              defaultValue={toLocalDateInputValue()}
            />
          </label>
          <MethodSelect />
          <label>
            <span>Referência</span>
            <input name="reference" />
          </label>
          <label>
            <span>Notas</span>
            <input name="notes" />
          </label>
        </div>
        <button type="submit" disabled={action.busy || treasury.busy || treasury.accounts.length === 0}>Registar</button>
      </form>
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Purchase Postings e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para lançamentos de compras.
 */
export function PurchasePostingsPage() {
  const list = useApiList(async (pagination) =>
    normalizeCursorPage(
      await purchasesApi.listDocuments(pagination),
      "purchaseDocuments",
      asObject,
    ),
  );
  const action = useAction(list.reload);

  return (
    <PageFrame title="Lançamentos de compras">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        columns={PURCHASE_DOCUMENT_COLUMNS}
        pagination={list}
        actions={(row) => row.status === "APPROVED" && !row.postedAt ? (
          <ConfirmableActionButton
            label="Contabilizar"
            description="Esta operação cria o lançamento contabilístico da compra e não deve ser repetida por engano."
            entityLabel={String(row.supplierNumber ?? row.id)}
            busy={action.busy}
            requireAcknowledgement
            onConfirm={() => action.run(
              () => accountingApi.postPurchaseDocument(String(row.id)),
              "Compra contabilizada.",
            )}
          />
        ) : <span>{row.postedAt ? "Já contabilizada" : "Ainda não elegível"}</span>}
      />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Purchase Approval e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para aprovação de compras.
 */
export function PurchaseApprovalPage() {
  const list = useApiList(async (pagination) =>
    normalizeCursorPage(
      await purchasesApi.listDocuments(pagination),
      "purchaseDocuments",
      asObject,
    ),
  );
  const action = useAction(list.reload);
  const auth = useAuth();
  const [history, setHistory] = useState<unknown>(null);
  const [pendingRejection, setPendingRejection] = useState<{ id: string; reason: string } | null>(null);

  /**
   * Processa a rejeição do documento indicado no formulário com o motivo obrigatório.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de rejeitar o documento indicado.
   */
  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPendingRejection({
      id: requiredText(form.get("id"), "Documento"),
      reason: requiredText(form.get("reason"), "Justificação"),
    });
  }

  /**
   * Carrega o histórico de aprovação de compras para o documento indicado.
   *
   * @param id - Identificador do registo alvo.
   * @returns Promise resolvida depois de carregar o histórico de aprovação.
   */
  async function loadHistory(id: string) {
    const response = await action.run(
      () => purchaseApprovalApi.approvalHistory(id),
      "Historico carregado.",
    );
    setHistory(response);
  }

  /**
   * Lê o documento do formulário e delega o carregamento do respetivo histórico.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de carregar o histórico indicado no formulário.
   */
  async function loadHistoryFromForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = requiredText(new FormData(event.currentTarget).get("id"), "Documento");
    await loadHistory(id);
  }

  return (
    <PageFrame title="Aprovação de compras">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        columns={PURCHASE_DOCUMENT_COLUMNS}
        pagination={list}
        actions={(row) => (
          <div className="inlineActions">
            {row.status === "DRAFT" ? <ConfirmableActionButton
              label="Aprovar"
              description="Confirma que a compra foi revista e pode avançar no workflow."
              entityLabel={String(row.supplierNumber ?? row.id)}
              busy={action.busy}
              onConfirm={() => action.run(
                () => purchaseApprovalApi.approveDocument(String(row.id)),
                "Compra aprovada.",
              )}
            /> : null}
            {row.status === "APPROVED" && !row.postedAt ? <PermissionGate permission={Permission.ACCOUNTING_WRITE}>
              <ConfirmableActionButton
                label="Contabilizar"
                description="Esta operação altera a compra para o estado contabilizado."
                entityLabel={String(row.supplierNumber ?? row.id)}
                busy={action.busy}
                requireAcknowledgement
                onConfirm={() => action.run(
                  () => purchaseApprovalApi.postState(String(row.id)),
                  "Compra lançada.",
                )}
              />
            </PermissionGate> : null}
            <button
              type="button"
              onClick={() => void loadHistory(String(row.id))}
            >
              Historico
            </button>
          </div>
        )}
      />
      <form className="operation" onSubmit={reject}>
        <h3>Reprovar compra</h3>
        <div className="fields">
          <DocumentSelect name="id" label="Documento de compra" documents={list.rows} />
          <label>
            <span>Justificação</span>
            <input name="reason" required minLength={8} />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Reprovar</button>
      </form>
      <ConfirmationDialog
        open={Boolean(pendingRejection)}
        title="Confirmar rejeição da compra"
        description={pendingRejection
          ? `O documento será rejeitado com a justificação: ${pendingRejection.reason}`
          : "Confirma a rejeição do documento."}
        confirmLabel="Rejeitar"
        entityLabel={pendingRejection?.id}
        companyName={auth.snapshot?.company?.name}
        busy={action.busy}
        onCancel={() => setPendingRejection(null)}
        onConfirm={async () => {
          if (!pendingRejection) return;
          const result = await action.run(
            () => purchaseApprovalApi.rejectDocument(pendingRejection.id, pendingRejection.reason),
            "Compra rejeitada.",
          );
          if (result) setPendingRejection(null);
        }}
      />
      <form className="operation" onSubmit={loadHistoryFromForm}>
        <h3>Consultar histórico</h3>
        <div className="fields">
          <DocumentSelect name="id" label="Documento de compra" documents={list.rows} />
        </div>
        <button type="submit" disabled={action.busy}>Consultar histórico</button>
      </form>
      <StructuredResult value={history} title="Histórico de aprovação" />
    </PageFrame>
  );
}
