/**
 * @file Service de fornecedores do BK-MF0-10.
 */

import { httpError } from "../../lib/httpErrors.js";
import { recordAuditLog } from "../audit/auditLogService.js";
import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";

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
        country: supplier.country,
        saftAccountId: supplier.saftAccountId,
        selfBillingIndicator: supplier.selfBillingIndicator,
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
 * Identifica conflitos de unicidade detetados pelo PostgreSQL após uma
 * verificação concorrente.
 *
 * @param {unknown} error - Erro devolvido pelo Prisma.
 * @returns {boolean} Verdadeiro quando existe uma violação P2002.
 */
function isUniqueConstraintError(error) {
    return Boolean(
        error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "P2002",
    );
}

/**
 * Lista fornecedores ativos da empresa ativa.
 * Esta função reutiliza a pesquisa sem termo para garantir uma ordenação única.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{ cursor?: string, limit?: string | number }} [page] - Paginação pedida.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de fornecedores.
 */
export async function listSuppliers(prisma, companyId, page = {}) {
    return searchSuppliers(prisma, companyId, undefined, page);
}

/**
 * Lista fornecedores ativos, com pesquisa opcional por nome ou NIF.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string | undefined} [search] - Texto de pesquisa opcional.
 * @param search - Texto opcional de pesquisa.
 * @param {{ cursor?: string, limit?: string | number }} [page] - Paginação pedida.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de fornecedores.
 */
export async function searchSuppliers(
    prisma,
    companyId,
    search = undefined,
    page = {},
) {
    const limit = parsePageLimit(page.limit);
    const cursor = decodePageCursor(page.cursor, "string");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "name",
        direction: "asc",
    });
    const searchFilter = search
        ? {
              OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { nif: { contains: search, mode: "insensitive" } },
              ],
          }
        : {};

    const baseWhere = { companyId, isActive: true, ...searchFilter };
    const suppliers = await prisma.supplier.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: limit + 1,
    });
    return buildCursorPage(suppliers, {
        limit,
        sortField: "name",
        sortType: "string",
        serialize,
    });
}

/**
 * Cria um fornecedor depois de confirmar unicidade de NIF.
 * A resposta pública é serializada para não expor campos internos do Prisma.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object} input - Fornecedor validado.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<object>} Fornecedor criado.
 */
export async function createSupplier(prisma, companyId, input, userId) {
    await assertUniqueNif(prisma, companyId, input.nif);
    try {
        return await prisma.$transaction(async (tx) => {
            const supplier = await tx.supplier.create({
                data: { companyId, ...input },
            });
            await recordAuditLog(tx, {
                companyId,
                userId,
                action: "SUPPLIER_CREATED",
                entity: "Supplier",
                entityId: supplier.id,
                details: { changedFields: Object.keys(input).sort() },
            });
            return serialize(supplier);
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            throw httpError(
                409,
                "SUPPLIER_NIF_EXISTS",
                "Já existe fornecedor com este NIF nesta empresa",
            );
        }
        throw error;
    }
}

/**
 * Atualiza fornecedor da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} supplierId - Fornecedor alvo.
 * @param {object} input - Dados validados.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<object>} Fornecedor atualizado.
 */
export async function updateSupplier(
    prisma,
    companyId,
    supplierId,
    input,
    userId,
) {
    await assertUniqueNif(prisma, companyId, input.nif, supplierId);
    try {
        return await prisma.$transaction(async (tx) => {
            const updated = await tx.supplier.updateMany({
                where: { id: supplierId, companyId },
                data: input,
            });
            if (updated.count === 0) {
                throw httpError(
                    404,
                    "SUPPLIER_NOT_FOUND",
                    "Fornecedor não encontrado",
                );
            }

            const supplier = await tx.supplier.findFirst({
                where: { id: supplierId, companyId },
            });
            await recordAuditLog(tx, {
                companyId,
                userId,
                action: "SUPPLIER_UPDATED",
                entity: "Supplier",
                entityId: supplierId,
                details: { changedFields: Object.keys(input).sort() },
            });
            return serialize(supplier);
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            throw httpError(
                409,
                "SUPPLIER_NIF_EXISTS",
                "Já existe fornecedor com este NIF nesta empresa",
            );
        }
        throw error;
    }
}

/**
 * Desativa fornecedor sem apagar histórico.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} supplierId - Fornecedor alvo.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<void>}
 */
export async function deactivateSupplier(prisma, companyId, supplierId, userId) {
    await prisma.$transaction(async (tx) => {
        const updated = await tx.supplier.updateMany({
            where: { id: supplierId, companyId },
            data: { isActive: false },
        });
        if (updated.count === 0) {
            throw httpError(
                404,
                "SUPPLIER_NOT_FOUND",
                "Fornecedor não encontrado",
            );
        }
        await recordAuditLog(tx, {
            companyId,
            userId,
            action: "SUPPLIER_DEACTIVATED",
            entity: "Supplier",
            entityId: supplierId,
            details: { changedFields: ["isActive"] },
        });
    });
}
