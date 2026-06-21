/* eslint-disable prettier/prettier */
import type { PortalId } from "@/config/portals";
import type { AdminUser } from "@/lib/admin/auth";

export type UserRole = "admin" | "client" | "driver";

export type PortalScope = "vehicules" | "demenagement" | "sur_mesure" | "all";

export function adminPathForScope(scope?: PortalScope, loginPortal?: PortalId): string {
  const effective =
    scope && scope !== "all"
      ? scope
      : loginPortal === "demenagement"
        ? "demenagement"
        : loginPortal === "sur-mesure"
          ? "sur_mesure"
          : "vehicules";

  if (effective === "demenagement") return "/admin-demenagement";
  if (effective === "sur_mesure") return "/admin-sur-mesure";
  return "/admin";
}

export function redirectPathForRole(
  role: UserRole,
  portal?: PortalId,
  adminUser?: Pick<AdminUser, "portalScope">,
): string {
  if (role === "driver") return "/driver";
  if (role === "admin") return adminPathForScope(adminUser?.portalScope, portal);
  return "/client";
}

/** Redirection post-connexion selon le rôle et le portail d'origine. */
export function resolvePostLoginPath(
  role: UserRole,
  redirect?: string,
  portal?: PortalId,
  adminUser?: Pick<AdminUser, "portalScope">,
): string {
  const fallback = redirectPathForRole(role, portal, adminUser);

  if (!redirect?.startsWith("/")) return fallback;

  if (role === "driver" && redirect.startsWith("/driver")) return redirect;
  if (role === "admin" && redirect.startsWith("/admin")) return redirect;
  if (role === "client" && redirect.startsWith("/client")) return redirect;

  return fallback;
}

export function connexionSearch(portal?: PortalId, mode: "login" | "register" = "login") {
  return portal ? { portal, mode } : { mode };
}

export function contactSearch(portal: PortalId) {
  return { portal };
}
