/**
 * @file Páginas React dos fluxos MF3 de IVA, tesouraria, importações, SAF-T, relatórios e KPIs.
 */

import { FormEvent, useEffect, useState } from "react";
import { PermissionGate } from "../auth/PermissionGate";
import { Permission } from "../auth/permissions";
import { apiClient, JsonBody } from "../lib/apiClient";
import { firstLocalDayOfMonth, toLocalDateInputValue } from "../lib/dateUtils";
import { formatPerformanceWarning, measureDashboardLoad } from "../lib/mf5PerformanceBudget";
import { assertMf5FormData } from "../lib/mf5FormValidators";
import {
  createFullSaftExport,
  downloadSaftExport,
  getSaftExport,
  type SaftExportDetail,
  type SaftExportSummary,
} from "../lib/saftApi";
import { ActionFeedbackMessage, PageFrame, StatusMessage } from "../ui/opsaUi";
import { useActionFeedback } from "../ui/useActionFeedback";

type ApiObject = Record<string, unknown>;

/**
 * Devolve a data corrente no formato ISO curto usado pelos inputs de data.
 *
 * @returns Data corrente em formato ISO curto.
 */
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
 * Exige um ficheiro real selecionado no browser.
 *
 * @param value - Campo lido de `FormData`.
 * @param label - Nome usado na mensagem de validação.
 * @returns Ficheiro não vazio pronto para multipart.
 */
function requiredFile(value: FormDataEntryValue | null, label: string) {
  if (!(value instanceof File) || value.size === 0) {
    throw new Error(`${label} e obrigatorio`);
  }
  return value;
}

interface TreasuryAccountOption {
  id: string;
  label: string;
}

/**
 * Converte a listagem paginada ou legada de contas em opções seguras.
 *
 * @param response - Resposta desconhecida do endpoint de tesouraria.
 * @returns Opções com identificador e texto legível.
 */
function treasuryAccountOptions(response: unknown): TreasuryAccountOption[] {
  if (!response || typeof response !== "object" || Array.isArray(response)) return [];
  const record = response as Record<string, unknown>;
  const rows = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.accounts)
      ? record.accounts
      : [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return [];
    const account = row as Record<string, unknown>;
    const id = typeof account.id === "string" ? account.id : "";
    if (!id) return [];
    const name = typeof account.name === "string" ? account.name : "Conta";
    const iban = typeof account.iban === "string" && account.iban ? ` — ${account.iban}` : "";
    return [{ id, label: `${name}${iban}` }];
  });
}

/**
 * Carrega opções de tesouraria para evitar introdução manual de UUIDs.
 *
 * @returns Lista atual de opções e eventual mensagem de erro.
 */
function useTreasuryAccountOptions() {
  const [accounts, setAccounts] = useState<TreasuryAccountOption[]>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void apiClient.treasury
      .listAccounts()
      .then((response) => {
        if (active) setAccounts(treasuryAccountOptions(response));
      })
      .catch(() => {
        if (active) setAccountsError("Não foi possível carregar as contas de tesouraria.");
      });
    return () => {
      active = false;
    };
  }, []);

  return { accounts, accountsError };
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
 * Resume uma resposta de domínio sem expor snapshots técnicos ou segredos.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Painel semântico com campos seguros da resposta.
 */
function OperationSummary({ value }: { value: unknown }) {
  if (value === null || value === undefined) return null;
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const visibleEntries = Object.entries(record).flatMap(([key, entry]) => {
    if (!/(status|message|total|count|created|updated|imported|success|error|skipped)/i.test(key)) {
      return [];
    }
    if (["string", "number", "boolean"].includes(typeof entry)) {
      return [{ key, value: String(entry) }];
    }
    if (Array.isArray(entry)) return [{ key, value: `${entry.length} item(ns)` }];
    return [];
  });

  return (
    <section className="operation" aria-labelledby="operation-summary-title">
      <h3 id="operation-summary-title">Resultado da operação</h3>
      {visibleEntries.length > 0 ? (
        <dl className="structuredResult__details">
          {visibleEntries.map((entry) => (
            <div key={entry.key}>
              <dt>{entry.key.replace(/([a-z])([A-Z])/g, "$1 $2")}</dt>
              <dd>{entry.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p>A operação terminou e os dados apresentados foram atualizados.</p>
      )}
    </section>
  );
}

/**
 * Renderiza um formulário reutilizável de intervalo de datas para relatórios MF3.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com campos de intervalo de datas.
 */
function DateRangeForm({
  label,
  performanceLabel,
  onSubmit,
  startMessage,
  successMessage,
  errorMessage,
}: {
  label: string;
  performanceLabel?: string;
  onSubmit: (from: string, to: string) => Promise<void>;
  startMessage: string;
  successMessage: string;
  errorMessage: string;
}) {
  const action = useActionFeedback();
  const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPerformanceWarning(null);

    try {
      await action.run(
        async () => {
          const form = new FormData(formElement);
          assertMf5FormData(form, [
            { name: "from", required: true },
            { name: "to", required: true },
          ]);
          /**
           * Executa a consulta de dashboard com o intervalo validado localmente.
           * A função é medida quando existe `performanceLabel` e chamada diretamente nos restantes casos.
           *
           * @returns Promise com o resultado devolvido pelo submit da página.
           */
          const runDashboardQuery = () =>
            onSubmit(
              requiredText(form.get("from"), "Data inicial"),
              requiredText(form.get("to"), "Data final"),
            );

          if (performanceLabel) {
            const measured = await measureDashboardLoad(
              performanceLabel,
              runDashboardQuery,
            );
            setPerformanceWarning(formatPerformanceWarning(measured.sample));
            return measured.result;
          }

          return runDashboardQuery();
        },
        {
          startMessage,
          successMessage,
          errorMessage,
        },
      );
    } catch {
      // O hook mantem a mensagem de erro visivel e o formulario preenchido.
    }
  }

  return (
    <form className="operation" onSubmit={submit}>
      <h3>{label}</h3>
      <div className="fields">
        <label>
          <span>Data inicial</span>
          <input name="from" type="date" required defaultValue={firstLocalDayOfMonth()} />
        </label>
        <label>
          <span>Data final</span>
          <input name="to" type="date" required defaultValue={toLocalDateInputValue()} />
        </label>
      </div>
      {performanceWarning ? (
        <StatusMessage tone="warning" title="Aviso de performance">
          {performanceWarning}
        </StatusMessage>
      ) : null}
      <ActionFeedbackMessage feedback={action.feedback} />
      <button type="submit" disabled={action.busy}>
        {action.busy ? "A consultar..." : "Consultar"}
      </button>
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
        startMessage="A gerar mapa de IVA..."
        successMessage="Mapa de IVA gerado com sucesso."
        errorMessage="Nao foi possivel gerar o mapa de IVA."
        onSubmit={async (from, to) => setResult(await apiClient.tax.vatMap(from, to))}
      />
      <OperationSummary value={result} />
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
  const action = useActionFeedback();

  /**
   * Carrega dados da API para atualizar o estado visível do ecrã.
   *
   * @returns Promise resolvida depois de atualizar os dados visíveis.
   */
  async function load() {
    try {
      await action.run(
        async () => {
          setResult(await apiClient.treasury.listAccounts());
        },
        {
          startMessage: "A listar contas...",
          successMessage: "Contas atualizadas.",
          errorMessage: "Nao foi possivel listar as contas.",
        },
      );
    } catch {
      // O hook mantem a mensagem de erro visivel.
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
    const formElement = event.currentTarget;

    try {
      await action.run(
        async () => {
          const form = new FormData(formElement);
          const accountType = requiredText(form.get("type"), "Tipo");
          assertMf5FormData(form, [
            { name: "iban", required: accountType === "BANK" },
          ]);
          const body: JsonBody = {
            type: accountType,
            name: requiredText(form.get("name"), "Nome"),
            iban: optionalText(form.get("iban")),
            currency: optionalText(form.get("currency")) ?? "EUR",
            initialBalanceCents: integerValue(form.get("initialBalanceCents"), "Saldo inicial"),
          };

          setResult(await apiClient.treasury.createAccount(body));
          formElement.reset();
        },
        {
          startMessage: "A criar conta...",
          successMessage: "Conta criada com sucesso.",
          errorMessage: "Nao foi possivel criar a conta.",
        },
      );
    } catch {
      // O formulario fica preenchido para correcao.
    }
  }

  return (
    <PageFrame title="Contas bancarias e caixa">
      <button type="button" onClick={load} disabled={action.busy}>
        {action.busy ? "A executar..." : "Listar contas"}
      </button>
      <ActionFeedbackMessage feedback={action.feedback} />
      <PermissionGate permission={Permission.TREASURY_WRITE}>
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
          <button type="submit" disabled={action.busy}>
            {action.busy ? "A criar..." : "Criar"}
          </button>
        </form>
      </PermissionGate>
      <OperationSummary value={result} />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Statement Import e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para importação de extratos.
 */
export function StatementImportPage() {
  const [result, setResult] = useState<unknown>(null);
  const action = useActionFeedback();
  const { accounts, accountsError } = useTreasuryAccountOptions();

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;

    try {
      await action.run(
        async () => {
          const form = new FormData(formElement);
          const response = await apiClient.treasury.importStatement(
            requiredText(form.get("treasuryAccountId"), "Conta"),
            requiredFile(form.get("file"), "Ficheiro de extrato"),
          );

          setResult(response);
          formElement.reset();
          return response;
        },
        {
          startMessage: "A validar e importar extrato...",
          successMessage: "Extrato importado com sucesso.",
          errorMessage: "Nao foi possivel importar o extrato.",
        },
      );
    } catch {
      // O hook mantem a mensagem visivel e o formulario preenchido para correcao.
    }
  }

  return (
    <PageFrame title="Importar extrato">
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
      {accountsError ? (
        <StatusMessage tone="danger" title="Contas indisponíveis">
          {accountsError}
        </StatusMessage>
      ) : null}
      <form className="operation" onSubmit={submit}>
        <div className="fields">
          <label>
            <span>Conta de tesouraria</span>
            <select name="treasuryAccountId" required defaultValue="">
              <option value="">Selecionar conta</option>
              {accounts.map((account) => (
                <option value={account.id} key={account.id}>{account.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Ficheiro CSV, OFX ou XLSX (máximo 10 MiB)</span>
            <input
              name="file"
              type="file"
              accept=".csv,.ofx,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              required
            />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>
          {action.busy ? "A importar..." : "Importar"}
        </button>
      </form>
      <OperationSummary value={result} />
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
        startMessage="A gerar previsao de tesouraria..."
        successMessage="Previsao de tesouraria gerada com sucesso."
        errorMessage="Nao foi possivel gerar a previsao de tesouraria."
        onSubmit={async (from, to) =>
          setResult(await apiClient.treasury.forecast(from, to))
        }
      />
      <OperationSummary value={result} />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Business Import e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para importação de dados.
 */
export function BusinessImportPage() {
  const [result, setResult] = useState<unknown>(null);
  const action = useActionFeedback();
  const [type, setType] = useState("CUSTOMERS");
  const { accounts, accountsError } = useTreasuryAccountOptions();

  /**
   * Processa a submissão do formulário, valida campos locais e delega a operação na API.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;

    try {
      await action.run(
        async () => {
          const form = new FormData(formElement);
          const response = await apiClient.imports.businessData({
            type: requiredText(form.get("type"), "Tipo"),
            treasuryAccountId: optionalText(form.get("treasuryAccountId")),
            file: requiredFile(form.get("file"), "Ficheiro de importação"),
          });

          setResult(response);
          formElement.reset();
          setType("CUSTOMERS");
          return response;
        },
        {
          startMessage: "A validar e importar dados...",
          successMessage: "Dados importados com sucesso.",
          errorMessage: "Nao foi possivel importar os dados.",
        },
      );
    } catch {
      // A interface mantem os dados preenchidos para o utilizador corrigir e repetir.
    }
  }

  return (
    <PageFrame title="Importar dados">
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
      {type === "STATEMENTS" && accountsError ? (
        <StatusMessage tone="danger" title="Contas indisponíveis">
          {accountsError}
        </StatusMessage>
      ) : null}
      <form className="operation" onSubmit={submit}>
        <div className="fields">
          <label>
            <span>Tipo</span>
            <select
              name="type"
              required
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="CUSTOMERS">Clientes</option>
              <option value="SUPPLIERS">Fornecedores</option>
              <option value="ITEMS">Artigos</option>
              <option value="STATEMENTS">Extratos</option>
            </select>
          </label>
          {type === "STATEMENTS" ? (
            <label>
              <span>Conta de tesouraria</span>
              <select name="treasuryAccountId" required defaultValue="">
                <option value="">Selecionar conta</option>
                {accounts.map((account) => (
                  <option value={account.id} key={account.id}>{account.label}</option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            <span>Ficheiro CSV, OFX ou XLSX (máximo 10 MiB)</span>
            <input
              name="file"
              type="file"
              accept=".csv,.ofx,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              required
            />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>
          {action.busy ? "A importar..." : "Importar"}
        </button>
      </form>
      <OperationSummary value={result} />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Saft Export e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para exportação SAF-T.
 */
export function SaftExportPage() {
  const [periods, setPeriods] = useState<
    Array<{ id: string; name: string; startDate: string; endDate: string; status?: string }>
  >([]);
  const [periodId, setPeriodId] = useState("");
  const [exportJob, setExportJob] = useState<SaftExportSummary | SaftExportDetail | null>(null);
  const action = useActionFeedback();

  useEffect(() => {
    const controller = new AbortController();
    void apiClient.accounting
      .listFiscalPeriods()
      .then((response) => {
        if (controller.signal.aborted) return;
        setPeriods(response.periods);
        setPeriodId((current) => current || response.periods[0]?.id || "");
      })
      .catch(() => {
        if (!controller.signal.aborted) setPeriods([]);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!exportJob || ["READY", "FAILED"].includes(exportJob.status)) return;
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => {
      void getSaftExport(exportJob.id, controller.signal)
        .then((response) => setExportJob(response.export))
        .catch(() => undefined);
    }, 1_500);
    return () => {
      globalThis.clearTimeout(timeout);
      controller.abort();
    };
  }, [exportJob]);

  async function createExport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    try {
      await action.run(
        async () => {
          const response = await createFullSaftExport(
            requiredText(new FormData(formElement).get("fiscalPeriodId"), "Período fiscal"),
          );
          setExportJob(response.export);
        },
        {
          startMessage: "A iniciar a exportação SAF-T integral...",
          successMessage: "Exportação aceite. O estado será atualizado automaticamente.",
          errorMessage: "Não foi possível iniciar a exportação SAF-T.",
        },
      );
    } catch {
      // Não existe fallback para o endpoint SAF-T legado removido.
    }
  }

  async function download() {
    if (!exportJob || exportJob.status !== "READY") return;
    try {
      await action.run(
        async () => {
          const file = await downloadSaftExport(exportJob.id);
          const url = URL.createObjectURL(file.blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = file.fileName;
          anchor.click();
          globalThis.setTimeout(() => URL.revokeObjectURL(url), 0);
        },
        {
          startMessage: "A preparar o ficheiro SAF-T...",
          successMessage: "Download SAF-T iniciado.",
          errorMessage: "Não foi possível descarregar o ficheiro SAF-T.",
        },
      );
    } catch {
      // O erro fica no live region comum e o utilizador pode atualizar o estado.
    }
  }

  return (
    <PageFrame
      title="Exportação SAF-T"
      description="Gera um único ficheiro integral com faturação e contabilidade para um período fiscal."
    >
      <form className="operation" onSubmit={createExport}>
        <h3>Nova exportação integral</h3>
        <div className="fields">
          <label>
            <span>Tipo</span>
            <input value="Integral (FULL)" readOnly aria-describedby="saft-type-help" />
          </label>
          <p id="saft-type-help">Esta release não cria exportações parciais.</p>
          <label>
            <span>Período fiscal</span>
            <select
              name="fiscalPeriodId"
              required
              value={periodId}
              onChange={(event) => setPeriodId(event.target.value)}
            >
              <option value="">Selecionar período</option>
              {periods.map((period) => (
                <option value={period.id} key={period.id}>
                  {period.name} ({period.startDate.slice(0, 10)} — {period.endDate.slice(0, 10)})
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={action.busy || !periodId}>
          {action.busy ? "A executar..." : "Gerar SAF-T"}
        </button>
      </form>
      {action.feedback.message ? (
        <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
          {action.feedback.message}
        </StatusMessage>
      ) : null}
      {exportJob ? (
        <section className="operation" aria-labelledby="saft-export-state">
          <h3 id="saft-export-state">Estado da exportação</h3>
          <p>{exportJob.status}</p>
          {exportJob.status === "FAILED" ? (
            <StatusMessage tone="danger" title="Exportação falhou">
              A exportação não ficou disponível. Revê a configuração do período e tenta novamente.
            </StatusMessage>
          ) : null}
          <button
            type="button"
            disabled={
              action.busy ||
              exportJob.status !== "READY" ||
              ("downloadAvailable" in exportJob && !exportJob.downloadAvailable)
            }
            onClick={() => void download()}
          >
            Descarregar XML
          </button>
        </section>
      ) : null}
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
        performanceLabel="Relatorios operacionais"
        startMessage="A consultar relatorio operacional..."
        successMessage="Relatorio operacional atualizado."
        errorMessage="Nao foi possivel consultar o relatorio operacional."
        onSubmit={async (from, to) =>
          setResult(await apiClient.reports.operational(from, to))
        }
      />
      <OperationSummary value={result} />
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
        performanceLabel="KPIs executivos"
        startMessage="A consultar KPIs..."
        successMessage="KPIs atualizados."
        errorMessage="Nao foi possivel consultar os KPIs."
        onSubmit={async (from, to) =>
          setResult(await apiClient.reports.executiveKpis(from, to))
        }
      />
      <OperationSummary value={result} />
    </PageFrame>
  );
}
