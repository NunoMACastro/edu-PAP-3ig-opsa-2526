/**
 * @file Contrato comum de cursor pagination e normalização defensiva de envelopes.
 */

export interface CursorPagination {
  cursor?: string;
  limit?: number;
}

export interface CursorPageInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface CursorPage<TItem> {
  items: TItem[];
  pageInfo: CursorPageInfo;
}

export interface CursorCollectionOptions {
  limit?: number;
  maxPages?: number;
}

export const EMPTY_PAGE_INFO: CursorPageInfo = Object.freeze({
  nextCursor: null,
  hasNextPage: false,
});

/**
 * Serializa cursor e limite sem permitir valores vazios ou limites fora do
 * contrato global de 1 a 100 registos.
 *
 * @param pagination - Cursor opaco e limite opcional.
 * @returns Query string com `?` inicial, ou string vazia.
 */
export function cursorPaginationQuery(pagination: CursorPagination = {}) {
  const params = new URLSearchParams();
  const cursor = pagination.cursor?.trim();
  if (cursor) params.set("cursor", cursor);
  if (pagination.limit !== undefined) {
    if (
      !Number.isInteger(pagination.limit) ||
      pagination.limit < 1 ||
      pagination.limit > 100
    ) {
      throw new TypeError("O limite da página deve estar entre 1 e 100.");
    }
    params.set("limit", String(pagination.limit));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

/**
 * Normaliza respostas paginadas e mantém compatibilidade apenas com endpoints
 * explicitamente não paginados através da chave indicada.
 *
 * @param response - Payload recebido da API.
 * @param fallbackKey - Chave do array usada por endpoints não paginados.
 * @param normalizeItem - Conversor defensivo aplicado a cada item.
 * @returns Envelope canónico com `items` e `pageInfo`.
 */
export function normalizeCursorPage<TItem>(
  response: unknown,
  fallbackKey: string,
  normalizeItem: (value: unknown) => TItem,
): CursorPage<TItem> {
  const object = response && typeof response === "object" && !Array.isArray(response)
    ? response as Record<string, unknown>
    : {};
  const sourceItems = Array.isArray(object.items)
    ? object.items
    : Array.isArray(object[fallbackKey])
      ? object[fallbackKey] as unknown[]
      : [];
  const rawPageInfo = object.pageInfo && typeof object.pageInfo === "object"
    ? object.pageInfo as Record<string, unknown>
    : {};
  const nextCursor = typeof rawPageInfo.nextCursor === "string" && rawPageInfo.nextCursor
    ? rawPageInfo.nextCursor
    : null;
  const hasNextPage = rawPageInfo.hasNextPage === true;

  // Um cursor é obrigatório quando a API afirma que existe página seguinte.
  if (hasNextPage && !nextCursor) {
    throw new Error("A API devolveu paginação incompleta.");
  }
  return {
    items: sourceItems.map(normalizeItem),
    pageInfo: { nextCursor, hasNextPage },
  };
}

/**
 * Percorre todas as paginas de uma referencia usada em selects estruturados.
 *
 * A funcao nunca aceita um cursor ausente/repetido quando o backend anuncia
 * continuacao. O teto de paginas evita um ciclo infinito perante uma API
 * defeituosa; nesse caso a UI recebe um erro explicito em vez de truncar
 * silenciosamente as opcoes disponiveis.
 *
 * @param loadPage - Loader tipado que aceita cursor e limite.
 * @param options - Tamanho da pagina e teto defensivo de iteracoes.
 * @returns Todos os itens das paginas percorridas, pela ordem da API.
 */
export async function collectCursorPages<TItem>(
  loadPage: (pagination: CursorPagination) => Promise<CursorPage<TItem>>,
  options: CursorCollectionOptions = {},
): Promise<TItem[]> {
  const limit = options.limit ?? 100;
  const maxPages = options.maxPages ?? 1_000;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new TypeError("O limite da coleção deve estar entre 1 e 100.");
  }
  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new TypeError("O teto de páginas deve ser um inteiro positivo.");
  }

  const items: TItem[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  for (let pageNumber = 0; pageNumber < maxPages; pageNumber += 1) {
    const page = await loadPage(cursor ? { cursor, limit } : { limit });
    if (
      !page ||
      !Array.isArray(page.items) ||
      !page.pageInfo ||
      typeof page.pageInfo.hasNextPage !== "boolean"
    ) {
      throw new Error("A API devolveu um envelope de paginação inválido.");
    }
    items.push(...page.items);
    if (!page.pageInfo.hasNextPage) return items;

    const nextCursor = page.pageInfo.nextCursor;
    if (!nextCursor || seenCursors.has(nextCursor)) {
      throw new Error("A API devolveu um cursor de paginação ausente ou repetido.");
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }

  throw new Error(`A listagem excedeu o teto defensivo de ${maxPages} páginas.`);
}
