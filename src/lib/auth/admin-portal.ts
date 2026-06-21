/* eslint-disable prettier/prettier */
import type { PortalId } from "@/config/portals";
import type { AdminUser } from "@/lib/admin/auth";

const PORTAL_SCOPE: Record<PortalId, AdminUser["portalScope"]> = {
  vehicules: "vehicules",
  demenagement: "demenagement",
  "sur-mesure": "sur_mesure",
};

export function adminCanAccessPortal(
  user: Pick<AdminUser, "portalScope">,
  portalId: PortalId,
): boolean {
  const scope = user.portalScope || "all";
  if (scope === "all") return true;
  return scope === PORTAL_SCOPE[portalId];
}
