import { api } from "@/lib/api/client";
import type { UpdateUserRoles, User } from "@/lib/types";

export const usersApi = {
  getAll() {
    return api.get<User[]>("/api/users");
  },
  getById(id: number) {
    return api.get<User>(`/api/users/${id}`);
  },
  updateRoles(id: number, data: UpdateUserRoles) {
    return api.put<User>(`/api/users/${id}/roles`, data);
  },
  remove(id: number) {
    return api.delete<void>(`/api/users/${id}`);
  },
};
