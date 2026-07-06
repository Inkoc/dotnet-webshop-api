# WebShop — E-commerce API & Client

**Live demo: [webshop-demo.inkoc.com](https://webshop-demo.inkoc.com/)**

Full-stack e-commerce application: an **ASP.NET Core (.NET 10) Web API** with a
**React** client. Built with a layered/clean architecture, EF Core (Code First) on
PostgreSQL, JWT authentication, and a one-command Docker deployment.

---

## Tech stack

**Backend**
- ASP.NET Core Web API (.NET 10)
- Entity Framework Core (Code First) + PostgreSQL (Npgsql)
- JWT authentication (access + refresh tokens), PBKDF2 password hashing
- Repository + Unit of Work patterns
- FluentValidation, Serilog (console + rolling file), Swagger / OpenAPI
- xUnit + Moq (unit tests for every controller)

**Frontend** *(AI-generated for demo purposes — exists to exercise every backend feature)*
- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query, React Router, react-hook-form + zod

**Infrastructure**
- Docker + Docker Compose (PostgreSQL + API + nginx-served frontend)
- Caddy reverse proxy — single public entry point with automatic HTTPS (Let's Encrypt in production, local CA in dev)
- API runs on a distroless (chiseled) .NET image as a non-root user

---

## Architecture

Layered solution — dependencies point inward (`Api → Application → DAL → Domain`):

| Project | Responsibility |
|---|---|
| `WebShop.Domain` | Entities + repository interfaces (no dependencies) |
| `WebShop.DAL` | EF Core `DbContext`, configurations, repositories, Unit of Work, migrations |
| `WebShop.Application` | Services, DTOs, validators, mapping, auth, seeder |
| `WebShop.Api` | Controllers, middleware, DI composition, `Program.cs` |
| `WebShop.Tests` | xUnit + Moq controller tests |

**Domain model (10 entities):** `User`, `Role`, `UserRole`, `Category`, `Product`,
`Order`, `OrderItem`, `Cart`, `CartItem`, `Review`.
Relationships include **M:N** (User ↔ Role via `UserRole`), **1:1** (User ↔ Cart),
and multiple **1:N** (Category → Products, User → Orders, Order → OrderItems, …).

---

## Features

- **Auth** — register, login, refresh, logout; JWT with role claims; two roles (**Admin**, **User**).
- **Catalog** — products & categories (public read, admin-managed).
- **Reviews** — users review products (1–5), one per user/product; owner edits, owner-or-admin deletes.
- **Cart** — per-user cart, add/update/remove items with stock checks.
- **Orders** — checkout snapshots prices, decrements stock and clears the cart in one transaction; users see their orders, admins see all and update status.
- **Users admin** — list, view, role assignment, delete.
- **Cross-cutting** — global exception handling with standardized `{ error, statusCode }` responses, request/error logging (Serilog), Swagger with JWT "Authorize", validation via FluentValidation, per-IP rate limiting on auth endpoints.

---

## Getting started

### Option A — Docker (everything, one command)

Prerequisites: Docker Desktop.

```bash
cp .env.example .env      # then edit .env (see below)
docker compose up --build
```

Everything is served through the Caddy reverse proxy:

- Frontend: **https://localhost**
- API + Swagger: **https://localhost/swagger**

Locally Caddy issues a self-signed certificate — accept the browser warning once.
On first start the API **applies migrations and seeds an admin** automatically.
To also load the demo catalog (~600 products, run once):

```bash
docker compose exec -T postgres-db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < seed.sql
```

`.env` values:

| Variable | Purpose |
|---|---|
| `DOMAIN` | Public domain Caddy serves (`localhost` for local runs) |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Postgres container credentials |
| `JWT_SECRET_KEY` | JWT signing key (**≥ 32 characters**) |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | Admin account seeded on a fresh DB |

Stop with `docker compose down` (add `-v` to also wipe the database volume and
Caddy's certificates).

### Option B — Local development

Prerequisites: .NET 10 SDK, Node.js, a PostgreSQL instance.

**Backend**
```bash
# From the repo root — set secrets (not committed):
dotnet user-secrets --project WebShop.Api set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=webshop;Username=postgres;Password=YOUR_PASSWORD"
dotnet user-secrets --project WebShop.Api set "JwtSettings:SecretKey" "a-long-random-secret-at-least-32-chars"
dotnet user-secrets --project WebShop.Api set "AdminSeed:Password" "YourStrongPassw0rd!"

dotnet run --project WebShop.Api
```
Migrations apply automatically on startup. API runs at `https://localhost:7151`
(Swagger at the root). Trust the dev cert once: `dotnet dev-certs https --trust`.

**Frontend**
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```
The client reads `VITE_API_BASE_URL` (defaults to `https://localhost:7151`; the
Docker build sets it empty so API calls stay same-origin behind Caddy).

### Option C — Deploy to a server

The same compose file runs the [live demo](https://webshop-demo.inkoc.com/).
On a VPS with Docker installed:

1. Point an A record for your (sub)domain at the server and open ports 80/443.
2. Clone the repo and create `.env` with production values: a strong
   `POSTGRES_PASSWORD`, a random `JWT_SECRET_KEY` (`openssl rand -base64 48`),
   a strong `ADMIN_SEED_PASSWORD`, and `DOMAIN=your.domain.com`.
3. `docker compose up -d --build`

Caddy obtains and renews the Let's Encrypt certificate automatically and is the
only container with published ports — the API and Postgres are reachable only on
the internal Docker network.

---

## Configuration

Secrets are **never** committed. `appsettings.json` holds non-secret defaults and blank
placeholders; real values come from **User Secrets** (dev) or **environment variables**
(prod / Docker), using the standard `Section__Key` convention:

- `ConnectionStrings__DefaultConnection`
- `JwtSettings__SecretKey`
- `AdminSeed__Email` / `AdminSeed__Password`

The admin seeder only creates an account **if no admin exists yet**, so it never
overwrites an existing one.

---

## Testing

```bash
dotnet test
```
Unit tests (xUnit + Moq) cover all API controllers.

---

## API overview

Base path `/api`. Explore and try everything via **Swagger** (`/swagger`).

| Area | Endpoints |
|---|---|
| `auth` | register, login, refresh, logout |
| `categories` | CRUD (read public, write admin) |
| `products` | CRUD (read public, write admin) |
| `reviews` | list by product, create/update/delete own (admin can delete any) |
| `cart` | get, add/update/remove item, clear (per user) |
| `orders` | checkout, my orders, order by id, all (admin), update status (admin) |
| `users` | list/get/roles/delete (admin) |

Authenticated requests send `Authorization: Bearer <accessToken>`. On a `401`, the client
refreshes the token via `/api/auth/refresh` and retries.
