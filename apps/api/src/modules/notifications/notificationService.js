// apps/api/src/modules/notifications/notificationService.js
/** Sincroniza notificações internas da empresa ativa. */
export async function syncNotifications(prisma, input) {
    // Lemos as duas fontes em paralelo porque uma não depende da outra.
    const [reminders, alerts] = await Promise.all([
        prisma.reminder.findMany({ where: { companyId: input.companyId, status: "OPEN" } }),
        prisma.smartAlert.findMany({ where: { companyId: input.companyId, severity: "HIGH", status: "OPEN" } }),
    ]);
    for (const reminder of reminders) {
        // upsert torna a sincronização idempotente: repetir o botão não duplica notificações.
        await prisma.inAppNotification.upsert({
            where: { companyId_userId_sourceType_sourceId: { companyId: input.companyId, userId: input.userId, sourceType: "Reminder", sourceId: reminder.id } },
            update: {},
            create: {
                companyId: input.companyId,
                userId: input.userId,
                sourceType: "Reminder",
                sourceId: reminder.id,
                title: reminder.title,
                message: "Lembrete aberto com prazo definido.",
            },
        });
    }
    for (const alert of alerts) {
        // A origem fica guardada para a UI explicar de onde nasceu a notificação.
        await prisma.inAppNotification.upsert({
            where: { companyId_userId_sourceType_sourceId: { companyId: input.companyId, userId: input.userId, sourceType: "SmartAlert", sourceId: alert.id } },
            update: {},
            create: {
                companyId: input.companyId,
                userId: input.userId,
                sourceType: "SmartAlert",
                sourceId: alert.id,
                title: alert.title,
                message: alert.message,
            },
        });
    }
    // A função devolve a lista final já ordenada para a página atualizar imediatamente.
    return prisma.inAppNotification.findMany({ where: { companyId: input.companyId, userId: input.userId }, orderBy: { createdAt: "desc" } });
}