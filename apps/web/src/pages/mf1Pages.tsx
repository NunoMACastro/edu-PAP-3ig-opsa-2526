import { FormEvent, ReactNode, useEffect, useState } from "react";
import { JsonBody } from "../lib/apiClient";
import { formatUiError } from "../lib/mf5ErrorMessages";
import { accountingApi } from "../lib/accountingApi";
import {
    ApiObject,
    asObject,
    formatValue,
    optionalText,
    pickArray,
    requiredText,
    toPositiveInteger,
} from "../lib/mf1FormUtils";
import { paymentApi } from "../lib/paymentApi";
import { purchaseApprovalApi } from "../lib/purchaseApprovalApi";
import { purchasesApi } from "../lib/purchasesApi";
import { receiptApi } from "../lib/receiptApi";
import { salesApi } from "../lib/salesApi";
import { salesOpenItemsApi } from "../lib/salesOpenItemsApi";
import { vatRateApi } from "../lib/vatRateApi";
import { PageFrame } from "../ui/opsaUi";
import { formatMf5FormErrors, validateMf5FormData } from "../lib/mf5FormValidators";

type Method = "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER";
type SaleDocumentKind = "INVOICE" | "INVOICE_RECEIPT" | "CREDIT_NOTE";
type PurchaseDocumentKind = "SUPPLIER_INVOICE" | "SUPPLIER_CREDIT_NOTE";

interface ListState {
  rows: ApiObject[];
  busy: boolean;
  error: string | null;
}

/**
 * Converte erros de MF1 numa mensagem clara para o utilizador.
 *
 * @param error - Erro capturado durante listagem, submissão ou atualização.
 * @returns Mensagem de erro com causa e próxima ação.
 */
function formatError(error: unknown): string {
  // MF1 usa o tradutor comum para não voltar a mostrar apenas "CODE: mensagem".
  return formatUiError(error);
}

/**
 * Lança erro se o formulário tiver campos críticos inválidos.
 *
 * @param form - Dados recolhidos no submit.
 * @param fieldNames - Campos críticos deste formulário.
 */
function assertMf5Form(form: FormData, fieldNames: string[]) {
  const errors = validateMf5FormData(form, fieldNames);
  if (errors.length > 0) {
    throw new Error(formatMf5FormErrors(errors));
  }
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
 * Renderiza uma tabela simples a partir das chaves presentes nas linhas devolvidas pela API.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com a tabela de dados.
 */
function DataTable({
  rows,
  actions,
}: {
  rows: ApiObject[];
  actions?: (row: ApiObject) => ReactNode;
}) {
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
            {actions ? <th>Acoes</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => (
                <td key={column}>{formatValue(row[column])}</td>
              ))}
              {actions ? <td>{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
}: {
  name: string;
  label: string;
  documents: ApiObject[];
}) {
  return (
    <label>
      <span>{label}</span>
      <select name={name} required>
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
 * Renderiza as opções normalizadas de método de pagamento ou recebimento.
 *
 * @returns Elemento React renderizado com métodos de pagamento ou recebimento.
 */
function MethodSelect() {
  return (
    <label>
      <span>Metodo</span>
      <select name="method" required defaultValue="BANK_TRANSFER">
        <option value="CASH">Numerario</option>
        <option value="BANK_TRANSFER">Transferencia</option>
        <option value="CARD">Cartao</option>
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
function useApiList(load: () => Promise<ApiObject[]>) {
  const [state, setState] = useState<ListState>({
    rows: [],
    busy: false,
    error: null,
  });

  /**
   * Recarrega a lista principal e guarda estados de carregamento ou erro.
   *
   * @returns Promise resolvida depois de recarregar a lista.
   */
  async function reload() {
    setState((current) => ({ ...current, busy: true, error: null }));
    try {
      setState({ rows: await load(), busy: false, error: null });
    } catch (error) {
      setState({ rows: [], busy: false, error: formatError(error) });
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
      await action();
      await reload();
      setMessage(success);
    } catch (caught) {
      setError(formatError(caught));
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
      {busy ? <p className="empty">A carregar...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="success">{message}</p> : null}
    </>
  );
}

/**
 * Constrói o pedido de venda depois de validar datas e IVA.
 *
 * @param form - Dados submetidos no formulário de venda.
 * @returns Corpo pronto para o cliente API.
 */
function parseSaleDocumentForm(form: FormData) {
  assertMf5Form(form, ["issuedAt", "dueDate", "vatRateId"]);

  return {
    customerId: String(form.get("customerId") ?? ""),
    issuedAt: String(form.get("issuedAt") ?? ""),
    dueDate: String(form.get("dueDate") ?? ""),
    lines: [
      {
        description: String(form.get("description") ?? ""),
        quantity: Number(form.get("quantity") ?? 1),
        unitPriceCents: Number(form.get("unitPriceCents") ?? 0),
        vatRateId: String(form.get("vatRateId") ?? ""),
      },
    ],
  };
}

/**
 * Constrói o pedido de compra depois de validar datas e IVA.
 *
 * @param form - Dados submetidos no formulário de compra.
 * @returns Corpo pronto para o cliente API.
 */
function parsePurchaseDocumentForm(form: FormData) {
  assertMf5Form(form, ["issuedAt", "dueDate", "vatRateId"]);

  return {
    supplierId: String(form.get("supplierId") ?? ""),
    issuedAt: String(form.get("issuedAt") ?? ""),
    dueDate: String(form.get("dueDate") ?? ""),
    lines: [
      {
        description: String(form.get("description") ?? ""),
        quantity: Number(form.get("quantity") ?? 1),
        unitPriceCents: Number(form.get("unitPriceCents") ?? 0),
        vatRateId: String(form.get("vatRateId") ?? ""),
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
function parseMoneyMovement(form: FormData, dateField: "receivedAt" | "paidAt") {
  return {
    amountCents: toPositiveInteger(form.get("amountCents"), "Valor"),
    [dateField]: requiredText(form.get(dateField), "Data"),
    method: requiredText(form.get("method"), "Metodo") as Method,
    reference: optionalText(form.get("reference")),
    notes: optionalText(form.get("notes")),
  };
}

/**
 * Renderiza os campos comuns de uma linha de documento de venda ou compra.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com campos de linha de documento.
 */
function DocumentLineFields({ cost }: { cost?: boolean }) {
  return (
    <fieldset className="lineFields">
      <legend>Linha do documento</legend>
      <label>
        <span>Artigo ID</span>
        <input name="itemId" required />
      </label>
      <label>
        <span>Taxa de IVA ID</span>
        <input name="vatRateId" required />
      </label>
      <label>
        <span>Descricao</span>
        <input name="description" />
      </label>
      <label>
        <span>Quantidade</span>
        <input name="quantity" type="number" min="1" required defaultValue="1" />
      </label>
      <label>
        <span>{cost ? "Custo em centimos" : "Preco em centimos"}</span>
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
    pickArray(await vatRateApi.list(), "vatRates"),
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
        vatRateApi.create({
          code: requiredText(form.get("code"), "Codigo"),
          description: requiredText(form.get("description"), "Descricao"),
          rateBps: toPositiveInteger(form.get("rateBps"), "Taxa"),
          type: requiredText(form.get("type"), "Tipo"),
          exemptionReason: optionalText(form.get("exemptionReason")),
        }),
      "Taxa de IVA criada.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Tabelas de IVA">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
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
        )}
      />
      <form className="operation" onSubmit={submit}>
        <h3>Criar taxa de IVA</h3>
        <div className="fields">
          <label>
            <span>Codigo</span>
            <input name="code" required />
          </label>
          <label>
            <span>Descricao</span>
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
            <span>Motivo de isencao</span>
            <input name="exemptionReason" />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
      </form>
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Sale Documents e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para documentos de venda.
 */
export function SaleDocumentsPage() {
  const list = useApiList(async () =>
    pickArray(await salesApi.listDocuments(), "saleDocuments"),
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
    const payload = parseSaleDocumentForm(new FormData(event.currentTarget));
    await action.run(
      () => salesApi.createDocument(payload),
      "Documento de venda criado.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Documentos de venda">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <div className="inlineActions">
            <button type="button" onClick={() => void action.run(() => salesApi.submitDocument(String(row.id)), "Venda submetida.")}>Submeter</button>
            <button type="button" onClick={() => void action.run(() => salesApi.approveDocument(String(row.id)), "Venda aprovada.")}>Aprovar</button>
            <button type="button" onClick={() => void action.run(() => salesApi.issueDocument(String(row.id)), "Venda emitida.")}>Emitir</button>
          </div>
        )}
      />
      <form className="operation" onSubmit={submit}>
        <h3>Criar rascunho de venda</h3>
        <div className="fields">
          <label>
            <span>Tipo</span>
            <select name="kind" required defaultValue="INVOICE">
              <option value="INVOICE">Fatura</option>
              <option value="INVOICE_RECEIPT">Fatura-recibo</option>
              <option value="CREDIT_NOTE">Nota de credito</option>
            </select>
          </label>
          <label>
            <span>Cliente ID</span>
            <input name="customerId" required />
          </label>
          <label>
            <span>Data</span>
            <input name="issuedAt" type="date" required defaultValue={today()} />
          </label>
          <label>
            <span>Vencimento</span>
            <input name="dueDate" type="date" />
          </label>
          <DocumentLineFields />
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
      </form>
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Receipts e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para recebimentos.
 */
export function ReceiptsPage() {
  const list = useApiList(async () =>
    pickArray(await salesApi.listDocuments(), "saleDocuments"),
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
        receiptApi.register(
          requiredText(form.get("id"), "Documento"),
          parseMoneyMovement(form, "receivedAt"),
        ),
      "Recebimento registado.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Recebimentos">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable rows={list.rows} />
      <form className="operation" onSubmit={submit}>
        <h3>Registar recebimento</h3>
        <div className="fields">
          <DocumentSelect name="id" label="Documento de venda" documents={list.rows} />
          <label>
            <span>Valor em centimos</span>
            <input name="amountCents" type="number" min="1" required />
          </label>
          <label>
            <span>Data</span>
            <input name="receivedAt" type="date" required defaultValue={today()} />
          </label>
          <MethodSelect />
          <label>
            <span>Referencia</span>
            <input name="reference" />
          </label>
          <label>
            <span>Notas</span>
            <input name="notes" />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Registar</button>
      </form>
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Sale Postings e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para lançamentos de vendas.
 */
export function SalePostingsPage() {
  const list = useApiList(async () =>
    pickArray(await salesApi.listDocuments(), "saleDocuments"),
  );
  const action = useAction(list.reload);

  return (
    <PageFrame title="Lancamentos de vendas">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <button
            type="button"
            onClick={() =>
              void action.run(
                () => accountingApi.postSaleDocument(String(row.id)),
                "Venda contabilizada.",
              )
            }
          >
            Contabilizar
          </button>
        )}
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
  const [asOfDate, setAsOfDate] = useState(today());
  const [rows, setRows] = useState<ApiObject[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega dados da API para atualizar o estado visível do ecrã.
   *
   * @returns Promise resolvida depois de atualizar os dados visíveis.
   */
  async function load() {
    setBusy(true);
    setError(null);
    try {
      setRows(pickArray(await salesOpenItemsApi.list(asOfDate), "openItems"));
    } catch (caught) {
      setError(formatError(caught));
      setRows([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <PageFrame title="Titulos em aberto">
      <Feedback busy={busy} error={error} />
      <form
        className="search"
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
      >
        <input
          type="date"
          value={asOfDate}
          onChange={(event) => setAsOfDate(event.target.value)}
        />
        <button type="submit" disabled={busy}>Atualizar</button>
      </form>
      <DataTable rows={rows} />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Sale Approval e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para aprovação de vendas.
 */
export function SaleApprovalPage() {
  const list = useApiList(async () =>
    pickArray(await salesApi.listDocuments(), "saleDocuments"),
  );
  const action = useAction(list.reload);

  /**
   * Processa a rejeição do documento indicado no formulário com o motivo obrigatório.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de rejeitar o documento indicado.
   */
  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(
      () =>
        salesApi.rejectDocument(requiredText(form.get("id"), "Documento"), {
          reason: requiredText(form.get("reason"), "Motivo"),
        }),
      "Venda rejeitada.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Aprovacao de vendas">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <div className="inlineActions">
            <button type="button" onClick={() => void action.run(() => salesApi.submitDocument(String(row.id)), "Venda submetida.")}>Submeter</button>
            <button type="button" onClick={() => void action.run(() => salesApi.approveDocument(String(row.id)), "Venda aprovada.")}>Aprovar</button>
            <button type="button" onClick={() => void action.run(() => salesApi.issueDocument(String(row.id)), "Venda emitida.")}>Emitir</button>
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
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Purchase Documents e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para documentos de compra.
 */
export function PurchaseDocumentsPage() {
  const list = useApiList(async () =>
    pickArray(await purchasesApi.listDocuments(), "purchaseDocuments"),
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
    const payload = parsePurchaseDocumentForm(new FormData(event.currentTarget));
    await action.run(
      () => purchasesApi.createDocument(payload),
      "Documento de compra criado.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Documentos de compra">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable rows={list.rows} />
      <form className="operation" onSubmit={submit}>
        <h3>Criar rascunho de compra</h3>
        <div className="fields">
          <label>
            <span>Tipo</span>
            <select name="kind" required defaultValue="SUPPLIER_INVOICE">
              <option value="SUPPLIER_INVOICE">Fatura de fornecedor</option>
              <option value="SUPPLIER_CREDIT_NOTE">Nota de credito</option>
            </select>
          </label>
          <label>
            <span>Fornecedor ID</span>
            <input name="supplierId" required />
          </label>
          <label>
            <span>Numero do fornecedor</span>
            <input name="supplierNumber" required />
          </label>
          <label>
            <span>Data</span>
            <input name="issuedAt" type="date" required defaultValue={today()} />
          </label>
          <label>
            <span>Vencimento</span>
            <input name="dueDate" type="date" />
          </label>
          <DocumentLineFields cost />
        </div>
        <button type="submit" disabled={action.busy}>Criar</button>
      </form>
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Payments e liga os controlos visuais aos endpoints correspondentes.
 *
 * @returns Elemento React renderizado para pagamentos.
 */
export function PaymentsPage() {
  const list = useApiList(async () =>
    pickArray(await purchasesApi.listDocuments(), "purchaseDocuments"),
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
        paymentApi.register(
          requiredText(form.get("id"), "Documento"),
          parseMoneyMovement(form, "paidAt"),
        ),
      "Pagamento registado.",
    );
    event.currentTarget.reset();
  }

  return (
    <PageFrame title="Pagamentos">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable rows={list.rows} />
      <form className="operation" onSubmit={submit}>
        <h3>Registar pagamento</h3>
        <div className="fields">
          <DocumentSelect name="id" label="Documento de compra" documents={list.rows} />
          <label>
            <span>Valor em centimos</span>
            <input name="amountCents" type="number" min="1" required />
          </label>
          <label>
            <span>Data</span>
            <input name="paidAt" type="date" required defaultValue={today()} />
          </label>
          <MethodSelect />
          <label>
            <span>Referencia</span>
            <input name="reference" />
          </label>
          <label>
            <span>Notas</span>
            <input name="notes" />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Registar</button>
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
  const list = useApiList(async () =>
    pickArray(await purchasesApi.listDocuments(), "purchaseDocuments"),
  );
  const action = useAction(list.reload);

  return (
    <PageFrame title="Lancamentos de compras">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <button
            type="button"
            onClick={() =>
              void action.run(
                () => accountingApi.postPurchaseDocument(String(row.id)),
                "Compra contabilizada.",
              )
            }
          >
            Contabilizar
          </button>
        )}
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
  const list = useApiList(async () =>
    pickArray(await purchasesApi.listDocuments(), "purchaseDocuments"),
  );
  const action = useAction(list.reload);
  const [history, setHistory] = useState<unknown>(null);

  /**
   * Processa a rejeição do documento indicado no formulário com o motivo obrigatório.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de rejeitar o documento indicado.
   */
  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(
      () =>
        purchaseApprovalApi.rejectDocument(
          requiredText(form.get("id"), "Documento"),
          requiredText(form.get("reason"), "Justificacao"),
        ),
      "Compra reprovada.",
    );
    event.currentTarget.reset();
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
    <PageFrame title="Aprovacao de compras">
      <Feedback busy={list.busy || action.busy} error={list.error ?? action.error} message={action.message} />
      <DataTable
        rows={list.rows}
        actions={(row) => (
          <div className="inlineActions">
            <button
              type="button"
              onClick={() =>
                void action.run(
                  () => purchaseApprovalApi.approveDocument(String(row.id)),
                  "Compra aprovada.",
                )
              }
            >
              Aprovar
            </button>
            <button
              type="button"
              onClick={() =>
                void action.run(
                  () => purchaseApprovalApi.postState(String(row.id)),
                  "Compra lancada.",
                )
              }
            >
              Lancar
            </button>
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
            <span>Justificacao</span>
            <input name="reason" required minLength={8} />
          </label>
        </div>
        <button type="submit" disabled={action.busy}>Reprovar</button>
      </form>
      <form className="operation" onSubmit={loadHistoryFromForm}>
        <h3>Consultar historico</h3>
        <div className="fields">
          <DocumentSelect name="id" label="Documento de compra" documents={list.rows} />
        </div>
        <button type="submit" disabled={action.busy}>Consultar historico</button>
      </form>
      {history ? <pre className="result">{JSON.stringify(history, null, 2)}</pre> : null}
    </PageFrame>
  );
}
