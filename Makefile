.PHONY: help install dev build lint check-types test clean \
       db-generate db-migrate db-push db-seed db-seed-clean db-studio db-reset \
       docker-up docker-down docker-reset docker-build docker-logs docker-ps \
       api-dev web-dev admin-dev \
       load-test-signin load-test-signup

# ──────────────────────────────────────────────
# Help
# ──────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ──────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────

install: ## Install all dependencies
	pnpm install

setup: install env docker-db-only db-wait db-generate db-migrate db-seed ## Full setup (install + DB + seed)
	@echo "\n✅ Setup complete. Run 'make dev' to start."

env: ## Create .env files if not exists
	@test -f .env || (cp .env.example .env && echo "Created .env from .env.example")
	@test -f packages/database/.env || (echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authapp" > packages/database/.env && echo "Created packages/database/.env")

db-wait: ## Wait for Postgres to be ready
	@echo "Waiting for Postgres..."
	@until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "Postgres is ready."

# ──────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────

dev: ## Start all apps in dev mode
	pnpm dev

api-dev: ## Start only the API
	pnpm --filter @repo/api dev

web-dev: ## Start only the web frontend
	pnpm --filter web dev

admin-dev: ## Start only the admin panel
	pnpm --filter @repo/admin dev

# ──────────────────────────────────────────────
# Build & Quality
# ──────────────────────────────────────────────

build: ## Build all packages and apps
	pnpm build

lint: ## Lint all packages
	pnpm lint

check-types: ## Run TypeScript type checking
	pnpm check-types

test: ## Run all tests
	pnpm test

format: ## Format code with Prettier
	pnpm format

# ──────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────

db-generate: ## Generate Prisma client
	pnpm --filter @repo/database db:generate

db-migrate: ## Run database migrations (dev)
	cd packages/database && npx prisma migrate dev --name migration

db-push: ## Push schema to DB without migration
	pnpm --filter @repo/database db:push

db-seed: ## Seed database with test data
	pnpm --filter @repo/database db:seed

db-seed-clean: ## Clean then seed database
	pnpm --filter @repo/database db:seed -- --clean

db-studio: ## Open Prisma Studio (DB browser)
	pnpm --filter @repo/database db:studio

db-reset: ## Reset database (drop all + re-migrate + seed)
	pnpm --filter @repo/database db:reset

# ──────────────────────────────────────────────
# Docker
# ──────────────────────────────────────────────

docker-up: ## Start all Docker services
	docker compose up -d

docker-down: ## Stop all Docker services
	docker compose down

docker-build: ## Build and start all Docker services
	docker compose up --build -d

docker-reset: ## Reset Docker (wipe volumes + rebuild)
	docker compose down -v
	docker compose up --build -d

docker-logs: ## Tail logs from all services
	docker compose logs -f

docker-logs-api: ## Tail API logs
	docker compose logs -f api

docker-ps: ## Show running containers
	docker compose ps

docker-db-only: ## Start only Postgres + Redis
	docker compose up -d postgres redis

# ──────────────────────────────────────────────
# Load Testing
# ──────────────────────────────────────────────

load-test-signin: ## Run k6 signin smoke test
	k6 run --env API_URL=http://localhost:4000 load-tests/scripts/auth-signin.js

load-test-signup: ## Run k6 signup smoke test
	k6 run --env API_URL=http://localhost:4000 load-tests/scripts/auth-signup.js

# ──────────────────────────────────────────────
# Cleanup
# ──────────────────────────────────────────────

clean: ## Remove all build artifacts and node_modules
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/.next
	rm -rf apps/*/dist
	rm -rf packages/*/dist
	rm -rf .turbo
	rm -rf apps/*/.turbo
	rm -rf packages/*/.turbo
