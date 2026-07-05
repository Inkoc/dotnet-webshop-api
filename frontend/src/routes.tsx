import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { RootLayout } from "@/components/layout/root-layout";
import { RequireAdmin, RequireAuth } from "@/components/require-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogPage } from "@/pages/catalog";
import { ProductDetailPage } from "@/pages/product-detail";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { CartPage } from "@/pages/cart";
import { OrdersPage } from "@/pages/orders";
import { OrderDetailPage } from "@/pages/order-detail";

const AdminProductsPage = lazy(() => import("@/pages/admin/products"));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/categories"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/orders"));
const AdminUsersPage = lazy(() => import("@/pages/admin/users"));

function AdminFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function admin(page: React.ReactNode) {
  return <Suspense fallback={<AdminFallback />}>{page}</Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<CatalogPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<RequireAuth />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
        </Route>

        <Route path="admin" element={<RequireAdmin />}>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={admin(<AdminProductsPage />)} />
          <Route path="categories" element={admin(<AdminCategoriesPage />)} />
          <Route path="orders" element={admin(<AdminOrdersPage />)} />
          <Route path="users" element={admin(<AdminUsersPage />)} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
