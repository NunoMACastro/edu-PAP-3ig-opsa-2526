import { httpError } from "../../lib/httpErrors.js";

export async function getCompanyProfile(prisma, companyId) {
    const profile = await prisma.companyProfile.findUnique({
        where: { companyId },
    });
    if (!profile)
        throw httpError(
            404,
            "COMPANY_PROFILE_NOT_FOUND",
            "Perfil da empresa nao encontrado",
        );
    return profile;
}

export async function upsertCompanyProfile(prisma, companyId, input) {
    return prisma.companyProfile.upsert({
        where: { companyId },
        create: { companyId, ...input },
        update: input,
    });
}