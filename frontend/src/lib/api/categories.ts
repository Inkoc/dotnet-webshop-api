import { api } from "@/lib/api/client";
import type { Category, CreateCategory, UpdateCategory } from "@/lib/types";

export const categoriesApi = {
  getAll() {
    return api.get<Category[]>("/api/categories");
  },
  getById(id: number) {
    return api.get<Category>(`/api/categories/${id}`);
  },
  create(data: CreateCategory) {
    return api.post<Category>("/api/categories", data);
  },
  update(id: number, data: UpdateCategory) {
    return api.put<void>(`/api/categories/${id}`, data);
  },
  remove(id: number) {
    return api.delete<void>(`/api/categories/${id}`);
  },
};
