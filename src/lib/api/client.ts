/* eslint-disable prettier/prettier */
// Client HTTP minimaliste prêt à être branché sur votre futur backend Node/Express.
// Tant que adminConfig.apiBaseUrl est vide, ces helpers ne sont pas utilisés
// (l'admin lit/écrit via src/lib/admin/store.ts en localStorage).
//
// Quand votre API Express sera en ligne, remplacez les corps de fonctions de
// store.ts par des appels à apiGet/apiPost/apiPut/apiDelete ci-dessous.

import { adminConfig } from "@/config/admin";

function url(path: string) {
  const base = adminConfig.apiBaseUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!adminConfig.apiBaseUrl) {
    throw new Error("apiBaseUrl non configuré (src/config/admin.ts)");
  }
  const res = await fetch(url(path), {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// Exemple d'endpoints attendus côté backend Express :
// GET    /api/vehicles
// POST   /api/vehicles
// PUT    /api/vehicles/:id
// DELETE /api/vehicles/:id
// GET    /api/bookings
// PATCH  /api/bookings/:id/status
// GET    /api/clients ... etc.
