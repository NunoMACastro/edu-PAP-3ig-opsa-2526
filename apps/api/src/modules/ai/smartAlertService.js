// apps/api/src/modules/ai/smartAlertService.js
/** Gera alertas inteligentes com fontes reais. */
export async function generateSmartAlerts(prisma, input) {
    // As fontes vêm de módulos anteriores: tesouraria, stock e regras de alerta.
    // Ler tudo em paralelo mantém o endpoint responsivo e não altera nenhum dado.
    const [forecast, balances, settings] = await Promise.all([
        prisma.cashflowForecastRun.findFirst({
            where: { companyId: input.companyId },
            orderBy: { generatedAt: "desc" },
        }),
        prisma.stockBalance.findMany({
            where: { companyId: input.companyId },
            include: { item: true },
        }),
        prisma.stockAlertSetting.findMany({
            where: { companyId: input.companyId },
        }),
    ]);
    const candidates = [];
    if (forecast && forecast.closingBalanceCents < 0) {
        // O alerta aponta risco de cashflow, mas não cria pagamento, financiamento
        // nem lançamento contabilístico. É apenas informação para decisão humana.
        candidates.push({
            type: "CASHFLOW_RISK",
            severity: "HIGH",
            title: "Saldo projetado negativo",
            message: "A previsão de tesouraria termina abaixo de zero.",
            sourceType: "CashflowForecastRun",
            sourceId: forecast.id,
        });
    }
    const settingsByItem = new Map(
        settings.map((item) => [item.itemId + ":" + item.warehouseId, item]),
    );
    for (const balance of balances) {
        const setting = settingsByItem.get(
            balance.itemId + ":" + balance.warehouseId,
        );
        if (
            setting?.minQuantity &&
            Number(balance.quantity) < Number(setting.minQuantity)
        ) {
            // A comparação usa o mínimo configurado no OPSA; não inventa limiares.
            // Isto mantém a regra auditável para alunos e orientador.
            candidates.push({
                type: "STOCK_RUPTURE",
                severity: "MEDIUM",
                title: "Risco de rutura",
                message: balance.item.name + " está abaixo do mínimo definido.",
                sourceType: "StockBalance",
                sourceId: balance.id,
            });
        }
    }
    const alerts = [];
    for (const candidate of candidates) {
        alerts.push(
            // A chave única impede que cada consulta crie novo alerta para a mesma fonte.
            await prisma.smartAlert.upsert({
                where: {
                    companyId_type_sourceType_sourceId: {
                        companyId: input.companyId,
                        type: candidate.type,
                        sourceType: candidate.sourceType,
                        sourceId: candidate.sourceId,
                    },
                },
                update: {
                    severity: candidate.severity,
                    title: candidate.title,
                    message: candidate.message,
                    status: "OPEN",
                    generatedById: input.userId,
                    generatedAt: new Date(),
                },
                create: {
                    ...candidate,
                    companyId: input.companyId,
                    generatedById: input.userId,
                },
            }),
        );
    }
    return alerts;
}