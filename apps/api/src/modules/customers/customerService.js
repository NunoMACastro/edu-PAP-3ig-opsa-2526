/**
 * @file Service de clientes do BK-MF0-09.
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
        country: customer.country,
        saftAccountId: customer.saftAccountId,
        selfBillingIndicator: customer.selfBillingIndicator,
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
 * Identifica a violação da constraint de unicidade que pode ocorrer entre a
 * verificação amigável e a escrita concorrente.
 *
 * @param {unknown} error - Erro devolvido pelo Prisma.
 * @returns {boolean} Verdadeiro quando o PostgreSQL rejeitou um duplicado.
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
 * Lista clientes ativos da empresa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {{ cursor?: string, limit?: string | number }} [page] - Paginação pedida.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de clientes ativos.
 */
export async function listCustomers(prisma, companyId, page = {}) {
    return searchCustomers(prisma, companyId, undefined, page);
}

/**
 * Lista clientes ativos, com pesquisa opcional por nome ou NIF.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string | undefined} [search] - Texto de pesquisa opcional.
 * @param search - Texto opcional de pesquisa.
 * @param {{ cursor?: string, limit?: string | number }} [page] - Paginação pedida.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de clientes ativos.
 */
export async function searchCustomers(
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
    const customers = await prisma.customer.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: limit + 1,
    });
    return buildCursorPage(customers, {
        limit,
        sortField: "name",
        sortType: "string",
        serialize,
    });
}

/**
 * Cria cliente na empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {object} input - Cliente validado.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<object>} Cliente criado.
 */
export async function createCustomer(prisma, companyId, input, userId) {
    await assertUniqueNif(prisma, companyId, input.nif);
    try {
        return await prisma.$transaction(async (tx) => {
            const customer = await tx.customer.create({
                data: { companyId, ...input },
            });
            await recordAuditLog(tx, {
                companyId,
                userId,
                action: "CUSTOMER_CREATED",
                entity: "Customer",
                entityId: customer.id,
                details: { changedFields: Object.keys(input).sort() },
            });
            return serialize(customer);
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            throw httpError(
                409,
                "CUSTOMER_NIF_EXISTS",
                "Já existe cliente com este NIF nesta empresa",
            );
        }
        throw error;
    }
}

/**
 * Atualiza cliente da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} customerId - Cliente alvo.
 * @param {object} input - Dados validados.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<object>} Cliente atualizado.
 */
export async function updateCustomer(
    prisma,
    companyId,
    customerId,
    input,
    userId,
) {
    await assertUniqueNif(prisma, companyId, input.nif, customerId);
    try {
        return await prisma.$transaction(async (tx) => {
            const updated = await tx.customer.updateMany({
                where: { id: customerId, companyId },
                data: input,
            });
            if (updated.count === 0) {
                throw httpError(
                    404,
                    "CUSTOMER_NOT_FOUND",
                    "Cliente não encontrado",
                );
            }

            const customer = await tx.customer.findFirst({
                where: { id: customerId, companyId },
            });
            await recordAuditLog(tx, {
                companyId,
                userId,
                action: "CUSTOMER_UPDATED",
                entity: "Customer",
                entityId: customerId,
                details: { changedFields: Object.keys(input).sort() },
            });
            return serialize(customer);
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            throw httpError(
                409,
                "CUSTOMER_NIF_EXISTS",
                "Já existe cliente com este NIF nesta empresa",
            );
        }
        throw error;
    }
}

/**
 * Desativa cliente sem apagar histórico.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} customerId - Cliente alvo.
 * @param {string} userId - Utilizador autenticado responsável pela mutação.
 * @returns {Promise<void>}
 */
export async function deactivateCustomer(prisma, companyId, customerId, userId) {
    await prisma.$transaction(async (tx) => {
        const updated = await tx.customer.updateMany({
            where: { id: customerId, companyId },
            data: { isActive: false },
        });
        if (updated.count === 0) {
            throw httpError(
                404,
                "CUSTOMER_NOT_FOUND",
                "Cliente não encontrado",
            );
        }
        await recordAuditLog(tx, {
            companyId,
            userId,
            action: "CUSTOMER_DEACTIVATED",
            entity: "Customer",
            entityId: customerId,
            details: { changedFields: ["isActive"] },
        });
    });
}
