import type { AuthResponse } from "@/lib/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7151";

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function getTokens() {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  if (!accessToken || !refreshToken) {
    return null;
  }
  return { accessToken, refreshToken };
}

export function setTokens(tokens: AuthResponse) {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function doRefresh(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens) {
    return false;
  }
  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokens),
    });
    if (!response.ok) {
      return false;
    }
    setTokens((await response.json()) as AuthResponse);
    return true;
  } catch {
    return false;
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // non-JSON body
  }
  if (body && typeof body === "object") {
    const data = body as { error?: string; errors?: Record<string, string[]> };
    if (data.errors) {
      return new ApiError("Validation failed", response.status, data.errors);
    }
    if (data.error) {
      return new ApiError(data.error, response.status);
    }
  }
  return new ApiError(`Request failed (${response.status})`, response.status);
}

async function request<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }
  const tokens = getTokens();
  if (tokens) {
    headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && tokens && !retried) {
    if (await tryRefresh()) {
      return request<T>(path, options, true);
    }
    clearTokens();
    onSessionExpired?.();
    throw new ApiError("Session expired", 401);
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  get<T>(path: string) {
    return request<T>(path);
  },
  post<T>(path: string, body?: unknown) {
    return request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });
  },
  put<T>(path: string, body: unknown) {
    return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
  },
  delete<T>(path: string) {
    return request<T>(path, { method: "DELETE" });
  },
};

export { BASE_URL };
