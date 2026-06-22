/**
 * @file Composição principal da aplicação web OPSA, incluindo autenticação e navegação pelos módulos MF0 a MF3.
 */

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
import { ResponsiveDataTable } from "./ui/ResponsiveDataTable";
import type { TableCellValue, TableRow } from "./ui/ResponsiveDataTable";
import { useActionFeedback } from "./ui/useActionFeedback";
import {
  AccountingReportsPage,
  FifoCostPage,
  FinancialStatementsPage,
  InventoryCountPage,
  ManualJournalPage,
  StockAlertsPage,
  StockMovementsPage,
} from "./pages/mf2Pages";
import {
  BusinessImportPage,
  CashflowForecastPage,
  ExecutiveKpisPage,
  OperationalReportsPage,
  SaftExportPage,
  StatementImportPage,
  TreasuryAccountsPage,
  VatMapPage,
} from "./pages/mf3Pages";
import {
  AiInsightsPage,
  AiQuestionsPage,
  AiSuggestionsPage,
  AuditLogsPage,
  IntegrationLogsPage,
  NotificationsPage,
  RemindersPage,
  SmartAlertsPage,
  TasksPage,
} from "./pages/mf4Pages";
import { ActionToolbar, PageFrame, StatusMessage } from "./ui/opsaUi";
import { formatMf5ValidationUiError, formatUiError } from "./lib/mf5ErrorMessages";
import { toPrimitiveValidationValues, validateMf5Form } from "./lib/mf5FormValidators";

type ApiObject = Record<string, unknown>;
type FieldKind = "text" | "email" | "password" | "number" | "textarea" | "select";
type OperationResult = Awaited<ReturnType<OperationConfig["run"]>>;

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

/**
 * Renderiza uma operação configurável com feedback imediato de submissão.
 *
 * @param props - Operação e callback executado depois de a API responder.
 * @returns Formulário React com estados visíveis de execução, sucesso e erro.
 */
function OperationForm({
    operation,
    onDone,
}: {
    operation: OperationConfig;
    onDone: (result: OperationResult) => Promise<void>;
}) {
    const action = useActionFeedback();

    /**
     * Submete a operação apenas depois de validar campos críticos no frontend.
     *
     * @param event - Evento do formulário submetido.
     * @returns Promise resolvida depois de processar a submissão.
     */
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formElement = event.currentTarget;
      action.start("A validar dados do formulário...");

      try {
        const values = normalizeFormValues(operation.fields, new FormData(formElement));
        const validationErrors = validateMf5Form(toPrimitiveValidationValues(values));

        if (validationErrors.length > 0) {
          // O BK-MF5-06 acrescenta próxima ação sem apagar as mensagens criadas no BK-MF5-05.
          action.fail(new Error(formatMf5ValidationUiError(validationErrors)));
          return;
        }

        const result = await operation.run(values);
        await operation.afterSuccess?.();
        await onDone(result);
        formElement.reset();
        action.succeed("Dados guardados e lista atualizada.");
      } catch (caught) {
        // Mesmo quando a API lança ApiError, o texto passa por RNF06 antes de chegar ao feedback visual.
        const error = new Error(formatUiError(caught));
        action.fail(error, "Não foi possível guardar os dados.");
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
            {action.feedback.message ? (
                <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
                    {action.feedback.message}
                </StatusMessage>
            ) : null}
            <button type="submit" disabled={action.busy}>
                {action.busy ? "A executar..." : operation.submitLabel}
            </button>
        </form>
    );
}

/**
 * Renderiza um recurso CRUD configurável, incluindo pesquisa, tabela e operações associadas.
 *
 * @param props - Configuração do recurso a apresentar.
 * @returns Elemento React renderizado para um recurso CRUD.
 */
/**
 * Converte um valor desconhecido num objeto indexável, devolvendo objeto vazio quando o formato não é seguro.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Objeto indexável seguro, ou objeto vazio quando o valor não é compatível.
 */
function asObject(value: unknown): ApiObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiObject)
    : {};
}

/**
 * Extrai um array de uma resposta JSON e normaliza cada entrada para objeto.
 *
 * @param response - Resposta JSON recebida da API.
 * @param key - Chave a extrair da resposta JSON.
 * @returns Lista de objetos extraída da resposta JSON.
 */
function pickArray(response: unknown, key: string): ApiObject[] {
  const value = asObject(response)[key];
  return Array.isArray(value) ? value.map(asObject) : [];
}

/**
 * Extrai um objeto de uma resposta JSON e coloca-o em array para reutilizar a tabela genérica.
 *
 * @param response - Resposta JSON recebida da API.
 * @param key - Chave a extrair da resposta JSON.
 * @returns Lista com um único objeto extraído da resposta JSON, ou lista vazia.
 */
function pickSingle(response: unknown, key: string): ApiObject[] {
  const value = asObject(response)[key];
  return value ? [asObject(value)] : [];
}

/**
 * Converte erros da API ou erros nativos numa mensagem curta para apresentar ao utilizador.
 *
 * @param error - Erro capturado durante a operação.
 * @returns Mensagem de erro pronta a apresentar ao utilizador.
 */
function formatError(error: unknown): string {
  return formatUiError(error);
}

/**
 * Converte valores heterogéneos da API numa representação textual estável para tabelas.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Representação textual estável do valor recebido.
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "sim" : "nao";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Transforma os campos configuráveis de um formulário em payload JSON tipado para a API.
 *
 * @param fields - Configuração dos campos do formulário.
 * @param form - Dados submetidos pelo formulário.
 * @returns Payload JSON normalizado a partir do formulário.
 */
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



/**
 * Documenta a função AuthPanel no contexto deste módulo.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado para autenticação e sessão.
 */
function AuthPanel({
  onAuthChange,
}: {
  onAuthChange: (snapshot: ApiObject | null) => Promise<void>;
}) {
  const [result, setResult] = useState<unknown>(null);

  /**
   * Documenta a função refreshMe no contexto deste módulo.
   *
   * @returns Promise resolvida depois de atualizar o snapshot da sessão.
   */
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

/**
 * Renderiza um recurso CRUD configurável com moldura visual consistente entre módulos.
 *
 * @param props - Recurso com loader, pesquisa e operações.
 * @returns Elemento React com lista, ações e feedback.
 */
function ResourcePanel({ resource }: { resource: ResourceConfig }) {
    const [rows, setRows] = useState<ApiObject[]>([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<unknown>(null);
    const [busy, setBusy] = useState(false);

    /**
     * Carrega dados do módulo ativo e mantém feedback previsível para o utilizador.
     *
     * @returns Promise resolvida quando os dados visíveis são atualizados.
     */
    async function load() {
        setBusy(true);
        setError(null);
        try {
            // A pesquisa é enviada apenas quando o recurso a suporta, evitando parâmetros sem contrato.
            setRows(
                await resource.load(resource.searchable ? search : undefined),
            );
        } catch (caught) {
            setError(formatError(caught));
            setRows([]);
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        // A mudança de recurso obriga a novo carregamento sem depender da posição visual no menu.
        void load();
    }, [resource.id]);

    return (
        <PageFrame
            eyebrow="OPSA"
            title={resource.title}
            description="Consulta e operação do módulo ativo com a mesma estrutura visual usada nos restantes módulos."
            actions={
                <ActionToolbar>
                    <button type="button" onClick={load} disabled={busy}>
                        {busy ? "A carregar..." : "Atualizar"}
                    </button>
                </ActionToolbar>
            }
        >
            {resource.searchable ? (
                <form
                    className="search"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void load();
                    }}
                >
                    <input
                        type="search"
                        value={search}
                        aria-label="Pesquisar por nome ou NIF"
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <button type="submit">Pesquisar</button>
                </form>
            ) : null}
            {error ? (
                <StatusMessage
                    tone="danger"
                    title="Não foi possível carregar os dados"
                >
                    {error}
                </StatusMessage>
            ) : null}
            <DataTable rows={rows} />
            <div className="operationGrid">
                {resource.operations.map((operation) => (
                    <OperationForm
                        key={operation.title}
                        operation={operation}
                        onDone={async (value) => {
                            setResult(value);
                            // Depois de criar ou alterar dados, a lista volta a ser lida pela API.
                            await load();
                        }}
                    />
                ))}
            </div>
            <pre className="result">{JSON.stringify(result, null, 2)}</pre>
        </PageFrame>
    );
}

const roleOptions = [
  "ADMIN",
  "GESTOR",
  "CONTABILISTA",
  "OPERACIONAL",
  "AUDITOR",
].map((role) => ({ value: role, label: role }));

/**
 * Renderiza a aplicação principal e coordena autenticação, contexto de empresa e navegação entre módulos.
 *
 * @returns Elemento React renderizado da aplicação principal.
 */
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
    ],
    [],
  );
  const mf3Pages = useMemo<PageConfig[]>(
    () => [
      { id: "vat-map", title: "Mapa de IVA", render: () => <VatMapPage /> },
      {
        id: "treasury-accounts",
        title: "Contas e caixa",
        render: () => <TreasuryAccountsPage />,
      },
      {
        id: "statement-import",
        title: "Extratos bancarios",
        render: () => <StatementImportPage />,
      },
      {
        id: "cashflow-forecast",
        title: "Previsao tesouraria",
        render: () => <CashflowForecastPage />,
      },
      {
        id: "business-import",
        title: "Importacoes",
        render: () => <BusinessImportPage />,
      },
      {
        id: "saft-export",
        title: "SAF-T MVP",
        render: () => <SaftExportPage />,
      },
      {
        id: "operational-reports",
        title: "Relatorios operacionais",
        render: () => <OperationalReportsPage />,
      },
      {
        id: "executive-kpis",
        title: "KPIs executivos",
        render: () => <ExecutiveKpisPage />,
      },
    ],
    [],
  );
  const mf4Pages = useMemo<PageConfig[]>(
    () => [
      {
        id: "ai-insights",
        title: "Insights IA",
        render: () => <AiInsightsPage />,
      },
      {
        id: "ai-suggestions",
        title: "Sugestoes IA",
        render: () => <AiSuggestionsPage />,
      },
      {
        id: "ai-questions",
        title: "Perguntas IA",
        render: () => <AiQuestionsPage />,
      },
      {
        id: "smart-alerts",
        title: "Alertas inteligentes",
        render: () => <SmartAlertsPage />,
      },
      { id: "reminders", title: "Lembretes", render: () => <RemindersPage /> },
      { id: "tasks", title: "Tarefas", render: () => <TasksPage /> },
      {
        id: "notifications",
        title: "Notificacoes",
        render: () => <NotificationsPage />,
      },
      {
        id: "audit-logs",
        title: "Auditoria",
        render: () => <AuditLogsPage />,
      },
      {
        id: "integration-logs",
        title: "Logs integracao",
        render: () => <IntegrationLogsPage />,
      },
    ],
    [],
  );

  const activeResource = resources.find((resource) => resource.id === active);
  const activePage = [...mf1Pages, ...mf2Pages, ...mf3Pages, ...mf4Pages].find(
    (page) => page.id === active,
  );

  return (
    <main className="appShell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">OPSA</p>
          <h1>MF4</h1>
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
          {mf3Pages.map((page) => (
            <button
              key={page.id}
              className={active === page.id ? "active" : ""}
              type="button"
              onClick={() => setActive(page.id)}
            >
              {page.title}
            </button>
          ))}
          {mf4Pages.map((page) => (
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

/**
 * Define campos comuns de clientes e fornecedores para evitar duplicação nos formulários MF0.
 *
 * @param requireNif - Indica se o NIF é obrigatório no formulário.
 * @returns Lista de campos partilhados por clientes e fornecedores.
 */
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

/**
 * Cria as operações CRUD partilhadas por clientes e fornecedores.
 *
 * @param label - Nome amigável usado em mensagens de erro ou UI.
 * @param client - Cliente de API usado pelas operações CRUD.
 * @param requireNif - Indica se o NIF é obrigatório no formulário.
 * @returns Lista de operações CRUD para clientes ou fornecedores.
 */
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

/**
 * Define os campos reutilizáveis dos formulários de artigos e serviços.
 *
 * @returns Lista de campos reutilizáveis para formulários de artigos.
 */
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

type SafeTableRow = TableRow;

/**
 * Converte qualquer valor recebido da API num valor simples para tabela.
 *
 * @param value - Valor bruto vindo de uma linha da API.
 * @returns Valor seguro para a tabela responsiva.
 */
function toSafeCell(value: unknown): TableCellValue {
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "[valor não serializável]";
  }
}

/**
 * Renderiza dados tabulares com adaptação automática para mobile.
 *
 * @param props - Linhas devolvidas pela API para o recurso ativo.
 * @returns Tabela desktop ou cartões mobile com os mesmos dados.
 */
function DataTable({ rows }: { rows: ApiObject[] }) {
  const safeRows: SafeTableRow[] = rows.map((row) => {
    const safeRow: SafeTableRow = {};

    for (const [key, value] of Object.entries(row)) {
      // A normalização fica no wrapper para o componente de UI receber apenas valores simples.
      safeRow[key] = toSafeCell(value);
    }

    return safeRow;
  });

  return (
    <ResponsiveDataTable
      rows={safeRows}
      caption="Registos do módulo ativo"
      renderMobileTitle={(row, index) =>
        String(row.name ?? row.title ?? row.number ?? row.reference ?? `Registo ${index + 1}`)
      }
    />
  );
}

