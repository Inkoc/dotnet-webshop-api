import { api } from "@/lib/api/client";
import type { AddCartItem, Cart, UpdateCartItem } from "@/lib/types";

export const cartApi = {
  get() {
    return api.get<Cart>("/api/cart");
  },
  addItem(data: AddCartItem) {
    return api.post<Cart>("/api/cart/items", data);
  },
  updateItem(productId: number, data: UpdateCartItem) {
    return api.put<Cart>(`/api/cart/items/${productId}`, data);
  },
  removeItem(productId: number) {
    return api.delete<Cart>(`/api/cart/items/${productId}`);
  },
  clear() {
    return api.delete<void>("/api/cart");
  },
};
