import sgMail from '@sendgrid/mail';

export async function sendPasswordResetEmail(toEmail, resetToken) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sgMail.send({
    to: toEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'WrestleGuess — Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0B132B;">Reset your WrestleGuess password</h2>
        <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <p style="margin: 2rem 0;">
          <a href="${resetUrl}"
             style="background: #df8938; color: #fff; padding: 0.85rem 2rem;
                    border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reset Password
          </a>
        </p>
        <p style="color: #888; font-size: 0.9rem;">
          Or copy this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #df8938;">${resetUrl}</a>
        </p>
        <p style="color: #888; font-size: 0.85rem; margin-top: 2rem;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
