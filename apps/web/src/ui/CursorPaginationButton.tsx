/**
 * @file Controlo acessível e reutilizável para avançar em cursor pagination.
 */

interface CursorPaginationButtonProps {
  hasNextPage: boolean;
  busy: boolean;
  onLoadMore: () => Promise<void> | void;
  label?: string;
}

/**
 * Expõe a página seguinte sem substituir os registos já visíveis.
 *
 * @param props - Estado da página e callback de carregamento.
 * @returns Botão dentro de navegação semântica, ou `null` na última página.
 */
export function CursorPaginationButton({
  hasNextPage,
  busy,
  onLoadMore,
  label = "registos",
}: CursorPaginationButtonProps) {
  if (!hasNextPage) return null;

  return (
    <nav aria-label={`Paginação de ${label}`}>
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={() => void onLoadMore()}
      >
        {busy ? "A carregar mais..." : "Carregar mais"}
      </button>
    </nav>
  );
}
