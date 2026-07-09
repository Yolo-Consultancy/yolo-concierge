/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useState } from "react";
import type { ClientAccount } from "@/lib/client/auth";
import type { PortalId } from "@/config/portals";
import {
  NAV_BADGES_REFRESH,
  fetchVehiculesAdminNavBadges,
  fetchPortalAdminNavBadges,
  fetchClientNavBadges,
  fetchDriverNavBadges,
  emptyVehiculesAdmin,
  emptyPortalAdmin,
  emptyClient,
  emptyDriver,
  type VehiculesAdminNavBadges,
  type PortalAdminNavBadges,
  type ClientNavBadges,
  type DriverNavBadges,
} from "@/lib/nav-badges";

function useNavBadgeRefresh(refresh: () => void) {
  useEffect(() => {
    refresh();
    window.addEventListener(NAV_BADGES_REFRESH, refresh);
    return () => window.removeEventListener(NAV_BADGES_REFRESH, refresh);
  }, [refresh]);
}

export function useVehiculesAdminNavBadges() {
  const [badges, setBadges] = useState<VehiculesAdminNavBadges>(emptyVehiculesAdmin);

  const refresh = useCallback(() => {
    fetchVehiculesAdminNavBadges()
      .then(setBadges)
      .catch(() => setBadges(emptyVehiculesAdmin));
  }, []);

  useNavBadgeRefresh(refresh);
  return badges;
}

export function usePortalAdminNavBadges(portalId: PortalId) {
  const [badges, setBadges] = useState<PortalAdminNavBadges>(emptyPortalAdmin);

  const refresh = useCallback(() => {
    fetchPortalAdminNavBadges(portalId)
      .then(setBadges)
      .catch(() => setBadges(emptyPortalAdmin));
  }, [portalId]);

  useNavBadgeRefresh(refresh);
  return badges;
}

export function useClientNavBadges(account: ClientAccount | null) {
  const [badges, setBadges] = useState<ClientNavBadges>(emptyClient);

  const refresh = useCallback(() => {
    if (!account) {
      setBadges(emptyClient);
      return;
    }
    fetchClientNavBadges(account)
      .then(setBadges)
      .catch(() => setBadges(emptyClient));
  }, [account]);

  useNavBadgeRefresh(refresh);
  return badges;
}

export function useDriverNavBadges() {
  const [badges, setBadges] = useState<DriverNavBadges>(emptyDriver);

  const refresh = useCallback(() => {
    fetchDriverNavBadges()
      .then(setBadges)
      .catch(() => setBadges(emptyDriver));
  }, []);

  useNavBadgeRefresh(refresh);
  return badges;
}
