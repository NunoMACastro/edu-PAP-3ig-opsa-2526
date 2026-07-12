/**
 * @file Orçamento de performance MF5 para dashboards e listagens da OPSA.
 */

export const MF5_PERFORMANCE_BUDGET_MS = 2000;
export const MF5_LISTING_BUDGET_MS = MF5_PERFORMANCE_BUDGET_MS;
export const MF5_DASHBOARD_BUDGET_MS = MF5_PERFORMANCE_BUDGET_MS;

export type PerformanceSurface = "dashboard" | "listagem";

export interface PerformanceSample {
  label: string;
  surface: PerformanceSurface;
  durationMs: number;
  withinBudget: boolean;
}

/**
 * Mede a duração de uma operação assíncrona da UI e compara com o orçamento MF5.
 *
 * @typeParam TResult - Tipo devolvido pela operação medida.
 * @param surface - Tipo de ecrã medido.
 * @param label - Nome visível do dashboard ou listagem.
 * @param operation - Operação assíncrona que carrega dados.
 * @returns Resultado da operação e amostra de performance.
 */
export async function measureUiLoad<TResult>(
  surface: PerformanceSurface,
  label: string,
  operation: () => Promise<TResult>,
) {
  const startedAt = performance.now();
  const result = await operation();
  const durationMs = Math.round(performance.now() - startedAt);

  const sample: PerformanceSample = {
    label,
    surface,
    durationMs,
    withinBudget: durationMs <= MF5_PERFORMANCE_BUDGET_MS,
  };

  // A medição fica junto da operação para provar RNF07 sem mudar regras de domínio.
  return { result, sample };
}

/**
 * Mede uma listagem genérica servida pelo ResourcePanel.
 *
 * @typeParam TResult - Tipo devolvido pela operação medida.
 * @param label - Nome visível da listagem.
 * @param operation - Operação que carrega linhas da listagem.
 * @returns Resultado da operação e amostra de performance.
 */
export function measureListingLoad<TResult>(
  label: string,
  operation: () => Promise<TResult>,
) {
  return measureUiLoad("listagem", label, operation);
}

/**
 * Mede um dashboard dedicado, como relatórios operacionais ou KPIs executivos.
 *
 * @typeParam TResult - Tipo devolvido pela operação medida.
 * @param label - Nome visível do dashboard.
 * @param operation - Operação que carrega os dados do dashboard.
 * @returns Resultado da operação e amostra de performance.
 */
export function measureDashboardLoad<TResult>(
  label: string,
  operation: () => Promise<TResult>,
) {
  return measureUiLoad("dashboard", label, operation);
}

/**
 * Formata um aviso claro quando uma amostra ultrapassa o orçamento MF5.
 *
 * @param sample - Amostra de performance calculada no carregamento.
 * @returns Mensagem de aviso ou null quando a operação ficou dentro do orçamento.
 */
export function formatPerformanceWarning(sample: PerformanceSample) {
  if (sample.withinBudget) return null;

  // O aviso é separado de erro de API: dados válidos continuam visíveis ao utilizador.
  return `${sample.label} carregou em ${sample.durationMs} ms, acima do orçamento MF5 de ${MF5_PERFORMANCE_BUDGET_MS} ms. Revê a origem dos dados antes da entrega.`;
}
