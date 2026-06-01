/**
 * @file Matriz mínima de permissões do BK-MF0-02.
 *
 * As roles vêm diretamente de RF02. As permissões refletem apenas os domínios
 * MF0 necessários para proteger endpoints reais; permissões mais finas ficam
 * para documentação futura, se existir.
 */

export const Permission = Object.freeze({
    USERS_MANAGE: "users.manage",
    COMPANY_READ: "company.read",
    COMPANY_WRITE: "company.write",
    ACCOUNTING_READ: "accounting.read",
    ACCOUNTING_WRITE: "accounting.write",
    FISCAL_PERIODS_READ: "fiscal-periods.read",
    FISCAL_PERIODS_MANAGE: "fiscal-periods.manage",
    CUSTOMERS_WRITE: "customers.write",
    SUPPLIERS_WRITE: "suppliers.write",
    ITEMS_WRITE: "items.write",
    WAREHOUSES_WRITE: "warehouses.write",
});

const rolePermissions = {
    ADMIN: Object.values(Permission),
    GESTOR: [
        Permission.USERS_MANAGE,
        Permission.COMPANY_READ,
        Permission.COMPANY_WRITE,
        Permission.FISCAL_PERIODS_READ,
        Permission.FISCAL_PERIODS_MANAGE,
        Permission.CUSTOMERS_WRITE,
        Permission.SUPPLIERS_WRITE,
        Permission.ITEMS_WRITE,
        Permission.WAREHOUSES_WRITE,
    ],
    CONTABILISTA: [
        Permission.COMPANY_READ,
        Permission.COMPANY_WRITE,
        Permission.ACCOUNTING_READ,
        Permission.ACCOUNTING_WRITE,
        Permission.FISCAL_PERIODS_READ,
        Permission.FISCAL_PERIODS_MANAGE,
        Permission.SUPPLIERS_WRITE,
    ],
    OPERACIONAL: [
        Permission.COMPANY_READ,
        Permission.CUSTOMERS_WRITE,
        Permission.SUPPLIERS_WRITE,
        Permission.ITEMS_WRITE,
        Permission.WAREHOUSES_WRITE,
    ],
    AUDITOR: [
        Permission.COMPANY_READ,
        Permission.ACCOUNTING_READ,
        Permission.FISCAL_PERIODS_READ,
    ],
};

/**
 * Devolve as permissões associadas a uma role canónica.
 *
 * @param {string | null | undefined} role - Role ativa no contexto da empresa.
 * @returns {string[]} Lista de permissões funcionais.
 */
export function getPermissionsForRole(role) {
    return rolePermissions[role] ?? [];
}

/**
 * Verifica se uma role possui determinada permissão.
 *
 * @param {string | null | undefined} role - Role ativa no contexto da empresa.
 * @param {string} permission - Permissão funcional a verificar.
 * @returns {boolean} `true` quando a role inclui a permissão.
 */
export function hasPermission(role, permission) {
    return getPermissionsForRole(role).includes(permission);
}
