const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 560px; margin: 0 auto; padding: 40px 20px;
`;

const btnStyle = `
  display: inline-block; padding: 12px 32px; background: #2563eb;
  color: #ffffff; text-decoration: none; border-radius: 8px;
  font-weight: 600; font-size: 14px;
`;

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrap(content: string): string {
  return `<!DOCTYPE html><html><body style="${baseStyle}">${content}<p style="margin-top:32px;font-size:12px;color:#9ca3af;">TechHub BD</p></body></html>`;
}

export function verificationEmail(name: string, link: string): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(name);
  return {
    subject: 'Verify your email — TechHub BD',
    html: wrap(`
      <h2 style="color:#111827;">Welcome, ${safeName}!</h2>
      <p style="color:#4b5563;">Click the button below to verify your email address.</p>
      <p style="margin:24px 0;"><a href="${link}" style="${btnStyle}">Verify Email</a></p>
      <p style="font-size:13px;color:#6b7280;">Or copy this link: <br/>${link}</p>
      <p style="font-size:12px;color:#9ca3af;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
    `),
    text: `Welcome, ${name}! Verify your email: ${link} (expires in 24 hours)`,
  };
}

export function passwordResetEmail(name: string, link: string): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(name);
  return {
    subject: 'Reset your password — TechHub BD',
    html: wrap(`
      <h2 style="color:#111827;">Password Reset</h2>
      <p style="color:#4b5563;">Hi ${safeName}, we received a request to reset your password.</p>
      <p style="margin:24px 0;"><a href="${link}" style="${btnStyle}">Reset Password</a></p>
      <p style="font-size:13px;color:#6b7280;">Or copy this link: <br/>${link}</p>
      <p style="font-size:12px;color:#9ca3af;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `),
    text: `Hi ${name}, reset your password: ${link} (expires in 1 hour)`,
  };
}
