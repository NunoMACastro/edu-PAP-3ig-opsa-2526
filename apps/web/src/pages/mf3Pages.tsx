/**
 * @file Páginas React dos fluxos MF3 de IVA, tesouraria, importações, SAF-T, relatórios e KPIs.
 */

import { FormEvent, useState } from "react";
import { apiClient, JsonBody } from "../lib/apiClient";
import { formatPerformanceWarning, measureDashboardLoad } from "../lib/mf5PerformanceBudget";
import { assertMf5FormData } from "../lib/mf5FormValidators";
import { PageFrame, StatusMessage } from "../ui/opsaUi";
import { type ActionFeedbackState, useActionFeedback } from "../ui/useActionFeedback";

type ApiObject = Record<string, unknown>;

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
 * Mostra o resultado JSON bruto para facilitar validação funcional dos fluxos MF3.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com o JSON formatado.
 */
function JsonResult({ value }: { value: unknown }) {
  return <pre className="result">{JSON.stringify(value, null, 2)}</pre>;
}

/**
 * Apresenta o estado produzido pelo hook comum de feedback da MF5.
 *
 * @param props - Estado de feedback a renderizar.
 * @returns Mensagem transversal quando existe feedback visivel.
 */
function ActionFeedbackMessage({ feedback }: { feedback: ActionFeedbackState }) {
  if (!feedback.message) return null;
  return (
    <StatusMessage tone={feedback.tone} title={feedback.title}>
      {feedback.message}
    </StatusMessage>
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
          <input name="from" type="date" required defaultValue={firstDayOfMonth()} />
        </label>
        <label>
          <span>Data final</span>
          <input name="to" type="date" required defaultValue={today()} />
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
  const [result, setResult] = useState<unknown>(null);
  const action = useActionFeedback();

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
          const response = await apiClient.treasury.importStatement({
            treasuryAccountId: requiredText(form.get("treasuryAccountId"), "Conta"),
            format: requiredText(form.get("format"), "Formato"),
            fileName: optionalText(form.get("fileName")) ?? "extrato.csv",
            content: requiredText(form.get("content"), "Conteudo"),
          });

          setResult(response);
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
      <form className="operation" onSubmit={submit}>
        <div className="fields">
          <label><span>Conta de tesouraria ID</span><input name="treasuryAccountId" required /></label>
          <label>
            <span>Formato</span>
            <select name="format" required defaultValue="CSV">
              <option value="CSV">CSV</option>
              <option value="OFX">OFX simplificado</option>
            </select>
          </label>
          <label><span>Nome do ficheiro</span><input name="fileName" defaultValue="extrato.csv" /></label>
          <label>
            <span>Conteudo</span>
            <textarea name="content" required rows={8} defaultValue={"data;descricao;referencia;valor\n2026-06-01;Recebimento cliente;REC-1;125,00"} />
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
        startMessage="A gerar previsao de tesouraria..."
        successMessage="Previsao de tesouraria gerada com sucesso."
        errorMessage="Nao foi possivel gerar a previsao de tesouraria."
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
  const [result, setResult] = useState<unknown>(null);
  const action = useActionFeedback();

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
            fileName: optionalText(form.get("fileName")) ?? "import.csv",
            treasuryAccountId: optionalText(form.get("treasuryAccountId")),
            content: requiredText(form.get("content"), "CSV"),
          });

          setResult(response);
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
          <label><span>Nome do ficheiro</span><input name="fileName" defaultValue="import.csv" /></label>
          <label><span>Conta ID para extratos</span><input name="treasuryAccountId" /></label>
          <label>
            <span>CSV</span>
            <textarea name="content" required rows={8} defaultValue={"name;nif;email\nCliente Demo;509442013;cliente@example.test"} />
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
        startMessage="A gerar SAF-T..."
        successMessage="SAF-T gerado com sucesso."
        errorMessage="Nao foi possivel gerar o SAF-T."
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
        performanceLabel="Relatorios operacionais"
        startMessage="A consultar relatorio operacional..."
        successMessage="Relatorio operacional atualizado."
        errorMessage="Nao foi possivel consultar o relatorio operacional."
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
        performanceLabel="KPIs executivos"
        startMessage="A consultar KPIs..."
        successMessage="KPIs atualizados."
        errorMessage="Nao foi possivel consultar os KPIs."
        onSubmit={async (from, to) =>
          setResult(await apiClient.reports.executiveKpis(from, to))
        }
      />
      <JsonResult value={result} />
    </PageFrame>
  );
}
