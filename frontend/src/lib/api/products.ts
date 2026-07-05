import { api } from "@/lib/api/client";
import type { CreateProduct, Product, UpdateProduct } from "@/lib/types";

export const productsApi = {
  getAll() {
    return api.get<Product[]>("/api/products");
  },
  getById(id: number) {
    return api.get<Product>(`/api/products/${id}`);
  },
  create(data: CreateProduct) {
    return api.post<Product>("/api/products", data);
  },
  update(id: number, data: UpdateProduct) {
    return api.put<void>(`/api/products/${id}`, data);
  },
  remove(id: number) {
    return api.delete<void>(`/api/products/${id}`);
  },
};
