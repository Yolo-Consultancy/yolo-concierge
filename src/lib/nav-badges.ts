/* eslint-disable prettier/prettier */
import { listBookings, listMissions, listTripReports } from "@/lib/admin/store";
import { listMovingMissions } from "@/lib/demenagement/store";
import { listDriverMissions } from "@/lib/driver/store";
import type { ClientAccount } from "@/lib/client/auth";
import type { PortalId } from "@/config/portals";
import { listAdminServiceRequests, listMyServiceRequests } from "@/lib/portals/service-requests";

export const NAV_BADGES_REFRESH = "yolo:nav-badges-refresh";

/** @deprecated Utiliser NAV_BADGES_REFRESH */
export const ADMIN_BADGES_REFRESH = NAV_BADGES_REFRESH;

export type VehiculesAdminNavBadges = {
  pendingBookings: number;
  unreadReports: number;
  activeMissions: number;
};

export type PortalAdminNavBadges = {
  newRequests: number;
  activeMissions: number;
};

export type ClientNavBadges = {
  activeReservations: number;
  demenagementUpdates: number;
  surMesureUpdates: number;
};

export type DriverNavBadges = {
  activeMissions: number;
  pendingReports: number;
};

const emptyVehiculesAdmin: VehiculesAdminNavBadges = {
  pendingBookings: 0,
  unreadReports: 0,
  activeMissions: 0,
};

const emptyPortalAdmin: PortalAdminNavBadges = {
  newRequests: 0,
  activeMissions: 0,
};

const emptyClient: ClientNavBadges = {
  activeReservations: 0,
  demenagementUpdates: 0,
  surMesureUpdates: 0,
};

const emptyDriver: DriverNavBadges = {
  activeMissions: 0,
  pendingReports: 0,
};

export async function fetchVehiculesAdminNavBadges(): Promise<VehiculesAdminNavBadges> {
  const [bookings, reports, missions] = await Promise.all([
    listBookings(),
    listTripReports(),
    listMissions(),
  ]);

  return {
    pendingBookings: bookings.filter((b) => b.status === "en_attente").length,
    unreadReports: reports.filter((r) => r.status === "soumis").length,
    activeMissions: missions.filter((m) => m.status !== "terminee").length,
  };
}

export async function fetchPortalAdminNavBadges(portalId: PortalId): Promise<PortalAdminNavBadges> {
  if (portalId === "demenagement") {
    const [requests, missions] = await Promise.all([
      listAdminServiceRequests("demenagement"),
      listMovingMissions(),
    ]);
    return {
      newRequests: requests.filter((r) => r.status === "nouveau").length,
      activeMissions: missions.filter((m) => m.status !== "terminee").length,
    };
  }

  if (portalId === "sur-mesure") {
    const requests = await listAdminServiceRequests("sur_mesure");
    return {
      newRequests: requests.filter((r) => r.status === "nouveau").length,
      activeMissions: 0,
    };
  }

  return emptyPortalAdmin;
}

function matchesClientBooking(booking: { clientEmail?: string; clientPhone: string; clientName: string }, account: ClientAccount) {
  const email = account.email.trim().toLowerCase();
  const phoneClean = account.phone.replace(/\D/g, "");
  const bEmail = booking.clientEmail?.trim().toLowerCase();
  const bPhoneClean = booking.clientPhone.replace(/\D/g, "");
  const emailMatch = !!email && bEmail === email;
  const phoneMatch = !!phoneClean && bPhoneClean.includes(phoneClean);
  const nameMatch =
    booking.clientName.toLowerCase().includes(account.firstName.toLowerCase()) &&
    booking.clientName.toLowerCase().includes(account.lastName.toLowerCase());
  return emailMatch || phoneMatch || nameMatch;
}

export async function fetchClientNavBadges(account: ClientAccount): Promise<ClientNavBadges> {
  const [bookings, demenagement, surMesure] = await Promise.all([
    listBookings({ clientEmail: account.email, clientPhone: account.phone }),
    listMyServiceRequests("demenagement"),
    listMyServiceRequests("sur_mesure"),
  ]);

  const clientBookings = bookings.filter((b) => matchesClientBooking(b, account));

  return {
    activeReservations: clientBookings.filter((b) =>
      ["en_attente", "confirmee", "payee"].includes(b.status),
    ).length,
    demenagementUpdates: demenagement.filter((r) =>
      ["nouveau", "en_cours"].includes(r.status),
    ).length,
    surMesureUpdates: surMesure.filter((r) =>
      ["nouveau", "en_cours"].includes(r.status),
    ).length,
  };
}

export async function fetchDriverNavBadges(): Promise<DriverNavBadges> {
  const missions = await listDriverMissions();
  const active = missions.filter((m) => m.status === "en_cours");
  return {
    activeMissions: active.length,
    pendingReports: active.filter((m) => !m.hasReport).length,
  };
}

export function requestNavBadgesRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NAV_BADGES_REFRESH));
  }
}

/** @deprecated Utiliser requestNavBadgesRefresh */
export function requestAdminBadgesRefresh() {
  requestNavBadgesRefresh();
}

/** @deprecated Utiliser fetchVehiculesAdminNavBadges */
export async function fetchAdminNavBadges(): Promise<{
  pendingBookings: number;
  unreadReports: number;
}> {
  const badges = await fetchVehiculesAdminNavBadges();
  return {
    pendingBookings: badges.pendingBookings,
    unreadReports: badges.unreadReports,
  };
}

export {
  emptyVehiculesAdmin,
  emptyPortalAdmin,
  emptyClient,
  emptyDriver,
};
