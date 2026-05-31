import { httpError } from "../../lib/httpErrors.js";

function serialize(customer) {
    return {
        id: customer.id,
        name: customer.name,
        nif: customer.nif,
        email: customer.email,
        phone: customer.phone,
        addressLine: customer.addressLine,
        postalCode: customer.postalCode,
        city: customer.city,
        isActive: customer.isActive,
    };
}

async function assertUniqueNif(prisma, companyId, nif, ignoreId = undefined) {
    if (!nif) return;

    const existing = await prisma.customer.findFirst({
        where: { companyId, nif, id: ignoreId ? { not: ignoreId } : undefined },
    });

    if (existing) {
        throw httpError(
            409,
            "CUSTOMER_NIF_EXISTS",
            "Ja existe cliente com este NIF nesta empresa",
        );
    }
}

export async function listCustomers(prisma, companyId) {
    const customers = await prisma.customer.findMany({
        where: { companyId, isActive: true },
        orderBy: { name: "asc" },
    });
    return customers.map(serialize);
}

export async function createCustomer(prisma, companyId, input) {
    await assertUniqueNif(prisma, companyId, input.nif);
    const customer = await prisma.customer.create({
        data: { companyId, ...input },
    });
    return serialize(customer);
}

export async function updateCustomer(prisma, companyId, customerId, input) {
    await assertUniqueNif(prisma, companyId, input.nif, customerId);

    const updated = await prisma.customer.updateMany({
        where: { id: customerId, companyId },
        data: input,
    });
    if (updated.count === 0)
        throw httpError(404, "CUSTOMER_NOT_FOUND", "Cliente nao encontrado");

    const customer = await prisma.customer.findFirst({
        where: { id: customerId, companyId },
    });
    return serialize(customer);
}

export async function deactivateCustomer(prisma, companyId, customerId) {
    const updated = await prisma.customer.updateMany({
        where: { id: customerId, companyId },
        data: { isActive: false },
    });
    if (updated.count === 0)
        throw httpError(404, "CUSTOMER_NOT_FOUND", "Cliente nao encontrado");
}