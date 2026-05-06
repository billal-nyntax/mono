export default function EmailPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email System</h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Email verification, password reset, and the pluggable mailer architecture.</p>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      {/* Architecture */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Architecture</h2>
      <p className="mt-3 text-gray-600 dark:text-gray-400">
        The mailer follows the same <strong>Ports &amp; Adapters</strong> pattern as upload and payment.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">File</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[
              ['mailer.port.ts', 'Abstract MailService class (send method)'],
              ['mailer.config.ts', 'Config types (SMTP, console)'],
              ['mailer.factory.ts', 'Factory creates adapter from env config'],
              ['adapters/smtp.adapter.ts', 'Nodemailer SMTP implementation'],
              ['adapters/console.adapter.ts', 'Development: logs emails to terminal'],
              ['templates.ts', 'HTML email templates (verification, password reset)'],
            ].map(([file, desc]) => (
              <tr key={file}>
                <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-blue-600 dark:text-blue-400">{file}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      {/* Configuration */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Configuration</h2>

      <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Development (Console)</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Emails are logged to the terminal — copy the verification/reset links from the console output.</p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
        <code>{`MAIL_PROVIDER=console
MAIL_FROM=TechHub BD <noreply@techhubbd.com>`}</code>
      </pre>

      <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Production (SMTP)</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Use Gmail, SendGrid, Mailgun, or any SMTP server.</p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
        <code>{`MAIL_PROVIDER=smtp
MAIL_FROM=TechHub BD <noreply@techhubbd.com>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password`}</code>
      </pre>

      <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Gmail App Passwords:</strong> Go to Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App Passwords. Generate a password for "Mail" and use it as <code className="rounded bg-yellow-100 px-1 text-xs dark:bg-yellow-900/50">SMTP_PASS</code>.
        </p>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      {/* Email Flows */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Email Flows</h2>

      <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Email Verification</h3>
      <div className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
        <p>1. User signs up &rarr; account created with <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">emailVerified: false</code></p>
        <p>2. Verification token generated (24h TTL) and stored in <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">Token</code> table</p>
        <p>3. Email sent with verification link: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">/verify-email?token=xxx</code></p>
        <p>4. User clicks link &rarr; <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">GET /auth/verify-email?token=xxx</code></p>
        <p>5. Token validated, user&apos;s <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">emailVerified</code> set to <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">true</code></p>
      </div>

      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
        <p className="text-sm text-red-800 dark:text-red-300">
          <strong>Unverified users cannot place orders.</strong> The <code className="rounded bg-red-100 px-1 text-xs dark:bg-red-900/50">ShopService.createOrder</code> checks <code className="rounded bg-red-100 px-1 text-xs dark:bg-red-900/50">emailVerified</code> and returns an error if false.
        </p>
      </div>

      <h3 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Password Reset</h3>
      <div className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
        <p>1. User submits email to <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">POST /auth/forgot-password</code></p>
        <p>2. Reset token generated (1h TTL) and stored in <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">Token</code> table</p>
        <p>3. Email sent with reset link: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">/reset-password?token=xxx</code></p>
        <p>4. User sets new password &rarr; <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">POST /auth/reset-password</code></p>
        <p>5. Token validated, password updated, token revoked, user logged in</p>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      {/* API Endpoints */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">API Endpoints</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Method</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Endpoint</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[
              ['GET', '/auth/verify-email?token=xxx', 'Verify email address'],
              ['POST', '/auth/resend-verification', 'Resend verification email (auth required)'],
              ['POST', '/auth/forgot-password', 'Request password reset email'],
              ['POST', '/auth/reset-password', 'Reset password using token'],
            ].map(([method, path, desc]) => (
              <tr key={path}>
                <td className="whitespace-nowrap px-4 py-2"><span className={`rounded px-1.5 py-0.5 text-xs font-bold ${method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{method}</span></td>
                <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">{path}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      {/* Email Templates */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Email Templates</h2>
      <p className="mt-3 text-gray-600 dark:text-gray-400">
        Templates are defined in <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">packages/mailer/src/templates.ts</code>. Each returns <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">{`{ subject, html, text }`}</code>.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white">Verification Email</h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sent on signup. Contains welcome message and verify button with 24h expiry.</p>
          <p className="mt-2 font-mono text-xs text-gray-400">verificationEmail(name, link)</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white">Password Reset Email</h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sent on forgot-password. Contains reset button with 1h expiry.</p>
          <p className="mt-2 font-mono text-xs text-gray-400">passwordResetEmail(name, link)</p>
        </div>
      </div>
    </div>
  );
}
