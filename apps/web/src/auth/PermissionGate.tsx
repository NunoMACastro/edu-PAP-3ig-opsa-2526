/**
 * @file Gate visual deny-by-default para comandos que continuam protegidos no backend.
 */

import type { ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import type { PermissionName } from "./permissions";

/**
 * Renderiza conteúdo apenas quando a sessão atual possui a permissão pedida.
 *
 * @param props - Permissão, conteúdo autorizado e fallback opcional.
 * @returns Conteúdo autorizado ou fallback.
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: PermissionName | string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? children : fallback;
}

