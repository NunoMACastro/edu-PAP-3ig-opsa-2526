import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { ApiError, apiClient, JsonBody } from "./lib/apiClient";
import { PaymentsPage } from "./pages/PaymentsPage";
import { PurchaseApprovalPage } from "./pages/PurchaseApprovalPage";
import { PurchaseDocumentsPage } from "./pages/PurchaseDocumentsPage";
import { PurchasePostingsPage } from "./pages/PurchasePostingsPage";
import { ReceiptsPage } from "./pages/ReceiptsPage";
import { SaleApprovalPage } from "./pages/SaleApprovalPage";
import { SaleDocumentsPage } from "./pages/SaleDocumentsPage";
import { SalePostingsPage } from "./pages/SalePostingsPage";
import { SalesOpenItemsPage } from "./pages/SalesOpenItemsPage";
import { VatRatesPage } from "./pages/VatRatesPage";
import {
  AccountingReportsPage,
  FifoCostPage,
  FinancialStatementsPage,
  InventoryCountPage,
  ManualJournalPage,
  StockAlertsPage,
  StockMovementsPage,
} from "./pages/mf2Pages";
import { VatMapPage } from "./pages/VatMapPage";
import { SaftExportPage } from "./pages/SaftExportPage";

type ApiObject = Record<string, unknown>;
type FieldKind = "text" | "email" | "password" | "number" | "textarea" | "select";

interface FieldConfig {
  name: string;
  label: string;
  kind?: FieldKind;
  required?: boolean;
  defaultValue?: string;
  options?: Array<{ value: string; label: string }>;
  json?: boolean;
}

interface OperationConfig {
  title: string;
  submitLabel: string;
  fields: FieldConfig[];
  run: (values: ApiObject) => Promise<unknown>;
  afterSuccess?: () => Promise<void> | void;
}

interface ResourceConfig {
  id: string;
  title: string;
  load: (search?: string) => Promise<ApiObject[]>;
  searchable?: boolean;
  operations: OperationConfig[];
}

interface PageConfig {
  id: string;
  title: string;
  render: () => ReactNode;
}

function asObject(value: unknown): ApiObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiObject)
    : {};
}

function pickArray(response: unknown, key: string): ApiObject[] {
  const value = asObject(response)[key];
  return Array.isArray(value) ? value.map(asObject) : [];
}

function pickSingle(response: unknown, key: string): ApiObject[] {
  const value = asObject(response)[key];
  return value ? [asObject(value)] : [];
}

function formatError(error: unknown): string {
  if (error instanceof ApiError) {
    return `${error.code}: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Erro inesperado";
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "sim" : "nao";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function normalizeFormValues(fields: FieldConfig[], form: FormData): ApiObject {
  const values: ApiObject = {};

  for (const field of fields) {
    const rawValue = String(form.get(field.name) ?? "");
    const trimmed = rawValue.trim();

    if (field.json) {
      values[field.name] = trimmed ? JSON.parse(trimmed) : [];
      continue;
    }

    if (field.kind === "number") {
      if (trimmed !== "") values[field.name] = Number(trimmed);
      continue;
    }

    if (trimmed !== "") {
      values[field.name] = trimmed;
    }
  }

  return values;
}

function DataTable({ rows }: { rows: ApiObject[] }) {
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

function OperationForm({
  operation,
  onDone,
}: {
  operation: OperationConfig;
  onDone: (result: unknown) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const values = normalizeFormValues(
        operation.fields,
        new FormData(event.currentTarget),
      );
      const result = await operation.run(values);
      await operation.afterSuccess?.();
      await onDone(result);
      event.currentTarget.reset();
    } catch (caught) {
      setError(formatError(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="operation" onSubmit={handleSubmit}>
      <h3>{operation.title}</h3>
      <div className="fields">
        {operation.fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            {field.kind === "textarea" ? (
              <textarea
                name={field.name}
                required={field.required}
                defaultValue={field.defaultValue}
                rows={4}
              />
            ) : field.kind === "select" ? (
              <select
                name={field.name}
                required={field.required}
                defaultValue={field.defaultValue ?? ""}
              >
                <option value="" disabled={field.required}>
                  Selecionar
                </option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                required={field.required}
                type={field.kind ?? "text"}
                defaultValue={field.defaultValue}
              />
            )}
          </label>
        ))}
      </div>
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" disabled={busy}>
        {busy ? "A executar..." : operation.submitLabel}
      </button>
    </form>
  );
}

function AuthPanel({
  onAuthChange,
}: {
  onAuthChange: (snapshot: ApiObject | null) => Promise<void>;
}) {
  const [result, setResult] = useState<unknown>(null);

  async function refreshMe() {
    try {
      const me = await apiClient.auth.me();
      await onAuthChange(asObject(me));
      setResult(me);
    } catch {
      await onAuthChange(null);
    }
  }

  const operations: OperationConfig[] = [
    {
      title: "Registo",
      submitLabel: "Registar",
      fields: [
        { name: "email", label: "Email", kind: "email", required: true },
        { name: "password", label: "Password", kind: "password", required: true },
        { name: "name", label: "Nome" },
      ],
      run: (values) => apiClient.auth.register(values as JsonBody),
      afterSuccess: refreshMe,
    },
    {
      title: "Login",
      submitLabel: "Entrar",
      fields: [
        { name: "email", label: "Email", kind: "email", required: true },
        { name: "password", label: "Password", kind: "password", required: true },
      ],
      run: (values) => apiClient.auth.login(values as JsonBody),
      afterSuccess: refreshMe,
    },
    {
      title: "Recuperar password",
      submitLabel: "Pedir link",
      fields: [{ name: "email", label: "Email", kind: "email", required: true }],
      run: (values) => apiClient.auth.forgotPassword(values as JsonBody),
    },
    {
      title: "Definir nova password",
      submitLabel: "Alterar password",
      fields: [
        { name: "token", label: "Token", required: true },
        { name: "password", label: "Nova password", kind: "password", required: true },
      ],
      run: (values) => apiClient.auth.resetPassword(values as JsonBody),
    },
    {
      title: "Sessao atual",
      submitLabel: "Atualizar me",
      fields: [],
      run: () => apiClient.auth.me(),
      afterSuccess: refreshMe,
    },
    {
      title: "Logout",
      submitLabel: "Sair",
      fields: [],
      run: () => apiClient.auth.logout(),
      afterSuccess: async () => onAuthChange(null),
    },
  ];

  return (
    <section className="panel">
      <div className="sectionHeader">
        <h2>Identidade e acesso</h2>
      </div>
      <div className="operationGrid">
        {operations.map((operation) => (
          <OperationForm
            key={operation.title}
            operation={operation}
            onDone={async (value) => setResult(value)}
          />
        ))}
      </div>
      <pre className="result">{JSON.stringify(result, null, 2)}</pre>
    </section>
  );
}

function ResourcePanel({ resource }: { resource: ResourceConfig }) {
  const [rows, setRows] = useState<ApiObject[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      setRows(await resource.load(resource.searchable ? search : undefined));
    } catch (caught) {
      setError(formatError(caught));
      setRows([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, [resource.id]);

  return (
    <section className="panel">
      <div className="sectionHeader">
        <h2>{resource.title}</h2>
        <button type="button" onClick={load} disabled={busy}>
          {busy ? "A carregar..." : "Atualizar"}
        </button>
      </div>
      {resource.searchable ? (
        <form
          className="search"
          onSubmit={(event) => {
            event.preventDefault();
            void load();
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar por nome ou NIF"
          />
          <button type="submit">Pesquisar</button>
        </form>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
      <DataTable rows={rows} />
      <div className="operationGrid">
        {resource.operations.map((operation) => (
          <OperationForm
            key={operation.title}
            operation={operation}
            onDone={async (value) => {
              setResult(value);
              await load();
            }}
          />
        ))}
      </div>
      <pre className="result">{JSON.stringify(result, null, 2)}</pre>
    </section>
  );
}

const roleOptions = [
  "ADMIN",
  "GESTOR",
  "CONTABILISTA",
  "OPERACIONAL",
  "AUDITOR",
].map((role) => ({ value: role, label: role }));

export function App() {
  const [active, setActive] = useState("auth");
  const [authSnapshot, setAuthSnapshot] = useState<ApiObject | null>(null);

  useEffect(() => {
    apiClient.auth
      .me()
      .then((snapshot) => setAuthSnapshot(asObject(snapshot)))
      .catch(() => setAuthSnapshot(null));
  }, []);

  const resources = useMemo<ResourceConfig[]>(
    () => [
      {
        id: "companies",
        title: "Empresas e contexto",
        load: async () => pickArray(await apiClient.companies.list(), "companies"),
        operations: [
          {
            title: "Selecionar empresa",
            submitLabel: "Selecionar",
            fields: [{ name: "companyId", label: "Company ID", required: true }],
            run: (values) => apiClient.companies.switchCompany(values as JsonBody),
            afterSuccess: async () => {
              const snapshot = await apiClient.auth.me();
              setAuthSnapshot(asObject(snapshot));
            },
          },
          {
            title: "Consultar contexto",
            submitLabel: "Consultar",
            fields: [],
            run: () => apiClient.companies.context(),
          },
        ],
      },
      {
        id: "users",
        title: "Utilizadores da empresa",
        load: async () => pickArray(await apiClient.companies.users(), "users"),
        operations: [
          {
            title: "Convidar utilizador",
            submitLabel: "Convidar",
            fields: [
              { name: "email", label: "Email", kind: "email", required: true },
              {
                name: "role",
                label: "Role",
                kind: "select",
                required: true,
                options: roleOptions,
              },
            ],
            run: (values) => apiClient.companies.inviteUser(values as JsonBody),
          },
          {
            title: "Alterar role",
            submitLabel: "Alterar",
            fields: [
              { name: "id", label: "User ID", required: true },
              {
                name: "role",
                label: "Role",
                kind: "select",
                required: true,
                options: roleOptions,
              },
            ],
            run: ({ id, ...body }) =>
              apiClient.companies.updateUserRole(String(id), body as JsonBody),
          },
          {
            title: "Remover utilizador",
            submitLabel: "Remover",
            fields: [{ name: "id", label: "User ID", required: true }],
            run: ({ id }) => apiClient.companies.removeUser(String(id)),
          },
        ],
      },
      {
        id: "profile",
        title: "Perfil da empresa",
        load: async () => pickSingle(await apiClient.companies.getProfile(), "profile"),
        operations: [
          {
            title: "Guardar perfil",
            submitLabel: "Guardar",
            fields: [
              { name: "legalName", label: "Nome legal", required: true },
              { name: "nif", label: "NIF", required: true },
              { name: "addressLine1", label: "Morada", required: true },
              { name: "addressLine2", label: "Morada 2" },
              { name: "postalCode", label: "Codigo postal", required: true },
              { name: "city", label: "Cidade", required: true },
              { name: "country", label: "Pais", defaultValue: "PT" },
              { name: "currency", label: "Moeda", defaultValue: "EUR" },
              { name: "logoUrl", label: "Logo URL" },
              {
                name: "fiscalYearStartMonth",
                label: "Mes fiscal inicial",
                kind: "number",
                required: true,
                defaultValue: "1",
              },
              {
                name: "fiscalYearStartDay",
                label: "Dia fiscal inicial",
                kind: "number",
                required: true,
                defaultValue: "1",
              },
            ],
            run: (values) => apiClient.companies.updateProfile(values as JsonBody),
          },
        ],
      },
      {
        id: "accounts",
        title: "Plano de contas",
        load: async () =>
          pickArray(await apiClient.accounting.listAccounts(), "accounts"),
        operations: [
          {
            title: "Criar conta",
            submitLabel: "Criar",
            fields: [
              { name: "code", label: "Codigo", required: true },
              { name: "name", label: "Nome", required: true },
              { name: "parentCode", label: "Codigo pai" },
            ],
            run: (values) => apiClient.accounting.createAccount(values as JsonBody),
          },
          {
            title: "Importar linhas normalizadas",
            submitLabel: "Importar",
            fields: [
              {
                name: "rows",
                label: "Rows JSON",
                kind: "textarea",
                json: true,
                required: true,
                defaultValue:
                  '[{"code":"1","name":"Meios financeiros liquidos"}]',
              },
            ],
            run: (values) =>
              apiClient.accounting.importAccounts(values as JsonBody),
          },
        ],
      },
      {
        id: "periods",
        title: "Periodos fiscais",
        load: async () =>
          pickArray(await apiClient.accounting.listFiscalPeriods(), "periods"),
        operations: [
          {
            title: "Abrir periodo",
            submitLabel: "Abrir",
            fields: [
              { name: "name", label: "Nome", required: true },
              { name: "startDate", label: "Data inicio", required: true },
              { name: "endDate", label: "Data fim", required: true },
            ],
            run: (values) =>
              apiClient.accounting.createFiscalPeriod(values as JsonBody),
          },
          {
            title: "Fechar periodo",
            submitLabel: "Fechar",
            fields: [{ name: "id", label: "Period ID", required: true }],
            run: ({ id }) => apiClient.accounting.closeFiscalPeriod(String(id)),
          },
        ],
      },
      {
        id: "customers",
        title: "Clientes",
        searchable: true,
        load: async (search) =>
          pickArray(await apiClient.customers.list(search), "customers"),
        operations: personOperations("cliente", apiClient.customers),
      },
      {
        id: "suppliers",
        title: "Fornecedores",
        searchable: true,
        load: async (search) =>
          pickArray(await apiClient.suppliers.list(search), "suppliers"),
        operations: personOperations("fornecedor", apiClient.suppliers),
      },
      {
        id: "items",
        title: "Artigos e servicos",
        load: async () => pickArray(await apiClient.items.list(), "items"),
        operations: [
          {
            title: "Criar item",
            submitLabel: "Criar",
            fields: itemFields(),
            run: (values) => apiClient.items.create(values as JsonBody),
          },
          {
            title: "Atualizar item",
            submitLabel: "Atualizar",
            fields: [{ name: "id", label: "Item ID", required: true }, ...itemFields()],
            run: ({ id, ...body }) =>
              apiClient.items.update(String(id), body as JsonBody),
          },
          {
            title: "Remover item",
            submitLabel: "Remover",
            fields: [{ name: "id", label: "Item ID", required: true }],
            run: ({ id }) => apiClient.items.remove(String(id)),
          },
        ],
      },
      {
        id: "warehouses",
        title: "Armazens e localizacoes",
        load: async () =>
          pickArray(await apiClient.warehouses.list(), "warehouses"),
        operations: [
          {
            title: "Criar armazem",
            submitLabel: "Criar",
            fields: [
              { name: "code", label: "Codigo", required: true },
              { name: "name", label: "Nome", required: true },
            ],
            run: (values) => apiClient.warehouses.create(values as JsonBody),
          },
          {
            title: "Listar localizacoes",
            submitLabel: "Listar",
            fields: [{ name: "id", label: "Warehouse ID", required: true }],
            run: ({ id }) => apiClient.warehouses.listLocations(String(id)),
          },
          {
            title: "Criar localizacao",
            submitLabel: "Criar",
            fields: [
              { name: "id", label: "Warehouse ID", required: true },
              { name: "code", label: "Codigo", required: true },
              { name: "name", label: "Nome", required: true },
            ],
            run: ({ id, ...body }) =>
              apiClient.warehouses.createLocation(String(id), body as JsonBody),
          },
        ],
      },
    ],
    [],
  );

  const mf1Pages = useMemo<PageConfig[]>(
    () => [
      { id: "vat-rates", title: "Tabelas de IVA", render: () => <VatRatesPage /> },
      {
        id: "sales-documents",
        title: "Documentos de venda",
        render: () => <SaleDocumentsPage />,
      },
      { id: "receipts", title: "Recebimentos", render: () => <ReceiptsPage /> },
      {
        id: "sales-open-items",
        title: "Titulos em aberto",
        render: () => <SalesOpenItemsPage />,
      },
      {
        id: "sale-approval",
        title: "Aprovacao de vendas",
        render: () => <SaleApprovalPage />,
      },
      {
        id: "sale-postings",
        title: "Lancamentos de vendas",
        render: () => <SalePostingsPage />,
      },
      {
        id: "purchase-documents",
        title: "Documentos de compra",
        render: () => <PurchaseDocumentsPage />,
      },
      { id: "payments", title: "Pagamentos", render: () => <PaymentsPage /> },
      {
        id: "purchase-approval",
        title: "Aprovacao de compras",
        render: () => <PurchaseApprovalPage />,
      },
      {
        id: "purchase-postings",
        title: "Lancamentos de compras",
        render: () => <PurchasePostingsPage />,
      },
    ],
    [],
  );
  const mf2Pages = useMemo<PageConfig[]>(
    () => [
      {
        id: "stock-movements",
        title: "Movimentos de stock",
        render: () => <StockMovementsPage />,
      },
      {
        id: "fifo-cost",
        title: "Custo FIFO",
        render: () => <FifoCostPage />,
      },
      {
        id: "inventory-counts",
        title: "Contagens fisicas",
        render: () => <InventoryCountPage />,
      },
      {
        id: "stock-alerts",
        title: "Alertas de stock",
        render: () => <StockAlertsPage />,
      },
      {
        id: "manual-journals",
        title: "Lancamentos manuais",
        render: () => <ManualJournalPage />,
      },
      {
        id: "accounting-reports",
        title: "Balancete e razao",
        render: () => <AccountingReportsPage />,
      },
      {
        id: "financial-statements",
        title: "DR e Balanco",
        render: () => <FinancialStatementsPage />,
      },
      {
        id: "vat-map",
        title: "Mapa de IVA",
        render: () => <VatMapPage />,
      },
      {
        id: "saft-export",
        title: "Exportar SAF-T",
        render: () => <SaftExportPage />,
      },
    ],
    [],
  );

  const activeResource = resources.find((resource) => resource.id === active);
  const activePage = [...mf1Pages, ...mf2Pages].find((page) => page.id === active);

  return (
    <main className="appShell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">OPSA</p>
          <h1>MF2</h1>
        </div>
        <nav>
          <button
            className={active === "auth" ? "active" : ""}
            type="button"
            onClick={() => setActive("auth")}
          >
            Identidade
          </button>
          {resources.map((resource) => (
            <button
              key={resource.id}
              className={active === resource.id ? "active" : ""}
              type="button"
              onClick={() => setActive(resource.id)}
            >
              {resource.title}
            </button>
          ))}
          {mf1Pages.map((page) => (
            <button
              key={page.id}
              className={active === page.id ? "active" : ""}
              type="button"
              onClick={() => setActive(page.id)}
            >
              {page.title}
            </button>
          ))}
          {mf2Pages.map((page) => (
            <button
              key={page.id}
              className={active === page.id ? "active" : ""}
              type="button"
              onClick={() => setActive(page.id)}
            >
              {page.title}
            </button>
          ))}
        </nav>
        <pre className="sessionBox">{JSON.stringify(authSnapshot, null, 2)}</pre>
      </aside>
      <div className="content">
        {active === "auth" ? (
          <AuthPanel onAuthChange={async (snapshot) => setAuthSnapshot(snapshot)} />
        ) : activeResource ? (
          <ResourcePanel key={activeResource.id} resource={activeResource} />
        ) : activePage ? (
          activePage.render()
        ) : null}
      </div>
    </main>
  );
}

function personFields(requireNif = false): FieldConfig[] {
  return [
    { name: "name", label: "Nome", required: true },
    { name: "nif", label: "NIF", required: requireNif },
    { name: "email", label: "Email", kind: "email" },
    { name: "phone", label: "Telefone" },
    { name: "addressLine", label: "Morada" },
    { name: "postalCode", label: "Codigo postal" },
    { name: "city", label: "Cidade" },
  ];
}

function personOperations(
  label: string,
  client: {
    create: (body: JsonBody) => Promise<unknown>;
    update: (id: string, body: JsonBody) => Promise<unknown>;
    remove: (id: string) => Promise<unknown>;
  },
  requireNif = false,
): OperationConfig[] {
  return [
    {
      title: `Criar ${label}`,
      submitLabel: "Criar",
      fields: personFields(requireNif),
      run: (values) => client.create(values as JsonBody),
    },
    {
      title: `Atualizar ${label}`,
      submitLabel: "Atualizar",
      fields: [{ name: "id", label: "ID", required: true }, ...personFields(requireNif)],
      run: ({ id, ...body }) => client.update(String(id), body as JsonBody),
    },
    {
      title: `Remover ${label}`,
      submitLabel: "Remover",
      fields: [{ name: "id", label: "ID", required: true }],
      run: ({ id }) => client.remove(String(id)),
    },
  ];
}

function itemFields(): FieldConfig[] {
  return [
    { name: "sku", label: "SKU", required: true },
    { name: "name", label: "Nome", required: true },
    {
      name: "type",
      label: "Tipo",
      kind: "select",
      required: true,
      options: [
        { value: "PRODUCT", label: "Produto" },
        { value: "SERVICE", label: "Servico" },
      ],
    },
    { name: "costCents", label: "Custo em centimos", kind: "number", required: true },
    { name: "priceCents", label: "Preco em centimos", kind: "number", required: true },
    { name: "vatRateBps", label: "IVA bps", kind: "number", required: true },
  ];
}
