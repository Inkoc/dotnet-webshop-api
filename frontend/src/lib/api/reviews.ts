import { api } from "@/lib/api/client";
import type { CreateReview, Review, UpdateReview } from "@/lib/types";

export const reviewsApi = {
  getForProduct(productId: number) {
    return api.get<Review[]>(`/api/reviews/product/${productId}`);
  },
  getById(id: number) {
    return api.get<Review>(`/api/reviews/${id}`);
  },
  create(data: CreateReview) {
    return api.post<Review>("/api/reviews", data);
  },
  update(id: number, data: UpdateReview) {
    return api.put<void>(`/api/reviews/${id}`, data);
  },
  remove(id: number) {
    return api.delete<void>(`/api/reviews/${id}`);
  },
};
