# WebShop — E-commerce API & Client

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
- **Cross-cutting** — global exception handling with standardized `{ error, statusCode }` responses, request/error logging (Serilog), Swagger with JWT "Authorize", validation via FluentValidation.

---

## Getting started

### Option A — Docker (everything, one command)

Prerequisites: Docker Desktop.

```bash
cp .env.example .env      # then edit .env (see below)
docker compose up --build
```

- Frontend: **http://localhost:3000**
- API + Swagger: **http://localhost:8080/swagger**
- On first start the API **applies migrations and seeds an admin** automatically.

`.env` values:

| Variable | Purpose |
|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Postgres container credentials |
| `JWT_SECRET_KEY` | JWT signing key (**≥ 32 characters**) |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | Admin account seeded on a fresh DB |

Stop with `docker compose down` (add `-v` to also wipe the database volume).

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
The client reads `VITE_API_BASE_URL` (defaults to `https://localhost:7151`).

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
