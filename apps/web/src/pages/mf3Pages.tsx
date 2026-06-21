import { FormEvent, useState } from "react";
import { ApiError, apiClient, JsonBody } from "../lib/apiClient";
import { PageFrame, StatusMessage } from "../ui/opsaUi";
import { useActionFeedback } from "../ui/useActionFeedback";
import { formatMf5FormErrors, validateMf5FormData } from "../lib/mf5FormValidators";

type ApiObject = Record<string, unknown>;

/**
 * Converte erros da API ou erros nativos numa mensagem curta para apresentar ao utilizador.
 *
 * @param error - Erro capturado durante a operação.
 * @returns Mensagem de erro pronta a apresentar ao utilizador.
 */
function formatError(error: unknown): string {
  if (error instanceof ApiError) return `${error.code}: ${error.message}`;
  if (error instanceof Error) return error.message;
  return "Erro inesperado";
}

/**
 * Devolve a data corrente no formato ISO curto usado pelos inputs de data.
 *
 * @returns Data corrente em formato ISO curto.
 */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Devolve o primeiro dia do mês corrente no formato aceite pelos inputs de data.
 *
 * @returns Primeiro dia do mês corrente em formato ISO curto.
 */
function firstDayOfMonth() {
  const date = new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

/**
 * Normaliza texto obrigatório e lança erro claro quando o campo está vazio.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param label - Nome amigável usado em mensagens de erro ou UI.
 * @returns Texto obrigatório validado.
 */
function requiredText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} e obrigatorio`);
  return text;
}

/**
 * Normaliza texto opcional, devolvendo undefined para campos vazios.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Texto normalizado, ou undefined quando o campo está vazio.
 */
function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

/**
 * Converte um campo de formulário num inteiro obrigatório, usado para valores em cêntimos.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param label - Nome amigável usado em mensagens de erro ou UI.
 * @returns Inteiro validado a partir do campo de formulário.
 */
function integerValue(value: FormDataEntryValue | null, label: string) {
  const parsed = Number(String(value ?? "").trim() || "0");
  if (!Number.isInteger(parsed)) throw new Error(`${label} deve estar em centimos`);
  return parsed;
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
        <StatusMessage tone="neutral" title="Operação em curso">
          A executar operação...
        </StatusMessage>
      ) : null}

      {error ? (
        <StatusMessage tone="danger" title="Operação não concluída">
          {error}
        </StatusMessage>
      ) : null}

      {message ? (
        <StatusMessage tone="success" title="Operação concluída">
          {message}
        </StatusMessage>
      ) : null}
    </>
  );
}

/**
 * Mostra o resultado JSON bruto para facilitar validação funcional dos fluxos MF3.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com o JSON formatado.
 */
function JsonResult({ value }: { value: unknown }) {
  return <pre className="result">{JSON.stringify(value, null, 2)}</pre>;
}

/**
 * Renderiza um formulário reutilizável de intervalo de datas para relatórios MF3.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com campos de intervalo de datas.
 */
function DateRangeForm({
  label,
  onSubmit,
}: {
  label: string;
  onSubmit: (from: string, to: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await onSubmit(
        requiredText(form.get("from"), "Data inicial"),
        requiredText(form.get("to"), "Data final"),
      );
    } catch (caught) {
      setError(formatError(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="operation" onSubmit={submit}>
      <h3>{label}</h3>
      <div className="fields">
        <label>
          <span>Data inicial</span>
          <input name="from" required defaultValue={firstDayOfMonth()} />
        </label>
        <label>
          <span>Data final</span>
          <input name="to" required defaultValue={today()} />
        </label>
      </div>
      <Feedback busy={busy} error={error} />
      <button type="submit" disabled={busy}>Consultar</button>
    </form>
  );
}

/**
 * Renderiza o ecrã do mapa de IVA e consulta a API por intervalo de datas.
 *
 * @returns Elemento React renderizado para mapa de IVA.
 */
export function VatMapPage() {
  const [result, setResult] = useState<unknown>(null);
  return (
    <PageFrame title="Mapa de IVA">
      <DateRangeForm
        label="Gerar mapa"
        onSubmit={async (from, to) => setResult(await apiClient.tax.vatMap(from, to))}
      />
      <JsonResult value={result} />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Treasury Accounts e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para contas de tesouraria.
 */
export function TreasuryAccountsPage() {
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  /**
   * Carrega dados da API para atualizar o estado visível do ecrã.
   *
   * @returns Promise resolvida depois de atualizar os dados visíveis.
   */
  async function load() {
    setBusy(true);
    setError(null);
    try {
      setResult(await apiClient.treasury.listAccounts());
    } catch (caught) {
      setError(formatError(caught));
    } finally {
      setBusy(false);
    }
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
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body: JsonBody = {
        type: requiredText(form.get("type"), "Tipo"),
        name: requiredText(form.get("name"), "Nome"),
        iban: optionalText(form.get("iban")),
        currency: optionalText(form.get("currency")) ?? "EUR",
        initialBalanceCents: integerValue(form.get("initialBalanceCents"), "Saldo inicial"),
      };
      setResult(await apiClient.treasury.createAccount(body));
      setMessage("Conta criada.");
    } catch (caught) {
      setError(formatError(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageFrame title="Contas bancarias e caixa">
      <button type="button" onClick={load} disabled={busy}>Listar contas</button>
      <Feedback busy={busy} error={error} message={message} />
      <form className="operation" onSubmit={submit}>
        <h3>Nova conta</h3>
        <div className="fields">
          <label>
            <span>Tipo</span>
            <select name="type" required defaultValue="BANK">
              <option value="BANK">Banco</option>
              <option value="CASH">Caixa</option>
            </select>
          </label>
          <label><span>Nome</span><input name="name" required /></label>
          <label><span>IBAN</span><input name="iban" /></label>
          <label><span>Moeda</span><input name="currency" defaultValue="EUR" /></label>
          <label><span>Saldo inicial em centimos</span><input name="initialBalanceCents" defaultValue="0" /></label>
        </div>
        <button type="submit" disabled={busy}>Criar</button>
      </form>
      <JsonResult value={result} />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Statement Import e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para importação de extratos.
 */
export function StatementImportPage() {
    const [result, setResult] = useState<
        Awaited<ReturnType<typeof apiClient.treasury.importStatement>> | null
    >(null);

    const action = useActionFeedback();

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;

        try {
            await action.run(
                async () => {
                    const form = new FormData(formElement);

                    const response = await apiClient.treasury.importStatement({
                        treasuryAccountId: requiredText(
                            form.get("treasuryAccountId"),
                            "Conta",
                        ),
                        format: requiredText(form.get("format"), "Formato"),
                        fileName:
                            optionalText(form.get("fileName")) ?? "extrato.csv",
                        content: requiredText(form.get("content"), "Conteúdo"),
                    });

                    setResult(response);
                    return response;
                },
                {
                    startMessage: "A validar e importar extrato...",
                    successMessage: "Extrato importado com sucesso.",
                    errorMessage: "Não foi possível importar o extrato.",
                },
            );
        } catch {
            // erro já tratado pelo hook
        }
    }

    return (
        <PageFrame title="Importar extrato">
            {action.feedback.message ? (
                <StatusMessage
                    tone={action.feedback.tone}
                    title={action.feedback.title}
                >
                    {action.feedback.message}
                </StatusMessage>
            ) : null}

            <form className="operation" onSubmit={submit}>
                <div className="fields">
                    <label>
                        <span>Conta de tesouraria ID</span>
                        <input name="treasuryAccountId" required />
                    </label>

                    <label>
                        <span>Formato</span>
                        <select name="format" required defaultValue="CSV">
                            <option value="CSV">CSV</option>
                            <option value="OFX">OFX simplificado</option>
                        </select>
                    </label>

                    <label>
                        <span>Nome do ficheiro</span>
                        <input name="fileName" defaultValue="extrato.csv" />
                    </label>

                    <label>
                        <span>Conteúdo</span>
                        <textarea
                            name="content"
                            required
                            rows={8}
                            defaultValue={
                                "data;descricao;referencia;valor\n2026-06-01;Recebimento cliente;REC-1;125,00"
                            }
                        />
                    </label>
                </div>

                <button type="submit" disabled={action.busy}>
                    {action.busy ? "A importar..." : "Importar"}
                </button>
            </form>

            <JsonResult value={result} />
        </PageFrame>
    );
}

/**
 * Renderiza o ecrã Cashflow Forecast e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para previsão de tesouraria.
 */
export function CashflowForecastPage() {
  const [result, setResult] = useState<unknown>(null);
  return (
    <PageFrame title="Previsao de tesouraria">
      <DateRangeForm
        label="Gerar previsao"
        onSubmit={async (from, to) =>
          setResult(await apiClient.treasury.forecast(from, to))
        }
      />
      <JsonResult value={result} />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Business Import e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para importação de dados.
 */
export function BusinessImportPage() {
    const [result, setResult] = useState<
        Awaited<ReturnType<typeof apiClient.imports.businessData>> | null
    >(null);

    const action = useActionFeedback();

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;

        try {
            await action.run(
                async () => {
                    const form = new FormData(formElement);

                    const response = await apiClient.imports.businessData({
                        type: requiredText(form.get("type"), "Tipo"),
                        fileName:
                            optionalText(form.get("fileName")) ?? "import.csv",
                        treasuryAccountId: optionalText(
                            form.get("treasuryAccountId"),
                        ),
                        content: requiredText(form.get("content"), "CSV"),
                    });

                    setResult(response);
                    return response;
                },
                {
                    startMessage: "A validar e importar dados...",
                    successMessage: "Dados importados com sucesso.",
                    errorMessage: "Não foi possível importar os dados.",
                },
            );
        } catch {
            // erro tratado pelo hook
        }
    }

    return (
        <PageFrame title="Importar dados">
            {action.feedback.message ? (
                <StatusMessage
                    tone={action.feedback.tone}
                    title={action.feedback.title}
                >
                    {action.feedback.message}
                </StatusMessage>
            ) : null}

            <form className="operation" onSubmit={submit}>
                <div className="fields">
                    <label>
                        <span>Tipo</span>
                        <select name="type" required defaultValue="CUSTOMERS">
                            <option value="CUSTOMERS">Clientes</option>
                            <option value="SUPPLIERS">Fornecedores</option>
                            <option value="ITEMS">Artigos</option>
                            <option value="STATEMENTS">Extratos</option>
                        </select>
                    </label>

                    <label>
                        <span>Nome do ficheiro</span>
                        <input name="fileName" defaultValue="import.csv" />
                    </label>

                    <label>
                        <span>Conta ID para extratos</span>
                        <input name="treasuryAccountId" />
                    </label>

                    <label>
                        <span>CSV</span>
                        <textarea
                            name="content"
                            required
                            rows={8}
                            defaultValue={
                                "name;nif;email\nCliente Demo;509442013;cliente@example.test"
                            }
                        />
                    </label>
                </div>

                <button type="submit" disabled={action.busy}>
                    {action.busy ? "A importar..." : "Importar"}
                </button>
            </form>

            <JsonResult value={result} />
        </PageFrame>
    );
}

/**
 * Renderiza o ecrã Saft Export e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para exportação SAF-T.
 */
export function SaftExportPage() {
  const [result, setResult] = useState<unknown>(null);
  return (
    <PageFrame title="Exportacao SAF-T MVP">
      <DateRangeForm
        label="Gerar SAF-T"
        onSubmit={async (from, to) =>
          setResult(await apiClient.compliance.saft(from, to))
        }
      />
      <JsonResult value={result} />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Operational Reports e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para relatórios operacionais.
 */
export function OperationalReportsPage() {
  const [result, setResult] = useState<unknown>(null);
  return (
    <PageFrame title="Relatorios operacionais">
      <DateRangeForm
        label="Consultar relatorio"
        onSubmit={async (from, to) =>
          setResult(await apiClient.reports.operational(from, to))
        }
      />
      <JsonResult value={result} />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Executive Kpis e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para KPIs executivos.
 */
export function ExecutiveKpisPage() {
  const [result, setResult] = useState<unknown>(null);
  return (
    <PageFrame title="KPIs executivos">
      <DateRangeForm
        label="Consultar KPIs"
        onSubmit={async (from, to) =>
          setResult(await apiClient.reports.executiveKpis(from, to))
        }
      />
      <JsonResult value={result} />
    </PageFrame>
  );
}

/**
 * Valida campos críticos de um formulário dedicado antes de enviar para a API.
 *
 * @param form - Dados submetidos pelo utilizador.
 * @param fieldNames - Campos cobertos pelo RNF05 neste ecrã.
 */
function assertMf5DedicatedForm(form: FormData, fieldNames: string[]) {
  const errors = validateMf5FormData(form, fieldNames);
  if (errors.length > 0) {
    throw new Error(formatMf5FormErrors(errors));
  }
}

/**
 * Constrói dados de entidade com NIF validado localmente.
 *
 * @param form - Dados do formulário de entidade.
 * @returns Corpo pronto para submissão.
 */
function parseBusinessEntityForm(form: FormData) {
  assertMf5DedicatedForm(form, ["nif"]);

  return {
    name: String(form.get("name") ?? ""),
    nif: String(form.get("nif") ?? ""),
    email: String(form.get("email") ?? ""),
  };
}

/**
 * Constrói dados de conta bancária com IBAN validado localmente.
 *
 * @param form - Dados do formulário bancário.
 * @returns Corpo pronto para submissão.
 */
function parseBankAccountForm(form: FormData) {
  assertMf5DedicatedForm(form, ["iban"]);

  return {
    name: String(form.get("name") ?? ""),
    iban: String(form.get("iban") ?? ""),
  };
}

/**
 * Constrói dados de lançamento/tarefa com data e conta SNC validadas localmente.
 *
 * @param form - Dados do formulário contabilístico ou operacional.
 * @returns Corpo pronto para submissão.
 */
function parseAccountingOperationForm(form: FormData) {
  assertMf5DedicatedForm(form, ["entryDate", "accountCode"]);

  return {
    entryDate: String(form.get("entryDate") ?? ""),
    accountCode: String(form.get("accountCode") ?? ""),
    description: String(form.get("description") ?? ""),
  };
}
