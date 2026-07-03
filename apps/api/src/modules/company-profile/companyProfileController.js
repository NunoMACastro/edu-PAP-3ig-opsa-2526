/**
 * @file Controller do perfil da empresa.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { validateCompanyProfilePayload } from "./companyProfileValidators.js";
import {
    getCompanyProfile,
    upsertCompanyProfile,
} from "./companyProfileService.js";

/**
 * Envia erro JSON seguro.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta JSON.
 */
function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

/**
 * Serializa o perfil para resposta pública.
 *
 * @param {object} profile - Perfil Prisma.
 * @returns {object} Perfil sem metadados técnicos.
 */
function serialize(profile) {
    return {
        legalName: profile.legalName,
        nif: profile.nif,
        addressLine1: profile.addressLine1,
        addressLine2: profile.addressLine2,
        postalCode: profile.postalCode,
        city: profile.city,
        country: profile.country,
        currency: profile.currency,
        logoUrl: profile.logoUrl,
        fiscalYearStartMonth: profile.fiscalYearStartMonth,
        fiscalYearStartDay: profile.fiscalYearStartDay,
    };
}

/**
 * Constrói handlers do perfil da empresa.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {{ get: Function, update: Function }} Handlers.
 */
export function buildCompanyProfileController({ prisma }) {
    return {
        /**
         * Devolve perfil da empresa ativa.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async get(req, res) {
            try {
                const profile = await getCompanyProfile(prisma, req.companyId);
                return res.status(200).json({ profile: serialize(profile) });
            } catch (error) {
                return sendError(res, error);
            }
        },

        /**
         * Cria ou atualiza perfil da empresa ativa.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {Promise<import("express").Response>} Resposta HTTP.
         */
        async update(req, res) {
            try {
                const input = validateCompanyProfilePayload(req.body);
                const profile = await upsertCompanyProfile(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(200).json({ profile: serialize(profile) });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}
