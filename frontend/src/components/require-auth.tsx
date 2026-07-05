import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/lib/auth";

export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
