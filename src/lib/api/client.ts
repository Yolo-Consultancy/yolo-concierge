/* eslint-disable prettier/prettier */
import { adminConfig } from "@/config/admin";

const API_PREFIX = "/api/v1";
const ADMIN_TOKEN_KEY = "yolo.admin.accessToken";
const CLIENT_TOKEN_KEY = "yolo.client.accessToken";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number };
  error?: { code: string; message: string; details?: unknown[] };
};

type TokenScope = "admin" | "client" | "none";

function storage() {
  return typeof window !== "undefined" ? window.sessionStorage : null;
}

export function getAccessToken(): string | null {
  return storage()?.getItem(ADMIN_TOKEN_KEY) ?? null;
}

export function setAccessToken(token: string | null) {
  const s = storage();
  if (!s) return;
  if (token) s.setItem(ADMIN_TOKEN_KEY, token);
  else s.removeItem(ADMIN_TOKEN_KEY);
}

export function getClientAccessToken(): string | null {
  return storage()?.getItem(CLIENT_TOKEN_KEY) ?? null;
}

export function setClientAccessToken(token: string | null) {
  const s = storage();
  if (!s) return;
  if (token) s.setItem(CLIENT_TOKEN_KEY, token);
  else s.removeItem(CLIENT_TOKEN_KEY);
}

function apiUrl(path: string) {
  const base = adminConfig.apiBaseUrl.replace(/\/$/, "");
  const normalized = path.startsWith(API_PREFIX) ? path : `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
  return `${base}${normalized}`;
}

async function request<T>(path: string, init?: RequestInit, scope: TokenScope = "admin"): Promise<T> {
  if (!adminConfig.apiBaseUrl) {
    throw new Error("apiBaseUrl non configuré (src/config/admin.ts)");
  }

  const token =
    scope === "client" ? getClientAccessToken() :
    scope === "admin" ? getAccessToken() :
    null;

  const res = await fetch(apiUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `API ${res.status}`);
  }
  return json.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path, undefined, "admin"),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }, "admin"),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }, "admin"),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, "admin"),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }, "admin"),
};

export const clientApi = {
  get: <T>(path: string) => request<T>(path, undefined, "client"),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }, "client"),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }, "client"),
};

/** Appels publics sans token admin/client. */
export const publicApi = {
  get: <T>(path: string) => request<T>(path, undefined, "none"),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }, "none"),
};

/** Appels hors préfixe /api/v1 (notifications, paiements Stripe). */
export async function apiRoot<T>(path: string, init?: RequestInit): Promise<T> {
  if (!adminConfig.apiBaseUrl) throw new Error("apiBaseUrl non configuré");
  const base = adminConfig.apiBaseUrl.replace(/\/$/, "");
  const res = await fetch(`${base}${path.startsWith("/") ? path : `/${path}`}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || `API ${res.status}`);
  return (json.data ?? json) as T;
}
