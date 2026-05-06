# TechHub BD

A full-stack e-commerce platform for electronics and gadgets, built with a modular monorepo architecture. Designed for scalability, maintainability, and easy provider swapping.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend (Web)** | Next.js 16, React 19, Tailwind CSS, TypeScript |
| **Admin Panel** | React 19, Vite, React Router, React Query, Tailwind CSS |
| **Backend API** | NestJS, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Monorepo** | Turborepo, pnpm workspaces |
| **Infrastructure** | Docker Compose, GitHub Actions CI/CD |

## Architecture

```
mono/
├── apps/
│   ├── api/          # NestJS REST API (port 4000)
│   ├── web/          # Next.js storefront (port 3000)
│   ├── admin/        # React + Vite admin panel (port 5173)
│   └── docs/         # Documentation site
├── packages/
│   ├── database/     # Prisma schema, client, migrations
│   ├── auth-core/    # Abstract auth service contract
│   ├── auth-better-auth/  # Auth implementation (swappable)
│   ├── upload/       # File upload (Cloudinary / S3 / Local)
│   ├── payment/      # Payment gateway (SSLCommerz / bKash)
│   ├── mailer/       # Email service (SMTP / Console)
│   ├── ui/           # Shared UI components
│   ├── typescript-config/  # Shared TS configs
│   └── eslint-config/      # Shared ESLint configs
├── load-tests/       # k6 performance tests
├── docker-compose.yml
├── Makefile
└── turbo.json
```

### Modular Provider Pattern

All external services follow the **Ports & Adapters** pattern (Dependency Inversion):

```
                    ┌─────────────────┐
                    │  Abstract Port   │ (interface/abstract class)
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────┴───┐  ┌──────┴─────┐  ┌─────┴──────┐
     │ Adapter A  │  │ Adapter B  │  │ Adapter C  │
     │ (default)  │  │ (alt)      │  │ (stub)     │
     └────────────┘  └────────────┘  └────────────┘
```

| Service | Port | Adapters | Switch via |
|---------|------|----------|-----------|
| **Auth** | `AuthService` | BetterAuth (default) | Code swap |
| **Upload** | `UploadService` | Cloudinary, Local, S3 | `UPLOAD_PROVIDER` |
| **Payment** | `PaymentGateway` | SSLCommerz, bKash | `PAYMENT_GATEWAY` |
| **Email** | `MailService` | SMTP (Nodemailer), Console | `MAIL_PROVIDER` |

## Features

### Web Storefront
- Product listing with server-side filtering (category, brand, price range, sort)
- Product detail with image gallery, offer/compare prices
- Shopping cart (localStorage, synced across tabs)
- Checkout with shipping address, coupon codes, payment selection
- SSLCommerz online payment integration
- User account (profile, orders, addresses, password)
- Email verification and password reset
- Dark mode (system preference + manual toggle)
- SEO-optimized with dynamic metadata, OpenGraph
- Fully responsive design
- Next.js Image optimization, caching, loading skeletons

### Admin Panel
- Dashboard with business metrics
- Product management (CRUD, multiple images with crop, categories, brands)
- Dynamic categories and brands management
- Stock management (add/remove, history, low stock alerts)
- POS-style sales creation with invoice generation
- Order management (list, detail, status updates with role-based transitions)
- Payment tracking with stats
- Coupon management (percentage/fixed, usage limits, expiry)
- User management (CRUD, suspend/unsuspend)
- Reports (sales summary, best sellers, low stock, profit by product)
- Role-based access control (Super Admin vs Admin)
- Shop settings (name, currency, thresholds)
- Dark mode support
- Responsive sidebar layout

### Backend API
- Clean Architecture with SOLID principles
- Repository pattern for data access
- Global exception handling + response wrapping
- Swagger/OpenAPI documentation at `/api/docs`
- JWT-based session authentication (30-day sessions)
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Email verification + password reset with token flow
- Image upload with orphan cleanup on failure
- Payment webhook handling (SSLCommerz IPN)
- Coupon validation with discount calculation

## Database Models

| Model | Description |
|-------|------------|
| User | Accounts with roles, suspension, email verification |
| Session | Auth sessions with token + expiry |
| Token | Email verification + password reset tokens |
| Address | User shipping addresses |
| ProductCategory | Dynamic product categories |
| Brand | Dynamic product brands |
| Product | Products with pricing, stock, images, compare-at price |
| StockMovement | Stock in/out/adjustment history |
| Sale | Admin POS sales with invoice |
| SaleItem | Sale line items with profit tracking |
| Order | Customer orders with status workflow |
| OrderItem | Order line items |
| Payment | Payment records (gateway, txn ID, status) |
| Coupon | Discount coupons (% or fixed, limits, expiry) |
| ShopSettings | Shop config (name, currency, thresholds) |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Quick Setup

```bash
# Clone and setup everything
git clone <repo-url> mono
cd mono
make setup
```

This runs: install dependencies, create `.env` files, start PostgreSQL + Redis, run migrations, and seed the database.

### Development

```bash
# Start all apps
make dev

# Or start individually
make api-dev      # API on :4000
make web-dev      # Web on :3000
make admin-dev    # Admin on :5173
```

### URLs

| App | URL |
|-----|-----|
| Web Storefront | http://localhost:3000 |
| Admin Panel | http://localhost:5173 |
| API | http://localhost:4000 |
| API Docs (Swagger) | http://localhost:4000/api/docs |
| Prisma Studio | `make db-studio` |

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@example.com | Admin@123456 |
| Admin | manager@example.com | Admin@123456 |
| Admin | staff@example.com | Admin@123456 |
| User | user@example.com | Admin@123456 |

### Test Coupon Codes

| Code | Discount |
|------|----------|
| WELCOME10 | 10% off (max ৳2,000, min order ৳5,000) |
| FLAT500 | ৳500 off (min order ৳10,000) |
| MEGA20 | 20% off (max ৳5,000, min order ৳15,000) |
| FLAT1000 | ৳1,000 off (min order ৳25,000) |
| TECH5 | 5% off everything (max ৳1,000) |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/authapp` |
| `JWT_SECRET` | Session signing secret | (change in production) |
| `PORT` | API port | `4000` |
| `FRONTEND_URL` | Web app URL | `http://localhost:3000` |
| `MAIL_PROVIDER` | Email provider (`console` / `smtp`) | `console` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `PAYMENT_GATEWAY` | Payment provider (`sslcommerz` / `bkash`) | `sslcommerz` |
| `SSL_STORE_ID` | SSLCommerz store ID | - |
| `SSL_STORE_PASS` | SSLCommerz store password | - |
| `UPLOAD_PROVIDER` | Upload provider (`local` / `cloudinary` / `s3`) | `local` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |

## Database Commands

```bash
make db-generate     # Generate Prisma client
make db-migrate      # Run migrations
make db-seed         # Seed test data
make db-seed-clean   # Clean + reseed
make db-studio       # Open Prisma Studio
make db-reset        # Full reset (drop + migrate + seed)
```

## Docker

```bash
make docker-up       # Start all services
make docker-down     # Stop all services
make docker-build    # Build + start
make docker-db-only  # Start only Postgres + Redis
make docker-logs     # Tail all logs
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register |
| POST | `/api/v1/auth/signin` | Login |
| POST | `/api/v1/auth/signout` | Logout |
| POST | `/api/v1/auth/forgot-password` | Request reset email |
| POST | `/api/v1/auth/reset-password` | Reset password |
| POST | `/api/v1/auth/change-password` | Change password |
| GET | `/api/v1/auth/verify-email` | Verify email |
| POST | `/api/v1/auth/resend-verification` | Resend verification |
| POST | `/api/v1/auth/refresh` | Refresh token |

### Shop (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/shop/products` | List products (paginated, filterable) |
| GET | `/api/v1/shop/products/:slug` | Product detail |
| GET | `/api/v1/shop/categories` | List categories |
| GET | `/api/v1/shop/brands` | List brands |
| POST | `/api/v1/shop/orders` | Create order (auth required) |
| GET | `/api/v1/shop/orders` | User's orders (auth required) |
| POST | `/api/v1/shop/coupons/validate` | Validate coupon |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payment/initiate` | Start payment |
| POST | `/api/v1/payment/webhook` | SSLCommerz IPN callback |
| GET | `/api/v1/payment/verify/:orderId` | Verify payment status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Dashboard stats |
| CRUD | `/api/v1/admin/users` | User management |
| CRUD | `/api/v1/admin/products` | Product management |
| CRUD | `/api/v1/admin/categories` | Category management |
| CRUD | `/api/v1/admin/coupons` | Coupon management |
| GET/PATCH | `/api/v1/admin/orders` | Order management |
| GET | `/api/v1/admin/payments` | Payment records |
| GET | `/api/v1/admin/stock` | Stock management |
| CRUD | `/api/v1/admin/sales` | POS sales |
| GET | `/api/v1/admin/reports` | Business reports |
| GET/PATCH | `/api/v1/admin/settings` | Shop settings |
| POST | `/api/v1/admin/upload` | Image upload |

## CI/CD

GitHub Actions workflows:

- **`ci.yml`** — Lint, typecheck, test, build on every push/PR
- **`deploy.yml`** — Deploy to production
- **`load-test.yml`** — Run k6 performance tests

## Testing

```bash
make test            # Run all tests
make check-types     # TypeScript type checking
make lint            # ESLint
make load-test-signin  # k6 load test
```

## License

Private project.
# mono
