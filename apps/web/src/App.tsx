/**
 * @file Composição principal da aplicação web OPSA, incluindo autenticação e navegação pelos módulos reais.
 */

import {
  FormEvent,
  ReactNode,
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { Permission, type PermissionName } from "./auth/permissions";
import {
  apiClient,
  JsonBody,
  type CompanyInvitation,
  type CompanyMember,
  type DemoEmailPreview,
} from "./lib/apiClient";
import {
  EMPTY_PAGE_INFO,
  normalizeCursorPage,
  type CursorPage,
  type CursorPageInfo,
  type CursorPagination,
} from "./lib/cursorPagination";
import { formatUiError } from "./lib/mf5ErrorMessages";
import { formatPerformanceWarning, measureListingLoad } from "./lib/mf5PerformanceBudget";
import { toPrimitiveValidationValues, validateMf5Form } from "./lib/mf5FormValidators";
import {
  ActionToolbar,
  EmptyState,
  PageFrame,
  StatusMessage,
  StructuredResult,
  ActionFeedbackMessage,
} from "./ui/opsaUi";
import { FieldError, FormErrorSummary, useFormErrors } from "./ui/formErrors";
import { ConfirmationDialog, ConfirmableActionButton, ModalSurface } from "./ui/modal";
import { ResponsiveDataTable } from "./ui/ResponsiveDataTable";
import type { TableCellValue, TableRow } from "./ui/ResponsiveDataTable";
import type { ResourceColumn } from "./ui/ResponsiveDataTable";
import { useActionFeedback } from "./ui/useActionFeedback";
import { CursorPaginationButton } from "./ui/CursorPaginationButton";
import type { ComponentType } from "react";
import { AiPageContextProvider } from "./ai/AiPageContext";
import { AiAssistantDrawer, AiChatPage, AiChatStateProvider, AiSettingsPage } from "./ai/AiChat";
import { DashboardProvider, useDashboard } from "./dashboard/DashboardContext";
import { DashboardPage } from "./pages/DashboardPage";
import { CompanySetupPage } from "./pages/CompanySetupPage";
import opsaLogoUrl from "./assets/opsa-logo.png";

const NAVIGATION_GROUPS = [
  { id: "overview", label: "Visão geral" },
  { id: "sales", label: "Vendas" },
  { id: "purchases", label: "Compras" },
  { id: "inventory", label: "Inventário" },
  { id: "accounting", label: "Contabilidade e fiscalidade" },
  { id: "treasury", label: "Tesouraria" },
  { id: "reports", label: "Relatórios" },
  { id: "ai-work", label: "IA e trabalho" },
  { id: "admin", label: "Administração" },
] as const;

type NavigationGroupId = (typeof NAVIGATION_GROUPS)[number]["id"];

function navigationGroupForPath(path: string): NavigationGroupId {
  if (path === "/dashboard") return "overview";
  if (path.startsWith("/sales/")) return "sales";
  if (path.startsWith("/purchases/")) return "purchases";
  if (path.startsWith("/inventory/")) return "inventory";
  if (path.startsWith("/treasury/")) return "treasury";
  if (path.startsWith("/reports/")) return "reports";
  if (path.startsWith("/ai/") || path.startsWith("/operations/")) return "ai-work";
  if (
    path.startsWith("/accounting/") ||
    path.startsWith("/tax/") ||
    path.startsWith("/compliance/")
  ) return "accounting";
  return "admin";
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  CONTABILISTA: "Contabilista",
  OPERACIONAL: "Operacional",
  AUDITOR: "Auditor",
};

function readOpenNavigationGroups(): NavigationGroupId[] {
  try {
    const parsed = JSON.parse(localStorage.getItem("opsa.nav.open-groups.v1") ?? "[]");
    const allowed = new Set(NAVIGATION_GROUPS.map(({ id }) => id));
    return Array.isArray(parsed)
      ? parsed.filter((value): value is NavigationGroupId => allowed.has(value))
      : [];
  } catch {
    return [];
  }
}

/**
 * Cria um componente lazy a partir de um export nomeado de um módulo de páginas.
 *
 * @param loader - Import dinâmico que cria o chunk do módulo.
 * @param exportName - Nome do componente exportado.
 * @returns Componente React lazy sem props.
 */
function lazyNamed(loader: () => Promise<unknown>, exportName: string) {
  return lazy(async () => {
    const module = await loader() as Record<string, ComponentType>;
    const component = module[exportName];
    if (!component) throw new Error(`Página lazy em falta: ${exportName}`);
    return { default: component };
  });
}

const PaymentsPage = lazy(() => import("./pages/PaymentsPage"));
const PurchaseApprovalPage = lazy(() => import("./pages/PurchaseApprovalPage"));
const PurchaseDocumentsPage = lazy(() => import("./pages/PurchaseDocumentsPage"));
const PurchasePostingsPage = lazy(() => import("./pages/PurchasePostingsPage"));
const ReceiptsPage = lazy(() => import("./pages/ReceiptsPage"));
const SaleApprovalPage = lazy(() => import("./pages/SaleApprovalPage"));
const SaleDocumentsPage = lazy(() => import("./pages/SaleDocumentsPage"));
const SalePostingsPage = lazy(() => import("./pages/SalePostingsPage"));
const SalesOpenItemsPage = lazy(() => import("./pages/SalesOpenItemsPage"));
const SubscriptionsPage = lazyNamed(
  () => import("./pages/SubscriptionsPage"),
  "SubscriptionsPage",
);
const ReconciliationPage = lazyNamed(
  () => import("./pages/ReconciliationPage"),
  "ReconciliationPage",
);
const VatRatesPage = lazy(() => import("./pages/VatRatesPage"));

const AccountingReportsPage = lazyNamed(
  () => import("./pages/mf2Pages"),
  "AccountingReportsPage",
);
const FifoCostPage = lazyNamed(() => import("./pages/mf2Pages"), "FifoCostPage");
const FinancialStatementsPage = lazyNamed(
  () => import("./pages/mf2Pages"),
  "FinancialStatementsPage",
);
const InventoryCountPage = lazyNamed(
  () => import("./pages/mf2Pages"),
  "InventoryCountPage",
);
const ManualJournalPage = lazyNamed(() => import("./pages/mf2Pages"), "ManualJournalPage");
const StockAlertsPage = lazyNamed(() => import("./pages/mf2Pages"), "StockAlertsPage");
const StockBalancesPage = lazyNamed(() => import("./pages/mf2Pages"), "StockBalancesPage");
const StockMovementsPage = lazyNamed(
  () => import("./pages/mf2Pages"),
  "StockMovementsPage",
);

const BusinessImportPage = lazyNamed(() => import("./pages/mf3Pages"), "BusinessImportPage");
const CashflowForecastPage = lazyNamed(
  () => import("./pages/mf3Pages"),
  "CashflowForecastPage",
);
const ExecutiveKpisPage = lazyNamed(() => import("./pages/mf3Pages"), "ExecutiveKpisPage");
const OperationalReportsPage = lazyNamed(
  () => import("./pages/mf3Pages"),
  "OperationalReportsPage",
);
const SaftExportPage = lazyNamed(() => import("./pages/mf3Pages"), "SaftExportPage");
const StatementImportPage = lazyNamed(() => import("./pages/mf3Pages"), "StatementImportPage");
const TreasuryAccountsPage = lazyNamed(
  () => import("./pages/mf3Pages"),
  "TreasuryAccountsPage",
);
const VatMapPage = lazyNamed(() => import("./pages/mf3Pages"), "VatMapPage");

const AiInsightsPage = lazyNamed(() => import("./pages/mf4Pages"), "AiInsightsPage");
const AiSuggestionsPage = lazyNamed(() => import("./pages/mf4Pages"), "AiSuggestionsPage");
const AuditLogsPage = lazyNamed(() => import("./pages/mf4Pages"), "AuditLogsPage");
const IntegrationLogsPage = lazyNamed(
  () => import("./pages/mf4Pages"),
  "IntegrationLogsPage",
);
const NotificationsPage = lazyNamed(() => import("./pages/mf4Pages"), "NotificationsPage");
const RemindersPage = lazyNamed(() => import("./pages/mf4Pages"), "RemindersPage");
const SmartAlertsPage = lazyNamed(() => import("./pages/mf4Pages"), "SmartAlertsPage");
const TasksPage = lazyNamed(() => import("./pages/mf4Pages"), "TasksPage");

type ApiObject = Record<string, unknown>;
type SafeTableRow = TableRow;
type FieldKind =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "accountRows";

interface FieldConfig {
  name: string;
  label: string;
  kind?: FieldKind;
  required?: boolean;
  defaultValue?: string;
  min?: number;
  max?: number;
  options?: Array<{ value: string; label: string }>;
  mf5ValidationName?: string;
  autoComplete?: string;
}

interface OperationConfig {
  title: string;
  submitLabel: string;
  fields: FieldConfig[];
  run: (values: ApiObject) => Promise<unknown>;
  afterSuccess?: () => Promise<void> | void;
  requiredPermission?: PermissionName;
}

type OperationResult = Awaited<ReturnType<OperationConfig["run"]>>;

interface ResourceConfig {
  id: string;
  path: string;
  title: string;
  load: (
    search?: string,
    pagination?: CursorPagination,
  ) => Promise<CursorPage<ApiObject>>;
  searchable?: boolean;
  operations: OperationConfig[];
  requiredPermission?: PermissionName;
  customRender?: () => ReactNode;
}

interface PageConfig {
  id: string;
  path: string;
  title: string;
  render: () => ReactNode;
  requiredPermission?: PermissionName;
  allowedRoles?: string[];
}

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
  const object = asObject(response);
  const value = Array.isArray(object.items) ? object.items : object[key];
  return Array.isArray(value) ? value.map(asObject) : [];
}

/**
 * Normaliza uma listagem para o envelope cursor usado pelo painel genérico.
 * Endpoints não paginados continuam a devolver uma página terminal explícita.
 *
 * @param response - Resposta JSON recebida da API.
 * @param key - Chave alternativa para endpoints sem envelope.
 * @returns Página normalizada de objetos.
 */
function pickPage(response: unknown, key: string): CursorPage<ApiObject> {
  return normalizeCursorPage(response, key, asObject);
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
 * Transforma os campos configuráveis de um formulário em payload JSON tipado para a API.
 *
 * @param fields - Configuração dos campos do formulário.
 * @param form - Dados submetidos pelo formulário.
 * @returns Payload JSON normalizado a partir do formulário.
 */
function normalizeFormValues(fields: FieldConfig[], form: FormData): ApiObject {
  const values: ApiObject = {};

  for (const field of fields) {
    if (field.kind === "accountRows") {
      const codes = form.getAll(`${field.name}.code`).map((value) => String(value).trim());
      const names = form.getAll(`${field.name}.name`).map((value) => String(value).trim());
      const rows = codes.map((code, index) => ({ code, name: names[index] ?? "" }));
      if (rows.length === 0 || rows.some(({ code, name }) => !code || !name)) {
        throw new Error("Cada linha do plano de contas precisa de código e nome.");
      }
      values[field.name] = rows;
      continue;
    }

    const rawValue = String(form.get(field.name) ?? "");
    const trimmed = rawValue.trim();

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
 * Editor simples de linhas do plano de contas, sem exigir JSON técnico.
 *
 * @param props - Nome base usado no `FormData` e label visível.
 * @returns Fieldset com linhas adicionáveis e removíveis.
 */
function AccountRowsEditor({ name, label }: { name: string; label: string }) {
  const [rowKeys, setRowKeys] = useState([0]);
  const nextKey = useRef(1);

  return (
    <fieldset className="lineEditor">
      <legend>{label}</legend>
      {rowKeys.map((key, index) => (
        <div className="lineEditor__row" key={key}>
          <label>
            <span>Código da conta {index + 1}</span>
            <input name={`${name}.code`} required inputMode="numeric" pattern="[0-9]{1,8}" />
          </label>
          <label>
            <span>Nome da conta {index + 1}</span>
            <input name={`${name}.name`} required />
          </label>
          <button
            type="button"
            disabled={rowKeys.length === 1}
            onClick={() => setRowKeys((current) => current.filter((item) => item !== key))}
          >
            Remover linha
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const key = nextKey.current;
          nextKey.current += 1;
          setRowKeys((current) => [...current, key]);
        }}
      >
        Adicionar linha
      </button>
    </fieldset>
  );
}

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

  if (Array.isArray(value)) return `${value.length} item(ns)`;
  return "Detalhes disponíveis";
}

/**
 * Renderiza dados tabulares com adaptacao automatica para mobile.
 *
 * @param props - Linhas devolvidas pela API para o recurso ativo.
 * @returns Tabela desktop ou cartoes mobile com os mesmos dados.
 */
const RESOURCE_COLUMNS: Record<string, ResourceColumn[]> = {
  companies: [
    { key: "companyName", label: "Empresa", priority: "primary" },
    { key: "nif", label: "NIF", priority: "secondary" },
    { key: "role", label: "Papel", priority: "secondary" },
  ],
  profile: [
    { key: "legalName", label: "Denominação legal", priority: "primary" },
    { key: "nif", label: "NIF", priority: "secondary" },
    { key: "city", label: "Cidade", priority: "secondary" },
    { key: "country", label: "País", priority: "desktop" },
    { key: "currency", label: "Moeda", priority: "secondary" },
  ],
  accounts: [
    { key: "code", label: "Código", priority: "primary" },
    { key: "name", label: "Conta", priority: "secondary" },
    { key: "parentCode", label: "Conta principal", priority: "secondary" },
    { key: "level", label: "Nível", priority: "desktop" },
    { key: "isActive", label: "Ativa", priority: "secondary" },
  ],
  periods: [
    { key: "name", label: "Período", priority: "primary" },
    { key: "fiscalYear", label: "Exercício", priority: "secondary" },
    { key: "startDate", label: "Início", priority: "secondary" },
    { key: "endDate", label: "Fim", priority: "secondary" },
    { key: "status", label: "Estado", priority: "secondary" },
  ],
  customers: [
    { key: "name", label: "Cliente", priority: "primary" },
    { key: "nif", label: "NIF", priority: "secondary" },
    { key: "email", label: "Email", priority: "secondary" },
    { key: "phone", label: "Telefone", priority: "secondary" },
    { key: "city", label: "Cidade", priority: "desktop" },
  ],
  suppliers: [
    { key: "name", label: "Fornecedor", priority: "primary" },
    { key: "nif", label: "NIF", priority: "secondary" },
    { key: "email", label: "Email", priority: "secondary" },
    { key: "phone", label: "Telefone", priority: "secondary" },
    { key: "city", label: "Cidade", priority: "desktop" },
  ],
  items: [
    { key: "sku", label: "SKU", priority: "primary" },
    { key: "name", label: "Artigo ou serviço", priority: "secondary" },
    { key: "type", label: "Tipo", priority: "secondary" },
    { key: "priceCents", label: "Preço", priority: "secondary" },
    { key: "costCents", label: "Custo", priority: "desktop" },
    { key: "vatRateBps", label: "IVA", priority: "desktop" },
  ],
  warehouses: [
    { key: "code", label: "Código", priority: "primary" },
    { key: "name", label: "Armazém", priority: "secondary" },
    { key: "isActive", label: "Ativo", priority: "secondary" },
  ],
};

function DataTable({
  rows,
  resourceId,
  emptyState,
  renderRowActions,
}: {
  rows: ApiObject[];
  resourceId: string;
  emptyState: ReactNode;
  renderRowActions?: (row: SafeTableRow) => ReactNode;
}) {
  const safeRows: SafeTableRow[] = rows.map((row) => {
    const safeRow: SafeTableRow = {};

    for (const [key, value] of Object.entries(row)) {
      // A normalizacao fica no wrapper para o componente de UI receber apenas valores simples.
      safeRow[key] = toSafeCell(value);
    }

    return safeRow;
  });

  return (
    <ResponsiveDataTable
      rows={safeRows}
      columns={RESOURCE_COLUMNS[resourceId] ?? []}
      caption="Registos do módulo ativo"
      emptyState={emptyState}
      renderRowActions={renderRowActions}
      renderMobileTitle={(row, index) =>
        String(row.name ?? row.title ?? row.number ?? row.reference ?? `Registo ${index + 1}`)
      }
    />
  );
}

/**
 * Renderiza uma operacao configuravel com feedback imediato de submissao.
 *
 * @param props - Operacao e callback executado depois de a API responder.
 * @returns Formulario React com estados visiveis de execucao, sucesso e erro.
 */
function OperationForm({
  operation,
  onDone,
  resourceOptions = [],
  initialValues = {},
  hiddenFieldNames = [],
}: {
  operation: OperationConfig;
  onDone: (result: OperationResult) => Promise<void>;
  resourceOptions?: Array<{ value: string; label: string }>;
  initialValues?: ApiObject;
  hiddenFieldNames?: string[];
}) {
  const action = useActionFeedback();
  const formErrors = useFormErrors();

  /**
   * Submete a operacao, atualiza a lista dependente e apresenta feedback em cada estado.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const values = normalizeFormValues(
      operation.fields,
      new FormData(formElement),
    );
    const validationErrors = validateMf5Form(
      toPrimitiveValidationValues(values),
      operation.fields.map((field) => ({
        name: field.name,
        validationName: field.mf5ValidationName,
        required: field.kind === "accountRows" ? false : field.required,
      })),
    );
    if (formErrors.applyErrors(validationErrors, formElement)) return;
    formErrors.resetErrors();

    try {
      await action.run(
        async () => {
          const result = await operation.run(values);

          await operation.afterSuccess?.();
          await onDone(result);
          return result;
        },
        {
          startMessage: "A validar e enviar dados...",
          successMessage: "Dados guardados e lista atualizada.",
          errorMessage: "Nao foi possivel guardar os dados.",
        },
      );

      // O formulario so e limpo depois de a operacao terminar com sucesso.
      formElement.reset();
    } catch {
      // A mensagem de erro ja foi colocada no estado pelo hook.
    }
  }

  return (
    <form
      className="operation"
      onSubmit={handleSubmit}
      onChange={(event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
          formErrors.clearField(target.name);
        }
      }}
    >
      <h3>{operation.title}</h3>
      <FormErrorSummary errors={formErrors.errors} summaryRef={formErrors.summaryRef} />
      <div className="fields">
        {operation.fields.map((field) => {
          const initialValue = initialValues[field.name];
          const defaultValue = initialValue === undefined || initialValue === null
            ? field.defaultValue
            : String(initialValue);
          if (hiddenFieldNames.includes(field.name)) {
            return <input key={field.name} type="hidden" name={field.name} value={defaultValue ?? ""} />;
          }
          if (field.kind === "accountRows") {
            return <AccountRowsEditor key={field.name} name={field.name} label={field.label} />;
          }
          const options =
            field.options ??
            (["id", "companyId"].includes(field.name) ? resourceOptions : undefined);
          return (
            <label key={field.name}>
              <span>{field.label}</span>
              {field.kind === "textarea" ? (
                <textarea
                  name={field.name}
                  required={field.required}
                  defaultValue={defaultValue}
                  rows={4}
                  autoComplete={field.autoComplete}
                  aria-invalid={Boolean(formErrors.errors[field.name])}
                  aria-describedby={formErrors.errors[field.name] ? `${field.name}-error` : undefined}
                />
              ) : field.kind === "select" || options ? (
                <select
                  name={field.name}
                  required={field.required}
                  defaultValue={defaultValue ?? ""}
                  autoComplete={field.autoComplete}
                  aria-invalid={Boolean(formErrors.errors[field.name])}
                  aria-describedby={formErrors.errors[field.name] ? `${field.name}-error` : undefined}
                >
                  <option value="" disabled={field.required}>
                    Selecionar
                  </option>
                  {options?.map((option) => (
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
                  defaultValue={defaultValue}
                  min={field.min}
                  max={field.max}
                  autoComplete={field.autoComplete}
                  aria-invalid={Boolean(formErrors.errors[field.name])}
                  aria-describedby={formErrors.errors[field.name] ? `${field.name}-error` : undefined}
                />
              )}
              <FieldError field={field.name} message={formErrors.errors[field.name]} />
            </label>
          );
        })}
      </div>
      <ActionFeedbackMessage feedback={action.feedback} />
      <button type="submit" disabled={action.busy}>
        {action.busy ? "A executar..." : operation.submitLabel}
      </button>
    </form>
  );
}

/**
 * Documenta a função AuthPanel no contexto deste módulo.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado para autenticação e sessão.
 */
function AuthPanel({
  onSessionRefresh,
  mode = "login",
}: {
  onSessionRefresh: () => Promise<void>;
  mode?: "login" | "register" | "request";
}) {
  /**
   * Documenta a função refreshMe no contexto deste módulo.
   *
   * @returns Promise resolvida depois de atualizar o snapshot da sessão.
   */
  async function refreshMe() {
    await onSessionRefresh();
  }

  const operations: OperationConfig[] = [
    {
      title: "Criar conta",
      submitLabel: "Criar conta",
      fields: [
        { name: "email", label: "Email", kind: "email", required: true, autoComplete: "email" },
        { name: "password", label: "Palavra-passe", kind: "password", required: true, autoComplete: "new-password" },
        { name: "name", label: "Nome", autoComplete: "name" },
      ],
      run: (values) => apiClient.auth.register(values as JsonBody),
      afterSuccess: refreshMe,
    },
    {
      title: "Iniciar sessão",
      submitLabel: "Iniciar sessão",
      fields: [
        { name: "email", label: "Email", kind: "email", required: true, autoComplete: "email" },
        { name: "password", label: "Palavra-passe", kind: "password", required: true, autoComplete: "current-password" },
      ],
      run: (values) => apiClient.auth.login(values as JsonBody),
      afterSuccess: refreshMe,
    },
    {
      title: "Recuperar palavra-passe",
      submitLabel: "Pedir link",
      fields: [{ name: "email", label: "Email", kind: "email", required: true, autoComplete: "email" }],
      run: (values) => apiClient.auth.forgotPassword(values as JsonBody),
    },
  ];
  const selectedOperation = operations.find((operation) => (
    mode === "login" ? operation.title === "Iniciar sessão"
      : mode === "register" ? operation.title === "Criar conta"
        : operation.title === "Recuperar palavra-passe"
  ))!;
  const pageTitle = mode === "login"
    ? "Iniciar sessão"
    : mode === "register"
      ? "Criar conta"
      : "Recuperar palavra-passe";

  return (
    <section className="panel">
      <div className="sectionHeader">
        <h2>{pageTitle}</h2>
      </div>
      <div className="operationGrid">
        <OperationForm operation={selectedOperation} onDone={async () => undefined} />
      </div>
      <div className="authLinks">
        {mode !== "login" ? <Link to="/auth">Já tenho conta</Link> : null}
        {mode !== "register" ? <Link to="/registar">Criar conta</Link> : null}
        {mode !== "request" ? <Link to="/recuperar-password/pedir">Recuperar palavra-passe</Link> : null}
        <Link to="/demo/email-inbox">Inbox da demonstração</Link>
      </div>
    </section>
  );
}

/**
 * Retira um token secreto do fragmento e limpa a barra de endereço antes do primeiro paint.
 *
 * O fragmento nunca é enviado ao servidor pelo browser. Depois de lido fica apenas em memória
 * React e `replaceState` impede que continue visível no histórico ou seja copiado por engano.
 *
 * @returns Token normalizado, ou string vazia quando o link não o contém.
 */
function usePrivateFragmentToken() {
  const tokenRef = useRef<string | null>(null);
  if (tokenRef.current === null) {
    tokenRef.current = new URLSearchParams(window.location.hash.slice(1))
      .get("token")
      ?.trim() ?? "";
  }
  const [, setFragmentRevision] = useState(0);

  useLayoutEffect(() => {
    const consumeCurrentFragment = () => {
      const currentHash = window.location.hash;
      if (!currentHash) return;
      const nextToken = new URLSearchParams(currentHash.slice(1))
        .get("token")
        ?.trim();
      if (nextToken) tokenRef.current = nextToken;
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
      setFragmentRevision((current) => current + 1);
    };

    consumeCurrentFragment();
    window.addEventListener("hashchange", consumeCurrentFragment);
    window.addEventListener("popstate", consumeCurrentFragment);
    return () => {
      window.removeEventListener("hashchange", consumeCurrentFragment);
      window.removeEventListener("popstate", consumeCurrentFragment);
    };
  }, []);

  return tokenRef.current ?? "";
}

interface InvitationPreview {
  companyName: string;
  role: string;
  emailMasked: string;
  expiresAt: string;
}

/**
 * Executa preview público e aceitação autenticada sem colocar o token em query params ou inputs.
 *
 * @returns Página pública de convite com autenticação embutida quando necessária.
 */
function InvitationAcceptancePage() {
  const token = usePrivateFragmentToken();
  const auth = useAuth();
  const navigate = useNavigate();
  const action = useActionFeedback();
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;
    if (token.length < 32) {
      setPreviewLoading(false);
      setPreviewError("O link de convite está incompleto ou já não contém um token válido.");
      return () => {
        active = false;
      };
    }

    void apiClient.invitations
      .preview(token)
      .then(({ invitation }) => {
        if (active) setPreview(invitation);
      })
      .catch((caught) => {
        if (active) {
          setPreviewError(
            caught instanceof Error ? caught.message : "Não foi possível validar o convite.",
          );
        }
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function accept() {
    if (!preview || token.length < 32) return;
    try {
      await action.run(
        async () => {
          await apiClient.invitations.accept(token);
          const snapshot = await auth.refreshSession();
          if (!snapshot?.activeCompanyId) {
            throw new Error("O convite foi aceite, mas não foi possível atualizar a empresa ativa.");
          }
          navigate("/companies", { replace: true });
        },
        {
          startMessage: "A aceitar o convite...",
          successMessage: "Convite aceite e empresa ativada.",
          errorMessage: "Não foi possível aceitar o convite.",
        },
      );
    } catch {
      // O hook mantém o erro e permite repetir sem voltar a expor o token.
    }
  }

  return (
    <PageFrame
      title="Aceitar convite"
      description="Confirma a empresa e autentica-te com o endereço que recebeu o convite."
    >
      {previewLoading ? (
        <StatusMessage tone="neutral" title="A validar convite">
          A confirmar validade e empresa do convite.
        </StatusMessage>
      ) : null}
      {previewError ? (
        <StatusMessage tone="danger" title="Convite indisponível">
          {previewError}
        </StatusMessage>
      ) : null}
      {preview ? (
        <section className="operation" aria-labelledby="invitation-preview-title">
          <h3 id="invitation-preview-title">Detalhes do convite</h3>
          <p>Empresa: {preview.companyName}</p>
          <p>Papel: {ROLE_LABELS[preview.role] ?? preview.role}</p>
          <p>Email: {preview.emailMasked}</p>
          <p>Válido até: {new Date(preview.expiresAt).toLocaleString("pt-PT")}</p>
        </section>
      ) : null}
      {preview && auth.status === "anonymous" ? (
        <AuthPanel
          onSessionRefresh={async () => {
            await auth.refreshSession();
          }}
        />
      ) : null}
      {preview && auth.status === "bootstrapping" ? (
        <StatusMessage tone="neutral" title="A validar sessão">
          A confirmar se já existe uma sessão autenticada.
        </StatusMessage>
      ) : null}
      {preview && auth.status === "error" ? (
        <StatusMessage tone="danger" title="Sessão indisponível">
          <p>{auth.permissionsError ?? "Não foi possível validar a sessão."}</p>
          <button type="button" onClick={() => void auth.refreshSession()}>
            Tentar novamente
          </button>
        </StatusMessage>
      ) : null}
      {preview && auth.status === "authenticated" ? (
        <section className="operation">
          <h3>Confirmar adesão</h3>
          <p>O convite será associado à sessão autenticada atual.</p>
          <button type="button" disabled={action.busy} onClick={() => void accept()}>
            {action.busy ? "A aceitar..." : "Aceitar convite"}
          </button>
        </section>
      ) : null}
      <ActionFeedbackMessage feedback={action.feedback} />
    </PageFrame>
  );
}

/**
 * Conclui a recuperação sem apresentar ou pedir que a pessoa copie o token secreto.
 *
 * @returns Formulário público de definição de nova password.
 */
function PasswordResetPage() {
  const token = usePrivateFragmentToken();
  const auth = useAuth();
  const action = useActionFeedback();
  const [completed, setCompleted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("passwordConfirmation") ?? "");

    try {
      await action.run(
        async () => {
          if (token.length < 32) throw new Error("O link de recuperação é inválido ou expirou.");
          if (password.length < 10) {
            throw new Error("A nova password deve ter pelo menos 10 caracteres.");
          }
          if (password !== confirmation) throw new Error("As passwords não coincidem.");
          await apiClient.auth.resetPassword({ token, password });
          auth.clearSession();
          setCompleted(true);
        },
        {
          startMessage: "A alterar a password...",
          successMessage: "Password alterada. Inicia uma nova sessão.",
          errorMessage: "Não foi possível alterar a password.",
        },
      );
    } catch {
      // O formulário mantém os valores para correção e o token continua apenas em memória.
    }
  }

  return (
    <PageFrame title="Recuperar password" description="Define uma nova password para a tua conta.">
      {token.length < 32 ? (
        <StatusMessage tone="danger" title="Link inválido">
          O link de recuperação está incompleto ou já não é válido. Pede um novo link no login.
        </StatusMessage>
      ) : null}
      {!completed && token.length >= 32 ? (
        <form className="operation" onSubmit={submit}>
          <div className="fields">
            <label>
              <span>Nova password</span>
              <input name="password" type="password" minLength={10} autoComplete="new-password" required />
            </label>
            <label>
              <span>Confirmar nova password</span>
              <input
                name="passwordConfirmation"
                type="password"
                minLength={10}
                autoComplete="new-password"
                required
              />
            </label>
          </div>
          <button type="submit" disabled={action.busy}>
            {action.busy ? "A alterar..." : "Alterar password"}
          </button>
        </form>
      ) : null}
      <ActionFeedbackMessage feedback={action.feedback} />
      {completed ? <Link to="/auth">Ir para o login</Link> : null}
    </PageFrame>
  );
}

/**
 * Mostra apenas os links temporários produzidos pelo provider simulado.
 * O código de acesso e os resultados vivem exclusivamente no estado React.
 *
 * @returns Página pública da inbox académica local.
 */
function DemoEmailInboxPage() {
  const action = useActionFeedback();
  const [accessKey, setAccessKey] = useState("");
  const [messages, setMessages] = useState<DemoEmailPreview[]>([]);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await action.run(
        async () => {
          const response = await apiClient.demoEmailInbox.unlock(accessKey);
          setMessages(response.messages);
        },
        {
          startMessage: "A abrir a inbox...",
          successMessage: "Inbox de demonstração atualizada.",
          errorMessage: "Não foi possível abrir a inbox de demonstração.",
        },
      );
    } catch {
      // O código fica apenas em memória para permitir nova tentativa.
    }
  }

  return (
    <PageFrame
      title="Inbox da demonstração"
      description="Disponível apenas no perfil local com email simulado. Os links expiram da inbox após 24 horas."
    >
      <form className="operation" onSubmit={unlock}>
        <label>
          <span>Código de acesso da demo</span>
          <input
            name="accessKey"
            type="password"
            autoComplete="off"
            value={accessKey}
            onChange={(event) => setAccessKey(event.currentTarget.value)}
            required
          />
        </label>
        <button type="submit" disabled={action.busy || !accessKey.trim()}>
          {action.busy ? "A abrir..." : "Abrir inbox"}
        </button>
      </form>
      <ActionFeedbackMessage feedback={action.feedback} />
      {messages.length === 0 && action.feedback.tone === "success" ? (
        <p className="empty">Ainda não existem convites ou recuperações simulados.</p>
      ) : null}
      <div className="operationGrid">
        {messages.map((message) => (
          <article
            className="operation"
            key={`${message.type}-${message.recipient}-${message.createdAt}`}
          >
            <h3>{message.subject}</h3>
            <p>{message.recipient}</p>
            <p>
              {message.type === "COMPANY_INVITATION" ? "Convite" : "Recuperação"}
              {" · "}
              {new Date(message.createdAt).toLocaleString("pt-PT")}
            </p>
            <a href={message.actionUrl}>Abrir ligação temporária</a>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}

/**
 * Cria a primeira empresa e respetivo perfil fiscal numa única operação de onboarding.
 *
 * @returns Formulário disponível apenas a utilizadores autenticados sem empresa ativa.
 */
function OnboardingPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (auth.snapshot?.activeCompanyId) return <Navigate to="/companies" replace />;
  return (
    <CompanySetupPage
      mode="initial"
      onCreated={async () => {
        const snapshot = await auth.refreshSession();
        if (!snapshot?.activeCompanyId) {
          throw new Error("A sessão não recebeu a empresa criada.");
        }
        navigate("/dashboard", { replace: true });
      }}
    />
  );
}

/** Monta o mesmo bootstrap para uma empresa adicional sem duplicar o formulário. */
function AdditionalCompanyPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  if (!auth.snapshot?.activeCompanyId) return <Navigate to="/onboarding" replace />;
  return (
    <CompanySetupPage
      mode="additional"
      onCreated={async () => {
        const snapshot = await auth.refreshSession();
        if (!snapshot?.activeCompanyId) {
          throw new Error("A sessão não recebeu a nova empresa ativa.");
        }
        navigate("/dashboard", { replace: true });
      }}
    />
  );
}

/**
 * Constrói uma opção legível a partir de qualquer linha de recurso conhecida.
 *
 * @param row - Linha carregada na listagem atual.
 * @returns Opção de seleção ou `null` quando não existe identificador público.
 */
function resourceOption(row: ApiObject) {
  const value = [row.id, row.userId, row.companyId].find(
    (candidate): candidate is string => typeof candidate === "string" && candidate.length > 0,
  );
  if (!value) return null;
  const readable = [row.name, row.companyName, row.email, row.code, row.number, row.reference]
    .find((candidate) => typeof candidate === "string" && candidate.length > 0);
  return { value, label: typeof readable === "string" ? readable : value };
}

/**
 * Renderiza um recurso CRUD configurável com moldura visual consistente entre módulos.
 *
 * @param props - Recurso com loader, pesquisa e operações.
 * @returns Elemento React com lista, ações e feedback.
 */
function ResourcePanel({ resource }: { resource: ResourceConfig }) {
  const [rows, setRows] = useState<ApiObject[]>([]);
  const [pageInfo, setPageInfo] = useState<CursorPageInfo>(EMPTY_PAGE_INFO);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [result, setResult] = useState<OperationResult | null>(null);
  const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);
  const [activeOperation, setActiveOperation] = useState<{
    operation: OperationConfig;
    row?: SafeTableRow;
  } | null>(null);
  const [pendingDanger, setPendingDanger] = useState<{
    operation: OperationConfig;
    row: SafeTableRow;
  } | null>(null);
  const loadFeedback = useActionFeedback();
  const dangerFeedback = useActionFeedback();
  const { hasPermission, snapshot } = useAuth();
  const availableOperations = resource.operations.filter(
    (operation) =>
      !operation.requiredPermission || hasPermission(operation.requiredPermission),
  );
  const resourceOptions = rows.flatMap((row) => {
    const option = resourceOption(row);
    return option ? [option] : [];
  });
  const identifierNames = new Set(["id", "companyId", "userId"]);
  const isRowOperation = (operation: OperationConfig) => (
    operation.fields.some((field) => identifierNames.has(field.name)) ||
    /^(Atualizar|Guardar|Editar|Selecionar)/i.test(operation.title)
  );
  const rowOperations = availableOperations.filter(isRowOperation);
  const headerOperations = availableOperations.filter((operation) => !isRowOperation(operation));

  function rowIdentity(row: SafeTableRow) {
    return String(row.id ?? row.companyId ?? row.userId ?? "");
  }

  function rowLabel(row: SafeTableRow) {
    return String(
      row.name ?? row.companyName ?? row.legalName ?? row.email ?? row.code ??
      row.number ?? row.reference ?? "Registo selecionado",
    );
  }

  function operationInitialValues(operation: OperationConfig, row: SafeTableRow) {
    const identity = rowIdentity(row);
    return Object.fromEntries(operation.fields.map((field) => [
      field.name,
      row[field.name] ?? (identifierNames.has(field.name) ? identity : undefined),
    ]));
  }

  function isDangerous(operation: OperationConfig) {
    return /^(Remover|Desativar|Revogar|Rejeitar|Emitir|Aprovar|Contabilizar|Fechar|Publicar|Cancelar)/i.test(operation.title);
  }

  function requiresTerminalAcknowledgement(operation: OperationConfig) {
    return /^(Contabilizar|Fechar|Cancelar)/i.test(operation.title);
  }

  async function finishOperation(value: OperationResult) {
    setResult(value);
    await load(false, appliedSearch);
  }

  async function runDangerousOperation() {
    if (!pendingDanger) return;
    const { operation, row } = pendingDanger;
    try {
      await dangerFeedback.run(
        async () => {
          const result = await operation.run(operationInitialValues(operation, row));
          await operation.afterSuccess?.();
          await finishOperation(result);
          return result;
        },
        {
          startMessage: "A confirmar a operação…",
          successMessage: "Operação concluída.",
          errorMessage: "Não foi possível concluir a operação.",
        },
      );
      setPendingDanger(null);
    } catch {
      // O diálogo permanece aberto para permitir rever o erro e tentar novamente.
    }
  }

  /**
   * Carrega dados do modulo ativo e apresenta o estado da acao ao utilizador.
   *
   * @returns Promise resolvida quando os dados visíveis são atualizados.
   */
  async function load(append = false, requestedSearch = appliedSearch) {
    const cursor = append ? pageInfo.nextCursor ?? undefined : undefined;
    if (append && !cursor) return;
    const querySearch = append ? appliedSearch : requestedSearch;
    setPerformanceWarning(null);

    try {
      await loadFeedback.run(
        async () => {
          // A pesquisa e enviada apenas quando o recurso a suporta, evitando parametros sem contrato.
          const measured = await measureListingLoad(
            resource.title,
            () => resource.load(
              resource.searchable ? querySearch : undefined,
              { cursor, limit: 50 },
            ),
          );
          setRows((current) =>
            append ? [...current, ...measured.result.items] : measured.result.items,
          );
          setPageInfo(measured.result.pageInfo);
          if (!append) setAppliedSearch(querySearch);
          setPerformanceWarning(formatPerformanceWarning(measured.sample));
          return measured.result;
        },
        {
          startMessage: "A atualizar dados...",
          successMessage: "Lista atualizada.",
          errorMessage: "Nao foi possivel carregar a lista.",
        },
      );
    } catch {
      // Em erro, a tabela fica vazia para nao mostrar dados possivelmente desatualizados.
      if (!append) {
        setRows([]);
        setPageInfo(EMPTY_PAGE_INFO);
      }
      setPerformanceWarning(null);
    }
  }

  useEffect(() => {
    // A mudança de recurso obriga a novo carregamento sem depender da posição visual no menu.
    setRows([]);
    setPageInfo(EMPTY_PAGE_INFO);
    setSearch("");
    setAppliedSearch("");
    void load(false, "");
  }, [resource.id]);

  return (
    <PageFrame
      eyebrow="OPSA"
      title={resource.title}
      description="Consulta e operação do módulo ativo com a mesma estrutura visual usada nos restantes módulos."
      actions={
        <ActionToolbar>
          {headerOperations.map((operation) => (
            <button
              key={operation.title}
              type="button"
              onClick={() => setActiveOperation({ operation })}
            >
              {operation.submitLabel}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void load(false, appliedSearch)}
            disabled={loadFeedback.busy}
          >
            {loadFeedback.busy ? "A carregar..." : "Atualizar"}
          </button>
        </ActionToolbar>
      }
    >
      {resource.searchable ? (
        <form
          className="search"
          onSubmit={(event) => {
            event.preventDefault();
            void load(false, search);
          }}
        >
          <input
            type="search"
            value={search}
            aria-label="Pesquisar por nome ou NIF"
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit" disabled={loadFeedback.busy}>
            Pesquisar
          </button>
        </form>
      ) : null}
      <ActionFeedbackMessage feedback={loadFeedback.feedback} />
      {performanceWarning ? (
        <StatusMessage tone="warning" title="Aviso de performance">
          {performanceWarning}
        </StatusMessage>
      ) : null}
      <DataTable
        rows={rows}
        resourceId={resource.id}
        renderRowActions={rowOperations.length > 0 ? (row) => (
          <details className="rowActions">
            <summary>Mais ações</summary>
            <div className="rowActions__menu">
              {rowOperations.map((operation) => (
                <button
                  key={operation.title}
                  type="button"
                  className={isDangerous(operation) ? "dangerButton" : undefined}
                  onClick={() => {
                    if (isDangerous(operation)) {
                      setPendingDanger({ operation, row });
                    } else {
                      setActiveOperation({ operation, row });
                    }
                  }}
                >
                  {operation.title}
                </button>
              ))}
            </div>
          </details>
        ) : undefined}
        emptyState={
          <EmptyState
            title={appliedSearch ? "Sem resultados" : `Ainda não existem registos em ${resource.title}`}
            description={appliedSearch
              ? `Não foram encontrados resultados para “${appliedSearch}”.`
              : availableOperations.length > 0
                ? "Utiliza uma das ações disponíveis para criar o primeiro registo."
                : "A tua função permite consultar este módulo, mas não criar registos."}
            action={appliedSearch ? (
              <button type="button" onClick={() => {
                setSearch("");
                void load(false, "");
              }}>Limpar pesquisa</button>
            ) : undefined}
          />
        }
      />
      <CursorPaginationButton
        hasNextPage={pageInfo.hasNextPage}
        busy={loadFeedback.busy}
        label={resource.title}
        onLoadMore={() => load(true)}
      />
      <ModalSurface
        open={Boolean(activeOperation)}
        title={activeOperation?.operation.title ?? "Operação"}
        onClose={() => setActiveOperation(null)}
      >
        {activeOperation ? (
          <OperationForm
            operation={activeOperation.operation}
            resourceOptions={resourceOptions}
            initialValues={activeOperation.row
              ? operationInitialValues(activeOperation.operation, activeOperation.row)
              : undefined}
            hiddenFieldNames={activeOperation.row
              ? activeOperation.operation.fields
                .filter((field) => identifierNames.has(field.name))
                .map((field) => field.name)
              : []}
            onDone={async (value) => {
              await finishOperation(value);
              setActiveOperation(null);
            }}
          />
        ) : null}
      </ModalSurface>
      <ConfirmationDialog
        open={Boolean(pendingDanger)}
        title={pendingDanger?.operation.title ?? "Confirmar operação"}
        description="Esta operação altera o estado do registo e pode ter consequências funcionais. Confirma antes de continuar."
        confirmLabel={pendingDanger?.operation.submitLabel ?? "Confirmar"}
        entityLabel={pendingDanger ? rowLabel(pendingDanger.row) : undefined}
        companyName={snapshot?.company?.name}
        busy={dangerFeedback.busy}
        requireAcknowledgement={pendingDanger
          ? requiresTerminalAcknowledgement(pendingDanger.operation)
          : false}
        onCancel={() => setPendingDanger(null)}
        onConfirm={runDangerousOperation}
      />
      <StructuredResult value={result} />
    </PageFrame>
  );
}

const roleOptions = [
  "ADMIN",
  "GESTOR",
  "CONTABILISTA",
  "OPERACIONAL",
  "AUDITOR",
].map((role) => ({ value: role, label: ROLE_LABELS[role] ?? role }));

/**
 * Gere membros e convites respeitando a hierarquia ADMIN/GESTOR também na UI.
 *
 * O backend continua a ser a fronteira de segurança; os filtros visuais evitam
 * apresentar comandos que serão necessariamente recusados.
 *
 * @returns Página de administração de utilizadores e convites da empresa ativa.
 */
function CompanyUsersPage() {
  const auth = useAuth();
  const action = useActionFeedback();
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isAdmin = auth.hasRole("ADMIN");
  const availableRoles = isAdmin
    ? roleOptions
    : roleOptions.filter(({ value }) => value !== "ADMIN");

  async function refresh() {
    try {
      const [memberResponse, invitationResponse] = await Promise.all([
        apiClient.companies.users(),
        apiClient.companies.invitations(),
      ]);
      setMembers(memberResponse.users);
      setInvitations(invitationResponse.invitations);
      setLoadError(null);
    } catch (caught) {
      setLoadError(formatUiError(caught));
    }
  }

  useEffect(() => {
    void refresh();
  }, [auth.snapshot?.activeCompanyId]);

  async function runMutation(operation: () => Promise<unknown>, successMessage: string) {
    try {
      await action.run(
        async () => {
          const result = await operation();
          await refresh();
          return result;
        },
        {
          startMessage: "A atualizar utilizadores...",
          successMessage,
          errorMessage: "Não foi possível atualizar os utilizadores da empresa.",
        },
      );
    } catch {
      // O feedback comum mantém o erro visível e permite repetir a ação.
    }
  }

  function canManageRole(role: string) {
    return isAdmin || role !== "ADMIN";
  }

  return (
    <PageFrame
      title="Utilizadores da empresa"
      description="Gere memberships e convites sem permitir escaladas de privilégios."
      actions={
        <button type="button" onClick={() => void refresh()} disabled={action.busy}>
          Atualizar
        </button>
      }
    >
      {loadError ? (
        <StatusMessage tone="danger" title="Não foi possível carregar utilizadores">
          {loadError}
        </StatusMessage>
      ) : null}
      <ActionFeedbackMessage feedback={action.feedback} />

      <form
        className="operation"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void runMutation(
            () => apiClient.companies.inviteUser({
              email: String(form.get("email") ?? "").trim(),
              role: String(form.get("role") ?? ""),
            }),
            "Convite criado e enviado.",
          );
        }}
      >
        <h3>Convidar utilizador</h3>
        <div className="fields">
          <label>
            <span>Email</span>
            <input name="email" type="email" required />
          </label>
          <label>
            <span>Papel</span>
            <select name="role" required defaultValue="OPERACIONAL">
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Convidar</button>
      </form>

      <section aria-labelledby="company-members-heading">
        <h3 id="company-members-heading">Membros ativos</h3>
        <div className="operationGrid">
          {members.map((member) => {
            const manageable =
              member.userId !== auth.snapshot?.user.id && canManageRole(member.role);
            return (
              <article className="operation" key={member.userId}>
                <h3>{member.name ?? member.email}</h3>
                <p>{member.email}</p>
                <p>Papel: {ROLE_LABELS[member.role] ?? member.role}</p>
                {manageable ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const role = String(new FormData(event.currentTarget).get("role") ?? "");
                      void runMutation(
                        () => apiClient.companies.updateUserRole(member.userId, { role }),
                        "Role atualizada.",
                      );
                    }}
                  >
                    <label>
                      <span>Novo papel</span>
                      <select name="role" defaultValue={member.role}>
                        {availableRoles.map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </label>
                    <div className="inlineActions">
                      <button type="submit" disabled={action.busy}>Alterar role</button>
                      <ConfirmableActionButton
                        label="Remover"
                        description="O utilizador perde o acesso à empresa ativa, mantendo a conta pessoal."
                        entityLabel={member.name ?? member.email}
                        disabled={action.busy}
                        busy={action.busy}
                        onConfirm={() => runMutation(
                          () => apiClient.companies.removeUser(member.userId),
                          "Utilizador removido da empresa.",
                        )}
                      />
                    </div>
                  </form>
                ) : (
                  <p>Membership apenas de leitura para a tua role atual.</p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="company-invitations-heading">
        <h3 id="company-invitations-heading">Convites</h3>
        <div className="operationGrid">
          {invitations.map((invitation) => {
            const manageable = invitation.status === "PENDING" && canManageRole(invitation.role);
            return (
              <article className="operation" key={invitation.id}>
                <h3>{invitation.email}</h3>
                <p>{ROLE_LABELS[invitation.role] ?? invitation.role} · {invitation.status === "PENDING" ? "Pendente" : invitation.status}</p>
                <p>Válido até {new Date(invitation.expiresAt).toLocaleString("pt-PT")}</p>
                {manageable ? (
                  <div className="inlineActions">
                    <button
                      type="button"
                      disabled={action.busy}
                      onClick={() => void runMutation(
                        () => apiClient.companies.resendInvitation(invitation.id),
                        "Convite reenviado.",
                      )}
                    >
                      Reenviar
                    </button>
                    <ConfirmableActionButton
                      label="Revogar"
                      description="O convite deixa de poder ser aceite através do link enviado."
                      entityLabel={invitation.email}
                      disabled={action.busy}
                      busy={action.busy}
                      onConfirm={() => runMutation(
                        () => apiClient.companies.revokeInvitation(invitation.id),
                        "Convite revogado.",
                      )}
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </PageFrame>
  );
}

function isSafeInternalPath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

function ProtectedContent({
  requiredPermission,
  allowedRoles,
  children,
}: {
  requiredPermission?: PermissionName;
  allowedRoles?: string[];
  children: ReactNode;
}) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "bootstrapping") {
    return (
      <PageFrame title="A validar sessão">
        <StatusMessage tone="neutral" title="A carregar">
          A confirmar sessão, empresa ativa e permissões.
        </StatusMessage>
      </PageFrame>
    );
  }

  if (auth.status === "error") {
    return (
      <PageFrame title="Sessão indisponível">
        <StatusMessage tone="danger" title="Não foi possível validar a sessão">
          <p>{auth.permissionsError ?? "O serviço de autenticação não respondeu."}</p>
          <button type="button" onClick={() => void auth.refreshSession()}>
            Tentar novamente
          </button>
        </StatusMessage>
      </PageFrame>
    );
  }

  if (auth.status === "anonymous") {
    return <Navigate to="/auth" replace state={{ returnTo: location.pathname }} />;
  }

  if ((requiredPermission || allowedRoles) && !auth.snapshot?.activeCompanyId) {
    return <Navigate to="/companies" replace />;
  }

  if (requiredPermission && auth.permissionsError) {
    return (
      <PageFrame title="Permissões indisponíveis">
        <StatusMessage tone="danger" title="Acesso não validado">
          Não foi possível validar as permissões da empresa ativa. Atualiza a sessão antes de
          continuar.
        </StatusMessage>
      </PageFrame>
    );
  }

  const permitted =
    (!requiredPermission || auth.hasPermission(requiredPermission)) &&
    (!allowedRoles || auth.hasRole(...allowedRoles));

  if (!permitted) {
    return (
      <PageFrame title="Sem permissão">
        <StatusMessage tone="danger" title="Acesso recusado">
          A tua role na empresa ativa não permite abrir este módulo.
        </StatusMessage>
      </PageFrame>
    );
  }

  return children;
}

function UnknownRoute() {
  return (
    <PageFrame title="Página não encontrada">
      <StatusMessage tone="warning" title="Rota desconhecida">
        Usa a navegação principal para regressar a um módulo disponível.
      </StatusMessage>
    </PageFrame>
  );
}

function LazyRouteFallback() {
  return (
    <PageFrame title="A carregar módulo">
      <StatusMessage tone="neutral" title="A preparar página">
        O módulo pedido está a ser carregado.
      </StatusMessage>
    </PageFrame>
  );
}

/**
 * Renderiza a aplicação principal e coordena autenticação, contexto de empresa e navegação entre módulos.
 *
 * @returns Elemento React renderizado da aplicação principal.
 */
function AppContent() {
  const auth = useAuth();
  const dashboard = useDashboard();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [openGroups, setOpenGroups] = useState<NavigationGroupId[]>(readOpenNavigationGroups);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const content = document.querySelector<HTMLElement>(".contentColumn");
    content?.setAttribute("inert", "");
    const sidebarLinks = Array.from(
      sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], summary, button:not([disabled])') ?? [],
    );
    sidebarLinks[0]?.focus();
    const closeOrTrap = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [menuToggleRef.current, ...sidebarLinks].filter(
        (element): element is HTMLElement => Boolean(element),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", closeOrTrap);
    return () => {
      document.removeEventListener("keydown", closeOrTrap);
      content?.removeAttribute("inert");
      menuToggleRef.current?.focus();
    };
  }, [menuOpen]);

  const resources = useMemo<ResourceConfig[]>(
    () => [
      {
        id: "companies",
        path: "/companies",
        title: "Empresas e contexto",
        load: async () => pickPage(await apiClient.companies.list(), "companies"),
        operations: [
          {
            title: "Selecionar empresa",
            submitLabel: "Selecionar",
            fields: [{ name: "companyId", label: "Empresa", required: true }],
            run: (values) => apiClient.companies.switchCompany(values as JsonBody),
            afterSuccess: async () => {
              await auth.refreshSession();
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
        path: "/company/users",
        title: "Utilizadores da empresa",
        requiredPermission: Permission.USERS_MANAGE,
        load: async () => ({ items: [], pageInfo: EMPTY_PAGE_INFO }),
        operations: [],
        customRender: () => <CompanyUsersPage />,
      },
      {
        id: "profile",
        path: "/company/profile",
        title: "Perfil da empresa",
        requiredPermission: Permission.COMPANY_READ,
        load: async () => ({
          items: pickSingle(await apiClient.companies.getProfile(), "profile"),
          pageInfo: EMPTY_PAGE_INFO,
        }),
        operations: [
          {
            title: "Guardar perfil",
            submitLabel: "Guardar",
            fields: [
              { name: "legalName", label: "Nome legal", required: true },
              { name: "nif", label: "NIF", required: true },
              { name: "addressLine1", label: "Morada", required: true },
              { name: "addressLine2", label: "Morada 2" },
              { name: "postalCode", label: "Código postal", required: true },
              { name: "city", label: "Cidade", required: true },
              { name: "country", label: "País", defaultValue: "PT" },
              { name: "currency", label: "Moeda", defaultValue: "EUR" },
              { name: "logoUrl", label: "Logo URL" },
              {
                name: "fiscalYearStartMonth",
                label: "Mês fiscal inicial",
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
            requiredPermission: Permission.COMPANY_WRITE,
          },
        ],
      },
      {
        id: "accounts",
        path: "/accounting/accounts",
        title: "Plano de contas",
        requiredPermission: Permission.ACCOUNTING_READ,
        load: async (_search, pagination) =>
          pickPage(await apiClient.accounting.listAccounts(pagination), "accounts"),
        operations: [
          {
            title: "Criar conta",
            submitLabel: "Criar",
            fields: [
              {
                name: "code",
                label: "Código",
                required: true,
                mf5ValidationName: "accountCode",
              },
              { name: "name", label: "Nome", required: true },
              {
                name: "parentCode",
                label: "Código principal",
                mf5ValidationName: "accountCode",
              },
            ],
            run: (values) => apiClient.accounting.createAccount(values as JsonBody),
            requiredPermission: Permission.ACCOUNTING_WRITE,
          },
          {
            title: "Importar linhas normalizadas",
            submitLabel: "Importar",
            fields: [
              {
                name: "rows",
                label: "Linhas do plano de contas",
                kind: "accountRows",
                required: true,
              },
            ],
            run: (values) =>
              apiClient.accounting.importAccounts(values as JsonBody),
            requiredPermission: Permission.ACCOUNTING_WRITE,
          },
        ],
      },
      {
        id: "periods",
        path: "/accounting/fiscal-periods",
        title: "Períodos fiscais",
        requiredPermission: Permission.FISCAL_PERIODS_READ,
        load: async () =>
          pickPage(await apiClient.accounting.listFiscalPeriods(), "periods"),
        operations: [
          {
            title: "Abrir período",
            submitLabel: "Abrir",
            fields: [
              { name: "name", label: "Nome", required: true },
              {
                name: "fiscalYear",
                label: "Exercício fiscal",
                kind: "number",
                min: 1900,
                max: 9999,
                required: true,
              },
              { name: "startDate", label: "Data de início", required: true },
              { name: "endDate", label: "Data de fim", required: true },
            ],
            run: (values) =>
              apiClient.accounting.createFiscalPeriod(values as JsonBody),
            requiredPermission: Permission.FISCAL_PERIODS_MANAGE,
          },
          {
            title: "Fechar período",
            submitLabel: "Fechar",
            fields: [{ name: "id", label: "Período", required: true }],
            run: ({ id }) => apiClient.accounting.closeFiscalPeriod(String(id)),
            requiredPermission: Permission.FISCAL_PERIODS_MANAGE,
          },
        ],
      },
      {
        id: "customers",
        path: "/sales/customers",
        title: "Clientes",
        requiredPermission: Permission.CUSTOMERS_READ,
        searchable: true,
        load: async (search, pagination) =>
          pickPage(await apiClient.customers.list(search, pagination), "customers"),
        operations: personOperations(
          "cliente",
          apiClient.customers,
          false,
          Permission.CUSTOMERS_WRITE,
        ),
      },
      {
        id: "suppliers",
        path: "/purchases/suppliers",
        title: "Fornecedores",
        requiredPermission: Permission.SUPPLIERS_READ,
        searchable: true,
        load: async (search, pagination) =>
          pickPage(await apiClient.suppliers.list(search, pagination), "suppliers"),
        operations: personOperations(
          "fornecedor",
          apiClient.suppliers,
          false,
          Permission.SUPPLIERS_WRITE,
        ),
      },
      {
        id: "items",
        path: "/inventory/items",
        title: "Artigos e serviços",
        requiredPermission: Permission.ITEMS_READ,
        load: async (_search, pagination) =>
          pickPage(await apiClient.items.list(pagination), "items"),
        operations: [
          {
            title: "Criar item",
            submitLabel: "Criar",
            fields: itemFields(),
            run: (values) => apiClient.items.create(values as JsonBody),
            requiredPermission: Permission.ITEMS_WRITE,
          },
          {
            title: "Atualizar item",
            submitLabel: "Atualizar",
            fields: [{ name: "id", label: "Artigo", required: true }, ...itemFields()],
            run: ({ id, ...body }) =>
              apiClient.items.update(String(id), body as JsonBody),
            requiredPermission: Permission.ITEMS_WRITE,
          },
          {
            title: "Remover item",
            submitLabel: "Remover",
            fields: [{ name: "id", label: "Artigo", required: true }],
            run: ({ id }) => apiClient.items.remove(String(id)),
            requiredPermission: Permission.ITEMS_WRITE,
          },
        ],
      },
      {
        id: "warehouses",
        path: "/inventory/warehouses",
        title: "Armazéns e localizações",
        requiredPermission: Permission.WAREHOUSES_READ,
        load: async () =>
          pickPage(await apiClient.warehouses.list(), "warehouses"),
        operations: [
          {
            title: "Criar armazém",
            submitLabel: "Criar",
            fields: [
              { name: "code", label: "Código", required: true },
              { name: "name", label: "Nome", required: true },
            ],
            run: (values) => apiClient.warehouses.create(values as JsonBody),
            requiredPermission: Permission.WAREHOUSES_WRITE,
          },
          {
            title: "Listar localizações",
            submitLabel: "Listar",
            fields: [{ name: "id", label: "Armazém", required: true }],
            run: ({ id }) => apiClient.warehouses.listLocations(String(id)),
          },
          {
            title: "Criar localização",
            submitLabel: "Criar",
            fields: [
              { name: "id", label: "Armazém", required: true },
              { name: "code", label: "Código", required: true },
              { name: "name", label: "Nome", required: true },
            ],
            run: ({ id, ...body }) =>
              apiClient.warehouses.createLocation(String(id), body as JsonBody),
            requiredPermission: Permission.WAREHOUSES_WRITE,
          },
        ],
      },
    ],
    [auth.refreshSession],
  );

  const mf1Pages = useMemo<PageConfig[]>(
    () => [
      { id: "vat-rates", path: "/tax/vat-rates", title: "Tabelas de IVA", requiredPermission: Permission.VAT_RATES_READ, render: () => <VatRatesPage /> },
      {
        id: "sales-documents",
        path: "/sales/documents",
        title: "Documentos de venda",
        requiredPermission: Permission.SALES_READ,
        render: () => <SaleDocumentsPage />,
      },
      { id: "receipts", path: "/sales/receipts", title: "Recebimentos", requiredPermission: Permission.SALES_WRITE, render: () => <ReceiptsPage /> },
      {
        id: "sales-open-items",
        path: "/sales/open-items",
        title: "Títulos em aberto",
        requiredPermission: Permission.SALES_READ,
        render: () => <SalesOpenItemsPage />,
      },
      {
        id: "sale-approval",
        path: "/sales/approval",
        title: "Aprovação de vendas",
        requiredPermission: Permission.SALES_APPROVE,
        render: () => <SaleApprovalPage />,
      },
      {
        id: "sale-postings",
        path: "/accounting/sale-postings",
        title: "Lançamentos de vendas",
        requiredPermission: Permission.ACCOUNTING_WRITE,
        render: () => <SalePostingsPage />,
      },
      {
        id: "purchase-documents",
        path: "/purchases/documents",
        title: "Documentos de compra",
        requiredPermission: Permission.PURCHASES_READ,
        render: () => <PurchaseDocumentsPage />,
      },
      { id: "payments", path: "/purchases/payments", title: "Pagamentos", requiredPermission: Permission.PURCHASES_WRITE, render: () => <PaymentsPage /> },
      {
        id: "purchase-approval",
        path: "/purchases/approval",
        title: "Aprovação de compras",
        requiredPermission: Permission.PURCHASES_APPROVE,
        render: () => <PurchaseApprovalPage />,
      },
      {
        id: "purchase-postings",
        path: "/accounting/purchase-postings",
        title: "Lançamentos de compras",
        requiredPermission: Permission.ACCOUNTING_WRITE,
        render: () => <PurchasePostingsPage />,
      },
    ],
    [],
  );
  const mf2Pages = useMemo<PageConfig[]>(
    () => [
      {
        id: "stock-balances",
        path: "/inventory/stock",
        title: "Stock atual",
        requiredPermission: Permission.INVENTORY_READ,
        render: () => <StockBalancesPage />,
      },
      {
        id: "stock-movements",
        path: "/inventory/movements",
        title: "Movimentos de stock",
        requiredPermission: Permission.INVENTORY_READ,
        render: () => <StockMovementsPage />,
      },
      {
        id: "fifo-cost",
        path: "/inventory/fifo",
        title: "Custo FIFO",
        requiredPermission: Permission.INVENTORY_READ,
        render: () => <FifoCostPage />,
      },
      {
        id: "inventory-counts",
        path: "/inventory/counts",
        title: "Contagens físicas",
        requiredPermission: Permission.INVENTORY_READ,
        render: () => <InventoryCountPage />,
      },
      {
        id: "stock-alerts",
        path: "/inventory/alerts",
        title: "Alertas de stock",
        requiredPermission: Permission.INVENTORY_READ,
        render: () => <StockAlertsPage />,
      },
      {
        id: "manual-journals",
        path: "/accounting/manual-journals",
        title: "Lançamentos manuais",
        requiredPermission: Permission.ACCOUNTING_WRITE,
        render: () => <ManualJournalPage />,
      },
      {
        id: "accounting-reports",
        path: "/accounting/reports",
        title: "Balancete e razão",
        requiredPermission: Permission.ACCOUNTING_READ,
        render: () => <AccountingReportsPage />,
      },
      {
        id: "financial-statements",
        path: "/accounting/statements",
        title: "DR e Balanço",
        requiredPermission: Permission.ACCOUNTING_READ,
        render: () => <FinancialStatementsPage />,
      },
    ],
    [],
  );
  const mf3Pages = useMemo<PageConfig[]>(
    () => [
      { id: "vat-map", path: "/tax/vat-map", title: "Mapa de IVA", requiredPermission: Permission.TAX_READ, render: () => <VatMapPage /> },
      {
        id: "treasury-accounts",
        path: "/treasury/accounts",
        title: "Contas e caixa",
        requiredPermission: Permission.TREASURY_READ,
        render: () => <TreasuryAccountsPage />,
      },
      {
        id: "statement-import",
        path: "/treasury/import",
        title: "Extratos bancários",
        requiredPermission: Permission.TREASURY_WRITE,
        render: () => <StatementImportPage />,
      },
      {
        id: "bank-reconciliation",
        path: "/treasury/reconciliation",
        title: "Reconciliação bancária",
        requiredPermission: Permission.TREASURY_READ,
        render: () => <ReconciliationPage />,
      },
      {
        id: "cashflow-forecast",
        path: "/treasury/forecast",
        title: "Previsão de tesouraria",
        requiredPermission: Permission.CASHFLOW_FORECAST_READ,
        render: () => <CashflowForecastPage />,
      },
      {
        id: "business-import",
        path: "/imports/business-data",
        title: "Importações",
        requiredPermission: Permission.IMPORTS_WRITE,
        render: () => <BusinessImportPage />,
      },
      {
        id: "saft-export",
        path: "/compliance/saft",
        title: "SAF-T 1.04_01",
        requiredPermission: Permission.COMPLIANCE_READ,
        render: () => <SaftExportPage />,
      },
      {
        id: "operational-reports",
        path: "/reports/operational",
        title: "Relatórios operacionais",
        requiredPermission: Permission.OPERATIONAL_REPORTS_READ,
        render: () => <OperationalReportsPage />,
      },
      {
        id: "executive-kpis",
        path: "/reports/executive-kpis",
        title: "KPIs executivos",
        requiredPermission: Permission.EXECUTIVE_KPIS_READ,
        render: () => <ExecutiveKpisPage />,
      },
    ],
    [],
  );
  const mf4Pages = useMemo<PageConfig[]>(
    () => [
      {
        id: "ai-insights",
        path: "/ai/insights",
        title: "Insights IA",
        requiredPermission: Permission.AI_INSIGHTS_READ,
        render: () => <AiInsightsPage />,
      },
      {
        id: "ai-suggestions",
        path: "/ai/suggestions",
        title: "Sugestões IA",
        requiredPermission: Permission.AI_SUGGESTIONS_READ,
        render: () => <AiSuggestionsPage />,
      },
      {
        id: "ai-chat",
        path: "/ai/chat",
        title: "Assistente OPSA",
        requiredPermission: Permission.AI_CHAT_USE,
        render: () => <AiChatPage />,
      },
      {
        id: "smart-alerts",
        path: "/ai/alerts",
        title: "Alertas inteligentes",
        requiredPermission: Permission.AI_ALERTS_READ,
        render: () => <SmartAlertsPage />,
      },
      {
        id: "ai-settings",
        path: "/ai/settings",
        title: "Administração IA",
        requiredPermission: Permission.AI_SETTINGS_MANAGE,
        render: () => <AiSettingsPage />,
      },
      { id: "reminders", path: "/operations/reminders", title: "Lembretes", requiredPermission: Permission.REMINDERS_WRITE, render: () => <RemindersPage /> },
      { id: "tasks", path: "/operations/tasks", title: "Tarefas", requiredPermission: Permission.TASKS_WRITE, render: () => <TasksPage /> },
      {
        id: "notifications",
        path: "/operations/notifications",
        title: "Notificações",
        requiredPermission: Permission.NOTIFICATIONS_READ,
        render: () => <NotificationsPage />,
      },
      {
        id: "audit-logs",
        path: "/audit/logs",
        title: "Auditoria",
        requiredPermission: Permission.AUDIT_READ,
        render: () => <AuditLogsPage />,
      },
      {
        id: "integration-logs",
        path: "/integrations/logs",
        title: "Logs de integração",
        requiredPermission: Permission.INTEGRATIONS_READ,
        render: () => <IntegrationLogsPage />,
      },
    ],
    [],
  );
  const mf8Pages = useMemo<PageConfig[]>(
    () => [
      {
        id: "subscriptions",
        path: "/subscriptions",
        title: "Subscrições",
        requiredPermission: Permission.SUBSCRIPTIONS_MANAGE,
        render: () => <SubscriptionsPage />,
      },
    ],
    [],
  );

  const allPages = [
    ...mf1Pages,
    ...mf2Pages,
    ...mf3Pages,
    ...mf4Pages,
    ...mf8Pages,
  ];
  const visibleResources = resources.filter(
    (resource) =>
      auth.status === "authenticated" &&
      (!resource.requiredPermission || auth.hasPermission(resource.requiredPermission)),
  );
  const visiblePages = allPages.filter(
    (page) =>
      auth.status === "authenticated" &&
      (!page.requiredPermission || auth.hasPermission(page.requiredPermission)) &&
      (!page.allowedRoles || auth.hasRole(...page.allowedRoles)),
  );
  const visibleNavigationItems = [
    ...(auth.hasPermission(Permission.DASHBOARD_READ)
      ? [{ id: "dashboard", path: "/dashboard", title: "Dashboard" }]
      : []),
    ...visibleResources,
    ...visiblePages,
  ];
  const currentGroup = navigationGroupForPath(location.pathname);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    setOpenGroups((current) => current.includes(currentGroup) ? current : [...current, currentGroup]);
  }, [auth.status, currentGroup]);

  useEffect(() => {
    localStorage.setItem("opsa.nav.open-groups.v1", JSON.stringify(openGroups));
  }, [openGroups]);

  async function refreshAndReturn() {
    const nextSnapshot = await auth.refreshSession();
    if (!nextSnapshot) return;
    const routeState = location.state as { returnTo?: unknown } | null;
    const returnTo = routeState?.returnTo;
    if (!nextSnapshot.activeCompanyId) {
      const companies = pickPage(await apiClient.companies.list(), "companies").items;
      navigate(companies.length > 0 ? "/companies" : "/onboarding", { replace: true });
      return;
    }
    navigate(isSafeInternalPath(returnTo) ? returnTo : "/dashboard", { replace: true });
  }

  const activeAiModule = allPages.find((page) => page.path === location.pathname)?.id ?? location.pathname;
  const canUseAiChat = auth.status === "authenticated" && auth.hasPermission(Permission.AI_CHAT_USE);
  const currentTitle = visibleNavigationItems.find((item) => item.path === location.pathname)?.title
    ?? (location.pathname === "/auth" ? "Iniciar sessão" : "OPSA");

  async function logout() {
    try {
      await apiClient.auth.logout();
    } finally {
      auth.clearSession();
      navigate("/auth", { replace: true });
    }
  }

  return (
    <AiPageContextProvider value={{ module: activeAiModule }}>
    <AiChatStateProvider enabled={canUseAiChat}>
    <div className="appShell">
      <a className="skipLink" href="#conteudo-principal">
        Saltar para o conteúdo
      </a>
      <button
        ref={menuToggleRef}
        type="button"
        className="menuToggle"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((current) => !current)}
      >
        {menuOpen ? "Fechar menu" : "Abrir menu"}
      </button>
      {menuOpen ? (
        <button
          type="button"
          className="sidebarBackdrop"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <aside
        ref={sidebarRef}
        className={`sidebar${menuOpen ? " sidebar--open" : ""}`}
        role={menuOpen ? "dialog" : undefined}
        aria-modal={menuOpen ? "true" : undefined}
        aria-label={menuOpen ? "Menu principal" : undefined}
      >
        <div className="sidebarBrand">
          <img
            className="sidebarBrand__logo"
            src={opsaLogoUrl}
            alt=""
            aria-hidden="true"
          />
          <h1 className="visuallyHidden">
            OPSA — Contabilidade inteligente, potencializada por IA.
          </h1>
        </div>
        <nav id="primary-navigation" aria-label="Navegação principal">
          {auth.status !== "authenticated" ? (
            <div className="navGroup">
              <p>Conta</p>
              <Link to="/auth" aria-current={location.pathname === "/auth" ? "page" : undefined}>Iniciar sessão</Link>
              <Link to="/registar" aria-current={location.pathname === "/registar" ? "page" : undefined}>Criar conta</Link>
              <Link to="/recuperar-password/pedir" aria-current={location.pathname === "/recuperar-password/pedir" ? "page" : undefined}>Recuperar palavra-passe</Link>
              <Link to="/demo/email-inbox" aria-current={location.pathname === "/demo/email-inbox" ? "page" : undefined}>Inbox da demonstração</Link>
            </div>
          ) : !auth.snapshot?.activeCompanyId ? (
            <div className="navGroup">
              <p>Empresa</p>
              <Link
                to="/onboarding"
                aria-current={location.pathname === "/onboarding" ? "page" : undefined}
              >
                Criar empresa
              </Link>
            </div>
          ) : (
            <div className="navigationGroups">
              {NAVIGATION_GROUPS.map((group) => {
                const items = visibleNavigationItems.filter(
                  (item) => navigationGroupForPath(item.path) === group.id,
                );
                if (items.length === 0) return null;
                return (
                  <details
                    key={group.id}
                    className="navDisclosure"
                    open={group.id === currentGroup || openGroups.includes(group.id)}
                    onToggle={(event) => {
                      const nextOpen = event.currentTarget.open;
                      if (!nextOpen && group.id === currentGroup) return;
                      setOpenGroups((current) => nextOpen
                        ? current.includes(group.id) ? current : [...current, group.id]
                        : current.filter((id) => id !== group.id));
                    }}
                  >
                    <summary>{group.label}</summary>
                    <div className="navGroup">
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          to={item.path}
                          aria-current={location.pathname === item.path ? "page" : undefined}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </nav>
      </aside>
      <div className="contentColumn">
      {auth.status === "authenticated" && auth.snapshot?.activeCompanyId ? (
        <header className="appHeader">
          <div>
            <span className="appHeader__eyebrow">{currentTitle}</span>
            <strong>{auth.snapshot.company?.name ?? "Sem empresa ativa"}</strong>
          </div>
          <div className="appHeader__context">
            <span>{dashboard.summary?.activeFiscalPeriod?.name ?? "Sem período fiscal aberto"}</span>
            <span>{ROLE_LABELS[auth.snapshot.role ?? ""] ?? "Sem papel ativo"}</span>
            <Link to="/companies">Mudar empresa</Link>
            <Link to="/companies/new">Nova empresa</Link>
            <button type="button" onClick={() => void logout()}>Terminar sessão</button>
          </div>
        </header>
      ) : null}
      <main className="content" id="conteudo-principal" tabIndex={-1}>
        <Routes>
          <Route path="/aceitar-convite" element={<InvitationAcceptancePage />} />
          <Route path="/recuperar-password" element={<PasswordResetPage />} />
          <Route path="/demo/email-inbox" element={<DemoEmailInboxPage />} />
          <Route
            path="/registar"
            element={auth.status === "authenticated" && auth.snapshot?.activeCompanyId
              ? <Navigate replace to="/dashboard" />
              : <AuthPanel mode="register" onSessionRefresh={refreshAndReturn} />}
          />
          <Route
            path="/recuperar-password/pedir"
            element={<AuthPanel mode="request" onSessionRefresh={refreshAndReturn} />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedContent requiredPermission={Permission.DASHBOARD_READ}>
                <DashboardPage />
              </ProtectedContent>
            }
          />
          <Route
            path="/auth"
            element={
              <>
                {auth.status === "error" ? (
                  <StatusMessage tone="danger" title="Serviço de sessão indisponível">
                    <p>{auth.permissionsError ?? "Não foi possível validar a sessão."}</p>
                    <button type="button" onClick={() => void auth.refreshSession()}>
                      Tentar novamente
                    </button>
                  </StatusMessage>
                ) : null}
                {auth.status !== "error" && auth.status === "authenticated" && auth.snapshot?.activeCompanyId ? (
                  <Navigate replace to="/dashboard" />
                ) : null}
                {auth.status !== "error" && !(auth.status === "authenticated" && auth.snapshot?.activeCompanyId) ? (
                  <AuthPanel
                    onSessionRefresh={refreshAndReturn}
                  />
                ) : null}
              </>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedContent>
                <OnboardingPage />
              </ProtectedContent>
            }
          />
          <Route
            path="/companies/new"
            element={
              <ProtectedContent>
                <AdditionalCompanyPage />
              </ProtectedContent>
            }
          />
          {resources.map((resource) => (
            <Route
              key={resource.id}
              path={resource.path}
              element={
                <ProtectedContent requiredPermission={resource.requiredPermission}>
                  {resource.customRender?.() ?? <ResourcePanel resource={resource} />}
                </ProtectedContent>
              }
            />
          ))}
          {allPages.map((page) => (
            <Route
              key={page.id}
              path={page.path}
              element={
                <ProtectedContent
                  requiredPermission={page.requiredPermission}
                  allowedRoles={page.allowedRoles}
                >
                  <Suspense fallback={<LazyRouteFallback />}>
                    {page.render()}
                  </Suspense>
                </ProtectedContent>
              }
            />
          ))}
          <Route path="/ai/questions" element={<Navigate replace to="/ai/chat" />} />
          <Route
            path="/"
            element={
              <Navigate
                replace
                to={
                  auth.status !== "authenticated"
                    ? "/auth"
                    : auth.snapshot?.activeCompanyId
                      ? "/dashboard"
                      : "/onboarding"
                }
              />
            }
          />
          <Route path="*" element={<UnknownRoute />} />
        </Routes>
      </main>
      </div>
      {canUseAiChat ? <AiAssistantDrawer /> : null}
    </div>
    </AiChatStateProvider>
    </AiPageContextProvider>
  );
}

/**
 * Expõe a aplicação com o provider de dashboard junto da fronteira que o consome.
 */
export function App() {
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
}

/**
 * Define campos comuns de clientes e fornecedores para evitar duplicação nos formulários MF0.
 *
 * @param requireNif - Indica se o NIF é obrigatório no formulário.
 * @returns Lista de campos partilhados por clientes e fornecedores.
 */
function personFields(requireNif = false, saftAccountCode = ""): FieldConfig[] {
  return [
    { name: "name", label: "Nome", required: true },
    { name: "nif", label: "NIF", required: requireNif },
    { name: "email", label: "Email", kind: "email" },
    { name: "phone", label: "Telefone" },
    { name: "addressLine", label: "Morada" },
    { name: "postalCode", label: "Código postal" },
    { name: "city", label: "Cidade" },
    { name: "country", label: "País (ISO)", defaultValue: "PT" },
    {
      name: "saftAccountId",
      label: "Conta SAF-T",
      defaultValue: saftAccountCode,
    },
    {
      name: "selfBillingIndicator",
      label: "Indicador de autofaturação",
      kind: "number",
      min: 0,
      max: 1,
      defaultValue: "0",
    },
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
  requiredPermission?: PermissionName,
): OperationConfig[] {
  const saftAccountCode = label === "cliente" ? "211" : "221";
  return [
    {
      title: `Criar ${label}`,
      submitLabel: "Criar",
      fields: personFields(requireNif, saftAccountCode),
      run: (values) => client.create(values as JsonBody),
      requiredPermission,
    },
    {
      title: `Atualizar ${label}`,
      submitLabel: "Atualizar",
      fields: [
        { name: "id", label: "Registo", required: true },
        ...personFields(requireNif, saftAccountCode),
      ],
      run: ({ id, ...body }) => client.update(String(id), body as JsonBody),
      requiredPermission,
    },
    {
      title: `Remover ${label}`,
      submitLabel: "Remover",
      fields: [{ name: "id", label: "Registo", required: true }],
      run: ({ id }) => client.remove(String(id)),
      requiredPermission,
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
        { value: "SERVICE", label: "Serviço" },
      ],
    },
    { name: "costCents", label: "Custo em cêntimos", kind: "number", required: true },
    { name: "priceCents", label: "Preço em cêntimos", kind: "number", required: true },
    { name: "vatRateBps", label: "IVA bps", kind: "number", required: true },
  ];
}
