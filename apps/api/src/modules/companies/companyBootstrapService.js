/**
 * @file Bootstrap transacional comum à primeira empresa e a empresas adicionais.
 */

import { httpError } from "../../lib/httpErrors.js";
import { acquireTransactionLock } from "../../lib/postgresLocks.js";
import { recordAuditLog } from "../audit/auditLogService.js";
import { createStockMovementWithCostInTransaction } from "../inventory/stockMovementService.js";
import {
    COMPANY_BOOTSTRAP_ACCOUNTS,
    COMPANY_BOOTSTRAP_DEMO_PRODUCT,
    COMPANY_BOOTSTRAP_VAT_RATE,
} from "./companyBootstrapCatalog.js";

const BOOTSTRAP_KINDS = new Set(["INITIAL", "ADDITIONAL"]);

/**
 * Obtém o ano civil corrente na timezone oficial da demonstração.
 *
 * @param {Date} now - Instante de referência injetável.
 * @returns {number} Ano civil em Europe/Lisbon.
 */
function lisbonCalendarYear(now) {
    if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
        throw httpError(400, "INVALID_BOOTSTRAP_DATE", "Data de referência inválida");
    }
    return Number(
        new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/Lisbon",
            year: "numeric",
        }).format(now),
    );
}

/**
 * Completa apenas metadados técnicos próprios do runtime académico.
 * Nunca atribui certificação legal; o SAF-T académico continua marcado como
 * não certificado e estes defaults só existem quando `prepareDemoData=true`.
 *
 * @param {object} profile - Perfil fiscal validado pelo contrato existente.
 * @param {boolean} prepareDemoData - Opção académica explícita.
 * @returns {object} Perfil pronto a persistir.
 */
function buildProfile(profile, prepareDemoData) {
    if (!prepareDemoData) return profile;
    return {
        ...profile,
        commercialRegistrationNumber:
            profile.commercialRegistrationNumber ?? profile.nif,
        saftTaxAccountingBasis: profile.saftTaxAccountingBasis ?? "C",
        saftTaxEntity: profile.saftTaxEntity ?? "Global",
        saftTaxonomyReference: profile.saftTaxonomyReference ?? "S",
        saftSelfBillingIndicator: profile.saftSelfBillingIndicator ?? 0,
        saftCashVatSchemeIndicator: profile.saftCashVatSchemeIndicator ?? 0,
        saftThirdPartiesBillingIndicator:
            profile.saftThirdPartiesBillingIndicator ?? 0,
        softwareCertificateNumber: profile.softwareCertificateNumber ?? 0,
        productCompanyTaxId: profile.productCompanyTaxId ?? "510100001",
        productId: profile.productId ?? "OPSA/OPSA",
        productVersion: profile.productVersion ?? "1.0.0-demo",
    };
}

/**
 * Constrói o período fiscal civil da empresa nova.
 *
 * @param {number} year - Ano civil em Lisboa.
 * @returns {object} Dados Prisma do período.
 */
function fiscalPeriodData(year) {
    return {
        name: `Exercício ${year}`,
        fiscalYear: year,
        startDate: new Date(Date.UTC(year, 0, 1)),
        endDate: new Date(Date.UTC(year, 11, 31)),
        status: "OPEN",
    };
}

/**
 * Serializa o resultado sem expor a sessão, payload integral de auditoria ou
 * detalhes internos do movimento FIFO.
 *
 * @param {object} state - Entidades criadas na transação.
 * @returns {object} Contrato público do bootstrap.
 */
function serializeBootstrap(state) {
    return {
        company: {
            id: state.company.id,
            name: state.company.name,
            nif: state.company.nif,
        },
        profile: state.profile,
        context: {
            companyId: state.company.id,
            companyName: state.company.name,
            nif: state.company.nif,
            role: "ADMIN",
        },
        bootstrap: {
            fiscalPeriod: {
                id: state.fiscalPeriod.id,
                name: state.fiscalPeriod.name,
                fiscalYear: state.fiscalPeriod.fiscalYear,
                startDate: state.fiscalPeriod.startDate,
                endDate: state.fiscalPeriod.endDate,
                status: state.fiscalPeriod.status,
            },
            accountCodes: COMPANY_BOOTSTRAP_ACCOUNTS.map(({ code }) => code),
            vatRate: {
                id: state.vatRate.id,
                code: state.vatRate.code,
                rateBps: state.vatRate.rateBps,
            },
            warehouse: {
                id: state.warehouse.id,
                code: state.warehouse.code,
                name: state.warehouse.name,
            },
            demoData: state.demoProduct
                ? {
                      prepared: true,
                      product: {
                          id: state.demoProduct.id,
                          sku: state.demoProduct.sku,
                          name: state.demoProduct.name,
                      },
                      openingStock: {
                          quantity: COMPANY_BOOTSTRAP_DEMO_PRODUCT.openingQuantity,
                          movementId: state.openingMovement.id,
                      },
                  }
                : { prepared: false },
        },
    };
}

/**
 * Cria uma empresa operacional completa numa única transação PostgreSQL.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ userId: string, sessionId: string, name: string, profile: object, prepareDemoData?: boolean, now?: Date, isProduction?: boolean, kind: "INITIAL" | "ADDITIONAL" }} input - Identidade autenticada e payload validado.
 * @returns {Promise<object>} Empresa, contexto e resumo sanitizado.
 */
export async function bootstrapCompany(prisma, input) {
    const kind = String(input?.kind ?? "").toUpperCase();
    if (!BOOTSTRAP_KINDS.has(kind)) {
        throw new TypeError("O bootstrap exige um tipo interno válido.");
    }
    const prepareDemoData = input.prepareDemoData === true;
    if (prepareDemoData && input.isProduction === true) {
        throw httpError(
            403,
            "DEMO_DATA_FORBIDDEN",
            "A preparação de dados demonstrativos não está disponível em produção",
        );
    }
    const now = input.now ?? new Date();
    const year = lisbonCalendarYear(now);
    const profileData = buildProfile(input.profile, prepareDemoData);

    try {
        return await prisma.$transaction(async (tx) => {
            await acquireTransactionLock(tx, "user-company-bootstrap", input.userId);
            if (kind === "INITIAL") {
                const memberships = await tx.companyMembership.count({
                    where: { userId: input.userId, isActive: true },
                });
                if (memberships !== 0) {
                    throw httpError(
                        409,
                        "ONBOARDING_ALREADY_COMPLETED",
                        "O utilizador já pertence a uma empresa",
                    );
                }
            }

            const company = await tx.company.create({
                data: { name: input.name, nif: profileData.nif },
            });
            const profile = await tx.companyProfile.create({
                data: { companyId: company.id, ...profileData },
            });
            await tx.companyMembership.create({
                data: {
                    companyId: company.id,
                    userId: input.userId,
                    role: "ADMIN",
                },
            });
            const fiscalPeriod = await tx.fiscalPeriod.create({
                data: { companyId: company.id, ...fiscalPeriodData(year) },
            });
            await tx.account.createMany({
                data: COMPANY_BOOTSTRAP_ACCOUNTS.map((account) => ({
                    companyId: company.id,
                    ...account,
                    isActive: true,
                })),
            });
            const vatRate = await tx.vatRate.create({
                data: { companyId: company.id, ...COMPANY_BOOTSTRAP_VAT_RATE },
            });
            const warehouse = await tx.warehouse.create({
                data: {
                    companyId: company.id,
                    code: "PRINCIPAL",
                    name: "Armazém principal",
                    isActive: true,
                },
            });

            let demoProduct = null;
            let openingMovement = null;
            if (prepareDemoData) {
                const { openingQuantity, ...productData } =
                    COMPANY_BOOTSTRAP_DEMO_PRODUCT;
                demoProduct = await tx.item.create({
                    data: { companyId: company.id, ...productData },
                });
                openingMovement = await createStockMovementWithCostInTransaction(tx, {
                    companyId: company.id,
                    userId: input.userId,
                    movement: {
                        type: "ENTRY",
                        itemId: demoProduct.id,
                        quantity: openingQuantity,
                        unitCostCents: demoProduct.costCents,
                        fromWarehouseId: null,
                        toWarehouseId: warehouse.id,
                        reason: "Stock inicial do produto demonstrativo PAP",
                        sourceType: "COMPANY_BOOTSTRAP_PRODUCT",
                        sourceId: demoProduct.id,
                    },
                });
            }

            const updatedSession = await tx.session.updateMany({
                where: {
                    id: input.sessionId,
                    userId: input.userId,
                    revokedAt: null,
                },
                data: { activeCompanyId: company.id },
            });
            if (updatedSession.count !== 1) {
                throw httpError(401, "INVALID_SESSION", "Sessão inválida ou expirada");
            }

            await recordAuditLog(tx, {
                companyId: company.id,
                userId: input.userId,
                action:
                    kind === "INITIAL"
                        ? "company.onboarding.create"
                        : "company.additional.create",
                entity: "Company",
                entityId: company.id,
                details: {
                    bootstrapVersion: 1,
                    initialRole: "ADMIN",
                    prepareDemoData,
                    accountCount: COMPANY_BOOTSTRAP_ACCOUNTS.length,
                    fiscalYear: year,
                },
            });

            return serializeBootstrap({
                company,
                profile,
                fiscalPeriod,
                vatRate,
                warehouse,
                demoProduct,
                openingMovement,
            });
        });
    } catch (error) {
        if (error?.code === "P2002") {
            throw httpError(409, "NIF_ALREADY_EXISTS", "Já existe uma empresa com este NIF");
        }
        throw error;
    }
}
