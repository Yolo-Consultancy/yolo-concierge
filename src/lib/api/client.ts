/* eslint-disable prettier/prettier */
import { adminConfig } from "@/config/admin";

const API_PREFIX = "/api/v1";
const ADMIN_TOKEN_KEY = "yolo.admin.accessToken";
const CLIENT_TOKEN_KEY = "yolo.client.accessToken";
const DRIVER_TOKEN_KEY = "yolo.driver.accessToken";
const ADMIN_REFRESH_KEY = "yolo.admin.canRefresh";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number };
  error?: { code: string; message: string; details?: unknown[] };
};

type TokenScope = "admin" | "client" | "driver" | "none";

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

export function getDriverAccessToken(): string | null {
  return storage()?.getItem(DRIVER_TOKEN_KEY) ?? null;
}

export function setDriverAccessToken(token: string | null) {
  const s = storage();
  if (!s) return;
  if (token) s.setItem(DRIVER_TOKEN_KEY, token);
  else s.removeItem(DRIVER_TOKEN_KEY);
}

/** Indique qu'une session admin avec cookie refresh peut exister. */
export function getAdminCanRefresh(): boolean {
  return storage()?.getItem(ADMIN_REFRESH_KEY) === "1";
}

export function setAdminCanRefresh(value: boolean) {
  const s = storage();
  if (!s) return;
  if (value) s.setItem(ADMIN_REFRESH_KEY, "1");
  else s.removeItem(ADMIN_REFRESH_KEY);
}

/** Efface toutes les sessions locales (sans appel API). */
export function clearAllLocalSessions() {
  setAccessToken(null);
  setAdminCanRefresh(false);
  setClientAccessToken(null);
  setDriverAccessToken(null);
}

function apiUrl(path: string) {
  const base = adminConfig.apiBaseUrl.replace(/\/$/, "");
  const normalized = path.startsWith(API_PREFIX) ? path : `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
  return `${base}${normalized}`;
}

type RequestInitWithRetry = RequestInit & { _retried?: boolean };

let refreshInFlight: Promise<boolean> | null = null;

/** Renouvelle le JWT admin via le cookie httpOnly refresh (7 jours). */
export async function refreshAdminAccessToken(): Promise<boolean> {
  if (!getAccessToken() && !getAdminCanRefresh()) return false;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
      if (!res.ok || !json.success) {
        if (res.status === 401) setAdminCanRefresh(false);
        return false;
      }
      setAccessToken(json.data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function request<T>(path: string, init?: RequestInitWithRetry, scope: TokenScope = "admin"): Promise<T> {
  if (!adminConfig.apiBaseUrl) {
    throw new Error("apiBaseUrl non configuré (src/config/admin.ts)");
  }

  const token =
    scope === "client" ? getClientAccessToken() :
    scope === "driver" ? getDriverAccessToken() :
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

  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    if (res.status === 413) {
      throw new Error("Données trop volumineuses. Réduisez le nombre de photos ou utilisez des URL.");
    }
    throw new Error(`Erreur serveur (${res.status}). Vérifiez que le backend est démarré.`);
  }
  if (!res.ok || !json.success) {
    if (res.status === 401 && scope === "admin" && !init?._retried) {
      const refreshed = await refreshAdminAccessToken();
      if (refreshed) {
        return request<T>(path, { ...init, _retried: true }, scope);
      }
    }
    if (res.status === 401 && scope === "admin") {
      setAccessToken(null);
      setAdminCanRefresh(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("yolo-auth-change"));
      }
    }
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

export const driverApi = {
  get: <T>(path: string) => request<T>(path, undefined, "driver"),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }, "driver"),
};

/** Appels publics sans token admin/client/chauffeur. */
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
