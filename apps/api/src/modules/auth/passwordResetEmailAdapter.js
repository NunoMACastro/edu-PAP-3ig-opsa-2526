/**
 * @file Adapter de email para recuperação de password.
 *
 * Enquanto o provider real de email não estiver decidido, o adapter escreve a
 * intenção no logger para permitir evidence sem acoplar o service ao provider.
 */

/**
 * Cria adapter de email para recuperação de password.
 *
 * @param {{ appBaseUrl: string, logger?: Console }} options - Configuração do adapter.
 * @returns {{ sendPasswordReset(payload: { email: string, token: string }): Promise<void> }} Adapter assíncrono.
 */
export function buildPasswordResetEmailAdapter({
    appBaseUrl,
    logger = console,
}) {
    return {
        /**
         * Regista o link de recuperação a enviar por email.
         *
         * @param {{ email: string, token: string }} payload - Destino e token bruto.
         * @returns {Promise<void>}
         */
        async sendPasswordReset({ email, token }) {
            const resetUrl = `${appBaseUrl}/recuperar-password/${token}`;

            // Em desenvolvimento, isto dá evidence sem depender de provider real.
            logger.info({
                event: "password_reset_requested",
                email,
                resetUrl,
            });
        },
    };
}
