/**
 * Cliente HTTP único para os endpoints MF0.
 *
 * A autenticação da MF0 usa cookie HttpOnly. Por isso, todas as chamadas usam
 * `credentials: "include"` para o browser enviar automaticamente o cookie `sid`.
 */

export type JsonBody = Record<string, unknown> | Array<unknown>;

export interface ApiClientOptions {
  baseUrl?: string;
}

export interface RequestOptions {
  body?: JsonBody;
}

const DEFAULT_BASE_URL = "/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Constrói uma query string simples sem aceitar valores vazios.
 *
 * @param params - Parâmetros opcionais.
 * @returns Query string com `?` inicial ou string vazia.
 */
function queryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value?.trim()) {
      searchParams.set(key, value.trim());
    }
  }

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
}

/**
 * Constrói um cliente HTTP simples para a API OPSA.
 *
 * @param options - Configuração opcional do cliente.
 * @returns Função `request` tipada para chamadas JSON.
 */
export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;

  /**
   * Executa uma chamada HTTP JSON contra a API.
   *
   * @typeParam TResponse - Tipo esperado da resposta JSON.
   * @param method - Método HTTP.
   * @param path - Caminho relativo ao `baseUrl`.
   * @param requestOptions - Body JSON opcional.
   * @returns Resposta JSON tipada ou `undefined` em respostas sem conteúdo.
   * @throws Error com mensagem devolvida pela API quando o status não é 2xx.
   */
  async function request<TResponse>(
    method: string,
    path: string,
    requestOptions: RequestOptions = {},
  ): Promise<TResponse> {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      credentials: "include",
      headers: requestOptions.body
        ? { "Content-Type": "application/json" }
        : undefined,
      body: requestOptions.body
        ? JSON.stringify(requestOptions.body)
        : undefined,
    });

    if (response.status === 204) {
      return undefined as TResponse;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : {};
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error ?? "API_ERROR",
        data.message ?? "Erro inesperado na API",
      );
    }

    return data as TResponse;
  }

  return {
    request,
    auth: {
      /**
       * Regista utilizador e recebe a sessão por cookie HttpOnly.
       *
       * @param body - Payload de registo definido no BK-MF0-01.
       * @returns Resposta JSON da API de autenticação.
       */
      register: (body: JsonBody) => request("POST", "/auth/register", { body }),
      /**
       * Autentica utilizador e recebe a sessão por cookie HttpOnly.
       *
       * @param body - Payload de login definido no BK-MF0-01.
       * @returns Resposta JSON da API de autenticação.
       */
      login: (body: JsonBody) => request("POST", "/auth/login", { body }),
      /**
       * Obtém o utilizador autenticado.
       *
       * @returns Resposta JSON com o utilizador da sessão atual.
       */
      me: () => request("GET", "/auth/me"),
      /**
       * Revoga a sessão atual.
       *
       * @returns Resposta sem conteúdo quando o logout termina com sucesso.
       */
      logout: () => request("POST", "/auth/logout"),
      /**
       * Pede recuperação de password sem revelar se o email existe.
       *
       * @param body - Payload com email normalizado pelo backend.
       * @returns Resposta genérica `{ ok: true }`.
       */
      forgotPassword: (body: JsonBody) =>
        request("POST", "/auth/password/forgot", { body }),
      /**
       * Define nova password a partir de token de recuperação.
       *
       * @param body - Payload com token e nova password.
       * @returns Resposta genérica `{ ok: true }`.
       */
      resetPassword: (body: JsonBody) =>
        request("POST", "/auth/password/reset", { body }),
    },
    companies: {
      /**
       * Lista empresas acessíveis ao utilizador autenticado.
       *
       * @returns Lista de empresas/memberships do utilizador.
       */
      list: () => request("GET", "/companies"),
      /**
       * Seleciona empresa ativa na sessão.
       *
       * @param body - Payload `{ companyId }`.
       * @returns Contexto ativo da empresa.
       */
      switchCompany: (body: JsonBody) =>
        request("POST", "/session/company", { body }),
      /**
       * Obtém empresa ativa da sessão.
       *
       * @returns Contexto multiempresa atual.
       */
      context: () => request("GET", "/session/context"),
      /**
       * Obtém role e permissões da empresa ativa.
       *
       * @returns Permissões calculadas pelo backend.
       */
      permissions: () => request("GET", "/permissions/me"),
      /**
       * Lista utilizadores da empresa ativa.
       *
       * @returns Membros ativos da empresa.
       */
      users: () => request("GET", "/company/users"),
      /**
       * Cria convite para novo membro da empresa.
       *
       * @param body - Payload com email e role.
       * @returns Convite criado.
       */
      inviteUser: (body: JsonBody) =>
        request("POST", "/company/invitations", { body }),
      /**
       * Atualiza role de um membro.
       *
       * @param id - Identificador do utilizador alvo.
       * @param body - Payload com nova role.
       * @returns Role atualizada.
       */
      updateUserRole: (id: string, body: JsonBody) =>
        request("PATCH", `/company/users/${id}/role`, { body }),
      /**
       * Remove membership ativa de um utilizador.
       *
       * @param id - Identificador do utilizador alvo.
       * @returns Resposta sem conteúdo.
       */
      removeUser: (id: string) => request("DELETE", `/company/users/${id}`),
      /**
       * Obtém perfil da empresa ativa.
       *
       * @returns Perfil fiscal e operacional da empresa.
       */
      getProfile: () => request("GET", "/company/profile"),
      /**
       * Cria ou atualiza perfil da empresa ativa.
       *
       * @param body - Payload do BK-MF0-06.
       * @returns Perfil persistido.
       */
      updateProfile: (body: JsonBody) =>
        request("PUT", "/company/profile", { body }),
    },
    accounting: {
      /**
       * Lista contas SNC da empresa.
       *
       * @returns Plano de contas da empresa ativa.
       */
      listAccounts: () => request("GET", "/accounting/accounts"),
      /**
       * Cria conta SNC manual.
       *
       * @param body - Payload de conta do BK-MF0-07.
       * @returns Conta criada.
       */
      createAccount: (body: JsonBody) =>
        request("POST", "/accounting/accounts", { body }),
      /**
       * Importa contas já normalizadas.
       *
       * @param body - Payload `{ rows: [...] }`.
       * @returns Total importado.
       */
      importAccounts: (body: JsonBody) =>
        request("POST", "/accounting/accounts/import", { body }),
      /**
       * Lista períodos fiscais da empresa.
       *
       * @returns Períodos fiscais ordenados.
       */
      listFiscalPeriods: () => request("GET", "/fiscal-periods"),
      /**
       * Cria período fiscal aberto.
       *
       * @param body - Payload do BK-MF0-08.
       * @returns Período fiscal criado.
       */
      createFiscalPeriod: (body: JsonBody) =>
        request("POST", "/fiscal-periods", { body }),
      /**
       * Fecha período fiscal.
       *
       * @param id - Identificador do período fiscal.
       * @returns Período fiscal fechado.
       */
      closeFiscalPeriod: (id: string) =>
        request("POST", `/fiscal-periods/${id}/close`),
      /**
       * Contabiliza documento de venda emitido.
       *
       * @param id - Identificador do documento de venda.
       * @returns Lançamento contabilístico criado.
       */
      postSaleDocument: (id: string) =>
        request("POST", `/accounting/sale-postings/${id}`),
      /**
       * Contabiliza documento de compra aprovado.
       *
       * @param id - Identificador do documento de compra.
       * @returns Lançamento contabilístico criado.
       */
      postPurchaseDocument: (id: string) =>
        request("POST", `/accounting/purchase-postings/${id}`),
    },
    customers: {
      /**
       * Lista clientes ativos.
       *
       * @returns Clientes da empresa ativa.
       */
      list: (search?: string) =>
        request("GET", `/customers${queryString({ search })}`),
      /**
       * Cria cliente.
       *
       * @param body - Payload do BK-MF0-09.
       * @returns Cliente criado.
       */
      create: (body: JsonBody) => request("POST", "/customers", { body }),
      /**
       * Atualiza cliente.
       *
       * @param id - Identificador do cliente.
       * @param body - Payload completo do cliente.
       * @returns Cliente atualizado.
       */
      update: (id: string, body: JsonBody) =>
        request("PATCH", `/customers/${id}`, { body }),
      /**
       * Desativa cliente.
       *
       * @param id - Identificador do cliente.
       * @returns Resposta sem conteúdo.
       */
      remove: (id: string) => request("DELETE", `/customers/${id}`),
    },
    suppliers: {
      /**
       * Lista fornecedores ativos.
       *
       * @returns Fornecedores da empresa ativa.
       */
      list: (search?: string) =>
        request("GET", `/suppliers${queryString({ search })}`),
      /**
       * Cria fornecedor.
       *
       * @param body - Payload do BK-MF0-10.
       * @returns Fornecedor criado.
       */
      create: (body: JsonBody) => request("POST", "/suppliers", { body }),
      /**
       * Atualiza fornecedor.
       *
       * @param id - Identificador do fornecedor.
       * @param body - Payload completo do fornecedor.
       * @returns Fornecedor atualizado.
       */
      update: (id: string, body: JsonBody) =>
        request("PATCH", `/suppliers/${id}`, { body }),
      /**
       * Desativa fornecedor.
       *
       * @param id - Identificador do fornecedor.
       * @returns Resposta sem conteúdo.
       */
      remove: (id: string) => request("DELETE", `/suppliers/${id}`),
    },
    items: {
      /**
       * Lista artigos e serviços ativos.
       *
       * @returns Itens da empresa ativa.
       */
      list: () => request("GET", "/items"),
      /**
       * Cria artigo ou serviço.
       *
       * @param body - Payload do BK-MF0-11.
       * @returns Item criado.
       */
      create: (body: JsonBody) => request("POST", "/items", { body }),
      /**
       * Atualiza artigo ou serviço.
       *
       * @param id - Identificador do item.
       * @param body - Payload completo do item.
       * @returns Item atualizado.
       */
      update: (id: string, body: JsonBody) =>
        request("PATCH", `/items/${id}`, { body }),
      /**
       * Desativa artigo ou serviço.
       *
       * @param id - Identificador do item.
       * @returns Resposta sem conteúdo.
       */
      remove: (id: string) => request("DELETE", `/items/${id}`),
    },
    warehouses: {
      /**
       * Lista armazéns ativos.
       *
       * @returns Armazéns da empresa ativa.
       */
      list: () => request("GET", "/warehouses"),
      /**
       * Cria armazém.
       *
       * @param body - Payload do BK-MF0-12.
       * @returns Armazém criado.
       */
      create: (body: JsonBody) => request("POST", "/warehouses", { body }),
      /**
       * Lista localizações de um armazém.
       *
       * @param id - Identificador do armazém.
       * @returns Localizações ativas.
       */
      listLocations: (id: string) =>
        request("GET", `/warehouses/${id}/locations`),
      /**
       * Cria localização num armazém.
       *
       * @param id - Identificador do armazém.
       * @param body - Payload da localização.
       * @returns Localização criada.
       */
      createLocation: (id: string, body: JsonBody) =>
        request("POST", `/warehouses/${id}/locations`, { body }),
    },
    vatRates: {
      /**
       * Lista taxas de IVA da empresa ativa.
       *
       * @returns Taxas de IVA.
       */
      list: () => request("GET", "/vat-rates"),
      /**
       * Cria taxa de IVA.
       *
       * @param body - Payload da taxa de IVA.
       * @returns Taxa criada.
       */
      create: (body: JsonBody) => request("POST", "/vat-rates", { body }),
      /**
       * Ativa ou desativa taxa de IVA.
       *
       * @param id - Identificador da taxa.
       * @param body - Payload `{ isActive }`.
       * @returns Taxa atualizada.
       */
      setActive: (id: string, body: JsonBody) =>
        request("PATCH", `/vat-rates/${id}/active`, { body }),
    },
    sales: {
      /**
       * Lista documentos de venda.
       *
       * @returns Documentos de venda.
       */
      listDocuments: () => request("GET", "/sales/documents"),
      /**
       * Cria documento de venda em rascunho.
       *
       * @param body - Payload do documento.
       * @returns Documento criado.
       */
      createDocument: (body: JsonBody) =>
        request("POST", "/sales/documents", { body }),
      /**
       * Submete documento de venda.
       *
       * @param id - Identificador do documento.
       * @returns Documento submetido.
       */
      submitDocument: (id: string) =>
        request("POST", `/sales/documents/${id}/submit`),
      /**
       * Aprova documento de venda.
       *
       * @param id - Identificador do documento.
       * @returns Documento aprovado.
       */
      approveDocument: (id: string) =>
        request("POST", `/sales/documents/${id}/approve`),
      /**
       * Rejeita documento de venda.
       *
       * @param id - Identificador do documento.
       * @param body - Payload `{ reason }`.
       * @returns Documento rejeitado.
       */
      rejectDocument: (id: string, body: JsonBody) =>
        request("POST", `/sales/documents/${id}/reject`, { body }),
      /**
       * Emite documento de venda aprovado.
       *
       * @param id - Identificador do documento.
       * @returns Documento emitido.
       */
      issueDocument: (id: string) =>
        request("POST", `/sales/documents/${id}/issue`),
      /**
       * Regista recebimento de documento de venda.
       *
       * @param id - Identificador do documento.
       * @param body - Payload do recebimento.
       * @returns Recebimento criado.
       */
      registerReceipt: (id: string, body: JsonBody) =>
        request("POST", `/sales/documents/${id}/receipts`, { body }),
      /**
       * Lista títulos de venda em aberto.
       *
       * @param asOfDate - Data de referência opcional.
       * @returns Títulos em aberto.
       */
      listOpenItems: (asOfDate?: string) =>
        request("GET", `/sales/open-items${queryString({ asOfDate })}`),
    },
    purchases: {
      /**
       * Lista documentos de compra.
       *
       * @returns Documentos de compra.
       */
      listDocuments: () => request("GET", "/purchases/documents"),
      /**
       * Cria documento de compra em rascunho.
       *
       * @param body - Payload do documento.
       * @returns Documento criado.
       */
      createDocument: (body: JsonBody) =>
        request("POST", "/purchases/documents", { body }),
      /**
       * Aprova documento de compra.
       *
       * @param id - Identificador do documento.
       * @returns Documento aprovado.
       */
      approveDocument: (id: string) =>
        request("POST", `/purchases/documents/${id}/approve`),
      /**
       * Rejeita documento de compra com justificação.
       *
       * @param id - Identificador do documento.
       * @param body - Payload `{ reason }`.
       * @returns Documento rejeitado.
       */
      rejectDocument: (id: string, body: JsonBody) =>
        request("POST", `/purchases/documents/${id}/reject`, { body }),
      /**
       * Lista histórico de aprovação/reprovação de uma compra.
       *
       * @param id - Identificador do documento.
       * @returns Histórico de decisões.
       */
      approvalHistory: (id: string) =>
        request("GET", `/purchases/documents/${id}/approval-history`),
      /**
       * Lança estado contabilístico da compra.
       *
       * @param id - Identificador do documento.
       * @returns Lançamento contabilístico criado.
       */
      postState: (id: string) =>
        request("POST", `/purchases/documents/${id}/post-state`),
      /**
       * Regista pagamento de compra.
       *
       * @param id - Identificador do documento.
       * @param body - Payload do pagamento.
       * @returns Pagamento criado.
       */
      registerPayment: (id: string, body: JsonBody) =>
        request("POST", `/purchases/documents/${id}/payments`, { body }),
    },
    inventory: {
      listStockMovements: () => request("GET", "/inventory/stock-movements"),
      createStockMovement: (body: JsonBody) =>
        request("POST", "/inventory/stock-movements", { body }),
      previewFifoCost: (params: {
        itemId: string;
        warehouseId: string;
        quantity: string;
      }) =>
        request(
          "GET",
          `/inventory/fifo-cost/preview${queryString(params)}`,
        ),
      listCounts: () => request("GET", "/inventory/counts"),
      createCount: (body: JsonBody) =>
        request("POST", "/inventory/counts", { body }),
      saveCountLines: (id: string, body: JsonBody) =>
        request("PATCH", `/inventory/counts/${id}/lines`, { body }),
      postCount: (id: string) =>
        request("POST", `/inventory/counts/${id}/post`),
      listStockAlerts: () => request("GET", "/inventory/stock-alerts"),
      saveStockAlertSetting: (body: JsonBody) =>
        request("PUT", "/inventory/stock-alerts/settings", { body }),
    },
    manualJournals: {
      create: (body: JsonBody) =>
        request("POST", "/accounting/manual-journals", { body }),
      get: (id: string) => request("GET", `/accounting/manual-journals/${id}`),
      update: (id: string, body: JsonBody) =>
        request("PATCH", `/accounting/manual-journals/${id}`, { body }),
      addAttachment: (id: string, body: JsonBody) =>
        request("POST", `/accounting/manual-journals/${id}/attachments`, { body }),
    },
    accountingReports: {
      trialBalance: (from: string, to: string) =>
        request("GET", `/accounting/reports/trial-balance${queryString({ from, to })}`),
      ledger: (accountId: string, from: string, to: string) =>
        request(
          "GET",
          `/accounting/reports/ledger${queryString({ accountId, from, to })}`,
        ),
      trialBalanceExportUrl: (from: string, to: string) =>
        `${baseUrl}/accounting/reports/trial-balance.xlsx${queryString({ from, to })}`,
      ledgerExportUrl: (accountId: string, from: string, to: string) =>
        `${baseUrl}/accounting/reports/ledger.pdf${queryString({ accountId, from, to })}`,
    },
    financialStatements: {
      incomeStatement: (from: string, to: string) =>
        request(
          "GET",
          `/accounting/statements/income-statement${queryString({ from, to })}`,
        ),
      balanceSheet: (from: string, to: string) =>
        request(
          "GET",
          `/accounting/statements/balance-sheet${queryString({ from, to })}`,
        ),
    },
  };
}

export const apiClient = createApiClient();
