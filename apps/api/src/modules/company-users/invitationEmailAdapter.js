export function buildInvitationEmailAdapter({ appBaseUrl, logger = console }) {
    return {
        async sendInvitation({ email, companyName, token }) {
            const inviteUrl = `${appBaseUrl}/convites/${token}`;

            // Adaptador pedagogico: em desenvolvimento regista o link sem expor secrets noutros logs.
            logger.info({
                event: "company_invitation_created",
                email,
                companyName,
                inviteUrl,
            });
        },
    };
}