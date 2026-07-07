/**
 * @file Páginas React dos fluxos MF2 de inventário, FIFO, contagens, alertas, lançamentos e relatórios contabilísticos.
 */

import { FormEvent, useEffect, useState } from "react";
import { apiClient, JsonBody, type AccountingExportFormat } from "../lib/apiClient";
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
import { PageFrame, StatusMessage } from "../ui/opsaUi";

type StockMovementType = "ENTRY" | "EXIT" | "TRANSFER" | "RETURN" | "ADJUSTMENT";
const ACCOUNTING_EXPORT_FORMATS: AccountingExportFormat[] = ["csv", "xlsx", "pdf"];

interface ListState {
  rows: ApiObject[];
  busy: boolean;
  error: string | null;
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
function today() {
  return new Date().toISOString().slice(0, 10);
}

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
 * Converte textareas JSON em arrays, preservando o contrato que o backend espera receber.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param label - Nome amigável usado em mensagens de erro ou UI.
 * @returns Array JSON validado a partir do campo de texto.
 */
function parseJsonArray(value: FormDataEntryValue | null, label: string) {
  const text = requiredText(value, label);
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error(`${label} deve ser um array JSON`);
  return parsed;
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
 * Lê um ficheiro local e devolve apenas a carga Base64 necessária para o payload JSON.
 *
 * @param file - Ficheiro a validar.
 * @returns Promise com o conteúdo do ficheiro codificado em Base64.
 */
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

/**
 * Renderiza uma tabela simples a partir das chaves presentes nas linhas devolvidas pela API.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com a tabela de dados.
 */
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
                <td key={column}>{formatValue(row[column], column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
function useApiList(load: () => Promise<ApiObject[]>) {
  const [state, setState] = useState<ListState>({ rows: [], busy: false, error: null });
  /**
   * Recarrega a lista principal e guarda estados de carregamento ou erro.
   *
   * @returns Promise resolvida depois de recarregar a lista.
   */
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

/**
 * Renderiza o ecrã Stock Movements e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para movimentos de stock.
 */
export function StockMovementsPage() {
  const list = useApiList(async () =>
    pickArray(await apiClient.inventory.listStockMovements(), "movements"),
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

/**
 * Renderiza o ecrã Fifo Cost e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para preview de custo FIFO.
 */
export function FifoCostPage() {
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

/**
 * Renderiza o ecrã Inventory Count e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para contagens físicas.
 */
export function InventoryCountPage() {
  const list = useApiList(async () => pickArray(await apiClient.inventory.listCounts(), "counts"));
  const action = useAction(list.reload);

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
          lines: parseJsonArray(form.get("lines"), "Linhas"),
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
          lines: parseJsonArray(form.get("lines"), "Linhas"),
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

/**
 * Renderiza o ecrã Stock Alerts e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para alertas de stock.
 */
export function StockAlertsPage() {
  const list = useApiList(async () => pickArray(await apiClient.inventory.listStockAlerts(), "alerts"));
  const action = useAction(list.reload);

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

/**
 * Renderiza o ecrã Manual Journal e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para lançamentos manuais.
 */
export function ManualJournalPage() {
  const action = useAction();
  const [result, setResult] = useState<unknown>(null);

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
          lines: parseJsonArray(form.get("lines"), "Linhas"),
        });
      },
      "Lançamento manual criado.",
    );
    setResult(response);
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
    setResult(await action.run(() => apiClient.manualJournals.get(id), "Lançamento carregado."));
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
    const response = await action.run(
      () => {
        assertMf5FormData(form, [{ name: "entryDate", required: true }]);
        const id = requiredText(form.get("id"), "Lancamento");
        return apiClient.manualJournals.update(id, {
          entryDate: requiredText(form.get("entryDate"), "Data"),
          description: requiredText(form.get("description"), "Descricao"),
          lines: parseJsonArray(form.get("lines"), "Linhas"),
        });
      },
      "Lançamento manual atualizado.",
    );
    setResult(response);
  }

  /**
   * Processa a submissão do formulário de anexo, converte o ficheiro para Base64 e envia-o para a API privada.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de registar o anexo.
   */
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

/**
 * Renderiza o ecrã Accounting Reports e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para balancete e razão.
 */
export function AccountingReportsPage() {
  const action = useAction();
  const [result, setResult] = useState<unknown>(null);
  const [exports, setExports] = useState<{
    trial?: Record<AccountingExportFormat, string>;
    ledger?: Record<AccountingExportFormat, string>;
  }>({});

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
        const kind = requiredText(form.get("kind"), "Relatorio");
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
        const nextResponse =
          kind === "ledger"
            ? await apiClient.accountingReports.ledger(
                requiredText(accountId ?? "", "Conta"),
                from,
                to,
              )
            : await apiClient.accountingReports.trialBalance(from, to);
        setExports({ trial: trialExports, ledger: ledgerExports });
        return nextResponse;
      },
      "Relatório calculado.",
    );
    setResult(response);
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
      <pre className="result">{JSON.stringify(result, null, 2)}</pre>
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
          <label><span>Data inicial</span><input name="from" type="date" required defaultValue={today()} /></label>
          <label><span>Data final</span><input name="to" type="date" required defaultValue={today()} /></label>
        </div>
        <button type="submit" disabled={action.busy}>Calcular</button>
      </form>
      <pre className="result">{JSON.stringify(result, null, 2)}</pre>
    </PageFrame>
  );
}
