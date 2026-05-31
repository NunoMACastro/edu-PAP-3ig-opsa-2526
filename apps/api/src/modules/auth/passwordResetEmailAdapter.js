export function buildPasswordResetEmailAdapter({
    appBaseUrl,
    logger = console,
}) {
    return {
        async sendPasswordReset({ email, token }) {
            const resetUrl = `${appBaseUrl}/recuperar-password/${token}`;

            // Em desenvolvimento, isto da evidence sem acoplar o service a um provider de email.
            logger.info({
                event: "password_reset_requested",
                email,
                resetUrl,
            });
        },
    };
}