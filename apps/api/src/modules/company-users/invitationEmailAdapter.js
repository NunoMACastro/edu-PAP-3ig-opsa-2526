/**
 * @file Adapter de email para convites de empresa.
 */

/**
 * Constrói adapter de convite por email.
 *
 * @param {{ appBaseUrl: string, logger?: Console }} options - Configuração do adapter.
 * @returns {{ sendInvitation(payload: { email: string, companyName: string, token: string }): Promise<void> }} Adapter.
 */
export function buildInvitationEmailAdapter({ appBaseUrl, logger = console }) {
    return {
        /**
         * Regista envio de convite para desenvolvimento/evidence.
         *
         * @param {{ email: string, companyName: string, token: string }} payload - Dados do convite.
         * @returns {Promise<void>}
         */
        async sendInvitation({ email, companyName, token }) {
            const inviteUrl = `${appBaseUrl}/convites/${token}`;

            // Adapter pedagógico: em desenvolvimento regista o link sem provider real.
            logger.info({
                event: "company_invitation_created",
                email,
                companyName,
                inviteUrl,
            });
        },
    };
}
