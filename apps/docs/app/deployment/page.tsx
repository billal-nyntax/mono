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

function EnvTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Variable</th>
            <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Production Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {rows.map(([name, value]) => (
            <tr key={name}>
              <td className="px-4 py-3">
                <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  {name}
                </code>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DeploymentPage() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
        Deployment
      </h1>
      <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
        Deploy TechHub BD to production using Docker Compose, with CI/CD automation via GitHub Actions.
      </p>

      {/* Docker Compose */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Docker Compose Production</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          The project includes a <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-800">docker-compose.yml</code> that
          defines all services needed for a complete deployment.
        </p>

        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Services</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Service</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Image / Build</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Port</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                ['postgres', 'postgres:16-alpine', '5432', 'Persistent volume, health check'],
                ['redis', 'redis:7-alpine', '6379', 'Health check enabled'],
                ['api', 'apps/api/Dockerfile', '4000', 'Depends on postgres + redis'],
                ['web', 'apps/web/Dockerfile', '3000', 'Depends on api'],
                ['admin', 'apps/admin/Dockerfile', '5173', 'Depends on api'],
              ].map(([service, image, port, notes]) => (
                <tr key={service}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{service}</td>
                  <td className="px-4 py-3"><code className="font-mono text-xs text-gray-600 dark:text-gray-400">{image}</code></td>
                  <td className="px-4 py-3"><code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-800">{port}</code></td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">Deploy Commands</h3>
        <CodeBlock title="Terminal">{`# Build and start all services
docker compose up --build -d

# Check running containers
docker compose ps

# View logs
docker compose logs -f

# View API logs only
docker compose logs -f api

# Stop all services
docker compose down

# Full reset (wipe data + rebuild)
docker compose down -v
docker compose up --build -d`}</CodeBlock>
      </section>

      {/* Production environment */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Production Environment Variables</h2>
        <div className="mb-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">
            <strong>Security:</strong> Never commit production secrets to version control.
            Use environment variables, Docker secrets, or a secrets manager.
          </p>
        </div>
        <EnvTable
          rows={[
            ['DATABASE_URL', 'postgresql://user:strongpass@db-host:5432/techhubbd'],
            ['JWT_SECRET', 'Generate with: openssl rand -base64 64'],
            ['PORT', '4000'],
            ['FRONTEND_URL', 'https://your-domain.com'],
            ['ADMIN_URL', 'https://admin.your-domain.com'],
            ['MAIL_PROVIDER', 'smtp'],
            ['SMTP_HOST', 'smtp.gmail.com (or your provider)'],
            ['SMTP_USER', 'your email / API key'],
            ['SMTP_PASS', 'your email password / API secret'],
            ['PAYMENT_GATEWAY', 'sslcommerz'],
            ['SSL_STORE_ID', 'Your production store ID'],
            ['SSL_STORE_PASS', 'Your production store password'],
            ['SSL_SANDBOX', 'false'],
            ['UPLOAD_PROVIDER', 'cloudinary or s3'],
          ]}
        />
      </section>

      {/* CI/CD */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">CI/CD with GitHub Actions</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Set up automated testing and deployment with GitHub Actions. Here&apos;s a recommended workflow:
        </p>
        <CodeBlock title=".github/workflows/ci.yml">{`name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: authapp
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm lint

      - run: pnpm check-types

      - run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/authapp
          JWT_SECRET: test-secret

  build:
    runs-on: ubuntu-latest
    needs: lint-and-test

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm build`}</CodeBlock>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">Deployment Pipeline</h3>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          For automated deployment to a VPS or cloud server, add a deploy job:
        </p>
        <CodeBlock title="Deploy step (add to ci.yml)">{`  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/techhub-bd
            git pull origin main
            docker compose up --build -d
            docker compose exec api npx prisma migrate deploy`}</CodeBlock>
      </section>

      {/* SSL/Domain */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">SSL & Domain Setup</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          For production, use a reverse proxy (Nginx or Caddy) with SSL termination.
        </p>

        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Nginx Reverse Proxy</h3>
        <CodeBlock title="nginx.conf">{`server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Web storefront
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploaded files
    location /uploads/ {
        proxy_pass http://localhost:4000;
    }
}`}</CodeBlock>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-900 dark:text-white">SSL with Certbot</h3>
        <CodeBlock title="Terminal">{`# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d admin.your-domain.com

# Auto-renewal is set up automatically by Certbot
# Test renewal:
sudo certbot renew --dry-run`}</CodeBlock>
      </section>

      {/* Checklist */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Production Checklist</h2>
        <div className="space-y-2">
          {[
            'Set strong JWT_SECRET (openssl rand -base64 64)',
            'Use production DATABASE_URL with strong password',
            'Set SSL_SANDBOX=false for real payments',
            'Configure SMTP for production emails',
            'Set up Cloudinary or S3 for file uploads',
            'Configure CORS origins (FRONTEND_URL, ADMIN_URL)',
            'Set up SSL certificates (Let\'s Encrypt)',
            'Configure Nginx reverse proxy',
            'Set up automated database backups',
            'Enable application logging and monitoring',
            'Run database migrations (prisma migrate deploy)',
            'Set up health check monitoring',
          ].map((item) => (
            <label key={item} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                readOnly
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
