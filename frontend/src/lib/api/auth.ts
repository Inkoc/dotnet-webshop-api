import { api } from "@/lib/api/client";
import type { AuthResponse, Login, RefreshToken, RegisterUser, User } from "@/lib/types";

export const authApi = {
  register(data: RegisterUser) {
    return api.post<User>("/api/auth/register", data);
  },
  login(data: Login) {
    return api.post<AuthResponse>("/api/auth/login", data);
  },
  refresh(data: RefreshToken) {
    return api.post<AuthResponse>("/api/auth/refresh", data);
  },
  logout(data: RefreshToken) {
    return api.post<void>("/api/auth/logout", data);
  },
};
