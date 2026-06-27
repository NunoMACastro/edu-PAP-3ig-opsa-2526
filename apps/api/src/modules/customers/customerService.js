/**
 * @file Service de clientes do BK-MF0-09.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Serializa cliente para resposta pública.
 *
 * @param {object} customer - Cliente Prisma.
 * @returns {object} Cliente público.
 */
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

/**
 * Garante unicidade de NIF por empresa quando NIF existe.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string | null} nif - NIF validado.
 * @param {string | undefined} [ignoreId] - Cliente a ignorar em updates.
 * @param ignoreId - Identificador a excluir da verificação de unicidade.
 * @returns {Promise<void>}
 */
async function assertUniqueNif(prisma, companyId, nif, ignoreId = undefined) {
    if (!nif) return;

    const existing = await prisma.customer.findFirst({
        where: { companyId, nif, id: ignoreId ? { not: ignoreId } : undefined },
    });

    if (existing) {
        throw httpError(
            409,
            "CUSTOMER_NIF_EXISTS",
            "Já existe cliente com este NIF nesta empresa",
        );
    }
}

/**
 * Lista clientes ativos da empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Clientes ativos.
 */
export async function listCustomers(prisma, companyId) {
    return searchCustomers(prisma, companyId);
}

/**
 * Lista clientes ativos, com pesquisa opcional por nome ou NIF.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string | undefined} [search] - Texto de pesquisa opcional.
 * @param search - Texto opcional de pesquisa.
 * @returns {Promise<object[]>} Clientes ativos.
 */
export async function searchCustomers(prisma, companyId, search = undefined) {
    const searchFilter = search
        ? {
              OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { nif: { contains: search, mode: "insensitive" } },
              ],
          }
        : {};

    const customers = await prisma.customer.findMany({
        where: { companyId, isActive: true, ...searchFilter },
        orderBy: { name: "asc" },
    });
    return customers.map(serialize);
}

/**
 * Cria cliente na empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object} input - Cliente validado.
 * @returns {Promise<object>} Cliente criado.
 */
export async function createCustomer(prisma, companyId, input) {
    await assertUniqueNif(prisma, companyId, input.nif);
    const customer = await prisma.customer.create({
        data: { companyId, ...input },
    });
    return serialize(customer);
}

/**
 * Atualiza cliente da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} customerId - Cliente alvo.
 * @param {object} input - Dados validados.
 * @returns {Promise<object>} Cliente atualizado.
 */
export async function updateCustomer(prisma, companyId, customerId, input) {
    await assertUniqueNif(prisma, companyId, input.nif, customerId);

    const updated = await prisma.customer.updateMany({
        where: { id: customerId, companyId },
        data: input,
    });
    if (updated.count === 0) {
        throw httpError(404, "CUSTOMER_NOT_FOUND", "Cliente não encontrado");
    }

    const customer = await prisma.customer.findFirst({
        where: { id: customerId, companyId },
    });
    return serialize(customer);
}

/**
 * Desativa cliente sem apagar histórico.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} customerId - Cliente alvo.
 * @returns {Promise<void>}
 */
export async function deactivateCustomer(prisma, companyId, customerId) {
    const updated = await prisma.customer.updateMany({
        where: { id: customerId, companyId },
        data: { isActive: false },
    });
    if (updated.count === 0) {
        throw httpError(404, "CUSTOMER_NOT_FOUND", "Cliente não encontrado");
    }
}
