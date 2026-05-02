const nodemailer = require('nodemailer');

const parseBoolean = (value) => ['true', '1', 'yes'].includes(String(value || '').toLowerCase());

const hasSmtpConfig = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS,
);

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[char]));

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: parseBoolean(process.env.SMTP_SECURE),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  if (!hasSmtpConfig()) {
    console.warn('SMTP is not configured. Password reset email was not sent.');
    return false;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const displayName = name || 'there';
  const safeDisplayName = escapeHtml(displayName);
  const safeResetUrl = escapeHtml(resetUrl);

  await createTransporter().sendMail({
    from,
    to,
    subject: 'Reset your LabTrack password',
    text: [
      `Hi ${displayName},`,
      '',
      'We received a request to reset your LabTrack password.',
      `Open this link to choose a new password: ${resetUrl}`,
      '',
      'This link expires soon. If you did not request it, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h2>Reset your LabTrack password</h2>
        <p>Hi ${safeDisplayName},</p>
        <p>We received a request to reset your LabTrack password.</p>
        <p>
          <a href="${safeResetUrl}" style="display:inline-block;background:#06b6d4;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:700">
            Reset password
          </a>
        </p>
        <p>This link expires soon. If you did not request it, you can ignore this email.</p>
      </div>
    `,
  });

  return true;
};

module.exports = {
  hasSmtpConfig,
  sendPasswordResetEmail,
};
