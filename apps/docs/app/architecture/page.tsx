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

export default function ArchitecturePage() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
        Architecture
      </h1>
      <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
        How TechHub BD is structured — from monorepo layout to database design.
      </p>

      {/* Monorepo structure */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Monorepo Structure</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          The project uses <strong>Turborepo</strong> with <strong>pnpm workspaces</strong>. Each app and
          package lives in its own directory with independent dependencies.
        </p>
        <CodeBlock title="Directory Layout">{`mono/
├── apps/
│   ├── api/              # NestJS REST API (port 4000)
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── admin/    # Admin dashboard endpoints
│   │   │   ├── shop/     # Public storefront endpoints
│   │   │   ├── product/  # Product management (admin)
│   │   │   ├── category/ # Category & brand management
│   │   │   ├── stock/    # Stock management
│   │   │   ├── sales/    # POS sales module
│   │   │   ├── payment/  # Payment gateway integration
│   │   │   ├── coupon/   # Coupon management
│   │   │   ├── upload/   # File upload service
│   │   │   ├── user/     # User profile
│   │   │   ├── address/  # User addresses
│   │   │   ├── reports/  # Analytics & reports
│   │   │   ├── settings/ # Shop settings
│   │   │   └── config/   # App config & validation
│   │   └── Dockerfile
│   ├── web/              # Next.js 16 storefront (port 3000)
│   ├── admin/            # Vite + React admin panel (port 5173)
│   └── docs/             # Documentation site (port 3001)
├── packages/
│   ├── database/         # Prisma schema, client, seeds
│   ├── auth-core/        # Auth service interface (ports & adapters)
│   ├── auth-better-auth/ # Auth implementation
│   ├── typescript-config/ # Shared tsconfig
│   ├── eslint-config/    # Shared ESLint rules
│   └── ui/               # Shared UI components
├── docker-compose.yml
├── Makefile
├── turbo.json
└── .env.example`}</CodeBlock>
      </section>

      {/* Provider pattern */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Provider Pattern</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          TechHub BD uses a <strong>provider abstraction pattern</strong> for external services. Each
          integration defines an interface, and the concrete implementation is selected via environment
          variables at boot time. This makes it trivial to swap providers without changing business logic.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              name: 'Upload Provider',
              env: 'UPLOAD_PROVIDER',
              options: ['local — files stored on disk at /uploads', 'cloudinary — Cloudinary CDN', 's3 — AWS S3 bucket'],
            },
            {
              name: 'Payment Provider',
              env: 'PAYMENT_GATEWAY',
              options: ['sslcommerz — SSLCommerz gateway', 'bkash — bKash mobile payments'],
            },
            {
              name: 'Email Provider',
              env: 'MAIL_PROVIDER',
              options: ['console — logs to stdout (dev)', 'smtp — real email via SMTP'],
            },
            {
              name: 'Auth Provider',
              env: 'Package-based',
              options: ['auth-core — abstract service interface', 'auth-better-auth — JWT session implementation'],
            },
          ].map((p) => (
            <div key={p.name} className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{p.name}</h3>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-500">
                <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">{p.env}</code>
              </p>
              <ul className="space-y-1">
                {p.options.map((opt) => (
                  <li key={opt} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Clean architecture */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Clean Architecture in the API</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          The NestJS API follows a modular, clean-architecture-inspired pattern. Each domain module has:
        </p>
        <CodeBlock title="Module Structure">{`src/product/
├── product.module.ts        # NestJS module wiring
├── product.controller.ts    # HTTP layer (routes, validation)
├── product.service.ts       # Business logic
├── dto/                     # Data transfer objects
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
└── interfaces/              # TypeScript interfaces`}</CodeBlock>
        <div className="mt-4 space-y-3">
          {[
            ['Controller', 'Handles HTTP requests, validates input via DTOs, delegates to service'],
            ['Service', 'Contains business logic, interacts with Prisma via DatabaseService'],
            ['Module', 'Wires dependencies with NestJS DI container'],
            ['DTOs', 'Validate and type incoming request data using class-validator'],
            ['Guards', 'AuthGuard (JWT verification), RolesGuard (role-based access)'],
          ].map(([name, desc]) => (
            <div key={name} className="flex gap-3">
              <span className="w-24 flex-shrink-0 text-sm font-semibold text-gray-900 dark:text-white">{name}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Database models */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Database Models</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          PostgreSQL database managed by Prisma ORM with 15 models across 4 domains.
        </p>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">Users & Auth</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Model</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Table</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Key Fields</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                ['User', 'users', 'email, name, role (USER/ADMIN/SUPER_ADMIN), suspended, emailVerified'],
                ['Session', 'sessions', 'userId, token, expiresAt, ipAddress, userAgent'],
                ['Token', 'tokens', 'userId, type (REFRESH/PASSWORD_RESET/EMAIL_VERIFICATION), token, revoked'],
                ['Address', 'addresses', 'userId, label, street, city, state, postalCode, country, isDefault'],
              ].map(([model, table, fields]) => (
                <tr key={model}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{model}</td>
                  <td className="px-4 py-3"><code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-800">{table}</code></td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{fields}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-3 mt-8 text-lg font-semibold text-gray-900 dark:text-white">Catalog</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Model</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Table</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Key Fields</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                ['ProductCategory', 'product_categories', 'name, slug, icon'],
                ['Brand', 'brands', 'name, slug, logo'],
                ['Product', 'products', 'name, slug, categoryId, brandId, purchasePrice, sellingPrice, stockQuantity, sku, images[], status'],
                ['StockMovement', 'stock_movements', 'productId, type (IN/OUT/ADJUSTMENT), quantity, reason, performedBy'],
              ].map(([model, table, fields]) => (
                <tr key={model}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{model}</td>
                  <td className="px-4 py-3"><code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-800">{table}</code></td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{fields}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-3 mt-8 text-lg font-semibold text-gray-900 dark:text-white">Orders & Payments</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Model</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Table</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Key Fields</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                ['Order', 'orders', 'orderNumber, userId, status, subtotal, discount, totalAmount, paymentMethod, paymentStatus, shippingAddress (JSON)'],
                ['OrderItem', 'order_items', 'orderId, productId, quantity, unitPrice'],
                ['Payment', 'payments', 'orderId, gateway, gatewayTxnId, sessionId, amount, currency, status, rawResponse (JSON)'],
                ['Coupon', 'coupons', 'code, discountType (PERCENTAGE/FIXED), discountValue, minOrderAmount, maxDiscount, usageLimit, isActive, expiresAt'],
              ].map(([model, table, fields]) => (
                <tr key={model}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{model}</td>
                  <td className="px-4 py-3"><code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-800">{table}</code></td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{fields}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-3 mt-8 text-lg font-semibold text-gray-900 dark:text-white">POS & Settings</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Model</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Table</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Key Fields</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                ['Sale', 'sales', 'invoiceNumber, customerName, subtotal, discount, totalAmount, totalProfit, paymentMethod, paymentStatus'],
                ['SaleItem', 'sale_items', 'saleId, productId, quantity, unitPrice, purchasePrice, profit'],
                ['ShopSettings', 'shop_settings', 'shopName, shopLogo, currency, currencySymbol, lowStockThreshold'],
              ].map(([model, table, fields]) => (
                <tr key={model}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{model}</td>
                  <td className="px-4 py-3"><code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-800">{table}</code></td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{fields}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ER diagram */}
        <h3 className="mb-3 mt-8 text-lg font-semibold text-gray-900 dark:text-white">Entity Relationships</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-950 p-6 dark:border-gray-800">
          <pre className="font-mono text-xs leading-relaxed text-green-400 sm:text-sm">
{`User ──┬── Session (1:N)
       ├── Token (1:N)
       ├── Address (1:N)
       └── Order (1:N) ──┬── OrderItem (1:N) ── Product
                         └── Payment (1:N)

ProductCategory ── Product (1:N) ──┬── StockMovement (1:N)
Brand ── Product (1:N)             ├── SaleItem (N:1) ── Sale
                                   └── OrderItem (N:1) ── Order

Coupon (standalone — referenced by Order.couponCode)
ShopSettings (singleton — id: "default")`}</pre>
        </div>
      </section>
    </div>
  );
}
