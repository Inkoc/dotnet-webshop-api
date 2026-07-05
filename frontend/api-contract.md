# WebShop API — Frontend Contract

Reference for building the client. Base URL (dev): **`https://localhost:7151`**
(self-signed cert — accept it once in the browser). CORS allows `http://localhost:5173`
(Vite) and `http://localhost:3000`.

## Auth model
- **JWT Bearer.** Send `Authorization: Bearer <accessToken>` on every protected request.
- **Login/refresh return only tokens** — no user object. To know the current user's
  **id / email / roles**, **decode the access token** client-side (e.g. `jwt-decode`):
  - `sub` → user id
  - `email` → email
  - role claim(s) under `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`
    → `"Admin"` and/or `"User"` (can be a string or array). Use this for role-gating the UI.
- **Access token is short-lived; refresh token lasts days.** On a `401`, call
  `/api/auth/refresh` with the (expired) access token + refresh token to get a new pair,
  then retry. On refresh failure → log out.
- Store tokens in `localStorage`. Role changes only take effect after a **re-login/refresh**
  (token is a snapshot).

## Error shapes
- **Handled exceptions** → `{ "error": "message", "statusCode": 409 }` (401/403/404/409/500).
- **Validation errors (400)** → `{ "errors": { "FieldName": ["message", ...] } }`.
- Show `error` as a toast; map `errors` onto form fields.

## Roles & access
- Two roles: **Admin**, **User**. New registrations get **User**.
- Pattern: **public reads**, **admin-only writes** for catalog; **owner-scoped** for
  cart / orders / own reviews; **admin-only** user management.

---

## Endpoints

### Auth — `/api/auth`
| Method | Path | Auth | Body | Success |
|---|---|---|---|---|
| POST | `/register` | anon | `RegisterUser` | 201 `User` |
| POST | `/login` | anon | `Login` | 200 `AuthResponse` |
| POST | `/refresh` | anon | `RefreshToken` | 200 `AuthResponse` |
| POST | `/logout` | auth | `RefreshToken` | 204 |

### Categories — `/api/categories`
| Method | Path | Auth | Body | Success |
|---|---|---|---|---|
| GET | `/` | anon | — | 200 `Category[]` |
| GET | `/{id}` | anon | — | 200 `Category` / 404 |
| POST | `/` | **Admin** | `CreateCategory` | 201 `Category` |
| PUT | `/{id}` | **Admin** | `UpdateCategory` | 204 / 404 |
| DELETE | `/{id}` | **Admin** | — | 204 / 404 |

### Products — `/api/products`
| Method | Path | Auth | Body | Success |
|---|---|---|---|---|
| GET | `/` | anon | — | 200 `Product[]` |
| GET | `/{id}` | anon | — | 200 `Product` / 404 |
| POST | `/` | **Admin** | `CreateProduct` | 201 `Product` |
| PUT | `/{id}` | **Admin** | `UpdateProduct` | 204 / 404 |
| DELETE | `/{id}` | **Admin** | — | 204 / 404 |

### Reviews — `/api/reviews`
| Method | Path | Auth | Body | Success / errors |
|---|---|---|---|---|
| GET | `/product/{productId}` | anon | — | 200 `Review[]` |
| GET | `/{id}` | anon | — | 200 `Review` / 404 |
| POST | `/` | auth | `CreateReview` | 201 `Review` / 404 product / 409 already reviewed |
| PUT | `/{id}` | auth (owner) | `UpdateReview` | 204 / 403 / 404 |
| DELETE | `/{id}` | auth (owner or Admin) | — | 204 / 403 / 404 |

### Cart — `/api/cart` (all **auth**, scoped to current user)
| Method | Path | Body | Success / errors |
|---|---|---|---|
| GET | `/` | — | 200 `Cart` (auto-created if none) |
| POST | `/items` | `AddCartItem` | 200 `Cart` / 404 product / 409 over stock |
| PUT | `/items/{productId}` | `UpdateCartItem` | 200 `Cart` / 404 not in cart / 409 over stock |
| DELETE | `/items/{productId}` | — | 200 `Cart` / 404 |
| DELETE | `/` | — | 204 (clear) |

### Orders — `/api/orders` (all **auth**)
| Method | Path | Auth | Body | Success / errors |
|---|---|---|---|---|
| POST | `/checkout` | auth | — | 201 `Order` / 409 empty cart or low stock |
| GET | `/` | auth | — | 200 `Order[]` (mine) |
| GET | `/all` | **Admin** | — | 200 `Order[]` |
| GET | `/{id}` | auth (owner or Admin) | — | 200 `Order` / 403 / 404 |
| PUT | `/{id}/status` | **Admin** | `UpdateOrderStatus` | 204 / 400 invalid |

Checkout snapshots each product's price into the order, decrements stock, and clears the cart.

### Users — `/api/users` (all **Admin**)
| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/` | — | 200 `User[]` |
| GET | `/{id}` | — | 200 `User` / 404 |
| PUT | `/{id}/roles` | `UpdateUserRoles` | 200 `User` |
| DELETE | `/{id}` | — | 204 / 404 (fails if user has orders) |

---

## DTOs (request → TS types)

```ts
// Auth
RegisterUser  { email: string; password: string; confirmPassword: string }
Login         { email: string; password: string }
RefreshToken  { accessToken: string; refreshToken: string }
AuthResponse  { accessToken: string; refreshToken: string; accessTokenExpiry: string; refreshTokenExpiry: string }
User          { id: number; email: string; createdAt: string; roles: string[] }

// Category
Category        { id: number; name: string; description: string | null }
CreateCategory  { name: string; description?: string | null }
UpdateCategory  { name: string; description?: string | null }

// Product
Product        { id: number; name: string; description: string | null; price: number; stockQuantity: number; categoryId: number; categoryName: string }
CreateProduct  { name: string; description?: string | null; price: number; stockQuantity: number; categoryId: number }
UpdateProduct  { name: string; description?: string | null; price: number; stockQuantity: number; categoryId: number }

// Review (rating 1..5)
Review        { id: number; productId: number; userId: number; rating: number; comment: string | null; createdAt: string }
CreateReview  { productId: number; rating: number; comment?: string | null }
UpdateReview  { rating: number; comment?: string | null }

// Cart
CartItem      { productId: number; productName: string; unitPrice: number; quantity: number; lineTotal: number }
Cart          { id: number; items: CartItem[]; total: number }
AddCartItem   { productId: number; quantity: number }
UpdateCartItem{ quantity: number }

// Order (status: "Pending" | "Paid" | "Shipped" | "Cancelled")
OrderItem        { productId: number; productName: string; unitPrice: number; quantity: number; lineTotal: number }
Order            { id: number; userId: number; createdAt: string; status: string; totalAmount: number; items: OrderItem[] }
UpdateOrderStatus{ status: string }

// Users
UpdateUserRoles { roles: string[] }   // e.g. ["Admin","User"]
```

## Validation rules (mirror client-side for nicer UX)
- Register: valid email; password ≥8 chars with upper + lower + digit; `confirmPassword` must match.
- Product: `name` required (≤200); `price ≥ 0`; `stockQuantity ≥ 0`; `categoryId > 0`.
- Category: `name` required (≤100).
- Review: `rating` 1–5; `comment` ≤2000.
- Cart add/update: `quantity > 0`.
- Order status: one of the four enum values.
