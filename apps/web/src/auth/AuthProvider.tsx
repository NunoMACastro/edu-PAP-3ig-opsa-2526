/**
 * @file Estado central de autenticação, empresa ativa e permissões do frontend OPSA.
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apiClient,
  ApiError,
  type AuthSnapshot,
  subscribeToUnauthorized,
} from "../lib/apiClient";
import type { PermissionName } from "./permissions";

export type AuthStatus = "bootstrapping" | "anonymous" | "authenticated" | "error";

interface AuthContextValue {
  status: AuthStatus;
  snapshot: AuthSnapshot | null;
  permissions: ReadonlySet<string>;
  permissionsError: string | null;
  refreshSession: () => Promise<AuthSnapshot | null>;
  clearSession: () => void;
  hasPermission: (permission: PermissionName | string) => boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Mantém a sessão apenas em memória e volta sempre a confirmá-la na API.
 *
 * @param props - Conteúdo protegido pela sessão central.
 * @returns Provider React com autenticação deny-by-default.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("bootstrapping");
  const [snapshot, setSnapshot] = useState<AuthSnapshot | null>(null);
  const [permissionValues, setPermissionValues] = useState<string[]>([]);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setSnapshot(null);
    setPermissionValues([]);
    setPermissionsError(null);
    setStatus("anonymous");
  }, []);

  const refreshSession = useCallback(async () => {
    setStatus("bootstrapping");
    setPermissionValues([]);
    setPermissionsError(null);
    try {
      const nextSnapshot = await apiClient.auth.me();
      setSnapshot(nextSnapshot);

      if (!nextSnapshot.activeCompanyId) {
        setStatus("authenticated");
        return nextSnapshot;
      }

      try {
        const permissionSnapshot = await apiClient.companies.permissions();
        if (permissionSnapshot.companyId !== nextSnapshot.activeCompanyId) {
          throw new Error("O contexto de permissões não corresponde à empresa ativa.");
        }
        setPermissionValues(permissionSnapshot.permissions);
        setPermissionsError(null);
        setStatus("authenticated");
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 401) {
          clearSession();
          return null;
        }
        // Falha de permissions nunca reutiliza claims anteriores.
        setPermissionValues([]);
        setPermissionsError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível validar as permissões.",
        );
        setStatus("authenticated");
      }

      return nextSnapshot;
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearSession();
        return null;
      }
      setSnapshot(null);
      setPermissionValues([]);
      setPermissionsError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível validar a sessão.",
      );
      // Falhas de rede/servidor não significam que a pessoa esteja anónima.
      // O estado explícito impede mostrar login ou redirecionar com uma conclusão falsa.
      setStatus("error");
      return null;
    }
  }, [clearSession]);

  useEffect(() => subscribeToUnauthorized(clearSession), [clearSession]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const permissions = useMemo(
    () => new Set(permissionValues),
    [permissionValues],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      snapshot,
      permissions,
      permissionsError,
      refreshSession,
      clearSession,
      hasPermission: (permission) => permissions.has(permission),
      hasRole: (...roles) => Boolean(snapshot?.role && roles.includes(snapshot.role)),
    }),
    [
      clearSession,
      permissions,
      permissionsError,
      refreshSession,
      snapshot,
      status,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Obtém o contexto central de autenticação.
 *
 * @returns Sessão e helpers de autorização do frontend.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
