function EndpointRow({ method, path, description, auth }: {
  method: string;
  path: string;
  description: string;
  auth: string;
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
    POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    PATCH: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
      <td className="px-4 py-3">
        <span className={`inline-block rounded px-2 py-0.5 font-mono text-xs font-bold ${methodColors[method] || ''}`}>
          {method}
        </span>
      </td>
      <td className="px-4 py-3">
        <code className="font-mono text-xs text-gray-800 dark:text-gray-300">{path}</code>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{description}</td>
      <td className="px-4 py-3">
        {auth === 'Public' ? (
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">Public</span>
        ) : (
          <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">{auth}</span>
        )}
      </td>
    </tr>
  );
}

function EndpointTable({ title, description, endpoints }: {
  title: string;
  description: string;
  endpoints: { method: string; path: string; description: string; auth: string }[];
}) {
  return (
    <div className="mb-10">
      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Method</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Path</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Description</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Auth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {endpoints.map((ep, i) => (
              <EndpointRow key={`${ep.method}-${ep.path}-${i}`} {...ep} />
            ))}
          </tbody>
        </table>
      </div>
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

export default function ApiReferencePage() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
        API Reference
      </h1>
      <p className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
        Complete reference for the TechHub BD REST API. All endpoints are prefixed with{' '}
        <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-sm dark:bg-gray-800">/api/v1</code>.
      </p>
      <div className="mb-8 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Swagger UI</strong> is available at{' '}
          <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs dark:bg-blue-900/50">http://localhost:4000/api/docs</code>{' '}
          when the API is running in dev mode.
        </p>
      </div>

      {/* Auth */}
      <EndpointTable
        title="Authentication"
        description="User registration, login, token management, and password operations."
        endpoints={[
          { method: 'POST', path: '/auth/signup', description: 'Register a new user', auth: 'Public' },
          { method: 'POST', path: '/auth/signin', description: 'Authenticate user, returns tokens', auth: 'Public' },
          { method: 'POST', path: '/auth/signout', description: 'Sign out current session', auth: 'Bearer' },
          { method: 'POST', path: '/auth/refresh', description: 'Refresh access token', auth: 'Public' },
          { method: 'POST', path: '/auth/forgot-password', description: 'Request password reset email', auth: 'Public' },
          { method: 'POST', path: '/auth/reset-password', description: 'Reset password using email token', auth: 'Public' },
          { method: 'POST', path: '/auth/change-password', description: 'Change password (authenticated)', auth: 'Bearer' },
          { method: 'GET', path: '/auth/verify-email', description: 'Verify email with token query param', auth: 'Public' },
          { method: 'POST', path: '/auth/resend-verification', description: 'Resend email verification link', auth: 'Bearer' },
        ]}
      />

      {/* User */}
      <EndpointTable
        title="User Profile"
        description="Current user profile and address management."
        endpoints={[
          { method: 'GET', path: '/users/me', description: 'Get current user profile', auth: 'Bearer' },
          { method: 'PATCH', path: '/users/me', description: 'Update current user profile', auth: 'Bearer' },
          { method: 'GET', path: '/addresses', description: 'List user addresses', auth: 'Bearer' },
          { method: 'POST', path: '/addresses', description: 'Create a new address', auth: 'Bearer' },
          { method: 'PATCH', path: '/addresses/:id', description: 'Update an address', auth: 'Bearer' },
          { method: 'DELETE', path: '/addresses/:id', description: 'Delete an address', auth: 'Bearer' },
          { method: 'PATCH', path: '/addresses/:id/default', description: 'Set address as default', auth: 'Bearer' },
        ]}
      />

      {/* Shop */}
      <EndpointTable
        title="Shop (Storefront)"
        description="Public product catalog, categories, brands, and order placement."
        endpoints={[
          { method: 'GET', path: '/shop/products', description: 'List products (with pagination/filters)', auth: 'Public' },
          { method: 'GET', path: '/shop/products/:slug', description: 'Get product by slug', auth: 'Public' },
          { method: 'GET', path: '/shop/categories', description: 'List all categories', auth: 'Public' },
          { method: 'GET', path: '/shop/brands', description: 'List all brands', auth: 'Public' },
          { method: 'POST', path: '/shop/orders', description: 'Create a new order', auth: 'Bearer' },
          { method: 'GET', path: '/shop/orders', description: 'Get current user\'s orders', auth: 'Bearer' },
          { method: 'POST', path: '/shop/coupons/validate', description: 'Validate a coupon code', auth: 'Bearer' },
        ]}
      />

      {/* Payment */}
      <EndpointTable
        title="Payment"
        description="Payment initiation and gateway webhook handling."
        endpoints={[
          { method: 'POST', path: '/payment/initiate', description: 'Initiate payment for an order', auth: 'Bearer' },
          { method: 'POST', path: '/payment/webhook', description: 'Gateway webhook (IPN callback)', auth: 'Public' },
          { method: 'GET', path: '/payment/verify/:orderId', description: 'Verify payment status for order', auth: 'Bearer' },
        ]}
      />

      {/* Admin */}
      <EndpointTable
        title="Admin — Dashboard & Users"
        description="Admin panel endpoints. Requires Admin or Super Admin role."
        endpoints={[
          { method: 'GET', path: '/admin/dashboard', description: 'Get dashboard summary stats', auth: 'Admin' },
          { method: 'GET', path: '/admin/users', description: 'List all users', auth: 'Super Admin' },
          { method: 'GET', path: '/admin/users/:id', description: 'Get user details', auth: 'Super Admin' },
          { method: 'PATCH', path: '/admin/users/:id', description: 'Update user details', auth: 'Super Admin' },
          { method: 'PATCH', path: '/admin/users/:id/suspend', description: 'Suspend a user', auth: 'Super Admin' },
          { method: 'PATCH', path: '/admin/users/:id/unsuspend', description: 'Unsuspend a user', auth: 'Super Admin' },
          { method: 'PATCH', path: '/admin/users/:id/role', description: 'Change user role', auth: 'Super Admin' },
          { method: 'DELETE', path: '/admin/users/:id', description: 'Delete a user', auth: 'Super Admin' },
          { method: 'GET', path: '/admin/users/:id/addresses', description: 'Get user\'s addresses', auth: 'Super Admin' },
          { method: 'GET', path: '/admin/permissions/users', description: 'List users for permission management', auth: 'Super Admin' },
        ]}
      />

      <EndpointTable
        title="Admin — Orders & Payments"
        description="Manage orders and view payment information."
        endpoints={[
          { method: 'GET', path: '/admin/orders', description: 'List all orders', auth: 'Admin' },
          { method: 'GET', path: '/admin/orders/:id', description: 'Get order details', auth: 'Admin' },
          { method: 'PATCH', path: '/admin/orders/:id/status', description: 'Update order status', auth: 'Admin' },
          { method: 'GET', path: '/admin/payments', description: 'List all payments', auth: 'Admin' },
          { method: 'GET', path: '/admin/payments/stats', description: 'Get payment statistics', auth: 'Super Admin' },
        ]}
      />

      <EndpointTable
        title="Admin — Products & Catalog"
        description="Product, category, and brand management."
        endpoints={[
          { method: 'GET', path: '/admin/products', description: 'List products (admin view)', auth: 'Admin' },
          { method: 'GET', path: '/admin/products/:id', description: 'Get product by ID', auth: 'Admin' },
          { method: 'GET', path: '/admin/products/brands', description: 'Get brands for product form', auth: 'Admin' },
          { method: 'POST', path: '/admin/products', description: 'Create a new product', auth: 'Super Admin' },
          { method: 'PATCH', path: '/admin/products/:id', description: 'Update a product', auth: 'Super Admin' },
          { method: 'DELETE', path: '/admin/products/:id', description: 'Delete a product', auth: 'Super Admin' },
          { method: 'GET', path: '/admin/catalog/categories', description: 'List categories', auth: 'Admin' },
          { method: 'POST', path: '/admin/catalog/categories', description: 'Create a category', auth: 'Admin' },
          { method: 'PATCH', path: '/admin/catalog/categories/:id', description: 'Update a category', auth: 'Admin' },
          { method: 'DELETE', path: '/admin/catalog/categories/:id', description: 'Delete a category', auth: 'Admin' },
          { method: 'GET', path: '/admin/catalog/brands', description: 'List brands', auth: 'Admin' },
          { method: 'POST', path: '/admin/catalog/brands', description: 'Create a brand', auth: 'Admin' },
          { method: 'PATCH', path: '/admin/catalog/brands/:id', description: 'Update a brand', auth: 'Admin' },
          { method: 'DELETE', path: '/admin/catalog/brands/:id', description: 'Delete a brand', auth: 'Admin' },
        ]}
      />

      <EndpointTable
        title="Admin — Stock Management"
        description="Inventory tracking and stock movements."
        endpoints={[
          { method: 'GET', path: '/admin/stock', description: 'Get stock overview', auth: 'Admin' },
          { method: 'POST', path: '/admin/stock/:productId/add', description: 'Add stock for a product', auth: 'Super Admin' },
          { method: 'POST', path: '/admin/stock/:productId/remove', description: 'Remove stock for a product', auth: 'Super Admin' },
          { method: 'GET', path: '/admin/stock/:productId/history', description: 'Get stock movement history', auth: 'Super Admin' },
        ]}
      />

      <EndpointTable
        title="Admin — Sales (POS)"
        description="Point-of-sale system for in-store transactions."
        endpoints={[
          { method: 'GET', path: '/admin/sales', description: 'List all sales', auth: 'Admin' },
          { method: 'GET', path: '/admin/sales/:id', description: 'Get sale by ID', auth: 'Admin' },
          { method: 'GET', path: '/admin/sales/invoice/:invoiceNumber', description: 'Get sale by invoice number', auth: 'Admin' },
          { method: 'POST', path: '/admin/sales', description: 'Create a new sale', auth: 'Admin' },
        ]}
      />

      <EndpointTable
        title="Admin — Coupons"
        description="Discount coupon management."
        endpoints={[
          { method: 'GET', path: '/admin/coupons', description: 'List all coupons', auth: 'Admin' },
          { method: 'GET', path: '/admin/coupons/:id', description: 'Get coupon by ID', auth: 'Admin' },
          { method: 'POST', path: '/admin/coupons', description: 'Create a coupon', auth: 'Super Admin' },
          { method: 'PATCH', path: '/admin/coupons/:id', description: 'Update a coupon', auth: 'Super Admin' },
          { method: 'DELETE', path: '/admin/coupons/:id', description: 'Delete a coupon', auth: 'Super Admin' },
        ]}
      />

      <EndpointTable
        title="Admin — Reports & Settings"
        description="Analytics reports and shop configuration."
        endpoints={[
          { method: 'GET', path: '/admin/reports/summary', description: 'Get financial summary', auth: 'Super Admin' },
          { method: 'GET', path: '/admin/reports/best-sellers', description: 'Get best-selling products', auth: 'Super Admin' },
          { method: 'GET', path: '/admin/reports/low-stock', description: 'Get low-stock products', auth: 'Super Admin' },
          { method: 'GET', path: '/admin/reports/profit', description: 'Get profit by product', auth: 'Super Admin' },
          { method: 'GET', path: '/admin/settings', description: 'Get shop settings', auth: 'Super Admin' },
          { method: 'PATCH', path: '/admin/settings', description: 'Update shop settings', auth: 'Super Admin' },
        ]}
      />

      <EndpointTable
        title="Admin — Upload"
        description="File upload and deletion for product images."
        endpoints={[
          { method: 'POST', path: '/admin/upload', description: 'Upload a file (multipart/form-data)', auth: 'Admin' },
          { method: 'DELETE', path: '/admin/upload', description: 'Delete an uploaded file by URL', auth: 'Admin' },
        ]}
      />

      {/* Example request/response */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Example Requests</h2>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">Sign Up</h3>
        <CodeBlock title="POST /api/v1/auth/signup">{`// Request
{
  "email": "john@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

// Response (201)
{
  "user": {
    "id": "clx...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "emailVerified": false
  },
  "tokens": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}`}</CodeBlock>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">Create Order</h3>
        <CodeBlock title="POST /api/v1/shop/orders (Bearer token required)">{`// Request
{
  "items": [
    { "productId": "clx...", "quantity": 2 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Dhaka",
    "state": "Dhaka",
    "postalCode": "1200",
    "country": "BD"
  },
  "paymentMethod": "COD",
  "couponCode": "WELCOME10"
}

// Response (201)
{
  "id": "clx...",
  "orderNumber": "ORD-20250501-XXXX",
  "status": "PENDING",
  "subtotal": 5000.00,
  "discount": 500.00,
  "totalAmount": 4500.00,
  "items": [...]
}`}</CodeBlock>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">Initiate Payment</h3>
        <CodeBlock title="POST /api/v1/payment/initiate (Bearer token required)">{`// Request
{
  "orderId": "clx..."
}

// Response (201)
{
  "paymentUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
  "sessionId": "abc123..."
}`}</CodeBlock>
      </section>
    </div>
  );
}
