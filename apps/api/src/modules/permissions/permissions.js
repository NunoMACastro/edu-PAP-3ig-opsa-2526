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

export function getPermissionsForRole(role) {
    return rolePermissions[role] ?? [];
}

export function hasPermission(role, permission) {
    return getPermissionsForRole(role).includes(permission);
}