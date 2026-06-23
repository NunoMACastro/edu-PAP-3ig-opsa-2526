/**
 * @file Adapter de email para convites de empresa.
 */

/**
 * Constrói adapter de convite por email.
 *
 * @param {{ appBaseUrl: string, logger?: Console }} options - Configuração do adapter.
 * @param props - Propriedades recebidas pelo componente React.
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
            void token;
            const emailDomain =
                typeof email === "string" && email.includes("@")
                    ? email.split("@").at(-1)
                    : null;

            // Adapter pedagógico: evita registar tokens brutos ou URLs secretas.
            logger.info({
                event: "company_invitation_created",
                emailDomain,
                companyName,
                delivery: "mock",
                appBaseUrl,
            });
        },
    };
}
