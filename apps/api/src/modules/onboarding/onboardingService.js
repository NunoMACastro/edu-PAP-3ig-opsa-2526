/**
 * @file Compatibilidade do onboarding inicial com o bootstrap comum.
 */

import { bootstrapCompany } from "../companies/companyBootstrapService.js";

/**
 * Cria a primeira empresa e a respetiva base operacional numa transação.
 *
 * @param {object} prisma - Cliente Prisma.
 * @param {{ userId: string, sessionId: string, name: string, profile: object }} input - Dados validados e identidade autenticada.
 * @returns {Promise<object>} Contexto inicial.
 */
export async function createInitialCompany(prisma, input) {
    return bootstrapCompany(prisma, { ...input, kind: "INITIAL" });
}
