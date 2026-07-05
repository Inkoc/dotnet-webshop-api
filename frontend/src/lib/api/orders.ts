import { api } from "@/lib/api/client";
import type { Order, UpdateOrderStatus } from "@/lib/types";

export const ordersApi = {
  checkout() {
    return api.post<Order>("/api/orders/checkout");
  },
  getMine() {
    return api.get<Order[]>("/api/orders");
  },
  getAll() {
    return api.get<Order[]>("/api/orders/all");
  },
  getById(id: number) {
    return api.get<Order>(`/api/orders/${id}`);
  },
  updateStatus(id: number, data: UpdateOrderStatus) {
    return api.put<void>(`/api/orders/${id}/status`, data);
  },
};
