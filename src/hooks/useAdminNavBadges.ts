import { useCallback, useEffect, useState } from "react";
import {
  ADMIN_BADGES_REFRESH,
  fetchAdminNavBadges,
  type AdminNavBadges,
} from "@/lib/admin/badges";

const emptyBadges: AdminNavBadges = {
  pendingBookings: 0,
  totalClients: 0,
  unreadReports: 0,
};

export function useAdminNavBadges() {
  const [badges, setBadges] = useState<AdminNavBadges>(emptyBadges);

  const refresh = useCallback(() => {
    fetchAdminNavBadges()
      .then(setBadges)
      .catch(() => setBadges(emptyBadges));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(ADMIN_BADGES_REFRESH, refresh);
    return () => window.removeEventListener(ADMIN_BADGES_REFRESH, refresh);
  }, [refresh]);

  return badges;
}
