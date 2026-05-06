function FeatureSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

function FeatureList({ items }: { items: { name: string; description: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{item.name}</h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      {title && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto bg-gray-950 p-4 font-mono text-sm leading-relaxed text-gray-300">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
        Features
      </h1>
      <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
        A comprehensive overview of everything TechHub BD offers across the storefront, admin panel, and backend.
      </p>

      <FeatureSection title="Web Storefront">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          A Next.js 16 app with server-side rendering, optimized for SEO and performance.
        </p>
        <FeatureList
          items={[
            { name: 'Product Catalog', description: 'Browse products with category/brand filters, search, and pagination. Each product has a detailed page with images, specs, and pricing.' },
            { name: 'Shopping Cart', description: 'Client-side cart with add/remove/update quantity. Cart state persists via React context and localStorage.' },
            { name: 'Checkout Flow', description: 'Multi-step checkout with shipping address selection, coupon application, and payment method choice (COD or online payment).' },
            { name: 'Order Tracking', description: 'Users can view their order history with real-time status tracking (Pending → Confirmed → Processing → Shipped → Delivered).' },
            { name: 'User Accounts', description: 'Registration, login, profile management, email verification, and password reset functionality.' },
            { name: 'Address Book', description: 'Multiple saved addresses with default selection for faster checkout.' },
            { name: 'Dark Mode', description: 'Full dark mode support using Tailwind\'s class strategy with system preference detection.' },
            { name: 'Responsive Design', description: 'Mobile-first responsive layout that works across all device sizes.' },
          ]}
        />
      </FeatureSection>

      <FeatureSection title="Admin Panel">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          A Vite + React SPA with TanStack Router, built for managing the entire store.
        </p>
        <FeatureList
          items={[
            { name: 'Dashboard', description: 'Overview with key metrics: total revenue, orders, users, and recent activity.' },
            { name: 'Product Management', description: 'Full CRUD for products with image upload, pricing (purchase/selling/compare-at), SKU, and stock management.' },
            { name: 'Category & Brand Management', description: 'Create and manage product categories (with icons) and brands (with logos).' },
            { name: 'Order Management', description: 'View all orders, update order status through the fulfillment pipeline, and manage payments.' },
            { name: 'User Management', description: 'Super Admin can list users, change roles, suspend/unsuspend accounts, and delete users.' },
            { name: 'Inventory / Stock', description: 'Stock overview, add/remove stock movements with reasons, and full movement history per product.' },
            { name: 'POS Sales', description: 'Point-of-sale module for in-store transactions with invoice generation and profit tracking.' },
            { name: 'Reports', description: 'Financial summary, best-selling products, low-stock alerts, and profit-by-product analysis.' },
            { name: 'Coupon Management', description: 'Create percentage or fixed-amount discount coupons with min order amounts, usage limits, and expiry dates.' },
            { name: 'Shop Settings', description: 'Configure shop name, logo, currency, and low-stock threshold.' },
            { name: 'Role-Based Access', description: 'Two admin roles: Admin (read + basic operations) and Super Admin (full access including user management and settings).' },
          ]}
        />
      </FeatureSection>

      <FeatureSection title="Authentication & Authorization">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          JWT-based authentication with session management and role-based access control.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Auth Flow</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-500">1.</span>
                User signs up or signs in
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-500">2.</span>
                Server creates a Session record and returns JWT token pair
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-500">3.</span>
                Access token sent as Bearer header on protected requests
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-500">4.</span>
                AuthGuard verifies token and loads user from session
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-500">5.</span>
                RolesGuard checks role for admin-only endpoints
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Security Features</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />Email verification</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />Password reset via email token</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />Session-based token revocation</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />Account suspension</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />IP and user agent tracking</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />3 roles: USER, ADMIN, SUPER_ADMIN</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />2FA support (schema ready)</li>
            </ul>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Payment Integration">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Swappable payment gateway integration with SSLCommerz and bKash support.
        </p>
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">SSLCommerz Payment Flow</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-950 p-6 dark:border-gray-800">
          <pre className="font-mono text-xs leading-relaxed text-green-400 sm:text-sm">
{`┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌─────────────┐
│  Client  │────▶│  API      │────▶│ SSLCommerz   │────▶│  Bank/MFS   │
│  (Web)   │     │  Server   │     │  Gateway     │     │  Provider   │
└──────────┘     └───────────┘     └──────────────┘     └─────────────┘
     │                │                    │                    │
     │  1. Place      │  2. Create         │                    │
     │  Order         │  Payment           │                    │
     │  ──────────▶   │  Session           │                    │
     │                │  ──────────────▶   │                    │
     │  3. Redirect   │                    │                    │
     │  to Gateway    │                    │                    │
     │  ◀──────────   │                    │                    │
     │                │                    │  4. Customer       │
     │  ─────────────────────────────────▶ │  Pays              │
     │                │                    │  ──────────────▶   │
     │                │                    │                    │
     │                │  5. IPN Webhook    │  6. Confirms       │
     │                │  (server-to-server)│  ◀──────────────   │
     │                │  ◀──────────────   │                    │
     │                │                    │                    │
     │  7. Success    │  8. Update Order   │                    │
     │  Redirect      │  Status to PAID    │                    │
     │  ◀──────────   │                    │                    │
     └──────────┘     └───────────┘     └──────────────┘     └─────────────┘`}</pre>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">SSLCommerz</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bangladesh&apos;s largest payment gateway. Supports cards (Visa, MasterCard, Amex),
              mobile wallets (bKash, Nagad, Rocket), and internet banking. Sandbox mode available for testing.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">bKash</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Direct bKash payment integration for mobile wallet payments.
              Can be selected as the primary gateway via the <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">PAYMENT_GATEWAY</code> env variable.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Email System">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Provider-based email system that supports development logging and production SMTP delivery.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Console Provider (Dev)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">MAIL_PROVIDER=console</code> to
              log all emails to stdout. No external service needed during development.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">SMTP Provider (Prod)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">MAIL_PROVIDER=smtp</code> and
              configure SMTP credentials. Works with Gmail, SendGrid, Amazon SES, etc.
            </p>
          </div>
        </div>
        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">Email Types</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Triggered By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                ['Email Verification', 'User registration, resend verification request'],
                ['Password Reset', 'Forgot password request'],
              ].map(([email, trigger]) => (
                <tr key={email}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FeatureSection>

      <FeatureSection title="Coupon System">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Flexible discount system supporting percentage and fixed-amount coupons.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Feature</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                ['Discount Types', 'PERCENTAGE (e.g., 10% off) or FIXED (e.g., ৳500 off)'],
                ['Min Order Amount', 'Optional minimum cart total to apply the coupon'],
                ['Max Discount Cap', 'Limit the maximum discount for percentage coupons'],
                ['Usage Limit', 'Maximum number of times a coupon can be used globally'],
                ['Validity Period', 'Start date and optional expiry date'],
                ['Active Toggle', 'Enable or disable coupons without deleting them'],
                ['Validation API', 'Real-time coupon validation during checkout'],
              ].map(([feature, desc]) => (
                <tr key={feature}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{feature}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FeatureSection>

      <FeatureSection title="Order Management Workflow">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Orders follow a structured lifecycle from placement to delivery.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-950 p-6 dark:border-gray-800">
          <pre className="font-mono text-xs leading-relaxed text-green-400 sm:text-sm">
{`Order Lifecycle:

  PENDING ──▶ CONFIRMED ──▶ PROCESSING ──▶ SHIPPED ──▶ DELIVERED
     │
     └──▶ CANCELLED

Payment Status:

  PENDING ──▶ PAID
     │
     ├──▶ FAILED
     └──▶ REFUNDED`}</pre>
        </div>
        <div className="mt-4 space-y-3">
          {[
            { status: 'PENDING', color: 'bg-yellow-500', desc: 'Order placed, awaiting confirmation from admin' },
            { status: 'CONFIRMED', color: 'bg-blue-500', desc: 'Admin confirmed the order, preparing for processing' },
            { status: 'PROCESSING', color: 'bg-indigo-500', desc: 'Order is being prepared/packed' },
            { status: 'SHIPPED', color: 'bg-purple-500', desc: 'Order handed to delivery partner' },
            { status: 'DELIVERED', color: 'bg-green-500', desc: 'Successfully delivered to customer' },
            { status: 'CANCELLED', color: 'bg-red-500', desc: 'Order cancelled (by admin or customer)' },
          ].map((s) => (
            <div key={s.status} className="flex items-center gap-3">
              <span className={`h-3 w-3 flex-shrink-0 rounded-full ${s.color}`} />
              <span className="w-28 flex-shrink-0 font-mono text-sm font-semibold text-gray-900 dark:text-white">{s.status}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{s.desc}</span>
            </div>
          ))}
        </div>
      </FeatureSection>
    </div>
  );
}
