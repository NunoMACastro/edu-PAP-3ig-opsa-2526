/**
 * @file Cliente HTTP centralizado do frontend para comunicar com a API OPSA usando cookies HttpOnly.
 */

/**
 * Cliente HTTP único para os endpoints MF0.
 *
 * A autenticação da MF0 usa cookie HttpOnly. Por isso, todas as chamadas usam
 * `credentials: "include"` para o browser enviar automaticamente o cookie `sid`.
 */

export type JsonBody = Record<string, unknown> | Array<unknown>;
export type AccountingExportFormat = "csv" | "xlsx" | "pdf";

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
   * @throws Error com mensagem devolvida pela API quando o status não é 2xx.
   * @returns Resposta JSON tipada ou `undefined` em respostas sem conteúdo.
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
       * Fecha um período fiscal aberto da empresa ativa.
       * Esta ação delega no backend a validação contabilística antes de bloquear novas alterações.
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
       * Lista clientes ativos e aplica pesquisa opcional no backend.
       * A função mantém a página desacoplada do formato da query string.
       *
       * @param search - Texto opcional de pesquisa.
       * @returns Clientes da empresa ativa.
       */
      list: (search?: string) =>
        request("GET", `/customers${queryString({ search })}`),
      /**
       * Cria um cliente no contexto da empresa ativa.
       * O payload segue o contrato validado pelo backend para NIF, email e dados comerciais.
       *
       * @param body - Payload do BK-MF0-09.
       * @returns Cliente criado.
       */
      create: (body: JsonBody) => request("POST", "/customers", { body }),
      /**
       * Atualiza os dados principais de um cliente existente.
       * A API valida novamente o payload completo antes de persistir alterações.
       *
       * @param id - Identificador do cliente.
       * @param body - Payload completo do cliente.
       * @returns Cliente atualizado.
       */
      update: (id: string, body: JsonBody) =>
        request("PATCH", `/customers/${id}`, { body }),
      /**
       * Desativa um cliente sem remover o histórico associado.
       * O backend preserva a rastreabilidade e devolve uma resposta sem conteúdo.
       *
       * @param id - Identificador do cliente.
       * @returns Resposta sem conteúdo.
       */
      remove: (id: string) => request("DELETE", `/customers/${id}`),
    },
    suppliers: {
      /**
       * Lista fornecedores ativos e aplica pesquisa opcional no backend.
       * A função reutiliza o mesmo padrão dos clientes para manter a UI consistente.
       *
       * @param search - Texto opcional de pesquisa.
       * @returns Fornecedores da empresa ativa.
       */
      list: (search?: string) =>
        request("GET", `/suppliers${queryString({ search })}`),
      /**
       * Cria um fornecedor no contexto da empresa ativa.
       * O payload é enviado ao backend para validação fiscal e comercial.
       *
       * @param body - Payload do BK-MF0-10.
       * @returns Fornecedor criado.
       */
      create: (body: JsonBody) => request("POST", "/suppliers", { body }),
      /**
       * Atualiza os dados principais de um fornecedor existente.
       * A chamada preserva o contrato de validação centralizado no backend.
       *
       * @param id - Identificador do fornecedor.
       * @param body - Payload completo do fornecedor.
       * @returns Fornecedor atualizado.
       */
      update: (id: string, body: JsonBody) =>
        request("PATCH", `/suppliers/${id}`, { body }),
      /**
       * Desativa um fornecedor sem apagar o histórico operacional.
       * O backend mantém a informação necessária para auditoria e documentos antigos.
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
       * Lista armazéns ativos disponíveis para movimentos de stock.
       * A função alimenta formulários e páginas que precisam da estrutura logística atual.
       *
       * @returns Armazéns da empresa ativa.
       */
      list: () => request("GET", "/warehouses"),
      /**
       * Cria um armazém operacional para a empresa ativa.
       * O backend valida código e nome antes de disponibilizar o armazém ao inventário.
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
      /**
       * Lista movimentos de stock registados para a empresa ativa.
       * A resposta alimenta a página de inventário sem expor detalhes do endpoint.
       *
       * @returns Movimentos de stock devolvidos pela API.
       */
      listStockMovements: () => request("GET", "/inventory/stock-movements"),
      /**
       * Cria um movimento de stock manual ou operacional.
       * O backend valida artigo, armazém, quantidade e sentido antes de persistir.
       *
       * @param body - Payload JSON do movimento de stock.
       * @returns Movimento de stock criado.
       */
      createStockMovement: (body: JsonBody) =>
        request("POST", "/inventory/stock-movements", { body }),
      /**
       * Calcula uma pré-visualização de custo FIFO sem gravar movimento.
       * A query identifica artigo, armazém e quantidade a simular.
       *
       * @param params - Parâmetros necessários para a simulação FIFO.
       * @returns Resultado de custo previsto para a saída de stock.
       */
      previewFifoCost: (params: {
        itemId: string;
        warehouseId: string;
        quantity: string;
      }) =>
        request(
          "GET",
          `/inventory/fifo-cost/preview${queryString(params)}`,
        ),
      /**
       * Lista contagens físicas de inventário da empresa ativa.
       * A função suporta o ecrã de reconciliação entre stock contado e stock registado.
       *
       * @returns Contagens físicas existentes.
       */
      listCounts: () => request("GET", "/inventory/counts"),
      /**
       * Cria uma nova contagem física em estado inicial.
       * O payload define o contexto logístico que será detalhado por linhas.
       *
       * @param body - Payload JSON da contagem física.
       * @returns Contagem física criada.
       */
      createCount: (body: JsonBody) =>
        request("POST", "/inventory/counts", { body }),
      /**
       * Guarda linhas contadas para uma contagem física existente.
       * O backend valida cada linha antes de atualizar as quantidades observadas.
       *
       * @param id - Identificador da contagem física.
       * @param body - Payload JSON com as linhas contadas.
       * @returns Linhas guardadas para a contagem.
       */
      saveCountLines: (id: string, body: JsonBody) =>
        request("PATCH", `/inventory/counts/${id}/lines`, { body }),
      /**
       * Lança uma contagem física e aplica os ajustamentos necessários.
       * A operação fecha a contagem e pede ao backend para calcular diferenças.
       *
       * @param id - Identificador da contagem física a lançar.
       * @returns Contagem lançada com o estado final.
       */
      postCount: (id: string) =>
        request("POST", `/inventory/counts/${id}/post`),
      /**
       * Lista alertas de stock calculados para a empresa ativa.
       * A resposta combina níveis mínimos, existências e regras configuradas.
       *
       * @returns Alertas de stock prontos a apresentar na UI.
       */
      listStockAlerts: () => request("GET", "/inventory/stock-alerts"),
      /**
       * Guarda a configuração usada para gerar alertas de stock.
       * O backend valida limites e contexto antes de recalcular os alertas.
       *
       * @param body - Payload JSON com a configuração de alerta.
       * @returns Configuração persistida.
       */
      saveStockAlertSetting: (body: JsonBody) =>
        request("PUT", "/inventory/stock-alerts/settings", { body }),
    },
    manualJournals: {
      /**
       * Cria um lançamento manual de contabilidade.
       * O backend valida o equilíbrio entre débitos e créditos antes de persistir.
       *
       * @param body - Payload JSON do lançamento manual.
       * @returns Lançamento manual criado.
       */
      create: (body: JsonBody) =>
        request("POST", "/accounting/manual-journals", { body }),
      /**
       * Consulta um lançamento manual específico.
       * A função devolve o detalhe necessário para revisão ou edição.
       *
       * @param id - Identificador do lançamento manual.
       * @returns Lançamento manual encontrado.
       */
      get: (id: string) => request("GET", `/accounting/manual-journals/${id}`),
      /**
       * Atualiza um lançamento manual existente.
       * A API volta a validar linhas, contas e equilíbrio contabilístico.
       *
       * @param id - Identificador do lançamento manual.
       * @param body - Payload JSON com os novos dados contabilísticos.
       * @returns Lançamento manual atualizado.
       */
      update: (id: string, body: JsonBody) =>
        request("PATCH", `/accounting/manual-journals/${id}`, { body }),
      /**
       * Associa um anexo a um lançamento manual.
       * O payload contém os metadados ou conteúdo aceites pelo backend.
       *
       * @param id - Identificador do lançamento manual.
       * @param body - Payload JSON do anexo.
       * @returns Anexo registado no lançamento.
       */
      addAttachment: (id: string, body: JsonBody) =>
        request("POST", `/accounting/manual-journals/${id}/attachments`, { body }),
    },
    accountingReports: {
      /**
       * Consulta o balancete para um intervalo de datas.
       * A query é montada no client e validada no backend antes do cálculo.
       *
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @returns Balancete calculado para a empresa ativa.
       */
      trialBalance: (from: string, to: string) =>
        request("GET", `/accounting/reports/trial-balance${queryString({ from, to })}`),
      /**
       * Consulta a razão de uma conta num intervalo temporal.
       * O backend valida a conta e agrega os movimentos autorizados.
       *
       * @param accountId - Identificador da conta contabilística.
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @returns Razão contabilística da conta selecionada.
       */
      ledger: (accountId: string, from: string, to: string) =>
        request(
          "GET",
          `/accounting/reports/ledger${queryString({ accountId, from, to })}`,
        ),
      /**
       * Constrói o URL de exportação do balancete.
       * Ao devolver o URL, a UI pode usá-lo diretamente em downloads autenticados.
       *
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @param format - Formato de exportação pedido.
       * @returns URL absoluto para exportar o balancete.
       */
      trialBalanceExportUrl: (
        from: string,
        to: string,
        format: AccountingExportFormat,
      ) =>
        `${baseUrl}/accounting/reports/trial-balance/export${queryString({ from, to, format })}`,
      /**
       * Constrói o URL de exportação da razão de uma conta.
       * A função mantém a montagem da query junto do client contabilístico.
       *
       * @param accountId - Identificador da conta contabilística.
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @param format - Formato de exportação pedido.
       * @returns URL absoluto para exportar a razão.
       */
      ledgerExportUrl: (
        accountId: string,
        from: string,
        to: string,
        format: AccountingExportFormat,
      ) =>
        `${baseUrl}/accounting/reports/ledger/export${queryString({ accountId, from, to, format })}`,
    },
    financialStatements: {
      /**
       * Consulta a demonstração de resultados para o período selecionado.
       * O backend calcula rendimentos, gastos e resultado líquido da empresa ativa.
       *
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @returns Demonstração de resultados calculada.
       */
      incomeStatement: (from: string, to: string) =>
        request(
          "GET",
          `/accounting/statements/income-statement${queryString({ from, to })}`,
        ),
      /**
       * Consulta o balanço para o período selecionado.
       * A função delega a agregação de ativos, passivos e capital próprio no backend.
       *
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @returns Balanço calculado para a empresa ativa.
       */
      balanceSheet: (from: string, to: string) =>
        request(
          "GET",
          `/accounting/statements/balance-sheet${queryString({ from, to })}`,
        ),
    },
    tax: {
      /**
       * Consulta o mapa de IVA para um intervalo fiscal.
       * A API agrega IVA liquidado e dedutível a partir dos documentos autorizados.
       *
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @returns Mapa de IVA calculado.
       */
      vatMap: (from: string, to: string) =>
        request("GET", `/tax/vat-maps${queryString({ from, to })}`),
    },
    treasury: {
      /**
       * Lista contas bancárias registadas na tesouraria.
       * A resposta alimenta reconciliações, importações e previsões de caixa.
       *
       * @returns Contas bancárias da empresa ativa.
       */
      listAccounts: () => request("GET", "/treasury/accounts"),
      /**
       * Cria uma conta bancária de tesouraria.
       * O backend valida identificadores e dados bancários antes de persistir.
       *
       * @param body - Payload JSON da conta bancária.
       * @returns Conta bancária criada.
       */
      createAccount: (body: JsonBody) =>
        request("POST", "/treasury/accounts", { body }),
      /**
       * Importa linhas de extrato bancário.
       * A função envia o ficheiro ou linhas normalizadas para processamento no backend.
       *
       * @param body - Payload JSON da importação de extrato.
       * @returns Resumo da importação realizada.
       */
      importStatement: (body: JsonBody) =>
        request("POST", "/treasury/statements/import", { body }),
      /**
       * Consulta a previsão de cashflow para um intervalo.
       * O backend cruza recebimentos, pagamentos e documentos em aberto.
       *
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @returns Previsão de cashflow calculada.
       */
      forecast: (from: string, to: string) =>
        request("GET", `/treasury/forecast${queryString({ from, to })}`),
    },
    imports: {
      /**
       * Importa dados comerciais em lote.
       * O backend decide a rota de criação ou atualização por tipo de linha recebida.
       *
       * @param body - Payload JSON com linhas de clientes, fornecedores, artigos ou extratos.
       * @returns Resumo da importação de dados comerciais.
       */
      businessData: (body: JsonBody) =>
        request("POST", "/imports/business-data", { body }),
    },
    compliance: {
      /**
       * Gera ou consulta o pacote SAF-T para o período indicado.
       * A função representa o ponto de entrada de compliance usado pela UI.
       *
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @returns Resultado SAF-T devolvido pela API.
       */
      saft: (from: string, to: string) =>
        request("GET", `/compliance/saft${queryString({ from, to })}`),
    },
    reports: {
      /**
       * Consulta o relatório operacional para um intervalo de datas.
       * O backend agrega vendas, compras, tesouraria e indicadores de execução.
       *
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @returns Relatório operacional calculado.
       */
      operational: (from: string, to: string) =>
        request("GET", `/reports/operational${queryString({ from, to })}`),
      /**
       * Consulta KPIs executivos para o dashboard de gestão.
       * A função delega no backend a agregação financeira e operacional.
       *
       * @param from - Data inicial no formato YYYY-MM-DD.
       * @param to - Data final no formato YYYY-MM-DD.
       * @returns Indicadores executivos calculados.
       */
      executiveKpis: (from: string, to: string) =>
        request("GET", `/reports/executive-kpis${queryString({ from, to })}`),
    },
  };
}

export const apiClient = createApiClient();
