// Auth
export interface RegisterUser {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface RefreshToken {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export interface User {
  id: number;
  email: string;
  createdAt: string;
  roles: string[];
}

// Category
export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface CreateCategory {
  name: string;
  description?: string | null;
}

export interface UpdateCategory {
  name: string;
  description?: string | null;
}

// Product
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
}

export interface CreateProduct {
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  categoryId: number;
}

export interface UpdateProduct {
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  categoryId: number;
}

// Review (rating 1..5)
export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface CreateReview {
  productId: number;
  rating: number;
  comment?: string | null;
}

export interface UpdateReview {
  rating: number;
  comment?: string | null;
}

// Cart
export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface AddCartItem {
  productId: number;
  quantity: number;
}

export interface UpdateCartItem {
  quantity: number;
}

// Order
export type OrderStatus = "Pending" | "Paid" | "Shipped" | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["Pending", "Paid", "Shipped", "Cancelled"];

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  userId: number;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface UpdateOrderStatus {
  status: string;
}

// Users
export interface UpdateUserRoles {
  roles: string[];
}
