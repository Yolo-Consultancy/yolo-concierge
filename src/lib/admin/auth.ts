/* eslint-disable prettier/prettier */
import { api, setAccessToken, getAccessToken, refreshAdminAccessToken } from "@/lib/api/client";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "chauffeur";
};

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!getAccessToken();
}

/** Vérifie que la session admin est valide (refresh cookie + JWT). */
export async function validateAdminSession(): Promise<boolean> {
  if (!getAccessToken()) {
    const refreshed = await refreshAdminAccessToken();
    if (!refreshed) return false;
  }

  try {
    await api.get<AdminUser>("/auth/me");
    return true;
  } catch {
    const refreshed = await refreshAdminAccessToken();
    if (!refreshed) {
      setAccessToken(null);
      return false;
    }
    try {
      await api.get<AdminUser>("/auth/me");
      return true;
    } catch {
      setAccessToken(null);
      return false;
    }
  }
}

export async function login(email: string, password: string): Promise<boolean> {
  try {
    const result = await api.post<{ accessToken: string; user: AdminUser }>("/auth/login", {
      email,
      password,
    });
    setAccessToken(result.accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function register(_data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<string | null> {
  return "Inscription désactivée — contactez l'administrateur.";
}

export function logout() {
  if (typeof window === "undefined") return;
  setAccessToken(null);
  api.post("/auth/logout").catch(() => {});
}
