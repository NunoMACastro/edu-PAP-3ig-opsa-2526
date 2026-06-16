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
    VAT_RATES_READ: "vat-rates.read",
    VAT_RATES_WRITE: "vat-rates.write",
    SALES_READ: "sales.read",
    SALES_WRITE: "sales.write",
    SALES_APPROVE: "sales.approve",
    PURCHASES_READ: "purchases.read",
    PURCHASES_WRITE: "purchases.write",
    PURCHASES_APPROVE: "purchases.approve",
    INVENTORY_READ: "inventory.read",
    INVENTORY_WRITE: "inventory.write",
    TAX_READ: "tax.read",
    TREASURY_READ: "treasury.read",
    TREASURY_WRITE: "treasury.write",
    IMPORTS_WRITE: "imports.write",
    COMPLIANCE_READ: "compliance.read",
    REPORTS_READ: "reports.read",
});

const rolePermissions = {
    ADMIN: Object.values(Permission),
    GESTOR: [
        Permission.USERS_MANAGE,
        Permission.COMPANY_READ,
        Permission.COMPANY_WRITE,
        Permission.ACCOUNTING_READ,
        Permission.FISCAL_PERIODS_READ,
        Permission.FISCAL_PERIODS_MANAGE,
        Permission.CUSTOMERS_WRITE,
        Permission.VAT_RATES_READ,
        Permission.VAT_RATES_WRITE,
        Permission.SALES_READ,
        Permission.SALES_WRITE,
        Permission.SALES_APPROVE,
        Permission.PURCHASES_READ,
        Permission.PURCHASES_WRITE,
        Permission.PURCHASES_APPROVE,
        Permission.INVENTORY_READ,
        Permission.INVENTORY_WRITE,
        Permission.TAX_READ,
        Permission.TREASURY_READ,
        Permission.TREASURY_WRITE,
        Permission.REPORTS_READ,
    ],
    CONTABILISTA: [
        Permission.COMPANY_READ,
        Permission.COMPANY_WRITE,
        Permission.ACCOUNTING_READ,
        Permission.ACCOUNTING_WRITE,
        Permission.FISCAL_PERIODS_READ,
        Permission.FISCAL_PERIODS_MANAGE,
        Permission.SUPPLIERS_WRITE,
        Permission.VAT_RATES_READ,
        Permission.VAT_RATES_WRITE,
        Permission.SALES_READ,
        Permission.SALES_WRITE,
        Permission.PURCHASES_READ,
        Permission.PURCHASES_WRITE,
        Permission.INVENTORY_READ,
        Permission.TAX_READ,
        Permission.TREASURY_READ,
        Permission.TREASURY_WRITE,
        Permission.IMPORTS_WRITE,
        Permission.COMPLIANCE_READ,
        Permission.REPORTS_READ,
    ],
    OPERACIONAL: [
        Permission.COMPANY_READ,
        Permission.CUSTOMERS_WRITE,
        Permission.SUPPLIERS_WRITE,
        Permission.ITEMS_WRITE,
        Permission.WAREHOUSES_WRITE,
        Permission.VAT_RATES_READ,
        Permission.SALES_READ,
        Permission.SALES_WRITE,
        Permission.PURCHASES_READ,
        Permission.PURCHASES_WRITE,
        Permission.INVENTORY_READ,
        Permission.INVENTORY_WRITE,
        Permission.TREASURY_READ,
        Permission.TREASURY_WRITE,
        Permission.REPORTS_READ,
    ],
    AUDITOR: [
        Permission.COMPANY_READ,
        Permission.ACCOUNTING_READ,
        Permission.FISCAL_PERIODS_READ,
        Permission.VAT_RATES_READ,
        Permission.SALES_READ,
        Permission.PURCHASES_READ,
        Permission.INVENTORY_READ,
        Permission.TAX_READ,
        Permission.COMPLIANCE_READ,
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
