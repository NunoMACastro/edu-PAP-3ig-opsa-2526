/**
 * @file Cache em memória do resumo transversal do dashboard e header OPSA.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../auth/AuthProvider";
import { Permission } from "../auth/permissions";
import { apiClient, type DashboardSummary } from "../lib/apiClient";

interface DashboardContextValue {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (
      auth.status !== "authenticated" ||
      !auth.snapshot?.activeCompanyId ||
      !auth.hasPermission(Permission.DASHBOARD_READ)
    ) {
      setSummary(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setSummary((await apiClient.dashboard.summary()).summary);
    } catch (caught) {
      setSummary(null);
      setError(caught instanceof Error ? caught.message : "Não foi possível carregar o resumo.");
    } finally {
      setLoading(false);
    }
  }, [auth.hasPermission, auth.snapshot?.activeCompanyId, auth.status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ summary, loading, error, refresh }),
    [error, loading, refresh, summary],
  );
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error("useDashboard deve ser usado dentro de DashboardProvider.");
  return value;
}
