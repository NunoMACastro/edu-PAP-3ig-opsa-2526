import { toHttpError } from "../../lib/httpErrors.js";
import { validateCompanyProfilePayload } from "./companyProfileValidators.js";
import {
    getCompanyProfile,
    upsertCompanyProfile,
} from "./companyProfileService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

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

export function buildCompanyProfileController({ prisma }) {
    return {
        async get(req, res) {
            try {
                const profile = await getCompanyProfile(prisma, req.companyId);
                return res.status(200).json({ profile: serialize(profile) });
            } catch (error) {
                return sendError(res, error);
            }
        },

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