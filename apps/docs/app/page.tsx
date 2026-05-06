import Link from 'next/link';

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-gray-200 p-6 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:hover:border-blue-700"
    >
      <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
        {title}
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
      </h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          TechHub BD Documentation
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Developer documentation for the TechHub BD e-commerce platform — a full-stack monorepo
          powering an online gadget store with a Next.js storefront, NestJS API, and React admin panel.
        </p>
      </div>

      {/* Quick links */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        <QuickLink
          href="/getting-started"
          title="Getting Started"
          description="Set up your development environment, install dependencies, and start the apps."
        />
        <QuickLink
          href="/architecture"
          title="Architecture"
          description="Understand the monorepo structure, provider patterns, and database models."
        />
        <QuickLink
          href="/api-reference"
          title="API Reference"
          description="Complete list of REST endpoints with auth requirements and examples."
        />
        <QuickLink
          href="/features"
          title="Features"
          description="Storefront, admin panel, payments, coupons, email, and order management."
        />
        <QuickLink
          href="/deployment"
          title="Deployment"
          description="Deploy with Docker Compose, configure CI/CD, and set up production."
        />
      </div>

      {/* Tech stack */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Tech Stack</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-6 py-3 font-semibold text-gray-900 dark:text-white">Layer</th>
                <th className="px-6 py-3 font-semibold text-gray-900 dark:text-white">Technology</th>
                <th className="px-6 py-3 font-semibold text-gray-900 dark:text-white">Port</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                ['Web Storefront', 'Next.js 16, React 19, Tailwind CSS', '3000'],
                ['Admin Panel', 'React 19, TanStack Router, Vite, Tailwind CSS', '5173'],
                ['API Server', 'NestJS 11, Clean Architecture', '4000'],
                ['Database', 'PostgreSQL 16, Prisma ORM', '5432'],
                ['Cache', 'Redis 7', '6379'],
                ['Docs', 'Next.js 16, Tailwind CSS', '3001'],
                ['Monorepo', 'Turborepo, pnpm workspaces', '—'],
              ].map(([layer, tech, port]) => (
                <tr key={layer} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{layer}</td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{tech}</td>
                  <td className="px-6 py-3">
                    <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {port}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Architecture diagram */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Architecture Overview</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-950 p-6 dark:border-gray-800">
          <pre className="font-mono text-xs leading-relaxed text-green-400 sm:text-sm">
{`┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│   │  Web :3000   │  │ Admin :5173  │  │  Docs :3001  │      │
│   │  (Next.js)   │  │  (Vite+React)│  │  (Next.js)   │      │
│   └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│          │                 │                                 │
│          └────────┬────────┘                                 │
│                   ▼                                          │
│          ┌────────────────┐                                  │
│          │  API :4000     │                                  │
│          │  (NestJS)      │                                  │
│          │  /api/v1/*     │                                  │
│          └───┬────────┬───┘                                  │
│              │        │                                      │
│     ┌────────▼──┐  ┌──▼─────────┐                            │
│     │ Postgres  │  │   Redis    │                            │
│     │  :5432    │  │   :6379    │                            │
│     └───────────┘  └────────────┘                            │
└─────────────────────────────────────────────────────────────┘

Provider Abstractions (swappable):
  Upload  → local | cloudinary | s3
  Payment → sslcommerz | bkash
  Email   → console | smtp
  Auth    → better-auth (JWT sessions)`}</pre>
        </div>
      </section>

      {/* Project stats */}
      <section>
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Project at a Glance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['15', 'Database Models', 'User, Product, Order, Payment, and more'],
            ['50+', 'API Endpoints', 'Auth, Shop, Admin, Payment, Reports'],
            ['4', 'Provider Systems', 'Upload, Payment, Email, Auth — all swappable'],
          ].map(([number, label, desc]) => (
            <div key={label} className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
              <div className="mb-1 text-3xl font-bold text-blue-600 dark:text-blue-400">{number}</div>
              <div className="mb-2 font-semibold text-gray-900 dark:text-white">{label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
