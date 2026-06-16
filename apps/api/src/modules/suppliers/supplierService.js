/**
 * @file Service de fornecedores do BK-MF0-10.
 */

import { httpError } from "../../lib/httpErrors.js";

/**
 * Serializa fornecedor para resposta pública.
 *
 * @param {object} supplier - Fornecedor Prisma.
 * @returns {object} Fornecedor público.
 */
function serialize(supplier) {
    return {
        id: supplier.id,
        name: supplier.name,
        nif: supplier.nif,
        email: supplier.email,
        phone: supplier.phone,
        addressLine: supplier.addressLine,
        postalCode: supplier.postalCode,
        city: supplier.city,
        isActive: supplier.isActive,
    };
}

/**
 * Garante unicidade de NIF por empresa quando NIF existe.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string | null} nif - NIF validado.
 * @param {string | undefined} [ignoreId] - Fornecedor a ignorar em updates.
 * @param ignoreId - Identificador a excluir da verificação de unicidade.
 * @returns {Promise<void>}
 */
async function assertUniqueNif(prisma, companyId, nif, ignoreId = undefined) {
    if (!nif) return;

    const existing = await prisma.supplier.findFirst({
        where: { companyId, nif, id: ignoreId ? { not: ignoreId } : undefined },
    });

    if (existing) {
        throw httpError(
            409,
            "SUPPLIER_NIF_EXISTS",
            "Já existe fornecedor com este NIF nesta empresa",
        );
    }
}

/**
 * Lista fornecedores ativos.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @returns {Promise<object[]>} Fornecedores ativos.
 */
export async function listSuppliers(prisma, companyId) {
    return searchSuppliers(prisma, companyId);
}

/**
 * Lista fornecedores ativos, com pesquisa opcional por nome ou NIF.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string | undefined} [search] - Texto de pesquisa opcional.
 * @param search - Texto opcional de pesquisa.
 * @returns {Promise<object[]>} Fornecedores ativos.
 */
export async function searchSuppliers(prisma, companyId, search = undefined) {
    const searchFilter = search
        ? {
              OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { nif: { contains: search, mode: "insensitive" } },
              ],
          }
        : {};

    const suppliers = await prisma.supplier.findMany({
        where: { companyId, isActive: true, ...searchFilter },
        orderBy: { name: "asc" },
    });
    return suppliers.map(serialize);
}

/**
 * Cria fornecedor.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object} input - Fornecedor validado.
 * @returns {Promise<object>} Fornecedor criado.
 */
export async function createSupplier(prisma, companyId, input) {
    await assertUniqueNif(prisma, companyId, input.nif);
    const supplier = await prisma.supplier.create({
        data: { companyId, ...input },
    });
    return serialize(supplier);
}

/**
 * Atualiza fornecedor da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} supplierId - Fornecedor alvo.
 * @param {object} input - Dados validados.
 * @returns {Promise<object>} Fornecedor atualizado.
 */
export async function updateSupplier(prisma, companyId, supplierId, input) {
    await assertUniqueNif(prisma, companyId, input.nif, supplierId);

    const updated = await prisma.supplier.updateMany({
        where: { id: supplierId, companyId },
        data: input,
    });
    if (updated.count === 0) {
        throw httpError(404, "SUPPLIER_NOT_FOUND", "Fornecedor não encontrado");
    }

    const supplier = await prisma.supplier.findFirst({
        where: { id: supplierId, companyId },
    });
    return serialize(supplier);
}

/**
 * Desativa fornecedor sem apagar histórico.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} supplierId - Fornecedor alvo.
 * @returns {Promise<void>}
 */
export async function deactivateSupplier(prisma, companyId, supplierId) {
    const updated = await prisma.supplier.updateMany({
        where: { id: supplierId, companyId },
        data: { isActive: false },
    });
    if (updated.count === 0) {
        throw httpError(404, "SUPPLIER_NOT_FOUND", "Fornecedor não encontrado");
    }
}
