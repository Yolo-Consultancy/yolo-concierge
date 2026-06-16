/* eslint-disable prettier/prettier */
import {
  publicApi,
  setAccessToken,
  setClientAccessToken,
  setDriverAccessToken,
  setAdminCanRefresh,
  clearAllLocalSessions,
} from "@/lib/api/client";
import { setCachedDriverAccount } from "@/lib/driver/auth";
import type { ClientAccount } from "@/lib/client/auth";
import type { DriverAccount } from "@/lib/driver/auth";
import type { AdminUser } from "@/lib/admin/auth";

export type UserRole = "admin" | "client" | "driver";

export type UnifiedLoginResult =
  | { ok: true; role: "admin"; user: AdminUser }
  | { ok: true; role: "client"; account: ClientAccount }
  | { ok: true; role: "driver"; account: DriverAccount }
  | { ok: false; error: string };

type UnifiedAuthResponse =
  | { role: "admin"; accessToken: string; user: AdminUser }
  | { role: "client"; accessToken: string; account: ClientAccount }
  | { role: "driver"; accessToken: string; account: DriverAccount };

/** Connexion unique : une seule requête, redirection selon le type de compte. */
export async function loginUnified(email: string, password: string): Promise<UnifiedLoginResult> {
  clearAllLocalSessions();

  try {
    const result = await publicApi.post<UnifiedAuthResponse>("/auth/unified-login", {
      email: email.trim().toLowerCase(),
      password,
    });

    if (result.role === "admin") {
      setAccessToken(result.accessToken);
      setAdminCanRefresh(true);
      return { ok: true, role: "admin", user: result.user };
    }

    if (result.role === "driver") {
      setDriverAccessToken(result.accessToken);
      setCachedDriverAccount(result.account);
      return { ok: true, role: "driver", account: result.account };
    }

    setClientAccessToken(result.accessToken);
    return { ok: true, role: "client", account: result.account };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "E-mail ou mot de passe incorrect.",
    };
  }
}

export function redirectPathForRole(role: UserRole): "/admin" | "/client" | "/driver" {
  if (role === "admin") return "/admin";
  if (role === "driver") return "/driver";
  return "/client";
}

/** Redirection post-connexion : respecte `redirect` seulement s'il correspond au rôle. */
export function resolvePostLoginPath(
  role: UserRole,
  redirect?: string,
): "/admin" | "/client" | "/driver" {
  const fallback = redirectPathForRole(role);
  if (!redirect?.startsWith("/")) return fallback;
  if (role === "driver" && redirect.startsWith("/driver")) return redirect as "/driver";
  if (role === "admin" && redirect.startsWith("/admin")) return redirect as "/admin";
  if (role === "client" && redirect.startsWith("/client")) return redirect as "/client";
  return fallback;
}

export function welcomeMessage(result: Extract<UnifiedLoginResult, { ok: true }>): string {
  if (result.role === "admin") return `Bienvenue, ${result.user.name}.`;
  if (result.role === "driver") return `Bienvenue, ${result.account.firstName} !`;
  return `Ravi de vous revoir, ${result.account.firstName} !`;
}
