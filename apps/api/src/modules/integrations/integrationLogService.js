// apps/api/src/modules/integrations/integrationLogService.js
const allowedStatus = new Set(["SUCCESS", "FAILED", "PARTIAL"]);

/** Regista log de integração com mensagem sanitizada. */
export function recordIntegrationLog(prisma, input) {
    // Se chegar um status desconhecido, registamos FAILED para não criar estados soltos.
    const status = allowedStatus.has(input.status) ? input.status : "FAILED";
    // A mensagem é curta de propósito: serve para UI/evidence, não para guardar ficheiros.
    const message = typeof input.message === "string" ? input.message.slice(0, 300) : null;
    return prisma.integrationLog.create({
        data: {
            // Contexto autenticado e classificação do processo.
            companyId: input.companyId,
            integrationType: input.integrationType,
            sourceType: input.sourceType,
            sourceId: input.sourceId ?? null,
            status,
            // Defaults a zero evitam nulls em relatórios e simplificam a UI.
            totalCount: input.totalCount ?? 0,
            successCount: input.successCount ?? 0,
            errorCount: input.errorCount ?? 0,
            message,
            createdById: input.userId,
        },
    });
}