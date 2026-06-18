import { listBookings, listClients, listTripReports } from "@/lib/admin/store";

export const ADMIN_BADGES_REFRESH = "yolo:admin-badges-refresh";

export type AdminNavBadges = {
  pendingBookings: number;
  totalClients: number;
  unreadReports: number;
};

export async function fetchAdminNavBadges(): Promise<AdminNavBadges> {
  const [bookings, clients, reports] = await Promise.all([
    listBookings(),
    listClients(),
    listTripReports(),
  ]);

  return {
    pendingBookings: bookings.filter((b) => b.status === "en_attente").length,
    totalClients: clients.length,
    unreadReports: reports.filter((r) => r.status === "soumis").length,
  };
}

export function requestAdminBadgesRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_BADGES_REFRESH));
  }
}
