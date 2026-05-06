export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Integration</h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">SSLCommerz, bKash, and the pluggable payment gateway architecture.</p>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      {/* Architecture */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Architecture</h2>
      <p className="mt-3 text-gray-600 dark:text-gray-400">
        The payment system follows the <strong>Ports &amp; Adapters</strong> pattern. The abstract <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">PaymentGateway</code> class defines the contract, and each provider implements it.
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
              ['payment.port.ts', 'Abstract PaymentGateway class (initiate, verifyWebhook, validatePayment)'],
              ['payment.config.ts', 'Config types for all providers'],
              ['payment.factory.ts', 'Factory creates the right adapter from env config'],
              ['adapters/sslcommerz.adapter.ts', 'SSLCommerz implementation'],
              ['adapters/bkash.adapter.ts', 'bKash placeholder (ready to implement)'],
            ].map(([file, desc]) => (
              <tr key={file}>
                <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-blue-600 dark:text-blue-400">{file}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 text-xl font-semibold text-gray-900 dark:text-white">Switching Providers</h3>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
        <code>{`# .env
PAYMENT_GATEWAY=sslcommerz   # or bkash
SSL_STORE_ID=your_store_id
SSL_STORE_PASS=your_store_pass
SSL_SANDBOX=true             # false for production`}</code>
      </pre>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      {/* SSLCommerz Flow */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">SSLCommerz Payment Flow</h2>
      <div className="mt-4 space-y-4">
        {[
          { step: '1', title: 'User selects "Online Payment" at checkout', desc: 'Frontend sends order with paymentMethod: "SSLCOMMERZ"' },
          { step: '2', title: 'Order created with PENDING status', desc: 'Backend creates order, does NOT confirm it (unlike COD)' },
          { step: '3', title: 'Frontend calls POST /payment/initiate', desc: 'Backend calls SSLCommerz API, creates Payment record, returns gatewayUrl' },
          { step: '4', title: 'User redirected to SSLCommerz', desc: 'User completes payment on SSLCommerz hosted page' },
          { step: '5', title: 'SSLCommerz sends webhook (IPN)', desc: 'POST /payment/webhook — backend verifies and updates Payment + Order status' },
          { step: '6', title: 'User redirected back', desc: '/checkout/payment-result?status=success|fail|cancel' },
        ].map((item) => (
          <div key={item.step} className="flex gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {item.step}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
          </div>
        ))}
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
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Auth</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[
              ['POST', '/payment/initiate', 'Yes', 'Start payment session, returns gatewayUrl'],
              ['POST', '/payment/webhook', 'No', 'SSLCommerz IPN callback (server-to-server)'],
              ['GET', '/payment/verify/:orderId', 'Yes', 'Verify payment status via SSLCommerz API'],
            ].map(([method, path, auth, desc]) => (
              <tr key={path}>
                <td className="whitespace-nowrap px-4 py-2"><span className={`rounded px-1.5 py-0.5 text-xs font-bold ${method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{method}</span></td>
                <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">{path}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{auth}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      {/* Webhook Testing */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Testing Webhooks Locally</h2>
      <p className="mt-3 text-gray-600 dark:text-gray-400">SSLCommerz needs a public URL to send IPN (webhook) notifications. For local development:</p>

      <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Option 1: Use the verify endpoint (recommended)</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Skip webhooks entirely. After payment, call <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">GET /payment/verify/:orderId</code> to check status via SSLCommerz validation API.</p>

      <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Option 2: Use ngrok</h3>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
        <code>{`ngrok http 4000
# Set API_BASE_URL in .env to the ngrok URL`}</code>
      </pre>

      <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Option 3: Simulate with curl</h3>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
        <code>{`curl -X POST http://localhost:4000/api/v1/payment/webhook \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "VALID",
    "tran_id": "ORD-20260501-001",
    "amount": "2500.00",
    "value_a": "<order-id>",
    "sessionkey": "<session-id>"
  }'`}</code>
      </pre>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      {/* Adding bKash */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Adding a New Provider (e.g. bKash)</h2>
      <ol className="mt-4 space-y-3 text-gray-600 dark:text-gray-400">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">1</span>
          <span>Create <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">adapters/bkash.adapter.ts</code> extending <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">PaymentGateway</code></span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">2</span>
          <span>Implement <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">initiate()</code>, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">verifyWebhook()</code>, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">validatePayment()</code></span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">3</span>
          <span>Add a case in <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">payment.factory.ts</code></span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">4</span>
          <span>Set <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">PAYMENT_GATEWAY=bkash</code> in <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">.env</code></span>
        </li>
      </ol>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>No code changes needed</strong> in the payment module, controllers, or frontend. The factory pattern handles provider selection automatically from the environment variable.
        </p>
      </div>
    </div>
  );
}
