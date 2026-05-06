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

function EnvTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Variable</th>
            <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Default</th>
            <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {rows.map(([name, def, desc]) => (
            <tr key={name} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
              <td className="px-4 py-3">
                <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  {name}
                </code>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{def}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GettingStartedPage() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
        Getting Started
      </h1>
      <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
        Get the TechHub BD project running on your local machine in under 5 minutes.
      </p>

      {/* Prerequisites */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Prerequisites</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Node.js 20+', 'Required runtime for all apps'],
            ['pnpm', 'Package manager (monorepo workspaces)'],
            ['Docker', 'Runs PostgreSQL 16 and Redis 7'],
          ].map(([name, desc]) => (
            <div key={name} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div className="mb-1 font-semibold text-gray-900 dark:text-white">{name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick setup */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Quick Setup</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          The fastest way to get everything running with a single command:
        </p>
        <CodeBlock title="Terminal">{`git clone <your-repo-url> techhub-bd
cd techhub-bd
make setup    # installs deps, starts DB, runs migrations, seeds data
make dev      # starts all apps (web :3000, api :4000, admin :5173, docs :3001)`}</CodeBlock>
        <div className="mt-4 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Tip:</strong> The <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs dark:bg-blue-900/50">make setup</code> command
            handles everything: installing dependencies, creating <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs dark:bg-blue-900/50">.env</code> files,
            starting Docker containers, running Prisma migrations, and seeding test data.
          </p>
        </div>
      </section>

      {/* Manual setup */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Manual Setup</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          If you prefer step-by-step control:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">1. Install dependencies</h3>
            <CodeBlock>{`pnpm install`}</CodeBlock>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">2. Set up environment variables</h3>
            <CodeBlock>{`cp .env.example .env
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authapp" > packages/database/.env`}</CodeBlock>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">3. Start infrastructure</h3>
            <CodeBlock>{`docker compose up -d postgres redis`}</CodeBlock>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">4. Set up database</h3>
            <CodeBlock>{`pnpm --filter @repo/database db:generate   # generate Prisma client
cd packages/database && npx prisma migrate dev --name init   # run migrations
pnpm --filter @repo/database db:seed        # seed test data`}</CodeBlock>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">5. Start development servers</h3>
            <CodeBlock>{`pnpm dev   # starts all apps concurrently via Turborepo`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* Environment variables */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Environment Variables</h2>
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Core</h3>
        <EnvTable
          rows={[
            ['DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/authapp', 'PostgreSQL connection string'],
            ['JWT_SECRET', 'your-secret-key-change-in-production', 'Secret for signing JWT tokens'],
            ['PORT', '4000', 'API server port'],
            ['FRONTEND_URL', 'http://localhost:3000', 'Web storefront URL (CORS)'],
            ['ADMIN_URL', 'http://localhost:5173', 'Admin panel URL (CORS)'],
            ['NEXT_PUBLIC_API_URL', 'http://localhost:4000/api/v1', 'API URL for Next.js client'],
            ['VITE_API_URL', 'http://localhost:4000/api/v1', 'API URL for Vite admin'],
          ]}
        />
        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">Email</h3>
        <EnvTable
          rows={[
            ['MAIL_PROVIDER', 'console', 'Email provider: console (dev) or smtp'],
            ['MAIL_FROM', 'TechHub BD <noreply@techhubbd.com>', 'Sender address'],
            ['SMTP_HOST', 'smtp.gmail.com', 'SMTP server host'],
            ['SMTP_PORT', '587', 'SMTP server port'],
            ['SMTP_USER', '', 'SMTP username'],
            ['SMTP_PASS', '', 'SMTP password'],
          ]}
        />
        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">Payment</h3>
        <EnvTable
          rows={[
            ['PAYMENT_GATEWAY', 'sslcommerz', 'Gateway: sslcommerz or bkash'],
            ['SSL_STORE_ID', '', 'SSLCommerz store ID'],
            ['SSL_STORE_PASS', '', 'SSLCommerz store password'],
            ['SSL_SANDBOX', 'true', 'Use SSLCommerz sandbox mode'],
          ]}
        />
        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">Upload</h3>
        <EnvTable
          rows={[
            ['UPLOAD_PROVIDER', 'local', 'Provider: local, cloudinary, or s3'],
            ['CLOUDINARY_CLOUD_NAME', '', 'Cloudinary cloud name'],
            ['CLOUDINARY_API_KEY', '', 'Cloudinary API key'],
            ['CLOUDINARY_API_SECRET', '', 'Cloudinary API secret'],
            ['S3_BUCKET', '', 'AWS S3 bucket name'],
            ['S3_REGION', 'ap-southeast-1', 'AWS S3 region'],
          ]}
        />
      </section>

      {/* Default credentials */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Default Credentials</h2>
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
          <p className="mb-3 text-sm font-medium text-amber-800 dark:text-amber-300">
            These are seeded test credentials. Change them in production.
          </p>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Service</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Credentials</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">PostgreSQL</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">postgres / postgres @ localhost:5432/authapp</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Super Admin</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">admin@techhubbd.com / password123</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Test User</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">user@techhubbd.com / password123</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Make commands */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Available Make Commands</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Command</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                ['make setup', 'Full setup (install + DB + seed)'],
                ['make dev', 'Start all apps in dev mode'],
                ['make api-dev', 'Start only the API'],
                ['make web-dev', 'Start only the web frontend'],
                ['make admin-dev', 'Start only the admin panel'],
                ['make build', 'Build all packages and apps'],
                ['make lint', 'Lint all packages'],
                ['make check-types', 'Run TypeScript type checking'],
                ['make test', 'Run all tests'],
                ['make format', 'Format code with Prettier'],
                ['make db-generate', 'Generate Prisma client'],
                ['make db-migrate', 'Run database migrations (dev)'],
                ['make db-push', 'Push schema to DB without migration'],
                ['make db-seed', 'Seed database with test data'],
                ['make db-seed-clean', 'Clean then seed database'],
                ['make db-studio', 'Open Prisma Studio (DB browser)'],
                ['make db-reset', 'Reset database (drop + migrate + seed)'],
                ['make docker-up', 'Start all Docker services'],
                ['make docker-down', 'Stop all Docker services'],
                ['make docker-build', 'Build and start all Docker services'],
                ['make docker-reset', 'Reset Docker (wipe volumes + rebuild)'],
                ['make docker-logs', 'Tail logs from all services'],
                ['make docker-ps', 'Show running containers'],
                ['make docker-db-only', 'Start only Postgres + Redis'],
                ['make clean', 'Remove build artifacts and node_modules'],
              ].map(([cmd, desc]) => (
                <tr key={cmd} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {cmd}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
